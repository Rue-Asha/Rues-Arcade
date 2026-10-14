export type Variant = 'night' | 'day';

const clocktower = /^\/spiele\/clocktower(\/|$)/;

export const themed = (pathname: string | undefined) => pathname !== undefined && clocktower.test(pathname);

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
