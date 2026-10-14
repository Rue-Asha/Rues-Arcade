import type { Handle, ServerInit } from '@sveltejs/kit/hooks';
import { getDb } from '#lib/server/db.ts';
import { themed } from '#lib/theme.ts';

export const init: ServerInit = () => {
	getDb();
};

const preload = (...files: string[]) =>
	files.map((f) => `<link rel="preload" href="/fonts/${f}.woff2" as="font" type="font/woff2" crossorigin />`).join('\n\t\t');

const arcadeFonts = preload('sora-latin-wght', 'press-start-2p-latin');
const clocktowerFonts = preload('im-fell-english-sc-latin', 'alegreya-sans-latin-400');

// the theme is rendered into <html> so a reload never paints another theme first
export const handle: Handle = ({ event, resolve }) => {
	const clocktower = themed(event.url.pathname);
	return resolve(event, {
		transformPageChunk: ({ html }) =>
			html
				.replace('%arcade.theme%', clocktower ? ' data-theme="clocktower" data-variant="night"' : '')
				.replace('%arcade.fonts%', clocktower ? clocktowerFonts : arcadeFonts)
	});
};
