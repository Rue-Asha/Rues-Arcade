import { expect, test } from '@playwright/test';
import { emptyServer, seedContent, seedRoster, shot } from './helpers.ts';

const crew = (n: number) => Array.from({ length: n }, (_, i) => `Spieler ${i + 1}`);

test('Scenario: Below minimum disables start', async ({ page, request }, info) => {
	await seedContent(request, 'imposter_pairs', [['Lieblingsfarbe?', 'Lieblingsblume?']]);
	await seedRoster(page, ['Alex', 'Bo']);
	await page.goto('/spiele/imposter');

	await expect(page.getByRole('button', { name: "Los geht's" })).toBeDisabled();
	await expect(page.getByText('mind. 3 Spieler')).toBeVisible();
	await expect(page.getByRole('link', { name: 'Spieler verwalten' })).toHaveAttribute(
		'href',
		'/spieler?from=/spiele/imposter'
	);
	await shot(page, info, 'start-imposter');

	await seedRoster(page, ['Alex', 'Bo', 'Cleo']);
	await page.reload();
	await expect(page.getByRole('button', { name: "Los geht's" })).toBeEnabled();
});

test('Scenario: Above maximum asks who plays', async ({ page }, info) => {
	await seedRoster(page, crew(13));
	await page.goto('/spiele/imposter/lobby');

	await expect(page.getByText('Wer spielt mit?')).toBeVisible();
	const picks = page.getByRole('checkbox');
	await expect(picks).toHaveCount(13);
	const next = page.getByRole('button', { name: 'Weiter' });
	await expect(next).toBeDisabled();
	await expect(page.getByText('höchstens 12')).toBeVisible();

	await page.getByRole('checkbox', { name: 'Spieler 13' }).uncheck();
	await expect(next).toBeEnabled();
	await shot(page, info, 'lobby-imposter');

	await page.getByRole('checkbox', { name: 'Spieler 1', exact: true }).uncheck();
	await page.getByRole('checkbox', { name: 'Spieler 13' }).check();
	await expect(next).toBeEnabled();
	for (let i = 2; i <= 11; i++) await page.getByRole('checkbox', { name: `Spieler ${i}`, exact: true }).uncheck();
	await expect(next).toBeDisabled();
	await page.getByRole('checkbox', { name: 'Spieler 2', exact: true }).check();

	await next.click();
	await expect(page.getByRole('checkbox')).toHaveCount(0);
});

test('Scenario: Empty pool blocks start', async ({ page }, info) => {
	const server = await emptyServer(info, 'start');
	try {
		await page.goto(`${server.origin}/`);
		await seedRoster(page, crew(4));
		await page.getByRole('link', { name: /Imposter/ }).click();

		await expect(page).toHaveURL(/\/spiele\/imposter$/);
		await expect(page.getByRole('button', { name: "Los geht's" })).toBeDisabled();
		await expect(page.getByText('Für Imposter gibt es noch keine Inhalte.')).toBeVisible();
		await expect(page.getByRole('link', { name: 'Inhalte hinzufügen' })).toHaveAttribute(
			'href',
			'/spiele/imposter/inhalte'
		);
	} finally {
		server.close();
	}
});

test("Scenario: Los geht's opens the lobby", async ({ page, request }) => {
	await request.post('/api/content/imposter_pairs', { data: { a: 'Lieblingsessen?', b: 'Lieblingsgetränk?' } });
	await seedRoster(page, crew(3));
	await page.goto('/spiele/imposter');

	await expect(page.getByRole('link', { name: 'Demo', exact: true })).toBeVisible();
	await expect(page.getByRole('link', { name: 'Erklärung', exact: true })).toHaveCount(0);
	await page.getByRole('button', { name: "Los geht's" }).click();
	await expect(page).toHaveURL(/\/spiele\/imposter\/lobby$/);
});

test("Scenario: So geht's covers both Wavelength modes", async ({ page }) => {
	await page.goto('/spiele/wavelength');
	await expect(page.getByRole('region', { name: "So geht's" }).getByRole('listitem').first()).toHaveText(
		'Gemeinsam oder in Teams: pro Zug ein Spektrum zwischen zwei Begriffen.'
	);
});

test('Scenario: Start banner carries title, badge and player range', async ({ page }) => {
	await page.goto('/spiele/imposter');
	const banner = page.locator('header').filter({ has: page.getByRole('heading', { level: 1 }) });

	await expect(banner.getByRole('heading', { level: 1 })).toHaveText('Imposter');
	await expect(banner.getByText('I', { exact: true })).toBeVisible();
	await expect(banner.getByText('3–12 Spieler', { exact: true })).toBeVisible();
	await expect(banner.getByText('Alle bekommen dieselbe Frage, bis auf eine Person.', { exact: true })).toBeVisible();
});

test('Scenario: New start banners carry title, badge and range', async ({ page }) => {
	for (const [slug, name, badge, range, pitch] of [
		['codes', 'Codes', 'C', '4–20 Spieler', 'Teams erraten ein geheimes Wort aus Ein-Wort-Hinweisen, reihum.'],
		['duck', 'What Rhymes with Duck', 'W', '4–16 Spieler', 'Alle suchen gleichzeitig einen Reim auf dasselbe Wort.'],
		['most-likely', 'Most Likely To', 'M', '4–20 Spieler', 'Ein Spruch, alle zeigen auf eine Person, und ein Team punktet, wenn es sich einig ist.']
	]) {
		await page.goto(`/spiele/${slug}`);
		const banner = page.locator('header').filter({ has: page.getByRole('heading', { level: 1 }) });

		await expect(banner.getByRole('heading', { level: 1 }), slug).toHaveText(name);
		await expect(banner.getByText(badge, { exact: true }), slug).toBeVisible();
		await expect(banner.getByText(range, { exact: true }), slug).toBeVisible();
		await expect(banner.getByText(pitch, { exact: true }), slug).toBeVisible();
	}
});

test("Scenario: So geht's for the new games", async ({ page }) => {
	for (const [slug, first] of [
		['codes', 'In Teams: pro Runde kennen alle Erklärer dasselbe geheime Wort.'],
		['duck', 'Ein Wort wird für alle aufgedeckt, alle suchen gleichzeitig einen Reim darauf.'],
		['most-likely', 'Reihum ist ein Team dran und bekommt einen Spruch: Wer würde am ehesten …?'],
		['family-feud', 'Zwei Teams, eine Umfrage: gesucht sind die häufigsten Antworten.']
	]) {
		await page.goto(`/spiele/${slug}`);
		const rules = page.getByRole('region', { name: "So geht's" }).getByRole('listitem');

		await expect(rules, slug).toHaveCount(3);
		await expect(rules.first(), slug).toHaveText(first);
		if (slug === 'most-likely') await expect(rules.nth(2), slug).toHaveText(/so viele Punkte.*Am Ende gewinnt das Team mit den meisten Punkten\.$/);
		for (const rule of await rules.allTextContents()) expect(rule, slug).not.toContain('!');
	}
});

test('Scenario: Family Feud banner carries title, badge and range', async ({ page }) => {
	await page.goto('/spiele/family-feud');
	const banner = page.locator('header').filter({ has: page.getByRole('heading', { level: 1 }) });

	await expect(banner.getByRole('heading', { level: 1 })).toHaveText('Family Feud');
	await expect(banner.getByText('F', { exact: true })).toBeVisible();
	await expect(banner.getByText('4–20 Spieler', { exact: true })).toBeVisible();
	await expect(
		banner.getByText('Zwei Teams suchen die häufigsten Antworten einer Umfrage.', { exact: true })
	).toBeVisible();
});

test("Scenario: So geht's for Family Feud", async ({ page }) => {
	await page.goto('/spiele/family-feud');
	const rules = page.getByRole('region', { name: "So geht's" }).getByRole('listitem');

	await expect(rules).toHaveCount(3);
	await expect(rules.first()).toHaveText('Zwei Teams, eine Umfrage: gesucht sind die häufigsten Antworten.');
	for (const rule of await rules.allTextContents()) expect(rule).not.toContain('!');
});

test('Scenario: Family Feud Inhalte card counts the seeded surveys', async ({ page }, info) => {
	const server = await emptyServer(info, 'feud-count');
	try {
		await page.goto(`${server.origin}/spiele/family-feud`);
		const more = page.getByRole('region', { name: 'Mehr zu Family Feud' });

		await expect(more.getByRole('link')).toHaveCount(2);
		await expect(more.getByRole('link', { name: 'Demo', exact: true })).toBeVisible();
		await expect(more.getByRole('link', { name: 'Erklärung', exact: true })).toHaveCount(0);
		await expect(more.getByRole('link', { name: 'Inhalte', exact: true })).toHaveAccessibleDescription(
			'247 Umfragen ansehen und bearbeiten'
		);
	} finally {
		server.close();
	}
});

test('Scenario: Inhalte card counts the seeded content', async ({ page }, info) => {
	const server = await emptyServer(info, 'seeded');
	try {
		for (const [slug, line] of [
			['codes', '91 Wörter ansehen und bearbeiten'],
			['duck', '60 Wörter ansehen und bearbeiten'],
			['most-likely', '60 Sprüche ansehen und bearbeiten']
		]) {
			await page.goto(`${server.origin}/spiele/${slug}`);
			await expect(page.getByRole('link', { name: 'Inhalte', exact: true }), slug).toHaveAccessibleDescription(line);
		}
	} finally {
		server.close();
	}
});

test('Scenario: Start panel first on phone, right column on desktop', async ({ page }, info) => {
	for (const [slug, name] of [
		['imposter', 'Imposter'],
		['wavelength', 'Wavelength'],
		['codes', 'Codes'],
		['duck', 'What Rhymes with Duck'],
		['most-likely', 'Most Likely To'],
		['family-feud', 'Family Feud']
	]) {
		await page.goto(`/spiele/${slug}`);
		// the page rises in; measure once it has landed
		await page.evaluate(() =>
			Promise.all(
				document
					.getAnimations()
					.filter((a) => a.effect?.getTiming().iterations !== Infinity)
					.map((a) => a.finished.catch(() => {}))
			)
		);
		const box = async (l: ReturnType<typeof page.locator>) => {
			const b = (await l.boundingBox())!;
			return { top: Math.round(b.y), bottom: Math.round(b.y + b.height), left: Math.round(b.x), right: Math.round(b.x + b.width) };
		};
		const banner = await box(page.locator('header').filter({ has: page.getByRole('heading', { level: 1 }) }));
		const panel = await box(page.locator('aside').filter({ has: page.getByRole('button', { name: "Los geht's" }) }));
		const rules = await box(page.getByRole('region', { name: "So geht's" }));
		const more = await box(page.getByRole('region', { name: `Mehr zu ${name}` }));

		expect(panel.top, slug).toBeGreaterThan(banner.bottom);
		if (info.project.name === 'phone') {
			expect(panel.bottom, slug).toBeLessThan(rules.top);
			expect(rules.bottom, slug).toBeLessThan(more.top);
		} else {
			expect(panel.left, slug).toBeGreaterThan(rules.right);
			expect(panel.top, slug).toBe(rules.top);
			expect(more.top, slug).toBeGreaterThan(Math.max(panel.bottom, rules.bottom));
			expect(more.left, slug).toBe(rules.left);
			expect(more.right, slug).toBe(panel.right);
		}
	}
});

test('Scenario: Mehr-zu cards keep their targets', async ({ page }) => {
	await page.goto('/spiele/imposter');
	const more = page.getByRole('region', { name: 'Mehr zu Imposter' });

	for (const [name, href, line] of [
		['Demo', '/spiele/imposter/demo?from=/spiele/imposter', 'Spiel per Demo lernen, mehrere Runden zum Mittippen'],
		['Inhalte', '/spiele/imposter/inhalte', /^\d+ Fragenpaare? ansehen und bearbeiten$/]
	] as const) {
		const card = more.getByRole('link', { name, exact: true });
		await expect(card).toHaveAttribute('href', href);
		await expect(card).toHaveAccessibleDescription(line);
	}

	await expect(more.getByRole('link')).toHaveCount(2);
	await expect(more.getByRole('link', { name: 'Erklärung', exact: true })).toHaveCount(0);

	await more.getByRole('link', { name: 'Demo', exact: true }).click();
	await expect(page).toHaveURL(/\/spiele\/imposter\/demo\?from=/);
	await page.getByRole('button', { name: 'Demo beenden' }).click();
	await expect(page).toHaveURL(/\/spiele\/imposter$/);
	await expect(page.getByRole('heading', { name: 'Imposter', level: 1 })).toBeVisible();
});

test('Scenario: Old Erklärung link is not found', async ({ page }) => {
	const res = await page.goto('/spiele/imposter/erklaerung');

	expect(res!.status()).toBe(404);
	expect(new URL(page.url()).pathname).toBe('/spiele/imposter/erklaerung');
	await expect(page.getByText('Not Found', { exact: true })).toBeVisible();
	await expect(page.getByRole('heading', { name: 'Imposter', level: 1 })).toHaveCount(0);
});

test('Scenario: Inhalte card shows the real content count', async ({ page }, info) => {
	const server = await emptyServer(info, 'count');
	try {
		const res = await page.request.post(`${server.origin}/api/content/wavelength_spectra/import`, {
			data: { text: 'Kalt | Heiß\nLeise | Laut\nKlein | Groß' }
		});
		expect(res.ok()).toBe(true);
		await page.goto(`${server.origin}/spiele/wavelength`);

		await expect(page.getByRole('link', { name: 'Inhalte', exact: true })).toHaveAccessibleDescription(
			'3 Spektren ansehen und bearbeiten'
		);
	} finally {
		server.close();
	}
});

test('Scenario: One player cannot start Wavelength', async ({ page, request }) => {
	await seedContent(request, 'wavelength_spectra', [['Start eins links', 'Start eins rechts']]);
	await seedRoster(page, ['Alex']);
	await page.goto('/spiele/wavelength');

	await expect(page.getByRole('button', { name: "Los geht's" })).toBeDisabled();
	await expect(page.getByText('mind. 2 Spieler')).toBeVisible();
});

test('play route without a session returns to the start screen', async ({ page }) => {
	await page.goto('/spiele/wavelength/spielen');
	await expect(page).toHaveURL(/\/spiele\/wavelength$/);
});

test('Scenario: Old or corrupt saved state discarded', async ({ page }) => {
	const errors: Error[] = [];
	page.on('pageerror', (e) => errors.push(e));
	await page.goto('/');
	for (const raw of ['{"v":0,"state":{"phase":"view"}}', '{kaputt', '{"v":1,"state":{"phase":"view"}}']) {
		await page.evaluate((r) => localStorage.setItem('arcade:session:imposter', r), raw);
		await page.goto('/spiele/imposter/spielen');

		await expect(page.getByRole('alert')).toContainText('verworfen');
		await expect(page.evaluate(() => localStorage.getItem('arcade:session:imposter'))).resolves.toBeNull();
	}
	expect(errors).toEqual([]);
});

test('a session without the game state shape is discarded, not resumed', async ({ page }) => {
	const errors: Error[] = [];
	page.on('pageerror', (e) => errors.push(e));
	await page.goto('/');
	await page.evaluate(() => localStorage.setItem('arcade:session:imposter', '{"v":1,"state":{}}'));
	await page.goto('/spiele/imposter');
	await expect(page.getByRole('alert')).toContainText('verworfen');
	await expect(page.getByRole('button', { name: 'Weiterspielen' })).toHaveCount(0);

	await page.evaluate(() => localStorage.setItem('arcade:session:imposter', '{"v":1,"state":{}}'));
	await page.goto('/spiele/imposter/spielen');
	await expect(page.getByRole('alert')).toContainText('verworfen');
	await expect(page.evaluate(() => localStorage.getItem('arcade:session:imposter'))).resolves.toBeNull();
	expect(errors).toEqual([]);
});

test('a session with a malformed nested field is discarded, not resumed', async ({ page }) => {
	const errors: Error[] = [];
	page.on('pageerror', (e) => errors.push(e));
	await page.goto('/');
	await page.evaluate(() =>
		localStorage.setItem(
			'arcade:session:wavelength',
			JSON.stringify({
				v: 1,
				state: {
					rng: { state: 1 },
					pool: [{ id: 1, a: 'Kalt', b: 'Heiß' }],
					used: [1],
					teams: [{}],
					rounds: 1,
					roundIndex: 0,
					teamIndex: 0,
					spectrum: { id: 1, a: 'Kalt', b: 'Heiß' },
					target: 60,
					dial: 90,
					phase: 'prep',
					lastScore: null
				}
			})
		)
	);
	await page.goto('/spiele/wavelength/spielen');
	await expect(page.getByRole('alert')).toContainText('verworfen');
	await expect(page.evaluate(() => localStorage.getItem('arcade:session:wavelength'))).resolves.toBeNull();
	expect(errors).toEqual([]);
});

test('a saved session is shown, resumed and ended', async ({ page }) => {
	await page.goto('/');
	await page.evaluate(() =>
		localStorage.setItem(
			'arcade:session:imposter',
			JSON.stringify({
				v: 1,
				state: {
					rng: { state: 1 },
					players: [
						{ id: 'a', name: 'Alex' },
						{ id: 'b', name: 'Bo' },
						{ id: 'c', name: 'Cleo' }
					],
					pool: [{ id: 1, a: 'Crew?', b: 'Imposter?' }],
					used: [1],
					round: 1,
					pairId: 1,
					crew: 'Crew?',
					imposter: 'Imposter?',
					imposterIndex: 0,
					phase: 'handover',
					revealIndex: 0,
					shown: false
				}
			})
		)
	);
	await page.goto('/spiele/imposter');
	await page.getByRole('button', { name: 'Weiterspielen' }).click();
	await expect(page).toHaveURL(/\/spiele\/imposter\/spielen$/);

	await page.getByRole('button', { name: 'Spiel beenden' }).click();
	await page.getByRole('dialog').getByRole('button', { name: 'Beenden' }).click();
	await expect(page).toHaveURL(/\/spiele\/imposter$/);
	await expect(page.getByRole('button', { name: 'Weiterspielen' })).toHaveCount(0);
});
