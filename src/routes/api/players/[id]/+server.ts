import { error, json } from '@sveltejs/kit';
import { getDb } from '#lib/server/db.ts';
import { deletePlayer, renamePlayer } from '#lib/server/players.ts';
import type { RequestHandler } from './$types';

function playerId(param: string): number {
	if (!/^\d+$/.test(param)) error(404, 'Diesen Spieler gibt es nicht mehr.');
	return Number(param);
}

export const PATCH: RequestHandler = async ({ params, request }) => {
	const id = playerId(params.id);
	const { name } = await request.json();
	const saved = renamePlayer(getDb(), id, String(name ?? ''));
	if (!saved.ok) return json({ message: saved.message }, { status: saved.status });
	return json(saved.player);
};

export const DELETE: RequestHandler = ({ params }) => {
	const deleted = deletePlayer(getDb(), playerId(params.id));
	if (!deleted.ok) return json({ message: deleted.message }, { status: deleted.status });
	return new Response(null, { status: 204 });
};
