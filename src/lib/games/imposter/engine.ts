import type { GameDef } from '#lib/engine/types.ts';

export type ImposterConfig = Record<string, never>;
export interface ImposterState {
	phase: string;
}
export type ImposterAction = { type: string };

export const imposter: GameDef<ImposterState, ImposterAction, ImposterConfig> = {
	slug: 'imposter',
	name: 'Imposter',
	colour: 'imposter',
	minPlayers: 3,
	maxPlayers: 12,
	minContent: 1,
	contentType: 'imposter_pairs',
	stateVersion: 1,
	init() {
		throw new Error('not implemented');
	},
	reduce() {
		throw new Error('not implemented');
	},
	phase() {
		throw new Error('not implemented');
	}
};
