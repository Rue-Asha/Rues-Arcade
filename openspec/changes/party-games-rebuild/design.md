## Context

Rue's Arcade is a fresh repo replacing the archived Party-Games app (`00_Archive/Party-Games`, read-only
reference). The archive's games are 900–1150-line pages mixing UI, state and persistence, with four lobbies,
duplicated editors and server modules, two migration runners, JSON-text columns and no tests. This change
builds the foundation (harness, release pipeline, design system, roster, engine contract, content store, demo,
explanation) and ports Imposter and Wavelength onto it. Single device, no realtime, no server game state.

Archive references to port from: `src/lib/games/{imposter,wavelength,types}.ts` (pure rules),
`src/routes/games/{imposter,wavelength}/+page.svelte` (phase machines, German copy),
`migrations/0002_imposter_prompts.sql` and `0009_wavelength_prompts.sql` (old schema the importer reads).
Content backup: `00_Archive/Party-Games-content-backup-2026-10-05/` (`dev.db`, `seeds/*.sql`, `static/sounds/`).

## Goals / Non-Goals

**Goals:** everything in scope.md S1–S17, plus S18–S21 added at the Gate 2 reopen; small game modules (engine, demo script, screen, setup) on shared
infrastructure, so the five later games are additions, not rewrites.

**Non-Goals:** as in the proposal — no other games, no multi-device, no content in git, no old-save migration,
no Homelab deploy, no light mode / English / accounts / auto-judging, no explanation upload UI.

## Decisions

From scope.md (Gate 0), unchanged:
- Separate new repo, display name "Rue's Arcade", slug `Rues-Arcade` (dir `/home/Rue/Repos/Rues-Arcade`, GitHub
  `Rue-Asha/Rues-Arcade`, public, created at Ship with consent; service name `rues-arcade`). Old
  `Rue-Asha/Party-Games` stays as it is.
- Home shows locked "Bald" tiles for the later games; they are neutral/greyed, each later game gets its colour in its own change.
- Ship: same as Life-Manager → `ship: merge`. Release (tag) and deploy (Homelab version-bump PR) stay manual.
- Homelab side is a separate later change in Homelab-Managment.
- Content reaches the server once as a file: importer writes a new-schema DB, Rue copies it to the host data dir
  (README); afterwards content is edited in the app.
- Single device, no realtime, no server game state. One shared roster on the device.
- SQLite + in-app editors, structured schema, content never committed.
- Demo = guided, you tap, locked to the highlighted control, button on start screen + header.
- Explanation = self-contained committed HTML in a sandboxed iframe.
- Motion: lots. Sound: synth SFX everywhere with mute.
- Ported games keep their archive rules; only UI, structure and the new features change.
- Import source = local backup (server was never deployed).
- Stack: SvelteKit + Vite + TypeScript, npm, adapter-node, node:sqlite.
- Visual direction: **A1 design with palette P2 "Arcade-Abend"**; source of truth
  `design/look-A1-P2-arcade-abend.dc.html` (`design/look-A1-matt.dc.html` is the rejected palette, reference
  only). Sora (UI) + Press Start 2P (logo letter and scores only); neutral tiles, radii 10–14px, 5px bottom ledge
  the button sinks into; game colour on icon badge, ledge, a 3px top edge and a 9% tint; primary button and
  leader row fully coloured. Core: ground #111234, primary #6bd672, Imposter #eb616d, leader-gold #f4c34a,
  Wavelength #38ccc8. Motion: ease-out rise, staggered entry, count-up, reveal pulse; no candy-saturated large fills.
- Mobbin grounding (cite in UI work): Linear, Xbox, Discord, Spotify, Box Box Club, counter-reference Duolingo
  (Decisions in scope.md); per-pattern refs under "Mobbin refs" in scope.md (hold-to-view Lapse, coach tips Front,
  catalogue Netflix/Kahoot, lobby yope/Kahoot, 3-2-1 WHOOP, scoreboard Deezer/Duolingo/Higgsfield, slides Cash App/Bumble).

Technical decisions (planner):
- **Git root commit.** `main` is unborn; `flow/party-games-rebuild` already has the root commit `400c1ee`
  (Gate 0 state). Before Build starts the orchestrator runs `git branch main 400c1ee` (local, reversible), so
  `main` is an ancestor of the feature branch: Gate 2 diffs `main...flow/party-games-rebuild`, and at Ship the
  shipper (with consent) creates `Rue-Asha/Rues-Arcade`, pushes `main`, then the branch, and opens the PR.
  Alternative rejected: an empty root on `main` would give unrelated histories that can't be PR'd (learning from explore).
- **Every user tap is a reducer action.** Including "seen" (hold released), "handover done" and "lock in".
  The demo therefore needs no UI scripting: tapping the highlighted control dispatches the script's next action.
  The dial's value in a demo comes from the scripted action, not the pointer, which keeps the score deterministic.
- **Demo gating via context, not per-game code.** The shared `Button` and `HoldToView` read a demo context; a
  button with `action` ≠ the expected action is disabled, the matching one is highlighted; `HoldToView` shows
  its content openly with a [Demo] tag. Game screens only tag controls with `action`.
- **Demo isolation.** The demo route keeps its state in memory only; it never calls the session store, roster
  store or content API. `?from=<path>` records where to return; reload lands on the start screen because
  nothing is persisted.
- **Explanation lookup at runtime.** The viewer `HEAD`s `/explain/<slug>/index.html`; 404 → empty state. So a
  committed file + rebuild is enough. e2e proves the iframe path by serving a fixture via `page.route`.
- **Generic content shape.** Both content types are two-sided text pairs: `ContentItem = { id, a, b }`, mapped
  per table (imposter: a=crew, b=imposter; wavelength: a=left, b=right). One editor, one parser, one API.
  Bigger alternative: per-type schemas in the editor — buys nothing until a later game has non-pair content.
- **Persistence keys.** `arcade:roster`, `arcade:session:<slug>`, `arcade:muted`; session envelope
  `{ v: stateVersion, state }`. Storage access wrapped once in `src/lib/storage.ts` (memory fallback).
- **e2e projects.** Playwright runs the main-flow specs in two projects, `phone` (390×844, touch) and
  `desktop` (1280×800); screenshots go to `test-results/shots/<project>-<slug>.png`.
- **e2e server.** Built adapter-node server (`node build`, or `node $E2E_APP_DIR/build` in CI) on `$PORT` with
  `DATABASE_PATH=.e2e/$PORT.db`, deleted before each run; a test seeds content through the API.


Extension decisions (planner, S18–S21, 2026-10-05):
- **Illustrations as one dispatcher plus motif components.** `src/lib/deco/motifs.ts` maps `(slug, place)` to a
  motif name (pure, unit-tested; an unknown slug gets `neutral` for tile/start/play). `src/lib/deco/Art.svelte`
  renders the motif's inline SVG inside `<div class="deco" data-deco data-motif aria-hidden="true">` with
  `pointer-events: none`, absolutely positioned by its parent. Motif components (`src/lib/deco/*.svelte`: home
  composite, dial, masks, mask card, board grid, lock pieces, crew, rings, corner, neutral) draw with
  `currentColor` and the game's existing tokens (`--c`, `--<colour>-tint`); no new tokens, no images, no fonts.
  Text inside art ("Kalt", "Heiß") is Sora and sits inside the aria-hidden root. `src/lib/deco/Banner.svelte` is
  the shared banner (tint background, 3px top edge and ledge as in the start-screen intro today, content left,
  art right on desktop / faded behind the top-right on phone) used by Home, start screens and lobby.
  Bigger alternative: per-game art inside each game module (`games/<slug>/Art.svelte`) — buys self-contained
  later games, costs a registry change now; the dispatcher's neutral fallback covers later games until then.
- **Ambient motion in CSS, same switch as motion.ts.** Needle sweep (`rotate`, ~7 s, alternate) and mask lift
  (`translateY`, staggered) are CSS keyframes with `animation-iteration-count: infinite`, declared only inside
  `@media (prefers-reduced-motion: no-preference)` — the CSS twin of `reducedMotion()` in `motion.ts`, so no JS
  loop and nothing to clean up. Transform/opacity only. Infinite animations are already excluded by `shot()`,
  `settle()` and `running()` in the e2e suite, so existing motion tests keep their meaning; the new e2e helper
  `ambient(page)` counts exactly the infinite ones.
- **Start screen = banner + two-column body + Mehr box.** DOM order: Banner → start panel → "So geht's" →
  "Mehr zu <Spiel>". Phone: one column in that order. Desktop ≥1024px: grid `minmax(0,1fr) 380px` with "So
  geht's" placed in column 1 and the panel in column 2 (both row 1, `align-items: start`), the Mehr box spanning
  row 2. The three cards are `<a>` links (navigation, not actions) named by their title (`aria-labelledby`) and
  described by their line (`aria-describedby`), so `getByRole('link', { name: 'Demo', exact: true })` holds.
  Targets unchanged: `<base>/erklaerung`, `<base>/demo?from=<base>`, `<base>/inhalte`. Card lines: Erklärung
  "Die Regeln Schritt für Schritt", Demo "Eine Runde zum Mittippen", Inhalte "<n> <Noun> ansehen und bearbeiten"
  with the noun per game in the start page (Imposter "Fragenpaar"/"Fragenpaare", Wavelength "Spektrum"/"Spektren"),
  n = the page's existing `data.count`. Start button "Los geht's"; "Weiterspielen" unchanged. Wavelength's "So
  geht's" first rule becomes "Gemeinsam oder in Teams: pro Zug ein Spektrum zwischen zwei Begriffen."
- **Pitch lives on the registry entry.** `GameEntry.pitch` (one line, from each game's `index.ts`) feeds the tile
  and the start banner. Imposter "Alle bekommen dieselbe Frage, bis auf eine Person."; Wavelength "Einen Punkt auf
  einer Skala zwischen zwei Begriffen finden, gemeinsam oder in Teams." The mock's "Spieleabend" kicker is not
  built (S20).
- **Lobby banner is static per game.** Kicker "Lobby", the game name, "<n> Spieler" (chosen count), crew art.
  It doesn't follow the mode or team count chosen inside `Setup` — that would need Setup to report its state up
  (bigger alternative: an `onchange(config)` prop on `SetupProps`).
- **Koop is an engine mode, not a second game.** `WavelengthConfig.mode?: 'versus' | 'koop'` (absent = Versus);
  Koop config passes all chosen ids as one team: `{ mode: 'koop', teams: [ids], rounds }`. Koop state = the
  Versus state plus `mode: 'koop'` and `turn` (0-based index of the psychic within the round); the single team is
  named "Gemeinsam" and `teamIndex` stays 0. Phases and actions are unchanged (prep → reveal → guess → result,
  then gameOver). `psychic(s)` = `players[turn]` in Koop, `players[roundIndex % n]` in Versus. `next` in Koop:
  `turn + 1 < n` → next turn; else `roundIndex + 1`, `turn = 0`, or gameOver after the last round. `again` keeps
  `mode`, players and order, resets score, round and turn. `lockIn` scores 4/3/2/0 into the one team.
- **Koop result and rating.** `koopResult(s) → { total, turns, average, tier }` with `turns = rounds × players`,
  `average = total / turns` (unrounded; the screen formats one decimal de-DE, "2,7"). Tiers from the unrounded
  average via `RATING_TIERS`, first match wins: ≥ 3.5 "Sehr genau", ≥ 2.5 "Genau", ≥ 1.5 "Solide",
  ≥ 0.5 "Ungenau", else "Weit daneben". Game over Koop: label "Ergebnis", tier as the reveal word, "<total>
  Punkte" and "Ø <avg> Punkte pro Zug · <turns> Züge". Play screens in Koop: turn label "Runde r / R · Zug t / n",
  the aside shows the shared score (Scoreboard with one row "Gemeinsam") and the player order with the current
  psychic marked; existing per-turn copy (handover, dial, verdict) is reused. Verdicts are reworded to the
  neutral tone (accepted at Gate 1): 4 "Genau getroffen.", 3 "Knapp daneben.", 2 "In der Nähe.", 0 "Kein Punkt.";
  the demo tip "Volltreffer, 4 Punkte! …" becomes "Genau getroffen, 4 Punkte. Weiter zu Team 2."
- **Limits and the mode switch.** `def.minPlayers` 2, `maxPlayers` 18 (`MIN_KOOP_PLAYERS = 2`,
  `MIN_VERSUS_PLAYERS = MIN_TEAMS × MIN_TEAM_SIZE = 4`). The existing start-screen and lobby gates then block
  1 player with "mind. 2 Spieler". `Setup.svelte` gets a segmented switch "Spielmodus: Koop | Versus"; Versus is
  disabled below 4 with "Versus braucht mind. 4 Spieler.", default Versus from 4 up, Koop preselected below.
  Koop shows the player order ("Jede Person gibt pro Runde einmal den Hinweis, in dieser Reihenfolge.") and
  rounds ("Eine Runde: jede Person gibt einmal den Hinweis."); Versus shows the existing team formation.
- **Saved-session compatibility without a version bump.** `stateVersion` stays 1. `loadGameSession` checks a
  saved state against the Versus demo's opening state, key by key; Versus states never write `mode`/`turn`
  (they stay absent, not `undefined`), so pre-S21 saves fit, and Koop's extra keys are ignored by the check.
  `modeOf(s) = s.mode ?? 'versus'`. Bigger alternative: bump to version 2 with a v1→v2 migration hook in
  `session.ts` — buys an explicit field, costs a session-store contract change for one optional key.

## Contracts

Created by U2 (types + stubs that typecheck); later units fill them in and must not change the shapes without
re-planning.

```ts
// src/lib/engine/types.ts
export interface Player { id: string; name: string }
export interface Rng { state: number }                       // rng.ts (U1): next, int, pick, shuffle — pure, return [value, Rng]
export interface GameDef<S, A extends { type: string }, C> {
	slug: string; name: string; colour: string;               // colour = token name, e.g. 'imposter'
	minPlayers: number; maxPlayers: number; minContent: number;
	contentType: ContentType; stateVersion: number;
	init(input: { players: Player[]; config: C; content: ContentItem[]; seed: number }): S;
	reduce(state: S, action: A): S;
	phase(state: S): string;
}
export interface DemoStep<A> { action: A; tip: string }
export interface DemoScript<A, C> { players: string[]; config: C; content: ContentItem[]; seed: number; steps: DemoStep<A>[] }

// src/lib/content/types.ts
export type ContentType = 'imposter_pairs' | 'wavelength_spectra';
export interface ContentItem { id: number; a: string; b: string }
export const MAX_TEXT = 200;
export interface ImportReport { imported: number; duplicates: number; skipped: number; errors: { line: number; message: string }[] }
// src/lib/content/parse.ts: parseBulk(text): { rows: {a,b}[]; skipped: number; errors } — pure, U3 implements

// src/lib/games/registry.ts
export interface GameEntry { def: GameDef<any, any, any>; Screen: Component<ScreenProps>; Setup: Component<SetupProps>; demo: DemoScript<any, any> }
export const games: GameEntry[];                             // imports src/lib/games/<slug>/index.ts
export const comingSoon: string[];                           // ['Duck', 'Family Feud', 'Codes', 'Most Likely To', 'Charade']
export function playerRange(def): string;                     // '3–12 Spieler'
export interface ScreenProps { state: any; dispatch(action: { type: string }): void }
export interface SetupProps { players: Player[]; onstart(config: unknown): void }

// src/lib/games/<slug>/index.ts  wires engine.ts (U5), demo.ts (U5), Screen.svelte + Setup.svelte (game UI unit)

// src/lib/demo/context.ts
export interface DemoState { expected: string | null; step: number; total: number; tip: string }
export function setDemo(s: () => DemoState | null): void; export function getDemo(): DemoState | null;

// src/lib/session.ts
export function saveSession(slug: string, v: number, state: unknown): void;
export function loadSession<S>(slug: string, v: number): { state: S } | { discarded: true } | null;
export function clearSession(slug: string): void;

// src/lib/roster.svelte.ts
export const roster: { readonly players: Player[]; add(name): Result; rename(id, name): Result; remove(id): void; move(id, to: number): void };
type Result = { ok: true } | { ok: false; message: string };

// src/lib/games/registry.ts (S20, U15)
export interface GameEntry { /* as above */ pitch: string }  // one line, neutral; shown on tile and start banner

// src/lib/games/wavelength/engine.ts (S21, U15 types, U16 behaviour)
export type WavelengthMode = 'versus' | 'koop';
export interface WavelengthConfig { mode?: WavelengthMode; teams: string[][]; rounds: number } // koop: teams = [all ids]
export interface WavelengthState { /* existing fields */ mode?: 'koop'; turn?: number }  // both only in Koop
export const MIN_KOOP_PLAYERS = 2; export const MIN_VERSUS_PLAYERS = 4;
export const RATING_TIERS: { min: number; label: string }[];  // [3.5 'Sehr genau', 2.5 'Genau', 1.5 'Solide', 0.5 'Ungenau', 0 'Weit daneben']
export function modeOf(s: WavelengthState): WavelengthMode;
export function koopResult(s: WavelengthState): { total: number; turns: number; average: number; tier: string };
// psychic(s) and winners(s) keep their signatures

// src/lib/deco/motifs.ts (S18, U15 stub, U17 behaviour)
export type Place = 'home' | 'tile' | 'start' | 'lobby' | 'play';
export type Motif = 'home' | 'dial' | 'masks' | 'crew' | 'rings' | 'corner' | 'neutral';
export function motifFor(slug: string | undefined, place: Place): Motif;
// home → 'home'; tile: imposter 'masks', wavelength 'dial', undefined (Bald) 'corner'; start: imposter 'masks',
// wavelength 'dial'; lobby → 'crew'; play: known games 'rings'; any other slug on tile/start/play → 'neutral'

// src/lib/sound.ts
export type Sfx = 'press' | 'reveal' | 'correct' | 'wrong' | 'win';
export function play(s: Sfx): void; export const muted: { value: boolean }; export function setMuted(m: boolean): void;
```

Shared components (`src/lib/ui/`, props fixed by U2, styled by U4): `Button { variant: 'primary'|'secondary'|'ghost';
size?: 'md'|'sm'; action?: string; disabled?; onclick?; children }`, `GameTile { entry?: GameEntry; locked?: string }`,
`Card { tone?: ContentType | 'neutral'; children }`, `Scoreboard { rows: { name; score; lead? }[] }`,
`Lives { total; left }`, `Modal { open; title; onclose; children }`, `HoldToView { action?: string; onrelease; label; children }`,
`CoachTip { step; total; text; onexit }`, `Screen` transition wrapper `Stage { key; children }`, `countUp` action.

Decoration components (`src/lib/deco/`, props fixed by U15, drawn by U17): `Art { slug?: string; place: Place }` →
`<div class="deco" data-deco data-motif={motif} aria-hidden="true">`, `pointer-events: none`, fills its positioned
parent; `Banner { slug?: string; place: 'home' | 'start' | 'lobby'; colour?: string; children: Snippet }` — colour
is a token name (default `primary`), children are the banner's text column, Art is placed by the Banner. Users:
Home (Banner place=home, `GameTile` with `<Art slug place="tile">`), start screen (Banner place=start), lobby
(Banner place=lobby), play and demo routes (`<Art slug place="play">` behind the Stage).

e2e helpers (`e2e/helpers.ts`, U15): `ambient(page): Promise<number>` — running animations with infinite iterations;
`decoAudit(page): Promise<string[]>` — decoration elements that lack `aria-hidden="true"` or have pointer events.
Parallel units keep e2e data isolated: exact-text locators, per-test roster/content (`seedRoster`, `seedContent`
with test-unique text), `emptyServer` wherever a count or an empty table is asserted.

Routes: `/` Home · `/spieler` · `/spiele/[slug]` start screen (rules summary, Demo, Erklärung, Inhalte, start) ·
`/spiele/[slug]/lobby` (player pick, then the game's `Setup`) · `/spiele/[slug]/spielen` (load: content for the
game; header with Demo and "Spiel beenden") · `/spiele/[slug]/demo?from=` · `/spiele/[slug]/erklaerung` ·
`/spiele/[slug]/inhalte` · `GET /healthz` · `GET|POST /api/content/[type]` · `PUT|DELETE /api/content/[type]/[id]`
· `POST /api/content/[type]/import`.

Schema (`migrations/0001_content.sql`, applied by `src/lib/server/db.ts` `migrate()` and recorded in
`schema_migrations(name TEXT PRIMARY KEY, applied_at TEXT)`):
`imposter_pairs(id INTEGER PK, crew TEXT NOT NULL, imposter TEXT NOT NULL, created_at, UNIQUE(crew, imposter))`,
`wavelength_spectra(id INTEGER PK, left_text TEXT NOT NULL, right_text TEXT NOT NULL, created_at, UNIQUE(left_text, right_text))`.

## Risks / Trade-offs

- R1 Replacing the old public repo → resolved: separate new repo; old repo untouched.
- R2 Heavy motion on low-end phones → accepted; reduced-motion path + transform/opacity only.
- R3 Explanation HTML pulling CDN assets fails offline/under the sandbox → accepted; README asks for self-contained files.
- R4 Demo determinism → seeded RNG + scripted actions; a unit test runs each script twice to the end.
- R5 iOS WebAudio needs a user gesture → AudioContext created lazily on first pointerdown.
- [Contract drift between parallel units] → shapes fixed in U2; a unit that needs a change stops and reports.
- R6 Decoration and permanent ambient motion on low-end phones → accepted; transform/opacity only, CSS
  animations off under reduced motion (as R2).
- R7 S19 changes start-screen markup and copy → the builder of U19 updates every affected locator
  (`Spiel starten` → `Los geht's`, Demo/Erklärung buttons → links) to the new exact names, keeping each assertion;
  no test is loosened or deleted. Look shots are refreshed in U20.
- [Old saves vs. Koop] → covered by "Saved Versus session from before resumes" (literal pre-S21 state) and
  "Koop session resumes after reload".
- [Appetite: 6 extension units for ~1 session] → U15 is types only, U16/U17 are small; if the session runs out,
  U20's shot refresh is the renegotiation point.
- [Appetite: 13 build units for ~3 sessions] → units are small; if session 2 ends before U9/U10, Wavelength UI
  is the renegotiation point.

## Migration Plan

No data migration in the repo. Ship: (⚠, with consent) create `Rue-Asha/Rues-Arcade`, push `main` (root
`400c1ee`) and the branch, PR, CI green, merge; then (⚠) the `main` ruleset. Content: Rue runs
`npm run import -- <backup>/dev.db --into rues-arcade.db` and copies the file to the host data dir (README) when
the Homelab change deploys it. Rollback: the old app is archived and was never deployed; nothing to roll back.

## Open Questions

- none
