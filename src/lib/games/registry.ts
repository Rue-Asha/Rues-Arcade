import type { Component } from 'svelte';
import type { DemoScript, GameDef, Player } from '#lib/engine/types.ts';
import { entry as imposter } from './imposter/index.ts';
import { entry as wavelength } from './wavelength/index.ts';

export interface ScreenProps {
	state: any;
	dispatch(action: { type: string }): void;
}

export interface SetupProps {
	players: Player[];
	onstart(config: unknown): void;
}

export interface GameEntry {
	def: GameDef<any, any, any>;
	Screen: Component<ScreenProps>;
	Setup: Component<SetupProps>;
	demo: DemoScript<any, any>;
}

export const games: GameEntry[] = [imposter, wavelength];

export const comingSoon: string[] = ['Duck', 'Family Feud', 'Codes', 'Most Likely To', 'Charade'];

export function playerRange(def: Pick<GameDef<any, any, any>, 'minPlayers' | 'maxPlayers'>): string {
	return `${def.minPlayers}–${def.maxPlayers} Spieler`;
}
