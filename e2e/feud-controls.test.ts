import { expect, test, type APIRequestContext, type Locator, type Page } from '@playwright/test';
import type { Survey } from '../src/lib/content/types.ts';
import { chooseSurveys, emptyServer, openFaceoff, seedPlayers, seedSavedRoster, surveyByQuestion } from './helpers.ts';

const CREW = ['Alex', 'Bo', 'Cleo', 'Dani'];
const PARTY = 'Nenne etwas, das auf Partys immer ausgeht';
const GHOST = 'Was würdest du tun, wenn du einen Geist siehst?';

type Server = Awaited<ReturnType<typeof emptyServer>>;

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
}

const button = (page: Page, name: string) => page.getByRole('button', { name, exact: true });
const pick = (page: Page, i: number) => page.locator(`[data-tile="${i}"]`).getByRole('button');
const handoff = (page: Page) => page.getByTestId('handoff');
const rowOf = (page: Page, action: Locator) => page.locator('.row').filter({ has: action });
// the undo that sits in the same row as the action
const undoOf = (page: Page, action: Locator) => rowOf(page, action).getByRole('button', { name: 'Rückgängig', exact: true });

const rgb = (hex: string) => {
	const n = parseInt(hex.slice(1), 16);
	return `rgb(${n >> 16}, ${(n >> 8) & 255}, ${n & 255})`;
};
const token = (page: Page, name: string) =>
	page.evaluate((n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim(), `--${name}`);
// geometry is read after Stage's .rise and the button transitions have finished
const settled = (page: Page) =>
	page.evaluate(() =>
		Promise.all(
			document
				.getAnimations()
				.filter((a) => a.effect?.getTiming().iterations !== Infinity)
				.map((a) => a.finished.catch(() => {}))
		)
	);
// both boxes in one read: the row moves on the page while the screen settles
async function boxes(page: Page, name: string) {
	await settled(page);
	const [action, undo] = await rowOf(page, button(page, name)).evaluate((row, name) => {
		const all = [...row.querySelectorAll('button')];
		const rect = (b: Element) => {
			const r = b.getBoundingClientRect();
			return { x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height) };
		};
		return [all.find((b) => b.textContent?.trim() === name)!, all.find((b) => b.getAttribute('aria-label') === 'Rückgängig')!].map(rect);
	}, name);
	return { action, undo };
}

async function readsAsFault(page: Page, name: string) {
	const action = button(page, name);
	const undo = undoOf(page, action);
	await expect(action).toHaveCSS('background-color', rgb(await token(page, 'imposter')));
	await expect(undo).toHaveCSS('background-color', rgb(await token(page, 'duck')));
	await expect(undo.locator('svg')).toHaveCount(1);
	expect((await undo.innerText()).trim()).toBe('');
	const { action: a, undo: u } = await boxes(page, name);
	expect(u.y, `${name}: same row`).toBe(a.y);
	expect(u.x, `${name}: undo to the right`).toBeGreaterThan(a.x + a.width - 1);
	expect(u.height).toBe(a.height);
	expect(u.width).toBe(u.height);
	expect(u.width).toBeLessThan(a.width);
}

test('Scenario: Feud fault and undo read as what they are', async ({ page, request }, info) => {
	const server = await emptyServer(info, 'controls-read');
	try {
		await begin(page, request, server);
		await openFaceoff(page);
		await readsAsFault(page, 'Nicht auf der Tafel');

		await pick(page, 0).click();
		await handoff(page).getByRole('button', { name: 'Spielen', exact: true }).click();
		await expect(handoff(page)).toHaveCount(0);
		await readsAsFault(page, 'Fehler');

		for (let i = 0; i < 3; i++) await button(page, 'Fehler').click();
		await handoff(page).getByRole('button', { name: 'Weiter', exact: true }).click();
		await expect(handoff(page)).toHaveCount(0);
		await readsAsFault(page, 'Nicht auf der Tafel');
	} finally {
		server.close();
	}
});

test('Scenario: Feud disabled undo keeps its place', async ({ page, request }, info) => {
	const server = await emptyServer(info, 'controls-place');
	try {
		await begin(page, request, server);
		const action = button(page, 'Nicht auf der Tafel');
		const undo = undoOf(page, action);

		await expect(undo).toBeVisible();
		await expect(undo).toBeDisabled();
		const before = await boxes(page, 'Nicht auf der Tafel');
		await openFaceoff(page);
		await expect(undo).toBeEnabled();
		const after = await boxes(page, 'Nicht auf der Tafel');

		// the covered question and the team choice above change the row's height on the page, not the row itself
		for (const b of [before, after]) {
			b.undo.y -= b.action.y;
			b.action.y = 0;
		}
		expect(after).toEqual(before);
	} finally {
		server.close();
	}
});

test('Scenario: Feud fault row fits a phone', async ({ page, request }, info) => {
	await page.setViewportSize({ width: 390, height: 844 });
	const server = await emptyServer(info, 'controls-phone');
	try {
		await begin(page, request, server);
		await openFaceoff(page);
		await pick(page, 0).click();
		await handoff(page).getByRole('button', { name: 'Spielen', exact: true }).click();
		await expect(handoff(page)).toHaveCount(0);

		const { action: a, undo: u } = await boxes(page, 'Fehler');
		expect(u.y).toBe(a.y);
		expect(a.x).toBeGreaterThanOrEqual(0);
		expect(u.x + u.width).toBeLessThanOrEqual(390);
		expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
	} finally {
		server.close();
	}
});
