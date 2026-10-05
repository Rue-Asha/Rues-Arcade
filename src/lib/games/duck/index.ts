import type { GameEntry } from '#lib/games/registry.ts';
import { demo } from './demo.ts';
import { duck as def } from './engine.ts';
import Screen from './Screen.svelte';
import Setup from './Setup.svelte';

export const entry: GameEntry = {
	def,
	Screen,
	Setup,
	demo,
	pitch: 'Alle suchen gleichzeitig einen Reim auf dasselbe Wort.'
};
