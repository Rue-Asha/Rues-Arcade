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
		expect(a.at(-1)!.phase).toBe('reveal');
		expect(demo.steps.filter((s) => /!|\p{Extended_Pictographic}/u.test(s.tip))).toEqual([]);
		expect(demo.steps.filter((s) => !s.tip.trim())).toEqual([]);
	});

	it('Regression: Duck demo never skips before the word is shown', () => {
		const skips = walk().filter((s) => s.type === 'skip');
		expect(skips).toHaveLength(1);
		expect(demo.steps[0].action.type).toBe('show');
		expect(skips[0].before.shown).toBe(true);
		expect(skips[0].after.word.id).not.toBe(skips[0].before.word.id);
		expect(skips[0].after.chuck).toBe(skips[0].before.chuck);
	});

	it('Regression: Duck demo scores everyone who found a rhyme together, Chuck holder included', () => {
		const w = words();
		expect(w).toHaveLength(3);
		const [alex, bo, cleo, dani] = [0, 1, 2, 3];
		expect(w.map((x) => x.before.chuck)).toEqual([cleo, dani, alex]);

		// three rhymes, 1 point each; the player without one loses a letter
		expect(w[0].gained).toEqual([1, 1, 0, 1]);
		expect(w[0].lost).toEqual([0, 0, 1, 0]);
		// two rhymes, 3 points each; the other two lose a letter
		expect(w[1].gained).toEqual([3, 0, 3, 0]);
		expect(w[1].lost).toEqual([0, 1, 0, 1]);
		// all four share one rhyme with Chuck's holder: 1 + 2 each, the holder included, and nobody loses a letter
		expect(w[2].gained).toEqual([3, 3, 3, 3]);
		expect(w[2].lost).toEqual([0, 0, 0, 0]);
		expect(w.every((x) => x.after.phase === 'standings')).toBe(true);
		expect(bo).toBe(1);
	});

	it('Regression: Duck demo ends on two slides naming both ways the game ends', () => {
		const last = demo.steps.slice(-2);
		expect(last[0].tip).toMatch(/Buchstaben/);
		expect(last[1].tip).toMatch(/Zielpunkt|Ziel/);
		expect(last[0].tip).not.toMatch(/Ziel/);
		const end = run().at(-1)!;
		expect(end.phase).toBe('reveal');
		expect(Math.max(...end.scores)).toBeLessThan(10);
		expect(Math.min(...end.lives)).toBeGreaterThan(0);
	});

	it('Scenario: Duck demo covers every outcome branch', () => {
		const steps = walk();
		const skips = steps.filter((s) => s.type === 'skip');
		expect(skips).toHaveLength(1);
		const w = words();
		for (const x of w) expect(x.lost.every((l) => l <= 1)).toBe(true);
		for (const x of w) expect(x.after.chuck).toBe((x.before.chuck + 1) % 4);
		expect(w.some((x) => x.gained.filter((g) => g === 1).length === 3)).toBe(true);
		expect(w.some((x) => x.gained.filter((g) => g === 3).length === 2 && x.gained.every((g) => g === 0 || g === 3))).toBe(true);
		expect(w.some((x) => x.gained.every((g) => g === 3))).toBe(true);
	});
});
