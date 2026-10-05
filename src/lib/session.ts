import { read, remove, write } from '#lib/storage.ts';

const key = (slug: string) => `arcade:session:${slug}`;

export function saveSession(slug: string, v: number, state: unknown): void {
	write(key(slug), JSON.stringify({ v, state }));
}

const kind = (x: unknown) => (Array.isArray(x) ? 'array' : x === null ? 'null' : typeof x);

// like: a valid state of the same version, checked all the way down. Every key it has must be there with the
// same kind; null there stands for a field that is sometimes null. A non-empty array in it means the saved one
// must be non-empty too, with every element shaped like its first.
function fits(x: unknown, like: unknown): boolean {
	if (like === null) return true;
	if (kind(x) !== kind(like)) return false;
	if (Array.isArray(like))
		return like.length === 0 || ((x as unknown[]).length > 0 && (x as unknown[]).every((e) => fits(e, like[0])));
	if (kind(like) === 'object')
		return Object.entries(like as object).every(([k, v]) => fits((x as Record<string, unknown>)[k], v));
	return true;
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
