import { json } from '@sveltejs/kit';
import { isSurvey } from '#lib/content/types.ts';
import { getDb } from '#lib/server/db.ts';
import { add, contentType, list } from '#lib/server/content.ts';
import { addSurvey, listSurveys } from '#lib/server/surveys.ts';
import type { RequestHandler } from './$types';

const flag = (v: unknown) => (typeof v === 'boolean' ? v : undefined);

export const GET: RequestHandler = ({ params }) => {
	const type = contentType(params.type);
	return json(isSurvey(type) ? listSurveys(getDb()) : list(getDb(), type));
};

export const POST: RequestHandler = async ({ params, request }) => {
	const type = contentType(params.type);
	if (isSurvey(type)) {
		const { question, answers } = await request.json();
		const saved = addSurvey(getDb(), String(question ?? ''), Array.isArray(answers) ? answers : []);
		if (!saved.ok) return json({ message: saved.message }, { status: saved.status });
		return json(saved.survey, { status: 201 });
	}
	const { a, b, interchangeable } = await request.json();
	const saved = add(getDb(), type, String(a ?? ''), String(b ?? ''), flag(interchangeable));
	if (!saved.ok) return json({ message: saved.message }, { status: saved.status });
	return json(saved.item, { status: 201 });
};
