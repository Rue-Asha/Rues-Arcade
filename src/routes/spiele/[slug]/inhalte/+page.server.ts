import { error } from '@sveltejs/kit';
import { isSurvey } from '#lib/content/types.ts';
import { games } from '#lib/games/registry.ts';
import { getDb } from '#lib/server/db.ts';
import { list } from '#lib/server/content.ts';
import { listSurveys } from '#lib/server/surveys.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params }) => {
	const entry = games.find((g) => g.def.slug === params.slug);
	if (!entry) error(404, 'Dieses Spiel gibt es nicht.');
	const type = entry.def.contentType;
	return isSurvey(type)
		? { items: [], surveys: listSurveys(getDb()) }
		: { items: list(getDb(), type), surveys: [] };
};
