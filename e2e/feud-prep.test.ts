import { expect, test, type APIRequestContext, type Page } from '@playwright/test';
import type { Survey } from '../src/lib/content/types.ts';
import type { SavedPlayer } from '../src/lib/players.ts';
import { emptyServer, seedPlayed, seedPlayers, seedSavedRoster } from './helpers.ts';

const CREW = ['Alex', 'Bo', 'Cleo', 'Dani'];

type Server = Awaited<ReturnType<typeof emptyServer>>;

async function setup(page: Page, request: APIRequestContext, server: Server, extra: string[] = []) {
	const everyone = await seedPlayers(request, server.origin, [...CREW, ...extra]);
	const crew = everyone.slice(0, CREW.length);
	const others = everyone.slice(CREW.length);
	const surveys: Survey[] = await (await request.get(`${server.origin}/api/content/feud_surveys`)).json();
	return { crew, others, surveys };
}

async function prep(page: Page, server: Server, crew: SavedPlayer[], rounds = 3) {
	await page.goto(`${server.origin}/`);
	await seedSavedRoster(page, crew);
	await page.goto(`${server.origin}/spiele/family-feud/lobby`);
	await page.getByRole('button', { name: String(rounds), exact: true }).click();
	await page.getByRole('button', { name: 'Weiter' }).click();
	await expect(page.getByRole('heading', { name: 'Umfragen', exact: true })).toBeVisible();
}

const row = (page: Page, id: number) => page.locator(`[data-survey="${id}"]`);
const slots = (page: Page) => page.getByRole('list', { name: 'Gewählte Umfragen' }).getByRole('listitem');
const pickBtn = (page: Page, id: number) => row(page, id).getByRole('button', { name: 'Wählen', exact: true });
const order = (page: Page) =>
	page
		.getByRole('list', { name: 'Alle Umfragen' })
		.locator('[data-survey]')
		.evaluateAll((els) => els.map((e) => Number(e.getAttribute('data-survey'))));

test('Scenario: Feud prep shows who knows a survey', async ({ page, request }, info) => {
	const server = await emptyServer(info, 'prep-known');
	try {
		const { crew, others, surveys } = await setup(page, request, server, ['Extra']);
		const [x, y] = surveys;
		await seedPlayed(request, x.id, [crew[0].id, crew[1].id, others[0].id], server.origin);
		await prep(page, server, crew);

		await expect(row(page, x.id).getByText('2 von 4 kennen sie', { exact: true })).toBeVisible();
		await expect(row(page, x.id).getByText('gespielt mit 3', { exact: true })).toBeVisible();
		await expect(row(page, y.id).getByText('neu', { exact: true })).toBeVisible();
	} finally {
		server.close();
	}
});

test('Scenario: Feud prep sorts by known and by played', async ({ page, request }, info) => {
	const server = await emptyServer(info, 'prep-sort');
	try {
		const { crew, others, surveys } = await setup(page, request, server, ['Eva', 'Finn']);
		const [a, b] = surveys;
		await seedPlayed(request, a.id, [crew[0].id], server.origin);
		await seedPlayed(request, b.id, others.map((p) => p.id), server.origin);
		await prep(page, server, crew);

		const rest = surveys.slice(2).map((s) => s.id);
		expect(await order(page)).toEqual([...rest, b.id, a.id]);
		await page.getByRole('button', { name: 'Gespielt', exact: true }).click();
		expect(await order(page)).toEqual([...rest, a.id, b.id]);
		await page.getByRole('button', { name: 'Bekannt', exact: true }).click();
		expect(await order(page)).toEqual([...rest, b.id, a.id]);
	} finally {
		server.close();
	}
});

test('Scenario: Feud prep refuses an extra pick', async ({ page, request }, info) => {
	const server = await emptyServer(info, 'prep-extra');
	try {
		const { crew, surveys } = await setup(page, request, server);
		await prep(page, server, crew, 2);
		const [a, b, c] = surveys;

		await pickBtn(page, a.id).click();
		await pickBtn(page, b.id).click();
		await pickBtn(page, c.id).click();

		await expect(page.getByText('Schon 2 Umfragen gewählt.', { exact: true })).toBeVisible();
		await expect(slots(page)).toHaveText([new RegExp(a.question), new RegExp(b.question)].map((r) => r));
		await expect(pickBtn(page, c.id)).toBeVisible();
		await expect(row(page, c.id)).not.toHaveClass(/chosen/);
	} finally {
		server.close();
	}
});

test('Scenario: Feud survey everyone knows stays pickable', async ({ page, request }, info) => {
	const server = await emptyServer(info, 'prep-all');
	try {
		const { crew, surveys } = await setup(page, request, server);
		const [a] = surveys;
		await seedPlayed(request, a.id, crew.map((p) => p.id), server.origin);
		await prep(page, server, crew, 1);

		await expect(row(page, a.id).getByText('alle kennen sie', { exact: true })).toBeVisible();
		await pickBtn(page, a.id).click();
		await expect(slots(page).first()).toContainText(a.question);
	} finally {
		server.close();
	}
});

test('Scenario: Feud prep opens a survey\'s answers', async ({ page, request }, info) => {
	const server = await emptyServer(info, 'prep-open');
	try {
		const { crew, surveys } = await setup(page, request, server);
		const [a] = surveys;
		await prep(page, server, crew);

		await row(page, a.id).getByRole('button', { name: 'Öffnen' }).click();

		const expected = a.answers
			.map((x, i) => ({ ...x, i }))
			.sort((p, q) => q.points - p.points || p.i - q.i)
			.map((x) => `${x.text}${x.points}`);
		await expect(row(page, a.id).getByText(a.question, { exact: true })).toBeVisible();
		await expect(row(page, a.id).getByRole('list', { name: 'Antworten' }).getByRole('listitem')).toHaveText(expected);
	} finally {
		server.close();
	}
});

test('Scenario: Feud prep removes a pick', async ({ page, request }, info) => {
	const server = await emptyServer(info, 'prep-remove');
	try {
		const { crew, surveys } = await setup(page, request, server);
		await prep(page, server, crew, 2);
		const [a] = surveys;

		await pickBtn(page, a.id).click();
		await expect(slots(page).first()).toContainText(a.question);
		await slots(page).first().getByRole('button', { name: 'Entfernen' }).click();

		await expect(slots(page).first()).toContainText('Noch frei');
		await pickBtn(page, a.id).click();
		await expect(slots(page).first()).toContainText(a.question);
	} finally {
		server.close();
	}
});

test('Scenario: Feud Start hands over the picked surveys', async ({ page, request }, info) => {
	const server = await emptyServer(info, 'prep-start');
	try {
		const { crew, surveys } = await setup(page, request, server);
		await prep(page, server, crew, 2);
		const [a, b] = surveys;
		const start = page.getByRole('button', { name: 'Start', exact: true });

		await pickBtn(page, b.id).click();
		await expect(start).toBeDisabled();
		await pickBtn(page, a.id).click();
		await expect(start).toBeEnabled();
		await start.click();
		await page.waitForURL('**/spielen');

		const config = await page.evaluate(
			() => JSON.parse(localStorage.getItem('arcade:session:family-feud')!).state.config
		);
		expect(config.surveys.map((s: Survey) => s.id)).toEqual([b.id, a.id]);
		expect([a.id, b.id]).not.toContain(config.tiebreak.id);
		expect(config.saved).toEqual(crew.map((p) => p.id));
		expect(config.teams.map((t: { name: string }) => t.name)).toEqual(['Team A', 'Team B']);
	} finally {
		server.close();
	}
});

test('Scenario: Feud fill avoids known surveys on the real store', async ({ page, request }, info) => {
	const server = await emptyServer(info, 'prep-fill');
	try {
		const { crew, surveys } = await setup(page, request, server);
		const fresh = surveys[7];
		for (const s of surveys) if (s.id !== fresh.id) await seedPlayed(request, s.id, [crew[0].id], server.origin);
		await prep(page, server, crew, 1);

		await page.getByRole('button', { name: 'Zufällig auffüllen' }).click();

		await expect(slots(page).first()).toContainText(fresh.question);
	} finally {
		server.close();
	}
});

test('Scenario: Feud fill disabled when all slots are picked', async ({ page, request }, info) => {
	const server = await emptyServer(info, 'prep-full');
	try {
		const { crew, surveys } = await setup(page, request, server);
		await prep(page, server, crew, 1);
		const fill = page.getByRole('button', { name: 'Zufällig auffüllen' });

		await expect(fill).toBeEnabled();
		await pickBtn(page, surveys[0].id).click();
		await expect(fill).toBeDisabled();
	} finally {
		server.close();
	}
});

test('Scenario: Feud prep edits a survey\'s played-with list', async ({ page, request }, info) => {
	const server = await emptyServer(info, 'prep-edit');
	try {
		const { crew, surveys } = await setup(page, request, server, ['Extra']);
		const [a] = surveys;
		await seedPlayed(request, a.id, [crew[0].id], server.origin);
		await prep(page, server, crew);

		const list = () => row(page, a.id).getByRole('group', { name: 'Spielerliste' });
		await row(page, a.id).getByRole('button', { name: 'Öffnen' }).click();
		await list().getByRole('button', { name: '+ Extra' }).click();
		await expect(list().getByRole('listitem')).toHaveText([/Alex/, /Extra/]);
		await list().getByRole('button', { name: 'Entfernen Alex' }).click();
		await expect(list().getByRole('listitem')).toHaveText([/Extra/]);

		await page.reload();
		await page.getByRole('button', { name: 'Weiter' }).click();
		await row(page, a.id).getByRole('button', { name: 'Öffnen' }).click();
		await expect(list().getByRole('listitem')).toHaveText([/Extra/]);
		await expect(list().getByRole('button', { name: 'Entfernen Alex' })).toHaveCount(0);
	} finally {
		server.close();
	}
});
