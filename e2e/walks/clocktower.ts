import { expect, type Page } from '@playwright/test';
import { seedRoster } from '../helpers.ts';
import { walk as walkDay } from './clocktower-day.ts';
import { walk as walkDeck } from './clocktower-deck.ts';
import { walk as walkEnd } from './clocktower-end.ts';
import { walk as walkNight } from './clocktower-night.ts';
import { walk as walkSetup } from './clocktower-setup.ts';

type Check = (slug: string) => Promise<void>;

async function seed(page: Page, roster: number, count: number) {
	await seedRoster(page, Array.from({ length: roster }, (_, i) => `Spieler ${i + 1}`));
	await page.evaluate((n) => localStorage.setItem('arcade:count:clocktower', String(n)), count);
}

// Start with N 7 and the lobby with too few, too many and exactly N players; every phase walks its own file.
export async function walk(page: Page, check: Check) {
	await page.goto('/');
	await seed(page, 7, 7);
	await page.goto('/spiele/clocktower');
	await expect(page.getByTestId('count')).toHaveText('7');
	await check('start-clocktower');

	await seed(page, 5, 7);
	await page.goto('/spiele/clocktower/lobby');
	await expect(page.getByText('Für 7 Spieler fehlen noch 2 im Kader.', { exact: true })).toBeVisible();
	await check('lobby-clocktower-few');

	await seed(page, 9, 7);
	await page.goto('/spiele/clocktower/lobby');
	await expect(page.getByText('7 von 7 gewählt', { exact: true })).toBeVisible();
	await check('lobby-clocktower-pick');

	await seed(page, 7, 7);
	await page.goto('/spiele/clocktower/lobby');
	await expect(page.getByRole('button', { name: 'Spiel starten', exact: true })).toBeVisible();
	await check('lobby-clocktower');

	await walkSetup(page, check);
	await walkNight(page, check);
	await walkDay(page, check);
	await walkEnd(page, check);
	await walkDeck(page, check);
}
