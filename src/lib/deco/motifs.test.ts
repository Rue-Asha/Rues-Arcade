import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import Art from '#lib/deco/Art.svelte';
import Banner from '#lib/deco/Banner.svelte';
import { motifFor, type Place } from '#lib/deco/motifs.ts';

const draws: [string | undefined, Place][] = [
	[undefined, 'home'],
	['imposter', 'tile'],
	['wavelength', 'tile'],
	[undefined, 'tile'],
	['imposter', 'start'],
	['wavelength', 'start'],
	['duck', 'start'],
	['wavelength', 'lobby'],
	['imposter', 'play'],
	['duck', 'play']
];

const html = (slug: string | undefined, place: Place) => render(Art, { props: { slug, place } }).body;

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

describe('Art', () => {
	it('draws every motif inside the aria-hidden decoration root', () => {
		for (const [slug, place] of draws) {
			const body = html(slug, place);
			const label = `${slug} ${place}`;
			expect(body, label).toMatch(new RegExp(`<div[^>]*data-motif="${motifFor(slug, place)}"[^>]*aria-hidden="true"`));
			expect(body.match(/data-deco/g), label).toHaveLength(1);
			expect(body, label).toMatch(/<svg|class="corner/);
		}
	});

	it('home composite has board grid, dial with bands, mask card and dashed locks', () => {
		const body = html(undefined, 'home');
		expect(body).toContain('<pattern');
		expect(body).toContain('class="band');
		expect(body).toContain('class="needle');
		expect(body).toContain('class="card');
		expect(body.match(/class="lock/g)?.length).toBeGreaterThanOrEqual(2);
	});

	it('the Imposter masks have one odd mask, the start dial is labelled Kalt and Heiß', () => {
		for (const place of ['tile', 'start'] as const) {
			expect(html('imposter', place).match(/class="mask/g)?.length, place).toBeGreaterThanOrEqual(4);
			expect(html('imposter', place).match(/class="[^"]*\bodd\b/g), place).toHaveLength(1);
		}
		const start = html('wavelength', 'start');
		expect(start).toMatch(/>Kalt<\/text>/);
		expect(start).toMatch(/>Heiß<\/text>/);
		expect(html('wavelength', 'tile')).not.toContain('Kalt');
	});

	it('text inside the art carries its fill as color, in Sora, never Press Start 2P', () => {
		for (const [slug, place] of draws) {
			for (const [, style] of html(slug, place).matchAll(/<text[^>]*style="([^"]*)"/g)) {
				const fill = style.match(/fill:\s*([^;]+)/)?.[1].trim();
				const color = style.match(/(?:^|;)\s*color:\s*([^;]+)/)?.[1].trim();
				expect(color, `${slug} ${place}: ${style}`).toBe(fill);
				expect(style, `${slug} ${place}`).toContain('var(--font-ui)');
			}
		}
	});

	it('loads nothing: no images, links or external urls', () => {
		for (const [slug, place] of draws) {
			const body = html(slug, place);
			expect(body, `${slug} ${place}`).not.toMatch(/<image|<img|<use|href=|url\((?!#)|font-data|Press Start/);
		}
	});

	it('pattern ids are unique per instance', () => {
		const a = html(undefined, 'home').match(/<pattern id="([^"]+)"/)?.[1];
		const b = render(Art, { props: { place: 'home' }, idPrefix: 'x' }).body.match(/<pattern id="([^"]+)"/)?.[1];
		expect(a).toBeTruthy();
		expect(a).not.toBe(b);
	});
});

describe('Banner', () => {
	const children = createRawSnippet(() => ({ render: () => '<h1>Titel</h1>' }));
	const banner = (props: { slug?: string; place: 'home' | 'start' | 'lobby'; colour?: string }) =>
		render(Banner, { props: { ...props, children } }).body;

	it('puts its text column before the art and places the motif for its place', () => {
		const cases = [
			[{ place: 'home' }, 'home'],
			[{ slug: 'imposter', place: 'start', colour: 'imposter' }, 'masks'],
			[{ slug: 'wavelength', place: 'start', colour: 'wavelength' }, 'dial'],
			[{ slug: 'duck', place: 'start' }, 'neutral'],
			[{ slug: 'wavelength', place: 'lobby', colour: 'wavelength' }, 'crew']
		] as const;
		for (const [props, motif] of cases) {
			const body = banner(props);
			expect(body.indexOf('<h1>Titel</h1>'), motif).toBeGreaterThan(-1);
			expect(body.indexOf('<h1>Titel</h1>'), motif).toBeLessThan(body.indexOf('data-deco'));
			expect(body.match(/data-motif="([^"]+)"/g), motif).toEqual([`data-motif="${motif}"`]);
		}
	});

	it('colours itself from the token name', () => {
		expect(banner({ slug: 'imposter', place: 'start', colour: 'imposter' })).toMatch(
			/--c:\s*var\(--imposter\);\s*--tint:\s*var\(--imposter-tint[,)].*--edge:\s*var\(--imposter-ledge[,)]/
		);
		expect(banner({ place: 'home' })).toMatch(/--c:\s*var\(--primary\)/);
	});
});
