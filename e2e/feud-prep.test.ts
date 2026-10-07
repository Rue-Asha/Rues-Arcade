import { expect, test, type APIRequestContext, type Page } from '@playwright/test';
import type { Survey } from '../src/lib/content/types.ts';
import type { SavedPlayer } from '../src/lib/players.ts';
import { chooseSurveys, deleteSurvey, emptyServer, seedPlayed, seedPlayers, seedSavedRoster, surveyCard } from './helpers.ts';

const CREW = ['Alex', 'Bo', 'Cleo', 'Dani'];

type Server = Awaited<ReturnType<typeof emptyServer>>;

async function setup(page: Page, request: APIRequestContext, server: Server, extra: string[] = [], keep = 12) {
	const everyone = await seedPlayers(request, server.origin, [...CREW, ...extra]);
	const crew = everyone.slice(0, CREW.length);
	const others = everyone.slice(CREW.length);
	const all: Survey[] = await (await request.get(`${server.origin}/api/content/feud_surveys`)).json();
	// the list sorts least known first, so a survey with a played-with list sits on the last of the seed's ~42 pages
	for (const s of all.slice(keep)) await deleteSurvey(request, s.id, server.origin);
	const surveys = all.slice(0, keep);
	return { crew, others, surveys };
}

// the order of the cards depends on the played-with lists, so wait until they are in
async function toPrep(page: Page) {
	const loaded = page.waitForResponse((r) => r.url().endsWith('/api/feud/played') && r.request().method() === 'GET');
	await page.getByRole('button', { name: 'Weiter', exact: true }).click();
	await expect(page.getByRole('heading', { name: 'Umfragen', exact: true })).toBeVisible();
	await (await loaded).finished();
}

async function prep(page: Page, server: Server, crew: SavedPlayer[], rounds = 3) {
	await page.goto(`${server.origin}/`);
	await seedSavedRoster(page, crew);
	await page.goto(`${server.origin}/spiele/family-feud/lobby`);
	await page.getByRole('button', { name: String(rounds), exact: true }).click();
	await toPrep(page);
}

const slots = (page: Page) => page.getByRole('list', { name: 'Gewählte Umfragen' }).locator('> li');
const ids = (page: Page) =>
	page
		.getByRole('list', { name: 'Alle Umfragen' })
		.locator('[data-survey]')
		.evaluateAll((els) => els.map((e) => Number(e.getAttribute('data-survey'))));

// the whole list in order, read page by page
async function order(page: Page) {
	const pager = page.getByRole('navigation', { name: 'Seiten', exact: true });
	const seen: number[] = [];
	if (await pager.count()) {
		const back = pager.getByRole('button', { name: 'Zurück', exact: true });
		while (await back.isEnabled()) await back.click();
		const next = pager.getByRole('button', { name: 'Weiter', exact: true });
		for (;;) {
			seen.push(...(await ids(page)));
			if (await next.isDisabled()) break;
			await next.click();
		}
		return seen;
	}
	return ids(page);
}

test('Scenario: Feud prep shows who knows a survey', async ({ page, request }, info) => {
	const server = await emptyServer(info, 'prep-known');
	try {
		const { crew, others, surveys } = await setup(page, request, server, ['Extra']);
		const [x, y] = surveys;
		await seedPlayed(request, x.id, [crew[0].id, crew[1].id, others[0].id], server.origin);
		await prep(page, server, crew);

		const cardX = await surveyCard(page, x.id);
		await expect(cardX.getByText('2 von 4 kennen sie', { exact: true })).toBeVisible();
		await expect(cardX.getByText('gespielt mit 3', { exact: true })).toBeVisible();
		await expect(cardX.getByRole('button', { name: 'Gespielt mit', exact: true })).toHaveAttribute('aria-expanded', 'false');
		const cardY = await surveyCard(page, y.id);
		await expect(cardY.getByText('neu', { exact: true })).toBeVisible();
		await expect(cardY.getByRole('button', { name: 'Gespielt mit', exact: true })).toHaveAttribute('aria-expanded', 'false');
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

		await chooseSurveys(page, [a.id, b.id, c.id]);

		await expect(page.getByText('Schon 2 Umfragen gewählt.', { exact: true })).toBeVisible();
		await expect(slots(page)).toHaveText([new RegExp(a.question), new RegExp(b.question)].map((r) => r));
		const cardC = await surveyCard(page, c.id);
		await expect(cardC.getByRole('button', { name: 'Wählen', exact: true })).toBeVisible();
		await expect(cardC).not.toHaveClass(/chosen/);
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

		await expect((await surveyCard(page, a.id)).getByText('alle kennen sie', { exact: true })).toBeVisible();
		await chooseSurveys(page, [a.id]);
		await expect(slots(page).first()).toContainText(a.question);
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

		await chooseSurveys(page, [a.id]);
		await expect(slots(page).first()).toContainText(a.question);
		await slots(page).first().getByRole('button', { name: 'Entfernen' }).click();

		await expect(slots(page).first()).toContainText('Noch frei');
		await chooseSurveys(page, [a.id]);
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

		await chooseSurveys(page, [b.id]);
		await expect(start).toBeDisabled();
		await chooseSurveys(page, [a.id]);
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
		await chooseSurveys(page, [surveys[0].id]);
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

		const card = () => surveyCard(page, a.id);
		const list = async () => (await card()).getByRole('group', { name: 'Spielerliste' });
		await (await card()).getByRole('button', { name: 'Gespielt mit', exact: true }).click();
		await (await list()).getByRole('button', { name: '+ Extra' }).click();
		await expect((await list()).getByRole('listitem')).toHaveText([/Alex/, /Extra/]);
		await (await list()).getByRole('button', { name: 'Entfernen Alex' }).click();
		await expect((await list()).getByRole('listitem')).toHaveText([/Extra/]);

		await page.reload();
		await toPrep(page);
		await (await card()).getByRole('button', { name: 'Gespielt mit', exact: true }).click();
		await expect((await list()).getByRole('listitem')).toHaveText([/Extra/]);
		await expect((await list()).getByRole('button', { name: 'Entfernen Alex' })).toHaveCount(0);
	} finally {
		server.close();
	}
});
