// Used whenever localStorage is missing or throws (private mode, blocked site data, SSR).
const memory = new Map<string, string>();

function local(): Storage | null {
	return typeof window === 'undefined' ? null : window.localStorage;
}

export function read(key: string): string | null {
	try {
		const value = local()?.getItem(key);
		if (value != null) return value;
	} catch {}
	return memory.get(key) ?? null;
}

export function write(key: string, value: string): void {
	try {
		const storage = local();
		if (storage) {
			storage.setItem(key, value);
			memory.delete(key);
			return;
		}
	} catch {}
	memory.set(key, value);
}

export function remove(key: string): void {
	memory.delete(key);
	try {
		local()?.removeItem(key);
	} catch {}
}
