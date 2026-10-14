import { expect, test, type Page } from '@playwright/test';
import { clocktower } from '../src/lib/games/clocktower/engine.ts';
import { byId, characters } from '../src/lib/games/clocktower/characters.ts';
import { F15, F5, seated } from '../src/lib/games/clocktower/fixtures.ts';
import { required } from '../src/lib/games/clocktower/setup.ts';
import type { CharacterId, ClocktowerAction, ClocktowerState } from '../src/lib/games/clocktower/types.ts';
import { play, seedClocktower } from './clocktower-session.ts';
import { live, seedRoster, settled } from './helpers.ts';

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

const character = (page: Page, id: CharacterId) => live(page).locator(`[data-character="${id}"]`);
const weiter = (page: Page) => live(page).getByRole('button', { name: 'Weiter', exact: true });
const count = (page: Page, team: string) => live(page).getByTestId(`count-${team}`);
const held = async (page: Page) => (await saved(page)).seats.map((s) => s.character);

async function counters(page: Page) {
	return [
		await count(page, 'townsfolk').innerText(),
		await count(page, 'outsider').innerText(),
		await count(page, 'minion').innerText(),
		await count(page, 'demon').innerText()
	];
}

test('Scenario: Counters follow the setup table', async ({ page }) => {
	await open(page, board(7));
	await expect(live(page).locator('[data-character]')).toHaveCount(22);
	for (const [name, team, n] of [
		['Townsfolk', 'townsfolk', '0 / 5'],
		['Outsider', 'outsider', '0 / 0'],
		['Minions', 'minion', '0 / 1'],
		['Dämon', 'demon', '0 / 1']
	])
		await expect(live(page).getByRole('heading', { name: `${name} ${n}` })).toBeVisible();
	for (const team of ['townsfolk', 'outsider', 'minion', 'demon'])
		await expect(live(page).locator(`[data-team="${team}"] [data-character]`).first()).toBeVisible();
	expect(await counters(page)).toEqual(['0 / 5', '0 / 0', '0 / 1', '0 / 1']);
});

test('Scenario: Baron changes the requirement live', async ({ page }) => {
	await open(page, board(8));
	expect(await counters(page)).toEqual(['0 / 5', '0 / 1', '0 / 1', '0 / 1']);

	await seat(page, 1).click();
	await character(page, 'baron').click();
	expect(await counters(page)).toEqual(['0 / 3', '0 / 3', '1 / 1', '0 / 1']);
	expect((await held(page))[0]).toBe('baron');

	// the Baron is removed by tapping it again while its seat is selected
	await seat(page, 1).click();
	await character(page, 'baron').click();
	expect((await held(page))[0]).toBeNull();
	expect(await counters(page)).toEqual(['0 / 5', '0 / 1', '0 / 1', '0 / 1']);
});

test('Scenario: Over-assigned team shown as an error', async ({ page }) => {
	await open(page, board(5));
	await seat(page, 1).click();
	await character(page, 'poisoner').click();
	await seat(page, 2).click();
	await character(page, 'spy').click();

	await expect(count(page, 'minion')).toHaveText('2 / 1');
	await expect(live(page).locator('[data-team="minion"]').getByText('zu viele', { exact: true })).toBeVisible();
	await expect(live(page).locator('[data-team="townsfolk"]').getByText('zu viele', { exact: true })).toHaveCount(0);
	await expect(weiter(page)).toBeDisabled();
});

test('Scenario: Assign by seat or by character first', async ({ page }) => {
	await open(page, board(7));
	await seat(page, 1).click();
	await character(page, 'chef').click();
	await character(page, 'imp').click();
	await seat(page, 3).click();

	const seats = await held(page);
	expect(seats[0]).toBe('chef');
	expect(seats[2]).toBe('imp');
	expect(seats.filter((c) => c !== null)).toHaveLength(2);
	expect((await counters(page))[0]).toBe('1 / 5');
	expect((await counters(page))[3]).toBe('1 / 1');
});

test('Scenario: Each character at most once', async ({ page }) => {
	await open(page, board(7));
	await seat(page, 2).click();
	await character(page, 'empath').click();
	await seat(page, 4).click();

	await expect(character(page, 'empath')).toBeDisabled();
	await expect(character(page, 'empath')).toContainText('Platz 2');
	expect((await held(page))[3]).toBeNull();
});

test('Scenario: Impossible manual choice is flagged', async ({ page }) => {
	await open(page, board(5));
	await seat(page, 1).click();
	await character(page, 'poisoner').click();
	await seat(page, 2).click();
	await character(page, 'spy').click();
	await live(page).getByRole('button', { name: 'Zufällig', exact: true }).click();

	await expect(live(page).getByRole('alert')).toHaveText('Diese Verteilung geht nicht auf: zu viele Minions.');
	expect((await held(page)).filter((c) => c !== null)).toEqual(['poisoner', 'spy']);
});

test('Scenario: Zufällig keeps choices and Alles neu starts over', async ({ page }) => {
	await open(page, board(10));
	await seat(page, 3).click();
	await character(page, 'empath').click();
	await live(page).getByRole('button', { name: 'Zufällig', exact: true }).click();

	const seats = await held(page);
	expect(seats[2]).toBe('empath');
	expect(seats.every((c) => c !== null)).toBe(true);
	const baron = seats.includes('baron');
	const want = required(10, baron);
	expect(await counters(page)).toEqual([`${want.townsfolk} / ${want.townsfolk}`, `${want.outsider} / ${want.outsider}`, `${want.minion} / ${want.minion}`, '1 / 1']);
	await expect(live(page).getByRole('alert')).toHaveCount(0);

	await live(page).getByRole('button', { name: 'Alles neu', exact: true }).click();
	const again = await held(page);
	expect(again.every((c) => c !== null)).toBe(true);
	expect(again).not.toEqual(seats);
});

const assign = (...ids: (CharacterId | null)[]): ClocktowerAction[] =>
	ids.flatMap((character, seat): ClocktowerAction[] => (character === null ? [] : [{ type: 'assign', seat, character }]));

const FIVE: (CharacterId | null)[] = ['washerwoman', 'chef', 'empath', 'poisoner', 'imp'];

test('Scenario: Drunk and red herring on the board', async ({ page }) => {
	await open(page, board(7));
	await seat(page, 1).click();
	await character(page, 'drunk').click();
	await seat(page, 2).click();
	await character(page, 'fortune-teller').click();
	await seat(page, 3).click();
	await character(page, 'imp').click();
	await seat(page, 4).click();
	await character(page, 'chef').click();

	const glaubt = live(page).getByLabel('Drunk glaubt');
	const herring = live(page).getByLabel('Red Herring');
	const believable = await glaubt.locator('option:not([disabled])').allInnerTexts();
	const free = characters.filter((c) => c.team === 'townsfolk' && c.id !== 'chef' && c.id !== 'fortune-teller').map((c) => c.name);
	expect(free).toHaveLength(11);
	expect([...believable].sort()).toEqual([...free].sort());
	const options = await herring.locator('option').allInnerTexts();
	expect(options.join('|')).toContain('Platz 2');
	expect(options.join('|')).toContain('Platz 4');
	expect(options.join('|')).not.toContain('Platz 3');

	await live(page).getByRole('button', { name: 'Zufällig', exact: true }).click();
	const done = await saved(page);
	expect(done.seats.every((s) => s.character !== null)).toBe(true);
	expect(done.seats[0].believed).not.toBeNull();
	expect(done.redHerring).not.toBeNull();
	await expect(glaubt).not.toHaveValue('');
	await expect(herring).not.toHaveValue('');
});

test('Scenario: Weiter needs a complete valid distribution', async ({ page }) => {
	const six = play(board(6), assign('drunk', 'washerwoman', 'chef', 'empath', 'poisoner', null));
	await open(page, six);
	await expect(weiter(page)).toBeDisabled();

	await seat(page, 6).click();
	await character(page, 'imp').click();
	await expect(weiter(page)).toBeDisabled();

	await live(page).getByLabel('Drunk glaubt').selectOption({ label: 'Monk' });
	await expect(weiter(page)).toBeEnabled();
});

test('Scenario: Confirm before the reveal', async ({ page }) => {
	await open(page, play(board(5), assign(...FIVE)));
	const before = await saved(page);

	await weiter(page).click();
	const dialog = page.getByRole('dialog');
	await expect(dialog.getByRole('heading', { name: 'Rollen sind verteilt und notiert?' })).toBeVisible();
	await dialog.getByRole('button', { name: 'Zurück', exact: true }).click();
	await expect(dialog).toBeHidden();
	expect(await saved(page)).toEqual(before);
	await expect(live(page).getByRole('heading', { name: 'Sitzordnung' })).toBeVisible();

	await weiter(page).click();
	await dialog.getByRole('button', { name: 'Ja, weiter', exact: true }).click();
	await expect(live(page).getByRole('heading', { name: 'Alex', exact: true })).toBeVisible();
	await expect(live(page).getByText('Platz 1', { exact: true })).toBeVisible();
	await expect(show(page)).toBeVisible();
	await expect(page.getByRole('heading', { name: 'Sitzordnung' })).toHaveCount(0);
	const after = await saved(page);
	expect(after.locked).toBe(true);
	expect(after.phase).toEqual({ kind: 'reveal', seat: 0, shown: false });
	expect(after.seats.map((s) => s.player.name)).toEqual(before.seats.map((s) => s.player.name));
});

test('Scenario: Setup board shows the character sheet', async ({ page }, info) => {
	await open(page, board(7));
	const sheet = live(page).getByTestId('sheet');
	await expect(sheet).toHaveCount(1);
	const below = await sheet.evaluate((el) => {
		const mine = el.getBoundingClientRect().top;
		const circle = document.querySelector('[data-circle]')!.getBoundingClientRect().bottom;
		const items = [...el.querySelectorAll('li')].map((li) => [li.querySelector('.name')?.textContent?.trim(), li.querySelector('.ability')?.textContent?.trim()]);
		return { below: mine > circle, items, text: el.textContent ?? '' };
	});
	expect(below.below).toBe(true);
	const sheetOrder = (['townsfolk', 'outsider', 'minion', 'demon'] as const).flatMap((team) => characters.filter((c) => c.team === team));
	expect(sheetOrder).toHaveLength(22);
	expect(below.items).toEqual(sheetOrder.map((c) => [c.name, c.ability]));
	expect(below.text).toContain('So gewinnt ihr');
	if (info.project.name === 'desktop') await expect(sheet.getByText('So gewinnt ihr', { exact: true })).toBeVisible();
});

test('Scenario: Weiter stays in the first phone screen', async ({ page }, info) => {
	test.skip(info.project.name !== 'phone', 'phone layout');
	for (const n of [5, 15]) {
		await open(page, board(n));
		const bottom = await weiter(page).evaluate((el) => el.getBoundingClientRect().bottom);
		expect(bottom, `${n} seats`).toBeLessThanOrEqual(844);
	}
});

const TEAM = { townsfolk: 'Dorfbewohner', outsider: 'Außenseiter', minion: 'Scherge', demon: 'Dämon' };

async function reveal(page: Page, state: ClocktowerState) {
	await seedRoster(page, state.seats.map((s) => s.player.name));
	await seedClocktower(page, state);
	await page.goto('/spiele/clocktower/spielen');
}

const show = (page: Page) => live(page).getByRole('button', { name: 'Rolle zeigen', exact: true });
const hide = (page: Page) => live(page).getByRole('button', { name: 'Verbergen & weitergeben', exact: true });
const text = (page: Page) => page.evaluate(() => document.body.textContent ?? '');
// the name screen's visible texts (as written, not as CSS cases them), and any of the 22 character names in the page
async function nameScreen(page: Page) {
	const lines = await live(page).evaluate((el) => {
		const out: string[] = [];
		const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
		for (let node = walker.nextNode(); node; node = walker.nextNode()) {
			const line = node.textContent!.trim();
			if (line && node.parentElement!.checkVisibility()) out.push(line);
		}
		return out;
	});
	const all = await text(page);
	return { lines, names: characters.map((c) => c.name).filter((name) => all.includes(name)) };
}
const HINT = 'Nur diese Person schaut auf das Gerät.';

test('Scenario: Reveal walks seat by seat', async ({ page }) => {
	const state = seated(F5);
	await reveal(page, state);
	for (const [i, s] of state.seats.entries()) {
		const c = byId[s.character!];
		await expect(live(page).getByRole('heading', { name: s.player.name, exact: true })).toBeVisible();
		await expect(live(page).getByText(`Platz ${i + 1}`, { exact: true })).toBeVisible();
		await expect(show(page)).toBeVisible();
		await settled(page);
		expect(await nameScreen(page)).toEqual({ lines: [`Platz ${i + 1}`, s.player.name, HINT, 'Rolle zeigen'], names: [] });

		await show(page).click();
		const card = live(page).getByTestId('role-card');
		await expect(card.getByRole('heading', { name: c.name, exact: true })).toBeVisible();
		await expect(card.getByText(TEAM[c.team], { exact: true })).toBeVisible();
		await expect(card.getByText(c.de, { exact: true })).toBeVisible();
		await expect(card.getByText(c.ability, { exact: true })).toBeVisible();
		await expect(card.locator('svg path')).toHaveCount(1);
		await hide(page).click();
	}
	await expect(page.getByTestId('status')).toHaveText('Nacht 1 · 5 von 5 leben');
});

test('Scenario: Drunk sees the believed Townsfolk', async ({ page }) => {
	const state = seated(['drunk', 'washerwoman', 'chef', 'poisoner', 'imp'], { believed: 'empath' });
	await reveal(page, state);
	await show(page).click();
	const card = live(page).getByTestId('role-card');
	const empath = byId.empath;
	await expect(card.getByRole('heading', { name: 'Empath', exact: true })).toBeVisible();
	await expect(card.getByText(TEAM.townsfolk, { exact: true })).toBeVisible();
	await expect(card.getByText(empath.de, { exact: true })).toBeVisible();
	await expect(card.getByText(empath.ability, { exact: true })).toBeVisible();
	await settled(page);
	expect(await text(page)).not.toContain('Drunk');
});

test('Scenario: Card stays until hidden', async ({ page }) => {
	await page.clock.install();
	await reveal(page, seated(F5));
	await show(page).click();
	await expect(live(page).getByTestId('role-card')).toBeVisible();
	await page.clock.fastForward('05:00');
	await expect(live(page).getByTestId('role-card')).toBeVisible();
	await expect(hide(page)).toBeVisible();
});

test('Scenario: Hidden card leaves nothing readable', async ({ page }) => {
	const state = seated(F5);
	await reveal(page, state);
	await show(page).click();
	await hide(page).click();
	await expect(live(page).getByRole('heading', { name: 'Bo', exact: true })).toBeVisible();
	await settled(page);
	const c = byId[state.seats[0].character!];
	const all = await text(page);
	for (const word of [c.name, TEAM[c.team], c.de, c.ability]) expect(all).not.toContain(word);
	expect(await nameScreen(page)).toEqual({ lines: ['Platz 2', 'Bo', HINT, 'Rolle zeigen'], names: [] });
	await expect(page.locator('[data-testid="role-card"]')).toHaveCount(0);
});

test('Scenario: Reload mid-reveal resumes hidden', async ({ page }) => {
	const state = seated(F5);
	await reveal(page, state);
	for (let i = 0; i < 2; i++) {
		await show(page).click();
		await hide(page).click();
	}
	await show(page).click();
	await expect(live(page).getByTestId('role-card')).toBeVisible();
	await page.reload();
	await expect(live(page).getByRole('heading', { name: 'Cleo', exact: true })).toBeVisible();
	await expect(show(page)).toBeVisible();
	await settled(page);
	await expect(page.locator('[data-testid="role-card"]')).toHaveCount(0);
	expect(await text(page)).not.toContain(byId[state.seats[2].character!].name);
});

test('Scenario: Reveal actions stay in the first phone screen', async ({ page }, info) => {
	test.skip(info.project.name !== 'phone', 'phone layout');
	const state = seated(F15);
	await reveal(page, state);
	for (const _ of state.seats) {
		await settled(page);
		expect(await show(page).evaluate((el) => el.getBoundingClientRect().bottom)).toBeLessThanOrEqual(844);
		await show(page).click();
		await settled(page);
		expect(await hide(page).evaluate((el) => el.getBoundingClientRect().bottom)).toBeLessThanOrEqual(844);
		await hide(page).click();
	}
});
