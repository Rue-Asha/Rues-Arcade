export const SEAT_MS = 2000;

// e2e sets window.clocktowerSeatMs through page.addInitScript so a sweep doesn't take 30 s
export function seatMs(): number {
	return (globalThis as { clocktowerSeatMs?: number }).clocktowerSeatMs ?? SEAT_MS;
}

export function threshold(alive: number): number {
	return Math.ceil(alive / 2);
}

// Clockwise from the seat after the nominee; the nominee votes last.
export function voteOrder(nominee: number, count: number): number[] {
	return Array.from({ length: count }, (_, k) => (nominee + 1 + k) % count);
}

export function sweepMs(count: number, perSeat = seatMs()): number {
	return count * perSeat;
}

// high: today's high-water mark, the highest count that put someone on the block or tied it. A count equal to it is
// a tie only if it reaches the threshold too; below the threshold nothing changes.
export function voteResult(votes: number, alive: number, high: number): 'block' | 'tie' | 'none' {
	if (votes < threshold(alive)) return 'none';
	if (votes > high) return 'block';
	return votes === high ? 'tie' : 'none';
}

// The hand starts on the boundary after the nominee (nominee + 0.5, in seat units) and turns one seat per perSeat;
// seat is the one whose sector holds it. null before the start and from the end of the sweep on.
export function sweepAt(ms: number, nominee: number, count: number, perSeat = seatMs()): { hand: number; seat: number } | null {
	if (ms < 0 || ms >= sweepMs(count, perSeat)) return null;
	return { hand: nominee + 0.5 + ms / perSeat, seat: voteOrder(nominee, count)[Math.floor(ms / perSeat)] };
}
