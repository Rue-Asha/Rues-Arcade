import { expect, test, type APIRequestContext, type Page } from '@playwright/test';
import { demo } from '../src/lib/games/feud/demo.ts';
import { feud } from '../src/lib/games/feud/engine.ts';
import { playerId } from '../src/lib/players.ts';
import type { Survey } from '../src/lib/content/types.ts';
import { deleteSurvey, emptyServer, seedPlayed, seedPlayers, seedSavedRoster } from './helpers.ts';

const TOTAL = demo.steps.length;

type Server = Awaited<ReturnType<typeof emptyServer>>;

async function openDemo(page: Page, origin: string) {
	await page.goto(`${origin}/spiele/family-feud`);
	await page.getByRole('link', { name: 'Demo', exact: true }).click();
	await expect(page).toHaveURL(/\/spiele\/family-feud\/demo\?from=/);
}

async function emptied(request: APIRequestContext, server: Server) {
	const surveys: Survey[] = await (await request.get(`${server.origin}/api/content/feud_surveys`)).json();
	for (const s of surveys) await deleteSurvey(request, s.id, server.origin);
	expect(await (await request.get(`${server.origin}/api/content/feud_surveys`)).json()).toEqual([]);
	return surveys;
}

const progress = (page: Page) => page.getByText(/^Demo · Schritt \d+\/\d+$/);

async function playToEnd(page: Page) {
	for (let n = 1; n <= TOTAL; n++) {
		await expect(progress(page)).toHaveText(`Demo · Schritt ${n}/${TOTAL}`);
		const expected = page.locator('[data-demo="expected"]');
		await expect(expected).toHaveCount(1);
		await expected.click();
	}
	await expect(page.getByText('Demo beendet', { exact: true })).toBeVisible();
	await expect(page.locator('[data-demo="expected"]')).toHaveCount(0);
}

test('Scenario: Feud demo by tapping highlighted controls', async ({ page, request }, info) => {
	const server = await emptyServer(info, 'feud-demo');
	try {
		await emptied(request, server);
		await openDemo(page, server.origin);
		await expect(page.getByTestId('peek')).toBeVisible();
		await expect(page.getByTestId('peek').getByText('Milch', { exact: true })).toBeVisible();
		await expect(page.getByText('[Demo]', { exact: true })).toBeVisible();
		await playToEnd(page);
		await expect(page.getByText('Gewinner', { exact: true })).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Team A', exact: true })).toBeVisible();
	} finally {
		server.close();
	}
});

test('Scenario: Feud demo leaves data untouched', async ({ page, request }, info) => {
	const server = await emptyServer(info, 'feud-demo-data');
	try {
		const surveys: Survey[] = await (await request.get(`${server.origin}/api/content/feud_surveys`)).json();
		const saved = await seedPlayers(request, server.origin, ['Alex', 'Bo', 'Cleo', 'Dani']);
		await seedPlayed(request, surveys[0].id, [saved[0].id, saved[1].id], server.origin);
		await page.goto(`${server.origin}/`);
		await seedSavedRoster(page, saved);
		// a real state: the start page discards one that doesn't fit the game
		const ids = saved.map((p) => playerId(p.id));
		const config = {
			teams: [
				{ name: 'Team 1', players: ids.slice(0, 2) },
				{ name: 'Team 2', players: ids.slice(2) }
			] as [{ name: string; players: string[] }, { name: string; players: string[] }],
			surveys: [surveys[0]],
			tiebreak: surveys[1],
			saved: saved.map((p) => p.id)
		};
		const state = feud.init({ players: [], config, content: [], seed: 7 });
		const session = JSON.stringify({ v: feud.stateVersion, state });
		await page.evaluate((raw) => localStorage.setItem('arcade:session:family-feud', raw), session);

		const real = async () => ({
			played: await (await request.get(`${server.origin}/api/feud/played`)).json(),
			players: await (await request.get(`${server.origin}/api/players`)).json(),
			surveys: await (await request.get(`${server.origin}/api/content/feud_surveys`)).json()
		});
		const stored = () => page.evaluate(() => Object.fromEntries(Object.entries(localStorage)));
		const before = { server: await real(), stored: await stored() };

		await openDemo(page, server.origin);
		const calls: string[] = [];
		page.on('request', (r) => {
			const url = new URL(r.url());
			if (!url.pathname.startsWith('/_app/')) calls.push(`${r.method()} ${url.pathname}`);
		});
		await playToEnd(page);

		expect(calls).toEqual([]);
		expect(await real()).toEqual(before.server);
		expect(await stored()).toEqual(before.stored);
	} finally {
		server.close();
	}
});

test('Scenario: Feud demo completes with reduced motion', async ({ page, request }, info) => {
	const server = await emptyServer(info, 'feud-demo-motion');
	try {
		await page.emulateMedia({ reducedMotion: 'reduce' });
		await emptied(request, server);
		await openDemo(page, server.origin);
		await playToEnd(page);
	} finally {
		server.close();
	}
});
