import { readFileSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';
import { shot } from './helpers.ts';

const fixture = new URL('./fixtures/explain/', import.meta.url);

async function serveFixture(page: Page, slug: string) {
	await page.route(`**/explain/${slug}/**`, (route) => {
		const name = new URL(route.request().url()).pathname.split('/').pop() || 'index.html';
		route.fulfill({
			body: readFileSync(new URL(name, fixture)),
			contentType: name.endsWith('.png') ? 'image/png' : 'text/html; charset=utf-8'
		});
	});
}

test('Scenario: No explanation shows empty state', async ({ page }, info) => {
	await page.goto('/spiele/wavelength/erklaerung');

	await expect(page.getByText('Für dieses Spiel gibt es noch keine Erklärung.')).toBeVisible();
	await expect(page.locator('iframe')).toHaveCount(0);
	await shot(page, info, 'erklaerung-leer');
});

test('Scenario: Committed explanation is shown sandboxed', async ({ page }, info) => {
	await serveFixture(page, 'imposter');
	await page.goto('/spiele/imposter/erklaerung');

	const frame = page.locator('iframe');
	await expect(frame).toHaveAttribute('sandbox', 'allow-scripts');
	await expect(frame).toHaveAttribute('src', '/explain/imposter/index.html');
	const view = page.viewportSize()!;
	await expect
		.poll(async () => Object.values((await frame.boundingBox())!).map(Math.round))
		.toEqual([0, 0, view.width, view.height]);

	const doc = page.frameLocator('iframe');
	await expect(doc.getByRole('heading', { name: 'So spielt man die Fixture' })).toBeVisible();
	await expect(doc.getByText('Skripte laufen.')).toBeVisible();
	const img = doc.getByRole('img', { name: 'Goldenes Pixel' });
	await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth)).toBe(8);
	// no allow-same-origin: the slides can't reach the app's storage or DOM
	await expect(doc.locator('body').evaluate(() => window.origin)).resolves.toBe('null');
	await shot(page, info, 'erklaerung');
});

test('Scenario: Close by button or Esc', async ({ page }) => {
	await serveFixture(page, 'imposter');
	await page.goto('/spiele/imposter');

	await page.getByRole('link', { name: 'Erklärung', exact: true }).click();
	await expect(page.locator('iframe')).toBeVisible();
	await page.keyboard.press('Escape');
	await expect(page).toHaveURL(/\/spiele\/imposter$/);
	await expect(page.getByRole('heading', { name: 'Imposter', exact: true })).toBeVisible();
	await expect(page.locator('iframe')).toHaveCount(0);

	await page.getByRole('link', { name: 'Erklärung', exact: true }).click();
	await expect(page.locator('iframe')).toBeVisible();
	await page.frameLocator('iframe').getByRole('heading', { name: 'So spielt man die Fixture' }).click();
	await expect.poll(() => page.evaluate(() => document.activeElement?.tagName)).toBe('IFRAME');
	await page.getByRole('button', { name: 'Erklärung schließen' }).click();
	await expect(page).toHaveURL(/\/spiele\/imposter$/);
	await expect(page.getByRole('heading', { name: 'Imposter', exact: true })).toBeVisible();
});
