import { describe, expect, it } from 'vitest';
import { start } from '#lib/demo/runner.ts';
import { demo } from './demo.ts';
import { codes, type CodesState } from './engine.ts';

function run() {
	const states: CodesState[] = [start(codes, demo).state];
	for (const { action } of demo.steps) states.push(codes.reduce(states.at(-1)!, action));
	return states;
}

describe('codes demo', () => {
	it('Scenario: Codes demo script plays to the end', () => {
		const a = run();
		const b = run();
		expect(a).toEqual(b);
		expect(demo.players).toEqual(['Alex', 'Bo', 'Cleo', 'Dani']);
		expect(a[0].teams.map((t) => t.players.map((p) => p.name))).toEqual([
			['Alex', 'Bo'],
			['Cleo', 'Dani']
		]);
		expect(demo.steps.map((s) => s.action.type)).toEqual(['start', 'missed', 'guessed', 'next']);

		const end = a.at(-1)!;
		expect(end.phase).toBe('gameOver');
		const opener = a[0].teamIndex;
		expect(end.teams[opener].score).toBe(0);
		expect(end.teams[1 - opener].score).toBe(2);
	});

	it('tips name the teams in turn and read neutral', () => {
		const [first] = run();
		const opener = first.teams[first.teamIndex].name;
		const second = first.teams[1 - first.teamIndex].name;
		const tips = demo.steps.map((s) => s.tip);
		expect(tips[0]).toContain(opener);
		expect(tips[1]).toContain(second);
		expect(tips[2]).toContain('2 Punkte');
		expect(tips.filter((t) => /!|\p{Extended_Pictographic}/u.test(t))).toEqual([]);
	});
});
