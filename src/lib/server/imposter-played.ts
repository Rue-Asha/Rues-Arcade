import type { DatabaseSync } from 'node:sqlite';
import type { PairPlayed } from '#lib/content/types.ts';

export function listImposterPlayed(db: DatabaseSync): PairPlayed[] {
	const rows = db
		.prepare('SELECT pair_id, player_id FROM imposter_played ORDER BY pair_id, player_id')
		.all() as { pair_id: number; player_id: number }[];
	const byPair = new Map<number, number[]>();
	for (const { pair_id, player_id } of rows) byPair.set(pair_id, [...(byPair.get(pair_id) ?? []), player_id]);
	return [...byPair].map(([pairId, playerIds]) => ({ pairId, playerIds }));
}

export function addImposterPlayed(db: DatabaseSync, pairId: number, playerIds: number[]): void {
	const insert = db.prepare(
		`INSERT OR IGNORE INTO imposter_played (pair_id, player_id)
		 SELECT ?, ? WHERE EXISTS (SELECT 1 FROM imposter_pairs WHERE id = ?) AND EXISTS (SELECT 1 FROM players WHERE id = ?)`
	);
	for (const playerId of playerIds) insert.run(pairId, playerId, pairId, playerId);
}

export function removeImposterPlayed(db: DatabaseSync, pairId: number, playerId: number): boolean {
	return db.prepare('DELETE FROM imposter_played WHERE pair_id = ? AND player_id = ?').run(pairId, playerId).changes > 0;
}
