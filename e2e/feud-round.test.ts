import { expect, test, type APIRequestContext, type Page } from '@playwright/test';
import { board } from '../src/lib/content/survey.ts';
import type { Survey } from '../src/lib/content/types.ts';
import { chooseSurveys, emptyServer, live, openFaceoff, seedPlayers, seedSavedRoster, settled, surveyByQuestion } from './helpers.ts';

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

const button = (page: Page, name: string) => live(page).getByRole('button', { name, exact: true });
const buzzer = (page: Page) => live(page).getByRole('group', { name: 'Buzzer', exact: true });
const team = (page: Page, name: string) => buzzer(page).getByRole('button', { name, exact: true });
const tiles = (page: Page) => live(page).getByRole('list', { name: 'Tafel' }).getByRole('button');
const question = (page: Page) => live(page).getByRole('heading', { name: PARTY, exact: true });
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

		// the peek sits in the rail, below the stage on a phone
		await button(page, 'Umfrage ansehen').scrollIntoViewIfNeeded();
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

test('Scenario: Feud question uses the Reveal', async ({ page, request }, info) => {
	const server = await emptyServer(info, 'round-reveal-card');
	try {
		await begin(page, request, server);
		await settled(page);
		await expect(live(page).getByTestId('covered')).toBeVisible();
		await expect(live(page).getByTestId('reveal')).toHaveCount(0);

		await live(page).getByRole('button', { name: 'Frage aufdecken', exact: true }).click();
		await expect(live(page).getByTestId('covered')).toHaveCount(0);
		const card = live(page).getByTestId('reveal');
		await expect(card.getByRole('heading', { name: PARTY, exact: true })).toBeVisible();
		const found = await page.evaluate(() =>
			document
				.querySelector('[data-stage]:not([data-leaving]) [data-testid="reveal"]')!
				.getAnimations({ subtree: true })
				.map((a) => ({
					iterations: a.effect!.getTiming().iterations,
					props: (a.effect as KeyframeEffect)
						.getKeyframes()
						.flatMap((k) => Object.keys(k))
						.filter((k) => !['offset', 'computedOffset', 'easing', 'composite'].includes(k))
				}))
		);
		expect(found.length).toBeGreaterThan(0);
		for (const a of found) {
			expect(a.iterations).toBe(1);
			for (const prop of a.props) expect(['transform', 'opacity']).toContain(prop);
		}
	} finally {
		server.close();
	}
});

test('Scenario: Feud undo transitions like any phase change', async ({ page, request }, info) => {
	const server = await emptyServer(info, 'round-undo-phase');
	try {
		await begin(page, request, server);
		await openFaceoff(page);
		await live(page).locator('[data-tile="0"] button').click();
		await live(page).getByRole('button', { name: 'Spielen', exact: true }).click();
		await expect(live(page).getByRole('button', { name: 'Fehler', exact: true })).toBeVisible();
		await settled(page);

		const seen = await page.evaluate(
			() =>
				new Promise<{ stages: number; leaving: boolean; inert: boolean }>((ok) => {
					[...document.querySelectorAll('button')].find((b) => b.getAttribute('aria-label') === 'Rückgängig')!.click();
					requestAnimationFrame(() =>
						requestAnimationFrame(() => {
							const out = document.querySelector<HTMLElement>('[data-stage][data-leaving]');
							ok({
								stages: document.querySelectorAll('[data-stage]').length,
								leaving: out !== null && out.getAnimations().length > 0,
								inert: out?.inert ?? false
							});
						})
					);
				})
		);
		expect(seen).toEqual({ stages: 2, leaving: true, inert: true });
		await expect(live(page).getByTestId('handoff')).toBeVisible();
		await expect(page.locator('[data-stage]')).toHaveCount(1);
	} finally {
		server.close();
	}
});

test('Scenario: Feud result uses the Outcome', async ({ page, request }, info) => {
	const server = await emptyServer(info, 'round-outcome');
	try {
		const [first] = await begin(page, request, server);
		await openFaceoff(page);
		await live(page).locator('[data-tile="0"] button').click();
		await live(page).getByRole('button', { name: 'Spielen', exact: true }).click();
		for (let i = 0; i < 3; i++) await live(page).getByRole('button', { name: 'Fehler', exact: true }).click();
		await live(page).getByRole('button', { name: 'Weiter', exact: true }).click();
		await settled(page);
		const gain = board(first)[0].points;
		const mid = await page.evaluate(
			() =>
				new Promise<{ text: string; verdict: string }>((ok) => {
					[...document.querySelectorAll('button')].find((b) => b.textContent?.trim() === 'Nicht auf der Tafel')!.click();
					requestAnimationFrame(() =>
						requestAnimationFrame(() =>
							ok({
								text: document.querySelector('[data-stage]:not([data-leaving]) [data-testid="points"]')!.textContent!.trim(),
								verdict: document.querySelector('[data-stage]:not([data-leaving]) [data-testid="verdict"]')!.textContent!.trim()
							})
						)
					);
				})
		);
		expect(mid.verdict).toBe('Topf gesichert');
		expect(Number(mid.text.slice(1))).toBeLessThan(gain);
		await expect(live(page).getByTestId('points')).toHaveText(`+${gain}`);
		await expect(live(page).locator('h2[data-testid="verdict"]')).toHaveText('Topf gesichert');
		await expect(live(page).locator('[data-state="muted"]')).not.toHaveCount(0);
	} finally {
		server.close();
	}
});
