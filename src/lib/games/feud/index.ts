import type { GameEntry } from '#lib/games/registry.ts';
import { demo } from './demo.ts';
import { feud as def } from './engine.ts';
import { record } from './record.ts';
import Screen from './Screen.svelte';
import Setup from './Setup.svelte';

export const entry: GameEntry = {
	def,
	Screen,
	Setup,
	demo,
	pitch: 'Zwei Teams suchen die häufigsten Antworten einer Umfrage.',
	savedOnly: true,
	onchange: record
};
