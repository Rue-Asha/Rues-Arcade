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

## Specs
- Before changing catalogue, read openspec/specs/catalogue/spec.md.
- Before changing codes, read openspec/specs/codes/spec.md.
- Before changing content-store, read openspec/specs/content-store/spec.md.
- Before changing demo, read openspec/specs/demo/spec.md.
- Before changing design-system, read openspec/specs/design-system/spec.md.
- Before changing duck, read openspec/specs/duck/spec.md.
- Before changing feud, read openspec/specs/feud/spec.md.
- Before changing game-engine, read openspec/specs/game-engine/spec.md.
- Before changing harness, read openspec/specs/harness/spec.md.
- Before changing imposter, read openspec/specs/imposter/spec.md.
- Before changing most-likely, read openspec/specs/most-likely/spec.md.
- Before changing players, read openspec/specs/players/spec.md.
- Before changing release, read openspec/specs/release/spec.md.
- Before changing roster, read openspec/specs/roster/spec.md.
- Before changing sound, read openspec/specs/sound/spec.md.
- Before changing wavelength, read openspec/specs/wavelength/spec.md.

## Learnings
- **e2e on the shared DB** → exact-text locators (`getByText(x, { exact: true })`) and `emptyServer` from `e2e/helpers.ts` for empty-data scenarios; content-API writes (DELETE, import) against it need `headers: { origin: server.origin }` or Kit CSRF returns 403, and that belongs in `e2e/helpers.ts`, not per test file; compare only your own row, never whole lists (phone and desktop write the same DB in parallel), and UI tests that write saved players use `emptyServer` while shared-DB API writes use per-project names. (weil: hasText substring 'Mittag' matched 'Tag'; U2 and U3 each solved the 403 locally; layout sync links any guest whose name is saved, so a whole-list compare was flaky) [2026-10-06 · player-database]
- **e2e screenshots or geometry** → wait for animations and compare rounded boxes: `shot()` waits for `.rise`/WAAPI, geometry checks must wait for finite animations too, and after a count-up wait for the final number (`counted()` in look.test.ts) since countUp is not WAAPI. (weil: blank shots, 799.99px iframe, a column check 2px off mid-.rise, 3 of 4 score shots mid-count; phone feud-faceoff-double was still mid-.rise with varying brightness, so the wait doesn't fully cover that screen) [2026-10-05 · party-games-rebuild, family-feud]
- **`settle()` in look.test.ts** → expect an AbortError when a dialog opens over a hovered button (desktop), and wait for Stage's `.rise` to start before shooting. (weil: U3 and U4 each worked around it in their walks) [2026-10-05 · add-three-games]
- **Form grid columns** → `minmax(0,1fr)`. (weil: input intrinsic width widened the phone page to 462px) [2026-10-05 · party-games-rebuild]
- **Props named `state` in .svelte** → destructure as `state: game`. (weil: collides with the $state rune, svelte-check store_rune_conflict) [2026-10-05 · party-games-rebuild]
- **`proof:full` in a worktree** → make sure the unit port is free first. (weil: a leftover preview server held it) [2026-10-05 · party-games-rebuild]
- **Layout/load sync** → write to localStorage only on change, never call save() unconditionally. (weil: sync() wrote arcade:roster="[]" on first load and broke the demo "Exiting returns to the starting screen" snapshot test) [2026-10-06 · player-database]
- **Unique German text in SQLite** → keep the `COLLATE NOCASE` column and also fold in JS with `toLocaleLowerCase('de')`. (weil: NOCASE folds ASCII only, so umlauts like Ä/ä slipped past the uniqueness check) [2026-10-06 · family-feud]
- **Generic runner tests and the demo script** → a game needs a non-empty demo script, and its board controls must carry `data-demo=expected`. (weil: runner.test.ts failed on an empty script; U1 and U7 each hit it) [2026-10-06 · family-feud]
