import { expect, test, type APIRequestContext, type Page } from '@playwright/test';
import type { Survey } from '../src/lib/content/types.ts';
import type { SavedPlayer } from '../src/lib/players.ts';
import { deleteSurvey, emptyServer, seedPlayed, seedPlayers, seedSavedRoster } from './helpers.ts';

const CREW = ['Alex', 'Bo', 'Cleo', 'Dani'];
const PHONE = { width: 390, height: 844 };
const DESKTOP = { width: 1280, height: 800 };

type Server = Awaited<ReturnType<typeof emptyServer>>;

async function setup(request: APIRequestContext, server: Server, extra: string[] = [], keep = 26) {
	const everyone = await seedPlayers(request, server.origin, [...CREW, ...extra]);
	const all: Survey[] = await (await request.get(`${server.origin}/api/content/feud_surveys`)).json();
	// the seed holds far more than the 26 the scenarios talk about
	for (const s of all.slice(keep)) await deleteSurvey(request, s.id, server.origin);
	const surveys = all.slice(0, keep);
	return { crew: everyone.slice(0, CREW.length), others: everyone.slice(CREW.length), surveys };
}

// the order of the cards depends on the played-with lists, so wait until they are in
async function prep(page: Page, server: Server, crew: SavedPlayer[], rounds = 3) {
	await page.goto(`${server.origin}/`);
	await seedSavedRoster(page, crew);
	await page.goto(`${server.origin}/spiele/family-feud/lobby`);
	await page.getByRole('button', { name: String(rounds), exact: true }).click();
	const loaded = page.waitForResponse((r) => r.url().endsWith('/api/feud/played') && r.request().method() === 'GET');
	await page.getByRole('button', { name: 'Weiter', exact: true }).click();
	await expect(page.getByRole('heading', { name: 'Umfragen', exact: true })).toBeVisible();
	await (await loaded).finished();
}

const pager = (page: Page) => page.getByRole('navigation', { name: 'Seiten', exact: true });
const cards = (page: Page) => page.getByRole('list', { name: 'Alle Umfragen' }).locator('> li');
const ids = (page: Page) => cards(page).evaluateAll((els) => els.map((e) => Number(e.getAttribute('data-survey'))));
const next = (page: Page) => pager(page).getByRole('button', { name: 'Weiter', exact: true });
const back = (page: Page) => pager(page).getByRole('button', { name: 'Zurück', exact: true });

test('Scenario: Feud prep pages by width', async ({ page, request }, info) => {
	const server = await emptyServer(info, 'pages-width');
	try {
		const { crew, surveys } = await setup(request, server);
		expect(surveys).toHaveLength(26);

		await page.setViewportSize(PHONE);
		await prep(page, server, crew);
		await expect(cards(page)).toHaveCount(6);
		await expect(pager(page).getByText('Seite 1 von 5', { exact: true })).toBeVisible();
		await expect(back(page)).toBeDisabled();
		const first = await ids(page);
		await next(page).click();
		await expect(pager(page).getByText('Seite 2 von 5', { exact: true })).toBeVisible();
		const second = await ids(page);
		expect(second).toHaveLength(6);
		expect(second.filter((id) => first.includes(id))).toEqual([]);

		await page.setViewportSize(DESKTOP);
		await prep(page, server, crew);
		await expect(cards(page)).toHaveCount(12);
		await expect(pager(page).getByText('Seite 1 von 3', { exact: true })).toBeVisible();
		await next(page).click();
		await expect(pager(page).getByText('Seite 2 von 3', { exact: true })).toBeVisible();
		await next(page).click();
		await expect(cards(page)).toHaveCount(2);
		await expect(next(page)).toBeDisabled();
		await expect(back(page)).toBeEnabled();
	} finally {
		server.close();
	}
});

test('Scenario: Feud prep without pager for one page', async ({ page, request }, info) => {
	const server = await emptyServer(info, 'pages-single');
	try {
		const { crew } = await setup(request, server, [], 6);

		for (const size of [PHONE, DESKTOP]) {
			await page.setViewportSize(size);
			await prep(page, server, crew, 2);
			await expect(cards(page)).toHaveCount(6);
			await expect(pager(page)).toHaveCount(0);
		}
	} finally {
		server.close();
	}
});

test('Scenario: Feud sort goes to page 1', async ({ page, request }, info) => {
	const server = await emptyServer(info, 'pages-sort');
	try {
		const { crew, others, surveys } = await setup(request, server, ['Eva', 'Finn']);
		const [a, b, ...rest] = surveys;
		// known puts a first (nobody of the crew knows it), played puts b first (shortest list)
		await seedPlayed(request, a.id, others.map((p) => p.id), server.origin);
		await seedPlayed(request, b.id, [crew[0].id], server.origin);
		for (const s of rest) await seedPlayed(request, s.id, [crew[0].id, crew[1].id], server.origin);
		await page.setViewportSize(PHONE);
		await prep(page, server, crew);

		expect((await ids(page))[0]).toBe(a.id);
		await next(page).click();
		await expect(pager(page).getByText('Seite 2 von 5', { exact: true })).toBeVisible();

		await page.getByRole('button', { name: 'Gespielt', exact: true }).click();

		await expect(pager(page).getByText('Seite 1 von 5', { exact: true })).toBeVisible();
		expect((await ids(page))[0]).toBe(b.id);
	} finally {
		server.close();
	}
});

test('Scenario: Feud picks stay across pages', async ({ page, request }, info) => {
	const server = await emptyServer(info, 'pages-picks');
	try {
		const { crew } = await setup(request, server);
		await page.setViewportSize(PHONE);
		await prep(page, server, crew, 2);

		const onFirst = (await ids(page))[0];
		await cards(page).first().getByRole('button', { name: 'Wählen', exact: true }).click();
		await next(page).click();
		await expect(pager(page).getByText('Seite 2 von 5', { exact: true })).toBeVisible();
		const onSecond = (await ids(page))[0];
		await cards(page).first().getByRole('button', { name: 'Wählen', exact: true }).click();
		await back(page).click();

		const slots = page.getByRole('list', { name: 'Gewählte Umfragen' }).locator('> li');
		await expect(slots).toHaveCount(2);
		await expect(slots.nth(0)).toHaveAttribute('data-slot', '0');
		const q = (id: number) => page.locator(`[data-survey="${id}"] .q`);
		await expect(cards(page).first()).toHaveAttribute('data-survey', String(onFirst));
		await expect(cards(page).first().getByRole('button', { name: 'Gewählt', exact: true })).toBeDisabled();
		await expect(slots.nth(0)).toContainText((await q(onFirst).innerText()).trim());
		await next(page).click();
		await expect(slots.nth(1)).toContainText((await q(onSecond).innerText()).trim());
	} finally {
		server.close();
	}
});
