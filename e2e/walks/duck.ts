import type { Page } from '@playwright/test';
import { seedRoster } from '../helpers.ts';

export async function walk(page: Page, check: (slug: string) => Promise<void>) {
	await seedRoster(page, ['Alex', 'Bo', 'Cleo', 'Dani']);
	await page.goto('/spiele/duck');
	await check('start-duck');
}
