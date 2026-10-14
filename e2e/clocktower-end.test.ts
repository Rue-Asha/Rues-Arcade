import { expect, test, type Page } from '@playwright/test';
import { characters } from '../src/lib/games/clocktower/characters.ts';
import type { ClocktowerState } from '../src/lib/games/clocktower/types.ts';
import { seated } from '../src/lib/games/clocktower/fixtures.ts';
import { play, seedClocktower } from './clocktower-session.ts';
import { live } from './helpers.ts';
import { day1, ghostless, nightEnd } from './walks/clocktower-day.ts';
import { evilWin, goodWin, starpass } from './walks/clocktower-end.ts';

async function open(page: Page, state: ClocktowerState) {
	await seedClocktower(page, state);
	await page.goto('/spiele/clocktower/spielen');
	await expect(live(page).getByRole('heading', { name: 'Das Spiel ist vorbei', exact: true })).toBeVisible();
}

const weiter = (page: Page) => live(page).getByRole('button', { name: 'Weiter', exact: true });
const rows = (page: Page) => live(page).getByTestId('end-row');
const session = (page: Page) => page.evaluate(() => localStorage.getItem('arcade:session:clocktower'));

test('Scenario: Teaser names no team', async ({ page }, info) => {
	await open(page, goodWin());
	await expect(weiter(page)).toBeVisible();

	const text = (await live(page).innerText()).toLowerCase();
	for (const word of ['gut', 'böse', 'dämon', 'gewinnt']) expect(text, word).not.toContain(word);
	for (const c of characters) expect(text, c.name).not.toContain(c.name.toLowerCase());
	await expect(live(page).getByTestId('end-row')).toHaveCount(0);

	if (info.project.name === 'phone') {
		const bottom = await weiter(page).evaluate((el) => el.getBoundingClientRect().bottom);
		expect(bottom).toBeLessThanOrEqual(844);
	}
});

test('Scenario: Reveal shows the winning team and every seat', async ({ page }) => {
	await open(page, ghostless(goodWin(), 6));
	await weiter(page).click();

	const winner = live(page).getByTestId('winner');
	await expect(winner).toHaveText('Das Gute gewinnt');
	const same = await winner.evaluate((el) => {
		const probe = document.createElement('span');
		probe.style.color = 'var(--good)';
		document.body.append(probe);
		const want = getComputedStyle(probe).color;
		probe.remove();
		return getComputedStyle(el).color === want;
	});
	expect(same).toBe(true);

	await expect(rows(page)).toHaveCount(7);
	const got = await rows(page).evaluateAll((els) => els.map((el) => (el as HTMLElement).innerText.replace(/\s+/g, ' ').trim()));
	// seat 6 was the Poisoner until the starpass and is the Imp now; seat 7 died as the old Imp and spent its vote
	expect(got).toEqual([
		'1 Alex Washerwoman lebt',
		'2 Bo Empath lebt',
		'3 Cleo Monk lebt',
		'4 Dani Ravenkeeper lebt',
		'5 Eli Drunk (glaubte: Chef) lebt',
		'6 Fey Imp tot, Stimme übrig',
		'7 Gus Imp tot, keine Stimme'
	]);
	await expect(live(page).getByTestId('history')).toHaveText('Nacht 2: Starpass von Gus (#7) zu Fey (#6), davor Poisoner');
	await expect(live(page).getByRole('button', { name: 'Zurück zum Start', exact: true })).toBeVisible();
});

test('Reveal lists a takeover and a starpass of the same night', async ({ page }) => {
	// the Imp (seat 8) is executed, the Scarlet Woman (seat 7) takes over at dusk and passes on to the Poisoner (seat 6)
	const roles = ['chef', 'investigator', 'monk', 'ravenkeeper', 'slayer', 'poisoner', 'scarlet-woman', 'imp'] as const;
	const dusk = play(day1(seated([...roles])), [{ type: 'execute', seat: 7 }, { type: 'next' }, { type: 'next' }]);
	const taken = play(dusk, [{ type: 'answer', yes: true }]);
	const day2 = play(nightEnd(starpass(taken, 5), [6]), [{ type: 'next' }, { type: 'next' }, { type: 'timer', minutes: null, now: 0 }]);
	await open(page, play(day2, [{ type: 'execute', seat: 5 }, { type: 'next' }]));
	await weiter(page).click();

	await expect(live(page).getByTestId('winner')).toHaveText('Das Gute gewinnt');
	await expect(live(page).getByTestId('history').locator('p')).toHaveText([
		'Nacht 2: Scarlet Woman Gus (#7) wird zum Imp, davor Hana (#8)',
		'Nacht 2: Starpass von Gus (#7) zu Fey (#6), davor Poisoner'
	]);
});

test('Reveal names evil as the winner', async ({ page }) => {
	await open(page, evilWin());
	await weiter(page).click();
	await expect(live(page).getByTestId('winner')).toHaveText('Das Böse gewinnt');
	await expect(rows(page)).toHaveCount(5);
	await expect(live(page).getByTestId('history')).toHaveText('Der Dämon blieb Dani (#4)');
});

test('Reveal winner animated once, still under reduced motion', async ({ page }) => {
	await open(page, evilWin());
	await weiter(page).click();
	const winner = live(page).getByTestId('winner');
	await expect(winner).toBeVisible();
	const run = () =>
		winner.evaluate((el) => {
			const all = el.closest('[data-end]')!.getAnimations({ subtree: true });
			return all.map((a) => a.effect!.getComputedTiming().iterations);
		});
	const motion = await run();
	expect(motion.length).toBeGreaterThan(0);
	for (const n of motion) expect(Number.isFinite(n)).toBe(true);

	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.reload();
	await expect(live(page).getByTestId('winner')).toBeVisible();
	expect(await run()).toEqual([]);
});

test('Scenario: Reload on the teaser keeps it hidden', async ({ page }) => {
	await open(page, goodWin());
	await page.reload();
	await expect(live(page).getByRole('heading', { name: 'Das Spiel ist vorbei', exact: true })).toBeVisible();
	await expect(weiter(page)).toBeVisible();
	await expect(live(page).getByTestId('winner')).toHaveCount(0);
	const text = (await live(page).innerText()).toLowerCase();
	for (const word of ['gut', 'böse', 'dämon']) expect(text, word).not.toContain(word);
});

test('Scenario: Session cleared only on leaving', async ({ page }) => {
	await open(page, goodWin());
	await weiter(page).click();
	await expect(live(page).getByTestId('winner')).toBeVisible();

	await page.reload();
	await expect(live(page).getByTestId('winner')).toHaveText('Das Gute gewinnt');
	expect(await session(page)).not.toBeNull();

	await live(page).getByRole('button', { name: 'Zurück zum Start', exact: true }).click();
	await expect(page).toHaveURL(/\/spiele\/clocktower$/);
	expect(await session(page)).toBeNull();
	await expect(page.getByRole('button', { name: 'Weiterspielen' })).toHaveCount(0);
});
