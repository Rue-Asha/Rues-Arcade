import { readFileSync } from 'node:fs';
import { expect, test, type Page, type Route, type TestInfo } from '@playwright/test';
import { seedRoster, shot } from './helpers.ts';

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

// Home, Spieler, both start screens, lobbies, every game phase, Inhalte and Erklärung.
async function walk(page: Page, info: TestInfo, check: Check) {
	await content(page, info);
	await seedRoster(page, names);

	await page.goto('/');
	await check('home');
	await page.goto('/spieler');
	await check('spieler');

	await page.goto('/spiele/imposter');
	await check('start-imposter');
	await press(page, 'Spiel starten');
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
	await press(page, 'Spiel starten');
	await expect(page).toHaveURL(/\/lobby$/);
	await press(page, '1');
	await check('lobby-wavelength');
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
		if (i === 0) await check('wavelength-result');
		await page.getByRole('button', { name: /^(Weiter|Zum Endstand)$/ }).click();
	}
	await expect(page.getByRole('button', { name: 'Nochmal spielen' })).toBeVisible();
	await check('wavelength-gameover');

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
