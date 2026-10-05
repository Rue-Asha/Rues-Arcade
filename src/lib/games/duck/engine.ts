import type { ContentItem } from '#lib/content/types.ts';
import { int, pick, type Rng } from '#lib/engine/rng.ts';
import type { GameDef, Player } from '#lib/engine/types.ts';

export interface DuckConfig {
	target: 10 | 20 | 30 | 40 | 50;
}

export const TARGET_OPTIONS: DuckConfig['target'][] = [10, 20, 30, 40, 50];
export const DEFAULT_TARGET: DuckConfig['target'] = 10;

// lives are the five letters of DUCKY
export const LETTERS = ['D', 'U', 'C', 'K', 'Y'] as const;
export const MAX_LIVES = LETTERS.length;

export type DuckPhase = 'reveal' | 'scoring' | 'standings' | 'gameOver';

export type EndReason = 'target' | 'lives';

export interface DuckState {
	rng: Rng;
	players: Player[];
	phase: DuckPhase;
	target: number;
	pool: ContentItem[];
	used: number[];
	word: ContentItem;
	// the word is drawn hidden; "Wort aufdecken" shows it to everyone
	shown: boolean;
	scores: number[];
	lives: number[];
	// scores and lives at the start of the current word: what came before is locked in
	baseScores: number[];
	baseLives: number[];
	// index into players
	chuck: number;
	endReason: EndReason | null;
	winners: number[];
}

export type DuckAction =
	| { type: 'show' }
	| { type: 'play' }
	| { type: 'skip' }
	// box counts from 1
	| { type: 'score'; player: number; box: number }
	// letter counts from 0 (D)
	| { type: 'letter'; player: number; letter: number }
	| { type: 'commit' }
	| { type: 'next' }
	| { type: 'restart' };

// target names the reason when both happen at once
export function checkWin(
	scores: number[],
	lives: number[],
	target: number
): { reason: EndReason; winners: number[] } | null {
	const reached = scores.some((s) => s >= target);
	if (!reached && !lives.some((l) => l <= 0)) return null;
	const best = Math.max(...scores);
	return { reason: reached ? 'target' : 'lives', winners: scores.flatMap((s, i) => (s === best ? [i] : [])) };
}

// players on the same score share a rank, the next rank skips past them
export function rankOf(scores: number[], i: number): number {
	return 1 + scores.filter((s) => s > scores[i]).length;
}

function draw(s: DuckState, avoid?: number): DuckState {
	const available = s.pool.filter((w) => !s.used.includes(w.id));
	const exhausted = available.length === 0;
	// a skip on an exhausted pool must still change the word
	const from = !exhausted
		? available
		: s.pool.length > 1 && avoid !== undefined
			? s.pool.filter((w) => w.id !== avoid)
			: s.pool;
	const [word, rng] = pick(s.rng, from);
	return { ...s, rng, word, shown: false, used: exhausted ? [word.id] : [...s.used, word.id] };
}

function newWord(s: DuckState): DuckState {
	return { ...draw(s), phase: 'reveal', baseScores: s.scores, baseLives: s.lives };
}

function newGame(s: DuckState): DuckState {
	const [chuck, rng] = int(s.rng, 0, s.players.length - 1);
	return newWord({
		...s,
		rng,
		chuck,
		used: [],
		scores: s.players.map(() => 0),
		lives: s.players.map(() => MAX_LIVES),
		endReason: null,
		winners: []
	});
}

const set = (list: number[], i: number, v: number) => list.map((x, j) => (j === i ? v : x));

export const duck: GameDef<DuckState, DuckAction, DuckConfig> = {
	slug: 'duck',
	name: 'What Rhymes with Duck',
	colour: 'duck',
	minPlayers: 4,
	maxPlayers: 16,
	minContent: 1,
	contentType: 'duck_words',
	stateVersion: 1,
	init({ players, config, content, seed }) {
		return newGame({
			rng: { state: seed >>> 0 },
			players,
			phase: 'reveal',
			target: config.target,
			pool: [...content],
			used: [],
			word: content[0],
			shown: false,
			scores: [],
			lives: [],
			baseScores: [],
			baseLives: [],
			chuck: 0,
			endReason: null,
			winners: []
		});
	},
	reduce(s, action) {
		switch (action.type) {
			case 'show':
				return s.phase === 'reveal' && !s.shown ? { ...s, shown: true } : s;
			case 'play':
				return s.phase === 'reveal' && s.shown ? { ...s, phase: 'scoring' } : s;
			case 'skip':
				return s.phase === 'reveal' ? draw(s, s.word.id) : s;
			case 'score': {
				const { player: i, box: k } = action;
				if (s.phase !== 'scoring' || k <= s.baseScores[i] || k > s.target) return s;
				return { ...s, scores: set(s.scores, i, Math.max(s.baseScores[i], s.scores[i] === k ? k - 1 : k)) };
			}
			case 'letter': {
				const { player: i, letter: j } = action;
				if (s.phase !== 'scoring' || j >= s.baseLives[i]) return s;
				return { ...s, lives: set(s.lives, i, Math.min(s.baseLives[i], j < s.lives[i] ? j : j + 1)) };
			}
			case 'commit': {
				if (s.phase !== 'scoring') return s;
				const over = checkWin(s.scores, s.lives, s.target);
				if (over) return { ...s, phase: 'gameOver', endReason: over.reason, winners: over.winners };
				return { ...s, phase: 'standings', chuck: (s.chuck + 1) % s.players.length };
			}
			case 'next':
				return s.phase === 'standings' ? newWord(s) : s;
			case 'restart':
				return s.phase === 'gameOver' ? newGame(s) : s;
		}
		return s;
	},
	phase(s) {
		return s.phase;
	}
};
