import { describe, expect, it } from 'vitest';
import { start } from '#lib/demo/runner.ts';
import { demo } from './demo.ts';
import { mostLikely, type MostLikelyState } from './engine.ts';

describe('most likely demo', () => {
	const play = () => {
		let s = start(mostLikely, demo).state;
		const states: MostLikelyState[] = [s];
		for (const { action } of demo.steps) {
			const n = mostLikely.reduce(s, action);
			expect(n, `step ${states.length}: ${action.type}`).not.toBe(s);
			states.push((s = n));
		}
		return states;
	};

	it('Scenario: Most Likely demo script plays to the end', () => {
		expect(demo.players).toEqual(['Alex', 'Bo', 'Cleo', 'Dani']);
		const a = play();
		const b = play();
		expect(a).toEqual(b);
		expect(a[0].teams.map((t) => t.players.map((p) => p.name))).toEqual([
			['Alex', 'Bo'],
			['Cleo', 'Dani']
		]);
		expect(a.map((s) => s.phase)).toEqual(['prompt', 'count', 'result', 'prompt', 'count', 'result']);
		expect(a.at(-1)!.teams.map((t) => t.score).sort()).toEqual([0, 2]);
		expect(demo.steps.every((st) => st.tip.length > 0 && !st.tip.includes('!'))).toBe(true);
	});
});
