import type { DemoScript } from '#lib/engine/types.ts';
import type { MostLikelyAction, MostLikelyConfig } from './engine.ts';

type Step = DemoScript<MostLikelyAction, MostLikelyConfig>['steps'][number];

const point = (tip: string): Step => ({ action: { type: 'point' }, tip });
const score = (n: number, tip: string): Step => ({ action: { type: 'score', matched: n }, tip });
const next = (tip: string): Step => ({ action: { type: 'next' }, tip });

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
		{ id: 2, a: 'Wer würde am ehesten einen Marathon laufen?', b: '' },
		{ id: 3, a: 'Wer würde am ehesten bei einem Quiz gewinnen?', b: '' },
		{ id: 4, a: 'Wer würde am ehesten den Wecker verschlafen?', b: '' },
		{ id: 5, a: 'Wer würde am ehesten eine Katze adoptieren?', b: '' },
		{ id: 6, a: 'Wer würde am ehesten im Lotto gewinnen?', b: '' }
	],
	seed: 1,
	steps: [
		{
			action: { type: 'redraw' },
			tip: 'Der Spruch passt dem Team nicht, also zieht "Anderer Spruch" einen neuen. Das Team bleibt dran.'
		},
		point('Das Team liest den Spruch, zählt bis drei, und beide zeigen gleichzeitig auf die Person, die am besten passt. "Alle haben gezeigt" geht erst danach.'),
		score(2, 'Beide haben auf dieselbe Person gezeigt, also zählt das Team 2 und bekommt 2 Punkte. Das Gerät merkt sich nur die Zahl, nicht wer gezeigt hat.'),
		next('Danach ist das andere Team mit einem neuen Spruch dran. Jedes Team hat pro Runde genau einen Zug.'),
		point('Das zweite Team zählt bis drei und zeigt gleichzeitig. Gezeigt wird erst, wenn beide fertig gezählt haben.'),
		score(0, 'Hier haben die beiden auf verschiedene Personen gezeigt. "Alle verschieden" bringt 0 Punkte, der Spruch war trotzdem ein Zug.'),
		next('Die Runde ist um, wenn jedes Team einmal dran war. "Nächste Runde" startet die zweite Runde.'),
		point('In Runde 2 beginnt das Team, das in Runde 1 als zweites dran war. So wechselt, wer anfängt.'),
		score(2, 'Wieder zeigen beide auf dieselbe Person, das Team holt erneut 2 Punkte. Größere Teams zählen die größte Gruppe: zeigen 2 von 3 auf dieselbe Person, gibt es 2 Punkte, zeigen alle 3, gibt es 3.'),
		next('Weiter mit dem anderen Team, das in dieser Runde als zweites dran ist.'),
		point('Das Team zeigt auf drei, so wie in jedem Zug.'),
		score(2, 'Dieses Team hat sich ebenfalls einig gezeigt und holt 2 Punkte.'),
		next('Damit ist Runde 2 beendet, nach "Nächste Runde" öffnet in Runde 3 wieder das Team von Runde 1.'),
		point('Runde 3 beginnt mit dem Team, das auch Runde 1 eröffnet hat. Der Wechsel des Anfangs geht reihum weiter.'),
		score(0, 'Verschiedene Personen, also kein Punkt. Auch ein Zug ohne Treffer bleibt Teil des Spiels.'),
		next('Als Nächstes zeigt das zweite Team dieser Runde.'),
		point('Gleichzeitig auf drei zeigen, damit keiner sich nach den anderen richten kann.'),
		score(2, 'Einig gezeigt, 2 Punkte für das Team.'),
		next('Runde 3 ist durch, nach "Nächste Runde" geht es mit Runde 4 weiter.'),
		point('In Runde 4 beginnt wieder das Team, das in Runde 3 als zweites dran war.'),
		score(0, 'Nicht auf dieselbe Person gezeigt, es bleibt bei 0 Punkten.'),
		next('Das andere Team ist dran, danach endet Runde 4.'),
		point('Das Team zählt bis drei und zeigt.'),
		score(0, 'Auch hier zeigen die beiden auf verschiedene Personen, das Team geht leer aus.'),
		next('Ab hier läuft die letzte Runde, Runde 5 öffnet das Team, das Runde 1 eröffnet hat.'),
		point('Letzte Runde: gleicher Ablauf wie zuvor, Spruch lesen, bis drei zählen, zeigen.'),
		score(2, 'Beide zeigen auf dieselbe Person, 2 Punkte.'),
		next('Das zweite Team schließt Runde 5 ab.'),
		point('Das Team zeigt zum letzten Mal gleichzeitig auf eine Person.'),
		score(0, 'Verschiedene Personen, kein Punkt.'),
		next('Das war der letzte Zug der letzten Runde, darum heißt der Knopf "Zum Ergebnis".'),
		{
			action: { type: 'rematch' },
			tip: 'Das Team mit den meisten Punkten gewinnt. Bei gleich vielen Punkten steht dort "Unentschieden" mit allen punktgleichen Teams. "Nochmal spielen" behält die Teams, setzt die Punkte auf 0 und lässt ein zufälliges Team beginnen.'
		}
	]
};
