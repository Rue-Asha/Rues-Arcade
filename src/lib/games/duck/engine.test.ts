import { describe, expect, it } from 'vitest';
import type { ContentItem } from '#lib/content/types.ts';
import type { Player } from '#lib/engine/types.ts';
import { duck, type DuckAction, type DuckConfig, type DuckState } from './engine.ts';

const players = (n: number): Player[] =>
	['Alex', 'Bo', 'Cleo', 'Dani', 'Eli'].slice(0, n).map((name) => ({ id: name.toLowerCase(), name }));

const words = (n: number): ContentItem[] => Array.from({ length: n }, (_, i) => ({ id: i + 1, a: `Wort ${i + 1}`, b: '' }));

const start = (n = 4, content = words(5), seed = 7, target: DuckConfig['target'] = 10) =>
	duck.init({ players: players(n), config: { target }, content, seed });

const run = (s: DuckState, actions: DuckAction[]) => actions.reduce((acc, a) => duck.reduce(acc, a), s);

// reveal → scoring with the given box taps, then Weiter
const word = (s: DuckState, taps: DuckAction[] = []) => run(s, [{ type: 'show' }, { type: 'play' }, ...taps, { type: 'commit' }]);

function freeze<T>(v: T): T {
	if (v && typeof v === 'object') {
		Object.values(v).forEach(freeze);
		Object.freeze(v);
	}
	return v;
}

const script: DuckAction[] = [
	{ type: 'skip' },
	{ type: 'show' },
	{ type: 'play' },
	{ type: 'score', player: 0, box: 3 },
	{ type: 'letter', player: 1, letter: 4 },
	{ type: 'commit' },
	{ type: 'next' },
	{ type: 'show' },
	{ type: 'play' },
	{ type: 'score', player: 2, box: 10 },
	{ type: 'commit' },
	{ type: 'restart' }
];

describe('duck engine contract', () => {
	it('Scenario: Duck engine is deterministic and pure', () => {
		const a = run(start(4, words(5), 42), script);
		const b = run(start(4, words(5), 42), script);
		expect(a).toEqual(b);
		expect(duck.phase(a)).toBe('reveal');

		let s = freeze(start(4, words(5), 42));
		for (const action of script) {
			const n = duck.reduce(s, action);
			expect(n).not.toBe(s);
			s = freeze(n);
		}
	});
});

describe('duck engine', () => {
	it('Scenario: Chuck starts random and moves after a played word', () => {
		const holders = new Set(Array.from({ length: 12 }, (_, seed) => start(4, words(5), seed).chuck));
		expect(holders.size).toBeGreaterThan(1);
		for (const h of holders) expect(h).toBeGreaterThanOrEqual(0);
		for (const h of holders) expect(h).toBeLessThan(4);

		const seed = Array.from({ length: 50 }, (_, i) => i).find((i) => start(4, words(5), i).chuck === 3)!;
		let s = start(4, words(5), seed);
		s = word(s, [{ type: 'score', player: 0, box: 1 }]);
		expect(s.phase).toBe('standings');
		expect(s.chuck).toBe(0);
		s = word(run(s, [{ type: 'next' }]));
		expect(s.chuck).toBe(1);
	});

	it('Scenario: Chuck stays on skip and at game end', () => {
		let s = start();
		const holder = s.chuck;
		s = run(s, [{ type: 'skip' }]);
		expect(s.chuck).toBe(holder);
		s = run(s, [{ type: 'show' }, { type: 'skip' }]);
		expect(s.chuck).toBe(holder);

		const over = word(start(), [{ type: 'score', player: 1, box: 10 }]);
		expect(over.phase).toBe('gameOver');
		expect(over.chuck).toBe(holder);
	});

	it('Scenario: Duck skip asks first and keeps the word used', () => {
		let s = start(4, words(3));
		const first = s.word.id;
		s = run(s, [{ type: 'skip' }]);
		expect(s.word.id).not.toBe(first);
		expect(s.used).toEqual([first, s.word.id]);
		expect(s.phase).toBe('reveal');
		expect(s.shown).toBe(false);
		const second = s.word.id;
		s = word(s);
		s = run(s, [{ type: 'next' }]);
		const third = s.word.id;
		expect([first, second]).not.toContain(third);
		expect(new Set([first, second, third]).size).toBe(3);

		// once the pool is used up a skip still changes the word
		for (let i = 0; i < 6; i++) {
			const prev = s.word.id;
			s = run(s, [{ type: 'skip' }]);
			expect(s.word.id).not.toBe(prev);
		}
	});

	it('Scenario: Duck words do not repeat until the pool is used', () => {
		for (let seed = 1; seed <= 10; seed++) {
			let s = start(4, words(3), seed);
			const seen = [s.word.id];
			for (let i = 0; i < 3; i++) {
				s = run(word(s), [{ type: 'next' }]);
				seen.push(s.word.id);
			}
			expect(new Set(seen.slice(0, 3)).size).toBe(3);
			expect([1, 2, 3]).toContain(seen[3]);
			expect(s.used).toEqual([seen[3]]);
		}
	});

	it('Scenario: Point boxes set and clear the score', () => {
		let s = word(start(4, words(5), 7, 20), [{ type: 'score', player: 0, box: 2 }]);
		s = run(s, [{ type: 'next' }, { type: 'show' }, { type: 'play' }]);
		expect(s.scores[0]).toBe(2);
		s = run(s, [{ type: 'score', player: 0, box: 5 }]);
		expect(s.scores[0]).toBe(5);
		s = run(s, [{ type: 'score', player: 0, box: 5 }]);
		expect(s.scores[0]).toBe(4);
		s = run(s, [{ type: 'score', player: 0, box: 1 }]);
		expect(s.scores[0]).toBe(4);
		// clearing the lowest open box never goes under the word's start
		s = run(s, [{ type: 'score', player: 0, box: 3 }, { type: 'score', player: 0, box: 3 }]);
		expect(s.scores[0]).toBe(2);
		expect(s.scores.slice(1)).toEqual([0, 0, 0]);
	});

	it('Scenario: Score capped at the target', () => {
		let s = run(start(), [{ type: 'show' }, { type: 'play' }]);
		s = run(s, [{ type: 'score', player: 2, box: 10 }]);
		expect(s.scores[2]).toBe(10);
		s = run(s, [{ type: 'score', player: 1, box: 11 }]);
		expect(s.scores[1]).toBe(0);
		expect(s.target).toBe(10);
	});

	it('Scenario: DUCKY letters cross and restore within the word', () => {
		let s = word(start(4, words(5), 7, 50), [{ type: 'letter', player: 0, letter: 4 }]);
		s = run(s, [{ type: 'next' }, { type: 'show' }, { type: 'play' }]);
		expect(s.lives[0]).toBe(4);
		s = run(s, [{ type: 'letter', player: 0, letter: 2 }]);
		expect(s.lives[0]).toBe(2);
		s = run(s, [{ type: 'letter', player: 0, letter: 3 }]);
		expect(s.lives[0]).toBe(4);
		s = run(s, [{ type: 'letter', player: 0, letter: 4 }]);
		expect(s.lives[0]).toBe(4);
		s = run(s, [{ type: 'letter', player: 0, letter: 2 }, { type: 'letter', player: 0, letter: 2 }]);
		expect(s.lives[0]).toBe(3);
	});

	it('Scenario: Duck ends at target or zero lives', () => {
		const lose = (p: number): DuckAction => ({ type: 'letter', player: p, letter: 0 });
		const hit = (p: number): DuckAction => ({ type: 'score', player: p, box: 10 });

		const target = word(start(), [{ type: 'score', player: 0, box: 4 }, hit(2)]);
		expect(target.phase).toBe('gameOver');
		expect(target.endReason).toBe('target');
		expect(target.winners).toEqual([2]);

		const lives = word(start(), [{ type: 'score', player: 3, box: 2 }, lose(1)]);
		expect(lives.phase).toBe('gameOver');
		expect(lives.endReason).toBe('lives');
		expect(lives.winners).toEqual([3]);

		const both = word(start(), [hit(0), lose(1)]);
		expect(both.endReason).toBe('target');

		const neither = word(start(), [{ type: 'score', player: 0, box: 9 }, { type: 'letter', player: 1, letter: 1 }]);
		expect(neither.phase).toBe('standings');
		expect(neither.endReason).toBeNull();

		const tie = word(start(), [hit(0), hit(1), { type: 'score', player: 2, box: 4 }]);
		expect(tie.winners).toEqual([0, 1]);
	});

	it('Scenario: Duck Neue Runde redraws Chuck', () => {
		const chucks = new Set<number>();
		for (let seed = 1; seed <= 12; seed++) {
			const over = word(start(4, words(5), seed), [
				{ type: 'score', player: 0, box: 10 },
				{ type: 'letter', player: 1, letter: 2 }
			]);
			const s = run(over, [{ type: 'restart' }]);
			expect(s.phase).toBe('reveal');
			expect(s.scores).toEqual([0, 0, 0, 0]);
			expect(s.lives).toEqual([5, 5, 5, 5]);
			expect(s.baseScores).toEqual([0, 0, 0, 0]);
			expect(s.baseLives).toEqual([5, 5, 5, 5]);
			expect(s.players).toEqual(over.players);
			expect(s.endReason).toBeNull();
			expect(s.winners).toEqual([]);
			chucks.add(s.chuck);
		}
		expect(chucks.size).toBeGreaterThan(1);
	});

	it('ignores actions outside their phase', () => {
		const s = start();
		for (const a of [
			{ type: 'play' },
			{ type: 'score', player: 0, box: 1 },
			{ type: 'letter', player: 0, letter: 0 },
			{ type: 'commit' },
			{ type: 'next' },
			{ type: 'restart' }
		] as DuckAction[])
			expect(duck.reduce(s, a)).toBe(s);
	});
});
