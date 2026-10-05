import type { Rng } from '#lib/engine/rng.ts';
import type { GameDef, Player } from '#lib/engine/types.ts';

export interface DuckConfig {
	target: 10 | 20 | 30 | 40 | 50;
}

export type DuckPhase = 'reveal' | 'scoring' | 'standings' | 'gameOver';

export interface DuckState {
	rng: Rng;
	players: Player[];
	phase: DuckPhase;
}

export type DuckAction =
	| { type: 'show' }
	| { type: 'play' }
	| { type: 'skip' }
	| { type: 'score'; player: number; box: number }
	| { type: 'letter'; player: number; letter: number }
	| { type: 'commit' }
	| { type: 'next' }
	| { type: 'restart' };

export const duck: GameDef<DuckState, DuckAction, DuckConfig> = {
	slug: 'duck',
	name: 'What Rhymes with Duck',
	colour: 'duck',
	minPlayers: 4,
	maxPlayers: 16,
	minContent: 1,
	contentType: 'duck_words',
	stateVersion: 1,
	init({ players, seed }) {
		return { rng: { state: seed >>> 0 }, players, phase: 'reveal' };
	},
	reduce(s) {
		return s;
	},
	phase(s) {
		return s.phase;
	}
};
