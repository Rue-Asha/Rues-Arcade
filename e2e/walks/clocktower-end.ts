import type { Page } from '@playwright/test';
import { F5, seated } from '../../src/lib/games/clocktower/fixtures.ts';
import type { CharacterId, ClocktowerState } from '../../src/lib/games/clocktower/types.ts';
import { play } from '../clocktower-session.ts';
import { day1, nightEnd } from './clocktower-day.ts';

// Good wins: the Imp (seat 7) passes the demon to the Poisoner (seat 6) on night 2 and the new Imp is executed on
// day 2. The Drunk (seat 5) believes the Chef.
export const GOOD: CharacterId[] = ['washerwoman', 'empath', 'monk', 'ravenkeeper', 'drunk', 'poisoner', 'imp'];

// Tonight's Imp step is open and the Imp passes the demon to `to`.
function starpass(s: ClocktowerState, to: number): ClocktowerState {
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

// filled by task 10.3; seeds its own state
export async function walk(page: Page, check: (slug: string) => Promise<void>) {}
