import { expect, test } from '@playwright/test';
import { shot } from './helpers.ts';

test('Scenario: First run shows empty roster prompt', async ({ page }, info) => {
	await page.goto('/spieler');

	await expect(page.getByText('Noch keine Spieler')).toBeVisible();
	await expect(page.getByRole('listitem')).toHaveCount(0);
	await expect(page.getByLabel('Name')).toBeVisible();
	await shot(page, info, 'spieler-leer');
});

test('Scenario: Roster survives reload', async ({ page }, info) => {
	await page.goto('/spieler');
	const name = page.getByLabel('Name');

	await name.fill('Alex');
	await page.getByRole('button', { name: 'Hinzufügen' }).click();
	await name.fill('Bo');
	await name.press('Enter');
	await expect(page.getByRole('listitem')).toHaveText([/Alex/, /Bo/]);

	await page.getByRole('button', { name: 'Bo nach oben' }).click();
	await expect(page.getByRole('listitem')).toHaveText([/Bo/, /Alex/]);

	await page.reload();
	await expect(page.getByRole('listitem')).toHaveText([/Bo/, /Alex/]);
	await shot(page, info, 'spieler');
});

test('rename, remove and rejected names show a message', async ({ page }) => {
	await page.goto('/spieler');
	const name = page.getByLabel('Name');
	await name.fill('Alex');
	await name.press('Enter');

	await name.fill('alex');
	await name.press('Enter');
	await expect(page.getByRole('alert')).toContainText('schon dabei');
	await expect(page.getByRole('listitem')).toHaveCount(1);

	await page.getByRole('button', { name: 'Alex umbenennen' }).click();
	const edit = page.getByLabel('Neuer Name für Alex');
	await edit.fill('Ali');
	await edit.press('Enter');
	await expect(page.getByRole('listitem')).toHaveText([/Ali/]);

	await page.getByRole('button', { name: 'Ali entfernen' }).click();
	await expect(page.getByRole('listitem')).toHaveCount(0);
	await expect(page.getByText('Noch keine Spieler')).toBeVisible();
});
