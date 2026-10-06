import type { DatabaseSync } from 'node:sqlite';

export interface Played {
	surveyId: number;
	playerIds: number[];
}

export function listPlayed(db: DatabaseSync): Played[] {
	const rows = db
		.prepare('SELECT survey_id, player_id FROM feud_played ORDER BY survey_id, player_id')
		.all() as { survey_id: number; player_id: number }[];
	const bySurvey = new Map<number, number[]>();
	for (const { survey_id, player_id } of rows) bySurvey.set(survey_id, [...(bySurvey.get(survey_id) ?? []), player_id]);
	return [...bySurvey].map(([surveyId, playerIds]) => ({ surveyId, playerIds }));
}

export function addPlayed(db: DatabaseSync, surveyId: number, playerIds: number[]): void {
	const insert = db.prepare(
		`INSERT OR IGNORE INTO feud_played (survey_id, player_id)
		 SELECT ?, ? WHERE EXISTS (SELECT 1 FROM feud_surveys WHERE id = ?) AND EXISTS (SELECT 1 FROM players WHERE id = ?)`
	);
	for (const playerId of playerIds) insert.run(surveyId, playerId, surveyId, playerId);
}

export function removePlayed(db: DatabaseSync, surveyId: number, playerId: number): boolean {
	return db.prepare('DELETE FROM feud_played WHERE survey_id = ? AND player_id = ?').run(surveyId, playerId).changes > 0;
}
