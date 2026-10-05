import { expect, test, type Locator, type Page } from '@playwright/test';
import { seedContent, seedRoster, shot } from './helpers.ts';

const players = [
	{ id: 'a', name: 'Alex' },
	{ id: 'b', name: 'Bo' },
	{ id: 'c', name: 'Cleo' },
	{ id: 'd', name: 'Dani' }
];

async function seedGuess(page: Page) {
	await page.goto('/');
	await page.evaluate(
		(players) =>
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
						dial: 90,
						phase: 'guess',
						lastScore: null
					}
				})
			),
		players
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
	await expect(page.getByText('Volltreffer!')).toBeVisible();
	await expect(page.getByTestId('points')).toHaveText('+4');
	await expect(page.getByRole('img', { name: /Ziel bei/ })).toBeVisible();
	await shot(page, info, 'wavelength-result');
	await page.getByRole('button', { name: 'Weiter' }).click();

	await turn(page, 'Bo', async (dial, t) => {
		await dial.focus();
		await dial.press(t > 90 ? 'Home' : 'End');
	});
	await expect(page.getByTestId('points')).toHaveText('0');
	await expect(page.getByText('Daneben')).toBeVisible();
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
	await expect(page.getByRole('heading', { name: 'Team 1 & Team 2', exact: true })).toBeVisible();
	await shot(page, info, 'wavelength-tie');
});
