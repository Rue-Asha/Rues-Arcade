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
	// placeholder so the generic demo runner tests have a step; U7 replaces it with the real script
	steps: [{ action: { type: 'play' }, tip: 'Das Demo folgt.' }]
};
