import type { Page } from '@playwright/test';
import type { ClocktowerAction, ClocktowerState } from '../../src/lib/games/clocktower/types.ts';
import { play } from '../clocktower-session.ts';

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

// seeds its own state
export async function walk(page: Page, check: (slug: string) => Promise<void>) {}
