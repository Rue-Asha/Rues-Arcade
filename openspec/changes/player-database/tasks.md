Every behaviour task writes its scenario tests first, named "Scenario: <title>" as in the specs, from the THEN
clauses, and watches them fail before the code. Interfaces: design.md → Contracts. Shared e2e data rules: design.md →
E2E data isolation. Data-state scenarios test real state (real migrations, real store on a real DB), never canned
responses. Units run serially: each needs the previous one's merged code.

## 1. Saved-player store and API

> unit: depends=none · scope=S1,S5 · files=migrations/0004_players.sql, src/lib/server/db.ts, src/lib/server/db.test.ts, src/lib/players.ts, src/lib/server/players.ts, src/lib/server/players.test.ts, src/routes/api/players/+server.ts, src/routes/api/players/[id]/+server.ts, e2e/helpers.ts, e2e/players-api.test.ts

- [x] 1.1 ⚠ irreversible (production data migration, forward-only) `migrations/0004_players.sql` per Contracts; `openDb` sets `PRAGMA foreign_keys = ON` before any migration; `db.test.ts` runs the real migrations on a real file (Scenario: Players table arrives once on an existing database · Deleting a player cascades to referencing rows; unchanged and green: Migrations are applied once · Migration failure refuses to start · Seeds land once on an existing database)
- [x] 1.2 `src/lib/players.ts` (types, `NAME_MAX`, `nameError`, `playerId`, `savedId`, `playersApi`) and `src/lib/server/players.ts` (`listPlayers`, `addPlayer`, `renamePlayer`, `deletePlayer`) on a migrated real DB in `players.test.ts` (Scenario: Add, rename, delete and list saved players · Empty or whitespace saved name rejected · Overlong saved name rejected · Duplicate saved name rejected · Unknown saved player id)
- [x] 1.3 Routes `src/routes/api/players/+server.ts` (GET, POST) and `[id]/+server.ts` (PATCH, DELETE) per design.md
- [x] 1.4 `e2e/helpers.ts`: `seedPlayers(request, origin, names)` sending `headers: { origin }`; `e2e/players-api.test.ts` on the shared server with a per-project name; run `proof:full` green (Scenario: Players API round trip on the server)

## 2. Roster with saved players and guests

> unit: depends=1 · scope=S3,S4,S5,S6,S7 · files=src/lib/roster.svelte.ts, src/lib/roster.test.ts

- [x] 2.1 Test harness in `roster.test.ts`: a `fetch` stub that routes `/api/players` requests to `src/lib/server/players.ts` over a migrated `openDb(':memory:')` (real store, real state), plus a failing variant for "unreachable"; existing roster scenarios stay green (unchanged and green: Rename and remove a player · Empty or whitespace name rejected · Duplicate name rejected · Storage unavailable works for the session)
- [x] 2.2 `ready()` sync per Contracts: load `saved`, refresh linked names, link matching guests in order, first match wins, `savedError` on failure without changes (Scenario: Matching guests become linked on load · Two entries matching one saved player · Server unreachable leaves the roster unchanged)
- [x] 2.3 `add` / `addSaved` / `isGuest`, `rename` for guests only, `remove` keeps the saved player (Scenario: Typed name matching a saved player adds the saved player · Saved player already in the roster is not added twice · Guest named like a roster entry rejected · Removing a saved player's entry keeps the saved player · Saved player id is the same on every device)
- [x] 2.4 `promote`, `createSaved`, `renameSaved`, `deleteSaved` (Scenario: Saving a guest links it in place · Saving a guest whose name is already saved links to it · Renaming a saved player renames its roster entry · Deleting a saved player mid-game keeps the session snapshot)

## 3. Spieler page, sync on load and lobby

> unit: depends=2 · scope=S2,S3,S4,S5,S6,S7 · files=src/routes/spieler/+page.svelte, src/routes/+layout.svelte, src/routes/spiele/[slug]/lobby/+page.svelte, e2e/players.test.ts, e2e/roster.test.ts, e2e/look.test.ts

- [x] 3.1 `+layout.svelte` calls `roster.ready()` on mount; the lobby awaits it before computing `picked`; scope `e2e/roster.test.ts` locators to the "Dabei" region (unchanged and green: Roster survives reload · First run shows empty roster prompt · Below minimum disables start · Above maximum asks who plays · Reload mid-game resumes the same phase)
- [x] 3.2 "Gespeicherte Spieler" section on Spieler: alphabetical list (tap adds to the roster), add field, rename, delete via `Modal` confirmation, empty state sentence, error line from `roster.savedError`, server messages shown; tests in `e2e/players.test.ts` on `emptyServer` (Scenario: Save, rename and delete in the Spieler page · Deleting a saved player asks for confirmation · Duplicate saved name shows the server message · No saved players shows an empty state · Server unreachable keeps guests working · Deleting a saved player removes its roster entry)
- [x] 3.3 Roster rows: "Gast" tag and "Speichern" on guests, no rename on saved entries (Scenario: Tapping a saved player adds it to the roster · Speichern on a guest row · Old roster shows linked after the update)
- [x] 3.4 Games and demos unchanged over saved players (Scenario: Old session resumes after the update · Demo leaves saved players untouched; unchanged and green: Demo leaves real data untouched)
- [ ] 3.5 Look over the new section: `look.test.ts` Spieler walk still passes contrast, 44px targets and no horizontal scroll at 390 and 1280 with the saved section and a "Gast" row shown (no saved-player writes on the shared DB); `players.test.ts` takes `shot()`s of the section with saved players for Gate 2; run `proof:full` green
