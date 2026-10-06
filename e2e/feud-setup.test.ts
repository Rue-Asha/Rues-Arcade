import { expect, test, type Page } from '@playwright/test';
import { emptyServer, seedPlayers, seedSavedRoster } from './helpers.ts';

const NAMES = ['Alex', 'Bo', 'Cleo', 'Dani', 'Emil', 'Fenja', 'Gerd', 'Hana'];

async function lobby(page: Page, origin: string, saved: Parameters<typeof seedSavedRoster>[1], guests: string[] = []) {
	await page.goto(`${origin}/`);
	await seedSavedRoster(page, saved, guests);
	await page.goto(`${origin}/spiele/family-feud/lobby`);
}

const manyNames = (n: number) => Array.from({ length: n }, (_, i) => `Spieler ${String(i + 1).padStart(2, '0')}`);

test('Scenario: Feud guest blocks start', async ({ page, request }, info) => {
	const server = await emptyServer(info, 'feud-guest');
	try {
		const saved = await seedPlayers(request, server.origin, NAMES.slice(0, 4));
		await lobby(page, server.origin, saved, ['Eve']);

		await expect(page.getByText('Family Feud braucht gespeicherte Spieler.')).toBeVisible();
		await expect(page.getByText('Nicht gespeichert: Eve.', { exact: true })).toBeVisible();
		await expect(page.getByRole('link', { name: 'Spieler speichern' })).toHaveAttribute(
			'href',
			'/spieler?from=/spiele/family-feud/lobby'
		);
		await expect(page.getByRole('button', { name: 'Weiter' })).toHaveCount(0);
		await expect(page.getByRole('heading', { name: 'Teams' })).toHaveCount(0);
		expect(await page.locator('main').innerText()).not.toContain('!');
	} finally {
		server.close();
	}
});

test('Scenario: Feud roster of guests only', async ({ page }, info) => {
	const server = await emptyServer(info, 'feud-guests');
	try {
		await lobby(page, server.origin, [], ['Eve', 'Finn', 'Gil', 'Hal']);

		await expect(page.getByText('Nicht gespeichert: Eve, Finn, Gil, Hal.', { exact: true })).toBeVisible();
		await expect(page.getByRole('link', { name: 'Spieler speichern' })).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Teams' })).toHaveCount(0);
	} finally {
		server.close();
	}
});

test('Scenario: Feud needs four players', async ({ page, request }, info) => {
	const server = await emptyServer(info, 'feud-three');
	try {
		const saved = await seedPlayers(request, server.origin, NAMES.slice(0, 3));
		await page.goto(`${server.origin}/`);
		await seedSavedRoster(page, saved);
		await page.goto(`${server.origin}/spiele/family-feud`);

		await expect(page.getByText('mind. 4 Spieler')).toBeVisible();
		await expect(page.getByRole('link', { name: "Los geht's" })).toHaveCount(0);
		await expect(page.getByRole('button', { name: "Los geht's" })).toBeDisabled();
	} finally {
		server.close();
	}
});

test('Scenario: Feud roster above maximum asks who plays', async ({ page, request }, info) => {
	const server = await emptyServer(info, 'feud-many');
	try {
		const saved = await seedPlayers(request, server.origin, manyNames(21));
		await lobby(page, server.origin, saved);

		await expect(page.getByRole('heading', { name: 'Wer spielt mit?' })).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Teams' })).toHaveCount(0);
		await page.getByLabel('Spieler 21').uncheck();
		await page.getByRole('button', { name: 'Weiter' }).click();
		await expect(page.getByRole('heading', { name: 'Teams' })).toBeVisible();
	} finally {
		server.close();
	}
});
