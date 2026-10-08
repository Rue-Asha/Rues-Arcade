import { expect, type Page, type Route } from '@playwright/test';

const names = ['Alex', 'Bo', 'Cleo', 'Dani'];
const CREW = 'Was isst du am liebsten zum Frühstück?';
const IMPOSTER = 'Was isst du am liebsten zu Mittag?';

const press = (page: Page, name: string) => page.getByRole('button', { name, exact: true }).click();

async function holding(page: Page, check: () => Promise<void>) {
	const box = (await page.getByRole('button', { name: 'Gedrückt halten' }).boundingBox())!;
	await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
	await page.mouse.down();
	await check();
	await page.mouse.up();
}

// The start screen needs content in the shared e2e database; the lobby's content fetch is pinned to a
// readable pair for the screenshots.
export async function seed(page: Page, tag: string) {
	await page.request.post('/api/content/imposter_pairs', { data: { a: `Look ${tag}?`, b: `Look ${tag}!` } });
	await page.route('**/api/content/imposter_pairs', (route: Route) =>
		route.request().method() === 'GET' ? route.fulfill({ json: [{ id: 1, a: CREW, b: IMPOSTER }] }) : route.fallback()
	);
}

// Start, lobby, handover, view (covered and held) for every player, crew and unmask, each before and after.
// Expects the roster Alex, Bo, Cleo, Dani and seed() to have run.
export async function walk(page: Page, check: (slug: string) => Promise<void>) {
	await page.goto('/spiele/imposter');
	await check('start-imposter');
	await press(page, "Los geht's");
	await expect(page).toHaveURL(/\/lobby$/);
	await check('lobby-imposter');
	await press(page, "Los geht's");
	await expect(page).toHaveURL(/\/spielen$/);
	for (const [i, name] of names.entries()) {
		await expect(page.getByText(`Gib das Handy an ${name}`, { exact: true })).toBeVisible();
		if (i === 0) await check('imposter-handover');
		await press(page, `${name} ist bereit`);
		if (i === 0) await check('imposter-view');
		await holding(page, async () => {
			await expect(page.getByTestId('question')).toBeVisible();
			if (i === 0) await check('imposter-view-held');
		});
	}
	await check('imposter-crew');
	await press(page, 'Crew-Frage aufdecken');
	await check('imposter-crew-shown');
	await press(page, 'Weiter zum Imposter');
	await check('imposter-unmask');
	await press(page, 'Imposter aufdecken');
	await expect(page.getByTestId('unmasked')).toBeVisible();
	await check('imposter-unmask-shown');
}
