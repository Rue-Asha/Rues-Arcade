import { expect, type Page } from '@playwright/test';
import { clocktower } from '../../src/lib/games/clocktower/engine.ts';
import type { CharacterId, ClocktowerAction, ClocktowerState } from '../../src/lib/games/clocktower/types.ts';
import { play, seedClocktower } from '../clocktower-session.ts';
import { live, seedRoster } from '../helpers.ts';

type Check = (slug: string) => Promise<void>;

const NAMES = ['Alex', 'Bo', 'Cleo', 'Dani', 'Eli', 'Fey', 'Gus', 'Hana', 'Ida', 'Jo', 'Kai', 'Lu', 'Mo', 'Nia', 'Ole'];

const empty = (n: number): ClocktowerState =>
	clocktower.init({ players: NAMES.slice(0, n).map((name) => ({ id: name.toLowerCase(), name })), config: {}, content: [], seed: 5 });

const assign = (...ids: CharacterId[]): ClocktowerAction[] => ids.map((character, seat) => ({ type: 'assign', seat, character }));

// 7 seats: the Baron turns the table into 3 Townsfolk and 2 Outsiders; 15 seats: 9 / 2 / 3 / 1
const done = (n: number) =>
	n === 7
		? play(empty(7), [
				...assign('fortune-teller', 'drunk', 'chef', 'washerwoman', 'recluse', 'baron', 'imp'),
				{ type: 'believe', character: 'monk' },
				{ type: 'herring', seat: 0 }
			])
		: play(empty(15), [
				...assign('fortune-teller', 'drunk', 'chef', 'washerwoman', 'librarian', 'investigator', 'empath', 'undertaker', 'monk', 'ravenkeeper', 'saint', 'poisoner', 'spy', 'scarlet-woman', 'imp'),
				{ type: 'believe', character: 'slayer' },
				{ type: 'herring', seat: 0 }
			]);

async function open(page: Page, state: ClocktowerState) {
	await seedRoster(page, NAMES.slice(0, state.seats.length));
	await seedClocktower(page, state);
	await page.goto('/spiele/clocktower/spielen');
}

// Setup board with 7 and 15 seats, empty, partly assigned with an error (one Minion too many), complete, the confirm dialog; the reveal.
export async function walk(page: Page, check: Check) {
	for (const n of [7, 15]) {
		await open(page, empty(n));
		await expect(live(page).getByRole('heading', { name: 'Sitzordnung' })).toBeVisible();
		await check(`clocktower-setup-${n}-empty`);

		await open(page, play(empty(n), assign('poisoner', 'spy', ...(n === 15 ? (['scarlet-woman', 'baron'] as const) : []))));
		await expect(live(page).getByText('zu viele', { exact: true })).toBeVisible();
		await check(`clocktower-setup-${n}-error`);

		await open(page, done(n));
		await expect(live(page).getByLabel('Red Herring')).toHaveValue('0');
		await check(`clocktower-setup-${n}-complete`);

		await live(page).getByRole('button', { name: 'Weiter', exact: true }).click();
		await expect(page.getByRole('dialog').getByRole('heading', { name: 'Rollen sind verteilt und notiert?' })).toBeVisible();
		await check(`clocktower-setup-${n}-confirm`);

		const locked = play(done(n), [{ type: 'lock' }]);
		await open(page, locked);
		await expect(live(page).getByRole('button', { name: 'Rolle zeigen', exact: true })).toBeVisible();
		await check(`clocktower-reveal-${n}-name`);

		await live(page).getByRole('button', { name: 'Rolle zeigen', exact: true }).click();
		await expect(live(page).getByTestId('role-card')).toBeVisible();
		await check(`clocktower-reveal-${n}-card`);
	}
}
