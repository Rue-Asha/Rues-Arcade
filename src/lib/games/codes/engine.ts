import type { Rng } from '#lib/engine/rng.ts';
import type { GameDef, Player } from '#lib/engine/types.ts';

export interface CodesConfig {
	// player ids per team
	teams: string[][];
	rounds: number;
}

export type CodesPhase = 'reveal' | 'play' | 'result' | 'gameOver';

export interface CodesState {
	rng: Rng;
	players: Player[];
	phase: CodesPhase;
}

export type CodesAction =
	| { type: 'redraw' }
	| { type: 'start' }
	| { type: 'guessed' }
	| { type: 'missed' }
	| { type: 'skip' }
	| { type: 'next' }
	| { type: 'rematch' };

export const codes: GameDef<CodesState, CodesAction, CodesConfig> = {
	slug: 'codes',
	name: 'Codes',
	colour: 'codes',
	minPlayers: 4,
	maxPlayers: 20,
	minContent: 1,
	contentType: 'codes_words',
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
