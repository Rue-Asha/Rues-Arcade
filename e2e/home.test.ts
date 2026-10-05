import { expect, test } from '@playwright/test';
import { shot } from './helpers.ts';

test('Scenario: Tiles for registered games', async ({ page }) => {
	await page.goto('/');

	for (const [name, slug, range] of [
		['Imposter', 'imposter', '3–12 Spieler'],
		['Wavelength', 'wavelength', '4–18 Spieler']
	]) {
		const tile = page.getByRole('link', { name: new RegExp(name) });
		await expect(tile).toHaveAttribute('href', `/spiele/${slug}`);
		await expect(tile).toContainText(range);
	}

	await page.getByRole('link', { name: /Imposter/ }).click();
	await expect(page).toHaveURL(/\/spiele\/imposter$/);
});

test('Scenario: Bald tiles have no actions', async ({ page }, info) => {
	await page.goto('/');
	const locked = page.locator('.tile.locked');

	await expect(locked).toHaveCount(5);
	for (const name of ['Duck', 'Family Feud', 'Codes', 'Most Likely To', 'Charade']) {
		const tile = locked.filter({ hasText: name });
		await expect(tile).toContainText('Bald verfügbar');
		await expect(tile.locator('a, button')).toHaveCount(0);
		await expect(page.getByRole('link', { name })).toHaveCount(0);
		await expect(page.getByRole('button', { name })).toHaveCount(0);
	}

	await locked.filter({ hasText: 'Duck' }).click();
	await expect(page).toHaveURL(/\/$/);
	await shot(page, info, 'home');
});
