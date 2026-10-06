import type { DatabaseSync } from 'node:sqlite';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { playersApi } from '#lib/players.ts';
import { migrate, openDb } from '#lib/server/db.ts';
import { addPlayer, deletePlayer, listPlayers, renamePlayer } from '#lib/server/players.ts';

class FakeStorage {
	items = new Map<string, string>();
	getItem(key: string) {
		return this.items.get(key) ?? null;
	}
	setItem(key: string, value: string) {
		this.items.set(key, value);
	}
	removeItem(key: string) {
		this.items.delete(key);
	}
}

async function fresh() {
	vi.resetModules();
	return (await import('./roster.svelte.ts')).roster;
}

// the real store on a real migrated database behind the fetch the client uses
function serve(db: DatabaseSync): typeof fetch {
	return async (input, init) => {
		const match = /^\/api\/players(?:\/(\d+))?$/.exec(String(input));
		if (!match) return new Response(null, { status: 404 });
		const method = init?.method ?? 'GET';
		const id = match[1];
		const name = init?.body ? JSON.parse(String(init.body)).name : '';
		const reply = (r: { ok: true; player?: unknown } | { ok: false; status: number; message: string }, ok = 200) =>
			r.ok
				? new Response(r.player ? JSON.stringify(r.player) : null, { status: r.player ? ok : 204 })
				: new Response(JSON.stringify({ message: r.message }), { status: r.status });
		if (method === 'GET') return new Response(JSON.stringify(listPlayers(db)));
		if (method === 'POST') return reply(addPlayer(db, name), 201);
		if (method === 'PATCH') return reply(renamePlayer(db, Number(id), name));
		return reply(deletePlayer(db, Number(id)));
	};
}

const unreachable: typeof fetch = () => Promise.reject(new TypeError('Failed to fetch'));

const names = (players: { name: string }[]) => players.map((p) => p.name);

describe('roster', () => {
	let storage: FakeStorage;
	let db: DatabaseSync;

	beforeEach(() => {
		storage = new FakeStorage();
		vi.stubGlobal('window', { localStorage: storage });
		db = openDb(':memory:');
		migrate(db);
		vi.stubGlobal('fetch', serve(db));
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('talks to the real store through the stubbed fetch', async () => {
		expect(await playersApi.add('Alex')).toMatchObject({ ok: true, player: { name: 'Alex' } });
		expect((await playersApi.add('alex')).ok).toBe(false);
		expect(listPlayers(db).map((p) => p.name)).toEqual(['Alex']);
		vi.stubGlobal('fetch', unreachable);
		await expect(playersApi.list()).rejects.toThrow();
	});

	it('Scenario: Rename and remove a player', async () => {
		const roster = await fresh();
		roster.add('Alex');
		roster.add('Bo');

		const alex = roster.players[0];
		expect(roster.rename(alex.id, 'Ali')).toEqual({ ok: true });
		roster.remove(roster.players[1].id);

		expect(names(roster.players)).toEqual(['Ali']);
		expect(names(JSON.parse(storage.getItem('arcade:roster')!))).toEqual(['Ali']);
	});

	it('Scenario: Empty or whitespace name rejected', async () => {
		const roster = await fresh();

		for (const name of ['', '   ']) {
			const result = roster.add(name);
			expect(result.ok).toBe(false);
			expect(result.ok === false && result.message).toBeTruthy();
		}
		expect(roster.players).toEqual([]);

		roster.add('Alex');
		const rename = roster.rename(roster.players[0].id, '  ');
		expect(rename.ok).toBe(false);
		expect(names(roster.players)).toEqual(['Alex']);
	});

	it('Scenario: Duplicate name rejected', async () => {
		const roster = await fresh();
		roster.add('Alex');
		roster.add('Bo');

		const add = roster.add('alex');
		expect(add.ok).toBe(false);
		expect(add.ok === false && add.message).toBeTruthy();

		const rename = roster.rename(roster.players[1].id, 'alex');
		expect(rename.ok).toBe(false);
		expect(rename.ok === false && rename.message).toBeTruthy();

		expect(names(roster.players)).toEqual(['Alex', 'Bo']);
		expect(roster.rename(roster.players[0].id, 'ALEX')).toEqual({ ok: true });
	});

	it('Scenario: Storage unavailable works for the session', async () => {
		vi.stubGlobal('window', {
			get localStorage(): Storage {
				throw new DOMException('denied', 'SecurityError');
			}
		});
		const roster = await fresh();

		expect(roster.add('Alex')).toEqual({ ok: true });
		expect(roster.add('Bo')).toEqual({ ok: true });
		roster.move(roster.players[1].id, 0);

		expect(roster.rename(roster.players[1].id, 'Ali')).toEqual({ ok: true });
		expect(names(roster.players)).toEqual(['Bo', 'Ali']);
	});

	it('reloads the stored order and trims names', async () => {
		const roster = await fresh();
		roster.add('  Alex ');
		roster.add('Bo');
		roster.add('Cleo');
		roster.move(roster.players[2].id, 0);

		expect(names((await fresh()).players)).toEqual(['Cleo', 'Alex', 'Bo']);
	});

	it('ignores a corrupt stored roster', async () => {
		storage.setItem('arcade:roster', '{nope');
		expect((await fresh()).players).toEqual([]);
	});
});
