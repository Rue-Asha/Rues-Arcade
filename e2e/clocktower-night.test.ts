import { expect, test, type Page } from '@playwright/test';
import { F15, F5, firstDay, seated, voted } from '../src/lib/games/clocktower/fixtures.ts';
import type { ClocktowerState } from '../src/lib/games/clocktower/types.ts';
import { play, seedClocktower } from './clocktower-session.ts';
import { live } from './helpers.ts';

const NAMES = ['Alex', 'Bo', 'Cleo', 'Dani', 'Eli', 'Fey', 'Gus', 'Hana', 'Ida', 'Jo', 'Kai', 'Lu', 'Mo', 'Nia', 'Ole'];

const reveal = (s: ClocktowerState) => play(s, s.seats.flatMap(() => [{ type: 'show' as const }, { type: 'hide' as const }]));
const night1 = (s = seated(F5)) => reveal(s);
// the day-1 grimoire ended at once: no execution, dusk of night 2
const night2 = (s = seated(F5)) => play(firstDay(reveal(s)), [{ type: 'endDay' }, { type: 'next' }]);

async function open(page: Page, state: ClocktowerState) {
	await seedClocktower(page, state);
	await page.goto('/spiele/clocktower/spielen');
}

const text = (page: Page) => live(page).innerText();

test('Scenario: Night starts with Alle schlafen ein', async ({ page }) => {
	for (const state of [night1(), night2()]) {
		await open(page, state);
		await expect(live(page).getByRole('heading', { name: 'Alle schlafen ein', exact: true })).toBeVisible();
		const shown = await text(page);
		for (const name of [...NAMES, 'Poisoner', 'Washerwoman', 'Empath', 'Imp', 'Fortune Teller']) expect(shown).not.toContain(name);
		await live(page).getByRole('button', { name: 'Weiter', exact: true }).click();
		await expect(live(page).getByText(/^Wecke /)).toBeVisible();
	}
});

test('Scenario: Storyteller declares the winner at night', async ({ page }) => {
	await open(page, night1());
	await live(page).getByRole('button', { name: 'Spiel ist entschieden', exact: true }).click();
	const dialog = page.getByRole('dialog');
	await expect(dialog.getByRole('button', { name: 'Gut', exact: true })).toBeVisible();
	await dialog.getByRole('button', { name: 'Böse', exact: true }).click();
	await expect(page.getByTestId('status')).toHaveText('Spielende');
	const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('arcade:session:clocktower')!).state);
	expect(saved.winner).toBe('evil');
	expect(saved.phase.kind).toBe('over');
});

// seat 11 (Kai) is the Saint of the 15-player fixture, executed on day 1
const saintDusk = () =>
	play(voted(firstDay(reveal(seated(F15))), 10, 0, 8), [{ type: 'endDay' }, { type: 'next' }]);

test('dusk questions come after Weiter and end the game on an answer', async ({ page }) => {
	await open(page, saintDusk());
	await live(page).getByRole('button', { name: 'Weiter', exact: true }).click();
	await expect(live(page).getByRole('heading', { name: 'Wirkte seine Fähigkeit?', exact: true })).toBeVisible();
	await expect(live(page).getByText('Saint · Kai (#11)', { exact: true })).toBeVisible();
	await expect(live(page).getByRole('button', { name: 'Weiter', exact: true })).toHaveCount(0);
	await live(page).getByRole('button', { name: 'Ja', exact: true }).click();
	await expect(page.getByTestId('status')).toHaveText('Spielende');
});

test('dusk questions answered no lead to the first waking step', async ({ page }) => {
	await open(page, saintDusk());
	await live(page).getByRole('button', { name: 'Weiter', exact: true }).click();
	await live(page).getByRole('button', { name: 'Nein', exact: true }).click();
	await expect(live(page).getByText(/^Wecke /)).toBeVisible();
});
