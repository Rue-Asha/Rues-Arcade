import { describe, expect, it } from 'vitest';
import type { Survey } from '#lib/content/types.ts';
import { drawTiebreak, fill, rows, sortRows, type Row } from './prep.ts';

const survey = (id: number): Survey => ({
	id,
	question: `Frage ${id}`,
	answers: [
		{ text: 'a', points: 40 },
		{ text: 'b', points: 30 },
		{ text: 'c', points: 20 }
	]
});

// one survey per entry, k of the game's 4 players know it
function table(ks: number[]): Row[] {
	const game = [1, 2, 3, 4];
	const surveys = ks.map((_, i) => survey(i + 1));
	const played = ks.map((k, i) => ({ surveyId: i + 1, playerIds: game.slice(0, k) }));
	return rows(surveys, played, game);
}

const ids = (list: (number | null)[]) => [...list].sort();

describe('prep', () => {
	it('counts who knows a survey', () => {
		const [x, y] = rows(
			[survey(1), survey(2)],
			[{ surveyId: 1, playerIds: [1, 2, 9] }],
			[1, 2, 3, 4]
		);

		expect(x).toMatchObject({ k: 2, played: 3 });
		expect(y).toMatchObject({ k: 0, played: 0 });
	});

	it('sorts by known then played, and by played then known', () => {
		const list = rows(
			[survey(1), survey(2), survey(3), survey(4)],
			[
				{ surveyId: 1, playerIds: [1, 9, 8, 7] },
				{ surveyId: 2, playerIds: [1] },
				{ surveyId: 3, playerIds: [9, 8] },
				{ surveyId: 4, playerIds: [] }
			],
			[1, 2]
		);

		expect(sortRows(list, 'known').map((r) => r.survey.id)).toEqual([4, 3, 2, 1]);
		expect(sortRows(list, 'played').map((r) => r.survey.id)).toEqual([4, 2, 3, 1]);
	});

	it('Scenario: Feud fill keeps hand-picked surveys', () => {
		const list = table([0, 0, 0, 0, 0]);

		const slots = fill(list, [null, 3, null], () => 0.5);

		expect(slots[1]).toBe(3);
		expect(slots.every((s) => s !== null)).toBe(true);
		expect(new Set(slots).size).toBe(3);
	});

	it('Scenario: Feud fill prefers unknown surveys', () => {
		const list = table([0, 0, 1, 2]);

		for (const r of [0, 0.4, 0.99]) expect(ids(fill(list, [null, null], () => r))).toEqual([1, 2]);
	});

	it('Scenario: Feud fill falls back to the least known', () => {
		const list = table([0, 1, 1, 3]);

		for (const r of [0, 0.4, 0.99]) expect(ids(fill(list, [null, null, null], () => r))).toEqual([1, 2, 3]);
	});

	it('Scenario: Feud tiebreak survey drawn like the fill', () => {
		const list = table([0, 0, 1]);
		const picks = [1, 3];

		expect(drawTiebreak(list, picks, () => 0).id).toBe(2);
	});

	it('a full set of slots is left alone', () => {
		expect(fill(table([0, 0, 0]), [1, 2], () => 0)).toEqual([1, 2]);
	});
});
