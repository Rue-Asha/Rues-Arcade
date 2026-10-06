import type { DatabaseSync } from 'node:sqlite';
import { parseSurveyBulk, surveyError } from '#lib/content/survey.ts';
import type { ImportReport, Survey, SurveyAnswer } from '#lib/content/types.ts';

export type SavedSurvey =
	| { ok: true; survey: Survey }
	| { ok: false; status: 400 | 404 | 409; message: string };

export function listSurveys(db: DatabaseSync): Survey[] {
	return db
		.prepare('SELECT id, question, answers FROM feud_surveys ORDER BY id')
		.all()
		.map((r) => ({ id: Number(r.id), question: String(r.question), answers: JSON.parse(String(r.answers)) }));
}

export function removeSurvey(db: DatabaseSync, id: number): boolean {
	return db.prepare('DELETE FROM feud_surveys WHERE id = ?').run(id).changes > 0;
}

const duplicate = { ok: false, status: 409, message: 'Diese Frage gibt es schon.' } as const;

// SQLite's NOCASE folds ASCII only, so duplicates are checked here and the column's UNIQUE is the backstop
const key = (question: string) => question.toLocaleLowerCase('de');

function taken(db: DatabaseSync, question: string, own?: number): boolean {
	const k = key(question);
	return listSurveys(db).some((s) => s.id !== own && key(s.question) === k);
}

function clean(question: string, answers: SurveyAnswer[]) {
	return {
		question: question.trim(),
		answers: answers.map((a) => ({ text: String(a?.text ?? '').trim(), points: a?.points }))
	};
}

export function addSurvey(db: DatabaseSync, question: string, answers: SurveyAnswer[]): SavedSurvey {
	const c = clean(question, answers);
	const message = surveyError(c.question, c.answers);
	if (message) return { ok: false, status: 400, message };
	if (taken(db, c.question)) return duplicate;
	const r = db
		.prepare('INSERT OR IGNORE INTO feud_surveys (question, answers) VALUES (?, ?)')
		.run(c.question, JSON.stringify(c.answers));
	if (!r.changes) return duplicate;
	return { ok: true, survey: { id: Number(r.lastInsertRowid), ...c } };
}

export function updateSurvey(
	db: DatabaseSync,
	id: number,
	question: string,
	answers: SurveyAnswer[]
): SavedSurvey {
	const c = clean(question, answers);
	const message = surveyError(c.question, c.answers);
	if (message) return { ok: false, status: 400, message };
	if (!db.prepare('SELECT 1 FROM feud_surveys WHERE id = ?').get(id))
		return { ok: false, status: 404, message: 'Umfrage nicht gefunden.' };
	if (taken(db, c.question, id)) return duplicate;
	const r = db
		.prepare('UPDATE OR IGNORE feud_surveys SET question = ?, answers = ? WHERE id = ?')
		.run(c.question, JSON.stringify(c.answers), id);
	if (!r.changes) return duplicate;
	return { ok: true, survey: { id, ...c } };
}

export function importSurveys(db: DatabaseSync, text: string): ImportReport {
	const { rows, skipped, errors } = parseSurveyBulk(text);
	const insert = db.prepare('INSERT OR IGNORE INTO feud_surveys (question, answers) VALUES (?, ?)');
	let imported = 0;
	const known = new Set(listSurveys(db).map((s) => key(s.question)));
	db.exec('BEGIN');
	for (const { question, answers } of rows) {
		if (known.has(key(question))) continue;
		known.add(key(question));
		imported += Number(insert.run(question, JSON.stringify(answers)).changes);
	}
	db.exec('COMMIT');
	return { imported, duplicates: rows.length - imported, skipped, errors };
}
