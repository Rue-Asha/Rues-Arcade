import { expect, type Page, type Route } from '@playwright/test';
import { seedRoster } from '../helpers.ts';

const press = (page: Page, name: string) => page.getByRole('button', { name, exact: true }).click();

async function holding(page: Page, check: () => Promise<void>) {
	const box = (await page.getByRole('button', { name: 'Gedrückt halten' }).boundingBox())!;
	await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
	await page.mouse.down();
	await check();
	await page.mouse.up();
}

// The start screen needs content in the shared e2e database; the lobby's content fetch is pinned to a
// readable spectrum for the screenshots.
export async function seed(page: Page, tag: string) {
	await page.request.post('/api/content/wavelength_spectra', { data: { a: `Look ${tag}`, b: `Look ${tag}!` } });
	await page.route('**/api/content/wavelength_spectra', (route: Route) =>
		route.request().method() === 'GET' ? route.fulfill({ json: [{ id: 1, a: 'Kalt', b: 'Heiß' }] }) : route.fallback()
	);
}

// Start, lobby (full and short a team), every phase of a Versus round and its game over, then Koop's lobby,
// prep, result and game over. Expects the roster Alex, Bo, Cleo, Dani and seed() to have run.
export async function walk(page: Page, check: (slug: string) => Promise<void>) {
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
	if (phase === 'result') await expect(page.getByTestId('points')).toHaveText(`+${lastScore}`);
}
