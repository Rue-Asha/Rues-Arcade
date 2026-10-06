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
		expect(states.at(-1)!.phase).toBe('unmask');
		expect(states.at(-1)!.shown).toBe(true);
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

		it('reveals the crew question and the imposter in each round', () => {
			const rounds = [1, 2];
			for (const round of rounds) {
				const inRound = states.filter((s) => s.round === round);
				expect(inRound.some((s) => s.phase === 'crew' && !s.shown)).toBe(true);
				expect(inRound.some((s) => s.phase === 'crew' && s.shown)).toBe(true);
				expect(inRound.some((s) => s.phase === 'unmask' && !s.shown)).toBe(true);
				expect(inRound.some((s) => s.phase === 'unmask' && s.shown)).toBe(true);
				const last = inRound.filter((s) => s.phase === 'handover' && s.revealIndex === 3);
				expect(last.length).toBeGreaterThan(0);
			}
		});

		it('plays a second round with a new deal where everyone reads again', () => {
			const [[, i]] = at('nextRound');
			expect(states[i + 1].round).toBe(states[i].round + 1);
			expect(states[i + 1].phase).toBe('handover');
			expect(states[i + 1].revealIndex).toBe(0);
			expect(states.at(-1)!.round).toBe(2);
			const after = demo.steps.slice(i + 1).filter((s) => s.action.type === 'seen');
			expect(after).toHaveLength(demo.players.length);
		});

		it('narrates one caught and one uncaught imposter and that rounds go on', () => {
			const reveals = at('reveal').filter(([, i]) => states[i].phase === 'unmask');
			expect(reveals).toHaveLength(2);
			reveals.forEach(([step, i]) => {
				const name = (states[i + 1] as ImposterState).players[states[i + 1].imposterIndex].name;
				expect(step.tip).toContain(name);
			});
			expect(reveals[0][0].tip).toContain('gefunden');
			expect(reveals[1][0].tip).toContain('durchgekommen');
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
