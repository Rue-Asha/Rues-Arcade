import { describe, expect, it } from 'vitest';
import { F15, F5, F7, seated } from './fixtures.ts';
import { nightScreens, nightSteps } from './night.ts';
import type { ClocktowerState } from './types.ts';

const kinds = (state: ClocktowerState, night: number) => nightSteps(state, night).map((s) => s.kind);

function screensOf(state: ClocktowerState, night: number) {
	return nightScreens(night, nightSteps(state, night), []).map((s) => s.screen);
}

function dead(state: ClocktowerState, ...seats: number[]): ClocktowerState {
	return { ...state, seats: state.seats.map((s, i) => (seats.includes(i) ? { ...s, alive: false } : s)) };
}

describe('clocktower night order', () => {
	it('Scenario: Night order for 5, 7 and 15 players', () => {
		const f5 = seated(F5);
		const f7 = seated(F7);
		const f15 = seated(F15);
		expect(kinds(f5, 1)).toEqual(['poisoner', 'washerwoman', 'empath', 'fortune-teller']);
		expect(kinds(f5, 2)).toEqual(['poisoner', 'imp', 'empath', 'fortune-teller']);
		expect(kinds(f7, 1)).toEqual(['minion-info', 'demon-info', 'investigator', 'chef', 'spy']);
		expect(kinds(f7, 2)).toEqual(['monk', 'imp', 'ravenkeeper', 'spy']);
		expect(kinds(f15, 1)).toEqual([
			'minion-info', 'demon-info', 'poisoner', 'washerwoman', 'librarian', 'investigator', 'chef', 'empath',
			'fortune-teller', 'butler', 'spy'
		]);
		expect(kinds(f15, 2)).toEqual([
			'poisoner', 'monk', 'imp', 'ravenkeeper', 'empath', 'fortune-teller', 'butler', 'spy'
		]);
		for (const state of [f5, f7, f15]) {
			expect(kinds(state, 1)).not.toContain('imp');
			expect(screensOf(state, 1)).not.toContain('deaths');
			expect(screensOf(state, 2).at(-1)).toBe('deaths');
			expect(screensOf(state, 2).filter((s) => s === 'deaths')).toHaveLength(1);
		}
		const info = nightSteps(f15, 1).slice(0, 2);
		expect(info).toEqual([
			{ kind: 'minion-info', seats: [11, 12, 13], as: null, note: null },
			{ kind: 'demon-info', seats: [14], as: null, note: null }
		]);
		expect(nightSteps(f15, 1)[2]).toEqual({ kind: 'poisoner', seats: [11], as: 'poisoner', note: null });
	});

	it('Scenario: Small games have no evil info', () => {
		const six = seated(['chef', 'empath', 'monk', 'butler', 'poisoner', 'imp']);
		for (const state of [seated(F5), six]) {
			const list = kinds(state, 1);
			expect(list).not.toContain('minion-info');
			expect(list).not.toContain('demon-info');
		}
		expect(kinds(six, 1)).toEqual(['poisoner', 'chef', 'empath', 'butler']);
	});

	it('Scenario: Conditional wakes on other nights', () => {
		const f15 = seated(F15);
		expect(kinds(f15, 2)).not.toContain('undertaker');
		const executed = { ...dead(f15, 10), lastExecution: 10 };
		expect(kinds(executed, 2)).toContain('undertaker');
		expect(kinds(executed, 2).indexOf('undertaker')).toBe(kinds(executed, 2).indexOf('fortune-teller') + 1);
		const raven = nightSteps(f15, 2).find((s) => s.kind === 'ravenkeeper');
		expect(raven).toEqual({ kind: 'ravenkeeper', seats: [8], as: 'ravenkeeper', note: 'nur wenn heute Nacht gestorben' });
		expect(kinds(dead(f15, 7), 2)).not.toContain('monk');
		expect(kinds(dead(f15, 8), 2)).not.toContain('ravenkeeper');
		expect(kinds(f15, 2)).not.toContain('scarlet-woman');
	});

	it('Scenario: Drunk wakes at the believed slot', () => {
		const state = seated(['drunk', 'chef', 'washerwoman', 'monk', 'poisoner', 'imp'], { believed: 'empath' });
		const steps = nightSteps(state, 1);
		expect(steps.map((s) => s.kind)).toEqual(['poisoner', 'washerwoman', 'chef', 'empath']);
		expect(steps[3]).toEqual({ kind: 'empath', seats: [0], as: 'empath', note: null });
		expect(steps.filter((s) => s.kind === 'empath')).toHaveLength(1);
	});

	it('Scenario: New Imp wakes as Imp', () => {
		const f5 = seated(F5);
		const after: ClocktowerState = {
			...f5,
			seats: f5.seats.map((s, i) => (i === 2 ? { ...s, character: 'imp' } : i === 3 ? { ...s, alive: false } : s)),
			demon: 2,
			history: [{ night: 2, from: 3, to: 2, was: 'poisoner', kind: 'starpass' }]
		};
		const steps = nightSteps(after, 3);
		expect(steps.map((s) => s.kind)).toEqual(['imp', 'empath', 'fortune-teller']);
		expect(steps[0]).toEqual({ kind: 'imp', seats: [2], as: 'imp', note: null });
		expect(steps.flatMap((s) => s.seats)).not.toContain(3);
	});

	it('wakes the Scarlet Woman as the Imp on the night of her takeover, then at the Imp slot', () => {
		const f15 = seated(F15);
		const after: ClocktowerState = {
			...f15,
			seats: f15.seats.map((s, i) => (i === 13 ? { ...s, character: 'imp' } : i === 14 ? { ...s, alive: false } : s)),
			demon: 13,
			lastExecution: 14,
			history: [{ night: 3, from: 14, to: 13, was: 'scarlet-woman', kind: 'scarlet-woman' }]
		};
		const steps = nightSteps(after, 3);
		expect(steps.slice(2, 4)).toEqual([
			{ kind: 'scarlet-woman', seats: [13], as: 'imp', note: null },
			{ kind: 'imp', seats: [13], as: 'imp', note: null }
		]);
		expect(kinds(after, 4)).not.toContain('scarlet-woman');
	});

	it('builds dusk, questions, four screens per step and the death step', () => {
		const steps = nightSteps(seated(F5), 2);
		const question = { kind: 'mayor' as const, seat: 1 };
		expect(nightScreens(2, steps.slice(0, 1), [question])).toEqual([
			{ screen: 'dusk' },
			{ screen: 'question', question },
			{ screen: 'wake', step: 0 },
			{ screen: 'card', step: 0 },
			{ screen: 'circle', step: 0 },
			{ screen: 'sleep', step: 0 },
			{ screen: 'deaths' }
		]);
		expect(nightScreens(1, [], [])).toEqual([{ screen: 'dusk' }]);
	});
});
