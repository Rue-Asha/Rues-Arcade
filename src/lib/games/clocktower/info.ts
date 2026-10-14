import { pick } from '#lib/engine/rng.ts';
import { alignment, byId } from './characters.ts';
import type { ClocktowerState, Info, NightStep, Team } from './types.ts';

const pairs: Partial<Record<NightStep['kind'], Team>> = { washerwoman: 'townsfolk', librarian: 'outsider', investigator: 'minion' };

const evil = (state: ClocktowerState, i: number) => {
	const c = state.seats[i].character;
	return c !== null && alignment(c) === 'evil';
};

// Picks from the state's rng without advancing it, so the suggestion stays the same on every render.
function choose(state: ClocktowerState, salt: number, list: number[]): number {
	return pick({ state: (state.rng.state + salt * 7919) >>> 0 }, list)[0];
}

// True values by the characters' real teams: Spy, Recluse, poison and the Drunk are the storyteller's call.
export function info(state: ClocktowerState, step: NightStep): Info {
	const { seats } = state;
	const self = step.seats[0];
	const team = pairs[step.kind];
	if (team) {
		const matches = seats.flatMap((s, i) => (i !== self && s.character && byId[s.character].team === team ? [i] : []));
		if (matches.length === 0) return team === 'outsider' ? { kind: 'zero' } : { kind: 'none' };
		const match = choose(state, 1 + self, matches);
		const others = seats.flatMap((_, i) => (i !== self && i !== match ? [i] : []));
		return { kind: 'pair', seats: [match, choose(state, 2 + self, others)], character: seats[match].character! };
	}
	switch (step.kind) {
		case 'chef':
			return { kind: 'number', n: seats.filter((_, i) => evil(state, i) && evil(state, (i + 1) % seats.length)).length };
		case 'empath': {
			const n = seats.length;
			const alive = (dir: number) => {
				for (let k = 1; k < n; k++) {
					const i = (self + dir * k + n) % n;
					if (seats[i].alive) return i;
				}
				return self;
			};
			const neighbours = new Set([alive(-1), alive(1)].filter((i) => i !== self));
			return { kind: 'number', n: [...neighbours].filter((i) => evil(state, i)).length };
		}
		case 'fortune-teller':
			return { kind: 'demon', seats: [state.demon, state.redHerring].filter((i): i is number => i !== null) };
		case 'undertaker': {
			const executed = state.lastExecution === null ? null : seats[state.lastExecution].character;
			return executed ? { kind: 'character', character: executed } : { kind: 'none' };
		}
	}
	return { kind: 'none' };
}
