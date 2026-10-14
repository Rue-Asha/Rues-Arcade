export type Variant = 'night' | 'day';

const clocktower = /^\/spiele\/clocktower(\/|$)/;

export const themed = (pathname: string | undefined) => pathname !== undefined && clocktower.test(pathname);

export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export function applyTheme(on: boolean, variant: Variant = 'night') {
	const root = document.documentElement;
	if (on) {
		root.dataset.theme = 'clocktower';
		root.dataset.variant = variant;
	} else {
		delete root.dataset.theme;
		delete root.dataset.variant;
	}
}

// the change runs inside a view transition where there is one and motion is allowed, else at once
export function morph(change: () => void | Promise<void>) {
	if (!document.startViewTransition || reducedMotion()) return void change();
	document.startViewTransition(change);
}
