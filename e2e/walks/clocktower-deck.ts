import { expect, type Page } from '@playwright/test';
import { slides, voteTimeline } from '../../src/lib/games/clocktower/deck.ts';
import { seedRoster, settled } from '../helpers.ts';

// Every slide of the deck at N 9, one check per slide at the project's width, then the sheet's second phone page.
export async function walk(page: Page, check: (slug: string) => Promise<void>) {
	await page.goto('/');
	await seedRoster(page, Array.from({ length: 9 }, (_, i) => `Spieler ${i + 1}`));
	await page.evaluate(() => localStorage.setItem('arcade:count:clocktower', '9'));
	await page.goto('/spiele/clocktower/erklaerung');

	const list = slides(9);
	const progress = page.getByTestId('deck-progress');
	for (const [i, s] of list.entries()) {
		await expect(progress).toHaveText(`${i + 1} / ${list.length}`);
		await settled(page);
		// the vote loop never ends: hold it on the end of the sweep so every shot sees the same frame
		if (s.id === 'voting') {
			await page.evaluate((ms) => {
				const root = document.querySelector('[data-slide="voting"]')!;
				for (const a of document.getAnimations()) {
					if (a.effect?.getTiming().iterations !== Infinity || !root.contains((a.effect as KeyframeEffect).target)) continue;
					a.pause();
					a.currentTime = ms;
				}
			}, voteTimeline(9).handMs);
		}
		await check(`clocktower-deck-${s.id}`);
		if (i < list.length - 1) await page.keyboard.press('ArrowRight');
	}

	const tab = page.getByRole('button', { name: 'Böse', exact: true });
	if (await tab.isVisible()) {
		await tab.click();
		await expect(page.getByTestId('sheet')).toHaveAttribute('data-page', '1');
		await check('clocktower-deck-sheet-boese');
	}
}
