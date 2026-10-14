import { expect, test, type Page } from '@playwright/test';
import { slides, voteTimeline } from '../src/lib/games/clocktower/deck.ts';
import { seedRoster, settled } from './helpers.ts';

// The deck reads only localStorage (roster and count), so phone and desktop never share state.
const list = slides(9);
const M = list.length;
const at = (id: string) => list.findIndex((s) => s.id === id);
const crew = (n: number) => Array.from({ length: n }, (_, i) => `Spieler ${i + 1}`);

const stage = (page: Page) => page.getByTestId('deck-stage');
const progress = (page: Page) => page.getByTestId('deck-progress');
const slide = (page: Page) => page.locator('[data-slide]');

async function openDeck(page: Page, n = 9) {
	await seedRoster(page, crew(n));
	await page.evaluate((c) => localStorage.setItem('arcade:count:clocktower', String(c)), n);
	await page.goto('/spiele/clocktower/erklaerung');
	await expect(progress(page)).toHaveText(`1 / ${M}`);
	await settled(page);
}

async function forward(page: Page, times: number) {
	for (let i = 0; i < times; i++) {
		await page.keyboard.press('ArrowRight');
		await settled(page);
	}
}

async function box(page: Page) {
	const b = (await stage(page).boundingBox())!;
	return b;
}

test('Scenario: Deck navigation by tap, swipe and keys', async ({ page }) => {
	await openDeck(page);
	const b = await box(page);
	const y = b.y + b.height / 2;

	await page.keyboard.press('ArrowLeft');
	await expect(progress(page)).toHaveText(`1 / ${M}`);

	await page.mouse.click(b.x + b.width * 0.75, y);
	await expect(progress(page)).toHaveText(`2 / ${M}`);

	await page.keyboard.press('ArrowRight');
	await expect(progress(page)).toHaveText(`3 / ${M}`);

	await page.keyboard.press('ArrowLeft');
	await expect(progress(page)).toHaveText(`2 / ${M}`);

	await settled(page);
	await page.mouse.move(b.x + b.width * 0.75, y);
	await page.mouse.down();
	await page.mouse.move(b.x + b.width * 0.4, y, { steps: 6 });
	await page.mouse.up();
	await expect(progress(page)).toHaveText(`3 / ${M}`);

	await settled(page);
	await page.mouse.click(b.x + b.width * 0.25, y);
	await expect(progress(page)).toHaveText(`2 / ${M}`);
});

test('Scenario: Deck readable without horizontal scroll', async ({ page }, info) => {
	test.setTimeout(30_000 + M * 2_500);
	await openDeck(page);
	const { width } = page.viewportSize()!;
	const failures: string[] = [];
	for (let i = 0; i < M; i++) {
		await expect(slide(page)).toHaveCount(1);
		const id = (await slide(page).getAttribute('data-slide'))!;
		const found = await page.evaluate(() => {
			const el = document.querySelector<HTMLElement>('[data-slide]')!;
			const st = document.querySelector<HTMLElement>('[data-testid="deck-stage"]')!;
			const texts: [string, number][] = [];
			const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
			for (let node = walker.nextNode(); node; node = walker.nextNode()) {
				const parent = node.parentElement!;
				if (!(node as Text).data.trim() || !parent.checkVisibility()) continue;
				texts.push([(node as Text).data.trim().slice(0, 24), parseFloat(getComputedStyle(parent).fontSize)]);
			}
			const r = st.getBoundingClientRect();
			const overflowY = getComputedStyle(el).overflowY;
			return {
				page: document.documentElement.scrollWidth,
				sideways: Math.max(el.scrollWidth - el.clientWidth, st.scrollWidth - st.clientWidth),
				texts,
				inside: r.left >= 0 && r.right <= innerWidth && r.bottom <= innerHeight,
				fits: el.scrollHeight <= el.clientHeight + 1 || overflowY === 'auto' || overflowY === 'scroll'
			};
		});
		if (found.page > width) failures.push(`${id}: page ${found.page}px`);
		if (found.sideways > 0) failures.push(`${id}: slide scrolls sideways by ${found.sideways}px`);
		if (!found.inside) failures.push(`${id}: stage leaves the viewport`);
		if (!found.fits) failures.push(`${id}: content neither fits nor scrolls`);
		// the sheet reads at 14px on phone and 12px on desktop (one screen), every other slide at 16px or more
		const least = id !== 'sheet' ? 16 : width < 900 ? 14 : 12;
		const small = found.texts.filter(([, size]) => size < least).map(([text, size]) => `${text} ${size}px`);
		if (small.length) failures.push(`${id}: ${small.join(', ')}`);
		if (i < M - 1) await forward(page, 1);
	}
	expect(failures, info.project.name).toEqual([]);
});

test('Scenario: Deck closes to the start screen', async ({ page }) => {
	await openDeck(page);
	for (const index of [0, 11, M - 1]) {
		await page.goto('/spiele/clocktower/erklaerung');
		await expect(progress(page)).toHaveText(`1 / ${M}`);
		await settled(page);
		await forward(page, index);
		await expect(progress(page)).toHaveText(`${index + 1} / ${M}`);
		await page.getByRole('button', { name: 'Schließen', exact: true }).click();
		await expect(page).toHaveURL(/\/spiele\/clocktower$/);
		await expect(page.getByRole('heading', { name: 'Blood on the Clocktower', level: 1 })).toBeVisible();
	}
});

type Recorded = { inside: boolean; props: string[]; finite: boolean };

async function record(page: Page) {
	await page.addInitScript(() => {
		const w = window as unknown as { __anims: Recorded[] };
		w.__anims = [];
		const own = Element.prototype.animate;
		Element.prototype.animate = function (this: Element, keyframes, options) {
			const frames = Array.isArray(keyframes) ? keyframes : [];
			const props = new Set<string>();
			for (const f of frames) for (const k of Object.keys(f)) if (!['offset', 'easing', 'composite'].includes(k)) props.add(k);
			const iterations = typeof options === 'object' ? (options.iterations ?? 1) : 1;
			w.__anims.push({
				inside: this.closest('[data-testid="deck-stage"]') !== null,
				props: [...props],
				finite: Number.isFinite(iterations)
			});
			return own.call(this, keyframes, options);
		};
	});
}

for (const reduced of [false, true]) {
	test(`Scenario: Slide change animated, crossfade under reduced motion (${reduced ? 'reduced' : 'motion'})`, async ({ page }) => {
		if (reduced) await page.emulateMedia({ reducedMotion: 'reduce' });
		await record(page);
		await openDeck(page);
		await page.evaluate(() => ((window as unknown as { __anims: Recorded[] }).__anims.length = 0));
		await page.keyboard.press('ArrowRight');
		await expect(progress(page)).toHaveText(`2 / ${M}`);
		const anims = await page.evaluate(() => (window as unknown as { __anims: Recorded[] }).__anims.filter((a) => a.inside));
		// the outgoing and the incoming slide each run one
		expect(anims.length).toBeGreaterThanOrEqual(2);
		expect(anims.every((a) => a.finite)).toBe(true);
		const props = new Set(anims.flatMap((a) => a.props));
		expect(props.has('opacity')).toBe(true);
		expect(props.has('transform')).toBe(!reduced);
		await settled(page);
	});
}

test('Scenario: Deck follows the chosen count', async ({ page }) => {
	await openDeck(page, 12);
	await forward(page, at('town'));
	const nums = async () =>
		Promise.all(['townsfolk', 'outsider', 'minion', 'demon'].map((t) => page.getByTestId(`count-${t}`).innerText()));
	expect(await nums()).toEqual(['7', '2', '2', '1']);

	await page.getByRole('button', { name: 'Schließen', exact: true }).click();
	await expect(page).toHaveURL(/\/spiele\/clocktower$/);
	const less = page.getByRole('group', { name: 'Spielerzahl', exact: true }).getByRole('button', { name: 'Weniger', exact: true });
	for (let i = 0; i < 3; i++) await less.click();
	await expect(page.getByTestId('count')).toHaveText('9');
	await page.getByRole('link', { name: 'Erklärung', exact: true }).click();
	await expect(progress(page)).toHaveText(`1 / ${M}`);
	await settled(page);
	await forward(page, at('town'));
	expect(await nums()).toEqual(['5', '2', '1', '1']);
});

// slides are reached by key presses in one burst; only the end waits for the transitions
async function goTo(page: Page, from: number, to: number) {
	for (let i = from; i < to; i++) await page.keyboard.press('ArrowRight');
	await expect(progress(page)).toHaveText(`${to + 1} / ${M}`);
	await settled(page);
	return to;
}

test('Scenario: Deck explains the app', async ({ page }) => {
	test.setTimeout(30_000);
	await openDeck(page);
	let now = 0;
	for (const id of ['app-grimoire', 'app-night', 'app-show', 'app-timer', 'app-vote', 'app-end']) {
		now = await goTo(page, now, at(id));
		await expect(slide(page).getByRole('heading', { level: 2, name: list[now].title, exact: true })).toBeVisible();
		if (id === 'app-vote') {
			const tap = 'Platz antippen oder die Leertaste drücken, solange der Zeiger darauf steht.';
			await expect(slide(page).getByText(tap, { exact: true })).toBeVisible();
		}
	}
});

test('Scenario: Credits slide names the sources', async ({ page }) => {
	await openDeck(page);
	await goTo(page, 0, at('credits'));
	const credits = page.locator('[data-slide="credits"]');
	await expect(credits.getByText('game-icons.net', { exact: true })).toBeVisible();
	await expect(credits.getByText(/CC BY 3\.0/)).toBeVisible();
	await expect(credits.getByText('The Pandemonium Institute', { exact: true })).toBeVisible();
});

const sheetBox = (page: Page) => page.getByTestId('sheet');

// one evaluate: sheet, scroll extent and every entry against the container that must hold it
function sheetFit() {
	const sheet = document.querySelector<HTMLElement>('[data-testid="sheet"]')!;
	const slide = document.querySelector<HTMLElement>('[data-slide="sheet"]')!;
	const s = sheet.getBoundingClientRect();
	const items = [...sheet.querySelectorAll<HTMLElement>('li')].filter((el) => el.checkVisibility());
	const footer = sheet.querySelector('footer')!.getBoundingClientRect();
	const holders = [...sheet.querySelectorAll<HTMLElement>('.page[data-current]')];
	const escaped = items
		.filter((el) => {
			const r = el.getBoundingClientRect();
			return r.bottom > s.bottom + 0.5 || r.right > s.right + 0.5 || r.left < s.left - 0.5 || r.top < s.top - 0.5 || r.bottom > innerHeight;
		})
		.map((el) => el.querySelector('b')?.textContent);
	const overFooter = items.filter((el) => footer.height > 0 && el.getBoundingClientRect().bottom > footer.top + 0.5).map((el) => el.querySelector('b')?.textContent);
	const clipped = [sheet, slide, ...holders].filter((el) => el.scrollHeight > el.clientHeight + 1 || el.scrollWidth > el.clientWidth + 1).length;
	const h = holders[0];
	const oy = h ? getComputedStyle(h).overflowY : '';
	let smallAll = Infinity;
	const walker = document.createTreeWalker(sheet, NodeFilter.SHOW_TEXT);
	for (let node = walker.nextNode(); node; node = walker.nextNode()) {
		const parent = node.parentElement!;
		if ((node as Text).data.trim() && parent.checkVisibility()) smallAll = Math.min(smallAll, parseFloat(getComputedStyle(parent).fontSize));
	}
	return {
		holder: {
			scrolls: !!h && (oy === 'auto' || oy === 'scroll') && h.scrollHeight > h.clientHeight + 1,
			sideways: h ? h.scrollWidth - h.clientWidth : 0
		},
		page: document.documentElement.scrollWidth,
		small: smallAll,
		names: items.map((el) => el.querySelector('b')?.textContent),
		escaped,
		overFooter,
		clipped,
		footerInside: footer.bottom <= innerHeight && footer.right <= innerWidth
	};
}

// scroll each visible entry into its page and report the ones that still lie outside the viewport or the page box
function gutReach() {
	const sheet = document.querySelector<HTMLElement>('[data-testid="sheet"]')!;
	const h = sheet.querySelector<HTMLElement>('.page[data-current]')!;
	const lost: (string | null | undefined)[] = [];
	for (const el of sheet.querySelectorAll<HTMLElement>('.page[data-current] li')) {
		el.scrollIntoView({ block: 'center' });
		const r = el.getBoundingClientRect();
		const box = h.getBoundingClientRect();
		if (r.top < box.top - 0.5 || r.bottom > box.bottom + 0.5 || r.bottom > innerHeight || r.right > innerWidth) lost.push(el.querySelector('b')?.textContent);
	}
	h.scrollTop = 0;
	return lost;
}

test('Scenario: Sheet fits one desktop viewport', async ({ page }) => {
	test.skip(test.info().project.name !== 'desktop', 'desktop layout');
	await openDeck(page);
	await goTo(page, 0, at('sheet'));
	await expect(sheetBox(page)).toBeVisible();
	const fit = await page.evaluate(sheetFit);
	expect(fit.names).toHaveLength(22);
	expect(fit.escaped).toEqual([]);
	expect(fit.overFooter).toEqual([]);
	expect(fit.clipped).toBe(0);
	expect(fit.footerInside).toBe(true);
});

test('Scenario: Sheet on phone is two pages', async ({ page }) => {
	test.skip(test.info().project.name !== 'phone', 'phone layout');
	await openDeck(page);
	await goTo(page, 0, at('sheet'));
	const sheet = sheetBox(page);
	await expect(sheet).toHaveAttribute('data-page', '0');

	const gut = await page.evaluate(sheetFit);
	expect(gut.names).toHaveLength(17);
	expect(gut.small).toBeGreaterThanOrEqual(14);
	expect(gut.holder.scrolls).toBe(true);
	expect(gut.holder.sideways).toBe(0);
	expect(gut.page).toBeLessThanOrEqual(390);
	expect(await page.evaluate(gutReach)).toEqual([]);

	const b = (await sheet.boundingBox())!;
	const y = b.y + b.height / 2;
	const swipe = async (from: number, to: number) => {
		await page.mouse.move(b.x + b.width * from, y);
		await page.mouse.down();
		await page.mouse.move(b.x + b.width * to, y, { steps: 6 });
		await page.mouse.up();
	};
	await swipe(0.8, 0.2);
	await expect(sheet).toHaveAttribute('data-page', '1');
	const evil = await page.evaluate(sheetFit);
	expect(evil.names).toHaveLength(5);
	expect(evil.small).toBeGreaterThanOrEqual(14);
	expect(evil.holder.sideways).toBe(0);
	expect(evil.overFooter).toEqual([]);
	expect(evil.footerInside).toBe(true);
	expect(evil.page).toBeLessThanOrEqual(390);
	expect(await page.evaluate(gutReach)).toEqual([]);

	await swipe(0.2, 0.8);
	await expect(sheet).toHaveAttribute('data-page', '0');
	// the sheet's own swipe never moves the deck
	await expect(progress(page)).toHaveText(`${M} / ${M}`);
});

const N = 7;
const timeline = voteTimeline(N);

// the slide's looping animations, paused at `ms`; returns the properties every animation on the slide touches
async function seekVote(page: Page, ms: number) {
	return page.evaluate((to) => {
		const root = document.querySelector('[data-slide="voting"]')!;
		const own = document.getAnimations().filter((a) => root.contains((a.effect as KeyframeEffect).target));
		const props = new Set<string>();
		for (const a of own) {
			for (const k of (a.effect as KeyframeEffect).getKeyframes())
				for (const p of Object.keys(k)) if (!['offset', 'easing', 'composite', 'computedOffset'].includes(p)) props.add(p);
			if (a.effect!.getTiming().iterations === Infinity) {
				a.pause();
				a.currentTime = to;
			}
		}
		return { props: [...props], looping: own.filter((a) => a.effect!.getTiming().iterations === Infinity).length };
	}, ms);
}

// seats showing red, the count shown and the hand's angle, read from computed style
const voteState = (page: Page) =>
	page.evaluate(() => {
		const root = document.querySelector('[data-slide="voting"]')!;
		const on = (el: Element) => Number(getComputedStyle(el).opacity) > 0.5;
		const m = new DOMMatrix(getComputedStyle(root.querySelector('[data-hand]')!).transform);
		const shown = [...root.querySelectorAll('[data-n]')].filter(on).map((el) => el.textContent);
		const angle = ((Math.atan2(m.b, m.a) * 180) / Math.PI + 360) % 360;
		return { red: [...root.querySelectorAll('[data-voter]')].filter(on).length, shown, angle: Math.min(angle, 360 - angle) };
	});

test('Scenario: Voting slide sweeps and counts up', async ({ page }) => {
	await openDeck(page, N);
	await goTo(page, 0, list.findIndex((s) => s.id === 'voting'));
	await expect(page.locator('[data-slide="voting"] [data-hand]')).toBeAttached();

	const second = await seekVote(page, timeline.at[1] + 50);
	expect(second.looping).toBeGreaterThan(0);
	for (const p of second.props) expect(['transform', 'opacity'], p).toContain(p);
	expect(await voteState(page)).toMatchObject({ red: 2, shown: ['2'] });

	await seekVote(page, timeline.handMs);
	const end = await voteState(page);
	expect(end).toMatchObject({ red: 4, shown: ['4'] });
	expect(end.angle).toBeLessThan(0.5);
});

test('Scenario: Voting slide shows the end state under reduced motion', async ({ page }) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await openDeck(page, N);
	await goTo(page, 0, list.findIndex((s) => s.id === 'voting'));
	await expect(page.locator('[data-slide="voting"] [data-hand]')).toBeAttached();
	const running = await page.evaluate(() => {
		const root = document.querySelector('[data-slide="voting"]')!;
		return document.getAnimations().filter((a) => a.playState === 'running' && root.contains((a.effect as KeyframeEffect).target)).length;
	});
	expect(running).toBe(0);
	const end = await voteState(page);
	expect(end).toMatchObject({ red: 4, shown: ['4'] });
	expect(end.angle).toBeLessThan(0.5);
});
