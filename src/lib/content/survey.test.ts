import { describe, expect, it } from 'vitest';
import { parseSurveyBulk, surveyError } from './survey.ts';
import type { SurveyAnswer } from './types.ts';

const answers = (...points: number[]): SurveyAnswer[] => points.map((p, i) => ({ text: `A${i + 1}`, points: p }));

describe('surveyError', () => {
	it('accepts a valid survey', () => {
		expect(surveyError('Nenne ein Obst', answers(40, 30, 20))).toBeNull();
	});

	it('needs a question and answer texts', () => {
		expect(surveyError('  ', answers(10, 10, 10))).toMatch(/Frage/);
		expect(surveyError('Frage', [{ text: ' ', points: 10 }, ...answers(10, 10)])).toMatch(/Antwort/);
	});
});

describe('parseSurveyBulk', () => {
	it('Scenario: Survey bulk import reports per line', () => {
		const text = [
			'Nenne eine Uhrzeit | Uhr: 12:00 : 30 | Mittag : 20 | Abend : 10',
			'',
			'kaputt ohne Trenner',
			'Zwei Antworten | A : 10 | B : 20',
			'Nenne ein Obst | Apfel : 40 | Birne : 30 | Kiwi : 20'
		].join('\n');

		const r = parseSurveyBulk(text);

		expect(r.rows).toEqual([
			{
				question: 'Nenne eine Uhrzeit',
				answers: [
					{ text: 'Uhr: 12:00', points: 30 },
					{ text: 'Mittag', points: 20 },
					{ text: 'Abend', points: 10 }
				]
			},
			{
				question: 'Nenne ein Obst',
				answers: [
					{ text: 'Apfel', points: 40 },
					{ text: 'Birne', points: 30 },
					{ text: 'Kiwi', points: 20 }
				]
			}
		]);
		expect(r.skipped).toBe(1);
		expect(r.errors).toEqual([
			{ line: 3, message: expect.stringMatching(/\|/) },
			{ line: 4, message: expect.stringMatching(/3 bis 8/) }
		]);
	});

	it('reports an answer without a colon or with non-numeric points', () => {
		const r = parseSurveyBulk('F | A : 1 | B | C : 2\nF2 | A : 1 | B : x | C : 2');

		expect(r.rows).toEqual([]);
		expect(r.errors.map((e) => e.line)).toEqual([1, 2]);
		expect(r.errors[0].message).toMatch(/:/);
		expect(r.errors[1].message).toMatch(/ganze Zahlen über 0/);
	});
});
