import { expect, test, type Page } from '@playwright/test';
import { seedRoster, shot } from './helpers.ts';

const names = ['Alex', 'Bo', 'Cleo', 'Dani'];
const crew = (n: number) => Array.from({ length: n }, (_, i) => `Spieler ${i + 1}`);

const saved = (page: Page) =>
	page.evaluate(() => JSON.parse(localStorage.getItem('arcade:session:duck')!).state);

async function startGame(page: Page, target = 10) {
	await seedRoster(page, names);
	await page.goto('/spiele/duck/lobby');
	await page.getByRole('group', { name: 'Zielpunkte' }).getByRole('button', { name: String(target), exact: true }).click();
	await page.getByRole('button', { name: "Los geht's" }).click();
	await expect(page).toHaveURL(/\/spiele\/duck\/spielen$/);
}

test('Scenario: Duck lobby offers Zielpunkte', async ({ page }, info) => {
	await seedRoster(page, names);
	await page.goto('/spiele/duck/lobby');

	const target = page.getByRole('group', { name: 'Zielpunkte' });
	await expect(target.getByRole('button')).toHaveText(['10', '20', '30', '40', '50']);
	await expect(target.getByRole('button', { name: '10', exact: true })).toHaveAttribute('aria-pressed', 'true');
	await expect(target.locator('[aria-pressed="true"]')).toHaveCount(1);
	await expect(page.getByRole('button', { name: "Los geht's" })).toBeEnabled();
	await shot(page, info, 'lobby-duck');
});

test('Scenario: Duck needs four players', async ({ page }) => {
	await seedRoster(page, names.slice(0, 3));
	await page.goto('/spiele/duck');

	await expect(page.getByRole('button', { name: "Los geht's" })).toBeDisabled();
	await expect(page.getByText('mind. 4 Spieler')).toBeVisible();
});

test('Scenario: Duck roster above maximum asks who plays', async ({ page }) => {
	await seedRoster(page, crew(17));
	await page.goto('/spiele/duck/lobby');

	await expect(page.getByText('Wer spielt mit?', { exact: true })).toBeVisible();
	await expect(page.getByRole('checkbox')).toHaveCount(17);
	await expect(page.getByText(/höchstens 16/)).toBeVisible();
	const next = page.getByRole('button', { name: 'Weiter' });
	await expect(next).toBeDisabled();

	await page.getByRole('checkbox', { name: 'Spieler 17' }).uncheck();
	await expect(next).toBeEnabled();
	for (let i = 1; i <= 12; i++) await page.getByRole('checkbox', { name: `Spieler ${i}`, exact: true }).uncheck();
	await expect(next).toBeEnabled();
	await page.getByRole('checkbox', { name: 'Spieler 13', exact: true }).uncheck();
	await expect(next).toBeDisabled();
	await page.getByRole('checkbox', { name: 'Spieler 13', exact: true }).check();

	await next.click();
	await expect(page.getByRole('checkbox')).toHaveCount(0);
	await expect(page.getByRole('group', { name: 'Zielpunkte' })).toBeVisible();
});

test('Scenario: Duck target survives reload', async ({ page }) => {
	await startGame(page, 30);
	await expect(page.getByText('Ziel: 30 Punkte', { exact: true })).toBeVisible();
	const before = await saved(page);
	expect(before.target).toBe(30);
	expect(before.phase).toBe('reveal');

	await page.reload();
	await expect(page.getByText('Ziel: 30 Punkte', { exact: true })).toBeVisible();
	await expect(page.getByText(/verworfen/)).toHaveCount(0);
	const after = await saved(page);
	expect(after.phase).toBe('reveal');
	expect(after.word).toEqual(before.word);
	expect(after.players.map((p: { name: string }) => p.name)).toEqual(names);
});
