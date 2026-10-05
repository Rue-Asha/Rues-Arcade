import type { Action } from 'svelte/action';
import type { TransitionConfig } from 'svelte/transition';

export const ease = 'cubic-bezier(0.22, 1, 0.36, 1)';

const easeOut = (t: number) => 1 - (1 - t) ** 3;
const fmt = new Intl.NumberFormat('de-DE');

export function reducedMotion(): boolean {
	return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function rise(_node: Element, { delay = 0, y = 12 }: { delay?: number; y?: number } = {}): TransitionConfig {
	if (reducedMotion()) return { duration: 0 };
	return {
		delay,
		duration: 420,
		easing: easeOut,
		css: (t, u) => `opacity:${t};transform:translateY(${u * y}px)`
	};
}

// Owns the element's text: render it empty and pass the score as the parameter.
export const countUp: Action<HTMLElement, number> = (node, value = 0) => {
	let shown = 0;
	let frame = 0;

	const to = (target: number) => {
		cancelAnimationFrame(frame);
		const from = shown;
		if (reducedMotion() || from === target) {
			shown = target;
			node.textContent = fmt.format(target);
			return;
		}
		const start = performance.now();
		const tick = (now: number) => {
			const t = Math.min(1, (now - start) / 1100);
			shown = Math.round(from + (target - from) * easeOut(t));
			node.textContent = fmt.format(shown);
			if (t < 1) frame = requestAnimationFrame(tick);
		};
		node.textContent = fmt.format(from);
		frame = requestAnimationFrame(tick);
	};

	to(value);
	return { update: to, destroy: () => cancelAnimationFrame(frame) };
};

function burst(node: HTMLElement) {
	if (reducedMotion() || typeof node.animate !== 'function') return;
	node.animate(
		[
			{ transform: 'scale(0.9)', opacity: 0 },
			{ transform: 'scale(1.06)', opacity: 1, offset: 0.6 },
			{ transform: 'scale(1)', opacity: 1 }
		],
		{ duration: 560, easing: ease }
	);
}

export const pulse: Action<HTMLElement, unknown> = (node) => {
	burst(node);
	return { update: () => burst(node) };
};
