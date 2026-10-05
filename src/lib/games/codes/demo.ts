import type { DemoScript } from '#lib/engine/types.ts';
import type { CodesAction, CodesConfig } from './engine.ts';

// seed 1 lets Team 2 open and draws Leuchtturm; in round 1 Alex and Cleo explain
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
	steps: [
		{
			action: { type: 'start' },
			tip: 'Alex und Cleo erklären und sehen das Wort (im Demo offen). Team 2 beginnt. Dann verdecken.'
		},
		{
			action: { type: 'missed' },
			tip: 'Cleo gibt Dani genau ein Wort als Hinweis. Dani liegt daneben, also ist Team 1 dran.'
		},
		{
			action: { type: 'guessed' },
			tip: 'Alex gibt Bo einen Hinweis, Bo errät das Wort im zweiten Versuch: 2 Punkte.'
		},
		{ action: { type: 'next' }, tip: 'Das war die einzige Runde. Weiter zum Endstand.' }
	]
};
