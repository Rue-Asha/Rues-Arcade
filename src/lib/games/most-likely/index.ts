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
	pitch: 'Ein Spruch, und alle zeigen auf die Person, die am besten passt.'
};
