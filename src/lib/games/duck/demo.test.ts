import { describe, expect, it } from 'vitest';
import { start } from '#lib/demo/runner.ts';
import { demo } from './demo.ts';
import { duck, MAX_LIVES, type DuckState } from './engine.ts';

function run() {
	const states: DuckState[] = [start(duck, demo).state as DuckState];
	for (const step of demo.steps) states.push(duck.reduce(states.at(-1)!, step.action));
	return states;
}

// [state before, action type, state after] for every step
function walk() {
	const a = run();
	return demo.steps.map((step, i) => ({ before: a[i], type: step.action.type, after: a[i + 1] }));
}

const gained = (before: DuckState, after: DuckState) => after.scores.map((v, i) => v - before.scores[i]);

// the points a word added: scores at its commit against the scores it started with
function words() {
	return walk()
		.filter((s) => s.type === 'commit')
		.map((s) => ({ ...s, gained: gained({ ...s.before, scores: s.before.baseScores }, s.before), lost: s.before.lives.map((l, i) => s.before.baseLives[i] - l) }));
}

describe('duck demo', () => {
	it('Scenario: Duck demo script plays to the end', () => {
		const a = run();
		expect(run()).toEqual(a);
		for (let i = 0; i < demo.steps.length; i++) expect(a[i + 1], `step ${i + 1} changes the state`).not.toEqual(a[i]);
		expect(a[0].players.map((p) => p.name)).toEqual(['Alex', 'Bo', 'Cleo', 'Dani']);
		expect(demo.config.target).toBe(10);
		expect(demo.steps.at(-1)!.action.type).toBe('restart');
		expect(demo.steps.filter((s) => /!|\p{Extended_Pictographic}/u.test(s.tip))).toEqual([]);
		expect(demo.steps.filter((s) => !s.tip.trim())).toEqual([]);
	});

	it('Scenario: Duck demo covers every outcome branch', () => {
		const steps = walk();

		// Duck demo skips a word: a different word, Chuck unchanged
		const skips = steps.filter((s) => s.type === 'skip');
		expect(skips).toHaveLength(1);
		expect(skips[0].before.phase).toBe('reveal');
		expect(skips[0].after.word.id).not.toBe(skips[0].before.word.id);
		expect(skips[0].after.chuck).toBe(skips[0].before.chuck);

		// Duck demo scores none, one match and a multi-match
		const w = words();
		expect(w.length).toBeGreaterThanOrEqual(5);
		expect(w.some((x) => x.gained.every((g) => g === 0))).toBe(true);
		const chuckOf = (x: (typeof w)[number]) => x.before.chuck;
		const oneMatch = w.filter((x) => x.gained.filter((g) => g > 0).length === 2);
		expect(oneMatch.length).toBeGreaterThanOrEqual(1);
		expect(oneMatch.some((x) => x.gained.includes(5) && x.gained.includes(3) && x.gained[chuckOf(x)] === 3)).toBe(true);
		const multi = w.filter((x) => x.gained.filter((g) => g === 1).length >= 3);
		expect(multi.length).toBeGreaterThanOrEqual(1);
		expect(multi.every((x) => x.gained.every((g) => g === 0 || g === 1))).toBe(true);

		// Duck demo loses letters to elimination: one player from 5 to 0, at most one letter per word, Chuck moves on
		for (const x of w) expect(x.lost.every((l) => l <= 1)).toBe(true);
		const losing = w.map((x) => x.lost.findIndex((l) => l === 1)).filter((i) => i >= 0);
		expect(new Set(losing).size).toBe(1);
		const bo = losing[0];
		expect(w[0].before.baseLives[bo]).toBe(MAX_LIVES);
		expect(w.at(-1)!.after.lives[bo]).toBe(0);
		expect(w.filter((x) => x.lost[bo] === 1).length).toBe(MAX_LIVES);
		for (const x of w.slice(0, -1)) expect(x.after.chuck).toBe((x.before.chuck + 1) % 4);

		// Duck demo ends at target with an elimination
		const last = w.at(-1)!;
		expect(last.after.phase).toBe('gameOver');
		expect(last.after.endReason).toBe('target');
		expect(Math.max(...last.after.scores)).toBe(10);
		expect(last.after.lives.some((l) => l === 0)).toBe(true);
		expect(w.slice(0, -1).every((x) => x.after.phase === 'standings')).toBe(true);
		expect(demo.steps.some((s) => s.tip.includes('Buchstaben') && s.tip.includes('allein'))).toBe(true);

		// Duck demo plays a new round
		const again = steps.at(-1)!;
		expect(again.type).toBe('restart');
		expect(again.before.phase).toBe('gameOver');
		expect(again.after.phase).toBe('reveal');
		expect(again.after.scores).toEqual([0, 0, 0, 0]);
		expect(again.after.lives).toEqual([5, 5, 5, 5]);
		expect(again.after.players).toEqual(again.before.players);
	});
});
