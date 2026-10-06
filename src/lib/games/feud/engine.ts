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
			past: []
		};
	},
	reduce(state) {
		return state;
	},
	phase(state) {
		return state.phase;
	}
};
