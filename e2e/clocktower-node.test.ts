import { expect, test, type Page } from '@playwright/test';
import { clocktower } from '../src/lib/games/clocktower/engine.ts';
import { F15, F7, seated } from '../src/lib/games/clocktower/fixtures.ts';
import type { ClocktowerState } from '../src/lib/games/clocktower/types.ts';
import { play, seedClocktower } from './clocktower-session.ts';
import { live, seedRoster, settled } from './helpers.ts';
import { day1, nightEnd } from './walks/clocktower-day.ts';

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
