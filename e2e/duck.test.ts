import { expect, test, type Page } from '@playwright/test';
import { decoAudit, emptyServer, expectFrame, expectInstant, live, seedRoster, settled, shot } from './helpers.ts';

const names = ['Alex', 'Bo', 'Cleo', 'Dani'];
const crew = (n: number) => Array.from({ length: n }, (_, i) => `Spieler ${i + 1}`);

const saved = (page: Page) =>
	page.evaluate(() => JSON.parse(localStorage.getItem('arcade:session:duck')!).state);

async function startGame(page: Page, target = 10) {
	await seedRoster(page, names);
	await page.goto('/spiele/duck/lobby');
	await page.getByRole('group', { name: 'Zielpunkte' }).getByRole('button', { name: String(target), exact: true }).click();
	await page.getByRole('button', { name: "Los geht's" }).click();
	await expect(page).toHaveURL(/\/spiele\/duck\/spielen$/);
}

test('Scenario: Duck lobby offers Zielpunkte', async ({ page }, info) => {
	await seedRoster(page, names);
	await page.goto('/spiele/duck/lobby');

	const target = page.getByRole('group', { name: 'Zielpunkte' });
	await expect(target.getByRole('button')).toHaveText(['10', '20', '30', '40', '50']);
	await expect(target.getByRole('button', { name: '10', exact: true })).toHaveAttribute('aria-pressed', 'true');
	await expect(target.locator('[aria-pressed="true"]')).toHaveCount(1);
	await expect(page.getByRole('button', { name: "Los geht's" })).toBeEnabled();
	await shot(page, info, 'lobby-duck');
});

test('Scenario: Duck needs four players', async ({ page }) => {
	await seedRoster(page, names.slice(0, 3));
	await page.goto('/spiele/duck');

	await expect(page.getByRole('button', { name: "Los geht's" })).toBeDisabled();
	await expect(page.getByText('mind. 4 Spieler')).toBeVisible();
});

test('Scenario: Duck roster above maximum asks who plays', async ({ page }) => {
	await seedRoster(page, crew(17));
	await page.goto('/spiele/duck/lobby');

	await expect(page.getByText('Wer spielt mit?', { exact: true })).toBeVisible();
	await expect(page.getByRole('checkbox')).toHaveCount(17);
	await expect(page.getByText(/höchstens 16/)).toBeVisible();
	const next = page.getByRole('button', { name: 'Weiter' });
	await expect(next).toBeDisabled();

	await page.getByRole('checkbox', { name: 'Spieler 17' }).uncheck();
	await expect(next).toBeEnabled();
	for (let i = 1; i <= 12; i++) await page.getByRole('checkbox', { name: `Spieler ${i}`, exact: true }).uncheck();
	await expect(next).toBeEnabled();
	await page.getByRole('checkbox', { name: 'Spieler 13', exact: true }).uncheck();
	await expect(next).toBeDisabled();
	await page.getByRole('checkbox', { name: 'Spieler 13', exact: true }).check();

	await next.click();
	await expect(page.getByRole('checkbox')).toHaveCount(0);
	await expect(page.getByRole('group', { name: 'Zielpunkte' })).toBeVisible();
});

test('Scenario: Duck target survives reload', async ({ page }) => {
	await startGame(page, 30);
	await expect(page.getByText('Ziel: 30 Punkte', { exact: true })).toBeVisible();
	const before = await saved(page);
	expect(before.target).toBe(30);
	expect(before.phase).toBe('reveal');

	await page.reload();
	await expect(page.getByText('Ziel: 30 Punkte', { exact: true })).toBeVisible();
	await expect(page.getByText(/verworfen/)).toHaveCount(0);
	const after = await saved(page);
	expect(after.phase).toBe('reveal');
	expect(after.word).toEqual(before.word);
	expect(after.players.map((p: { name: string }) => p.name)).toEqual(names);
});

const press = (page: Page, name: string) => page.getByRole('button', { name, exact: true }).click();

const card = (page: Page, name: string) =>
	page.getByRole('list', { name: 'Wertung' }).getByRole('listitem', { name, exact: true });

async function tapBox(page: Page, name: string, points: number) {
	await card(page, name)
		.getByRole('button', { name: points === 1 ? '1 Punkt' : `${points} Punkte`, exact: true })
		.click();
}

async function tapLetter(page: Page, name: string, letter: string) {
	await card(page, name).getByRole('button', { name: letter, exact: true }).click();
}

async function toScoring(page: Page) {
	await press(page, 'Wort aufdecken');
	await press(page, 'Wort spielen');
	await expect(page.getByRole('list', { name: 'Wertung' })).toBeVisible();
}

test('Scenario: Duck word revealed to everyone', async ({ page }) => {
	await startGame(page);
	const { players, chuck, word } = await saved(page);
	const holder = players[chuck].name;
	await expect(page.getByText(`Ein Reim-Match mit ${holder} bringt +2 Extrapunkte.`, { exact: true })).toBeVisible();
	await expect(page.getByText(word.a, { exact: true })).toHaveCount(0);

	await press(page, 'Wort aufdecken');
	await expect(page.getByTestId('word')).toHaveText(word.a);
	await press(page, 'Wort spielen');
	await expect(page.getByRole('list', { name: 'Wertung' }).getByRole('listitem')).toHaveCount(4);
	await expect(page.getByRole('heading', { name: word.a, exact: true })).toBeVisible();
});

test('Scenario: Duck skip can be cancelled', async ({ page }) => {
	await startGame(page);
	const { word } = await saved(page);
	await press(page, 'Wort aufdecken');
	await press(page, 'Überspringen');
	const dialog = page.getByRole('dialog', { name: 'Wort überspringen?' });
	await expect(dialog).toBeVisible();
	await dialog.getByRole('button', { name: 'Abbrechen', exact: true }).click();
	await expect(dialog).toHaveCount(0);
	await expect(page.getByTestId('word')).toHaveText(word.a);
	expect((await saved(page)).word).toEqual(word);
});

test('Scenario: Chuck shown in banner, scoring card and standings', async ({ page }) => {
	await startGame(page);
	const { players, chuck } = await saved(page);
	const holder = players[chuck].name;
	const next = players[(chuck + 1) % 4].name;

	await expect(page.getByText('Chuck the Duck', { exact: true })).toBeVisible();
	await expect(page.getByRole('heading', { name: holder, exact: true })).toBeVisible();

	await toScoring(page);
	await expect(card(page, holder).getByText('Chuck', { exact: true })).toBeVisible();
	for (const p of players.filter((_: unknown, i: number) => i !== chuck))
		await expect(card(page, p.name).getByText('Chuck', { exact: true })).toHaveCount(0);

	await press(page, 'Weiter');
	await expect(page.getByText(`Als Nächstes bekommt ${next} Chuck the Duck.`, { exact: true })).toBeVisible();
});

test('Scenario: Duck standings sorted with struck letters', async ({ page }) => {
	await startGame(page);
	await toScoring(page);
	await tapBox(page, 'Alex', 3);
	await tapBox(page, 'Cleo', 5);
	await tapBox(page, 'Dani', 1);
	await tapLetter(page, 'Bo', 'Y');
	await press(page, 'Weiter');

	const rows = live(page).getByRole('region', { name: 'Punktestand' }).getByRole('listitem');
	await expect(rows.locator('.who')).toHaveText(['Cleo', 'Alex', 'Dani', 'Bo']);
	await expect(rows.locator('.pts')).toHaveText(['5', '3', '1', '0']);
	await expect(rows.nth(3).locator('s')).toHaveText(['Y']);
	for (let i = 0; i < 3; i++) await expect(rows.nth(i).locator('s')).toHaveCount(0);
});

test('Scenario: Duck tie at the top reads Unentschieden', async ({ page }) => {
	await startGame(page);
	await toScoring(page);
	await tapBox(page, 'Alex', 10);
	await tapBox(page, 'Bo', 10);
	await tapBox(page, 'Cleo', 4);
	await tapBox(page, 'Dani', 4);
	await press(page, 'Weiter');

	await expect(live(page).getByRole('heading', { name: 'Unentschieden', exact: true })).toBeVisible();
	await expect(page.getByText('Gewinner', { exact: true })).toHaveCount(0);
	await expect(live(page).getByText('Alex · Bo', { exact: true })).toBeVisible();
	const rows = live(page).getByRole('region', { name: 'Punktestand' }).getByRole('listitem');
	await expect(rows.locator('.who')).toHaveText(['Alex', 'Bo', 'Cleo', 'Dani']);
	await expect(rows.locator('.rank')).toHaveText(['1', '1', '3', '3']);
});

test('Scenario: Full Duck game', async ({ page }) => {
	await startGame(page);
	await toScoring(page);
	await tapBox(page, 'Dani', 10);
	await tapBox(page, 'Alex', 2);
	await press(page, 'Weiter');

	await expect(page.getByText('Gewinner', { exact: true })).toBeVisible();
	await expect(live(page).getByRole('heading', { name: 'Dani', exact: true })).toBeVisible();
	await expect(page.getByText('Zielpunktzahl von 10 erreicht.', { exact: true })).toBeVisible();
	await expect(live(page).getByRole('region', { name: 'Punktestand' }).locator('.who')).toHaveText(['Dani', 'Alex', 'Bo', 'Cleo']);

	await press(page, 'Neue Runde');
	await expect(page.getByRole('button', { name: 'Wort aufdecken' })).toBeVisible();
	const board = live(page).getByRole('region', { name: 'Punktestand' }).getByRole('listitem');
	await expect(board.locator('.who')).toHaveText(names);
	await expect(board.locator('.pts')).toHaveText(['0', '0', '0', '0']);
	await expect(board.locator('s')).toHaveCount(0);
	const s = await saved(page);
	expect(s.phase).toBe('reveal');
	expect(s.scores).toEqual([0, 0, 0, 0]);
	expect(s.lives).toEqual([5, 5, 5, 5]);
});

const wide = (page: Page) => (page.viewportSize()?.width ?? 0) >= 1024;

// Wertung stacks four player cards of 44px controls, so on a phone its Weiter button can't sit in the first
// viewport; everything else the frame promises still has to hold there.
async function expectScoringFrame(page: Page) {
	if (wide(page)) return expectFrame(page);
	await settled(page);
	const found = await page.evaluate(() => {
		const root = document.querySelector('[data-stage]:not([data-leaving])')!;
		const stage = root.querySelector<HTMLElement>('[data-frame="stage"]')!;
		const rail = root.querySelector<HTMLElement>('[data-frame="rail"]');
		const actions = stage.querySelector('[data-frame="actions"]');
		return {
			heroes: stage.querySelectorAll('[data-hero]').length,
			lastIsActions: stage.lastElementChild === actions,
			railBelow: !!rail && rail.getBoundingClientRect().top >= stage.getBoundingClientRect().bottom - 1,
			scrollsSideways: document.documentElement.scrollWidth > innerWidth
		};
	});
	expect(found).toEqual({ heroes: 1, lastIsActions: true, railBelow: true, scrollsSideways: false });
}

test('Scenario: Duck screens use the stage and rail frame', async ({ page }) => {
	await startGame(page);
	await expectFrame(page);
	await press(page, 'Wort aufdecken');
	await expectFrame(page);
	await press(page, 'Wort spielen');
	await expectScoringFrame(page);
	await tapBox(page, 'Alex', 3);
	await press(page, 'Weiter');
	await expect(page.getByRole('button', { name: 'Nächstes Wort' })).toBeVisible();
	await expectFrame(page);
	await press(page, 'Nächstes Wort');
	await toScoring(page);
	await tapBox(page, 'Dani', 10);
	await press(page, 'Weiter');
	await expect(live(page).getByRole('button', { name: 'Neue Runde' })).toBeVisible();
	await expectFrame(page);
});

test('Scenario: Duck word uses the Reveal', async ({ page }) => {
	await startGame(page);
	const { word } = await saved(page);
	await settled(page);
	await expect(live(page).getByTestId('covered')).toHaveCount(1);
	await expect(live(page).getByTestId('reveal')).toHaveCount(0);
	await press(page, 'Wort aufdecken');
	const reveal = live(page).getByTestId('reveal');
	await expect(reveal.getByTestId('word')).toHaveText(word.a);
	await expect(live(page).getByTestId('covered')).toHaveCount(0);
	const odd = await reveal.evaluate((el) =>
		el.getAnimations({ subtree: true }).flatMap((a) => {
			const t = a.effect!.getTiming();
			const keys = (a.effect as KeyframeEffect).getKeyframes().flatMap((k) => Object.keys(k));
			const bad = keys.filter((k) => !['offset', 'easing', 'composite', 'computedOffset', 'transform', 'opacity'].includes(k));
			return t.iterations === 1 && Number.isFinite(t.duration as number) && !bad.length ? [] : [`${t.iterations} ${keys}`];
		})
	);
	expect(odd).toEqual([]);
	const props = await reveal.evaluate((el) =>
		el.getAnimations({ subtree: true }).map((a) => ({
			duration: a.effect!.getTiming().duration,
			keys: (a.effect as KeyframeEffect).getKeyframes().flatMap((k) => Object.keys(k))
		}))
	);
	expect(props.some((a) => a.duration === 560 && a.keys.includes('transform'))).toBe(true);
	expect(props.some((a) => a.duration === 1120 && a.keys.includes('transform'))).toBe(true);
});

async function recordAnimations(page: Page) {
	await page.evaluate(() => {
		const w = window as unknown as { __anims: { tag: string; keys: string[]; iterations: number; duration: number; card: boolean }[] };
		w.__anims = [];
		const own = Element.prototype.animate;
		Element.prototype.animate = function (this: Element, frames, options) {
			const list = Array.isArray(frames) ? frames : [];
			const timing = typeof options === 'number' ? { duration: options } : (options ?? {});
			w.__anims.push({
				tag: this.getAttribute('data-testid') ?? this.tagName,
				keys: [...new Set(list.flatMap((k) => Object.keys(k)))].filter((k) => k !== 'offset'),
				iterations: timing.iterations ?? 1,
				duration: Number(timing.duration),
				card: this.matches('[aria-label="Wertung"] > li')
			});
			return own.call(this, frames, options);
		};
	});
}

const recorded = (page: Page) =>
	page.evaluate(
		() => (window as unknown as { __anims: { tag: string; keys: string[]; iterations: number; duration: number; card: boolean }[] }).__anims
	);

test('Scenario: Duck letter loss plays the fault motion', async ({ page }) => {
	await startGame(page);
	await toScoring(page);
	await settled(page);
	await recordAnimations(page);
	await tapLetter(page, 'Bo', 'Y');

	const seen = await recorded(page);
	const shake = seen.find((a) => a.card);
	expect(shake?.keys).toEqual(['transform']);
	expect(shake?.iterations).toBe(1);
	expect(Number.isFinite(shake?.duration)).toBe(true);
	const stamp = seen.find((a) => a.tag === 'stamp');
	expect([...(stamp?.keys ?? [])].sort()).toEqual(['opacity', 'transform']);
	expect(stamp?.iterations).toBe(1);

	await recordAnimations(page);
	await tapLetter(page, 'Bo', 'Y');
	expect(await recorded(page)).toEqual([]);
});

test('Scenario: Duck game over uses the winner frame', async ({ page }) => {
	await startGame(page);
	await toScoring(page);
	await tapBox(page, 'Dani', 10);
	await press(page, 'Weiter');

	const stage = live(page).locator('[data-frame="stage"]');
	await expect(stage.getByRole('heading', { level: 2 })).toHaveCount(1);
	await expect(stage.getByRole('heading', { name: 'Dani', exact: true })).toBeVisible();
	await expect(stage.getByText('Zielpunktzahl von 10 erreicht.', { exact: true })).toBeVisible();
	await expect(stage.getByRole('button', { name: 'Neue Runde', exact: true })).toBeVisible();
	await expect(page.getByRole('region', { name: 'Punktestand' })).toHaveCount(1);
	await expect(live(page).locator('[data-frame="rail"]').getByRole('region', { name: 'Punktestand' })).toHaveCount(1);
	await settled(page);
	await expect(live(page).locator('[data-piece]')).toHaveCount(12);
});

test('Scenario: Duck reduced motion is instant', async ({ page }) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await startGame(page);
	await press(page, 'Wort aufdecken');
	await expectInstant(page);
	await press(page, 'Wort spielen');
	await expectInstant(page);
	await recordAnimations(page);
	await tapLetter(page, 'Bo', 'Y');
	expect(await recorded(page)).toEqual([]);
	await tapBox(page, 'Dani', 10);
	await press(page, 'Weiter');
	await expectInstant(page);
	await expect(page.locator('[data-piece]')).toHaveCount(0);
});

test('Scenario: Duck session resumes after reload', async ({ page }) => {
	await startGame(page);
	await toScoring(page);
	await tapBox(page, 'Bo', 3);
	await tapLetter(page, 'Cleo', 'K');
	const before = await saved(page);

	const check = async () => {
		await expect(card(page, 'Bo').locator('.total')).toHaveText('3/10');
		await expect(card(page, 'Bo').getByRole('button', { name: '3 Punkte', exact: true })).toHaveAttribute('aria-pressed', 'true');
		await expect(card(page, 'Cleo').locator('s')).toHaveText(['K', 'Y']);
		await expect(card(page, before.players[before.chuck].name).getByText('Chuck', { exact: true })).toBeVisible();
	};
	await check();
	await page.reload();
	await check();
	await expect(page.getByText(/verworfen/)).toHaveCount(0);
	expect(await saved(page)).toEqual(before);
});

test('Scenario: Leaving Duck asks for confirmation', async ({ page }) => {
	await startGame(page);
	await toScoring(page);
	await press(page, 'Spiel beenden');
	const dialog = page.getByRole('dialog', { name: 'Spiel beenden?' });
	await expect(dialog).toBeVisible();
	await dialog.getByRole('button', { name: 'Weiterspielen', exact: true }).click();
	await expect(dialog).toHaveCount(0);
	await expect(page.getByRole('list', { name: 'Wertung' })).toBeVisible();
	expect((await saved(page)).phase).toBe('scoring');
});

test('Scenario: Duck copy reads neutral', async ({ page }) => {
	const texts: string[] = [];
	const collect = async () => texts.push(await page.locator('body').innerText());

	await seedRoster(page, names);
	await page.goto('/spiele/duck');
	await collect();
	await page.goto('/spiele/duck/lobby');
	await collect();
	await press(page, "Los geht's");
	await collect();
	await press(page, 'Überspringen');
	await collect();
	await page.getByRole('dialog').getByRole('button', { name: 'Abbrechen', exact: true }).click();
	await press(page, 'Wort aufdecken');
	await collect();
	await press(page, 'Wort spielen');
	await tapBox(page, 'Alex', 3);
	await tapLetter(page, 'Bo', 'U');
	await collect();
	await press(page, 'Weiter');
	await collect();
	await press(page, 'Nächstes Wort');
	await toScoring(page);
	await tapBox(page, 'Cleo', 10);
	await press(page, 'Weiter');
	await expect(page.getByText('Gewinner', { exact: true })).toBeVisible();
	await collect();

	expect(texts).toHaveLength(8);
	for (const text of texts) {
		expect(text).not.toContain('!');
		expect(text).not.toMatch(/\p{Extended_Pictographic}/u);
	}
});

test('Scenario: Duck demo by tapping highlighted controls', async ({ page }, info) => {
	test.setTimeout(90_000);
	const server = await emptyServer(info, 'duck-demo');
	try {
		// a fresh database holds the seeded words, the demo must not need any of them; Kit's CSRF check wants
		// the Origin on a DELETE to another host
		const api = `${server.origin}/api/content/duck_words`;
		for (const { id } of await (await page.request.get(api)).json())
			expect((await page.request.delete(`${api}/${id}`, { headers: { origin: server.origin } })).ok()).toBe(true);
		expect(await (await page.request.get(api)).json()).toEqual([]);
		await page.goto(`${server.origin}/spiele/duck`);
		await page.getByRole('link', { name: 'Demo', exact: true }).click();
		await expect(page).toHaveURL(/\/spiele\/duck\/demo\?from=/);

		const progress = page.getByText(/^Demo · Schritt \d+\/\d+$/);
		const total = Number((await progress.textContent())!.split('/').at(-1));
		expect(total).toBeGreaterThan(20);
		for (let n = 1; n <= total; n++) {
			await expect(progress).toHaveText(`Demo · Schritt ${n}/${total}`);
			const expected = page.locator('[data-demo="expected"]');
			await expect(expected).toHaveCount(1);
			if (n === 9) await shot(page, info, 'duck-demo-scoring');
			if (n === total) {
				await expect(page.getByText('Gewinner', { exact: true })).toBeVisible();
				await expect(page.getByText('Zielpunktzahl von 10 erreicht.', { exact: true })).toBeVisible();
				await expect(expected).toHaveText('Neue Runde');
			}
			await expected.click();
		}
		await expect(page.getByText('Demo beendet', { exact: true })).toBeVisible();
		await expect(page.locator('[data-demo="expected"]')).toHaveCount(0);
		const rows = live(page).getByRole('region', { name: 'Punktestand' }).getByRole('listitem');
		await expect(rows.locator('.who')).toHaveText(['Alex', 'Bo', 'Cleo', 'Dani']);
		await expect(rows.locator('.pts')).toHaveText(['0', '0', '0', '0']);
	} finally {
		server.close();
	}
});

test('Scenario: Duck art on tile and start screen', async ({ page }) => {
	await seedRoster(page, names);
	const DUCK = 'rgb(255, 159, 67)';
	const drawn = (art: ReturnType<Page['locator']>) =>
		art.evaluate((root) => {
			const shapes = [...root.querySelectorAll('path, circle, ellipse, rect, polygon, line')];
			const own = shapes.filter((s) => !s.closest('pattern'));
			const colours = own.flatMap((s) => [getComputedStyle(s).fill, getComputedStyle(s).stroke]);
			return { shapes: own.length, colours };
		});

	await page.goto('/');
	const tile = page.getByRole('link', { name: /What Rhymes with Duck/ }).locator('[data-deco][data-motif="duck"]');
	await expect(tile).toHaveCount(1);
	await expect(tile).toHaveAttribute('aria-hidden', 'true');
	const onTile = await drawn(tile);
	expect(onTile.shapes).toBeGreaterThan(0);
	expect(onTile.colours).toContain(DUCK);
	expect(await decoAudit(page)).toEqual([]);

	await page.goto('/spiele/duck');
	const banner = page.locator('header').filter({ has: page.getByRole('heading', { level: 1 }) });
	const art = banner.locator('[data-deco][data-motif="duck"]');
	await expect(art).toHaveCount(1);
	await expect(art).toHaveAttribute('aria-hidden', 'true');
	const onStart = await drawn(art);
	expect(onStart.shapes).toBeGreaterThan(0);
	await expect(art.getByText('Haus', { exact: true })).toBeAttached();
	await expect(art.getByText('Maus', { exact: true })).toBeAttached();
	expect(onStart.colours).toContain(DUCK);
	expect(await decoAudit(page)).toEqual([]);
});
