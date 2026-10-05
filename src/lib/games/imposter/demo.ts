import type { DemoScript } from '#lib/engine/types.ts';
import type { ImposterAction, ImposterConfig } from './engine.ts';

// seed 1 draws the animal pair and makes Alex the imposter
export const demo: DemoScript<ImposterAction, ImposterConfig> = {
	players: ['Alex', 'Bo', 'Cleo', 'Dani'],
	config: {},
	content: [
		{
			id: 1,
			a: 'Was würdest du auf eine einsame Insel mitnehmen?',
			b: 'Was würdest du in einen Kurzurlaub mitnehmen?'
		},
		{ id: 2, a: 'Welches Tier wärst du gern?', b: 'Welches Tier hättest du gern als Haustier?' }
	],
	seed: 1,
	steps: [
		{ action: { type: 'handover' }, tip: 'Gib das Handy an Alex. Tippe, sobald Alex es hat.' },
		{
			action: { type: 'seen' },
			tip: 'Alex hält gedrückt und liest heimlich die eigene Frage. Im Demo siehst du sie offen.'
		},
		{ action: { type: 'handover' }, tip: 'Jetzt ist Bo dran. Gib das Handy weiter.' },
		{ action: { type: 'seen' }, tip: 'Bo liest die Frage. Alle anderen schauen weg.' },
		{ action: { type: 'handover' }, tip: 'Weiter an Cleo.' },
		{ action: { type: 'seen' }, tip: 'Cleo liest die Frage. Bekommen alle dieselbe? Nicht ganz …' },
		{ action: { type: 'handover' }, tip: 'Zum Schluss Dani.' },
		{ action: { type: 'seen' }, tip: 'Dani liest zuletzt. Danach beantworten alle ihre Frage reihum laut.' },
		{
			action: { type: 'reveal' },
			tip: 'Alle haben geantwortet. Deck jetzt die Frage der Crew für alle auf.'
		},
		{
			action: { type: 'unmask' },
			tip: 'Wessen Antwort passte nicht zu dieser Frage? Diskutiert, dann geht es zur Auflösung.'
		},
		{
			action: { type: 'reveal' },
			tip: 'Deck den Imposter auf: Alex hatte die andere Frage.'
		}
	]
};
