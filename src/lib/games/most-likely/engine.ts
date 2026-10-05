import type { Rng } from '#lib/engine/rng.ts';
import type { GameDef, Player } from '#lib/engine/types.ts';

export interface MostLikelyConfig {
	rounds: 5 | 10 | 15 | 20;
}

export type MostLikelyPhase = 'prompt' | 'pick' | 'reveal' | 'gameOver';

export interface MostLikelyState {
	rng: Rng;
	players: Player[];
	phase: MostLikelyPhase;
}

export type MostLikelyAction =
	| { type: 'redraw' }
	| { type: 'point' }
	| { type: 'toggle'; player: number }
	| { type: 'confirm' }
	| { type: 'next' }
	| { type: 'rematch' };

export const mostLikely: GameDef<MostLikelyState, MostLikelyAction, MostLikelyConfig> = {
	slug: 'most-likely',
	name: 'Most Likely To',
	colour: 'most-likely',
	minPlayers: 3,
	maxPlayers: 20,
	minContent: 1,
	contentType: 'most_likely_prompts',
	stateVersion: 1,
	init({ players, seed }) {
		return { rng: { state: seed >>> 0 }, players, phase: 'prompt' };
	},
	reduce(s) {
		return s;
	},
	phase(s) {
		return s.phase;
	}
};
