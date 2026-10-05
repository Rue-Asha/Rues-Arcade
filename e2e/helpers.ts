import { expect, type APIRequestContext, type Page, type TestInfo } from '@playwright/test';
import type { ContentType } from '../src/lib/content/types.ts';

export async function seedRoster(page: Page, names: string[]) {
	if (page.url() === 'about:blank') await page.goto('/');
	const players = names.map((name, i) => ({ id: `p${i + 1}`, name }));
	await page.evaluate((list) => localStorage.setItem('arcade:roster', JSON.stringify(list)), players);
	return players;
}

export async function seedContent(
	request: APIRequestContext,
	type: ContentType,
	rows: [string, string][]
) {
	const res = await request.post(`/api/content/${type}/import`, {
		data: { text: rows.map(([a, b]) => `${a} | ${b}`).join('\n') }
	});
	expect(res.ok()).toBe(true);
}

export async function shot(page: Page, info: TestInfo, slug: string) {
	await page.evaluate(() =>
		Promise.all(
			document
				.getAnimations()
				.filter((a) => a.effect?.getTiming().iterations !== Infinity)
				.map((a) => a.finished)
		)
	);
	const width = await page.evaluate(() => document.documentElement.scrollWidth);
	expect(width).toBeLessThanOrEqual(page.viewportSize()!.width);
	await page.screenshot({ path: `test-results/shots/${info.project.name}-${slug}.png`, fullPage: true });
}
