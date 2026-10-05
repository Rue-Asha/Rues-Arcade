import type { DemoScript } from '#lib/engine/types.ts';
import type { DuckAction, DuckConfig } from './engine.ts';

export const demo: DemoScript<DuckAction, DuckConfig> = {
	players: ['Alex', 'Bo', 'Cleo', 'Dani'],
	config: { target: 10 },
	content: [
		{ id: 1, a: 'Haus', b: '' },
		{ id: 2, a: 'Stern', b: '' }
	],
	seed: 1,
	steps: [{ action: { type: 'show' }, tip: 'Die Demo zu diesem Spiel folgt.' }]
};
