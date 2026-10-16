import { expect, test, type Page } from '@playwright/test';
import { dead, F15, firstDay, seated, voted } from '../src/lib/games/clocktower/fixtures.ts';
import type { ClocktowerAction, ClocktowerState } from '../src/lib/games/clocktower/types.ts';
import { play, seedClocktower } from './clocktower-session.ts';
import { live, settled } from './helpers.ts';

const next = (n: number): ClocktowerAction[] => Array.from({ length: n }, () => ({ type: 'next' }));
const reveal = (s: ClocktowerState) => play(s, s.seats.flatMap((): ClocktowerAction[] => [{ type: 'show' }, { type: 'hide' }]));

// the Washerwoman's circle screen of night 1 (wake screen 13, circle two screens later)
const circle = () => play(reveal(seated(F15)), next(15));
// the death step of night 2 with the Butler dead
const deaths = () => play(play(dead(firstDay(reveal(seated(F15))), 9), [{ type: 'endDay' }, { type: 'next' }]), next(29));

const screens: [string, () => ClocktowerState][] = [
	['circle screen', circle],
	['death step', deaths]
];

async function open(page: Page, state: ClocktowerState) {
	await seedClocktower(page, state);
	await page.goto('/spiele/clocktower/spielen');
	await expect(live(page).locator('[data-circle]')).toBeVisible();
	await settled(page);
}

for (const [name, build] of screens) {
	test(`Scenario: Night screens keep Weiter after the circle, ${name}`, async ({ page }) => {
		await open(page, build());
		const weiter = live(page).getByRole('button', { name: 'Weiter', exact: true });
		await expect(weiter).toBeVisible();

		const audit = await live(page).evaluate((stage) => {
			const w = [...stage.querySelectorAll<HTMLElement>('button')].find((b) => b.textContent?.trim() === 'Weiter')!;
			const fixed: string[] = [];
			for (let el: HTMLElement | null = w; el; el = el.parentElement) {
				const p = getComputedStyle(el).position;
				if (p === 'sticky' || p === 'fixed') fixed.push(el.tagName + '.' + el.className);
			}
			const ring = stage.querySelector<HTMLElement>('[data-circle]')!;
			const focusable = [...stage.querySelectorAll<HTMLElement>('button, select, input, textarea, a[href], [tabindex]')].filter((el) => el.getAttribute('tabindex') !== '-1' && !el.hasAttribute('disabled') && el.getClientRects().length > 0);
			const label = (el: HTMLElement) => el.textContent?.trim() || el.tagName.toLowerCase();
			const names = focusable.map(label);
			const tail = ['Weiter', 'Zurück', 'Überspringen'];
			// the navigation is the last run of controls, and nothing else lies below Weiter's top
			let run = names.length;
			while (run > 0 && tail.includes(names[run - 1])) run--;
			const below = focusable.filter((b) => !tail.includes(label(b)) && b.getBoundingClientRect().bottom > w.getBoundingClientRect().top + 1);
			return {
				fixed,
				gap: w.getBoundingClientRect().top - ring.getBoundingClientRect().bottom,
				navigation: names.slice(run),
				below: below.map(label)
			};
		});
		expect(audit.fixed).toEqual([]);
		expect(audit.gap).toBeGreaterThanOrEqual(0);
		expect(audit.navigation).toContain('Weiter');
		expect(audit.below).toEqual([]);

		await page.evaluate(() => window.scrollTo(0, 0));
		const count = await live(page).locator('[data-seat]').count();
		for (let i = 1; i <= count; i++) {
			const hit = await live(page).locator(`[data-seat="${i}"]`).evaluate((el) => {
				el.scrollIntoView({ block: 'center', inline: 'center' });
				const r = el.getBoundingClientRect();
				return document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)?.closest('[data-seat]') === el;
			});
			expect(hit, `seat ${i}`).toBe(true);
		}
	});

	test(`Scenario: Night circle seen in one piece, ${name}`, async ({ page }) => {
		await open(page, build());
		const m = await live(page).evaluate((stage) => {
			const ring = stage.querySelector<HTMLElement>('[data-circle]')!.getBoundingClientRect();
			const seats = [...stage.querySelectorAll<HTMLElement>('[data-seat]')].map((el) => el.getBoundingClientRect());
			let overlap = false;
			for (let i = 0; i < seats.length; i++)
				for (let j = i + 1; j < seats.length; j++) {
					const a = seats[i];
					const b = seats[j];
					if (a.left < b.right - 0.5 && b.left < a.right - 0.5 && a.top < b.bottom - 0.5 && b.top < a.bottom - 0.5) overlap = true;
				}
			return { height: ring.height, min: Math.min(...seats.map((r) => Math.min(r.width, r.height))), n: seats.length, overlap, view: window.innerHeight };
		});
		expect(m.n).toBe(15);
		expect(m.height).toBeLessThanOrEqual(m.view);
		expect(m.min).toBeGreaterThanOrEqual(44);
		expect(m.overlap).toBe(false);
	});
}

// F15: Kai (seat 11) is the Saint, executed on day 1; the question follows the night-2 dusk
const base = () => reveal(seated(F15));
const saint = () => play(voted(firstDay(base()), 10, 0, 8), [{ type: 'endDay' }, { type: 'next' }, ...next(1)]);

const flat: [string, () => ClocktowerState][] = [
	['dusk', base],
	['wake', () => play(base(), next(1))],
	['info card', () => play(base(), next(2))],
	['sleep', () => play(base(), next(4))],
	['question', saint]
];

for (const [name, build] of flat) {
	test(`Scenario: Night navigation is the last group of controls, ${name}`, async ({ page }) => {
		await seedClocktower(page, build());
		await page.goto('/spiele/clocktower/spielen');
		await settled(page);
		const audit = await live(page).evaluate((stage) => {
			const focusable = [...stage.querySelectorAll<HTMLElement>('button, select, input, textarea, a[href], [tabindex]')].filter((el) => el.getAttribute('tabindex') !== '-1' && !el.hasAttribute('disabled') && el.getClientRects().length > 0);
			const names = focusable.map((el) => el.textContent?.trim() || el.tagName.toLowerCase());
			const tail = ['Weiter', 'Zurück', 'Überspringen', 'Ja', 'Nein'];
			let run = names.length;
			while (run > 0 && tail.includes(names[run - 1])) run--;
			return { names, navigation: names.slice(run), before: names.slice(0, run) };
		});
		expect(audit.navigation.length, audit.names.join()).toBeGreaterThan(0);
		expect(audit.navigation.some((n) => n === 'Weiter' || n === 'Ja'), audit.names.join()).toBe(true);
		if (name !== 'dusk') expect(audit.before, audit.names.join()).toContain('Grimoire');
		if (name === 'dusk' || name === 'question') expect(audit.before, audit.names.join()).toContain('Spiel ist entschieden');
		for (const n of audit.before) expect(['Weiter', 'Zurück', 'Überspringen', 'Ja', 'Nein']).not.toContain(n);
	});
}
