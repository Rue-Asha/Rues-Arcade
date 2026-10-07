import type { GameEntry } from '#lib/games/registry.ts';
import { demo } from './demo.ts';
import { wavelength as def, type WavelengthState } from './engine.ts';
import Screen from './Screen.svelte';
import Setup from './Setup.svelte';

export const entry: GameEntry = {
	def,
	Screen,
	Setup,
	demo,
	status: (s: WavelengthState) => {
		const r = s.roundIndex + 1;
		const rounds = `Runde ${r} / ${s.rounds}`;
		if (s.phase === 'gameOver') return { parts: [rounds], progress: 1 };
		const who = s.mode === 'koop' ? `Zug ${s.turn! + 1} / ${s.teams[0].players.length}` : s.teams[s.teamIndex].name;
		return { parts: [rounds, who], progress: r / s.rounds };
	},
	pitch: 'Einen Punkt auf einer Skala zwischen zwei Begriffen finden, gemeinsam oder in Teams.'
};
