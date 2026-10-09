import { describe, expect, it } from 'vitest';
import { demo } from './demo.ts';
import { imposter, type ImposterState } from './engine.ts';

function walk() {
	const players = demo.players.map((name) => ({ id: name, name }));
	let state = imposter.init({ players, config: demo.config, content: demo.content, seed: demo.seed });
	const states = [state];
	for (const step of demo.steps) {
		state = imposter.reduce(state, step.action);
		states.push(state);
	}
	return states;
}

const states = walk();
const at = (type: string) =>
	demo.steps.map((s, i) => [s, i] as const).filter(([s]) => s.action.type === type);

describe('imposter demo', () => {
	it('Scenario: Imposter demo script plays to the end', () => {
		expect(walk()).toEqual(states);
		states.slice(1).forEach((s, i) => expect(s, `step ${i + 1}`).not.toEqual(states[i]));
		expect(states.at(-1)!.phase).toBe('handover');
		expect(states.at(-1)!.round).toBe(2);
	});

	it('Regression: Imposter demo plays one round and stops at the next-round step', () => {
		expect(demo.steps).toHaveLength(16);
		expect(demo.steps.at(-1)!.action.type).toBe('nextRound');
		expect(at('reveal').filter(([, i]) => states[i].phase === 'unmask')).toHaveLength(1);
		expect(at('unmask')).toHaveLength(1);
		expect(states.slice(0, -1).every((s) => s.round === 1)).toBe(true);
		expect(demo.steps.at(-1)!.tip).toContain('Spiel beenden');
	});

	describe('Scenario: Imposter demo covers every outcome branch', () => {
		it('skips mid-reveal: new pair, reveal restarts, same imposter', () => {
			const [[, i]] = at('skip');
			const before = states[i];
			const after = states[i + 1];
			expect(before.revealIndex).toBeGreaterThan(0);
			expect(after.pairId).not.toBe(before.pairId);
			expect(after.revealIndex).toBe(0);
			expect(after.phase).toBe('handover');
			expect(after.imposterIndex).toBe(before.imposterIndex);
		});

		it('reveals the crew question and the imposter in the round', () => {
			const inRound = states.filter((s) => s.round === 1);
			expect(inRound.some((s) => s.phase === 'crew' && !s.shown)).toBe(true);
			expect(inRound.some((s) => s.phase === 'crew' && s.shown)).toBe(true);
			expect(inRound.some((s) => s.phase === 'unmask' && !s.shown)).toBe(true);
			expect(inRound.some((s) => s.phase === 'unmask' && s.shown)).toBe(true);
			expect(inRound.some((s) => s.phase === 'handover' && s.revealIndex === 3)).toBe(true);
		});

		it('ends on the next-round step with a new deal', () => {
			const [[, i]] = at('nextRound');
			expect(states[i + 1].round).toBe(states[i].round + 1);
			expect(states[i + 1].phase).toBe('handover');
			expect(states[i + 1].revealIndex).toBe(0);
			expect(states[i + 1].pairId).not.toBe(states[i].pairId);
			expect(states[i + 1].rng).not.toEqual(states[i].rng);
			const reseeded = Array.from({ length: 20 }, (_, k) =>
				imposter.reduce({ ...states[i], rng: { state: k } }, demo.steps[i].action).imposterIndex
			);
			expect(new Set(reseeded).size).toBeGreaterThan(1);
			expect(i).toBe(demo.steps.length - 1);
		});

		it('narrates the caught imposter and that rounds go on', () => {
			const reveals = at('reveal').filter(([, i]) => states[i].phase === 'unmask');
			expect(reveals).toHaveLength(1);
			const [[step, i]] = reveals;
			expect(step.tip).toContain((states[i + 1] as ImposterState).players[states[i + 1].imposterIndex].name);
			expect(step.tip).toContain('gefunden');
			expect(demo.steps.some((s) => s.tip.includes('Spiel beenden'))).toBe(true);
		});

		it('tips are neutral', () => {
			for (const s of demo.steps) {
				expect(s.tip).not.toBe('');
				expect(s.tip).not.toContain('!');
				expect(s.tip).not.toMatch(/\p{Extended_Pictographic}/u);
			}
		});
	});
});
