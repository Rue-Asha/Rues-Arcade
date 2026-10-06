import type { Survey } from '#lib/content/types.ts';
import type { DemoScript } from '#lib/engine/types.ts';
import type { FeudAction, FeudConfig } from './engine.ts';

const survey = (id: number, question: string, answers: [string, number][]): Survey => ({
	id,
	question,
	answers: answers.map(([text, points]) => ({ text, points }))
});

const surveys = [
	survey(1, 'Nenne etwas, das man in einem Kühlschrank findet', [
		['Milch', 30],
		['Eier', 22],
		['Butter', 16],
		['Käse', 12],
		['Gemüse', 11]
	]),
	survey(2, 'Nenne ein Tier, das man im Zoo sieht', [
		['Löwe', 28],
		['Elefant', 24],
		['Affe', 18],
		['Giraffe', 14]
	])
];

export const demo: DemoScript<FeudAction, FeudConfig> = {
	players: ['Alex', 'Bo', 'Cleo', 'Dani'],
	config: {
		teams: [
			{ name: 'Team A', players: ['Alex', 'Bo'] },
			{ name: 'Team B', players: ['Cleo', 'Dani'] }
		],
		surveys: [surveys[0]],
		tiebreak: surveys[1],
		saved: []
	},
	content: surveys.map((s) => ({ id: s.id, a: s.question, b: '' })),
	seed: 1,
	// one survey, so it is the last round and counts double; Team B wins the face-off, strikes out, Team A steals
	steps: [
		{ action: { type: 'answer', tile: 1 }, tip: 'Alex nennt als Erster Eier. Die Antwort steht auf Platz 2.' },
		{ action: { type: 'answer', tile: 0 }, tip: 'Cleo nennt Milch, Platz 1. Team B gewinnt das Duell.' },
		{ action: { type: 'play' }, tip: 'Team B entscheidet: Spielen oder passen. Hier spielt Team B.' },
		{ action: { type: 'reveal', tile: 2 }, tip: 'Team B nennt Butter. Tippe auf die Antwort, sie kommt in den Topf.' },
		{ action: { type: 'strike' }, tip: 'Eine Antwort, die nicht auf der Tafel steht, ist ein Fehler.' },
		{ action: { type: 'strike' }, tip: 'Zweiter Fehler.' },
		{ action: { type: 'strike' }, tip: 'Dritter Fehler. Jetzt darf Team A eine Antwort stehlen.' },
		{ action: { type: 'steal', tile: 3 }, tip: 'Team A nennt Käse und holt den Topf, die Punkte zählen doppelt.' },
		{ action: { type: 'next' }, tip: 'Zum Ergebnis.' }
	]
};
