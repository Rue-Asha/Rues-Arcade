import { describe, expect, it } from 'vitest';
import { board } from '#lib/content/survey.ts';
import type { Survey } from '#lib/content/types.ts';

describe('surveys', () => {
	it('Scenario: Survey board order by points', () => {
		const survey: Survey = {
			id: 1,
			question: 'Nenne einen Buchstaben',
			answers: [
				{ text: 'A', points: 10 },
				{ text: 'B', points: 30 },
				{ text: 'C', points: 10 },
				{ text: 'D', points: 20 }
			]
		};

		expect(board(survey).map((a) => a.text)).toEqual(['B', 'D', 'A', 'C']);
		expect(survey.answers.map((a) => a.text)).toEqual(['A', 'B', 'C', 'D']);
	});
});
