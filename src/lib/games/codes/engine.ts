import type { ContentItem } from '#lib/content/types.ts';
import { int, pick, type Rng } from '#lib/engine/rng.ts';
import type { GameDef, Player } from '#lib/engine/types.ts';

export interface CodesConfig {
	// player ids per team
	teams: string[][];
	rounds: number;
}

export const MIN_TEAM_SIZE = 2;
export const MIN_TEAMS = 2;
export const MAX_TEAMS = 5;
export const ROUND_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8];
export const DEFAULT_ROUNDS = 5;
// failed attempts after which the group may give up on the word
export const SKIP_AFTER = 3;

export type CodesPhase = 'reveal' | 'play' | 'result' | 'gameOver';

export interface CodesTeam {
	name: string;
	players: Player[];
	score: number;
}

export interface CodesResult {
	kind: 'guessed' | 'skipped';
	teamIndex: number;
	points: number;
	word: string;
}

export interface CodesState {
	rng: Rng;
	pool: ContentItem[];
	used: number[];
	teams: CodesTeam[];
	rounds: number;
	// one round = one secret word
	roundIndex: number;
	// the team that opened round 0; round r opens at (startTeam + r) mod teams
	startTeam: number;
	teamIndex: number;
	// failed attempts on the current word
	attempt: number;
	word: ContentItem;
	phase: CodesPhase;
	lastResult: CodesResult | null;
}

export type CodesAction =
	| { type: 'redraw' }
	| { type: 'start' }
	| { type: 'guessed' }
	| { type: 'missed' }
	| { type: 'skip' }
	| { type: 'next' }
	| { type: 'rematch' };

export function pointsFor(attempt: number): number {
	if (attempt <= 0) return 3;
	if (attempt === 1) return 2;
	return 1;
}

export function explainer(s: CodesState, team: number): Player {
	const { players } = s.teams[team];
	return players[s.roundIndex % players.length];
}

export function guessers(s: CodesState, team: number): Player[] {
	const e = explainer(s, team);
	return s.teams[team].players.filter((p) => p.id !== e.id);
}

export function opener(s: CodesState): number {
	return (s.startTeam + s.roundIndex) % s.teams.length;
}

// this round's turn order, opener first
export function order(s: CodesState): number[] {
	return s.teams.map((_, k) => (opener(s) + k) % s.teams.length);
}

export function winners(s: CodesState): CodesTeam[] {
	const best = Math.max(...s.teams.map((t) => t.score));
	return s.teams.filter((t) => t.score === best);
}

function draw(s: CodesState): CodesState {
	const available = s.pool.filter((w) => !s.used.includes(w.id));
	const exhausted = available.length === 0;
	const [word, rng] = pick(s.rng, exhausted ? s.pool : available);
	return { ...s, rng, word, used: exhausted ? [word.id] : [...s.used, word.id] };
}

// the rejected word goes back into the pool; the archive kept it marked used
function redraw(s: CodesState): CodesState {
	if (s.pool.length < 2) return s;
	const rejected = s.word.id;
	const used = s.used.filter((id) => id !== rejected);
	const available = s.pool.filter((w) => w.id !== rejected && !used.includes(w.id));
	if (available.length > 0) {
		const [word, rng] = pick(s.rng, available);
		return { ...s, rng, word, used: [...used, word.id] };
	}
	const [word, rng] = pick(s.rng, s.pool.filter((w) => w.id !== rejected));
	return { ...s, rng, word, used: [word.id] };
}

function newRound(s: CodesState): CodesState {
	const next = draw(s);
	return { ...next, teamIndex: opener(next), attempt: 0, lastResult: null, phase: 'reveal' };
}

function newGame(s: CodesState): CodesState {
	const [startTeam, rng] = int(s.rng, 0, s.teams.length - 1);
	return newRound({ ...s, rng, startTeam, roundIndex: 0 });
}

export const codes: GameDef<CodesState, CodesAction, CodesConfig> = {
	slug: 'codes',
	name: 'Codes',
	colour: 'codes',
	minPlayers: 4,
	maxPlayers: 20,
	minContent: 1,
	contentType: 'codes_words',
	stateVersion: 1,
	init({ players, config, content, seed }) {
		const byId = new Map(players.map((p) => [p.id, p]));
		return newGame({
			rng: { state: seed >>> 0 },
			pool: [...content],
			used: [],
			teams: config.teams.map((ids, i) => ({
				name: `Team ${i + 1}`,
				players: ids.map((id) => byId.get(id)!),
				score: 0
			})),
			rounds: config.rounds,
			roundIndex: 0,
			startTeam: 0,
			teamIndex: 0,
			attempt: 0,
			word: content[0],
			phase: 'reveal',
			lastResult: null
		});
	},
	reduce(s, action) {
		switch (action.type) {
			case 'redraw':
				return s.phase === 'reveal' ? redraw(s) : s;
			case 'start':
				return s.phase === 'reveal' ? { ...s, phase: 'play' } : s;
			case 'guessed': {
				if (s.phase !== 'play') return s;
				const points = pointsFor(s.attempt);
				const teams = s.teams.map((t, i) => (i === s.teamIndex ? { ...t, score: t.score + points } : t));
				const lastResult: CodesResult = { kind: 'guessed', teamIndex: s.teamIndex, points, word: s.word.a };
				return { ...s, teams, lastResult, phase: 'result' };
			}
			case 'missed':
				if (s.phase !== 'play') return s;
				return { ...s, attempt: s.attempt + 1, teamIndex: (s.teamIndex + 1) % s.teams.length };
			case 'skip':
				if (s.phase !== 'play' || s.attempt < SKIP_AFTER) return s;
				return {
					...s,
					lastResult: { kind: 'skipped', teamIndex: s.teamIndex, points: 0, word: s.word.a },
					phase: 'result'
				};
			case 'next': {
				if (s.phase !== 'result') return s;
				const roundIndex = s.roundIndex + 1;
				if (roundIndex >= s.rounds) return { ...s, roundIndex, phase: 'gameOver' };
				return newRound({ ...s, roundIndex });
			}
			case 'rematch':
				if (s.phase !== 'gameOver') return s;
				return newGame({ ...s, teams: s.teams.map((t) => ({ ...t, score: 0 })) });
		}
		return s;
	},
	phase(s) {
		return s.phase;
	}
};
