import { expect, test, type Page } from '@playwright/test';
import { demo as imposterDemo } from '../src/lib/games/imposter/demo.ts';
import { demo as wavelengthDemo } from '../src/lib/games/wavelength/demo.ts';
import { emptyServer, seedRoster } from './helpers.ts';

const IMPOSTER_STEPS = imposterDemo.steps.length;
const WAVELENGTH_STEPS = wavelengthDemo.steps.length;

async function openDemo(page: Page, slug: string, origin = '') {
	await page.goto(`${origin}/spiele/${slug}`);
	await page.getByRole('link', { name: 'Demo', exact: true }).click();
	await expect(page).toHaveURL(new RegExp(`/spiele/${slug}/demo\\?from=`));
}

const progress = (page: Page) => page.getByText(/^Demo · Schritt \d+\/\d+$/);

async function playToEnd(page: Page, total: number, beforeLast?: () => Promise<void>) {
	for (let n = 1; n <= total; n++) {
		await expect(progress(page)).toHaveText(`Demo · Schritt ${n}/${total}`);
		if (n === total) await beforeLast?.();
		const expected = page.locator('[data-demo="expected"]');
		await expect(expected).toHaveCount(1);
		await expected.click();
	}
	await expect(page.getByText('Demo beendet', { exact: true })).toBeVisible();
	await expect(page.locator('[data-demo="expected"]')).toHaveCount(0);
}

function snapshot(page: Page) {
	return page.evaluate(() => Object.fromEntries(Object.entries(localStorage)));
}

// every server call a page makes after the demo starts; static assets don't count
function serverCalls(page: Page) {
	const calls: string[] = [];
	page.on('request', (r) => {
		const url = new URL(r.url());
		if (!url.pathname.startsWith('/_app/')) calls.push(`${r.method()} ${url.pathname}`);
	});
	return calls;
}

test('Scenario: Imposter demo by tapping highlighted controls', async ({ page }) => {
	test.setTimeout(90_000);
	await openDemo(page, 'imposter');
	await expect(page.getByText('Gib das Handy an Alex', { exact: true })).toBeVisible();
	await playToEnd(page, IMPOSTER_STEPS);
	await expect(page.getByRole('dialog')).toHaveCount(0);
	await expect(page.getByTestId('unmasked')).toHaveText('Dani');
	await expect(page.getByText('Runde 2', { exact: true })).toBeVisible();
});

test('Scenario: Wavelength demo by tapping highlighted controls', async ({ page }) => {
	test.setTimeout(90_000);
	await openDemo(page, 'wavelength');
	await playToEnd(page, WAVELENGTH_STEPS, async () => {
		await expect(page.getByText('Gewinner', { exact: true })).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Team 1', exact: true })).toBeVisible();
		await expect(page.locator('[data-demo="expected"]')).toHaveAttribute('data-action', 'again');
	});
});

test('Scenario: Only the expected control is enabled', async ({ page }) => {
	await openDemo(page, 'imposter');
	await expect(progress(page)).toHaveText(`Demo · Schritt 1/${IMPOSTER_STEPS}`);
	const expected = page.locator('[data-demo="expected"]');
	await expect(expected).toHaveAttribute('data-action', 'handover');
	const skip = page.getByRole('button', { name: 'Überspringen' });
	await expect(skip).toBeDisabled();
	await skip.click({ force: true });
	await expect(page.getByRole('dialog')).toHaveCount(0);
	await expect(progress(page)).toHaveText(`Demo · Schritt 1/${IMPOSTER_STEPS}`);

	await openDemo(page, 'wavelength');
	await expect(page.locator('[data-demo="expected"]')).toHaveAttribute('data-action', 'redraw');
	const show = page.getByRole('button', { name: 'Ziel anzeigen' });
	await expect(show).toBeDisabled();
	await show.click({ force: true });
	await expect(progress(page)).toHaveText(`Demo · Schritt 1/${WAVELENGTH_STEPS}`);
	await page.locator('[data-demo="expected"]').click();
	await expect(progress(page)).toHaveText(`Demo · Schritt 2/${WAVELENGTH_STEPS}`);
	const redraw = page.getByRole('button', { name: 'Anderes Spektrum' });
	await expect(redraw).toBeDisabled();
	await page.locator('[data-demo="expected"]').click();
	await expect(progress(page)).toHaveText(`Demo · Schritt 3/${WAVELENGTH_STEPS}`);

	// on the guess step the dial is the control, and the pointer's angle is replaced by the script's
	await expect(page.getByRole('button', { name: 'Gedrückt halten' })).toBeDisabled();
	await page.locator('[data-demo="expected"]').click();
	await expect(page.locator('[data-demo="expected"]')).toHaveAttribute('data-action', 'dial');
	await expect(page.getByRole('button', { name: 'Einloggen' })).toBeDisabled();
	await page.locator('[data-demo="expected"] svg').click({ position: { x: 5, y: 5 } });
	await page.locator('[data-demo="expected"]').click();
	await expect(page.getByTestId('points')).toHaveText('+4');
});

test('Scenario: Hidden information shown with Demo tag', async ({ page }) => {
	await openDemo(page, 'imposter');
	await page.locator('[data-demo="expected"]').click();
	await expect(page.getByTestId('question')).toHaveText('Welches Tier hättest du gern als Haustier?');
	await expect(page.getByText('[Demo]', { exact: true })).toBeVisible();

	await openDemo(page, 'wavelength');
	await page.locator('[data-demo="expected"]').click();
	await page.locator('[data-demo="expected"]').click();
	await expect(progress(page)).toHaveText(`Demo · Schritt 3/${WAVELENGTH_STEPS}`);
	await expect(page.getByText('[Demo]', { exact: true })).toBeVisible();
	await expect(page.getByRole('img', { name: /^Ziel bei \d+°$/ })).toBeVisible();
	await expect(page.getByText('Verdeckt', { exact: true })).toHaveCount(0);
});

test('Scenario: Demo leaves real data untouched', async ({ page }) => {
	test.setTimeout(90_000);
	await seedRoster(page, ['Mira', 'Noah', 'Olli']);
	// a real state: the start page discards one that doesn't fit the game
	await page.evaluate(() =>
		localStorage.setItem(
			'arcade:session:imposter',
			JSON.stringify({
				v: 1,
				state: {
					rng: { state: 1 },
					players: [
						{ id: 'p1', name: 'Mira' },
						{ id: 'p2', name: 'Noah' },
						{ id: 'p3', name: 'Olli' }
					],
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
		)
	);
	const before = await snapshot(page);
	await openDemo(page, 'imposter');
	const calls = serverCalls(page);
	await playToEnd(page, IMPOSTER_STEPS);
	expect(calls).toEqual([]);
	await openDemo(page, 'wavelength');
	// opening the second demo is a navigation, which loads its page from the server
	calls.length = 0;
	await playToEnd(page, WAVELENGTH_STEPS);
	expect(calls).toEqual([]);
	expect(await snapshot(page)).toEqual(before);
});

test('Scenario: Exiting returns to the starting screen', async ({ page }) => {
	await page.goto('/');
	await page.evaluate(() =>
		localStorage.setItem(
			'arcade:session:wavelength',
			JSON.stringify({
				v: 1,
				state: {
					rng: { state: 1 },
					pool: [{ id: 1, a: 'Leise', b: 'Laut' }],
					used: [1],
					teams: [
						{ name: 'Team 1', players: [{ id: 'm', name: 'Mira' }, { id: 'o', name: 'Olli' }], score: 3 },
						{ name: 'Team 2', players: [{ id: 'n', name: 'Noah' }, { id: 'p', name: 'Pia' }], score: 0 }
					],
					rounds: 2,
					roundIndex: 0,
					teamIndex: 1,
					spectrum: { id: 1, a: 'Leise', b: 'Laut' },
					target: 60,
					dial: 90,
					phase: 'prep',
					lastScore: null
				}
			})
		)
	);
	const before = await snapshot(page);
	await page.goto('/spiele/wavelength/spielen');
	await expect(page.getByText('Gib das Handy an Noah', { exact: true })).toBeVisible();
	await page.getByRole('button', { name: 'Demo', exact: true }).click();
	await expect(page).toHaveURL(/\/spiele\/wavelength\/demo\?from=/);
	await page.locator('[data-demo="expected"]').click();
	await expect(progress(page)).toHaveText(`Demo · Schritt 2/${WAVELENGTH_STEPS}`);
	await page.getByRole('button', { name: 'Demo beenden' }).click();
	await expect(page).toHaveURL(/\/spiele\/wavelength\/spielen$/);
	await expect(page.getByText('Gib das Handy an Noah', { exact: true })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Ziel anzeigen' })).toBeEnabled();
	expect(await snapshot(page)).toEqual(before);
});

test('Scenario: Reload during demo returns to start screen', async ({ page }) => {
	await openDemo(page, 'imposter');
	await page.locator('[data-demo="expected"]').click();
	await expect(progress(page)).toHaveText(`Demo · Schritt 2/${IMPOSTER_STEPS}`);
	await page.reload();
	await expect(page).toHaveURL(/\/spiele\/imposter$/);
	await expect(page.getByRole('heading', { name: 'Imposter', exact: true })).toBeVisible();
	await expect(progress(page)).toHaveCount(0);
});

test('Scenario: Demo steppable with reduced motion', async ({ page }) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await openDemo(page, 'imposter');
	await playToEnd(page, IMPOSTER_STEPS);
	await openDemo(page, 'wavelength');
	await playToEnd(page, WAVELENGTH_STEPS);
});

test('Scenario: Demo works with an empty database', async ({ page }, info) => {
	test.setTimeout(90_000);
	const server = await emptyServer(info, 'demo');
	try {
		for (const type of ['imposter_pairs', 'wavelength_spectra'])
			expect(await (await page.request.get(`${server.origin}/api/content/${type}`)).json()).toEqual([]);
		await openDemo(page, 'imposter', server.origin);
		await playToEnd(page, IMPOSTER_STEPS);
		await openDemo(page, 'wavelength', server.origin);
		await playToEnd(page, WAVELENGTH_STEPS);
	} finally {
		server.close();
	}
});
