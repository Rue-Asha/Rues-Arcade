import { DatabaseSync } from 'node:sqlite';
import { beforeEach, describe, expect, it } from 'vitest';
import { MAX_TEXT } from '#lib/content/types.ts';
import { add, importBulk, isContentType, list, remove, update } from './content.ts';
import { migrate } from './db.ts';

let db: DatabaseSync;

beforeEach(() => {
	db = new DatabaseSync(':memory:');
	migrate(db);
});

describe('content store', () => {
	it('adds, lists, updates and removes an entry', () => {
		const added = add(db, 'imposter_pairs', ' Hund ', 'Katze');
		expect(added).toEqual({ ok: true, item: { id: expect.any(Number), a: 'Hund', b: 'Katze' } });
		if (!added.ok) return;
		const id = added.item.id;

		expect(list(db, 'imposter_pairs')).toEqual([{ id, a: 'Hund', b: 'Katze' }]);
		expect(update(db, 'imposter_pairs', id, 'Hund', 'Maus')).toEqual({
			ok: true,
			item: { id, a: 'Hund', b: 'Maus' }
		});
		expect(list(db, 'imposter_pairs')).toEqual([{ id, a: 'Hund', b: 'Maus' }]);
		expect(remove(db, 'imposter_pairs', id)).toBe(true);
		expect(list(db, 'imposter_pairs')).toEqual([]);
		expect(remove(db, 'imposter_pairs', id)).toBe(false);
	});

	it('maps a and b onto each type’s own columns', () => {
		add(db, 'wavelength_spectra', 'kalt', 'heiß');
		expect(db.prepare('SELECT left_text, right_text FROM wavelength_spectra').get()).toEqual({
			left_text: 'kalt',
			right_text: 'heiß'
		});
		expect(list(db, 'imposter_pairs')).toEqual([]);
	});

	it('refuses a duplicate, an empty side and an unknown id', () => {
		add(db, 'imposter_pairs', 'Hund', 'Katze');
		expect(add(db, 'imposter_pairs', 'Hund', 'Katze')).toMatchObject({ ok: false, status: 409 });
		expect(add(db, 'imposter_pairs', '  ', 'Katze')).toMatchObject({ ok: false, status: 400 });
		expect(update(db, 'imposter_pairs', 999, 'A', 'B')).toMatchObject({ ok: false, status: 404 });
	});

	it('Scenario: Overlong text rejected', () => {
		const long = 'x'.repeat(MAX_TEXT + 1);

		const added = add(db, 'imposter_pairs', long, 'Katze');

		expect(added).toMatchObject({ ok: false, status: 400 });
		expect(!added.ok && added.message).toContain(String(MAX_TEXT));
		expect(list(db, 'imposter_pairs')).toEqual([]);
		const ok = add(db, 'imposter_pairs', 'Hund', 'Katze');
		if (!ok.ok) throw new Error('setup');
		expect(update(db, 'imposter_pairs', ok.item.id, 'Hund', long)).toMatchObject({ ok: false });
		expect(list(db, 'imposter_pairs')).toEqual([{ id: ok.item.id, a: 'Hund', b: 'Katze' }]);
	});

	it('Scenario: Bulk import reports skipped and malformed lines', () => {
		add(db, 'imposter_pairs', 'Hund', 'Katze');

		const report = importBulk(
			db,
			'imposter_pairs',
			'Apfel | Birne\n\nkaputt\nHund | Katze\nSonne | Mond\nApfel | Birne'
		);

		expect(report.skipped).toBe(1);
		expect(report.errors).toEqual([{ line: 3, message: expect.any(String) }]);
		expect(report.duplicates).toBe(2);
		expect(report.imported).toBe(2);
		expect(list(db, 'imposter_pairs').map((i) => `${i.a}|${i.b}`)).toEqual([
			'Hund|Katze',
			'Apfel|Birne',
			'Sonne|Mond'
		]);
	});

	it('accepts only known content types', () => {
		expect(isContentType('imposter_pairs')).toBe(true);
		expect(isContentType('wavelength_spectra')).toBe(true);
		expect(isContentType('users')).toBe(false);
		expect(isContentType('toString')).toBe(false);
	});
});
