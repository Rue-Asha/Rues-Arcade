import { expect, test } from '@playwright/test';
import { emptyServer, seedRoster, shot } from './helpers.ts';

const crew = (n: number) => Array.from({ length: n }, (_, i) => `Spieler ${i + 1}`);

test('Scenario: Below minimum disables start', async ({ page }, info) => {
	await seedRoster(page, ['Alex', 'Bo']);
	await page.goto('/spiele/imposter');

	await expect(page.getByRole('button', { name: 'Spiel starten' })).toBeDisabled();
	await expect(page.getByText('mind. 3 Spieler')).toBeVisible();
	await expect(page.getByRole('link', { name: 'Spieler verwalten' })).toHaveAttribute(
		'href',
		'/spieler?from=/spiele/imposter'
	);
	await shot(page, info, 'start-imposter');
});

test('Scenario: Above maximum asks who plays', async ({ page }, info) => {
	await seedRoster(page, crew(13));
	await page.goto('/spiele/imposter/lobby');

	await expect(page.getByText('Wer spielt mit?')).toBeVisible();
	const picks = page.getByRole('checkbox');
	await expect(picks).toHaveCount(13);
	const next = page.getByRole('button', { name: 'Weiter' });
	await expect(next).toBeDisabled();
	await expect(page.getByText('höchstens 12')).toBeVisible();

	await page.getByRole('checkbox', { name: 'Spieler 13' }).uncheck();
	await expect(next).toBeEnabled();
	await shot(page, info, 'lobby-imposter');

	await page.getByRole('checkbox', { name: 'Spieler 1', exact: true }).uncheck();
	await page.getByRole('checkbox', { name: 'Spieler 13' }).check();
	await expect(next).toBeEnabled();
	for (let i = 2; i <= 11; i++) await page.getByRole('checkbox', { name: `Spieler ${i}`, exact: true }).uncheck();
	await expect(next).toBeDisabled();
	await page.getByRole('checkbox', { name: 'Spieler 2', exact: true }).check();

	await next.click();
	await expect(page.getByRole('checkbox')).toHaveCount(0);
});

test('Scenario: Empty pool blocks start', async ({ page }, info) => {
	const server = await emptyServer(info, 'start');
	try {
		await page.goto(`${server.origin}/`);
		await seedRoster(page, crew(4));
		await page.getByRole('link', { name: /Imposter/ }).click();

		await expect(page).toHaveURL(/\/spiele\/imposter$/);
		await expect(page.getByRole('button', { name: 'Spiel starten' })).toBeDisabled();
		await expect(page.getByText('Für Imposter gibt es noch keine Inhalte.')).toBeVisible();
		await expect(page.getByRole('link', { name: 'Inhalte hinzufügen' })).toHaveAttribute(
			'href',
			'/spiele/imposter/inhalte'
		);
	} finally {
		server.close();
	}
});

test('start screen links to Demo, Erklärung and Inhalte and starts with enough players', async ({ page, request }) => {
	await request.post('/api/content/imposter_pairs', { data: { a: 'Lieblingsessen?', b: 'Lieblingsgetränk?' } });
	await seedRoster(page, crew(3));
	await page.goto('/spiele/imposter');

	await expect(page.getByRole('button', { name: 'Demo' })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Erklärung' })).toBeVisible();
	await page.getByRole('button', { name: 'Spiel starten' }).click();
	await expect(page).toHaveURL(/\/spiele\/imposter\/lobby$/);
});

test('play route without a session returns to the start screen', async ({ page }) => {
	await page.goto('/spiele/wavelength/spielen');
	await expect(page).toHaveURL(/\/spiele\/wavelength$/);
});

test('discarded session shows a notice', async ({ page }) => {
	await page.goto('/');
	await page.evaluate(() => localStorage.setItem('arcade:session:imposter', '{kaputt'));
	await page.goto('/spiele/imposter/spielen');

	await expect(page.getByRole('alert')).toContainText('verworfen');
	await expect(page.evaluate(() => localStorage.getItem('arcade:session:imposter'))).resolves.toBeNull();
});

test('a session without the game state shape is discarded, not resumed', async ({ page }) => {
	const errors: Error[] = [];
	page.on('pageerror', (e) => errors.push(e));
	await page.goto('/');
	await page.evaluate(() => localStorage.setItem('arcade:session:imposter', '{"v":1,"state":{}}'));
	await page.goto('/spiele/imposter');
	await expect(page.getByRole('alert')).toContainText('verworfen');
	await expect(page.getByRole('button', { name: 'Weiterspielen' })).toHaveCount(0);

	await page.evaluate(() => localStorage.setItem('arcade:session:imposter', '{"v":1,"state":{}}'));
	await page.goto('/spiele/imposter/spielen');
	await expect(page.getByRole('alert')).toContainText('verworfen');
	await expect(page.evaluate(() => localStorage.getItem('arcade:session:imposter'))).resolves.toBeNull();
	expect(errors).toEqual([]);
});

test('a saved session is shown, resumed and ended', async ({ page }) => {
	await page.goto('/');
	await page.evaluate(() =>
		localStorage.setItem(
			'arcade:session:imposter',
			JSON.stringify({
				v: 1,
				state: {
					rng: { state: 1 },
					players: [
						{ id: 'a', name: 'Alex' },
						{ id: 'b', name: 'Bo' },
						{ id: 'c', name: 'Cleo' }
					],
					pool: [{ id: 1, a: 'Crew?', b: 'Imposter?' }],
					used: [1],
					round: 1,
					pairId: 1,
					crew: 'Crew?',
					imposter: 'Imposter?',
					imposterIndex: 0,
					phase: 'handover',
					revealIndex: 0,
					shown: false
				}
			})
		)
	);
	await page.goto('/spiele/imposter');
	await page.getByRole('button', { name: 'Weiterspielen' }).click();
	await expect(page).toHaveURL(/\/spiele\/imposter\/spielen$/);

	await page.getByRole('button', { name: 'Spiel beenden' }).click();
	await page.getByRole('dialog').getByRole('button', { name: 'Beenden' }).click();
	await expect(page).toHaveURL(/\/spiele\/imposter$/);
	await expect(page.getByRole('button', { name: 'Weiterspielen' })).toHaveCount(0);
});
