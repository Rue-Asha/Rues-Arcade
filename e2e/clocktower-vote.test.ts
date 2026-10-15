import { expect, test, type Page } from '@playwright/test';
import { sectorOf } from '../src/lib/games/clocktower/circle.ts';
import { F7, seated } from '../src/lib/games/clocktower/fixtures.ts';
import type { ClocktowerState } from '../src/lib/games/clocktower/types.ts';
import { play, seedClocktower } from './clocktower-session.ts';
import { live } from './helpers.ts';
import { day1, T0 } from './walks/clocktower-day.ts';

const SHORT = 300;
const seat = (page: Page, n: number) => live(page).locator(`[data-seat="${n}"]`);
const start = (page: Page) => live(page).getByRole('button', { name: 'Abstimmung beginnen', exact: true });
const under = (page: Page) => live(page).locator('[data-under]').getAttribute('data-under');
const handAngle = async (page: Page) =>
	Number.parseFloat(await live(page).locator('[data-hand]').evaluate((el) => (el as HTMLElement).style.getPropertyValue('--angle')));
const lit = (page: Page) =>
	live(page).locator('[data-seat][data-marked]').evaluateAll((els) => els.map((el) => Number((el as HTMLElement).dataset.seat)));
const savedVote = (page: Page) =>
	page.evaluate(() => JSON.parse(localStorage.getItem('arcade:session:clocktower')!).state.today.nominations[0]);

// the clock stands still until the test moves it; the sweep's timers fire only when it is run
async function frozen(page: Page, state: ClocktowerState, ms = SHORT) {
	await page.addInitScript((ms) => ((window as unknown as { clocktowerSeatMs: number }).clocktowerSeatMs = ms), ms);
	await page.clock.install({ time: T0 });
	await seedClocktower(page, state);
	await page.goto('/spiele/clocktower/spielen');
	await expect(seat(page, 1)).toBeVisible();
	await page.clock.pauseAt(T0 + 5_000);
}

// seat 1 nominates seat 4 of 7; the sweep runs 5, 6, 7, 1, 2, 3, 4
async function sweepOnSeat4(page: Page, ms = SHORT) {
	await frozen(page, day1(seated(F7)), ms);
	await seat(page, 4).click();
	await page.getByRole('dialog').getByRole('button', { name: 'Nominieren', exact: true }).click();
	await seat(page, 1).click();
	await start(page).click();
	await expect(live(page).locator('[data-sweep]')).toBeVisible();
	await page.clock.runFor(1);
	expect(await under(page)).toBe('5');
}

test('Scenario: Hand turns at a constant speed', async ({ page }) => {
	await sweepOnSeat4(page, 400);
	const hand = live(page).locator('[data-hand]');
	const angles: number[] = [];
	for (let k = 0; k < 7; k++) {
		angles.push(await handAngle(page));
		const move = await hand.evaluate((el) => {
			const s = getComputedStyle(el);
			return { duration: s.transitionDuration, timing: s.transitionTimingFunction, property: s.transitionProperty };
		});
		expect(move).toEqual({ duration: '0.4s', timing: 'linear', property: 'transform' });
		if (k < 6) await page.clock.runFor(400);
	}
	// each sector's end boundary: (nominee + 1.5 + k) · 360/7, so every step is 360/7 degrees
	angles.forEach((a, k) => expect(a).toBeCloseTo(((3 + 1.5 + k) * 360) / 7, 1));
	for (let k = 1; k < 7; k++) expect(angles[k] - angles[k - 1]).toBeCloseTo(360 / 7, 1);
});

test("Scenario: The hand's sector lights up", async ({ page }) => {
	await sweepOnSeat4(page);
	await page.clock.runFor(SHORT);
	expect(await under(page)).toBe('6');

	const wedge = async () => {
		const sectors = live(page).locator('[data-circle] [data-sector]');
		await expect(sectors).toHaveCount(1);
		return sectors.evaluate((el) => {
			const [cx, cy, ax, ay, bx, by] = el.getAttribute('d')!.match(/-?\d+(?:\.\d+)?/g)!.map(Number).filter((_, i) => [0, 1, 2, 3, 9, 10].includes(i));
			const deg = (x: number, y: number) => ((Math.atan2(x - cx, cy - y) * 180) / Math.PI + 360) % 360;
			return {
				seat: Number(el.getAttribute('data-sector')),
				from: deg(ax, ay),
				to: deg(bx, by),
				hidden: el.getAttribute('aria-hidden'),
				events: getComputedStyle(el.closest('svg')!).pointerEvents,
				pathEvents: getComputedStyle(el).pointerEvents
			};
		});
	};
	for (const n of [6, 7]) {
		const w = await wedge();
		expect(w.seat).toBe(n);
		expect(w.hidden).toBe('true');
		expect(w.events === 'none' || w.pathEvents === 'none').toBe(true);
		const centre = ((n - 1) * 360) / 7;
		expect((w.from + 360 - (centre - 180 / 7 + 360)) % 360).toBeCloseTo(0, 0);
		expect((w.to - w.from + 360) % 360).toBeCloseTo(360 / 7, 0);
		if (n === 6) await page.clock.runFor(SHORT);
	}

	// seats outside the sector are dimmed, so their text is judged composited over the ground
	const worst = await live(page).locator('[data-circle]').evaluate((circle) => {
		const rgb = (css: string) => {
			const ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true })!;
			ctx.fillStyle = css;
			ctx.fillRect(0, 0, 1, 1);
			const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
			return [r, g, b];
		};
		const mix = (a: number[], b: number[], t: number) => a.map((v, i) => v * t + b[i] * (1 - t));
		const lum = (c: number[]) => {
			const [r, g, b] = c.map((v) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
			return 0.2126 * r + 0.7152 * g + 0.0722 * b;
		};
		const ground = rgb(getComputedStyle(document.documentElement).getPropertyValue('--ground').trim());
		let lowest = Infinity;
		for (const el of circle.querySelectorAll<HTMLElement>('[data-seat]')) {
			const a = Number(getComputedStyle(el).opacity);
			const face = mix(rgb(getComputedStyle(el).backgroundColor), ground, a);
			const text = mix(rgb(getComputedStyle(el.querySelector('.name')!).color), ground, a);
			const [hi, lo] = [lum(face), lum(text)].sort((x, y) => y - x);
			lowest = Math.min(lowest, (hi + 0.05) / (lo + 0.05));
		}
		return lowest;
	});
	expect(worst).toBeGreaterThanOrEqual(4.5);
});

test("Scenario: Only the seat in the hand's sector can vote", async ({ page }) => {
	await sweepOnSeat4(page);
	await page.clock.runFor(SHORT);
	expect(await under(page)).toBe('6');

	for (const n of [2, 5]) {
		await expect(seat(page, n)).toHaveAttribute('aria-disabled', 'true');
		await expect(seat(page, n)).toHaveAttribute('title', 'Zeiger ist woanders');
		await seat(page, n).click({ force: true });
		await expect(seat(page, n)).not.toHaveAttribute('data-marked');
	}
	await expect(seat(page, 6)).toHaveAttribute('aria-disabled', 'false');
	await seat(page, 6).click();
	await expect(seat(page, 6)).toHaveAttribute('data-marked', '');
	await seat(page, 6).click();
	await expect(seat(page, 6)).not.toHaveAttribute('data-marked');
	await seat(page, 6).click();
	await expect(seat(page, 6)).toHaveAttribute('data-marked', '');
	expect(await lit(page)).toEqual([6]);

	await page.clock.runFor(SHORT * 7);
	await expect(live(page).getByTestId('count')).toHaveText('1');
	expect(await lit(page)).toEqual([6]);
	expect((await savedVote(page)).voters).toEqual([5]);
});

test("Scenario: Space votes only for the seat in the hand's sector", async ({ page }) => {
	await sweepOnSeat4(page);
	await page.clock.runFor(SHORT);
	expect(await under(page)).toBe('6');

	await expect(seat(page, 2)).toHaveAttribute('aria-disabled', 'true');
	await seat(page, 2).focus();
	await page.keyboard.press('Space');
	await expect(seat(page, 6)).toHaveAttribute('data-marked', '');
	await expect(seat(page, 2)).not.toHaveAttribute('data-marked');
});
