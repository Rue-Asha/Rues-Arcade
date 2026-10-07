import { expect, test, type APIRequestContext, type Page } from '@playwright/test';
import { board } from '../src/lib/content/survey.ts';
import type { Survey } from '../src/lib/content/types.ts';
import { chooseSurveys, emptyServer, seedPlayers, seedSavedRoster, surveyByQuestion } from './helpers.ts';

const CREW = ['Alex', 'Bo', 'Cleo', 'Dani'];
const PARTY = 'Nenne etwas, das auf Partys immer ausgeht';
const GHOST = 'Was würdest du tun, wenn du einen Geist siehst?';

type Server = Awaited<ReturnType<typeof emptyServer>>;

// teams are dealt alternately: Team A = Alex, Cleo; Team B = Bo, Dani; round 1 names Alex and Bo
async function begin(page: Page, request: APIRequestContext, server: Server) {
	const crew = await seedPlayers(request, server.origin, CREW);
	const surveys: Survey[] = [];
	for (const q of [PARTY, GHOST]) surveys.push(await surveyByQuestion(request, q, server.origin));
	await page.goto(`${server.origin}/`);
	await seedSavedRoster(page, crew);
	await page.goto(`${server.origin}/spiele/family-feud/lobby`);
	await page.getByRole('button', { name: '2', exact: true }).click();
	await page.getByRole('button', { name: 'Weiter' }).click();
	await expect(page.getByRole('heading', { name: 'Umfragen', exact: true })).toBeVisible();
	await chooseSurveys(page, surveys.map((s) => s.id));
	await page.getByRole('button', { name: 'Start', exact: true }).click();
	await page.waitForURL('**/spielen');
	return surveys;
}

const button = (page: Page, name: string) => page.getByRole('button', { name, exact: true });
const buzzer = (page: Page) => page.getByRole('group', { name: 'Buzzer', exact: true });
const team = (page: Page, name: string) => buzzer(page).getByRole('button', { name, exact: true });
const tiles = (page: Page) => page.getByRole('list', { name: 'Tafel' }).getByRole('button');
const question = (page: Page) => page.getByRole('heading', { name: PARTY, exact: true });
const duelist = (page: Page, name: string) =>
	page.getByRole('region', { name: 'Duell' }).locator('.duelist').filter({ has: page.getByText(name, { exact: true }) });

const rgb = (hex: string) => {
	const n = parseInt(hex.slice(1), 16);
	return `rgb(${n >> 16}, ${(n >> 8) & 255}, ${n & 255})`;
};
const token = (page: Page, name: string) =>
	page.evaluate((n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim(), `--${name}`);

test('Scenario: Feud question covered at round start', async ({ page, request }, info) => {
	const server = await emptyServer(info, 'round-covered');
	try {
		const [first] = await begin(page, request, server);

		await expect(button(page, 'Frage aufdecken')).toBeVisible();
		await expect(page.getByText(PARTY, { exact: true })).toHaveCount(0);
		await expect(tiles(page)).toHaveCount(board(first).length);
		for (const t of await tiles(page).all()) await expect(t).toBeDisabled();
		await expect(button(page, 'Nicht auf der Tafel')).toBeDisabled();
		await expect(team(page, 'Team A')).toBeDisabled();
		await expect(team(page, 'Team B')).toBeDisabled();
	} finally {
		server.close();
	}
});

test('Scenario: Feud reveal shows the question', async ({ page, request }, info) => {
	const server = await emptyServer(info, 'round-reveal');
	try {
		await begin(page, request, server);

		await button(page, 'Frage aufdecken').click();
		await expect(question(page)).toBeVisible();
		await expect(button(page, 'Frage aufdecken')).toHaveCount(0);
		await expect(team(page, 'Team A')).toBeEnabled();
		await expect(team(page, 'Team B')).toBeEnabled();

		await team(page, 'Team A').click();
		await expect(question(page)).toBeVisible();
		await button(page, 'Nicht auf der Tafel').click();
		await expect(duelist(page, 'Alex')).toContainText('Daneben');
		await expect(question(page)).toBeVisible();
	} finally {
		server.close();
	}
});

test('Scenario: Feud peek works before the reveal', async ({ page, request }, info) => {
	const server = await emptyServer(info, 'round-peek');
	try {
		const [first] = await begin(page, request, server);
		const peek = page.getByTestId('peek');

		const box = (await button(page, 'Umfrage ansehen').boundingBox())!;
		await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
		await page.mouse.down();
		await expect(peek.getByRole('heading', { name: PARTY, exact: true })).toBeVisible();
		for (const [i, t] of board(first).entries())
			await expect(peek.getByRole('listitem').nth(i)).toHaveText(new RegExp(`${t.text}\\s*${t.points}`));
		await page.mouse.up();

		await expect(peek).toHaveCount(0);
		await expect(page.getByText(PARTY, { exact: true })).toHaveCount(0);
		await expect(button(page, 'Frage aufdecken')).toBeVisible();
	} finally {
		server.close();
	}
});

test('Scenario: Feud team choice shows both teams', async ({ page, request }, info) => {
	const server = await emptyServer(info, 'round-buzz');
	try {
		await begin(page, request, server);
		await button(page, 'Frage aufdecken').click();

		await expect(team(page, 'Team A')).toHaveCSS('background-color', rgb(await token(page, 'feud')));
		await expect(team(page, 'Team B')).toHaveCSS('background-color', rgb(await token(page, 'gold')));
		for (const t of [team(page, 'Team A'), team(page, 'Team B')]) {
			const box = (await t.boundingBox())!;
			expect(box.height).toBeGreaterThanOrEqual(44);
		}

		await team(page, 'Team B').click();
		await expect(duelist(page, 'Bo')).toContainText('ist dran');
		await expect(duelist(page, 'Alex')).toContainText('wartet');
		for (const t of await tiles(page).all()) await expect(t).toBeEnabled();
		await expect(button(page, 'Nicht auf der Tafel')).toBeEnabled();
	} finally {
		server.close();
	}
});
