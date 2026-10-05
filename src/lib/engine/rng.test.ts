import { describe, expect, it } from 'vitest';
import { int, next, pick, shuffle, type Rng } from './rng';

function sequence(rng: Rng, n: number): number[] {
	const out: number[] = [];
	for (let i = 0; i < n; i++) {
		const [v, r] = next(rng);
		out.push(v);
		rng = r;
	}
	return out;
}

describe('rng', () => {
	it('same seed gives the same sequence', () => {
		expect(sequence({ state: 42 }, 20)).toEqual(sequence({ state: 42 }, 20));
	});

	it('different seeds give different sequences', () => {
		expect(sequence({ state: 1 }, 5)).not.toEqual(sequence({ state: 2 }, 5));
	});

	it('next returns values in [0, 1) and does not mutate its input', () => {
		const rng = { state: 7 };
		for (const v of sequence(rng, 1000)) {
			expect(v).toBeGreaterThanOrEqual(0);
			expect(v).toBeLessThan(1);
		}
		expect(rng).toEqual({ state: 7 });
	});

	it('int stays within inclusive bounds and hits both ends', () => {
		let rng: Rng = { state: 3 };
		const seen = new Set<number>();
		for (let i = 0; i < 500; i++) {
			const [v, r] = int(rng, 2, 5);
			seen.add(v);
			rng = r;
		}
		expect([...seen].sort()).toEqual([2, 3, 4, 5]);
	});

	it('pick returns an element of the list', () => {
		const list = ['a', 'b', 'c'];
		const [v] = pick({ state: 9 }, list);
		expect(list).toContain(v);
	});

	it('shuffle is a deterministic permutation and leaves the input untouched', () => {
		const list = [1, 2, 3, 4, 5, 6, 7, 8];
		const [a] = shuffle({ state: 11 }, list);
		const [b] = shuffle({ state: 11 }, list);
		expect(a).toEqual(b);
		expect([...a].sort()).toEqual(list);
		expect(list).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
	});
});
