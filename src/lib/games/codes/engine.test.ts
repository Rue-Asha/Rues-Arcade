import { describe, expect, it } from 'vitest';
import type { ContentItem } from '#lib/content/types.ts';
import type { Player } from '#lib/engine/types.ts';
import { codes, explainer, guessers, pointsFor, type CodesAction, type CodesState } from './engine.ts';

const names = ['Alex', 'Bo', 'Cleo', 'Dani', 'Eli', 'Fynn', 'Gus'];
const players: Player[] = names.map((name) => ({ id: name.toLowerCase(), name }));

const words = (n: number): ContentItem[] => Array.from({ length: n }, (_, i) => ({ id: i + 1, a: `Wort ${i + 1}`, b: '' }));

const start = (teams: string[][], rounds = 3, content = words(4), seed = 3) =>
	codes.init({ players, config: { teams, rounds }, content, seed });

const step = (s: CodesState, ...actions: CodesAction[]) => actions.reduce((acc, a) => codes.reduce(acc, a), s);

// plays the current round to its result with a guess by the opener, then moves on
const round = (s: CodesState) => step(s, { type: 'start' }, { type: 'guessed' }, { type: 'next' });

const two = [['alex', 'bo'], ['cleo', 'dani']];
const three = [['alex', 'bo'], ['cleo', 'dani'], ['eli', 'fynn']];

function freeze<T>(v: T): T {
	if (v && typeof v === 'object') {
		Object.values(v).forEach(freeze);
		Object.freeze(v);
	}
	return v;
}

const allActions: CodesAction[] = [
	{ type: 'redraw' },
	{ type: 'start' },
	{ type: 'missed' },
	{ type: 'guessed' },
	{ type: 'next' },
	{ type: 'start' },
	{ type: 'missed' },
	{ type: 'missed' },
	{ type: 'missed' },
	{ type: 'skip' },
	{ type: 'next' },
	{ type: 'rematch' }
];

describe('codes engine', () => {
	it('Scenario: Codes engine is deterministic and pure', () => {
		const a = step(start(two, 2, words(4), 42), ...allActions);
		const b = step(start(two, 2, words(4), 42), ...allActions);
		expect(a).toEqual(b);
		expect(codes.phase(a)).toBe('reveal');

		let s = freeze(start(two, 2));
		for (const action of allActions) s = freeze(codes.reduce(s, action));
	});

	it('Scenario: Codes words do not repeat until the pool is used', () => {
		let s = start(two, 5, words(3));
		const seen = [s.word.id];
		for (let i = 0; i < 3; i++) {
			s = round(s);
			seen.push(s.word.id);
		}
		expect(new Set(seen.slice(0, 3)).size).toBe(3);
		expect([1, 2, 3]).toContain(seen[3]);
		expect(s.used).toEqual([seen[3]]);
	});

	it('Scenario: Two-player teams swap roles every round', () => {
		let s = start(two, 3);
		const seen: string[][] = [];
		for (let r = 0; r < 3; r++) {
			seen.push([explainer(s, 0).name, ...guessers(s, 0).map((p) => p.name)]);
			s = round(s);
		}
		expect(seen).toEqual([
			['Alex', 'Bo'],
			['Bo', 'Alex'],
			['Alex', 'Bo']
		]);
	});

	it('Scenario: Teams of different sizes rotate independently', () => {
		let s = start([['alex', 'bo'], ['cleo', 'dani', 'eli']], 3);
		const small: string[] = [];
		const big: string[] = [];
		for (let r = 0; r < 3; r++) {
			small.push(explainer(s, 0).name);
			big.push(explainer(s, 1).name);
			for (const t of [0, 1]) {
				const team = s.teams[t].players.map((p) => p.name);
				expect([explainer(s, t).name, ...guessers(s, t).map((p) => p.name)].sort()).toEqual(team.sort());
				expect(guessers(s, t).map((p) => p.name)).not.toContain(explainer(s, t).name);
			}
			s = round(s);
		}
		expect(small).toEqual(['Alex', 'Bo', 'Alex']);
		expect(big).toEqual(['Cleo', 'Dani', 'Eli']);
	});

	it('Scenario: Opening team rotates from a random start', () => {
		let s = start(three, 4);
		const opener = s.startTeam;
		const openers: number[] = [];
		for (let r = 0; r < 4; r++) {
			openers.push(s.teamIndex);
			s = round(s);
		}
		expect(openers).toEqual([0, 1, 2, 0].map((k) => (opener + k) % 3));

		const starts = new Set(Array.from({ length: 12 }, (_, seed) => start(three, 4, words(4), seed).startTeam));
		expect(starts.size).toBeGreaterThan(1);

		const play = step(start(three, 4), { type: 'start' });
		const order = [play.teamIndex];
		let t = play;
		for (let i = 0; i < 3; i++) {
			t = step(t, { type: 'missed' });
			order.push(t.teamIndex);
		}
		expect(order).toEqual([0, 1, 2, 0].map((k) => (opener + k) % 3));
	});

	it('Scenario: Anderes Wort returns the rejected word', () => {
		for (let seed = 0; seed < 10; seed++) {
			const first = start(two, 5, words(3), seed);
			const rejected = first.word.id;
			let s = step(first, { type: 'redraw' });
			expect(s.word.id).not.toBe(rejected);
			expect(s.used).not.toContain(rejected);
			const drawn = [s.word.id];
			for (let i = 0; i < 2; i++) {
				s = round(s);
				drawn.push(s.word.id);
			}
			expect(drawn).toContain(rejected);
			expect(new Set(drawn).size).toBe(3);
			s = round(s);
			expect(s.used).toEqual([s.word.id]);
		}
	});

	it('Scenario: Anderes Wort on a pool of one word', () => {
		const s = freeze(start(two, 3, words(1)));
		expect(() => codes.reduce(s, { type: 'redraw' })).not.toThrow();
		expect(codes.reduce(s, { type: 'redraw' })).toEqual(s);
	});

	it('Scenario: Codes points by attempt', () => {
		expect([0, 1, 2, 4].map(pointsFor)).toEqual([3, 2, 1, 1]);
		let s = start(two, 4);
		for (const [attempt, points] of [
			[0, 3],
			[1, 2],
			[2, 1],
			[4, 1]
		]) {
			s = step(s, { type: 'start' }, ...Array.from({ length: attempt }, () => ({ type: 'missed' }) as const));
			const team = s.teamIndex;
			const before = s.teams[team].score;
			s = step(s, { type: 'guessed' });
			expect(s.phase).toBe('result');
			expect(s.teams[team].score - before).toBe(points);
			expect(s.lastResult).toEqual({ kind: 'guessed', teamIndex: team, points, word: s.word.a });
			s = step(s, { type: 'next' });
		}
	});

	it('Scenario: Daneben passes to the next team', () => {
		let s = step(start(three, 1), { type: 'start' });
		const opener = s.teamIndex;
		const seen: [number, number][] = [];
		for (let i = 0; i < 3; i++) {
			s = step(s, { type: 'missed' });
			seen.push([s.teamIndex, s.attempt]);
		}
		expect(seen).toEqual([
			[(opener + 1) % 3, 1],
			[(opener + 2) % 3, 2],
			[opener, 3]
		]);
		expect(s.phase).toBe('play');
	});

	it('Scenario: Überspringen from the third miss', () => {
		const at2 = step(start(two, 2), { type: 'start' }, { type: 'missed' }, { type: 'missed' });
		expect(codes.reduce(at2, { type: 'skip' })).toEqual(at2);
		const at3 = step(at2, { type: 'missed' });
		const skipped = step(at3, { type: 'skip' });
		expect(skipped.phase).toBe('result');
		expect(skipped.teams.map((t) => t.score)).toEqual([0, 0]);
		expect(skipped.lastResult).toEqual({ kind: 'skipped', teamIndex: at3.teamIndex, points: 0, word: at3.word.a });
	});

	it('ends after the last round', () => {
		let s = start(two, 2);
		s = round(s);
		expect(s.phase).toBe('reveal');
		s = step(s, { type: 'start' }, { type: 'guessed' });
		expect(s.phase).toBe('result');
		s = step(s, { type: 'next' });
		expect(s.phase).toBe('gameOver');
	});

	it('Scenario: Codes rematch keeps the teams', () => {
		const over = round(start(three, 1));
		expect(over.phase).toBe('gameOver');
		const again = step(over, { type: 'rematch' });
		expect(again.phase).toBe('reveal');
		expect(again.teams.map((t) => [t.name, t.players])).toEqual(over.teams.map((t) => [t.name, t.players]));
		expect(again.teams.map((t) => t.score)).toEqual([0, 0, 0]);
		expect(again.roundIndex).toBe(0);
		expect(again.rng).not.toEqual(over.rng);
		expect(again.teamIndex).toBe(again.startTeam);

		const openers = new Set(
			Array.from({ length: 12 }, (_, seed) => step(round(start(three, 1, words(4), seed)), { type: 'rematch' }).startTeam)
		);
		expect(openers.size).toBeGreaterThan(1);
	});

	it('ignores actions outside their phase', () => {
		const s = start(two, 1);
		for (const type of ['guessed', 'missed', 'skip', 'next', 'rematch'] as const) expect(codes.reduce(s, { type })).toBe(s);
		const play = step(s, { type: 'start' });
		for (const type of ['start', 'redraw', 'next', 'rematch'] as const) expect(codes.reduce(play, { type })).toBe(play);
	});
});
