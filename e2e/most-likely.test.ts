import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { emptyServer, seedRoster, shot } from './helpers.ts';

const crew = (n: number) => Array.from({ length: n }, (_, i) => `Spieler ${i + 1}`);
const names = ['Alex', 'Bo', 'Cleo'];

// The shared e2e DB holds the seeded prompts; the drawn one is read from the saved session.
const saved = (page: Page) =>
	page.evaluate(() => JSON.parse(localStorage.getItem('arcade:session:most-likely')!).state);

async function start(page: Page) {
	await seedRoster(page, names);
	await page.goto('/spiele/most-likely/lobby');
	await page.getByRole('button', { name: '5', exact: true }).click();
	await page.getByRole('button', { name: "Los geht's" }).click();
	await expect(page).toHaveURL(/\/spiele\/most-likely\/spielen$/);
}

const toggle = (page: Page, name: string) => page.getByRole('group', { name: 'Wer hat den Titel?' }).getByRole('button', { name, exact: true });
const confirm = (page: Page) => page.getByRole('button', { name: 'Titel vergeben', exact: true });
const board = (page: Page) => page.getByRole('region', { name: 'Titel' }).getByRole('listitem');

// the phase's Stage rises in after the click, past what shot() can see yet
async function still(page: Page, info: TestInfo, slug: string) {
	await page.evaluate(() => new Promise((ok) => requestAnimationFrame(() => requestAnimationFrame(ok))));
	await shot(page, info, slug);
}

async function texts(page: Page, seen: string[]) {
	seen.push(await page.locator('body').innerText());
}

async function playRound(page: Page, round: number, picks: string[], seen: string[] = []) {
	const { prompt } = await saved(page);
	await expect(page.getByText(`Runde ${round} / 5`, { exact: true })).toBeVisible();
	await expect(page.getByTestId('prompt')).toHaveText(prompt.a);
	await expect(page.getByText('Auf drei zeigen alle gleichzeitig auf die Person, die am besten passt.', { exact: true })).toBeVisible();
	await texts(page, seen);
	await page.getByRole('button', { name: 'Alle haben gezeigt', exact: true }).click();
	for (const name of picks) await toggle(page, name).click();
	await texts(page, seen);
	await confirm(page).click();
	const reveal = page.getByTestId('holders');
	await expect(reveal).toHaveText(new Intl.ListFormat('de').format(picks));
	await expect(page.getByTestId('reveal-prompt')).toHaveText(prompt.a);
	await texts(page, seen);
	await page.getByRole('button', { name: round === 5 ? 'Zum Endstand' : 'Nächste Runde', exact: true }).click();
}

test('Scenario: Most Likely lobby offers rounds', async ({ page }, info) => {
	await seedRoster(page, ['Alex', 'Bo', 'Cleo']);
	await page.goto('/spiele/most-likely/lobby');

	const rounds = page.getByRole('group', { name: 'Runden' }).getByRole('button');
	await expect(rounds).toHaveText(['5', '10', '15', '20']);
	await expect(rounds.filter({ hasText: /^10$/ })).toHaveAttribute('aria-pressed', 'true');
	for (const r of ['5', '15', '20'])
		await expect(page.getByRole('button', { name: r, exact: true })).toHaveAttribute('aria-pressed', 'false');
	await expect(page.getByRole('button', { name: "Los geht's" })).toBeEnabled();
	await shot(page, info, 'lobby-most-likely');

	await page.getByRole('button', { name: '5', exact: true }).click();
	await expect(page.getByRole('button', { name: '5', exact: true })).toHaveAttribute('aria-pressed', 'true');
	await expect(page.getByRole('button', { name: '10', exact: true })).toHaveAttribute('aria-pressed', 'false');
});

test('Scenario: Most Likely needs three players', async ({ page }) => {
	await seedRoster(page, ['Alex', 'Bo']);
	await page.goto('/spiele/most-likely');

	await expect(page.getByRole('button', { name: "Los geht's" })).toBeDisabled();
	await expect(page.getByText('mind. 3 Spieler')).toBeVisible();
});

test('Scenario: Most Likely roster above maximum asks who plays', async ({ page }) => {
	await seedRoster(page, crew(21));
	await page.goto('/spiele/most-likely/lobby');

	await expect(page.getByText('Wer spielt mit?', { exact: true })).toBeVisible();
	await expect(page.getByRole('checkbox')).toHaveCount(21);
	await expect(page.getByText('höchstens 20')).toBeVisible();
	const next = page.getByRole('button', { name: 'Weiter' });
	await expect(next).toBeDisabled();

	await page.getByRole('checkbox', { name: 'Spieler 21' }).uncheck();
	await expect(next).toBeEnabled();
	for (let i = 4; i <= 20; i++) await page.getByRole('checkbox', { name: `Spieler ${i}`, exact: true }).uncheck();
	await expect(next).toBeEnabled();
	await page.getByRole('checkbox', { name: 'Spieler 3', exact: true }).uncheck();
	await expect(next).toBeDisabled();
	await page.getByRole('checkbox', { name: 'Spieler 3', exact: true }).check();

	await next.click();
	await expect(page.getByRole('checkbox')).toHaveCount(0);
	await expect(page.getByRole('group', { name: 'Runden' })).toBeVisible();
	await expect(page.getByText('3 Spieler', { exact: true }).first()).toBeVisible();
});

test('Scenario: Confirm needs at least one player', async ({ page }, info) => {
	await start(page);
	await still(page, info, 'most-likely-prompt');
	await page.getByRole('button', { name: 'Alle haben gezeigt', exact: true }).click();

	await expect(confirm(page)).toBeDisabled();
	await still(page, info, 'most-likely-pick');
	await toggle(page, 'Alex').click();
	await expect(toggle(page, 'Alex')).toHaveAttribute('aria-pressed', 'true');
	await expect(confirm(page)).toBeEnabled();
	await toggle(page, 'Alex').click();
	await expect(toggle(page, 'Alex')).toHaveAttribute('aria-pressed', 'false');
	await expect(confirm(page)).toBeDisabled();
});

test('Scenario: Full Most Likely To game', async ({ page }, info) => {
	await start(page);
	const rounds = [['Alex'], ['Alex'], ['Bo'], ['Cleo'], ['Alex', 'Bo']];
	for (const [i, picks] of rounds.entries()) {
		await playRound(page, i + 1, picks);
		if (i === 0) await expect(board(page)).toHaveText([/^1\s*Alex\s*1$/, /Bo\s*0$/, /Cleo\s*0$/]);
	}

	await expect(page.getByText('Gewinner', { exact: true })).toBeVisible();
	await expect(page.getByRole('heading', { name: 'Alex', exact: true })).toBeVisible();
	await expect(board(page)).toHaveText([/^1\s*Alex\s*3$/, /^2\s*Bo\s*2$/, /^3\s*Cleo\s*1$/]);
	await expect(page.getByRole('button', { name: 'Nochmal spielen', exact: true })).toBeVisible();
	await still(page, info, 'most-likely-gameover');
});

test('Scenario: Most Likely tie at the top reads Unentschieden', async ({ page }, info) => {
	await start(page);
	for (const [i, picks] of [['Alex'], ['Bo'], ['Alex'], ['Bo'], ['Alex', 'Bo', 'Cleo']].entries())
		await playRound(page, i + 1, picks);

	await expect(page.getByText('Unentschieden', { exact: true })).toBeVisible();
	await expect(page.getByText('Gewinner', { exact: true })).toHaveCount(0);
	await expect(page.getByRole('heading', { name: 'Alex & Bo', exact: true })).toBeVisible();
	await expect(board(page)).toHaveText([/^1\s*Alex\s*3$/, /^1\s*Bo\s*3$/, /^3\s*Cleo\s*1$/]);
	await expect(board(page).and(page.locator('.lead'))).toHaveCount(2);
	await expect(board(page).nth(2)).not.toHaveClass(/lead/);
	await still(page, info, 'most-likely-tie');
});

test('Scenario: Most Likely session resumes after reload', async ({ page }) => {
	await start(page);
	await playRound(page, 1, ['Cleo']);
	await page.getByRole('button', { name: 'Alle haben gezeigt', exact: true }).click();
	await toggle(page, 'Bo').click();
	const before = await saved(page);
	expect(before.round).toBe(1);

	await page.reload();
	await expect(page.getByText('Runde 2 / 5', { exact: true })).toBeVisible();
	await expect(page.getByTestId('pick-prompt')).toHaveText(before.prompt.a);
	await expect(toggle(page, 'Bo')).toHaveAttribute('aria-pressed', 'true');
	await expect(confirm(page)).toBeEnabled();
	await expect(board(page)).toHaveText([/^1\s*Cleo\s*1$/, /Alex\s*0$/, /Bo\s*0$/]);
	await expect(page.getByRole('alert')).toHaveCount(0);
	expect(await saved(page)).toEqual(before);
});

test('Scenario: Leaving Most Likely asks for confirmation', async ({ page }) => {
	await start(page);
	await page.getByRole('button', { name: 'Alle haben gezeigt', exact: true }).click();
	await expect(confirm(page)).toBeVisible();

	await page.getByRole('button', { name: 'Spiel beenden' }).click();
	const dialog = page.getByRole('dialog');
	await expect(dialog.getByRole('heading', { name: 'Spiel beenden?' })).toBeVisible();
	await dialog.getByRole('button', { name: 'Weiterspielen' }).click();
	await expect(page.getByRole('dialog')).toHaveCount(0);
	await expect(page).toHaveURL(/\/spiele\/most-likely\/spielen$/);
	await expect(confirm(page)).toBeVisible();
	expect((await saved(page)).phase).toBe('pick');
});

test('Scenario: Most Likely copy reads neutral', async ({ page }) => {
	const seen: string[] = [];
	await start(page);
	for (const [i, picks] of [['Alex'], ['Bo'], ['Cleo'], ['Alex'], ['Alex', 'Bo']].entries()) {
		if (i === 1) {
			await page.getByRole('button', { name: 'Anderer Spruch', exact: true }).click();
			await texts(page, seen);
		}
		await playRound(page, i + 1, picks, seen);
	}
	await expect(page.getByRole('button', { name: 'Nochmal spielen', exact: true })).toBeVisible();
	await texts(page, seen);
	await page.getByRole('button', { name: 'Spiel beenden' }).click();
	await texts(page, seen);

	expect(seen).toHaveLength(18);
	for (const text of seen) {
		expect(text).not.toContain('!');
		expect(text).not.toMatch(/\p{Extended_Pictographic}/u);
	}
});

test('Scenario: Most Likely demo by tapping highlighted controls', async ({ page }, info) => {
	const server = await emptyServer(info, 'most-likely-demo');
	try {
		await page.goto(`${server.origin}/spiele/most-likely`);
		await page.getByRole('link', { name: 'Demo', exact: true }).click();
		await expect(page).toHaveURL(/\/spiele\/most-likely\/demo\?from=/);
		await expect(page.getByTestId('prompt')).toHaveText('Wer würde am ehesten einen Marathon laufen?');

		const expected = page.locator('[data-demo="expected"]');
		for (let n = 1; n <= 4; n++) {
			await expect(page.getByText(`Demo · Schritt ${n}/4`, { exact: true })).toBeVisible();
			await expect(expected).toHaveCount(1);
			await expected.click();
		}
		await expect(page.getByText('Demo beendet', { exact: true })).toBeVisible();
		await expect(expected).toHaveCount(0);
		await expect(page.getByTestId('holders')).toHaveText('Alex und Cleo');
	} finally {
		server.close();
	}
});
