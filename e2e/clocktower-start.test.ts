import { expect, test, type Page } from '@playwright/test';
import { live, seedRoster, seedSavedRoster } from './helpers.ts';

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
	await expect(page.getByText('Für 11 Spieler fehlen noch 4 im Kader.', { exact: true })).toBeVisible();
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

const box = (page: Page, name: string) => page.getByRole('checkbox', { name, exact: true });
const picked = (page: Page) =>
	page.evaluate(() =>
		[...document.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')].filter((b) => b.checked).length
	);
const seated = (page: Page) =>
	page.evaluate(
		() =>
			JSON.parse(localStorage.getItem('arcade:session:clocktower')!).state.seats.map(
				(s: { player: { id: string; name: string } }) => s.player
			) as { id: string; name: string }[]
	);

async function openLobby(page: Page, roster: string[], n: number) {
	await seedRoster(page, roster);
	await page.evaluate((v) => localStorage.setItem('arcade:count:clocktower', String(v)), n);
	await page.goto('/spiele/clocktower/lobby');
}

test('Scenario: Fewer than N offers adding players', async ({ page }) => {
	await openLobby(page, crew(5), 7);

	await expect(page.getByText('Für 7 Spieler fehlen noch 2 im Kader.', { exact: true })).toBeVisible();
	const add = page.getByRole('link', { name: 'Spieler hinzufügen', exact: true });
	await expect(add).toHaveAttribute('href', '/spieler?from=/spiele/clocktower/lobby');
	await expect(page.getByRole('button', { name: 'Spiel starten', exact: true })).toHaveCount(0);

	await add.click();
	const name = page.getByLabel('Name');
	for (const guest of ['Jürgen', 'Özlem']) {
		await name.fill(guest);
		await page.getByRole('button', { name: 'Hinzufügen', exact: true }).click();
		await expect(page.getByRole('region', { name: 'Dabei' }).getByText(guest, { exact: true })).toBeVisible();
	}
	await page.getByRole('button', { name: 'Fertig', exact: true }).click();

	await expect(page).toHaveURL(/\/spiele\/clocktower\/lobby$/);
	await expect(page.getByRole('button', { name: 'Spiel starten', exact: true })).toBeVisible();
	await expect(page.getByText(/fehlen noch/)).toHaveCount(0);
});

test('Scenario: More than N picks exactly N', async ({ page }) => {
	await openLobby(page, crew(9), 7);
	const next = page.getByRole('button', { name: 'Weiter', exact: true });

	await expect(page.getByText('Wer spielt mit?', { exact: true })).toBeVisible();
	await expect(page.getByText('7 von 7 gewählt', { exact: true })).toBeVisible();
	for (let i = 1; i <= 7; i++) await expect(box(page, `Spieler ${i}`)).toBeChecked();
	for (const i of [8, 9]) {
		await expect(box(page, `Spieler ${i}`)).not.toBeChecked();
		await expect(box(page, `Spieler ${i}`)).toBeDisabled();
	}
	await expect(next).toBeEnabled();

	await box(page, 'Spieler 3').uncheck();
	await expect(page.getByText('6 von 7 gewählt', { exact: true })).toBeVisible();
	await expect(next).toBeDisabled();
	for (const i of [3, 8, 9]) await expect(box(page, `Spieler ${i}`)).toBeEnabled();

	await box(page, 'Spieler 9').check();
	await expect(page.getByText('7 von 7 gewählt', { exact: true })).toBeVisible();
	await expect(next).toBeEnabled();
	for (const i of [3, 8]) await expect(box(page, `Spieler ${i}`)).toBeDisabled();
	expect(await picked(page)).toBe(7);
});

test('Scenario: Exactly N goes to the start', async ({ page }) => {
	// saved players come from the players API; answering it here keeps the test off the shared database
	const saved = [
		{ id: 9101, name: 'Alex' },
		{ id: 9102, name: 'Jürgen' },
		{ id: 9103, name: 'Bo' }
	];
	await page.route('**/api/players', (route) => route.fulfill({ json: saved }));
	await page.goto('/');
	await seedSavedRoster(page, saved, ['Özlem', 'Cleo']);
	await page.evaluate(() => localStorage.setItem('arcade:count:clocktower', '5'));
	await page.goto('/spiele/clocktower/lobby');

	const names = ['Alex', 'Jürgen', 'Bo', 'Özlem', 'Cleo'];
	await expect(page.getByRole('button', { name: 'Spiel starten', exact: true })).toBeVisible();
	await expect(page.getByRole('checkbox')).toHaveCount(0);
	for (const name of names) await expect(page.getByText(name, { exact: true })).toBeVisible();

	await page.getByRole('button', { name: 'Spiel starten', exact: true }).click();
	await expect(page).toHaveURL(/\/spiele\/clocktower\/spielen$/);
	expect(await seated(page)).toEqual([
		{ id: 'player-9101', name: 'Alex' },
		{ id: 'player-9102', name: 'Jürgen' },
		{ id: 'player-9103', name: 'Bo' },
		{ id: 'p1', name: 'Özlem' },
		{ id: 'p2', name: 'Cleo' }
	]);
});

test('Scenario: Count changed while in the lobby', async ({ page }) => {
	await openLobby(page, crew(9), 7);
	await expect(page.getByText('7 von 7 gewählt', { exact: true })).toBeVisible();
	await box(page, 'Spieler 1').uncheck();
	await box(page, 'Spieler 8').check();
	await box(page, 'Spieler 2').uncheck();
	await box(page, 'Spieler 9').check();
	await expect(page.getByText('7 von 7 gewählt', { exact: true })).toBeVisible();

	await page.goto('/spiele/clocktower');
	await expect(count(page)).toHaveText('7');
	await step(page, 'Mehr').click();
	await expect(count(page)).toHaveText('8');
	await page.getByRole('button', { name: "Los geht's", exact: true }).click();

	await expect(page).toHaveURL(/\/spiele\/clocktower\/lobby$/);
	await expect(page.getByText('8 von 8 gewählt', { exact: true })).toBeVisible();
	for (let i = 1; i <= 8; i++) await expect(box(page, `Spieler ${i}`)).toBeChecked();
	await expect(box(page, 'Spieler 9')).not.toBeChecked();
});

test('Scenario: Roster above the Clocktower maximum', async ({ page }) => {
	await openLobby(page, crew(18), 15);

	await expect(page.getByText('15 von 15 gewählt', { exact: true })).toBeVisible();
	for (const i of [16, 17, 18]) await expect(box(page, `Spieler ${i}`)).toBeDisabled();
	await box(page, 'Spieler 1').uncheck();
	await box(page, 'Spieler 18').check();
	await page.getByRole('button', { name: 'Weiter', exact: true }).click();

	await expect(page.getByRole('checkbox')).toHaveCount(0);
	await page.getByRole('button', { name: 'Spiel starten', exact: true }).click();
	await expect(page).toHaveURL(/\/spiele\/clocktower\/spielen$/);
	expect((await seated(page)).map((p) => p.name)).toEqual([
		...Array.from({ length: 14 }, (_, i) => `Spieler ${i + 2}`),
		'Spieler 18'
	]);
});

test('Scenario: Game without content starts without a content fetch', async ({ page }) => {
	await openLobby(page, crew(5), 5);
	const fetched: string[] = [];
	page.on('request', (req) => {
		if (new URL(req.url()).pathname.startsWith('/api/content/')) fetched.push(req.url());
	});

	await page.getByRole('button', { name: 'Spiel starten', exact: true }).click();
	await expect(page).toHaveURL(/\/spiele\/clocktower\/spielen$/);
	await expect(live(page).getByRole('heading', { name: 'Sitzordnung', exact: true })).toBeVisible();
	expect(fetched).toEqual([]);
});
