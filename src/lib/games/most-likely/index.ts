import type { GameEntry } from '#lib/games/registry.ts';
import { demo } from './demo.ts';
import { mostLikely as def } from './engine.ts';
import Screen from './Screen.svelte';
import Setup from './Setup.svelte';

export const entry: GameEntry = {
	def,
	Screen,
	Setup,
	demo,
	pitch: 'Ein Spruch, alle zeigen auf eine Person, und ein Team punktet, wenn es sich einig ist.'
};
