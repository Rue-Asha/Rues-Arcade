import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { contrast, motion, textPairs, tokens } from '#lib/ui/tokens.ts';

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

	it('Scenario: Family Feud colour meets contrast', () => {
		const listed = (fg: string, bg: string) => textPairs.some(([f, b]) => f === fg && b === bg);
		expect(listed('ink', 'feud')).toBe(true);
		expect(listed('feud', 'surface')).toBe(true);
		for (const text of ['text', 'text-soft', 'muted', 'gold', 'imposter-text'])
			expect(listed(text, 'feud-tint'), `${text} on feud-tint`).toBe(true);
		expect(tokens['feud-ledge']).toMatch(/^#[0-9a-f]{6}$/);
		expect(contrast(tokens.ink, tokens.feud)).toBeGreaterThanOrEqual(4.5);
		expect(contrast(tokens.feud, tokens.surface)).toBeGreaterThanOrEqual(4.5);
		for (const text of ['text', 'text-soft', 'muted', 'gold', 'imposter-text'] as const)
			expect(contrast(tokens[text], tokens['feud-tint']), text).toBeGreaterThanOrEqual(4.5);
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

	it('Scenario: Motion tokens in CSS and tokens.ts', () => {
		const css = readFileSync('src/app.css', 'utf8');
		const root = css.slice(css.indexOf(':root'));
		const declared = (name: string, value: string) =>
			expect(root, `--${name}`).toMatch(new RegExp(`--${name}:\\s*${value.replace(/[().]/g, '\\$&')};`));
		declared('ease-in', 'cubic-bezier(0.5, 0, 0.75, 0)');
		declared('ease-pop', 'cubic-bezier(0.34, 1.56, 0.64, 1)');
		declared('ease-out', 'cubic-bezier(0.22, 1, 0.36, 1)');
		declared('dur-out', '0.18s');
		declared('dur-in', '0.42s');
		declared('dur-hero', '0.56s');
		expect(motion).toEqual({
			'ease-in': 'cubic-bezier(0.5, 0, 0.75, 0)',
			'ease-pop': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
			'ease-out': 'cubic-bezier(0.22, 1, 0.36, 1)',
			'dur-out': 180,
			'dur-in': 420,
			'dur-hero': 560
		});
	});
});
