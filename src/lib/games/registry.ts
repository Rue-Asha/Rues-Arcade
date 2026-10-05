import type { Component } from 'svelte';
import { start } from '#lib/demo/runner.ts';
import type { DemoScript, GameDef, Player } from '#lib/engine/types.ts';
import { loadSession } from '#lib/session.ts';
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
	pitch: string;
}

export const games: GameEntry[] = [imposter, wavelength];

// the demo's opening state is a known-good shape to check a saved session against
export function loadGameSession(entry: GameEntry) {
	return loadSession<object>(entry.def.slug, entry.def.stateVersion, start(entry.def, entry.demo).state);
}

export const comingSoon: string[] = ['Duck', 'Family Feud', 'Codes', 'Most Likely To', 'Charade'];

export function playerRange(def: Pick<GameDef<any, any, any>, 'minPlayers' | 'maxPlayers'>): string {
	return `${def.minPlayers}–${def.maxPlayers} Spieler`;
}
