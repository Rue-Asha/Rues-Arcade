import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { contrast, textPairs, tokens } from '#lib/ui/tokens.ts';

describe('design tokens', () => {
	it('listed token pairs meet 4.5:1', () => {
		const failing = textPairs
			.map(([fg, bg]) => ({ fg, bg, ratio: contrast(tokens[fg], tokens[bg]) }))
			.filter((p) => p.ratio < 4.5);
		expect(textPairs.length).toBeGreaterThan(20);
		expect(failing).toEqual([]);
	});

	it('Scenario: New game colours meet contrast', () => {
		const listed = (fg: string, bg: string) => textPairs.some(([f, b]) => f === fg && b === bg);
		for (const game of ['codes', 'duck', 'most-likely'] as const) {
			const tint = `${game}-tint` as const;
			expect(listed('ink', game), game).toBe(true);
			expect(listed(game, 'surface'), game).toBe(true);
			for (const text of ['text', 'text-soft', 'muted', 'gold', 'imposter-text'])
				expect(listed(text, tint), `${text} on ${tint}`).toBe(true);
			expect(tokens[`${game}-ledge`], game).toMatch(/^#[0-9a-f]{6}$/);
			expect(contrast(tokens.ink, tokens[game]), game).toBeGreaterThanOrEqual(4.5);
			expect(contrast(tokens[game], tokens.surface), game).toBeGreaterThanOrEqual(4.5);
		}
	});

	it('contrast matches the WCAG formula on known pairs', () => {
		expect(contrast('#000000', '#ffffff')).toBeCloseTo(21, 5);
		expect(contrast('#777777', '#ffffff')).toBeCloseTo(4.48, 2);
	});

	it('app.css declares every token with the same value', () => {
		const css = readFileSync('src/app.css', 'utf8');
		for (const [name, value] of Object.entries(tokens)) {
			expect(css, `--${name}`).toMatch(new RegExp(`--${name}:\\s*${value};`, 'i'));
		}
	});

	it('core colours are the Arcade-Abend values', () => {
		expect(tokens).toMatchObject({
			ground: '#111234',
			primary: '#6bd672',
			imposter: '#eb616d',
			gold: '#f4c34a',
			wavelength: '#38ccc8',
			codes: '#9d8cff',
			duck: '#ff9f43',
			'most-likely': '#f27bc4'
		});
	});
});
