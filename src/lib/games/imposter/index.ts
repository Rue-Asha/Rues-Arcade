import type { GameEntry } from '#lib/games/registry.ts';
import { demo } from './demo.ts';
import { imposter as def } from './engine.ts';
import Screen from './Screen.svelte';
import Setup from './Setup.svelte';

export const entry: GameEntry = {
	def,
	Screen,
	Setup,
	demo,
	pitch: 'Alle bekommen dieselbe Frage, bis auf eine Person.'
};
