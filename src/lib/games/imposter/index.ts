import type { GameEntry } from '#lib/games/registry.ts';
import { demo } from './demo.ts';
import { imposter as def, type ImposterState } from './engine.ts';
import { record } from './played.svelte.ts';
import Screen from './Screen.svelte';
import Setup from './Setup.svelte';

export const entry: GameEntry = {
	def,
	Screen,
	Setup,
	demo,
	status: (s: ImposterState) => ({ parts: [`Runde ${s.round}`], progress: null }),
	pitch: 'Alle bekommen dieselbe Frage, bis auf eine Person.',
	onchange: record
};
