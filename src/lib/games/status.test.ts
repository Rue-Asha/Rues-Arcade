import { describe, expect, it } from 'vitest';
import type { ContentItem } from '#lib/content/types.ts';
import type { Survey } from '#lib/content/types.ts';
import type { Player } from '#lib/engine/types.ts';
import { entry as codes } from './codes/index.ts';
import { entry as duck } from './duck/index.ts';
import { entry as feud } from './feud/index.ts';
import { entry as imposter } from './imposter/index.ts';
import { entry as mostLikely } from './most-likely/index.ts';
import { entry as wavelength } from './wavelength/index.ts';

const players: Player[] = ['a', 'b', 'c', 'd', 'e', 'f'].map((id) => ({ id, name: id.toUpperCase() }));
const ids = (from: number, to: number) => players.slice(from, to).map((p) => p.id);
const items = (n: number): ContentItem[] => Array.from({ length: n }, (_, i) => ({ id: i + 1, a: `a${i}`, b: `b${i}` }));

// every entry's reducer and status, so a state is built by playing it
const run = (g: { def: { reduce(s: any, a: any): any } }, s: any, ...actions: { type: string; [k: string]: unknown }[]) =>
	actions.reduce((acc, a) => g.def.reduce(acc, a), s);

describe('round status', () => {
	it('Scenario: Round status per game', () => {
		const imp = imposter.def.init({ players: players.slice(0, 3), config: {}, content: items(3), seed: 1 });
		expect(imposter.status(imp)).toEqual({ parts: ['Runde 1'], progress: null });
		const imp2 = run(imposter, imp, { type: 'handover' }, { type: 'seen' }, { type: 'handover' }, { type: 'seen' }, { type: 'handover' }, { type: 'seen' }, { type: 'reveal' }, { type: 'unmask' }, { type: 'reveal' }, { type: 'nextRound' });
		expect(imposter.status(imp2)).toEqual({ parts: ['Runde 2'], progress: null });

		const versus = wavelength.def.init({ players, config: { teams: [ids(0, 2), ids(2, 4)], rounds: 3 }, content: items(6), seed: 1 });
		expect(wavelength.status(versus)).toEqual({ parts: ['Runde 1 / 3', 'Team 1'], progress: 1 / 3 });
		const koop = wavelength.def.init({ players, config: { mode: 'koop', teams: [ids(0, 3)], rounds: 2 }, content: items(6), seed: 1 });
		expect(wavelength.status(koop)).toEqual({ parts: ['Runde 1 / 2', 'Zug 1 / 3'], progress: 1 / 2 });
		const turn = [{ type: 'show' }, { type: 'guess' }, { type: 'lockIn' }, { type: 'next' }];
		expect(wavelength.status(run(wavelength, koop, ...turn)).parts).toEqual(['Runde 1 / 2', 'Zug 2 / 3']);
		expect(wavelength.status(run(wavelength, versus, ...turn)).parts).toEqual(['Runde 1 / 3', 'Team 2']);
		const koopDone = run(wavelength, koop, ...turn, ...turn, ...turn, ...turn, ...turn, ...turn);
		expect(koopDone.phase).toBe('gameOver');
		expect(wavelength.status(koopDone)).toEqual({ parts: ['Runde 2 / 2'], progress: 1 });

		const cod = codes.def.init({ players, config: { teams: [ids(0, 3), ids(3, 6)], rounds: 2 }, content: items(4), seed: 1 });
		expect(codes.status(cod)).toEqual({ parts: ['Runde 1 / 2', 'Aufdecken'], progress: 1 / 2 });
		const playing = run(codes, cod, { type: 'start' });
		expect(codes.status(playing).parts).toEqual(['Runde 1 / 2', 'Spiel']);
		const result = run(codes, playing, { type: 'guessed' });
		expect(codes.status(result).parts).toEqual(['Runde 1 / 2', 'Rundenergebnis']);
		const codDone = run(codes, result, { type: 'next' }, { type: 'start' }, { type: 'guessed' }, { type: 'next' });
		expect(codDone.phase).toBe('gameOver');
		expect(codes.status(codDone)).toEqual({ parts: ['Runde 2 / 2'], progress: 1 });

		const ml = mostLikely.def.init({ players, config: { teams: [ids(0, 3), ids(3, 6)], rounds: 5 }, content: items(8), seed: 1 });
		expect(mostLikely.status(ml)).toEqual({ parts: ['Runde 1 / 5', 'Team 1 / 2'], progress: 1 / 5 });
		const mlTurn = [{ type: 'point' }, { type: 'score', matched: 0 }, { type: 'next' }];
		expect(mostLikely.status(run(mostLikely, ml, ...mlTurn)).parts).toEqual(['Runde 1 / 5', 'Team 2 / 2']);
		const mlDone = run(mostLikely, ml, ...Array.from({ length: 10 }, () => mlTurn).flat());
		expect(mlDone.phase).toBe('gameOver');
		expect(mostLikely.status(mlDone)).toEqual({ parts: ['Runde 5 / 5'], progress: 1 });

		const survey = (id: number): Survey => ({ id, question: `Frage ${id}`, answers: [{ text: 'x', points: 30 }, { text: 'y', points: 20 }] });
		const fd = feud.def.init({
			players: [],
			config: { teams: [{ name: 'Rot', players: ['a', 'b'] }, { name: 'Blau', players: ['c', 'd'] }], surveys: [survey(1), survey(2)], tiebreak: survey(99), saved: [] },
			content: [],
			seed: 1
		});
		expect(feud.status(fd)).toEqual({ parts: ['Runde 1 / 2', 'Duell'], progress: 1 / 2 });
		const won = run(feud, fd, { type: 'ask' }, { type: 'buzz', team: 0 }, { type: 'answer', tile: 0 });
		expect(feud.status(won).parts).toEqual(['Runde 1 / 2', 'Duell']);
		const board = run(feud, won, { type: 'play' });
		expect(feud.status(board).parts).toEqual(['Runde 1 / 2', 'Tafel']);
		const steal = run(feud, board, { type: 'strike' }, { type: 'strike' }, { type: 'strike' });
		expect(feud.status(steal).parts).toEqual(['Runde 1 / 2', 'Stehlen']);
		const res = run(feud, steal, { type: 'steal', tile: null });
		expect(feud.status(res).parts).toEqual(['Runde 1 / 2', 'Ergebnis']);
	});

	it('Scenario: Last round fills the progress line', () => {
		const survey = (id: number): Survey => ({ id, question: `Frage ${id}`, answers: [{ text: 'x', points: 30 }, { text: 'y', points: 20 }] });
		const fd = feud.def.init({
			players: [],
			config: { teams: [{ name: 'Rot', players: ['a', 'b'] }, { name: 'Blau', players: ['c', 'd'] }], surveys: [survey(1)], tiebreak: survey(99), saved: [] },
			content: [],
			seed: 1
		});
		const lastRound = run(feud, fd, { type: 'ask' }, { type: 'buzz', team: 0 }, { type: 'answer', tile: 0 });
		expect(feud.status(lastRound)).toEqual({ parts: ['Runde 1 / 1', 'Duell'], progress: 1 });
		const finished = run(feud, lastRound, { type: 'play' }, { type: 'strike' }, { type: 'strike' }, { type: 'strike' }, { type: 'steal', tile: null });
		expect(finished.phase).toBe('result');
		expect(feud.status(finished).progress).toBe(1);
		const over = run(feud, finished, { type: 'next' });
		expect(over.phase).toBe('gameOver');
		expect(feud.status(over)).toEqual({ parts: ['Runde 1 / 1'], progress: 1 });

		// a tie after the last round goes to sudden death
		const tie = { ...finished, scores: [60, 60] as [number, number] };
		const sudden = run(feud, tie, { type: 'next' });
		expect(sudden.phase).toBe('faceoff');
		expect(feud.status(sudden)).toEqual({ parts: ['Stichfrage', 'Duell'], progress: 1 });
		const decided = run(feud, sudden, { type: 'ask' }, { type: 'buzz', team: 0 }, { type: 'answer', tile: 0 });
		expect(feud.status(decided)).toEqual({ parts: ['Stichfrage', 'Ergebnis'], progress: 1 });
		const suddenOver = run(feud, decided, { type: 'next' });
		expect(suddenOver.phase).toBe('gameOver');
		expect(feud.status(suddenOver)).toEqual({ parts: ['Runde 1 / 1'], progress: 1 });

		const wl = wavelength.def.init({ players, config: { teams: [ids(0, 2), ids(2, 4)], rounds: 1 }, content: items(4), seed: 1 });
		const turn = [{ type: 'show' }, { type: 'guess' }, { type: 'lockIn' }, { type: 'next' }];
		expect(wavelength.status(wl).progress).toBe(1);
		expect(wavelength.status(run(wavelength, wl, ...turn, ...turn)).progress).toBe(1);

		const cod = codes.def.init({ players, config: { teams: [ids(0, 3), ids(3, 6)], rounds: 1 }, content: items(4), seed: 1 });
		expect(codes.status(cod).progress).toBe(1);
		const ml = mostLikely.def.init({ players, config: { teams: [ids(0, 3), ids(3, 6)], rounds: 5 }, content: items(8), seed: 1 });
		const last = { ...ml, round: 4 };
		expect(mostLikely.status(last).progress).toBe(1);
	});

	it('Scenario: Duck progress follows the leading score', () => {
		const start = duck.def.init({ players: players.slice(0, 4), config: { target: 10 }, content: items(3), seed: 1 });
		const withTop = (top: number) => ({ ...start, scores: [0, top, 0, 0] });
		expect(duck.status(withTop(0))).toEqual({ parts: ['Ziel 10 Punkte'], progress: 0 });
		expect(duck.status(withTop(4))).toEqual({ parts: ['Ziel 10 Punkte'], progress: 0.4 });
		expect(duck.status(withTop(12))).toEqual({ parts: ['Ziel 10 Punkte'], progress: 1 });
	});
});
