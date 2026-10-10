import { expect, test } from '@playwright/test';
import { emptyServer, seedPairs, shot } from './helpers.ts';

const toggle = (page: import('@playwright/test').Page, name: string) =>
	page.getByRole('button', { name, exact: true });

test('Scenario: Imposter flag toggled on a card survives a reload', async ({ page }, info) => {
	const server = await emptyServer(info, 'imposter-flag-card');
	try {
		const [pair] = await seedPairs(page.request, server.origin, [{ a: 'Hund', b: 'Katze' }]);
		await page.goto(`${server.origin}/spiele/imposter/inhalte`);
		const flag = toggle(page, 'Hund | Katze austauschbar');
		await expect(page.locator(`li[data-pair="${pair.id}"]`)).toBeVisible();
		await expect(flag).toHaveAttribute('aria-pressed', 'false');

		await flag.click();
		await expect(flag).toHaveAttribute('aria-pressed', 'true');
		await page.reload();
		await expect(flag).toHaveAttribute('aria-pressed', 'true');

		await flag.click();
		await expect(flag).toHaveAttribute('aria-pressed', 'false');
		await page.reload();
		await expect(flag).toHaveAttribute('aria-pressed', 'false');
	} finally {
		server.close();
	}
});

test('Scenario: Imposter pair added as interchangeable', async ({ page }, info) => {
	const server = await emptyServer(info, 'imposter-flag-add');
	try {
		await page.goto(`${server.origin}/spiele/imposter/inhalte`);
		const form = page.getByRole('form', { name: 'Neuer Eintrag', exact: true });
		const option = form.getByRole('button', { name: 'Austauschbar', exact: true });
		await expect(option).toHaveAttribute('aria-pressed', 'false');
		await form.getByLabel('Crew-Frage', { exact: true }).fill('Tee');
		await form.getByLabel('Imposter-Frage', { exact: true }).fill('Kaffee');
		await option.click();
		await expect(option).toHaveAttribute('aria-pressed', 'true');
		await form.getByRole('button', { name: 'Hinzufügen', exact: true }).click();

		await expect(toggle(page, 'Tee | Kaffee austauschbar')).toHaveAttribute('aria-pressed', 'true');
		await expect(option).toHaveAttribute('aria-pressed', 'false');
	} finally {
		server.close();
	}
});

test('Scenario: Imposter flag icons read as on and off', async ({ page }, info) => {
	const server = await emptyServer(info, 'imposter-flag-shot');
	try {
		await seedPairs(page.request, server.origin, [
			{ a: 'Hund', b: 'Katze', interchangeable: true },
			{ a: 'Tee', b: 'Kaffee' }
		]);
		await page.goto(`${server.origin}/spiele/imposter/inhalte`);
		await expect(toggle(page, 'Hund | Katze austauschbar')).toHaveAttribute('aria-pressed', 'true');
		await expect(toggle(page, 'Tee | Kaffee austauschbar')).toHaveAttribute('aria-pressed', 'false');
		await shot(page, info, 'inhalte-imposter-flag');
	} finally {
		server.close();
	}
});
