import { afterEach, describe, expect, it } from 'vitest';
import { sectorOf } from './circle.ts';
import { SEAT_MS, seatMs, sweepAt, sweepMs, threshold, voteOrder, voteResult } from './vote.ts';

const g = globalThis as { clocktowerSeatMs?: number };

describe('clocktower vote', () => {
	afterEach(() => {
		delete g.clocktowerSeatMs;
	});

	it('Scenario: Sweep order ends at the nominee', () => {
		expect(voteOrder(2, 7).map((i) => i + 1)).toEqual([4, 5, 6, 7, 1, 2, 3]);
		expect(voteOrder(6, 7).map((i) => i + 1)).toEqual([1, 2, 3, 4, 5, 6, 7]);
	});

	it('Scenario: Sweep lasts 2 seconds per seat', () => {
		expect(SEAT_MS).toBe(2000);
		expect(sweepMs(5)).toBe(10000);
		expect(sweepMs(15)).toBe(30000);
	});

	it('Scenario: Hand position over the sweep', () => {
		const deg = (hand: number) => (hand * 360) / 7;
		const at = (ms: number) => sweepAt(ms, 3, 7, 2000)!;
		expect(deg(at(0).hand)).toBeCloseTo(180, 9);
		expect(at(0).seat).toBe(4);
		expect(sectorOf(deg(at(0).hand), 7)).toBe(4);
		expect(deg(at(1000).hand)).toBeCloseTo((4 * 360) / 7, 9);
		expect(at(1999).seat).toBe(4);
		expect(at(2000).seat).toBe(5);
		expect(sectorOf(deg(at(2000).hand), 7)).toBe(5);
		expect(at(13999).seat).toBe(3);
		expect(sectorOf(deg(at(13999).hand), 7)).toBe(3);
		expect(deg(at(2000).hand) - deg(at(0).hand)).toBeCloseTo(360 / 7, 9);
		expect(deg(at(13999).hand) - deg(at(1000).hand)).toBeCloseTo((360 / 7) * (12999 / 2000), 9);
		expect(sweepAt(14000, 3, 7, 2000)).toBeNull();
		expect(sweepAt(-1, 3, 7, 2000)).toBeNull();
	});

	it('sweep position uses the injected seat time by default', () => {
		g.clocktowerSeatMs = 400;
		expect(sweepAt(400, 0, 5)!.seat).toBe(2);
		expect(sweepAt(2000, 0, 5)).toBeNull();
	});

	it('seat time can be injected for tests', () => {
		expect(seatMs()).toBe(2000);
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
