import { expect, test, type Page } from '@playwright/test';
import { F7, seated } from '../src/lib/games/clocktower/fixtures.ts';
import type { CharacterId, ClocktowerAction, ClocktowerState } from '../src/lib/games/clocktower/types.ts';
import { play, seedClocktower } from './clocktower-session.ts';
import { live } from './helpers.ts';
import { atTimer, day1, nightEnd, T0 } from './walks/clocktower-day.ts';

const F8: CharacterId[] = [...F7, 'soldier'];
const F15C: CharacterId[] = [
	'washerwoman', 'librarian', 'investigator', 'chef', 'empath', 'fortune-teller', 'undertaker', 'monk', 'ravenkeeper',
	'butler', 'saint', 'poisoner', 'spy', 'scarlet-woman', 'imp'
];

async function open(page: Page, state: ClocktowerState) {
	await seedClocktower(page, state);
	await page.goto('/spiele/clocktower/spielen');
	await expect(live(page)).toBeVisible();
}

const timed = (s: ClocktowerState, minutes: number, ago = 0) =>
	play(atTimer(s), [{ type: 'timer', minutes, now: Date.now() - ago }]);

const vote = (nominee: number, nominator: number, votes: number): ClocktowerAction[] => [
	{ type: 'nominee', seat: nominee }, { type: 'nominate', nominator }, { type: 'vote' }, { type: 'swept' },
	{ type: 'count', votes }, { type: 'confirm' }
];

// Dani (seat 4) on the block after a 4-vote nomination by Alex, 7 seats
const blocked = (s: ClocktowerState) => play(s, vote(3, 0, Math.ceil(s.seats.length / 2)).concat({ type: 'next' }));
const toClock = (s: ClocktowerState, by = 0) => play(s, [{ type: 'nominee', seat: 2 }, { type: 'nominate', nominator: by }]);
const toSweep = (s: ClocktowerState) => play(toClock(s), [{ type: 'vote' }]);
const toConfirm = (s: ClocktowerState) => play(toSweep(s), [{ type: 'swept' }]);
const toResult = (s: ClocktowerState) => play(toConfirm(s), [{ type: 'count', votes: 4 }, { type: 'confirm' }]);

// night 2 has ended, seat 3 died; the dawn of the second morning
const dawn2 = (deaths: number[]) =>
	nightEnd(play(day1(seated(F8)), [{ type: 'execute', seat: 1 }, { type: 'next' }]), deaths);

test('Scenario: Day timer stands out', async ({ page }) => {
	for (const ago of [0, 180_000]) {
		const base = timed(seated(F7), 1, ago);
		for (const [name, state] of [
			['grimoire', blocked(base)],
			['nominator', play(base, [{ type: 'nominee', seat: 2 }])],
			['clock', toClock(base)],
			['sweep', toSweep(base)],
			['confirm', toConfirm(base)],
			['result', toResult(base)]
		] as const) {
			await open(page, state);
			const timer = live(page).getByTestId('timer');
			await expect(timer, name).toBeVisible();
			if (ago > 0) await expect(timer).toHaveText('Zeit um');
			const got = await timer.evaluate((el) => {
				const heading = document.querySelector('[data-stage]:not([data-leaving]) h2, [data-stage]:not([data-leaving]) [role="heading"]')!;
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
				let ground = el as HTMLElement | null;
				while (ground && channels(getComputedStyle(ground).backgroundColor).a < 1) ground = ground.parentElement;
				const [hi, lo] = [lum(channels(getComputedStyle(el).color)), lum(channels(getComputedStyle(ground ?? document.body).backgroundColor))].sort((a, b) => b - a);
				const probe = document.createElement('span');
				probe.style.color = 'var(--evil)';
				document.body.append(probe);
				const evil = getComputedStyle(probe).color;
				probe.remove();
				// the timer is its framed block (dial and text), not just the reading
				const r = el.parentElement!.getBoundingClientRect();
				const head = heading.parentElement!.getBoundingClientRect();
				const range = document.createRange();
				range.selectNodeContents(heading);
				const text = [...range.getClientRects()];
				return {
					right: head.right - r.right,
					top: r.top - head.top,
					overlap: text.some((t) => t.left < r.right && t.right > r.left && t.top < r.bottom && t.bottom > r.top),
					size: Number.parseFloat(getComputedStyle(el).fontSize),
					head: Number.parseFloat(getComputedStyle(heading).fontSize),
					inHeading: el.closest('h1, h2, h3, [role="heading"]') !== null,
					contrast: (hi + 0.05) / (lo + 0.05),
					first: r.top >= 0 && r.bottom <= innerHeight,
					evil: getComputedStyle(el).color === evil
				};
			});
			const label = `${name} ${ago > 0 ? 'late' : 'running'}`;
			expect(got.inHeading, label).toBe(false);
			expect(got.size, label).toBeGreaterThan(got.head);
			expect(got.contrast, label).toBeGreaterThanOrEqual(4.5);
			expect(got.first, label).toBe(true);
			expect(got.right, label).toBeGreaterThanOrEqual(-4);
			expect(got.right, label).toBeLessThanOrEqual(4);
			expect(Math.abs(got.top), label).toBeLessThanOrEqual(4);
			expect(got.overlap, label).toBe(false);
			if (ago > 0) expect(got.evil, label).toBe(true);
		}
	}
});

test('Scenario: Last minute warns without blocking', async ({ page }) => {
	const block = () => live(page).getByTestId('timer').locator('xpath=..');
	const looping = () =>
		block().evaluate((el) =>
			el.getAnimations({ subtree: true }).filter((a) => a.effect!.getTiming().iterations === Infinity).map((a) => ({
				pseudo: (a.effect as KeyframeEffect).pseudoElement,
				props: [...new Set((a.effect as KeyframeEffect).getKeyframes().flatMap((k) => Object.keys(k)))].filter((p) => !['offset', 'easing', 'composite', 'computedOffset'].includes(p))
			}))
		);
	await page.clock.install({ time: T0 });
	await open(page, day1(seated(F7), 2));
	await expect(live(page).getByTestId('timer')).toHaveText('2:00');
	await expect(block()).not.toHaveClass(/late/);
	expect(await looping()).toEqual([]);

	await page.clock.runFor(61_000);
	await expect(live(page).getByTestId('timer')).toHaveText('0:59');
	await expect(block()).toHaveClass(/late/);
	const got = await looping();
	expect(got.length).toBeGreaterThan(0);
	for (const a of got) expect(['opacity', 'transform'], a.pseudo ?? '').toEqual(expect.arrayContaining(a.props));
	const end = live(page).getByRole('button', { name: 'Tag beenden', exact: true });
	await end.scrollIntoViewIfNeeded();
	expect(await end.evaluate((el) => {
		const r = el.getBoundingClientRect();
		const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
		return hit === el || el.contains(hit);
	})).toBe(true);
	await end.click();
	await expect(page.getByRole('dialog').getByRole('heading', { name: 'Tag beenden?', exact: true })).toBeVisible();
	await page.getByRole('dialog').getByRole('button', { name: 'Weiter beraten', exact: true }).click();

	await page.emulateMedia({ reducedMotion: 'reduce' });
	expect(await looping()).toEqual([]);
	await expect(block()).toHaveClass(/late/);
});

// Bo nominated Cleo today, Dani is dead; seat 5 is being nominated
const picker = () =>
	play(
		{ ...day1(seated(F7)), seats: day1(seated(F7)).seats.map((x, i) => (i === 3 ? { ...x, alive: false, ghostVote: true } : x)) },
		[{ type: 'nominee', seat: 2 }, { type: 'nominate', nominator: 1 }, { type: 'vote' }, { type: 'swept' }, { type: 'confirm' }, { type: 'next' }, { type: 'nominee', seat: 4 }]
	);

test('Scenario: Day facts sit in a box', async ({ page }) => {
	const base = timed(seated(F7), 5);
	const screens: [string, ClocktowerState, string[]][] = [
		['grimoire', blocked(base), ['Auf dem Block: Dani']],
		['picker', picker(), ['Bo: hat heute schon nominiert', 'Dani: ist tot']],
		['clock', toClock(blocked(base), 1), ['Nötig: 4', 'Höchststand: 4']],
		['sweep', play(toClock(blocked(base), 1), [{ type: 'vote' }]), ['Nötig: 4', 'Höchststand: 4', 'Platz antippen oder Leertaste, solange der Zeiger in seinem Kreisstück steht.']],
		['result', toResult(base), ['4 Stimmen']]
	];
	for (const [name, state, texts] of screens) {
		await open(page, state);
		const box = live(page).getByTestId('day-facts');
		await expect(box, name).toHaveCount(1);
		const got = await box.evaluate((el) => {
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
			const own = getComputedStyle(el);
			const bg = own.backgroundColor;
			const ground = getComputedStyle(document.body).backgroundColor;
			const leaves = [...el.querySelectorAll('*')].filter((n) => n.children.length === 0 && n.textContent!.trim() !== '');
			const text = el.textContent!.replace(/\s+/g, ' ').trim();
			return {
				text,
				set: bg !== ground || (Number.parseFloat(own.borderTopWidth) > 0 && channels(own.borderTopColor).a > 0),
				size: Math.min(...leaves.map((n) => Number.parseFloat(getComputedStyle(n).fontSize))),
				contrast: Math.min(
					...leaves.map((n) => {
						const [hi, lo] = [lum(channels(getComputedStyle(n).color)), lum(channels(bg))].sort((a, b) => b - a);
						return (hi + 0.05) / (lo + 0.05);
					})
				),
				solid: channels(bg).a === 1
			};
		});
		for (const t of texts) expect(got.text, name).toContain(t);
		expect(got.set, name).toBe(true);
		expect(got.solid, name).toBe(true);
		expect(got.size, name).toBeGreaterThanOrEqual(16);
		expect(got.contrast, name).toBeGreaterThanOrEqual(4.5);
	}
});

test('Scenario: Day screens keep the action after the circle', async ({ page }) => {
	const base = timed(seated(F15C), 8);
	const screens: [string, ClocktowerState][] = [
		['grimoire', blocked(base)],
		['picker', play(base, [{ type: 'nominee', seat: 2 }])],
		['clock', toClock(base)],
		['confirm', toConfirm(base)],
		['result', toResult(base)],
		['execution', play(blocked(base), [{ type: 'endDay' }])]
	];
	for (const [name, state] of screens) {
		await open(page, state);
		await expect(live(page).locator('[data-seat]')).toHaveCount(15);
		const got = await live(page).evaluate((root) => {
			const circle = root.querySelector('[data-circle]')!.getBoundingClientRect();
			const buttons = [...root.querySelectorAll<HTMLElement>('button:not([data-seat])')];
			const fixed = buttons.some((b) => {
				for (let n: HTMLElement | null = b; n; n = n.parentElement) if (['sticky', 'fixed'].includes(getComputedStyle(n).position)) return true;
				return false;
			});
			const seats = [...root.querySelectorAll('[data-seat]')].map((s) => Math.min(s.getBoundingClientRect().width, s.getBoundingClientRect().height));
			return {
				buttons: buttons.length,
				fixed,
				below: buttons.every((b) => b.getBoundingClientRect().top >= circle.bottom - 1),
				height: circle.height,
				view: innerHeight,
				seat: Math.min(...seats)
			};
		});
		expect(got.buttons, name).toBeGreaterThan(0);
		expect(got.fixed, name).toBe(false);
		expect(got.below, name).toBe(true);
		expect(got.height, name).toBeLessThanOrEqual(got.view);
		expect(got.seat, name).toBeGreaterThanOrEqual(44);
	}
});

test('Scenario: Dawn panels centre their text', async ({ page }) => {
	const wake = dawn2([2]);
	const states: [string, ClocktowerState][] = [
		['wake', wake],
		['none', play(dawn2([]), [{ type: 'next' }])],
		['timer', play(wake, [{ type: 'next' }, { type: 'next' }])]
	];
	for (const [name, state] of states) {
		await open(page, state);
		const bad = await live(page).evaluate((root) =>
			[...root.querySelectorAll<HTMLElement>('h2, p, output, .panel *')]
				.filter((n) => !n.closest('[data-circle]') && n.textContent!.trim() !== '' && !n.querySelector('h2, p, output, button'))
				.filter((n) => getComputedStyle(n).textAlign !== 'center' && !n.closest('button'))
				.map((n) => `${n.tagName}.${n.className}`)
		);
		expect(bad, name).toEqual([]);
	}
});
