import { existsSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { closeDb, getDb, loadMigrations, migrate, openDb } from './db.ts';

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
		expect(applied(db)).toEqual(['0001_content.sql']);
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

		expect(applied(new DatabaseSync(path, { readOnly: true }))).toEqual(['0001_content.sql']);
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

	it('loads migrations in name order', () => {
		const names = loadMigrations().map((m) => m.name);
		expect(names).toEqual([...names].sort());
		expect(names[0]).toBe('0001_content.sql');
	});
});
