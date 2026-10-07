import { expect, test, type Page } from '@playwright/test';
import { board } from '../../src/lib/content/survey.ts';
import { emptyServer, seedPlayers, seedRoster, seedSavedRoster, surveyByQuestion } from '../helpers.ts';

const CREW = ['Alex', 'Bo', 'Cleo', 'Dani'];
// the eight-answer survey on the board, and a six-answer one for the double round
const HOLES = 'Nenne etwas, das voller Löcher sein kann';
const GHOST = 'Was würdest du tun, wenn du einen Geist siehst?';

const press = (page: Page, name: string) => page.getByRole('button', { name, exact: true }).click();
const tile = (page: Page, i: number) => page.locator(`[data-tile="${i}"] button`);
const handoff = (page: Page) => page.getByTestId('handoff');

// start screen on the shared server, then lobby, prep, face-off, handoff, board (8 answers, peek held), steal,
// result, the double round and the winner on their own server with real seeded surveys
export async function walk(page: Page, check: (slug: string) => Promise<void>) {
	await seedRoster(page, CREW);
	await page.goto('/spiele/family-feud');
	await expect(page.getByRole('heading', { name: 'Family Feud', level: 1 })).toBeVisible();
	await check('start-family-feud');

	const server = await emptyServer(test.info(), 'look-feud');
	try {
		const crew = await seedPlayers(page.request, server.origin, CREW);
		const holes = await surveyByQuestion(page.request, HOLES, server.origin);
		const ghost = await surveyByQuestion(page.request, GHOST, server.origin);
		await page.goto(`${server.origin}/`);
		await seedSavedRoster(page, crew);
		await page.goto(`${server.origin}/spiele/family-feud/lobby`);
		await page.getByRole('button', { name: '2', exact: true }).click();
		await expect(page.getByRole('group', { name: 'Team 1', exact: true })).toBeVisible();
		await check('lobby-family-feud');

		await press(page, 'Weiter');
		await expect(page.getByRole('heading', { name: 'Umfragen', exact: true })).toBeVisible();
		for (const s of [holes, ghost])
			await page.locator(`[data-survey="${s.id}"]`).getByRole('button', { name: 'Wählen', exact: true }).click();
		await check('feud-prep');
		await press(page, 'Start');
		await page.waitForURL('**/spielen');

		await expect(page.getByRole('heading', { name: HOLES, exact: true })).toBeVisible();
		await check('feud-faceoff');
		await tile(page, 0).click();
		await expect(handoff(page)).toBeVisible();
		await check('feud-handoff');
		await handoff(page).getByRole('button', { name: 'Spielen', exact: true }).click();

		await expect(handoff(page)).toHaveCount(0);
		await tile(page, 1).click();
		await tile(page, 2).click();
		await press(page, 'Fehler');
		await expect(page.getByRole('img', { name: '1 von 3 Fehlern' })).toBeVisible();
		await check('feud-board');
		const peek = (await page.getByRole('button', { name: 'Umfrage ansehen', exact: true }).boundingBox())!;
		await page.mouse.move(peek.x + peek.width / 2, peek.y + peek.height / 2);
		await page.mouse.down();
		await expect(page.getByTestId('peek')).toBeVisible();
		await check('feud-peek-held');
		await page.mouse.up();

		await press(page, 'Fehler');
		await press(page, 'Fehler');
		await expect(handoff(page)).toBeVisible();
		await check('feud-steal-handoff');
		await handoff(page).getByRole('button', { name: 'Weiter', exact: true }).click();
		await expect(page.getByRole('button', { name: 'Nicht auf der Tafel', exact: true })).toBeVisible();
		await check('feud-steal');
		await tile(page, 3).click();

		const tiles = board(holes);
		const gain = tiles.slice(0, 4).reduce((sum, a) => sum + a.points, 0);
		// countUp and the header tween write text outside the animations check() waits for
		await expect(page.getByTestId('points')).toHaveText(`+${gain}`);
		await expect(page.getByTestId('score-1')).toHaveText(String(gain));
		await expect(page.locator('[data-state="muted"]')).toHaveCount(tiles.length - 4);
		await check('feud-result');

		await press(page, 'Nächste Runde');
		await expect(page.getByRole('heading', { name: GHOST, exact: true })).toBeVisible();
		await expect(page.getByText('Doppelte Punkte', { exact: true })).toBeVisible();
		await check('feud-faceoff-double');
		await tile(page, 0).click();
		await handoff(page).getByRole('button', { name: 'Spielen', exact: true }).click();
		for (let i = 1; i < board(ghost).length; i++) await tile(page, i).click();
		const double = board(ghost).reduce((sum, a) => sum + a.points, 0) * 2;
		await expect(page.getByTestId('points')).toHaveText(`+${double}`);
		await expect(page.getByTestId('score-1')).toHaveText(String(gain + double));
		await check('feud-result-double');

		await press(page, 'Zum Ergebnis');
		await expect(page.getByText('Gewinner', { exact: true })).toBeVisible();
		await expect(page.getByRole('region', { name: 'Punktestand' }).locator('.pts').first()).toHaveText(String(gain + double));
		await check('feud-winner');
	} finally {
		// the look test goes on with the shared server
		await page.goto('/');
		server.close();
	}
}
