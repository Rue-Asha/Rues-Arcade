import { pick } from '#lib/engine/rng.ts';
import type { GameDef } from '#lib/engine/types.ts';
import { byId } from './characters.ts';
import { believable, drawBluffs, fill, herringOptions, needsHerring, problems } from './setup.ts';
import { nightScreens, nightSteps } from './night.ts';
import type { ClocktowerAction, ClocktowerState, Seat } from './types.ts';
import { check, living } from './win.ts';

const has = (s: ClocktowerState, seat: number) => Number.isInteger(seat) && seat >= 0 && seat < s.seats.length;

// Picks that no longer hold after a change: a believed role on a seat that isn't the Drunk or that is now in play,
// a red herring without a (believed) Fortune Teller or on a seat that isn't good any more.
function tidy(s: ClocktowerState): ClocktowerState {
	let seats = s.seats.map((seat) => (seat.believed && seat.character !== 'drunk' ? { ...seat, believed: null } : seat));
	const free = believable(seats);
	seats = seats.map((seat) => (seat.believed && !free.includes(seat.believed) ? { ...seat, believed: null } : seat));
	const keep = s.redHerring !== null && needsHerring(seats) && herringOptions(seats).includes(s.redHerring);
	return { ...s, seats, redHerring: keep ? s.redHerring : null };
}

// Seats move with their players, so the red herring follows its player.
function reorder(s: ClocktowerState, order: number[]): ClocktowerState {
	const seats = order.map((i) => s.seats[i]);
	return { ...s, seats, redHerring: s.redHerring === null ? null : order.indexOf(s.redHerring) };
}

function randomFill(s: ClocktowerState, seats: Seat[]): ClocktowerState {
	const [filled, rng] = fill(seats, s.rng);
	if (!filled) return s;
	let next = tidy({ ...s, seats: filled, rng });
	if (needsHerring(next.seats) && next.redHerring === null) {
		const [seat, r] = pick(next.rng, herringOptions(next.seats));
		next = { ...next, redHerring: seat, rng: r };
	}
	return next;
}

function setup(s: ClocktowerState, action: ClocktowerAction): ClocktowerState {
	switch (action.type) {
		case 'swap': {
			const { a, b } = action;
			if (!has(s, a) || !has(s, b) || a === b) return s;
			const order = s.seats.map((_, i) => (i === a ? b : i === b ? a : i));
			return reorder(s, order);
		}
		case 'move': {
			const { from, to } = action;
			if (!has(s, from) || !has(s, to) || from === to) return s;
			const order = s.seats.map((_, i) => i).filter((i) => i !== from);
			order.splice(to, 0, from);
			return reorder(s, order);
		}
		case 'assign': {
			const { seat, character } = action;
			if (!has(s, seat) || s.seats[seat].character === character) return s;
			if (character !== null && s.seats.some((x) => x.character === character)) return s;
			return tidy({ ...s, seats: s.seats.map((x, i) => (i === seat ? { ...x, character } : x)) });
		}
		case 'fill':
			return randomFill(s, s.seats);
		case 'reroll':
			return randomFill({ ...s, redHerring: null }, s.seats.map((x) => ({ ...x, character: null, believed: null })));
		case 'believe': {
			const drunk = s.seats.findIndex((x) => x.character === 'drunk');
			if (drunk < 0) return s;
			const free = believable(s.seats);
			let { character } = action;
			let rng = s.rng;
			if (character === null) [character, rng] = pick(rng, free);
			else if (!free.includes(character)) return s;
			if (s.seats[drunk].believed === character && rng === s.rng) return s;
			return tidy({ ...s, rng, seats: s.seats.map((x, i) => (i === drunk ? { ...x, believed: character } : x)) });
		}
		case 'herring': {
			if (!needsHerring(s.seats)) return s;
			const options = herringOptions(s.seats);
			if (action.seat === null) {
				const [seat, rng] = pick(s.rng, options);
				return { ...s, redHerring: seat, rng };
			}
			if (!options.includes(action.seat) || s.redHerring === action.seat) return s;
			return { ...s, redHerring: action.seat };
		}
		case 'lock': {
			if (problems(s.seats, s.redHerring).length > 0) return s;
			const [bluffs, rng] = drawBluffs(s.seats, s.rng);
			return {
				...s,
				rng,
				bluffs,
				locked: true,
				demon: s.seats.findIndex((x) => x.character === 'imp'),
				phase: { kind: 'reveal', seat: 0, shown: false }
			};
		}
	}
	return s;
}

export function dusk(s: ClocktowerState, number: number): ClocktowerState {
	const steps = nightSteps(s, number);
	return {
		...s,
		phase: { kind: 'night' },
		night: { number, steps, screens: nightScreens(number, steps, s.questions), at: 0, target: null, starpass: null, deaths: [] }
	};
}

function reveal(s: ClocktowerState, action: ClocktowerAction): ClocktowerState {
	if (s.phase.kind !== 'reveal') return s;
	const { seat, shown } = s.phase;
	if (action.type === 'show' && !shown) return { ...s, phase: { kind: 'reveal', seat, shown: true } };
	if (action.type === 'hide' && shown)
		return seat + 1 < s.seats.length ? { ...s, phase: { kind: 'reveal', seat: seat + 1, shown: false } } : dusk(s, 1);
	return s;
}

const over = (s: ClocktowerState): ClocktowerState => ({ ...s, phase: { kind: 'over', revealed: false } });

// Living Minions by true character (never the Recluse); the Scarlet Woman alone while 5 or more are alive.
export function heirs(s: ClocktowerState): number[] {
	const minions = s.seats.flatMap((x, i) => (x.alive && x.character && byId[x.character].team === 'minion' ? [i] : []));
	const sw = minions.find((i) => s.seats[i].character === 'scarlet-woman');
	return sw !== undefined && living(s.seats) >= 5 ? [sw] : minions;
}

function kill(s: ClocktowerState, seats: number[]): ClocktowerState {
	const after = { ...s, seats: s.seats.map((x, i) => (seats.includes(i) ? { ...x, alive: false } : x)) };
	return { ...after, winner: s.winner ?? check(s, after) };
}

function dawn(s: ClocktowerState): ClocktowerState {
	const { number, deaths } = s.night!;
	return {
		...s,
		phase: { kind: 'dawn', screen: 'wake' },
		today: { number, deadline: null, pending: null, nominations: [], high: 0, block: null, executed: null, closed: false, deaths }
	};
}

function night(s: ClocktowerState, action: ClocktowerAction): ClocktowerState {
	const n = s.night!;
	const here = n.screens[n.at];
	const current = 'step' in here ? n.steps[here.step] : null;
	const go = (at: number): ClocktowerState => ({ ...s, night: { ...n, at } });
	switch (action.type) {
		case 'next':
			if (here.screen === 'deaths') return s;
			return n.at + 1 < n.screens.length ? go(n.at + 1) : dawn(s);
		case 'back':
			return n.at > 0 ? go(n.at - 1) : s;
		case 'skip': {
			if (!('step' in here)) return s;
			const to = n.screens.findIndex((x, i) => i > n.at && !('step' in x && x.step === here.step));
			return to < 0 ? dawn(s) : go(to);
		}
		case 'target': {
			const { seat } = action;
			if (current?.kind !== 'imp' || (seat !== null && !(has(s, seat) && s.seats[seat].alive)) || seat === n.target) return s;
			return { ...s, night: { ...n, target: seat } };
		}
		case 'starpass': {
			if (current?.kind !== 'imp' || n.starpass !== null || s.demon === null) return s;
			const from = s.demon;
			const options = heirs(s);
			if (action.seat === null) return options.length ? s : { ...s, night: { ...n, target: from } };
			const to = action.seat;
			if (!options.includes(to)) return s;
			const steps = [...n.steps];
			steps.splice(n.steps.indexOf(current) + 1, 0, { kind: 'new-imp', seats: [to], as: 'imp', note: null });
			const questions = n.screens.flatMap((x) => (x.screen === 'question' ? [x.question] : []));
			return {
				...s,
				seats: s.seats.map((x, i) => (i === to ? { ...x, character: 'imp' } : x)),
				demon: to,
				history: [...s.history, { night: n.number, from, to, was: s.seats[to].character!, kind: 'starpass' }],
				night: { ...n, steps, screens: nightScreens(n.number, steps, questions), target: from, starpass: to }
			};
		}
		case 'bluffs': {
			const [bluffs, rng] = drawBluffs(s.seats, s.rng);
			return { ...s, bluffs, rng };
		}
		case 'deaths': {
			const { seats } = action;
			if (here.screen !== 'deaths' || new Set(seats).size !== seats.length) return s;
			if (!seats.every((i) => has(s, i) && s.seats[i].alive)) return s;
			const after = kill(s, seats);
			return dawn({ ...after, night: { ...n, deaths: [...seats] } });
		}
		case 'declare':
			return over({ ...s, winner: action.winner });
	}
	return s;
}

function daybreak(s: ClocktowerState, action: ClocktowerAction): ClocktowerState {
	if (s.phase.kind !== 'dawn' || action.type !== 'next') return s;
	if (s.phase.screen === 'wake') return { ...s, phase: { kind: 'dawn', screen: 'deaths' } };
	if (s.phase.screen === 'deaths') return s.winner ? over(s) : { ...s, phase: { kind: 'dawn', screen: 'timer' } };
	return s;
}

export const clocktower: GameDef<ClocktowerState, ClocktowerAction, Record<string, never>> = {
	slug: 'clocktower',
	name: 'Blood on the Clocktower',
	colour: 'clocktower',
	minPlayers: 5,
	maxPlayers: 15,
	minContent: 0,
	contentType: 'none',
	stateVersion: 1,
	init: ({ players, seed }) => ({
		rng: { state: seed },
		seats: players.map((player) => ({ player, character: null, believed: null, alive: true, ghostVote: true })),
		locked: false,
		redHerring: null,
		demon: null,
		bluffs: [],
		history: [],
		phase: { kind: 'setup' },
		night: null,
		today: null,
		lastExecution: null,
		questions: [],
		winner: null
	}),
	reduce(s, action) {
		switch (s.phase.kind) {
			case 'setup':
				return s.locked ? s : setup(s, action);
			case 'reveal':
				return reveal(s, action);
			case 'night':
				return night(s, action);
			case 'dawn':
				return daybreak(s, action);
			case 'over':
				return action.type === 'reveal' && !s.phase.revealed ? { ...s, phase: { kind: 'over', revealed: true } } : s;
		}
		return s;
	},
	// one key per screen, so Stage transitions each
	phase(s) {
		const p = s.phase;
		switch (p.kind) {
			case 'setup':
				return 'setup';
			case 'reveal':
				return `reveal-${p.seat}-${p.shown ? 'card' : 'name'}`;
			case 'night':
				return `night-${s.night!.number}-${s.night!.at}`;
			case 'dawn':
			case 'day':
				return `${p.kind}-${s.today!.number}-${p.screen}`;
			case 'over':
				return p.revealed ? 'over-reveal' : 'over';
		}
	}
};
