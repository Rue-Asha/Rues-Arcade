import { error, json } from '@sveltejs/kit';
import { getDb } from '#lib/server/db.ts';
import { contentType, remove, update } from '#lib/server/content.ts';
import type { RequestHandler } from './$types';

function entryId(param: string): number {
	if (!/^\d+$/.test(param)) error(404, 'Eintrag nicht gefunden.');
	return Number(param);
}

export const PUT: RequestHandler = async ({ params, request }) => {
	const type = contentType(params.type);
	const id = entryId(params.id);
	const { a, b } = await request.json();
	const saved = update(getDb(), type, id, String(a ?? ''), String(b ?? ''));
	if (!saved.ok) return json({ message: saved.message }, { status: saved.status });
	return json(saved.item);
};

export const DELETE: RequestHandler = ({ params }) => {
	const type = contentType(params.type);
	if (!remove(getDb(), type, entryId(params.id))) error(404, 'Eintrag nicht gefunden.');
	return new Response(null, { status: 204 });
};
