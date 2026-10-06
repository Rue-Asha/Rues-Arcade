import { describe, expect, it } from 'vitest';
import { parseSurveyBulk, surveyError } from './survey.ts';
import { MAX_TEXT, type SurveyAnswer } from './types.ts';

const answers = (...points: number[]): SurveyAnswer[] => points.map((p, i) => ({ text: `A${i + 1}`, points: p }));

describe('surveyError', () => {
	it('accepts a valid survey', () => {
		expect(surveyError('Nenne ein Obst', answers(40, 30, 20))).toBeNull();
	});

	it('Scenario: Duplicate answer within a survey rejected', () => {
		const message = surveyError('Nenne ein Obst', [
			{ text: 'Apfel', points: 10 },
			{ text: 'apfel', points: 10 },
			{ text: 'Birne', points: 10 }
		]);

		expect(message).toMatch(/nur einmal/);
	});

	it('Scenario: Survey points must be whole numbers above zero', () => {
		for (const points of [0, -3, 2.5, 'x' as unknown as number]) {
			const message = surveyError('Frage', [{ text: 'A', points }, ...answers(10, 10).slice(0, 2)]);

			expect(message, String(points)).toMatch(/ganze Zahlen über 0/);
		}
	});

	it('Scenario: Survey points sum at most 100', () => {
		expect(surveyError('Frage', answers(50, 30, 21))).toMatch(/100/);
		expect(surveyError('Frage', answers(50, 30, 20))).toBeNull();
	});

	it('Scenario: Survey needs three to eight answers', () => {
		const n = (count: number) => surveyError('Frage', answers(...Array(count).fill(5)));

		expect(n(2)).toMatch(/3 bis 8/);
		expect(n(9)).toMatch(/3 bis 8/);
		expect(n(3)).toBeNull();
		expect(n(8)).toBeNull();
	});

	it('Scenario: Overlong survey text rejected', () => {
		const long = 'x'.repeat(MAX_TEXT + 1);

		expect(surveyError(long, answers(10, 10, 10))).toMatch(/200 Zeichen/);
		expect(surveyError('Frage', [{ text: long, points: 10 }, ...answers(10, 10)])).toMatch(/200 Zeichen/);
		expect(surveyError('x'.repeat(MAX_TEXT), [{ text: 'y'.repeat(MAX_TEXT), points: 10 }, ...answers(10, 10)])).toBeNull();
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
