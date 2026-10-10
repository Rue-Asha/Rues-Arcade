import { json } from '@sveltejs/kit';
import { getDb } from '#lib/server/db.ts';
import { addImposterPlayed, listImposterPlayed } from '#lib/server/imposter-played.ts';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = () => json(listImposterPlayed(getDb()));

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json().catch(() => null);
	const ids: unknown[] = Array.isArray(body?.playerIds) ? body.playerIds : [];
	if (!Number.isInteger(body?.pairId) || !ids.every((id) => Number.isInteger(id)))
		return json({ message: 'Ungültige Angaben.' }, { status: 400 });
	addImposterPlayed(getDb(), body.pairId, ids as number[]);
	return new Response(null, { status: 204 });
};
