import type { DemoScript } from '#lib/engine/types.ts';
import type { ImposterAction, ImposterConfig } from './engine.ts';

const H: ImposterAction = { type: 'handover' };
const S: ImposterAction = { type: 'seen' };

export const demo: DemoScript<ImposterAction, ImposterConfig> = {
	players: ['Alex', 'Bo', 'Cleo', 'Dani'],
	config: {},
	content: [
		{
			id: 1,
			a: 'Was würdest du auf eine einsame Insel mitnehmen?',
			b: 'Was würdest du in einen Kurzurlaub mitnehmen?'
		},
		{ id: 2, a: 'Welches Tier wärst du gern?', b: 'Welches Tier hättest du gern als Haustier?' },
		{ id: 3, a: 'Welches Essen kochst du für Gäste?', b: 'Welches Essen bestellst du am liebsten?' }
	],
	seed: 1,
	steps: [
		{ action: H, tip: 'Das Handy geht reihum, damit jede Person ihre Frage allein liest. Gib es an Alex und tippe, sobald Alex es hat.' },
		{ action: S, tip: 'Alex hält gedrückt und liest die Frage heimlich. Im Demo siehst du sie offen. Beim Loslassen ist die nächste Person dran.' },
		{ action: H, tip: 'Jetzt kommt Bo an die Reihe. Gib das Handy weiter.' },
		{ action: { type: 'skip' }, tip: 'Diese Frage passt der Gruppe nicht, deshalb gibt es Überspringen. Es zieht ein neues Fragenpaar, die Reihe beginnt wieder bei Alex, und wer Imposter ist, bleibt gleich.' },
		{ action: H, tip: 'Mit dem neuen Paar fängt die Reihe von vorn an. Das Handy geht wieder an Alex.' },
		{ action: S, tip: 'Alex liest die neue Frage. Der Imposter bekommt eine andere Frage als alle anderen und weiß das nicht.' },
		{ action: H, tip: 'Weiter an Bo, damit jede Person genau einmal liest.' },
		{ action: S, tip: 'Bo liest die Frage. Alle anderen schauen weg.' },
		{ action: H, tip: 'Weiter an Cleo.' },
		{ action: S, tip: 'Cleo liest die Frage und gibt sie gleich weiter.' },
		{ action: H, tip: 'Zum Schluss ist Dani dran.' },
		{ action: S, tip: 'Dani liest als Letzte. Danach haben alle ihre Frage gesehen und es geht ohne Handy weiter.' },
		{ action: { type: 'reveal' }, tip: 'Jetzt beantworten alle ihre Frage reihum laut. Die Antworten verraten, wer eine andere Frage hatte. Danach deckt ihr die Frage der Crew auf.' },
		{ action: { type: 'unmask' }, tip: 'Mit der Crew-Frage vor Augen lässt sich prüfen, wessen Antwort nicht passte. Erst wird diskutiert, dann kommt die Auflösung.' },
		{ action: { type: 'reveal' }, tip: 'Alle zeigen auf ihren Verdacht, dann wird aufgedeckt. Alex war der Imposter und ist von der Gruppe gefunden worden. Die App merkt sich nicht, wer gefunden wurde. Die Gruppe entscheidet das selbst.' },
		{ action: { type: 'nextRound' }, tip: 'Weiter geht es mit Runde 2: neues Paar, und wer Imposter ist, wird neu ausgelost. Die Runden gehen weiter, bis die Gruppe über Spiel beenden aufhört.' }
	]
};
