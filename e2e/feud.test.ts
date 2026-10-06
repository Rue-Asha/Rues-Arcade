import { expect, test, type APIRequestContext, type Page } from '@playwright/test';
import { board } from '../src/lib/content/survey.ts';
import type { Survey } from '../src/lib/content/types.ts';
import { emptyServer, seedPlayers, seedSavedRoster, surveyByQuestion } from './helpers.ts';

const CREW = ['Alex', 'Bo', 'Cleo', 'Dani'];
// seeded surveys: six answers (Milch 30 ... ), six answers, eight answers
const FRIDGE = 'Nenne etwas, das man in einem Kühlschrank findet';
const ZOO = 'Nenne ein Tier, das man im Zoo sieht';
const HOLES = 'Nenne etwas, das voller Löcher ist';

type Server = Awaited<ReturnType<typeof emptyServer>>;

// teams are dealt alternately: Team A = Alex, Cleo; Team B = Bo, Dani. Round 1 opens with Team A, round 2 with Team B.
async function begin(page: Page, request: APIRequestContext, server: Server, questions: string[]) {
	const crew = await seedPlayers(request, server.origin, CREW);
	const surveys: Survey[] = [];
	for (const q of questions) surveys.push(await surveyByQuestion(request, q, server.origin));
	await page.goto(`${server.origin}/`);
	await seedSavedRoster(page, crew);
	await page.goto(`${server.origin}/spiele/family-feud/lobby`);
	await page.getByRole('button', { name: String(questions.length), exact: true }).click();
	await page.getByRole('button', { name: 'Weiter' }).click();
	await expect(page.getByRole('heading', { name: 'Umfragen', exact: true })).toBeVisible();
	for (const s of surveys) await page.locator(`[data-survey="${s.id}"]`).getByRole('button', { name: 'Wählen', exact: true }).click();
	await page.getByRole('button', { name: 'Start', exact: true }).click();
	await page.waitForURL('**/spielen');
	return { crew, surveys };
}

const tile = (page: Page, i: number) => page.locator(`[data-tile="${i}"]`);
const pick = (page: Page, i: number) => tile(page, i).getByRole('button');
const press = (page: Page, name: string) => page.getByRole('button', { name, exact: true }).click();
const versus = (page: Page) => page.getByRole('region', { name: 'Spielstand' });
const handoff = (page: Page) => page.getByTestId('handoff');

// the first face-off answer is #1, so that team chooses at once
async function toBoard(page: Page, choice: 'Spielen' | 'Passen' = 'Spielen') {
	await pick(page, 0).click();
	await expect(handoff(page)).toBeVisible();
	await handoff(page).getByRole('button', { name: choice, exact: true }).click();
	await expect(handoff(page)).toHaveCount(0);
}

const rgb = (hex: string) => {
	const n = parseInt(hex.slice(1), 16);
	return `rgb(${n >> 16}, ${(n >> 8) & 255}, ${n & 255})`;
};
const token = (page: Page, name: string) =>
	page.evaluate((n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim(), `--${name}`);

test('Scenario: Feud face-off screen names both players', async ({ page, request }, info) => {
	const server = await emptyServer(info, 'feud-faceoff');
	try {
		const { surveys } = await begin(page, request, server, [FRIDGE, ZOO]);
		const tiles = board(surveys[0]);

		await expect(page.getByRole('heading', { name: FRIDGE, exact: true })).toBeVisible();
		await expect(page.getByText('Alex', { exact: true })).toBeVisible();
		await expect(page.getByText('Bo', { exact: true })).toBeVisible();
		for (let i = 0; i < tiles.length; i++) {
			await expect(tile(page, i)).toHaveAttribute('data-state', 'hidden');
			await expect(tile(page, i)).toContainText(String(i + 1));
		}
		await expect(page.getByRole('button', { name: 'Nicht auf der Tafel', exact: true })).toBeVisible();
	} finally {
		server.close();
	}
});

test('Scenario: Feud versus header shows both teams', async ({ page, request }, info) => {
	const server = await emptyServer(info, 'feud-versus');
	try {
		await begin(page, request, server, [FRIDGE, ZOO]);
		await toBoard(page);

		await expect(versus(page).getByText('Team A', { exact: true })).toBeVisible();
		await expect(versus(page).getByText('Team B', { exact: true })).toBeVisible();
		await expect(versus(page).getByTestId('score-0')).toHaveText('0');
		await expect(versus(page).getByTestId('score-1')).toHaveText('0');
	} finally {
		server.close();
	}
});

test('Scenario: Feud handoff in team colour', async ({ page, request }, info) => {
	const server = await emptyServer(info, 'feud-handoff');
	try {
		await begin(page, request, server, [FRIDGE, ZOO]);
		const full = async (team: string, colour: string) => {
			const box = handoff(page);
			await expect(box).toBeVisible();
			await expect(box.getByRole('heading', { name: team, exact: true })).toBeVisible();
			await expect(box).toHaveCSS('background-color', rgb(await token(page, colour)));
			const view = page.viewportSize()!;
			await expect.poll(async () => (await box.boundingBox())!.width).toBe(view.width);
			await expect.poll(async () => (await box.boundingBox())!.height).toBe(view.height);
		};

		await pick(page, 0).click();
		await full('Team A', 'feud');
		await press(page, 'Spielen');
		for (let i = 0; i < 3; i++) await press(page, 'Fehler');
		await full('Team B', 'gold');
	} finally {
		server.close();
	}
});

test('Scenario: Feud double round marked before it starts', async ({ page, request }, info) => {
	const server = await emptyServer(info, 'feud-double');
	try {
		const { surveys } = await begin(page, request, server, [FRIDGE, ZOO]);
		const double = page.getByText('Doppelte Punkte', { exact: true });

		await expect(double).toHaveCount(0);
		await toBoard(page);
		for (let i = 1; i < board(surveys[0]).length; i++) await pick(page, i).click();
		await press(page, 'Nächste Runde');

		await expect(page.getByRole('heading', { name: ZOO, exact: true })).toBeVisible();
		await expect(double).toBeVisible();
	} finally {
		server.close();
	}
});
