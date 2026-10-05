import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { beforeEach, describe, expect, it } from 'vitest';

const script = join(import.meta.dirname, 'import.mjs');
const fixture = readFileSync(join(import.meta.dirname, 'fixtures/old-schema.sql'), 'utf8');

let dir: string;

beforeEach(() => {
	dir = mkdtempSync(join(tmpdir(), 'arcade-import-'));
});

function oldDb(name = 'old.db'): string {
	const path = join(dir, name);
	const db = new DatabaseSync(path);
	db.exec(fixture);
	db.close();
	return path;
}

function run(...args: string[]) {
	const r = spawnSync(process.execPath, [script, ...args], { encoding: 'utf8', cwd: dir });
	return { code: r.status, out: r.stdout + r.stderr };
}

function count(path: string, table: string): number {
	const db = new DatabaseSync(path, { readOnly: true });
	const { n } = db.prepare(`SELECT count(*) AS n FROM ${table}`).get() as { n: number };
	db.close();
	return n;
}

describe('importer', () => {
	it('Scenario: Import prints counts', () => {
		const target = join(dir, 'new.db');
		const { code, out } = run(oldDb(), '--into', target);
		expect(code).toBe(0);
		expect(count(target, 'imposter_pairs')).toBe(3);
		expect(count(target, 'wavelength_spectra')).toBe(2);
		expect(out).toMatch(/imposter_pairs: 3 imported/);
		expect(out).toMatch(/wavelength_spectra: 2 imported/);
	});

	it('Scenario: Re-running the import adds no duplicates', () => {
		const source = oldDb();
		const target = join(dir, 'new.db');
		run(source, '--into', target);
		const first = [count(target, 'imposter_pairs'), count(target, 'wavelength_spectra')];
		const { code, out } = run(source, '--into', target);
		expect(code).toBe(0);
		expect([count(target, 'imposter_pairs'), count(target, 'wavelength_spectra')]).toEqual(first);
		expect(out).toMatch(/imposter_pairs: 0 imported, 3 already present/);
	});

	it('Scenario: Name placeholders preserved', () => {
		const target = join(dir, 'new.db');
		run(oldDb(), '--into', target);
		const db = new DatabaseSync(target, { readOnly: true });
		const crew = db
			.prepare('SELECT crew FROM imposter_pairs ORDER BY id')
			.all()
			.map((r) => r.crew);
		db.close();
		expect(crew).toContain('Was würde {NAME} nie essen?');
		expect(crew).toContain('Wer gewinnt im Armdrücken, {NAME} oder {NAME2}?');
	});

	it('Scenario: Missing table is named, the other still imported', () => {
		const source = oldDb();
		const db = new DatabaseSync(source);
		db.exec('DROP TABLE wavelength_prompts');
		db.close();
		const target = join(dir, 'new.db');
		const { code, out } = run(source, '--into', target);
		expect(code).not.toBe(0);
		expect(out).toMatch(/wavelength_prompts/);
		expect(out).toMatch(/missing/);
		expect(count(target, 'imposter_pairs')).toBe(3);
		expect(count(target, 'wavelength_spectra')).toBe(0);
	});

	it('Scenario: Source missing or not SQLite', () => {
		const notSqlite = join(dir, 'notes.txt');
		writeFileSync(notSqlite, 'Hund | Katze\n'.repeat(100));
		for (const source of [join(dir, 'nope.db'), notSqlite]) {
			const target = join(dir, 'new.db');
			const { code, out } = run(source, '--into', target);
			expect(code).not.toBe(0);
			expect(out).toContain(source);
			expect(out).toMatch(/does not exist|not a SQLite database/);
			expect(existsSync(target)).toBe(false);
		}
	});
});
