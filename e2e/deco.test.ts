import { expect, test } from '@playwright/test';

const PITCH = {
	Imposter: 'Alle bekommen dieselbe Frage, bis auf eine Person.',
	Wavelength: 'Einen Punkt auf einer Skala zwischen zwei Begriffen finden, gemeinsam oder in Teams.'
};

test('Scenario: Each tile shows a one-line pitch', async ({ page }) => {
	await page.goto('/');

	for (const [name, pitch] of Object.entries(PITCH)) {
		const tile = page.getByRole('link', { name: new RegExp(name) });
		const line = tile.getByText(pitch, { exact: true });
		await expect(line).toBeVisible();
		const [title, text, range] = await Promise.all(
			[tile.getByText(name, { exact: true }), line, tile.getByText(/^\d+–\d+ Spieler$/)].map(
				async (l) => (await l.boundingBox())!.y
			)
		);
		expect(title).toBeLessThan(text);
		expect(text).toBeLessThan(range);
	}

	const locked = page.locator('.tile.locked');
	await expect(locked).toHaveCount(5);
	for (const pitch of Object.values(PITCH)) await expect(locked.getByText(pitch)).toHaveCount(0);
	for (const tile of await locked.all()) await expect(tile).toHaveText(/^\s*[\w ]+\s*Bald verfügbar\s*$/);
});
