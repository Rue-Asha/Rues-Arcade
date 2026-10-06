import { describe, expect, it } from 'vitest';
import type { Survey } from '#lib/content/types.ts';
import { due, feud, named, type FeudAction, type FeudState, type FeudTeam } from './engine.ts';

const survey = (id: number, points: number[]): Survey => ({
	id,
	question: `Frage ${id}`,
	answers: points.map((p, i) => ({ text: `Antwort ${id}.${i + 1}`, points: p }))
});

const team = (name: string, ...players: string[]): FeudTeam => ({ name, players });

const A3 = team('Team A', 'a1', 'a2', 'a3');
const B2 = team('Team B', 'b1', 'b2');
const A2 = team('Team A', 'a1', 'a2');

const start = (rounds = 3, teams: [FeudTeam, FeudTeam] = [A3, B2], seed = 7) =>
	feud.init({
		players: [],
		config: {
			teams,
			surveys: Array.from({ length: rounds }, (_, i) => survey(i + 1, [30, 25, 18, 12, 8])),
			tiebreak: survey(99, [40, 30, 20]),
			saved: [1, 2, 3, 4, 5]
		},
		content: [],
		seed
	});

const step = (s: FeudState, ...actions: FeudAction[]) => actions.reduce((acc, a) => feud.reduce(acc, a), s);

// the first named player hits #1, the team plays, three strikes, the steal misses, the round closes
const strikes: FeudAction[] = [{ type: 'strike' }, { type: 'strike' }, { type: 'strike' }];
const quick = (s: FeudState) =>
	step(s, { type: 'answer', tile: 0 }, { type: 'play' }, ...strikes, { type: 'steal', tile: null }, { type: 'next' });

describe('feud engine: face-off', () => {
	it('Scenario: Feud face-off names players in rotation', () => {
		let s = start(3);
		const pairs: string[][] = [];
		for (let r = 0; r < 3; r++) {
			pairs.push(named(s));
			s = quick(s);
		}
		expect(pairs).toEqual([
			['a1', 'b1'],
			['a2', 'b2'],
			['a3', 'b1']
		]);
	});

	it('Scenario: Feud face-off rotation wraps for a team of two', () => {
		let s = start(5, [A2, B2]);
		const seen: string[] = [];
		for (let r = 0; r < 5; r++) {
			seen.push(named(s)[0]);
			s = quick(s);
		}
		expect(seen).toEqual(['a1', 'a2', 'a1', 'a2', 'a1']);
	});

	it('Scenario: Feud number one answer wins at once', () => {
		const s = step(start(), { type: 'answer', tile: 0 });
		expect(s.phase).toBe('choose');
		expect(s.control).toBe(0);
		expect(s.revealed).toEqual([true, false, false, false, false]);
		expect(step(s, { type: 'answer', tile: 1 })).toBe(s);

		// round 2: team B answers first, and its #1 wins at once too
		const r2 = quick(start());
		expect(due(r2)).toBe(1);
		const won = step(r2, { type: 'answer', tile: 0 });
		expect(won.phase).toBe('choose');
		expect(won.control).toBe(1);
	});

	it('Scenario: Feud higher answer wins the face-off', () => {
		const s0 = start();
		expect(due(s0)).toBe(0);
		const s1 = step(s0, { type: 'answer', tile: 3 });
		expect(s1.phase).toBe('faceoff');
		expect(due(s1)).toBe(1);
		const s = step(s1, { type: 'answer', tile: 1 });
		expect(s.phase).toBe('choose');
		expect(s.control).toBe(1);
		expect(s.revealed).toEqual([false, true, false, true, false]);
	});

	it('Scenario: Feud one miss loses the face-off', () => {
		const s = step(start(), { type: 'answer', tile: null }, { type: 'answer', tile: 4 });
		expect(s.phase).toBe('choose');
		expect(s.control).toBe(1);
		expect(s.revealed).toEqual([false, false, false, false, true]);

		const hit = step(start(), { type: 'answer', tile: 4 }, { type: 'answer', tile: null });
		expect(hit.control).toBe(0);
	});

	it('Scenario: Feud both miss names the next pair', () => {
		let s = start();
		const pairs = [named(s)];
		for (let i = 0; i < 3; i++) {
			s = step(s, { type: 'answer', tile: null }, { type: 'answer', tile: null });
			expect(s.phase).toBe('faceoff');
			expect(due(s)).toBe(0);
			pairs.push(named(s));
		}
		expect(pairs).toEqual([
			['a1', 'b1'],
			['a2', 'b2'],
			['a3', 'b1'],
			['a1', 'b2']
		]);
	});

	it('Scenario: Feud winner chooses Spielen or Passen', () => {
		const played = step(start(), { type: 'answer', tile: 0 }, { type: 'play' });
		expect(played.phase).toBe('board');
		expect(played.playing).toBe(0);

		// round 2 opens with team B, which misses, so team A wins
		const r2 = step(quick(start()), { type: 'answer', tile: null }, { type: 'answer', tile: 2 });
		expect(r2.control).toBe(0);
		const passed = step(r2, { type: 'pass' });
		expect(passed.phase).toBe('board');
		expect(passed.playing).toBe(1);
	});
});
