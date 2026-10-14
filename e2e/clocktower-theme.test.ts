import { expect, test, type Page } from '@playwright/test';
import { readdirSync } from 'node:fs';
import { ambient, seedRoster } from './helpers.ts';

// Blood on the Clocktower keeps roster and count in localStorage only, so phone and desktop never share state.
const crew = (n: number) => Array.from({ length: n }, (_, i) => `Spieler ${i + 1}`);
const html = (page: Page) => page.locator('html');
const NIGHT_GROUND = 'rgb(16, 14, 20)';
const ARCADE_GROUND = 'rgb(17, 18, 52)';

async function toPlay(page: Page) {
	await seedRoster(page, crew(5));
	await page.goto('/spiele/clocktower');
	await page.getByRole('button', { name: "Los geht's", exact: true }).click();
	await page.getByRole('button', { name: 'Spiel starten', exact: true }).click();
	await expect(page.getByRole('button', { name: 'Spiel beenden', exact: true })).toBeVisible();
}

const fonts = (page: Page) =>
	page.evaluate(() => ({
		body: getComputedStyle(document.body).fontFamily,
		heading: getComputedStyle(document.querySelector('main h1, main h2')!).fontFamily,
		bg: getComputedStyle(document.body).backgroundColor
	}));

test('Scenario: Theme only on Clocktower routes', async ({ page }) => {
	await seedRoster(page, crew(5));

	for (const path of ['/spiele/clocktower', '/spiele/clocktower/lobby', '/spiele/clocktower/erklaerung']) {
		await page.goto(path);
		await expect(page.locator('main h1, main h2').first(), path).toBeVisible();
		await expect(html(page), path).toHaveAttribute('data-theme', 'clocktower');
		const f = await fonts(page);
		expect(f.heading, path).toContain('IM Fell English SC');
		expect(f.body, path).toContain('Alegreya Sans');
	}

	await toPlay(page);
	await expect(page).toHaveURL(/\/spiele\/clocktower\/spielen$/);
	await expect(html(page)).toHaveAttribute('data-theme', 'clocktower');
	const play = await fonts(page);
	expect(play.heading).toContain('IM Fell English SC');
	expect(play.body).toContain('Alegreya Sans');

	for (const path of ['/', '/spiele/imposter']) {
		await page.goto(path);
		await expect(page.locator('main h1, main h2').first(), path).toBeVisible();
		await expect(html(page), path).not.toHaveAttribute('data-theme');
	}
});

test('Scenario: No theme flash on reload', async ({ page, request }) => {
	const res = await request.get('/spiele/clocktower');
	const tag = (await res.text()).match(/<html[^>]*>/)![0];
	expect(tag).toContain('data-theme="clocktower"');
	expect(tag).toContain('data-variant="night"');
	expect(await res.text()).not.toContain('%arcade');

	const home = await (await request.get('/')).text();
	expect(home.match(/<html[^>]*>/)![0]).not.toContain('data-theme');
	expect(home).not.toContain('%arcade');

	// the first frame that has a body is the first frame that can paint
	await page.addInitScript(() => {
		const look = () => {
			if (!document.body) return requestAnimationFrame(look);
			(window as unknown as { firstPaint: string }).firstPaint = getComputedStyle(document.body).backgroundColor;
		};
		look();
	});
	await seedRoster(page, crew(5));
	await page.goto('/spiele/clocktower');
	await page.reload();
	await expect(page.getByRole('heading', { level: 1, name: 'Blood on the Clocktower' })).toBeVisible();
	await expect(html(page)).toHaveAttribute('data-theme', 'clocktower');
	await expect(html(page)).toHaveAttribute('data-variant', 'night');
	await expect.poll(() => page.evaluate(() => (window as unknown as { firstPaint?: string }).firstPaint)).toBe(NIGHT_GROUND);
});

test('Scenario: Clocktower fonts are self-hosted', async ({ page, baseURL }) => {
	const requested: { url: string; status: number }[] = [];
	page.on('response', (res) => {
		if (res.request().resourceType() === 'font') requested.push({ url: res.url(), status: res.status() });
	});
	await seedRoster(page, crew(5));
	await page.goto('/spiele/clocktower');
	await expect(page.getByRole('heading', { level: 1, name: 'Blood on the Clocktower' })).toBeVisible();
	await page.evaluate(() => document.fonts.ready);

	expect(requested.length).toBeGreaterThan(0);
	for (const { url, status } of requested) {
		expect(url.startsWith(`${baseURL}/fonts/`), url).toBe(true);
		expect(status, url).toBe(200);
	}
	const loaded = await page.evaluate(() =>
		[...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family.replaceAll('"', ''))
	);
	expect(loaded).toContain('IM Fell English SC');
	expect(loaded).toContain('Alegreya Sans');

	const files = readdirSync('static/fonts');
	for (const name of ['IMFellEnglish-OFL.txt', 'AlegreyaSans-OFL.txt']) expect(files).toContain(name);
	for (const family of ['im-fell-english', 'alegreya-sans'])
		expect(files.some((f) => f.startsWith(family) && f.endsWith('.woff2')), family).toBe(true);

	const pixel = await page.evaluate(() => {
		const out: string[] = [];
		const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
		for (let node = walker.nextNode(); node; node = walker.nextNode()) {
			const el = node.parentElement!;
			if ((node as Text).data.trim() && el.checkVisibility() && getComputedStyle(el).fontFamily.includes('Press Start 2P'))
				out.push((node as Text).data.trim());
		}
		return out;
	});
	expect(pixel).toEqual([]);
});

const crewNames = ['Alex', 'Bo', 'Cleo', 'Dani'];

async function seedImposter(page: Page) {
	await page.evaluate((names) => {
		const players = names.map((n) => ({ id: n, name: n }));
		localStorage.setItem(
			'arcade:session:imposter',
			JSON.stringify({
				v: 1,
				state: {
					rng: { state: 1 },
					players,
					pool: [{ id: 1, a: 'Crew?', b: 'Imposter?' }],
					used: [1],
					round: 1,
					pairId: 1,
					crew: 'Crew?',
					imposter: 'Imposter?',
					imposterIndex: 0,
					phase: 'handover',
					revealIndex: 0,
					shown: false
				}
			})
		);
	}, crewNames);
}

test('Scenario: Other games keep the Arcade-Abend look', async ({ page }) => {
	await seedRoster(page, crewNames);
	await seedImposter(page);
	await page.goto('/spiele/clocktower');
	await expect(html(page)).toHaveAttribute('data-theme', 'clocktower');

	// by link: the layout takes the theme off again without a reload
	await page.getByRole('link', { name: "Rue's Arcade" }).click();
	await expect(page).toHaveURL(/\/$/);

	for (const path of ['/', '/spieler', '/spiele/imposter', '/spiele/imposter/lobby', '/spiele/imposter/spielen']) {
		await page.goto(path);
		await expect(page.locator('main h1, main h2').first(), path).toBeVisible();
		await expect(html(page), path).not.toHaveAttribute('data-theme');
		const f = await fonts(page);
		expect(f.bg, path).toBe(ARCADE_GROUND);
		expect(f.body, path).toContain('Sora');
	}
});

test.describe('reduced motion', () => {
	test.use({ reducedMotion: 'reduce' });

	test('Scenario: Clocktower ambient motion off under reduced motion', async ({ page }) => {
		await seedRoster(page, crew(5));
		for (const path of ['/spiele/clocktower', '/spiele/clocktower/lobby']) {
			await page.goto(path);
			await expect(html(page), path).toHaveAttribute('data-theme', 'clocktower');
			await expect(page.locator('[data-deco]').first(), path).toBeAttached();
			expect(await ambient(page), path).toBe(0);
		}
	});
});
