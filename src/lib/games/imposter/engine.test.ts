import { describe, expect, it } from 'vitest';
import type { ContentItem } from '#lib/content/types.ts';
import type { Player } from '#lib/engine/types.ts';
import { imposter, type ImposterAction, type ImposterState } from './engine.ts';

const players = (n: number): Player[] =>
	['Alex', 'Bo', 'Cleo', 'Dani', 'Eli'].slice(0, n).map((name) => ({ id: name.toLowerCase(), name }));

const pairs = (n: number): ContentItem[] =>
	Array.from({ length: n }, (_, i) => ({ id: i + 1, a: `crew ${i + 1}`, b: `imposter ${i + 1}` }));

const start = (n: number, content: ContentItem[], seed = 7) =>
	imposter.init({ players: players(n), config: {}, content, seed });

const run = (s: ImposterState, actions: ImposterAction['type'][]) =>
	actions.reduce((acc, type) => imposter.reduce(acc, { type } as ImposterAction), s);

function playRound(s: ImposterState): ImposterState {
	for (let i = 0; i < s.players.length; i++) s = run(s, ['handover', 'seen']);
	return run(s, ['reveal', 'unmask', 'reveal', 'nextRound']);
}

function freeze<T>(v: T): T {
	if (v && typeof v === 'object') {
		Object.values(v).forEach(freeze);
		Object.freeze(v);
	}
	return v;
}

const allActions: ImposterAction['type'][] = ['handover', 'seen', 'skip', 'handover', 'seen', 'handover', 'seen', 'handover', 'seen', 'handover', 'seen', 'reveal', 'unmask', 'reveal', 'nextRound', 'handover'];

describe('imposter engine contract', () => {
	it('Scenario: Same seed and actions give the same state', () => {
		const a = run(start(4, pairs(5), 42), allActions);
		const b = run(start(4, pairs(5), 42), allActions);
		expect(a).toEqual(b);
		expect(a.round).toBe(2);
	});

	it('Scenario: Reducer does not mutate its input', () => {
		let s = freeze(start(4, pairs(5)));
		for (const type of allActions) {
			const n = imposter.reduce(s, { type } as ImposterAction);
			expect(n).not.toBe(s);
			s = freeze(n);
		}
	});
});

describe('imposter engine', () => {
	it('Scenario: Skip redraws and restarts the reveal', () => {
		let s = start(4, pairs(3));
		s = run(s, ['handover', 'seen', 'handover']);
		expect(s.revealIndex).toBe(1);
		const before = s.pairId;
		s = run(s, ['skip']);
		expect(s.pairId).not.toBe(before);
		expect(s.revealIndex).toBe(0);
		expect(imposter.phase(s)).toBe('handover');

		// a skip after the pool is exhausted still changes the pair
		for (let i = 0; i < 6; i++) {
			const prev = s.pairId;
			s = run(s, ['skip']);
			expect(s.pairId).not.toBe(prev);
		}
	});

	it('Scenario: Name placeholders filled with distinct names', () => {
		const content = [{ id: 1, a: 'Was würde {NAME} {NAME2} schenken?', b: '{NAME} und {NAME2}: Lieblingsessen?' }];
		for (let seed = 1; seed <= 20; seed++) {
			const s = start(3, content, seed);
			const m = s.crew.match(/^Was würde (\w+) (\w+) schenken\?$/);
			expect(m).not.toBeNull();
			const [, n1, n2] = m!;
			expect(n1).not.toBe(n2);
			expect(s.players.map((p) => p.name)).toEqual(expect.arrayContaining([n1, n2]));
			expect(s.imposter).toBe(`${n1} und ${n2}: Lieblingsessen?`);

			let t = s;
			const seen: string[] = [];
			for (let i = 0; i < 3; i++) {
				t = run(t, ['handover']);
				seen.push(t.revealIndex === t.imposterIndex ? t.imposter : t.crew);
				t = run(t, ['seen']);
			}
			expect(seen.filter((q) => q.includes('{'))).toEqual([]);
			expect(t.crew).toBe(s.crew);
		}
	});

	it('Scenario: No repeats until the pool is exhausted', () => {
		let s = start(4, pairs(5));
		const ids = [s.pairId];
		for (let i = 0; i < 9; i++) {
			s = playRound(s);
			ids.push(s.pairId);
		}
		expect(new Set(ids.slice(0, 5)).size).toBe(5);
		expect(new Set(ids.slice(5, 10)).size).toBe(5);
		expect([1, 2, 3, 4, 5]).toContain(ids[5]);
	});

	it('Scenario: Pool of one pair repeats', () => {
		let s = start(3, pairs(1));
		for (let i = 0; i < 4; i++) {
			expect(s.pairId).toBe(1);
			s = playRound(s);
		}
		s = run(s, ['skip']);
		expect(s.pairId).toBe(1);
	});

	it('one round: exactly one imposter, crew to all, unmask, next round in reveal', () => {
		let s = start(4, pairs(3));
		const imposterIndex = s.imposterIndex;
		const saw: string[] = [];
		for (let i = 0; i < 4; i++) {
			s = run(s, ['handover']);
			expect(imposter.phase(s)).toBe('view');
			saw.push(s.revealIndex === s.imposterIndex ? s.imposter : s.crew);
			s = run(s, ['seen']);
		}
		expect(saw.filter((q) => q === s.imposter)).toHaveLength(1);
		expect(imposter.phase(s)).toBe('crew');
		s = run(s, ['reveal']);
		expect(s.shown).toBe(true);
		s = run(s, ['unmask', 'reveal']);
		expect(imposter.phase(s)).toBe('unmask');
		expect(s.imposterIndex).toBe(imposterIndex);
		s = run(s, ['nextRound']);
		expect(imposter.phase(s)).toBe('handover');
		expect(s.round).toBe(2);
		expect(s.revealIndex).toBe(0);
	});

	it('ignores actions that do not fit the phase', () => {
		const s = start(4, pairs(3));
		expect(run(s, ['seen', 'unmask', 'nextRound'])).toBe(s);
	});
});
