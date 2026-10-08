import { expect, test, type APIRequestContext, type Page } from '@playwright/test';
import { board } from '../src/lib/content/survey.ts';
import type { Survey } from '../src/lib/content/types.ts';
import { chooseSurveys, emptyServer, live, openFaceoff, seedPlayers, seedSavedRoster, surveyByQuestion } from './helpers.ts';

const GHOST = 'Was würdest du tun, wenn du einen Geist siehst?';
const CREW = ['Alex', 'Bo', 'Cleo', 'Dani'];
const PARTY = 'Nenne etwas, das auf Partys immer ausgeht';
// Getränke + Eiswürfel = 76 in round 1 and Affe 38 doubled in the last round tie the game
const HAIRY = 'Nenne etwas, das richtig, richtig haarig ist';

type Server = Awaited<ReturnType<typeof emptyServer>>;

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
	await chooseSurveys(page, surveys.map((s) => s.id));
	await page.getByRole('button', { name: 'Start', exact: true }).click();
	await page.waitForURL('**/spielen');
	return { crew, surveys };
}

const pick = (page: Page, i: number) => live(page).locator(`[data-tile="${i}"]`).getByRole('button');
const press = (page: Page, name: string) => page.getByRole('button', { name, exact: true }).click();
const handoff = (page: Page) => live(page).getByTestId('handoff');

// the buzzing team's #1 wins the face-off at once
async function toBoard(page: Page, team = 'Team A') {
	await openFaceoff(page, team);
	await pick(page, 0).click();
	await expect(handoff(page)).toBeVisible();
	await live(page).getByRole('button', { name: 'Spielen', exact: true }).click();
	await expect(handoff(page)).toHaveCount(0);
}

async function strikeOut(page: Page) {
	for (let i = 0; i < 3; i++) await press(page, 'Fehler');
	await expect(handoff(page)).toBeVisible();
	await live(page).getByRole('button', { name: 'Weiter', exact: true }).click();
	await press(page, 'Nicht auf der Tafel');
}

type Played = { surveyId: number; playerIds: number[] }[];
const played = async (request: APIRequestContext, server: Server): Promise<Played> =>
	(await request.get(`${server.origin}/api/feud/played`)).json();
const players = (list: Played, id: number) => list.find((p) => p.surveyId === id)?.playerIds.sort((a, b) => a - b);

test('Scenario: Feud closed rounds are recorded', async ({ page, request }, info) => {
	const server = await emptyServer(info, 'history-closed');
	try {
		const { crew, surveys } = await begin(page, request, server, [PARTY, GHOST]);
		await toBoard(page);
		for (let i = 1; i < board(surveys[0]).length; i++) await pick(page, i).click();
		await press(page, 'Nächste Runde');
		await toBoard(page);
		await pick(page, 1).click();
		await strikeOut(page);
		await press(page, 'Zum Ergebnis');
		await expect(page.getByText('Gewinner', { exact: true })).toBeVisible();

		const ids = crew.map((p) => p.id).sort((a, b) => a - b);
		await expect.poll(async () => players(await played(request, server), surveys[0].id)).toEqual(ids);
		await expect.poll(async () => players(await played(request, server), surveys[1].id)).toEqual(ids);
	} finally {
		server.close();
	}
});

test('Scenario: Feud early end records only closed rounds', async ({ page, request }, info) => {
	const server = await emptyServer(info, 'history-early');
	try {
		const { crew, surveys } = await begin(page, request, server, [PARTY, GHOST]);
		await toBoard(page);
		for (let i = 1; i < board(surveys[0]).length; i++) await pick(page, i).click();
		await press(page, 'Nächste Runde');
		await toBoard(page);

		const ids = crew.map((p) => p.id).sort((a, b) => a - b);
		await expect.poll(async () => players(await played(request, server), surveys[0].id)).toEqual(ids);
		await page.getByRole('button', { name: 'Spiel beenden' }).click();
		await page.getByRole('dialog').getByRole('button', { name: 'Beenden' }).click();
		await expect(page).toHaveURL(/\/spiele\/family-feud$/);

		expect(players(await played(request, server), surveys[1].id)).toBeUndefined();
	} finally {
		server.close();
	}
});

test('Scenario: Feud tiebreak survey is recorded', async ({ page, request }, info) => {
	const server = await emptyServer(info, 'history-tiebreak');
	try {
		const { crew, surveys } = await begin(page, request, server, [PARTY, HAIRY]);
		await toBoard(page);
		await pick(page, 1).click();
		await strikeOut(page);
		await press(page, 'Nächste Runde');
		await toBoard(page, 'Team B');
		await strikeOut(page);
		await press(page, 'Zum Ergebnis');

		await expect(page.getByText('Gewinner', { exact: true })).toHaveCount(0);
		await openFaceoff(page);
		await pick(page, 0).click();
		await expect(page.getByTestId('verdict')).toHaveText('Stichfrage entschieden');
		await expect(page.getByTestId('points')).toHaveCount(0);
		await press(page, 'Zum Ergebnis');
		await expect(page.getByText('Gewinner', { exact: true })).toBeVisible();

		const tiebreak = (await page.evaluate(() => JSON.parse(localStorage.getItem('arcade:session:family-feud')!).state)).config.tiebreak.id;
		expect(surveys.map((s) => s.id)).not.toContain(tiebreak);
		const ids = crew.map((p) => p.id).sort((a, b) => a - b);
		await expect.poll(async () => players(await played(request, server), tiebreak)).toEqual(ids);
	} finally {
		server.close();
	}
});
