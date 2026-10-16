import { expect, type Page } from '@playwright/test';
import { F15, F5, seated } from '../../src/lib/games/clocktower/fixtures.ts';
import type { CharacterId, ClocktowerState } from '../../src/lib/games/clocktower/types.ts';
import { play, seedClocktower } from '../clocktower-session.ts';
import { live, settled } from '../helpers.ts';
import { day1, nightEnd } from './clocktower-day.ts';

// Good wins: the Imp (seat 7) passes the demon to the Poisoner (seat 6) on night 2 and the new Imp is executed on
// day 2. The Drunk (seat 5) believes the Chef.
export const GOOD: CharacterId[] = ['washerwoman', 'empath', 'monk', 'ravenkeeper', 'drunk', 'poisoner', 'imp'];

// Tonight's Imp step is open and the Imp passes the demon to `to`.
export function starpass(s: ClocktowerState, to: number): ClocktowerState {
	let t = s;
	for (;;) {
		const n = t.night!;
		const here = n.screens[n.at];
		if ('step' in here && n.steps[here.step].kind === 'imp') break;
		t = play(t, [{ type: 'next' }]);
	}
	return play(t, [{ type: 'starpass', seat: to }]);
}

const toDay = (s: ClocktowerState) => play(s, [{ type: 'next' }, { type: 'next' }, { type: 'timer', minutes: null, now: 0 }]);

// The teaser of a game good wins after a starpass, the Drunk believing Chef.
export function goodWin(): ClocktowerState {
	const night2 = play(day1(seated(GOOD, { believed: 'chef' })), [{ type: 'endDay' }, { type: 'next' }]);
	return play(toDay(nightEnd(starpass(night2, 5), [6])), [{ type: 'execute', seat: 5 }, { type: 'next' }]);
}

// The teaser of a game evil wins: an execution on day 1, a night death, an execution on day 2 leaves two alive.
export function evilWin(): ClocktowerState {
	const night2 = play(day1(seated(F5)), [{ type: 'execute', seat: 1 }, { type: 'next' }]);
	return play(toDay(nightEnd(night2, [0])), [{ type: 'execute', seat: 4 }, { type: 'next' }]);
}

// A finished 15-seat game with a few dead seats, for the longest reveal list.
function long(): ClocktowerState {
	const s = seated(F15);
	const seats = s.seats.map((x, i) => ({ ...x, alive: i % 4 !== 3, ghostVote: i % 8 !== 3 }));
	return { ...s, seats, winner: 'good', phase: { kind: 'over', revealed: false } };
}

// The teaser and the reveal of a good win (starpass history, the Drunk), an evil win and a 15-seat game.
export async function walk(page: Page, check: (slug: string) => Promise<void>) {
	for (const [name, state] of [['good', goodWin()], ['evil', evilWin()], ['15', long()]] as const) {
		await seedClocktower(page, state);
		await page.goto('/spiele/clocktower/spielen');
		await expect(live(page).getByRole('heading', { name: 'Das Spiel ist vorbei', exact: true })).toBeVisible();
		await settled(page);
		await check(`clocktower-end-teaser-${name}`);

		await live(page).getByRole('button', { name: 'Weiter', exact: true }).click();
		await expect(live(page).getByTestId('winner')).toBeVisible();
		await settled(page);
		await check(`clocktower-end-reveal-${name}`);
	}
}
