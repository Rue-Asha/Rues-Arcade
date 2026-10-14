import { expect, test, type Page } from '@playwright/test';
import { clocktower } from '../src/lib/games/clocktower/engine.ts';
import type { ClocktowerState } from '../src/lib/games/clocktower/types.ts';
import { seedClocktower } from './clocktower-session.ts';
import { live, seedRoster } from './helpers.ts';

const NAMES = ['Alex', 'Bo', 'Cleo', 'Dani', 'Eli', 'Fey', 'Gus', 'Hana', 'Ida', 'Jo', 'Kai', 'Lu', 'Mo', 'Nia', 'Ole'];

const board = (n: number, seed = 1): ClocktowerState =>
	clocktower.init({ players: NAMES.slice(0, n).map((name) => ({ id: name.toLowerCase(), name })), config: {}, content: [], seed });

async function open(page: Page, state: ClocktowerState) {
	await seedRoster(page, NAMES.slice(0, state.seats.length));
	await seedClocktower(page, state);
	await page.goto('/spiele/clocktower/spielen');
	await expect(live(page).getByRole('heading', { name: 'Sitzordnung' })).toBeVisible();
}

const saved = (page: Page): Promise<ClocktowerState> =>
	page.evaluate(() => JSON.parse(localStorage.getItem('arcade:session:clocktower')!).state);

const seat = (page: Page, n: number) => live(page).locator(`[data-seat="${n}"]`);

const order = async (page: Page) => (await saved(page)).seats.map((s) => s.player.name);

test('Scenario: Swap two seats by tapping', async ({ page }) => {
	await open(page, board(7));
	await seat(page, 2).click();
	await seat(page, 5).click();

	await expect(seat(page, 2).locator('.name')).toHaveText('Eli');
	await expect(seat(page, 5).locator('.name')).toHaveText('Bo');
	expect(await order(page)).toEqual(['Alex', 'Eli', 'Cleo', 'Dani', 'Bo', 'Fey', 'Gus']);

	// numbers 1–7 run clockwise from the top
	const angles = await live(page).locator('[data-seat]').evaluateAll((els) => {
		const c = els[0].closest('[data-circle]')!.getBoundingClientRect();
		const cx = c.left + c.width / 2;
		const cy = c.top + c.height / 2;
		return els.map((el) => {
			const r = el.getBoundingClientRect();
			const a = (Math.atan2(r.left + r.width / 2 - cx, cy - (r.top + r.height / 2)) * 180) / Math.PI;
			return Math.round((a + 360) % 360);
		});
	});
	expect(angles[0]).toBeLessThanOrEqual(1);
	expect([...angles].sort((a, b) => a - b)).toEqual(angles);

	await page.reload();
	await expect(seat(page, 2).locator('.name')).toHaveText('Eli');
	await expect(seat(page, 5).locator('.name')).toHaveText('Bo');
});

test('Scenario: Drag a seat to a new place', async ({ page }, info) => {
	test.skip(info.project.name !== 'desktop', 'dragging is a desktop gesture');
	await open(page, board(7));
	const from = (await seat(page, 1).boundingBox())!;
	const to = (await seat(page, 4).boundingBox())!;
	await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
	await page.mouse.down();
	await page.mouse.move(from.x + from.width / 2 + 20, from.y + from.height / 2 + 20, { steps: 4 });
	await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2, { steps: 12 });
	await page.mouse.up();

	expect(await order(page)).toEqual(['Bo', 'Cleo', 'Dani', 'Alex', 'Eli', 'Fey', 'Gus']);
	await expect(seat(page, 4).locator('.name')).toHaveText('Alex');
	await expect(seat(page, 1).locator('.name')).toHaveText('Bo');
});

test('Scenario: Swap seats by keyboard', async ({ page }) => {
	await open(page, board(7));
	await seat(page, 3).focus();
	await page.keyboard.press('Enter');
	await seat(page, 6).focus();
	await page.keyboard.press('Enter');

	expect(await order(page)).toEqual(['Alex', 'Bo', 'Fey', 'Dani', 'Eli', 'Cleo', 'Gus']);
});

for (const n of [5, 15]) {
	test(`Scenario: Five and fifteen seats fit the setup board (${n})`, async ({ page }) => {
		await open(page, board(n));
		const found = await live(page).locator('[data-seat]').evaluateAll((els) => {
			const boxes = els.map((el) => el.getBoundingClientRect());
			const overlap: string[] = [];
			for (let i = 0; i < boxes.length; i++)
				for (let j = i + 1; j < boxes.length; j++) {
					const a = boxes[i];
					const b = boxes[j];
					if (a.left < b.right - 0.5 && b.left < a.right - 0.5 && a.top < b.bottom - 0.5 && b.top < a.bottom - 0.5)
						overlap.push(`${i + 1}/${j + 1}`);
				}
			return {
				smallest: Math.min(...boxes.map((b) => Math.min(b.width, b.height))),
				outside: boxes.filter((b) => b.left < 0 || b.right > innerWidth).length,
				overlap,
				scroll: document.documentElement.scrollWidth <= innerWidth
			};
		});
		expect(found.smallest).toBeGreaterThanOrEqual(44);
		expect(found.outside).toBe(0);
		expect(found.overlap).toEqual([]);
		expect(found.scroll).toBe(true);
	});
}
