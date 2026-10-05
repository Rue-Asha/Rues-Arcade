import { describe, expect, it } from 'vitest';
import { demo } from './demo.ts';

describe('wavelength demo', () => {
	it('Scenario: Wavelength demo tips read neutral', () => {
		expect(demo.steps.filter((s) => s.tip.includes('!'))).toEqual([]);
		const results = demo.steps.filter((s) => s.action.type === 'next');
		expect(results[0].tip).toBe('Genau getroffen, 4 Punkte. Weiter zu Team 2.');
	});
});
