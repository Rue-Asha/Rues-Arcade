import type { DemoScript } from '#lib/engine/types.ts';
import type { MostLikelyAction, MostLikelyConfig } from './engine.ts';

export const demo: DemoScript<MostLikelyAction, MostLikelyConfig> = {
	players: ['Alex', 'Bo', 'Cleo', 'Dani'],
	config: { rounds: 5 },
	content: [
		{ id: 1, a: 'Wer würde am ehesten auswandern?', b: '' },
		{ id: 2, a: 'Wer würde am ehesten einen Marathon laufen?', b: '' }
	],
	seed: 1,
	steps: [{ action: { type: 'point' }, tip: 'Die Demo zu diesem Spiel folgt.' }]
};
