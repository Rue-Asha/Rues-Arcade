import { expect, test, type Page } from '@playwright/test';
import { characters } from '../src/lib/games/clocktower/characters.ts';
import { F7, seated } from '../src/lib/games/clocktower/fixtures.ts';
import type { CharacterId, ClocktowerAction, ClocktowerState } from '../src/lib/games/clocktower/types.ts';
import { play, seedClocktower } from './clocktower-session.ts';
import { live } from './helpers.ts';
import { atTimer, day1, ghost, ghostless, nightEnd, T0 } from './walks/clocktower-day.ts';

const NAMES = ['Alex', 'Bo', 'Cleo', 'Dani', 'Eli', 'Fey', 'Gus', 'Hana', 'Ida', 'Jo', 'Kai', 'Lu', 'Mo', 'Nia', 'Ole'];
const F8: CharacterId[] = [...F7, 'soldier'];
const F5C: CharacterId[] = ['washerwoman', 'empath', 'poisoner', 'imp', 'fortune-teller'];
const F15C: CharacterId[] = [
	'washerwoman', 'librarian', 'investigator', 'chef', 'empath', 'fortune-teller', 'undertaker', 'monk', 'ravenkeeper',
	'butler', 'saint', 'poisoner', 'spy', 'scarlet-woman', 'imp'
];

async function open(page: Page, state: ClocktowerState) {
	await seedClocktower(page, state);
	await page.goto('/spiele/clocktower/spielen');
}

const seat = (page: Page, n: number) => live(page).locator(`[data-seat="${n}"]`);

// seat boxes, their number and name, and the page width, measured in one go
const measure = (page: Page) =>
	live(page).locator('[data-circle]').evaluate((el) => {
		const rects = [...el.querySelectorAll<HTMLElement>('[data-seat]')].map((s) => {
			const r = s.getBoundingClientRect();
			const no = s.querySelector<HTMLElement>('.no')!;
			const name = s.querySelector<HTMLElement>('.name')!;
			return {
				w: r.width,
				h: r.height,
				no: no.checkVisibility() && no.textContent!.trim() === s.dataset.seat,
				name: name.checkVisibility() && name.textContent!.trim().length > 0,
				x: r.left + r.width / 2,
				y: r.top + r.height / 2
			};
		});
		return { rects, scroll: document.documentElement.scrollWidth, view: innerWidth };
	});

test('Scenario: Circle shows seats, alive and ghost votes', async ({ page }) => {
	const state = ghostless(ghost(day1(seated(F7)), 1), 4);
	await open(page, state);
	await expect(seat(page, 7)).toBeVisible();

	const seats = await live(page).locator('[data-seat]').evaluateAll((els) =>
		els.map((el) => {
			const r = el.getBoundingClientRect();
			return { n: Number((el as HTMLElement).dataset.seat), x: r.left + r.width / 2, y: r.top + r.height / 2, text: el.textContent!.replace(/\s+/g, ' ').trim() };
		})
	);
	expect(seats.map((s) => s.n)).toEqual([1, 2, 3, 4, 5, 6, 7]);
	const cx = seats.reduce((a, s) => a + s.x, 0) / seats.length;
	const cy = seats.reduce((a, s) => a + s.y, 0) / seats.length;
	// seat 1 is the topmost and straight above the centre; the angles then grow clockwise
	const angle = (s: { x: number; y: number }) => ((Math.atan2(s.x - cx, cy - s.y) * 180) / Math.PI + 360) % 360;
	expect(Math.min(...seats.map((s) => s.y))).toBeCloseTo(seats[0].y, 0);
	expect(Math.abs(seats[0].x - cx)).toBeLessThan(2);
	const angles = seats.map(angle);
	for (let i = 1; i < angles.length; i++) expect(angles[i]).toBeGreaterThan(angles[i - 1]);
	seats.forEach((s, i) => expect(s.text).toContain(NAMES[i]));

	await expect(page.getByRole('button', { name: 'Platz 2, Bo, tot, Stimme', exact: true })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Platz 5, Eli, tot, keine Stimme', exact: true })).toBeVisible();
	const marks = await Promise.all([2, 5].map((n) => seat(page, n).locator('.mark').textContent()));
	expect(marks[0]).not.toEqual(marks[1]);
	await expect(seat(page, 2)).toHaveAttribute('data-ghost', '');
	await expect(seat(page, 5)).not.toHaveAttribute('data-ghost');

	const text = (await live(page).innerText()).toLowerCase();
	for (const c of characters) expect(text, c.name).not.toContain(c.name.toLowerCase());
});

test('Scenario: Circle legible on phone and desktop', async ({ page }) => {
	for (const roles of [F5C, F15C]) {
		await open(page, day1(seated(roles)));
		await expect(seat(page, roles.length)).toBeVisible();
		await expect(live(page).locator('[data-seat]')).toHaveCount(roles.length);
		const { rects, scroll, view } = await measure(page);
		expect(scroll).toBeLessThanOrEqual(view);
		expect(rects.length).toBe(roles.length);
		for (const r of rects) {
			expect(r.w).toBeGreaterThanOrEqual(44);
			expect(r.h).toBeGreaterThanOrEqual(44);
			expect(r.no).toBe(true);
			expect(r.name).toBe(true);
		}
	}
});

test('Scenario: Header shows the night or day and the alive count', async ({ page }) => {
	const d1 = day1(seated(F8));
	const night2 = play(d1, [{ type: 'execute', seat: 1 }, { type: 'next' }]);
	await open(page, night2);
	await expect(page.getByTestId('status')).toHaveText('Nacht 2 · 7 von 8 leben');

	const day2 = play(nightEnd(night2, [2]), [{ type: 'next' }, { type: 'next' }, { type: 'timer', minutes: null, now: T0 }]);
	await open(page, day2);
	await expect(page.getByTestId('status')).toHaveText('Tag 2 · 6 von 8 leben');
	const font = await page.getByTestId('status').evaluate((el) => getComputedStyle(el).fontFamily);
	expect(font).toContain('Alegreya Sans');
});

test('Scenario: No grimoire by day', async ({ page }) => {
	await open(page, day1(seated(F7)));
	await expect(seat(page, 1)).toBeVisible();
	await expect(page.getByText(/Grimoire/i)).toHaveCount(0);
	await expect(page.getByRole('button', { name: /Grimoire/i })).toHaveCount(0);
});

// day 2 after night 2: the dawn of the second morning, `deaths` recorded
function dawn2(deaths: number[]): ClocktowerState {
	const night2 = play(day1(seated(F8)), [{ type: 'execute', seat: 1 }, { type: 'next' }]);
	return nightEnd(night2, deaths);
}

test('Scenario: Dawn shows the night\'s deaths', async ({ page }) => {
	await open(page, dawn2([2]));
	await expect(live(page).getByRole('heading', { name: 'Alle aufwachen', exact: true })).toBeVisible();
	await live(page).getByRole('button', { name: 'Weiter', exact: true }).click();
	await expect(live(page).getByRole('heading', { name: 'Cleo ist gestorben', exact: true })).toBeVisible();
	await expect(seat(page, 3)).toHaveAttribute('data-dead', '');
	await expect(seat(page, 3)).toHaveClass(/dying/);

	await open(page, dawn2([]));
	await live(page).getByRole('button', { name: 'Weiter', exact: true }).click();
	await expect(live(page).getByRole('heading', { name: 'Niemand ist gestorben', exact: true })).toBeVisible();
	await expect(live(page).locator('.dying')).toHaveCount(0);
});

test('Scenario: Death on the circle is animated', async ({ page }) => {
	const toDeaths = async () => {
		await open(page, dawn2([2]));
		await live(page).getByRole('button', { name: 'Weiter', exact: true }).click();
		await expect(seat(page, 3)).toHaveAttribute('data-dead', '');
	};
	const running = () =>
		seat(page, 3).evaluate((el) => el.getAnimations().filter((a) => a.playState === 'running' && a.effect?.getTiming().iterations !== Infinity).length);

	await toDeaths();
	expect(await running()).toBeGreaterThan(0);

	await page.emulateMedia({ reducedMotion: 'reduce' });
	await toDeaths();
	expect(await running()).toBe(0);
	await expect(seat(page, 3).locator('.mark')).toBeVisible();
});

test('Scenario: Day timer dialog', async ({ page }) => {
	await open(page, atTimer(seated(F7)));
	const minutes = live(page).getByTestId('minutes');
	await expect(minutes).toHaveText('8 min');
	const less = live(page).getByRole('button', { name: 'Minute weniger', exact: true });
	const more = live(page).getByRole('button', { name: 'Minute mehr', exact: true });
	for (let i = 0; i < 8; i++) await less.click();
	await expect(minutes).toHaveText('1 min');
	for (let i = 0; i < 60; i++) await more.click();
	await expect(minutes).toHaveText('59 min');

	await live(page).getByRole('button', { name: 'Ohne Timer', exact: true }).click();
	await expect(seat(page, 1)).toBeVisible();
	await expect(page.getByTestId('timer')).toHaveCount(0);
});

test('Scenario: Reload keeps the remaining time', async ({ page }) => {
	await page.clock.install({ time: T0 });
	await open(page, atTimer(seated(F7)));
	const minutes = live(page).getByTestId('minutes');
	const less = live(page).getByRole('button', { name: 'Minute weniger', exact: true });
	for (let i = 0; i < 3; i++) await less.click();
	await expect(minutes).toHaveText('5 min');
	await live(page).getByRole('button', { name: 'Timer starten', exact: true }).click();
	await expect(page.getByTestId('timer')).toHaveText('5:00');

	await page.clock.runFor(120_000);
	await page.reload();
	const left = await page.getByTestId('timer').textContent();
	const [m, sec] = left!.split(':').map(Number);
	expect(m * 60 + sec).toBeLessThanOrEqual(180);
	expect(m * 60 + sec).toBeGreaterThan(175);
});

test('Scenario: Timer reads Zeit um at zero and never blocks', async ({ page }) => {
	await page.clock.install({ time: T0 });
	await open(page, day1(seated(F7), 1));
	await expect(page.getByTestId('timer')).toHaveText('1:00');
	await page.clock.runFor(61_000);
	const timer = page.getByTestId('timer');
	await expect(timer).toHaveText('Zeit um');
	const [color, evil] = await timer.evaluate((el) => {
		const probe = document.createElement('span');
		probe.style.color = 'var(--evil)';
		document.body.append(probe);
		const evil = getComputedStyle(probe).color;
		probe.remove();
		return [getComputedStyle(el).color, evil];
	});
	expect(color).toBe(evil);
	await expect(seat(page, 1)).toBeEnabled();
});
