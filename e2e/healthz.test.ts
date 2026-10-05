import { existsSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { expect, test } from '@playwright/test';

const port = Number(process.env.PORT ?? 4173);

test('Scenario: Healthy server', async ({ request }) => {
	const res = await request.get('/healthz');
	expect(res.status()).toBe(200);
});

test('Scenario: Proof-full runs e2e on an isolated database', async ({ request }) => {
	await request.get('/healthz');
	const path = `.e2e/${port}.db`;

	expect(existsSync(path)).toBe(true);
	const db = new DatabaseSync(path, { readOnly: true });
	const names = db.prepare('SELECT name FROM schema_migrations').all().map((r) => r.name);
	db.close();
	expect(names).toContain('0001_content.sql');
});
