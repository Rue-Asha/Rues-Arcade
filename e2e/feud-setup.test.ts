import { expect, test, type Page } from '@playwright/test';
import { deleteSurvey, emptyServer, seedPlayers, seedSavedRoster } from './helpers.ts';
import type { Survey } from '../src/lib/content/types.ts';

const NAMES = ['Alex', 'Bo', 'Cleo', 'Dani', 'Emil', 'Fenja', 'Gerd', 'Hana'];

async function lobby(page: Page, origin: string, saved: Parameters<typeof seedSavedRoster>[1], guests: string[] = []) {
	await page.goto(`${origin}/`);
	await seedSavedRoster(page, saved, guests);
	await page.goto(`${origin}/spiele/family-feud/lobby`);
}

const manyNames = (n: number) => Array.from({ length: n }, (_, i) => `Spieler ${String(i + 1).padStart(2, '0')}`);

test('Scenario: Feud guest blocks start', async ({ page, request }, info) => {
	const server = await emptyServer(info, 'feud-guest');
	try {
		const saved = await seedPlayers(request, server.origin, NAMES.slice(0, 4));
		await lobby(page, server.origin, saved, ['Eve']);

		await expect(page.getByText('Family Feud braucht gespeicherte Spieler.')).toBeVisible();
		await expect(page.getByText('Nicht gespeichert: Eve.', { exact: true })).toBeVisible();
		await expect(page.getByRole('link', { name: 'Spieler speichern' })).toHaveAttribute(
			'href',
			'/spieler?from=/spiele/family-feud/lobby'
		);
		await expect(page.getByRole('button', { name: 'Weiter' })).toHaveCount(0);
		await expect(page.getByRole('heading', { name: 'Teams' })).toHaveCount(0);
		expect(await page.locator('main').innerText()).not.toContain('!');
	} finally {
		server.close();
	}
});

test('Scenario: Feud roster of guests only', async ({ page }, info) => {
	const server = await emptyServer(info, 'feud-guests');
	try {
		await lobby(page, server.origin, [], ['Eve', 'Finn', 'Gil', 'Hal']);

		await expect(page.getByText('Nicht gespeichert: Eve, Finn, Gil, Hal.', { exact: true })).toBeVisible();
		await expect(page.getByRole('link', { name: 'Spieler speichern' })).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Teams' })).toHaveCount(0);
	} finally {
		server.close();
	}
});

test('Scenario: Feud needs four players', async ({ page, request }, info) => {
	const server = await emptyServer(info, 'feud-three');
	try {
		const saved = await seedPlayers(request, server.origin, NAMES.slice(0, 3));
		await page.goto(`${server.origin}/`);
		await seedSavedRoster(page, saved);
		await page.goto(`${server.origin}/spiele/family-feud`);

		await expect(page.getByText('mind. 4 Spieler')).toBeVisible();
		await expect(page.getByRole('link', { name: "Los geht's" })).toHaveCount(0);
		await expect(page.getByRole('button', { name: "Los geht's" })).toBeDisabled();
	} finally {
		server.close();
	}
});

test('Scenario: Feud roster above maximum asks who plays', async ({ page, request }, info) => {
	const server = await emptyServer(info, 'feud-many');
	try {
		const saved = await seedPlayers(request, server.origin, manyNames(21));
		await lobby(page, server.origin, saved);

		await expect(page.getByRole('heading', { name: 'Wer spielt mit?' })).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Teams' })).toHaveCount(0);
		await page.getByLabel('Spieler 21').uncheck();
		await page.getByRole('button', { name: 'Weiter' }).click();
		await expect(page.getByRole('heading', { name: 'Teams' })).toBeVisible();
	} finally {
		server.close();
	}
});

const team = (page: Page, n: 1 | 2) => page.getByRole('group', { name: `Team ${n}` });
const weiter = (page: Page) => page.getByRole('button', { name: 'Weiter' });
const members = (page: Page, n: 1 | 2) => team(page, n).getByRole('button').allInnerTexts();

test('Scenario: Feud with exactly four saved players', async ({ page, request }, info) => {
	const server = await emptyServer(info, 'feud-four');
	try {
		const saved = await seedPlayers(request, server.origin, NAMES.slice(0, 4));
		await lobby(page, server.origin, saved);

		await expect(team(page, 1).getByRole('button')).toHaveCount(2);
		await expect(team(page, 2).getByRole('button')).toHaveCount(2);
		await expect(weiter(page)).toBeEnabled();
	} finally {
		server.close();
	}
});

test('Scenario: Feud takes twenty players', async ({ page, request }, info) => {
	const server = await emptyServer(info, 'feud-twenty');
	try {
		const saved = await seedPlayers(request, server.origin, manyNames(20));
		await lobby(page, server.origin, saved);

		await expect(page.getByRole('heading', { name: 'Wer spielt mit?' })).toHaveCount(0);
		await expect(team(page, 1).getByRole('button')).toHaveCount(10);
		await expect(team(page, 2).getByRole('button')).toHaveCount(10);
	} finally {
		server.close();
	}
});

test('Scenario: Feud teams dealt from the roster', async ({ page, request }, info) => {
	const server = await emptyServer(info, 'feud-deal');
	try {
		const saved = await seedPlayers(request, server.origin, NAMES.slice(0, 6));
		await lobby(page, server.origin, saved);

		await expect(page.getByLabel('Name von Team 1')).toHaveValue('Team A');
		await expect(page.getByLabel('Name von Team 2')).toHaveValue('Team B');
		expect(await members(page, 1)).toEqual(['Alex', 'Cleo', 'Emil']);
		expect(await members(page, 2)).toEqual(['Bo', 'Dani', 'Fenja']);
		const rounds = page.getByRole('group', { name: 'Runden' }).getByRole('button');
		await expect(rounds).toHaveText(['1', '2', '3', '4', '5', '6', '7', '8']);
		await expect(page.getByRole('button', { name: '3', exact: true })).toHaveAttribute('aria-pressed', 'true');
		await expect(weiter(page)).toBeEnabled();
	} finally {
		server.close();
	}
});

test('Scenario: Feud tap moves a player and Mischen keeps all players', async ({ page, request }, info) => {
	const server = await emptyServer(info, 'feud-move');
	try {
		const saved = await seedPlayers(request, server.origin, NAMES.slice(0, 6));
		await lobby(page, server.origin, saved);

		await team(page, 1).getByRole('button', { name: 'Alex' }).click();
		await expect(team(page, 2).getByRole('button', { name: 'Alex' })).toBeVisible();
		await expect(team(page, 1).getByRole('button')).toHaveCount(2);
		await expect(team(page, 2).getByRole('button')).toHaveCount(4);

		await page.getByRole('button', { name: 'Mischen' }).click();
		const all = [...(await members(page, 1)), ...(await members(page, 2))].sort();
		expect(all).toEqual(NAMES.slice(0, 6));
		expect((await members(page, 1)).length).toBeGreaterThanOrEqual(2);
		expect((await members(page, 2)).length).toBeGreaterThanOrEqual(2);
	} finally {
		server.close();
	}
});

test('Scenario: Feud team below two blocks Weiter', async ({ page, request }, info) => {
	const server = await emptyServer(info, 'feud-small');
	try {
		const saved = await seedPlayers(request, server.origin, NAMES.slice(0, 4));
		await lobby(page, server.origin, saved);

		await team(page, 1).getByRole('button', { name: 'Alex' }).click();
		await expect(weiter(page)).toBeDisabled();
		await expect(page.getByText('Jedes Team braucht mind. 2 Spieler.')).toBeVisible();
	} finally {
		server.close();
	}
});

test('Scenario: Feud empty team name falls back', async ({ page, request }, info) => {
	const server = await emptyServer(info, 'feud-fallback');
	try {
		const saved = await seedPlayers(request, server.origin, NAMES.slice(0, 4));
		await lobby(page, server.origin, saved);

		await page.getByLabel('Name von Team 2').fill('');
		await weiter(page).click();

		await expect(page.getByText('Team A', { exact: true })).toBeVisible();
		await expect(page.getByText('Team B', { exact: true })).toBeVisible();
	} finally {
		server.close();
	}
});

test('Scenario: Feud identical team names rejected', async ({ page, request }, info) => {
	const server = await emptyServer(info, 'feud-names');
	try {
		const saved = await seedPlayers(request, server.origin, NAMES.slice(0, 4));
		await lobby(page, server.origin, saved);

		await page.getByLabel('Name von Team 1').fill('Füchse');
		await page.getByLabel('Name von Team 2').fill('füchse ');

		await expect(weiter(page)).toBeDisabled();
		await expect(page.getByText('Die Teams brauchen verschiedene Namen.')).toBeVisible();
	} finally {
		server.close();
	}
});

test('Scenario: Feud too few surveys block start', async ({ page, request }, info) => {
	const server = await emptyServer(info, 'feud-surveys');
	try {
		const saved = await seedPlayers(request, server.origin, NAMES.slice(0, 4));
		const res = await request.get(`${server.origin}/api/content/feud_surveys`);
		const surveys: Survey[] = await res.json();
		for (const s of surveys.slice(3)) await deleteSurvey(request, s.id, server.origin);
		await lobby(page, server.origin, saved);

		await expect(weiter(page)).toBeDisabled();
		await expect(page.getByText('Für 3 Runden braucht ihr mind. 4 Umfragen, es gibt 3.')).toBeVisible();
		await expect(page.getByRole('link', { name: 'Umfragen anlegen' })).toHaveAttribute(
			'href',
			'/spiele/family-feud/inhalte'
		);

		await page.getByRole('button', { name: '2', exact: true }).click();
		await expect(weiter(page)).toBeEnabled();
		await expect(page.getByText('Für 2 Runden', { exact: false })).toHaveCount(0);
	} finally {
		server.close();
	}
});

const roundBoxes = async (page: Page) => {
	await expect(page.getByRole('group', { name: 'Runden' }).getByRole('button')).toHaveCount(8);
	await page.evaluate(() =>
		Promise.all(
			document
				.getAnimations()
				.filter((a) => a.effect?.getTiming().iterations !== Infinity)
				.map((a) => a.finished.catch(() => {}))
		)
	);
	const boxes = await page.getByRole('group', { name: 'Runden' }).getByRole('button').evaluateAll((els) =>
		els.map((e) => {
			const r = e.getBoundingClientRect();
			return { x: Math.round(r.x), y: Math.round(r.y) };
		})
	);
	return boxes;
};

test('Scenario: Feud rounds picker in one row on desktop', async ({ page, request }, info) => {
	const server = await emptyServer(info, 'feud-seg-wide');
	try {
		const saved = await seedPlayers(request, server.origin, NAMES.slice(0, 4));
		await page.setViewportSize({ width: 1280, height: 800 });
		await lobby(page, server.origin, saved);

		const boxes = await roundBoxes(page);
		expect(boxes).toHaveLength(8);
		expect(new Set(boxes.map((b) => b.y)).size).toBe(1);
		expect(boxes.map((b) => b.x)).toEqual([...boxes.map((b) => b.x)].sort((a, b) => a - b));
	} finally {
		server.close();
	}
});

test('Scenario: Feud rounds picker wraps on a phone', async ({ page, request }, info) => {
	const server = await emptyServer(info, 'feud-seg-narrow');
	try {
		const saved = await seedPlayers(request, server.origin, NAMES.slice(0, 4));
		await page.setViewportSize({ width: 390, height: 844 });
		await lobby(page, server.origin, saved);

		const boxes = await roundBoxes(page);
		const rowsY = [...new Set(boxes.map((b) => b.y))];
		expect(rowsY.length).toBeGreaterThan(0);
		expect(rowsY.length).toBeLessThanOrEqual(2);
		expect(boxes.length / rowsY.length).toBeGreaterThan(1);
		const reading = [...boxes].sort((a, b) => a.y - b.y || a.x - b.x);
		expect(reading).toEqual(boxes);
		expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
	} finally {
		server.close();
	}
});
