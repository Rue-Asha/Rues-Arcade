import type { GameEntry } from '#lib/games/registry.ts';
import { demo } from './demo.ts';
import { duck as def, type DuckState } from './engine.ts';
import Screen from './Screen.svelte';
import Setup from './Setup.svelte';

export const entry: GameEntry = {
	def,
	Screen,
	Setup,
	demo,
	status: (s: DuckState) => ({
		parts: [`Ziel ${s.target} Punkte`],
		progress: Math.min(1, Math.max(...s.scores) / s.target)
	}),
	pitch: 'Alle suchen gleichzeitig einen Reim auf dasselbe Wort.'
};
