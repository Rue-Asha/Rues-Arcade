import { expect, test, type Page } from '@playwright/test';
import { F7, seated } from '../src/lib/games/clocktower/fixtures.ts';
import type { CharacterId, ClocktowerAction, ClocktowerState } from '../src/lib/games/clocktower/types.ts';
import { play, seedClocktower } from './clocktower-session.ts';
import { live } from './helpers.ts';
import { day1, ghost, nightEnd } from './walks/clocktower-day.ts';

const F15C: CharacterId[] = [
	'washerwoman', 'librarian', 'investigator', 'chef', 'empath', 'fortune-teller', 'undertaker', 'monk', 'ravenkeeper',
	'butler', 'saint', 'poisoner', 'spy', 'scarlet-woman', 'imp'
];

async function open(page: Page, state: ClocktowerState) {
	await seedClocktower(page, state);
	await page.goto('/spiele/clocktower/spielen');
	await expect(live(page)).toBeVisible();
}

const seat = (page: Page, n: number) => live(page).locator(`[data-seat="${n}"]`);
const dialog = (page: Page) => page.getByRole('dialog');
const press = (page: Page, name: string) => live(page).getByRole('button', { name, exact: true }).click();

// seat number -> the rings on it, in DOM order
const rings = (page: Page) =>
	live(page).locator('[data-seat]').evaluateAll((seats) =>
		Object.fromEntries(
			seats.map((s) => [(s as HTMLElement).dataset.seat!, [...s.querySelectorAll<HTMLElement>('[data-avail]')].map((r) => r.dataset.avail!)])
		)
	);

// the rings of an n-seat day: `all` seats have both, `dead` seats the turquoise one, the others only what they are listed for
function expected(n: number, spec: { all?: number[]; dead?: number[]; nominee?: number[]; nominator?: number[] }) {
	return Object.fromEntries(
		Array.from({ length: n }, (_, i) => {
			const seat = i + 1;
			const kinds = [
				...(spec.all?.includes(seat) || spec.dead?.includes(seat) || spec.nominee?.includes(seat) ? ['nominee'] : []),
				...(spec.all?.includes(seat) || spec.nominator?.includes(seat) ? ['nominator'] : [])
			];
			return [String(seat), kinds];
		})
	);
}

const SHORT = 200;
const LIVING = [1, 3, 4, 5, 6, 7];

test("Scenario: Rings follow the day's nominations", async ({ page }) => {
	await page.addInitScript((ms) => ((window as unknown as { clocktowerSeatMs: number }).clocktowerSeatMs = ms), SHORT);
	// Bo (seat 2) is dead
	await open(page, ghost(day1(seated(F7)), 1));
	await expect(seat(page, 7)).toBeVisible();
	expect(await rings(page), 'grimoire').toEqual(expected(7, { all: LIVING, dead: [2] }));

	await seat(page, 4).click();
	await dialog(page).getByRole('button', { name: 'Nominieren', exact: true }).click();
	await expect(live(page).getByRole('heading', { name: 'Wer nominiert Dani?', exact: true })).toBeVisible();
	expect(await rings(page), 'picker: a pending nominee is not nominated yet').toEqual(expected(7, { all: LIVING, dead: [2] }));
	await seat(page, 1).click();
	await expect(live(page).getByRole('button', { name: 'Abstimmung beginnen', exact: true })).toBeVisible();
	const clock = { all: [3, 5, 6, 7], dead: [2], nominee: [1], nominator: [4] };
	expect(await rings(page), 'clock: Dani has no turquoise ring, Alex no orange one').toEqual(expected(7, clock));

	await press(page, 'Zurück');
	await expect(live(page).getByRole('button', { name: 'Tag beenden', exact: true })).toBeVisible();
	expect(await rings(page), 'after Zurück both are back').toEqual(expected(7, { all: LIVING, dead: [2] }));

	await seat(page, 4).click();
	await dialog(page).getByRole('button', { name: 'Nominieren', exact: true }).click();
	await seat(page, 1).click();
	await press(page, 'Abstimmung beginnen');
	await expect(live(page).locator('[data-sweep]')).toBeVisible();
	expect(await rings(page), 'sweep').toEqual(expected(7, clock));
	await expect(live(page).getByTestId('count')).toBeVisible();
	expect(await rings(page), 'confirm').toEqual(expected(7, clock));
	await press(page, 'Bestätigen');
	await expect(live(page).getByRole('button', { name: 'Weiter', exact: true })).toBeVisible();
	expect(await rings(page), 'result').toEqual(expected(7, clock));
	await press(page, 'Weiter');
	await expect(live(page).getByRole('button', { name: 'Tag beenden', exact: true })).toBeVisible();
	expect(await rings(page), 'grimoire after the vote').toEqual(expected(7, clock));

	// the day ends: no ring on the execution announcement, night or dawn; the next day starts afresh
	await press(page, 'Tag beenden');
	await dialog(page).getByRole('button', { name: 'Ja, Tag beenden', exact: true }).click();
	await expect(live(page).getByRole('heading', { name: /hingerichtet|niemand/ })).toBeVisible();
	await expect(live(page).locator('[data-seat]')).toHaveCount(7);
	expect(await rings(page), 'execution announcement').toEqual(expected(7, {}));

	const ended = play(ghost(day1(seated(F7)), 1), [
		{ type: 'nominee', seat: 3 }, { type: 'nominate', nominator: 0 }, { type: 'vote' }, { type: 'swept' },
		{ type: 'count', votes: 3 }, { type: 'confirm' }, { type: 'next' }, { type: 'endDay' }
	]);
	const night = play(ended, [{ type: 'next' }]);
	await open(page, night);
	await expect(live(page).getByRole('button', { name: 'Weiter', exact: true })).toBeVisible();
	await expect(live(page).locator('[data-avail]'), 'night').toHaveCount(0);
	const dawn = nightEnd(night, [4]);
	await open(page, dawn);
	await expect(live(page).locator('[data-avail]'), 'dawn wake').toHaveCount(0);
	await open(page, play(dawn, [{ type: 'next' }]));
	await expect(live(page).locator('[data-seat]')).toHaveCount(7);
	expect(Object.values(await rings(page)).flat(), 'dawn').toEqual([]);
	const next = play(dawn, [{ type: 'next' }, { type: 'next' }, { type: 'timer', minutes: null, now: Date.now() }]);
	await open(page, next);
	await expect(live(page).getByRole('button', { name: 'Tag beenden', exact: true })).toBeVisible();
	expect(await rings(page), 'next day: both rings are back, the dead keep the turquoise one').toEqual(
		expected(7, { all: [1, 3, 6, 7], dead: [2, 4, 5] })
	);
});

// Dani (seat 4) on the block of a 15-seat day, Bo and Ida dead
const crowded = () =>
	play(ghost(day1(seated(F15C)), 1, 8), [
		{ type: 'nominee', seat: 3 }, { type: 'nominate', nominator: 0 }, { type: 'vote' }, { type: 'swept' },
		{ type: 'count', votes: 8 }, { type: 'confirm' }, { type: 'next' }
	]);

test('Scenario: Rings stay subtle and outside the nodes', async ({ page }) => {
	await open(page, crowded());
	await expect(live(page).locator('[data-seat]')).toHaveCount(15);
	await expect(live(page).locator('[data-badge="block"]')).toHaveCount(1);
	const got = await live(page).evaluate((root) => {
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
		const ratio = (a: string, b: string) => {
			const [hi, lo] = [lum(channels(a)), lum(channels(b))].sort((x, y) => y - x);
			return (hi + 0.05) / (lo + 0.05);
		};
		const seats = [...root.querySelectorAll<HTMLElement>('[data-seat]')];
		const box = (el: Element) => {
			const r = el.getBoundingClientRect();
			return { x: r.left + r.width / 2, y: r.top + r.height / 2, r: r.width / 2 };
		};
		const nodes = seats.map(box);
		let ground: HTMLElement | null = root.querySelector('[data-circle]');
		while (ground && channels(getComputedStyle(ground).backgroundColor).a < 1) ground = ground.parentElement;
		const bg = getComputedStyle(ground ?? document.body).backgroundColor;
		const out = { rings: 0, outside: true, inert: true, contrast: Infinity, styles: true, nested: true, clear: true, hit: true };
		seats.forEach((s, i) => {
			const node = nodes[i];
			const pair = Object.fromEntries([...s.querySelectorAll<HTMLElement>('[data-avail]')].map((r) => [r.dataset.avail!, r]));
			for (const [kind, ring] of Object.entries(pair)) {
				out.rings++;
				const b = box(ring);
				const style = getComputedStyle(ring);
				if (!(b.r > node.r + 1 && Math.hypot(b.x - node.x, b.y - node.y) < 1)) out.outside = false;
				if (style.pointerEvents !== 'none') out.inert = false;
				out.contrast = Math.min(out.contrast, ratio(style.borderTopColor, bg));
				if (style.borderTopStyle !== (kind === 'nominee' ? 'solid' : 'dashed')) out.styles = false;
				nodes.forEach((other, j) => {
					if (j !== i && Math.hypot(b.x - other.x, b.y - other.y) < b.r + other.r) out.clear = false;
				});
			}
			if (pair.nominee && pair.nominator && !(box(pair.nominee).r < box(pair.nominator).r)) out.nested = false;
			const hit = document.elementFromPoint(node.x, node.y);
			if (hit !== s && !s.contains(hit)) out.hit = false;
		});
		return out;
	});
	expect(got.rings).toBeGreaterThan(20);
	expect(got.outside).toBe(true);
	expect(got.inert).toBe(true);
	expect(got.contrast).toBeGreaterThanOrEqual(3);
	expect(got.styles).toBe(true);
	expect(got.nested).toBe(true);
	expect(got.clear).toBe(true);
	expect(got.hit).toBe(true);
});

const votes = (nominee: number, nominator: number, count: number): ClocktowerAction[] => [
	{ type: 'nominee', seat: nominee }, { type: 'nominate', nominator }, { type: 'vote' }, { type: 'swept' },
	{ type: 'count', votes: count }, { type: 'confirm' }, { type: 'next' }
];

test('Scenario: Block card names the player and the votes', async ({ page }) => {
	const first = play(day1(seated(F7)), votes(3, 0, 4));
	const second = play(first, votes(4, 1, 5));
	const tie = play(second, votes(5, 2, 5));
	expect(tie.today!.block).toBeNull();
	for (const [state, name, count] of [[first, 'Dani', 4], [second, 'Eli', 5]] as const) {
		await open(page, state);
		const card = live(page).getByTestId('block-card');
		await expect(card).toHaveCount(1);
		await expect(card).toContainText('Auf dem Block');
		await expect(card).toContainText(name);
		await expect(card).toContainText(`${count} Stimmen`);
		const got = await card.evaluate((el, vote) => {
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
			// the colour a text sits on: its nearest ancestor with an opaque background
			const behind = (n: Element) => {
				let at: Element | null = n;
				while (at && channels(getComputedStyle(at).backgroundColor).a < 1) at = at.parentElement;
				return getComputedStyle(at ?? document.body).backgroundColor;
			};
			const leaves = [...el.querySelectorAll('*')].filter(
				(n) => [...n.childNodes].some((c) => c.nodeType === Node.TEXT_NODE && c.textContent!.trim() !== '')
			);
			const size = (n: Element) => Number.parseFloat(getComputedStyle(n).fontSize);
			const biggest = leaves.reduce((a, b) => (size(b) > size(a) ? b : a));
			const own = getComputedStyle(el);
			const ground = getComputedStyle(document.body).backgroundColor;
			const shape = (svg: Element | null) => svg?.innerHTML.replace(/<!--.*?-->|\s+|class="[^"]*"/g, '') ?? null;
			const axe = shape(el.querySelector('svg'));
			const badge = shape(document.querySelector('[data-stage]:not([data-leaving]) [data-badge="block"] svg'));
			return {
				biggest: biggest.textContent!.trim(),
				tied: leaves.filter((n) => size(n) === size(biggest)).length,
				min: Math.min(...leaves.map(size)),
				contrast: Math.min(
					...leaves.map((n) => {
						const [hi, lo] = [lum(channels(getComputedStyle(n).color)), lum(channels(behind(n)))].sort((a, b) => b - a);
						return (hi + 0.05) / (lo + 0.05);
					})
				),
				set: own.backgroundColor !== ground || (Number.parseFloat(own.borderTopWidth) > 0 && channels(own.borderTopColor).a > 0),
				axe: axe !== null && axe === badge,
				vote
			};
		}, `${count} Stimmen`);
		expect(got.biggest, name).toBe(got.vote);
		expect(got.tied, name).toBe(1);
		expect(got.min, name).toBeGreaterThanOrEqual(16);
		expect(got.contrast, name).toBeGreaterThanOrEqual(4.5);
		expect(got.set, name).toBe(true);
		expect(got.axe, name).toBe(true);
	}
	await open(page, tie);
	await expect(live(page).getByRole('button', { name: 'Tag beenden', exact: true })).toBeVisible();
	await expect(live(page).getByTestId('block-card')).toHaveCount(0);
});
