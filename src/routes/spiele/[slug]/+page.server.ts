import { error } from '@sveltejs/kit';
import { games } from '#lib/games/registry.ts';
import { getDb } from '#lib/server/db.ts';
import { list } from '#lib/server/content.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params }) => {
	const entry = games.find((g) => g.def.slug === params.slug);
	if (!entry) error(404, 'Dieses Spiel gibt es nicht.');
	return { count: list(getDb(), entry.def.contentType).length };
};
