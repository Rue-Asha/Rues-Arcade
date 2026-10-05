import type { DemoScript } from '#lib/engine/types.ts';
import type { WavelengthAction, WavelengthConfig } from './engine.ts';

// seed 1 puts Team 1's target near 22° and Team 2's near 156°; the dial values below score 4 and 3
export const demo: DemoScript<WavelengthAction, WavelengthConfig> = {
	players: ['Alex', 'Bo', 'Cleo', 'Dani'],
	config: {
		teams: [
			['Alex', 'Bo'],
			['Cleo', 'Dani']
		],
		rounds: 1
	},
	content: [
		{ id: 1, a: 'Kalt', b: 'Heiß' },
		{ id: 2, a: 'Langweilig', b: 'Spannend' }
	],
	seed: 1,
	steps: [
		{
			action: { type: 'show' },
			tip: 'Team 1 ist dran, Alex gibt den Hinweis. Gib Alex das Handy, Bo schaut weg.'
		},
		{
			action: { type: 'guess' },
			tip: 'Alex sieht das Ziel (im Demo offen) und überlegt einen Hinweis. Dann verdecken.'
		},
		{ action: { type: 'dial', value: 22 }, tip: 'Bo hört den Hinweis und dreht den Zeiger dorthin.' },
		{ action: { type: 'lockIn' }, tip: 'Einloggen: Wie nah liegt der Zeiger am Ziel?' },
		{ action: { type: 'next' }, tip: 'Volltreffer, 4 Punkte! Weiter zu Team 2.' },
		{
			action: { type: 'show' },
			tip: 'Team 2: Cleo gibt den Hinweis. Gib Cleo das Handy, Dani schaut weg.'
		},
		{ action: { type: 'guess' }, tip: 'Cleo merkt sich das Ziel, überlegt einen Hinweis und verdeckt.' },
		{ action: { type: 'dial', value: 145 }, tip: 'Dani dreht den Zeiger auf den Hinweis.' },
		{ action: { type: 'lockIn' }, tip: 'Einloggen.' },
		{ action: { type: 'next' }, tip: 'Knapp daneben, 3 Punkte. Weiter zum Endstand.' }
	]
};
