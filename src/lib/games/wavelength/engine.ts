import type { GameDef } from '#lib/engine/types.ts';

export interface WavelengthConfig {
	// player ids per team
	teams: string[][];
	rounds: number;
}
export interface WavelengthState {
	phase: string;
}
export type WavelengthAction = { type: string };

export const wavelength: GameDef<WavelengthState, WavelengthAction, WavelengthConfig> = {
	slug: 'wavelength',
	name: 'Wavelength',
	colour: 'wavelength',
	// 2–6 teams of 2–3 players
	minPlayers: 4,
	maxPlayers: 18,
	minContent: 1,
	contentType: 'wavelength_spectra',
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
