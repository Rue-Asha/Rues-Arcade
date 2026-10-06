import { json } from '@sveltejs/kit';
import { getDb } from '#lib/server/db.ts';
import { addPlayer, listPlayers } from '#lib/server/players.ts';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = () => json(listPlayers(getDb()));

export const POST: RequestHandler = async ({ request }) => {
	const { name } = await request.json();
	const saved = addPlayer(getDb(), String(name ?? ''));
	if (!saved.ok) return json({ message: saved.message }, { status: saved.status });
	return json(saved.player, { status: 201 });
};
