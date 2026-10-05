import { expect, test } from '@playwright/test';
import { seedRoster, shot } from './helpers.ts';

const crew = (n: number) => Array.from({ length: n }, (_, i) => `Spieler ${i + 1}`);

test('Scenario: Codes teams dealt from the roster', async ({ page }, info) => {
	await seedRoster(page, crew(7));
	await page.goto('/spiele/codes/lobby');

	const team = (n: number) => page.getByRole('group', { name: `Team ${n}`, exact: true });
	await expect(team(1).getByRole('button')).toHaveCount(3);
	await expect(team(2).getByRole('button')).toHaveCount(2);
	await expect(team(3).getByRole('button')).toHaveCount(2);
	await expect(team(4)).toHaveCount(0);

	const fewer = page.getByRole('button', { name: 'Weniger Teams' });
	const more = page.getByRole('button', { name: 'Mehr Teams' });
	await expect(more).toBeDisabled();
	await expect(fewer).toBeEnabled();

	const rounds = page.getByRole('group', { name: 'Runden' }).getByRole('button');
	await expect(rounds).toHaveText(['1', '2', '3', '4', '5', '6', '7', '8']);
	await expect(rounds.filter({ hasText: /^5$/ })).toHaveAttribute('aria-pressed', 'true');
	await expect(page.getByRole('button', { name: "Los geht's" })).toBeEnabled();
	await shot(page, info, 'lobby-codes-seven');

	await fewer.click();
	await expect(team(3)).toHaveCount(0);
	await expect(fewer).toBeDisabled();
	await expect(more).toBeEnabled();
});

test('Scenario: Codes start blocked by a team below two', async ({ page }) => {
	await seedRoster(page, ['Alex', 'Bo', 'Cleo', 'Dani']);
	await page.goto('/spiele/codes/lobby');

	const hint = page.getByText('Jedes Team braucht mind. 2 Spieler.', { exact: true });
	await expect(hint).toHaveCount(0);
	await page.getByRole('group', { name: 'Team 1', exact: true }).getByRole('button', { name: 'Alex', exact: true }).click();
	await expect(page.getByRole('group', { name: 'Team 1', exact: true }).getByRole('button')).toHaveCount(1);
	await expect(page.getByRole('button', { name: "Los geht's" })).toBeDisabled();
	await expect(hint).toBeVisible();
});

test('Scenario: Codes needs four players', async ({ page }) => {
	await seedRoster(page, ['Alex', 'Bo', 'Cleo']);
	await page.goto('/spiele/codes');

	await expect(page.getByRole('button', { name: "Los geht's" })).toBeDisabled();
	await expect(page.getByText('mind. 4 Spieler')).toBeVisible();
});

test('Scenario: Codes roster above maximum asks who plays', async ({ page }) => {
	await seedRoster(page, crew(21));
	await page.goto('/spiele/codes/lobby');

	await expect(page.getByText('Wer spielt mit?')).toBeVisible();
	await expect(page.getByRole('group', { name: 'Team 1', exact: true })).toHaveCount(0);
	const next = page.getByRole('button', { name: 'Weiter' });
	await expect(next).toBeDisabled();
	await page.getByRole('checkbox', { name: 'Spieler 21' }).uncheck();
	await next.click();

	await expect(page.getByRole('group', { name: 'Team 5', exact: true }).getByRole('button')).toHaveCount(4);
	await expect(page.getByRole('button', { name: "Los geht's" })).toBeEnabled();
});
