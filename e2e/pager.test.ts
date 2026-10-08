import { expect, test, type APIRequestContext, type Page } from '@playwright/test';
import { emptyServer, writeHeaders } from './helpers.ts';

const PHONE = { width: 390, height: 844 };
const DESKTOP = { width: 1280, height: 800 };

const pager = (page: Page) => page.getByRole('navigation', { name: 'Seiten', exact: true });
const next = (page: Page) => pager(page).getByRole('button', { name: 'Weiter', exact: true });
const back = (page: Page) => pager(page).getByRole('button', { name: 'Zurück', exact: true });
const entries = (page: Page) => page.getByRole('list', { name: 'Einträge' }).getByRole('listitem');
const texts = (page: Page) => entries(page).allInnerTexts();

async function seed(request: APIRequestContext, origin: string, type: string, lines: string[]) {
	const res = await request.post(`${origin}/api/content/${type}/import`, {
		headers: writeHeaders(origin),
		data: { text: lines.join('\n') }
	});
	expect(res.ok()).toBe(true);
}

const pairs = (n: number) => Array.from({ length: n }, (_, i) => `Frage ${i + 1} | Gegenfrage ${i + 1}`);

async function toPage(page: Page, target: number) {
	const at = Number(/Seite (\d+) von/.exec(await pager(page).innerText())![1]);
	for (let n = at; n < target; n++) await next(page).click();
	await expect(pager(page)).toContainText(`Seite ${target} von`);
}

test('Scenario: Inhalte pages by width', async ({ page }, info) => {
	const server = await emptyServer(info, 'pager-width');
	try {
		await page.setViewportSize(PHONE);
		await page.goto(`${server.origin}/spiele/codes/inhalte`);
		await expect(pager(page)).toContainText('Seite 1 von 16');
		await expect(entries(page)).toHaveCount(6);
		await expect(back(page)).toBeDisabled();
		const first = await texts(page);
		await next(page).click();
		await expect(pager(page)).toContainText('Seite 2 von 16');
		expect(await texts(page)).not.toEqual(first);
		await toPage(page, 16);
		await expect(next(page)).toBeDisabled();
		await expect(page.getByRole('button', { name: /^Mehr anzeigen/ })).toHaveCount(0);

		await page.setViewportSize(DESKTOP);
		await page.goto(`${server.origin}/spiele/codes/inhalte`);
		await expect(pager(page)).toContainText('Seite 1 von 8');
		await expect(entries(page)).toHaveCount(12);
		await next(page).click();
		await expect(pager(page)).toContainText('Seite 2 von 8');
		await expect(page.getByRole('button', { name: /^Mehr anzeigen/ })).toHaveCount(0);
	} finally {
		server.close();
	}
});

test('Scenario: Survey cards page by width', async ({ page }, info) => {
	const server = await emptyServer(info, 'pager-surveys');
	try {
		const cards = page.getByRole('list', { name: 'Umfragen' }).locator(':scope > li');
		await page.setViewportSize(PHONE);
		await page.goto(`${server.origin}/spiele/family-feud/inhalte`);
		await expect(pager(page)).toContainText('Seite 1 von 42');
		await expect(cards).toHaveCount(6);
		await page.setViewportSize(DESKTOP);
		await page.goto(`${server.origin}/spiele/family-feud/inhalte`);
		await expect(pager(page)).toContainText('Seite 1 von 21');
		await expect(cards).toHaveCount(12);
	} finally {
		server.close();
	}
});

test('Scenario: Empty content list shows no pager', async ({ page }, info) => {
	const server = await emptyServer(info, 'pager-empty');
	try {
		await page.goto(`${server.origin}/spiele/imposter/inhalte`);
		await expect(page.getByText('Noch keine Einträge', { exact: true })).toBeVisible();
		await expect(pager(page)).toHaveCount(0);
	} finally {
		server.close();
	}
});

test('Scenario: Pager hidden when one page holds everything', async ({ page, request }, info) => {
	const server = await emptyServer(info, 'pager-one');
	try {
		await seed(request, server.origin, 'imposter_pairs', pairs(6));
		await page.setViewportSize(PHONE);
		await page.goto(`${server.origin}/spiele/imposter/inhalte`);
		await expect(entries(page)).toHaveCount(6);
		await expect(pager(page)).toHaveCount(0);

		await seed(request, server.origin, 'imposter_pairs', pairs(12).slice(6));
		await page.setViewportSize(DESKTOP);
		await page.goto(`${server.origin}/spiele/imposter/inhalte`);
		await expect(entries(page)).toHaveCount(12);
		await expect(pager(page)).toHaveCount(0);
	} finally {
		server.close();
	}
});

test('Scenario: Pager page clamps across 1024px', async ({ page }, info) => {
	const server = await emptyServer(info, 'pager-clamp');
	try {
		await page.setViewportSize(PHONE);
		await page.goto(`${server.origin}/spiele/codes/inhalte`);
		await toPage(page, 10);
		await expect(pager(page)).toContainText('Seite 10 von 16');
		await page.setViewportSize(DESKTOP);
		await expect(pager(page)).toContainText('Seite 8 von 8');
		await expect(entries(page)).not.toHaveCount(0);
	} finally {
		server.close();
	}
});

test('Scenario: Pager clamped page stays after widening back and forth', async ({ page }, info) => {
	const server = await emptyServer(info, 'pager-writeback');
	try {
		await page.setViewportSize(PHONE);
		await page.goto(`${server.origin}/spiele/codes/inhalte`);
		await toPage(page, 10);
		await page.setViewportSize(DESKTOP);
		await expect(pager(page)).toContainText('Seite 8 von 8');
		await page.setViewportSize(PHONE);
		await expect(pager(page)).toContainText('Seite 8 von 16');
	} finally {
		server.close();
	}
});

test('Scenario: Pager page change is instant under reduced motion', async ({ page }, info) => {
	const server = await emptyServer(info, 'pager-instant');
	try {
		await page.emulateMedia({ reducedMotion: 'reduce' });
		await page.setViewportSize(PHONE);
		await page.goto(`${server.origin}/spiele/codes/inhalte`);
		const first = await texts(page);
		await next(page).click();
		const frame = await page.evaluate(
			() =>
				new Promise<{ running: number; label: string }>((done) =>
					requestAnimationFrame(() =>
						done({
							running: document.getAnimations().filter((a) => a.effect?.getTiming().iterations !== Infinity && a.playState === 'running').length,
							label: document.querySelector('nav[aria-label="Seiten"] span')?.textContent ?? ''
						})
					)
				)
		);
		expect(frame.label).toBe('Seite 2 von 16');
		expect(frame.running).toBe(0);
		expect(await texts(page)).not.toEqual(first);
	} finally {
		server.close();
	}
});

test('Scenario: Added entry shows on page 1', async ({ page }, info) => {
	const server = await emptyServer(info, 'pager-add');
	try {
		await page.setViewportSize(PHONE);
		await page.goto(`${server.origin}/spiele/codes/inhalte`);
		await toPage(page, 3);
		const add = page.getByRole('form', { name: 'Neuer Eintrag' });
		await add.getByLabel('Wort').fill('Zeppelinhafen');
		await add.getByRole('button', { name: 'Hinzufügen' }).click();
		await expect(pager(page)).toContainText('Seite 1 von 16');
		await expect(entries(page).first()).toContainText('Zeppelinhafen');
	} finally {
		server.close();
	}
});

test('Scenario: Deleting the last entry on the last page goes back a page', async ({ page }, info) => {
	const server = await emptyServer(info, 'pager-delete');
	try {
		await page.setViewportSize(PHONE);
		await page.goto(`${server.origin}/spiele/codes/inhalte`);
		await toPage(page, 16);
		await expect(entries(page)).toHaveCount(1);
		const doomed = (await texts(page))[0].split('\n')[0];
		await page.getByRole('button', { name: `${doomed} löschen` }).click();
		await page.getByRole('dialog').getByRole('button', { name: 'Löschen' }).click();
		await expect(page.getByRole('dialog')).toBeHidden();
		await expect(pager(page)).toContainText('Seite 15 von 15');
		await expect(entries(page)).toHaveCount(6);
	} finally {
		server.close();
	}
});

test('Scenario: Import goes to page 1', async ({ page }, info) => {
	const server = await emptyServer(info, 'pager-import');
	try {
		await page.setViewportSize(PHONE);
		await page.goto(`${server.origin}/spiele/duck/inhalte`);
		await toPage(page, 2);
		const words = ['Pinselei', 'Kistenwand', 'Kerzenlicht'];
		await page.getByLabel('Mehrere auf einmal').fill(words.join('\n'));
		await page.getByRole('button', { name: 'Importieren' }).click();
		await expect(page.getByRole('status')).toContainText('3 importiert');
		await expect(pager(page)).toContainText('Seite 1 von');
		for (const word of words) await expect(entries(page).filter({ hasText: word })).toHaveCount(1);
	} finally {
		server.close();
	}
});
