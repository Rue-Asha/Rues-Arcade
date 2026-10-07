import { describe, expect, it } from 'vitest';
import { start } from '#lib/demo/runner.ts';
import { demo } from './demo.ts';
import { feud, multiplier, pot, suddenDeath, type FeudAction, type FeudState } from './engine.ts';

function run() {
	const states: FeudState[] = [start(feud, demo).state as FeudState];
	for (const step of demo.steps) states.push(feud.reduce(states.at(-1)!, step.action));
	return states;
}

// [state before, action, state after] for every step
function walk() {
	const a = run();
	return demo.steps.map((step, i) => ({ before: a[i], action: step.action as FeudAction, after: a[i + 1] }));
}

describe('feud demo', () => {
	it('Scenario: Feud demo script plays to the end', () => {
		const a = run();
		expect(run()).toEqual(a);
		for (let i = 0; i < demo.steps.length; i++) expect(a[i + 1], `step ${i + 1} changes the state`).not.toEqual(a[i]);

		const end = a.at(-1)!;
		expect(end.phase).toBe('gameOver');
		expect(end.winner).not.toBeNull();
		expect(end.closed).toHaveLength(demo.config.surveys.length + 1);
		expect(end.config.teams.map((t) => t.players)).toEqual([['Alex', 'Bo'], ['Cleo', 'Dani']]);
		expect(demo.config.surveys.length).toBeGreaterThan(1);
	});

	it('Scenario: Feud demo covers every outcome branch', () => {
		const steps = walk();
		const faceoffs = steps.filter((s) => s.action.type === 'answer');
		const second = (s: (typeof steps)[number]) => s.before.answers.length === 1;
		const tile = (s: (typeof steps)[number]) => (s.action as { tile: number | null }).tile;

		// every round, sudden death included, opens with the reveal, then the buzz, then the first answer
		const rounds = [...new Set(steps.map((s) => s.before.round))];
		expect(rounds).toHaveLength(demo.config.surveys.length + 1);
		const buzzed: number[] = [];
		for (const r of rounds) {
			const own = steps.filter((s) => s.before.round === r && s.action.type !== 'next');
			expect(own.slice(0, 3).map((s) => s.action.type), `round ${r + 1}`).toEqual(['ask', 'buzz', 'answer']);
			expect(own.slice(2).filter((s) => s.action.type === 'ask' || s.action.type === 'buzz')).toEqual([]);
			expect(own[0].before.asked).toBe(false);
			const team = (own[1].action as { team: number }).team;
			expect(own[2].before.first).toBe(team);
			buzzed.push(team);
		}
		expect(new Set(buzzed)).toEqual(new Set([0, 1]));

		// face-off branches
		const missThenHit = faceoffs.filter((s) => second(s) && s.before.answers[0] === null && tile(s) !== null);
		expect(missThenHit.some((s) => s.after.phase === 'choose' && s.after.control === 1 - s.before.first!)).toBe(true);
		const bothMiss = faceoffs.filter((s) => second(s) && s.before.answers[0] === null && tile(s) === null);
		expect(bothMiss.length).toBeGreaterThan(0);
		for (const s of bothMiss) {
			expect(s.after.phase).toBe('faceoff');
			expect(s.after.answers).toEqual([]);
			expect(s.after.cursors).not.toEqual(s.before.cursors);
		}
		const i = steps.indexOf(bothMiss[0]);
		expect(steps[i + 1].action).toMatchObject({ type: 'answer' });
		expect(steps[i + 1].before.answers).toEqual([]);
		const atOnce = faceoffs.filter((s) => s.before.answers.length === 0 && tile(s) === 0);
		expect(atOnce.some((s) => s.after.phase === 'choose' && s.after.answers.length === 1)).toBe(true);
		const twoHits = faceoffs.filter((s) => second(s) && s.before.answers[0] !== null && tile(s) !== null);
		expect(twoHits.length).toBeGreaterThan(0);
		for (const s of twoHits) {
			const first = s.before.first!;
			const higher = s.before.answers[0]! < tile(s)! ? first : 1 - first;
			expect(s.after.control, 'the lower place number wins').toBe(higher);
		}

		// play and pass
		const choose = steps.filter((s) => s.before.phase === 'choose');
		expect(choose.some((s) => s.action.type === 'play' && s.after.playing === s.before.control)).toBe(true);
		expect(choose.some((s) => s.action.type === 'pass' && s.after.playing === 1 - s.before.control!)).toBe(true);

		// a board cleared without a steal
		const cleared = steps.filter(
			(s) => s.action.type === 'reveal' && s.after.phase === 'result' && s.after.revealed.every(Boolean)
		);
		expect(cleared.length).toBeGreaterThan(0);
		expect(cleared[0].after.gain).toMatchObject({ stolen: false, team: cleared[0].before.playing });
		expect(cleared[0].after.gain!.points).toBe(pot(cleared[0].after));

		// a steal that hits and one that misses
		const steals = steps.filter((s) => s.action.type === 'steal');
		for (const s of steals) expect(s.before.strikes).toBe(3);
		const hit = steals.filter((s) => (s.action as { tile: number | null }).tile !== null);
		const miss = steals.filter((s) => (s.action as { tile: number | null }).tile === null);
		expect(hit.some((s) => s.after.gain!.stolen && s.after.gain!.team === 1 - s.before.playing!)).toBe(true);
		expect(miss.some((s) => !s.after.gain!.stolen && s.after.gain!.team === s.before.playing && s.after.gain!.points > 0)).toBe(true);

		// the last regular round counts double
		const lastRound = demo.config.surveys.length - 1;
		const banked = steps.filter((s) => s.before.round === lastRound && s.after.phase === 'result' && s.before.phase !== 'result');
		expect(banked.length).toBeGreaterThan(0);
		for (const s of banked) {
			expect(multiplier(s.after)).toBe(2);
			expect(s.after.gain!.points).toBe(pot(s.after) * 2);
		}

		// sudden death on the tiebreak survey
		const sudden = steps.filter((s) => suddenDeath(s.before));
		expect(sudden.length).toBeGreaterThan(0);
		const entry = steps.find((s) => s.before.round === lastRound && s.after.round === demo.config.surveys.length)!;
		expect(entry.after.scores[0]).toBe(entry.after.scores[1]);
		expect(entry.after.phase).toBe('faceoff');
		const decided = sudden.find((s) => s.after.phase === 'result')!;
		expect(decided.action.type).toBe('answer');
		const end = run().at(-1)!;
		expect(end.phase).toBe('gameOver');
		expect(end.winner).toBe(decided.after.gain!.team);
		expect(end.closed.at(-1)).toBe(demo.config.tiebreak.id);

		// undo is named in a tip, tips are neutral
		expect(demo.steps.some((s) => s.tip.includes('Rückgängig'))).toBe(true);
		expect(demo.steps.filter((s) => s.tip.includes('!') || /\p{Extended_Pictographic}/u.test(s.tip))).toEqual([]);
		expect(demo.steps.every((s) => s.tip.length > 0)).toBe(true);
	});
});
