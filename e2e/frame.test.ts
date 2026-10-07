import { expect, test, type Locator, type Page } from '@playwright/test';
import { start } from '../src/lib/demo/runner.ts';
import type { DemoScript, GameDef } from '../src/lib/engine/types.ts';
import { codes } from '../src/lib/games/codes/engine.ts';
import { demo as codesDemo } from '../src/lib/games/codes/demo.ts';
import { duck } from '../src/lib/games/duck/engine.ts';
import { demo as duckDemo } from '../src/lib/games/duck/demo.ts';
import { feud } from '../src/lib/games/feud/engine.ts';
import { demo as feudDemo } from '../src/lib/games/feud/demo.ts';
import { imposter } from '../src/lib/games/imposter/engine.ts';
import { demo as imposterDemo } from '../src/lib/games/imposter/demo.ts';
import { mostLikely } from '../src/lib/games/most-likely/engine.ts';
import { demo as mostLikelyDemo } from '../src/lib/games/most-likely/demo.ts';
import { wavelength } from '../src/lib/games/wavelength/engine.ts';
import { demo as wavelengthDemo } from '../src/lib/games/wavelength/demo.ts';

type Game = [GameDef<any, any, any>, DemoScript<any, any>];

const all: Game[] = [
	[imposter, imposterDemo],
	[wavelength, wavelengthDemo],
	[codes, codesDemo],
	[duck, duckDemo],
	[mostLikely, mostLikelyDemo],
	[feud, feudDemo]
];

// a running game straight from the engine: the demo's opening state, optionally changed
async function seedSession(page: Page, [def, script]: Game, change: (s: any) => any = (s) => s) {
	await page.goto('/');
	const saved = { v: def.stateVersion, state: change(start(def, script).state) };
	await page.evaluate(([key, value]) => localStorage.setItem(key, value), [
		`arcade:session:${def.slug}`,
		JSON.stringify(saved)
	]);
}

const header = (page: Page) => page.locator('header.bar');
const status = (page: Page) => page.getByTestId('status');
const progress = (page: Page) => page.getByTestId('progress');
const demoControl = (page: Page) => page.getByRole('button', { name: 'Demo', exact: true }).or(page.getByRole('link', { name: 'Demo', exact: true }));

// the background a token paints, resolved the same way as the element's
function paints(el: Locator, token: string) {
	return el.evaluate((node, token) => {
		const probe = document.createElement('div');
		probe.style.background = `var(--${token})`;
		document.body.append(probe);
		const want = getComputedStyle(probe).backgroundColor;
		probe.remove();
		return getComputedStyle(node).backgroundColor === want;
	}, token);
}

test('Scenario: Play header has no Demo', async ({ page }) => {
	for (const game of all) {
		await seedSession(page, game);
		await page.goto(`/spiele/${game[0].slug}/spielen`);
		const end = header(page).getByRole('button', { name: 'Spiel beenden', exact: true });
		await expect(end).toBeVisible();
		expect(await paints(end, 'imposter'), game[0].slug).toBe(true);
		await expect(demoControl(page)).toHaveCount(0);
	}
});

test('Scenario: Ending asks with a red Beenden', async ({ page }) => {
	await seedSession(page, all[4]);
	await page.goto('/spiele/most-likely/spielen');
	await expect(page.getByRole('button', { name: 'Alle haben gezeigt', exact: true })).toBeVisible();

	await page.getByRole('button', { name: 'Spiel beenden', exact: true }).click();
	const dialog = page.getByRole('dialog', { name: 'Spiel beenden?' });
	await expect(dialog).toBeVisible();
	expect(await paints(dialog.getByRole('button', { name: 'Beenden', exact: true }), 'imposter')).toBe(true);
	await dialog.getByRole('button', { name: 'Weiterspielen', exact: true }).click();
	await expect(dialog).toHaveCount(0);
	await expect(page.getByRole('button', { name: 'Alle haben gezeigt', exact: true })).toBeVisible();

	await page.getByRole('button', { name: 'Spiel beenden', exact: true }).click();
	await dialog.getByRole('button', { name: 'Beenden', exact: true }).click();
	await expect(page).toHaveURL(/\/spiele\/most-likely$/);
	await expect(page.getByRole('heading', { name: 'Most Likely To', exact: true })).toBeVisible();
	await expect(page.getByText('Weiterspielen', { exact: true })).toHaveCount(0);
	expect(await page.evaluate(() => localStorage.getItem('arcade:session:most-likely'))).toBeNull();
	await page.goto('/spiele/most-likely/spielen');
	await expect(page).toHaveURL(/\/spiele\/most-likely$/);
});

test('Scenario: Discarded session shows no Demo and no status', async ({ page }) => {
	await page.goto('/');
	await page.evaluate(() => localStorage.setItem('arcade:session:wavelength', JSON.stringify({ v: 0, state: {} })));
	await page.goto('/spiele/wavelength/spielen');
	await expect(page.getByRole('alert')).toContainText('wurde verworfen');
	await expect(demoControl(page)).toHaveCount(0);
	await expect(status(page)).toHaveCount(0);
	await expect(progress(page)).toHaveCount(0);
});

test('Scenario: Status and progress in the header', async ({ page }) => {
	await seedSession(page, all[4], (s) => ({ ...s, round: 1, turn: 0, phase: 'prompt', lastPoints: null }));
	await page.goto('/spiele/most-likely/spielen');
	const line = header(page).getByTestId('status');
	await expect(line).toHaveText('Runde 2 / 5 · Team 1 / 2');
	expect(await line.evaluate((el) => getComputedStyle(el).fontFamily)).toMatch(/^"?Sora/);
	const bar = header(page).getByTestId('progress');
	const fill = await bar.evaluate((el) => {
		const after = getComputedStyle(el, '::after');
		return parseFloat(after.width) / el.getBoundingClientRect().width;
	});
	expect(fill).toBeCloseTo(0.4, 2);
	const colour = await bar.evaluate((el) => {
		const probe = document.createElement('div');
		probe.style.background = 'var(--most-likely)';
		document.body.append(probe);
		const want = getComputedStyle(probe).backgroundColor;
		probe.remove();
		return getComputedStyle(el, '::after').backgroundColor === want;
	});
	expect(colour).toBe(true);
	// the one "Runde 2 / 5" on the page is the header's
	await expect(page.getByText('Runde 2 / 5', { exact: true })).toHaveCount(1);
	await expect(header(page).getByText('Runde 2 / 5', { exact: true })).toHaveCount(1);
});

test('Scenario: Status without a total has no progress line', async ({ page }) => {
	await seedSession(page, all[0], (s) => ({ ...s, round: 2 }));
	await page.goto('/spiele/imposter/spielen');
	await expect(header(page).getByTestId('status')).toHaveText('Runde 2');
	await expect(progress(page)).toHaveCount(0);

	await page.goto('/spiele/imposter');
	await page.getByRole('link', { name: 'Demo', exact: true }).click();
	await expect(header(page).getByTestId('status')).toHaveText('Runde 1');
	for (let n = 0; n < imposterDemo.steps.length && (await status(page).textContent())?.trim() !== 'Runde 2'; n++)
		await page.locator('[data-demo="expected"]').click();
	await expect(header(page).getByTestId('status')).toHaveText('Runde 2');
	await expect(header(page).getByText('Demo', { exact: true })).toBeVisible();
	await expect(progress(page)).toHaveCount(0);
});

test('Scenario: Header wraps on a phone', async ({ page }, info) => {
	test.skip(info.project.name !== 'phone', '390px layout');
	const name = 'Die unglaublich langen Teamnamen';
	await seedSession(page, all[1], (s) => ({
		...s,
		teams: s.teams.map((t: { name: string }, i: number) => (i === s.teamIndex ? { ...t, name } : t))
	}));
	await page.goto('/spiele/wavelength/spielen');
	await expect(header(page).getByRole('heading', { name: 'Wavelength', exact: true })).toBeVisible();
	await expect(header(page).getByTestId('status')).toContainText(name);
	await expect(header(page).getByRole('button', { name: 'Spiel beenden', exact: true })).toBeVisible();
	expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
	const small = await header(page).evaluate((bar) =>
		[...bar.querySelectorAll('a[href], button')]
			.map((el) => el.getBoundingClientRect())
			.filter((r) => r.width < 44 || r.height < 44).length
	);
	expect(small).toBe(0);
});
