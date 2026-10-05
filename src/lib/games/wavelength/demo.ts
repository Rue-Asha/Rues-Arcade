import type { DemoScript } from '#lib/engine/types.ts';
import type { WavelengthAction, WavelengthConfig } from './engine.ts';

export const demo: DemoScript<WavelengthAction, WavelengthConfig> = {
	players: ['Alex', 'Bo', 'Cleo', 'Dani'],
	config: { teams: [], rounds: 1 },
	content: [],
	seed: 1,
	steps: []
};
