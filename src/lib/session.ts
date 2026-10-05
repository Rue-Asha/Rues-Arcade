export function saveSession(slug: string, v: number, state: unknown): void {
	void slug;
	void v;
	void state;
}

export function loadSession<S>(slug: string, v: number): { state: S } | { discarded: true } | null {
	void slug;
	void v;
	return null;
}

export function clearSession(slug: string): void {
	void slug;
}
