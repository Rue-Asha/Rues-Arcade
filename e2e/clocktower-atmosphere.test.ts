import { expect, test, type Page } from '@playwright/test';
import { clocktower } from '../src/lib/games/clocktower/engine.ts';
import { F7, seated } from '../src/lib/games/clocktower/fixtures.ts';
import type { ClocktowerAction, ClocktowerState } from '../src/lib/games/clocktower/types.ts';
import { play, seedClocktower } from './clocktower-session.ts';
import { decoAudit, live, seedRoster, settled } from './helpers.ts';
import { day1, toDawn } from './walks/clocktower-day.ts';

const crew = (n: number) => Array.from({ length: n }, (_, i) => `Spieler ${i + 1}`);
const next = (n: number): ClocktowerAction[] => Array.from({ length: n }, () => ({ type: 'next' }));
const reveal = (s: ClocktowerState) => play(s, s.seats.flatMap((): ClocktowerAction[] => [{ type: 'show' }, { type: 'hide' }]));
const heading = (page: Page, name: string | RegExp) => live(page).getByRole('heading', { name });
const weiter = (page: Page) => live(page).getByRole('button', { name: 'Weiter', exact: true });

async function lobby(page: Page) {
	await seedRoster(page, crew(5));
	await page.goto('/spiele/clocktower/lobby');
	await expect(page.getByRole('button', { name: 'Spiel starten', exact: true })).toBeVisible();
}

async function open(page: Page, state: ClocktowerState, ready: () => Promise<void>) {
	await seedRoster(page, crew(state.seats.length));
	await seedClocktower(page, state);
	await page.goto('/spiele/clocktower/spielen');
	await ready();
	await settled(page);
}

const setupBoard = () =>
	clocktower.init({ players: crew(7).map((name, i) => ({ id: `p${i}`, name })), config: {}, content: [], seed: 5 });

const NIGHT = {
	lobby: lobby,
	setup: (page: Page) => open(page, setupBoard(), () => expect(heading(page, 'Sitzordnung')).toBeVisible()),
	reveal: (page: Page) =>
		open(page, seated(F7), () => expect(live(page).getByRole('button', { name: 'Rolle zeigen', exact: true })).toBeVisible()),
	wake: (page: Page) =>
		open(page, play(reveal(seated(F7)), next(1)), () => expect(heading(page, /^Wecke /)).toBeVisible()),
	circle: async (page: Page) => {
		await NIGHT.wake(page);
		await weiter(page).click();
		await weiter(page).click();
		await expect(live(page).getByTestId('show-bar')).toBeVisible();
		await settled(page);
	}
};

const DAY = {
	dawn: (page: Page) => open(page, toDawn(seated(F7)), () => expect(heading(page, 'Alle aufwachen')).toBeVisible()),
	grimoire: (page: Page) =>
		open(page, day1(seated(F7)), () => expect(live(page).getByRole('button', { name: 'Tag beenden', exact: true })).toBeVisible())
};

// what the sky shows in the viewport: an element counts when it is not hidden by display, visibility or opacity and
// its box meets the viewport after every clipping ancestor
function skyState() {
	const sky = [...document.querySelectorAll<HTMLElement>('[data-deco][data-motif="sky"]')];
	const shown = (el: Element) => {
		if (!el.checkVisibility({ opacityProperty: true, visibilityProperty: true })) return false;
		let box = el.getBoundingClientRect();
		let [left, top, right, bottom] = [Math.max(0, box.left), Math.max(0, box.top), Math.min(innerWidth, box.right), Math.min(innerHeight, box.bottom)];
		for (let p = el.parentElement; p; p = p.parentElement) {
			const { overflowX, overflowY } = getComputedStyle(p);
			if (overflowX === 'visible' && overflowY === 'visible') continue;
			box = p.getBoundingClientRect();
			[left, top, right, bottom] = [Math.max(left, box.left), Math.max(top, box.top), Math.min(right, box.right), Math.min(bottom, box.bottom)];
		}
		return right > left && bottom > top;
	};
	const count = (sel: string) => sky.flatMap((s) => [...s.querySelectorAll(sel)]).filter(shown).length;
	return {
		layers: sky.length,
		stars: count('[data-star]'),
		moon: count('[data-moon]'),
		sun: count('[data-sun]'),
		text: sky.map((s) => s.textContent!.trim()).join('')
	};
}

const sky = (page: Page) => page.evaluate(skyState);

// Every visible text node against the first opaque background behind it, translucent layers composited.
function contrastFailures() {
	type RGBA = [number, number, number, number];
	const parse = (c: string): RGBA => {
		const [r, g, b, a = 1] = c.match(/[\d.]+/g)!.map(Number);
		return [r, g, b, a];
	};
	const over = ([r, g, b, a]: RGBA, [R, G, B]: RGBA): RGBA => [r * a + R * (1 - a), g * a + G * (1 - a), b * a + B * (1 - a), 1];
	const lum = (c: RGBA) => {
		const [r, g, b] = c.slice(0, 3).map((v) => {
			const s = v / 255;
			return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
		});
		return 0.2126 * r + 0.7152 * g + 0.0722 * b;
	};
	const background = (el: Element | null): RGBA => {
		const layers: RGBA[] = [];
		for (; el; el = el.parentElement) {
			const c = parse(getComputedStyle(el).backgroundColor);
			if (c[3] > 0) layers.push(c);
			if (c[3] >= 1) break;
		}
		let bg: RGBA = layers.at(-1)?.[3] === 1 ? layers.pop()! : parse(getComputedStyle(document.body).backgroundColor);
		for (const layer of layers.reverse()) bg = over(layer, bg);
		return bg;
	};
	const out: string[] = [];
	const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
	for (let node = walker.nextNode(); node; node = walker.nextNode()) {
		const el = node.parentElement!;
		if (!(node as Text).data.trim() || !el.checkVisibility({ opacityProperty: true, visibilityProperty: true })) continue;
		if (el.closest(':disabled')) continue;
		const bg = background(el);
		const fg = over(parse(getComputedStyle(el).color), bg);
		const [hi, lo] = [lum(fg), lum(bg)].sort((x, y) => y - x);
		const ratio = (hi + 0.05) / (lo + 0.05);
		if (ratio < 4.5) out.push(`"${(node as Text).data.trim().slice(0, 30)}" ${ratio.toFixed(2)}`);
	}
	return out;
}

// scrolls each control to the middle and asks which element sits at its centre
function coveredControls() {
	const out: string[] = [];
	for (const el of document.querySelectorAll<HTMLElement>('a[href], button, input, select, textarea, [role="slider"]')) {
		if (!el.checkVisibility() || el.closest('[data-deco]')) continue;
		const label = (el as HTMLInputElement).labels?.[0];
		const target = label && el.getBoundingClientRect().width < 44 ? label : el;
		target.scrollIntoView({ block: 'center', inline: 'center' });
		const box = target.getBoundingClientRect();
		const hit = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
		if (!hit || !(target.contains(hit) || hit.contains(target)))
			out.push(`${el.getAttribute('aria-label') || el.textContent?.trim().slice(0, 30) || el.tagName} under ${hit?.tagName}.${hit?.getAttribute('class')}`);
	}
	scrollTo(0, 0);
	return out;
}

const SKY_ALLOWED = new Set(['transform', 'opacity', 'offset', 'easing', 'composite', 'computedOffset']);

// infinite animations that run on an element inside the sky, with the properties their keyframes touch
function skyLoops() {
	return document
		.getAnimations()
		.filter((a) => a.effect?.getTiming().iterations === Infinity && a.playState === 'running')
		.filter((a) => (a.effect as KeyframeEffect).target?.closest('[data-deco][data-motif="sky"]'))
		.map((a) => [...new Set((a.effect as KeyframeEffect).getKeyframes().flatMap((k) => Object.keys(k)))]);
}

test('Scenario: Night sky in the lobby and at night', async ({ page }) => {
	for (const [name, show] of Object.entries(NIGHT)) {
		await show(page);
		await expect.poll(() => sky(page), name).toMatchObject({ layers: 1, moon: 1, sun: 0 });
		expect((await sky(page)).stars, name).toBeGreaterThanOrEqual(5);
		expect(await decoAudit(page), name).toEqual([]);
		await expect(page.locator('html'), name).toHaveAttribute('data-variant', 'night');
	}
});

test('Scenario: Sun on the day screens', async ({ page }) => {
	for (const [name, show] of Object.entries(DAY)) {
		await show(page);
		await expect(page.locator('html'), name).toHaveAttribute('data-variant', 'day');
		await expect.poll(() => sky(page), name).toMatchObject({ layers: 1, sun: 1, moon: 0, stars: 0 });
		expect(await decoAudit(page), name).toEqual([]);
	}
});

test('Scenario: Atmosphere keeps every screen legible', async ({ page }) => {
	const foreign: string[] = [];
	page.on('request', (req) => {
		const url = new URL(req.url());
		if (/^https?:$/.test(url.protocol) && url.hostname !== 'localhost' && url.hostname !== '127.0.0.1') foreign.push(req.url());
	});
	const screens = { lobby: NIGHT.lobby, setup: NIGHT.setup, circle: NIGHT.circle, ...DAY };
	for (const [name, show] of Object.entries(screens)) {
		await show(page);
		await expect.poll(async () => { const s = await sky(page); return s.layers === 1 && s.stars + s.moon + s.sun > 0; }, name).toBe(true);
		expect((await sky(page)).text, `${name}: sky holds text`).toBe('');
		expect(await page.evaluate(contrastFailures), `${name}: contrast`).toEqual([]);
		expect(await page.evaluate(coveredControls), `${name}: covered controls`).toEqual([]);
		const width = await page.evaluate(() => document.documentElement.scrollWidth);
		expect(width, name).toBeLessThanOrEqual(page.viewportSize()!.width);
	}
	expect(foreign).toEqual([]);
});

test('Scenario: Sky motion only on transform and opacity', async ({ page }) => {
	for (const [name, show] of Object.entries({ lobby: NIGHT.lobby, night: NIGHT.wake, day: DAY.grimoire })) {
		await show(page);
		const loops = await page.evaluate(skyLoops);
		expect(loops.length, `${name}: ambient loops`).toBeGreaterThan(0);
		for (const props of loops) for (const prop of props) expect(SKY_ALLOWED, `${name}: ${prop}`).toContain(prop);
	}
});

test.describe('reduced motion', () => {
	test.use({ reducedMotion: 'reduce' });

	test('Scenario: Sky motion only on transform and opacity (none under reduced motion)', async ({ page }) => {
		for (const [name, show] of Object.entries({ lobby: NIGHT.lobby, night: NIGHT.wake, day: DAY.grimoire })) {
			await show(page);
			expect(await page.evaluate(skyLoops), name).toEqual([]);
			await expect.poll(() => page.evaluate(() => document.getAnimations().filter((a) => a.effect?.getTiming().iterations === Infinity && a.playState === 'running').length), name).toBe(0);
			const state = await sky(page);
			expect(state.stars + state.moon + state.sun, `${name}: sky still drawn`).toBeGreaterThan(0);
		}
	});
});
