import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { DatabaseSync } from 'node:sqlite';
import { expect, test } from '@playwright/test';
import { emptyServer } from './helpers.ts';

const port = Number(process.env.PORT ?? 4173);

test('Scenario: Healthy server', async ({ request }, info) => {
	test.skip(info.project.name !== 'desktop', 'server only');
	const res = await request.get('/healthz');
	expect(res.status()).toBe(200);
});

test('Scenario: Proof-full runs e2e on an isolated database', async ({ request }, info) => {
	test.skip(info.project.name !== 'desktop', 'server only');
	await request.get('/healthz');
	const path = `.e2e/${port}.db`;

	expect(existsSync(path)).toBe(true);
	const db = new DatabaseSync(path, { readOnly: true });
	const names = db.prepare('SELECT name FROM schema_migrations').all().map((r) => r.name);
	db.close();
	expect(names).toContain('0001_content.sql');
});

test('Scenario: Server starts from any working directory', async ({ request }, info) => {
	test.skip(info.project.name !== 'desktop', 'server only');
	const server = await emptyServer(info, 'cwd', tmpdir());
	try {
		const res = await request.get(`${server.origin}/healthz`);
		expect(res.status()).toBe(200);
		const db = new DatabaseSync(server.db, { readOnly: true });
		const names = db.prepare('SELECT name FROM schema_migrations').all().map((r) => r.name);
		db.close();
		expect(names).toContain('0001_content.sql');
	} finally {
		server.close();
	}
});
