import { expect, test, type Page } from '@playwright/test';
import { clocktower } from '../src/lib/games/clocktower/engine.ts';
import { F15, F7, seated } from '../src/lib/games/clocktower/fixtures.ts';
import type { ClocktowerState } from '../src/lib/games/clocktower/types.ts';
import { play, seedClocktower } from './clocktower-session.ts';
import { live, seedRoster, settled } from './helpers.ts';
import { day1 } from './walks/clocktower-day.ts';

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
