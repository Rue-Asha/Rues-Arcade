export type Sfx = 'press' | 'reveal' | 'correct' | 'wrong' | 'win';

export const muted: { value: boolean } = { value: false };

export function play(s: Sfx): void {
	void s;
}

export function setMuted(m: boolean): void {
	void m;
}
