import { expect, test, type Page } from '@playwright/test';
import { ambient, decoAudit, seedRoster } from './helpers.ts';

const PITCH = {
	Imposter: 'Alle bekommen dieselbe Frage, bis auf eine Person.',
	Wavelength: 'Einen Punkt auf einer Skala zwischen zwei Begriffen finden, gemeinsam oder in Teams.',
	Codes: 'Teams erraten ein geheimes Wort aus Ein-Wort-Hinweisen, reihum.',
	'What Rhymes with Duck': 'Alle suchen gleichzeitig einen Reim auf dasselbe Wort.',
	'Most Likely To': 'Ein Spruch, und alle zeigen auf die Person, die am besten passt.',
	'Family Feud': 'Zwei Teams suchen die häufigsten Antworten einer Umfrage.'
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
	await expect(locked).toHaveCount(1);
	for (const pitch of Object.values(PITCH)) await expect(locked.getByText(pitch)).toHaveCount(0);
	for (const tile of await locked.all()) await expect(tile).toHaveText(/^\s*[\w ]+\s*Bald verfügbar\s*$/);
});

const crew = ['Alex', 'Bo', 'Cleo', 'Dani'];

async function seedPlay(page: Page) {
	await page.evaluate((names) => {
		const players = names.map((n) => ({ id: n, name: n }));
		const team = (name: string, list: typeof players) => ({ name, players: list, score: 0 });
		localStorage.setItem(
			'arcade:session:imposter',
			JSON.stringify({
				v: 1,
				state: {
					rng: { state: 1 },
					players,
					pool: [{ id: 1, a: 'Crew?', b: 'Imposter?' }],
					used: [1],
					round: 1,
					pairId: 1,
					crew: 'Crew?',
					imposter: 'Imposter?',
					imposterIndex: 0,
					phase: 'handover',
					revealIndex: 0,
					shown: false
				}
			})
		);
		localStorage.setItem(
			'arcade:session:wavelength',
			JSON.stringify({
				v: 1,
				state: {
					rng: { state: 1 },
					pool: [{ id: 1, a: 'Kalt', b: 'Heiß' }],
					used: [1],
					teams: [team('Team 1', [players[0], players[2]]), team('Team 2', [players[1], players[3]])],
					rounds: 2,
					roundIndex: 0,
					teamIndex: 0,
					spectrum: { id: 1, a: 'Kalt', b: 'Heiß' },
					target: 90,
					dial: 90,
					phase: 'guess',
					lastScore: null
				}
			})
		);
	}, crew);
}

// Home, both start screens, both lobbies and both play screens
const screens = [
	'/',
	'/spiele/imposter',
	'/spiele/wavelength',
	'/spiele/imposter/lobby',
	'/spiele/wavelength/lobby',
	'/spiele/imposter/spielen',
	'/spiele/wavelength/spielen'
];

async function open(page: Page, path: string) {
	await page.goto(path);
	if (path.endsWith('/spielen')) await expect(page.getByRole('button', { name: 'Spiel beenden' })).toBeVisible();
	else if (path.endsWith('/lobby')) await expect(page.getByRole('button', { name: "Los geht's" })).toBeVisible();
	else await expect(page.locator('[data-deco]').first()).toBeAttached();
}

test('Scenario: Decoration on every main screen', async ({ page }) => {
	await seedRoster(page, crew);
	await seedPlay(page);
	const deco = (motif: string) => page.locator(`[data-deco][data-motif="${motif}"]`);

	await open(page, '/');
	await expect(deco('home')).toHaveCount(1);
	await expect(page.getByRole('link', { name: /Imposter/ }).locator(deco('masks'))).toHaveCount(1);
	await expect(page.getByRole('link', { name: /Wavelength/ }).locator(deco('dial'))).toHaveCount(1);
	const locked = page.locator('.tile.locked');
	await expect(locked).toHaveCount(1);
	for (const tile of await locked.all()) await expect(tile.locator(deco('corner'))).toHaveCount(1);

	await open(page, '/spiele/wavelength');
	const banner = page.locator('header').filter({ has: page.getByRole('heading', { level: 1 }) });
	await expect(banner.locator(deco('dial'))).toHaveCount(1);
	await expect(banner.locator(deco('dial')).getByText('Kalt', { exact: true })).toBeAttached();
	await expect(banner.locator(deco('dial')).getByText('Heiß', { exact: true })).toBeAttached();
	await open(page, '/spiele/imposter');
	await expect(banner.locator(deco('masks'))).toHaveCount(1);

	for (const slug of ['imposter', 'wavelength']) {
		await open(page, `/spiele/${slug}/lobby`);
		await expect(deco('crew'), slug).toHaveCount(1);
		await expect(deco('crew'), slug).toBeVisible();

		await open(page, `/spiele/${slug}/spielen`);
		const rings = deco('rings');
		await expect(rings, slug).toHaveCount(1);
		await expect(rings, slug).toBeVisible();
		// behind the game content: first in its wrapper, every sibling stacked above it
		const under = await rings.evaluate((el) => {
			const siblings = [...el.parentElement!.children].filter((c) => c !== el);
			const z = (e: Element) => Number(getComputedStyle(e).zIndex) || 0;
			return (
				el.parentElement!.firstElementChild === el &&
				siblings.length > 0 &&
				siblings.every((c) => getComputedStyle(c).position !== 'static' && z(c) > z(el))
			);
		});
		expect(under, slug).toBe(true);
	}
});

test('Scenario: Decoration is hidden and never takes pointer events', async ({ page }) => {
	await seedRoster(page, crew);
	await seedPlay(page);
	const problems: string[] = [];

	for (const path of screens) {
		await open(page, path);
		expect(await page.locator('[data-deco]').count(), path).toBeGreaterThan(0);
		problems.push(...(await decoAudit(page)).map((p) => `${path}: ${p}`));
		const missed = await page.evaluate(() =>
			[...document.querySelectorAll<HTMLElement>('a[href], button, input, select, textarea, [role="slider"]')]
				.filter((el) => el.checkVisibility())
				.flatMap((el) => {
					el.scrollIntoView({ block: 'center', inline: 'center' });
					const r = el.getBoundingClientRect();
					const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
					const ok = hit && (el.contains(hit) || (el as HTMLInputElement).labels?.[0]?.contains(hit));
					return ok ? [] : [`${el.getAttribute('aria-label') || el.textContent?.trim() || el.tagName} → ${hit?.tagName}.${hit?.className}`];
				})
		);
		problems.push(...missed.map((m) => `${path}: ${m}`));
	}
	expect(problems).toEqual([]);
});

// infinite animations on decoration, with the properties their keyframes touch
const decoMotion = (page: Page) =>
	page.evaluate(() =>
		document
			.getAnimations()
			.filter((a) => {
				const target = (a.effect as KeyframeEffect | null)?.target;
				return a.effect?.getTiming().iterations === Infinity && target?.closest('[data-deco]');
			})
			.map((a) => ({
				running: a.playState === 'running',
				props: [
					...new Set(
						(a.effect as KeyframeEffect)
							.getKeyframes()
							.flatMap((k) => Object.keys(k))
							.filter((k) => !['offset', 'computedOffset', 'easing', 'composite'].includes(k))
					)
				]
			}))
	);

test('Scenario: Ambient motion runs during play', async ({ page }) => {
	await seedRoster(page, crew);
	await seedPlay(page);

	for (const path of ['/', '/spiele/wavelength/spielen']) {
		await open(page, path);
		const motion = await decoMotion(page);
		expect(motion.filter((m) => m.running).length, path).toBeGreaterThan(0);
		expect(await ambient(page), path).toBeGreaterThan(0);
		for (const m of motion) expect(m.props.every((p) => p === 'transform' || p === 'opacity'), `${path}: ${m.props}`).toBe(true);
	}
});

test.describe('reduced motion', () => {
	test.use({ reducedMotion: 'reduce' });

	test('Scenario: Reduced motion turns ambient motion off', async ({ page }) => {
		await seedRoster(page, crew);
		await seedPlay(page);

		for (const path of ['/', '/spiele/wavelength', '/spiele/wavelength/spielen']) {
			await open(page, path);
			expect(await page.locator('[data-deco]').count(), path).toBeGreaterThan(0);
			expect(await decoMotion(page), path).toEqual([]);
			expect(await ambient(page), path).toBe(0);
		}
	});
});

test('Scenario: Family Feud tile carries its own badge', async ({ page }) => {
	await page.goto('/');
	const badge = (name: string) => page.getByRole('link', { name: new RegExp(name) }).locator('.badge svg');
	const markup = async (name: string) => (await badge(name).innerHTML()).replace(/<!--.*?-->/g, '');
	const fallback = '<rect x="3" y="7" width="18" height="11" rx="3">';

	await expect(badge('Family Feud')).toHaveCount(1);
	const feud = await markup('Family Feud');
	expect(feud).not.toContain(fallback);
	for (const other of ['Imposter', 'Wavelength', 'Codes', 'What Rhymes with Duck', 'Most Likely To'])
		expect(feud, other).not.toBe(await markup(other));
});

test('Scenario: Family Feud art on tile and start screen', async ({ page }) => {
	const art = (scope: ReturnType<typeof page.locator>) => scope.locator('[data-deco][data-motif="feud"]');
	// the shapes' paint, compared with what --c resolves to
	const drawn = (loc: ReturnType<typeof page.locator>) =>
		loc.evaluate((root) => {
			const probe = document.createElement('span');
			probe.style.color = 'var(--feud)';
			document.body.append(probe);
			const colour = getComputedStyle(probe).color;
			probe.remove();
			const shapes = [...root.querySelectorAll('svg *')].filter((el) => 'getBBox' in el);
			return { shapes: shapes.length, coloured: shapes.some((el) => getComputedStyle(el).fill === colour) };
		});

	await page.goto('/');
	const tile = art(page.getByRole('link', { name: /Family Feud/ }));
	await expect(tile).toHaveCount(1);
	expect((await drawn(tile)).shapes).toBeGreaterThan(0);
	expect((await drawn(tile)).coloured).toBe(true);
	expect(await decoAudit(page)).toEqual([]);

	await page.goto('/spiele/family-feud');
	const banner = art(page.locator('header').filter({ has: page.getByRole('heading', { level: 1 }) }));
	await expect(banner).toHaveCount(1);
	expect((await drawn(banner)).shapes).toBeGreaterThan(0);
	expect((await drawn(banner)).coloured).toBe(true);
	expect(await decoAudit(page)).toEqual([]);
});
