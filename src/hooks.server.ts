import type { Handle, ServerInit } from '@sveltejs/kit/hooks';
import { clocktower as game } from '#lib/games/clocktower/engine.ts';
import { getDb } from '#lib/server/db.ts';
import { themed } from '#lib/theme.ts';

export const init: ServerInit = () => {
	getDb();
};

const preload = (...files: string[]) =>
	files.map((f) => `<link rel="preload" href="/fonts/${f}.woff2" as="font" type="font/woff2" crossorigin />`).join('\n\t\t');

const arcadeFonts = preload('sora-latin-wght', 'press-start-2p-latin');
const clocktowerFonts = preload('im-fell-english-sc-latin', 'alegreya-sans-latin-400');

const play = /^\/spiele\/clocktower\/spielen\/?$/;

// The session lives in localStorage only, so the server can't know a dawn or day phase: this reads it before the first
// paint, the same mapping as the entry's variant(). An unreadable session stays night, as the play route then leaves it.
const daySession = `<script>try{const s=JSON.parse(localStorage.getItem('arcade:session:clocktower'));if(s.v===${game.stateVersion}&&(s.state.phase.kind==='dawn'||s.state.phase.kind==='day'))document.documentElement.dataset.variant='day'}catch{}</script>`;

// the theme is rendered into <html> so a reload never paints another theme first
export const handle: Handle = ({ event, resolve }) => {
	const clocktower = themed(event.url.pathname);
	return resolve(event, {
		transformPageChunk: ({ html }) =>
			html
				.replace('%arcade.theme%', clocktower ? ' data-theme="clocktower" data-variant="night"' : '')
				.replace('%arcade.variant%', play.test(event.url.pathname) ? daySession : '')
				.replace('%arcade.fonts%', clocktower ? clocktowerFonts : arcadeFonts)
	});
};
