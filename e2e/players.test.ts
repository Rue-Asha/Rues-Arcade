import { expect, test, type Page } from '@playwright/test';
import { emptyServer, seedPlayers, shot } from './helpers.ts';

const saved = (page: Page) => page.getByRole('region', { name: 'Gespeicherte Spieler' });
const crew = (page: Page) => page.getByRole('region', { name: 'Dabei' });

async function create(page: Page, name: string) {
	await saved(page).getByLabel('Neuer gespeicherter Spieler').fill(name);
	await saved(page).getByRole('button', { name: 'Anlegen' }).click();
	await expect(saved(page).getByLabel('Neuer gespeicherter Spieler')).toHaveValue('');
}

test('Scenario: Save, rename and delete in the Spieler page', async ({ page }, info) => {
	const server = await emptyServer(info, 'players-crud');
	try {
		await page.goto(`${server.origin}/spieler`);
		await create(page, 'Ute');
		await create(page, 'Rita');
		const rows = saved(page).getByRole('listitem');
		await expect(rows).toHaveText([/Rita/, /Ute/]);
		await expect(saved(page).getByLabel('Neuer gespeicherter Spieler')).toHaveValue('');

		await saved(page).getByRole('button', { name: 'Ute umbenennen' }).click();
		const edit = saved(page).getByLabel('Neuer Name für Ute');
		await edit.fill('Uta');
		await edit.press('Enter');
		await expect(rows).toHaveText([/Rita/, /Uta/]);
		await shot(page, info, 'spieler-gespeichert');

		await saved(page).getByRole('button', { name: 'Rita löschen' }).click();
		await page.getByRole('dialog').getByRole('button', { name: 'Löschen' }).click();
		await expect(rows).toHaveText([/Uta/]);

		await page.reload();
		await expect(rows).toHaveText([/Uta/]);
		await expect(rows).toHaveCount(1);
	} finally {
		server.close();
	}
});

test('Scenario: Deleting a saved player asks for confirmation', async ({ page, request }, info) => {
	const server = await emptyServer(info, 'players-confirm');
	try {
		await seedPlayers(request, server.origin, ['Ute']);
		await page.goto(`${server.origin}/spieler`);
		await saved(page).getByRole('button', { name: 'Ute löschen' }).click();
		const dialog = page.getByRole('dialog');
		await expect(dialog.getByRole('heading', { name: 'Spieler löschen?' })).toBeVisible();
		await dialog.getByRole('button', { name: 'Abbrechen' }).click();
		await expect(dialog).toHaveCount(0);
		await expect(saved(page).getByRole('listitem')).toHaveText([/Ute/]);
	} finally {
		server.close();
	}
});

test('Scenario: Duplicate saved name shows the server message', async ({ page, request }, info) => {
	const server = await emptyServer(info, 'players-duplicate');
	try {
		await seedPlayers(request, server.origin, ['Ute']);
		await page.goto(`${server.origin}/spieler`);
		await expect(saved(page).getByRole('listitem')).toHaveCount(1);
		await saved(page).getByLabel('Neuer gespeicherter Spieler').fill('ute');
		await saved(page).getByRole('button', { name: 'Anlegen' }).click();
		await expect(saved(page).getByRole('alert')).toHaveText('„ute“ ist schon gespeichert.');
		await expect(saved(page).getByRole('listitem')).toHaveCount(1);
	} finally {
		server.close();
	}
});

test('Scenario: No saved players shows an empty state', async ({ page }, info) => {
	const server = await emptyServer(info, 'players-empty');
	try {
		await page.goto(`${server.origin}/spieler`);
		await expect(
			saved(page).getByText('Gespeicherte Spieler behalten ihren Namen in allen Spielen.', { exact: true })
		).toBeVisible();
		await expect(saved(page).getByLabel('Neuer gespeicherter Spieler')).toBeVisible();
		await expect(saved(page).getByRole('listitem')).toHaveCount(0);
		await shot(page, info, 'spieler-gespeichert-leer');
	} finally {
		server.close();
	}
});

test('Scenario: Server unreachable keeps guests working', async ({ page }, info) => {
	const server = await emptyServer(info, 'players-offline');
	try {
		await page.route('**/api/players**', (route) => route.abort());
		await page.goto(`${server.origin}/spieler`);
		await expect(
			saved(page).getByText('Gespeicherte Spieler sind gerade nicht erreichbar.', { exact: true })
		).toBeVisible();

		await page.getByLabel('Name', { exact: true }).fill('Gustav');
		await page.getByLabel('Name', { exact: true }).press('Enter');
		await expect(crew(page).getByRole('listitem')).toHaveText([/Gustav/]);
	} finally {
		server.close();
	}
});

test('Scenario: Deleting a saved player removes its roster entry', async ({ page, request }, info) => {
	const server = await emptyServer(info, 'players-delete-entry');
	try {
		await seedPlayers(request, server.origin, ['Rita']);
		await page.goto(`${server.origin}/spieler`);
		await saved(page).getByRole('button', { name: 'Rita hinzufügen' }).click();
		await expect(crew(page).getByRole('listitem')).toHaveText([/Rita/]);

		await saved(page).getByRole('button', { name: 'Rita löschen' }).click();
		await page.getByRole('dialog').getByRole('button', { name: 'Löschen' }).click();
		await expect(saved(page).getByRole('listitem')).toHaveCount(0);
		await expect(crew(page).getByRole('listitem')).toHaveCount(0);

		await page.reload();
		await expect(saved(page).getByRole('listitem')).toHaveCount(0);
		await expect(crew(page).getByRole('listitem')).toHaveCount(0);
	} finally {
		server.close();
	}
});
