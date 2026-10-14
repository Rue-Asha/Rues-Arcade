import { describe, expect, it } from 'vitest';
import { over, reading } from './timer.ts';

describe('day timer', () => {
	it('Scenario: Remaining time from the deadline', () => {
		const now = 1_000_000;
		expect(reading(now + 125_000, now)).toBe('2:05');
		expect(reading(now, now)).toBe('Zeit um');
		expect(reading(now - 30_000, now)).toBe('Zeit um');
	});

	it('rounds a started second up and pads seconds', () => {
		expect(reading(1_500, 0)).toBe('0:02');
		expect(reading(1, 0)).toBe('0:01');
		expect(reading(59 * 60_000, 0)).toBe('59:00');
		expect(reading(60_000 + 4_000, 0)).toBe('1:04');
	});

	it('is over at and after the deadline only', () => {
		expect(over(1_000, 999)).toBe(false);
		expect(over(1_000, 1_000)).toBe(true);
		expect(over(1_000, 2_000)).toBe(true);
	});
});
