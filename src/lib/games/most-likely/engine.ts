import type { ContentItem } from '#lib/content/types.ts';
import { int, pick, type Rng } from '#lib/engine/rng.ts';
import type { GameDef, Player } from '#lib/engine/types.ts';

export interface MostLikelyConfig {
	// player ids per team
	teams: string[][];
	rounds: 5 | 10 | 15 | 20;
}

export const ROUND_OPTIONS: MostLikelyConfig['rounds'][] = [5, 10, 15, 20];
export const DEFAULT_ROUNDS: MostLikelyConfig['rounds'] = 10;
export const MIN_TEAM_SIZE = 2;
export const MIN_TEAMS = 2;
export const MAX_TEAMS = 8;

export function maxTeams(players: number): number {
	return Math.min(MAX_TEAMS, Math.floor(players / MIN_TEAM_SIZE));
}

export function dealTeams<T>(players: T[], count: number): T[][] {
	return Array.from({ length: count }, (_, t) => players.filter((_, i) => i % count === t));
}

// how many of the team pointed at the same person: nobody (0) or a group of 2 up to the whole team
export function choices(teamSize: number): number[] {
	return [0, ...Array.from({ length: teamSize - 1 }, (_, i) => i + 2)];
}

export type MostLikelyPhase = 'prompt' | 'count' | 'result' | 'gameOver';

export interface MostLikelyTeam {
	name: string;
	players: Player[];
	score: number;
}

export interface MostLikelyState {
	rng: Rng;
	pool: ContentItem[];
	used: number[];
	teams: MostLikelyTeam[];
	rounds: number;
	round: number;
	// the team that opened round 0; round r opens at (startTeam + r) mod teams
	startTeam: number;
	// position in this round's order
	turn: number;
	prompt: ContentItem;
	phase: MostLikelyPhase;
	lastPoints: number | null;
}

export type MostLikelyAction =
	| { type: 'redraw' }
	| { type: 'point' }
	| { type: 'score'; matched: number }
	| { type: 'next' }
	| { type: 'rematch' };

// this round's turn order, opener first
export function order(s: MostLikelyState): number[] {
	return s.teams.map((_, k) => (s.startTeam + s.round + k) % s.teams.length);
}

export function current(s: MostLikelyState): number {
	return order(s)[s.turn];
}

export function ranking(s: MostLikelyState): { team: MostLikelyTeam; rank: number }[] {
	const rows = [...s.teams].sort((a, b) => b.score - a.score);
	return rows.map((team) => ({ team, rank: rows.findIndex((o) => o.score === team.score) + 1 }));
}

export function leaders(s: MostLikelyState): MostLikelyTeam[] {
	const best = Math.max(...s.teams.map((t) => t.score));
	return s.teams.filter((t) => t.score === best);
}

function draw(s: MostLikelyState): MostLikelyState {
	const available = s.pool.filter((p) => !s.used.includes(p.id));
	const exhausted = available.length === 0;
	const [prompt, rng] = pick(s.rng, exhausted ? s.pool : available);
	return { ...s, rng, prompt, used: exhausted ? [prompt.id] : [...s.used, prompt.id] };
}

// the rejected prompt goes back into the pool
function redraw(s: MostLikelyState): MostLikelyState {
	if (s.pool.length < 2) return s;
	const rejected = s.prompt.id;
	const used = s.used.filter((id) => id !== rejected);
	const available = s.pool.filter((p) => p.id !== rejected && !used.includes(p.id));
	if (available.length > 0) {
		const [prompt, rng] = pick(s.rng, available);
		return { ...s, rng, prompt, used: [...used, prompt.id] };
	}
	const [prompt, rng] = pick(s.rng, s.pool.filter((p) => p.id !== rejected));
	return { ...s, rng, prompt, used: [prompt.id] };
}

function newTurn(s: MostLikelyState): MostLikelyState {
	return { ...draw(s), lastPoints: null, phase: 'prompt' };
}

function newGame(s: MostLikelyState): MostLikelyState {
	const [startTeam, rng] = int(s.rng, 0, s.teams.length - 1);
	return newTurn({ ...s, rng, startTeam, round: 0, turn: 0 });
}

export const mostLikely: GameDef<MostLikelyState, MostLikelyAction, MostLikelyConfig> = {
	slug: 'most-likely',
	name: 'Most Likely To',
	colour: 'most-likely',
	minPlayers: 4,
	maxPlayers: 20,
	minContent: 1,
	contentType: 'most_likely_prompts',
	stateVersion: 2,
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
			round: 0,
			startTeam: 0,
			turn: 0,
			prompt: content[0],
			phase: 'prompt',
			lastPoints: null
		});
	},
	reduce(s, action) {
		switch (action.type) {
			case 'redraw':
				return s.phase === 'prompt' ? redraw(s) : s;
			case 'point':
				return s.phase === 'prompt' ? { ...s, phase: 'count' } : s;
			case 'score': {
				if (s.phase !== 'count') return s;
				const team = current(s);
				if (!choices(s.teams[team].players.length).includes(action.matched)) return s;
				const teams = s.teams.map((t, i) => (i === team ? { ...t, score: t.score + action.matched } : t));
				return { ...s, teams, lastPoints: action.matched, phase: 'result' };
			}
			case 'next':
				if (s.phase !== 'result') return s;
				if (s.turn + 1 < s.teams.length) return newTurn({ ...s, turn: s.turn + 1 });
				if (s.round + 1 >= s.rounds) return { ...s, phase: 'gameOver' };
				return newTurn({ ...s, round: s.round + 1, turn: 0 });
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
