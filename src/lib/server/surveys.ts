import type { DatabaseSync } from 'node:sqlite';
import type { ImportReport, Survey, SurveyAnswer } from '#lib/content/types.ts';

export type SavedSurvey =
	| { ok: true; survey: Survey }
	| { ok: false; status: 400 | 404 | 409; message: string };

const notYet: SavedSurvey = { ok: false, status: 400, message: 'Noch nicht verfügbar.' };

export function listSurveys(db: DatabaseSync): Survey[] {
	return db
		.prepare('SELECT id, question, answers FROM feud_surveys ORDER BY id')
		.all()
		.map((r) => ({ id: Number(r.id), question: String(r.question), answers: JSON.parse(String(r.answers)) }));
}

export function removeSurvey(db: DatabaseSync, id: number): boolean {
	return db.prepare('DELETE FROM feud_surveys WHERE id = ?').run(id).changes > 0;
}

export function addSurvey(db: DatabaseSync, question: string, answers: SurveyAnswer[]): SavedSurvey {
	void db, question, answers;
	return notYet;
}

export function updateSurvey(
	db: DatabaseSync,
	id: number,
	question: string,
	answers: SurveyAnswer[]
): SavedSurvey {
	void db, id, question, answers;
	return notYet;
}

export function importSurveys(db: DatabaseSync, text: string): ImportReport {
	void db, text;
	return { imported: 0, duplicates: 0, skipped: 0, errors: [] };
}
