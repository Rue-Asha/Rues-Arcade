import type { Player } from '#lib/engine/types.ts';

export type Result = { ok: true } | { ok: false; message: string };

export const roster: {
	readonly players: Player[];
	add(name: string): Result;
	rename(id: string, name: string): Result;
	remove(id: string): void;
	move(id: string, to: number): void;
} = {
	get players(): Player[] {
		return [];
	},
	add() {
		throw new Error('not implemented');
	},
	rename() {
		throw new Error('not implemented');
	},
	remove() {
		throw new Error('not implemented');
	},
	move() {
		throw new Error('not implemented');
	}
};
