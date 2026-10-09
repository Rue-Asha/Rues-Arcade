import type { DemoScript } from '#lib/engine/types.ts';
import type { WavelengthAction, WavelengthConfig } from './engine.ts';

const spectra = [
	['Kalt', 'Heiß'],
	['Langweilig', 'Spannend'],
	['Leise', 'Laut'],
	['Billig', 'Teuer'],
	['Weich', 'Hart'],
	['Alt', 'Neu'],
	['Süß', 'Sauer'],
	['Klein', 'Groß']
];

// seed 1 deals the first two turns targets near 156° and 120° (the two redraws shift them);
// the dial values score 4 and 0
export const demo: DemoScript<WavelengthAction, WavelengthConfig> = {
	players: ['Alex', 'Bo', 'Cleo', 'Dani'],
	config: {
		teams: [
			['Alex', 'Bo'],
			['Cleo', 'Dani']
		],
		rounds: 1
	},
	content: spectra.map(([a, b], i) => ({ id: i + 1, a, b })),
	seed: 1,
	steps: [
		{
			action: { type: 'redraw' },
			tip: 'Team 1 ist dran, Alex gibt den Hinweis. Die Skala passt nicht, also ziehen alle vor dem Aufdecken eine neue.'
		},
		{
			action: { type: 'show' },
			tip: 'Nur Alex darf das Ziel sehen, deshalb schaut Bo weg. Im Demo ist das Ziel offen.'
		},
		{
			action: { type: 'guess' },
			tip: 'Alex überlegt einen Hinweis, der zwischen den beiden Enden liegt, und verdeckt das Ziel. Dann kann Bo raten.'
		},
		{
			action: { type: 'dial', value: 156 },
			tip: 'Bo hört den Hinweis und dreht den Zeiger dorthin, wo er das Ziel vermutet.'
		},
		{
			action: { type: 'lockIn' },
			tip: 'Mit Einloggen ist die Antwort fest. Erst dann zeigt sich, wie nah der Zeiger am Ziel liegt.'
		},
		{
			action: { type: 'next' },
			tip: 'Genau getroffen, 4 Punkte, weil der Zeiger mitten im Ziel liegt. Weiter zu Team 2.'
		},
		{
			action: { type: 'show' },
			tip: 'Team 2: Cleo gibt den Hinweis, Dani schaut weg. Das Ziel gilt nur für diese Runde.'
		},
		{
			action: { type: 'redraw' },
			tip: 'Auch nach dem Aufdecken lässt sich noch neu ziehen, wenn Cleo keinen Hinweis findet. Dann kommen neue Skala und neues Ziel.'
		},
		{
			action: { type: 'guess' },
			tip: 'Cleo hat einen Hinweis und verdeckt das Ziel, damit Dani nur nach dem Hinweis rät.'
		},
		{
			action: { type: 'dial', value: 60 },
			tip: 'Dani dreht den Zeiger auf den Hinweis, liegt aber weit neben dem Ziel.'
		},
		{ action: { type: 'lockIn' }, tip: 'Einloggen, damit Danis Antwort gewertet wird.' },
		{
			action: { type: 'next' },
			tip: 'Kein Punkt, weil der Zeiger außerhalb aller Felder liegt. Beide Teams waren einmal dran, also folgt der Endstand: Team 1 gewinnt mit 4 zu 0 Punkten. Im Koop-Modus spielen alle gemeinsam gegen die Skala, das zeigt dieses Demo nicht.'
		}
	]
};
