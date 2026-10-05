import type { GameEntry } from '#lib/games/registry.ts';
import { demo } from './demo.ts';
import { wavelength as def } from './engine.ts';
import Screen from './Screen.svelte';
import Setup from './Setup.svelte';

export const entry: GameEntry = {
	def,
	Screen,
	Setup,
	demo,
	pitch: 'Einen Punkt auf einer Skala zwischen zwei Begriffen finden, gemeinsam oder in Teams.'
};
