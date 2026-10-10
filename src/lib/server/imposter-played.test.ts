import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { DatabaseSync } from 'node:sqlite';
import { isHttpError, json } from '@sveltejs/kit';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import * as collection from '../../routes/api/imposter/played/+server.ts';
import * as one from '../../routes/api/imposter/played/[pair]/[player]/+server.ts';
import { add } from './content.ts';
import { closeDb, getDb, loadMigrations, migrate, openDb } from './db.ts';
import { addImposterPlayed, listImposterPlayed, removeImposterPlayed } from './imposter-played.ts';
import { addPlayer, deletePlayer } from './players.ts';

let db: DatabaseSync;

beforeEach(() => {
	db = openDb(':memory:');
});

afterEach(() => db.close());

function applied(): string[] {
	return (db.prepare('SELECT name FROM schema_migrations').all() as { name: string }[]).map((r) => r.name);
}

function played(): number {
	return Number(db.prepare('SELECT count(*) AS n FROM imposter_played').get()?.n);
}

describe('imposter played-with migration', () => {
	it('Scenario: Imposter migration 0008 on a fresh and an existing database', () => {
		migrate(db);
		expect(played()).toBe(0);
		expect(applied().filter((n) => n === '0008_imposter_played.sql')).toHaveLength(1);

		const old = openDb(':memory:');
		migrate(old, loadMigrations().filter((m) => m.name <= '0007_show_surveys.sql'));
		old.exec('DELETE FROM imposter_pairs');
		old.exec("INSERT INTO imposter_pairs (crew, imposter) VALUES ('Hund', 'Katze'), ('Tee', 'Kaffee')");
		migrate(old);
		migrate(old);

		expect(old.prepare('SELECT count(*) AS n FROM imposter_played').get()?.n).toBe(0);
		expect(old.prepare('SELECT crew, imposter, interchangeable FROM imposter_pairs ORDER BY id').all()).toEqual([
			{ crew: 'Hund', imposter: 'Katze', interchangeable: 0 },
			{ crew: 'Tee', imposter: 'Kaffee', interchangeable: 0 }
		]);
		expect(
			(old.prepare('SELECT name FROM schema_migrations').all() as { name: string }[]).filter(
				(r) => r.name === '0008_imposter_played.sql'
			)
		).toHaveLength(1);
		old.close();
	});
});

function pair(a: string, b: string, target = db): number {
	const saved = add(target, 'imposter_pairs', a, b);
	if (!saved.ok) throw new Error(saved.message);
	return saved.item.id;
}

function player(name: string, target = db): number {
	const saved = addPlayer(target, name);
	if (!saved.ok) throw new Error(saved.message);
	return saved.player.id;
}

describe('imposter played-with store', () => {
	beforeEach(() => migrate(db));

	it('Scenario: Imposter played-with has no duplicates', () => {
		const x = pair('Hund', 'Katze');
		const alex = player('Alex');
		const bo = player('Bo');

		addImposterPlayed(db, x, [alex]);
		addImposterPlayed(db, x, [alex, bo, bo]);

		expect(listImposterPlayed(db)).toEqual([{ pairId: x, playerIds: [alex, bo] }]);
	});

	it('Scenario: Imposter played-with follows a deleted pair or player', () => {
		const x = pair('Hund', 'Katze');
		const y = pair('Tee', 'Kaffee');
		const alex = player('Alex');
		const bo = player('Bo');
		addImposterPlayed(db, x, [alex, bo]);
		addImposterPlayed(db, y, [alex]);

		db.prepare('DELETE FROM imposter_pairs WHERE id = ?').run(y);
		deletePlayer(db, bo);

		expect(listImposterPlayed(db)).toEqual([{ pairId: x, playerIds: [alex] }]);
		expect(db.prepare('SELECT count(*) AS n FROM players WHERE id = ?').get(alex)?.n).toBe(1);
	});
});

type Handler = (event: never) => Response | Promise<Response>;

function call(handler: Handler, params: Record<string, string>, body?: string) {
	const request = new Request('http://test/', { method: body === undefined ? 'GET' : 'POST', body });
	return Promise.resolve()
		.then(() => handler({ params, request } as never))
		.catch((e) => {
			if (!isHttpError(e)) throw e;
			return json(e.body, { status: e.status });
		});
}

describe('imposter played-with API', () => {
	beforeEach(() => {
		process.env.DATABASE_PATH = join(mkdtempSync(join(tmpdir(), 'arcade-played-')), 'played.db');
	});

	afterEach(() => {
		closeDb();
		delete process.env.DATABASE_PATH;
	});

	it('Scenario: Imposter played-with skips unknown pairs and players', async () => {
		const x = pair('Hund', 'Katze', getDb());
		const alex = player('Alex', getDb());

		const unknownPair = await call(collection.POST, {}, JSON.stringify({ pairId: 99999, playerIds: [alex] }));
		const unknownPlayer = await call(collection.POST, {}, JSON.stringify({ pairId: x, playerIds: [alex, 99999] }));

		expect([unknownPair.status, unknownPlayer.status]).toEqual([204, 204]);
		expect(await (await call(collection.GET, {})).json()).toEqual([{ pairId: x, playerIds: [alex] }]);
	});

	it('Scenario: Imposter played-with API rejects a malformed body', async () => {
		const x = pair('Hund', 'Katze', getDb());
		const alex = player('Alex', getDb());

		const bodies = [
			undefined,
			'kaputt',
			JSON.stringify({ pairId: '3', playerIds: [alex] }),
			JSON.stringify({ pairId: x, playerIds: [alex, 'x'] }),
			JSON.stringify({ pairId: x }),
			JSON.stringify({ pairId: x, playerIds: 'x' })
		];
		for (const body of bodies) {
			const res = await call(collection.POST, {}, body);
			expect(res.status).toBe(400);
			expect(await res.json()).toEqual({ message: 'Ungültige Angaben.' });
		}
		expect(await (await call(collection.GET, {})).json()).toEqual([]);
	});

	it('Scenario: Imposter played-with entry removed', async () => {
		const x = pair('Hund', 'Katze', getDb());
		const alex = player('Alex', getDb());
		addImposterPlayed(getDb(), x, [alex]);
		const params = { pair: String(x), player: String(alex) };

		const first = await call(one.DELETE, params);
		const second = await call(one.DELETE, params);

		expect([first.status, second.status]).toEqual([204, 404]);
		expect(listImposterPlayed(getDb())).toEqual([]);
		expect(removeImposterPlayed(getDb(), x, alex)).toBe(false);
	});
});
