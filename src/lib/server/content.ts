import type { DatabaseSync } from 'node:sqlite';
import { pairError, parseBulk } from '#lib/content/parse.ts';
import type { ContentItem, ContentType, ImportReport } from '#lib/content/types.ts';

export type Saved =
	| { ok: true; item: ContentItem }
	| { ok: false; status: 400 | 404 | 409; message: string };

const columns: Record<ContentType, [string, string]> = {
	imposter_pairs: ['crew', 'imposter'],
	wavelength_spectra: ['left_text', 'right_text']
};

export function isContentType(s: string): s is ContentType {
	return Object.hasOwn(columns, s);
}

function sql(type: ContentType) {
	const [a, b] = columns[type];
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

export function add(db: DatabaseSync, type: ContentType, a: string, b: string): Saved {
	[a, b] = [a.trim(), b.trim()];
	const message = pairError(a, b);
	if (message) return { ok: false, status: 400, message };
	const r = db.prepare(sql(type).insert).run(a, b);
	if (!r.changes) return { ok: false, status: 409, message: 'Diesen Eintrag gibt es schon.' };
	return { ok: true, item: { id: Number(r.lastInsertRowid), a, b } };
}

export function update(
	db: DatabaseSync,
	type: ContentType,
	id: number,
	a: string,
	b: string
): Saved {
	[a, b] = [a.trim(), b.trim()];
	const message = pairError(a, b);
	if (message) return { ok: false, status: 400, message };
	const q = sql(type);
	if (!db.prepare(q.exists).get(id))
		return { ok: false, status: 404, message: 'Eintrag nicht gefunden.' };
	if (!db.prepare(q.update).run(a, b, id).changes)
		return { ok: false, status: 409, message: 'Diesen Eintrag gibt es schon.' };
	return { ok: true, item: { id, a, b } };
}

export function remove(db: DatabaseSync, type: ContentType, id: number): boolean {
	return db.prepare(sql(type).delete).run(id).changes > 0;
}

export function importBulk(db: DatabaseSync, type: ContentType, text: string): ImportReport {
	const { rows, skipped, errors } = parseBulk(text);
	const insert = db.prepare(sql(type).insert);
	let imported = 0;
	db.exec('BEGIN');
	for (const { a, b } of rows) imported += Number(insert.run(a, b).changes);
	db.exec('COMMIT');
	return { imported, duplicates: rows.length - imported, skipped, errors };
}
