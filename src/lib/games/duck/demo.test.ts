import { describe, expect, it } from 'vitest';
import { done, next, start, view, type DemoRun } from '#lib/demo/runner.ts';
import { demo } from './demo.ts';
import { duck, type DuckState } from './engine.ts';

function playThrough() {
	let run: DemoRun<DuckState> = start(duck, demo);
	const states = [run.state];
	while (!done(demo, run)) {
		run = next(duck, demo, run, { type: view(demo, run).expected! });
		states.push(run.state);
	}
	return states;
}

describe('duck demo', () => {
	it('Scenario: Duck demo script plays to the end', () => {
		const a = playThrough();
		const b = playThrough();
		expect(a).toEqual(b);
		expect(a).toHaveLength(demo.steps.length + 1);

		const first = a[0];
		expect(first.players.map((p) => p.name)).toEqual(['Alex', 'Bo', 'Cleo', 'Dani']);
		expect(first.players[first.chuck].name).toBe('Cleo');
		expect(first.word.a).toBe('Haus');

		const end = a.at(-1)!;
		expect(end.phase).toBe('standings');
		expect(end.scores).toEqual([5, 0, 3, 0]);
		expect(end.lives).toEqual([5, 4, 5, 5]);
		expect(end.players[end.chuck].name).toBe('Dani');
		expect(view(demo, { state: end, index: demo.steps.length }).tip).toBe('Demo beendet');
	});

	it('every step changes the state and the tips read neutral', () => {
		const states = playThrough();
		for (let i = 1; i < states.length; i++) expect(states[i]).not.toEqual(states[i - 1]);
		expect(demo.steps.filter((s) => /!|\p{Extended_Pictographic}/u.test(s.tip))).toEqual([]);
	});
});
