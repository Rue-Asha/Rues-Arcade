import type { DatabaseSync } from 'node:sqlite';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { loadMigrations, migrate, openDb } from './db.ts';

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
