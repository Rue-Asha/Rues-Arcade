import type { Component } from 'svelte';
import type { DemoScript, GameDef, Player } from '#lib/engine/types.ts';

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

export const games: GameEntry[] = [];

export const comingSoon: string[] = ['Duck', 'Family Feud', 'Codes', 'Most Likely To', 'Charade'];

export function playerRange(def: Pick<GameDef<any, any, any>, 'minPlayers' | 'maxPlayers'>): string {
	void def;
	throw new Error('not implemented');
}
