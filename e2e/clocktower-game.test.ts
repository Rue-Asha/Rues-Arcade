import { expect, test, type Page } from '@playwright/test';
import { byId } from '../src/lib/games/clocktower/characters.ts';
import { F15, firstDay, seated, voted } from '../src/lib/games/clocktower/fixtures.ts';
import type { ClocktowerAction, ClocktowerState } from '../src/lib/games/clocktower/types.ts';
import { play, seedClocktower } from './clocktower-session.ts';
import { live, seedRoster, settled } from './helpers.ts';

const NAMES = ['Alex', 'Bo', 'Cleo', 'Dani', 'Eli', 'Fey', 'Gus', 'Hana', 'Ida', 'Jo', 'Kai', 'Lu', 'Mo', 'Nia', 'Ole'];

const press = (page: Page, name: string) => live(page).getByRole('button', { name, exact: true }).click();
const heading = (page: Page, name: string) => live(page).getByRole('heading', { name, exact: true });
const saved = (page: Page): Promise<ClocktowerState> =>
	page.evaluate(() => JSON.parse(localStorage.getItem('arcade:session:clocktower')!).state);

// start screen, lobby, setup (a Poisoner on seat 1, the rest "Zufällig"), reveal of 5 cards, night 1, dawn,
// day 1 nominating and executing the Imp, announcement, teaser, reveal: about 60 taps
const STEPS = 60;

test('Scenario: Full Clocktower game', async ({ page }, info) => {
	test.skip(info.project.name !== 'phone', 'one full game on the phone is enough');
	test.setTimeout(STEPS * 800 + 60_000);
	// the vote sweep at 5 seats, shortened
	await page.addInitScript(() => ((window as unknown as { clocktowerSeatMs: number }).clocktowerSeatMs = 30));
	await seedRoster(page, NAMES.slice(0, 5));
	await page.goto('/spiele/clocktower');

	await page.getByRole('button', { name: "Los geht's", exact: true }).click();
	await page.getByRole('button', { name: 'Spiel starten', exact: true }).click();
	await expect(heading(page, 'Sitzordnung')).toBeVisible();

	// the only Minion of 5 is the Poisoner, so no Scarlet Woman can turn the Imp's execution into a question
	await live(page).locator('[data-seat="1"]').click();
	await live(page).locator('[data-character="poisoner"]').click();
	await press(page, 'Zufällig');
	await press(page, 'Weiter');
	await page.getByRole('dialog').getByRole('button', { name: 'Ja, weiter', exact: true }).click();

	for (let i = 0; i < 5; i++) {
		await press(page, 'Rolle zeigen');
		await press(page, 'Verbergen & weitergeben');
	}
	await expect(heading(page, 'Alle schlafen ein')).toBeVisible();

	// night 1: every guide screen leaves with "Weiter" until dawn
	const dawn = heading(page, 'Alle aufwachen');
	for (let i = 0; i < 40 && !(await dawn.isVisible()); i++) {
		await press(page, 'Weiter');
		await settled(page);
	}
	await expect(dawn).toBeVisible();
	await press(page, 'Weiter');
	await expect(heading(page, 'Niemand ist gestorben')).toBeVisible();
	await press(page, 'Weiter');
	await expect(heading(page, 'Tagestimer')).toBeVisible();
	await press(page, 'Ohne Timer');
	await expect(heading(page, 'Tag 1')).toBeVisible();

	const state = await saved(page);
	const imp = state.seats.findIndex((s) => s.character === 'imp');
	const nominator = imp === 1 ? 3 : 2;
	await live(page).locator(`[data-seat="${imp + 1}"]`).click();
	await page.getByRole('dialog').getByRole('button', { name: 'Nominieren', exact: true }).click();
	await live(page).locator(`[data-seat="${nominator}"]`).click();
	await press(page, 'Abstimmung beginnen');
	await expect(live(page).getByTestId('count')).toBeVisible();
	for (let i = 0; i < 3; i++) await press(page, 'Stimme mehr');
	await expect(live(page).getByTestId('count')).toHaveText('3');
	await press(page, 'Bestätigen');
	await expect(heading(page, `${NAMES[imp]} kommt auf den Block`)).toBeVisible();
	await press(page, 'Weiter');
	await press(page, 'Tag beenden');
	await page.getByRole('dialog').getByRole('button', { name: 'Ja, Tag beenden', exact: true }).click();
	await expect(heading(page, `${NAMES[imp]} wird hingerichtet`)).toBeVisible();
	await press(page, 'Weiter');

	await expect(heading(page, 'Das Spiel ist vorbei')).toBeVisible();
	await press(page, 'Weiter');
	await expect(live(page).getByTestId('winner')).toHaveText('Das Gute gewinnt');
	const rows = live(page).getByTestId('end-row');
	await expect(rows).toHaveCount(5);
	for (const seat of state.seats) {
		const row = rows.filter({ hasText: seat.player.name });
		await expect(row).toContainText(byId[seat.character!].name);
	}
	await expect(live(page).getByRole('button', { name: 'Zurück zum Start', exact: true })).toBeVisible();
});

const spy = () => {
	const w = window as unknown as { vt: number };
	w.vt = 0;
	const original = document.startViewTransition?.bind(document);
	if (!original) return;
	document.startViewTransition = ((update: () => Promise<void> | void) => {
		w.vt++;
		return original(update);
	}) as typeof document.startViewTransition;
};

// the last screen of night 1, one tap from dawn
const lastNight = () => {
	const night1 = play(seated(F15), seated(F15).seats.flatMap((): ClocktowerAction[] => [{ type: 'show' }, { type: 'hide' }]));
	return play(night1, night1.night!.screens.slice(1).map((): ClocktowerAction => ({ type: 'next' })));
};

const bodyIsGround = (page: Page) =>
	page.evaluate(() => {
		const probe = document.createElement('span');
		probe.style.backgroundColor = 'var(--ground)';
		document.body.append(probe);
		const ground = getComputedStyle(probe).backgroundColor;
		probe.remove();
		return getComputedStyle(document.body).backgroundColor === ground;
	});

const html = (page: Page) => page.locator('html');

async function toDawn(page: Page) {
	await page.addInitScript(spy);
	await seedClocktower(page, lastNight());
	await page.goto('/spiele/clocktower/spielen');
	await expect(heading(page, 'Schlaf wieder ein')).toBeVisible();
	await expect(html(page)).toHaveAttribute('data-variant', 'night');
	expect(await bodyIsGround(page)).toBe(true);
	const night = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
	await press(page, 'Weiter');
	await expect(heading(page, 'Alle aufwachen')).toBeVisible();
	await expect(html(page)).toHaveAttribute('data-variant', 'day');
	expect(await bodyIsGround(page)).toBe(true);
	expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).not.toBe(night);
}

const transitions = (page: Page) => page.evaluate(() => (window as unknown as { vt: number }).vt);

test('Scenario: Day and night variants switch with an animation', async ({ page }) => {
	await toDawn(page);
	expect(await transitions(page)).toBe(1);
});

test.describe('reduced motion', () => {
	test.use({ reducedMotion: 'reduce' });

	test('Scenario: Day and night variants switch without one under reduced motion', async ({ page }) => {
		await toDawn(page);
		expect(await transitions(page)).toBe(0);
		const running = await page.evaluate(() =>
			document.getAnimations().filter((a) => (a.effect as KeyframeEffect).pseudoElement?.startsWith('::view-transition')).length
		);
		expect(running).toBe(0);
	});
});

// What a screen shows apart from the seat names: its texts without the circle, which seats look dead and the
// executed seat's ghost-vote badge.
const read = (page: Page, seat: number) =>
	live(page).evaluate((el, n) => {
		const copy = el.cloneNode(true) as HTMLElement;
		copy.querySelector('[data-circle]')?.remove();
		return {
			text: copy.innerText,
			dead: el.querySelectorAll('[data-dead]').length,
			mark: el.querySelector(`[data-seat="${n}"] [data-badge="ghost"]`)?.outerHTML ?? null
		};
	}, seat);

// A day ending on its block: the announcement, the dusk screen, then what comes after "Weiter".
async function endDay(page: Page, state: ClocktowerState, nominee: number) {
	await seedClocktower(page, state);
	await page.goto('/spiele/clocktower/spielen');
	await press(page, 'Tag beenden');
	await page.getByRole('dialog').getByRole('button', { name: 'Ja, Tag beenden', exact: true }).click();
	const name = NAMES[nominee];
	await expect(heading(page, `${name} wird hingerichtet`)).toBeVisible();
	await settled(page);
	const announced = await read(page, nominee + 1);
	await press(page, 'Weiter');
	await expect(heading(page, 'Alle schlafen ein')).toBeVisible();
	await settled(page);
	const dusk = await read(page, nominee + 1);
	await press(page, 'Weiter');
	return { announced: { ...announced, text: announced.text.replaceAll(name, 'X') }, dusk };
}

test('Scenario: Public screen gives nothing away', async ({ page }) => {
	const day = firstDay(seated(F15));
	const imp = NAMES.indexOf('Ole');
	const withSW = await endDay(page, voted(day, imp, 1, 8), imp);
	await expect(heading(page, 'Wurde die Scarlet Woman zum Dämon?')).toBeVisible();

	const plain = await endDay(page, voted(day, 0, 1, 8), 0);
	await expect(live(page).getByRole('heading', { name: /^Wecke / })).toBeVisible();
	await expect(heading(page, 'Wurde die Scarlet Woman zum Dämon?')).toHaveCount(0);

	expect(plain.announced).toEqual(withSW.announced);
	expect(plain.dusk).toEqual(withSW.dusk);
	expect(withSW.dusk.text).not.toContain('Scarlet');
});
