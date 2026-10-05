import type { Player } from '#lib/engine/types.ts';
import { read, write } from '#lib/storage.ts';

export type Result = { ok: true } | { ok: false; message: string };

const KEY = 'arcade:roster';

function load(): Player[] {
	try {
		const list: unknown = JSON.parse(read(KEY) ?? '[]');
		if (!Array.isArray(list)) return [];
		return list.filter(
			(p): p is Player => typeof p?.id === 'string' && typeof p?.name === 'string'
		);
	} catch {
		return [];
	}
}

let players = $state.raw<Player[]>(load());
let seq = 0;

function save(next: Player[]) {
	players = next;
	write(KEY, JSON.stringify(next));
}

function check(name: string, self?: string): Result {
	if (!name) return { ok: false, message: 'Bitte gib einen Namen ein.' };
	const taken = players.some((p) => p.id !== self && p.name.toLowerCase() === name.toLowerCase());
	if (taken) return { ok: false, message: `„${name}“ ist schon dabei.` };
	return { ok: true };
}

// crypto.randomUUID needs a secure context, and the app is served over plain http on the LAN
function newId() {
	return `${Date.now().toString(36)}-${(seq++).toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export const roster: {
	readonly players: Player[];
	add(name: string): Result;
	rename(id: string, name: string): Result;
	remove(id: string): void;
	move(id: string, to: number): void;
} = {
	get players(): Player[] {
		return players;
	},
	add(name) {
		name = name.trim();
		const result = check(name);
		if (result.ok) save([...players, { id: newId(), name }]);
		return result;
	},
	rename(id, name) {
		name = name.trim();
		const result = check(name, id);
		if (result.ok) save(players.map((p) => (p.id === id ? { ...p, name } : p)));
		return result;
	},
	remove(id) {
		save(players.filter((p) => p.id !== id));
	},
	move(id, to) {
		const player = players.find((p) => p.id === id);
		if (!player) return;
		const rest = players.filter((p) => p !== player);
		const at = Math.max(0, Math.min(to, rest.length));
		save([...rest.slice(0, at), player, ...rest.slice(at)]);
	}
};
