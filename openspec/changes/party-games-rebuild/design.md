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

**Goals:** everything in scope.md S1–S17; small game modules (engine, demo script, screen, setup) on shared
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

// src/lib/sound.ts
export type Sfx = 'press' | 'reveal' | 'correct' | 'wrong' | 'win';
export function play(s: Sfx): void; export const muted: { value: boolean }; export function setMuted(m: boolean): void;
```

Shared components (`src/lib/ui/`, props fixed by U2, styled by U4): `Button { variant: 'primary'|'secondary'|'ghost';
size?: 'md'|'sm'; action?: string; disabled?; onclick?; children }`, `GameTile { entry?: GameEntry; locked?: string }`,
`Card { tone?: ContentType | 'neutral'; children }`, `Scoreboard { rows: { name; score; lead? }[] }`,
`Lives { total; left }`, `Modal { open; title; onclose; children }`, `HoldToView { action?: string; onrelease; label; children }`,
`CoachTip { step; total; text; onexit }`, `Screen` transition wrapper `Stage { key; children }`, `countUp` action.

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
- [Appetite: 13 build units for ~3 sessions] → units are small; if session 2 ends before U9/U10, Wavelength UI
  is the renegotiation point.

## Migration Plan

No data migration in the repo. Ship: (⚠, with consent) create `Rue-Asha/Rues-Arcade`, push `main` (root
`400c1ee`) and the branch, PR, CI green, merge; then (⚠) the `main` ruleset. Content: Rue runs
`npm run import -- <backup>/dev.db --into rues-arcade.db` and copies the file to the host data dir (README) when
the Homelab change deploys it. Rollback: the old app is archived and was never deployed; nothing to roll back.

## Open Questions

- none
