import type { ServerInit } from '@sveltejs/kit/hooks';
import { getDb } from '#lib/server/db.ts';

export const init: ServerInit = () => {
	getDb();
};
