import { expect, test, type Page } from '@playwright/test';
import { F15, F5, firstDay, seated, voted } from '../src/lib/games/clocktower/fixtures.ts';
import type { ClocktowerState } from '../src/lib/games/clocktower/types.ts';
import { play, seedClocktower } from './clocktower-session.ts';
import { byId } from '../src/lib/games/clocktower/characters.ts';
import { info } from '../src/lib/games/clocktower/info.ts';
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

// The circle screen of step k (0-based) of night 1 is screen 1 + 4k + 2.
const circle = (k: number) => 3 + 4 * k;
const fifteen = () => reveal(seated(F15));
const chip = (page: Page, name: string) => live(page).getByRole('button', { name, exact: true });
const card = (page: Page) => page.getByTestId('show-card');
const bar = (page: Page) => live(page).getByTestId('show-bar');

test('Scenario: Show-bar opens full-screen cards', async ({ page }) => {
	const state = play(fifteen(), next(circle(3)));
	await open(page, state);
	await expect(bar(page)).toBeVisible();
	const viewport = page.viewportSize()!;

	const cases: { item: string; value?: { label: string; option: string }; shows: (c: ReturnType<typeof card>) => Promise<void> }[] = [
		{ item: 'Charakter', value: { label: 'Charakter', option: 'imp' }, shows: (c) => expect(c.getByTestId('role-card')).toContainText('Imp') },
		{ item: 'Das ist der Dämon', shows: (c) => expect(c.getByText('Das ist der Dämon', { exact: true })).toBeVisible() },
		{ item: 'Deine Minions', shows: (c) => expect(c.getByText('Deine Minions', { exact: true })).toBeVisible() },
		{
			item: 'Bluffs',
			shows: async (c) => {
				for (const id of state.bluffs) await expect(c.getByText(byId[id].name, { exact: true })).toBeVisible();
			}
		},
		{
			item: 'Du bist',
			value: { label: 'Du bist', option: 'imp' },
			shows: async (c) => {
				await expect(c.getByText('Du bist', { exact: true })).toBeVisible();
				await expect(c.getByText('Imp', { exact: true })).toBeVisible();
			}
		},
		{ item: 'Zahl', value: { label: 'Zahl', option: '7' }, shows: (c) => expect(c.getByText('7', { exact: true })).toBeVisible() },
		{ item: 'Ja', shows: (c) => expect(c.getByText('Ja', { exact: true })).toBeVisible() },
		{ item: 'Nein', shows: (c) => expect(c.getByText('Nein', { exact: true })).toBeVisible() }
	];
	for (const { item, value, shows } of cases) {
		await chip(page, item).click();
		if (value) await bar(page).getByLabel(value.label, { exact: true }).selectOption(value.option);
		await bar(page).getByRole('button', { name: 'Zeigen', exact: true }).click();
		await expect(card(page), item).toBeVisible();
		await shows(card(page));
		expect(await card(page).boundingBox(), item).toEqual({ x: 0, y: 0, ...viewport });
		await card(page).click();
		await expect(card(page), item).toHaveCount(0);
	}
});

test('Scenario: Role preselects its cards', async ({ page }) => {
	const base = fifteen();
	const pressed = async (name: string) => expect(chip(page, name)).toHaveAttribute('aria-pressed', 'true');
	const at = async (k: number) => {
		const state = play(base, next(circle(k)));
		await open(page, state);
		return state;
	};

	let state = await at(3);
	const ww = info(state, state.night!.steps[3]);
	await pressed('Charakter');
	if (ww.kind !== 'pair') throw new Error('washerwoman info');
	await expect(bar(page).getByLabel('Charakter', { exact: true })).toHaveValue(ww.character);

	state = await at(6);
	const chef = info(state, state.night!.steps[6]);
	await pressed('Zahl');
	if (chef.kind !== 'number') throw new Error('chef info');
	await expect(bar(page).getByLabel('Zahl', { exact: true })).toHaveValue(String(chef.n));

	await at(8);
	await pressed('Ja');

	await at(0);
	await pressed('Das ist der Dämon');

	state = await at(1);
	await pressed('Deine Minions');
	await bar(page).getByRole('button', { name: 'Zeigen', exact: true }).click();
	await card(page).click();
	await pressed('Bluffs');
	await expect(bar(page).getByTestId('bluffs')).toHaveText(state.bluffs.map((id) => byId[id].name).join(' · '));

	// night 2 of F5: the Imp chooses themself and the Poisoner on seat 3 becomes the Imp
	const imp = play(night2(), [...next(5), { type: 'starpass', seat: 2 }, ...next(6)]);
	await open(page, imp);
	await pressed('Du bist');
	await expect(bar(page).getByLabel('Du bist', { exact: true })).toHaveValue('imp');
});

test('Scenario: Bluffs can be rerolled before showing', async ({ page }) => {
	const state = play(fifteen(), next(circle(1)));
	await open(page, state);
	const list = (names: string[]) => names.join(' · ');
	const before = list(state.bluffs.map((id) => byId[id].name));
	await chip(page, 'Bluffs').click();
	const preview = bar(page).getByTestId('bluffs');
	await expect(preview).toHaveText(before);

	await bar(page).getByRole('button', { name: 'Neu würfeln', exact: true }).click();
	await expect(preview).not.toHaveText(before);
	const names = (await preview.innerText()).split(' · ');
	expect(new Set(names).size).toBe(3);
	const inPlay = new Set(F15.map((id) => byId[id].name));
	for (const name of names) {
		const found = Object.values(byId).find((c) => c.name === name)!;
		expect(inPlay.has(name), name).toBe(false);
		expect(found.team === 'townsfolk' || found.team === 'outsider', name).toBe(true);
	}

	await bar(page).getByRole('button', { name: 'Zeigen', exact: true }).click();
	await card(page).click();
	await expect(bar(page).getByRole('button', { name: 'Neu würfeln', exact: true })).toBeDisabled();
});
