import type { DemoScript } from '#lib/engine/types.ts';
import type { DuckAction, DuckConfig } from './engine.ts';

const SHOW = 'Deckt das Wort für alle gleichzeitig auf.';
const PLAY = 'Alle suchen still einen Reim und sagen ihn dann gleichzeitig. Weiter zur Wertung.';

// seed 1 gives Chuck to Cleo; Chuck then moves on by one player per played word: Cleo, Dani, Alex, Bo, Cleo, Dani
export const demo: DemoScript<DuckAction, DuckConfig> = {
	players: ['Alex', 'Bo', 'Cleo', 'Dani'],
	config: { target: 10 },
	content: ['Haus', 'Stern', 'Brot', 'Wald', 'Meer', 'Tisch', 'Hund', 'Licht'].map((a, i) => ({ id: i + 1, a, b: '' })),
	seed: 1,
	steps: [
		{ action: { type: 'show' }, tip: `Cleo hat Chuck the Duck. Das erste Wort ist verdeckt. ${SHOW} Wer denselben Reim wie Cleo sagt, bekommt 2 Punkte extra.` },
		{
			action: { type: 'skip' },
			tip: 'Das aufgedeckte Wort fällt niemandem ein. Überspringen geht erst, wenn das Wort sichtbar ist, und zieht ein neues Wort. Chuck bleibt bei Cleo.'
		},
		{ action: { type: 'show' }, tip: `Das neue Wort ist Wort 1 und zählt, das übersprungene nicht. ${SHOW}` },
		{ action: { type: 'play' }, tip: PLAY },
		{
			action: { type: 'score', player: 0, box: 1 },
			tip: 'Alex, Bo und Dani finden alle denselben Reim: Wenn mehr als zwei einen Reim teilen, bekommt jeder von ihnen 1 Punkt. Tippe bei Alex die erste Box.'
		},
		{ action: { type: 'score', player: 1, box: 1 }, tip: 'Auch Bo bekommt 1 Punkt.' },
		{ action: { type: 'score', player: 3, box: 1 }, tip: 'Und Dani ebenfalls 1 Punkt.' },
		{
			action: { type: 'letter', player: 2, letter: 4 },
			tip: 'Cleo hat als Einzige keinen Reim gefunden und verliert das Y von DUCKY.'
		},
		{ action: { type: 'commit' }, tip: 'Die Wertung ist abgeschlossen. Weiter zum Punktestand.' },
		{ action: { type: 'next' }, tip: 'Chuck wandert zum nächsten Spieler, jetzt Dani. Nächstes Wort.' },
		{ action: { type: 'show' }, tip: `Wort 2: ${SHOW}` },
		{ action: { type: 'play' }, tip: PLAY },
		{
			action: { type: 'score', player: 0, box: 4 },
			tip: 'Nur Alex und Cleo finden einen Reim und sagen denselben. Sie sind die Einzigen, deshalb bekommen beide 3 Punkte. Alex steht damit bei 4.'
		},
		{ action: { type: 'score', player: 2, box: 3 }, tip: 'Cleo bekommt ebenfalls 3 Punkte und steht bei 3.' },
		{
			action: { type: 'letter', player: 1, letter: 4 },
			tip: 'Bo und Dani haben keinen Reim gefunden und verlieren beide einen Buchstaben. Zuerst Bo.'
		},
		{ action: { type: 'letter', player: 3, letter: 4 }, tip: 'Dani verliert ebenfalls das Y, höchstens eines pro Wort.' },
		{ action: { type: 'commit' }, tip: 'Weiter zum Punktestand.' },
		{ action: { type: 'next' }, tip: 'Alex hat jetzt Chuck. Nächstes Wort.' },
		{ action: { type: 'show' }, tip: `Wort 3: ${SHOW}` },
		{ action: { type: 'play' }, tip: PLAY },
		{
			action: { type: 'score', player: 0, box: 9 },
			tip: 'Alex und Bo haben einen gemeinsamen Reim und Alex hält Chuck: 3 Punkte für beide, Alex bekommt 2 extra, zusammen 5. Alex steht bei 9.'
		},
		{ action: { type: 'score', player: 1, box: 4 }, tip: 'Bo bekommt 3 Punkte, ohne Extra, und steht bei 4.' },
		{
			action: { type: 'score', player: 2, box: 6 },
			tip: 'Cleo und Dani haben einen anderen gemeinsamen Reim. Auch dieses Paar bekommt je 3 Punkte, Cleo steht bei 6.'
		},
		{ action: { type: 'score', player: 3, box: 4 }, tip: 'Dani bekommt 3 Punkte und steht bei 4. Alle haben einen Reim gefunden, niemand verliert einen Buchstaben.' },
		{ action: { type: 'commit' }, tip: 'Weiter zum Punktestand.' },
		{
			action: { type: 'next' },
			tip: 'Das Spiel endet, sobald jemand alle fünf Buchstaben von DUCKY verloren hat. Hier haben Cleo, Bo und Dani je einen verloren, es geht also weiter. Nächstes Wort.'
		},
		{
			action: { type: 'show' },
			tip: 'Das Spiel endet auch, sobald jemand die vorher festgelegte Zielpunktzahl erreicht, hier 10. Alex steht bei 9, ein Punkt fehlt noch. Mit dem Ende gewinnt, wer die meisten Punkte hat.'
		}
	]
};
