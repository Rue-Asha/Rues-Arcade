import { error } from '@sveltejs/kit';
import { games } from '#lib/games/registry.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params }) => {
	if (!games.some((g) => g.def.slug === params.slug)) error(404, 'Dieses Spiel gibt es nicht.');
};
