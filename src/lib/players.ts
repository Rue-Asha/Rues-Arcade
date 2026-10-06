export interface SavedPlayer {
	id: number;
	name: string;
}

export const NAME_MAX = 40;

export function nameError(name: string): string | null {
	if (!name) return 'Bitte gib einen Namen ein.';
	if (name.length > NAME_MAX) return `Höchstens ${NAME_MAX} Zeichen.`;
	return null;
}

export function playerId(dbId: number): string {
	return `player-${dbId}`;
}

export function savedId(id: string): number | null {
	const m = /^player-(\d+)$/.exec(id);
	return m ? Number(m[1]) : null;
}

export type ApiResult = { ok: true; player: SavedPlayer } | { ok: false; status: number; message: string };
type Failure = { ok: false; status: number; message: string };

async function failure(res: Response): Promise<Failure> {
	const body = await res.json().catch(() => null);
	return { ok: false, status: res.status, message: String(body?.message ?? 'Das hat nicht geklappt.') };
}

async function send(url: string, method: string, name: string): Promise<ApiResult> {
	const res = await fetch(url, {
		method,
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({ name })
	});
	return res.ok ? { ok: true, player: await res.json() } : failure(res);
}

export const playersApi = {
	async list(): Promise<SavedPlayer[]> {
		const res = await fetch('/api/players');
		if (!res.ok) throw new Error(`GET /api/players ${res.status}`);
		return res.json();
	},
	add: (name: string) => send('/api/players', 'POST', name),
	rename: (id: number, name: string) => send(`/api/players/${id}`, 'PATCH', name),
	async remove(id: number): Promise<{ ok: true } | Failure> {
		const res = await fetch(`/api/players/${id}`, { method: 'DELETE' });
		return res.ok ? { ok: true } : failure(res);
	}
};
