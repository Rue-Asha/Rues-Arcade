import type { GameEntry } from '#lib/games/registry.ts';
import { demo } from './demo.ts';
import { codes as def } from './engine.ts';
import Screen from './Screen.svelte';
import Setup from './Setup.svelte';

export const entry: GameEntry = {
	def,
	Screen,
	Setup,
	demo,
	pitch: 'Teams erraten ein geheimes Wort aus Ein-Wort-Hinweisen, reihum.'
};
