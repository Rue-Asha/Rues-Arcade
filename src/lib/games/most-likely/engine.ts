import type { ContentItem } from '#lib/content/types.ts';
import { pick, type Rng } from '#lib/engine/rng.ts';
import type { GameDef, Player } from '#lib/engine/types.ts';

export interface MostLikelyConfig {
	rounds: 5 | 10 | 15 | 20;
}

export const ROUND_OPTIONS: MostLikelyConfig['rounds'][] = [5, 10, 15, 20];
export const DEFAULT_ROUNDS: MostLikelyConfig['rounds'] = 10;

export type MostLikelyPhase = 'prompt' | 'pick' | 'reveal' | 'gameOver';

export interface MostLikelyState {
	rng: Rng;
	players: Player[];
	// a = the prompt
	pool: ContentItem[];
	used: number[];
	rounds: number;
	round: number;
	prompt: ContentItem;
	// player indexes the reader tapped; on the reveal they are the round's title holders
	chosen: number[];
	// per player index
	titles: number[];
	phase: MostLikelyPhase;
}

export type MostLikelyAction =
	| { type: 'redraw' }
	| { type: 'point' }
	| { type: 'toggle'; player: number }
	| { type: 'confirm' }
	| { type: 'next' }
	| { type: 'rematch' };

export function ranking(s: MostLikelyState): { player: Player; titles: number; rank: number }[] {
	const rows = s.players.map((player, i) => ({ player, titles: s.titles[i] })).sort((a, b) => b.titles - a.titles);
	return rows.map((r) => ({ ...r, rank: rows.findIndex((o) => o.titles === r.titles) + 1 }));
}

export function leaders(s: MostLikelyState): Player[] {
	const best = Math.max(...s.titles);
	return s.players.filter((_, i) => s.titles[i] === best);
}

function draw(s: MostLikelyState, avoid?: number): MostLikelyState {
	const available = s.pool.filter((p) => !s.used.includes(p.id) && p.id !== avoid);
	const exhausted = available.length === 0;
	// a redraw on an exhausted pool must still change the prompt
	const from = !exhausted ? available : s.pool.length > 1 && avoid !== undefined ? s.pool.filter((p) => p.id !== avoid) : s.pool;
	const [prompt, rng] = pick(s.rng, from);
	return { ...s, rng, prompt, used: exhausted ? [prompt.id] : [...s.used, prompt.id] };
}

function newRound(s: MostLikelyState): MostLikelyState {
	return { ...draw(s), chosen: [], phase: 'prompt' };
}

export const mostLikely: GameDef<MostLikelyState, MostLikelyAction, MostLikelyConfig> = {
	slug: 'most-likely',
	name: 'Most Likely To',
	colour: 'most-likely',
	minPlayers: 3,
	maxPlayers: 20,
	minContent: 1,
	contentType: 'most_likely_prompts',
	stateVersion: 1,
	init({ players, config, content, seed }) {
		return newRound({
			rng: { state: seed >>> 0 },
			players: [...players],
			pool: [...content],
			used: [],
			rounds: config.rounds,
			round: 0,
			prompt: content[0],
			chosen: [],
			titles: players.map(() => 0),
			phase: 'prompt'
		});
	},
	reduce(s, action) {
		switch (action.type) {
			case 'redraw': {
				if (s.phase !== 'prompt') return s;
				// the rejected prompt goes back into the pool
				const rejected = s.prompt.id;
				return draw({ ...s, used: s.used.filter((id) => id !== rejected) }, rejected);
			}
			case 'point':
				return s.phase === 'prompt' ? { ...s, chosen: [], phase: 'pick' } : s;
			case 'toggle': {
				if (s.phase !== 'pick' || !(action.player in s.players)) return s;
				const on = s.chosen.includes(action.player);
				const chosen = on ? s.chosen.filter((p) => p !== action.player) : [...s.chosen, action.player].sort((a, b) => a - b);
				return { ...s, chosen };
			}
			case 'confirm':
				if (s.phase !== 'pick' || s.chosen.length === 0) return s;
				return { ...s, titles: s.titles.map((t, i) => (s.chosen.includes(i) ? t + 1 : t)), phase: 'reveal' };
			case 'next':
				if (s.phase !== 'reveal') return s;
				if (s.round + 1 >= s.rounds) return { ...s, phase: 'gameOver' };
				return newRound({ ...s, round: s.round + 1 });
			case 'rematch':
				if (s.phase !== 'gameOver') return s;
				return newRound({ ...s, round: 0, titles: s.players.map(() => 0) });
		}
		return s;
	},
	phase(s) {
		return s.phase;
	}
};
