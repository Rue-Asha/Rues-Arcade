import { expect, test, type Page } from '@playwright/test';
import { seedRoster, shot } from './helpers.ts';

const names = ['Alex', 'Bo', 'Cleo', 'Dani'];
const crew = (n: number) => Array.from({ length: n }, (_, i) => `Spieler ${i + 1}`);

const saved = (page: Page) =>
	page.evaluate(() => JSON.parse(localStorage.getItem('arcade:session:duck')!).state);

async function startGame(page: Page, target = 10) {
	await seedRoster(page, names);
	await page.goto('/spiele/duck/lobby');
	await page.getByRole('group', { name: 'Zielpunkte' }).getByRole('button', { name: String(target), exact: true }).click();
	await page.getByRole('button', { name: "Los geht's" }).click();
	await expect(page).toHaveURL(/\/spiele\/duck\/spielen$/);
}

test('Scenario: Duck lobby offers Zielpunkte', async ({ page }, info) => {
	await seedRoster(page, names);
	await page.goto('/spiele/duck/lobby');

	const target = page.getByRole('group', { name: 'Zielpunkte' });
	await expect(target.getByRole('button')).toHaveText(['10', '20', '30', '40', '50']);
	await expect(target.getByRole('button', { name: '10', exact: true })).toHaveAttribute('aria-pressed', 'true');
	await expect(target.locator('[aria-pressed="true"]')).toHaveCount(1);
	await expect(page.getByRole('button', { name: "Los geht's" })).toBeEnabled();
	await shot(page, info, 'lobby-duck');
});

test('Scenario: Duck needs four players', async ({ page }) => {
	await seedRoster(page, names.slice(0, 3));
	await page.goto('/spiele/duck');

	await expect(page.getByRole('button', { name: "Los geht's" })).toBeDisabled();
	await expect(page.getByText('mind. 4 Spieler')).toBeVisible();
});

test('Scenario: Duck roster above maximum asks who plays', async ({ page }) => {
	await seedRoster(page, crew(17));
	await page.goto('/spiele/duck/lobby');

	await expect(page.getByText('Wer spielt mit?', { exact: true })).toBeVisible();
	await expect(page.getByRole('checkbox')).toHaveCount(17);
	await expect(page.getByText(/höchstens 16/)).toBeVisible();
	const next = page.getByRole('button', { name: 'Weiter' });
	await expect(next).toBeDisabled();

	await page.getByRole('checkbox', { name: 'Spieler 17' }).uncheck();
	await expect(next).toBeEnabled();
	for (let i = 1; i <= 12; i++) await page.getByRole('checkbox', { name: `Spieler ${i}`, exact: true }).uncheck();
	await expect(next).toBeEnabled();
	await page.getByRole('checkbox', { name: 'Spieler 13', exact: true }).uncheck();
	await expect(next).toBeDisabled();
	await page.getByRole('checkbox', { name: 'Spieler 13', exact: true }).check();

	await next.click();
	await expect(page.getByRole('checkbox')).toHaveCount(0);
	await expect(page.getByRole('group', { name: 'Zielpunkte' })).toBeVisible();
});

test('Scenario: Duck target survives reload', async ({ page }) => {
	await startGame(page, 30);
	await expect(page.getByText('Ziel: 30 Punkte', { exact: true })).toBeVisible();
	const before = await saved(page);
	expect(before.target).toBe(30);
	expect(before.phase).toBe('reveal');

	await page.reload();
	await expect(page.getByText('Ziel: 30 Punkte', { exact: true })).toBeVisible();
	await expect(page.getByText(/verworfen/)).toHaveCount(0);
	const after = await saved(page);
	expect(after.phase).toBe('reveal');
	expect(after.word).toEqual(before.word);
	expect(after.players.map((p: { name: string }) => p.name)).toEqual(names);
});

const press = (page: Page, name: string) => page.getByRole('button', { name, exact: true }).click();

const card = (page: Page, name: string) =>
	page.getByRole('list', { name: 'Wertung' }).getByRole('listitem', { name, exact: true });

async function tapBox(page: Page, name: string, points: number) {
	await card(page, name)
		.getByRole('button', { name: points === 1 ? '1 Punkt' : `${points} Punkte`, exact: true })
		.click();
}

async function tapLetter(page: Page, name: string, letter: string) {
	await card(page, name).getByRole('button', { name: letter, exact: true }).click();
}

async function toScoring(page: Page) {
	await press(page, 'Wort aufdecken');
	await press(page, 'Wort spielen');
	await expect(page.getByRole('list', { name: 'Wertung' })).toBeVisible();
}

test('Scenario: Duck word revealed to everyone', async ({ page }) => {
	await startGame(page);
	const { players, chuck, word } = await saved(page);
	const holder = players[chuck].name;
	await expect(page.getByText(`Ein Reim-Match mit ${holder} bringt +2 Extrapunkte.`, { exact: true })).toBeVisible();
	await expect(page.getByText(word.a, { exact: true })).toHaveCount(0);

	await press(page, 'Wort aufdecken');
	await expect(page.getByTestId('word')).toHaveText(word.a);
	await press(page, 'Wort spielen');
	await expect(page.getByRole('list', { name: 'Wertung' }).getByRole('listitem')).toHaveCount(4);
	await expect(page.getByRole('heading', { name: word.a, exact: true })).toBeVisible();
});

test('Scenario: Duck skip can be cancelled', async ({ page }) => {
	await startGame(page);
	const { word } = await saved(page);
	await press(page, 'Wort aufdecken');
	await press(page, 'Überspringen');
	const dialog = page.getByRole('dialog', { name: 'Wort überspringen?' });
	await expect(dialog).toBeVisible();
	await dialog.getByRole('button', { name: 'Abbrechen', exact: true }).click();
	await expect(dialog).toHaveCount(0);
	await expect(page.getByTestId('word')).toHaveText(word.a);
	expect((await saved(page)).word).toEqual(word);
});

test('Scenario: Chuck shown in banner, scoring card and standings', async ({ page }) => {
	await startGame(page);
	const { players, chuck } = await saved(page);
	const holder = players[chuck].name;
	const next = players[(chuck + 1) % 4].name;

	await expect(page.getByText('Chuck the Duck', { exact: true })).toBeVisible();
	await expect(page.getByRole('heading', { name: holder, exact: true })).toBeVisible();

	await toScoring(page);
	await expect(card(page, holder).getByText('Chuck', { exact: true })).toBeVisible();
	for (const p of players.filter((_: unknown, i: number) => i !== chuck))
		await expect(card(page, p.name).getByText('Chuck', { exact: true })).toHaveCount(0);

	await press(page, 'Weiter');
	await expect(page.getByText(`Als Nächstes bekommt ${next} Chuck the Duck.`, { exact: true })).toBeVisible();
});

test('Scenario: Duck standings sorted with struck letters', async ({ page }) => {
	await startGame(page);
	await toScoring(page);
	await tapBox(page, 'Alex', 3);
	await tapBox(page, 'Cleo', 5);
	await tapBox(page, 'Dani', 1);
	await tapLetter(page, 'Bo', 'Y');
	await press(page, 'Weiter');

	const rows = page.getByRole('list', { name: 'Punktestand' }).getByRole('listitem');
	await expect(rows.locator('.who')).toHaveText(['Cleo', 'Alex', 'Dani', 'Bo']);
	await expect(rows.locator('.pts')).toHaveText(['5', '3', '1', '0']);
	await expect(rows.nth(3).locator('s')).toHaveText(['Y']);
	for (let i = 0; i < 3; i++) await expect(rows.nth(i).locator('s')).toHaveCount(0);
});

test('Scenario: Duck tie at the top reads Unentschieden', async ({ page }) => {
	await startGame(page);
	await toScoring(page);
	await tapBox(page, 'Alex', 10);
	await tapBox(page, 'Bo', 10);
	await tapBox(page, 'Cleo', 4);
	await tapBox(page, 'Dani', 4);
	await press(page, 'Weiter');

	await expect(page.getByText('Unentschieden', { exact: true })).toBeVisible();
	await expect(page.getByText('Gewinner', { exact: true })).toHaveCount(0);
	await expect(page.getByRole('heading', { name: 'Alex & Bo', exact: true })).toBeVisible();
	const rest = page.getByRole('list', { name: 'Rangliste' }).getByRole('listitem');
	await expect(rest.locator('.who')).toHaveText(['Cleo', 'Dani']);
	await expect(rest.locator('.rank')).toHaveText(['3', '3']);
});

test('Scenario: Full Duck game', async ({ page }) => {
	await startGame(page);
	await toScoring(page);
	await tapBox(page, 'Dani', 10);
	await tapBox(page, 'Alex', 2);
	await press(page, 'Weiter');

	await expect(page.getByText('Gewinner', { exact: true })).toBeVisible();
	await expect(page.getByRole('heading', { name: 'Dani', exact: true })).toBeVisible();
	await expect(page.getByText('Zielpunktzahl von 10 erreicht.', { exact: true })).toBeVisible();
	await expect(page.getByRole('list', { name: 'Rangliste' }).locator('.who')).toHaveText(['Alex', 'Bo', 'Cleo']);

	await press(page, 'Neue Runde');
	await expect(page.getByRole('button', { name: 'Wort aufdecken' })).toBeVisible();
	const board = page.getByRole('list', { name: 'Spielstand' }).getByRole('listitem');
	await expect(board.locator('.who')).toHaveText(names);
	await expect(board.locator('.pts')).toHaveText(['0', '0', '0', '0']);
	await expect(board.locator('s')).toHaveCount(0);
	const s = await saved(page);
	expect(s.phase).toBe('reveal');
	expect(s.scores).toEqual([0, 0, 0, 0]);
	expect(s.lives).toEqual([5, 5, 5, 5]);
});

test('Scenario: Duck session resumes after reload', async ({ page }) => {
	await startGame(page);
	await toScoring(page);
	await tapBox(page, 'Bo', 3);
	await tapLetter(page, 'Cleo', 'K');
	const before = await saved(page);

	const check = async () => {
		await expect(card(page, 'Bo').locator('.total')).toHaveText('3/10');
		await expect(card(page, 'Bo').getByRole('button', { name: '3 Punkte', exact: true })).toHaveAttribute('aria-pressed', 'true');
		await expect(card(page, 'Cleo').locator('s')).toHaveText(['K', 'Y']);
		await expect(card(page, before.players[before.chuck].name).getByText('Chuck', { exact: true })).toBeVisible();
	};
	await check();
	await page.reload();
	await check();
	await expect(page.getByText(/verworfen/)).toHaveCount(0);
	expect(await saved(page)).toEqual(before);
});

test('Scenario: Leaving Duck asks for confirmation', async ({ page }) => {
	await startGame(page);
	await toScoring(page);
	await press(page, 'Spiel beenden');
	const dialog = page.getByRole('dialog', { name: 'Spiel beenden?' });
	await expect(dialog).toBeVisible();
	await dialog.getByRole('button', { name: 'Weiterspielen', exact: true }).click();
	await expect(dialog).toHaveCount(0);
	await expect(page.getByRole('list', { name: 'Wertung' })).toBeVisible();
	expect((await saved(page)).phase).toBe('scoring');
});

test('Scenario: Duck copy reads neutral', async ({ page }) => {
	const texts: string[] = [];
	const collect = async () => texts.push(await page.locator('body').innerText());

	await seedRoster(page, names);
	await page.goto('/spiele/duck');
	await collect();
	await page.goto('/spiele/duck/lobby');
	await collect();
	await press(page, "Los geht's");
	await collect();
	await press(page, 'Überspringen');
	await collect();
	await page.getByRole('dialog').getByRole('button', { name: 'Abbrechen', exact: true }).click();
	await press(page, 'Wort aufdecken');
	await collect();
	await press(page, 'Wort spielen');
	await tapBox(page, 'Alex', 3);
	await tapLetter(page, 'Bo', 'U');
	await collect();
	await press(page, 'Weiter');
	await collect();
	await press(page, 'Nächstes Wort');
	await toScoring(page);
	await tapBox(page, 'Cleo', 10);
	await press(page, 'Weiter');
	await expect(page.getByText('Gewinner', { exact: true })).toBeVisible();
	await collect();

	expect(texts).toHaveLength(8);
	for (const text of texts) {
		expect(text).not.toContain('!');
		expect(text).not.toMatch(/\p{Extended_Pictographic}/u);
	}
});
