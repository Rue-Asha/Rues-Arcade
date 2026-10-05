import { json } from '@sveltejs/kit';
import { getDb } from '#lib/server/db.ts';
import { add, contentType, list } from '#lib/server/content.ts';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ params }) => json(list(getDb(), contentType(params.type)));

export const POST: RequestHandler = async ({ params, request }) => {
	const type = contentType(params.type);
	const { a, b } = await request.json();
	const saved = add(getDb(), type, String(a ?? ''), String(b ?? ''));
	if (!saved.ok) return json({ message: saved.message }, { status: saved.status });
	return json(saved.item, { status: 201 });
};
