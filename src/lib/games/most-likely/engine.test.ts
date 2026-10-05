import { describe, expect, it } from 'vitest';
import type { ContentItem } from '#lib/content/types.ts';
import type { Player } from '#lib/engine/types.ts';
import { leaders, mostLikely, ranking, type MostLikelyAction, type MostLikelyState } from './engine.ts';

const names = ['Alex', 'Bo', 'Cleo', 'Dani'];
const players: Player[] = names.map((name) => ({ id: name.toLowerCase(), name }));

const prompts = (n: number): ContentItem[] =>
	Array.from({ length: n }, (_, i) => ({ id: i + 1, a: `Wer würde am ehesten ${i + 1}?`, b: '' }));

const start = (rounds: 5 | 10 | 15 | 20 = 5, content = prompts(3), seed = 7) =>
	mostLikely.init({ players, config: { rounds }, content, seed });

const step = (s: MostLikelyState, ...actions: MostLikelyAction[]) =>
	actions.reduce((acc, a) => mostLikely.reduce(acc, a), s);

const round = (s: MostLikelyState, ...picks: number[]) =>
	step(s, { type: 'point' }, ...picks.map((player) => ({ type: 'toggle', player }) as const), { type: 'confirm' }, { type: 'next' });

function freeze<T>(v: T): T {
	if (v && typeof v === 'object') {
		Object.values(v).forEach(freeze);
		Object.freeze(v);
	}
	return v;
}

const allActions: MostLikelyAction[] = [
	{ type: 'redraw' },
	{ type: 'point' },
	{ type: 'toggle', player: 0 },
	{ type: 'toggle', player: 2 },
	{ type: 'toggle', player: 0 },
	{ type: 'confirm' },
	{ type: 'next' },
	{ type: 'point' },
	{ type: 'toggle', player: 1 },
	{ type: 'confirm' },
	{ type: 'next' },
	{ type: 'rematch' }
];

describe('most likely engine', () => {
	it('Scenario: Most Likely engine is deterministic and pure', () => {
		const a = step(start(5, prompts(4), 42), ...allActions);
		const b = step(start(5, prompts(4), 42), ...allActions);
		expect(a).toEqual(b);
		expect(a.titles).toEqual([0, 1, 1, 0]);

		let s = freeze(start(5, prompts(4), 42));
		for (const action of allActions) {
			const before = structuredClone(s);
			const n = mostLikely.reduce(s, action);
			expect(s).toEqual(before);
			s = freeze(n);
		}
	});

	it('Scenario: Most Likely prompts do not repeat until the pool is used', () => {
		for (let seed = 1; seed <= 20; seed++) {
			let s = start(5, prompts(3), seed);
			const seen = [s.prompt.id];
			for (let i = 0; i < 3; i++) {
				s = round(s, 0);
				seen.push(s.prompt.id);
			}
			expect(new Set(seen.slice(0, 3)).size).toBe(3);
			expect([1, 2, 3]).toContain(seen[3]);
			expect(s.used).toEqual([seen[3]]);
		}
	});

	it('Scenario: Anderer Spruch returns the rejected prompt', () => {
		for (let seed = 1; seed <= 20; seed++) {
			let s = start(5, prompts(3), seed);
			const rejected = s.prompt.id;
			s = step(s, { type: 'redraw' });
			expect(s.phase).toBe('prompt');
			expect(s.prompt.id).not.toBe(rejected);
			expect(s.used).not.toContain(rejected);

			const shown = [s.prompt.id];
			for (let i = 0; i < 2; i++) {
				s = round(s, 0);
				shown.push(s.prompt.id);
			}
			expect(shown).toContain(rejected);
			expect(new Set(shown).size).toBe(3);
		}
	});

	it('redraw keeps a one-prompt pool and only works on the prompt screen', () => {
		const one = start(5, prompts(1));
		expect(step(one, { type: 'redraw' }).prompt.id).toBe(1);
		const pick = step(start(), { type: 'point' });
		expect(step(pick, { type: 'redraw' })).toBe(pick);
	});

	it('Scenario: Tied pick gives every chosen player a title', () => {
		let s = step(start(), { type: 'point' });
		expect(s.phase).toBe('pick');
		expect(step(s, { type: 'confirm' })).toBe(s);
		s = step(s, { type: 'toggle', player: 0 }, { type: 'toggle', player: 2 }, { type: 'confirm' });
		expect(s.phase).toBe('reveal');
		expect(s.chosen).toEqual([0, 2]);
		expect(s.titles).toEqual([1, 0, 1, 0]);
		expect(s.prompt.a).toMatch(/^Wer würde am ehesten/);
	});

	it('toggle off removes the player and is ignored outside the pick', () => {
		let s = step(start(), { type: 'toggle', player: 1 });
		expect(s.chosen).toEqual([]);
		s = step(s, { type: 'point' }, { type: 'toggle', player: 1 }, { type: 'toggle', player: 3 }, { type: 'toggle', player: 1 });
		expect(s.chosen).toEqual([3]);
		expect(step(s, { type: 'toggle', player: 9 })).toBe(s);
	});

	it('a full game ends after the last round and ranks by titles', () => {
		let s = start(5);
		for (const pick of [[0], [0], [1], [0], [1, 2]]) {
			expect(s.phase).toBe('prompt');
			s = step(s, { type: 'point' }, ...pick.map((player) => ({ type: 'toggle', player }) as const), { type: 'confirm' });
			if (s.round < 4) s = step(s, { type: 'next' });
		}
		expect(s.round).toBe(4);
		s = step(s, { type: 'next' });
		expect(s.phase).toBe('gameOver');
		expect(s.titles).toEqual([3, 2, 1, 0]);
		expect(ranking(s).map((r) => [r.player.name, r.titles, r.rank])).toEqual([
			['Alex', 3, 1],
			['Bo', 2, 2],
			['Cleo', 1, 3],
			['Dani', 0, 4]
		]);
		expect(leaders(s).map((p) => p.name)).toEqual(['Alex']);
	});

	it('tied titles share a rank and both lead', () => {
		const s: MostLikelyState = { ...start(), phase: 'gameOver', titles: [3, 1, 3, 0] };
		expect(ranking(s).map((r) => [r.player.name, r.rank])).toEqual([
			['Alex', 1],
			['Cleo', 1],
			['Bo', 3],
			['Dani', 4]
		]);
		expect(leaders(s).map((p) => p.name)).toEqual(['Alex', 'Cleo']);
	});

	it('Scenario: Most Likely rematch keeps the players', () => {
		let s = start(5);
		for (let i = 0; i < 5; i++) s = round(s, i % 4);
		expect(s.phase).toBe('gameOver');
		const again = step(s, { type: 'rematch' });
		expect(again.phase).toBe('prompt');
		expect(again.players).toEqual(s.players);
		expect(again.rounds).toBe(5);
		expect(again.titles).toEqual([0, 0, 0, 0]);
		expect(again.round).toBe(0);
		expect(again.chosen).toEqual([]);
		expect(step(start(), { type: 'rematch' }).phase).toBe('prompt');
	});
});
