import type { DemoScript } from '#lib/engine/types.ts';
import type { CodesAction, CodesConfig } from './engine.ts';

export const demo: DemoScript<CodesAction, CodesConfig> = {
	players: ['Alex', 'Bo', 'Cleo', 'Dani'],
	config: {
		teams: [
			['Alex', 'Bo'],
			['Cleo', 'Dani']
		],
		rounds: 1
	},
	content: [
		{ id: 1, a: 'Leuchtturm', b: '' },
		{ id: 2, a: 'Regenschirm', b: '' }
	],
	seed: 1,
	steps: [{ action: { type: 'start' }, tip: 'Die Demo zu diesem Spiel folgt.' }]
};
