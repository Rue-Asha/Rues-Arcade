import { expect, test, type Page } from '@playwright/test';
import { emptyServer, seedRoster, shot } from './helpers.ts';

const crew = (n: number) => Array.from({ length: n }, (_, i) => `Spieler ${i + 1}`);

test('Scenario: Codes teams dealt from the roster', async ({ page }, info) => {
	await seedRoster(page, crew(7));
	await page.goto('/spiele/codes/lobby');

	const team = (n: number) => page.getByRole('group', { name: `Team ${n}`, exact: true });
	await expect(team(1).getByRole('button')).toHaveCount(3);
	await expect(team(2).getByRole('button')).toHaveCount(2);
	await expect(team(3).getByRole('button')).toHaveCount(2);
	await expect(team(4)).toHaveCount(0);

	const fewer = page.getByRole('button', { name: 'Weniger Teams' });
	const more = page.getByRole('button', { name: 'Mehr Teams' });
	await expect(more).toBeDisabled();
	await expect(fewer).toBeEnabled();

	const rounds = page.getByRole('group', { name: 'Runden' }).getByRole('button');
	await expect(rounds).toHaveText(['1', '2', '3', '4', '5', '6', '7', '8']);
	await expect(rounds.filter({ hasText: /^5$/ })).toHaveAttribute('aria-pressed', 'true');
	await expect(page.getByRole('button', { name: "Los geht's" })).toBeEnabled();
	await shot(page, info, 'lobby-codes-seven');

	await fewer.click();
	await expect(team(3)).toHaveCount(0);
	await expect(fewer).toBeDisabled();
	await expect(more).toBeEnabled();
});

test('Scenario: Codes start blocked by a team below two', async ({ page }) => {
	await seedRoster(page, ['Alex', 'Bo', 'Cleo', 'Dani']);
	await page.goto('/spiele/codes/lobby');

	const hint = page.getByText('Jedes Team braucht mind. 2 Spieler.', { exact: true });
	await expect(hint).toHaveCount(0);
	await page.getByRole('group', { name: 'Team 1', exact: true }).getByRole('button', { name: 'Alex', exact: true }).click();
	await expect(page.getByRole('group', { name: 'Team 1', exact: true }).getByRole('button')).toHaveCount(1);
	await expect(page.getByRole('button', { name: "Los geht's" })).toBeDisabled();
	await expect(hint).toBeVisible();
});

test('Scenario: Codes needs four players', async ({ page }) => {
	await seedRoster(page, ['Alex', 'Bo', 'Cleo']);
	await page.goto('/spiele/codes');

	await expect(page.getByRole('button', { name: "Los geht's" })).toBeDisabled();
	await expect(page.getByText('mind. 4 Spieler')).toBeVisible();
});

test('Scenario: Codes roster above maximum asks who plays', async ({ page }) => {
	await seedRoster(page, crew(21));
	await page.goto('/spiele/codes/lobby');

	await expect(page.getByText('Wer spielt mit?')).toBeVisible();
	await expect(page.getByRole('group', { name: 'Team 1', exact: true })).toHaveCount(0);
	const next = page.getByRole('button', { name: 'Weiter' });
	await expect(next).toBeDisabled();
	await page.getByRole('checkbox', { name: 'Spieler 21' }).uncheck();
	await next.click();

	await expect(page.getByRole('group', { name: 'Team 5', exact: true }).getByRole('button')).toHaveCount(4);
	await expect(page.getByRole('button', { name: "Los geht's" })).toBeEnabled();
});

interface Saved {
	teamIndex: number;
	attempt: number;
	word: { a: string };
	teams: { name: string; score: number; players: { name: string }[] }[];
}

function saved(page: Page): Promise<Saved> {
	return page.evaluate(() => JSON.parse(localStorage.getItem('arcade:session:codes')!).state);
}

// Team 1 is Alex & Cleo, Team 2 Bo & Dani; in round 1 Alex and Bo explain
async function play(page: Page, rounds: number) {
	await seedRoster(page, ['Alex', 'Bo', 'Cleo', 'Dani']);
	await page.goto('/spiele/codes/lobby');
	await page.getByRole('group', { name: 'Runden' }).getByRole('button', { name: String(rounds), exact: true }).click();
	await page.getByRole('button', { name: "Los geht's" }).click();
	await expect(page).toHaveURL(/\/spiele\/codes\/spielen$/);
}

async function hold(page: Page) {
	const control = page.getByRole('button', { name: 'Gedrückt halten' });
	await control.scrollIntoViewIfNeeded();
	const box = (await control.boundingBox())!;
	await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
	await page.mouse.down();
}

const press = (page: Page, name: string | RegExp) =>
	page.getByRole('button', typeof name === 'string' ? { name, exact: true } : { name }).click();

const heading = (s: Saved) => {
	const team = s.teams[s.teamIndex];
	return `${team.name}: ${team.players[0].name} erklärt, ${team.players[1].name} rät`;
};

test('Scenario: Codes word visible only while held', async ({ page }) => {
	await play(page, 1);
	const { word } = await saved(page);
	await expect(page.getByText('Diese Runde erklären: Alex und Bo.', { exact: true })).toBeVisible();
	await expect(page.getByText(word.a, { exact: true })).toHaveCount(0);

	await hold(page);
	await expect(page.getByText(word.a, { exact: true })).toBeVisible();
	await page.mouse.up();
	await expect(page.getByText(word.a, { exact: true })).toHaveCount(0);
	await expect(page.getByText('Verdeckt', { exact: true })).toBeVisible();
});

test('Scenario: Codes play screen names team, explainer and guessers', async ({ page }) => {
	await play(page, 1);
	await press(page, 'Verdecken & raten');
	const s = await saved(page);
	const other = s.teams[1 - s.teamIndex].name;

	await expect(page.getByRole('heading', { name: heading(s), exact: true })).toBeVisible();
	await expect(page.getByRole('list', { name: 'Reihenfolge' }).getByRole('listitem')).toHaveText([
		new RegExp(s.teams[s.teamIndex].name),
		new RegExp(other)
	]);
	await expect(page.getByTestId('value')).toHaveText('3');

	await expect(page.getByText(s.word.a, { exact: true })).toHaveCount(0);
	await hold(page);
	await expect(page.getByText(s.word.a, { exact: true })).toBeVisible();
	await page.mouse.up();
});

test('Scenario: Full Codes game', async ({ page }) => {
	await play(page, 1);
	await press(page, 'Verdecken & raten');
	const first = await saved(page);
	await press(page, 'Daneben, nächstes Team');
	const second = first.teams[1 - first.teamIndex].name;
	await expect(page.getByTestId('value')).toHaveText('2');
	await press(page, /^Erraten/);

	await expect(page.getByTestId('points')).toHaveText('+2');
	await expect(page.getByText(`Punkte für ${second}`, { exact: true })).toBeVisible();
	await expect(page.getByText(first.word.a, { exact: true })).toBeVisible();
	await press(page, 'Zum Ergebnis');

	await expect(page.getByText('Gewinner', { exact: true })).toBeVisible();
	const winner = page.getByRole('heading', { name: second, exact: true });
	await expect(winner).toBeVisible();
	const board = page.getByRole('region', { name: 'Punktestand' });
	await expect(board.getByRole('listitem')).toHaveText([new RegExp(second), new RegExp(first.teams[first.teamIndex].name)]);
	expect((await winner.boundingBox())!.y).toBeLessThan((await board.boundingBox())!.y);
	await expect(page.getByRole('button', { name: 'Nochmal spielen' })).toBeVisible();
});

test('Scenario: Codes skipped round result', async ({ page }) => {
	await play(page, 1);
	await press(page, 'Verdecken & raten');
	const { word } = await saved(page);
	for (let i = 0; i < 2; i++) await press(page, 'Daneben, nächstes Team');
	await expect(page.getByRole('button', { name: 'Überspringen' })).toHaveCount(0);
	await press(page, 'Daneben, nächstes Team');
	await press(page, 'Überspringen');

	await expect(page.getByText('Übersprungen', { exact: true })).toBeVisible();
	await expect(page.getByText(word.a, { exact: true })).toBeVisible();
	expect((await saved(page)).teams.map((t) => t.score)).toEqual([0, 0]);
});

test('Scenario: Codes tie shown as Unentschieden', async ({ page }) => {
	await play(page, 2);
	for (const next of ['Nächste Runde', 'Zum Ergebnis']) {
		await press(page, 'Verdecken & raten');
		await press(page, /^Erraten/);
		await press(page, next);
	}

	await expect(page.getByText('Unentschieden', { exact: true })).toBeVisible();
	await expect(page.getByText('Gewinner', { exact: true })).toHaveCount(0);
	await expect(page.getByRole('heading', { name: 'Team 1 & Team 2', exact: true })).toBeVisible();
	expect((await saved(page)).teams.map((t) => t.score)).toEqual([3, 3]);
});

test('Scenario: Codes session resumes after reload', async ({ page }) => {
	await play(page, 1);
	await press(page, 'Verdecken & raten');
	await press(page, 'Daneben, nächstes Team');
	const s = await saved(page);
	await expect(page.getByRole('heading', { name: heading(s), exact: true })).toBeVisible();

	await page.reload();
	await expect(page.getByRole('heading', { name: heading(s), exact: true })).toBeVisible();
	await expect(page.getByTestId('value')).toHaveText('2');
	expect((await saved(page)).attempt).toBe(1);
	await expect(page.getByText(/gespeicherte Spielstand/)).toHaveCount(0);
});

test('Scenario: Leaving Codes asks for confirmation', async ({ page }) => {
	await play(page, 1);
	await press(page, 'Verdecken & raten');
	await press(page, 'Spiel beenden');
	const modal = page.getByRole('dialog', { name: 'Spiel beenden?' });
	await expect(modal).toBeVisible();
	await modal.getByRole('button', { name: 'Weiterspielen' }).click();
	await expect(modal).toBeHidden();
	await expect(page.getByTestId('value')).toHaveText('3');
});

test('Scenario: Codes copy reads neutral', async ({ page }) => {
	const texts: string[] = [];
	const collect = async (shown: string) => {
		await expect(page.getByText(shown, { exact: true }).first()).toBeVisible();
		texts.push(await page.evaluate(() => document.body.innerText));
	};
	await play(page, 2);
	await collect('Verdeckt');
	await hold(page);
	await collect((await saved(page)).word.a);
	await page.mouse.up();
	await press(page, 'Verdecken & raten');
	await collect('Daneben, nächstes Team');
	for (let i = 0; i < 3; i++) await press(page, 'Daneben, nächstes Team');
	await collect('Überspringen');
	await press(page, 'Überspringen');
	await collect('Übersprungen');
	await press(page, 'Nächste Runde');
	await press(page, 'Verdecken & raten');
	await press(page, 'Daneben, nächstes Team');
	await press(page, /^Erraten/);
	await collect('Zum Ergebnis');
	await press(page, 'Zum Ergebnis');
	await collect('Nochmal spielen');
	await press(page, 'Spiel beenden');
	await collect('Spiel beenden?');

	expect(texts).toHaveLength(8);
	expect(texts.filter((t) => /!|\p{Extended_Pictographic}/u.test(t))).toEqual([]);
});

// the fresh database is seeded, so the empty pool is made by deleting every word
async function emptyPool(page: Page, origin: string) {
	const api = `${origin}/api/content/codes_words`;
	const list: { id: number }[] = await (await page.request.get(api)).json();
	expect(list.length).toBeGreaterThan(0);
	// this server listens on 127.0.0.1, not the configured baseURL, so Kit's CSRF check needs the origin spelled out
	for (const { id } of list)
		expect((await page.request.delete(`${api}/${id}`, { headers: { origin } })).status()).toBe(204);
}

test('Scenario: Empty Codes pool blocks start', async ({ page }, info) => {
	const server = await emptyServer(info, 'codes');
	try {
		await emptyPool(page, server.origin);
		await page.goto(`${server.origin}/`);
		await seedRoster(page, ['Alex', 'Bo', 'Cleo', 'Dani']);
		await page.goto(`${server.origin}/spiele/codes`);

		await expect(page.getByRole('button', { name: "Los geht's" })).toBeDisabled();
		await expect(page.getByText('Für Codes gibt es noch keine Inhalte.')).toBeVisible();
		await expect(page.getByRole('link', { name: 'Inhalte hinzufügen' })).toHaveAttribute('href', '/spiele/codes/inhalte');
	} finally {
		server.close();
	}
});

test('Scenario: Codes demo by tapping highlighted controls', async ({ page }, info) => {
	const server = await emptyServer(info, 'codes-demo');
	try {
		await emptyPool(page, server.origin);
		await page.goto(`${server.origin}/spiele/codes`);
		await page.getByRole('link', { name: 'Demo', exact: true }).click();
		await expect(page).toHaveURL(/\/spiele\/codes\/demo\?from=/);

		await expect(page.getByText('[Demo]', { exact: true })).toBeVisible();
		await expect(page.getByText('Leuchtturm', { exact: true })).toBeVisible();
		const total = 4;
		for (let n = 1; n <= total; n++) {
			await expect(page.getByText(/^Demo · Schritt \d+\/\d+$/)).toHaveText(`Demo · Schritt ${n}/${total}`);
			const expected = page.locator('[data-demo="expected"]');
			await expect(expected).toHaveCount(1);
			await expected.click();
		}
		await expect(page.getByText('Demo beendet', { exact: true })).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Team 1', exact: true })).toBeVisible();
	} finally {
		server.close();
	}
});
