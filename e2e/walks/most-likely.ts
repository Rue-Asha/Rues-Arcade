import { expect, type Page } from '@playwright/test';
import { seedRoster } from '../helpers.ts';

const press = (page: Page, name: string) => page.getByRole('button', { name, exact: true }).click();

// the phase's Stage rises in after the click, past what a check could see yet
const frames = (page: Page) =>
	page.evaluate(() => new Promise((ok) => requestAnimationFrame(() => requestAnimationFrame(ok))));

// Start, lobby and every phase on the seeded prompts; round 1 is a tie so the reveal names two holders.
export async function walk(page: Page, check: (slug: string) => Promise<void>) {
	await seedRoster(page, ['Alex', 'Bo', 'Cleo', 'Dani']);
	await page.goto('/spiele/most-likely');
	await check('start-most-likely');

	await press(page, "Los geht's");
	await expect(page).toHaveURL(/\/spiele\/most-likely\/lobby$/);
	await press(page, '5');
	await check('lobby-most-likely');
	await press(page, "Los geht's");
	await expect(page).toHaveURL(/\/spiele\/most-likely\/spielen$/);

	const pick = (name: string) =>
		page.getByRole('group', { name: 'Wer hat den Titel?' }).getByRole('button', { name, exact: true }).click();
	for (let round = 1; round <= 5; round++) {
		const first = round === 1;
		await expect(page.getByText(`Runde ${round} / 5`, { exact: true })).toBeVisible();
		await expect(page.getByTestId('prompt')).toBeVisible();
		if (first) await frames(page).then(() => check('most-likely-prompt'));
		await press(page, 'Alle haben gezeigt');
		await expect(page.getByRole('button', { name: 'Titel vergeben', exact: true })).toBeDisabled();
		if (first) await frames(page).then(() => check('most-likely-pick'));
		await pick('Alex');
		if (first) {
			await pick('Cleo');
			await check('most-likely-pick-chosen');
		}
		await press(page, 'Titel vergeben');
		await expect(page.getByTestId('holders')).toBeVisible();
		if (first) await frames(page).then(() => check('most-likely-reveal'));
		await press(page, round === 5 ? 'Zum Endstand' : 'Nächste Runde');
	}
	await expect(page.getByRole('button', { name: 'Nochmal spielen', exact: true })).toBeVisible();
	await frames(page);
	await check('most-likely-gameover');
}
