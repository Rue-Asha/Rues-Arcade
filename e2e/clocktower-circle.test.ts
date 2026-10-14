import { expect, test, type Page } from '@playwright/test';
import { byId, characters } from '../src/lib/games/clocktower/characters.ts';
import { clocktower } from '../src/lib/games/clocktower/engine.ts';
import { F15, F7, seated } from '../src/lib/games/clocktower/fixtures.ts';
import type { CharacterId, ClocktowerAction, ClocktowerState } from '../src/lib/games/clocktower/types.ts';
import { play, seedClocktower } from './clocktower-session.ts';
import { live, seedRoster, settled } from './helpers.ts';
import { day1, ghost, ghostless } from './walks/clocktower-day.ts';

const NAMES = ['Alex', 'Bo', 'Cleo', 'Dani', 'Eli', 'Fey', 'Gus', 'Hana', 'Ida', 'Jo', 'Kai', 'Lu', 'Mo', 'Nia', 'Ole'];

const board = (n: number): ClocktowerState =>
	clocktower.init({ players: NAMES.slice(0, n).map((name) => ({ id: name.toLowerCase(), name })), config: {}, content: [], seed: 5 });

async function open(page: Page, state: ClocktowerState) {
	await seedRoster(page, NAMES.slice(0, state.seats.length));
	await seedClocktower(page, state);
	await page.goto('/spiele/clocktower/spielen');
	await expect(live(page).locator('[data-circle]')).toBeVisible();
	await settled(page);
}

// the first night step that shows the circle
function atCircle(s: ClocktowerState): ClocktowerState {
	let t = play(s, s.seats.flatMap((): { type: 'show' | 'hide' }[] => [{ type: 'show' }, { type: 'hide' }]));
	while (t.night!.screens[t.night!.at].screen !== 'circle') t = play(t, [{ type: 'next' }]);
	return t;
}

const seat = (page: Page, n: number) => live(page).locator(`[data-seat="${n}"]`);

async function audit(page: Page, count: number) {
	return live(page).locator('[data-circle]').evaluate((circle, count) => {
		const layers = circle.querySelectorAll<SVGSVGElement>('[data-deco][data-motif="circle"]');
		const layer = layers[0];
		const seats = [...circle.querySelectorAll<HTMLElement>('[data-seat]')];
		// every point of the ring, in the layer's own pixels (its viewBox is its size)
		const ring: DOMPoint[] = [];
		for (const path of layer.querySelectorAll<SVGPathElement>('[data-ring]')) {
			const total = path.getTotalLength();
			for (let at = 0; at <= total; at += 1) ring.push(path.getPointAtLength(at));
		}
		const near: number[] = [];
		const hits: boolean[] = [];
		const boxes: DOMRect[] = [];
		for (const el of seats) {
			el.scrollIntoView({ block: 'center', inline: 'center' });
			const r = el.getBoundingClientRect();
			const x = r.left + r.width / 2;
			const y = r.top + r.height / 2;
			const o = layer.getBoundingClientRect();
			near.push(Math.min(...ring.map((p) => Math.hypot(o.left + p.x - x, o.top + p.y - y))));
			hits.push(document.elementFromPoint(x, y)?.closest('[data-seat]') === el);
		}
		// layout boxes, taken after the scrolling
		for (const el of seats) boxes.push(el.getBoundingClientRect());
		let overlap = false;
		for (let i = 0; i < boxes.length; i++)
			for (let j = i + 1; j < boxes.length; j++) {
				const a = boxes[i];
				const b = boxes[j];
				if (a.left < b.right - 0.5 && b.left < a.right - 0.5 && a.top < b.bottom - 0.5 && b.top < a.bottom - 0.5) overlap = true;
			}
		const all = [layer, ...layer.querySelectorAll('*')];
		return {
			layers: layers.length,
			count: seats.length === count,
			hidden: layer.getAttribute('aria-hidden') === 'true',
			quiet: all.every((el) => getComputedStyle(el).pointerEvents === 'none'),
			text: layer.querySelectorAll('text, tspan').length === 0 && layer.textContent!.trim() === '',
			near: Math.max(...near),
			hits: hits.every(Boolean),
			small: Math.min(...boxes.map((b) => Math.min(b.width, b.height))),
			overlap,
			scroll: document.documentElement.scrollWidth <= innerWidth
		};
	}, count);
}

test('Scenario: Circle ornament connects the seats', async ({ page }) => {
	for (const n of [7, 15]) {
		const roles = n === 7 ? F7 : F15;
		const screens: [string, ClocktowerState][] = [
			['setup', board(n)],
			['night', atCircle(seated(roles))],
			['day', day1(seated(roles))]
		];
		for (const [name, state] of screens) {
			await open(page, state);
			const got = await audit(page, n);
			const label = `${name} with ${n} seats`;
			expect(got.layers, label).toBe(1);
			expect(got.count, label).toBe(true);
			expect(got.hidden, label).toBe(true);
			expect(got.quiet, label).toBe(true);
			expect(got.text, label).toBe(true);
			expect(got.near, label).toBeLessThanOrEqual(4);
			expect(got.hits, label).toBe(true);
			expect(got.small, label).toBeGreaterThanOrEqual(44);
			expect(got.overlap, label).toBe(false);
			expect(got.scroll, label).toBe(true);
		}
	}
});

const tokenOf = (page: Page, n: number) =>
	seat(page, n).locator('.mark').evaluate((el) => {
		el.scrollIntoView({ block: 'center', inline: 'center' });
		const channels = (css: string) => {
			const ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true })!;
			ctx.clearRect(0, 0, 1, 1);
			ctx.fillStyle = css;
			ctx.fillRect(0, 0, 1, 1);
			const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
			return { r, g, b, a: a / 255 };
		};
		const lum = ({ r, g, b }: { r: number; g: number; b: number }) => {
			const lin = (v: number) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
			return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
		};
		const style = getComputedStyle(el);
		const fg = channels(style.color);
		const bg = channels(style.backgroundColor);
		const [hi, lo] = [lum(fg), lum(bg)].sort((a, b) => b - a);
		const r = el.getBoundingClientRect();
		const deco = el.querySelector('svg[aria-hidden="true"]');
		return {
			text: (el as HTMLElement).innerText.replace(/\s+/g, ' ').trim(),
			size: Number.parseFloat(style.fontSize),
			solid: bg.a === 1,
			contrast: (hi + 0.05) / (lo + 0.05),
			ornament: deco !== null && getComputedStyle(deco).pointerEvents === 'none',
			inside: r.left >= 0 && r.top >= 0 && r.right <= innerWidth && r.bottom <= innerHeight
		};
	});

test('Scenario: Ghost-vote token decorated and readable', async ({ page }) => {
	await open(page, ghostless(ghost(day1(seated(F7)), 1), 4));
	const [with_, without] = [await tokenOf(page, 2), await tokenOf(page, 5)];
	expect(with_.text).toBe('✕ ●');
	expect(without.text).toBe('✕ ○');
	for (const t of [with_, without]) {
		expect(t.size).toBeGreaterThanOrEqual(12);
		expect(t.solid).toBe(true);
		expect(t.contrast).toBeGreaterThanOrEqual(4.5);
		expect(t.ornament).toBe(true);
		expect(t.inside).toBe(true);
	}
	await expect(page.getByRole('button', { name: /tot, Stimme$/ })).toHaveCount(1);
	await expect(page.getByRole('button', { name: /tot, keine Stimme$/ })).toHaveCount(1);
	await expect(page.getByRole('button', { name: 'Platz 2, Bo, tot, Stimme', exact: true })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Platz 5, Eli, tot, keine Stimme', exact: true })).toBeVisible();
});

const SHORT = 300;

// the clock stands still until the test moves it; the sweep's timers fire only when it is run
async function frozen(page: Page, state: ClocktowerState) {
	const T0 = Date.UTC(2026, 9, 14, 20, 0, 0);
	await page.addInitScript((ms) => ((window as unknown as { clocktowerSeatMs: number }).clocktowerSeatMs = ms), SHORT);
	await page.clock.install({ time: T0 });
	await seedClocktower(page, state);
	await page.goto('/spiele/clocktower/spielen');
	await expect(seat(page, 1)).toBeVisible();
	await page.clock.pauseAt(T0 + 5_000);
}

const handAudit = (page: Page, pointed: number) =>
	live(page).locator('[data-circle]').evaluate(async (circle, pointed) => {
		const hand = circle.querySelector<HTMLElement>('[data-hand]')!;
		await Promise.all(hand.getAnimations().map((a) => a.finished));
		const arm = hand.querySelector<HTMLElement>('.arm')!;
		const tip = hand.querySelector<HTMLElement>('[data-hand-tip]')!;
		const hub = circle.querySelector<HTMLElement>('[data-hub]')!;
		const plane = circle.querySelector<HTMLElement>('.plane')!.getBoundingClientRect();
		const mid = (el: Element) => {
			const r = el.getBoundingClientRect();
			return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
		};
		const target = circle.querySelector<HTMLElement>(`[data-seat="${pointed}"]`)!;
		const t = target.getBoundingClientRect();
		const c = mid(hub);
		const p = mid(tip);
		const channels = (css: string) => {
			const ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true })!;
			ctx.fillStyle = css;
			ctx.fillRect(0, 0, 1, 1);
			const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
			return { r, g, b };
		};
		const lum = ({ r, g, b }: { r: number; g: number; b: number }) => {
			const lin = (v: number) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
			return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
		};
		const ground = getComputedStyle(document.documentElement).getPropertyValue('--ground').trim();
		const [hi, lo] = [lum(channels(getComputedStyle(arm).backgroundColor)), lum(channels(ground))].sort((a, b) => b - a);
		const seatMid = mid(target);
		return {
			hubAtCentre: Math.hypot(c.x - (plane.left + plane.width / 2), c.y - (plane.top + plane.height / 2)),
			tipToSeat: Math.hypot(p.x - seatMid.x, p.y - seatMid.y),
			radius: t.width / 2,
			length: arm.offsetHeight,
			reach: Math.hypot(p.x - c.x, p.y - c.y),
			width: arm.offsetWidth,
			contrast: (hi + 0.05) / (lo + 0.05),
			scroll: document.documentElement.scrollWidth <= innerWidth
		};
	}, pointed);

test('Scenario: Voting clock hand stands out', async ({ page }) => {
	await frozen(page, day1(seated(F7)));
	await seat(page, 4).click();
	await page.getByRole('dialog').getByRole('button', { name: 'Nominieren', exact: true }).click();
	await seat(page, 1).click();
	await expect(live(page).getByRole('button', { name: 'Abstimmung beginnen', exact: true })).toBeVisible();

	const at = await handAudit(page, 4);
	expect(at.hubAtCentre).toBeLessThan(2);
	expect(at.tipToSeat).toBeLessThan(at.radius);
	expect(at.reach).toBeGreaterThan(at.length * 0.8);
	expect(at.width).toBeGreaterThanOrEqual(4);
	expect(at.contrast).toBeGreaterThanOrEqual(3);

	await live(page).getByRole('button', { name: 'Abstimmung beginnen', exact: true }).click();
	await expect(live(page).locator('[data-sweep]')).toBeVisible();
	await page.clock.runFor(1);
	await page.clock.runFor(SHORT);
	await expect(live(page).locator('[data-under]')).toHaveAttribute('data-under', '6');
	const swept = await handAudit(page, 6);
	expect(swept.hubAtCentre).toBeLessThan(2);
	expect(swept.tipToSeat).toBeLessThan(swept.radius);
	expect(swept.contrast).toBeGreaterThanOrEqual(3);
	expect(swept.scroll).toBe(true);
});

const assign = (...ids: CharacterId[]): ClocktowerAction[] => ids.map((character, seat) => ({ type: 'assign', seat, character }));

const TEAM_TOKEN = { townsfolk: 'good', outsider: 'outsider', minion: 'evil', demon: 'demon' } as const;

// the icon in a seat with its colour and the colour the team token resolves to
const iconOf = (page: Page, n: number, id: CharacterId | null) =>
	seat(page, n).evaluate((el, token) => {
		const icon = el.querySelector<SVGElement>('svg.icon');
		if (icon === null) return null;
		const probe = document.createElement('i');
		probe.style.color = token === null ? '' : `var(--${token})`;
		el.append(probe);
		const want = getComputedStyle(probe).color;
		probe.remove();
		const box = el.getBoundingClientRect();
		const r = icon.getBoundingClientRect();
		return {
			colour: getComputedStyle(icon).color === want,
			inside: r.left >= box.left && r.right <= box.right && r.top >= box.top && r.bottom <= box.bottom,
			path: icon.querySelector('path')!.getAttribute('d')
		};
	}, id === null ? null : TEAM_TOKEN[byId[id].team]);

const sheet = (page: Page, n: number) => seat(page, n).getAttribute('aria-label');

test("Scenario: Setup circle shows each seat's character", async ({ page }) => {
	const first: CharacterId[] = ['washerwoman', 'saint', 'poisoner', 'chef', 'empath'];
	await open(page, play(board(7), assign(...first)));

	for (const [i, id] of first.entries()) {
		const got = await iconOf(page, i + 1, id);
		expect(got, `seat ${i + 1}`).not.toBeNull();
		expect(got!.colour, `seat ${i + 1}`).toBe(true);
		expect(got!.path, `seat ${i + 1}`).toBe(byId[id].icon);
		expect(await sheet(page, i + 1)).toContain(byId[id].name);
	}
	for (const n of [6, 7]) {
		expect(await iconOf(page, n, null)).toBeNull();
		expect(await sheet(page, n)).not.toMatch(/Imp|Washerwoman|Saint|Poisoner|Chef|Empath/);
	}

	await live(page).locator('[data-character="imp"]').click();
	await seat(page, 6).click();
	const imp = await iconOf(page, 6, 'imp');
	expect(imp!.colour).toBe(true);
	expect(imp!.path).toBe(byId.imp.icon);
	expect(await sheet(page, 6)).toContain('Imp');

	await seat(page, 1).click();
	await seat(page, 6).click();
	expect((await iconOf(page, 1, 'imp'))!.path).toBe(byId.imp.icon);
	expect((await iconOf(page, 1, 'imp'))!.colour).toBe(true);
	expect((await iconOf(page, 6, 'washerwoman'))!.path).toBe(byId.washerwoman.icon);
	expect((await iconOf(page, 6, 'washerwoman'))!.colour).toBe(true);
	expect(await sheet(page, 1)).toContain('Imp');
	expect(await sheet(page, 6)).toContain('Washerwoman');
});

test('Scenario: Character icons fit fifteen seats', async ({ page }) => {
	const roles: CharacterId[] = [
		'washerwoman', 'librarian', 'investigator', 'chef', 'empath', 'fortune-teller', 'undertaker', 'monk', 'ravenkeeper',
		'butler', 'saint', 'poisoner', 'spy', 'scarlet-woman', 'imp'
	];
	await open(page, play(board(15), assign(...roles)));
	const got = await live(page).locator('[data-circle]').evaluate((circle) => {
		const seats = [...circle.querySelectorAll<HTMLElement>('[data-seat]')];
		const boxes = seats.map((el) => el.getBoundingClientRect());
		let overlap = false;
		for (let i = 0; i < boxes.length; i++)
			for (let j = i + 1; j < boxes.length; j++) {
				const a = boxes[i];
				const b = boxes[j];
				if (a.left < b.right - 0.5 && b.left < a.right - 0.5 && a.top < b.bottom - 0.5 && b.top < a.bottom - 0.5) overlap = true;
			}
		return {
			seats: seats.length,
			icons: seats.map((el, i) => {
				const icon = el.querySelector<SVGElement>('svg.icon');
				const r = icon?.getBoundingClientRect();
				const no = el.querySelector<HTMLElement>('.no')!;
				const name = el.querySelector<HTMLElement>('.name')!;
				const box = boxes[i];
				return {
					icon: r !== undefined && r.width > 0 && r.left >= box.left && r.right <= box.right && r.top >= box.top && r.bottom <= box.bottom,
					no: no.checkVisibility() && no.textContent!.trim() === el.dataset.seat,
					name: name.checkVisibility() && name.textContent!.trim().length > 0,
					big: box.width >= 44 && box.height >= 44
				};
			}),
			overlap,
			scroll: document.documentElement.scrollWidth <= innerWidth
		};
	});
	expect(got.seats).toBe(15);
	got.icons.forEach((s, i) => expect(s, `seat ${i + 1}`).toEqual({ icon: true, no: true, name: true, big: true }));
	expect(got.overlap).toBe(false);
	expect(got.scroll).toBe(true);
});

test('Scenario: Public circles show no character icon', async ({ page }) => {
	const locked = seated(F7);
	const states: [string, ClocktowerState][] = [
		['reveal', locked],
		['night', atCircle(seated(F7))],
		['day', day1(seated(F7))]
	];
	for (const [name, state] of states) {
		await seedRoster(page, NAMES.slice(0, 7));
		await seedClocktower(page, state);
		await page.goto('/spiele/clocktower/spielen');
		await settled(page);
		const named = live(page).locator('[data-seat]');
		if (name === 'reveal') await expect(live(page).getByRole('button', { name: 'Rolle zeigen', exact: true })).toBeVisible();
		else await expect(named.first()).toBeVisible();
		await expect(live(page).locator('[data-seat] svg.icon')).toHaveCount(0);
		const labels = await named.evaluateAll((els) => els.map((el) => el.getAttribute('aria-label') ?? ''));
		for (const label of labels) for (const c of characters) expect(label, `${name}: ${label}`).not.toContain(c.name);
	}
});
