import { read, remove, write } from '#lib/storage.ts';

const key = (slug: string) => `arcade:session:${slug}`;

export function saveSession(slug: string, v: number, state: unknown): void {
	write(key(slug), JSON.stringify({ v, state }));
}

const kind = (x: unknown) => (Array.isArray(x) ? 'array' : x === null ? 'null' : typeof x);

// like: a valid state of the same version. Every key it has must be there with the same kind; null there
// stands for a field that is sometimes null.
function fits(state: Record<string, unknown>, like: object): boolean {
	return Object.entries(like).every(([k, x]) => x === null || kind(state[k]) === kind(x));
}

export function loadSession<S extends object>(
	slug: string,
	v: number,
	like?: S
): { state: S } | { discarded: true } | null {
	const raw = read(key(slug));
	if (raw === null) return null;
	try {
		const saved = JSON.parse(raw);
		if (saved?.v === v && kind(saved.state) === 'object' && (!like || fits(saved.state, like)))
			return { state: saved.state as S };
	} catch {}
	remove(key(slug));
	return { discarded: true };
}

export function clearSession(slug: string): void {
	remove(key(slug));
}
