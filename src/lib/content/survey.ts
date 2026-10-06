import type { ImportError, Survey, SurveyAnswer } from './types.ts';

export function board(survey: Survey): SurveyAnswer[] {
	return survey.answers.toSorted((x, y) => y.points - x.points);
}

export function surveyError(question: string, answers: SurveyAnswer[]): string | null {
	void question, answers;
	return null;
}

export function parseSurveyBulk(text: string): {
	rows: { question: string; answers: SurveyAnswer[] }[];
	skipped: number;
	errors: ImportError[];
} {
	void text;
	return { rows: [], skipped: 0, errors: [] };
}
