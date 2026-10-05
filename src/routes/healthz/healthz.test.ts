import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { closeDb, getDb } from '#lib/server/db.ts';
import { GET } from './+server.ts';

beforeEach(() => {
	process.env.DATABASE_PATH = join(mkdtempSync(join(tmpdir(), 'arcade-health-')), 'h.db');
});

afterEach(() => {
	closeDb();
	delete process.env.DATABASE_PATH;
});

describe('/healthz', () => {
	it('returns 200 when the database answers', async () => {
		const res = await GET({} as never);
		expect(res.status).toBe(200);
	});

	it('Scenario: Unhealthy database', async () => {
		getDb().close();

		const res = await GET({} as never);

		expect(res.status).not.toBe(200);
		expect(res.status).toBe(503);
	});
});
