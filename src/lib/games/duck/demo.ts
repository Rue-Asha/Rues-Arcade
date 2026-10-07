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
		{
			action: { type: 'skip' },
			tip: 'Cleo hat Chuck the Duck. Das Wort ist noch verdeckt und fällt niemandem ein: Überspringen zieht ein neues Wort, Chuck bleibt bei Cleo.'
		},
		{ action: { type: 'show' }, tip: `Wort 1: ${SHOW} Wer denselben Reim wie Cleo sagt, bekommt 2 Punkte extra.` },
		{ action: { type: 'play' }, tip: PLAY },
		{
			action: { type: 'letter', player: 1, letter: 4 },
			tip: 'Alle sagen verschiedene Reime, niemand trifft ein Match: Das Wort bringt keine Punkte. Bo hat keinen Reim gefunden und verliert das Y von DUCKY.'
		},
		{ action: { type: 'commit' }, tip: 'Ein Wort ohne Match endet ohne Punkte. Weiter zum Punktestand.' },
		{ action: { type: 'next' }, tip: 'Chuck wandert zum nächsten Spieler, jetzt Dani. Nächstes Wort.' },
		{ action: { type: 'show' }, tip: `Wort 2: ${SHOW}` },
		{ action: { type: 'play' }, tip: PLAY },
		{
			action: { type: 'score', player: 0, box: 5 },
			tip: 'Alex und Dani sagen beide denselben Reim: genau ein Match, 3 Punkte. Alex hat mit Chuck-Halter Dani gematcht und bekommt 2 extra. Tippe bei Alex die fünfte Box.'
		},
		{ action: { type: 'score', player: 3, box: 3 }, tip: 'Dani bekommt für das Match 3 Punkte, ohne Extra. Tippe bei Dani die dritte Box.' },
		{ action: { type: 'letter', player: 1, letter: 3 }, tip: 'Bo findet wieder keinen Reim und verliert einen weiteren Buchstaben von DUCKY, höchstens eines pro Wort.' },
		{ action: { type: 'commit' }, tip: 'Die Wertung ist abgeschlossen. Weiter zum Punktestand.' },
		{ action: { type: 'next' }, tip: 'Alex hat jetzt Chuck. Nächstes Wort.' },
		{ action: { type: 'show' }, tip: `Wort 3: ${SHOW}` },
		{ action: { type: 'play' }, tip: PLAY },
		{
			action: { type: 'score', player: 2, box: 3 },
			tip: 'Cleo und Dani sagen denselben Reim, Alex als Chuck-Halter ist nicht dabei: 3 Punkte ohne Extra.'
		},
		{ action: { type: 'score', player: 3, box: 6 }, tip: 'Dani steht danach bei 6 Punkten. Tippe bei Dani die sechste Box.' },
		{ action: { type: 'letter', player: 1, letter: 2 }, tip: 'Bo verliert den nächsten Buchstaben und hat nur noch D und U.' },
		{ action: { type: 'commit' }, tip: 'Weiter zum Punktestand.' },
		{ action: { type: 'next' }, tip: 'Bo hat jetzt Chuck. Nächstes Wort.' },
		{ action: { type: 'show' }, tip: `Wort 4: ${SHOW}` },
		{ action: { type: 'play' }, tip: PLAY },
		{
			action: { type: 'score', player: 0, box: 6 },
			tip: 'Alex, Cleo und Dani sagen alle denselben Reim: mehrere Personen mit demselben Reim bekommen je 1 Punkt. Bo hat einen eigenen Reim und verliert nichts.'
		},
		{ action: { type: 'score', player: 2, box: 4 }, tip: 'Cleo steht danach bei 4 Punkten.' },
		{ action: { type: 'score', player: 3, box: 7 }, tip: 'Dani steht danach bei 7 Punkten, drei Punkte vom Ziel entfernt.' },
		{ action: { type: 'commit' }, tip: 'Weiter zum Punktestand.' },
		{ action: { type: 'next' }, tip: 'Cleo hat wieder Chuck. Nächstes Wort.' },
		{ action: { type: 'show' }, tip: `Wort 5: ${SHOW}` },
		{ action: { type: 'play' }, tip: PLAY },
		{ action: { type: 'letter', player: 1, letter: 1 }, tip: 'Bo findet keinen Reim und hat nur noch einen Buchstaben, das D. Niemand sonst punktet.' },
		{ action: { type: 'commit' }, tip: 'Weiter zum Punktestand.' },
		{ action: { type: 'next' }, tip: 'Dani hat jetzt Chuck und braucht 3 Punkte bis zum Ziel. Letztes Wort.' },
		{ action: { type: 'show' }, tip: `Wort 6: ${SHOW}` },
		{ action: { type: 'play' }, tip: PLAY },
		{
			action: { type: 'score', player: 2, box: 9 },
			tip: 'Cleo matcht Dani, den Chuck-Halter: 3 Punkte und 2 extra, Cleo steht bei 9.'
		},
		{ action: { type: 'score', player: 3, box: 10 }, tip: 'Dani bekommt 3 Punkte und erreicht das Ziel von 10.' },
		{ action: { type: 'letter', player: 1, letter: 0 }, tip: 'Bo verliert den letzten Buchstaben. Beides passiert im selben Wort.' },
		{
			action: { type: 'commit' },
			tip: 'Ziel erreicht und Bo ausgeschieden: Das Spiel endet.'
		},
		{ action: { type: 'restart' }, tip: 'Ein Spiel kann auch allein durch verlorene Buchstaben enden, dann gewinnt, wer die meisten Punkte hat. Neue Runde startet mit denselben Spielern neu.' }
	]
};
