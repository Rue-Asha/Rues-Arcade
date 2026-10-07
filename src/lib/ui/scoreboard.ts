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

export function moved(before: string[], after: string[]): string[] {
	return after.filter((name, i) => before.indexOf(name) !== i);
}
