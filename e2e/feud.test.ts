import { expect, test, type APIRequestContext, type Page } from '@playwright/test';
import { board } from '../src/lib/content/survey.ts';
import type { Survey } from '../src/lib/content/types.ts';
import {
	deleteSurvey,
	emptyServer,
	seedPlayed,
	seedPlayers,
	seedSavedRoster,
	surveyByQuestion,
	writeHeaders
} from './helpers.ts';

const CREW = ['Alex', 'Bo', 'Cleo', 'Dani'];
// seeded surveys: six answers (Getränke 45 ... ), six answers, eight answers
const PARTY = 'Nenne etwas, das auf Partys immer ausgeht';
const GHOST = 'Was würdest du tun, wenn du einen Geist siehst?';
const HOLES = 'Nenne etwas, das voller Löcher sein kann';

type Server = Awaited<ReturnType<typeof emptyServer>>;

// teams are dealt alternately: Team A = Alex, Cleo; Team B = Bo, Dani. Round 1 opens with Team A, round 2 with Team B.
async function begin(page: Page, request: APIRequestContext, server: Server, questions: string[], extra: string[] = []) {
	const everyone = await seedPlayers(request, server.origin, [...CREW, ...extra]);
	const crew = everyone.slice(0, CREW.length);
	const others = everyone.slice(CREW.length);
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
	return { crew, others, surveys };
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
		const { surveys } = await begin(page, request, server, [PARTY, GHOST]);
		const tiles = board(surveys[0]);

		await expect(page.getByRole('heading', { name: PARTY, exact: true })).toBeVisible();
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
		await begin(page, request, server, [PARTY, GHOST]);
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
		await begin(page, request, server, [PARTY, GHOST]);
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
		const { surveys } = await begin(page, request, server, [PARTY, GHOST]);
		const double = page.getByText('Doppelte Punkte', { exact: true });

		await expect(double).toHaveCount(0);
		await toBoard(page);
		for (let i = 1; i < board(surveys[0]).length; i++) await pick(page, i).click();
		await press(page, 'Nächste Runde');

		await expect(page.getByRole('heading', { name: GHOST, exact: true })).toBeVisible();
		await expect(double).toBeVisible();
	} finally {
		server.close();
	}
});

const session = (page: Page) =>
	page.evaluate(() => JSON.parse(localStorage.getItem('arcade:session:family-feud')!).state);
const pods = (page: Page, n: number) => page.getByRole('img', { name: `${n} von 3 Fehlern` });
const pot = (page: Page) => page.getByTestId('pot');
const score = (page: Page, team: 0 | 1) => versus(page).getByTestId(`score-${team}`);
const total = (s: Survey, upto = Infinity) => board(s).slice(0, upto).reduce((sum, a) => sum + a.points, 0);

async function strikeOut(page: Page) {
	for (let i = 0; i < 3; i++) await press(page, 'Fehler');
	await expect(handoff(page)).toBeVisible();
	await handoff(page).getByRole('button', { name: 'Weiter', exact: true }).click();
}

// Round 1: Alex hits #1 for Team A, who play and clear the board. Round 2: Dani hits #1 for Team B, who play and
// strike out after tile 2; Team A steal tile 3. `snap` sees every screen.
async function fullGame(page: Page, [first, second]: Survey[], snap: () => Promise<void> = async () => {}) {
	await snap();
	await toBoard(page);
	await snap();
	for (let i = 1; i < board(first).length; i++) await pick(page, i).click();
	await expect(page.getByTestId('points')).toHaveText(`+${total(first)}`);
	await snap();
	await press(page, 'Nächste Runde');
	await snap();
	await toBoard(page);
	await pick(page, 1).click();
	await strikeOut(page);
	await snap();
	await pick(page, 2).click();
	const gain = total(second, 3) * 2;
	await expect(page.getByTestId('points')).toHaveText(`+${gain}`);
	await snap();
	await press(page, 'Zum Ergebnis');
	await expect(page.getByText('Gewinner', { exact: true })).toBeVisible();
	await snap();
	return { a: total(first) + gain, b: 0 };
}

test('Scenario: Feud strikes fill the pods', async ({ page, request }, info) => {
	const server = await emptyServer(info, 'feud-pods');
	try {
		await begin(page, request, server, [PARTY, GHOST]);
		await toBoard(page);
		await expect(pods(page, 0)).toBeVisible();

		await press(page, 'Fehler');
		await press(page, 'Fehler');

		await expect(pods(page, 2)).toBeVisible();
		await expect(pods(page, 2).locator('svg:not(.off)')).toHaveCount(2);
		expect((await session(page)).strikes).toBe(2);
	} finally {
		server.close();
	}
});

test('Scenario: Feud result shows the remaining answers muted', async ({ page, request }, info) => {
	const server = await emptyServer(info, 'feud-muted');
	try {
		const { surveys } = await begin(page, request, server, [PARTY, GHOST]);
		const tiles = board(surveys[0]);
		await toBoard(page);
		for (const i of [1, 2, 3]) await pick(page, i).click();
		await strikeOut(page);
		await press(page, 'Nicht auf der Tafel');

		for (const i of [4, 5]) {
			await expect(tile(page, i)).toHaveAttribute('data-state', 'muted');
			await expect(tile(page, i)).toHaveText(tiles[i].text);
		}
		await expect(score(page, 0)).toHaveText(String(total(surveys[0], 4)));
		await expect(score(page, 1)).toHaveText('0');
		await expect(page.getByRole('button', { name: 'Nächste Runde', exact: true })).toBeVisible();
	} finally {
		server.close();
	}
});

test('Scenario: Full Feud game', async ({ page, request }, info) => {
	const server = await emptyServer(info, 'feud-full');
	try {
		const { surveys } = await begin(page, request, server, [PARTY, GHOST]);
		const { a, b } = await fullGame(page, surveys);

		await expect(page.getByRole('heading', { name: 'Team A', exact: true })).toBeVisible();
		const rows = page.getByRole('region', { name: 'Punktestand' }).getByRole('listitem');
		await expect(rows.nth(0)).toContainText('Team A');
		await expect(rows.nth(0).locator('.pts')).toHaveText(String(a));
		await expect(rows.nth(1)).toContainText('Team B');
		await expect(rows.nth(1).locator('.pts')).toHaveText(String(b));
	} finally {
		server.close();
	}
});

test('Scenario: Feud copy reads neutral', async ({ page, request }, info) => {
	const server = await emptyServer(info, 'feud-copy');
	try {
		const { surveys } = await begin(page, request, server, [PARTY, GHOST]);
		const seen: string[] = [];
		await fullGame(page, surveys, async () => {
			await page.waitForTimeout(100);
			seen.push(await page.evaluate(() => document.body.innerText));
		});

		expect(seen.length).toBeGreaterThan(6);
		for (const text of seen) {
			expect(text).not.toContain('!');
			expect(text).not.toMatch(/\p{Extended_Pictographic}/u);
		}
	} finally {
		server.close();
	}
});

test('Scenario: Feud undo fixes a mistap', async ({ page, request }, info) => {
	const server = await emptyServer(info, 'feud-undo');
	try {
		const { surveys } = await begin(page, request, server, [PARTY, GHOST]);
		const tiles = board(surveys[0]);
		await toBoard(page);
		await expect(pot(page)).toHaveText(String(tiles[0].points));

		await pick(page, 3).click();
		await expect(tile(page, 3)).toHaveAttribute('data-state', 'revealed');
		await expect(pot(page)).toHaveText(String(tiles[0].points + tiles[3].points));
		await press(page, 'Rückgängig');

		await expect(tile(page, 3)).toHaveAttribute('data-state', 'hidden');
		await expect(pot(page)).toHaveText(String(tiles[0].points));
	} finally {
		server.close();
	}
});

test('Scenario: Feud undo disabled with nothing to undo', async ({ page, request }, info) => {
	const server = await emptyServer(info, 'feud-undo-off');
	try {
		await begin(page, request, server, [PARTY, GHOST]);

		await expect(page.getByRole('button', { name: 'Rückgängig', exact: true })).toBeDisabled();
		await page.getByRole('button', { name: 'Nicht auf der Tafel', exact: true }).click();
		await expect(page.getByRole('button', { name: 'Rückgängig', exact: true })).toBeEnabled();
	} finally {
		server.close();
	}
});

async function hold(page: Page) {
	const box = (await page.getByRole('button', { name: 'Umfrage ansehen', exact: true }).boundingBox())!;
	await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
	await page.mouse.down();
}

test('Scenario: Feud peek shows the survey while held', async ({ page, request }, info) => {
	const server = await emptyServer(info, 'feud-peek');
	try {
		const { surveys } = await begin(page, request, server, [PARTY, GHOST]);
		const tiles = board(surveys[0]);
		await toBoard(page);
		const peek = page.getByTestId('peek');
		await expect(peek).toHaveCount(0);

		await hold(page);
		await expect(peek.getByRole('heading', { name: PARTY, exact: true })).toBeVisible();
		for (const [i, t] of tiles.entries())
			await expect(peek.getByRole('listitem').nth(i)).toHaveText(new RegExp(`${t.text}\\s*${t.points}`));
		await page.mouse.up();

		await expect(peek).toHaveCount(0);
	} finally {
		server.close();
	}
});

test('Scenario: Feud played-with list hidden outside prep', async ({ page, request }, info) => {
	const server = await emptyServer(info, 'feud-hidden');
	try {
		const { crew, others, surveys } = await begin(page, request, server, [PARTY, GHOST], ['Extra']);
		await seedPlayed(request, surveys[0].id, [crew[0].id, others[0].id], server.origin);
		await page.reload();
		const hidden = async () => {
			const text = await page.locator('main').innerText();
			expect(text).not.toContain('Extra');
			expect(text).not.toContain('kennen sie');
			expect(text).not.toContain('gespielt mit');
		};

		await expect(page.getByRole('heading', { name: PARTY, exact: true })).toBeVisible();
		await hidden();
		await page.goto(`${server.origin}/spiele/family-feud/inhalte`);
		await expect(page.getByText(PARTY).first()).toBeVisible();
		await hidden();
	} finally {
		server.close();
	}
});

const notice = (page: Page) => page.getByRole('alert').filter({ hasText: 'Spielstand' });

test('Scenario: Feud session resumes after reload', async ({ page, request }, info) => {
	const server = await emptyServer(info, 'feud-resume');
	try {
		const { surveys } = await begin(page, request, server, [PARTY, GHOST]);
		const tiles = board(surveys[0]);
		await toBoard(page);
		await pick(page, 1).click();
		await press(page, 'Fehler');
		const gained = String(tiles[0].points + tiles[1].points);
		await expect(pot(page)).toHaveText(gained);

		await page.reload();

		await expect(pods(page, 1)).toBeVisible();
		await expect(pot(page)).toHaveText(gained);
		for (const i of [0, 1]) await expect(tile(page, i)).toHaveAttribute('data-state', 'revealed');
		for (let i = 2; i < tiles.length; i++) await expect(tile(page, i)).toHaveAttribute('data-state', 'hidden');
		await expect(score(page, 0)).toHaveText('0');
		await expect(score(page, 1)).toHaveText('0');
		await expect(notice(page)).toHaveCount(0);
	} finally {
		server.close();
	}
});

test('Scenario: Feud game keeps its survey copy', async ({ page, request }, info) => {
	const server = await emptyServer(info, 'feud-copy-kept');
	try {
		const { surveys } = await begin(page, request, server, [PARTY, GHOST]);
		const [first, second] = surveys;
		await toBoard(page);
		await deleteSurvey(request, first.id, server.origin);
		const edit = await request.put(`${server.origin}/api/content/feud_surveys/${second.id}`, {
			headers: writeHeaders(server.origin),
			data: {
				question: GHOST,
				answers: [
					{ text: 'Pinguin', points: 60 },
					{ text: 'Bär', points: 20 },
					{ text: 'Wolf', points: 10 }
				]
			}
		});
		expect(edit.ok()).toBe(true);

		await page.reload();

		await expect(page.getByRole('heading', { name: PARTY, exact: true })).toBeVisible();
		const top = board(first)[0];
		await expect(tile(page, 0)).toContainText(top.text);
		await expect(tile(page, 0)).toContainText(String(top.points));
		for (let i = 1; i < board(first).length; i++) await pick(page, i).click();
		await press(page, 'Nächste Runde');
		await toBoard(page);
		const lion = board(second)[0];
		await expect(page.getByRole('heading', { name: GHOST, exact: true })).toBeVisible();
		await expect(tile(page, 0)).toContainText(lion.text);
		await expect(tile(page, 0)).toContainText(String(lion.points));
		await expect(page.getByText('Pinguin')).toHaveCount(0);
	} finally {
		server.close();
	}
});

test('Scenario: Feud old or corrupt save discarded', async ({ page, request }, info) => {
	const server = await emptyServer(info, 'feud-discard');
	try {
		await begin(page, request, server, [PARTY, GHOST]);
		const raw = await page.evaluate(() => localStorage.getItem('arcade:session:family-feud')!);

		await page.evaluate(() => localStorage.setItem('arcade:session:family-feud', 'not json{'));
		await page.goto(`${server.origin}/spiele/family-feud/spielen`);
		await expect(notice(page)).toBeVisible();

		await page.evaluate((r) => localStorage.setItem('arcade:session:family-feud', r), raw.replace(/^\{"v":\d+/, '{"v":99'));
		await page.goto(`${server.origin}/spiele/family-feud/spielen`);
		await expect(notice(page)).toBeVisible();
	} finally {
		server.close();
	}
});

test('Scenario: Leaving Feud clears the session', async ({ page, request }, info) => {
	const server = await emptyServer(info, 'feud-leave');
	try {
		await begin(page, request, server, [PARTY, GHOST]);
		await expect(page.getByRole('heading', { name: PARTY, exact: true })).toBeVisible();

		await page.getByRole('button', { name: 'Spiel beenden' }).click();
		await page.getByRole('dialog').getByRole('button', { name: 'Beenden' }).click();
		await expect(page).toHaveURL(/\/spiele\/family-feud$/);

		await page.goto(`${server.origin}/spiele/family-feud`);
		await expect(page.getByRole('button', { name: 'Weiterspielen' })).toHaveCount(0);
		expect(await page.evaluate(() => localStorage.getItem('arcade:session:family-feud'))).toBeNull();
	} finally {
		server.close();
	}
});

const running = (page: Page) =>
	page.evaluate(
		() =>
			document
				.getAnimations()
				.filter((a) => a.playState === 'running' && a.effect?.getTiming().iterations !== Infinity).length
	);

test('Scenario: Feud board fits a phone', async ({ page, request }, info) => {
	await page.setViewportSize({ width: 390, height: 844 });
	const server = await emptyServer(info, 'feud-phone');
	try {
		const { surveys } = await begin(page, request, server, [HOLES, GHOST]);
		expect(surveys[0].answers).toHaveLength(8);
		await toBoard(page);

		const width = await page.evaluate(() => document.documentElement.scrollWidth);
		expect(width).toBeLessThanOrEqual(390);
		for (let i = 0; i < 8; i++) {
			await expect(tile(page, i)).toBeVisible();
			const box = (await tile(page, i).boundingBox())!;
			expect(box.x).toBeGreaterThanOrEqual(0);
			expect(box.x + box.width).toBeLessThanOrEqual(390);
		}
	} finally {
		server.close();
	}
});

test('Scenario: Feud motion uses transform and opacity only', async ({ page, request }, info) => {
	await page.addInitScript(() => {
		const seen = new Set<string>();
		(window as unknown as { animated: Set<string> }).animated = seen;
		// hover and press feedback of the shared buttons are CSS transitions, not the game's motion
		const sample = () => {
			for (const a of document.getAnimations()) {
				if (a instanceof CSSTransition) continue;
				for (const k of (a.effect as KeyframeEffect).getKeyframes()) for (const p of Object.keys(k)) seen.add(p);
			}
			requestAnimationFrame(sample);
		};
		requestAnimationFrame(sample);
	});
	const server = await emptyServer(info, 'feud-motion');
	try {
		await begin(page, request, server, [PARTY, GHOST]);
		await toBoard(page);
		await pick(page, 1).click();
		await press(page, 'Fehler');
		await expect(pods(page, 1)).toBeVisible();
		await page.waitForTimeout(900);
		await pick(page, 2).click();
		await press(page, 'Fehler');
		await press(page, 'Fehler');
		await handoff(page).getByRole('button', { name: 'Weiter', exact: true }).click();
		await press(page, 'Nicht auf der Tafel');
		await expect(page.getByTestId('points')).toBeVisible();
		await page.waitForTimeout(1500);

		const seen = await page.evaluate(() => [...(window as unknown as { animated: Set<string> }).animated]);
		expect(seen).toContain('transform');
		expect(seen.filter((p) => !['transform', 'opacity', 'offset', 'computedOffset', 'easing', 'composite'].includes(p))).toEqual([]);
	} finally {
		server.close();
	}
});

test('Scenario: Feud motion never blocks input', async ({ page, request }, info) => {
	const server = await emptyServer(info, 'feud-input');
	try {
		await begin(page, request, server, [PARTY, GHOST]);
		await toBoard(page);

		// one task, so the flip can't have finished between the two taps
		const seen = await page.evaluate(async () => {
			const frame = () => new Promise((ok) => requestAnimationFrame(ok));
			document.querySelector<HTMLElement>('[data-tile="1"] button')!.click();
			await frame();
			const flip = () => document.querySelector('[data-tile="1"] .face')!.getAnimations().length;
			const before = flip();
			[...document.querySelectorAll('button')].find((b) => b.textContent?.trim() === 'Fehler')!.click();
			await frame();
			return {
				before,
				after: flip(),
				pods: document.querySelector('.lives')?.getAttribute('aria-label')
			};
		});

		expect(seen.before).toBeGreaterThan(0);
		expect(seen.after).toBeGreaterThan(0);
		expect(seen.pods).toBe('1 von 3 Fehlern');
		expect((await session(page)).strikes).toBe(1);
	} finally {
		server.close();
	}
});

test('Scenario: Feud reduced motion is instant', async ({ page, request }, info) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	const server = await emptyServer(info, 'feud-reduced');
	try {
		const { surveys } = await begin(page, request, server, [PARTY, GHOST]);
		await toBoard(page);
		expect(await running(page)).toBe(0);

		await pick(page, 1).click();
		await expect(tile(page, 1)).toHaveAttribute('data-state', 'revealed');
		expect(await running(page)).toBe(0);

		await press(page, 'Fehler');
		await expect(pods(page, 1)).toBeVisible();
		expect(await running(page)).toBe(0);

		await press(page, 'Fehler');
		await press(page, 'Fehler');
		await handoff(page).getByRole('button', { name: 'Weiter', exact: true }).click();
		await press(page, 'Nicht auf der Tafel');
		await expect(page.getByTestId('points')).toBeVisible();
		expect(await running(page)).toBe(0);
		const gained = total(surveys[0], 2);
		await expect(page.getByTestId('points')).toHaveText(`+${gained}`, { timeout: 500 });
		await expect(score(page, 0)).toHaveText(String(gained), { timeout: 500 });
	} finally {
		server.close();
	}
});

test('Scenario: Feud peek does not block a tile flip', async ({ page, request }, info) => {
	const server = await emptyServer(info, 'feud-peek-flip');
	try {
		const { surveys } = await begin(page, request, server, [PARTY, GHOST]);
		const second = board(surveys[0])[1];
		await toBoard(page);

		await hold(page);
		// the peek floats over the tiles, so the tap goes straight to the tile's button
		await tile(page, 1).getByRole('button').dispatchEvent('click');
		const flips = await page.evaluate(() => {
			const list = document.querySelector('[data-tile="1"] .face')!.getAnimations();
			(window as unknown as { flips: Animation[] }).flips = list;
			return list.length;
		});
		expect(flips).toBeGreaterThan(0);
		await expect(page.getByTestId('peek')).toBeVisible();
		const settled = await page.evaluate(async () =>
			(await Promise.allSettled((window as unknown as { flips: Animation[] }).flips.map((a) => a.finished))).map((r) => r.status)
		);
		await page.mouse.up();

		expect(settled.every((s) => s === 'fulfilled')).toBe(true);
		await expect(tile(page, 1)).toContainText(second.text);
		await expect(tile(page, 1)).toContainText(String(second.points));
	} finally {
		server.close();
	}
});

test('Scenario: Feud peek instant under reduced motion', async ({ page, request }, info) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	const server = await emptyServer(info, 'feud-peek-reduced');
	try {
		await begin(page, request, server, [PARTY, GHOST]);
		await toBoard(page);

		await hold(page);
		await expect(page.getByTestId('peek')).toBeVisible();
		expect(await running(page)).toBe(0);
		await page.mouse.up();

		await expect(page.getByTestId('peek')).toHaveCount(0);
		expect(await running(page)).toBe(0);
	} finally {
		server.close();
	}
});
