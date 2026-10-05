import type { DatabaseSync } from 'node:sqlite';
import { error } from '@sveltejs/kit';
import { pairError, parseBulk, singleError } from '#lib/content/parse.ts';
import { isSingle, type ContentItem, type ContentType, type ImportReport } from '#lib/content/types.ts';

export type Saved =
	| { ok: true; item: ContentItem }
	| { ok: false; status: 400 | 404 | 409; message: string };

const columns: Record<ContentType, [string, string] | [string]> = {
	imposter_pairs: ['crew', 'imposter'],
	wavelength_spectra: ['left_text', 'right_text'],
	codes_words: ['word'],
	duck_words: ['word'],
	most_likely_prompts: ['text']
};

export function isContentType(s: string): s is ContentType {
	return Object.hasOwn(columns, s);
}

export function contentType(param: string): ContentType {
	if (!isContentType(param)) error(404, 'Unbekannter Inhaltstyp.');
	return param;
}

function sql(type: ContentType) {
	const [a, b] = columns[type];
	if (!b)
		return {
			list: `SELECT id, ${a} AS a, '' AS b FROM ${type} ORDER BY id`,
			insert: `INSERT OR IGNORE INTO ${type} (${a}) VALUES (?)`,
			update: `UPDATE OR IGNORE ${type} SET ${a} = ? WHERE id = ?`,
			exists: `SELECT 1 FROM ${type} WHERE id = ?`,
			delete: `DELETE FROM ${type} WHERE id = ?`
		};
	return {
		list: `SELECT id, ${a} AS a, ${b} AS b FROM ${type} ORDER BY id`,
		insert: `INSERT OR IGNORE INTO ${type} (${a}, ${b}) VALUES (?, ?)`,
		update: `UPDATE OR IGNORE ${type} SET ${a} = ?, ${b} = ? WHERE id = ?`,
		exists: `SELECT 1 FROM ${type} WHERE id = ?`,
		delete: `DELETE FROM ${type} WHERE id = ?`
	};
}

export function list(db: DatabaseSync, type: ContentType): ContentItem[] {
	return db.prepare(sql(type).list).all() as unknown as ContentItem[];
}

// single types take only `a`; `b` is stored nowhere and always comes back as ''
function clean(type: ContentType, a: string, b: string): { values: string[]; message: string | null } {
	if (isSingle(type)) return { values: [a.trim()], message: singleError(a.trim()) };
	[a, b] = [a.trim(), b.trim()];
	return { values: [a, b], message: pairError(a, b) };
}

function item(id: number, [a, b = '']: string[]): ContentItem {
	return { id, a, b };
}

export function add(db: DatabaseSync, type: ContentType, a: string, b: string): Saved {
	const { values, message } = clean(type, a, b);
	if (message) return { ok: false, status: 400, message };
	const r = db.prepare(sql(type).insert).run(...values);
	if (!r.changes) return { ok: false, status: 409, message: 'Diesen Eintrag gibt es schon.' };
	return { ok: true, item: item(Number(r.lastInsertRowid), values) };
}

export function update(
	db: DatabaseSync,
	type: ContentType,
	id: number,
	a: string,
	b: string
): Saved {
	const { values, message } = clean(type, a, b);
	if (message) return { ok: false, status: 400, message };
	const q = sql(type);
	if (!db.prepare(q.exists).get(id))
		return { ok: false, status: 404, message: 'Eintrag nicht gefunden.' };
	if (!db.prepare(q.update).run(...values, id).changes)
		return { ok: false, status: 409, message: 'Diesen Eintrag gibt es schon.' };
	return { ok: true, item: item(id, values) };
}

export function remove(db: DatabaseSync, type: ContentType, id: number): boolean {
	return db.prepare(sql(type).delete).run(id).changes > 0;
}

export function importBulk(db: DatabaseSync, type: ContentType, text: string): ImportReport {
	const single = isSingle(type);
	const { rows, skipped, errors } = parseBulk(text, single);
	const insert = db.prepare(sql(type).insert);
	let imported = 0;
	db.exec('BEGIN');
	for (const { a, b } of rows) imported += Number((single ? insert.run(a) : insert.run(a, b)).changes);
	db.exec('COMMIT');
	return { imported, duplicates: rows.length - imported, skipped, errors };
}
