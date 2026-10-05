import { describe, expect, it } from 'vitest';
import { motifFor } from '#lib/deco/motifs.ts';

describe('motifFor', () => {
	it('Scenario: Game without its own art gets the neutral fallback', () => {
		for (const place of ['tile', 'start', 'play'] as const) {
			expect(motifFor('duck', place), place).toBe('neutral');
			expect(motifFor('charade', place), place).toBe('neutral');
		}
		expect(motifFor('imposter', 'tile')).toBe('masks');
		expect(motifFor('wavelength', 'tile')).toBe('dial');
		expect(motifFor('imposter', 'start')).toBe('masks');
		expect(motifFor('wavelength', 'start')).toBe('dial');
		expect(motifFor('imposter', 'play')).toBe('rings');
		expect(motifFor('wavelength', 'play')).toBe('rings');
	});

	it('home, lobby and the locked tile have their own motifs', () => {
		expect(motifFor(undefined, 'home')).toBe('home');
		expect(motifFor(undefined, 'tile')).toBe('corner');
		expect(motifFor('imposter', 'lobby')).toBe('crew');
		expect(motifFor('wavelength', 'lobby')).toBe('crew');
		expect(motifFor('duck', 'lobby')).toBe('crew');
	});
});
