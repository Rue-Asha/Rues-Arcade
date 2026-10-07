import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { seedRoster, settled, shot } from './helpers.ts';
import { walk as walkCodes } from './walks/codes.ts';
import { walk as walkDuck } from './walks/duck.ts';
import { walk as walkFeud } from './walks/feud.ts';
import { seed as seedImposter, walk as walkImposter } from './walks/imposter.ts';
import { walk as walkMostLikely } from './walks/most-likely.ts';
import { seed as seedWavelength, walk as walkWavelength } from './walks/wavelength.ts';

type Check = (slug: string) => Promise<void>;

const names = ['Alex', 'Bo', 'Cleo', 'Dani'];

// The start screens need content in the shared e2e database, so each walk adds its own entries; the
// lobby's content fetch is pinned to readable ones for the screenshots.
async function content(page: Page, info: TestInfo) {
	const tag = `${info.project.name}-${info.title.length}-${Date.now()}`;
	await seedImposter(page, tag);
	await seedWavelength(page, tag);
}

// Home, Spieler, every start screen, lobbies, every game phase (Wavelength as Versus and Koop), Inhalte.
// Every game walks its own screens from e2e/walks/.
async function walk(page: Page, info: TestInfo, check: Check) {
	// The walk covers every screen of every game, ~1.5m on the check runner since the Feud walk joined it.
	test.setTimeout(240_000);
	await content(page, info);
	await seedRoster(page, names);

	await page.goto('/');
	await check('home');
	await page.goto('/spieler');
	await expect(page.getByRole('region', { name: 'Gespeicherte Spieler' })).toBeVisible();
	await expect(page.getByText('Gast', { exact: true })).toHaveCount(names.length);
	await check('spieler');

	await walkImposter(page, check);
	await walkWavelength(page, check);
	await walkCodes(page, check);
	await walkDuck(page, check);
	await walkMostLikely(page, check);
	await walkFeud(page, check);

	await seedRoster(page, Array.from({ length: 13 }, (_, i) => `Spieler ${i + 1}`));
	await page.goto('/spiele/imposter/lobby');
	await expect(page.getByText('Wer spielt mit?', { exact: true })).toBeVisible();
	await check('lobby-pick');

	await page.goto('/spiele/imposter/inhalte');
	await check('inhalte-imposter');
	await page.goto('/spiele/wavelength/inhalte');
	await check('inhalte-wavelength');
}

test('Scenario: Touch targets are at least 44px', async ({ page }, info) => {
	const small: string[] = [];
	await walk(page, info, async (slug) => {
		await settled(page);
		const found = await page.evaluate(() =>
			[...document.querySelectorAll<HTMLElement>('a[href], button, input, select, textarea, [role="slider"]')]
				.filter((el) => el.checkVisibility())
				.map((el) => {
					let r = el.getBoundingClientRect();
					// a checkbox styled away behind its label is tapped through the label
					const label = (el as HTMLInputElement).labels?.[0];
					if (label && (r.width < 44 || r.height < 44)) r = label.getBoundingClientRect();
					const name = el.getAttribute('aria-label') || el.textContent?.trim() || el.tagName;
					return { name, w: Math.round(r.width), h: Math.round(r.height) };
				})
				.filter(({ w, h }) => w < 44 || h < 44)
				.map(({ name, w, h }) => `${name} ${w}×${h}`)
		);
		small.push(...found.map((f) => `${slug}: ${f}`));
	});
	expect(small).toEqual([]);
});

test('Scenario: Text contrast meets 4.5:1', async ({ page }, info) => {
	const low: string[] = [];
	await walk(page, info, async (slug) => {
		await settled(page);
		const found = await page.evaluate(contrastFailures);
		low.push(...found.map((f) => `${slug}: ${f}`));
	});
	expect(low).toEqual([]);
});

// Every visible text node against the first opaque background behind it, translucent layers composited.
// Disabled form controls are exempt (WCAG 1.4.3 "inactive components"); locked tiles are content and are checked.
function contrastFailures() {
	type RGBA = [number, number, number, number];
	const parse = (c: string): RGBA => {
		const [r, g, b, a = 1] = c.match(/[\d.]+/g)!.map(Number);
		return [r, g, b, a];
	};
	const over = ([r, g, b, a]: RGBA, [R, G, B]: RGBA): RGBA => [
		r * a + R * (1 - a),
		g * a + G * (1 - a),
		b * a + B * (1 - a),
		1
	];
	const lum = (c: RGBA) => {
		const [r, g, b] = c.slice(0, 3).map((v) => {
			const s = v / 255;
			return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
		});
		return 0.2126 * r + 0.7152 * g + 0.0722 * b;
	};
	const background = (el: Element | null): RGBA => {
		const layers: RGBA[] = [];
		for (; el; el = el.parentElement) {
			const c = parse(getComputedStyle(el).backgroundColor);
			if (c[3] > 0) layers.push(c);
			if (c[3] >= 1) break;
		}
		let bg: RGBA = layers.at(-1)?.[3] === 1 ? layers.pop()! : parse(getComputedStyle(document.body).backgroundColor);
		for (const layer of layers.reverse()) bg = over(layer, bg);
		return bg;
	};
	const out: string[] = [];
	const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
	for (let node = walker.nextNode(); node; node = walker.nextNode()) {
		const el = node.parentElement!;
		if (!(node as Text).data.trim() || !el.checkVisibility({ opacityProperty: true, visibilityProperty: true })) continue;
		if (el.closest(':disabled')) continue;
		const bg = background(el);
		const fg = over(parse(getComputedStyle(el).color), bg);
		const [hi, lo] = [lum(fg), lum(bg)].sort((x, y) => y - x);
		const ratio = (hi + 0.05) / (lo + 0.05);
		if (ratio < 4.5) out.push(`"${(node as Text).data.trim().slice(0, 30)}" ${getComputedStyle(el).color} on rgb(${bg.slice(0, 3).map(Math.round)}) = ${ratio.toFixed(2)}`);
	}
	return out;
}

// The logo, scores and dial band labels are the only places for Press Start 2P (design-system spec).
const PIXEL = {
	logo: '.brand .letter',
	score: '[data-testid="points"], .board .pts, .total',
	band: '.bands text'
};
const NEW_COPY = {
	banner: '.banner',
	tile: '.tile',
	more: 'section[aria-labelledby="more"]',
	mode: 'section[aria-labelledby="mode"], section[aria-labelledby="order"]'
};

test('Scenario: Press Start 2P stays limited to logo and scores', async ({ page }, info) => {
	const stray: string[] = [];
	const seen = new Set<string>();
	await walk(page, info, async (slug) => {
		const found = await page.evaluate(
			({ allowed, banned }) => {
				const out: { text: string; kind: string | null; inside: string | null }[] = [];
				const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
				for (let node = walker.nextNode(); node; node = walker.nextNode()) {
					const el = node.parentElement!;
					if (!(node as Text).data.trim() || !el.checkVisibility()) continue;
					if (!getComputedStyle(el).fontFamily.includes('Press Start 2P')) continue;
					const kind = Object.entries(allowed).find(([, sel]) => el.closest(sel))?.[0] ?? null;
					const box = el.closest(banned);
					out.push({ text: (node as Text).data.trim().slice(0, 30), kind, inside: box && (box.getAttribute('class') || box.tagName) });
				}
				return out;
			},
			{ allowed: PIXEL, banned: `${NEW_COPY.banner}, ${NEW_COPY.tile}, ${NEW_COPY.more}, [data-deco]` }
		);
		for (const { text, kind, inside } of found) {
			if (kind) seen.add(kind);
			if (!kind || inside) stray.push(`${slug}: "${text}"${inside ? ` in ${inside}` : ''}`);
		}
	});
	expect(stray).toEqual([]);
	expect([...seen].sort()).toEqual(Object.keys(PIXEL).sort());
});

test('Scenario: Decoration loads no external assets', async ({ page, baseURL }, info) => {
	const foreign: string[] = [];
	// the Feud walk loads its pages from its own loopback server (emptyServer), so the origins the main frame
	// navigates to are the page's own, as long as they are loopback
	const own = new Set([new URL(baseURL!).origin]);
	page.on('request', (req) => {
		const url = new URL(req.url());
		if (req.isNavigationRequest() && req.frame() === page.mainFrame() && /^https?:$/.test(url.protocol) && /^(localhost|127\.0\.0\.1)$/.test(url.hostname))
			own.add(url.origin);
		if (/^https?:$/.test(url.protocol) && !own.has(url.origin)) foreign.push(req.url());
	});
	const screens: string[] = [];
	await walk(page, info, async (slug) => {
		await settled(page);
		screens.push(slug);
	});
	expect(screens.length).toBeGreaterThan(20);
	expect(foreign).toEqual([]);
});

test('Scenario: New copy has no exclamation marks', async ({ page }, info) => {
	const loud: string[] = [];
	const seen = new Set<string>();
	await walk(page, info, async (slug) => {
		const parts = { ...NEW_COPY, ...(slug === 'wavelength-koop-gameover' ? { gameover: 'main [data-frame="stage"]' } : {}) };
		for (const [kind, sel] of Object.entries(parts))
			for (const text of await page.locator(sel).allInnerTexts()) {
				seen.add(kind);
				if (/!|Spieleabend/.test(text)) loud.push(`${slug} ${kind}: ${text.replace(/\s+/g, ' ').slice(0, 60)}`);
			}
	});
	expect(loud).toEqual([]);
	expect([...seen].sort()).toEqual([...Object.keys(NEW_COPY), 'gameover'].sort());
});

test('Scenario: No horizontal scroll on phone', async ({ page }, info) => {
	test.skip(info.project.name !== 'phone', 'phone layout');
	await walk(page, info, (slug) => shot(page, info, `look-${slug}`));
});

test('Scenario: Desktop uses the width', async ({ page }, info) => {
	test.skip(info.project.name !== 'desktop', 'desktop layout');
	const empty: string[] = [];
	await walk(page, info, async (slug) => {
		await shot(page, info, `look-${slug}`);
		const used = await reach(page);
		if (used < 0.75) empty.push(`${slug}: ${Math.round(used * 100)}%`);
	});
	expect(empty).toEqual([]);
});

// How far across the main column visible content reaches on the first screen. A phone-width column
// floating in a 1280 viewport reaches well under 75%.
async function reach(page: Page) {
	return page.evaluate(() => {
		const main = document.querySelector('main')!;
		const area = main.getBoundingClientRect();
		const rects: DOMRect[] = [];
		const walker = document.createTreeWalker(main, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
		for (let node = walker.nextNode(); node; node = walker.nextNode()) {
			if (node instanceof Text) {
				if (!node.data.trim() || !node.parentElement?.checkVisibility({ opacityProperty: true })) continue;
				const range = document.createRange();
				range.selectNodeContents(node);
				rects.push(...range.getClientRects());
				continue;
			}
			const el = node as HTMLElement;
			if (!el.checkVisibility({ opacityProperty: true })) continue;
			const css = getComputedStyle(el);
			const painted =
				/^(BUTTON|INPUT|SELECT|TEXTAREA|IMG|IFRAME|CANVAS|svg)$/.test(el.tagName) ||
				!/rgba\(.*, 0\)|transparent/.test(css.backgroundColor) ||
				css.backgroundImage !== 'none' ||
				css.boxShadow !== 'none' ||
				css.borderStyle !== 'none';
			if (painted) rects.push(el.getBoundingClientRect());
		}
		const shown = rects.filter((r) => r.width && r.height && r.top < innerHeight);
		const left = Math.min(...shown.map((r) => r.left));
		const right = Math.max(...shown.map((r) => r.right));
		return (right - left) / area.width;
	});
}

async function seedGuess(page: Page) {
	await page.goto('/');
	await page.evaluate(() => {
		const team = (name: string, players: string[]) => ({
			name,
			players: players.map((p) => ({ id: p, name: p })),
			score: 0
		});
		localStorage.setItem(
			'arcade:session:wavelength',
			JSON.stringify({
				v: 1,
				state: {
					rng: { state: 1 },
					pool: [{ id: 1, a: 'Kalt', b: 'Heiß' }],
					used: [1],
					teams: [team('Team 1', ['Alex', 'Cleo']), team('Team 2', ['Bo', 'Dani'])],
					rounds: 2,
					roundIndex: 0,
					teamIndex: 0,
					spectrum: { id: 1, a: 'Kalt', b: 'Heiß' },
					target: 90,
					dial: 90,
					phase: 'guess',
					lastScore: null
				}
			})
		);
	});
	await page.goto('/spiele/wavelength/spielen');
	await expect(page.getByRole('button', { name: 'Einloggen' })).toBeVisible();
}

const running = (page: Page) =>
	page.evaluate(
		() =>
			document
				.getAnimations()
				.filter((a) => a.playState === 'running' && a.effect?.getTiming().iterations !== Infinity).length
	);

// Clicks inside the page and reports what the next frame shows, before any count-up could finish.
const clickAndLook = (page: Page, name: string) =>
	page.evaluate(
		(name) =>
			new Promise<{ animations: number; points: string; scores: string[] }>((resolve) => {
				[...document.querySelectorAll('button')].find((b) => b.textContent?.trim() === name)!.click();
				requestAnimationFrame(() =>
					requestAnimationFrame(() =>
						resolve({
							animations: document
								.getAnimations()
								.filter((a) => a.playState === 'running' && a.effect?.getTiming().iterations !== Infinity)
								.length,
							points: document.querySelector('[data-testid="points"]')?.textContent?.trim() ?? '',
							scores: [...document.querySelectorAll('.board .pts')].map((s) => s.textContent!.trim())
						})
					)
				);
			}),
		name
	);

async function tap(page: Page, info: TestInfo, name: string | RegExp) {
	const box = (await page.getByRole(typeof name === 'string' ? 'button' : 'link', { name }).boundingBox())!;
	const [x, y] = [box.x + box.width / 2, box.y + box.height / 2];
	if (info.project.name === 'phone') await page.touchscreen.tap(x, y);
	else await page.mouse.click(x, y);
}

test.describe('reduced motion', () => {
	test.use({ reducedMotion: 'reduce' });

	test('Scenario: Reduced motion makes transitions instant', async ({ page }, info) => {
		await page.goto('/');
		expect(await running(page)).toBe(0);
		await tap(page, info, /Imposter/);
		await expect(page).toHaveURL(/\/spiele\/imposter$/);
		expect(await running(page)).toBe(0);

		await seedGuess(page);
		expect(await clickAndLook(page, 'Einloggen')).toEqual({ animations: 0, points: '+4', scores: ['4', '0'] });
	});
});

test('Scenario: Motion never blocks input', async ({ page }, info) => {
	await page.goto('/');
	expect(await running(page)).toBeGreaterThan(0);
	await tap(page, info, /Imposter/);
	await expect(page).toHaveURL(/\/spiele\/imposter$/, { timeout: 1000 });

	await seedGuess(page);
	const mid = await clickAndLook(page, 'Einloggen');
	expect(mid.animations).toBeGreaterThan(0);
	expect(mid.scores).not.toEqual(['4', '0']);
	await tap(page, info, 'Weiter');
	const phase = await page.evaluate(
		() => JSON.parse(localStorage.getItem('arcade:session:wavelength')!).state.phase as string
	);
	expect(phase).toBe('prep');
	await expect(page.getByRole('heading', { name: 'Gib das Handy an Bo' })).toBeVisible({ timeout: 1000 });
});
