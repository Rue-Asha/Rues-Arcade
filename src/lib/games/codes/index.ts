import type { GameEntry } from '#lib/games/registry.ts';
import { demo } from './demo.ts';
import { codes as def, type CodesState } from './engine.ts';
import Screen from './Screen.svelte';
import Setup from './Setup.svelte';

export const entry: GameEntry = {
	def,
	Screen,
	Setup,
	demo,
	status: (s: CodesState) => {
		if (s.phase === 'gameOver') return { parts: [`Runde ${s.rounds} / ${s.rounds}`], progress: 1 };
		const step = { reveal: 'Aufdecken', play: 'Spiel', result: 'Rundenergebnis' }[s.phase];
		return { parts: [`Runde ${s.roundIndex + 1} / ${s.rounds}`, step], progress: (s.roundIndex + 1) / s.rounds };
	},
	pitch: 'Teams erraten ein geheimes Wort aus Ein-Wort-Hinweisen, reihum.'
};
