import { board } from '#lib/content/survey.ts';
import type { Survey } from '#lib/content/types.ts';
import type { Rng } from '#lib/engine/rng.ts';
import type { GameDef } from '#lib/engine/types.ts';

// players are Player ids in rotation order
export interface FeudTeam {
	name: string;
	players: string[];
}

export interface FeudConfig {
	teams: [FeudTeam, FeudTeam];
	// one per round in play order, 1–8 (copies)
	surveys: Survey[];
	// not one of `surveys` (copy)
	tiebreak: Survey;
	// players.id of every player of the game; [] in the demo
	saved: number[];
}

export type FeudPhase = 'faceoff' | 'choose' | 'board' | 'steal' | 'result' | 'gameOver';

export interface FeudState {
	rng: Rng;
	config: FeudConfig;
	phase: FeudPhase;
	// 0-based; === surveys.length in sudden death
	round: number;
	scores: [number, number];
	// survey ids of rounds closed by `next`, sudden death included
	closed: number[];
	// undo stack of the current round
	past: FeudSnapshot[];
	// rotation index of the named player per team
	cursors: [number, number];
	// the question is uncovered
	asked: boolean;
	// team that buzzed first and answers first in the face-off; null = not chosen yet
	first: number | null;
	// face-off answers of the named pair so far, first team's first; null = miss
	answers: (number | null)[];
	// team that won the face-off
	control: number | null;
	// team on the board
	playing: number | null;
	// per board position of the current survey
	revealed: boolean[];
	strikes: number;
	// what the round's result adds, multiplier applied
	gain: FeudGain | null;
	// set on game over
	winner: number | null;
}

// the fields an action within a round can change
export type FeudSnapshot = Omit<FeudState, 'rng' | 'config' | 'round' | 'closed' | 'past'>;

export interface FeudGain {
	team: number;
	points: number;
	stolen: boolean;
}

export type FeudAction =
	| { type: 'ask' }
	| { type: 'buzz'; team: number }
	// face-off, for the player due; null = Nicht auf der Tafel
	| { type: 'answer'; tile: number | null }
	| { type: 'play' }
	| { type: 'pass' }
	| { type: 'reveal'; tile: number }
	| { type: 'strike' }
	// null = miss
	| { type: 'steal'; tile: number | null }
	| { type: 'next' }
	| { type: 'undo' };

export const STRIKES = 3;

export function suddenDeath(s: FeudState): boolean {
	return s.round === s.config.surveys.length;
}

export function survey(s: FeudState): Survey {
	return s.config.surveys[s.round] ?? s.config.tiebreak;
}

// the team that answers first in this round's face-off; meaningful once `first` is set
export function opener(s: FeudState): number {
	return s.first ?? 0;
}

// the team whose named player answers next in the face-off
export function due(s: FeudState): number {
	return s.answers.length === 0 ? opener(s) : 1 - opener(s);
}

// Player ids of the named pair, team 0 first
export function named(s: FeudState): [string, string] {
	const [a, b] = s.config.teams;
	return [a.players[s.cursors[0]], b.players[s.cursors[1]]];
}

function advance(s: FeudState): [number, number] {
	const [a, b] = s.config.teams;
	return [(s.cursors[0] + 1) % a.players.length, (s.cursors[1] + 1) % b.players.length];
}

const hidden = (s: FeudState, tile: number) => s.revealed[tile] === false;

function reveal(s: FeudState, tile: number): boolean[] {
	return s.revealed.map((r, i) => r || i === tile);
}

// sum of all revealed answers, face-off answers included
export function pot(s: FeudState): number {
	const tiles = board(survey(s));
	return s.revealed.reduce((sum, r, i) => (r ? sum + tiles[i].points : sum), 0);
}

// only the last round counts double; it is known from its face-off on
export function multiplier(s: FeudState): number {
	return s.round === s.config.surveys.length - 1 ? 2 : 1;
}

function bank(s: FeudState, team: number, stolen = false): FeudState {
	const points = pot(s) * multiplier(s);
	const scores: [number, number] = [s.scores[0], s.scores[1]];
	scores[team] += points;
	return { ...s, phase: 'result', scores, gain: { team, points, stolen } };
}

// the cue is for the move that banks a pot, not for a result that is mounted again or has nothing to bank
export function banks(before: FeudState, after: FeudState): boolean {
	return before.phase !== 'result' && after.phase === 'result' && after.gain!.points > 0;
}

function fresh(s: FeudState, round: number): FeudState {
	const next = { ...s, round };
	return {
		...next,
		phase: 'faceoff',
		cursors: advance(s),
		asked: false,
		first: null,
		answers: [],
		control: null,
		playing: null,
		revealed: survey(next).answers.map(() => false),
		strikes: 0,
		gain: null,
		winner: null
	};
}

// in sudden death the face-off decides the game, so its result carries no points
function won(s: FeudState, team: number): FeudState {
	if (suddenDeath(s)) return { ...s, phase: 'result', control: team, gain: { team, points: 0, stolen: false } };
	return { ...s, phase: 'choose', control: team };
}

function answer(s: FeudState, tile: number | null): FeudState {
	if (tile !== null && !hidden(s, tile)) return s;
	const revealed = tile === null ? s.revealed : reveal(s, tile);
	const first = opener(s);
	if (s.answers.length === 0) {
		if (tile === 0) return won({ ...s, revealed, answers: [tile] }, first);
		return { ...s, revealed, answers: [tile] };
	}
	const [a] = s.answers;
	if (a === null && tile === null) return { ...s, answers: [], cursors: advance(s) };
	const firstWins = tile === null || (a !== null && a < tile);
	return won({ ...s, revealed, answers: [a, tile] }, firstWins ? first : 1 - first);
}

function close(s: FeudState): FeudState {
	const next = { ...s, closed: [...s.closed, survey(s).id] };
	if (suddenDeath(s)) return { ...next, phase: 'gameOver', winner: s.gain!.team };
	if (s.round + 1 < s.config.surveys.length) return fresh(next, s.round + 1);
	const [a, b] = s.scores;
	if (a === b) return fresh(next, s.round + 1);
	return { ...next, phase: 'gameOver', winner: a > b ? 0 : 1 };
}

export function canUndo(s: FeudState): boolean {
	return s.past.length > 0;
}

function snapshot(s: FeudState): FeudSnapshot {
	const { phase, scores, cursors, asked, first, answers, control, playing, revealed, strikes, gain, winner } = s;
	return { phase, scores, cursors, asked, first, answers, control, playing, revealed, strikes, gain, winner };
}

function undo(s: FeudState): FeudState {
	if (!canUndo(s)) return s;
	return { ...s, ...s.past.at(-1)!, past: s.past.slice(0, -1) };
}

function act(s: FeudState, action: FeudAction): FeudState {
	switch (action.type) {
		case 'ask':
			return s.phase === 'faceoff' && !s.asked ? { ...s, asked: true } : s;
		case 'buzz':
			if (s.phase !== 'faceoff' || !s.asked || s.first !== null || s.answers.length > 0) return s;
			return action.team === 0 || action.team === 1 ? { ...s, first: action.team } : s;
		case 'answer':
			return s.phase === 'faceoff' && s.asked && s.first !== null ? answer(s, action.tile) : s;
		case 'play':
		case 'pass':
			if (s.phase !== 'choose') return s;
			return { ...s, phase: 'board', playing: action.type === 'play' ? s.control : 1 - s.control! };
		case 'reveal': {
			if (s.phase !== 'board' || !hidden(s, action.tile)) return s;
			const next = { ...s, revealed: reveal(s, action.tile) };
			return next.revealed.every(Boolean) ? bank(next, s.playing!) : next;
		}
		case 'strike':
			if (s.phase !== 'board') return s;
			return { ...s, strikes: s.strikes + 1, phase: s.strikes + 1 === STRIKES ? 'steal' : 'board' };
		case 'steal':
			if (s.phase !== 'steal') return s;
			if (action.tile === null) return bank(s, s.playing!);
			if (!hidden(s, action.tile)) return s;
			return bank({ ...s, revealed: reveal(s, action.tile) }, 1 - s.playing!, true);
	}
	return s;
}

export const feud: GameDef<FeudState, FeudAction, FeudConfig> = {
	slug: 'family-feud',
	name: 'Family Feud',
	colour: 'feud',
	minPlayers: 4,
	maxPlayers: 20,
	minContent: 2,
	contentType: 'feud_surveys',
	stateVersion: 2,
	init({ config, seed }) {
		return {
			rng: { state: seed >>> 0 },
			config,
			phase: 'faceoff',
			round: 0,
			scores: [0, 0],
			closed: [],
			past: [],
			cursors: [0, 0],
			asked: false,
			first: null,
			answers: [],
			control: null,
			playing: null,
			revealed: (config.surveys[0] ?? config.tiebreak).answers.map(() => false),
			strikes: 0,
			gain: null,
			winner: null
		};
	},
	reduce(s, action) {
		if (action.type === 'undo') return undo(s);
		if (action.type === 'next') return s.phase === 'result' ? { ...close(s), past: [] } : s;
		const next = act(s, action);
		return next === s ? s : { ...next, past: [...s.past, snapshot(s)] };
	},
	phase(state) {
		return state.phase;
	}
};
