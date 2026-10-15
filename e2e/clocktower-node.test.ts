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
