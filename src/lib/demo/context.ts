export interface DemoState {
	expected: string | null;
	step: number;
	total: number;
	tip: string;
}

// a module slot rather than Svelte context: Button and HoldToView call getDemo() inside $derived, where
// getContext isn't allowed; the getter reads the demo route's $state, so readers still re-derive
let source: () => DemoState | null = () => null;

export function setDemo(s: () => DemoState | null): void {
	source = s;
}

export function getDemo(): DemoState | null {
	return source();
}
