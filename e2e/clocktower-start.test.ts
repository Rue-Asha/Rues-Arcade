import { expect, test, type Page } from '@playwright/test';
import { seedRoster } from './helpers.ts';

// Blood on the Clocktower stores nothing in the database: roster and count live in localStorage, so phone and
// desktop never share state.
const crew = (n: number) => Array.from({ length: n }, (_, i) => `Spieler ${i + 1}`);
const count = (page: Page) => page.getByTestId('count');
const step = (page: Page, name: 'Weniger' | 'Mehr') =>
	page.getByRole('group', { name: 'Spielerzahl', exact: true }).getByRole('button', { name, exact: true });

async function openStart(page: Page, roster: string[], stored?: number) {
	await seedRoster(page, roster);
	await page.evaluate((n) => {
		if (n === undefined) localStorage.removeItem('arcade:count:clocktower');
		else localStorage.setItem('arcade:count:clocktower', String(n));
	}, stored);
	await page.goto('/spiele/clocktower');
	await expect(count(page)).toBeVisible();
}

test('Scenario: Count defaults to the roster size, clamped', async ({ browser }, info) => {
	const { viewport, isMobile, hasTouch, baseURL, extraHTTPHeaders } = info.project.use;
	for (const [size, shown] of [
		[9, '9'],
		[3, '5'],
		[20, '15']
	] as const) {
		const context = await browser.newContext({ viewport, isMobile, hasTouch, baseURL, extraHTTPHeaders });
		const page = await context.newPage();
		await seedRoster(page, crew(size));
		await page.goto('/spiele/clocktower');
		await expect(count(page), `${size}`).toHaveText(shown);
		await context.close();
	}
});

test('Scenario: Count stays within 5 to 15', async ({ page }) => {
	await openStart(page, crew(6));
	await expect(count(page)).toHaveText('6');

	await step(page, 'Weniger').click();
	await expect(count(page)).toHaveText('5');
	await expect(step(page, 'Weniger')).toBeDisabled();
	await expect(step(page, 'Mehr')).toBeEnabled();

	for (let n = 6; n <= 15; n++) {
		await step(page, 'Mehr').click();
		await expect(count(page)).toHaveText(String(n));
	}
	await expect(step(page, 'Mehr')).toBeDisabled();
	await expect(step(page, 'Weniger')).toBeEnabled();
	await expect(page.evaluate(() => localStorage.getItem('arcade:count:clocktower'))).resolves.toBe('15');

	for (const name of ['Weniger', 'Mehr'] as const) {
		const box = (await step(page, name).boundingBox())!;
		expect(Math.min(box.width, box.height), name).toBeGreaterThanOrEqual(44);
	}
});

test('Scenario: Chosen count persists', async ({ page }) => {
	await openStart(page, crew(7));
	for (let i = 0; i < 4; i++) await step(page, 'Mehr').click();
	await expect(count(page)).toHaveText('11');

	await page.reload();
	await expect(count(page)).toHaveText('11');

	await page.getByRole('button', { name: "Los geht's", exact: true }).click();
	await expect(page).toHaveURL(/\/spiele\/clocktower\/lobby$/);
	await page.goto('/spiele/clocktower');
	await expect(count(page)).toHaveText('11');
});

test('Scenario: Roster changes keep the chosen count', async ({ page }) => {
	await openStart(page, crew(8));
	await expect(count(page)).toHaveText('8');

	await page.getByRole('link', { name: 'Spieler verwalten', exact: true }).click();
	await expect(page).toHaveURL(/\/spieler\?from=\/spiele\/clocktower$/);
	const name = page.getByLabel('Name');
	for (const guest of ['Jürgen', 'Özlem']) {
		await name.fill(guest);
		await page.getByRole('button', { name: 'Hinzufügen', exact: true }).click();
		await expect(page.getByRole('region', { name: 'Dabei' }).getByText(guest, { exact: true })).toBeVisible();
	}
	await page.getByRole('button', { name: 'Fertig', exact: true }).click();

	await expect(page).toHaveURL(/\/spiele\/clocktower$/);
	await expect(count(page)).toHaveText('8');
	await expect(page.getByText('8 Spieler · 10 im Kader', { exact: true })).toBeVisible();
});

test('Scenario: Clocktower banner, rules and pitch', async ({ page }) => {
	const pitch = 'Eine Stadt sucht ihren Dämon, die Bösen lügen, eine Person erzählt.';
	await page.goto('/');
	await expect(page.getByRole('link', { name: /Blood on the Clocktower/ })).toContainText(pitch);

	await page.goto('/spiele/clocktower');
	const banner = page.locator('header').filter({ has: page.getByRole('heading', { level: 1 }) });
	await expect(banner.getByRole('heading', { level: 1 })).toHaveText('Blood on the Clocktower');
	await expect(banner.getByText('B', { exact: true })).toBeVisible();
	await expect(banner.getByText('5–15 Spieler', { exact: true })).toBeVisible();
	await expect(banner.getByText(pitch, { exact: true })).toBeVisible();

	const rules = page.getByRole('region', { name: "So geht's" }).getByRole('listitem');
	await expect(rules).toHaveCount(3);
	await expect(rules.first()).toHaveText(
		'Eine Person erzählt und führt das Grimoire, alle anderen bekommen geheim eine Rolle.'
	);
	for (const rule of await rules.allTextContents()) expect(rule).not.toContain('!');
});

test('the start panel reads the count and the roster, without a content line', async ({ page }) => {
	await openStart(page, crew(3), 7);
	await expect(page.getByText('7 Spieler · 3 im Kader', { exact: true })).toBeVisible();
	await expect(page.getByRole('button', { name: "Los geht's", exact: true })).toBeEnabled();
	await expect(page.getByText('Einträge im Inhaltspool')).toHaveCount(0);
	await expect(page.getByText(/gibt es noch keine Inhalte/)).toHaveCount(0);
});

test('Scenario: Erklärung card instead of Demo and Inhalte', async ({ page }) => {
	await openStart(page, crew(7));
	const more = page.getByRole('region', { name: 'Mehr zu Blood on the Clocktower', exact: true });

	await expect(more.getByRole('link')).toHaveCount(1);
	const card = more.getByRole('link', { name: 'Erklärung', exact: true });
	await expect(card).toHaveAttribute('href', '/spiele/clocktower/erklaerung');
	await expect(card).toHaveAccessibleDescription('Spiel per Folien lernen, passend zur Spielerzahl');
	await expect(page.getByRole('link', { name: 'Demo', exact: true })).toHaveCount(0);
	await expect(page.getByRole('link', { name: 'Inhalte', exact: true })).toHaveCount(0);
	await expect(page.getByText('Einträge im Inhaltspool')).toHaveCount(0);

	await card.click();
	await expect(page).toHaveURL(/\/spiele\/clocktower\/erklaerung$/);
	await expect(page.getByRole('heading', { name: 'Erklärung', exact: true })).toBeVisible();
	await page.getByRole('button', { name: 'Schließen', exact: true }).click();
	await expect(page).toHaveURL(/\/spiele\/clocktower$/);
	await expect(page.getByRole('heading', { name: 'Blood on the Clocktower', level: 1 })).toBeVisible();
});

test('Scenario: Clocktower demo and Inhalte are not found', async ({ page }) => {
	for (const path of ['/spiele/clocktower/demo?from=/spiele/clocktower', '/spiele/clocktower/inhalte']) {
		const res = await page.goto(path);

		expect(res!.status(), path).toBe(404);
		expect(page.url(), path).toMatch(new RegExp(`${path.replace(/[?/]/g, '\\$&')}$`));
		await expect(page.getByText('Not Found', { exact: true }), path).toBeVisible();
		await expect(page.getByRole('button', { name: 'Demo beenden' }), path).toHaveCount(0);
		await expect(page.getByText(/^Schritt \d+\/\d+$/), path).toHaveCount(0);
	}
});
