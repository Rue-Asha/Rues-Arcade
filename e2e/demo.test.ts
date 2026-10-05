import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { spawn } from 'node:child_process';
import { rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { seedRoster } from './helpers.ts';

const IMPOSTER_STEPS = 11;
const WAVELENGTH_STEPS = 10;

async function openDemo(page: Page, slug: string, origin = '') {
	await page.goto(`${origin}/spiele/${slug}`);
	await page.getByRole('button', { name: 'Demo', exact: true }).click();
	await expect(page).toHaveURL(new RegExp(`/spiele/${slug}/demo\\?from=`));
}

const progress = (page: Page) => page.getByText(/^Demo · Schritt \d+\/\d+$/);

async function playToEnd(page: Page, total: number) {
	for (let n = 1; n <= total; n++) {
		await expect(progress(page)).toHaveText(`Demo · Schritt ${n}/${total}`);
		const expected = page.locator('[data-demo="expected"]');
		await expect(expected).toHaveCount(1);
		await expected.click();
	}
	await expect(page.getByText('Demo beendet', { exact: true })).toBeVisible();
	await expect(page.locator('[data-demo="expected"]')).toHaveCount(0);
}

function snapshot(page: Page) {
	return page.evaluate(() => Object.fromEntries(Object.entries(localStorage)));
}

// every server call a page makes after the demo starts; static assets don't count
function serverCalls(page: Page) {
	const calls: string[] = [];
	page.on('request', (r) => {
		const url = new URL(r.url());
		if (!url.pathname.startsWith('/_app/')) calls.push(`${r.method()} ${url.pathname}`);
	});
	return calls;
}

test('Scenario: Imposter demo by tapping highlighted controls', async ({ page }) => {
	await openDemo(page, 'imposter');
	await expect(page.getByText('Gib das Handy an Alex', { exact: true })).toBeVisible();
	await playToEnd(page, IMPOSTER_STEPS);
	await expect(page.getByTestId('unmasked')).toHaveText('Alex');
});

test('Scenario: Wavelength demo by tapping highlighted controls', async ({ page }) => {
	await openDemo(page, 'wavelength');
	await playToEnd(page, WAVELENGTH_STEPS);
	await expect(page.getByText('Gewinner', { exact: true })).toBeVisible();
	await expect(page.getByRole('heading', { name: 'Team 1', exact: true })).toBeVisible();
});

test('Scenario: Only the expected control is enabled', async ({ page }) => {
	await openDemo(page, 'imposter');
	await expect(progress(page)).toHaveText(`Demo · Schritt 1/${IMPOSTER_STEPS}`);
	const expected = page.locator('[data-demo="expected"]');
	await expect(expected).toHaveAttribute('data-action', 'handover');
	const skip = page.getByRole('button', { name: 'Überspringen' });
	await expect(skip).toBeDisabled();
	await skip.click({ force: true });
	await expect(page.getByRole('dialog')).toHaveCount(0);
	await expect(progress(page)).toHaveText(`Demo · Schritt 1/${IMPOSTER_STEPS}`);

	await openDemo(page, 'wavelength');
	await expect(page.locator('[data-demo="expected"]')).toHaveAttribute('data-action', 'show');
	const redraw = page.getByRole('button', { name: 'Anderes Spektrum' });
	await expect(redraw).toBeDisabled();
	const spectrum = await page.locator('figcaption').textContent();
	await redraw.click({ force: true });
	await expect(progress(page)).toHaveText(`Demo · Schritt 1/${WAVELENGTH_STEPS}`);
	await expect(page.locator('figcaption')).toHaveText(spectrum!);

	// on the guess step the dial is the control, and the pointer's angle is replaced by the script's
	await page.locator('[data-demo="expected"]').click();
	await page.locator('[data-demo="expected"]').click();
	await expect(page.locator('[data-demo="expected"]')).toHaveAttribute('data-action', 'dial');
	await expect(page.getByRole('button', { name: 'Einloggen' })).toBeDisabled();
	await page.locator('[data-demo="expected"] svg').click({ position: { x: 5, y: 5 } });
	await page.locator('[data-demo="expected"]').click();
	await expect(page.getByTestId('points')).toHaveText('+4');
});

test('Scenario: Hidden information shown with Demo tag', async ({ page }) => {
	await openDemo(page, 'imposter');
	await page.locator('[data-demo="expected"]').click();
	await expect(page.getByTestId('question')).toHaveText('Welches Tier hättest du gern als Haustier?');
	await expect(page.getByText('[Demo]', { exact: true })).toBeVisible();

	await openDemo(page, 'wavelength');
	await page.locator('[data-demo="expected"]').click();
	await expect(progress(page)).toHaveText(`Demo · Schritt 2/${WAVELENGTH_STEPS}`);
	await expect(page.getByText('[Demo]', { exact: true })).toBeVisible();
	await expect(page.getByText('Verdeckt', { exact: true })).toHaveCount(0);
});

test('Scenario: Demo leaves real data untouched', async ({ page }) => {
	await seedRoster(page, ['Mira', 'Noah', 'Olli']);
	await page.evaluate(() =>
		localStorage.setItem('arcade:session:imposter', JSON.stringify({ v: 1, state: { keep: 'me' } }))
	);
	const before = await snapshot(page);
	await openDemo(page, 'imposter');
	const calls = serverCalls(page);
	await playToEnd(page, IMPOSTER_STEPS);
	await openDemo(page, 'wavelength');
	calls.length = 0;
	await playToEnd(page, WAVELENGTH_STEPS);
	expect(calls).toEqual([]);
	expect(await snapshot(page)).toEqual(before);
});

test('Scenario: Exiting returns to the starting screen', async ({ page }) => {
	await page.goto('/');
	await page.evaluate(() =>
		localStorage.setItem(
			'arcade:session:wavelength',
			JSON.stringify({
				v: 1,
				state: {
					rng: { state: 1 },
					pool: [{ id: 1, a: 'Leise', b: 'Laut' }],
					used: [1],
					teams: [
						{ name: 'Team 1', players: [{ id: 'm', name: 'Mira' }, { id: 'o', name: 'Olli' }], score: 3 },
						{ name: 'Team 2', players: [{ id: 'n', name: 'Noah' }, { id: 'p', name: 'Pia' }], score: 0 }
					],
					rounds: 2,
					roundIndex: 0,
					teamIndex: 1,
					spectrum: { id: 1, a: 'Leise', b: 'Laut' },
					target: 60,
					dial: 90,
					phase: 'prep',
					lastScore: null
				}
			})
		)
	);
	const before = await snapshot(page);
	await page.goto('/spiele/wavelength/spielen');
	await expect(page.getByText('Gib das Handy an Noah', { exact: true })).toBeVisible();
	await page.getByRole('button', { name: 'Demo', exact: true }).click();
	await expect(page).toHaveURL(/\/spiele\/wavelength\/demo\?from=/);
	await page.locator('[data-demo="expected"]').click();
	await expect(progress(page)).toHaveText(`Demo · Schritt 2/${WAVELENGTH_STEPS}`);
	await page.getByRole('button', { name: 'Demo beenden' }).click();
	await expect(page).toHaveURL(/\/spiele\/wavelength\/spielen$/);
	await expect(page.getByText('Gib das Handy an Noah', { exact: true })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Ziel anzeigen' })).toBeEnabled();
	expect(await snapshot(page)).toEqual(before);
});

test('Scenario: Reload during demo returns to start screen', async ({ page }) => {
	await openDemo(page, 'imposter');
	await page.locator('[data-demo="expected"]').click();
	await expect(progress(page)).toHaveText(`Demo · Schritt 2/${IMPOSTER_STEPS}`);
	await page.reload();
	await expect(page).toHaveURL(/\/spiele\/imposter$/);
	await expect(page.getByRole('heading', { name: 'Imposter', exact: true })).toBeVisible();
	await expect(progress(page)).toHaveCount(0);
});

test('Scenario: Demo steppable with reduced motion', async ({ page }) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await openDemo(page, 'imposter');
	await playToEnd(page, IMPOSTER_STEPS);
	await openDemo(page, 'wavelength');
	await playToEnd(page, WAVELENGTH_STEPS);
});

// The shared e2e DB is never empty for long, so this test runs its own server on a fresh DB file.
async function emptyServer(info: TestInfo) {
	const db = resolve(`.e2e/empty-${info.project.name}-${process.pid}.db`);
	const server = spawn('node', ['build'], {
		cwd: process.env.E2E_APP_DIR,
		stdio: ['ignore', 'pipe', 'inherit'],
		env: { ...process.env, HOST: '127.0.0.1', PORT: '0', PROTOCOL_HEADER: 'x-forwarded-proto', DATABASE_PATH: db }
	});
	const origin = await new Promise<string>((ok, fail) => {
		server.stdout.on('data', (b) => {
			const m = /Listening on (http:\/\/\S+)/.exec(String(b));
			if (m) ok(m[1].replace(/\/$/, ''));
		});
		server.once('exit', (code) => fail(new Error(`server exited with ${code}`)));
	});
	return {
		origin,
		close() {
			server.kill();
			for (const f of [db, `${db}-wal`, `${db}-shm`]) rmSync(f, { force: true });
		}
	};
}

test('Scenario: Demo works with an empty database', async ({ page }, info) => {
	const server = await emptyServer(info);
	try {
		for (const type of ['imposter_pairs', 'wavelength_spectra'])
			expect(await (await page.request.get(`${server.origin}/api/content/${type}`)).json()).toEqual([]);
		await openDemo(page, 'imposter', server.origin);
		await playToEnd(page, IMPOSTER_STEPS);
		await openDemo(page, 'wavelength', server.origin);
		await playToEnd(page, WAVELENGTH_STEPS);
	} finally {
		server.close();
	}
});
