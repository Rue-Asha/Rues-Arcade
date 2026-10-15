import { expect, test, type Page } from '@playwright/test';
import { clocktower } from '../src/lib/games/clocktower/engine.ts';
import { F15, F7, seated } from '../src/lib/games/clocktower/fixtures.ts';
import type { ClocktowerState } from '../src/lib/games/clocktower/types.ts';
import { play, seedClocktower } from './clocktower-session.ts';
import { live, seedRoster, settled } from './helpers.ts';
import { day1, ghost, ghostless, nightEnd } from './walks/clocktower-day.ts';

const NAMES = ['Alex', 'Bo', 'Cleo', 'Dani', 'Eli', 'Fey', 'Gus', 'Hana', 'Ida', 'Jo', 'Kai', 'Lu', 'Mo', 'Nia', 'Ole'];

const board = (n: number): ClocktowerState =>
	clocktower.init({ players: NAMES.slice(0, n).map((name) => ({ id: name.toLowerCase(), name })), config: {}, content: [], seed: 5 });

// the first night step that shows the circle
function atCircle(s: ClocktowerState): ClocktowerState {
	let t = play(s, s.seats.flatMap((): { type: 'show' | 'hide' }[] => [{ type: 'show' }, { type: 'hide' }]));
	while (t.night!.screens[t.night!.at].screen !== 'circle') t = play(t, [{ type: 'next' }]);
	return t;
}

// Dani (seat 4) nominated by Alex (seat 1): the clock points at her
const clock = (s: ClocktowerState) => play(day1(s), [{ type: 'nominee', seat: 3 }, { type: 'nominate', nominator: 0 }]);

async function open(page: Page, state: ClocktowerState) {
	await seedRoster(page, NAMES.slice(0, state.seats.length));
	await seedClocktower(page, state);
	await page.goto('/spiele/clocktower/spielen');
	await expect(live(page).locator('[data-circle]')).toBeVisible();
	await settled(page);
}

const screens = (n: number): [string, ClocktowerState][] => {
	const roles = n === 7 ? F7 : F15;
	return [
		['setup', board(n)],
		['night', atCircle(seated(roles))],
		['day', day1(seated(roles))],
		['clock', clock(seated(roles))]
	];
};

test('Scenario: Every circle draws n ticks', async ({ page }) => {
	for (const n of [7, 15]) {
		for (const [name, state] of screens(n)) {
			await open(page, state);
			const got = await live(page).locator('[data-circle]').evaluate((circle) => {
				const layer = circle.querySelector<SVGSVGElement>('[data-deco][data-motif="circle"]')!;
				const ticks = [...layer.querySelectorAll<SVGPathElement>('[data-ticks]')];
				return {
					paths: ticks.length,
					attr: ticks[0]?.dataset.ticks,
					drawn: ticks[0]?.getAttribute('d')?.match(/M/g)?.length ?? 0,
					hidden: layer.getAttribute('aria-hidden') === 'true',
					text: layer.querySelectorAll('text, tspan').length + layer.textContent!.trim().length
				};
			});
			const label = `${name} with ${n} seats`;
			expect(got, label).toEqual({ paths: 1, attr: String(n), drawn: n, hidden: true, text: 0 });
		}
	}
});

// night 2 after Bo's execution, on the death step
function deathStep(s: ClocktowerState): ClocktowerState {
	let t = play(day1(s), [{ type: 'execute', seat: 1 }, { type: 'next' }]);
	while (t.night!.screens[t.night!.at].screen !== 'deaths') t = play(t, [{ type: 'next' }]);
	return t;
}

// dawn of day 2 with Cleo (seat 3) dead in the night, past "Alle aufwachen"
const dawn = (s: ClocktowerState) => play(nightEnd(play(day1(s), [{ type: 'execute', seat: 1 }, { type: 'next' }]), [2]), [{ type: 'next' }]);

const LONG = 'Bartholomäus';
// seat 7 gets a name too long for any node
const long = (s: ClocktowerState): ClocktowerState => ({
	...s,
	seats: s.seats.map((x, i) => (i === 6 ? { ...x, player: { ...x.player, name: LONG } } : x))
});

// every seat's box, its number and name boxes and fonts, measured in one go
const faces = (page: Page) =>
	live(page).locator('[data-circle]').evaluate((circle) => {
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
			seats: seats.map((el, i) => {
				const box = boxes[i];
				const no = el.querySelector<HTMLElement>('.no')!;
				const name = el.querySelector<HTMLElement>('.name')!;
				const n = no.getBoundingClientRect();
				const m = name.getBoundingClientRect();
				const style = getComputedStyle(name);
				return {
					seat: Number(el.dataset.seat),
					label: el.getAttribute('aria-label')!,
					title: name.title,
					text: name.textContent!.trim(),
					noText: no.textContent!.trim(),
					noSize: Number.parseFloat(getComputedStyle(no).fontSize),
					nameSize: Number.parseFloat(style.fontSize),
					// the number's middle on the node's top edge, the number wholly above the name
					rim: Math.abs(n.top + n.height / 2 - box.top) <= n.height / 2 && n.bottom <= m.top + 0.5,
					inside: m.left >= box.left - 0.5 && m.right <= box.right + 0.5 && m.top >= box.top - 0.5 && m.bottom <= box.bottom + 0.5,
					ellipsis: style.textOverflow === 'ellipsis' && style.whiteSpace === 'nowrap' && style.overflow === 'hidden',
					cut: name.scrollWidth > name.clientWidth,
					small: Math.min(box.width, box.height)
				};
			}),
			overlap,
			scroll: document.documentElement.scrollWidth <= innerWidth
		};
	});

test('Scenario: Seat node shows the name large and the number small', async ({ page }) => {
	test.setTimeout(60_000);
	for (const n of [7, 15]) {
		const roles = n === 7 ? F7 : F15;
		const list: [string, ClocktowerState][] = [
			['setup', long(board(n))],
			['night', long(atCircle(seated(roles)))],
			['death step', long(deathStep(seated(roles)))],
			['dawn', long(dawn(seated(roles)))],
			['day', long(day1(seated(roles)))],
			['clock', long(clock(seated(roles)))]
		];
		for (const [name, state] of list) {
			await open(page, state);
			const got = await faces(page);
			const label = `${name} with ${n} seats`;
			expect(got.seats, label).toHaveLength(n);
			expect(got.overlap, label).toBe(false);
			expect(got.scroll, label).toBe(true);
			for (const s of got.seats) {
				const at = `${label}, seat ${s.seat}`;
				expect(s.noText, at).toBe(String(s.seat));
				expect(s.noSize, at).toBeGreaterThanOrEqual(12);
				expect(s.nameSize, at).toBeGreaterThanOrEqual(15);
				expect(s.nameSize, at).toBeGreaterThanOrEqual(1.25 * s.noSize);
				expect(s.rim, at).toBe(true);
				expect(s.inside, at).toBe(true);
				expect(s.ellipsis, at).toBe(true);
				expect(s.small, at).toBeGreaterThanOrEqual(44);
				const full = s.seat === 7 ? LONG : NAMES[s.seat - 1];
				expect(s.text, at).toBe(full);
				expect(s.title, at).toBe(full);
				expect(s.label, at).toContain(`Platz ${s.seat}, ${full}`);
			}
			expect(got.seats[6].cut, `${label}: the long name ends in an ellipsis`).toBe(true);
		}
	}
});

// A seat's badge measured against its seat: the disc, its colours resolved from the theme tokens, the glyph's contrast
// against the disc, and whether the disc touches the number pill or the name's text.
const badgeOf = (page: Page, n: number, kind: string) =>
	live(page).locator(`[data-seat="${n}"]`).evaluate((el, kind) => {
		const badges = el.querySelectorAll<HTMLElement>(`[data-badge="${kind}"]`);
		const badge = badges[0];
		if (badge === undefined) return null;
		const channels = (css: string) => {
			const ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true })!;
			ctx.clearRect(0, 0, 1, 1);
			ctx.fillStyle = css;
			ctx.fillRect(0, 0, 1, 1);
			const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
			return { r, g, b, a };
		};
		const lum = ({ r, g, b }: { r: number; g: number; b: number }) => {
			const lin = (v: number) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
			return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
		};
		const ratio = (a: string, b: string) => {
			const [hi, lo] = [lum(channels(a)), lum(channels(b))].sort((x, y) => y - x);
			return (hi + 0.05) / (lo + 0.05);
		};
		const token = (name: string) => {
			const probe = document.createElement('i');
			probe.style.color = `var(--${name})`;
			el.append(probe);
			const c = getComputedStyle(probe).color;
			probe.remove();
			return c;
		};
		const style = getComputedStyle(badge);
		const glyph = badge.querySelector<SVGSVGElement>('svg')!;
		const seatStyle = getComputedStyle(el);
		// a fill that shows nothing of its own is the node's face behind it
		const fill = channels(style.backgroundColor).a === 0 ? seatStyle.backgroundColor : style.backgroundColor;
		const r = badge.getBoundingClientRect();
		const disc = { x: r.left + r.width / 2, y: r.top + r.height / 2, r: r.width / 2 };
		const touches = (b: DOMRect) => {
			const x = Math.max(b.left, Math.min(disc.x, b.right));
			const y = Math.max(b.top, Math.min(disc.y, b.bottom));
			return Math.hypot(x - disc.x, y - disc.y) < disc.r - 0.5;
		};
		const range = document.createRange();
		range.selectNodeContents(el.querySelector('.name')!);
		return {
			count: badges.length,
			round: Math.abs(r.width - r.height) <= 1 && Number.parseFloat(style.borderTopLeftRadius) >= r.width / 2 - 0.5,
			fill,
			face: seatStyle.backgroundColor,
			ring: style.borderTopColor,
			spent: badge.hasAttribute('data-spent'),
			strike: badge.querySelector('[data-strike]') !== null,
			hidden: badge.getAttribute('aria-hidden') === 'true' && glyph.getAttribute('aria-hidden') === 'true',
			glyph: ratio(getComputedStyle(glyph).color, fill),
			ink: getComputedStyle(glyph).color,
			shape: glyph.innerHTML,
			covers: touches(el.querySelector('.no')!.getBoundingClientRect()) || touches(range.getBoundingClientRect()),
			inside: r.left >= 0 && r.top >= 0 && r.right <= innerWidth && r.bottom <= innerHeight,
			tokens: { clocktower: token('clocktower'), ghost: token('ghost'), spent: token('spent') },
			outline: { shadow: seatStyle.boxShadow, border: seatStyle.borderTopColor, outline: seatStyle.outlineStyle }
		};
	}, kind);

// Dani (seat 4) on the block with 4 votes
const blocked = () =>
	play(day1(seated(F7)), [
		{ type: 'nominee', seat: 3 }, { type: 'nominate', nominator: 0 }, { type: 'vote' }, { type: 'swept' },
		{ type: 'count', votes: 4 }, { type: 'confirm' }, { type: 'next' }
	]);

test('Scenario: Block badge replaces the outline', async ({ page }) => {
	const picker = play(blocked(), [{ type: 'nominee', seat: 5 }]);
	const screens: [string, ClocktowerState][] = [
		['grimoire', blocked()],
		['picker', picker],
		['clock', play(picker, [{ type: 'nominate', nominator: 1 }])]
	];
	for (const [name, state] of screens) {
		await open(page, state);
		await expect(live(page).locator('[data-badge="block"]'), name).toHaveCount(1);
		const got = (await badgeOf(page, 4, 'block'))!;
		expect(got, name).not.toBeNull();
		expect(got.count, name).toBe(1);
		expect(got.round, name).toBe(true);
		expect(got.fill, name).toBe(got.tokens.clocktower);
		expect(got.hidden, name).toBe(true);
		expect(got.glyph, name).toBeGreaterThanOrEqual(3);
		expect(got.covers, name).toBe(false);
		expect(got.outline.shadow, name).toBe('none');
		expect(got.outline.border, name).not.toBe(got.tokens.clocktower);
		expect(got.outline.outline, name).toBe('none');
		expect(await live(page).innerText(), name).not.toContain('▼');
	}
});

test('Scenario: Ghost-vote badge shows whether the vote is left', async ({ page }) => {
	await open(page, ghostless(ghost(day1(seated(F7)), 1), 4));
	const left = (await badgeOf(page, 2, 'ghost'))!;
	const spent = (await badgeOf(page, 5, 'ghost'))!;
	expect(left).not.toBeNull();
	expect(spent).not.toBeNull();

	expect(left.round).toBe(true);
	expect(left.spent).toBe(false);
	expect(left.fill).not.toBe(left.face);
	expect(left.fill).toBe(left.tokens.ghost);
	expect(left.strike).toBe(false);
	expect(left.glyph).toBeGreaterThanOrEqual(3);

	// greyed out: grey, hollow (only a ring on the node's face) and struck through
	expect(spent.round).toBe(true);
	expect(spent.spent).toBe(true);
	expect(spent.fill).toBe(spent.face);
	expect(spent.ring).toBe(spent.tokens.spent);
	expect(spent.ink).toBe(spent.tokens.spent);
	expect(spent.strike).toBe(true);
	expect(spent.glyph).toBeGreaterThanOrEqual(3);

	for (const b of [left, spent]) {
		expect(b.count).toBe(1);
		expect(b.hidden).toBe(true);
		expect(b.inside).toBe(true);
		expect(b.covers).toBe(false);
	}
	await expect(page.getByRole('button', { name: 'Platz 2, Bo, tot, Stimme', exact: true })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Platz 5, Eli, tot, keine Stimme', exact: true })).toBeVisible();
	const text = await page.locator('body').innerText();
	expect(text).not.toContain('✕ ●');
	expect(text).not.toContain('✕ ○');
});

const seatAt = (page: Page, n: number) => live(page).locator(`[data-seat="${n}"]`);

// every animation in the seat (itself, its ripple and badges): the properties it animates, when it ends, its scale steps
const motionOf = (page: Page, n: number) =>
	seatAt(page, n).evaluate((el) =>
		el.getAnimations({ subtree: true }).map((a) => {
			const effect = a.effect as KeyframeEffect;
			const frames = effect.getKeyframes();
			const props = [...new Set(frames.flatMap((k) => Object.keys(k)))].filter(
				(k) => !['offset', 'computedOffset', 'easing', 'composite'].includes(k)
			);
			return {
				ripple: (effect.target as HTMLElement).hasAttribute('data-ripple'),
				seat: effect.target === el,
				props,
				end: Number(effect.getComputedTiming().endTime),
				finite: effect.getTiming().iterations !== Infinity,
				scales: frames.map((k) => k.scale).filter((v) => v !== undefined).map(Number)
			};
		})
	);

test('Scenario: Seat press springs back with a ripple', async ({ page }) => {
	await open(page, day1(seated(F7)));
	const seat = seatAt(page, 3);
	const box = (await seat.boundingBox())!;
	await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
	await page.mouse.down();
	const held = await seat.evaluate(async (el) => {
		await Promise.all(el.getAnimations().map((a) => a.finished));
		return Number(getComputedStyle(el).scale);
	});
	expect(held).toBeGreaterThanOrEqual(0.9);
	expect(held).toBeLessThanOrEqual(0.96);

	await page.mouse.up();
	const after = await motionOf(page, 3);
	const spring = after.filter((a) => a.seat && a.scales.some((v) => v > 1));
	expect(spring).toHaveLength(1);
	expect(spring[0].scales.at(-1)).toBe(1);
	expect(after.filter((a) => a.ripple)).toHaveLength(1);
	for (const a of after) {
		expect(a.finite).toBe(true);
		expect(a.end).toBeLessThanOrEqual(500);
		for (const prop of a.props) expect(['transform', 'scale', 'translate', 'opacity'], prop).toContain(prop);
	}

	const rest = await seat.evaluate(async (el) => {
		await Promise.all(el.getAnimations({ subtree: true }).map((a) => a.finished.catch(() => {})));
		const ripple = el.querySelector<HTMLElement>('[data-ripple]')!;
		const scale = getComputedStyle(el).scale;
		return { scale: scale === 'none' ? 1 : Number(scale), ripple: Number(getComputedStyle(ripple).opacity), running: el.getAnimations({ subtree: true }).length };
	});
	expect(rest).toEqual({ scale: 1, ripple: 0, running: 0 });
});

test('Scenario: Seat tap vibrates where supported', async ({ page, context }) => {
	await page.addInitScript(() => {
		const calls: unknown[] = [];
		(window as unknown as { buzz: unknown[] }).buzz = calls;
		Object.defineProperty(Navigator.prototype, 'vibrate', { configurable: true, value: (p: unknown) => (calls.push(p), true) });
	});
	const buzz = () => page.evaluate(() => (window as unknown as { buzz: unknown[] }).buzz);
	// Dani (seat 4) is dead
	await open(page, ghost(day1(seated(F7)), 3));
	await seatAt(page, 2).click();
	await expect(page.getByRole('dialog')).toBeVisible();
	expect(await buzz()).toEqual([10]);

	await page.getByRole('dialog').getByRole('button', { name: 'Nominieren', exact: true }).click();
	await expect(seatAt(page, 4)).toHaveAttribute('title', 'ist tot');
	await settled(page);
	await seatAt(page, 4).click({ force: true });
	expect(await motionOf(page, 4)).toEqual([]);
	expect(await buzz()).toEqual([10]);

	const bare = await context.newPage();
	const errors: Error[] = [];
	bare.on('pageerror', (e) => errors.push(e));
	await bare.addInitScript(() => delete (Navigator.prototype as { vibrate?: unknown }).vibrate);
	await open(bare, ghost(day1(seated(F7)), 3));
	expect(await bare.evaluate(() => 'vibrate' in navigator)).toBe(false);
	await seatAt(bare, 2).click();
	await expect(bare.getByRole('dialog')).toBeVisible();
	expect(errors).toEqual([]);
});

// seats 4 and 5 voted in the sweep; the confirm screen
const confirming = () =>
	play(day1(seated(F7)), [
		{ type: 'nominee', seat: 2 }, { type: 'nominate', nominator: 0 }, { type: 'vote' },
		{ type: 'mark', seat: 3, on: true }, { type: 'mark', seat: 4, on: true }, { type: 'swept' }
	]);

test('Scenario: Seat press under reduced motion', async ({ page }) => {
	// with motion allowed the same tap animates, so the quiet tap below is reduced motion's doing
	await open(page, confirming());
	await seatAt(page, 2).click();
	expect((await motionOf(page, 2)).length).toBeGreaterThan(0);

	await page.emulateMedia({ reducedMotion: 'reduce' });
	await open(page, confirming());
	await expect(live(page).getByRole('heading', { name: 'Stimmen zählen', exact: true })).toBeVisible();
	const seat = seatAt(page, 2);
	const box = (await seat.boundingBox())!;
	await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
	await page.mouse.down();
	expect(await motionOf(page, 2)).toEqual([]);
	await page.mouse.up();
	const now = await seat.evaluate((el) => ({ marked: el.hasAttribute('data-marked'), check: el.querySelector('[data-badge="check"]') !== null }));
	expect(now).toEqual({ marked: true, check: true });
	expect(await motionOf(page, 2)).toEqual([]);
});
