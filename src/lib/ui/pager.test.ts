import { describe, expect, it } from 'vitest';
import { clampPage, PAGE, pageCount, pageItems, pageOf } from './pager.ts';

describe('pager', () => {
	it('Scenario: Pager page count', () => {
		const totals = [0, 6, 7, 12, 13, 26, 60, 91, 247];
		expect(totals.map((n) => pageCount(n, PAGE.narrow))).toEqual([1, 1, 2, 2, 3, 5, 10, 16, 42]);
		expect(totals.map((n) => pageCount(n, PAGE.wide))).toEqual([1, 1, 1, 1, 2, 3, 5, 8, 21]);
	});

	it('clamps a page that would be empty to the last page', () => {
		expect(clampPage(2, 13, 6)).toBe(2);
		expect(clampPage(2, 12, 6)).toBe(1);
		expect(clampPage(5, 0, 6)).toBe(0);
		expect(clampPage(-1, 13, 6)).toBe(0);
	});

	it('slices the page and clamps like clampPage', () => {
		const twelve = Array.from({ length: 12 }, (_, i) => i);
		expect(pageItems(twelve, 0, 6)).toEqual([0, 1, 2, 3, 4, 5]);
		expect(pageItems(twelve, 2, 6)).toEqual([6, 7, 8, 9, 10, 11]);
	});

	it('finds the page holding an index', () => {
		expect([0, 5, 6, 11, 12].map((i) => pageOf(i, 6))).toEqual([0, 0, 1, 1, 2]);
		expect([0, 11, 12].map((i) => pageOf(i, 12))).toEqual([0, 0, 1]);
	});
});
