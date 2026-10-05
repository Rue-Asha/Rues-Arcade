# Rue's Arcade

Party games for one shared device. SvelteKit 3 + Vite + TypeScript, adapter-node, npm.
Kit config lives in `vite.config.ts` (`sveltekit({ ... })`); Kit 3 refuses a `svelte.config.js`.

## Harness
- proof: `npm run proof`
- proof-full: `npm run proof:full`
- run: `npm run dev` → http://localhost:5173
- package: `npm run package` → `dist/rues-arcade-<version>.tgz` + `.sha256` (build, migrations, package.json, lockfile)
- ship: merge

`proof` = svelte-check, build, vitest. `proof:full` adds Playwright (projects `phone` 390×844 touch,
`desktop` 1280×800) against `node build` on `$PORT` (default 4173) with `DATABASE_PATH=.e2e/$PORT.db`,
removed before each run. With `E2E_APP_DIR` set (CI: the unpacked tarball) it serves that dir's build instead.
The server runs behind a proxy: without `PROTOCOL_HEADER` (or `ORIGIN`) Kit's CSRF check rejects form posts
and DELETEs over plain http; e2e sends `x-forwarded-proto: http` for that reason. Unit tests live next to the
code as `src/**/*.test.ts` (plus `scripts/*.test.ts`); e2e in `e2e/`.
