import { json } from '@sveltejs/kit';
import { getDb } from '#lib/server/db.ts';
import { contentType, importBulk } from '#lib/server/content.ts';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ params, request }) => {
	const type = contentType(params.type);
	const { text } = await request.json();
	return json(importBulk(getDb(), type, String(text ?? '')));
};
