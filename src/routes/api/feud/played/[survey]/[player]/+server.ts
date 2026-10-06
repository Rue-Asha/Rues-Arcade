import { error } from '@sveltejs/kit';
import { getDb } from '#lib/server/db.ts';
import { removePlayed } from '#lib/server/played.ts';
import type { RequestHandler } from './$types';

function id(param: string): number {
	if (!/^\d+$/.test(param)) error(404, 'Eintrag nicht gefunden.');
	return Number(param);
}

export const DELETE: RequestHandler = ({ params }) => {
	if (!removePlayed(getDb(), id(params.survey), id(params.player))) error(404, 'Eintrag nicht gefunden.');
	return new Response(null, { status: 204 });
};
