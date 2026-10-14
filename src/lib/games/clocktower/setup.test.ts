import { describe, expect, it } from 'vitest';
import { alignment, byId } from './characters.ts';
import { F15, F5, F7, seated } from './fixtures.ts';
import { believable, counts, drawBluffs, fill, herringOptions, needsHerring, problems, required } from './setup.ts';
import type { CharacterId, Seat, TeamCounts } from './types.ts';

const seats = (list: (CharacterId | null)[], believed: CharacterId | null = null): Seat[] =>
	list.map((character, i) => ({
		player: { id: `p${i}`, name: `P${i + 1}` },
		character,
		believed: character === 'drunk' ? believed : null,
		alive: true,
		ghostVote: true
	}));

const empty = (n: number) => seats(Array.from({ length: n }, () => null));

const tc = (townsfolk: number, outsider: number, minion: number, demon: number): TeamCounts => ({ townsfolk, outsider, minion, demon });

const table: Record<number, TeamCounts> = {
	5: tc(3, 0, 1, 1),
	6: tc(3, 1, 1, 1),
	7: tc(5, 0, 1, 1),
	8: tc(5, 1, 1, 1),
	9: tc(5, 2, 1, 1),
	10: tc(7, 0, 2, 1),
	11: tc(7, 1, 2, 1),
	12: tc(7, 2, 2, 1),
	13: tc(9, 0, 3, 1),
	14: tc(9, 1, 3, 1),
	15: tc(9, 2, 3, 1)
};

const rng = (state: number) => ({ state });

function valid(result: Seat[]) {
	const ids = result.map((s) => s.character);
	expect(ids).not.toContain(null);
	expect(new Set(ids).size).toBe(ids.length);
	const baron = ids.includes('baron');
	expect(counts(result)).toEqual(required(result.length, baron));
}

describe('clocktower setup table', () => {
	it('Scenario: Setup table for every count', () => {
		for (let n = 5; n <= 15; n++) {
			expect(required(n, false), `${n}`).toEqual(table[n]);
			const t = table[n];
			expect(required(n, true), `${n} Baron`).toEqual(tc(t.townsfolk - 2, t.outsider + 2, t.minion, t.demon));
		}
	});

	it('counts by true character, the Drunk as an Outsider', () => {
		expect(counts(seats(['chef', 'drunk', 'spy', 'imp', null], 'monk'))).toEqual(tc(1, 1, 1, 1));
	});
});

describe('clocktower fill', () => {
	it('keeps manual choices and fills a valid distribution', () => {
		for (let s = 1; s <= 30; s++) {
			const start = seats([null, null, 'empath', null, null, null, null, null, null, null]);
			const [result] = fill(start, rng(s));
			expect(result).not.toBeNull();
			expect(result![2].character).toBe('empath');
			valid(result!);
		}
	});

	it('fills +2 Outsiders around a manual Baron', () => {
		for (let s = 1; s <= 30; s++) {
			const [result] = fill(seats(['baron', null, null, null, null, null, null]), rng(s));
			expect(counts(result!)).toEqual(tc(3, 2, 1, 1));
			valid(result!);
		}
	});

	it('draws the Baron only when it fits and forces it when only it fits', () => {
		const picked = new Set<boolean>();
		for (let s = 1; s <= 40; s++) {
			const [result] = fill(empty(10), rng(s));
			valid(result!);
			picked.add(result!.some((x) => x.character === 'baron'));
		}
		expect(picked).toEqual(new Set([true, false]));
		for (let s = 1; s <= 20; s++) {
			// five Townsfolk at 8 players leave no room for the Baron's −2
			const [noBaron] = fill(seats(['chef', 'monk', 'empath', 'mayor', 'slayer', null, null, null]), rng(s));
			valid(noBaron!);
			expect(noBaron!.map((x) => x.character)).not.toContain('baron');
			// three Outsiders at 9 players only fit with the Baron
			const [baron] = fill(seats(['butler', 'saint', 'recluse', null, null, null, null, null, null]), rng(s));
			valid(baron!);
			expect(baron!.map((x) => x.character)).toContain('baron');
		}
	});

	it('returns null for an impossible manual set and leaves the rng', () => {
		const start = seats(['poisoner', 'spy', null, null, null]);
		expect(fill(start, rng(3))).toEqual([null, rng(3)]);
		expect(fill(seats(['butler', 'saint', 'recluse', null, null]), rng(3))[0]).toBeNull();
	});

	it('is seeded', () => {
		expect(fill(empty(12), rng(9))).toEqual(fill(empty(12), rng(9)));
		const all = new Set(Array.from({ length: 20 }, (_, s) => JSON.stringify(fill(empty(12), rng(s))[0])));
		expect(all.size).toBeGreaterThan(1);
	});

	it('gives a filled Drunk a believed Townsfolk not in play and never places the believed role', () => {
		for (let s = 1; s <= 30; s++) {
			const [result] = fill(seats(['drunk', null, null, null, null, null, null, null], 'chef'), rng(s));
			valid(result!);
			expect(result![0].believed).toBe('chef');
			expect(result!.map((x) => x.character)).not.toContain('chef');
		}
		for (let s = 1; s <= 30; s++) {
			const [result] = fill(seats(['drunk', null, null, null, null, null, null, null]), rng(s));
			const believed = result![0].believed!;
			expect(byId[believed].team).toBe('townsfolk');
			expect(result!.map((x) => x.character)).not.toContain(believed);
		}
	});
});

describe('clocktower drunk and red herring', () => {
	it('believable roles are Townsfolk not in play', () => {
		const list = believable(seats(['chef', 'drunk', 'monk', 'spy', 'imp', 'empath', 'butler', 'saint'], 'virgin'));
		expect(list).toHaveLength(10);
		expect(list).not.toContain('chef');
		expect(list).toContain('virgin');
		expect(list.every((id) => byId[id].team === 'townsfolk')).toBe(true);
	});

	it('needs a red herring for a real or believed Fortune Teller', () => {
		expect(needsHerring(seats(['fortune-teller', 'chef', 'imp']))).toBe(true);
		expect(needsHerring(seats(['drunk', 'chef', 'imp'], 'fortune-teller'))).toBe(true);
		expect(needsHerring(seats(['drunk', 'chef', 'imp'], 'monk'))).toBe(false);
	});

	it('red herring options are the good seats, the Fortune Teller included', () => {
		expect(herringOptions(seats(['fortune-teller', 'imp', 'recluse', 'spy', null, 'chef']))).toEqual([0, 2, 5]);
	});
});

describe('clocktower problems', () => {
	it('flags an over-assigned team', () => {
		expect(problems(seats(['poisoner', 'spy', null, null, null]), null)).toContain('Diese Verteilung geht nicht auf: zu viele Minions.');
		expect(problems(seats(['chef', 'monk', 'empath', 'mayor', 'slayer', 'baron', null, null]), null)).toContain(
			'Diese Verteilung geht nicht auf: zu viele Townsfolk.'
		);
	});

	it('is empty only for a complete valid distribution', () => {
		expect(problems(seats(['chef', 'monk', 'empath', 'spy', 'imp']), null)).toEqual([]);
		expect(problems(seats(['chef', 'monk', null, 'spy', 'imp']), null)).toEqual(['Ein Platz hat noch keinen Charakter.']);
		expect(problems(seats(['drunk', 'chef', 'monk', 'empath', 'washerwoman', 'spy', 'imp', 'slayer']), null)).toEqual([
			'Der Drunk braucht eine Rolle, die er zu sein glaubt.'
		]);
		expect(problems(seats(['drunk', 'chef', 'monk', 'empath', 'washerwoman', 'spy', 'imp', 'slayer'], 'chef'), null)).toEqual([
			'Die Rolle, die der Drunk zu sein glaubt, ist im Spiel.'
		]);
		const ft = seats(['fortune-teller', 'monk', 'empath', 'spy', 'imp']);
		expect(problems(ft, null)).toEqual(['Der Fortune Teller braucht einen Red Herring.']);
		expect(problems(ft, 4)).toEqual(['Der Red Herring muss eine gute Person sein.']);
		expect(problems(ft, 0)).toEqual([]);
	});

	it('fixtures are complete valid distributions', () => {
		for (const list of [F5, F7, F15]) {
			const state = seated(list);
			expect(problems(state.seats, state.redHerring)).toEqual([]);
		}
		expect(seated(F5).redHerring).toBe(0);
		expect(seated(F15).redHerring).toBe(7);
		expect(seated(F7).demon).toBe(6);
		expect(seated(F5).phase).toEqual({ kind: 'reveal', seat: 0, shown: false });
	});
});

describe('clocktower bluffs', () => {
	it('Scenario: Bluffs are good characters not in play', () => {
		const start = seats(['drunk', 'chef', 'empath', 'washerwoman', 'butler', 'spy', 'imp', 'slayer'], 'monk');
		const inPlay = start.map((s) => s.character);
		for (let s = 1; s <= 50; s++) {
			const [bluffs] = drawBluffs(start, rng(s));
			expect(bluffs).toHaveLength(3);
			expect(new Set(bluffs).size).toBe(3);
			for (const id of bluffs) {
				expect(alignment(id)).toBe('good');
				expect(inPlay).not.toContain(id);
				expect(id).not.toBe('monk');
			}
			expect(bluffs.filter((id) => byId[id].team === 'townsfolk')).toHaveLength(2);
			expect(bluffs.filter((id) => byId[id].team === 'outsider')).toHaveLength(1);
			expect(drawBluffs(start, rng(s))).toEqual(drawBluffs(start, rng(s)));
		}
		const noOutsider = seats(['drunk', 'butler', 'recluse', 'saint', 'chef', 'baron', 'imp'], 'monk');
		const [three] = drawBluffs(noOutsider, rng(4));
		expect(three.every((id) => byId[id].team === 'townsfolk')).toBe(true);
	});
});
