import type { DatabaseSync } from 'node:sqlite';
import { nameError, type SavedPlayer } from '#lib/players.ts';

export type PlayerSaved = { ok: true; player: SavedPlayer } | { ok: false; status: 400 | 404 | 409; message: string };

const gone = { ok: false, status: 404, message: 'Diesen Spieler gibt es nicht mehr.' } as const;

export function listPlayers(db: DatabaseSync): SavedPlayer[] {
	const rows = db.prepare('SELECT id, name FROM players').all() as unknown as SavedPlayer[];
	return rows
		.map(({ id, name }) => ({ id, name }))
		.sort((a, b) => a.name.localeCompare(b.name, 'de', { sensitivity: 'base' }) || a.id - b.id);
}

// SQLite's NOCASE folds ASCII only, so duplicates are checked here and the column's UNIQUE is the backstop
function check(db: DatabaseSync, name: string, own?: number): PlayerSaved | null {
	const error = nameError(name);
	if (error) return { ok: false, status: 400, message: error };
	const key = name.toLocaleLowerCase('de');
	if (listPlayers(db).some((p) => p.id !== own && p.name.toLocaleLowerCase('de') === key))
		return { ok: false, status: 409, message: `„${name}“ ist schon gespeichert.` };
	return null;
}

export function addPlayer(db: DatabaseSync, name: string): PlayerSaved {
	const trimmed = name.trim();
	const rejected = check(db, trimmed);
	if (rejected) return rejected;
	const { lastInsertRowid } = db.prepare('INSERT INTO players (name) VALUES (?)').run(trimmed);
	return { ok: true, player: { id: Number(lastInsertRowid), name: trimmed } };
}

export function renamePlayer(db: DatabaseSync, id: number, name: string): PlayerSaved {
	if (!db.prepare('SELECT 1 FROM players WHERE id = ?').get(id)) return gone;
	const trimmed = name.trim();
	const rejected = check(db, trimmed, id);
	if (rejected) return rejected;
	db.prepare('UPDATE players SET name = ? WHERE id = ?').run(trimmed, id);
	return { ok: true, player: { id, name: trimmed } };
}

export function deletePlayer(db: DatabaseSync, id: number): { ok: true } | typeof gone {
	const { changes } = db.prepare('DELETE FROM players WHERE id = ?').run(id);
	return changes ? { ok: true } : gone;
}
