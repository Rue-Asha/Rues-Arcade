import { expect, test } from '@playwright/test';
import { playerCall } from './helpers.ts';

test('Scenario: Players API round trip on the server', async ({ request }, info) => {
	const origin = String(info.project.use.baseURL ?? `http://localhost:${process.env.PORT ?? 4173}`);
	const name = `Probe ${info.project.name}`;
	const renamed = `${name} neu`;

	const created = await playerCall(request, origin, 'POST', '', name);
	expect(created.status()).toBe(201);
	const { id } = await created.json();
	expect(typeof id).toBe('number');

	const patched = await playerCall(request, origin, 'PATCH', `/${id}`, renamed);
	expect(patched.status()).toBe(200);
	expect(await patched.json()).toEqual({ id, name: renamed });

	const listed = await request.get(`${origin}/api/players`);
	expect(listed.status()).toBe(200);
	expect(await listed.json()).toContainEqual({ id, name: renamed });

	expect((await playerCall(request, origin, 'DELETE', `/${id}`)).status()).toBe(204);
	expect(await (await request.get(`${origin}/api/players`)).json()).not.toContainEqual({ id, name: renamed });
});
