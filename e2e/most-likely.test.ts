import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { demo } from '../src/lib/games/most-likely/demo.ts';
import { decoAudit, emptyServer, expectFrame, expectInstant, live, seedRoster, settled, shot } from './helpers.ts';

const crew = (n: number) => Array.from({ length: n }, (_, i) => `Spieler ${i + 1}`);
const names = ['Alex', 'Bo', 'Cleo', 'Dani'];

// The shared e2e DB holds the seeded prompts; the drawn one is read from the saved session.
const saved = (page: Page) =>
	page.evaluate(() => JSON.parse(localStorage.getItem('arcade:session:most-likely')!).state);

const press = (page: Page, name: string) => page.getByRole('button', { name, exact: true }).click();
const team = (page: Page, n: number) => page.getByRole('group', { name: `Team ${n}`, exact: true });
const choice = (page: Page, name: string) =>
	page.getByRole('group', { name: /^Wie viele aus/ }).getByRole('button', { name, exact: true });
const board = (page: Page) => live(page).getByRole('region', { name: 'Punktestand' }).getByRole('listitem');
const final = board;

// lobby → game with the roster dealt into `teams` teams, 5 rounds
async function start(page: Page, roster = names, teams = 2) {
	await seedRoster(page, roster);
	await page.goto('/spiele/most-likely/lobby');
	for (let n = 2; n < teams; n++) await page.getByRole('button', { name: 'Mehr Teams' }).click();
	await press(page, '5');
	await press(page, "Los geht's");
	await expect(page).toHaveURL(/\/spiele\/most-likely\/spielen$/);
}

// rewrites the saved session and reopens it; `scores` are the teams' points in team order
async function seedPhase(page: Page, patch: Record<string, unknown>, scores?: number[]) {
	await page.evaluate(
		({ patch, scores }) => {
			const raw = JSON.parse(localStorage.getItem('arcade:session:most-likely')!);
			Object.assign(raw.state, patch);
			scores?.forEach((n, i) => (raw.state.teams[i].score = n));
			localStorage.setItem('arcade:session:most-likely', JSON.stringify(raw));
		},
		{ patch, scores }
	);
	await page.goto('/spiele/most-likely/spielen');
}

// the phase's Stage rises in after the click, past what shot() can see yet
async function still(page: Page, info: TestInfo, slug: string) {
	await page.evaluate(() => new Promise((ok) => requestAnimationFrame(() => requestAnimationFrame(ok))));
	await shot(page, info, slug);
}

async function onTurn(page: Page) {
	const heading = page.getByRole('heading', { name: / ist dran$/ });
	await expect(heading).toBeVisible();
	return (await heading.textContent())!.replace(/ ist dran$/, '').trim();
}

// plays one turn: points, records `matched` (0 = "Alle verschieden") and leaves the result with its button
async function playTurn(page: Page, matched: number | ((team: string) => number), seen: string[] = []) {
	const name = await onTurn(page);
	const { prompt } = await saved(page);
	await expect(page.getByTestId('prompt')).toHaveText(prompt.a);
	seen.push(await page.locator('body').innerText());
	await press(page, 'Alle haben gezeigt');
	const n = typeof matched === 'number' ? matched : matched(name);
	await expect(page.getByRole('heading', { name: `Wie viele aus ${name} haben auf dieselbe Person gezeigt?` })).toBeVisible();
	seen.push(await page.locator('body').innerText());
	await choice(page, n === 0 ? 'Alle verschieden' : String(n)).click();
	await expect(page.getByTestId('points')).toHaveText(`+${n}`);
	await expect(page.getByTestId('result-prompt')).toHaveText(prompt.a);
	seen.push(await page.locator('body').innerText());
	const next = page.getByRole('button', { name: /^(Nächstes Team|Nächste Runde|Zum Ergebnis)$/ });
	const label = (await next.textContent())!.trim();
	await next.click();
	return { name, label };
}

test('Scenario: Most Likely lobby offers rounds', async ({ page }, info) => {
	await seedRoster(page, names);
	await page.goto('/spiele/most-likely/lobby');

	const rounds = page.getByRole('group', { name: 'Runden' }).getByRole('button');
	await expect(rounds).toHaveText(['5', '10', '15', '20']);
	await expect(rounds.filter({ hasText: /^10$/ })).toHaveAttribute('aria-pressed', 'true');
	for (const r of ['5', '15', '20'])
		await expect(page.getByRole('button', { name: r, exact: true })).toHaveAttribute('aria-pressed', 'false');
	await expect(team(page, 1).getByRole('button')).toHaveText(['Alex', 'Cleo']);
	await expect(team(page, 2).getByRole('button')).toHaveText(['Bo', 'Dani']);
	await expect(team(page, 3)).toHaveCount(0);
	await expect(page.getByRole('button', { name: "Los geht's" })).toBeEnabled();
	await shot(page, info, 'lobby-most-likely');

	await press(page, '5');
	await expect(page.getByRole('button', { name: '5', exact: true })).toHaveAttribute('aria-pressed', 'true');
	await expect(page.getByRole('button', { name: '10', exact: true })).toHaveAttribute('aria-pressed', 'false');
});

test('Scenario: Most Likely needs four players', async ({ page }) => {
	await seedRoster(page, ['Alex', 'Bo', 'Cleo']);
	await page.goto('/spiele/most-likely');

	await expect(page.getByRole('button', { name: "Los geht's" })).toBeDisabled();
	await expect(page.getByText('mind. 4 Spieler')).toBeVisible();
});

test('Scenario: Most Likely roster above maximum asks who plays', async ({ page }) => {
	await seedRoster(page, crew(21));
	await page.goto('/spiele/most-likely/lobby');

	await expect(page.getByText('Wer spielt mit?', { exact: true })).toBeVisible();
	await expect(page.getByRole('checkbox')).toHaveCount(21);
	await expect(page.getByText('höchstens 20')).toBeVisible();
	const next = page.getByRole('button', { name: 'Weiter' });
	await expect(next).toBeDisabled();

	await page.getByRole('checkbox', { name: 'Spieler 21' }).uncheck();
	await expect(next).toBeEnabled();
	for (let i = 5; i <= 20; i++) await page.getByRole('checkbox', { name: `Spieler ${i}`, exact: true }).uncheck();
	await expect(next).toBeEnabled();
	await page.getByRole('checkbox', { name: 'Spieler 4', exact: true }).uncheck();
	await expect(next).toBeDisabled();
	await page.getByRole('checkbox', { name: 'Spieler 4', exact: true }).check();

	await next.click();
	await expect(page.getByRole('checkbox')).toHaveCount(0);
	await expect(team(page, 1).getByRole('button')).toHaveCount(2);
	await expect(team(page, 2).getByRole('button')).toHaveCount(2);
});

test('Scenario: Most Likely team stepper is bounded by the players', async ({ page }) => {
	const fewer = page.getByRole('button', { name: 'Weniger Teams' });
	const more = page.getByRole('button', { name: 'Mehr Teams' });
	for (const [players, most] of [
		[5, 2],
		[16, 8],
		[20, 8]
	]) {
		await seedRoster(page, crew(players));
		await page.goto('/spiele/most-likely/lobby');
		await expect(team(page, 2), `${players}`).toBeVisible();
		await expect(team(page, 3), `${players}`).toHaveCount(0);
		await expect(fewer, `${players}`).toBeDisabled();
		for (let n = 2; n < most; n++) await more.click();
		await expect(team(page, most), `${players}`).toBeVisible();
		await expect(more, `${players}`).toBeDisabled();
		await expect(team(page, most + 1), `${players}`).toHaveCount(0);
	}
});

test('Scenario: Most Likely chip moves a player to the next team', async ({ page }) => {
	await seedRoster(page, crew(6));
	await page.goto('/spiele/most-likely/lobby');
	const hint = page.getByTestId('uneven');
	await expect(hint).toHaveCount(0);

	await team(page, 1).getByRole('button', { name: 'Spieler 1', exact: true }).click();
	await expect(team(page, 2).getByRole('button', { name: 'Spieler 1', exact: true })).toBeVisible();
	await expect(team(page, 1).getByRole('button')).toHaveCount(2);
	await expect(team(page, 2).getByRole('button')).toHaveCount(4);
	await expect(hint).toBeVisible();
	await expect(page.getByRole('alert')).toHaveCount(0);
	await expect(page.getByRole('button', { name: "Los geht's" })).toBeEnabled();
});

test('Scenario: Most Likely team of one blocks the start', async ({ page }) => {
	await seedRoster(page, names);
	await page.goto('/spiele/most-likely/lobby');

	await team(page, 1).getByRole('button', { name: 'Alex', exact: true }).click();
	await expect(team(page, 1).getByRole('button')).toHaveText(['Cleo']);
	await expect(page.getByRole('button', { name: "Los geht's" })).toBeDisabled();
	await expect(page.getByRole('alert')).toHaveText('Team 1 braucht mind. 2 Spieler.');
});

test('Scenario: Most Likely shuffle keeps the team sizes', async ({ page }) => {
	await seedRoster(page, crew(7));
	await page.goto('/spiele/most-likely/lobby');
	await page.getByRole('button', { name: 'Mehr Teams' }).click();

	const sizes = async () => Promise.all([1, 2, 3].map((n) => team(page, n).getByRole('button').count()));
	const everyone = async () =>
		(await Promise.all([1, 2, 3].map((n) => team(page, n).getByRole('button').allTextContents()))).flat().sort();
	expect(await sizes()).toEqual([3, 2, 2]);
	for (let i = 0; i < 3; i++) {
		await press(page, 'Mischen');
		expect(await sizes()).toEqual([3, 2, 2]);
		expect(await everyone()).toEqual([...crew(7)].sort());
	}
});

test('Scenario: Most Likely shows umlaut names as entered', async ({ page }) => {
	await seedRoster(page, ['Jörg', 'Ümit', 'Bo', 'Cleo']);
	await page.goto('/spiele/most-likely/lobby');
	await expect(team(page, 1).getByRole('button')).toHaveText(['Jörg', 'Bo']);
	await expect(team(page, 2).getByRole('button')).toHaveText(['Ümit', 'Cleo']);

	await press(page, "Los geht's");
	const first = await onTurn(page);
	await expect(page.getByTestId('players')).toHaveText(first === 'Team 1' ? 'Jörg und Bo' : 'Ümit und Cleo');
});

test('Scenario: Most Likely turn screen names the team', async ({ page }, info) => {
	await start(page);
	const s = await saved(page);
	const opener = s.teams[s.startTeam];
	await expect(page.getByRole('heading', { name: `${opener.name} ist dran`, exact: true })).toBeVisible();
	await expect(page.getByTestId('players')).toHaveText(opener.name === 'Team 1' ? 'Alex und Cleo' : 'Bo und Dani');
	await expect(page.getByTestId('prompt')).toHaveText(s.prompt.a);
	await expect(page.getByTestId('status')).toHaveText('Runde 1 / 5 · Team 1 / 2');
	await expect(
		live(page).getByText('Zählt bis drei und zeigt gleichzeitig auf die Person, die am besten passt.', { exact: true })
	).toBeVisible();
	await still(page, info, 'most-likely-prompt');
});

test('Scenario: Most Likely prompt uses the Handoff', async ({ page }) => {
	await start(page);
	const s = await saved(page);
	const opener = s.teams[s.startTeam];
	const handoff = live(page).getByTestId('handoff');
	await expect(handoff).toHaveCount(1);
	await expect(handoff.getByRole('heading', { name: `${opener.name} ist dran`, exact: true })).toBeVisible();
	await expect(live(page).locator('[data-frame="stage"]').getByTestId('handoff')).toHaveCount(1);
	expect(
		await page.evaluate(() =>
			[...document.querySelectorAll('*')].some(
				(el) => getComputedStyle(el).position === 'fixed' && el.querySelector('[data-testid="handoff"]')
			)
		)
	).toBe(false);
	if (page.viewportSize()!.width >= 1024) await expect(live(page).locator('[data-frame="rail"]')).toBeVisible();
	await expect(live(page).getByRole('button', { name: 'Alle haben gezeigt' })).toBeVisible();
});

test('Scenario: Most Likely screens use the stage and rail frame', async ({ page }) => {
	await start(page);
	await expectFrame(page);
	await press(page, 'Alle haben gezeigt');
	await expect(choice(page, '2')).toBeVisible();
	await expectFrame(page);
	await choice(page, '2').click();
	await expect(live(page).getByTestId('verdict')).toBeVisible();
	await expectFrame(page);
	await seedPhase(page, { phase: 'result', lastPoints: 0 });
	await expectFrame(page);
	await seedPhase(page, { phase: 'gameOver', round: 4, lastPoints: null }, [4, 2]);
	await expectFrame(page);
});

test('Scenario: Most Likely result counts up', async ({ page }) => {
	await start(page);
	await press(page, 'Alle haben gezeigt');
	await expect(choice(page, '2')).toBeVisible();
	await settled(page);
	const mid = await page.evaluate(
		() =>
			new Promise<string>((resolve) => {
				[...document.querySelectorAll('button')].find((b) => b.textContent?.trim() === '2')!.click();
				requestAnimationFrame(() =>
					requestAnimationFrame(() => resolve(document.querySelector('[data-testid="points"]')!.textContent!.trim()))
				);
			})
	);
	expect(mid).toMatch(/^\+[0-1]$/);
	await expect(live(page).getByTestId('points')).toHaveText('+2');
	await expect(live(page).locator('h2[data-testid="verdict"]')).toHaveText('Alle auf dieselbe Person');
	await expect(live(page).getByTestId('result-prompt')).toBeVisible();
	await expect(board(page).first()).toContainText('Team');
});

test('Scenario: Most Likely game over uses the winner frame', async ({ page }) => {
	await start(page);
	await seedPhase(page, { phase: 'gameOver', round: 4, lastPoints: null }, [4, 2]);
	await expectFrame(page);
	const stage = live(page).locator('[data-frame="stage"]');
	await expect(stage.getByText('Gewinner', { exact: true })).toBeVisible();
	await expect(stage.getByRole('heading', { name: 'Team 1', exact: true })).toBeVisible();
	await expect(stage.getByRole('button', { name: 'Nochmal spielen', exact: true })).toBeVisible();
	await expect(page.getByRole('region', { name: 'Punktestand' })).toHaveCount(1);
	await expect(live(page).locator('[data-frame="rail"]').getByRole('region', { name: 'Punktestand' })).toHaveCount(1);
	await expect(board(page)).toHaveText([/^1\s*Team 1\s*4\s*Alex und Cleo$/, /^2\s*Team 2\s*2\s*Bo und Dani$/]);
	const pieces = await live(page).locator('[data-piece]').count();
	expect(pieces).toBeGreaterThanOrEqual(10);
	expect(pieces).toBeLessThanOrEqual(14);
});

test('Scenario: Most Likely count choices follow the team size', async ({ page }, info) => {
	// five players deal into Team 1 of three and Team 2 of two
	await start(page, ['Alex', 'Bo', 'Cleo', 'Dani', 'Eli']);
	const sizes: Record<string, string[]> = {
		'Team 1': ['Alle verschieden', '2', '3'],
		'Team 2': ['Alle verschieden', '2']
	};
	for (let k = 0; k < 2; k++) {
		const name = await onTurn(page);
		await press(page, 'Alle haben gezeigt');
		await expect(page.getByRole('group', { name: /^Wie viele aus/ }).getByRole('button')).toHaveText(sizes[name]);
		if (k === 0) await still(page, info, 'most-likely-count');
		await choice(page, 'Alle verschieden').click();
		await press(page, k === 0 ? 'Nächstes Team' : 'Nächste Runde');
	}
});

test('Scenario: Most Likely result names the next step', async ({ page }, info) => {
	await start(page);
	const labels: string[] = [];
	for (let k = 0; k < 10; k++) {
		if (k === 0) {
			const name = await onTurn(page);
			const { prompt } = await saved(page);
			await press(page, 'Alle haben gezeigt');
			await choice(page, '2').click();
			await expect(page.getByTestId('result-prompt')).toHaveText(prompt.a);
			await expect(page.getByTestId('points')).toHaveText('+2');
			await expect(page.getByText(`Punkte für ${name}`, { exact: true })).toBeVisible();
			await still(page, info, 'most-likely-result');
			labels.push('Nächstes Team');
			await press(page, 'Nächstes Team');
		} else labels.push((await playTurn(page, 0)).label);
	}
	expect(labels).toEqual([
		...Array.from({ length: 4 }, () => ['Nächstes Team', 'Nächste Runde']).flat(),
		'Nächstes Team',
		'Zum Ergebnis'
	]);
	await expect(page.getByRole('button', { name: 'Nochmal spielen', exact: true })).toBeVisible();
});

test('Scenario: Full Most Likely team game', async ({ page }, info) => {
	const turns = 10;
	test.setTimeout(turns * 10_000);
	await start(page);
	const scores: Record<string, number> = { 'Team 1': 0, 'Team 2': 0 };
	for (let k = 0; k < turns; k++) {
		await expect(page.getByText(`Runde ${Math.floor(k / 2) + 1} / 5`, { exact: true })).toBeVisible();
		const matched = k % 2 ? 0 : 2;
		const { name } = await playTurn(page, matched);
		scores[name] += matched;
	}
	const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);

	await expect(final(page)).toHaveCount(2);
	await expect(final(page)).toHaveText(ranked.map(([name, score]) => new RegExp(`${name}\\s*${score}\\s*\\S`)));
	await expect(page.getByRole('button', { name: 'Nochmal spielen', exact: true })).toBeVisible();
	await still(page, info, 'most-likely-gameover');

	await press(page, 'Nochmal spielen');
	await onTurn(page);
	await expect(page.getByText('Runde 1 / 5', { exact: true })).toBeVisible();
	expect((await saved(page)).teams.map((t: { score: number }) => t.score)).toEqual([0, 0]);
});

// eight players deal into Team 1 and Team 2 of three and Team 3 of two
const eight = ['Alex', 'Bo', 'Cleo', 'Dani', 'Eli', 'Fynn', 'Gus', 'Hana'];

async function playTo(page: Page, plan: Record<string, number[]>) {
	const done: Record<string, number> = {};
	for (let k = 0; k < 15; k++)
		await playTurn(page, (name) => {
			const i = done[name] ?? 0;
			done[name] = i + 1;
			return plan[name][i];
		});
}

test('Scenario: Most Likely Endstand ranks teams', async ({ page }, info) => {
	// fifteen turns through the real UI
	test.setTimeout(90_000);
	await start(page, eight, 3);
	await playTo(page, {
		'Team 1': [3, 2, 0, 0, 0],
		'Team 2': [3, 3, 3, 0, 0],
		'Team 3': [2, 0, 0, 0, 0]
	});

	await expect(page.getByText('Gewinner', { exact: true })).toBeVisible();
	await expect(page.getByRole('heading', { name: 'Team 2', exact: true })).toBeVisible();
	await expect(final(page)).toHaveText([
		/^1\s*Team 2\s*9\s*Bo, Eli und Hana$/,
		/^2\s*Team 1\s*5\s*Alex, Dani und Gus$/,
		/^3\s*Team 3\s*2\s*Cleo und Fynn$/
	]);
	await expect(final(page).and(page.locator('.lead'))).toHaveCount(1);
	await still(page, info, 'most-likely-endstand');
});

test('Scenario: Most Likely tie at the top reads Unentschieden', async ({ page }, info) => {
	// fifteen turns through the real UI
	test.setTimeout(90_000);
	await start(page, eight, 3);
	await playTo(page, {
		'Team 1': [2, 2, 0, 0, 0],
		'Team 2': [2, 2, 0, 0, 0],
		'Team 3': [2, 0, 0, 0, 0]
	});

	await expect(page.getByText('Unentschieden', { exact: true })).toBeVisible();
	await expect(page.getByText('Gewinner', { exact: true })).toHaveCount(0);
	await expect(live(page).getByRole('heading', { name: 'Unentschieden', exact: true })).toBeVisible();
	await expect(live(page).getByText('Team 1 · Team 2', { exact: true })).toBeVisible();
	await expect(final(page)).toHaveText([/^1\s*Team 1\s*4/, /^2\s*Team 2\s*4/, /^3\s*Team 3\s*2/]);
	await expect(final(page).and(page.locator('.lead'))).toHaveCount(2);
	await expect(final(page).nth(2)).not.toHaveClass(/lead/);
	await still(page, info, 'most-likely-tie');
});

test('Endstand with every team at 0 highlights all of them', async ({ page }) => {
	test.setTimeout(60_000);
	await start(page);
	for (let k = 0; k < 10; k++) await playTurn(page, 0);

	await expect(page.getByText('Unentschieden', { exact: true })).toBeVisible();
	await expect(final(page)).toHaveText([/^1\s*Team \d\s*0/, /^2\s*Team \d\s*0/]);
	await expect(final(page).and(page.locator('.lead'))).toHaveCount(2);
});

test('Scenario: Most Likely session resumes after reload', async ({ page }) => {
	await start(page);
	await playTurn(page, 2);
	await playTurn(page, 0);
	const name = await onTurn(page);
	await press(page, 'Alle haben gezeigt');
	const before = await saved(page);
	expect([before.round, before.phase]).toEqual([1, 'count']);

	await page.reload();
	await expect(page.getByText('Runde 2 / 5', { exact: true })).toBeVisible();
	await expect(page.getByRole('heading', { name: `Wie viele aus ${name} haben auf dieselbe Person gezeigt?` })).toBeVisible();
	await expect(page.getByTestId('count-prompt')).toHaveText(before.prompt.a);
	await expect(board(page)).toHaveText([/2$/, /0$/]);
	await expect(page.getByRole('alert')).toHaveCount(0);
	expect(await saved(page)).toEqual(before);
});

test('Scenario: Old Most Likely session is discarded', async ({ page }) => {
	await page.goto('/');
	await seedRoster(page, names);
	await page.evaluate(() =>
		localStorage.setItem(
			'arcade:session:most-likely',
			JSON.stringify({
				v: 1,
				state: {
					rng: { state: 1 },
					players: [
						{ id: 'p1', name: 'Alex' },
						{ id: 'p2', name: 'Bo' },
						{ id: 'p3', name: 'Cleo' }
					],
					pool: [{ id: 1, a: 'Wer würde am ehesten auswandern?', b: '' }],
					used: [1],
					rounds: 5,
					round: 0,
					prompt: { id: 1, a: 'Wer würde am ehesten auswandern?', b: '' },
					chosen: [],
					titles: [0, 0, 0],
					phase: 'pick'
				}
			})
		)
	);
	await page.goto('/spiele/most-likely');

	await expect(page.getByRole('alert')).toHaveText(
		'Der gespeicherte Spielstand passte nicht mehr zu dieser Version und wurde verworfen.'
	);
	await expect(page.getByRole('button', { name: 'Weiterspielen' })).toHaveCount(0);
});

test('Scenario: Leaving Most Likely asks for confirmation', async ({ page }) => {
	await start(page);
	await press(page, 'Alle haben gezeigt');
	await expect(choice(page, '2')).toBeVisible();

	await page.getByRole('button', { name: 'Spiel beenden' }).click();
	const dialog = page.getByRole('dialog');
	await expect(dialog.getByRole('heading', { name: 'Spiel beenden?' })).toBeVisible();
	await dialog.getByRole('button', { name: 'Weiterspielen' }).click();
	await expect(page.getByRole('dialog')).toHaveCount(0);
	await expect(page).toHaveURL(/\/spiele\/most-likely\/spielen$/);
	await expect(choice(page, '2')).toBeVisible();
	expect((await saved(page)).phase).toBe('count');
});

test('Scenario: Most Likely copy reads neutral', async ({ page }) => {
	const seen: string[] = [];
	await start(page);
	for (let k = 0; k < 10; k++) {
		if (k === 1) {
			await press(page, 'Anderer Spruch');
			seen.push(await page.locator('body').innerText());
		}
		await playTurn(page, k % 2 ? 2 : 0, seen);
	}
	await expect(page.getByRole('button', { name: 'Nochmal spielen', exact: true })).toBeVisible();
	seen.push(await page.locator('body').innerText());
	await page.getByRole('button', { name: 'Spiel beenden' }).click();
	seen.push(await page.locator('body').innerText());

	expect(seen).toHaveLength(33);
	for (const text of seen) {
		expect(text).not.toContain('!');
		expect(text).not.toMatch(/\p{Extended_Pictographic}/u);
	}
});

test.describe('reduced motion', () => {
	test.use({ reducedMotion: 'reduce' });

	test('Scenario: Most Likely reduced motion is instant', async ({ page }) => {
		const click = (name: string) => live(page).getByRole('button', { name, exact: true }).evaluate((b: HTMLElement) => b.click());
		await start(page);
		await settled(page);
		await click('Alle haben gezeigt');
		await expectInstant(page);
		await click('2');
		await expectInstant(page);
		await expect(live(page).getByTestId('points')).toHaveText('+2');
		const state = await saved(page);
		const rows = await board(page).locator('.pts').allTextContents();
		expect(rows.map((r) => r.trim()).sort()).toEqual(state.teams.map((t: { score: number }) => String(t.score)).sort());
		await seedPhase(page, { phase: 'result', round: 4, turn: 1 });
		await settled(page);
		await click('Zum Ergebnis');
		await expectInstant(page);
		await expect(live(page).getByRole('button', { name: 'Nochmal spielen', exact: true })).toBeVisible();
		await expect(page.locator('[data-piece]')).toHaveCount(0);
	});
});

test('Scenario: Most Likely demo by tapping highlighted controls', async ({ page }, info) => {
	// ~0.8s per step on phone
	test.setTimeout(Math.max(60_000, demo.steps.length * 2_000));
	const server = await emptyServer(info, 'most-likely-demo');
	try {
		await page.goto(`${server.origin}/spiele/most-likely`);
		await page.getByRole('link', { name: 'Demo', exact: true }).click();
		await expect(page).toHaveURL(/\/spiele\/most-likely\/demo\?from=/);

		const expected = page.locator('[data-demo="expected"]');
		const total = demo.steps.length;
		for (let n = 1; n <= total; n++) {
			await expect(page.getByText(`Demo · Schritt ${n}/${total}`, { exact: true })).toBeVisible();
			await expect(expected).toHaveCount(1);
			const { action } = demo.steps[n - 1];
			if (action.type === 'score')
				await expect(expected).toHaveText(action.matched === 0 ? 'Alle verschieden' : String(action.matched));
			if (n === total) {
				await expect(page.getByRole('region', { name: 'Punktestand' })).toBeVisible();
				await expect(page.getByText('Gewinner', { exact: true }).or(page.getByText('Unentschieden', { exact: true }))).toBeVisible();
				await expect(expected).toHaveAttribute('data-action', 'rematch');
			}
			await expected.click();
		}
		await expect(page.getByText('Demo beendet', { exact: true })).toBeVisible();
		await expect(expected).toHaveCount(0);
	} finally {
		server.close();
	}
});

test('Scenario: Most Likely art on tile and start screen', async ({ page }) => {
	const art = async (scope: ReturnType<Page['locator']>) => {
		const deco = scope.locator('[data-deco][data-motif="most-likely"]');
		await expect(deco).toHaveCount(1);
		await expect(deco).toHaveAttribute('aria-hidden', 'true');
		const colours = await deco.evaluate((root) => {
			const pink = getComputedStyle(root).getPropertyValue('--most-likely').trim();
			const probe = document.createElement('i');
			probe.style.color = pink;
			root.append(probe);
			const want = getComputedStyle(probe).color;
			probe.remove();
			const shapes = [...root.querySelectorAll('circle, path, rect, ellipse, polygon, line')].filter(
				(el) => !el.closest('defs, pattern')
			);
			const pinkShapes = shapes.filter((el) => {
				const css = getComputedStyle(el);
				return css.fill === want || css.stroke === want;
			});
			return { shapes: shapes.length, pink: pinkShapes.length };
		});
		expect(colours.shapes).toBeGreaterThanOrEqual(1);
		expect(colours.pink).toBeGreaterThanOrEqual(3);
	};

	await page.goto('/');
	await art(page.getByRole('link', { name: /Most Likely To/ }));
	await page.goto('/spiele/most-likely');
	await art(page.locator('header').filter({ has: page.getByRole('heading', { level: 1 }) }));
	expect(await decoAudit(page)).toEqual([]);
});
