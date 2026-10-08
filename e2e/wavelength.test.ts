import { expect, test, type Locator, type Page } from '@playwright/test';
import { bandIs, expectFrame, expectInstant, live, seedContent, seedRoster, settled, shot } from './helpers.ts';

const players = [
	{ id: 'a', name: 'Alex' },
	{ id: 'b', name: 'Bo' },
	{ id: 'c', name: 'Cleo' },
	{ id: 'd', name: 'Dani' }
];

async function seedGuess(page: Page, dial = 90) {
	await page.goto('/');
	await page.evaluate(
		({ players, dial }) =>
			localStorage.setItem(
				'arcade:session:wavelength',
				JSON.stringify({
					v: 1,
					state: {
						rng: { state: 1 },
						pool: [{ id: 1, a: 'Kalt', b: 'Heiß' }],
						used: [1],
						teams: [
							{ name: 'Team 1', players: [players[0], players[2]], score: 0 },
							{ name: 'Team 2', players: [players[1], players[3]], score: 0 }
						],
						rounds: 1,
						roundIndex: 0,
						teamIndex: 0,
						spectrum: { id: 1, a: 'Kalt', b: 'Heiß' },
						target: 60,
						dial,
						phase: 'guess',
						lastScore: null
					}
				})
			),
		{ players, dial }
	);
	await page.goto('/spiele/wavelength/spielen');
	return page.getByRole('slider', { name: 'Zeiger' });
}

// the dial's pivot sits at (120, 120) in its 240 × 132 viewBox
async function pivot(dial: Locator) {
	const box = (await dial.boundingBox())!;
	const r = box.width / 2;
	const at = (deg: number, k = 0.8) => {
		const rad = (deg * Math.PI) / 180;
		return { x: box.x + r - k * r * Math.cos(rad), y: box.y + (box.height * 120) / 132 - k * r * Math.sin(rad) };
	};
	return { at, below: { x: box.x + box.width - 4, y: box.y + box.height - 2 } };
}

async function value(dial: Locator) {
	return Number(await dial.getAttribute('aria-valuenow'));
}

async function target(page: Page) {
	return page.evaluate(() => JSON.parse(localStorage.getItem('arcade:session:wavelength')!).state.target as number);
}

async function turn(page: Page, psychic: string, aim: (dial: Locator, target: number) => Promise<void>) {
	await expect(page.getByRole('heading', { name: `Gib das Handy an ${psychic}` })).toBeVisible();
	await page.getByRole('button', { name: 'Ziel anzeigen' }).click();

	const hold = page.getByRole('button', { name: 'Gedrückt halten' });
	await hold.hover();
	await page.mouse.down();
	await expect(page.getByRole('img', { name: /Ziel bei/ })).toBeVisible();
	await page.mouse.up();
	await expect(page.getByText('Verdeckt', { exact: true })).toBeVisible();

	await page.getByRole('button', { name: 'Verdecken' }).click();
	const dial = page.getByRole('slider', { name: 'Zeiger' });
	await aim(dial, await target(page));
	await page.getByRole('button', { name: 'Einloggen' }).click();
}

test('Scenario: Full Wavelength game', async ({ page, request }, info) => {
	await seedContent(request, 'wavelength_spectra', [
		['Kalt', 'Heiß'],
		['Leise', 'Laut'],
		['Billig', 'Teuer']
	]);
	await seedRoster(page, ['Alex', 'Bo', 'Cleo', 'Dani']);
	await page.goto('/spiele/wavelength/lobby');

	const team1 = page.getByRole('group', { name: 'Team 1' });
	const team2 = page.getByRole('group', { name: 'Team 2' });
	await expect(team1.getByRole('button')).toHaveText(['Alex', 'Cleo']);
	await expect(team2.getByRole('button')).toHaveText(['Bo', 'Dani']);
	await page.getByRole('button', { name: '1', exact: true }).click();
	await expect(page.getByRole('button', { name: '1', exact: true })).toHaveAttribute('aria-pressed', 'true');
	await shot(page, info, 'lobby-wavelength');
	await page.getByRole('button', { name: "Los geht's" }).click();
	await expect(page).toHaveURL(/\/spiele\/wavelength\/spielen$/);
	await shot(page, info, 'wavelength-prep');

	await turn(page, 'Alex', async (dial, t) => {
		await dial.focus();
		const steps = Math.round(t) - 90;
		for (let i = 0; i < Math.abs(steps); i++) await dial.press(steps > 0 ? 'ArrowRight' : 'ArrowLeft');
	});
	await expect(page.getByText('Genau getroffen.', { exact: true })).toBeVisible();
	await expect(page.getByTestId('points')).toHaveText('+4');
	await expect(page.getByRole('img', { name: /Ziel bei/ })).toBeVisible();
	await shot(page, info, 'wavelength-result');
	await page.getByRole('button', { name: 'Weiter' }).click();

	await turn(page, 'Bo', async (dial, t) => {
		await dial.focus();
		await dial.press(t > 90 ? 'Home' : 'End');
	});
	await expect(page.getByTestId('points')).toHaveText('+0');
	await expect(page.getByText('Kein Punkt.', { exact: true })).toBeVisible();
	await page.getByRole('button', { name: 'Zum Endstand' }).click();

	await expect(page.getByText('Gewinner', { exact: true })).toBeVisible();
	await expect(page.getByRole('heading', { name: 'Team 1' })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Nochmal spielen' })).toBeVisible();
	await shot(page, info, 'wavelength-gameover');
});

test('Scenario: Dial by keyboard', async ({ page }, info) => {
	const dial = await seedGuess(page);
	await dial.focus();
	await expect(dial).toHaveAttribute('aria-valuenow', '90');

	await dial.press('ArrowRight');
	await expect(dial).toHaveAttribute('aria-valuenow', '91');
	await dial.press('ArrowLeft');
	await dial.press('ArrowLeft');
	await expect(dial).toHaveAttribute('aria-valuenow', '89');
	await dial.press('End');
	await expect(dial).toHaveAttribute('aria-valuenow', '180');
	await dial.press('ArrowRight');
	await expect(dial).toHaveAttribute('aria-valuenow', '180');
	await shot(page, info, 'wavelength-guess');

	await page.reload();
	await expect(page.getByRole('slider', { name: 'Zeiger' })).toHaveAttribute('aria-valuenow', '180');
});

test('Scenario: Dial by drag', async ({ page }) => {
	const dial = await seedGuess(page);
	const { at, below } = await pivot(dial);

	const start = at(90);
	await page.mouse.move(start.x, start.y);
	await page.mouse.down();
	const mid = at(45);
	await page.mouse.move(mid.x, mid.y, { steps: 5 });
	expect(Math.abs((await value(dial)) - 45)).toBeLessThanOrEqual(2);
	await page.mouse.move(below.x, below.y, { steps: 5 });
	await page.mouse.up();
	await expect(dial).toHaveAttribute('aria-valuenow', '180');

	// the dial follows only while held
	const away = at(20);
	await page.mouse.move(away.x, away.y);
	await expect(dial).toHaveAttribute('aria-valuenow', '180');

	const touch = { pointerType: 'touch', pointerId: 7, isPrimary: true, bubbles: true };
	const from = at(160);
	const to = at(135);
	await dial.dispatchEvent('pointerdown', { ...touch, clientX: from.x, clientY: from.y });
	await dial.dispatchEvent('pointermove', { ...touch, clientX: to.x, clientY: to.y });
	await dial.dispatchEvent('pointerup', { ...touch, clientX: to.x, clientY: to.y });
	expect(Math.abs((await value(dial)) - 135)).toBeLessThanOrEqual(2);
});

test('Scenario: Tie for first shown as tie', async ({ page }, info) => {
	await page.goto('/');
	await page.evaluate(() => {
		const team = (n: number, names: string[], score: number) => ({
			name: `Team ${n}`,
			players: names.map((name) => ({ id: name, name })),
			score
		});
		localStorage.setItem(
			'arcade:session:wavelength',
			JSON.stringify({
				v: 1,
				state: {
					rng: { state: 1 },
					pool: [{ id: 1, a: 'Kalt', b: 'Heiß' }],
					used: [1],
					teams: [team(1, ['Alex', 'Bo'], 4), team(2, ['Cleo', 'Dani'], 4), team(3, ['Eli', 'Fynn'], 1)],
					rounds: 1,
					roundIndex: 0,
					teamIndex: 2,
					spectrum: { id: 1, a: 'Kalt', b: 'Heiß' },
					target: 60,
					dial: 90,
					phase: 'result',
					lastScore: 1
				}
			})
		);
	});
	await page.goto('/spiele/wavelength/spielen');
	await page.getByRole('button', { name: 'Zum Endstand' }).click();

	await expect(page.getByText('Unentschieden', { exact: true })).toBeVisible();
	await expect(page.getByText('Gewinner', { exact: true })).toHaveCount(0);
	await expect(page.getByText('Team 1 · Team 2', { exact: true })).toBeVisible();
	await shot(page, info, 'wavelength-tie');
});

const onTarget = async (dial: Locator, t: number) => {
	await dial.focus();
	const steps = Math.round(t) - 90;
	for (let i = 0; i < Math.abs(steps); i++) await dial.press(steps > 0 ? 'ArrowRight' : 'ArrowLeft');
};

const farOff = async (dial: Locator, t: number) => {
	await dial.focus();
	await dial.press(t > 90 ? 'Home' : 'End');
};

test('Scenario: Four or more players default to Versus', async ({ page }, info) => {
	await seedRoster(page, ['Alex', 'Bo', 'Cleo', 'Dani']);
	await page.goto('/spiele/wavelength/lobby');

	const mode = page.getByRole('group', { name: 'Spielmodus' });
	const koop = mode.getByRole('button', { name: 'Koop', exact: true });
	const versus = mode.getByRole('button', { name: 'Versus', exact: true });
	await expect(koop).toBeEnabled();
	await expect(versus).toBeEnabled();
	await expect(versus).toHaveAttribute('aria-pressed', 'true');
	await expect(koop).toHaveAttribute('aria-pressed', 'false');
	await expect(page.getByRole('group', { name: 'Team 1' })).toBeVisible();
	await expect(page.getByRole('group', { name: 'Team 2' })).toBeVisible();
	await expect(page.getByText('Versus braucht mind. 4 Spieler.', { exact: true })).toHaveCount(0);

	await koop.click();
	await expect(koop).toHaveAttribute('aria-pressed', 'true');
	await expect(page.getByRole('group', { name: 'Team 1' })).toHaveCount(0);
	await expect(page.getByRole('list', { name: 'Reihenfolge' }).getByRole('listitem')).toHaveText([
		/Alex/,
		/Bo/,
		/Cleo/,
		/Dani/
	]);
	await shot(page, info, 'lobby-wavelength-koop');
});

test('Scenario: Two or three players get Koop only', async ({ page }, info) => {
	for (const names of [
		['Alex', 'Bo'],
		['Alex', 'Bo', 'Cleo']
	]) {
		await seedRoster(page, names);
		await page.goto('/spiele/wavelength/lobby');

		const mode = page.getByRole('group', { name: 'Spielmodus' });
		await expect(mode.getByRole('button', { name: 'Koop', exact: true })).toHaveAttribute('aria-pressed', 'true');
		await expect(mode.getByRole('button', { name: 'Versus', exact: true })).toBeDisabled();
		await expect(page.getByText('Versus braucht mind. 4 Spieler.', { exact: true })).toBeVisible();
		await expect(page.getByRole('list', { name: 'Reihenfolge' }).getByRole('listitem')).toHaveCount(names.length);
		await expect(page.getByRole('button', { name: "Los geht's" })).toBeEnabled();
		if (names.length === 2) await shot(page, info, 'lobby-wavelength-koop-two');
	}
});

test('Scenario: Full Wavelength Koop game', async ({ page, request }, info) => {
	await seedContent(request, 'wavelength_spectra', [
		['Kalt', 'Heiß'],
		['Leise', 'Laut']
	]);
	await seedRoster(page, ['Alex', 'Bo']);
	await page.goto('/spiele/wavelength/lobby');
	await page.getByRole('button', { name: '1', exact: true }).click();
	await page.getByRole('button', { name: "Los geht's" }).click();
	await expect(page).toHaveURL(/\/spiele\/wavelength\/spielen$/);

	await expect(page.getByText('Runde 1 / 1 · Zug 1 / 2', { exact: true })).toBeVisible();
	await shot(page, info, 'wavelength-koop-prep');
	await turn(page, 'Alex', onTarget);
	await expect(page.getByTestId('points')).toHaveText('+4');
	await expect(page.getByTestId('verdict')).toHaveText('Genau getroffen.');
	await shot(page, info, 'wavelength-koop-result');
	await page.getByRole('button', { name: 'Weiter' }).click();

	await expect(page.getByText('Runde 1 / 1 · Zug 2 / 2', { exact: true })).toBeVisible();
	await turn(page, 'Bo', farOff);
	await expect(page.getByTestId('points')).toHaveText('+0');
	await page.getByRole('button', { name: 'Zum Endstand' }).click();

	await expect(page.getByText('Ergebnis', { exact: true })).toBeVisible();
	await expect(page.getByRole('heading', { name: 'Solide', exact: true })).toBeVisible();
	await expect(page.getByText('4 Punkte', { exact: true })).toBeVisible();
	await expect(page.getByText('Ø 2,0 Punkte pro Zug · 2 Züge', { exact: true })).toBeVisible();
	await expect(page.getByText('Gewinner', { exact: true })).toHaveCount(0);
	await expect(page.getByRole('button', { name: 'Nochmal spielen' })).toBeVisible();
	await shot(page, info, 'wavelength-koop-gameover');
});

test('Scenario: Koop session resumes after reload', async ({ page, request }) => {
	await seedContent(request, 'wavelength_spectra', [
		['Kalt', 'Heiß'],
		['Leise', 'Laut']
	]);
	await seedRoster(page, ['Alex', 'Bo', 'Cleo']);
	await page.goto('/spiele/wavelength/lobby');
	await page.getByRole('button', { name: "Los geht's" }).click();
	await turn(page, 'Alex', onTarget);
	await page.getByRole('button', { name: 'Weiter' }).click();

	const check = async () => {
		await expect(page.getByText('Runde 1 / 3 · Zug 2 / 3', { exact: true })).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Gib das Handy an Bo' })).toBeVisible();
		const board = page.getByRole('region', { name: 'Punktestand' });
		await expect(board.getByRole('listitem')).toHaveCount(1);
		await expect(board.getByRole('listitem')).toContainText('Gemeinsam');
		await expect(board.getByRole('listitem')).toContainText('4');
		await expect(page.getByRole('list', { name: 'Reihenfolge' }).locator('[aria-current="true"]')).toHaveText(/Bo/);
	};
	await check();
	const saved = await page.evaluate(() => localStorage.getItem('arcade:session:wavelength'));
	await page.reload();
	await check();
	await expect(page.getByText(/verworfen/)).toHaveCount(0);
	expect(await page.evaluate(() => localStorage.getItem('arcade:session:wavelength'))).toBe(saved);
});

test('Scenario: Turn verdicts read neutral', async ({ page }) => {
	for (const [dial, text] of [
		[60, 'Genau getroffen.'],
		[180, 'Kein Punkt.']
	] as const) {
		await seedGuess(page, dial);
		await page.getByRole('button', { name: 'Einloggen' }).click();
		const verdict = page.getByTestId('verdict');
		await expect(verdict).toHaveText(text);
		expect(await verdict.textContent()).not.toContain('!');
	}
});

type Seed = { phase: string; koop?: boolean; teamIndex?: number; lastScore?: number | null; scores?: [number, number]; dial?: number };

async function seedPhase(page: Page, { phase, koop = false, teamIndex = 0, lastScore = null, scores = [0, 0], dial = 90 }: Seed) {
	await page.goto('/');
	await page.evaluate(
		({ players, phase, koop, teamIndex, lastScore, scores, dial }) => {
			const team = (name: string, who: typeof players, score: number) => ({ name, players: who, score });
			localStorage.setItem(
				'arcade:session:wavelength',
				JSON.stringify({
					v: 1,
					state: {
						rng: { state: 1 },
						pool: [{ id: 1, a: 'Kalt', b: 'Heiß' }],
						used: [1],
						teams: koop
							? [team('Gemeinsam', players, scores[0])]
							: [team('Team 1', [players[0], players[2]], scores[0]), team('Team 2', [players[1], players[3]], scores[1])],
						rounds: 1,
						roundIndex: 0,
						teamIndex: koop ? 0 : teamIndex,
						...(koop ? { mode: 'koop', turn: 0 } : {}),
						spectrum: { id: 1, a: 'Kalt', b: 'Heiß' },
						target: 60,
						dial,
						phase,
						lastScore
					}
				})
			);
		},
		{ players, phase, koop, teamIndex, lastScore, scores, dial }
	);
	await page.goto('/spiele/wavelength/spielen');
	await live(page).locator('[data-frame="stage"]').waitFor();
}

const seen = (page: Page) => page.getByRole('region', { name: 'Punktestand' });

test('Scenario: Wavelength screens use the stage and rail frame', async ({ page }) => {
	const screens: Seed[] = [
		{ phase: 'prep' },
		{ phase: 'reveal' },
		{ phase: 'guess' },
		{ phase: 'result', lastScore: 4, scores: [4, 0] },
		{ phase: 'result', lastScore: 0 },
		{ phase: 'gameOver', scores: [4, 1] },
		{ phase: 'prep', koop: true },
		{ phase: 'result', koop: true, lastScore: 3, scores: [3, 0] },
		{ phase: 'gameOver', koop: true, scores: [8, 0] }
	];
	for (const screen of screens) {
		await seedPhase(page, screen);
		await expectFrame(page);
	}
	await seedPhase(page, { phase: 'reveal' });
	const hold = page.getByRole('button', { name: 'Gedrückt halten' });
	const box = (await hold.boundingBox())!;
	await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
	await page.mouse.down();
	await expect(page.getByRole('img', { name: /Ziel bei/ })).toBeVisible();
	await expectFrame(page);
	await page.mouse.up();
});

test('Scenario: Wavelength prep uses the Handoff', async ({ page }) => {
	await seedPhase(page, { phase: 'prep' });
	const handoff = live(page).getByTestId('handoff');
	await expect(handoff).toHaveCount(1);
	await expect(handoff.getByRole('heading', { name: 'Gib das Handy an Alex', exact: true })).toBeVisible();
	await expect(handoff).toContainText('Team 1 ist dran');
	await settled(page);
	expect(await bandIs(handoff, 'wavelength')).toBe(true);
	await expect(live(page).locator('[data-frame="stage"]').getByTestId('handoff')).toHaveCount(1);
	expect(await page.evaluate(() => [...document.querySelectorAll('*')].some((el) => getComputedStyle(el).position === 'fixed' && el.querySelector('[data-testid="handoff"]')))).toBe(false);
	if (page.viewportSize()!.width >= 1024) await expect(live(page).locator('[data-frame="rail"]')).toBeVisible();
	await expect(live(page).getByRole('button', { name: 'Ziel anzeigen' })).toBeVisible();
});

test('Scenario: Wavelength target uses the Reveal', async ({ page }) => {
	await seedPhase(page, { phase: 'reveal' });
	await settled(page);
	await expect(live(page).getByTestId('reveal')).toHaveCount(0);
	const box = (await live(page).getByRole('button', { name: 'Gedrückt halten' }).boundingBox())!;
	await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
	await page.mouse.down();
	await expect(live(page).getByTestId('reveal')).toBeVisible();
	await expect(live(page).getByRole('img', { name: /Ziel bei/ })).toBeVisible();
	const found = await page.evaluate(() =>
		document
			.querySelector('[data-testid="reveal"]')!
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
	await page.mouse.up();
	await expect(live(page).getByTestId('reveal')).toHaveCount(0);
	await expect(live(page).getByText('Verdeckt', { exact: true })).toBeVisible();
});

test('Scenario: Wavelength result uses the Outcome', async ({ page }) => {
	await seedPhase(page, { phase: 'guess', dial: 60 });
	await expect(live(page).getByRole('button', { name: 'Einloggen' })).toBeVisible();
	await settled(page);
	const mid = await page.evaluate(
		() =>
			new Promise<{ text: string; verdict: string }>((resolve) => {
				[...document.querySelectorAll('button')].find((b) => b.textContent?.trim() === 'Einloggen')!.click();
				requestAnimationFrame(() =>
					requestAnimationFrame(() =>
						resolve({
							text: document.querySelector('[data-testid="points"]')!.textContent!.trim(),
							verdict: document.querySelector('[data-testid="verdict"]')!.textContent!.trim()
						})
					)
				);
			})
	);
	expect(mid.verdict).toBe('Genau getroffen.');
	expect(mid.text).toMatch(/^\+[0-3]$/);
	await expect(live(page).getByTestId('points')).toHaveText('+4');
	await expect(live(page).locator('h2[data-testid="verdict"]')).toHaveText('Genau getroffen.');
	await expect(live(page).getByRole('img', { name: /Ziel bei/ })).toBeVisible();
	await expect(seen(page).getByRole('listitem').first()).toContainText('Team 1');
});

test('Scenario: Wavelength miss shows +0', async ({ page }) => {
	await seedPhase(page, { phase: 'guess', dial: 180 });
	await live(page).getByRole('button', { name: 'Einloggen' }).click();
	await expect(live(page).getByTestId('verdict')).toHaveText('Kein Punkt.');
	const points = live(page).getByTestId('points');
	await expect(points).toHaveText('+0');
	const muted = await points.evaluate((el) => {
		const probe = document.createElement('div');
		probe.style.color = 'var(--muted)';
		document.body.append(probe);
		const want = getComputedStyle(probe).color;
		probe.remove();
		return getComputedStyle(el).color === want;
	});
	expect(muted).toBe(true);
});

test('Scenario: Wavelength game over uses the winner frame', async ({ page }) => {
	await seedPhase(page, { phase: 'gameOver', scores: [4, 1] });
	await expectFrame(page);
	const stage = live(page).locator('[data-frame="stage"]');
	await expect(stage.getByText('Gewinner', { exact: true })).toBeVisible();
	await expect(stage.getByRole('heading', { name: 'Team 1', exact: true })).toBeVisible();
	await expect(stage.getByRole('button', { name: 'Nochmal spielen' })).toBeVisible();
	await expect(page.getByRole('region', { name: 'Punktestand' })).toHaveCount(1);
	await expect(live(page).locator('[data-frame="rail"]').getByRole('region', { name: 'Punktestand' })).toHaveCount(1);

	await seedPhase(page, { phase: 'gameOver', koop: true, scores: [8, 0] });
	await expect(live(page).locator('[data-frame="stage"]').getByRole('heading', { name: 'Solide', exact: true })).toBeVisible();
	await expect(live(page).locator('[data-frame="stage"]').getByText('8 Punkte', { exact: true })).toBeVisible();
	await expect(page.getByRole('region', { name: 'Punktestand' })).toHaveCount(1);
});

test('Scenario: Winner burst flies once', async ({ page }) => {
	await seedPhase(page, { phase: 'result', teamIndex: 1, lastScore: 2, scores: [0, 2] });
	await live(page).getByRole('button', { name: 'Zum Endstand' }).click();
	const again = live(page).getByRole('button', { name: 'Nochmal spielen' });
	await expect(again).toBeVisible();
	const pieces = live(page).locator('[data-piece]');
	await expect(pieces).not.toHaveCount(0);
	const count = await pieces.count();
	expect(count).toBeGreaterThanOrEqual(10);
	expect(count).toBeLessThanOrEqual(14);
	const found = await page.evaluate(() =>
		[...document.querySelectorAll<HTMLElement>('[data-stage]:not([data-leaving]) [data-piece]')].map((el) => ({
			hidden: el.closest('[aria-hidden="true"]') !== null,
			events: getComputedStyle(el).pointerEvents,
			animations: el.getAnimations().map((a) => ({
				iterations: a.effect!.getTiming().iterations,
				props: (a.effect as KeyframeEffect)
					.getKeyframes()
					.flatMap((k) => Object.keys(k))
					.filter((k) => !['offset', 'computedOffset', 'easing', 'composite'].includes(k))
			}))
		}))
	);
	for (const piece of found) {
		expect(piece.hidden).toBe(true);
		expect(piece.events).toBe('none');
		expect(piece.animations.length).toBe(1);
		expect(piece.animations[0].iterations).toBe(1);
		for (const prop of piece.animations[0].props) expect(['transform', 'opacity']).toContain(prop);
	}
	await again.click({ timeout: 2000 });
	await expect(live(page).getByRole('heading', { name: 'Gib das Handy an Alex' })).toBeVisible();
});

test.describe('reduced motion', () => {
	test.use({ reducedMotion: 'reduce' });

	test('Scenario: Winner burst off under reduced motion', async ({ page }) => {
		await seedPhase(page, { phase: 'result', teamIndex: 1, lastScore: 2, scores: [0, 2] });
		await live(page).getByRole('button', { name: 'Zum Endstand' }).evaluate((b: HTMLElement) => b.click());
		await expect(live(page).getByRole('button', { name: 'Nochmal spielen' })).toBeVisible();
		await expectInstant(page);
		await expect(page.locator('[data-piece]')).toHaveCount(0);
	});

	test('Scenario: Wavelength reduced motion is instant', async ({ page }) => {
		const click = (name: string) => live(page).getByRole('button', { name, exact: true }).evaluate((b: HTMLElement) => b.click());
		await seedPhase(page, { phase: 'prep', teamIndex: 1, scores: [1, 0] });
		await settled(page);
		await click('Ziel anzeigen');
		await expectInstant(page);
		await expect(live(page).getByRole('button', { name: 'Verdecken & Hinweis geben' })).toBeVisible();
		await click('Verdecken & Hinweis geben');
		await expectInstant(page);
		const dial = live(page).getByRole('slider', { name: 'Zeiger' });
		await dial.focus();
		for (let i = 0; i < 30; i++) await dial.press('ArrowLeft');
		await expect(dial).toHaveAttribute('aria-valuenow', '60');
		await click('Einloggen');
		await expectInstant(page);
		await expect(live(page).getByTestId('points')).toHaveText('+4', { timeout: 500 });
		const state = await page.evaluate(() => JSON.parse(localStorage.getItem('arcade:session:wavelength')!).state);
		expect(state.lastScore).toBe(4);
		const sorted = state.teams.map((t: { score: number }) => t.score).sort((a: number, b: number) => b - a);
		expect(sorted).toEqual([4, 1]);
		await expect(seen(page).locator('.pts')).toHaveText(sorted.map(String), { timeout: 500 });
		await click('Zum Endstand');
		await expectInstant(page);
		await expect(page.locator('[data-piece]')).toHaveCount(0);
	});
});
