import { error, json } from '@sveltejs/kit';
import { isSurvey } from '#lib/content/types.ts';
import { getDb } from '#lib/server/db.ts';
import { contentType, remove, update } from '#lib/server/content.ts';
import { removeSurvey, updateSurvey } from '#lib/server/surveys.ts';
import type { RequestHandler } from './$types';

const flag = (v: unknown) => (typeof v === 'boolean' ? v : undefined);

function entryId(param: string): number {
	if (!/^\d+$/.test(param)) error(404, 'Eintrag nicht gefunden.');
	return Number(param);
}

export const PUT: RequestHandler = async ({ params, request }) => {
	const type = contentType(params.type);
	const id = entryId(params.id);
	if (isSurvey(type)) {
		const { question, answers } = await request.json();
		const saved = updateSurvey(getDb(), id, String(question ?? ''), Array.isArray(answers) ? answers : []);
		if (!saved.ok) return json({ message: saved.message }, { status: saved.status });
		return json(saved.survey);
	}
	const { a, b, interchangeable } = await request.json();
	const saved = update(getDb(), type, id, String(a ?? ''), String(b ?? ''), flag(interchangeable));
	if (!saved.ok) return json({ message: saved.message }, { status: saved.status });
	return json(saved.item);
};

export const DELETE: RequestHandler = ({ params }) => {
	const type = contentType(params.type);
	const id = entryId(params.id);
	const removed = isSurvey(type) ? removeSurvey(getDb(), id) : remove(getDb(), type, id);
	if (!removed) error(404, 'Eintrag nicht gefunden.');
	return new Response(null, { status: 204 });
};
