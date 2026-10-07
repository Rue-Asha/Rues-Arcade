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
import { expectInstant, live, settled } from './helpers.ts';

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

interface Sample {
	t: number;
	stages: number;
	leaving: { inert: boolean; hidden: string | null; cell: string; props: string[]; end: number; demo: number }[];
}

// Taps the named buttons of the live stage one after the other, a frame apart, then records every frame for
// `ms`: the stage nodes, and for each outgoing one its marks, grid cell and what its animations move.
function tapAndSample(page: Page, names: string[], ms = 500) {
	return page.evaluate(
		async ({ names, ms }) => {
			const frame = () => new Promise((ok) => requestAnimationFrame(ok));
			const t0 = performance.now();
			for (const [i, name] of names.entries()) {
				if (i) await frame();
				const live = document.querySelector('[data-stage]:not([data-leaving])')!;
				[...live.querySelectorAll('button')].find((b) => b.textContent?.trim() === name)!.click();
			}
			const samples: Sample[] = [];
			while (performance.now() - t0 < ms) {
				await frame();
				const stages = [...document.querySelectorAll<HTMLElement>('[data-stage]')];
				samples.push({
					t: performance.now() - t0,
					stages: stages.length,
					leaving: stages
						.filter((s) => s.hasAttribute('data-leaving'))
						.map((s) => ({
							inert: s.inert,
							hidden: s.getAttribute('aria-hidden'),
							cell: `${getComputedStyle(s).gridRowStart}/${getComputedStyle(s).gridColumnStart}`,
							props: s
								.getAnimations()
								.flatMap((a) => (a.effect as KeyframeEffect).getKeyframes().flatMap((k) => Object.keys(k)))
								.filter((k) => !['offset', 'computedOffset', 'easing', 'composite'].includes(k)),
							end: Math.max(0, ...s.getAnimations().map((a) => a.effect!.getComputedTiming().endTime as number)),
							demo: s.querySelectorAll('[data-demo]').length
						}))
				});
			}
			return samples;
		},
		{ names, ms }
	);
}

const mlPrompt = (s: any) => ({ ...s, round: 0, turn: 0, phase: 'prompt', lastPoints: null });

test('Scenario: Phase change fades out and rises in', async ({ page }) => {
	await seedSession(page, all[4], mlPrompt);
	await page.goto('/spiele/most-likely/spielen');
	await expect(page.locator('[data-stage]')).toHaveCount(1);
	await settled(page);
	const samples = await tapAndSample(page, ['Alle haben gezeigt']);
	const during = samples.filter((s) => s.leaving.length);
	expect(during.length).toBeGreaterThan(0);
	for (const s of during) {
		expect(s.stages).toBe(2);
		for (const out of s.leaving) {
			expect(out).toMatchObject({ inert: true, hidden: 'true', cell: '1/1', demo: 0 });
			expect(out.end).toBeLessThanOrEqual(200);
			expect(new Set(out.props)).toEqual(new Set(['opacity', 'transform']));
		}
	}
	// the last frame that still showed it, give or take one frame
	expect(during.at(-1)!.t).toBeLessThanOrEqual(200 + 20);
	expect(samples.at(-1)!.stages).toBe(1);
	await expect(live(page).getByRole('button', { name: 'Alle verschieden', exact: true })).toBeVisible();
	await expect(live(page)).toHaveCSS('grid-row-start', '1');
});

test('Scenario: Rapid taps leave at most one outgoing screen', async ({ page }) => {
	await seedSession(page, all[4], mlPrompt);
	await page.goto('/spiele/most-likely/spielen');
	await settled(page);
	const samples = await tapAndSample(page, ['Alle haben gezeigt', '2', 'Nächstes Team'], 600);
	expect(Math.max(...samples.map((s) => s.leaving.length))).toBeLessThanOrEqual(1);
	expect(samples.at(-1)!.stages).toBe(1);
	const state = await page.evaluate(() => JSON.parse(localStorage.getItem('arcade:session:most-likely')!).state);
	expect(state).toMatchObject({ phase: 'prompt', turn: 1 });
	await expect(live(page).getByRole('button', { name: 'Alle haben gezeigt', exact: true })).toBeVisible();
});

test('Scenario: Reload mid-game shows no outgoing screen', async ({ page }) => {
	await seedSession(page, all[4], mlPrompt);
	// samples every frame from the document's start
	await page.addInitScript(() => {
		const seen = ((window as any).__stages = { most: 0, leaving: 0, frames: 0 });
		const look = () => {
			seen.frames++;
			seen.most = Math.max(seen.most, document.querySelectorAll('[data-stage]').length);
			seen.leaving = Math.max(seen.leaving, document.querySelectorAll('[data-leaving]').length);
			requestAnimationFrame(look);
		};
		requestAnimationFrame(look);
	});
	await page.goto('/spiele/most-likely/spielen');
	await page.getByRole('button', { name: 'Alle haben gezeigt', exact: true }).click();
	await expect(live(page).getByRole('button', { name: 'Alle verschieden', exact: true })).toBeVisible();
	await page.reload();
	await expect(live(page).getByRole('button', { name: 'Alle verschieden', exact: true })).toBeVisible();
	await settled(page);
	const seen = await page.evaluate(() => (window as any).__stages);
	expect(seen.frames).toBeGreaterThan(5);
	expect(seen).toMatchObject({ most: 1, leaving: 0 });
});

test('Scenario: Outgoing screen carries no demo target', async ({ page }) => {
	await page.goto('/spiele/imposter');
	await page.getByRole('link', { name: 'Demo', exact: true }).click();
	await expect(page.getByText(/^Demo · Schritt 1\//)).toBeVisible();
	await settled(page);
	const found = await page.evaluate(async () => {
		const frame = () => new Promise((ok) => requestAnimationFrame(ok));
		(document.querySelector('[data-demo="expected"]') as HTMLElement).click();
		const out: { leaving: number; expected: number; inLive: boolean }[] = [];
		const t0 = performance.now();
		while (performance.now() - t0 < 300) {
			await frame();
			const expected = [...document.querySelectorAll('[data-demo="expected"]')];
			out.push({
				leaving: document.querySelectorAll('[data-leaving]').length,
				expected: expected.length,
				inLive: expected.every((e) => !e.closest('[data-stage]')!.hasAttribute('data-leaving'))
			});
		}
		return out;
	});
	expect(found.some((f) => f.leaving === 1)).toBe(true);
	for (const f of found) expect(f).toMatchObject({ expected: 1, inLive: true });
	await expect(page.getByText(/^Demo · Schritt 2\//)).toBeVisible();
	await page.locator('[data-demo="expected"]').click();
	await expect(page.getByText(/^Demo · Schritt 3\//)).toBeVisible();
});

test.describe('reduced motion', () => {
	test.use({ reducedMotion: 'reduce' });

	test('Scenario: Reduced motion phase change is instant', async ({ page }) => {
		await seedSession(page, all[4], mlPrompt);
		await page.goto('/spiele/most-likely/spielen');
		await settled(page);
		await live(page).getByRole('button', { name: 'Alle haben gezeigt', exact: true }).evaluate((b: HTMLElement) => b.click());
		await expectInstant(page);
		await expect(live(page).getByRole('button', { name: 'Alle verschieden', exact: true })).toBeVisible();
	});
});

test('Scenario: Primary action dispatches during a transition', async ({ page }) => {
	await seedSession(page, all[4], (s) => ({ ...mlPrompt(s), phase: 'count' }));
	await page.goto('/spiele/most-likely/spielen');
	await settled(page);
	await live(page).getByRole('button', { name: '2', exact: true }).click();
	await expect(page.locator('[data-leaving]')).toHaveCount(1);
	const next = live(page).getByRole('button', { name: 'Nächstes Team', exact: true });
	await next.waitFor();
	const box = (await next.boundingBox())!;
	await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
	const state = await page.evaluate(() => JSON.parse(localStorage.getItem('arcade:session:most-likely')!).state);
	expect({ phase: state.phase, turn: state.turn }).toEqual({ phase: 'prompt', turn: 1 });
	await expect(live(page).getByRole('button', { name: 'Alle haben gezeigt', exact: true })).toBeVisible();
});
