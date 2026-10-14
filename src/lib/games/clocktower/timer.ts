export const over = (deadline: number, now: number) => now >= deadline;

// A started second counts as a whole one, so the display reaches 0:01 and then "Zeit um", never 0:00.
export function reading(deadline: number, now: number): string {
	if (over(deadline, now)) return 'Zeit um';
	const total = Math.ceil((deadline - now) / 1000);
	return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}
