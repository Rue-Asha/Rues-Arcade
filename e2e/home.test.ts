import { expect, test } from '@playwright/test';
import { existsSync, readdirSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { emptyServer, shot } from './helpers.ts';

test('Scenario: Tiles for registered games', async ({ page }) => {
	await page.goto('/');

	for (const [name, slug, range] of [
		['Imposter', 'imposter', '3–12 Spieler'],
		['Wavelength', 'wavelength', '2–18 Spieler'],
		['Codes', 'codes', '4–20 Spieler'],
		['What Rhymes with Duck', 'duck', '4–16 Spieler'],
		['Most Likely To', 'most-likely', '3–20 Spieler'],
		['Family Feud', 'family-feud', '4–20 Spieler']
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

	await expect(locked).toHaveCount(1);
	const tile = locked.filter({ hasText: 'Charade' });
	await expect(tile).toContainText('Bald verfügbar');
	await expect(tile.locator('a, button')).toHaveCount(0);
	await expect(page.getByRole('link', { name: 'Charade' })).toHaveCount(0);
	await expect(page.getByRole('button', { name: 'Charade' })).toHaveCount(0);

	await locked.filter({ hasText: 'Charade' }).click();
	await expect(page).toHaveURL(/\/$/);
	await shot(page, info, 'home');
});

test('Scenario: New tiles carry their own badge', async ({ page }) => {
	await page.goto('/');
	const badge = (name: string) => page.getByRole('link', { name: new RegExp(name) }).locator('.badge svg');
	// the fallback badge is a game pad: a rounded frame with a plus and a button
	const fallback = '<rect x="3" y="7" width="18" height="11" rx="3">';

	const drawn: string[] = [];
	for (const name of ['Imposter', 'Wavelength', 'Codes', 'What Rhymes with Duck', 'Most Likely To']) {
		await expect(badge(name), name).toHaveCount(1);
		drawn.push((await badge(name).innerHTML()).replace(/<!--.*?-->/g, ''));
	}
	for (const svg of drawn.slice(2)) expect(svg).not.toContain(fallback);
	expect(new Set(drawn).size).toBe(drawn.length);
});

test('Scenario: Fresh database runs with empty tables', async ({ page }, info) => {
	const server = await emptyServer(info, 'fresh');
	try {
		await page.goto(`${server.origin}/`);
		await expect(page.getByRole('link', { name: /Imposter/ })).toBeVisible();
		await expect(page.getByRole('link', { name: /Wavelength/ })).toBeVisible();

		expect(existsSync(server.db)).toBe(true);
		const db = new DatabaseSync(server.db, { readOnly: true });
		const applied = db.prepare('SELECT name FROM schema_migrations ORDER BY name').all().map((r) => r.name);
		expect(applied).toEqual(readdirSync('migrations').filter((f) => f.endsWith('.sql')).sort());
		for (const [table, n] of [
			['imposter_pairs', 0],
			['wavelength_spectra', 0],
			['codes_words', 91],
			['duck_words', 60],
			['most_likely_prompts', 60]
		] as const)
			expect(db.prepare(`SELECT count(*) AS n FROM ${table}`).get()?.n).toBe(n);
		db.close();
	} finally {
		server.close();
	}
});
