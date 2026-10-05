import type { DemoScript } from '#lib/engine/types.ts';
import type { MostLikelyAction, MostLikelyConfig } from './engine.ts';

// seed 1 draws the marathon prompt; Alex and Cleo tie for the title
export const demo: DemoScript<MostLikelyAction, MostLikelyConfig> = {
	players: ['Alex', 'Bo', 'Cleo', 'Dani'],
	config: { rounds: 5 },
	content: [
		{ id: 1, a: 'Wer würde am ehesten auswandern?', b: '' },
		{ id: 2, a: 'Wer würde am ehesten einen Marathon laufen?', b: '' }
	],
	seed: 1,
	steps: [
		{
			action: { type: 'point' },
			tip: 'Lies den Spruch laut vor. Auf drei zeigen alle gleichzeitig auf die Person, die am besten passt.'
		},
		{ action: { type: 'toggle', player: 2 }, tip: 'Die meisten Finger zeigen auf Cleo. Tippe Cleo an.' },
		{
			action: { type: 'toggle', player: 0 },
			tip: 'Auf Alex zeigen genauso viele. Bei Gleichstand tippst du alle an, die vorne liegen.'
		},
		{ action: { type: 'confirm' }, tip: 'Vergib den Titel. Alex und Cleo bekommen je einen.' }
	]
};
