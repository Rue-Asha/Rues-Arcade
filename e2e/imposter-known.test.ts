import { expect, test, type Page } from '@playwright/test';
import { emptyServer, live, seedImposterPlayed, seedPairs, seedPlayers, seedSavedRoster, settled, shot } from './helpers.ts';

type Server = Awaited<ReturnType<typeof emptyServer>>;

const CONTROL = 'Wer kennt die Frage?';
const NOBODY = 'Noch niemand aus dieser Runde.';

// roster order is the round order: saved players first, then guests
async function begin(page: Page, request: Parameters<typeof seedPlayers>[0], server: Server, saved: string[], guests: string[], extra: string[] = []) {
	const everyone = await seedPlayers(request, server.origin, [...saved, ...extra]);
	await page.goto(`${server.origin}/`);
	await seedSavedRoster(page, everyone.slice(0, saved.length), guests);
	await page.goto(`${server.origin}/spiele/imposter`);
	await page.getByRole('button', { name: "Los geht's" }).click();
	await expect(page).toHaveURL(/\/spiele\/imposter\/lobby$/);
	await page.getByRole('button', { name: "Los geht's" }).click();
	await expect(page).toHaveURL(/\/spiele\/imposter\/spielen$/);
	return { saved: everyone.slice(0, saved.length), outside: everyone.slice(saved.length) };
}

const control = (page: Page) => page.getByRole('button', { name: CONTROL, exact: true });

async function holdControl(page: Page) {
	await control(page).scrollIntoViewIfNeeded();
	const box = (await control(page).boundingBox())!;
	await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
	await page.mouse.down();
}

async function names(page: Page) {
	await holdControl(page);
	const known = page.getByTestId('known');
	await expect(known).toBeVisible();
	const list = await known.getByRole('listitem').allTextContents();
	if (!list.length) await expect(known.getByText(NOBODY, { exact: true })).toBeVisible();
	await page.mouse.up();
	await expect(known).toHaveCount(0);
	return list;
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

test('Scenario: Imposter hold shows who of the round knows the prompt', async ({ page, request }, info) => {
	const server = await emptyServer(info, 'imposter-known-hold');
	try {
		const [pair] = await seedPairs(request, server.origin, [{ a: 'Crew?', b: 'Imposter?' }]);
		const { saved, outside } = await begin(page, request, server, ['Alex', 'Bo'], ['Cleo'], ['Eli']);
		await seedImposterPlayed(request, server.origin, pair.id, [saved[0].id, outside[0].id]);
		await page.reload();

		await expect(control(page)).toBeVisible();
		await holdControl(page);
		const known = page.getByTestId('known');
		await expect(known.getByRole('list', { name: 'Kennen die Frage', exact: true }).getByRole('listitem')).toHaveText(['Alex']);
		await shot(page, info, 'imposter-known');
		await page.mouse.up();
		await expect(known).toHaveCount(0);
	} finally {
		server.close();
	}
});

test('Scenario: Imposter hold with nobody of the round on the list', async ({ page, request }, info) => {
	const server = await emptyServer(info, 'imposter-known-nobody');
	try {
		const [pair] = await seedPairs(request, server.origin, [{ a: 'Crew?', b: 'Imposter?' }]);
		const { outside } = await begin(page, request, server, ['Alex', 'Bo', 'Cleo'], [], ['Eli']);
		await seedImposterPlayed(request, server.origin, pair.id, [outside[0].id]);
		await page.reload();

		await expect(control(page)).toBeVisible();
		await holdControl(page);
		const known = page.getByTestId('known');
		await expect(known.getByText(NOBODY, { exact: true })).toBeVisible();
		await expect(known.getByRole('listitem')).toHaveCount(0);
		await page.mouse.up();
	} finally {
		server.close();
	}
});

test('Scenario: Imposter control only until the crew reveal', async ({ page, request }, info) => {
	const server = await emptyServer(info, 'imposter-known-until');
	try {
		await seedPairs(request, server.origin, [{ a: 'Crew?', b: 'Imposter?' }]);
		await begin(page, request, server, ['Alex', 'Bo', 'Cleo'], []);
		for (const name of ['Alex', 'Bo', 'Cleo']) {
			await expect(control(page)).toBeVisible();
			await page.getByRole('button', { name: `${name} ist bereit`, exact: true }).click();
			await expect(page.getByRole('button', { name: 'Gedrückt halten' })).toBeVisible();
			await expect(control(page)).toBeVisible();
			const box = (await page.getByRole('button', { name: 'Gedrückt halten' }).boundingBox())!;
			await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
			await page.mouse.down();
			await expect(page.getByTestId('question')).toBeVisible();
			await page.mouse.up();
		}
		await expect(page.getByRole('button', { name: 'Crew-Frage aufdecken', exact: true })).toBeVisible();
		await expect(control(page)).toBeVisible();

		await page.getByRole('button', { name: 'Crew-Frage aufdecken', exact: true }).click();
		await expect(live(page).getByText('Crew?', { exact: true })).toBeVisible();
		await expect(control(page)).toHaveCount(0);
		await page.getByRole('button', { name: 'Weiter zum Imposter', exact: true }).click();
		await expect(page.getByRole('button', { name: 'Imposter aufdecken', exact: true })).toBeVisible();
		await expect(control(page)).toHaveCount(0);
		await page.getByRole('button', { name: 'Imposter aufdecken', exact: true }).click();
		await expect(control(page)).toHaveCount(0);
	} finally {
		server.close();
	}
});

test('Scenario: Imposter control follows a skip', async ({ page, request }, info) => {
	const server = await emptyServer(info, 'imposter-known-skip');
	try {
		const pairs = await seedPairs(request, server.origin, [
			{ a: 'Eins?', b: 'Uno?' },
			{ a: 'Zwei?', b: 'Dos?' }
		]);
		const { saved } = await begin(page, request, server, ['Alex', 'Bo', 'Cleo'], []);
		await seedImposterPlayed(request, server.origin, pairs[0].id, [saved[0].id]);
		await seedImposterPlayed(request, server.origin, pairs[1].id, []);
		await page.reload();

		await expect(control(page)).toBeVisible();
		const first = await names(page);
		await page.getByRole('button', { name: 'Überspringen', exact: true }).first().click();
		await page.getByRole('dialog').getByRole('button', { name: 'Überspringen', exact: true }).click();
		await expect(page.getByRole('dialog')).toHaveCount(0);
		await settled(page);
		await expect(control(page)).toBeVisible();
		const second = await names(page);

		expect([first, second].sort()).toEqual([[], ['Alex']]);
	} finally {
		server.close();
	}
});

test('Scenario: Imposter later round shows earlier records', async ({ page, request }, info) => {
	const server = await emptyServer(info, 'imposter-known-later');
	try {
		await seedPairs(request, server.origin, [{ a: 'Crew?', b: 'Imposter?' }]);
		await begin(page, request, server, ['Alex', 'Bo', 'Cleo'], []);
		await readAll(page, ['Alex', 'Bo', 'Cleo']);
		const posted = page.waitForResponse((r) => r.url().endsWith('/api/imposter/played') && r.request().method() === 'POST');
		await page.getByRole('button', { name: 'Crew-Frage aufdecken', exact: true }).click();
		expect((await posted).status()).toBe(204);
		await page.getByRole('button', { name: 'Weiter zum Imposter', exact: true }).click();
		await page.getByRole('button', { name: 'Imposter aufdecken', exact: true }).click();
		await page.getByRole('button', { name: 'Nächste Runde', exact: true }).click();
		await expect(page.getByText('Runde 2')).toBeVisible();

		await expect(control(page)).toBeVisible();
		expect(await names(page)).toEqual(['Alex', 'Bo', 'Cleo']);
	} finally {
		server.close();
	}
});

test('Scenario: Imposter history loaded once per deal', async ({ page, request }, info) => {
	const server = await emptyServer(info, 'imposter-known-once');
	try {
		await seedPairs(request, server.origin, [{ a: 'Crew?', b: 'Imposter?' }]);
		let gets = 0;
		page.on('request', (r) => {
			if (r.method() === 'GET' && new URL(r.url()).pathname === '/api/imposter/played') gets++;
		});
		await begin(page, request, server, ['Alex', 'Bo', 'Cleo'], []);
		await expect(control(page)).toBeVisible();
		await readAll(page, ['Alex', 'Bo', 'Cleo']);
		await expect(page.getByRole('button', { name: 'Crew-Frage aufdecken', exact: true })).toBeVisible();
		await expect(control(page)).toBeVisible();

		expect(gets).toBe(1);
	} finally {
		server.close();
	}
});

test('Scenario: Imposter control keeps the primary action in the first viewport', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'phone');
	const server = await emptyServer(info, 'imposter-known-phone');
	try {
		await seedPairs(request, server.origin, [{ a: 'Crew?', b: 'Imposter?' }]);
		await begin(page, request, server, ['Alex', 'Bo', 'Cleo'], []);

		const measure = async (primary: string) => {
			await expect(control(page)).toBeVisible();
			await settled(page);
			const found = await page.evaluate(
				([action, label]) => {
					const bottom = (el: Element | null | undefined) => (el ? el.getBoundingClientRect().bottom + scrollY : null);
					const buttons = [...document.querySelectorAll('[data-stage]:not([data-leaving]) button')];
					const by = (t: string) => buttons.find((b) => b.textContent?.trim() === t);
					return { action: bottom(by(action)), control: bottom(by(label)), height: innerHeight };
				},
				[primary, CONTROL]
			);
			expect(found.action).not.toBeNull();
			expect(found.control).not.toBeNull();
			expect(found.action!).toBeLessThanOrEqual(found.height);
			expect(found.control!).toBeLessThanOrEqual(found.height);
		};

		await measure('Alex ist bereit');
		await page.getByRole('button', { name: 'Alex ist bereit', exact: true }).click();
		await expect(page.getByRole('button', { name: 'Gedrückt halten' })).toBeVisible();
		await measure('Gedrückt halten');
		await page.getByRole('button', { name: 'Gedrückt halten' }).dispatchEvent('pointerdown');
		await page.getByRole('button', { name: 'Gedrückt halten' }).dispatchEvent('pointerup');
		await readAll(page, ['Bo', 'Cleo']);
		await measure('Crew-Frage aufdecken');
	} finally {
		server.close();
	}
});
