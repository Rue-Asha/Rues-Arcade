import { describe, expect, it } from 'vitest';
import { moved, ranked } from './scoreboard.ts';

describe('scoreboard', () => {
	it('Scenario: Scoreboard order is stable', () => {
		const rows = [
			{ name: 'A', score: 3 },
			{ name: 'B', score: 5 },
			{ name: 'C', score: 3 },
			{ name: 'D', score: 5 }
		];
		expect(ranked(rows).map((r) => r.name)).toEqual(['B', 'D', 'A', 'C']);
		expect(ranked(rows.toReversed()).map((r) => r.name)).toEqual(['D', 'B', 'C', 'A']);
		expect(rows.map((r) => r.name)).toEqual(['A', 'B', 'C', 'D']);

		const before = ranked(rows.map((r) => ({ ...r, score: r.score - 1 }))).map((r) => r.name);
		const after = ranked(rows).map((r) => r.name);
		expect(moved(before, after)).toEqual([]);
	});

	it('ranks by a custom key', () => {
		const rows = [{ n: 'A', s: { v: 1 } }, { n: 'B', s: { v: 2 } }];
		expect(ranked(rows as any, (r: any) => r.s.v).map((r: any) => r.n)).toEqual(['B', 'A']);
	});

	it('reports the names whose place changed', () => {
		expect(moved(['A', 'B', 'C'], ['B', 'A', 'C'])).toEqual(['B', 'A']);
		expect(moved(['A', 'B'], ['A', 'B', 'C'])).toEqual(['C']);
	});
});
