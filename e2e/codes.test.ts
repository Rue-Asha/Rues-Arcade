import { expect, test, type Locator, type Page } from '@playwright/test';
import { demo } from '../src/lib/games/codes/demo.ts';
import { ambient, decoAudit, emptyServer, expectFrame, expectInstant, live, seedRoster, settled, shot } from './helpers.ts';

const crew = (n: number) => Array.from({ length: n }, (_, i) => `Spieler ${i + 1}`);

test('Scenario: Codes teams dealt from the roster', async ({ page }, info) => {
	await seedRoster(page, crew(7));
	await page.goto('/spiele/codes/lobby');

	const team = (n: number) => page.getByRole('group', { name: `Team ${n}`, exact: true });
	await expect(team(1).getByRole('button')).toHaveCount(3);
	await expect(team(2).getByRole('button')).toHaveCount(2);
	await expect(team(3).getByRole('button')).toHaveCount(2);
	await expect(team(4)).toHaveCount(0);

	const fewer = page.getByRole('button', { name: 'Weniger Teams' });
	const more = page.getByRole('button', { name: 'Mehr Teams' });
	await expect(more).toBeDisabled();
	await expect(fewer).toBeEnabled();

	const rounds = page.getByRole('group', { name: 'Runden' }).getByRole('button');
	await expect(rounds).toHaveText(['1', '2', '3', '4', '5', '6', '7', '8']);
	await expect(rounds.filter({ hasText: /^5$/ })).toHaveAttribute('aria-pressed', 'true');
	await expect(page.getByRole('button', { name: "Los geht's" })).toBeEnabled();
	await shot(page, info, 'lobby-codes-seven');

	await fewer.click();
	await expect(team(3)).toHaveCount(0);
	await expect(fewer).toBeDisabled();
	await expect(more).toBeEnabled();
});

test('Scenario: Codes start blocked by a team below two', async ({ page }) => {
	await seedRoster(page, ['Alex', 'Bo', 'Cleo', 'Dani']);
	await page.goto('/spiele/codes/lobby');

	const hint = page.getByText('Jedes Team braucht mind. 2 Spieler.', { exact: true });
	await expect(hint).toHaveCount(0);
	await page.getByRole('group', { name: 'Team 1', exact: true }).getByRole('button', { name: 'Alex', exact: true }).click();
	await expect(page.getByRole('group', { name: 'Team 1', exact: true }).getByRole('button')).toHaveCount(1);
	await expect(page.getByRole('button', { name: "Los geht's" })).toBeDisabled();
	await expect(hint).toBeVisible();
});

test('Scenario: Codes needs four players', async ({ page }) => {
	await seedRoster(page, ['Alex', 'Bo', 'Cleo']);
	await page.goto('/spiele/codes');

	await expect(page.getByRole('button', { name: "Los geht's" })).toBeDisabled();
	await expect(page.getByText('mind. 4 Spieler')).toBeVisible();
});

test('Scenario: Codes roster above maximum asks who plays', async ({ page }) => {
	await seedRoster(page, crew(21));
	await page.goto('/spiele/codes/lobby');

	await expect(page.getByText('Wer spielt mit?', { exact: true })).toBeVisible();
	await expect(page.getByText('höchstens 20')).toBeVisible();
	await expect(page.getByRole('group', { name: 'Team 1', exact: true })).toHaveCount(0);
	const next = page.getByRole('button', { name: 'Weiter' });
	await expect(next).toBeDisabled();

	await page.getByRole('checkbox', { name: 'Spieler 21' }).uncheck();
	await expect(next).toBeEnabled();
	for (let i = 5; i <= 20; i++) await page.getByRole('checkbox', { name: `Spieler ${i}`, exact: true }).uncheck();
	await expect(next).toBeEnabled();
	await page.getByRole('checkbox', { name: 'Spieler 4', exact: true }).uncheck();
	await expect(next).toBeDisabled();
	await expect(page.getByRole('group', { name: 'Team 1', exact: true })).toHaveCount(0);
	for (let i = 4; i <= 20; i++) await page.getByRole('checkbox', { name: `Spieler ${i}`, exact: true }).check();
	await next.click();

	await expect(page.getByRole('group', { name: 'Team 5', exact: true }).getByRole('button')).toHaveCount(4);
	await expect(page.getByRole('button', { name: "Los geht's" })).toBeEnabled();
});

interface Saved {
	teamIndex: number;
	attempt: number;
	word: { a: string };
	teams: { name: string; score: number; players: { name: string }[] }[];
}

function saved(page: Page): Promise<Saved> {
	return page.evaluate(() => JSON.parse(localStorage.getItem('arcade:session:codes')!).state);
}

// Team 1 is Alex & Cleo, Team 2 Bo & Dani; in round 1 Alex and Bo explain
async function play(page: Page, rounds: number) {
	await seedRoster(page, ['Alex', 'Bo', 'Cleo', 'Dani']);
	await page.goto('/spiele/codes/lobby');
	await page.getByRole('group', { name: 'Runden' }).getByRole('button', { name: String(rounds), exact: true }).click();
	await page.getByRole('button', { name: "Los geht's" }).click();
	await expect(page).toHaveURL(/\/spiele\/codes\/spielen$/);
}

async function hold(page: Page) {
	const control = page.getByRole('button', { name: 'Gedrückt halten' });
	await control.scrollIntoViewIfNeeded();
	const box = (await control.boundingBox())!;
	await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
	await page.mouse.down();
}

const press = (page: Page, name: string | RegExp) =>
	page.getByRole('button', typeof name === 'string' ? { name, exact: true } : { name }).click();

const heading = (s: Saved) => {
	const team = s.teams[s.teamIndex];
	return `${team.name}: ${team.players[0].name} erklärt, ${team.players[1].name} rät`;
};

test('Scenario: Codes word visible only while held', async ({ page }) => {
	await play(page, 1);
	const { word } = await saved(page);
	await expect(page.getByText('Diese Runde erklären: Alex und Bo.', { exact: true })).toBeVisible();
	await expect(page.getByText(word.a, { exact: true })).toHaveCount(0);

	await hold(page);
	await expect(page.getByText(word.a, { exact: true })).toBeVisible();
	await page.mouse.up();
	await expect(page.getByText(word.a, { exact: true })).toHaveCount(0);
	await expect(page.getByText('Verdeckt', { exact: true })).toBeVisible();
});

test('Scenario: Codes play screen names team, explainer and guessers', async ({ page }) => {
	await play(page, 1);
	await press(page, 'Verdecken & raten');
	const s = await saved(page);
	const other = s.teams[1 - s.teamIndex].name;

	await expect(page.getByRole('heading', { name: heading(s), exact: true })).toBeVisible();
	await expect(page.getByRole('list', { name: 'Reihenfolge' }).getByRole('listitem')).toHaveText([
		new RegExp(s.teams[s.teamIndex].name),
		new RegExp(other)
	]);
	await expect(page.getByTestId('value')).toHaveText('3');

	await expect(page.getByText(s.word.a, { exact: true })).toHaveCount(0);
	await hold(page);
	await expect(page.getByText(s.word.a, { exact: true })).toBeVisible();
	await page.mouse.up();
});

test('Scenario: Full Codes game', async ({ page }) => {
	await play(page, 1);
	await press(page, 'Verdecken & raten');
	const first = await saved(page);
	await press(page, 'Daneben, nächstes Team');
	const second = first.teams[1 - first.teamIndex].name;
	await expect(page.getByTestId('value')).toHaveText('2');
	await press(page, /^Erraten/);

	await expect(page.getByTestId('points')).toHaveText('+2');
	await expect(page.getByText(`Punkte für ${second}`, { exact: true })).toBeVisible();
	await expect(page.getByText(first.word.a, { exact: true })).toBeVisible();
	await press(page, 'Zum Ergebnis');

	await expect(page.getByText('Gewinner', { exact: true })).toBeVisible();
	await expect(live(page).locator('[data-frame="stage"]').getByRole('heading', { name: second, exact: true })).toBeVisible();
	const board = live(page).locator('[data-frame="rail"]').getByRole('region', { name: 'Punktestand' });
	await expect(board.getByRole('listitem')).toHaveText([new RegExp(second), new RegExp(first.teams[first.teamIndex].name)]);
	await expect(page.getByRole('button', { name: 'Nochmal spielen' })).toBeVisible();
});

test('Scenario: Codes skipped round result', async ({ page }) => {
	await play(page, 1);
	await press(page, 'Verdecken & raten');
	const { word } = await saved(page);
	for (let i = 0; i < 2; i++) await press(page, 'Daneben, nächstes Team');
	await expect(page.getByRole('button', { name: 'Überspringen' })).toHaveCount(0);
	await press(page, 'Daneben, nächstes Team');
	await press(page, 'Überspringen');

	await expect(live(page).getByTestId('verdict')).toHaveText('Übersprungen');
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
	await expect(page.getByText(word.a, { exact: true })).toBeVisible();
	expect((await saved(page)).teams.map((t) => t.score)).toEqual([0, 0]);
});

test('Scenario: Codes tie shown as Unentschieden', async ({ page }) => {
	await play(page, 2);
	for (const next of ['Nächste Runde', 'Zum Ergebnis']) {
		await press(page, 'Verdecken & raten');
		await press(page, /^Erraten/);
		await press(page, next);
	}

	await expect(page.getByText('Unentschieden', { exact: true })).toBeVisible();
	await expect(page.getByText('Gewinner', { exact: true })).toHaveCount(0);
	await expect(live(page).getByText('Team 1 · Team 2', { exact: true })).toBeVisible();
	expect((await saved(page)).teams.map((t) => t.score)).toEqual([3, 3]);
});

test('Scenario: Codes screens use the stage and rail frame', async ({ page }) => {
	await play(page, 1);
	await expectFrame(page);
	await press(page, 'Verdecken & raten');
	await expectFrame(page);
	for (let i = 0; i < 3; i++) await press(page, 'Daneben, nächstes Team');
	await expect(page.getByRole('button', { name: 'Überspringen' })).toBeVisible();
	await expectFrame(page);
	await press(page, 'Überspringen');
	await expectFrame(page);
	await press(page, 'Zum Ergebnis');
	await expectFrame(page);
});

test('Scenario: Codes reveal intro uses the Handoff', async ({ page }) => {
	await play(page, 1);
	const handoff = live(page).getByTestId('handoff');
	await expect(handoff).toHaveCount(1);
	await expect(handoff.getByRole('heading', { name: 'Diese Runde erklären: Alex und Bo.', exact: true })).toBeVisible();
	await settled(page);
	const band = await handoff.locator('.band').evaluate((el) => {
		const probe = document.createElement('i');
		probe.style.background = 'var(--codes)';
		document.body.append(probe);
		const want = getComputedStyle(probe).backgroundColor;
		probe.remove();
		return getComputedStyle(el).backgroundColor === want;
	});
	expect(band).toBe(true);
	if ((page.viewportSize()?.width ?? 0) >= 1024) await expect(live(page).locator('[data-frame="rail"]')).toBeVisible();
});

test('Scenario: Codes word uses the Reveal', async ({ page }) => {
	await play(page, 1);
	const { word } = await saved(page);
	await settled(page);
	await expect(live(page).getByTestId('reveal')).toHaveCount(0);
	await hold(page);
	const reveal = live(page).getByTestId('reveal');
	await expect(reveal.getByText(word.a, { exact: true })).toBeVisible();
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
	await page.mouse.up();
	await expect(live(page).getByTestId('reveal')).toHaveCount(0);
});

test('Scenario: Scoreboard marks the acting team', async ({ page }) => {
	await play(page, 1);
	await press(page, 'Verdecken & raten');
	const s = await saved(page);
	await settled(page);
	const acting = live(page).getByRole('region', { name: 'Punktestand' }).locator('[data-acting]');
	await expect(acting).toHaveCount(1);
	await expect(acting).toContainText(s.teams[s.teamIndex].name);
	const colour = await acting.evaluate((el) => {
		const probe = document.createElement('i');
		probe.style.background = 'var(--codes)';
		document.body.append(probe);
		const want = getComputedStyle(probe).backgroundColor;
		probe.remove();
		return getComputedStyle(el, '::before').backgroundColor === want;
	});
	expect(colour).toBe(true);
	await press(page, 'Daneben, nächstes Team');
	await expect(acting).toContainText(s.teams[1 - s.teamIndex].name);
});

// records every Element.animate call so a short shake can't be missed between click and look
async function recordAnimations(page: Page) {
	await page.evaluate(() => {
		const w = window as unknown as { __anims: { tag: string; keys: string[]; transforms: string[]; iterations: number; duration: number; stage: boolean }[] };
		w.__anims = [];
		const own = Element.prototype.animate;
		Element.prototype.animate = function (this: Element, frames, options) {
			const list = Array.isArray(frames) ? frames : [];
			const timing = typeof options === 'number' ? { duration: options } : (options ?? {});
			w.__anims.push({
				tag: this.getAttribute('data-testid') ?? this.getAttribute('data-frame') ?? this.tagName,
				keys: [...new Set(list.flatMap((k) => Object.keys(k)))].filter((k) => k !== 'offset'),
				transforms: list.map((k) => String(k.transform ?? '')).filter(Boolean),
				iterations: timing.iterations ?? 1,
				duration: Number(timing.duration),
				stage: this.matches('[data-frame="stage"]')
			});
			return own.call(this, frames, options);
		};
	});
}

const recorded = (page: Page) =>
	page.evaluate(() => (window as unknown as { __anims: { tag: string; keys: string[]; transforms: string[]; iterations: number; duration: number; stage: boolean }[] }).__anims);

test('Scenario: Codes Daneben plays the fault motion', async ({ page }) => {
	await play(page, 1);
	await press(page, 'Verdecken & raten');
	await settled(page);
	await recordAnimations(page);
	await press(page, 'Daneben, nächstes Team');

	const seen = await recorded(page);
	const shake = seen.find((a) => a.stage);
	expect(shake?.keys).toEqual(['transform']);
	expect(shake?.transforms.every((t) => /^translateX\(-?[\d.]+(px)?\)$/.test(t))).toBe(true);
	const offsets = shake!.transforms.map((t) => parseFloat(t.slice(11)));
	expect(offsets.some((x) => x < 0) && offsets.some((x) => x > 0)).toBe(true);
	expect(shake?.iterations).toBe(1);
	expect(Number.isFinite(shake?.duration)).toBe(true);
	const stamp = seen.find((a) => a.tag === 'stamp');
	expect([...(stamp?.keys ?? [])].sort()).toEqual(['opacity', 'transform']);
	expect(stamp?.iterations).toBe(1);
});

test('Scenario: Codes result uses the Outcome', async ({ page }) => {
	await play(page, 1);
	await press(page, 'Verdecken & raten');
	await settled(page);
	await page.evaluate(() => {
		const w = window as unknown as { __points: string[] };
		w.__points = [];
		new MutationObserver(() => {
			const text = document.querySelector('[data-stage]:not([data-leaving]) [data-testid="points"]')?.textContent;
			if (text && w.__points.at(-1) !== text) w.__points.push(text);
		}).observe(document.body, { subtree: true, childList: true, characterData: true });
	});
	await press(page, /^Erraten/);

	await expect(live(page).getByTestId('verdict')).toHaveText('Im ersten Versuch erraten.');
	await expect(live(page).getByTestId('points')).toHaveText('+3');
	const seen = await page.evaluate(() => (window as unknown as { __points: string[] }).__points);
	expect(seen.some((t) => Number(t.slice(1)) < 3)).toBe(true);
	expect(seen.at(-1)).toBe('+3');
});

test('Scenario: Scoreboard rows move when ranks change', async ({ page }) => {
	await play(page, 1);
	await press(page, 'Verdecken & raten');
	const first = await saved(page);
	// whichever team opens, Team 2 is the one that scores and takes the lead from the tie
	if (first.teamIndex === 0) await press(page, 'Daneben, nächstes Team');
	await settled(page);
	await page.evaluate(() => {
		const w = window as unknown as { __moved: boolean };
		w.__moved = false;
		const own = Element.prototype.animate;
		Element.prototype.animate = function (this: Element, frames, options) {
			const list = Array.isArray(frames) ? frames : [];
			if (this.closest('[aria-label="Punktestand"]') && this.tagName === 'LI' && list.some((k) => 'transform' in k)) w.__moved = true;
			return own.call(this, frames, options);
		};
	});
	await press(page, /^Erraten/);

	const rows = live(page).getByRole('region', { name: 'Punktestand' }).getByRole('listitem');
	await expect(rows).toHaveText([/Team 2/, /Team 1/]);
	expect(await page.evaluate(() => (window as unknown as { __moved: boolean }).__moved)).toBe(true);
});

test('Scenario: Codes game over uses the winner frame', async ({ page }) => {
	await play(page, 1);
	await press(page, 'Verdecken & raten');
	await press(page, /^Erraten/);
	await press(page, 'Zum Ergebnis');

	const stage = live(page).locator('[data-frame="stage"]');
	await expect(stage.getByRole('heading', { level: 2 })).toHaveCount(1);
	await expect(stage.getByRole('button', { name: 'Nochmal spielen', exact: true })).toBeVisible();
	await expect(page.getByRole('region', { name: 'Punktestand' })).toHaveCount(1);
	await expect(live(page).locator('[data-frame="rail"]').getByRole('region', { name: 'Punktestand' })).toHaveCount(1);
	await settled(page);
	const pieces = live(page).locator('[data-piece]');
	await expect(pieces).toHaveCount(12);
});

test('Scenario: Codes reduced motion is instant', async ({ page }) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await play(page, 1);
	await press(page, 'Verdecken & raten');
	await expectInstant(page);
	await recordAnimations(page);
	await press(page, 'Daneben, nächstes Team');
	expect(await recorded(page)).toEqual([]);
	await press(page, /^Erraten/);
	await expect(page.getByTestId('points')).toBeVisible();
expect(await page.getByTestId('points').textContent()).toBe('+2');
	await expectInstant(page);
	await press(page, 'Zum Ergebnis');
	await expectInstant(page);
	await expect(page.locator('[data-piece]')).toHaveCount(0);
});

test('Scenario: Codes session resumes after reload', async ({ page }) => {
	await play(page, 1);
	await press(page, 'Verdecken & raten');
	await press(page, 'Daneben, nächstes Team');
	const s = await saved(page);
	await expect(page.getByRole('heading', { name: heading(s), exact: true })).toBeVisible();

	await page.reload();
	await expect(page.getByRole('heading', { name: heading(s), exact: true })).toBeVisible();
	await expect(page.getByTestId('value')).toHaveText('2');
	expect((await saved(page)).attempt).toBe(1);
	await expect(page.getByText(/gespeicherte Spielstand/)).toHaveCount(0);
});

test('Scenario: Leaving Codes asks for confirmation', async ({ page }) => {
	await play(page, 1);
	await press(page, 'Verdecken & raten');
	await press(page, 'Spiel beenden');
	const modal = page.getByRole('dialog', { name: 'Spiel beenden?' });
	await expect(modal).toBeVisible();
	await modal.getByRole('button', { name: 'Weiterspielen' }).click();
	await expect(modal).toBeHidden();
	await expect(page.getByTestId('value')).toHaveText('3');
});

test('Scenario: Codes copy reads neutral', async ({ page }) => {
	const texts: string[] = [];
	const collect = async (shown: string) => {
		await expect(page.getByText(shown, { exact: true }).first()).toBeVisible();
		texts.push(await page.evaluate(() => document.body.innerText));
	};
	await play(page, 2);
	await collect('Verdeckt');
	await hold(page);
	await collect((await saved(page)).word.a);
	await page.mouse.up();
	await press(page, 'Verdecken & raten');
	await collect('Daneben, nächstes Team');
	for (let i = 0; i < 3; i++) await press(page, 'Daneben, nächstes Team');
	await collect('Überspringen');
	await press(page, 'Überspringen');
	await collect('Übersprungen');
	await press(page, 'Nächste Runde');
	await press(page, 'Verdecken & raten');
	await press(page, 'Daneben, nächstes Team');
	await press(page, /^Erraten/);
	await collect('Zum Ergebnis');
	await press(page, 'Zum Ergebnis');
	await collect('Nochmal spielen');
	await press(page, 'Spiel beenden');
	await collect('Spiel beenden?');

	expect(texts).toHaveLength(8);
	expect(texts.filter((t) => /!|\p{Extended_Pictographic}/u.test(t))).toEqual([]);
});

// the fresh database is seeded, so the empty pool is made by deleting every word
async function emptyPool(page: Page, origin: string) {
	const api = `${origin}/api/content/codes_words`;
	const list: { id: number }[] = await (await page.request.get(api)).json();
	expect(list.length).toBeGreaterThan(0);
	// this server listens on 127.0.0.1, not the configured baseURL, so Kit's CSRF check needs the origin spelled out
	for (const { id } of list)
		expect((await page.request.delete(`${api}/${id}`, { headers: { origin } })).status()).toBe(204);
}

test('Scenario: Empty Codes pool blocks start', async ({ page }, info) => {
	const server = await emptyServer(info, 'codes');
	try {
		await emptyPool(page, server.origin);
		await page.goto(`${server.origin}/`);
		await seedRoster(page, ['Alex', 'Bo', 'Cleo', 'Dani']);
		await page.goto(`${server.origin}/spiele/codes`);

		await expect(page.getByRole('button', { name: "Los geht's" })).toBeDisabled();
		await expect(page.getByText('Für Codes gibt es noch keine Inhalte.')).toBeVisible();
		await expect(page.getByRole('link', { name: 'Inhalte hinzufügen' })).toHaveAttribute('href', '/spiele/codes/inhalte');
	} finally {
		server.close();
	}
});

test('Scenario: Anderes Wort on a pool of one word', async ({ page }, info) => {
	const server = await emptyServer(info, 'codes-one');
	try {
		await emptyPool(page, server.origin);
		const added = await page.request.post(`${server.origin}/api/content/codes_words/import`, {
			data: { text: 'Leuchtturm' },
			headers: { origin: server.origin }
		});
		expect(added.ok()).toBe(true);
		await page.goto(`${server.origin}/`);
		await seedRoster(page, ['Alex', 'Bo', 'Cleo', 'Dani']);
		await page.goto(`${server.origin}/spiele/codes/lobby`);
		await page.getByRole('button', { name: "Los geht's" }).click();

		await expect(page.getByText('Diese Runde erklären: Alex und Bo.', { exact: true })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Anderes Wort', exact: true })).toBeDisabled();
	} finally {
		server.close();
	}
});

test('Scenario: Codes demo by tapping highlighted controls', async ({ page }, info) => {
	const server = await emptyServer(info, 'codes-demo');
	try {
		await emptyPool(page, server.origin);
		await page.goto(`${server.origin}/spiele/codes`);
		await page.getByRole('link', { name: 'Demo', exact: true }).click();
		await expect(page).toHaveURL(/\/spiele\/codes\/demo\?from=/);

		await expect(page.getByText('[Demo]', { exact: true })).toBeVisible();
		await expect(page.locator('.word')).toHaveText(new RegExp(`^(${demo.content.map((w) => w.a).join('|')})$`));
		const total = demo.steps.length;
		test.setTimeout(Math.max(30_000, total * 1500 + 15_000));
		for (let n = 1; n <= total; n++) {
			await expect(page.getByText(/^Demo · Schritt \d+\/\d+$/)).toHaveText(`Demo · Schritt ${n}/${total}`);
			const expected = page.locator('[data-demo="expected"]');
			await expect(expected).toHaveCount(1);
			if (n === total) {
				await expect(page.getByText('Gewinner', { exact: true })).toBeVisible();
				await expect(page.getByRole('heading', { name: 'Team 2', exact: true })).toBeVisible();
				await expect(expected).toHaveAttribute('data-action', 'rematch');
			}
			await expected.click();
		}
		await expect(page.getByText('Demo beendet', { exact: true })).toBeVisible();
	} finally {
		server.close();
	}
});

// counts the drawn shapes of one art root and how many of them are painted in --codes
function codesArt(root: Locator) {
	return root.evaluate((el) => {
		const probe = document.createElement('i');
		probe.style.color = 'var(--codes)';
		el.append(probe);
		const codes = getComputedStyle(probe).color;
		probe.remove();
		const shapes = [...el.querySelectorAll('rect, path, circle, ellipse, line, polygon')];
		const tinted = shapes.filter((s) => [getComputedStyle(s).fill, getComputedStyle(s).stroke].includes(codes));
		return { shapes: shapes.length, tinted: tinted.length };
	});
}

test('Scenario: Codes art on tile and start screen', async ({ page }) => {
	await page.goto('/');
	const tile = page.getByRole('link', { name: /Codes/ }).locator('[data-deco][data-motif="codes"]');
	await expect(tile).toHaveCount(1);
	const onTile = await codesArt(tile);
	expect(onTile.shapes).toBeGreaterThan(0);
	expect(onTile.tinted).toBeGreaterThan(0);

	await page.goto('/spiele/codes');
	const banner = page.locator('[data-deco][data-motif="codes"]');
	await expect(banner).toHaveCount(1);
	const onStart = await codesArt(banner);
	expect(onStart.shapes).toBeGreaterThan(0);
	expect(onStart.tinted).toBeGreaterThan(0);
	expect(await decoAudit(page)).toEqual([]);
	const moving = await banner.evaluate(
		(el) => el.getAnimations({ subtree: true }).filter((a) => a.effect?.getTiming().iterations === Infinity).length
	);
	expect(moving).toBeGreaterThan(0);
});

test('Scenario: Codes art holds still under reduced motion', async ({ page }) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.goto('/spiele/codes');
	await expect(page.locator('[data-deco][data-motif="codes"]')).toHaveCount(1);
	expect(await ambient(page)).toBe(0);
});
