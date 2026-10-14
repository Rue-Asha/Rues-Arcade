import { describe, expect, it } from 'vitest';
import { byId } from './characters.ts';
import { F15, F5, seated } from './fixtures.ts';
import { info } from './info.ts';
import { nightSteps } from './night.ts';
import type { CharacterId, ClocktowerState, NightStepKind, Team } from './types.ts';

const stepOf = (state: ClocktowerState, night: number, kind: NightStepKind) => {
	const step = nightSteps(state, night).find((s) => s.kind === kind);
	if (!step) throw new Error(`no ${kind} step`);
	return step;
};

function expectPair(state: ClocktowerState, kind: NightStepKind, team: Team, character?: CharacterId) {
	const step = stepOf(state, 1, kind);
	for (let seed = 1; seed <= 20; seed++) {
		const result = info({ ...state, rng: { state: seed } }, step);
		if (result.kind !== 'pair') throw new Error(`${kind}: ${result.kind}`);
		const [match, other] = result.seats;
		expect(state.seats[match].character).toBe(result.character);
		expect(byId[result.character].team).toBe(team);
		if (character) expect(result.character).toBe(character);
		expect(other).not.toBe(match);
		expect(step.seats).not.toContain(match);
		expect(step.seats).not.toContain(other);
		expect(other).toBeGreaterThanOrEqual(0);
		expect(other).toBeLessThan(state.seats.length);
	}
}

const withDead = (state: ClocktowerState, seats: number[]): ClocktowerState => ({
	...state,
	seats: state.seats.map((s, i) => (seats.includes(i) ? { ...s, alive: false } : s))
});

describe('clocktower true info', () => {
	it('Scenario: Pair info for the first-night Townsfolk', () => {
		const state = seated(['washerwoman', 'librarian', 'investigator', 'chef', 'empath', 'recluse', 'spy', 'imp']);
		expectPair(state, 'washerwoman', 'townsfolk');
		expectPair(state, 'librarian', 'outsider', 'recluse');
		expectPair(state, 'investigator', 'minion', 'spy');

		const noOutsider = seated(['librarian', 'chef', 'empath', 'monk', 'slayer', 'spy', 'imp']);
		expect(info(noOutsider, stepOf(noOutsider, 1, 'librarian'))).toEqual({ kind: 'zero' });

		const drunk = seated(['librarian', 'drunk', 'washerwoman', 'empath', 'investigator', 'mayor', 'spy', 'imp'], { believed: 'monk' });
		expectPair(drunk, 'librarian', 'outsider', 'drunk');
		const result = info(drunk, stepOf(drunk, 1, 'librarian'));
		expect(result.kind === 'pair' && result.seats[0]).toBe(1);
	});

	it('Scenario: Chef counts evil pairs around the circle', () => {
		const state = seated(['spy', 'poisoner', 'imp', 'chef', 'empath', 'monk', 'scarlet-woman']);
		expect(info(state, stepOf(state, 1, 'chef'))).toEqual({ kind: 'number', n: 3 });
	});

	it('Scenario: Empath skips dead neighbours', () => {
		const state = withDead(seated(['chef', 'monk', 'slayer', 'empath', 'soldier', 'imp', 'spy']), [4]);
		expect(info(state, stepOf(state, 2, 'empath'))).toEqual({ kind: 'number', n: 1 });
		const alive = seated(['chef', 'monk', 'slayer', 'empath', 'soldier', 'imp', 'spy']);
		expect(info(alive, stepOf(alive, 1, 'empath'))).toEqual({ kind: 'number', n: 0 });
	});

	it('Scenario: Fortune Teller and Undertaker info', () => {
		const f5 = seated(F5);
		expect(info(f5, stepOf(f5, 1, 'fortune-teller'))).toEqual({ kind: 'demon', seats: [3, 0] });

		const base = seated(['undertaker', 'drunk', 'chef', 'empath', 'washerwoman', 'monk', 'spy', 'imp'], { believed: 'slayer' });
		const executed = { ...withDead(base, [1]), lastExecution: 1 };
		expect(info(executed, stepOf(executed, 2, 'undertaker'))).toEqual({ kind: 'character', character: 'drunk' });
	});

	it('Scenario: Roles without info', () => {
		const f15 = seated(F15);
		for (const kind of ['ravenkeeper', 'spy', 'butler', 'monk', 'poisoner'] as const) {
			expect(info(f15, stepOf(f15, 2, kind)), kind).toEqual({ kind: 'none' });
		}
		expect(info(f15, stepOf(f15, 1, 'minion-info'))).toEqual({ kind: 'none' });
		expect(info(f15, stepOf(f15, 2, 'imp'))).toEqual({ kind: 'none' });
	});

	it('gives a Drunk the true value of the believed role', () => {
		const state = seated(['drunk', 'imp', 'chef', 'washerwoman', 'monk', 'poisoner'], { believed: 'empath' });
		expect(info(state, stepOf(state, 1, 'empath'))).toEqual({ kind: 'number', n: 2 });
	});

	it('names the current Demon after a takeover and keeps the pick stable', () => {
		const f5 = seated(F5);
		const after: ClocktowerState = { ...f5, demon: 2 };
		expect(info(after, stepOf(after, 2, 'fortune-teller'))).toEqual({ kind: 'demon', seats: [2, 0] });
		const state = seated(['washerwoman', 'librarian', 'investigator', 'chef', 'empath', 'recluse', 'spy', 'imp']);
		const step = stepOf(state, 1, 'washerwoman');
		expect(info(state, step)).toEqual(info(state, step));
	});
});
