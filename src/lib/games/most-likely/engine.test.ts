import { describe, expect, it } from 'vitest';
import type { ContentItem } from '#lib/content/types.ts';
import { int } from '#lib/engine/rng.ts';
import type { Player } from '#lib/engine/types.ts';
import {
	choices,
	current,
	dealTeams,
	leaders,
	maxTeams,
	mostLikely,
	order,
	ranking,
	type MostLikelyAction,
	type MostLikelyState
} from './engine.ts';

const names = ['Alex', 'Bo', 'Cleo', 'Dani', 'Eli', 'Fynn', 'Gus'];
const players: Player[] = names.map((name) => ({ id: name.toLowerCase(), name }));

const prompts = (n: number): ContentItem[] =>
	Array.from({ length: n }, (_, i) => ({ id: i + 1, a: `Wer würde am ehesten ${i + 1}?`, b: '' }));

const two = [['alex', 'bo'], ['cleo', 'dani']];
const three = [['alex', 'bo', 'cleo'], ['dani', 'eli'], ['fynn', 'gus']];

const start = (teams = two, rounds: 5 | 10 | 15 | 20 = 5, content = prompts(3), seed = 7) =>
	mostLikely.init({ players, config: { teams, rounds }, content, seed });

// the first seed whose game opens with the given team
const openingWith = (teams: string[][], opener: number) => {
	let seed = 1;
	while (start(teams, 5, prompts(3), seed).startTeam !== opener) seed++;
	return start(teams, 5, prompts(3), seed);
};

const step = (s: MostLikelyState, ...actions: MostLikelyAction[]) =>
	actions.reduce((acc, a) => mostLikely.reduce(acc, a), s);

// plays the team on turn to its result, then moves on
const turn = (s: MostLikelyState, matched = 0) =>
	step(s, { type: 'point' }, { type: 'score', matched }, { type: 'next' });

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
	{ type: 'score', matched: 1 },
	{ type: 'score', matched: 2 },
	{ type: 'next' },
	{ type: 'point' },
	{ type: 'score', matched: 0 },
	{ type: 'next' },
	{ type: 'rematch' }
];

describe('most likely engine', () => {
	it('Scenario: Most Likely deals teams evenly', () => {
		const ids = names.map((n) => n.toLowerCase());
		const teams = dealTeams(ids, 3);
		expect(teams.map((t) => t.length)).toEqual([3, 2, 2]);
		expect(teams.flat().sort()).toEqual([...ids].sort());
		ids.forEach((id, i) => expect(teams[i % 3]).toContain(id));

		expect([4, 5, 16, 20].map(maxTeams)).toEqual([2, 2, 8, 8]);
		expect(choices(2)).toEqual([0, 2]);
		expect(choices(4)).toEqual([0, 2, 3, 4]);
	});

	it('Scenario: Most Likely opener comes from the RNG', () => {
		const openers = new Set<number>();
		for (let seed = 1; seed <= 12; seed++) {
			const s = start(three, 5, prompts(3), seed);
			expect(s.startTeam).toBe(int({ state: seed }, 0, 2)[0]);
			expect(current(s)).toBe(s.startTeam);
			openers.add(s.startTeam);
		}
		expect(openers.size).toBeGreaterThan(1);
	});

	it('Scenario: Most Likely opener rotates each round', () => {
		let s = openingWith(three, 1);
		const played: string[][] = [];
		for (let r = 0; r < 2; r++) {
			expect(order(s).map((t) => s.teams[t].name)).toHaveLength(3);
			played.push([]);
			for (let k = 0; k < 3; k++) {
				expect([s.round, s.turn]).toEqual([r, k]);
				expect(current(s)).toBe(order(s)[k]);
				played[r].push(s.teams[current(s)].name);
				s = turn(s);
			}
		}
		expect(played).toEqual([
			['Team 2', 'Team 3', 'Team 1'],
			['Team 3', 'Team 1', 'Team 2']
		]);
	});

	it('Scenario: Most Likely team scores its largest group', () => {
		let s = openingWith(three, 0);
		s = { ...s, teams: s.teams.map((t, i) => (i === 0 ? { ...t, score: 1 } : t)) };

		s = step(s, { type: 'point' });
		expect(s.phase).toBe('count');
		s = step(s, { type: 'score', matched: 3 });
		expect(s.phase).toBe('result');
		expect(s.lastPoints).toBe(3);
		expect(s.teams[0].score).toBe(4);

		s = step(s, { type: 'next' }, { type: 'point' }, { type: 'score', matched: 0 });
		expect(current(s)).toBe(1);
		expect(s.lastPoints).toBe(0);
		expect(s.teams.map((t) => t.score)).toEqual([4, 0, 0]);
	});

	it('Scenario: Most Likely ignores impossible counts', () => {
		const s = step(openingWith(three, 0), { type: 'point' });
		expect(s.teams[current(s)].players).toHaveLength(3);
		for (const matched of [1, 4, -1, 2.5]) expect(step(s, { type: 'score', matched })).toBe(s);
	});

	it('Scenario: Most Likely keeps no record of who pointed at whom', () => {
		const keys = ['lastPoints', 'phase', 'pool', 'prompt', 'rng', 'round', 'rounds', 'startTeam', 'teams', 'turn', 'used'];
		let s = start(three, 5);
		const states = [s];
		while (s.phase !== 'gameOver') {
			for (const a of [{ type: 'point' }, { type: 'score', matched: s.round % 2 ? 2 : 0 }, { type: 'next' }] as const)
				states.push((s = step(s, a)));
		}
		expect(states).toHaveLength(5 * 3 * 3 + 1);
		for (const st of states) {
			expect(Object.keys(st).sort()).toEqual(keys);
			for (const t of st.teams) expect(Object.keys(t).sort()).toEqual(['name', 'players', 'score']);
			expect(st.teams.map((t) => t.players)).toEqual(states[0].teams.map((t) => t.players));
		}
	});

	it('Scenario: Most Likely prompts do not repeat until the pool is used', () => {
		for (let seed = 1; seed <= 20; seed++) {
			let s = start(two, 5, prompts(3), seed);
			const seen = [s.prompt.id];
			for (let i = 0; i < 3; i++) {
				s = turn(s);
				seen.push(s.prompt.id);
			}
			expect(new Set(seen.slice(0, 3)).size).toBe(3);
			expect([1, 2, 3]).toContain(seen[3]);
			expect(s.used).toEqual([seen[3]]);
		}
	});

	it('Scenario: Anderer Spruch returns the rejected prompt', () => {
		for (let seed = 1; seed <= 20; seed++) {
			let s = start(two, 5, prompts(3), seed);
			const team = current(s);
			const rejected = s.prompt.id;
			s = step(s, { type: 'redraw' });
			expect(s.phase).toBe('prompt');
			expect(current(s)).toBe(team);
			expect(s.prompt.id).not.toBe(rejected);
			expect(s.used).not.toContain(rejected);

			const shown = [s.prompt.id];
			for (let i = 0; i < 2; i++) {
				s = turn(s);
				shown.push(s.prompt.id);
			}
			expect(shown).toContain(rejected);
			expect(new Set(shown).size).toBe(3);
		}
	});

	it('Scenario: Most Likely pool of one keeps its prompt', () => {
		const one = start(two, 5, prompts(1));
		expect(step(one, { type: 'redraw' })).toEqual(one);
		expect(one.prompt.id).toBe(1);
		const count = step(start(), { type: 'point' });
		expect(step(count, { type: 'redraw' })).toBe(count);
	});

	it('a full game ends after the last turn of the last round and ranks the teams', () => {
		let s = start(three, 5);
		for (let r = 0; r < 5; r++)
			for (let k = 0; k < 3; k++) {
				expect(s.phase).toBe('prompt');
				const t = current(s);
				s = step(s, { type: 'point' }, { type: 'score', matched: [3, 2, 0][t] });
				if (r < 4 || k < 2) s = step(s, { type: 'next' });
			}
		expect([s.round, s.turn, s.phase]).toEqual([4, 2, 'result']);
		s = step(s, { type: 'next' });
		expect(s.phase).toBe('gameOver');
		expect(s.teams.map((t) => t.score)).toEqual([15, 10, 0]);
		expect(ranking(s).map((r) => [r.team.name, r.team.score, r.rank])).toEqual([
			['Team 1', 15, 1],
			['Team 2', 10, 2],
			['Team 3', 0, 3]
		]);
		expect(leaders(s).map((t) => t.name)).toEqual(['Team 1']);
	});

	it('tied teams share a rank and both lead', () => {
		const s0 = start(three);
		const s: MostLikelyState = { ...s0, phase: 'gameOver', teams: s0.teams.map((t, i) => ({ ...t, score: [4, 2, 4][i] })) };
		expect(ranking(s).map((r) => [r.team.name, r.rank])).toEqual([
			['Team 1', 1],
			['Team 3', 1],
			['Team 2', 3]
		]);
		expect(leaders(s).map((t) => t.name)).toEqual(['Team 1', 'Team 3']);
	});

	it('Scenario: Most Likely rematch keeps the teams', () => {
		let s = start(three, 5);
		while (s.phase !== 'gameOver') s = turn(s, 2);
		const again = step(s, { type: 'rematch' });
		expect(again.phase).toBe('prompt');
		expect(again.teams.map((t) => [t.name, t.players])).toEqual(s.teams.map((t) => [t.name, t.players]));
		expect(again.teams.map((t) => t.score)).toEqual([0, 0, 0]);
		expect([again.rounds, again.round, again.turn, again.lastPoints]).toEqual([5, 0, 0, null]);
		expect(again.rng).not.toEqual(s.rng);
		expect(current(again)).toBe(again.startTeam);

		const openers = new Set(
			Array.from({ length: 12 }, (_, seed) => {
				let g = start(three, 5, prompts(3), seed);
				while (g.phase !== 'gameOver') g = turn(g);
				return step(g, { type: 'rematch' }).startTeam;
			})
		);
		expect(openers.size).toBeGreaterThan(1);
		const fresh = start();
		expect(step(fresh, { type: 'rematch' })).toBe(fresh);
	});

	it('Scenario: Most Likely engine is deterministic and pure', () => {
		const a = step(start(two, 5, prompts(4), 42), ...allActions);
		const b = step(start(two, 5, prompts(4), 42), ...allActions);
		expect(a).toEqual(b);
		expect(a.teams.map((t) => t.score).sort()).toEqual([0, 2]);

		let s = freeze(start(two, 5, prompts(4), 42));
		for (const action of allActions) {
			const before = structuredClone(s);
			const n = mostLikely.reduce(s, action);
			expect(s).toEqual(before);
			s = freeze(n);
		}
	});

	it('ignores actions outside their phase and carries the contract', () => {
		const s = start();
		for (const a of [{ type: 'score', matched: 2 }, { type: 'next' }, { type: 'rematch' }] as const)
			expect(mostLikely.reduce(s, a)).toBe(s);
		const count = step(s, { type: 'point' });
		for (const a of [{ type: 'point' }, { type: 'next' }, { type: 'rematch' }] as const)
			expect(mostLikely.reduce(count, a)).toBe(count);
		expect([mostLikely.minPlayers, mostLikely.maxPlayers, mostLikely.stateVersion]).toEqual([4, 20, 2]);
	});
});
