# Rue's Arcade

Party games for one shared device. SvelteKit 3 + Vite + TypeScript, adapter-node, npm.
Kit config lives in `vite.config.ts` (`sveltekit({ ... })`); Kit 3 refuses a `svelte.config.js`.

## Harness
- proof: `npm run proof`
- proof-full: `npm run proof:full`
- run: `npm run dev` → http://localhost:5173
- ship: merge

`proof` = svelte-check, build, vitest. `proof:full` adds Playwright (projects `phone` 390×844 touch,
`desktop` 1280×800) against `node build` on `$PORT` (default 4173) with `DATABASE_PATH=.e2e/$PORT.db`,
removed before each run. Unit tests live next to the code as `src/**/*.test.ts`; e2e in `e2e/`.
