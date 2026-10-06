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

test('Scenario: Request without a usable name rejected', async ({ request }, info) => {
	const origin = String(info.project.use.baseURL ?? `http://localhost:${process.env.PORT ?? 4173}`);
	const created = await playerCall(request, origin, 'POST', '', `Body ${info.project.name}`);
	const { id } = await created.json();
	const before = await (await request.get(`${origin}/api/players`)).json();

	for (const [method, path] of [['POST', ''], ['PATCH', `/${id}`]] as const)
		for (const data of ['null', '']) {
			const res = await request.fetch(`${origin}/api/players${path}`, {
				method,
				headers: { origin, 'content-type': 'application/json' },
				data
			});
			expect(res.status()).toBe(400);
			expect(await res.json()).toEqual({ message: 'Bitte gib einen Namen ein.' });
		}

	expect(await (await request.get(`${origin}/api/players`)).json()).toEqual(before);
	expect((await playerCall(request, origin, 'DELETE', `/${id}`)).status()).toBe(204);
});
