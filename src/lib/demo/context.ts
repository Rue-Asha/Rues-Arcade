export interface DemoState {
	expected: string | null;
	step: number;
	total: number;
	tip: string;
}

export function setDemo(s: () => DemoState | null): void {
	void s;
}

export function getDemo(): DemoState | null {
	return null;
}
