import { expect, test, type Page } from '@playwright/test';
import { emptyServer, imposterPlayed, seedImposterPlayed, seedPairs, seedPlayers } from './helpers.ts';

const btn = (scope: Page | ReturnType<Page['locator']>, name: string) => scope.getByRole('button', { name, exact: true });
const card = (page: Page, id: number) => page.locator(`li[data-pair="${id}"]`);
const section = (page: Page, id: number) => card(page, id).getByRole('group', { name: 'Spielerliste', exact: true });

test('Scenario: Imposter card edits its played-with list', async ({ page }, info) => {
	const server = await emptyServer(info, 'imposter-played-edit');
	try {
		const [alex, bo] = await seedPlayers(page.request, server.origin, ['Alex', 'Bo', 'Cleo']);
		const [pair] = await seedPairs(page.request, server.origin, [{ a: 'Hund', b: 'Katze' }]);
		await seedImposterPlayed(page.request, server.origin, pair.id, [alex.id]);
		await page.goto(`${server.origin}/spiele/imposter/inhalte`);
		await btn(card(page, pair.id), 'Gespielt mit').click();
		const list = section(page, pair.id);
		await expect(list.getByRole('listitem')).toHaveText(['Alex EntfernenAlex']);

		await btn(list, '+ Bo').click();
		await btn(list, 'Entfernen Alex').click();
		await expect(list.getByRole('listitem')).toHaveText(['Bo EntfernenBo']);
		await expect(btn(list, '+ Alex')).toBeVisible();
		await expect(btn(list, '+ Cleo')).toBeVisible();
		await expect(btn(list, '+ Bo')).toHaveCount(0);
		expect(await imposterPlayed(page.request, server.origin)).toEqual([{ pairId: pair.id, playerIds: [bo.id] }]);

		await page.reload();
		await expect(btn(card(page, pair.id), 'Gespielt mit')).toHaveAttribute('aria-expanded', 'false');
		await expect(section(page, pair.id)).toHaveCount(0);
		await btn(card(page, pair.id), 'Gespielt mit').click();
		await expect(section(page, pair.id).getByRole('listitem')).toHaveText(['Bo EntfernenBo']);
	} finally {
		server.close();
	}
});

test('Scenario: Imposter played-with section collapses per card', async ({ page }, info) => {
	const server = await emptyServer(info, 'imposter-played-collapse');
	try {
		const [one, two] = await seedPairs(page.request, server.origin, [
			{ a: 'Hund', b: 'Katze' },
			{ a: 'Tee', b: 'Kaffee' }
		]);
		await page.goto(`${server.origin}/spiele/imposter/inhalte`);
		await btn(card(page, one.id), 'Gespielt mit').click();
		await expect(section(page, one.id)).toBeVisible();
		await expect(section(page, two.id)).toHaveCount(0);
		await expect(btn(card(page, two.id), 'Gespielt mit')).toHaveAttribute('aria-expanded', 'false');

		await page.reload();
		await expect(btn(card(page, one.id), 'Gespielt mit')).toHaveAttribute('aria-expanded', 'false');
		await expect(btn(card(page, two.id), 'Gespielt mit')).toHaveAttribute('aria-expanded', 'false');
		await expect(page.getByRole('group', { name: 'Spielerliste', exact: true })).toHaveCount(0);
	} finally {
		server.close();
	}
});

test('Scenario: Imposter played-with section with nobody on the list', async ({ page }, info) => {
	const server = await emptyServer(info, 'imposter-played-nobody');
	try {
		await seedPlayers(page.request, server.origin, ['Alex', 'Bo']);
		const [pair] = await seedPairs(page.request, server.origin, [{ a: 'Hund', b: 'Katze' }]);
		await page.goto(`${server.origin}/spiele/imposter/inhalte`);
		await btn(card(page, pair.id), 'Gespielt mit').click();
		const list = section(page, pair.id);
		await expect(list.getByText('Noch niemand.', { exact: true })).toBeVisible();
		await expect(btn(list, '+ Alex')).toBeVisible();
		await expect(btn(list, '+ Bo')).toBeVisible();
	} finally {
		server.close();
	}
});

test('Scenario: Imposter played-with section without saved players', async ({ page }, info) => {
	const server = await emptyServer(info, 'imposter-played-none');
	try {
		const [pair] = await seedPairs(page.request, server.origin, [{ a: 'Hund', b: 'Katze' }]);
		await page.goto(`${server.origin}/spiele/imposter/inhalte`);
		await btn(card(page, pair.id), 'Gespielt mit').click();
		const list = section(page, pair.id);
		await expect(list.getByText('Noch niemand.', { exact: true })).toBeVisible();
		await expect(list.getByRole('button')).toHaveCount(0);
	} finally {
		server.close();
	}
});

test('Scenario: Imposter played-with card unchanged on a failed request', async ({ page }, info) => {
	const server = await emptyServer(info, 'imposter-played-fail');
	try {
		const [alex] = await seedPlayers(page.request, server.origin, ['Alex']);
		const [pair] = await seedPairs(page.request, server.origin, [{ a: 'Hund', b: 'Katze' }]);
		await seedImposterPlayed(page.request, server.origin, pair.id, [alex.id]);
		await page.route('**/api/imposter/played/*/*', (route) => route.fulfill({ status: 500, body: '' }));
		await page.goto(`${server.origin}/spiele/imposter/inhalte`);
		await btn(card(page, pair.id), 'Gespielt mit').click();
		const list = section(page, pair.id);
		const failed = page.waitForResponse((r) => r.request().method() === 'DELETE');
		await btn(list, 'Entfernen Alex').click();
		expect((await failed).status()).toBe(500);
		await expect(list.getByRole('listitem')).toHaveText(['Alex EntfernenAlex']);
		expect(await imposterPlayed(page.request, server.origin)).toEqual([{ pairId: pair.id, playerIds: [alex.id] }]);
	} finally {
		server.close();
	}
});

test("Scenario: Other games' Inhalte cards carry no played-with or flag", async ({ page, request }, info) => {
	const server = await emptyServer(info, 'imposter-played-other');
	try {
		const res = await request.post(`${server.origin}/api/content/wavelength_spectra`, {
			headers: { origin: server.origin },
			data: { a: 'Kalt', b: 'Heiß' }
		});
		expect(res.status()).toBe(201);
		await page.goto(`${server.origin}/spiele/wavelength/inhalte`);
		await expect(page.getByRole('list', { name: 'Einträge' }).getByRole('listitem')).toHaveCount(1);
		await expect(page.getByRole('button', { name: 'Gespielt mit' })).toHaveCount(0);
		await expect(page.getByRole('button', { name: /austauschbar$/ })).toHaveCount(0);
		await expect(page.getByRole('button', { name: 'Austauschbar' })).toHaveCount(0);
	} finally {
		server.close();
	}
});
