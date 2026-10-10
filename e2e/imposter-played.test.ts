import { expect, test, type Page } from '@playwright/test';
import { demo } from '../src/lib/games/imposter/demo.ts';
import { emptyServer, imposterPlayed, seedPairs, seedPlayers, seedSavedRoster } from './helpers.ts';

type Server = Awaited<ReturnType<typeof emptyServer>>;

async function begin(page: Page, server: Server, saved: Awaited<ReturnType<typeof seedPlayers>>, guests: string[] = []) {
	await page.goto(`${server.origin}/`);
	await seedSavedRoster(page, saved, guests);
	await page.goto(`${server.origin}/spiele/imposter`);
	await page.getByRole('button', { name: "Los geht's" }).click();
	await expect(page).toHaveURL(/\/spiele\/imposter\/lobby$/);
	await page.getByRole('button', { name: "Los geht's" }).click();
	await expect(page).toHaveURL(/\/spiele\/imposter\/spielen$/);
}

async function readAll(page: Page, players: string[]) {
	for (const name of players) {
		await page.getByRole('button', { name: `${name} ist bereit`, exact: true }).click();
		const box = (await page.getByRole('button', { name: 'Gedrückt halten' }).boundingBox())!;
		await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
		await page.mouse.down();
		await expect(page.getByTestId('question')).toBeVisible();
		await page.mouse.up();
	}
}

const isPost = (url: string) => new URL(url).pathname === '/api/imposter/played';

test('Scenario: Imposter crew reveal records the saved players', async ({ page, request }, info) => {
	const server = await emptyServer(info, 'imposter-record');
	try {
		const [pair] = await seedPairs(request, server.origin, [{ a: 'Crew?', b: 'Imposter?' }]);
		const saved = await seedPlayers(request, server.origin, ['Alex', 'Bo', 'Cleo']);
		await begin(page, server, saved, ['Dani']);
		await readAll(page, ['Alex', 'Bo', 'Cleo', 'Dani']);

		expect(await imposterPlayed(request, server.origin)).toEqual([]);
		const posted = page.waitForResponse((r) => isPost(r.url()) && r.request().method() === 'POST');
		await page.getByRole('button', { name: 'Crew-Frage aufdecken', exact: true }).click();
		expect((await posted).status()).toBe(204);

		expect(await imposterPlayed(request, server.origin)).toEqual([{ pairId: pair.id, playerIds: saved.map((p) => p.id).sort((a, b) => a - b) }]);
	} finally {
		server.close();
	}
});

test('Scenario: Imposter round ended before the reveal records nothing', async ({ page, request }, info) => {
	const server = await emptyServer(info, 'imposter-early');
	try {
		await seedPairs(request, server.origin, [{ a: 'Crew?', b: 'Imposter?' }]);
		const saved = await seedPlayers(request, server.origin, ['Alex', 'Bo', 'Cleo']);
		await begin(page, server, saved);
		await readAll(page, ['Alex', 'Bo', 'Cleo']);
		await expect(page.getByRole('button', { name: 'Crew-Frage aufdecken', exact: true })).toBeVisible();

		await page.getByRole('button', { name: 'Spiel beenden' }).click();
		await page.getByRole('dialog').getByRole('button', { name: 'Beenden' }).click();
		await expect(page).toHaveURL(/\/spiele\/imposter$/);

		expect(await imposterPlayed(request, server.origin)).toEqual([]);
	} finally {
		server.close();
	}
});

test('Scenario: Imposter demo neither records nor shows who knows', async ({ page, request }, info) => {
	const server = await emptyServer(info, 'imposter-demo');
	try {
		await seedPairs(request, server.origin, [{ a: 'Crew?', b: 'Imposter?' }]);
		await page.goto(`${server.origin}/spiele/imposter`);
		const calls: string[] = [];
		page.on('request', (r) => {
			if (isPost(r.url())) calls.push(r.method());
		});
		await page.getByRole('link', { name: 'Demo', exact: true }).click();
		await expect(page).toHaveURL(/\/spiele\/imposter\/demo\?from=/);

		const expected = page.locator('[data-demo="expected"]');
		const done = page.getByText('Demo beendet', { exact: true });
		const control = page.getByRole('button', { name: 'Wer kennt die Frage?', exact: true });
		test.setTimeout(demo.steps.length * 2_500 + 30_000);
		for (let n = 0; n < demo.steps.length; n++) {
			await expect(expected).toHaveCount(1);
			await expect(control).toHaveCount(0);
			await expected.click();
		}
		await expect(done).toBeVisible();

		expect(calls).toEqual([]);
	} finally {
		server.close();
	}
});
