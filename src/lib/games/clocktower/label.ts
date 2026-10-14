import type { Seat } from './types.ts';

// "Bo (#2)": every private screen names a seat by player and seat number
export const who = (seats: Seat[], i: number) => `${seats[i].player.name} (#${i + 1})`;

// "Cleo (#3) und Dani (#4)", "A, B und C"
export function whoAll(seats: Seat[], list: number[]): string {
	const names = list.map((i) => who(seats, i));
	return names.length < 2 ? names.join('') : `${names.slice(0, -1).join(', ')} und ${names.at(-1)}`;
}
