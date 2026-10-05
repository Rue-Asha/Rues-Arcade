## Context

Rue's Arcade has a game-engine foundation (pure reducer + seeded RNG per game, `GameEntry` registry, shared
lobby/play/demo routes, session store) and two games. The archive (`/home/Rue/Repos/00_Archive/Party-Games`) holds
Codes and Duck as deployed games; Most Likely To is a new format. Content today is pairs only (`ContentItem
{ id, a, b }`, two columns per table). Several shared files are keyed per game or per content type: start page
`rules`/`nouns`, Inhalte `sides`, `Card` tones, `GameTile` badges, `motifs.ts`/`Art.svelte`, tokens, and the
cross-cutting e2e suites (home, start, deco, look). Those are what three parallel game units would collide on.

Read-only references for the ports: archive `src/lib/games/{codes,duck}.ts`, `src/routes/games/{codes,duck}/+page.svelte`,
`openspec/changes/archive/2026-06-21-add-duck-game/` and commit 5becabf (Duck v2). Seed source:
`/home/Rue/Repos/00_Archive/Party-Games-content-backup-2026-10-05/` (`dev.db` → `codes_words`, 91 rows;
`seeds/0003_duck_words.sql`, 60; `seeds/0012_most_likely_prompts.sql`, 60).

## Goals / Non-Goals

**Goals:** the three games playable end to end with the arcade's look, demo, session and sound; single-value
content with seeds; release 0.2.0.

**Non-Goals:**
- Codenames-style grid, rhyme timer, enforced rhyme scoring, secret/anonymous voting, vote counts per player —
  Rue chose the archive mechanics / "nur Gewinner antippen".
- Timers in any game — none in the archive games.
- Explanation pages (static/explain) — none exist for the current games either.
- English content.
- CHANGELOG file — release notes are auto-generated.
- Deploy / Homelab version bump — stays manual.
- Unlocking Family Feud / Charade.

## Decisions

From scope.md (Rue, Gate 0), as they are:
- Codes and Duck are faithful ports of the archive; deviations only for listed bug fixes and arcade conventions — Rue: archive is the deployed game.
- Codes word visible only via HoldToView — Rue chose it over "others look away".
- Codes teams ≥2, more allowed, explainer rotates within team — Rue.
- Most Likely To: everyone points, reader taps only the winner(s), titles ranking — Rue.
- Default content via seed migration — Rue.
- Full deco package per game — Rue.
- Version 0.2.0, tag v0.2.0 — Rue's request.

Planning decisions:
- **Slugs and names.** `codes` "Codes", `duck` "What Rhymes with Duck", `most-likely` "Most Likely To" (start-banner
  badge = first letter: C, W, M). Capabilities use the same slugs.
- **Limits.** Codes 4–20 (2–5 teams of ≥2; 20 is a planning cap, scope gives none), Duck 4–16 (archive), Most
  Likely To 3–20 (scope: "max as roster"; the roster has no cap, so 20 like Codes). `minContent` 1 for all three.
- **Codes default team count** `min(5, floor(n / 2))`, so 4–10 players deal into the archive's 2-player teams;
  the count control offers `2 … min(5, floor(n / 2))`. Setup copies Wavelength's deal/shuffle/move code into
  `codes/Setup.svelte` rather than extracting a shared component (smaller; a shared `Teams.svelte` would remove the
  duplication but would make the Codes unit edit Wavelength files).
- **Single-value content keeps `ContentItem { id, a, b }`** with `b: ''` for single types, so engines, the lobby
  fetch and the API routes stay unchanged; `add`/`update` ignore `b` for single types. Tables follow the archive
  names and the ContentType = table-name convention: `codes_words(word)`, `duck_words(word)`,
  `most_likely_prompts(text)`, each `UNIQUE`.
- **Single bulk import:** every non-empty, trimmed line is one entry (`|` is plain text). Empty lines are skipped
  and counted in the report, like pairs; over-200 lines are reported by line number; duplicates are counted.
- **Migrations.** `0002_single_content.sql` creates the three tables; `0003_seed_content.sql` holds plain
  `INSERT INTO … VALUES` rows generated once from the backup (Codes from `dev.db`, deduplicated case-sensitively
  after trimming). Migrations run once per DB (`schema_migrations`), so deleted seed rows stay deleted. Writing the
  file is reversible; it becomes irreversible only when the manual deploy applies it to the production DB (out of
  scope), so the build task carries no ⚠.
- **Copy.** Pitches: Codes "Teams erraten ein geheimes Wort aus Ein-Wort-Hinweisen, reihum.", Duck "Alle suchen
  gleichzeitig einen Reim auf dasselbe Wort.", Most Likely To "Ein Spruch, und alle zeigen auf die Person, die am
  besten passt." "So geht's":
  - Codes: "In Teams: pro Runde kennen alle Erklärer dasselbe geheime Wort." · "Reihum gibt jeder Erklärer seinem
    Team einen Ein-Wort-Hinweis, das Team rät gemeinsam." · "Wer zuerst richtig rät, bekommt 3 Punkte im ersten
    Versuch, 2 im zweiten, danach 1."
  - Duck: "Ein Wort wird für alle aufgedeckt, alle suchen gleichzeitig einen Reim darauf." · "Triffst du genau eine
    andere Person, gibt es 3 Punkte, bei mehreren je 1. Ein Match mit Chuck the Duck bringt 2 extra." · "Wer keinen
    Reim findet, verliert einen Buchstaben von DUCKY. Das Spiel endet bei den Zielpunkten oder ohne Leben."
  - Most Likely To: "Pro Runde ein Spruch: Wer würde am ehesten …?" · "Auf drei zeigen alle gleichzeitig auf die
    Person, die am besten passt." · "Wer die meisten Finger auf sich hat, bekommt den Titel. Am Ende gewinnt, wer
    die meisten Titel hat."
  - Nouns: Codes and Duck "Wort"/"Wörter", Most Likely To "Spruch"/"Sprüche".
  Game screens take their copy from the archive pages, minus "!" and emoji (🦆 → art or the word).
- **Colours** (checked against ink and surface ≥ 5.9:1): `--codes #9d8cff`, `--duck #ff9f43`, `--most-likely
  #f27bc4`, each with `-ledge` (dark, like `--imposter-ledge`) and `-tint` (ground mixed with the colour, like
  `--imposter-tint`); U1 tunes ledge/tint so `tokens.test.ts` passes.
- **Ownership.** U1 owns every shared or per-type-keyed file and fills it for all three games (copy, nouns, sides,
  tones, badges, tokens, motif wiring, e2e lists). Game units touch only `src/lib/games/<slug>/` (minus `index.ts`),
  their own art component, their own `e2e/<slug>.test.ts` and `e2e/walks/<slug>.ts`. U5 owns the Inhalte page UI
  and the version bump. That keeps wave 2 disjoint.
- **Look walk extension.** `look.test.ts` keeps its scenarios; its `walk()` calls `walkCodes`, `walkDuck`,
  `walkMostLikely` from `e2e/walks/*.ts` after the Wavelength section. U1 ships each as "visit the start page and
  `check('start-<slug>')`"; each game unit extends its own walk through lobby and every phase (shot names
  `lobby-<slug>`, `<slug>-<phase>`), so contrast, touch targets, no-h-scroll, Press Start, own-origin and
  screenshots cover the new screens without the game units touching `look.test.ts`.
- **E2E data isolation.** The shared e2e DB now starts with seeds. Game e2e play on seeded content and read the
  drawn word/prompt from the saved session (`arcade:session:<slug>`) or the hold control, never assume a pool size.
  Anything that needs an exact or empty pool (empty-pool gate, demos on an empty DB, seeded counts) runs on
  `emptyServer` and deletes/imports there. Tests that add content on the shared DB use unique tagged texts and never
  delete seed rows. Locators use exact text (CLAUDE.md learning).
- **Sound.** Existing `play()` cues only, called from each game's `Screen.svelte` at the moments in its spec.

## Contracts

Created by U1 (types + stubs that typecheck, wired into every shared file); U2–U4 fill them in and must not
change the shapes without re-planning.

```ts
// src/lib/content/types.ts
export type ContentType =
	| 'imposter_pairs' | 'wavelength_spectra'                 // pairs
	| 'codes_words' | 'duck_words' | 'most_likely_prompts';  // single values
export interface ContentItem { id: number; a: string; b: string }   // b === '' for single types
export function isSingle(type: ContentType): boolean;
// src/lib/content/parse.ts
export function parseBulk(text: string, single?: boolean): ParsedBulk;  // single: rows have b: ''
export function singleError(a: string): string | null;

// src/lib/server/content.ts — signatures unchanged; add/update/importBulk branch on isSingle(type)

// src/lib/games/codes/engine.ts
export interface CodesConfig { teams: string[][]; rounds: number }      // player ids per team; rounds 1–8
export type CodesPhase = 'reveal' | 'play' | 'result' | 'gameOver';
export interface CodesState { rng: Rng; phase: CodesPhase; /* rest is U2's */ }
export type CodesAction =
	| { type: 'redraw' } | { type: 'start' } | { type: 'guessed' } | { type: 'missed' }
	| { type: 'skip' } | { type: 'next' } | { type: 'rematch' };
export const codes: GameDef<CodesState, CodesAction, CodesConfig>;   // slug 'codes', colour 'codes', 4–20, codes_words
// src/lib/games/duck/engine.ts
export interface DuckConfig { target: 10 | 20 | 30 | 40 | 50 }
export type DuckPhase = 'reveal' | 'scoring' | 'standings' | 'gameOver';
export interface DuckState { rng: Rng; phase: DuckPhase; /* rest is U3's */ }
export type DuckAction =
	| { type: 'show' } | { type: 'play' } | { type: 'skip' } | { type: 'score'; player: number; box: number }
	| { type: 'letter'; player: number; letter: number } | { type: 'commit' } | { type: 'next' } | { type: 'restart' };
export const duck: GameDef<DuckState, DuckAction, DuckConfig>;       // slug 'duck', colour 'duck', 4–16, duck_words
// src/lib/games/most-likely/engine.ts
export interface MostLikelyConfig { rounds: 5 | 10 | 15 | 20 }
export type MostLikelyPhase = 'prompt' | 'pick' | 'reveal' | 'gameOver';
export interface MostLikelyState { rng: Rng; phase: MostLikelyPhase; /* rest is U4's */ }
export type MostLikelyAction =
	| { type: 'redraw' } | { type: 'point' } | { type: 'toggle'; player: number } | { type: 'confirm' }
	| { type: 'next' } | { type: 'rematch' };
export const mostLikely: GameDef<MostLikelyState, MostLikelyAction, MostLikelyConfig>; // slug 'most-likely', 3–20, most_likely_prompts
// each game dir: demo.ts exports `demo: DemoScript<Action, Config>` (players Alex, Bo, Cleo, Dani; fixture content;
// stub steps []), Screen.svelte (ScreenProps; destructure `state: game`), Setup.svelte (SetupProps; stub calls
// onstart with a default config), index.ts (U1 only: entry with the pitch above)
// Game units may add fields to State and members to Action, keep the names above, and bump nothing (stateVersion 1).

// src/lib/games/registry.ts
export const games: GameEntry[];       // [imposter, wavelength, codes, duck, mostLikely]
export const comingSoon: string[];     // ['Family Feud', 'Charade']

// src/lib/deco/motifs.ts
export type Motif = 'home' | 'dial' | 'masks' | 'crew' | 'rings' | 'corner' | 'neutral' | 'codes' | 'duck' | 'most-likely';
// own: { imposter: 'masks', wavelength: 'dial', codes: 'codes', duck: 'duck', 'most-likely': 'most-likely' }
// src/lib/deco/{Codes,Duck,MostLikely}.svelte — props { place: Place } (tile | start); U1 stub draws one shape in
// var(--c); the game unit replaces the drawing. Art.svelte routes the motif to it.

// tokens (src/app.css + src/lib/ui/tokens.ts): codes, codes-ledge, codes-tint; duck, duck-ledge, duck-tint;
// most-likely, most-likely-ledge, most-likely-tint. Card.svelte tone map covers all five ContentTypes.

// e2e/helpers.ts
export async function seedContent(request: APIRequestContext, type: ContentType, rows: [string, string][] | string[]): Promise<void>;
// e2e/walks/<slug>.ts
export async function walk(page: Page, check: (slug: string) => Promise<void>): Promise<void>; // seeds its own roster
```

## Risks / Trade-offs

- R1 Content-store generalisation could break pair types → existing imposter/wavelength unit and e2e stay green in
  U1; pair code paths unchanged where possible (branch on `isSingle`).
- R2 Cross-cutting e2e suites hardcode game lists → U1 owns them and lists all five games; game units add only
  their own files (walk delegation above).
- R3 Seeds make the shared e2e DB non-empty → tests needing empty or exact pools use `emptyServer`; the modified
  "Fresh database" scenario counts the seeds.
- R4 Tag push triggers a public release → ship-time only, after merge, under Gate 2 consent, version equals tag.
- R5 Codes teams of 3+ deviate from the archive → Rue's decision; 2-player teams behave exactly as the archive.
- Duck's point grid at T = 50 with 44px targets at 390px needs a wrapping grid (archive rows of 10 do not fit);
  the look walk's touch-target check guards it, so the Duck walk scores at T = 50 once.
- U1 is large (5 tasks over many files) because it absorbs every shared edit; the price of a disjoint wave 2.
