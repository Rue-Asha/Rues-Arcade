import { expect, type Page } from '@playwright/test';
import { seedRoster } from '../helpers.ts';

const press = (page: Page, name: string) => page.getByRole('button', { name, exact: true }).click();

// the phase's Stage rises in after the click, past what a check could see yet
const frames = (page: Page) =>
	page.evaluate(() => new Promise((ok) => requestAnimationFrame(() => requestAnimationFrame(ok))));

// Start, lobby with two teams and every phase on the seeded prompts; turn 1 scores 2, turn 2 "Alle verschieden".
export async function walk(page: Page, check: (slug: string) => Promise<void>) {
	await seedRoster(page, ['Alex', 'Bo', 'Cleo', 'Dani']);
	await page.goto('/spiele/most-likely');
	await check('start-most-likely');

	await press(page, "Los geht's");
	await expect(page).toHaveURL(/\/spiele\/most-likely\/lobby$/);
	await expect(page.getByRole('group', { name: 'Team 2', exact: true })).toBeVisible();
	await press(page, '5');
	await check('lobby-most-likely');
	await press(page, "Los geht's");
	await expect(page).toHaveURL(/\/spiele\/most-likely\/spielen$/);

	for (let k = 0; k < 10; k++) {
		const first = k === 0;
		await expect(page.getByText(`Runde ${Math.floor(k / 2) + 1} / 5`, { exact: true })).toBeVisible();
		await expect(page.getByTestId('prompt')).toBeVisible();
		if (first) await frames(page).then(() => check('most-likely-prompt'));
		await press(page, 'Alle haben gezeigt');
		await expect(page.getByRole('button', { name: 'Alle verschieden', exact: true })).toBeVisible();
		if (first) await frames(page).then(() => check('most-likely-count'));
		await press(page, k % 2 ? 'Alle verschieden' : '2');
		await expect(page.getByTestId('points')).toHaveText(k % 2 ? '+0' : '+2');
		if (k < 2) await frames(page).then(() => check(first ? 'most-likely-result' : 'most-likely-result-none'));
		await press(page, k === 9 ? 'Zum Ergebnis' : k % 2 ? 'Nächste Runde' : 'Nächstes Team');
	}
	await expect(page.getByRole('button', { name: 'Nochmal spielen', exact: true })).toBeVisible();
	await frames(page);
	await check('most-likely-gameover');
}
