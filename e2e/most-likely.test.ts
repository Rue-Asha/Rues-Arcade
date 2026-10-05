import { expect, test } from '@playwright/test';
import { seedRoster, shot } from './helpers.ts';

const crew = (n: number) => Array.from({ length: n }, (_, i) => `Spieler ${i + 1}`);

test('Scenario: Most Likely lobby offers rounds', async ({ page }, info) => {
	await seedRoster(page, ['Alex', 'Bo', 'Cleo']);
	await page.goto('/spiele/most-likely/lobby');

	const rounds = page.getByRole('group', { name: 'Runden' }).getByRole('button');
	await expect(rounds).toHaveText(['5', '10', '15', '20']);
	await expect(rounds.filter({ hasText: /^10$/ })).toHaveAttribute('aria-pressed', 'true');
	for (const r of ['5', '15', '20'])
		await expect(page.getByRole('button', { name: r, exact: true })).toHaveAttribute('aria-pressed', 'false');
	await expect(page.getByRole('button', { name: "Los geht's" })).toBeEnabled();
	await shot(page, info, 'lobby-most-likely');

	await page.getByRole('button', { name: '5', exact: true }).click();
	await expect(page.getByRole('button', { name: '5', exact: true })).toHaveAttribute('aria-pressed', 'true');
	await expect(page.getByRole('button', { name: '10', exact: true })).toHaveAttribute('aria-pressed', 'false');
});

test('Scenario: Most Likely needs three players', async ({ page }) => {
	await seedRoster(page, ['Alex', 'Bo']);
	await page.goto('/spiele/most-likely');

	await expect(page.getByRole('button', { name: "Los geht's" })).toBeDisabled();
	await expect(page.getByText('mind. 3 Spieler')).toBeVisible();
});

test('Scenario: Most Likely roster above maximum asks who plays', async ({ page }) => {
	await seedRoster(page, crew(21));
	await page.goto('/spiele/most-likely/lobby');

	await expect(page.getByText('Wer spielt mit?', { exact: true })).toBeVisible();
	await expect(page.getByRole('checkbox')).toHaveCount(21);
	await expect(page.getByText('höchstens 20')).toBeVisible();
	const next = page.getByRole('button', { name: 'Weiter' });
	await expect(next).toBeDisabled();

	await page.getByRole('checkbox', { name: 'Spieler 21' }).uncheck();
	await expect(next).toBeEnabled();
	for (let i = 4; i <= 20; i++) await page.getByRole('checkbox', { name: `Spieler ${i}`, exact: true }).uncheck();
	await expect(next).toBeEnabled();
	await page.getByRole('checkbox', { name: 'Spieler 3', exact: true }).uncheck();
	await expect(next).toBeDisabled();
	await page.getByRole('checkbox', { name: 'Spieler 3', exact: true }).check();

	await next.click();
	await expect(page.getByRole('checkbox')).toHaveCount(0);
	await expect(page.getByRole('group', { name: 'Runden' })).toBeVisible();
	await expect(page.getByText('3 Spieler', { exact: true }).first()).toBeVisible();
});
