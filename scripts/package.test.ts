import { execFileSync } from 'node:child_process';
import { cpSync, mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterAll, beforeAll, expect, test } from 'vitest';

const { version } = JSON.parse(readFileSync('package.json', 'utf8'));
const tarball = `rues-arcade-${version}.tgz`;
let dir: string;

// package.mjs wipes dist/ and runs npm ci, so it runs on a copy of the repo's inputs.
beforeAll(() => {
	dir = mkdtempSync(join(tmpdir(), 'rues-arcade-package-'));
	for (const p of ['build', 'migrations', 'package.json', 'package-lock.json'])
		cpSync(p, join(dir, p), { recursive: true });
	execFileSync('node', [resolve('scripts/package.mjs')], { cwd: dir, stdio: 'pipe' });
}, 120_000);

afterAll(() => {
	if (dir) rmSync(dir, { recursive: true, force: true });
});

test('Scenario: Package produces a verifiable tarball', () => {
	const dist = join(dir, 'dist');
	expect(readdirSync(dist).sort()).toEqual([tarball, `${tarball}.sha256`]);
	expect(execFileSync('sha256sum', ['-c', `${tarball}.sha256`], { cwd: dist, encoding: 'utf8' })).toBe(
		`${tarball}: OK\n`
	);

	const entries = execFileSync('tar', ['-tzf', join(dist, tarball)], { encoding: 'utf8' }).split('\n');
	const root = `rues-arcade-${version}`;
	expect(entries).toContain(`${root}/build/index.js`);
	expect(entries).toContain(`${root}/migrations/0001_content.sql`);
	expect(entries).toContain(`${root}/package.json`);
	expect(entries).toContain(`${root}/package-lock.json`);
});
