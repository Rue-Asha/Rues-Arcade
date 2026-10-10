import { error } from '@sveltejs/kit';
import { isSurvey } from '#lib/content/types.ts';
import { games } from '#lib/games/registry.ts';
import { getDb } from '#lib/server/db.ts';
import { list } from '#lib/server/content.ts';
import { listImposterPlayed } from '#lib/server/imposter-played.ts';
import { listSurveys } from '#lib/server/surveys.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params }) => {
	const entry = games.find((g) => g.def.slug === params.slug);
	if (!entry) error(404, 'Dieses Spiel gibt es nicht.');
	const type = entry.def.contentType;
	const db = getDb();
	return isSurvey(type)
		? { items: [], surveys: listSurveys(db), played: [] }
		: {
				items: list(db, type),
				surveys: [],
				played: type === 'imposter_pairs' ? listImposterPlayed(db) : []
			};
};
