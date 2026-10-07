import type { DemoScript } from '#lib/engine/types.ts';
import type { CodesAction, CodesConfig } from './engine.ts';

const START: CodesAction = { type: 'start' };
const MISSED: CodesAction = { type: 'missed' };
const GUESSED: CodesAction = { type: 'guessed' };
const NEXT: CodesAction = { type: 'next' };

// seed 1 lets Team 2 open round 1; the opener then alternates and the explainers move on each round
export const demo: DemoScript<CodesAction, CodesConfig> = {
	players: ['Alex', 'Bo', 'Cleo', 'Dani'],
	config: {
		teams: [
			['Alex', 'Bo'],
			['Cleo', 'Dani']
		],
		rounds: 4
	},
	content: [
		{ id: 1, a: 'Leuchtturm', b: '' },
		{ id: 2, a: 'Regenschirm', b: '' },
		{ id: 3, a: 'Fahrrad', b: '' },
		{ id: 4, a: 'Schneemann', b: '' },
		{ id: 5, a: 'Kaffeemaschine', b: '' },
		{ id: 6, a: 'Hängematte', b: '' }
	],
	seed: 1,
	steps: [
		{
			action: { type: 'redraw' },
			tip: 'Alex und Cleo erklären in dieser Runde und sehen das Wort. Passt es der Gruppe nicht, zieht Anderes Wort ein neues. Team und Erklärende bleiben gleich.'
		},
		{
			action: START,
			tip: 'Team 2 beginnt die erste Runde. Das Wort wird jetzt verdeckt und Cleo gibt Dani einen einzigen Hinweis.'
		},
		{
			action: GUESSED,
			tip: 'Dani errät das Wort im ersten Versuch. Das gibt 3 Punkte, der höchste Wert.'
		},
		{
			action: NEXT,
			tip: 'In der nächsten Runde beginnt Team 1, und Bo und Dani erklären. Jedes Team stellt reihum andere Erklärende.'
		},
		{
			action: START,
			tip: 'Bo gibt Alex nur ein Wort als Hinweis. Die Runde beginnt mit Team 1, weil die Reihenfolge wechselt.'
		},
		{
			action: MISSED,
			tip: 'Alex liegt daneben. Damit ist Team 2 mit einem eigenen Hinweis dran, und das Wort ist nur noch 2 Punkte wert.'
		},
		{
			action: GUESSED,
			tip: 'Cleo gibt Dani einen Hinweis, und Dani errät das Wort im zweiten Versuch: 2 Punkte für Team 2.'
		},
		{
			action: NEXT,
			tip: 'Runde 3 beginnt wieder mit Team 2, und Alex und Cleo erklären noch einmal.'
		},
		{
			action: START,
			tip: 'Team 2 beginnt. Cleo gibt Dani den ersten Hinweis.'
		},
		{
			action: MISSED,
			tip: 'Dani liegt daneben, also ist Team 1 an der Reihe. Das Wort ist jetzt noch 2 Punkte wert.'
		},
		{
			action: MISSED,
			tip: 'Auch Team 1 liegt daneben. Nun ist wieder Team 2 dran, und das Wort bringt höchstens noch 1 Punkt.'
		},
		{
			action: GUESSED,
			tip: 'Dani errät das Wort im dritten Versuch. Das gibt 1 Punkt, mehr als einen gibt es nach zwei Fehlversuchen nicht.'
		},
		{
			action: NEXT,
			tip: 'Die letzte Runde beginnt mit Team 1, und Bo und Dani erklären.'
		},
		{
			action: START,
			tip: 'Das Wort ist schwer. Bo gibt Alex einen Hinweis.'
		},
		{ action: MISSED, tip: 'Alex liegt daneben, jetzt versucht es Team 2.' },
		{ action: MISSED, tip: 'Dani liegt auch daneben. Der Hinweis geht zurück an Team 1.' },
		{
			action: MISSED,
			tip: 'Nach drei Fehlversuchen taucht Überspringen auf. Die Gruppe darf das Wort aufgeben, wenn keiner mehr weiterkommt.'
		},
		{
			action: { type: 'skip' },
			tip: 'Überspringen beendet die Runde ohne Punkte. Das Wort wird aufgelöst.'
		},
		{
			action: NEXT,
			tip: 'Das war die letzte Runde. Weiter zum Endstand.'
		},
		{
			action: { type: 'rematch' },
			tip: 'Team 2 gewinnt mit 6 zu 0 Punkten. Nochmal spielen startet ein neues Spiel mit der gleichen Besetzung und allen Ständen auf 0.'
		}
	]
};
