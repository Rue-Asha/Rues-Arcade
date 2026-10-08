import type { GameEntry } from '#lib/games/registry.ts';
import { demo } from './demo.ts';
import { mostLikely as def, type MostLikelyState } from './engine.ts';
import Screen from './Screen.svelte';
import Setup from './Setup.svelte';

export const entry: GameEntry = {
	def,
	Screen,
	Setup,
	demo,
	status: (s: MostLikelyState) => {
		if (s.phase === 'gameOver') return { parts: [`Runde ${s.rounds} / ${s.rounds}`], progress: 1 };
		return {
			parts: [`Runde ${s.round + 1} / ${s.rounds}`, `Team ${s.turn + 1} / ${s.teams.length}`],
			progress: (s.round + 1) / s.rounds
		};
	},
	pitch: 'Ein Spruch, alle zeigen auf eine Person, und ein Team punktet, wenn es sich einig ist.'
};
