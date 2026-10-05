import type { DemoScript } from '#lib/engine/types.ts';
import type { ImposterAction, ImposterConfig } from './engine.ts';

export const demo: DemoScript<ImposterAction, ImposterConfig> = {
	players: ['Alex', 'Bo', 'Cleo', 'Dani'],
	config: {},
	content: [],
	seed: 1,
	steps: []
};
