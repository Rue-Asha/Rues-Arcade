import { expect, type Page } from '@playwright/test';
import { seedRoster } from '../helpers.ts';

// Start screen on the seeded surveys; U5 extends this through lobby, prep and play.
export async function walk(page: Page, check: (slug: string) => Promise<void>) {
	await seedRoster(page, ['Alex', 'Bo', 'Cleo', 'Dani']);
	await page.goto('/spiele/family-feud');
	await expect(page.getByRole('heading', { name: 'Family Feud', level: 1 })).toBeVisible();
	await check('start-family-feud');
}
