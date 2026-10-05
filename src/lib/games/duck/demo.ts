import type { DemoScript } from '#lib/engine/types.ts';
import type { DuckAction, DuckConfig } from './engine.ts';

// seed 1 gives Chuck to Cleo and draws Haus
export const demo: DemoScript<DuckAction, DuckConfig> = {
	players: ['Alex', 'Bo', 'Cleo', 'Dani'],
	config: { target: 10 },
	content: [
		{ id: 1, a: 'Haus', b: '' },
		{ id: 2, a: 'Stern', b: '' }
	],
	seed: 1,
	steps: [
		{
			action: { type: 'show' },
			tip: 'Cleo hat Chuck the Duck: Wer denselben Reim wie Cleo sagt, bekommt 2 Punkte extra. Deckt das Wort für alle auf.'
		},
		{
			action: { type: 'play' },
			tip: 'Das Wort ist Haus. Alle suchen still einen Reim und sagen ihn dann gleichzeitig. Weiter zur Wertung.'
		},
		{
			action: { type: 'score', player: 0, box: 5 },
			tip: 'Alex und Cleo sagen beide Maus: genau ein Match, 3 Punkte, und weil Cleo Chuck hat, 2 extra. Tippe bei Alex die fünfte Box.'
		},
		{
			action: { type: 'score', player: 2, box: 3 },
			tip: 'Cleo bekommt 3 Punkte für das Match. Tippe bei Cleo die dritte Box.'
		},
		{
			action: { type: 'letter', player: 1, letter: 4 },
			tip: 'Bo hat keinen Reim gefunden und verliert das Y von DUCKY.'
		},
		{
			action: { type: 'commit' },
			tip: 'Dani sagt raus, sonst niemand: kein Punkt, aber auch kein Buchstabe weg. Weiter zum Punktestand.'
		}
	]
};
