import type { Survey } from '#lib/content/types.ts';

export interface Played {
	surveyId: number;
	playerIds: number[];
}

export interface Row {
	survey: Survey;
	// players of this game on the survey's played-with list
	k: number;
	// size of the whole list
	played: number;
}

export type Sort = 'known' | 'played';

export function rows(surveys: Survey[], played: Played[], saved: number[]): Row[] {
	const lists = new Map(played.map((p) => [p.surveyId, p.playerIds]));
	return surveys.map((survey) => {
		const list = lists.get(survey.id) ?? [];
		return { survey, k: list.filter((id) => saved.includes(id)).length, played: list.length };
	});
}

export function sortRows(list: Row[], by: Sort): Row[] {
	const [first, second] = by === 'known' ? (['k', 'played'] as const) : (['played', 'k'] as const);
	return [...list].sort((a, b) => a[first] - b[first] || a[second] - b[second] || a.survey.id - b.survey.id);
}

// shuffle first so the stable sort by k picks randomly among equals
function leastKnown(list: Row[], taken: number[], random: () => number): Row[] {
	const rest = list.filter((r) => !taken.includes(r.survey.id));
	for (let i = rest.length - 1; i > 0; i--) {
		const j = Math.floor(random() * (i + 1));
		[rest[i], rest[j]] = [rest[j], rest[i]];
	}
	return rest.sort((a, b) => a.k - b.k);
}

export function fill(list: Row[], slots: (number | null)[], random = Math.random): (number | null)[] {
	const taken = slots.filter((s): s is number => s !== null);
	const draw = leastKnown(list, taken, random).map((r) => r.survey.id);
	return slots.map((s) => s ?? draw.shift() ?? null);
}

export function drawTiebreak(list: Row[], picked: number[], random = Math.random): Survey {
	return leastKnown(list, picked, random)[0].survey;
}
