import type { ServerInit } from '@sveltejs/kit';
import { getDb } from '#lib/server/db.ts';

export const init: ServerInit = () => {
	getDb();
};
