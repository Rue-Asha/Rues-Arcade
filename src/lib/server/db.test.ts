import { existsSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MAX_TEXT } from '#lib/content/types.ts';
import { closeDb, getDb, loadMigrations, migrate, openDb } from './db.ts';
import { deletePlayer } from './players.ts';

let dir: string;

beforeEach(() => {
	dir = mkdtempSync(join(tmpdir(), 'arcade-db-'));
});

afterEach(() => {
	closeDb();
	delete process.env.DATABASE_PATH;
});

function tables(db: DatabaseSync): string[] {
	return db
		.prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name")
		.all()
		.map((r) => String(r.name));
}

function applied(db: DatabaseSync): string[] {
	return db
		.prepare('SELECT name FROM schema_migrations ORDER BY name')
		.all()
		.map((r) => String(r.name));
}

function seedCounts(db: DatabaseSync): Record<string, number> {
	return Object.fromEntries(
		['codes_words', 'duck_words', 'most_likely_prompts'].map((t) => [
			t,
			Number(db.prepare(`SELECT count(*) AS n FROM ${t}`).get()?.n)
		])
	);
}

function brokenDb(): string {
	const path = join(dir, 'broken.db');
	const pre = new DatabaseSync(path);
	pre.exec('CREATE TABLE imposter_pairs (id INTEGER PRIMARY KEY)');
	pre.close();
	return path;
}

describe('db', () => {
	it('Scenario: Missing database directory is created', () => {
		const path = join(dir, 'does', 'not', 'exist', 'arcade.db');
		process.env.DATABASE_PATH = path;

		const db = getDb();

		expect(existsSync(path)).toBe(true);
		expect(applied(db)).toEqual(loadMigrations().map((m) => m.name));
	});

	it('fresh database gets every migration and empty tables', () => {
		const db = openDb(join(dir, 'fresh.db'));
		migrate(db);

		expect(applied(db)).toEqual(loadMigrations().map((m) => m.name));
		expect(tables(db)).toEqual(
			expect.arrayContaining(['imposter_pairs', 'wavelength_spectra', 'schema_migrations'])
		);
		expect(db.prepare('SELECT count(*) AS n FROM imposter_pairs').get()?.n).toBe(0);
		expect(db.prepare('SELECT count(*) AS n FROM wavelength_spectra').get()?.n).toBe(0);
		db.close();
	});

	it('Scenario: Migration failure refuses to start', () => {
		process.env.DATABASE_PATH = brokenDb();

		expect(() => getDb()).toThrow(/0001_content\.sql/);
	});

	it('Scenario: Migration failure refuses to start (server init hook rejects)', async () => {
		process.env.DATABASE_PATH = brokenDb();
		const { init } = await import('../../hooks.server.ts');

		await expect(Promise.resolve().then(() => init?.())).rejects.toThrow(/0001_content\.sql/);
	});

	it('server init hook migrates the database on start', async () => {
		const path = join(dir, 'start.db');
		process.env.DATABASE_PATH = path;
		const { init } = await import('../../hooks.server.ts');

		await init?.();

		expect(applied(new DatabaseSync(path, { readOnly: true }))).toEqual(
			loadMigrations().map((m) => m.name)
		);
	});

	it('a failing migration is rolled back and not recorded', () => {
		const db = openDb(join(dir, 'rollback.db'));
		const run = () =>
			migrate(db, [
				{ name: '0001_ok.sql', sql: 'CREATE TABLE ok (id INTEGER)' },
				{ name: '0002_bad.sql', sql: 'CREATE TABLE half (id INTEGER); CREATE TABL nope' }
			]);

		expect(run).toThrow(/0002_bad\.sql/);
		expect(applied(db)).toEqual(['0001_ok.sql']);
		expect(tables(db)).not.toContain('half');
		db.close();
	});

	it('Scenario: Migrations are applied once', () => {
		const path = join(dir, 'twice.db');
		const first = openDb(path);
		migrate(first);
		first.close();

		const second = openDb(path);
		expect(() => migrate(second)).not.toThrow();
		const counts = second
			.prepare('SELECT name, count(*) AS n FROM schema_migrations GROUP BY name')
			.all();
		expect(counts.length).toBe(loadMigrations().length);
		expect(counts.every((r) => r.n === 1)).toBe(true);
		second.close();
	});

	it('Scenario: Seeds land once on an existing database', () => {
		const path = join(dir, 'existing.db');
		const [first, ...rest] = loadMigrations();
		const db = openDb(path);
		migrate(db, [first]);
		db.exec("INSERT INTO imposter_pairs (crew, imposter) VALUES ('Hund', 'Katze')");

		migrate(db);
		const after = seedCounts(db);
		migrate(db);

		expect(rest.length).toBeGreaterThan(0);
		expect(db.prepare('SELECT crew, imposter FROM imposter_pairs').all()).toEqual([
			{ crew: 'Hund', imposter: 'Katze' }
		]);
		expect(after).toEqual({ codes_words: 91, duck_words: 60, most_likely_prompts: 60 });
		expect(seedCounts(db)).toEqual(after);
		db.close();
	});

	it('Scenario: Deleted seed entries stay deleted', () => {
		const db = openDb(join(dir, 'deleted.db'));
		migrate(db);
		const word = String(db.prepare('SELECT word FROM codes_words ORDER BY id LIMIT 1').get()?.word);
		db.prepare('DELETE FROM codes_words WHERE word = ?').run(word);

		migrate(db);

		expect(db.prepare('SELECT 1 FROM codes_words WHERE word = ?').get(word)).toBeUndefined();
		expect(seedCounts(db).codes_words).toBe(90);
		db.close();
	});

	it('Scenario: Seed rows are clean', () => {
		const db = openDb(join(dir, 'clean.db'));
		migrate(db);

		for (const [table, column] of [
			['codes_words', 'word'],
			['duck_words', 'word'],
			['most_likely_prompts', 'text']
		]) {
			const rows = db
				.prepare(`SELECT ${column} AS t FROM ${table}`)
				.all()
				.map((r) => String(r.t));
			expect(rows.length).toBeGreaterThan(0);
			for (const t of rows) {
				expect(t.trim()).toBe(t);
				expect(t.length).toBeGreaterThan(0);
				expect(t.length).toBeLessThanOrEqual(MAX_TEXT);
			}
			expect(new Set(rows).size).toBe(rows.length);
		}
		db.close();
	});

	it('Scenario: Players table arrives once on an existing database', () => {
		const path = join(dir, 'before-players.db');
		const db = openDb(path);
		const old = loadMigrations().filter((m) => m.name < '0004');
		migrate(db, old);
		db.exec("INSERT INTO imposter_pairs (crew, imposter) VALUES ('Hund', 'Katze')");
		const content = seedCounts(db);

		migrate(db);
		migrate(db);

		expect(tables(db)).toContain('players');
		expect(db.prepare('SELECT count(*) AS n FROM players').get()?.n).toBe(0);
		expect(db.prepare('SELECT crew, imposter FROM imposter_pairs').all()).toEqual([
			{ crew: 'Hund', imposter: 'Katze' }
		]);
		expect(seedCounts(db)).toEqual(content);
		expect(applied(db).filter((n) => n === '0004_players.sql')).toEqual(['0004_players.sql']);
		db.close();
	});

	it('Scenario: Deleting a player cascades to referencing rows', () => {
		const db = openDb(join(dir, 'cascade.db'));
		migrate(db);
		db.exec(
			'CREATE TABLE seen (player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE)'
		);
		const id = Number(db.prepare("INSERT INTO players (name) VALUES ('Alex')").run().lastInsertRowid);
		db.prepare('INSERT INTO seen (player_id) VALUES (?)').run(id);

		expect(deletePlayer(db, id)).toEqual({ ok: true });

		expect(db.prepare('SELECT count(*) AS n FROM seen').get()?.n).toBe(0);
		expect(db.prepare('PRAGMA foreign_keys').get()?.foreign_keys).toBe(1);
		db.close();
	});

	it('loads migrations in name order', () => {
		const names = loadMigrations().map((m) => m.name);
		expect(names).toEqual([...names].sort());
		expect(names[0]).toBe('0001_content.sql');
	});
});
