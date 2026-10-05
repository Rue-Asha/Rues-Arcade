Before Build: the orchestrator runs `git branch main 400c1ee` (root commit of `flow/party-games-rebuild`), so
`main` exists as the base and an ancestor of the feature branch (design.md → Git root commit).

Every behaviour task writes its scenario tests first, named "Scenario: <title>" as in the specs, from the THEN
clauses. UI work cites the Mobbin refs from scope.md and follows `design/look-A1-P2-arcade-abend.dc.html`.

## 1. Establish the harness

> unit: depends=none · scope=S1 · files=package.json, package-lock.json, svelte.config.js, vite.config.ts, tsconfig.json, playwright.config.ts, .gitignore, src/app.html, src/app.d.ts, src/routes/+page.svelte, src/lib/engine/rng.ts, src/lib/engine/rng.test.ts, e2e/smoke.test.ts, CLAUDE.md, README.md

- [x] 1.1 Scaffold a minimal SvelteKit + TypeScript app (adapter-node, npm), `engines.node >=22.5`, `"name": "rues-arcade"`, version `0.1.0`; `.gitignore` covers `node_modules`, `build`, `dist`, `.e2e/`, `test-results/`, `*.db`
- [x] 1.2 `npm i -D vitest @playwright/test`, `npx playwright install chromium`; scripts `test:unit` (vitest `--reporter=verbose`), `test:e2e` (playwright `--reporter=list`), `proof`, `proof:full` per repo-setup.md
- [x] 1.3 `playwright.config.ts`: projects `phone` (390×844, touch) and `desktop` (1280×800); webServer `node build` on `$PORT` (default 4173) with `DATABASE_PATH=.e2e/$PORT.db`, file removed before start
- [x] 1.4 `src/lib/engine/rng.ts` (seeded, pure: `next`, `int`, `pick`, `shuffle` returning `[value, Rng]`) with a unit test proving same seed → same sequence; `e2e/smoke.test.ts` loads `/`
- [x] 1.5 `CLAUDE.md` with `## Harness` (proof, proof-full, run `npm run dev` → http://localhost:5173, `ship: merge`); README setup section; run `proof:full` green, and once with a deliberately failing test to see it exit non-zero (Scenario: Proof prints test names and passes · Proof fails on a failing check · Proof-full runs e2e on an isolated database)

## 2. Contracts

> unit: depends=1 · scope=none · files=package.json, src/lib/engine/types.ts, src/lib/content/types.ts, src/lib/content/parse.ts, src/lib/games/registry.ts, src/lib/games/imposter/index.ts, src/lib/games/imposter/engine.ts, src/lib/games/imposter/demo.ts, src/lib/games/imposter/Screen.svelte, src/lib/games/imposter/Setup.svelte, src/lib/games/wavelength/index.ts, src/lib/games/wavelength/engine.ts, src/lib/games/wavelength/demo.ts, src/lib/games/wavelength/Screen.svelte, src/lib/games/wavelength/Setup.svelte, src/lib/demo/context.ts, src/lib/session.ts, src/lib/roster.svelte.ts, src/lib/storage.ts, src/lib/sound.ts, src/lib/ui/*.svelte, src/lib/motion.ts, migrations/0001_content.sql, scripts/import.mjs, scripts/package.mjs

- [x] 2.1 Types from design.md ## Contracts: `engine/types.ts`, `content/types.ts`, registry with `games`, `comingSoon`, `playerRange`, `ScreenProps`, `SetupProps`
- [x] 2.2 Per-game stubs: `index.ts` wiring `engine.ts` (GameDef with real limits: Imposter 3–12, Wavelength 4–18 from 2–6 teams × 2–3, `minContent` 1), `demo.ts`, `Screen.svelte`, `Setup.svelte` — all typecheck, no behaviour
- [x] 2.3 Stubs with final signatures: `demo/context.ts`, `session.ts`, `roster.svelte.ts`, `storage.ts`, `sound.ts`, `motion.ts`, and every `src/lib/ui/` component with the props listed in design.md
- [x] 2.4 `migrations/0001_content.sql` (schema in design.md); `scripts/import.mjs` and `scripts/package.mjs` stubs; package.json scripts `import` (`node scripts/import.mjs`) and `package` (`npm run build && node scripts/package.mjs`); `proof` green

## 3. Server runtime and content store

> unit: depends=2 · scope=S7,S1b · files=src/lib/server/db.ts, src/lib/server/db.test.ts, src/lib/server/content.ts, src/lib/server/content.test.ts, src/lib/content/parse.ts, src/lib/content/parse.test.ts, src/hooks.server.ts, src/routes/healthz/+server.ts, src/routes/healthz/healthz.test.ts, src/routes/api/content/[type]/+server.ts, src/routes/api/content/[type]/[id]/+server.ts, src/routes/api/content/[type]/import/+server.ts, e2e/healthz.test.ts

- [x] 3.1 `db.ts`: open `DATABASE_PATH` with node:sqlite, create its directory, forward-only `migrate()` recording `schema_migrations`, throw naming the failing migration (Scenario: Missing database directory is created · Fresh database runs with empty tables · Migration failure refuses to start · Migrations are applied once)
- [x] 3.2 `hooks.server.ts` `init` migrates on start so a failure stops the server; confirm adapter-node honours `PORT`, `HOST`, `PROTOCOL_HEADER`
- [x] 3.3 `GET /healthz` 200 on `SELECT 1`, 503 otherwise (Scenario: Healthy server · Unhealthy database)
- [x] 3.4 `parse.ts` + `content.ts`: list/add/update/delete/bulk import with duplicate counting, line-numbered errors and `MAX_TEXT` (Scenario: Bulk import reports skipped and malformed lines · Overlong text rejected)
- [x] 3.5 Content API routes per design.md, validating `type` against `ContentType`

## 4. Design system, motion and sound

> unit: depends=2 · scope=S2,S3,S17 · files=src/app.css, src/app.html, src/routes/+layout.svelte, src/lib/ui/*.svelte, src/lib/ui/tokens.ts, src/lib/ui/tokens.test.ts, src/lib/motion.ts, src/lib/sound.ts, src/lib/sound.test.ts, static/fonts/*

- [x] 4.1 Tokens from the Arcade-Abend artboard in `app.css` (+ `tokens.ts` for tests), self-hosted Sora and Press Start 2P, dark only, `lang="de"`; layout shell with one alignment rule for phone 390px and desktop ≥1280px (Scenario: Text contrast meets 4.5:1)
- [x] 4.2 Components: Button (ledge + press sink, ≥44px), GameTile (game colour on badge, ledge, 3px top edge, 9% tint; `locked` greyed), Card, Scoreboard (leader row coloured, Press Start 2P scores), Lives, Modal, HoldToView, CoachTip, Stage
- [x] 4.3 Demo gating in Button and HoldToView via `getDemo()`: non-expected `action` disabled, expected highlighted, HoldToView open with [Demo] tag
- [x] 4.4 `motion.ts`: stage/phase transitions, press feedback, `countUp`, reveal pulse on transform/opacity, all instant under `prefers-reduced-motion`, never capturing pointer events
- [x] 4.5 `sound.ts`: WebAudio synth for press/reveal/correct/wrong/win, AudioContext created on first pointerdown, silent without WebAudio, mute toggle in layout header persisted as `arcade:muted` (Scenario: Mute is remembered · No sound before first interaction · WebAudio unavailable stays silent)

## 5. Game engines and demo scripts

> unit: depends=2 · scope=S11,S12,S14,S15,S6 · files=src/lib/games/imposter/engine.ts, src/lib/games/imposter/engine.test.ts, src/lib/games/imposter/demo.ts, src/lib/games/wavelength/engine.ts, src/lib/games/wavelength/engine.test.ts, src/lib/games/wavelength/demo.ts

- [x] 5.1 Imposter reducer ported from archive `imposter.ts` + page phase machine: draw without repeats then reshuffle, imposter pick, `{NAME}`/`{NAME2}` bindings, reveal → handover → crew → unmask → next round, skip (Scenario: Skip redraws and restarts the reveal · Name placeholders filled with distinct names · No repeats until the pool is exhausted · Pool of one pair repeats)
- [x] 5.2 Wavelength reducer ported from archive `wavelength.ts` + page: teams, rounds 1–5 (default 3), spectrum + target from RNG, redraw, dial, lock-in 4/3/2/0, psychic rotation, winner/tie (Scenario: Scoring bands · Target at the extremes scores correctly · Psychic rotates within the team · Tie for first shown as tie · Redraw changes spectrum and target)
- [x] 5.3 Engine-contract tests for both games (Scenario: Same seed and actions give the same state · Reducer does not mutate its input)
- [x] 5.4 Demo fixtures + scripts with Alex, Bo, Cleo, Dani and German coach tips: Imposter one full round; Wavelength 2 teams × 1 turn (Scenario: Imposter demo script plays to the end · Wavelength demo script plays to the end)

## 6. App shell: roster, sessions, catalogue, start and lobby

> unit: depends=3,4 · scope=S4,S5,S6,S10 · files=src/lib/storage.ts, src/lib/roster.svelte.ts, src/lib/roster.test.ts, src/lib/session.ts, src/lib/session.test.ts, src/lib/games/registry.ts, src/lib/games/registry.test.ts, src/routes/+page.svelte, src/routes/spieler/+page.svelte, src/routes/spiele/[slug]/+page.svelte, src/routes/spiele/[slug]/+page.server.ts, src/routes/spiele/[slug]/lobby/+page.svelte, src/routes/spiele/[slug]/spielen/+page.svelte, src/routes/spiele/[slug]/spielen/+page.server.ts, e2e/helpers.ts, e2e/home.test.ts, e2e/roster.test.ts, e2e/start.test.ts

- [x] 6.1 `storage.ts` with memory fallback; roster store (Scenario: Rename and remove a player · Empty or whitespace name rejected · Duplicate name rejected · Storage unavailable works for the session)
- [x] 6.2 Session store (Scenario: Old or corrupt saved state discarded · Two tabs last write wins · Roster edit mid-game keeps the session snapshot)
- [x] 6.3 Home: registry tiles + locked "Bald verfügbar" tiles (Scenario: Tiles for registered games · Player range derived from engine limits · Bald tiles have no actions)
- [x] 6.4 Spieler screen: add, rename, remove, reorder, empty-state prompt (Scenario: Roster survives reload · First run shows empty roster prompt)
- [x] 6.5 Start screen (rules summary, Demo, Erklärung, Inhalte links, start gated on players and `minContent`), lobby (player pick above max, then the game's `Setup`), play route (header with Demo + "Spiel beenden", session save on every dispatch, restore on load, discarded-state notice); `e2e/helpers.ts` seeds roster and content (Scenario: Below minimum disables start · Above maximum asks who plays · Empty pool blocks start)

## 7. Importer

> unit: depends=3 · scope=S9 · files=scripts/import.mjs, scripts/import.test.ts, scripts/fixtures/old-schema.sql, README.md

- [x] 7.1 `npm run import -- <old-db> --into <new.db>`: open source read-only, migrate target, copy `imposter_prompts` → `imposter_pairs` and `wavelength_prompts` → `wavelength_spectra` with `INSERT OR IGNORE`, print counts per table (Scenario: Import prints counts · Re-running the import adds no duplicates · Name placeholders preserved)
- [x] 7.2 Errors: missing table named, other imported, exit 1; source missing or not SQLite → clear error, exit 1, no target created (Scenario: Missing table is named, the other still imported · Source missing or not SQLite)
- [x] 7.3 README "Content import": run against `00_Archive/Party-Games-content-backup-2026-10-05/dev.db`, copy the result to the host data dir

## 8. Release pipeline

> unit: depends=3 · scope=S1b · files=scripts/package.mjs, scripts/package.test.ts, .github/workflows/ci.yml, .github/workflows/release.yml, .github/dependabot.yml, playwright.config.ts, CLAUDE.md

- [x] 8.1 `scripts/package.mjs` modelled on Life-Manager: `dist/rues-arcade-<version>.tgz` (build, migrations, production package.json, lockfile) + `.sha256` (Scenario: Package produces a verifiable tarball)
- [x] 8.2 `playwright.config.ts`: when `E2E_APP_DIR` is set, serve `node $E2E_APP_DIR/build` instead of `node build`
- [x] 8.3 `ci.yml` and `release.yml` copied from Life-Manager with its SHA pins, service name `rues-arcade`, security-baseline `@aab9824cdb27d4d86203a5d7b4785d95f8549cbc # v1.0.0`; `dependabot.yml` for github-actions + npm weekly (Scenario: CI is green on the change's PR · Tag does not match the version — proven at Ship / on GitHub)
- [x] 8.4 `CLAUDE.md` `## Harness`: add `package` line (Scenario: Harness declared with merge policy)

## 9. Imposter UI

> unit: depends=5,6 · scope=S11,S17,S6 · files=src/lib/games/imposter/Screen.svelte, src/lib/games/imposter/Setup.svelte, e2e/imposter.test.ts

- [x] 9.1 Setup (no settings beyond players) and Screen per phase: HoldToView reveal, "Gib das Handy an <Name>", crew question, unmask with reveal animation, next round, skip; every control tagged with its `action`; SFX on press/reveal (Scenario: Full Imposter round · Hand-over between players · Hold-to-view reveals only while held)
- [x] 9.2 Resume and end in Imposter (Scenario: Reload mid-game resumes the same phase · Spiel beenden clears the session)

## 10. Wavelength UI

> unit: depends=5,6 · scope=S12,S17,S3 · files=src/lib/games/wavelength/Screen.svelte, src/lib/games/wavelength/Setup.svelte, src/lib/games/wavelength/Dial.svelte, e2e/wavelength.test.ts

- [x] 10.1 Setup: team formation from the picked players (2–6 teams of 2–3), rounds 1–5 default 3
- [x] 10.2 Dial: pointer drag (mouse + touch) and arrow keys, 0°–180°, bands drawn on result (Scenario: Dial by keyboard · Dial by drag)
- [x] 10.3 Screen: psychic hold-to-view, redraw, dial, lock-in, result with count-up, scoreboard, game over with winner/tie, SFX correct/wrong/win; controls tagged with `action` (Scenario: Full Wavelength game)

## 11. Content editor and explanation viewer

> unit: depends=3,6 · scope=S8,S16 · files=src/routes/spiele/[slug]/inhalte/+page.svelte, src/routes/spiele/[slug]/inhalte/+page.server.ts, src/routes/spiele/[slug]/erklaerung/+page.svelte, static/explain/README.md, e2e/content.test.ts, e2e/explain.test.ts, e2e/fixtures/explain/index.html, e2e/fixtures/explain/pixel.png

- [x] 11.1 Inhalte: list, add, edit, delete with Modal confirmation, bulk import textarea showing the ImportReport (Scenario: Add, edit and delete an entry · Delete asks for confirmation)
- [x] 11.2 Erklärung: `HEAD /explain/<slug>/index.html`, fullscreen iframe `sandbox="allow-scripts"`, close button + Esc, empty-state text (Scenario: No explanation shows empty state · Committed explanation is shown sandboxed · Close by button or Esc)
- [x] 11.3 `static/explain/README.md`: self-contained HTML, assets next to index.html, no CDN

## 12. Guided demo

> unit: depends=9,10 · scope=S13,S14,S15,S10 · files=src/lib/demo/context.ts, src/lib/demo/runner.ts, src/lib/demo/runner.test.ts, src/routes/spiele/[slug]/demo/+page.svelte, e2e/demo.test.ts

- [x] 12.1 `runner.ts`: in-memory state from `DemoScript` through `def.reduce`, current step, expected action, `next()` dispatching the scripted action, end state
- [x] 12.2 Demo route: game Screen inside demo context, CoachTip "Schritt n/N", "Demo beenden" back to `?from=`, "Demo beendet" at the end; no session, roster or content API calls
- [x] 12.3 e2e (Scenario: Imposter demo by tapping highlighted controls · Wavelength demo by tapping highlighted controls · Only the expected control is enabled · Hidden information shown with Demo tag · Demo leaves real data untouched · Exiting returns to the starting screen · Reload during demo returns to start screen · Demo steppable with reduced motion · Demo works with an empty database)

## 13. Look and motion pass

> unit: depends=9,10,11 · scope=S2,S3 · files=e2e/look.test.ts, README.md

- [x] 13.1 e2e over Home, Spieler, start screen, lobby, each game phase, Inhalte, Erklärung in both projects, writing screenshots to `test-results/shots/` (Scenario: Touch targets are at least 44px · No horizontal scroll on phone · Desktop uses the width)
- [x] 13.2 e2e (Scenario: Reduced motion makes transitions instant · Motion never blocks input); fixes go into the component, not the test
- [x] 13.3 README "Release": `npm run package`, tag `v<version>`, release workflow, deploy is the later Homelab change
- [x] 13.4 Gate 2 material: screenshot list for Rue (Scenario: Look approved on screenshots · Effects sound right)

## 15. Contracts for the Gate 2 additions

Added at the Gate 2 reopen (S18–S21). Shapes in design.md ## Contracts; later units fill them in and stop and
report if they need a change. e2e in parallel units: exact-text locators, per-test roster/content with
test-unique text, `emptyServer` wherever a count or an empty table is asserted.

> unit: depends=13 · scope=none · files=src/lib/games/registry.ts, src/lib/games/imposter/index.ts, src/lib/games/wavelength/index.ts, src/lib/games/wavelength/engine.ts, src/lib/deco/motifs.ts, src/lib/deco/Art.svelte, src/lib/deco/Banner.svelte, e2e/helpers.ts

- [x] 15.1 `GameEntry.pitch` in the registry; set both pitches in the games' `index.ts` (texts in design.md)
- [x] 15.2 Wavelength engine types without behaviour change: `WavelengthMode`, optional `config.mode`, optional state `mode`/`turn`, `MIN_KOOP_PLAYERS`, `MIN_VERSUS_PLAYERS`, `RATING_TIERS`, `modeOf`, `koopResult` stub; Versus states must not gain keys (session compatibility)
- [x] 15.3 `src/lib/deco/motifs.ts` (`Place`, `Motif`, `motifFor` stub), `Art.svelte` rendering the empty aria-hidden `data-deco` root, `Banner.svelte` rendering its children — final props, typecheck only
- [x] 15.4 `e2e/helpers.ts`: `ambient(page)` and `decoAudit(page)`; `proof` green

## 16. Wavelength Koop engine

> unit: depends=15 · scope=S21 · files=src/lib/games/wavelength/engine.ts, src/lib/games/wavelength/engine.test.ts, src/lib/games/registry.test.ts, e2e/home.test.ts

- [x] 16.1 Koop init/next/again/lockIn per design.md, `psychic` by mode (Scenario: Koop psychic order · Koop keeps one shared score · Koop play again keeps players and mode)
- [x] 16.2 `koopResult` and `RATING_TIERS` (Scenario: Koop rating tiers · Koop average per turn)
- [x] 16.3 Limits 2–18; update the Wavelength range in `e2e/home.test.ts` "Scenario: Tiles for registered games" to "2–18 Spieler" (Scenario: Wavelength player range reads 2–18)
- [x] 16.4 Compatibility: a literal pre-S21 version-1 state in storage loads through `loadGameSession` and scores as Versus; the demo stays Versus (Scenario: Saved Versus session from before resumes · Wavelength demo stays the Versus demo)

## 17. Decoration components

> unit: depends=15 · scope=S18 · files=src/lib/deco/motifs.ts, src/lib/deco/motifs.test.ts, src/lib/deco/*.svelte

- [x] 17.1 `motifFor` mapping with neutral fallback (Scenario: Game without its own art gets the neutral fallback)
- [x] 17.2 Motif SVGs after `design/deco-1-spielbrett.html` and the PNGs: home composite (board grid, dial with bands, tilted mask card, dashed locks), masks (odd one lifts), dial (rings; start variant labelled "Kalt"/"Heiß"), crew, rings, corner, neutral — `currentColor` and existing tokens, no images or fonts, no Press Start 2P; any text inside art meets 4.5:1 as the look test measures it (set `color` to the fill)
- [x] 17.3 `Art` and `Banner` per design.md: aria-hidden, `pointer-events: none`, Banner art right on desktop, faded top-right on phone, no horizontal overflow at 390px
- [x] 17.4 Ambient motion: needle sweep ~7 s and mask lift as infinite CSS keyframes on transform/opacity inside `@media (prefers-reduced-motion: no-preference)`

## 18. Wavelength Koop UI

> unit: depends=16 · scope=S21,S20 · files=src/lib/games/wavelength/Setup.svelte, src/lib/games/wavelength/Screen.svelte, src/lib/games/wavelength/demo.ts, src/lib/games/wavelength/demo.test.ts, e2e/wavelength.test.ts

- [x] 18.1 Setup: "Spielmodus" switch Koop | Versus, Versus disabled below 4 with "Versus braucht mind. 4 Spieler.", defaults per design.md, Koop player order + rounds, start button unchanged "Los geht's"; lobby reached by URL with a seeded roster (Scenario: Four or more players default to Versus · Two or three players get Koop only)
- [x] 18.2 Screen in Koop: turn label "Runde r / R · Zug t / n", shared score aside with the player order, game over with tier, total, "Ø … Punkte pro Zug · … Züge", "Nochmal spielen"; Versus rendering unchanged (Scenario: Full Wavelength Koop game · Koop session resumes after reload)
- [x] 18.3 Neutral verdicts in `Screen.svelte` and the demo tip in `demo.ts` per design.md; update the old verdict assertions in `e2e/wavelength.test.ts` "Scenario: Full Wavelength game" ("Volltreffer!" → "Genau getroffen.", "Daneben" → "Kein Punkt.", exact text) without dropping them (Scenario: Turn verdicts read neutral · Wavelength demo tips read neutral)
- [x] 18.4 Re-run the existing Wavelength e2e unchanged in Versus ("Scenario: Full Wavelength game", "Scenario: Tie for first shown as tie", dial scenarios) — fixes go into the components, not the tests

## 19. Decorated screens and start screen layout

> unit: depends=15,16,17 · scope=S18,S19,S20,S21 · files=src/routes/+page.svelte, src/lib/ui/GameTile.svelte, src/routes/spiele/[slug]/+page.svelte, src/routes/spiele/[slug]/lobby/+page.svelte, src/routes/spiele/[slug]/spielen/+page.svelte, src/routes/spiele/[slug]/demo/+page.svelte, e2e/deco.test.ts, e2e/start.test.ts, e2e/imposter.test.ts, e2e/explain.test.ts, e2e/demo.test.ts, e2e/look.test.ts

- [x] 19.1 Home: Banner place=home (keep "Was spielen wir heute?" and the sr-only h1, no kicker), GameTile with tile art and `entry.pitch`, Bald tiles with the dashed corner (Scenario: Each tile shows a one-line pitch)
- [x] 19.2 Start screen per design.md: Banner with h1, badge, range, pitch; panel / "So geht's" / "Mehr zu <Spiel>" order and desktop columns; cards as links with their lines and the real count; "Los geht's"; Wavelength rules text for both modes (Scenario: So geht's covers both Wavelength modes · Start banner carries title, badge and player range · Start panel first on phone, right column on desktop · Mehr-zu cards keep their targets · Inhalte card shows the real content count · Los geht's opens the lobby · One player cannot start Wavelength)
- [x] 19.3 R7: update locators in `start.test.ts`, `imposter.test.ts`, `explain.test.ts`, `demo.test.ts` and the walk in `look.test.ts` to "Los geht's" and the card links (`getByRole('link', { name, exact: true })`), every assertion kept; scenario wording updated in the roster/content-store specs already
- [x] 19.4 Lobby Banner place=lobby (Lobby, name, "<n> Spieler", crew art); play and demo routes with `<Art slug place="play">` behind the Stage (Scenario: Decoration on every main screen · Decoration is hidden and never takes pointer events)
- [x] 19.5 Motion (Scenario: Ambient motion runs during play · Reduced motion turns ambient motion off); confirm "Scenario: Reduced motion makes transitions instant" and "Scenario: Motion never blocks input" still pass unchanged

## 20. Look pass for the additions

> unit: depends=18,19 · scope=S18,S20 · files=e2e/look.test.ts

- [x] 20.1 Extend the walk: Wavelength Koop with 2 players (lobby, prep, result, game over) after the Versus game; refreshed and new shot names: `look-home`, `look-start-imposter`, `look-start-wavelength`, `look-lobby-imposter`, `look-lobby-wavelength`, `look-lobby-wavelength-short`, `look-lobby-pick`, every `look-imposter-*` and `look-wavelength-*`, new `look-lobby-wavelength-koop`, `look-wavelength-koop-prep`, `look-wavelength-koop-result`, `look-wavelength-koop-gameover`; touch-target, contrast, no-h-scroll and desktop-width scenarios green over the decorated walk (Scenario: Contrast and layout rules hold with decoration)
- [x] 20.2 Over the walk (Scenario: Press Start 2P stays limited to logo and scores · Decoration loads no external assets · New copy has no exclamation marks)
- [ ] 20.3 Gate 2 material: shot list for the decorated screens and Koop, manual checks (Scenario: Decorated screens approved on screenshots · New copy reads neutral and grown-up · Desktop uses the width)

## 21. Ship-time steps (shipper, after Gate 2, with consent — not a build unit)

- [ ] 21.1 ⚠ irreversible: create public GitHub repo `Rue-Asha/Rues-Arcade`, push `main` (root `400c1ee`) then `flow/party-games-rebuild`, open the PR; CI green on the PR (Scenario: CI is green on the change's PR)
- [ ] 21.2 ⚠ irreversible: `main` ruleset from Life-Manager's (required checks `ci`, `security-baseline / workflow-lint`, `security-baseline / secret-scan`, `security-baseline / dependency-review`; block deletion and non-fast-forward)
