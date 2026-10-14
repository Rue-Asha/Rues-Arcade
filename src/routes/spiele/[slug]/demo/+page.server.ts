import { error } from '@sveltejs/kit';
import { games } from '#lib/games/registry.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params }) => {
	const entry = games.find((g) => g.def.slug === params.slug);
	if (!entry) error(404, 'Dieses Spiel gibt es nicht.');
	// a game without a demo answers like any unknown route
	if (!entry.demo) error(404, 'Not Found');
};
