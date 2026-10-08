import { expect, test, type Page } from '@playwright/test';
import { emptyServer, seedPlayers, seedRoster, shot } from './helpers.ts';

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

test('a double tap on Löschen sends one DELETE and no error', async ({ page, request }, info) => {
	const server = await emptyServer(info, 'players-double-delete');
	try {
		await seedPlayers(request, server.origin, ['Ute']);
		await page.goto(`${server.origin}/spieler`);
		const deletes: string[] = [];
		page.on('request', (r) => r.method() === 'DELETE' && deletes.push(r.url()));
		await saved(page).getByRole('button', { name: 'Ute löschen' }).click();
		await page.getByRole('dialog').getByRole('button', { name: 'Löschen' }).evaluate((b: HTMLElement) => {
			b.click();
			b.click();
		});
		await expect(saved(page).getByRole('listitem')).toHaveCount(0);
		await expect(saved(page).getByText('Diesen Spieler gibt es nicht mehr.')).toHaveCount(0);
		expect(deletes).toHaveLength(1);
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
		await expect(saved(page).getByRole('navigation', { name: 'Seiten', exact: true })).toHaveCount(0);
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
		await expect(crew(page).getByText('Gast', { exact: true })).toBeVisible();
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

const tag = (page: Page, name: string) =>
	crew(page).getByRole('listitem').filter({ hasText: name }).getByText('Gast', { exact: true });

test('Scenario: Tapping a saved player adds it to the roster', async ({ page, request }, info) => {
	const server = await emptyServer(info, 'players-tap');
	try {
		await seedPlayers(request, server.origin, ['Ute']);
		await page.goto(`${server.origin}/spieler`);
		await saved(page).getByRole('button', { name: 'Ute hinzufügen' }).click();
		await page.getByLabel('Name', { exact: true }).fill('Gustav');
		await page.getByLabel('Name', { exact: true }).press('Enter');

		await expect(crew(page).getByRole('listitem')).toHaveText([/Ute/, /Gustav/]);
		await expect(tag(page, 'Ute')).toHaveCount(0);
		await expect(tag(page, 'Gustav')).toHaveCount(1);
		await expect(crew(page).getByRole('button', { name: 'Ute umbenennen' })).toHaveCount(0);
		await expect(crew(page).getByRole('button', { name: 'Gustav umbenennen' })).toBeVisible();
		await shot(page, info, 'spieler-gast');
	} finally {
		server.close();
	}
});

test('Scenario: Speichern on a guest row', async ({ page }, info) => {
	const server = await emptyServer(info, 'players-promote');
	try {
		await page.goto(`${server.origin}/spieler`);
		await page.getByLabel('Name', { exact: true }).fill('Wanda');
		await page.getByLabel('Name', { exact: true }).press('Enter');
		await expect(tag(page, 'Wanda')).toHaveCount(1);

		await crew(page).getByRole('button', { name: 'Wanda speichern' }).click();
		await expect(tag(page, 'Wanda')).toHaveCount(0);
		await page.reload();
		await expect(saved(page).getByRole('listitem')).toHaveText([/Wanda/]);
		await expect(crew(page).getByRole('listitem')).toHaveText([/Wanda/]);
		await expect(tag(page, 'Wanda')).toHaveCount(0);
	} finally {
		server.close();
	}
});

test('Scenario: Old roster shows linked after the update', async ({ page, request }, info) => {
	const server = await emptyServer(info, 'players-old-roster');
	try {
		await seedPlayers(request, server.origin, ['Vera']);
		await page.goto(`${server.origin}/`);
		await seedRoster(page, ['Vera', 'Gustav']);
		await page.goto(`${server.origin}/spieler`);

		await expect(tag(page, 'Vera')).toHaveCount(0);
		await expect(tag(page, 'Gustav')).toHaveCount(1);
		await expect(crew(page).getByRole('listitem')).toHaveText([/Vera/, /Gustav/]);
	} finally {
		server.close();
	}
});

const stored = (page: Page, key: string) => page.evaluate((k) => localStorage.getItem(k), key);

test('Scenario: Old session resumes after the update', async ({ page, request }, info) => {
	const server = await emptyServer(info, 'players-old-session');
	const names = ['Vera', 'Gustav', 'Rita'];
	try {
		const pair = await request.post(`${server.origin}/api/content/imposter_pairs`, {
			headers: { origin: server.origin },
			data: { a: 'Was isst du zum Frühstück?', b: 'Was isst du zu Mittag?' }
		});
		expect(pair.status()).toBe(201);
		await page.goto(`${server.origin}/`);
		await seedRoster(page, names);
		await page.goto(`${server.origin}/spiele/imposter`);
		await page.getByRole('button', { name: "Los geht's" }).click();
		await expect(page).toHaveURL(/\/lobby$/);
		await page.getByRole('button', { name: "Los geht's" }).click();
		await expect(page).toHaveURL(/\/spielen$/);
		await expect(page.getByText('Gib das Handy an Vera')).toBeVisible();
		expect(JSON.parse((await stored(page, 'arcade:session:imposter'))!).state.players.map((p: { id: string }) => p.id)).toEqual(['p1', 'p2', 'p3']);

		const [vera] = await seedPlayers(request, server.origin, ['Vera']);
		await page.reload();
		await expect(page.getByText('Gib das Handy an Vera')).toBeVisible();
		await expect(page.getByText('Spieler 1 / 3')).toBeVisible();
		await expect(page.getByRole('list', { name: 'Reihenfolge' }).getByRole('listitem')).toHaveText(
			names.map((n) => new RegExp(`${n}$`))
		);
		await expect.poll(async () => JSON.parse((await stored(page, 'arcade:roster'))!)[0].id).toBe(`player-${vera.id}`);
	} finally {
		server.close();
	}
});

test('Scenario: Demo leaves saved players untouched', async ({ page, request }, info) => {
	const server = await emptyServer(info, 'players-demo');
	try {
		await seedPlayers(request, server.origin, ['Vera']);
		await page.goto(`${server.origin}/`);
		await seedRoster(page, ['Mira', 'Noah', 'Olli']);
		const list = async () => (await request.get(`${server.origin}/api/players`)).json();
		const before = await list();
		const crew = await stored(page, 'arcade:roster');

		await page.goto(`${server.origin}/spiele/imposter`);
		await page.getByRole('link', { name: 'Demo', exact: true }).click();
		await expect(page).toHaveURL(/\/demo\?from=/);
		const progress = page.getByText(/^Demo · Schritt \d+\/\d+$/);
		const total = Number((await progress.textContent())!.split('/')[1]);
		for (let n = 1; n <= total; n++) {
			await expect(progress).toHaveText(`Demo · Schritt ${n}/${total}`);
			await page.locator('[data-demo="expected"]').click();
		}
		await expect(page.getByText('Demo beendet', { exact: true })).toBeVisible();

		expect(await list()).toEqual(before);
		expect(await stored(page, 'arcade:roster')).toBe(crew);
	} finally {
		server.close();
	}
});

const PHONE = { width: 390, height: 844 };
const DESKTOP = { width: 1280, height: 800 };
const pager = (page: Page) => saved(page).getByRole('navigation', { name: 'Seiten', exact: true });
const next = (page: Page) => pager(page).getByRole('button', { name: 'Weiter', exact: true });
const names = (n: number) => Array.from({ length: n }, (_, i) => `Anna ${String(i + 1).padStart(2, '0')}`);

test('Scenario: Saved players page by width', async ({ page, request }, info) => {
	const server = await emptyServer(info, 'players-pages');
	try {
		await seedPlayers(request, server.origin, names(13));
		const rows = saved(page).getByRole('listitem');
		await page.setViewportSize(PHONE);
		await page.goto(`${server.origin}/spieler`);
		await expect(pager(page)).toContainText('Seite 1 von 3');
		await expect(rows).toHaveCount(6);
		const last = (await rows.last().innerText()).split('\n')[0];
		await next(page).click();
		await expect(pager(page)).toContainText('Seite 2 von 3');
		const first = (await rows.first().innerText()).split('\n')[0];
		expect(first.localeCompare(last, 'de')).toBeGreaterThan(0);

		await page.setViewportSize(DESKTOP);
		await page.goto(`${server.origin}/spieler`);
		await expect(pager(page)).toContainText('Seite 1 von 2');
		await expect(rows).toHaveCount(12);
	} finally {
		server.close();
	}
});

test('Scenario: Deleting the last saved player on a page goes back a page', async ({ page, request }, info) => {
	const server = await emptyServer(info, 'players-pages-delete');
	try {
		await seedPlayers(request, server.origin, names(7));
		await page.setViewportSize(PHONE);
		await page.goto(`${server.origin}/spieler`);
		await next(page).click();
		await expect(pager(page)).toContainText('Seite 2 von 2');
		await expect(saved(page).getByRole('listitem')).toHaveCount(1);
		await saved(page).getByRole('button', { name: 'Anna 07 löschen' }).click();
		await page.getByRole('dialog').getByRole('button', { name: 'Löschen' }).click();
		await expect(saved(page).getByRole('listitem')).toHaveCount(6);
		await expect(pager(page)).toHaveCount(0);
	} finally {
		server.close();
	}
});

test('Scenario: Saving a player shows its page', async ({ page, request }, info) => {
	const server = await emptyServer(info, 'players-pages-save');
	try {
		await seedPlayers(request, server.origin, names(12));
		await page.setViewportSize(PHONE);
		await page.goto(`${server.origin}/spieler`);
		await expect(pager(page)).toContainText('Seite 1 von 2');
		await create(page, 'Zora');
		await expect(pager(page)).toContainText('Seite 3 von 3');
		await expect(saved(page).getByText('Zora', { exact: true })).toBeVisible();
	} finally {
		server.close();
	}
});

test('Scenario: Saving a player shows its page when a name differs only by a diacritic', async ({ page, request }, info) => {
	const server = await emptyServer(info, 'players-pages-diacritic');
	try {
		await seedPlayers(request, server.origin, [...names(11), 'Müller']);
		await page.setViewportSize(PHONE);
		await page.goto(`${server.origin}/spieler`);
		await expect(pager(page)).toContainText('Seite 1 von 2');
		await create(page, 'Muller');
		await expect(pager(page)).toContainText('Seite 3 von 3');
		await expect(saved(page).getByText('Muller', { exact: true })).toBeVisible();
	} finally {
		server.close();
	}
});

test('Scenario: Roster stays unpaged', async ({ page }, info) => {
	const server = await emptyServer(info, 'players-roster-unpaged');
	try {
		await page.goto(`${server.origin}/`);
		await seedRoster(page, names(13));
		await page.setViewportSize(PHONE);
		await page.goto(`${server.origin}/spieler`);
		await expect(crew(page).getByRole('listitem')).toHaveCount(13);
		await expect(crew(page).getByRole('navigation', { name: 'Seiten', exact: true })).toHaveCount(0);
	} finally {
		server.close();
	}
});
