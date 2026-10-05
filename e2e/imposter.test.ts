import { expect, test, type Page } from '@playwright/test';
import { seedRoster, shot } from './helpers.ts';

const names = ['Alex', 'Bo', 'Cleo', 'Dani'];
const CREW = 'Was isst du am liebsten zum Frühstück?';
const IMPOSTER = 'Was isst du am liebsten zu Mittag?';

// The e2e database is shared by parallel tests, so the lobby's content fetch is pinned to known pairs.
async function start(page: Page, pairs: [string, string][] = [[CREW, IMPOSTER]]) {
	await page.request.post('/api/content/imposter_pairs', { data: { a: CREW, b: IMPOSTER } });
	await page.route('**/api/content/imposter_pairs', (route) =>
		route.fulfill({ json: pairs.map(([a, b], i) => ({ id: i + 1, a, b })) })
	);
	await seedRoster(page, names);
	await page.goto('/spiele/imposter');
	await page.getByRole('button', { name: 'Spiel starten' }).click();
	await expect(page).toHaveURL(/\/spiele\/imposter\/lobby$/);
	await page.getByRole('button', { name: "Los geht's" }).click();
	await expect(page).toHaveURL(/\/spiele\/imposter\/spielen$/);
}

async function hold(page: Page) {
	const box = (await page.getByRole('button', { name: 'Gedrückt halten' }).boundingBox())!;
	await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
	await page.mouse.down();
}

async function view(page: Page, name: string) {
	await expect(page.getByText(`Gib das Handy an ${name}`)).toBeVisible();
	await page.getByRole('button', { name: `${name} ist bereit` }).click();
	await hold(page);
	const question = page.getByTestId('question');
	await expect(question).toBeVisible();
	const text = (await question.textContent())!.trim();
	await page.mouse.up();
	return text;
}

test('Scenario: Full Imposter round', async ({ page }, info) => {
	await start(page);

	const saw: string[] = [];
	for (const name of names) saw.push(await view(page, name));
	expect(saw.filter((q) => q === IMPOSTER)).toHaveLength(1);
	expect(saw.filter((q) => q === CREW)).toHaveLength(3);
	const imposter = names[saw.indexOf(IMPOSTER)];

	await page.getByRole('button', { name: 'Crew-Frage aufdecken' }).click();
	await expect(page.getByText(CREW)).toBeVisible();
	await shot(page, info, 'imposter-crew');
	await page.getByRole('button', { name: 'Weiter zum Imposter' }).click();

	await page.getByRole('button', { name: 'Imposter aufdecken' }).click();
	await expect(page.getByTestId('unmasked')).toHaveText(imposter);
	await shot(page, info, 'imposter-unmask');

	await page.getByRole('button', { name: 'Nächste Runde' }).click();
	await expect(page.getByText('Runde 2')).toBeVisible();
	await expect(page.getByText('Gib das Handy an Alex')).toBeVisible();
});

test('Scenario: Hand-over between players', async ({ page }, info) => {
	await start(page);

	await expect(page.getByText('Gib das Handy an Alex')).toBeVisible();
	await expect(page.getByRole('button', { name: 'Gedrückt halten' })).toHaveCount(0);
	await shot(page, info, 'imposter-handover');
	await view(page, 'Alex');

	await expect(page.getByText('Gib das Handy an Bo')).toBeVisible();
	await expect(page.getByRole('button', { name: 'Gedrückt halten' })).toHaveCount(0);
	await expect(page.getByTestId('question')).toHaveCount(0);
});

test('Scenario: Hold-to-view reveals only while held', async ({ page }, info) => {
	await start(page);
	await page.getByRole('button', { name: 'Alex ist bereit' }).click();

	await expect(page.getByTestId('question')).toHaveCount(0);
	await expect(page.getByText('Verdeckt')).toBeVisible();
	await hold(page);
	await expect(page.getByTestId('question')).toBeVisible();
	await shot(page, info, 'imposter-view');
	await page.mouse.up();

	await expect(page.getByTestId('question')).toHaveCount(0);
	await expect(page.getByText(CREW)).toHaveCount(0);
	await expect(page.getByText(IMPOSTER)).toHaveCount(0);
});

test('skip asks first, then restarts the reveal at the first player', async ({ page }) => {
	await start(page, [
		[CREW, IMPOSTER],
		['Wohin reist du am liebsten?', 'Wohin ziehst du am liebsten?']
	]);
	await view(page, 'Alex');
	await expect(page.getByText('Gib das Handy an Bo')).toBeVisible();

	await page.getByRole('button', { name: 'Überspringen' }).click();
	const dialog = page.getByRole('dialog');
	await dialog.getByRole('button', { name: 'Abbrechen' }).click();
	await expect(page.getByText('Gib das Handy an Bo')).toBeVisible();

	await page.getByRole('button', { name: 'Überspringen' }).click();
	await dialog.getByRole('button', { name: 'Überspringen' }).click();
	await expect(page.getByText('Gib das Handy an Alex')).toBeVisible();
});

test('Scenario: Reload mid-game resumes the same phase', async ({ page }) => {
	await start(page);
	await view(page, 'Alex');
	await view(page, 'Bo');
	await expect(page.getByText('Gib das Handy an Cleo')).toBeVisible();

	await page.reload();
	await expect(page.getByText('Gib das Handy an Cleo')).toBeVisible();
	await expect(page.getByText('Spieler 3 / 4')).toBeVisible();
	await expect(page.getByRole('list', { name: 'Reihenfolge' }).getByRole('listitem')).toHaveText(
		names.map((n) => new RegExp(`${n}$`))
	);

	await view(page, 'Cleo');
	await view(page, 'Dani');
	await page.getByRole('button', { name: 'Crew-Frage aufdecken' }).click();
	await expect(page.getByText(CREW)).toBeVisible();

	await page.reload();
	await expect(page.getByText(CREW)).toBeVisible();
	await expect(page.getByRole('button', { name: 'Weiter zum Imposter' })).toBeVisible();
});

test('Scenario: Spiel beenden clears the session', async ({ page }) => {
	await start(page);
	await view(page, 'Alex');

	await page.getByRole('button', { name: 'Spiel beenden' }).click();
	await page.getByRole('dialog').getByRole('button', { name: 'Beenden' }).click();
	await expect(page).toHaveURL(/\/spiele\/imposter$/);

	await page.goto('/spiele/imposter');
	await expect(page.getByRole('button', { name: 'Spiel starten' })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Weiterspielen' })).toHaveCount(0);
	await page.goto('/spiele/imposter/spielen');
	await expect(page).toHaveURL(/\/spiele\/imposter$/);
});
