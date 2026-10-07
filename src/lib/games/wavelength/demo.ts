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

// seed 1 deals the four turns targets near 156°, 120°, 158° and 88° (the two redraws shift them);
// the dial values score 4, 3, 2 and 0
export const demo: DemoScript<WavelengthAction, WavelengthConfig> = {
	players: ['Alex', 'Bo', 'Cleo', 'Dani'],
	config: {
		teams: [
			['Alex', 'Bo'],
			['Cleo', 'Dani']
		],
		rounds: 2
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
			action: { type: 'dial', value: 130.6 },
			tip: 'Dani dreht den Zeiger auf den Hinweis. Er liegt ein Stück neben der Mitte des Ziels.'
		},
		{ action: { type: 'lockIn' }, tip: 'Einloggen, damit Danis Antwort gewertet wird.' },
		{
			action: { type: 'next' },
			tip: 'Knapp daneben, 3 Punkte, weil der Zeiger direkt neben der Mitte liegt. Damit ist Runde 1 vorbei.'
		},
		{
			action: { type: 'show' },
			tip: 'Runde 2 beginnt bei Team 1. Jetzt gibt Bo den Hinweis, damit jeder in der Gruppe einmal dran ist.'
		},
		{
			action: { type: 'guess' },
			tip: 'Bo verdeckt das Ziel und gibt den Hinweis. Alex rät.'
		},
		{
			action: { type: 'dial', value: 175 },
			tip: 'Alex dreht den Zeiger etwas zu weit nach rechts.'
		},
		{ action: { type: 'lockIn' }, tip: 'Einloggen.' },
		{
			action: { type: 'next' },
			tip: 'In der Nähe, 2 Punkte, weil der Zeiger zwei Felder neben der Mitte liegt. Weiter zu Team 2.'
		},
		{
			action: { type: 'show' },
			tip: 'Team 2 spielt die zweite Runde: Dani gibt den Hinweis, Cleo rät.'
		},
		{
			action: { type: 'guess' },
			tip: 'Dani verdeckt das Ziel nach dem Hinweis.'
		},
		{
			action: { type: 'dial', value: 118.5 },
			tip: 'Cleo dreht den Zeiger weit weg vom Ziel, damit auch ein Fehlwurf zu sehen ist.'
		},
		{ action: { type: 'lockIn' }, tip: 'Einloggen.' },
		{
			action: { type: 'next' },
			tip: 'Kein Punkt, weil der Zeiger außerhalb aller Felder liegt. Das war der letzte Zug, also folgt der Endstand.'
		},
		{
			action: { type: 'again' },
			tip: 'Team 1 gewinnt mit 6 zu 3 Punkten. Nochmal spielen startet ein neues Spiel mit denselben Teams. Im Koop-Modus spielen alle gemeinsam gegen die Skala, das zeigt dieses Demo nicht.'
		}
	]
};
