import { expect, type Page } from '@playwright/test';
import { dead, F15, firstDay, seated, voted } from '../../src/lib/games/clocktower/fixtures.ts';
import type { ClocktowerAction, ClocktowerState } from '../../src/lib/games/clocktower/types.ts';
import { play, seedClocktower } from '../clocktower-session.ts';
import { live } from '../helpers.ts';

type Check = (slug: string) => Promise<void>;

const next = (n: number): ClocktowerAction[] => Array.from({ length: n }, () => ({ type: 'next' }));
const reveal = (s: ClocktowerState) => play(s, s.seats.flatMap((): ClocktowerAction[] => [{ type: 'show' }, { type: 'hide' }]));
const night2 = (s: ClocktowerState) => play(firstDay(s), [{ type: 'endDay' }, { type: 'next' }]);

async function open(page: Page, state: ClocktowerState, heading: string) {
	await seedClocktower(page, state);
	await page.goto('/spiele/clocktower/spielen');
	await expect(live(page).getByRole('heading', { name: heading, exact: true })).toBeVisible();
}

const dialog = (page: Page) => page.getByRole('dialog');

const weiter = (page: Page) => live(page).getByRole('button', { name: 'Weiter', exact: true });

// Dusk, a dusk question, a pair step and a group step in four screens each (15 seats), every show card, the held
// grimoire, the Imp step and the death step.
export async function walk(page: Page, check: Check) {
	const night1 = reveal(seated(F15));

	await open(page, night1, 'Alle schlafen ein');
	await check('clocktower-dusk');

	// the Saint (seat 11) executed on day 1
	const saint = play(voted(firstDay(night1), 10, 0, 8), [{ type: 'endDay' }, { type: 'next' }, ...next(1)]);
	await open(page, saint, 'Wirkte seine Fähigkeit?');
	await check('clocktower-question');

	// group step: Minion info wakes the Poisoner, Spy and Scarlet Woman
	await open(page, play(night1, next(1)), 'Wecke Lu (#12), Mo (#13) und Nia (#14)');
	await check('clocktower-wake-group');
	await weiter(page).click();
	await expect(live(page).getByTestId('info-card')).toBeVisible();
	await check('clocktower-card-group');
	await weiter(page).click();
	await expect(live(page).getByTestId('show-bar')).toBeVisible();
	await check('clocktower-circle-group');
	await weiter(page).click();
	await expect(live(page).getByRole('heading', { name: 'Schlaf wieder ein', exact: true })).toBeVisible();
	await check('clocktower-sleep-group');

	// pair step: the Washerwoman on seat 1
	await open(page, play(night1, next(13)), 'Wecke Alex (#1)');
	await check('clocktower-wake-pair');
	await weiter(page).click();
	await expect(live(page).getByTestId('role-card')).toBeVisible();
	await check('clocktower-card-pair');
	await weiter(page).click();
	await expect(live(page).getByTestId('show-bar')).toBeVisible();
	await check('clocktower-circle-pair');

	const bar = live(page).getByTestId('show-bar');
	const cards: [string, string | null][] = [
		['Charakter', null],
		['Das ist der Dämon', null],
		['Deine Minions', null],
		['Bluffs', null],
		['Du bist', 'imp'],
		['Zahl', '3'],
		['Ja', null],
		['Nein', null]
	];
	for (const [item, option] of cards) {
		await bar.getByRole('button', { name: item, exact: true }).click();
		if (option) await bar.getByLabel(item, { exact: true }).selectOption(option);
		await bar.getByRole('button', { name: 'Zeigen', exact: true }).click();
		await expect(page.getByTestId('show-card')).toBeVisible();
		await check(`clocktower-show-${item.toLowerCase().replace(/[^a-zäöü]+/g, '-')}`);
		await page.getByTestId('show-card').click();
		await expect(page.getByTestId('show-card')).toHaveCount(0);
	}

	// the grimoire, held
	const hold = page.getByRole('button', { name: 'Grimoire', exact: true });
	await hold.scrollIntoViewIfNeeded();
	const box = (await hold.boundingBox())!;
	await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
	await page.mouse.down();
	await expect(live(page).locator('[data-grimoire]')).toBeVisible();
	await check('clocktower-grimoire');
	await page.mouse.up();
	await expect(live(page).locator('[data-grimoire]')).toHaveCount(0);

	// night 2 with the Butler dead: Poisoner 1-4, Monk 5-8, Imp 9-12 (circle 11), ..., Spy, deaths at screen 29
	const two = play(dead(firstDay(night1), 9), [{ type: 'endDay' }, { type: 'next' }]);
	await seedClocktower(page, play(two, next(11)));
	await page.goto('/spiele/clocktower/spielen');
	await expect(live(page).getByText('Ziel notieren', { exact: true })).toBeVisible();
	await live(page).getByRole('button', { name: 'Platz 2, Bo', exact: true }).click();
	await expect(live(page).getByText('Ziel: Bo (#2)', { exact: true })).toBeVisible();
	await check('clocktower-imp');
	await live(page).getByRole('button', { name: 'Imp wählt sich selbst', exact: true }).click();
	await expect(dialog(page).getByText('Wer wird der neue Imp?', { exact: false })).toBeVisible();
	await check('clocktower-imp-self');
	await dialog(page).getByRole('button', { name: 'Schließen', exact: true }).click();
	await expect(dialog(page)).toHaveCount(0);

	await open(page, play(two, next(29)), 'Wer ist heute Nacht gestorben?');
	await live(page).getByRole('button', { name: 'Platz 2, Bo', exact: true }).click();
	await check('clocktower-deaths');
}
