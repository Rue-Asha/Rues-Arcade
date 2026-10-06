## Context

Rue's Arcade runs five games on one engine foundation: a pure reducer with seeded RNG per game (`GameDef`), a
`GameEntry` registry, shared start/lobby/play/demo/Inhalte routes, a device session store, and a SQLite content
store whose types are all `{ id, a, b }` rows (pair or single values, ≤ 200 chars). Family Feud is the last "Bald"
tile. The archive (`/home/Rue/Repos/00_Archive/Party-Games/src/lib/games/feud.ts`,
`src/routes/games/family-feud/`) is a reference only; scope.md's rules win. Seed source: the backup `dev.db`, table
`surveys` (26 rows, answers as JSON `{text, count}`, all valid under S4's rules).

This change is built after `player-database` is merged: saved players live in a server `players` table, roster
entries are saved (stable DB id) or guests, and `PRAGMA foreign_keys = ON` is set in `getDb`.

## Goals / Non-Goals

**Goals:** Family Feud playable end to end on one phone with host prep, played-with history, the fixed rules,
undo, the arcade look and motion, a demo, and surveys as a managed content type with 26 seeds.

**Non-Goals:**
- Typed answers or fuzzy matching — the host judges spoken answers (Rue).
- Fast Money / bonus round — Rue chose Double/Triple + tiebreak only.
- Per-player turns on the board — the team answers together (Rue).
- Host as a player or a host in the roster — the host is whoever holds the phone (Rue).
- A separate host device — one shared device.
- Played-with history in Inhalte — prep only (Rue).
- Rules explanation page under `static/explain/` — no game has one yet; the empty state applies.
- Archive sound files — the design-system spec allows synthesised sound only.

## Decisions

From scope.md (Gate 0), as they are:
- Host judges spoken answers; host outside the roster; host prep with pick, sort, fill — Rue.
- Corner peek is hold-to-view (releasing hides it) — default, overridable at Gate 0; reuses HoldToView.
- Face-off as on the show, rotation, Spielen/Passen, no grey-out — Rue.
- Team answers together on the board — Rue.
- Rounds 1–8 default 3; only the last round ×2 — Rue.
- Tie → sudden-death face-off — Rue.
- Undo step by step within the current round — default for "undo last action", overridable.
- Start needs rounds + 1 surveys in the DB so a tiebreak survey always exists — default, overridable.
- Played-with history automatic + editable, prep only; random fill prefers unknown — Rue.
- Family Feud requires saved players (player-database) — Rue.
- Rich motion as listed — Rue.
- Synthesised sound only — design-system spec.

Planning decisions (overridable at Gate 1):
- **Names.** Slug `family-feud` (URL `/spiele/family-feud`, session key `arcade:session:family-feud`), code dir
  `src/lib/games/feud/`, capability `feud`, colour token `feud` (blue, about #5b9dff), motif `feud`, ContentType
  and table `feud_surveys`, badge "F". Pitch "Zwei Teams suchen die häufigsten Antworten einer Umfrage." Rules:
  "Zwei Teams, eine Umfrage: gesucht sind die häufigsten Antworten." · "Im Duell gewinnt die höhere Antwort, das
  Team spielt oder passt. Nach drei Fehlern darf das andere Team einmal stehlen." · "Die Punkte aller
  aufgedeckten Antworten gehen an ein Team, in der letzten Runde doppelt." Nouns Umfrage/Umfragen.
- **Surveys get their own path, not `{a, b}`** (R1). `ContentType` gains `feud_surveys` so the registry, start
  page count, Card tone and the `/api/content/[type]` URLs stay uniform; `isSurvey(type)` branches the three API
  route files and the two page loaders to `server/surveys.ts`. Pair/single code in `server/content.ts` is typed
  over `ItemType = Exclude<ContentType, 'feud_surveys'>` and otherwise untouched. The Inhalte page renders a
  separate `SurveyEditor.svelte` for surveys rather than generalising its pair/single form (smaller; a generic
  row-editor would have bought one form for all types at the cost of touching every content test).
- **Storage.** `feud_surveys(id, question TEXT NOT NULL UNIQUE COLLATE NOCASE, answers TEXT NOT NULL /* JSON
  [{text, points}] in entry order */, created_at)`; `feud_played(survey_id → feud_surveys ON DELETE CASCADE,
  player_id → players(id) ON DELETE CASCADE, PRIMARY KEY (survey_id, player_id))`, so duplicates are impossible
  and both deletes cascade. Migrations `0005_feud.sql` (tables) and `0006_seed_surveys.sql` (26 plain INSERTs
  generated once from the backup, `count` → `points`, JSON in the backup's order). Writing them is reversible
  in the branch, but they are forward-only once the manual deploy applies them, so task 1.2 carries ⚠.
- **Lobby gate in the generic lobby.** `GameEntry.savedOnly?: true` (Family Feud only). The lobby checks the
  chosen players with `savedId(p.id)` from `#lib/players.ts` (after the lobby's `await roster.ready()`) before
  rendering Setup. The roster spec is not changed (player-database
  owns it in parallel); the gate is specified in `feud`.
- **Setup owns prep.** Feud's `Setup.svelte` has two steps: teams/rounds → "Weiter" → `Prep.svelte` → "Start"
  calls `onstart(config)` with the picked surveys as copies. The lobby's generic `start()` still fetches
  `/api/content/feud_surveys` and checks `minContent` (2); Feud's `init` ignores `content` and plays from
  `config`. Pure helpers (k counts, sort, fill, tiebreak draw) live in `feud/prep.ts`; fill/tiebreak take an
  injectable `random` (default `Math.random`) for unit tests — prep is UI, not the reducer.
- **Start needs all N slots filled.** "Start" is disabled until every slot holds a survey; "Zufällig auffüllen" is
  the shortcut. The tiebreak survey is drawn at Start by the fill rule from the unpicked surveys and stored in the
  config, so the engine stays deterministic and the tiebreak is a snapshot like the rounds.
- **Face-off order.** In round r (0-based) team r mod 2 answers first, including the sudden-death round (round
  index = number of rounds). Each team keeps a rotation cursor that advances whenever one of its players is named.
- **When a round counts as played.** A round is closed by `next` on its result ("Nächste Runde" / "Zum
  Ergebnis"). Undo reaches back from the result into the round (a mistap on the last tile stays fixable); `next`
  clears the undo stack. The played-with record is written for closed rounds only, so "Spiel beenden" on a result
  screen does not record that round.
- **Undo** keeps a stack of previous round states (`past`) in the game state; `undo` pops it. It is saved with the
  session, so undo survives a reload.
- **Played-with recording is a side effect outside the reducer.** The engine appends a round's survey id to
  `state.closed` on `next`. `GameEntry.onchange?(prev, next)` is called by the play route after every dispatch
  (never by the demo route); Feud's `record.ts` POSTs each survey id that is in `next.closed` but not in
  `prev.closed` with `state.config.saved` (the players' `players.id`s) to `/api/feud/played`. The insert is
  `INSERT OR IGNORE … WHERE EXISTS`, so a resend is harmless and a survey or player deleted meanwhile is skipped.
  A failed POST (server unreachable) is not retried — accepted, the history is a convenience.
- **Board ⇄ face-off.** Tile indices in actions are board positions (points descending, ties in entry order,
  `board()` in `content/survey.ts`), shared by face-off, board and steal. Revealing an already revealed tile is a
  no-op.
- **S10 edge "face-off already revealed every tile".** Unreachable: a survey has ≥ 3 answers and a face-off
  reveals at most 2 tiles. No scenario; the board's "all revealed → result" check covers it anyway.
- **Look.** Strike pods reuse `Lives.svelte` with a new `icon` prop (`heart` default, `strike`). Feud's screen may
  split into components under `src/lib/games/feud/` (e.g. `Board.svelte`, `Handoff.svelte`). Motion uses the
  existing `motion.ts` helpers and WAAPI where it can, so the e2e `shot()` settle waits for it.
- **Sound.** `play('reveal')` on a revealed tile, `play('wrong')` on a strike or a "Nicht auf der Tafel"/steal miss,
  `play('correct')` when a team banks the pot, `play('win')` on the winner screen.
- **E2E data isolation.**
  - Every Feud e2e test that needs saved players (all but the start-page and Inhalte tests) runs on its own
    `emptyServer(info, '<name>')` (fresh DB = 26 seed surveys, no players) and navigates with `${server.origin}/…`:
    both Playwright projects share the e2e DB concurrently and the layout's sync links any guest whose name is
    saved (player-database's isolation rule). The look walk does the same.
  - Saved players are created with player-database's `seedPlayers(request, origin, names)` (no own variant); the
    roster is then written with `seedSavedRoster(page, saved, guests)`, which stores `arcade:roster` entries with
    ids `playerId(dbId)` (`player-<dbId>`) and guest ids for the guest names, so no test depends on name linking.
  - Writes to the content API and the played-with API go through helpers in `e2e/helpers.ts` that send
    `headers: { origin }` (Kit CSRF), never per test file. Tests on the shared DB never change seed surveys.
  - Scenarios about data state read real state (`GET /api/feud/played`, the saved session in localStorage, the
    DB), never mocked responses. The look walk picks real seeded surveys by question text, no `page.route` mocks.
  - Exact-text locators (CLAUDE.md learning). Each unit writes its own e2e file: `feud-content` (U3),
    `feud-setup` and `feud-prep` (U4), `feud` (U5), `feud-history` (U6), `feud-demo` (U7).
- **Look walk.** `look.test.ts` calls `walk` from `e2e/walks/feud.ts` after the other games (U1 ships it as the
  start page, `check('start-family-feud')`); U5 extends it through lobby, prep, face-off, handoff, board (8-answer
  survey), steal, result and winner (`lobby-family-feud`, `feud-prep`, `feud-faceoff`, …), so the shots at 390
  and 1280 for Gate 2 come from the walk.

## Contracts

Created by U1 (types, schema, seeds, stubs that typecheck, wired into every shared file). Later units fill them
in and must not change the shapes without re-planning.

```ts
// src/lib/content/types.ts
export type ContentType = 'imposter_pairs' | 'wavelength_spectra' | 'codes_words' | 'duck_words'
	| 'most_likely_prompts' | 'feud_surveys';
export function isSurvey(type: ContentType): type is 'feud_surveys';
export interface SurveyAnswer { text: string; points: number }
export interface Survey { id: number; question: string; answers: SurveyAnswer[] }   // answers in entry order
export const MIN_ANSWERS = 3, MAX_ANSWERS = 8, MAX_POINTS = 100;

// src/lib/content/survey.ts
export function board(survey: Survey): SurveyAnswer[];       // U1, real: points desc, stable by entry order
export function surveyError(question: string, answers: SurveyAnswer[]): string | null;  // U1 stub → U3
export function parseSurveyBulk(text: string): {                                          // U1 stub → U3
	rows: { question: string; answers: SurveyAnswer[] }[]; skipped: number; errors: ImportError[] };

// src/lib/server/surveys.ts
export type SavedSurvey = { ok: true; survey: Survey } | { ok: false; status: 400 | 404 | 409; message: string };
export function listSurveys(db: DatabaseSync): Survey[];                  // U1, real, ORDER BY id
export function removeSurvey(db: DatabaseSync, id: number): boolean;      // U1, real (cascades feud_played)
export function addSurvey(db, question: string, answers: SurveyAnswer[]): SavedSurvey;            // U1 stub → U3
export function updateSurvey(db, id: number, question: string, answers: SurveyAnswer[]): SavedSurvey; // stub → U3
export function importSurveys(db, text: string): ImportReport;                                     // stub → U3
// src/lib/server/content.ts: export function count(db, type: ContentType): number   (all types)

// HTTP (same URLs as other types; body shape differs)
// GET    /api/content/feud_surveys          → Survey[]
// POST   /api/content/feud_surveys          { question, answers } → 201 Survey | 400/409 { message }
// PUT    /api/content/feud_surveys/[id]     { question, answers } → Survey | 400/404/409 { message }
// DELETE /api/content/feud_surveys/[id]     → 204 | 404
// POST   /api/content/feud_surveys/import   { text } → ImportReport
// GET    /api/feud/played                   → { surveyId: number; playerIds: number[] }[]   (U4)
// POST   /api/feud/played                   { surveyId: number; playerIds: number[] } → 204   (U4; idempotent)
// DELETE /api/feud/played/[survey]/[player] → 204 | 404                                       (U4)

// src/lib/server/played.ts (U4)
export function listPlayed(db: DatabaseSync): { surveyId: number; playerIds: number[] }[];
export function addPlayed(db: DatabaseSync, surveyId: number, playerIds: number[]): void;
export function removePlayed(db: DatabaseSync, surveyId: number, playerId: number): boolean;

// migrations/0005_feud.sql (U1): feud_surveys, feud_played as in Decisions → Storage
// migrations/0006_seed_surveys.sql (U1): 26 INSERTs

// src/lib/games/registry.ts
export interface GameEntry {
	def; Screen; Setup; demo; pitch;
	savedOnly?: true;                                   // lobby blocks guests (U1 declares, U4 enforces)
	onchange?(prev: unknown, next: unknown): void;      // play route only, after each dispatch (U1 declares, U6 calls)
}
export const games: GameEntry[];       // [imposter, wavelength, codes, duck, mostLikely, feud]
export const comingSoon: string[];     // ['Charade']

// saved vs guest: `savedId(player.id)` from #lib/players.ts (player-database), no Feud-side wrapper

// src/lib/games/feud/engine.ts
export interface FeudTeam { name: string; players: string[] }        // Player ids, rotation order
export interface FeudConfig {
	teams: [FeudTeam, FeudTeam];
	surveys: Survey[];        // one per round in play order, 1–8 (copies)
	tiebreak: Survey;         // not one of `surveys` (copy)
	saved: number[];          // players.id of every player of the game; [] in the demo
}
export type FeudPhase = 'faceoff' | 'choose' | 'board' | 'steal' | 'result' | 'gameOver';
export interface FeudState {
	rng: Rng; config: FeudConfig; phase: FeudPhase;
	round: number;            // 0-based; === surveys.length in sudden death
	scores: [number, number];
	closed: number[];         // survey ids of rounds closed by `next`, sudden death included
	past: unknown[];          // undo stack of the current round
	/* rest is U2's */
}
export type FeudAction =
	| { type: 'answer'; tile: number | null }     // face-off, for the player due; null = Nicht auf der Tafel
	| { type: 'play' } | { type: 'pass' }
	| { type: 'reveal'; tile: number } | { type: 'strike' }
	| { type: 'steal'; tile: number | null }      // null = miss
	| { type: 'next' } | { type: 'undo' };
export const feud: GameDef<FeudState, FeudAction, FeudConfig>;
// slug 'family-feud', name 'Family Feud', colour 'feud', 4–20, contentType 'feud_surveys', minContent 2,
// stateVersion 1. U1 stub: init stores config, round 0, phase 'faceoff', scores [0,0], closed [], past [];
// reduce returns state. U2 may add fields and helpers (e.g. canUndo, named, pot, multiplier), not rename these.
// feud/demo.ts: `demo: DemoScript<FeudAction, FeudConfig>` (Alex, Bo vs Cleo, Dani; fixture surveys; steps [] in U1)
// feud/Screen.svelte (ScreenProps; destructure `state: game`), feud/Setup.svelte (SetupProps; U1 stub: Weiter
// starts with a default config built from the first surveys), feud/index.ts (entry, pitch, savedOnly).

// tokens (src/app.css + src/lib/ui/tokens.ts): feud, feud-ledge, feud-tint. Card tone feud_surveys → feud.
// src/lib/deco/motifs.ts: Motif gains 'feud'; own['family-feud'] = 'feud'. src/lib/deco/Feud.svelte { place }.

// e2e/helpers.ts (U1)
export function writeHeaders(origin: string): { origin: string };
// reuses player-database's: seedPlayers(request, origin, names): Promise<SavedPlayer[]>
export async function seedSavedRoster(page: Page, saved: SavedPlayer[], guests?: string[]): Promise<void>;
	// writes arcade:roster: saved as { id: playerId(p.id), name }, then guests with guest ids
export async function surveyByQuestion(request: APIRequestContext, question: string, origin?: string): Promise<Survey>;
export async function deleteSurvey(request: APIRequestContext, id: number, origin?: string): Promise<void>;
// U4 adds: export async function seedPlayed(request, surveyId: number, playerIds: number[], origin?: string)
// e2e/walks/feud.ts: export async function walk(page: Page, check: (slug: string) => Promise<void>): Promise<void>;
```

### From player-database (reconciled with its design.md, "Contract for family-feud")

- Table `players(id INTEGER PRIMARY KEY, name TEXT NOT NULL UNIQUE COLLATE NOCASE, created_at TEXT)` from
  `migrations/0004_players.sql`; `feud_played.player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE`.
  Foreign keys are on for every connection from `openDb`/`getDb`; Feud's migrations start at `0005_`.
- Saved vs guest: `savedId(player.id)` from `#lib/players.ts` returns `players.id` or `null` (guest); inverse
  `playerId(dbId)` → `'player-<dbId>'`, the same id in `roster.players` and in every `Player` a game gets.
  `roster.isGuest(p)` is the same check. Read roster ids only after `await roster.ready()` (the lobby does).
- Saved players list: client `roster.saved` or `playersApi.list()`, server `listPlayers(db)`
  (`#lib/server/players.ts`); type `SavedPlayer { id: number; name: string }`. HTTP `GET /api/players` →
  `SavedPlayer[]`, `POST {name}` → 201, `PATCH /api/players/<id> {name}`, `DELETE /api/players/<id>` → 204.
- e2e: `seedPlayers(request, origin, names)` in `e2e/helpers.ts` → `SavedPlayer[]`; UI tests with saved players run
  on `emptyServer`.

## Risks / Trade-offs

- **Shared e2e DB with player-database's tests** → every Feud test with saved players runs on `emptyServer`.
- **The played-with POST can be lost** (server down at round end) → accepted; the host can add the players by
  hand in prep.
- **`content` passed to Feud's `init` is ignored** → slightly odd generic path, but no change to the lobby's
  start for the other five games.
- **Unit size.** U1 and U5 are large; both mirror units of the same size in add-three-games.

## Migration Plan

Forward-only migrations `0005_feud.sql` and `0006_seed_surveys.sql`, applied at startup like the others. No
rollback; the deploy that ships them is manual and outside this change.
