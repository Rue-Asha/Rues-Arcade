import type { Alignment, ClocktowerState, Seat } from './types.ts';

export const living = (seats: Seat[]) => seats.filter((s) => s.alive).length;

// Run after deaths: `before` is the state just before them. Good wins when the Demon died, evil when only two are
// left; good first when both happen at once.
export function check(before: ClocktowerState, after: ClocktowerState): Alignment | null {
	const demon = before.demon;
	if (demon !== null && before.seats[demon].alive && !after.seats[demon].alive) return 'good';
	return living(after.seats) <= 2 ? 'evil' : null;
}
