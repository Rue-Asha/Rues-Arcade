import { json } from '@sveltejs/kit';
import { getDb } from '#lib/server/db.ts';
import { addPlayed, listPlayed } from '#lib/server/played.ts';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = () => json(listPlayed(getDb()));

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json().catch(() => null);
	const ids: unknown[] = Array.isArray(body?.playerIds) ? body.playerIds : [];
	if (!Number.isInteger(body?.surveyId) || !ids.every((id) => Number.isInteger(id)))
		return json({ message: 'Ungültige Angaben.' }, { status: 400 });
	addPlayed(getDb(), body.surveyId, ids as number[]);
	return new Response(null, { status: 204 });
};
