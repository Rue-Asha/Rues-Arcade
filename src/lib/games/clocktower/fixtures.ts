import { clocktower } from './engine.ts';
import { drawBluffs, herringOptions, needsHerring } from './setup.ts';
import type { CharacterId, ClocktowerAction, ClocktowerState, Seat } from './types.ts';

const NAMES = ['Alex', 'Bo', 'Cleo', 'Dani', 'Eli', 'Fey', 'Gus', 'Hana', 'Ida', 'Jo', 'Kai', 'Lu', 'Mo', 'Nia', 'Ole'];

export const F5: CharacterId[] = ['washerwoman', 'empath', 'poisoner', 'imp', 'fortune-teller'];
export const F7: CharacterId[] = ['chef', 'investigator', 'monk', 'ravenkeeper', 'slayer', 'spy', 'imp'];
export const F15: CharacterId[] = [
	'washerwoman', 'librarian', 'investigator', 'chef', 'empath', 'fortune-teller', 'undertaker', 'monk', 'ravenkeeper',
	'butler', 'saint', 'poisoner', 'spy', 'scarlet-woman', 'imp'
];

// design.md: F5's red herring sits on seat 1, F15's on seat 8
const HERRINGS = new Map<CharacterId[], number>([
	[F5, 0],
	[F15, 7]
]);

// A locked state built directly (no reducer), at the reveal of seat 1.
export function seated(characters: CharacterId[], opts: { believed?: CharacterId; redHerring?: number; seed?: number } = {}): ClocktowerState {
	const seats: Seat[] = characters.map((character, i) => ({
		player: { id: NAMES[i].toLowerCase(), name: NAMES[i] },
		character,
		believed: character === 'drunk' ? (opts.believed ?? null) : null,
		alive: true,
		ghostVote: true
	}));
	const redHerring = opts.redHerring ?? HERRINGS.get(characters) ?? (needsHerring(seats) ? herringOptions(seats)[0] : null);
	const [bluffs, rng] = drawBluffs(seats, { state: opts.seed ?? 1 });
	return {
		rng,
		seats,
		locked: true,
		redHerring,
		demon: characters.includes('imp') ? characters.indexOf('imp') : null,
		bluffs,
		history: [],
		phase: { kind: 'reveal', seat: 0, shown: false },
		night: null,
		today: null,
		lastExecution: null,
		questions: [],
		winner: null
	};
}

export const step = (s: ClocktowerState, ...actions: ClocktowerAction[]) => actions.reduce((acc, a) => clocktower.reduce(acc, a), s);

export const dead = (s: ClocktowerState, ...seats: number[]): ClocktowerState => ({
	...s,
	seats: s.seats.map((seat, i) => (seats.includes(i) ? { ...seat, alive: false } : seat))
});

// From the reveal of seat 1: every card shown and hidden, night 1 tapped through, dawn without a timer.
export function firstDay(s: ClocktowerState): ClocktowerState {
	const n1 = step(s, ...s.seats.flatMap((): ClocktowerAction[] => [{ type: 'show' }, { type: 'hide' }]));
	const steps = n1.night!.screens.map((): ClocktowerAction => ({ type: 'next' }));
	return step(n1, ...steps, { type: 'next' }, { type: 'next' }, { type: 'timer', minutes: null, now: 0 });
}

// From the day grimoire: the nomination voted with `votes`, confirmed, and back on the grimoire.
export function voted(s: ClocktowerState, nominee: number, nominator: number, votes: number): ClocktowerState {
	return step(
		s,
		{ type: 'nominee', seat: nominee },
		{ type: 'nominate', nominator },
		{ type: 'vote' },
		{ type: 'swept' },
		{ type: 'count', votes },
		{ type: 'confirm' },
		{ type: 'next' }
	);
}
