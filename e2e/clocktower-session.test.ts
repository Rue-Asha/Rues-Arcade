import { expect, test } from '@playwright/test';
import { F5, seated } from '../src/lib/games/clocktower/fixtures.ts';
import { play, seedClocktower } from './clocktower-session.ts';
import { seedRoster } from './helpers.ts';

const session = (page: import('@playwright/test').Page) => page.evaluate(() => localStorage.getItem('arcade:session:clocktower'));

// night 1 of the 5-player fixture, every card shown and hidden
const night1 = () => play(seated(F5), F5.flatMap(() => [{ type: 'show' as const }, { type: 'hide' as const }]));

test('play seeds a state and refuses an action that changes nothing', () => {
	expect(night1().phase).toEqual({ kind: 'night' });
	expect(() => play(seated(F5), [{ type: 'hide' }])).toThrow('action 0 ({"type":"hide"}) changed nothing in phase reveal-0-name');
});

test('Scenario: Stale Clocktower session discarded', async ({ page }) => {
	const errors: Error[] = [];
	page.on('pageerror', (e) => errors.push(e));
	await seedClocktower(page, night1());
	await page.evaluate(() => {
		const saved = JSON.parse(localStorage.getItem('arcade:session:clocktower')!);
		localStorage.setItem('arcade:session:clocktower', JSON.stringify({ ...saved, v: saved.v - 1 }));
	});
	await page.goto('/spiele/clocktower/spielen');
	await expect(page.getByRole('alert')).toContainText('verworfen');
	await expect(session(page)).resolves.toBeNull();
	expect(errors).toEqual([]);
});

test('Scenario: Spiel beenden clears the Clocktower session', async ({ page }) => {
	await seedRoster(page, ['Alex', 'Bo', 'Cleo', 'Dani', 'Eli']);
	await seedClocktower(page, night1());
	await page.goto('/spiele/clocktower');
	await page.getByRole('button', { name: 'Weiterspielen', exact: true }).click();
	await expect(page).toHaveURL(/\/spiele\/clocktower\/spielen$/);
	await expect(page.getByTestId('status')).toHaveText('Nacht 1 · 5 von 5 leben');

	await page.getByRole('button', { name: 'Spiel beenden', exact: true }).click();
	await page.getByRole('dialog').getByRole('button', { name: 'Beenden', exact: true }).click();
	await expect(page).toHaveURL(/\/spiele\/clocktower$/);
	await expect(page.getByRole('button', { name: 'Weiterspielen', exact: true })).toHaveCount(0);
	await expect(session(page)).resolves.toBeNull();

	await page.reload();
	await expect(page.getByRole('button', { name: "Los geht's", exact: true })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Weiterspielen', exact: true })).toHaveCount(0);
});
