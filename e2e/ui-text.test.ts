import { expect, test, type Locator, type Page } from '@playwright/test';
import { F7, seated } from '../src/lib/games/clocktower/fixtures.ts';
import type { ClocktowerAction, ClocktowerState } from '../src/lib/games/clocktower/types.ts';
import { play, seedClocktower } from './clocktower-session.ts';
import { live, seedRoster, settled } from './helpers.ts';
import { day1 } from './walks/clocktower-day.ts';

test.beforeEach(({}, info) => {
	test.skip(info.project.name !== 'desktop', 'mouse clicks');
});

const next = (n: number): ClocktowerAction[] => Array.from({ length: n }, () => ({ type: 'next' }));
const reveal = (s: ClocktowerState) => play(s, s.seats.flatMap((): ClocktowerAction[] => [{ type: 'show' }, { type: 'hide' }]));

// double and triple click at the element's centre by mouse, so an element that closes on click still gets all clicks
async function probe(page: Page, el: Locator, what: string) {
	await expect(el, what).toBeVisible();
	const style = await el.evaluate((e) => {
		const s = getComputedStyle(e);
		return { select: s.userSelect, callout: (s as unknown as Record<string, string>).webkitTouchCallout, cursor: s.cursor };
	});
	expect(style.select, `${what}: user-select`).toBe('none');
	if (style.callout !== undefined) expect(style.callout, `${what}: touch-callout`).toBe('none');
	expect(['default', 'pointer'], `${what}: cursor is ${style.cursor}`).toContain(style.cursor);
	const box = (await el.boundingBox())!;
	const [x, y] = [box.x + box.width / 2, box.y + box.height / 2];
	for (const clickCount of [2, 3]) {
		await page.mouse.click(x, y, { clickCount });
		expect(await page.evaluate(() => getSelection()!.toString()), `${what}: selection after ${clickCount} clicks`).toBe('');
	}
}

test('Scenario: UI text cannot be selected', async ({ page }) => {
	await seedRoster(page, ['Alex', 'Bo', 'Cleo', 'Dani', 'Eli']);

	await page.goto('/');
	await probe(page, page.getByRole('heading', { level: 1 }).first(), 'home heading');
	await probe(page, page.locator('main p').first(), 'home paragraph');

	await page.goto('/spieler');
	await probe(page, page.getByRole('heading', { level: 1 }).first(), 'spieler heading');
	await probe(page, page.getByText('Gespeicherte Spieler behalten ihren Namen in allen Spielen.', { exact: true }), 'spieler paragraph');

	await page.goto('/spiele/imposter');
	await probe(page, page.getByRole('heading', { level: 1 }).first(), 'imposter heading');
	await probe(page, page.locator('main p').first(), 'imposter paragraph');

	await seedClocktower(page, play(reveal(seated(F7)), next(3)));
	await page.goto('/spiele/clocktower/spielen');
	const bar = live(page).getByTestId('show-bar');
	await expect(bar).toBeVisible();
	await settled(page);
	await probe(page, live(page).getByRole('heading').first(), 'night heading');
	await probe(page, live(page).locator('.name').first(), 'seat name');
	await live(page).getByRole('button', { name: 'Ja', exact: true }).click();
	await bar.getByRole('button', { name: 'Zeigen', exact: true }).click();
	await probe(page, page.getByTestId('show-card').getByText('Ja', { exact: true }), 'shown text');

	await seedClocktower(page, day1(seated(F7), 30));
	await page.goto('/spiele/clocktower/spielen');
	await expect(live(page).getByTestId('timer')).toBeVisible();
	await settled(page);
	await probe(page, live(page).getByRole('heading').first(), 'day heading');
	await probe(page, live(page).getByTestId('timer'), 'timer');
});

test('Scenario: Inputs keep caret and selection', async ({ page }) => {
	await page.goto('/spieler');
	const input = page.getByRole('region', { name: 'Gespeicherte Spieler' }).getByLabel('Neuer gespeicherter Spieler');
	await input.fill('Ute');
	await input.click({ clickCount: 3 });
	expect(await input.evaluate((e: HTMLInputElement) => e.value.slice(e.selectionStart!, e.selectionEnd!))).toBe('Ute');
	const style = await input.evaluate((e) => ({ select: getComputedStyle(e).userSelect, cursor: getComputedStyle(e).cursor }));
	expect(style.select).not.toBe('none');
	expect(style.cursor).toBe('text');
});
