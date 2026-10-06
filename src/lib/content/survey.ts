import {
	MAX_ANSWERS,
	MAX_POINTS,
	MAX_TEXT,
	MIN_ANSWERS,
	type ImportError,
	type Survey,
	type SurveyAnswer
} from './types.ts';

export function board(survey: Survey): SurveyAnswer[] {
	return survey.answers.toSorted((x, y) => y.points - x.points);
}

export function surveyError(question: string, answers: SurveyAnswer[]): string | null {
	if (!question.trim()) return 'Die Frage braucht Text.';
	if (answers.length < MIN_ANSWERS || answers.length > MAX_ANSWERS)
		return `Eine Umfrage braucht ${MIN_ANSWERS} bis ${MAX_ANSWERS} Antworten.`;
	if (question.trim().length > MAX_TEXT || answers.some((a) => String(a.text).trim().length > MAX_TEXT))
		return `Höchstens ${MAX_TEXT} Zeichen pro Text.`;
	if (answers.some((a) => !String(a.text).trim())) return 'Jede Antwort braucht Text.';
	if (answers.some((a) => !Number.isInteger(a.points) || a.points <= 0))
		return 'Punkte sind ganze Zahlen über 0.';
	if (new Set(answers.map((a) => a.text.trim().toLowerCase())).size < answers.length)
		return 'Jede Antwort darf nur einmal vorkommen.';
	if (answers.reduce((sum, a) => sum + a.points, 0) > MAX_POINTS)
		return `Die Punkte dürfen zusammen höchstens ${MAX_POINTS} ergeben.`;
	return null;
}

export function parseSurveyBulk(text: string): {
	rows: { question: string; answers: SurveyAnswer[] }[];
	skipped: number;
	errors: ImportError[];
} {
	const out: ReturnType<typeof parseSurveyBulk> = { rows: [], skipped: 0, errors: [] };
	text.split(/\r?\n/).forEach((raw, i) => {
		const line = i + 1;
		if (!raw.trim()) {
			out.skipped++;
			return;
		}
		const [question, ...parts] = raw.split('|').map((p) => p.trim());
		if (!parts.length) {
			out.errors.push({ line, message: 'Kein „|“ in der Zeile (Format: Frage | Antwort : Zahl | …).' });
			return;
		}
		const answers: SurveyAnswer[] = [];
		for (const part of parts) {
			const colon = part.lastIndexOf(':');
			if (colon < 0) {
				out.errors.push({ line, message: `„${part}“ hat kein „:“ vor den Punkten.` });
				return;
			}
			const points = part.slice(colon + 1).trim();
			answers.push({ text: part.slice(0, colon).trim(), points: points ? Number(points) : NaN });
		}
		const message = surveyError(question, answers);
		if (message) out.errors.push({ line, message });
		else out.rows.push({ question, answers });
	});
	return out;
}
