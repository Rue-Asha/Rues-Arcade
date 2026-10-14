import { drawBluffs, herringOptions, needsHerring } from './setup.ts';
import type { CharacterId, ClocktowerState, Seat } from './types.ts';

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
