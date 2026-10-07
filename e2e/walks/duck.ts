import { expect, type Page } from '@playwright/test';
import { seedRoster } from '../helpers.ts';

const words = [
	{ id: 1, a: 'Haus', b: '' },
	{ id: 2, a: 'Stern', b: '' }
];

const press = (page: Page, name: string) => page.getByRole('button', { name, exact: true }).click();

const card = (page: Page, name: string) =>
	page.getByRole('list', { name: 'Wertung' }).getByRole('listitem', { name, exact: true });

// The dialog opens over the hovered button, whose hover transition is then cancelled; the look checks wait on
// every finite animation and would see that one abort.
const still = (page: Page) =>
	expect
		.poll(() =>
			page.evaluate(
				() =>
					document
						.getAnimations()
						.filter((a) => a.playState === 'running' && a.effect?.getTiming().iterations !== Infinity).length
			)
		)
		.toBe(0);

// Start, lobby, Aufdecken (hidden, shown, skip dialog), Wertung at T = 50 with and without locked boxes,
// Punktestand and Spielende.
export async function walk(page: Page, check: (slug: string) => Promise<void>) {
	await seedRoster(page, ['Alex', 'Bo', 'Cleo', 'Dani']);
	await page.route('**/api/content/duck_words', (route) =>
		route.request().method() === 'GET' ? route.fulfill({ json: words }) : route.fallback()
	);
	await page.goto('/spiele/duck');
	await check('start-duck');

	await press(page, "Los geht's");
	await expect(page).toHaveURL(/\/lobby$/);
	await press(page, '50');
	await check('lobby-duck');
	await press(page, "Los geht's");
	await expect(page).toHaveURL(/\/spielen$/);

	await expect(page.getByRole('button', { name: 'Wort aufdecken' })).toBeVisible();
	await check('duck-reveal');
	await press(page, 'Wort aufdecken');
	await expect(page.getByTestId('word')).toBeVisible();
	await check('duck-reveal-shown');
	await press(page, 'Überspringen');
	await expect(page.getByRole('dialog', { name: 'Wort überspringen?' })).toBeVisible();
	await still(page);
	await check('duck-skip');
	await page.getByRole('dialog').getByRole('button', { name: 'Abbrechen', exact: true }).click();
	await expect(page.getByRole('dialog')).toHaveCount(0);

	await press(page, 'Wort spielen');
	await card(page, 'Alex').getByRole('button', { name: '5 Punkte', exact: true }).click();
	await card(page, 'Cleo').getByRole('button', { name: '3 Punkte', exact: true }).click();
	await card(page, 'Bo').getByRole('button', { name: 'Y', exact: true }).click();
	await check('duck-scoring');
	await press(page, 'Weiter');
	await expect(page.getByText(/^Als Nächstes bekommt/)).toBeVisible();
	await check('duck-standings');

	await press(page, 'Nächstes Wort');
	await press(page, 'Wort aufdecken');
	await press(page, 'Wort spielen');
	await card(page, 'Alex').getByRole('button', { name: '8 Punkte', exact: true }).click();
	await card(page, 'Bo').getByRole('button', { name: 'K', exact: true }).click();
	await check('duck-scoring-locked');
	await card(page, 'Cleo').getByRole('button', { name: '50 Punkte', exact: true }).click();
	await press(page, 'Weiter');
	await expect(page.getByText('Gewinner', { exact: true })).toBeVisible();
	await check('duck-gameover');

	await page.unroute('**/api/content/duck_words');
}
