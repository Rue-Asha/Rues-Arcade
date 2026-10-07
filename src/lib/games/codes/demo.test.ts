import { describe, expect, it } from 'vitest';
import { start } from '#lib/demo/runner.ts';
import { demo } from './demo.ts';
import { codes, explainer, opener, type CodesState } from './engine.ts';

function run() {
	const states: CodesState[] = [start(codes, demo).state];
	for (const { action } of demo.steps) states.push(codes.reduce(states.at(-1)!, action));
	return states;
}

// [state before, action type, state after] for every step
function walk() {
	const a = run();
	return demo.steps.map((step, i) => ({ before: a[i], type: step.action.type, after: a[i + 1] }));
}

describe('codes demo', () => {
	it('Scenario: Codes demo script plays to the end', () => {
		const a = run();
		expect(run()).toEqual(a);
		for (let i = 0; i < demo.steps.length; i++) expect(a[i + 1], `step ${i + 1} changes the state`).not.toEqual(a[i]);
		expect(demo.players).toEqual(['Alex', 'Bo', 'Cleo', 'Dani']);
		expect(a[0].teams.map((t) => t.players.map((p) => p.name))).toEqual([
			['Alex', 'Bo'],
			['Cleo', 'Dani']
		]);
		expect(demo.config.rounds).toBe(4);
		expect(demo.steps.at(-1)!.action.type).toBe('rematch');
	});

	it('Scenario: Codes demo tips read neutral', () => {
		expect(demo.steps.filter((s) => !s.tip.trim())).toEqual([]);
		expect(demo.steps.filter((s) => /!|\p{Extended_Pictographic}/u.test(s.tip))).toEqual([]);
	});

	it('Scenario: Codes demo covers every outcome branch', () => {
		const steps = walk();

		// scores 3, 2, 1 and a skip with 0, one each, in this order
		const results = steps.filter((s) => s.after.phase === 'result' && s.before.phase === 'play');
		expect(results.map((s) => [s.type, s.before.attempt, s.after.lastResult!.points])).toEqual([
			['guessed', 0, 3],
			['guessed', 1, 2],
			['guessed', 2, 1],
			['skip', 3, 0]
		]);
		// the 2 and 1 points go to the team that did not open after a miss by the opener
		expect(results[1].before.teamIndex).not.toBe(opener(results[1].before));
		expect(results[3].after.lastResult!.kind).toBe('skipped');

		// one redraw before the round starts: the word changes, team and explainers stay
		const redraws = steps.filter((s) => s.type === 'redraw');
		expect(redraws).toHaveLength(1);
		const [redraw] = redraws;
		expect(redraw.before.phase).toBe('reveal');
		expect(redraw.after.word.id).not.toBe(redraw.before.word.id);
		expect(redraw.after.teamIndex).toBe(redraw.before.teamIndex);
		expect(explainer(redraw.after, 0)).toEqual(explainer(redraw.before, 0));
		expect(explainer(redraw.after, 1)).toEqual(explainer(redraw.before, 1));

		// each round opens with the next team and each team's explainer moves on
		const rounds = steps.filter((s) => s.type === 'start').map((s) => s.before);
		expect(rounds).toHaveLength(4);
		const openers = rounds.map((s) => s.teamIndex);
		expect(openers, 'tips say Team 2 opens round 1').toEqual([1, 0, 1, 0]);
		openers.forEach((o, i) => expect(o).toBe((openers[0] + i) % 2));
		for (const team of [0, 1]) {
			expect(rounds.map((s) => explainer(s, team).name)).toEqual(
				team === 0 ? ['Alex', 'Bo', 'Alex', 'Bo'] : ['Cleo', 'Dani', 'Cleo', 'Dani']
			);
		}

		// the Endstand has one winning team, then a new game with both scores 0
		const over = steps.find((s) => s.after.phase === 'gameOver')!.after;
		expect(over.teams.map((t) => t.score), 'last tip says 6 to 0').toEqual([0, 6]);
		const best = Math.max(...over.teams.map((t) => t.score));
		expect(over.teams.filter((t) => t.score === best)).toHaveLength(1);
		const again = steps.at(-1)!;
		expect(again.type).toBe('rematch');
		expect(again.before.phase).toBe('gameOver');
		expect(again.after.phase).toBe('reveal');
		expect(again.after.teams.map((t) => t.score)).toEqual([0, 0]);
	});
});
