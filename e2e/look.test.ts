import { readFileSync } from 'node:fs';
import { expect, test, type Page, type Route, type TestInfo } from '@playwright/test';
import { seedRoster, shot } from './helpers.ts';
import { walk as walkCodes } from './walks/codes.ts';
import { walk as walkDuck } from './walks/duck.ts';
import { walk as walkMostLikely } from './walks/most-likely.ts';

type Check = (slug: string) => Promise<void>;

const names = ['Alex', 'Bo', 'Cleo', 'Dani'];
const CREW = 'Was isst du am liebsten zum Frühstück?';
const IMPOSTER = 'Was isst du am liebsten zu Mittag?';
const fixture = new URL('./fixtures/explain/', import.meta.url);

// The start screens need content in the shared e2e database, so each walk adds its own entries; the
// lobby's content fetch is pinned to readable ones for the screenshots.
async function content(page: Page, info: TestInfo) {
	const tag = `${info.project.name}-${info.title.length}-${Date.now()}`;
	await page.request.post('/api/content/imposter_pairs', { data: { a: `Look ${tag}?`, b: `Look ${tag}!` } });
	await page.request.post('/api/content/wavelength_spectra', { data: { a: `Look ${tag}`, b: `Look ${tag}!` } });
	const pinned = (a: string, b: string) => (route: Route) =>
		route.request().method() === 'GET' ? route.fulfill({ json: [{ id: 1, a, b }] }) : route.fallback();
	await page.route('**/api/content/imposter_pairs', pinned(CREW, IMPOSTER));
	await page.route('**/api/content/wavelength_spectra', pinned('Kalt', 'Heiß'));
	await page.route('**/explain/imposter/**', (route) => {
		const name = new URL(route.request().url()).pathname.split('/').pop() || 'index.html';
		route.fulfill({
			body: readFileSync(new URL(name, fixture)),
			contentType: name.endsWith('.png') ? 'image/png' : 'text/html; charset=utf-8'
		});
	});
}

async function press(page: Page, name: string) {
	await page.getByRole('button', { name, exact: true }).click();
}

async function holding(page: Page, check: () => Promise<void>) {
	const box = (await page.getByRole('button', { name: 'Gedrückt halten' }).boundingBox())!;
	await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
	await page.mouse.down();
	await check();
	await page.mouse.up();
}

// Home, Spieler, every start screen, lobbies, every game phase (Wavelength as Versus and Koop), Inhalte and Erklärung.
// Codes, Duck and Most Likely To walk their own screens from e2e/walks/.
async function walk(page: Page, info: TestInfo, check: Check) {
	test.slow();
	await content(page, info);
	await seedRoster(page, names);

	await page.goto('/');
	await check('home');
	await page.goto('/spieler');
	await check('spieler');

	await page.goto('/spiele/imposter');
	await check('start-imposter');
	await press(page, "Los geht's");
	await expect(page).toHaveURL(/\/lobby$/);
	await check('lobby-imposter');
	await press(page, "Los geht's");
	await expect(page).toHaveURL(/\/spielen$/);
	for (const [i, name] of names.entries()) {
		await expect(page.getByText(`Gib das Handy an ${name}`, { exact: true })).toBeVisible();
		if (i === 0) await check('imposter-handover');
		await press(page, `${name} ist bereit`);
		if (i === 0) await check('imposter-view');
		await holding(page, async () => {
			await expect(page.getByTestId('question')).toBeVisible();
			if (i === 0) await check('imposter-view-held');
		});
	}
	await check('imposter-crew');
	await press(page, 'Crew-Frage aufdecken');
	await check('imposter-crew-shown');
	await press(page, 'Weiter zum Imposter');
	await check('imposter-unmask');
	await press(page, 'Imposter aufdecken');
	await expect(page.getByTestId('unmasked')).toBeVisible();
	await check('imposter-unmask-shown');

	await page.goto('/spiele/wavelength');
	await check('start-wavelength');
	await press(page, "Los geht's");
	await expect(page).toHaveURL(/\/lobby$/);
	await press(page, '1');
	await check('lobby-wavelength');
	await page.getByRole('button', { name: 'Alex', exact: true }).click();
	await expect(page.getByText('1 / 3', { exact: true })).toBeVisible();
	await check('lobby-wavelength-short');
	await page.getByRole('button', { name: 'Alex', exact: true }).click();
	await expect(page.getByText('1 / 3', { exact: true })).toHaveCount(0);
	await press(page, "Los geht's");
	await expect(page).toHaveURL(/\/spielen$/);
	for (const [i, psychic] of ['Alex', 'Bo'].entries()) {
		await expect(page.getByRole('heading', { name: `Gib das Handy an ${psychic}` })).toBeVisible();
		if (i === 0) await check('wavelength-prep');
		await press(page, 'Ziel anzeigen');
		if (i === 0) await check('wavelength-reveal');
		await holding(page, async () => {
			await expect(page.getByRole('img', { name: /Ziel bei/ })).toBeVisible();
			if (i === 0) await check('wavelength-reveal-held');
		});
		await page.getByRole('button', { name: /^Verdecken/ }).click();
		if (i === 0) {
			await check('wavelength-guess');
			await aim(page);
		}
		await press(page, 'Einloggen');
		await expect(page.getByTestId('points')).toBeVisible();
		if (i === 0) {
			await counted(page);
			await check('wavelength-result');
		}
		await page.getByRole('button', { name: /^(Weiter|Zum Endstand)$/ }).click();
	}
	await expect(page.getByRole('button', { name: 'Nochmal spielen' })).toBeVisible();
	await counted(page);
	await check('wavelength-gameover');

	await seedRoster(page, ['Alex', 'Bo']);
	await page.goto('/spiele/wavelength/lobby');
	await expect(page.getByRole('button', { name: 'Koop', exact: true })).toHaveAttribute('aria-pressed', 'true');
	await press(page, '1');
	await check('lobby-wavelength-koop');
	await press(page, "Los geht's");
	await expect(page).toHaveURL(/\/spielen$/);
	for (const [i, psychic] of ['Alex', 'Bo'].entries()) {
		await expect(page.getByText(`Runde 1 / 1 · Zug ${i + 1} / 2`, { exact: true })).toBeVisible();
		await expect(page.getByRole('heading', { name: `Gib das Handy an ${psychic}` })).toBeVisible();
		if (i === 0) await check('wavelength-koop-prep');
		await press(page, 'Ziel anzeigen');
		await page.getByRole('button', { name: /^Verdecken/ }).click();
		await aim(page);
		await press(page, 'Einloggen');
		await expect(page.getByTestId('points')).toHaveText('+4');
		if (i === 0) {
			await counted(page);
			await check('wavelength-koop-result');
		}
		await page.getByRole('button', { name: /^(Weiter|Zum Endstand)$/ }).click();
	}
	await expect(page.getByText('8 Punkte', { exact: true })).toBeVisible();
	await counted(page);
	await check('wavelength-koop-gameover');

	await walkCodes(page, check);
	await walkDuck(page, check);
	await walkMostLikely(page, check);

	await seedRoster(page, Array.from({ length: 13 }, (_, i) => `Spieler ${i + 1}`));
	await page.goto('/spiele/imposter/lobby');
	await expect(page.getByText('Wer spielt mit?', { exact: true })).toBeVisible();
	await check('lobby-pick');

	await page.goto('/spiele/imposter/inhalte');
	await check('inhalte-imposter');
	await page.goto('/spiele/wavelength/inhalte');
	await check('inhalte-wavelength');
	await page.goto('/spiele/imposter/erklaerung');
	await expect(page.locator('iframe')).toBeVisible();
	await check('erklaerung-imposter');
	await page.goto('/spiele/wavelength/erklaerung');
	await expect(page.getByText('Für dieses Spiel gibt es noch keine Erklärung.', { exact: true })).toBeVisible();
	await check('erklaerung-wavelength');
}

async function aim(page: Page) {
	const target = await page.evaluate(
		() => JSON.parse(localStorage.getItem('arcade:session:wavelength')!).state.target as number
	);
	const dial = page.getByRole('slider', { name: 'Zeiger' });
	await dial.focus();
	const steps = Math.round(target) - Number(await dial.getAttribute('aria-valuenow'));
	for (let i = 0; i < Math.abs(steps); i++) await dial.press(steps > 0 ? 'ArrowRight' : 'ArrowLeft');
}

// countUp writes text frame by frame, outside the animations shot() waits for
async function counted(page: Page) {
	const { teams, phase, lastScore } = await page.evaluate(
		() => JSON.parse(localStorage.getItem('arcade:session:wavelength')!).state
	);
	const scores = (teams as { score: number }[]).map((t) => String(t.score)).sort();
	await expect.poll(async () => (await page.locator('.board .pts').allTextContents()).sort()).toEqual(scores);
	if (phase === 'result') await expect(page.getByTestId('points')).toHaveText(lastScore > 0 ? `+${lastScore}` : '0');
}

async function settle(page: Page) {
	await page.evaluate(() =>
		Promise.all(
			document
				.getAnimations()
				.filter((a) => a.effect?.getTiming().iterations !== Infinity)
				.map((a) => a.finished)
		)
	);
}

test('Scenario: Touch targets are at least 44px', async ({ page }, info) => {
	const small: string[] = [];
	await walk(page, info, async (slug) => {
		await settle(page);
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
		await settle(page);
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
	page.on('request', (req) => {
		const url = new URL(req.url());
		if (/^https?:$/.test(url.protocol) && url.origin !== new URL(baseURL!).origin) foreign.push(req.url());
	});
	const screens: string[] = [];
	await walk(page, info, async (slug) => {
		await settle(page);
		screens.push(slug);
	});
	expect(screens.length).toBeGreaterThan(20);
	expect(foreign).toEqual([]);
});

test('Scenario: New copy has no exclamation marks', async ({ page }, info) => {
	const loud: string[] = [];
	const seen = new Set<string>();
	await walk(page, info, async (slug) => {
		const parts = { ...NEW_COPY, ...(slug === 'wavelength-koop-gameover' ? { gameover: 'main .reveal' } : {}) };
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
