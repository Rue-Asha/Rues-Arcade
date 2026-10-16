import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { rhymeKey, syllables } from '#lib/content/duck-rhyme.ts';
import { MAX_TEXT } from '#lib/content/types.ts';
import { loadMigrations, migrate, openDb } from './db.ts';

const KEPT = ['Katze', 'Gedicht', 'Sonne', 'Regen', 'Blume', 'Mauer', 'Feder', 'Kette', 'Ente'];

let dir: string;
let db: DatabaseSync;

beforeEach(() => {
	dir = mkdtempSync(join(tmpdir(), 'arcade-duck-'));
	db = openDb(join(dir, 'fresh.db'));
});

afterEach(() => {
	db.close();
});

function words(migrations = loadMigrations()): string[] {
	migrate(db, migrations);
	return db
		.prepare('SELECT word FROM duck_words ORDER BY id')
		.all()
		.map((r) => String(r.word));
}

function rhyming(list: string[]): string[][] {
	const byKey = Map.groupBy(list, rhymeKey);
	return [...byKey.values()].filter((g) => g.length > 1);
}

function oneSyllable(list: string[]): string[] {
	return list.filter((w) => syllables(w) < 2);
}

function duplicates(list: string[]): string[][] {
	const byFold = Map.groupBy(list, (w) => w.toLocaleLowerCase('de'));
	return [...byFold.values()].filter((g) => g.length > 1);
}

function unclean(list: string[]): string[] {
	return list.filter((w) => !/^[A-Za-zÄÖÜäöüß]+$/.test(w) || w.trim() !== w || w.length > MAX_TEXT);
}

describe('duck seed words', () => {
	it('Scenario: Fresh database holds exactly 750 Duck words', () => {
		const list = words();

		expect(list.length).toBe(750);
		expect(list).toEqual(expect.arrayContaining(KEPT));
	});

	it('Scenario: Dropped seed words are gone from a fresh database', () => {
		const old = new DatabaseSync(join(dir, 'old.db'));
		migrate(old, loadMigrations().filter((m) => m.name < '0004'));
		const dropped = old
			.prepare('SELECT word FROM duck_words')
			.all()
			.map((r) => String(r.word))
			.filter((w) => !KEPT.includes(w));
		old.close();

		expect(dropped.length).toBe(51);
		expect(dropped).toEqual(expect.arrayContaining(['Haus', 'Maus', 'Tatze', 'Hund', 'Mund']));
		expect(words().filter((w) => dropped.includes(w))).toEqual([]);
	});

	it('Scenario: Every Duck seed word has more than one syllable', () => {
		expect(oneSyllable(words())).toEqual([]);
	});

	it('Scenario: No two Duck seed words share a rhyme key', () => {
		expect(rhyming(words())).toEqual([]);
	});

	it('Scenario: Duck seed words have no duplicates ignoring case and umlauts', () => {
		expect(duplicates(words())).toEqual([]);
		expect(duplicates(['Ärger', 'ärger'])).toEqual([['Ärger', 'ärger']]);
	});

	it('Scenario: Duck seed words are clean letter strings', () => {
		expect(unclean(words())).toEqual([]);
	});

	it('Scenario: Guard fails on a rhyming pair and a one-syllable word', () => {
		const list = ['Katze', 'Tatze', 'Haus'];

		expect(rhyming(list)).toEqual([['Katze', 'Tatze']]);
		expect(oneSyllable(list)).toEqual(['Haus']);
	});
});
