import type { Action } from 'svelte/action';
import type { TransitionConfig } from 'svelte/transition';
import { motion } from '#lib/ui/tokens.ts';

export const ease = motion['ease-out'];

const easeOut = (t: number) => 1 - (1 - t) ** 3;

// svelte's `easing` takes a function, the tokens are CSS strings
function bezier(css: string): (t: number) => number {
	const [x1, y1, x2, y2] = css.match(/-?[\d.]+/g)!.map(Number);
	const at = (a: number, b: number, u: number) => 3 * a * (1 - u) ** 2 * u + 3 * b * (1 - u) * u ** 2 + u ** 3;
	return (x) => {
		let lo = 0;
		let hi = 1;
		for (let i = 0; i < 24; i++) {
			const mid = (lo + hi) / 2;
			if (at(x1, x2, mid) < x) lo = mid;
			else hi = mid;
		}
		return at(y1, y2, (lo + hi) / 2);
	};
}

export const outCurve = bezier(motion['ease-out']);
const inCurve = bezier(motion['ease-in']);
const popCurve = bezier(motion['ease-pop']);
const fmt = new Intl.NumberFormat('de-DE');

export function reducedMotion(): boolean {
	return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function rise(_node: Element, { delay = 0, y = 12 }: { delay?: number; y?: number } = {}): TransitionConfig {
	if (reducedMotion()) return { duration: 0 };
	return {
		delay,
		duration: motion['dur-in'],
		easing: easeOut,
		css: (t, u) => `opacity:${t};transform:translateY(${u * y}px)`
	};
}

export function phaseOut(_node: Element): TransitionConfig {
	if (reducedMotion()) return { duration: 0 };
	return {
		duration: motion['dur-out'],
		easing: inCurve,
		css: (t, u) => `opacity:${t};transform:translateY(${u * -8}px)`
	};
}

export function pop(_node: Element, { delay = 0 }: { delay?: number } = {}): TransitionConfig {
	if (reducedMotion()) return { duration: 0 };
	return {
		delay,
		duration: motion['dur-in'],
		easing: popCurve,
		css: (t) => `opacity:${Math.min(1, t * 3)};transform:scale(${0.92 + 0.08 * t})`
	};
}

export function band(_node: Element): TransitionConfig {
	if (reducedMotion()) return { duration: 0 };
	return {
		duration: motion['dur-in'],
		easing: outCurve,
		css: (t) => `transform:scaleX(${t})`
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
			// the frame timestamp can predate `start` by a few ms
			const t = Math.min(1, Math.max(0, (now - start) / 1100));
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

export function burst(node: HTMLElement) {
	if (reducedMotion() || typeof node.animate !== 'function') return;
	node.animate(
		[
			{ transform: 'scale(0.9)', opacity: 0 },
			{ transform: 'scale(1.06)', opacity: 1, offset: 0.6 },
			{ transform: 'scale(1)', opacity: 1 }
		],
		{ duration: motion['dur-hero'], easing: ease }
	);
}

export function turn(node: HTMLElement) {
	if (reducedMotion() || typeof node.animate !== 'function') return;
	node.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(20deg)' }], {
		duration: motion['dur-hero'] * 2,
		easing: ease,
		iterations: 1,
		fill: 'forwards'
	});
}

export function fault(shake?: HTMLElement, stamp?: HTMLElement) {
	if (reducedMotion()) return;
	shake?.animate(
		[
			{ transform: 'translateX(0)' },
			{ transform: 'translateX(-10px)', offset: 0.2 },
			{ transform: 'translateX(8px)', offset: 0.45 },
			{ transform: 'translateX(-5px)', offset: 0.7 },
			{ transform: 'translateX(0)' }
		],
		{ duration: 360, easing: ease }
	);
	stamp?.animate(
		[
			{ transform: 'scale(2.2)', opacity: 0 },
			{ transform: 'scale(1)', opacity: 1, offset: 0.25 },
			{ transform: 'scale(1)', opacity: 1, offset: 0.7 },
			{ transform: 'scale(1)', opacity: 0 }
		],
		{ duration: 800, easing: ease }
	);
}

export function scatter(pieces: HTMLElement[]) {
	if (reducedMotion()) return;
	pieces.forEach((piece, i) => {
		const angle = (i / pieces.length) * Math.PI * 2;
		const x = Math.round(Math.cos(angle) * 140);
		const y = Math.round(Math.sin(angle) * 140);
		piece.animate(
			[
				{ transform: 'translate(0, 0) scale(0.4) rotate(0deg)', opacity: 0 },
				{ transform: `translate(${x * 0.6}px, ${y * 0.6}px) scale(1.1) rotate(120deg)`, opacity: 1, offset: 0.4 },
				{ transform: `translate(${x}px, ${y}px) scale(1) rotate(240deg)`, opacity: 0 }
			],
			{ duration: motion['dur-in'] * 2, delay: i * 30, easing: ease, fill: 'both' }
		);
	});
}

export const pulse: Action<HTMLElement, unknown> = (node) => {
	burst(node);
	return { update: () => burst(node) };
};
