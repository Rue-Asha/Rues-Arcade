import { expect, test, type Page } from '@playwright/test';
import { F15, F5, firstDay, seated, voted } from '../src/lib/games/clocktower/fixtures.ts';
import type { ClocktowerState } from '../src/lib/games/clocktower/types.ts';
import { play, seedClocktower } from './clocktower-session.ts';
import { byId } from '../src/lib/games/clocktower/characters.ts';
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

// n times "Weiter" from the dusk screen of night 1, a step being four screens
const next = (n: number) => Array.from({ length: n }, () => ({ type: 'next' as const }));
const weiter = (page: Page) => live(page).getByRole('button', { name: 'Weiter', exact: true });

// F5, night 1: Poisoner (Cleo), Washerwoman (Alex), Empath (Bo), Fortune Teller (Eli); the Empath's wake is screen 9
const atEmpath = (s = night1()) => play(s, next(9));

test('Scenario: Each waking step is four screens', async ({ page }) => {
	await open(page, atEmpath());
	const screen = live(page);
	await expect(screen.getByRole('heading', { name: 'Wecke Bo (#2)', exact: true })).toBeVisible();
	await expect(screen.getByText('Empath', { exact: true })).toBeVisible();
	await expect(screen.getByText(byId.empath.hint, { exact: true })).toBeVisible();

	await weiter(page).click();
	await expect(screen.getByTestId('role-card').getByRole('heading', { name: 'Empath', exact: true })).toBeVisible();

	await weiter(page).click();
	await expect(screen.locator('[data-circle]')).toBeVisible();

	await weiter(page).click();
	await expect(screen.getByRole('heading', { name: 'Schlaf wieder ein', exact: true })).toBeVisible();

	await weiter(page).click();
	await expect(screen.getByRole('heading', { name: 'Wecke Eli (#5)', exact: true })).toBeVisible();
});

test('Scenario: Group steps name every seat', async ({ page }) => {
	// 10 players, minions on seats 3 (Cleo) and 4 (Dani)
	const ten = seated(['washerwoman', 'empath', 'poisoner', 'spy', 'chef', 'monk', 'ravenkeeper', 'slayer', 'soldier', 'imp']);
	await open(page, play(reveal(ten), next(1)));
	await expect(live(page).getByRole('heading', { name: 'Wecke Cleo (#3) und Dani (#4)', exact: true })).toBeVisible();
});

test('Scenario: Suggestion labelled with its caveat', async ({ page }) => {
	const caveat = 'Gift, Drunk, Spy und Recluse können das ändern.';
	await open(page, atEmpath());
	await expect(live(page).getByText('Vorschlag', { exact: true })).toBeVisible();
	await expect(live(page).getByText(caveat, { exact: true })).toBeVisible();
	await expect(live(page).getByText('Diese Person ist der Drunk.', { exact: true })).toHaveCount(0);

	const drunk = seated(['washerwoman', 'drunk', 'poisoner', 'imp', 'fortune-teller'], { believed: 'empath', redHerring: 0 });
	await open(page, atEmpath(night1(drunk)));
	await expect(live(page).getByRole('heading', { name: 'Wecke Bo (#2)', exact: true })).toBeVisible();
	await expect(live(page).getByText('Vorschlag', { exact: true })).toBeVisible();
	await expect(live(page).getByText(caveat, { exact: true })).toBeVisible();
	await expect(live(page).getByText('Diese Person ist der Drunk.', { exact: true })).toBeVisible();
});

test('the wake screen shows each kind of info', async ({ page }) => {
	// Washerwoman (Alex): the seeded Empath among two others; Fortune Teller (Eli): Demon Dani and red herring Alex
	await open(page, play(night1(), next(5)));
	await expect(live(page).getByText(/^Empath: .+ \(#\d\) oder .+ \(#\d\)$/)).toBeVisible();
	await open(page, play(night1(), next(13)));
	await expect(live(page).getByRole('heading', { name: 'Wecke Eli (#5)', exact: true })).toBeVisible();
	await expect(live(page).getByText('Dämon: Dani (#4)', { exact: true })).toBeVisible();
	await expect(live(page).getByText('Red Herring: Alex (#1)', { exact: true })).toBeVisible();
});

test('Überspringen and Zurück move between steps', async ({ page }) => {
	await open(page, atEmpath());
	await live(page).getByRole('button', { name: 'Überspringen', exact: true }).click();
	await expect(live(page).getByRole('heading', { name: 'Wecke Eli (#5)', exact: true })).toBeVisible();
	await live(page).getByRole('button', { name: 'Zurück', exact: true }).click();
	await expect(live(page).getByRole('heading', { name: 'Schlaf wieder ein', exact: true })).toBeVisible();
	await live(page).getByRole('button', { name: 'Zurück', exact: true }).click();
	await expect(live(page).locator('[data-circle]')).toBeVisible();
});

test('the primary action of every waking screen is in the first phone viewport', async ({ page }, info) => {
	test.skip(info.project.name !== 'phone', 'phone layout');
	// F15, night 1: Washerwoman is the 4th step (minion info, demon info, poisoner first), wake screen 13
	const fifteen = play(reveal(seated(F15)), next(13));
	const bottoms: number[] = [];
	await open(page, fifteen);
	for (let i = 0; i < 4; i++) {
		await expect(weiter(page)).toBeVisible();
		await page.waitForTimeout(500);
		bottoms.push(await weiter(page).evaluate((el) => Math.round(el.getBoundingClientRect().bottom)));
		await weiter(page).click();
	}
	expect(bottoms.filter((b) => b > 844), `Weiter bottoms ${bottoms}`).toEqual([]);
});
