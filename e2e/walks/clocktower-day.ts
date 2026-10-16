import { expect, type Page } from '@playwright/test';
import { F7, seated } from '../../src/lib/games/clocktower/fixtures.ts';
import type { CharacterId, ClocktowerAction, ClocktowerState } from '../../src/lib/games/clocktower/types.ts';
import { play, seedClocktower } from '../clocktower-session.ts';
import { live, settled } from '../helpers.ts';

export const T0 = Date.UTC(2026, 9, 14, 20, 0, 0);

// From the reveal of seat 1 to dawn of day 1: every card shown and hidden, night 1 tapped through.
export function toDawn(s: ClocktowerState): ClocktowerState {
	const cards = s.seats.flatMap((): ClocktowerAction[] => [{ type: 'show' }, { type: 'hide' }]);
	const n1 = play(s, cards);
	return play(n1, n1.night!.screens.map((): ClocktowerAction => ({ type: 'next' })));
}

// Dawn of day 1 on its timer screen (wake and deaths passed).
export const atTimer = (s: ClocktowerState) => play(toDawn(s), [{ type: 'next' }, { type: 'next' }]);

// The day-1 grimoire, with or without a timer of `minutes` started at T0.
export const day1 = (s: ClocktowerState, minutes: number | null = null) =>
	play(atTimer(s), [{ type: 'timer', minutes, now: T0 }]);

// Tonight's screens tapped through, `deaths` recorded; ends on the wake screen of dawn.
export function nightEnd(s: ClocktowerState, deaths: number[]): ClocktowerState {
	let t = s;
	while (t.phase.kind === 'night' && t.night!.screens[t.night!.at].screen !== 'deaths') t = play(t, [{ type: 'next' }]);
	return play(t, [{ type: 'deaths', seats: deaths }]);
}

export function ghostless(s: ClocktowerState, ...seats: number[]): ClocktowerState {
	return { ...s, seats: s.seats.map((x, i) => (seats.includes(i) ? { ...x, alive: false, ghostVote: false } : x)) };
}

export function ghost(s: ClocktowerState, ...seats: number[]): ClocktowerState {
	return { ...s, seats: s.seats.map((x, i) => (seats.includes(i) ? { ...x, alive: false, ghostVote: true } : x)) };
}

const F15: CharacterId[] = [
	'washerwoman', 'librarian', 'investigator', 'chef', 'empath', 'fortune-teller', 'undertaker', 'monk', 'ravenkeeper',
	'butler', 'saint', 'poisoner', 'spy', 'scarlet-woman', 'imp'
];

const vote = (nominee: number, nominator: number, votes: number): ClocktowerAction[] => [
	{ type: 'nominee', seat: nominee }, { type: 'nominate', nominator }, { type: 'vote' }, { type: 'swept' },
	{ type: 'count', votes }, { type: 'confirm' }
];

async function show(page: Page, state: ClocktowerState, ready: () => Promise<void>) {
	await seedClocktower(page, state);
	await page.goto('/spiele/clocktower/spielen');
	await ready();
	await settled(page);
}

// Dawn after night 2 (seat 2 executed on day 1, seat 3 died), the day with its timer in the head's top right, a block
// card, the nomination rings, the clock, the sweep on a long seat time so the hand stands still, confirm, result, seat actions and the
// execution announcement, for 7 and 15 seats.
export async function walk(page: Page, check: (slug: string) => Promise<void>) {
	for (const roles of [F7, F15]) {
		const n = roles.length;
		const tag = (name: string) => `clocktower-${name}-${n}`;
		const heading = (name: string | RegExp) => live(page).getByRole('heading', { name });
		const press = (name: string) => live(page).getByRole('button', { name, exact: true }).click();

		const night2 = play(day1(seated(roles)), [{ type: 'execute', seat: 1 }, { type: 'next' }]);
		const dawn = nightEnd(night2, [2]);
		await show(page, dawn, () => expect(heading('Alle aufwachen')).toBeVisible());
		await check(tag('dawn'));
		await press('Weiter');
		await expect(heading('Cleo ist gestorben')).toBeVisible();
		await settled(page);
		await check(tag('dawn-deaths'));
		await press('Weiter');
		await expect(heading('Tagestimer')).toBeVisible();
		await settled(page);
		await check(tag('dawn-timer'));

		if (n === 7) {
			await show(page, nightEnd(night2, []), () => expect(heading('Alle aufwachen')).toBeVisible());
			await press('Weiter');
			await expect(heading('Niemand ist gestorben')).toBeVisible();
			await settled(page);
			await check(tag('dawn-none'));
		}

		const grimoire = (minutes: number, now: number) =>
			play(dawn, [{ type: 'next' }, { type: 'next' }, { type: 'timer', minutes, now }]);
		const onBlock = play(grimoire(8, Date.now()), vote(3, 0, Math.ceil(n / 2)).concat({ type: 'next' }));
		await show(page, onBlock, () => expect(live(page).getByTestId('timer')).toBeVisible());
		await check(tag('grimoire'));

		// the crowded phone grimoire: both rings on the living, the turquoise one on the dead, ghost badges and the block card
		if (n === 15 && (page.viewportSize()?.width ?? 1280) < 600) {
			await show(page, ghost(onBlock, 1, 8), () => expect(live(page).getByTestId('block-card')).toBeVisible());
			await check(tag('grimoire-ghosts'));
		}

		const late = play(grimoire(1, Date.now() - 120_000), vote(3, 0, Math.ceil(n / 2)).concat({ type: 'next' }));
		await show(page, late, () => expect(live(page).getByTestId('timer')).toHaveText('Zeit um'));
		await check(tag('grimoire-late'));

		await live(page).locator('[data-seat="5"]').click();
		await expect(page.getByRole('dialog')).toBeVisible();
		await settled(page);
		await check(tag('seat-actions'));
		await page.getByRole('dialog').getByRole('button', { name: 'Schließen', exact: true }).click();

		await live(page).locator('[data-seat="6"]').click();
		await page.getByRole('dialog').getByRole('button', { name: 'Nominieren', exact: true }).click();
		await expect(heading('Wer nominiert Fey?')).toBeVisible();
		await settled(page);
		await check(tag('nominator'));
		await live(page).locator('[data-seat="5"]').click();
		await expect(live(page).getByRole('button', { name: 'Abstimmung beginnen', exact: true })).toBeVisible();
		await settled(page);
		await check(tag('clock'));

		await page.evaluate(() => ((window as unknown as { clocktowerSeatMs: number }).clocktowerSeatMs = 600_000));
		await press('Abstimmung beginnen');
		await expect(live(page).locator('[data-under]')).toBeVisible();
		await live(page).locator('[data-seat="7"]').click();
		await expect(live(page).locator('[data-seat="7"][data-marked]')).toBeVisible();
		// the hand turns for the whole (long) seat time; the shot takes it at its sector's end boundary
		await live(page).locator('[data-hand]').evaluate((el) => el.getAnimations().forEach((a) => a.finish()));
		await settled(page);
		await check(tag('sweep'));

		const counted = play(grimoire(8, Date.now()), [
			{ type: 'nominee', seat: 4 }, { type: 'nominate', nominator: 0 }, { type: 'vote' },
			{ type: 'mark', seat: 3, on: true }, { type: 'mark', seat: 5, on: true }, { type: 'swept' }
		]);
		await show(page, counted, () => expect(live(page).getByTestId('count')).toBeVisible());
		await check(tag('confirm'));
		await press('Bestätigen');
		await expect(heading(/auf den Block|Nichts ändert sich|Gleichstand/)).toBeVisible();
		await settled(page);
		await check(tag('result'));

		await show(page, play(onBlock, [{ type: 'endDay' }]), () => expect(heading('Dani wird hingerichtet')).toBeVisible());
		await check(tag('execution'));
	}
}
