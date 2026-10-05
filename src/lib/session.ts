import { read, remove, write } from '#lib/storage.ts';

const key = (slug: string) => `arcade:session:${slug}`;

export function saveSession(slug: string, v: number, state: unknown): void {
	write(key(slug), JSON.stringify({ v, state }));
}

export function loadSession<S>(slug: string, v: number): { state: S } | { discarded: true } | null {
	const raw = read(key(slug));
	if (raw === null) return null;
	try {
		const saved = JSON.parse(raw);
		if (saved?.v === v && typeof saved.state === 'object' && saved.state !== null)
			return { state: saved.state as S };
	} catch {}
	remove(key(slug));
	return { discarded: true };
}

export function clearSession(slug: string): void {
	remove(key(slug));
}
