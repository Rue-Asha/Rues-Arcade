import { beforeEach, describe, expect, it } from 'vitest';
import { read, remove, write } from '#lib/storage.ts';
import { loadCount, saveCount } from './count.ts';

const range = { min: 5, max: 15 };
const key = 'arcade:count:clocktower';

describe('count', () => {
	beforeEach(() => remove(key));

	it('Scenario: Invalid stored count falls back to the default', () => {
		for (const stored of ['3', '16', 'abc']) {
			write(key, stored);
			expect(loadCount('clocktower', range, 7), stored).toBe(7);
			expect(read(key), stored).toBe('7');
		}
	});

	it('defaults to the roster size clamped to the range and stores it', () => {
		expect(loadCount('clocktower', range, 9)).toBe(9);
		expect(read(key)).toBe('9');
		remove(key);
		expect(loadCount('clocktower', range, 3)).toBe(5);
		remove(key);
		expect(loadCount('clocktower', range, 20)).toBe(15);
	});

	it('keeps a stored count whatever the roster size', () => {
		saveCount('clocktower', 11);
		expect(read(key)).toBe('11');
		expect(loadCount('clocktower', range, 4)).toBe(11);
		expect(loadCount('clocktower', range, 18)).toBe(11);
	});

	it('rejects fractions and blanks', () => {
		for (const stored of ['7.5', '', ' ']) {
			write(key, stored);
			expect(loadCount('clocktower', range, 8), JSON.stringify(stored)).toBe(8);
		}
	});
});
