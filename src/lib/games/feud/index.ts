import type { GameEntry } from '#lib/games/registry.ts';
import { demo } from './demo.ts';
import { feud as def, suddenDeath, type FeudState } from './engine.ts';
import { record } from './record.ts';
import Screen from './Screen.svelte';
import Setup from './Setup.svelte';

export const entry: GameEntry = {
	def,
	Screen,
	Setup,
	demo,
	status: (s: FeudState) => {
		const total = s.config.surveys.length;
		if (s.phase === 'gameOver') return { parts: [`Runde ${total} / ${total}`], progress: 1 };
		const step = { faceoff: 'Duell', choose: 'Duell', board: 'Tafel', steal: 'Stehlen', result: 'Ergebnis' }[s.phase];
		if (suddenDeath(s)) return { parts: ['Stichfrage', step], progress: 1 };
		return { parts: [`Runde ${s.round + 1} / ${total}`, step], progress: (s.round + 1) / total };
	},
	pitch: 'Zwei Teams suchen die häufigsten Antworten einer Umfrage.',
	savedOnly: true,
	onchange: record
};
