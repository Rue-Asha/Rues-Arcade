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
	past: unknown[];
	// rotation index of the named player per team
	cursors: [number, number];
	// face-off answers of the named pair so far, first team's first; null = miss
	answers: (number | null)[];
	// team that won the face-off
	control: number | null;
	// team on the board
	playing: number | null;
	// per board position of the current survey
	revealed: boolean[];
	strikes: number;
}

export type FeudAction =
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

export function survey(s: FeudState): Survey {
	return s.config.surveys[s.round] ?? s.config.tiebreak;
}

// the team that answers first in this round's face-off
export function opener(s: FeudState): number {
	return s.round % 2;
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

function reveal(s: FeudState, tile: number): boolean[] {
	return s.revealed.map((r, i) => r || i === tile);
}

const hidden = (s: FeudState, tile: number) => s.revealed[tile] === false;

function fresh(s: FeudState, round: number): FeudState {
	const next = { ...s, round };
	return {
		...next,
		phase: 'faceoff',
		cursors: advance(s),
		answers: [],
		control: null,
		playing: null,
		revealed: survey(next).answers.map(() => false),
		strikes: 0
	};
}

function answer(s: FeudState, tile: number | null): FeudState {
	if (tile !== null && !hidden(s, tile)) return s;
	const revealed = tile === null ? s.revealed : reveal(s, tile);
	const first = opener(s);
	if (s.answers.length === 0) {
		if (tile === 0) return { ...s, revealed, phase: 'choose', control: first };
		return { ...s, revealed, answers: [tile] };
	}
	const [a] = s.answers;
	if (a === null && tile === null) return { ...s, answers: [], cursors: advance(s) };
	const firstWins = tile === null || (a !== null && a < tile);
	return { ...s, revealed, answers: [a, tile], phase: 'choose', control: firstWins ? first : 1 - first };
}

function close(s: FeudState): FeudState {
	return fresh({ ...s, closed: [...s.closed, survey(s).id] }, s.round + 1);
}

export const feud: GameDef<FeudState, FeudAction, FeudConfig> = {
	slug: 'family-feud',
	name: 'Family Feud',
	colour: 'feud',
	minPlayers: 4,
	maxPlayers: 20,
	minContent: 2,
	contentType: 'feud_surveys',
	stateVersion: 1,
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
			answers: [],
			control: null,
			playing: null,
			revealed: (config.surveys[0] ?? config.tiebreak).answers.map(() => false),
			strikes: 0
		};
	},
	reduce(s, action) {
		switch (action.type) {
			case 'answer':
				return s.phase === 'faceoff' ? answer(s, action.tile) : s;
			case 'play':
			case 'pass':
				if (s.phase !== 'choose') return s;
				return { ...s, phase: 'board', playing: action.type === 'play' ? s.control : 1 - s.control! };
			case 'reveal':
				if (s.phase !== 'board' || !hidden(s, action.tile)) return s;
				return { ...s, revealed: reveal(s, action.tile) };
			case 'strike':
				if (s.phase !== 'board') return s;
				return { ...s, strikes: s.strikes + 1, phase: s.strikes + 1 === STRIKES ? 'steal' : 'board' };
			case 'steal':
				if (s.phase !== 'steal' || (action.tile !== null && !hidden(s, action.tile))) return s;
				return { ...s, phase: 'result', revealed: action.tile === null ? s.revealed : reveal(s, action.tile) };
			case 'next':
				return s.phase === 'result' ? close(s) : s;
		}
		return s;
	},
	phase(state) {
		return state.phase;
	}
};
