import { json } from '@sveltejs/kit';
import { isSurvey } from '#lib/content/types.ts';
import { getDb } from '#lib/server/db.ts';
import { contentType, importBulk } from '#lib/server/content.ts';
import { importSurveys } from '#lib/server/surveys.ts';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ params, request }) => {
	const type = contentType(params.type);
	const { text } = await request.json();
	const report = isSurvey(type)
		? importSurveys(getDb(), String(text ?? ''))
		: importBulk(getDb(), type, String(text ?? ''));
	return json(report);
};
