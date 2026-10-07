import type { DemoScript } from '#lib/engine/types.ts';
import type { MostLikelyAction, MostLikelyConfig } from './engine.ts';

export const demo: DemoScript<MostLikelyAction, MostLikelyConfig> = {
	players: ['Alex', 'Bo', 'Cleo', 'Dani'],
	config: {
		teams: [
			['Alex', 'Bo'],
			['Cleo', 'Dani']
		],
		rounds: 5
	},
	content: [
		{ id: 1, a: 'Wer würde am ehesten auswandern?', b: '' },
		{ id: 2, a: 'Wer würde am ehesten einen Marathon laufen?', b: '' }
	],
	seed: 1,
	steps: [
		{
			action: { type: 'point' },
			tip: 'Das Team liest den Spruch, zählt bis drei, und beide zeigen gleichzeitig auf eine Person.'
		},
		{ action: { type: 'score', matched: 2 }, tip: 'Beide haben auf dieselbe Person gezeigt, also bekommt das Team 2 Punkte.' },
		{ action: { type: 'next' }, tip: 'Reihum ist jetzt das andere Team dran.' },
		{ action: { type: 'point' }, tip: 'Neuer Spruch, wieder zeigen beide auf drei.' },
		{
			action: { type: 'score', matched: 0 },
			tip: 'Diesmal zeigen die beiden auf verschiedene Personen. Alle verschieden bringt keinen Punkt.'
		}
	]
};
