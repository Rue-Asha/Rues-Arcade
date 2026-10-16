import { read, write } from '#lib/storage.ts';

const key = (slug: string) => `arcade:count:${slug}`;

// The first load stores the default, so a later roster change never moves the count.
export function loadCount(slug: string, range: { min: number; max: number }, rosterSize: number): number {
	const raw = read(key(slug));
	const n = raw === null || !/^\d+$/.test(raw) ? NaN : Number(raw);
	if (n >= range.min && n <= range.max) return n;
	const fallback = Math.min(range.max, Math.max(range.min, rosterSize));
	saveCount(slug, fallback);
	return fallback;
}

export function saveCount(slug: string, n: number): void {
	write(key(slug), String(n));
}
