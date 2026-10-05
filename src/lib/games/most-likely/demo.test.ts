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
		expect(a.map((s) => s.phase)).toEqual(['prompt', 'pick', 'pick', 'pick', 'reveal']);
		const end = a.at(-1)!;
		expect(end.round).toBe(0);
		expect(end.prompt.a).toBe('Wer würde am ehesten einen Marathon laufen?');
		expect(end.chosen.map((i) => end.players[i].name)).toEqual(['Alex', 'Cleo']);
		expect(end.titles).toEqual([1, 0, 1, 0]);
		expect(demo.steps.every((st) => st.tip.length > 0 && !st.tip.includes('!'))).toBe(true);
	});
});
