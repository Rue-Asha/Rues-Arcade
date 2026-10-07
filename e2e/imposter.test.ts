import { expect, test, type Page } from '@playwright/test';
import { bandIs, expectFrame, expectInstant, live, seedRoster, settled, shot } from './helpers.ts';

const names = ['Alex', 'Bo', 'Cleo', 'Dani'];
const CREW = 'Was isst du am liebsten zum Frühstück?';
const IMPOSTER = 'Was isst du am liebsten zu Mittag?';

// The e2e database is shared by parallel tests, so the lobby's content fetch is pinned to known pairs.
async function start(page: Page, pairs: [string, string][] = [[CREW, IMPOSTER]], roster = names) {
	await page.request.post('/api/content/imposter_pairs', { data: { a: CREW, b: IMPOSTER } });
	await page.route('**/api/content/imposter_pairs', (route) =>
		route.fulfill({ json: pairs.map(([a, b], i) => ({ id: i + 1, a, b })) })
	);
	await seedRoster(page, roster);
	await page.goto('/spiele/imposter');
	await page.getByRole('button', { name: "Los geht's" }).click();
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
	await expect(live(page).getByText(CREW)).toBeVisible();
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
	await expect(live(page).getByText(CREW)).toBeVisible();

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
	await expect(page.getByRole('button', { name: "Los geht's" })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Weiterspielen' })).toHaveCount(0);
	await page.goto('/spiele/imposter/spielen');
	await expect(page).toHaveURL(/\/spiele\/imposter$/);
});

test('Scenario: Imposter screens use the stage and rail frame', async ({ page }) => {
	await start(page);
	await expectFrame(page);
	for (const name of names) {
		await page.getByRole('button', { name: `${name} ist bereit` }).click();
		await expectFrame(page);
		await hold(page);
		await expect(page.getByTestId('question')).toBeVisible();
		await page.mouse.up();
		await expectFrame(page);
	}
	await page.getByRole('button', { name: 'Crew-Frage aufdecken' }).click();
	await expectFrame(page);
	await page.getByRole('button', { name: 'Weiter zum Imposter' }).click();
	await expectFrame(page);
	await page.getByRole('button', { name: 'Imposter aufdecken' }).click();
	await expectFrame(page);
});

test('Scenario: Imposter handover uses the Handoff', async ({ page }) => {
	await start(page);
	await settled(page);
	const handoff = live(page).getByTestId('handoff');
	await expect(handoff).toHaveCount(1);
	await expect(handoff.getByRole('heading', { name: 'Gib das Handy an Alex' })).toBeVisible();
	await expect(live(page).locator('[data-frame="stage"] [data-hero] [data-testid="handoff"]')).toHaveCount(1);
	await expect(live(page).locator('[data-frame="rail"]')).toBeVisible();
	expect(await bandIs(handoff, 'imposter')).toBe(true);
});

test('Scenario: Handoff wraps a long name', async ({ page }) => {
	const long = 'Maximiliane-Theodora von Hohenzollern';
	await start(page, [[CREW, IMPOSTER]], [long, 'Bo', 'Cleo']);
	await settled(page);
	const heading = live(page).getByRole('heading', { name: `Gib das Handy an ${long}` });
	await expect(heading).toBeVisible();
	const fits = await heading.evaluate((h) => {
		const stage = h.closest('[data-frame="stage"]')!.getBoundingClientRect();
		const r = h.getBoundingClientRect();
		return r.left >= stage.left && r.right <= stage.right;
	});
	expect(fits).toBe(true);
	expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
		page.viewportSize()!.width
	);
});

test('Scenario: Imposter reveals use the Reveal', async ({ page }) => {
	await start(page);
	for (const name of names) await view(page, name);
	const finite = () =>
		page.evaluate(() =>
			document
				.getAnimations()
				.filter((a) => (a.effect as KeyframeEffect).target?.closest('[data-testid="reveal"]'))
				.map((a) => ({
					iterations: a.effect!.getTiming().iterations,
					props: (a.effect as KeyframeEffect)
						.getKeyframes()
						.flatMap((k) => Object.keys(k))
						.filter(
							(k) => !['offset', 'easing', 'composite', 'computedOffset'].includes(k)
						)
				}))
		);
	for (const [open, next] of [
		['Crew-Frage aufdecken', 'Weiter zum Imposter'],
		['Imposter aufdecken', 'Nächste Runde']
	]) {
		await expect(live(page).getByTestId('covered')).toHaveCount(1);
		await expect(live(page).getByTestId('reveal')).toHaveCount(0);
		await page.getByRole('button', { name: open }).click();
		await expect(live(page).getByTestId('reveal')).toHaveCount(1);
		await expect(live(page).getByTestId('covered')).toHaveCount(0);
		const running = await finite();
		expect(running.length).toBeGreaterThan(0);
		for (const a of running) {
			expect(a.iterations).toBe(1);
			for (const prop of a.props) expect(['transform', 'opacity']).toContain(prop);
		}
		if (next !== 'Nächste Runde') await page.getByRole('button', { name: next }).click();
	}
});

test.describe('reduced motion', () => {
	test.use({ reducedMotion: 'reduce' });

	test('Scenario: Imposter reduced motion is instant', async ({ page }) => {
		await start(page);
		await settled(page);
		for (const name of names) {
			await page.getByRole('button', { name: `${name} ist bereit` }).click();
			await expectInstant(page);
			await hold(page);
			await expect(page.getByTestId('question')).toBeVisible();
			await page.mouse.up();
			await expectInstant(page);
		}
		for (const name of ['Crew-Frage aufdecken', 'Weiter zum Imposter', 'Imposter aufdecken', 'Nächste Runde']) {
			await page.getByRole('button', { name }).click();
			await expectInstant(page);
		}
	});
});
