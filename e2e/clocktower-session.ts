import type { Page } from '@playwright/test';
import { clocktower } from '../src/lib/games/clocktower/engine.ts';
import type { ClocktowerAction, ClocktowerState } from '../src/lib/games/clocktower/types.ts';

// The session as the play route stores it, plus the player count that matches its seats.
export async function seedClocktower(page: Page, state: ClocktowerState): Promise<void> {
	if (page.url() === 'about:blank') await page.goto('/');
	const session = JSON.stringify({ v: clocktower.stateVersion, state });
	await page.evaluate(
		({ session, count }) => {
			localStorage.setItem('arcade:session:clocktower', session);
			localStorage.setItem('arcade:count:clocktower', count);
		},
		{ session, count: String(state.seats.length) }
	);
}

// An action the reducer ignores is a mistake in the test's script, so it fails loudly instead of seeding a state
// that only looks right.
export function play(state: ClocktowerState, actions: ClocktowerAction[]): ClocktowerState {
	return actions.reduce((s, action, i) => {
		const next = clocktower.reduce(s, action);
		if (next === s) throw new Error(`action ${i} (${JSON.stringify(action)}) changed nothing in phase ${clocktower.phase(s)}`);
		return next;
	}, state);
}
