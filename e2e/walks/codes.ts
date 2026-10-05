import { expect, type Page } from '@playwright/test';
import { seedRoster } from '../helpers.ts';

const press = (page: Page, name: string | RegExp) =>
	page.getByRole('button', typeof name === 'string' ? { name, exact: true } : { name }).click();

// start, lobby, Aufdecken (covered and held), Spiel (first try and after three misses), both results and Endstand
export async function walk(page: Page, check: (slug: string) => Promise<void>) {
	await seedRoster(page, ['Alex', 'Bo', 'Cleo', 'Dani']);
	// readable words for the screenshots instead of whatever the seeded pool draws
	await page.route('**/api/content/codes_words', (route) =>
		route.request().method() === 'GET'
			? route.fulfill({
					json: [
						{ id: 1, a: 'Leuchtturm', b: '' },
						{ id: 2, a: 'Regenschirm', b: '' }
					]
				})
			: route.fallback()
	);
	await page.goto('/spiele/codes');
	await check('start-codes');

	await press(page, "Los geht's");
	await expect(page.getByRole('group', { name: 'Team 1', exact: true })).toBeVisible();
	await page.getByRole('group', { name: 'Runden' }).getByRole('button', { name: '2', exact: true }).click();
	await check('lobby-codes');
	await press(page, "Los geht's");

	await expect(page.getByText('Verdeckt', { exact: true })).toBeVisible();
	await check('codes-reveal');
	const control = page.getByRole('button', { name: 'Gedrückt halten' });
	await control.scrollIntoViewIfNeeded();
	const box = (await control.boundingBox())!;
	await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
	await page.mouse.down();
	await check('codes-reveal-held');
	await page.mouse.up();

	await press(page, 'Verdecken & raten');
	await expect(page.getByTestId('value')).toHaveText('3');
	await check('codes-play');
	for (let i = 0; i < 3; i++) await press(page, 'Daneben, nächstes Team');
	await expect(page.getByRole('button', { name: 'Überspringen' })).toBeVisible();
	await check('codes-play-late');
	await press(page, 'Überspringen');
	await expect(page.getByText('Übersprungen', { exact: true })).toBeVisible();
	await check('codes-result-skipped');

	await press(page, 'Nächste Runde');
	await press(page, 'Verdecken & raten');
	await press(page, /^Erraten/);
	await expect(page.getByTestId('points')).toHaveText('+3');
	await check('codes-result');
	await press(page, 'Zum Ergebnis');
	await expect(page.getByText('Gewinner', { exact: true })).toBeVisible();
	// countUp is not WAAPI, so the settle in check() doesn't wait for it
	await expect(page.getByRole('region', { name: 'Punktestand' }).locator('.pts').first()).toHaveText('3');
	await check('codes-gameover');
}
