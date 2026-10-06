## Context

The roster (`src/lib/roster.svelte.ts`) is a `Player[]` in `localStorage` (`arcade:roster`) with client ids. Content
lives in SQLite (`node:sqlite`, `src/lib/server/db.ts`, forward-only migrations in a transaction each); there are no
foreign keys yet. Games copy `Player { id, name }` into their session at start, and `fits` in `session.ts` checks the
session's shape on resume. Family-feud (next change) needs stable player identity and a table to reference.

## Goals / Non-Goals

**Goals:** a server-side saved-player store with API; roster entries that are saved players or guests; linking by
name on load; a stable id for saved players; foreign keys on, so family-feud can cascade.

**Non-Goals:**
- Merging two saved players into one (e.g. "Alex" + "Alexander") — rename + delete covers the need for now.
- Live sync between several devices — Rue uses one device; a reload picks up DB changes.
- Player stats, avatars or per-game history — family-feud's survey history is the only consumer for now.
- Forcing saved players in other games — only family-feud will require them (in its own change).
- Archiving / soft-delete — Rue chose hard delete with history.

## Decisions

From scope (Gate 0):
- Two changes, this one first; family-feud builds on it after merge — Rue, keeps each PR reviewable.
- Hard delete, history cascades with the player — Rue.
- Existing rosters link by name automatically — Rue.
- One device; no live sync — Rue.
- Saved-player list sorted alphabetically, name limit 40 chars — default, overridable at Gate 0.

Planner:
- **The link is the id.** A saved player's roster entry is `{ id: 'player-<dbId>', name }`; anything else is a guest.
  `Player` and the stored roster shape stay `{ id, name }`, so `fits`, saved sessions, demos and the e2e
  `seedRoster` helper keep working (R3). Alternative: a `savedId` field on roster entries — rejected, it would give
  a saved player two ids (client and DB) and family-feud would have to pick one. Guest ids (`<base36 time>-…`, or `p1`
  in old e2e seeds) never start with `player-`.
- **Validation shared, uniqueness in JS.** `nameError()` in `src/lib/players.ts` is used by both server and roster.
  The server checks duplicates with `toLocaleLowerCase('de')` against the table (SQLite `NOCASE` only folds ASCII);
  `UNIQUE COLLATE NOCASE` on the column stays as a backstop. Sorting is `localeCompare(…, 'de', { sensitivity: 'base' })`
  in `listPlayers`.
- **Foreign keys in `openDb`.** `PRAGMA foreign_keys = ON` runs in `openDb` right after opening — before `migrate`,
  outside its transactions (the pragma is a no-op inside one, R2). `getDb` calls `openDb`, so the server and the
  tests share it.
- **Players API outside the content API.** `src/routes/api/players/` (not `ContentType`), JSON in and out:
  `GET` → 200 `SavedPlayer[]`; `POST {name}` → 201 `SavedPlayer`; `PATCH /<id> {name}` → 200 `SavedPlayer`;
  `DELETE /<id>` → 204; errors `{ message }` with 400/404/409. A non-numeric id is 404.
- **Sync once per app load.** `roster.ready()` starts the first sync (GET, refresh linked names, link matching
  guests in roster order, first match wins) and returns the same promise on every call. The root layout calls it on
  mount; the lobby awaits it before computing `picked`, because Svelte mounts children before the layout and linking
  changes ids. A failed sync sets `roster.savedError` and changes nothing; the next page load tries again.
- **Saved players are renamed in the saved section only.** The roster row's rename stays for guests; for a saved entry
  the row shows no rename. Removing a saved entry from the roster only removes it from today's table.
- **Typed name that matches a saved player** adds the saved player (with the DB's spelling). Creating a saved player in
  the section does not link existing guests until the next load; "Speichern" on the guest row does.
- **Smaller design built:** no client cache of the saved list beyond memory, no offline queue. A bigger design
  (IndexedDB mirror, queued writes) would have let the saved section work offline; not needed on one device on the LAN.

## Contracts

The units run serially (U1 → U2 → U3), so there is no contract-only unit; these are the interfaces each later unit
builds on.

`src/lib/players.ts` (client-safe, U1):
```ts
export interface SavedPlayer { id: number; name: string }
export const NAME_MAX = 40;
export function nameError(name: string): string | null; // trimmed input; 'Bitte gib einen Namen ein.' | 'Höchstens 40 Zeichen.'
export function playerId(dbId: number): string;          // `player-${dbId}`
export function savedId(id: string): number | null;      // /^player-(\d+)$/ → dbId, else null (guest)
export type ApiResult = { ok: true; player: SavedPlayer } | { ok: false; status: number; message: string };
export const playersApi: {
	list(): Promise<SavedPlayer[]>;                      // throws when unreachable or not ok
	add(name: string): Promise<ApiResult>;
	rename(id: number, name: string): Promise<ApiResult>;
	remove(id: number): Promise<{ ok: true } | { ok: false; status: number; message: string }>;
};
```

`src/lib/server/players.ts` (U1):
```ts
export type PlayerSaved = { ok: true; player: SavedPlayer } | { ok: false; status: 400 | 404 | 409; message: string };
export function listPlayers(db: DatabaseSync): SavedPlayer[];          // alphabetical (de, base)
export function addPlayer(db: DatabaseSync, name: string): PlayerSaved;
export function renamePlayer(db: DatabaseSync, id: number, name: string): PlayerSaved;
export function deletePlayer(db: DatabaseSync, id: number): { ok: true } | { ok: false; status: 404; message: string };
```
Duplicate message: `„<name>“ ist schon gespeichert.`; unknown id: `Diesen Spieler gibt es nicht mehr.`

`migrations/0004_players.sql` (U1):
```sql
CREATE TABLE players (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	name TEXT NOT NULL UNIQUE COLLATE NOCASE,
	created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

`src/lib/roster.svelte.ts` (U2, used by U3 and family-feud):
```ts
export type Result = { ok: true } | { ok: false; message: string };
export const roster: {
	readonly players: Player[];          // unchanged shape; saved entries have id playerId(dbId)
	readonly saved: SavedPlayer[];       // alphabetical; [] until the first sync
	readonly savedError: string;         // '' or the error line for the saved section
	ready(): Promise<void>;              // first sync, memoised; resolves on failure too
	isGuest(p: Player): boolean;         // savedId(p.id) === null
	add(name: string): Result;           // saved match → addSaved, else guest
	addSaved(dbId: number): Result;      // 'Alex ist schon dabei.'-style message on duplicate
	rename(id: string, name: string): Result; // guests only
	remove(id: string): void;
	move(id: string, to: number): void;
	promote(id: string): Promise<Result>;      // guest → saved, same position; links to an existing name
	createSaved(name: string): Promise<Result>;
	renameSaved(dbId: number, name: string): Promise<Result>; // renames linked entries
	deleteSaved(dbId: number): Promise<Result>;               // removes linked entries
};
```

## Contract for family-feud

- **Is a roster entry saved, and its DB id:** `savedId(player.id)` from `#lib/players.ts` (`src/lib/players.ts`)
  returns the `players.id` (number) or `null` for a guest; inverse `playerId(dbId)` → `'player-<dbId>'`. Same id in
  `roster.players` and in any `Player` a game receives. `roster.isGuest(p)` is the same check.
- **Read the roster only after linking:** `await roster.ready()` (`#lib/roster.svelte.ts`) in `onMount` before using
  ids, as the lobby does.
- **Table:** `players(id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE COLLATE NOCASE, created_at TEXT)`, from
  `migrations/0004_players.sql`; family-feud's migrations start at `0005_`. Reference it as
  `player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE`.
- **Foreign keys:** on for every connection from `openDb`/`getDb` (`#lib/server/db.ts`); nothing to do in a migration.
- **Listing saved players:** server `listPlayers(db)` (`#lib/server/players.ts`), client `roster.saved` or
  `playersApi.list()`; type `SavedPlayer { id: number; name: string }`.
- **e2e:** `seedPlayers(request, origin, names)` in `e2e/helpers.ts` returns the created `SavedPlayer[]`.

## E2E data isolation

The e2e server's DB is shared by every test and by both Playwright projects running at once, and the layout's sync
links any guest whose name is saved. So:
- Tests that save, rename or delete players through the UI run on their own `emptyServer(info, '<name>')` and navigate
  with `${server.origin}/…`; this also proves the empty state. Names used (Ute, Uta, Rita, Gustav, Wanda, Vera) appear
  in no other e2e file; existing tests keep their names (Alex, Bo, …) and never see a saved player.
- The only shared-DB write is the API round trip, with a per-project name (`Probe ${info.project.name}`).
- Writes through `request` go through `seedPlayers` (or a helper beside it) in `e2e/helpers.ts`, which sends
  `headers: { origin }` so Kit's CSRF check passes; tests do not add the header themselves.
- "Server unreachable" uses `page.route('**/api/players**', r => r.abort())` — it simulates the network, not data.
- Exact-text locators (`getByText(x, { exact: true })`); the existing `e2e/roster.test.ts` locators get scoped to the
  "Dabei" region since the page now has a second list.

## Risks / Trade-offs

- [R1 server unreachable] → accepted: guests keep working, nothing is lost; the next load syncs.
- [R2 pragma in a transaction] → resolved: set in `openDb` before `migrate`.
- [R3 `Player` change breaks resumed sessions] → resolved: `Player` unchanged; the link is the id.
- [Linking changes an entry's id mid-page] → only the first sync per load does it; the lobby waits for it; other
  pages render from `roster.players` reactively.
- [Saved-player names with non-ASCII case (Ö/ö)] → JS duplicate check; the `NOCASE` backstop alone would miss them.

## Migration Plan

`0004_players.sql` runs once on the next deploy and only adds an empty table. Rolling back the app leaves the unused
table in place; forward-only, as all migrations here.
