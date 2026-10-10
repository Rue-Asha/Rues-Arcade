## Context

Imposter (`src/lib/games/imposter/`) deals one pair per round from the pool the lobby fetched
(`GET /api/content/imposter_pairs`, stored in the state as `pool`), resolves `{NAME}`/`{NAME2}` into the state's
`crew`/`imposter` texts in `bind`, and keeps no history. Pairs live in `imposter_pairs (crew, imposter)` behind the
generic `{ id, a, b }` content store. Family Feud already has a played-with history (`feud_played`,
`src/lib/server/played.ts`, `/api/feud/played`, recording through `GameEntry.onchange` in `feud/record.ts`, the
"Gespielt mit" list in `Prep.svelte`, the corner `HoldToView` peek). Scope: `scope.md` (S1–S7); motivation and
non-goals: `proposal.md`.

## Goals / Non-Goals

**Goals:** S1–S7 as specified in `specs/imposter` and `specs/release`, each unit green on `proof:full`.

**Non-Goals:** everything under Non-Goals in `proposal.md` (history-aware drawing, an Imposter prep step, flag syntax
in bulk import, demo changes, swapped-duplicate detection, full history during play).

## Decisions

- **Copy Feud's played module and routes for Imposter, don't parametrise them.** New
  `src/lib/server/imposter-played.ts` (three functions, ~30 lines) and two route files under
  `src/routes/api/imposter/played/`. Feud's `played.ts`, its routes, its `{ surveyId, playerIds }` response shape
  (read by `Prep.svelte` and e2e helpers) and its tests stay untouched. The bigger option — one store taking a table
  descriptor plus a `/api/[game]/played` route — would buy a single dedupe/skip implementation and one test set for a
  third game, at the cost of reshaping Feud's API and touching its prep and tests in this change.
- **No state change, no `stateVersion` bump** (R1 does not occur). The swap is resolved in `deal` into the existing
  `crew`/`imposter` fields, so crew reveal and unmask show the dealt sides with today's Screen code. The flag rides on
  the pool items (`ContentItem.interchangeable?`), and saved players are read from `players[].id` with `savedId`.
  An optional field keeps the demo fixture (no flag) and the `v: 1` session fixtures in `e2e/demo.test.ts` and
  `e2e/start.test.ts` valid, and a 0.5.x session resumes with its pairs treated as fixed. The alternative (a
  `swapped` field + bump) would discard running sessions and force edits to those fixtures for no behaviour gain.
- **The 50/50 coin is drawn only for interchangeable pairs**, after `bind`, with `int(rng, 0, 1)`. A fixed pair
  consumes no RNG, so every existing engine and demo state is bit-identical and the demo script stays as is.
- **Recording on the client through `onchange`**, like Feud: `onchange` runs on the play route only, so the demo
  never records. The trigger is the transition `prev.phase === 'crew' && !prev.shown` → `next.phase === 'crew' &&
  next.shown`, which fires once per round; a reload dispatches nothing. Fire-and-forget `fetch`, as in Feud.
- **History fetched once per deal, keyed by `s.rng.state`.** Screen remounts on every phase (Stage key), so the
  fetch lives in a module-level reactive cache in `played.svelte.ts`. Within a round no action between deal and crew
  reveal touches the RNG, so `rng.state` changes exactly when a round starts or a skip redeals; a refetch after a
  skip is harmless (the GET returns every pair). Keying on `round` alone would serve a stale list to the next game's
  round 1 in the same tab.
- **Inhalte: played lists come from the page load, writes call the API and then `invalidateAll()`** — the page's
  existing idiom for add/edit/delete, which also gives "change only on `res.ok`". Saved players for the chips come
  from `roster.saved` (loaded by the layout), as in Feud's prep.
- **Edit without the flag keeps it** (`interchangeable = COALESCE(?, interchangeable)`), so the existing edit form,
  which sends only `a`/`b`, can't reset it.
- **Release bump in U1**, files disjoint from everything else; the tag push happens in Ship after merge (⚠, Gate 2
  covers it).

## Contracts

**Schema (U1).** `migrations/0008_imposter_played.sql`:

```sql
ALTER TABLE imposter_pairs ADD COLUMN interchangeable INTEGER NOT NULL DEFAULT 0;
CREATE TABLE imposter_played (
	pair_id INTEGER NOT NULL REFERENCES imposter_pairs(id) ON DELETE CASCADE,
	player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
	PRIMARY KEY (pair_id, player_id)
);
```

**Content types and store (U1).** `src/lib/content/types.ts`:

```ts
export interface ContentItem { id: number; a: string; b: string; interchangeable?: boolean }
// set (as a boolean) on every imposter_pairs item the store returns; absent on every other type
export interface PairPlayed { pairId: number; playerIds: number[] }
```

`PairPlayed` lives here, not in `src/lib/server/`, because the client module (U2) and the Inhalte page (U3) import it.

`src/lib/server/content.ts`: `add(db, type, a, b, interchangeable?: boolean)`, `update(db, type, id, a, b,
interchangeable?: boolean)`; the argument is ignored for every type but `imposter_pairs`; `add` stores `false` when it
is omitted, `update` keeps the stored value. `list`, `add`, `update` return `interchangeable` as a boolean for Imposter
pairs. `importBulk` is unchanged (column default). API: `POST /api/content/imposter_pairs` and
`PUT /api/content/imposter_pairs/<id>` accept `{ a, b, interchangeable? }`, where only a boolean counts (anything
else = omitted).

**Played store and API (U1).** `src/lib/server/imposter-played.ts`:

```ts
export function listImposterPlayed(db: DatabaseSync): PairPlayed[]           // pairs and players ascending
export function addImposterPlayed(db: DatabaseSync, pairId: number, playerIds: number[]): void  // INSERT OR IGNORE … WHERE EXISTS pair AND player
export function removeImposterPlayed(db: DatabaseSync, pairId: number, playerId: number): boolean
```

Routes: `src/routes/api/imposter/played/+server.ts` (GET → `PairPlayed[]`; POST `{ pairId, playerIds }` → 204, or
400 `{ message: 'Ungültige Angaben.' }`) and `src/routes/api/imposter/played/[pair]/[player]/+server.ts` (DELETE →
204 / 404 `Eintrag nicht gefunden.`). Same validation as Feud's routes.

**e2e helpers (U1 produces, U2 and U3 use).** In `e2e/helpers.ts`, every write with `headers: writeHeaders(origin)`:

```ts
seedPairs(request: APIRequestContext, origin: string, pairs: { a: string; b: string; interchangeable?: boolean }[]): Promise<ContentItem[]>  // POST each, expect 201
seedImposterPlayed(request: APIRequestContext, origin: string, pairId: number, playerIds: number[]): Promise<void>  // expect 204
imposterPlayed(request: APIRequestContext, origin: string): Promise<PairPlayed[]>  // GET
```

U2 and U3 don't edit `helpers.ts`.

**Client played module (U2).** `src/lib/games/imposter/played.svelte.ts`:

```ts
export function record(prev: unknown, next: unknown): void  // wired as entry.onchange in index.ts
export function knownBy(players: Player[], played: PairPlayed[], pairId: number): string[]  // names in round order
export function history(key: number): PairPlayed[] | null    // module-level cache; fetches GET /api/imposter/played when key differs; null until loaded
```

`record` posts `{ pairId: next.pairId, playerIds }` with `playerIds = next.players.flatMap(p => savedId(p.id) ?? [])`
and posts nothing when that list is empty.

**Engine (U2).** `src/lib/games/imposter/engine.ts`: `deal` applies the swap after `bind` when
`d.pair.interchangeable === true` (`[coin, r] = int(r, 0, 1)`; coin 1 swaps `crew`/`imposter`). `ImposterState`,
actions, `stateVersion: 1` and `demo.ts` unchanged.

**Screen DOM (U2).** Rendered only outside the demo (`getDemo() === null`), while `revealing || (s.phase === 'crew'
&& !s.shown)`, and once `history(s.rng.state)` is loaded: `HoldToView` with `label="Wer kennt die Frage?"`,
`corner`, no `action`, `onrelease={() => {}}`, placed in the rail above the "Reihenfolge" list like Feud's peek. The
held content is `<div data-testid="known">` with either `ul[aria-label="Kennen die Frage"] > li` (one name each) or
`<p>Noch niemand aus dieser Runde.</p>`.

**Inhalte DOM (U3).** Imposter cards only: `li[data-pair="<id>"]`; in the card's tools, before "bearbeiten", a
`button` with `aria-label="<a> | <b> austauschbar"` and `aria-pressed`, 44×48 like the other icons (inline SVG:
reverse arrows on, the same crossed out off); below the text a `button` "Gespielt mit" with `aria-expanded`; the
expanded section is `role="group" aria-label="Spielerliste"` holding the names with "Entfernen" (`<span class="sr">
<name></span>` suffix as in Feud), "Noch niemand." and "+ <Name>" buttons. Add form: `button type="button"`
"Austauschbar" with `aria-pressed`. `+page.server.ts` adds `played: PairPlayed[]` (empty for other types).

**E2E data isolation.** Every new e2e test that writes saved players, pairs or played lists starts its own
`emptyServer(info, '<name>')` (fresh DB per project and process: no Imposter pairs, no players) and seeds through the
helpers above with that server's origin; no route mocks for content. Locators are exact text, stage locators go
through `live(page)`, the played post is awaited with `page.waitForResponse` before asserting on lists. The phone
viewport test runs only in `phone` (`test.skip(info.project.name !== 'phone')`), measures action and control in one
`evaluate` after `settled(page)`. Tap-through tests that play full rounds set `test.setTimeout` from their step count.

**Shared test files and their owners.** `e2e/helpers.ts`, `src/lib/server/content.test.ts`,
`src/lib/server/imposter-played.test.ts`, `scripts/version.test.ts`: U1. `src/lib/games/imposter/engine.test.ts`,
`src/lib/games/imposter/played.test.ts`, `e2e/imposter-played.test.ts`: U2. `e2e/imposter-flag.test.ts`,
`e2e/imposter-inhalte-played.test.ts`: U3. Existing `e2e/imposter.test.ts`, `e2e/demo.test.ts`, `e2e/content.test.ts`,
`e2e/look.test.ts` and `src/lib/games/imposter/demo.test.ts` are not edited by anyone; they must stay green.

## Risks / Trade-offs

- [⚠ Migration 0008 is forward-only] → additive only (new table, column with default 0); existing rows read as off.
- [Corner control in the view phase is visible to the reading player] → accepted: the user placed it through the view
  phases (S4); it shows names only while held.
- [Fire-and-forget post at the reveal races the next round's GET] → negligible in use (discussion and unmask lie
  between); e2e waits for the post's response before moving on.
- [Look rules and frame tests walk the new corner button and the extra Inhalte card buttons] → they must stay green
  unchanged (touch targets ≥ 44px, no horizontal scroll at 390px, `minmax(0,1fr)` where a grid is added).
- [Tag push leaves the machine] → done only in Ship, after merge, on the merged `main` commit (R3, Gate 2).
