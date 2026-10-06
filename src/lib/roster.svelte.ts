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

const offline: Result = { ok: false, message: 'Der Server ist gerade nicht erreichbar.' };

const key = (name: string) => name.trim().toLocaleLowerCase('de');

const sorted = (list: SavedPlayer[]) =>
	[...list].sort((a, b) => a.name.localeCompare(b.name, 'de', { sensitivity: 'base' }) || a.id - b.id);

// add, rename and remove reject on a network failure, unlike their ApiResult
async function call<T>(run: () => Promise<T>): Promise<T | null> {
	try {
		return await run();
	} catch {
		return null;
	}
}

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
	const live = new Set(list.map((s) => s.id));
	const linked = new Set(players.map((p) => savedId(p.id)).filter((id) => id !== null && live.has(id)));
	const next: Player[] = [];
	for (const p of players) {
		const id = savedId(p.id);
		if (id !== null && live.has(id)) {
			const name = list.find((s) => s.id === id)!.name;
			// a name another entry already holds is not taken over, or names stop being unique
			const clash = players.some((q) => q !== p && key(q.name) === key(name));
			next.push(clash ? p : { ...p, name });
			continue;
		}
		const guest = id === null ? p : { id: newId(), name: p.name };
		const match = list.find((s) => !linked.has(s.id) && key(s.name) === key(guest.name));
		if (!match) {
			next.push(guest);
			continue;
		}
		linked.add(match.id);
		next.push({ id: playerId(match.id), name: match.name });
	}
	// an unchanged roster is not rewritten: a fresh device would gain an "[]" key on every page load
	if (next.some((p, i) => p.id !== players[i].id || p.name !== players[i].name)) save(next);
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
	promote(id: string): Promise<Result>;
	createSaved(name: string): Promise<Result>;
	renameSaved(dbId: number, name: string): Promise<Result>;
	deleteSaved(dbId: number): Promise<Result>;
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
	async promote(id) {
		const guest = players.find((p) => p.id === id);
		if (!guest || savedId(id) !== null) return { ok: false, message: 'Das ist schon ein gespeicherter Spieler.' };
		let match = saved.find((s) => key(s.name) === key(guest.name));
		if (match && players.some((p) => p.id === playerId(match!.id)))
			return { ok: false, message: `„${match.name}“ ist schon dabei.` };
		if (!match) {
			const res = await call(() => playersApi.add(guest.name));
			if (!res) return offline;
			if (!res.ok) return res;
			match = res.player;
			saved = sorted([...saved, match]);
		}
		const link = { id: playerId(match.id), name: match.name };
		save(players.map((p) => (p.id === id ? link : p)));
		return { ok: true };
	},
	async createSaved(name) {
		const res = await call(() => playersApi.add(name));
		if (!res) return offline;
		if (!res.ok) return res;
		saved = sorted([...saved, res.player]);
		return { ok: true };
	},
	async renameSaved(dbId, name) {
		const id = playerId(dbId);
		const taken = players.find((p) => p.id !== id && key(p.name) === key(name));
		if (taken) return { ok: false, message: `„${taken.name}“ ist schon dabei.` };
		const res = await call(() => playersApi.rename(dbId, name));
		if (!res) return offline;
		if (!res.ok) return res;
		saved = sorted(saved.map((s) => (s.id === dbId ? res.player : s)));
		save(players.map((p) => (p.id === id ? { ...p, name: res.player.name } : p)));
		return { ok: true };
	},
	async deleteSaved(dbId) {
		const res = await call(() => playersApi.remove(dbId));
		if (!res) return offline;
		if (!res.ok) return res;
		saved = saved.filter((s) => s.id !== dbId);
		const id = playerId(dbId);
		save(players.filter((p) => p.id !== id));
		return { ok: true };
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
