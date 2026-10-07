import { expect, test, type APIRequestContext, type Page } from '@playwright/test';
import type { Survey } from '../src/lib/content/types.ts';
import type { SavedPlayer } from '../src/lib/players.ts';
import {
	chooseSurveys,
	emptyServer,
	seedPlayed,
	seedPlayers,
	seedSavedRoster,
	surveyCard,
	writeHeaders
} from './helpers.ts';

const CREW = ['Alex', 'Bo', 'Cleo', 'Dani'];

type Server = Awaited<ReturnType<typeof emptyServer>>;

async function setup(request: APIRequestContext, server: Server, extra: string[] = []) {
	const everyone = await seedPlayers(request, server.origin, [...CREW, ...extra]);
	const surveys: Survey[] = await (await request.get(`${server.origin}/api/content/feud_surveys`)).json();
	return { crew: everyone.slice(0, CREW.length), others: everyone.slice(CREW.length), surveys };
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

const settled = (page: Page) =>
	page.evaluate(() =>
		Promise.all(
			document
				.getAnimations()
				.filter((a) => a.effect?.getTiming().iterations !== Infinity)
				.map((a) => a.finished.catch(() => {}))
		)
	);

const byPoints = (s: Survey) =>
	s.answers
		.map((x, i) => ({ ...x, i }))
		.sort((p, q) => q.points - p.points || p.i - q.i)
		.map((x) => `${x.text}${x.points}`);

const cells = async (page: Page) => {
	await settled(page);
	return page
		.getByRole('list', { name: 'Alle Umfragen' })
		.locator('> li')
		.evaluateAll((els) =>
			els.map((e) => {
				const r = e.getBoundingClientRect();
				return { id: Number(e.getAttribute('data-survey')), x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width) };
			})
		);
};

test('Scenario: Feud prep card shows all answers', async ({ page, request }, info) => {
	const server = await emptyServer(info, 'cards-all');
	try {
		const { crew, surveys } = await setup(request, server);
		const eight = surveys.find((s) => s.answers.length === 8)!;
		expect(eight).toBeDefined();
		await prep(page, server, crew);

		const card = await surveyCard(page, eight.id);
		await expect(card.getByText(eight.question, { exact: true })).toBeVisible();
		await expect(card.getByRole('list', { name: 'Antworten' }).getByRole('listitem')).toHaveText(byPoints(eight));
	} finally {
		server.close();
	}
});

test('Scenario: Feud prep card wraps a long question', async ({ page, request }, info) => {
	const server = await emptyServer(info, 'cards-long');
	try {
		const { crew } = await setup(request, server);
		const question = `Was ${'sehr lang '.repeat(14)}fragt der Moderator`.slice(0, 150);
		expect(question).toHaveLength(150);
		const res = await request.post(`${server.origin}/api/content/feud_surveys`, {
			headers: writeHeaders(server.origin),
			data: {
				question,
				answers: [
					{ text: 'Eins', points: 40 },
					{ text: 'Zwei', points: 30 },
					{ text: 'Drei', points: 20 }
				]
			}
		});
		const long: Survey = await res.json();
		await page.setViewportSize({ width: 390, height: 844 });
		await prep(page, server, crew);

		const card = await surveyCard(page, long.id);
		await expect(card.getByText(question, { exact: true })).toBeVisible();
		await settled(page);
		const grid = (await page.getByRole('list', { name: 'Alle Umfragen' }).boundingBox())!;
		const box = (await card.boundingBox())!;
		expect(box.x).toBeGreaterThanOrEqual(grid.x - 1);
		expect(box.x + box.width).toBeLessThanOrEqual(grid.x + grid.width + 1);
		expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
	} finally {
		server.close();
	}
});

test('Scenario: Feud picked slot shows the survey', async ({ page, request }, info) => {
	const server = await emptyServer(info, 'cards-slot');
	try {
		const { crew, surveys } = await setup(request, server);
		const [a] = surveys;
		await prep(page, server, crew);

		await chooseSurveys(page, [a.id]);

		const slot = page.locator('[data-slot="0"]');
		await expect(slot.getByText(a.question, { exact: true })).toBeVisible();
		await expect(slot.getByRole('list', { name: 'Antworten' }).getByRole('listitem')).toHaveText(byPoints(a));
		await expect(slot.getByRole('button', { name: 'Entfernen', exact: true })).toBeVisible();
	} finally {
		server.close();
	}
});

test('Scenario: Feud played-with section collapses per card', async ({ page, request }, info) => {
	const server = await emptyServer(info, 'cards-collapse');
	try {
		const { crew, surveys } = await setup(request, server);
		const [a, b] = surveys;
		await seedPlayed(request, a.id, [crew[0].id], server.origin);
		await prep(page, server, crew);

		const toggle = (c: Awaited<ReturnType<typeof surveyCard>>) => c.getByRole('button', { name: 'Gespielt mit', exact: true });
		const cardA = await surveyCard(page, a.id);
		await expect(toggle(cardA)).toHaveAttribute('aria-expanded', 'false');
		await toggle(cardA).click();

		await expect(toggle(cardA)).toHaveAttribute('aria-expanded', 'true');
		await expect(cardA.getByRole('group', { name: 'Spielerliste' })).toBeVisible();
		await expect(cardA.getByText('1 von 4 kennen sie', { exact: true })).toBeVisible();
		await expect(page.getByRole('group', { name: 'Spielerliste' })).toHaveCount(1);
		await expect(page.locator('[data-survey] [aria-expanded="true"]')).toHaveCount(1);
		const cardB = await surveyCard(page, b.id);
		await expect(toggle(cardB)).toHaveAttribute('aria-expanded', 'false');
		await expect(cardB.getByText('neu', { exact: true })).toBeVisible();

		await page.reload();
		await toPrep(page);
		await expect(page.getByRole('group', { name: 'Spielerliste' })).toHaveCount(0);
		await expect(page.locator('[data-survey] [aria-expanded="true"]')).toHaveCount(0);
	} finally {
		server.close();
	}
});

test('Scenario: Feud played-with section with nobody on the list', async ({ page, request }, info) => {
	const server = await emptyServer(info, 'cards-nobody');
	try {
		const { crew, surveys } = await setup(request, server, ['Extra']);
		const [a] = surveys;
		await prep(page, server, crew);

		const card = await surveyCard(page, a.id);
		await card.getByRole('button', { name: 'Gespielt mit', exact: true }).click();

		const list = card.getByRole('group', { name: 'Spielerliste' });
		await expect(list.getByText('Noch niemand.', { exact: true })).toBeVisible();
		await expect(list.getByRole('button')).toHaveText([...CREW, 'Extra'].map((n) => `+ ${n}`));
	} finally {
		server.close();
	}
});

test('Scenario: Feud prep grid by width', async ({ page, request }, info) => {
	const server = await emptyServer(info, 'cards-grid');
	try {
		const { crew } = await setup(request, server);
		await prep(page, server, crew);

		await page.setViewportSize({ width: 390, height: 844 });
		const narrow = await cells(page);
		expect(new Set(narrow.map((c) => c.x)).size).toBe(1);

		await page.setViewportSize({ width: 1280, height: 800 });
		const wide = await cells(page);
		expect(new Set(wide.map((c) => c.x)).size).toBeGreaterThanOrEqual(2);
		const span = await page.getByRole('list', { name: 'Alle Umfragen' }).evaluate((ul) => {
			const r = ul.getBoundingClientRect();
			const p = ul.parentElement!;
			const pr = p.getBoundingClientRect();
			const pad = parseFloat(getComputedStyle(p).paddingLeft);
			return { left: r.left - pr.left - pad, right: pr.right - pad - r.right };
		});
		expect(Math.abs(span.left)).toBeLessThanOrEqual(1);
		expect(Math.abs(span.right)).toBeLessThanOrEqual(1);
	} finally {
		server.close();
	}
});

test('Scenario: Feud picking keeps the grid in place', async ({ page, request }, info) => {
	const server = await emptyServer(info, 'cards-keep');
	try {
		const { crew, surveys } = await setup(request, server);
		await page.setViewportSize({ width: 1280, height: 800 });
		await prep(page, server, crew);

		// y relative to the grid, because the slot above grows when it is filled
		const layout = async (skip: number) => {
			const top = (await page.getByRole('list', { name: 'Alle Umfragen' }).boundingBox())!.y;
			return (await cells(page)).filter((c) => c.id !== skip).map((c) => ({ id: c.id, x: c.x, y: c.y - Math.round(top), w: c.w }));
		};
		const picked = (await cells(page))[0].id;
		const before = await layout(picked);
		expect(surveys.length).toBeGreaterThan(before.length);

		await chooseSurveys(page, [picked]);
		expect(await layout(picked)).toEqual(before);

		await page.locator('[data-slot="0"]').getByRole('button', { name: 'Entfernen', exact: true }).click();
		expect(await layout(picked)).toEqual(before);
	} finally {
		server.close();
	}
});
