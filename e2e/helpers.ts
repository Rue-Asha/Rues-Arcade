import { expect, type APIRequestContext, type Page, type TestInfo } from '@playwright/test';
import { spawn } from 'node:child_process';
import { rmSync } from 'node:fs';
import { resolve } from 'node:path';
import type { SavedPlayer } from '../src/lib/players.ts';
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

export async function shot(page: Page, info: TestInfo, slug: string) {
	await page.evaluate(() =>
		Promise.all(
			document
				.getAnimations()
				.filter((a) => a.effect?.getTiming().iterations !== Infinity)
				.map((a) => a.finished.catch(() => {}))
		)
	);
	const width = await page.evaluate(() => document.documentElement.scrollWidth);
	expect(width).toBeLessThanOrEqual(page.viewportSize()!.width);
	await page.screenshot({ path: `test-results/shots/${info.project.name}-${slug}.png`, fullPage: true });
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
