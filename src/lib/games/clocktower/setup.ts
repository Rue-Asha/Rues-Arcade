import { pick, shuffle, type Rng } from '#lib/engine/rng.ts';
import { alignment, byId, characters } from './characters.ts';
import type { CharacterId, Seat, Team, TeamCounts } from './types.ts';

const TEAMS: Team[] = ['townsfolk', 'outsider', 'minion', 'demon'];

// research/rules.md §1, index = count − 5
const TABLE: [number, number, number][] = [
	[3, 0, 1],
	[3, 1, 1],
	[5, 0, 1],
	[5, 1, 1],
	[5, 2, 1],
	[7, 0, 2],
	[7, 1, 2],
	[7, 2, 2],
	[9, 0, 3],
	[9, 1, 3],
	[9, 2, 3]
];

const plural: Record<Team, string> = { townsfolk: 'Townsfolk', outsider: 'Outsider', minion: 'Minions', demon: 'Dämonen' };

export function required(count: number, baron: boolean): TeamCounts {
	const [townsfolk, outsider, minion] = TABLE[count - 5];
	const shift = baron ? 2 : 0;
	return { townsfolk: townsfolk - shift, outsider: outsider + shift, minion, demon: 1 };
}

export function counts(seats: Seat[]): TeamCounts {
	const out: TeamCounts = { townsfolk: 0, outsider: 0, minion: 0, demon: 0 };
	for (const s of seats) if (s.character) out[byId[s.character].team]++;
	return out;
}

const inPlay = (seats: Seat[]) => new Set(seats.flatMap((s) => (s.character ? [s.character] : [])));

const drunkSeat = (seats: Seat[]) => seats.find((s) => s.character === 'drunk');

export function believable(seats: Seat[]): CharacterId[] {
	const taken = inPlay(seats);
	return characters.filter((c) => c.team === 'townsfolk' && !taken.has(c.id)).map((c) => c.id);
}

export function needsHerring(seats: Seat[]): boolean {
	return seats.some((s) => s.character === 'fortune-teller' || (s.character === 'drunk' && s.believed === 'fortune-teller'));
}

export function herringOptions(seats: Seat[]): number[] {
	return seats.flatMap((s, i) => (s.character && alignment(s.character) === 'good' ? [i] : []));
}

export function problems(seats: Seat[], redHerring: number | null): string[] {
	const out: string[] = [];
	const have = counts(seats);
	const req = required(seats.length, inPlay(seats).has('baron'));
	for (const team of TEAMS) if (have[team] > req[team]) out.push(`Diese Verteilung geht nicht auf: zu viele ${plural[team]}.`);
	const seen = new Set<CharacterId>();
	for (const s of seats) {
		if (!s.character) continue;
		if (seen.has(s.character)) out.push(`${byId[s.character].name} ist mehrfach vergeben.`);
		seen.add(s.character);
	}
	const open = seats.filter((s) => !s.character).length;
	if (open === 1) out.push('Ein Platz hat noch keinen Charakter.');
	if (open > 1) out.push(`${open} Plätze haben noch keinen Charakter.`);
	const drunk = drunkSeat(seats);
	if (drunk && !drunk.believed) out.push('Der Drunk braucht eine Rolle, die er zu sein glaubt.');
	if (drunk?.believed && !believable(seats).includes(drunk.believed)) out.push('Die Rolle, die der Drunk zu sein glaubt, ist im Spiel.');
	if (needsHerring(seats) && redHerring === null) out.push('Der Fortune Teller braucht einen Red Herring.');
	if (redHerring !== null && !herringOptions(seats).includes(redHerring)) out.push('Der Red Herring muss eine gute Person sein.');
	return out;
}

// Keeps every assigned character; the Baron is drawn like any Minion, left out when it can't fit and forced when
// only it can absorb the assigned Outsiders. A Drunk without a believed role gets one.
export function fill(seats: Seat[], rng: Rng): [Seat[] | null, Rng] {
	const taken = inPlay(seats);
	const believed = drunkSeat(seats)?.believed ?? null;
	const have = counts(seats);
	const free = (team: Team) => characters.filter((c) => c.team === team && !taken.has(c.id) && c.id !== believed).map((c) => c.id);
	const fits = (baron: boolean) => {
		const req = required(seats.length, baron);
		const extra = baron && !taken.has('baron') ? 1 : 0;
		return TEAMS.every((t) => have[t] + (t === 'minion' ? extra : 0) <= req[t] && free(t).length >= req[t] - have[t]);
	};
	let baron: boolean;
	let minions = free('minion');
	if (taken.has('baron')) {
		if (!fits(true)) return [null, rng];
		baron = true;
	} else {
		const without = fits(false);
		const withBaron = fits(true);
		if (!without && !withBaron) return [null, rng];
		if (!withBaron) minions = minions.filter((id) => id !== 'baron');
		baron = withBaron && !without;
	}

	let r = rng;
	let drawn: CharacterId[] = [];
	const draw = (pool: CharacterId[], n: number) => {
		let mixed: CharacterId[];
		[mixed, r] = shuffle(r, pool);
		drawn = [...drawn, ...mixed.slice(0, n)];
	};
	const slots = required(seats.length, false).minion - have.minion;
	if (baron && !taken.has('baron')) {
		drawn = ['baron'];
		draw(minions.filter((id) => id !== 'baron'), slots - 1);
	} else {
		draw(minions, slots);
	}
	const req = required(seats.length, taken.has('baron') || drawn.includes('baron'));
	draw(free('demon'), req.demon - have.demon);
	draw(free('outsider'), req.outsider - have.outsider);
	draw(free('townsfolk'), req.townsfolk - have.townsfolk);

	[drawn, r] = shuffle(r, drawn);
	let next = 0;
	const out = seats.map((s) => (s.character ? s : { ...s, character: drawn[next++], believed: null }));
	const drunk = out.findIndex((s) => s.character === 'drunk' && !s.believed);
	if (drunk >= 0) {
		let role: CharacterId;
		[role, r] = pick(r, believable(out));
		out[drunk] = { ...out[drunk], believed: role };
	}
	return [out, r];
}

// 2 Townsfolk + 1 Outsider when an Outsider is free, else 3 Townsfolk; never the Drunk's believed role.
export function drawBluffs(seats: Seat[], rng: Rng): [CharacterId[], Rng] {
	const taken = inPlay(seats);
	const believed = drunkSeat(seats)?.believed ?? null;
	const free = (team: Team) => characters.filter((c) => c.team === team && !taken.has(c.id) && c.id !== believed).map((c) => c.id);
	const outsiders = free('outsider');
	const [townsfolk, r] = shuffle(rng, free('townsfolk'));
	if (outsiders.length === 0) return [townsfolk.slice(0, 3), r];
	const [outsider, r2] = pick(r, outsiders);
	return [[townsfolk[0], townsfolk[1], outsider], r2];
}
