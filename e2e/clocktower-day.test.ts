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
				larger: Number.parseFloat(getComputedStyle(name).fontSize) > Number.parseFloat(getComputedStyle(no).fontSize),
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
	// the unused badge is filled and shows the plain glyph, the spent one is hollow and struck through
	const badges = await Promise.all(
		[2, 5].map((n) =>
			seat(page, n).locator('[data-badge="ghost"]').evaluate((el) => ({
				spent: el.hasAttribute('data-spent'),
				fill: getComputedStyle(el).backgroundColor,
				glyph: el.querySelector('svg')!.innerHTML
			}))
		)
	);
	expect(badges.map((b) => b.spent)).toEqual([false, true]);
	expect(badges[0].fill).not.toEqual(badges[1].fill);
	expect(badges[0].glyph).not.toEqual(badges[1].glyph);
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
			expect(r.larger).toBe(true);
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
	// the seat's own finite animations and those of its parts (the red ring), with their keyframes
	const running = () =>
		seat(page, 3).evaluate((el) =>
			el
				.getAnimations({ subtree: true })
				.filter((a) => a.playState === 'running' && a.effect?.getTiming().iterations !== Infinity)
				.map((a) => {
					const effect = a.effect as KeyframeEffect;
					const frames = effect.getKeyframes();
					const keys = frames.flatMap((k) => Object.keys(k));
					return {
						seat: effect.target === el,
						pulse: (effect.target as HTMLElement).hasAttribute('data-pulse'),
						name: (a as CSSAnimation).animationName ?? '',
						ms: Number(effect.getTiming().duration),
						props: [...new Set(keys)].filter((k) => !['offset', 'computedOffset', 'easing', 'composite'].includes(k)).sort(),
						transforms: frames.map((k) => String(k.transform ?? ''))
					};
				})
		);
	// what is left once every animation has ended
	const rest = () =>
		seat(page, 3).evaluate(async (el) => {
			await Promise.all(el.getAnimations({ subtree: true }).map((a) => a.finished.catch(() => {})));
			const style = getComputedStyle(el);
			return {
				dead: el.hasAttribute('data-dead'),
				dashed: style.borderTopStyle === 'dashed',
				opacity: Number(style.opacity),
				transform: style.transform,
				badge: el.querySelector('[data-badge="ghost"]')?.checkVisibility() ?? false,
				running: el.getAnimations({ subtree: true }).length
			};
		});
	const still = { dead: true, dashed: true, opacity: 1, transform: 'none', badge: true, running: 0 };

	await toDeaths();
	const motion = await running();
	const own = motion.filter((a) => a.seat);
	expect(own).toHaveLength(1);
	expect(own[0].name).toMatch(/death/);
	expect(own[0].ms).toBeGreaterThanOrEqual(800);
	expect(own[0].ms).toBeLessThanOrEqual(1200);
	// the node sinks 4px
	expect(own[0].transforms.some((t) => t.includes('4px'))).toBe(true);
	expect(motion.filter((a) => a.pulse)).toHaveLength(1);
	for (const a of motion) {
		expect(a.props.length).toBeGreaterThan(0);
		for (const prop of a.props) expect(['transform', 'opacity'], prop).toContain(prop);
	}
	expect(await rest()).toEqual(still);

	await page.emulateMedia({ reducedMotion: 'reduce' });
	await toDeaths();
	expect(await running()).toEqual([]);
	expect(await rest()).toEqual(still);
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
	const left = await live(page).getByTestId('timer').textContent();
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
	await toClock(page, 3, 1);
	await expect(live(page).getByRole('heading', { name: 'Alex nominiert Cleo', exact: true })).toBeVisible();
	await expect(live(page).getByTestId('timer')).toHaveText('Zeit um');
	await live(page).getByRole('button', { name: 'Zurück', exact: true }).click();
	await endDay(page);
	await expect(live(page).getByRole('heading', { name: 'Heute wird niemand hingerichtet', exact: true })).toBeVisible();
});

const live_ = (page: Page) => live(page);
const dialog = (page: Page) => page.getByRole('dialog');

// Alex..Bo..: Bo nominated Cleo today (voted, 0 votes), Dani is dead
function nominated(): ClocktowerState {
	return ghost(play(day1(seated(F7)), [
		{ type: 'nominee', seat: 2 }, { type: 'nominate', nominator: 1 }, { type: 'vote' }, { type: 'swept' },
		{ type: 'confirm' }, { type: 'next' }
	]), 3);
}

async function nominate(page: Page, nominee: number) {
	await seat(page, nominee).click();
	await dialog(page).getByRole('button', { name: 'Nominieren', exact: true }).click();
}

test('Scenario: Unavailable choices show a reason', async ({ page }) => {
	await open(page, nominated());
	await seat(page, 3).click();
	await expect(dialog(page).getByRole('button', { name: 'Nominieren', exact: true })).toBeDisabled();
	await expect(dialog(page).getByText('heute schon nominiert', { exact: true })).toBeVisible();
	await dialog(page).getByRole('button', { name: 'Schließen', exact: true }).click();
	await expect(dialog(page)).toHaveCount(0);

	await nominate(page, 5);
	await expect(live_(page).getByRole('heading', { name: 'Wer nominiert Eli?', exact: true })).toBeVisible();
	await expect(seat(page, 2)).toHaveAttribute('aria-disabled', 'true');
	await expect(seat(page, 2)).toHaveAttribute('title', 'hat heute schon nominiert');
	await expect(seat(page, 4)).toHaveAttribute('aria-disabled', 'true');
	await expect(seat(page, 4)).toHaveAttribute('title', 'ist tot');
	await expect(seat(page, 1)).toHaveAttribute('aria-disabled', 'false');
	await expect(live_(page).getByText('Bo: hat heute schon nominiert', { exact: true })).toBeVisible();
	await expect(live_(page).getByText('Dani: ist tot', { exact: true })).toBeVisible();

	await seat(page, 4).click({ force: true });
	await expect(live_(page).getByRole('heading', { name: 'Wer nominiert Eli?', exact: true })).toBeVisible();
});

test('Scenario: Zurück cancels the nomination unused', async ({ page }) => {
	await open(page, day1(seated(F7)));
	await nominate(page, 2);
	await live_(page).getByRole('button', { name: 'Zurück', exact: true }).click();
	await expect(seat(page, 2)).toBeEnabled();

	await nominate(page, 2);
	await seat(page, 1).click();
	await expect(live_(page).getByRole('button', { name: 'Abstimmung beginnen', exact: true })).toBeVisible();
	await live_(page).getByRole('button', { name: 'Zurück', exact: true }).click();

	await seat(page, 2).click();
	await expect(dialog(page).getByRole('button', { name: 'Nominieren', exact: true })).toBeEnabled();
	await dialog(page).getByRole('button', { name: 'Nominieren', exact: true }).click();
	await expect(seat(page, 1)).toHaveAttribute('aria-disabled', 'false');
	await expect(live_(page).getByText('Alex: hat heute schon nominiert', { exact: true })).toHaveCount(0);
});

// 7 players, seat 7 dead (6 alive, threshold 3); Bo's nomination of Cleo with 3 votes put Cleo on the block, high 3
const voting = () => play(ghost(day1(seated(F7), 5), 6), [
	{ type: 'nominee', seat: 2 }, { type: 'nominate', nominator: 1 }, { type: 'vote' }, { type: 'swept' },
	{ type: 'count', votes: 3 }, { type: 'confirm' }, { type: 'next' }
]);

const SHORT = 300;
async function shortSweep(page: Page) {
	await page.addInitScript((ms) => ((window as unknown as { clocktowerSeatMs: number }).clocktowerSeatMs = ms), SHORT);
}
const under = (page: Page) => live(page).locator('[data-under]').getAttribute('data-under');
const handAngle = (page: Page) => live(page).locator('[data-hand]').evaluate((el) => (el as HTMLElement).style.getPropertyValue('--angle'));
const lit = (page: Page) =>
	live(page).locator('[data-seat][data-marked]').evaluateAll((els) => els.map((el) => Number((el as HTMLElement).dataset.seat)));

// the clock stands still until the test moves it; the sweep's timers fire only when it is run
async function frozen(page: Page, state: ClocktowerState) {
	await page.clock.install({ time: T0 });
	await open(page, state);
	await expect(seat(page, 1)).toBeVisible();
	await page.clock.pauseAt(T0 + 5_000);
}

async function toClock(page: Page, nominee: number, nominator: number) {
	await nominate(page, nominee);
	await seat(page, nominator).click();
	await expect(live(page).getByRole('button', { name: 'Abstimmung beginnen', exact: true })).toBeVisible();
}

test('Scenario: Clock points at the nominee', async ({ page }) => {
	await open(page, voting());
	await toClock(page, 4, 1);
	await expect(live(page).getByRole('button', { name: 'Zurück', exact: true })).toBeVisible();
	await expect(live(page).getByText('Nötig: 3', { exact: true })).toBeVisible();
	await expect(live(page).getByText('Höchststand: 3', { exact: true })).toBeVisible();
	expect(Number.parseFloat(await handAngle(page))).toBeCloseTo((3 * 360) / 7, 1);
});

test('Scenario: Real short sweep marks votes', async ({ page }) => {
	await shortSweep(page);
	await frozen(page, day1(seated(F7)));
	await toClock(page, 3, 1);
	await live(page).getByRole('button', { name: 'Abstimmung beginnen', exact: true }).click();
	await expect(live(page).locator('[data-sweep]')).toBeVisible();

	await seat(page, 5).click();
	// the first seat after the nominee (seat 3) is seat 4; seat 6 is two steps on
	await page.clock.runFor(1);
	expect(await under(page)).toBe('4');
	await page.clock.runFor(SHORT * 2);
	expect(await under(page)).toBe('6');
	await page.keyboard.press('Space');
	await expect.poll(() => lit(page)).toEqual([5, 6]);
	// a turning hand must not widen the page
	expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

	await page.clock.runFor(SHORT * 4);
	expect(await under(page)).toBe('3');
	expect(Number.parseFloat(await handAngle(page))).toBeGreaterThan(0);
	await page.clock.runFor(SHORT);
	await expect(live(page).getByTestId('count')).toHaveText('2');
	expect(await lit(page)).toEqual([5, 6]);
});

test('Scenario: Tapping any seat during the sweep toggles its vote', async ({ page }) => {
	await shortSweep(page);
	await frozen(page, day1(seated(F7)));
	await toClock(page, 4, 1);
	await live(page).getByRole('button', { name: 'Abstimmung beginnen', exact: true }).click();
	await page.clock.runFor(1);
	await page.clock.runFor(SHORT);
	expect(await under(page)).toBe('6');

	await seat(page, 2).click();
	await expect(seat(page, 2)).toHaveAttribute('data-marked', '');
	expect(await under(page)).toBe('6');
	await seat(page, 5).click();
	await expect(seat(page, 5)).toHaveAttribute('data-marked', '');
	await seat(page, 5).click();
	await expect(seat(page, 5)).not.toHaveAttribute('data-marked');
	expect(await under(page)).toBe('6');

	await page.clock.runFor(SHORT * 6);
	await expect(live(page).getByTestId('count')).toHaveText('1');
	expect(await lit(page)).toEqual([2]);
});

test('Scenario: Space marks only the seat under the hand', async ({ page }) => {
	await shortSweep(page);
	await frozen(page, day1(seated(F7)));
	await toClock(page, 4, 1);
	await live(page).getByRole('button', { name: 'Abstimmung beginnen', exact: true }).click();
	await page.clock.runFor(1);
	await page.clock.runFor(SHORT);
	expect(await under(page)).toBe('6');

	await seat(page, 2).focus();
	await page.keyboard.press('Space');
	await expect(seat(page, 6)).toHaveAttribute('data-marked', '');
	await expect(seat(page, 2)).not.toHaveAttribute('data-marked');
});

test('Scenario: Dead without ghost vote cannot be marked', async ({ page }) => {
	await shortSweep(page);
	await frozen(page, ghostless(day1(seated(F7)), 4));
	await toClock(page, 3, 1);
	await live(page).getByRole('button', { name: 'Abstimmung beginnen', exact: true }).click();
	await page.clock.runFor(1);
	await expect(seat(page, 5)).toHaveAttribute('aria-label', 'Platz 5, Eli, tot, keine Stimme');
	await page.clock.runFor(SHORT);
	expect(await under(page)).toBe('5');
	await seat(page, 5).click({ force: true });
	await page.keyboard.press('Space');
	await expect(seat(page, 5)).not.toHaveAttribute('data-marked');
	await seat(page, 4).click();
	await expect(seat(page, 4)).toHaveAttribute('data-marked', '');
});

// seats 4 and 5 voted in the sweep, count 2, on the confirm screen
const counted = () => play(day1(seated(F7)), [
	{ type: 'nominee', seat: 2 }, { type: 'nominate', nominator: 0 }, { type: 'vote' },
	{ type: 'mark', seat: 3, on: true }, { type: 'mark', seat: 4, on: true }, { type: 'swept' }
]);

test('Scenario: Confirm corrects missed timing', async ({ page }) => {
	await open(page, counted());
	const count = live(page).getByTestId('count');
	await expect(count).toHaveText('2');
	await seat(page, 2).click();
	await expect(seat(page, 2)).toHaveAttribute('data-marked', '');
	await expect(count).toHaveText('3');
	await live(page).getByRole('button', { name: 'Stimme mehr', exact: true }).click();
	await expect(count).toHaveText('4');
	await live(page).getByRole('button', { name: 'Bestätigen', exact: true }).click();

	await expect(live(page).getByText('Cleo kommt auf den Block', { exact: true })).toBeVisible();
	const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('arcade:session:clocktower')!).state.today.nominations[0]);
	expect(saved.votes).toBe(4);
	expect(saved.voters).toEqual([1, 3, 4]);
});

test('Scenario: Reduced motion hand jumps', async ({ page }) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await shortSweep(page);
	await frozen(page, day1(seated(F7)));
	await toClock(page, 3, 1);
	await live(page).getByRole('button', { name: 'Abstimmung beginnen', exact: true }).click();
	const moving = () =>
		live(page).locator('[data-hand]').evaluate((el) => el.getAnimations().filter((a) => a.playState === 'running').length);
	await page.clock.runFor(1);
	const first = await handAngle(page);
	expect(await moving()).toBe(0);
	await page.clock.runFor(SHORT);
	expect(await handAngle(page)).not.toBe(first);
	expect(await moving()).toBe(0);
});

test('Scenario: Timer keeps running during a vote', async ({ page }) => {
	await frozen(page, day1(seated(F7), 5));
	await toClock(page, 3, 1);
	const secs = async () => {
		const [m, s] = (await live(page).getByTestId('timer').textContent())!.split(':').map(Number);
		return m * 60 + s;
	};
	await live(page).getByRole('button', { name: 'Abstimmung beginnen', exact: true }).click();
	await page.clock.runFor(1);
	await expect(live(page).locator('[data-sweep]')).toBeVisible();
	const before = await secs();
	await page.clock.runFor(5_000);
	await expect.poll(secs).toBe(before - 5);
	await expect(live(page).locator('[data-sweep]')).toBeVisible();
	// the sweep of 7 seats ends inside the minute, the count is still part of the vote
	await page.clock.runFor(55_000);
	await expect(live(page).getByRole('heading', { name: 'Stimmen zählen', exact: true })).toBeVisible();
	await expect.poll(secs).toBe(before - 60);
});

test('Scenario: Block holder marked on the circle', async ({ page }) => {
	const first = play(day1(seated(F7)), [
		{ type: 'nominee', seat: 3 }, { type: 'nominate', nominator: 0 }, { type: 'vote' }, { type: 'swept' },
		{ type: 'count', votes: 4 }, { type: 'confirm' }, { type: 'next' }
	]);
	await open(page, first);
	await expect(live(page).locator('[data-block]')).toHaveCount(1);
	await expect(seat(page, 4)).toHaveAttribute('data-block', '');
	await expect(live(page).locator('[data-badge="block"]')).toHaveCount(1);
	await expect(seat(page, 4).locator('[data-badge="block"]')).toBeVisible();
	await expect(live(page).getByText('Auf dem Block: Dani', { exact: true })).toBeVisible();

	const second = play(first, [
		{ type: 'nominee', seat: 5 }, { type: 'nominate', nominator: 1 }, { type: 'vote' }, { type: 'swept' },
		{ type: 'count', votes: 5 }, { type: 'confirm' }, { type: 'next' }
	]);
	await open(page, second);
	await expect(live(page).locator('[data-block]')).toHaveCount(1);
	await expect(seat(page, 6)).toHaveAttribute('data-block', '');
	await expect(live(page).locator('[data-badge="block"]')).toHaveCount(1);
	await expect(seat(page, 6).locator('[data-badge="block"]')).toBeVisible();
	await expect(live(page).getByText('Auf dem Block: Fey', { exact: true })).toBeVisible();
});

const noNames = async (page: Page) => {
	const text = (await dialog(page).innerText()).toLowerCase();
	for (const c of characters) expect(text, c.name).not.toContain(c.name.toLowerCase());
};

test('Scenario: Seat actions name no character', async ({ page }) => {
	await open(page, ghost(day1(seated(F7)), 1));
	await seat(page, 1).click();
	for (const name of ['Nominieren', 'Sofort hinrichten', 'Ist gestorben'])
		await expect(dialog(page).getByRole('button', { name, exact: true })).toBeVisible();
	await expect(dialog(page).getByRole('button', { name: 'Lebt doch', exact: true })).toHaveCount(0);
	await noNames(page);
	await dialog(page).getByRole('button', { name: 'Schließen', exact: true }).click();

	await seat(page, 2).click();
	for (const name of ['Lebt doch', 'Geisterstimme weg'])
		await expect(dialog(page).getByRole('button', { name, exact: true })).toBeVisible();
	await expect(dialog(page).getByRole('button', { name: 'Sofort hinrichten', exact: true })).toHaveCount(0);
	await noNames(page);

	await dialog(page).getByRole('button', { name: 'Geisterstimme weg', exact: true }).click();
	await expect(seat(page, 2)).not.toHaveAttribute('data-ghost');
	await seat(page, 2).click();
	await dialog(page).getByRole('button', { name: 'Geisterstimme zurück', exact: true }).click();
	await expect(seat(page, 2)).toHaveAttribute('data-ghost', '');
	await seat(page, 2).click();
	await dialog(page).getByRole('button', { name: 'Lebt doch', exact: true }).click();
	await expect(seat(page, 2)).not.toHaveAttribute('data-dead');

	await seat(page, 3).click();
	await dialog(page).getByRole('button', { name: 'Ist gestorben', exact: true }).click();
	await expect(seat(page, 3)).toHaveAttribute('data-dead', '');
	await expect(live(page).getByRole('button', { name: 'Tag beenden', exact: true })).toBeVisible();

	await seat(page, 4).click();
	await dialog(page).getByRole('button', { name: 'Sofort hinrichten', exact: true }).click();
	await expect(live(page).getByRole('heading', { name: 'Dani wird hingerichtet', exact: true })).toBeVisible();
	await expect(seat(page, 4)).toHaveAttribute('data-dead', '');
});

const withBlock = () => play(day1(seated(F7)), [
	{ type: 'nominee', seat: 3 }, { type: 'nominate', nominator: 0 }, { type: 'vote' }, { type: 'swept' },
	{ type: 'count', votes: 4 }, { type: 'confirm' }, { type: 'next' }
]);

async function endDay(page: Page) {
	await live(page).getByRole('button', { name: 'Tag beenden', exact: true }).click();
	await dialog(page).getByRole('button', { name: 'Ja, Tag beenden', exact: true }).click();
}

test('Scenario: Tag beenden executes the block holder', async ({ page }) => {
	await open(page, withBlock());
	await live(page).getByRole('button', { name: 'Tag beenden', exact: true }).click();
	await expect(dialog(page).getByText('Dani wird hingerichtet.', { exact: true })).toBeVisible();
	await dialog(page).getByRole('button', { name: 'Ja, Tag beenden', exact: true }).click();
	await expect(live(page).getByRole('heading', { name: 'Dani wird hingerichtet', exact: true })).toBeVisible();
	await expect(seat(page, 4)).toHaveAttribute('data-dead', '');
	await live(page).getByRole('button', { name: 'Weiter', exact: true }).click();
	await expect(page.getByTestId('status')).toHaveText('Nacht 2 · 6 von 7 leben');
});

test('Scenario: No execution after a tie or without nominations', async ({ page }) => {
	const tie = play(withBlock(), [
		{ type: 'nominee', seat: 5 }, { type: 'nominate', nominator: 1 }, { type: 'vote' }, { type: 'swept' },
		{ type: 'count', votes: 4 }, { type: 'confirm' }, { type: 'next' }
	]);
	await open(page, tie);
	await expect(live(page).locator('[data-block]')).toHaveCount(0);
	await endDay(page);
	await expect(live(page).getByRole('heading', { name: 'Heute wird niemand hingerichtet', exact: true })).toBeVisible();
	await expect(live(page).locator('[data-dead]')).toHaveCount(0);

	await open(page, day1(seated(F7)));
	await endDay(page);
	await expect(live(page).getByRole('heading', { name: 'Heute wird niemand hingerichtet', exact: true })).toBeVisible();
	await expect(live(page).locator('[data-dead]')).toHaveCount(0);
});
