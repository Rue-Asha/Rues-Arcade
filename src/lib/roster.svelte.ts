import type { Player } from '#lib/engine/types.ts';
import { playerId, playersApi, savedId, type SavedPlayer } from '#lib/players.ts';
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
let saved = $state.raw<SavedPlayer[]>([]);
let savedError = $state('');
let synced: Promise<void> | null = null;
let seq = 0;

const key = (name: string) => name.trim().toLocaleLowerCase('de');

async function sync() {
	let list: SavedPlayer[];
	try {
		list = await playersApi.list();
	} catch {
		savedError = 'Gespeicherte Spieler sind gerade nicht erreichbar.';
		return;
	}
	saved = list;
	savedError = '';
	const linked = new Set(players.map((p) => savedId(p.id)));
	save(
		players.map((p) => {
			const id = savedId(p.id);
			if (id !== null) return { ...p, name: list.find((s) => s.id === id)?.name ?? p.name };
			const match = list.find((s) => !linked.has(s.id) && key(s.name) === key(p.name));
			if (!match) return p;
			linked.add(match.id);
			return { id: playerId(match.id), name: match.name };
		})
	);
}

function save(next: Player[]) {
	players = next;
	write(KEY, JSON.stringify(next));
}

function check(name: string, self?: string): Result {
	if (!name) return { ok: false, message: 'Bitte gib einen Namen ein.' };
	const taken = players.find((p) => p.id !== self && key(p.name) === key(name));
	if (taken) return { ok: false, message: `„${taken.name}“ ist schon dabei.` };
	return { ok: true };
}

// crypto.randomUUID needs a secure context, and the app is served over plain http on the LAN
function newId() {
	return `${Date.now().toString(36)}-${(seq++).toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export const roster: {
	readonly players: Player[];
	readonly saved: SavedPlayer[];
	readonly savedError: string;
	ready(): Promise<void>;
	isGuest(p: Player): boolean;
	add(name: string): Result;
	addSaved(dbId: number): Result;
	rename(id: string, name: string): Result;
	remove(id: string): void;
	move(id: string, to: number): void;
} = {
	get players(): Player[] {
		return players;
	},
	get saved(): SavedPlayer[] {
		return saved;
	},
	get savedError(): string {
		return savedError;
	},
	ready() {
		return (synced ??= sync());
	},
	isGuest(p) {
		return savedId(p.id) === null;
	},
	add(name) {
		name = name.trim();
		const match = saved.find((s) => key(s.name) === key(name));
		if (match) return roster.addSaved(match.id);
		const result = check(name);
		if (result.ok) save([...players, { id: newId(), name }]);
		return result;
	},
	addSaved(dbId) {
		const match = saved.find((s) => s.id === dbId);
		if (!match) return { ok: false, message: 'Diesen Spieler gibt es nicht mehr.' };
		const id = playerId(dbId);
		const result = players.some((p) => p.id === id)
			? { ok: false as const, message: `„${match.name}“ ist schon dabei.` }
			: check(match.name);
		if (result.ok) save([...players, { id, name: match.name }]);
		return result;
	},
	rename(id, name) {
		if (savedId(id) !== null)
			return { ok: false, message: 'Gespeicherte Spieler benennst du unter „Gespeicherte Spieler“ um.' };
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
