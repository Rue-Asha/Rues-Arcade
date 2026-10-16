import { expect, test, type Page } from '@playwright/test';
import { dead, F15, F5, F7, firstDay, seated } from '../src/lib/games/clocktower/fixtures.ts';
import type { ClocktowerState } from '../src/lib/games/clocktower/types.ts';
import { byId } from '../src/lib/games/clocktower/characters.ts';
import { play, seedClocktower } from './clocktower-session.ts';
import { live } from './helpers.ts';

const reveal = (s: ClocktowerState) => play(s, s.seats.flatMap(() => [{ type: 'show' as const }, { type: 'hide' as const }]));
const next = (n: number) => Array.from({ length: n }, () => ({ type: 'next' as const }));
// the circle screen of step k (0-based) of night 1 is screen 1 + 4k + 2
const circle = (k: number) => 3 + 4 * k;

const card = (page: Page) => page.getByTestId('show-card');
const bar = (page: Page) => live(page).getByTestId('show-bar');
const chip = (page: Page, name: string) => live(page).getByRole('button', { name, exact: true });

async function open(page: Page, state: ClocktowerState) {
	await seedClocktower(page, state);
	await page.goto('/spiele/clocktower/spielen');
	await expect(bar(page)).toBeVisible();
}

// each text: the element whose own text is measured, its floor in px and what the card shows
type Text = { item: string; value?: { label: string; option: string }; fonts: { text: string; min: number }[] };

const texts = (bluffs: string[]): Text[] => [
	{ item: 'Charakter', value: { label: 'Charakter', option: 'fortune-teller' }, fonts: [{ text: 'Fortune Teller', min: 20 }] },
	{ item: 'Das ist der Dämon', fonts: [{ text: 'Das ist der Dämon', min: 20 }] },
	{ item: 'Deine Minions', fonts: [{ text: 'Deine Minions', min: 20 }] },
	{ item: 'Bluffs', fonts: bluffs.map((text) => ({ text, min: 16 })) },
	{ item: 'Du bist', value: { label: 'Du bist', option: 'imp' }, fonts: [{ text: 'Du bist', min: 16 }, { text: 'Imp', min: 20 }] },
	{ item: 'Zahl', value: { label: 'Zahl', option: '7' }, fonts: [{ text: '7', min: 96 }] },
	{ item: 'Ja', fonts: [{ text: 'Ja', min: 40 }] },
	{ item: 'Nein', fonts: [{ text: 'Nein', min: 40 }] }
];

for (const [seats, list] of [[5, F5], [7, F7], [15, F15]] as const) {
	test(`Scenario: Centre texts fit the circle (${seats} seats)`, async ({ page }) => {
		const state = play(reveal(seated(list)), next(circle(0)));
		await open(page, state);
		for (const { item, value, fonts } of texts(state.bluffs.map((id) => byId[id].name))) {
			await chip(page, item).click();
			if (value) await bar(page).getByLabel(value.label, { exact: true }).selectOption(value.option);
			await bar(page).getByRole('button', { name: 'Zeigen', exact: true }).click();
			await expect(card(page), item).toBeVisible();
			await page.waitForTimeout(150);
			const m = await live(page).evaluate((stage, wanted) => {
				const c = stage.querySelector<HTMLElement>('[data-testid="show-card"]')!;
				const ring = stage.querySelector<HTMLElement>('[data-centre]')!.getBoundingClientRect();
				const r = c.getBoundingClientRect();
				const mid = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
				const radius = r.width / 2;
				const rgba = (css: string) => {
					const ctx = document.createElement('canvas').getContext('2d')!;
					ctx.canvas.width = ctx.canvas.height = 1;
					ctx.clearRect(0, 0, 1, 1);
					ctx.fillStyle = css;
					ctx.fillRect(0, 0, 1, 1);
					return [...ctx.getImageData(0, 0, 1, 1).data];
				};
				const lum = ([r, g, b]: number[]) => {
					const f = (v: number) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
					return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
				};
				const back = rgba(getComputedStyle(c).backgroundColor);
				const leaves = [...c.querySelectorAll<HTMLElement | SVGElement>('*')].filter((el) => [...el.childNodes].some((n) => n.nodeType === Node.TEXT_NODE && n.textContent!.trim() !== ''));
				const outside = [...c.querySelectorAll<HTMLElement | SVGElement>('*')].filter((el) => {
					const b = el.getBoundingClientRect();
					if (b.width === 0 || b.height === 0) return false;
					return [[b.left, b.top], [b.right, b.top], [b.left, b.bottom], [b.right, b.bottom]].some(([x, y]) => Math.hypot(x - mid.x, y - mid.y) > radius + 0.5);
				}).length;
				const contrast = leaves.map((el) => {
					const [fr, fg, fb] = rgba(getComputedStyle(el).color);
					const a = lum([fr, fg, fb]);
					const b = lum(back);
					return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
				});
				const sizes = wanted.map((w) => {
					const el = leaves.find((x) => x.textContent!.trim() === w.text);
					return { text: w.text, size: el ? parseFloat(getComputedStyle(el).fontSize) : 0 };
				});
				const seats = [...stage.querySelectorAll<HTMLElement>('[data-seat]')].map((s) => {
					const b = s.getBoundingClientRect();
					// seat nodes are round
					return Math.hypot(b.left + b.width / 2 - mid.x, b.top + b.height / 2 - mid.y) - b.width / 2 >= radius;
				});
				return {
					inside: r.left >= ring.left - 0.5 && r.right <= ring.right + 0.5 && r.top >= ring.top - 0.5 && r.bottom <= ring.bottom + 0.5,
					outside,
					contrast,
					back: back[3],
					sizes,
					seats
				};
			}, fonts);
			expect(m.inside, `${item} inside the ring`).toBe(true);
			expect(m.outside, `${item} content inside the disc`).toBe(0);
			expect(m.seats.every(Boolean), `${item} overlaps no seat`).toBe(true);
			expect(m.back, `${item} own opaque surface`).toBe(255);
			expect(m.contrast.length, item).toBeGreaterThan(0);
			expect(Math.min(...m.contrast), `${item} contrast`).toBeGreaterThanOrEqual(4.5);
			for (const [i, f] of fonts.entries()) expect(m.sizes[i].size, `${item}: ${f.text}`).toBeGreaterThanOrEqual(f.min);
			await card(page).click();
			await expect(card(page), item).toHaveCount(0);
		}
	});
}

// the circle screen of the first step of `kind`, counted from where the night starts
function atStep(state: ClocktowerState, kind: string): ClocktowerState {
	const { screens, steps, at } = state.night!;
	const k = screens.findIndex((x) => x.screen === 'circle' && steps[x.step].kind === kind);
	expect(k, kind).toBeGreaterThan(-1);
	return play(state, next(k - at));
}

const night1 = (list: typeof F5) => reveal(seated(list));
// the day-1 grimoire ended at once: no execution, dusk of night 2
const night2 = (list: typeof F5, kill?: number) => {
	const day = firstDay(night1(list));
	return play(kill === undefined ? day : dead(day, kill), [{ type: 'endDay' }, { type: 'next' }]);
};

const seatAt = (page: Page, n: number) => live(page).locator(`[data-seat="${n}"]`);
const pointed = (page: Page) => live(page).locator('[data-seat][data-pointed]');
const stored = (page: Page) => page.evaluate(() => localStorage.getItem('arcade:session:clocktower'));

async function show(page: Page, item: string, option?: string) {
	await chip(page, item).click();
	if (option) await bar(page).getByLabel(item, { exact: true }).selectOption(option);
	await bar(page).getByRole('button', { name: 'Zeigen', exact: true }).click();
	await expect(card(page)).toBeVisible();
}

test('Scenario: Seats are marked while a text is shown', async ({ page }) => {
	await open(page, atStep(night1(F7), 'investigator'));
	const before = await stored(page);
	await show(page, 'Charakter');
	await expect(seatAt(page, 2).locator('[data-badge="check"]')).toHaveCount(0);
	for (const n of [2, 3, 6, 3]) await seatAt(page, n).click();
	await expect(card(page)).toBeVisible();
	await expect(seatAt(page, 2)).toHaveAttribute('data-pointed', '');
	await expect(seatAt(page, 6)).toHaveAttribute('data-pointed', '');
	await expect(seatAt(page, 3)).not.toHaveAttribute('data-pointed');
	await expect(pointed(page)).toHaveCount(2);
	for (const [n, marked] of [[2, true], [6, true], [3, false], [1, false]] as const) {
		await expect(seatAt(page, n).locator('[data-badge="check"]'), `seat ${n} check`).toHaveCount(marked ? 1 : 0);
		const ring = await seatAt(page, n).evaluate((el) => {
			const probe = document.createElement('i');
			probe.style.color = 'var(--gold)';
			el.append(probe);
			const gold = getComputedStyle(probe).color;
			probe.remove();
			return getComputedStyle(el).boxShadow.includes(gold);
		});
		expect(ring, `seat ${n} gold ring`).toBe(marked);
	}
	expect(await stored(page)).toBe(before);
});

test("Scenario: Closing the text gives taps back to the Imp's target", async ({ page }) => {
	await open(page, atStep(night2(F5), 'imp'));
	await expect(live(page).getByText('Tippe auf den Platz des Ziels.', { exact: true })).toBeVisible();
	await show(page, 'Ja');
	await seatAt(page, 2).click();
	await seatAt(page, 5).click();
	await expect(pointed(page)).toHaveCount(2);
	await expect(live(page).getByText('Tippe auf den Platz des Ziels.', { exact: true })).toBeVisible();

	await card(page).click();
	await expect(card(page)).toHaveCount(0);
	await expect(pointed(page)).toHaveCount(0);
	await seatAt(page, 4).click();
	await expect(live(page).getByText('Ziel: Dani (#4)', { exact: true })).toBeVisible();
	await expect(seatAt(page, 4)).not.toHaveAttribute('data-pointed');
	await expect(seatAt(page, 4)).toHaveAttribute('data-marked', '');
	await expect(seatAt(page, 4).locator('[data-badge="check"]')).toHaveCount(0);
	await expect(pointed(page)).toHaveCount(0);
});

test('Scenario: Dead seats can be marked but not targeted', async ({ page }) => {
	await open(page, atStep(night2(F7, 5), 'imp'));
	await show(page, 'Ja');
	await seatAt(page, 6).click();
	await expect(seatAt(page, 6)).toHaveAttribute('data-pointed', '');
	await card(page).click();
	await expect(card(page)).toHaveCount(0);
	await seatAt(page, 6).click({ force: true });
	await expect(seatAt(page, 6)).not.toHaveAttribute('data-pointed');
	await expect(seatAt(page, 6)).not.toHaveAttribute('data-marked');
	await expect(live(page).getByText('Tippe auf den Platz des Ziels.', { exact: true })).toBeVisible();
});

test('Scenario: Another text keeps the marks', async ({ page }) => {
	await open(page, atStep(night1(F7), 'investigator'));
	await show(page, 'Zahl', '4');
	await seatAt(page, 3).click();
	await show(page, 'Ja');
	await expect(card(page).getByText('Ja', { exact: true })).toBeVisible();
	await expect(card(page).getByText('4', { exact: true })).toHaveCount(0);
	await expect(seatAt(page, 3)).toHaveAttribute('data-pointed', '');
});

test('Scenario: Leaving the step or reloading clears text and marks', async ({ page }) => {
	const state = atStep(night2(F5), 'imp');
	for (const how of ['step', 'reload']) {
		await open(page, state);
		await seatAt(page, 4).click();
		await expect(live(page).getByText('Ziel: Dani (#4)', { exact: true })).toBeVisible();
		await show(page, 'Ja');
		await seatAt(page, 3).click();
		await expect(pointed(page)).toHaveCount(1);
		if (how === 'step') {
			await live(page).getByRole('button', { name: 'Weiter', exact: true }).click();
			await expect(live(page).getByRole('heading', { name: 'Schlaf wieder ein', exact: true })).toBeVisible();
			await live(page).getByRole('button', { name: 'Zurück', exact: true }).click();
		} else {
			await page.reload();
		}
		await expect(live(page).locator('[data-circle]')).toBeVisible();
		await expect(card(page), how).toHaveCount(0);
		await expect(pointed(page), how).toHaveCount(0);
		await expect(live(page).getByText('Ziel: Dani (#4)', { exact: true }), how).toBeVisible();
	}
});
