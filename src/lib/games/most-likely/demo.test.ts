import { describe, expect, it } from 'vitest';
import { start } from '#lib/demo/runner.ts';
import { demo } from './demo.ts';
import { current, mostLikely, order, type MostLikelyState } from './engine.ts';

const play = () => {
	let s = start(mostLikely, demo).state as MostLikelyState;
	const states: MostLikelyState[] = [s];
	for (const { action } of demo.steps) {
		const n = mostLikely.reduce(s, action);
		expect(n, `step ${states.length}: ${action.type}`).not.toBe(s);
		states.push((s = n));
	}
	return states;
};

const states = play();
const stepsOf = (type: string) =>
	demo.steps.map((s, i) => [s, i] as const).filter(([s]) => s.action.type === type);
const lastTurn = states.findIndex((s) => s.phase === 'gameOver');

describe('most likely demo', () => {
	it('Scenario: Most Likely demo script plays to the end', () => {
		expect(demo.players).toEqual(['Alex', 'Bo', 'Cleo', 'Dani']);
		expect(play()).toEqual(states);
		expect(states.at(-1)!.phase).toBe('prompt');
		expect(demo.steps.at(-1)!.action.type).toBe('rematch');
		expect(demo.steps.every((st) => st.tip.length > 0)).toBe(true);
	});

	describe('Scenario: Most Likely demo covers every outcome branch', () => {
		it('plays two teams of two', () => {
			expect(states[0].teams.map((t) => t.players.map((p) => p.name))).toEqual([
				['Alex', 'Bo'],
				['Cleo', 'Dani']
			]);
			expect(states[0].rounds).toBe(5);
			expect(states[0].teams.map((t) => t.score)).toEqual([0, 0]);
		});

		it('scores a full match of 2', () => {
			const scored = stepsOf('score').filter(([s]) => (s.action as { matched: number }).matched === 2);
			expect(scored.length).toBeGreaterThan(0);
			for (const [, i] of scored) {
				const t = current(states[i]);
				expect(states[i + 1].teams[t].score).toBe(states[i].teams[t].score + 2);
			}
		});

		it('scores no match as 0 for both teams', () => {
			const none = stepsOf('score').filter(([s]) => (s.action as { matched: number }).matched === 0);
			const teams = new Set(none.map(([, i]) => current(states[i])));
			expect(teams).toEqual(new Set([0, 1]));
			for (const [, i] of none) expect(states[i + 1].teams).toEqual(states[i].teams);
		});

		it('redraws the prompt for the same team', () => {
			const [[, i]] = stepsOf('redraw');
			expect(states[i].phase).toBe('prompt');
			expect(states[i + 1].prompt.id).not.toBe(states[i].prompt.id);
			expect(current(states[i + 1])).toBe(current(states[i]));
			expect(states[i + 1].turn).toBe(states[i].turn);
		});

		it('plays 5 rounds with the opener rotating', () => {
			expect(Math.max(...states.slice(0, lastTurn).map((s) => s.round))).toBe(4);
			const openers = [0, 1, 2, 3, 4].map((r) => order(states.find((s) => s.round === r)!)[0]);
			expect(openers[1]).toBe(1 - openers[0]);
			expect(new Set(openers.slice(0, 2)).size).toBe(2);
			for (const r of [0, 1, 2, 3, 4]) {
				const turns = states.filter((s) => s.round === r && s.phase === 'result');
				expect(turns.map(current).sort()).toEqual([0, 1]);
			}
		});

		it('ends with one winning team, then plays again with the same teams', () => {
			const over = states[lastTurn];
			const [a, b] = over.teams.map((t) => t.score);
			expect(a).not.toBe(b);
			expect(a + b).toBeGreaterThan(0);
			const again = states.at(-1)!;
			expect(again.teams.map((t) => t.players.map((p) => p.name))).toEqual(
				over.teams.map((t) => t.players.map((p) => p.name))
			);
			expect(again.teams.map((t) => t.score)).toEqual([0, 0]);
			expect(again.round).toBe(0);
		});

		it('names what two teams of two cannot show', () => {
			expect(demo.steps.some((s) => /2 von 3/.test(s.tip))).toBe(true);
			expect(demo.steps.some((s) => s.tip.includes('Unentschieden'))).toBe(true);
		});

		it('tips are neutral', () => {
			for (const s of demo.steps) {
				expect(s.tip).not.toContain('!');
				expect(s.tip).not.toMatch(/\p{Extended_Pictographic}/u);
			}
		});
	});
});
