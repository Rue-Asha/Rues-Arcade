import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { isHttpError, json } from '@sveltejs/kit';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MAX_TEXT } from '#lib/content/types.ts';
import * as collection from '../../routes/api/content/[type]/+server.ts';
import * as entry from '../../routes/api/content/[type]/[id]/+server.ts';
import * as bulk from '../../routes/api/content/[type]/import/+server.ts';
import { add, importBulk, isContentType, list, remove, update } from './content.ts';
import { closeDb, migrate } from './db.ts';

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

	it('Scenario: Single bulk import reports skipped, overlong and duplicate lines', () => {
		db.exec('DELETE FROM duck_words');

		const report = importBulk(db, 'duck_words', `Anker\n\n${'x'.repeat(MAX_TEXT + 1)}\nAnker\nA | B`);

		expect(report.skipped).toBe(1);
		expect(report.errors).toEqual([{ line: 3, message: expect.stringContaining(String(MAX_TEXT)) }]);
		expect(report.duplicates).toBe(1);
		expect(report.imported).toBe(2);
		expect(list(db, 'duck_words')).toEqual([
			{ id: expect.any(Number), a: 'Anker', b: '' },
			{ id: expect.any(Number), a: 'A | B', b: '' }
		]);
	});

	it('Scenario: Duplicate single entry rejected', () => {
		db.exec('DELETE FROM duck_words');
		add(db, 'duck_words', 'Anker', '');
		const other = add(db, 'duck_words', 'Boje', '');
		if (!other.ok) throw new Error('setup');

		const again = add(db, 'duck_words', ' Anker ', '');
		const edited = update(db, 'duck_words', other.item.id, 'Anker', '');

		for (const saved of [again, edited])
			expect(saved).toEqual({ ok: false, status: 409, message: 'Diesen Eintrag gibt es schon.' });
		expect(list(db, 'duck_words').map((i) => i.a)).toEqual(['Anker', 'Boje']);
	});

	it('Scenario: Overlong single entry rejected', () => {
		db.exec('DELETE FROM most_likely_prompts');
		const long = 'x'.repeat(MAX_TEXT + 1);
		const ok = add(db, 'most_likely_prompts', 'Wer würde am ehesten?', 'ignored');
		expect(ok).toEqual({ ok: true, item: { id: expect.any(Number), a: 'Wer würde am ehesten?', b: '' } });
		if (!ok.ok) return;

		const added = add(db, 'most_likely_prompts', long, '');
		const edited = update(db, 'most_likely_prompts', ok.item.id, long, '');

		for (const saved of [added, edited]) {
			expect(saved).toMatchObject({ ok: false, status: 400 });
			expect(!saved.ok && saved.message).toContain(String(MAX_TEXT));
		}
		expect(list(db, 'most_likely_prompts')).toEqual([ok.item]);
	});

	it('stores single values in each type’s own column', () => {
		db.exec('DELETE FROM codes_words; DELETE FROM most_likely_prompts');
		add(db, 'codes_words', 'Laterne', '');
		add(db, 'most_likely_prompts', 'Wer würde am ehesten tanzen?', '');
		expect(db.prepare('SELECT word FROM codes_words').all()).toEqual([{ word: 'Laterne' }]);
		expect(db.prepare('SELECT text FROM most_likely_prompts').all()).toEqual([
			{ text: 'Wer würde am ehesten tanzen?' }
		]);
	});

	it('accepts only known content types', () => {
		for (const type of [
			'imposter_pairs',
			'wavelength_spectra',
			'codes_words',
			'duck_words',
			'most_likely_prompts'
		])
			expect(isContentType(type)).toBe(true);
		expect(isContentType('users')).toBe(false);
		expect(isContentType('toString')).toBe(false);
	});
});

type Handler = (event: never) => Response | Promise<Response>;

function call(handler: Handler, params: Record<string, string>, body?: unknown) {
	const request = new Request('http://test/', {
		method: body === undefined ? 'GET' : 'POST',
		body: body === undefined ? undefined : JSON.stringify(body)
	});
	return Promise.resolve()
		.then(() => handler({ params, request } as never))
		.catch((e) => {
			if (!isHttpError(e)) throw e;
			return json(e.body, { status: e.status });
		});
}

describe('content API', () => {
	beforeEach(() => {
		process.env.DATABASE_PATH = join(mkdtempSync(join(tmpdir(), 'arcade-api-')), 'api.db');
	});

	afterEach(() => {
		closeDb();
		delete process.env.DATABASE_PATH;
	});

	it('creates, lists, edits and deletes an entry', async () => {
		const type = 'wavelength_spectra';
		const created = await call(collection.POST, { type }, { a: 'kalt', b: 'heiß' });
		expect(created.status).toBe(201);
		const item = await created.json();
		expect(item).toEqual({ id: expect.any(Number), a: 'kalt', b: 'heiß' });

		expect(await (await call(collection.GET, { type })).json()).toEqual([item]);

		const id = String(item.id);
		const edited = await call(entry.PUT, { type, id }, { a: 'kalt', b: 'warm' });
		expect(await edited.json()).toEqual({ ...item, b: 'warm' });

		expect((await call(entry.DELETE, { type, id })).status).toBe(204);
		expect((await call(entry.DELETE, { type, id })).status).toBe(404);
		expect(await (await call(collection.GET, { type })).json()).toEqual([]);
	});

	it('answers a refused entry with its status and message', async () => {
		const res = await call(
			collection.POST,
			{ type: 'imposter_pairs' },
			{ a: 'x'.repeat(MAX_TEXT + 1), b: 'B' }
		);
		expect(res.status).toBe(400);
		expect((await res.json()).message).toContain(String(MAX_TEXT));
		const bad = await call(entry.PUT, { type: 'imposter_pairs', id: 'abc' }, { a: 'A', b: 'B' });
		expect(bad.status).toBe(404);
	});

	it('imports bulk text and returns the report', async () => {
		const res = await call(bulk.POST, { type: 'imposter_pairs' }, { text: 'A | B\n\nkaputt' });
		expect(await res.json()).toEqual({
			imported: 1,
			duplicates: 0,
			skipped: 1,
			errors: [{ line: 3, message: expect.any(String) }]
		});
	});

	it('rejects an unknown content type with 404', async () => {
		for (const [handler, params] of [
			[collection.GET, { type: 'users' }],
			[collection.POST, { type: 'users' }],
			[entry.PUT, { type: 'users', id: '1' }],
			[entry.DELETE, { type: 'users', id: '1' }],
			[bulk.POST, { type: 'users' }]
		] as [Handler, Record<string, string>][]) {
			expect((await call(handler, params, { a: 'A', b: 'B', text: '' })).status).toBe(404);
		}
	});
});
