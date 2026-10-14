import { afterEach, describe, expect, it } from 'vitest';
import { SEAT_MS, seatMs, sweepMs, threshold, voteOrder, voteResult } from './vote.ts';

const g = globalThis as { clocktowerSeatMs?: number };

describe('clocktower vote', () => {
	afterEach(() => {
		delete g.clocktowerSeatMs;
	});

	it('Scenario: Sweep order ends at the nominee', () => {
		expect(voteOrder(2, 7).map((i) => i + 1)).toEqual([4, 5, 6, 7, 1, 2, 3]);
		expect(voteOrder(6, 7).map((i) => i + 1)).toEqual([1, 2, 3, 4, 5, 6, 7]);
	});

	it('Scenario: Sweep lasts 2.5 seconds per seat', () => {
		expect(SEAT_MS).toBe(2500);
		expect(sweepMs(5)).toBe(12500);
		expect(sweepMs(15)).toBe(37500);
	});

	it('seat time can be injected for tests', () => {
		expect(seatMs()).toBe(2500);
		g.clocktowerSeatMs = 300;
		expect(seatMs()).toBe(300);
		expect(sweepMs(7)).toBe(2100);
		expect(sweepMs(7, 100)).toBe(700);
	});

	it('threshold is half the living, rounded up', () => {
		expect([5, 6, 7, 8, 15].map(threshold)).toEqual([3, 3, 4, 4, 8]);
	});

	it('vote result: below threshold, block, replace, tie, below the bar', () => {
		expect(voteResult(3, 7, 0)).toBe('none');
		expect(voteResult(4, 7, 0)).toBe('block');
		expect(voteResult(5, 7, 4)).toBe('block');
		expect(voteResult(5, 7, 5)).toBe('tie');
		expect(voteResult(4, 7, 5)).toBe('none');
		expect(voteResult(6, 7, 5)).toBe('block');
	});

	it('a count equal to a failed earlier count is no tie', () => {
		expect(voteResult(3, 7, 3)).toBe('none');
		expect(voteResult(0, 7, 0)).toBe('none');
	});
});
