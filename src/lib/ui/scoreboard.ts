export interface ScoreRow {
	name: string;
	score: number;
	before?: number;
	lead?: boolean;
	acting?: boolean;
}

export function ranked<T extends { score: number }>(rows: T[], by: (r: T) => number = (r) => r.score): T[] {
	return rows.toSorted((a, b) => by(b) - by(a));
}

// competition ranking: ties share a rank and the next rank skips (1, 1, 3)
export function places(scores: number[]): number[] {
	return scores.map((s) => scores.findIndex((o) => o === s) + 1);
}

export function moved(before: string[], after: string[]): string[] {
	return after.filter((name, i) => before.indexOf(name) !== i);
}
