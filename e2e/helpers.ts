import { expect, type APIRequestContext, type Locator, type Page, type TestInfo } from '@playwright/test';
import { spawn } from 'node:child_process';
import { rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { playerId, type SavedPlayer } from '../src/lib/players.ts';
import type { ContentItem, ContentType, PairPlayed, Survey } from '../src/lib/content/types.ts';

export async function seedRoster(page: Page, names: string[]) {
	if (page.url() === 'about:blank') await page.goto('/');
	const players = names.map((name, i) => ({ id: `p${i + 1}`, name }));
	await page.evaluate((list) => localStorage.setItem('arcade:roster', JSON.stringify(list)), players);
	return players;
}

export async function seedContent(
	request: APIRequestContext,
	type: ContentType,
	rows: [string, string][] | string[]
) {
	const lines = rows.map((row) => (typeof row === 'string' ? row : `${row[0]} | ${row[1]}`));
	const res = await request.post(`/api/content/${type}/import`, { data: { text: lines.join('\n') } });
	expect(res.ok()).toBe(true);
}

// Kit's CSRF check rejects form-less writes without an origin header, so every players write goes through here
export function playerCall(
	request: APIRequestContext,
	origin: string,
	method: 'POST' | 'PATCH' | 'DELETE',
	path: string,
	name?: string
) {
	return request.fetch(`${origin}/api/players${path}`, {
		method,
		headers: { origin },
		data: name === undefined ? undefined : { name }
	});
}

export async function seedPlayers(request: APIRequestContext, origin: string, names: string[]) {
	const saved: SavedPlayer[] = [];
	for (const name of names) {
		const res = await playerCall(request, origin, 'POST', '', name);
		expect(res.status()).toBe(201);
		saved.push(await res.json());
	}
	return saved;
}

// Kit's CSRF check rejects writes without an origin header, so every content and played-with write sends one
export function writeHeaders(origin: string): { origin: string } {
	return { origin };
}

const sharedOrigin = () => `http://localhost:${process.env.PORT ?? 4173}`;

// saved players first, as player-<id> entries, then guests with guest ids; no test relies on name linking
export async function seedSavedRoster(page: Page, saved: SavedPlayer[], guests: string[] = []) {
	const players = [
		...saved.map((p) => ({ id: playerId(p.id), name: p.name })),
		...guests.map((name, i) => ({ id: `p${i + 1}`, name }))
	];
	await page.evaluate((list) => localStorage.setItem('arcade:roster', JSON.stringify(list)), players);
}

export async function surveyByQuestion(
	request: APIRequestContext,
	question: string,
	origin?: string
): Promise<Survey> {
	const res = await request.get(`${origin ?? ''}/api/content/feud_surveys`);
	expect(res.ok()).toBe(true);
	const found = ((await res.json()) as Survey[]).find((s) => s.question === question);
	expect(found, question).toBeDefined();
	return found!;
}

export async function surveyCard(page: Page, id: number): Promise<Locator> {
	const card = page.locator(`[data-survey="${id}"]`);
	const pager = page.getByRole('navigation', { name: 'Seiten', exact: true });
	if (await pager.count()) {
		const back = pager.getByRole('button', { name: 'Zurück', exact: true });
		while (await back.isEnabled()) await back.click();
		const next = pager.getByRole('button', { name: 'Weiter', exact: true });
		while ((await card.count()) === 0 && (await next.isEnabled())) await next.click();
	}
	await expect(card).toBeVisible();
	return card;
}

export async function chooseSurveys(page: Page, ids: number[]) {
	for (const id of ids)
		await (await surveyCard(page, id)).getByRole('button', { name: 'Wählen', exact: true }).click();
}

// every Feud round starts with the question covered and no team chosen
export async function openFaceoff(page: Page, team = 'Team A') {
	await page.getByRole('button', { name: 'Frage aufdecken', exact: true }).click();
	await page.getByRole('group', { name: 'Buzzer', exact: true }).getByRole('button', { name: team, exact: true }).click();
	await expect(page.getByRole('group', { name: 'Buzzer', exact: true })).toHaveCount(0);
}

export async function deleteSurvey(request: APIRequestContext, id: number, origin = sharedOrigin()) {
	const res = await request.delete(`${origin}/api/content/feud_surveys/${id}`, { headers: writeHeaders(origin) });
	expect(res.status()).toBe(204);
}

export async function seedPlayed(request: APIRequestContext, surveyId: number, playerIds: number[], origin = sharedOrigin()) {
	const res = await request.post(`${origin}/api/feud/played`, { headers: writeHeaders(origin), data: { surveyId, playerIds } });
	expect(res.status()).toBe(204);
}

export async function seedPairs(
	request: APIRequestContext,
	origin: string,
	pairs: { a: string; b: string; interchangeable?: boolean }[]
): Promise<ContentItem[]> {
	const saved: ContentItem[] = [];
	for (const data of pairs) {
		const res = await request.post(`${origin}/api/content/imposter_pairs`, { headers: writeHeaders(origin), data });
		expect(res.status()).toBe(201);
		saved.push(await res.json());
	}
	return saved;
}

export async function seedImposterPlayed(request: APIRequestContext, origin: string, pairId: number, playerIds: number[]) {
	const res = await request.post(`${origin}/api/imposter/played`, { headers: writeHeaders(origin), data: { pairId, playerIds } });
	expect(res.status()).toBe(204);
}

export async function imposterPlayed(request: APIRequestContext, origin: string): Promise<PairPlayed[]> {
	const res = await request.get(`${origin}/api/imposter/played`);
	expect(res.ok()).toBe(true);
	return res.json();
}

// The stage node the player sees; an outgoing one stays in the DOM for --dur-out after a phase change.
export function live(page: Page): Locator {
	return page.locator('[data-stage]:not([data-leaving])');
}

// Waits until no finite animation runs (stage out/in, reveals, winner pieces), no outgoing stage is left and no
// count-up is ticking. countUp is a requestAnimationFrame loop, not WAAPI, so the frame callbacks are counted.
export async function settled(page: Page) {
	await page.evaluate(async () => {
		const own = window.requestAnimationFrame;
		const drop = window.cancelAnimationFrame;
		const queued = new Set<number>();
		window.requestAnimationFrame = (cb) => {
			const id = own((t) => {
				queued.delete(id);
				cb(t);
			});
			queued.add(id);
			return id;
		};
		window.cancelAnimationFrame = (id) => {
			queued.delete(id);
			drop(id);
		};
		const frame = () => new Promise((ok) => own(ok));
		const finite = () =>
			document
				.getAnimations()
				.filter((a) => a.playState !== 'finished' && a.effect?.getTiming().iterations !== Infinity);
		// a loop that never ends must not hang the walk; the slowest finite motion is well under this
		const end = performance.now() + 5000;
		try {
			await frame();
			await frame();
			while (performance.now() < end) {
				const running = finite();
				if (!running.length && !queued.size && !document.querySelector('[data-leaving]')) break;
				await Promise.all(running.map((a) => a.finished.catch(() => {})));
				await frame();
			}
		} finally {
			window.requestAnimationFrame = own;
			window.cancelAnimationFrame = drop;
		}
	});
}

export async function shot(page: Page, info: TestInfo, slug: string) {
	await settled(page);
	const width = await page.evaluate(() => document.documentElement.scrollWidth);
	expect(width).toBeLessThanOrEqual(page.viewportSize()!.width);
	await page.screenshot({ path: `test-results/shots/${info.project.name}-${slug}.png`, fullPage: true });
}

// On the next frame after a phase change under reduced motion: one stage node and no finite animation running.
export async function expectInstant(page: Page) {
	const seen = await page.evaluate(
		() =>
			new Promise<{ stages: number; running: number }>((ok) =>
				requestAnimationFrame(() =>
					ok({
						stages: document.querySelectorAll('[data-stage]').length,
						running: document
							.getAnimations()
							.filter((a) => a.playState === 'running' && a.effect?.getTiming().iterations !== Infinity).length
					})
				)
			)
	);
	expect(seen).toEqual({ stages: 1, running: 0 });
}

// The design-system "In-game frame" for the screen on show: one stage card with one hero and the action row as
// its last part, the rail beside it from 1024px (top-aligned) and below it on a phone, the primary action inside
// the first viewport, the frame across 75% of the content width at 1280px, and text outside the hero left-aligned.
export async function expectFrame(page: Page) {
	await settled(page);
	const found = await page.evaluate(() => {
		const out: string[] = [];
		const root = document.querySelector('[data-stage]:not([data-leaving])');
		const frame = root?.querySelector<HTMLElement>('[data-frame=""]');
		if (!frame) return ['no [data-frame] in the live stage'];
		const stages = frame.querySelectorAll<HTMLElement>('[data-frame="stage"]');
		const rails = frame.querySelectorAll<HTMLElement>('[data-frame="rail"]');
		if (stages.length !== 1) out.push(`${stages.length} stage cards`);
		if (rails.length !== 1) out.push(`${rails.length} rails`);
		const stage = stages[0];
		const rail = rails[0];
		if (!stage) return out;
		const heroes = stage.querySelectorAll<HTMLElement>('[data-hero]');
		if (heroes.length !== 1) out.push(`${heroes.length} heroes`);
		const actions = stage.querySelector<HTMLElement>('[data-frame="actions"]');
		if (!actions) out.push('no action row');
		else if (stage.lastElementChild !== actions) out.push('action row is not the last part of the stage card');

		const box = (el: Element) => el.getBoundingClientRect();
		if (rail) {
			const [s, r] = [box(stage), box(rail)];
			if (innerWidth >= 1024) {
				if (r.left < s.right - 1) out.push('rail not beside the stage card');
				if (Math.abs(r.top - s.top) > 1) out.push(`rail top ${Math.round(r.top)} vs stage ${Math.round(s.top)}`);
			} else if (r.top < s.bottom - 1) out.push('rail not below the stage card');
		}

		const primary = actions?.querySelector<HTMLElement>('button, a[href]');
		if (primary) {
			const p = box(primary);
			const top = p.top + scrollY;
			if (top < 0 || top + p.height > innerHeight || p.left < 0 || p.right > innerWidth)
				out.push(`primary action "${primary.textContent?.trim()}" outside the first viewport`);
			const row = box(actions!);
			const pad = parseFloat(getComputedStyle(actions!).paddingLeft) || 0;
			if (Math.abs(p.left - row.left - pad) > 1) out.push('actions not left-aligned');
		}

		if (innerWidth >= 1280) {
			const used = box(frame).width / box(document.querySelector('main')!).width;
			if (used < 0.75) out.push(`frame spans ${Math.round(used * 100)}% of the content width`);
		}

		const walker = document.createTreeWalker(frame, NodeFilter.SHOW_TEXT);
		for (let node = walker.nextNode(); node; node = walker.nextNode()) {
			const el = node.parentElement!;
			if (!(node as Text).data.trim() || !el.checkVisibility()) continue;
			if (el.closest('[data-hero], button, a, svg, [role="slider"]')) continue;
			const align = getComputedStyle(el).textAlign;
			if (!/^(start|left|justify)$/.test(align))
				out.push(`"${(node as Text).data.trim().slice(0, 30)}" aligned ${align}`);
		}
		return out;
	});
	expect(found).toEqual([]);
}

// The shared e2e DB is never empty for long, so tests that need it empty run their own server on a DB file
// that doesn't exist yet.
export async function emptyServer(info: TestInfo, name: string, cwd = process.env.E2E_APP_DIR) {
	const db = resolve(`.e2e/empty-${name}-${info.project.name}-${process.pid}.db`);
	const server = spawn('node', [resolve(process.env.E2E_APP_DIR ?? '.', 'build')], {
		cwd,
		stdio: ['ignore', 'pipe', 'inherit'],
		env: { ...process.env, HOST: '127.0.0.1', PORT: '0', PROTOCOL_HEADER: 'x-forwarded-proto', DATABASE_PATH: db }
	});
	const origin = await new Promise<string>((ok, fail) => {
		server.stdout.on('data', (b) => {
			const m = /Listening on (http:\/\/\S+)/.exec(String(b));
			if (m) ok(m[1].replace(/\/$/, ''));
		});
		server.once('exit', (code) => fail(new Error(`server exited with ${code}`)));
	});
	return {
		origin,
		db,
		close() {
			server.kill();
			for (const f of [db, `${db}-wal`, `${db}-shm`]) rmSync(f, { force: true });
		}
	};
}

export function ambient(page: Page) {
	return page.evaluate(
		() =>
			document
				.getAnimations()
				.filter((a) => a.playState === 'running' && a.effect?.getTiming().iterations === Infinity).length
	);
}

export function bandIs(handoff: Locator, token: string) {
	return handoff.locator('.band').evaluate((el, t) => {
		const probe = document.createElement('i');
		probe.style.background = `var(--${t})`;
		document.body.append(probe);
		const want = getComputedStyle(probe).backgroundColor;
		probe.remove();
		return getComputedStyle(el).backgroundColor === want;
	}, token);
}

// pointer-events is inherited, so a child that sets it back would take taps through the decoration
export function decoAudit(page: Page) {
	return page.evaluate(() =>
		[...document.querySelectorAll<HTMLElement>('[data-deco]')].flatMap((root) => {
			const name = root.dataset.motif ?? 'deco';
			const found: string[] = [];
			if (root.getAttribute('aria-hidden') !== 'true') found.push(`${name}: not aria-hidden`);
			for (const el of [root, ...root.querySelectorAll('*')])
				if (getComputedStyle(el).pointerEvents !== 'none')
					found.push(`${name}: ${el.tagName.toLowerCase()} takes pointer events`);
			return found;
		})
	);
}
