import { json } from '@sveltejs/kit';
import { getDb } from '#lib/server/db.ts';
import { addImposterPlayed, listImposterPlayed } from '#lib/server/imposter-played.ts';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = () => json(listImposterPlayed(getDb()));

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json().catch(() => null);
	if (!Number.isInteger(body?.pairId) || !Array.isArray(body.playerIds) || !body.playerIds.every((id: unknown) => Number.isInteger(id)))
		return json({ message: 'Ungültige Angaben.' }, { status: 400 });
	addImposterPlayed(getDb(), body.pairId, body.playerIds);
	return new Response(null, { status: 204 });
};
