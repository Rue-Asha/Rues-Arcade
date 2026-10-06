# Scope: player-database

Triage: feature — new server-side player store that the shared roster of every game builds on; foundation for family-feud (whose "played with" survey history needs stable player identity). Appetite: one session.

## Problem
Rue plays with the same people again and again, but the roster is a per-device list of free-text names, so the same person shows up as "Alex", "alex " or "Alexander". Anything that remembers who played what (family-feud's survey history) needs one stable identity per real person.

## Flows
- Save a player: Spieler → "Gespeicherte Spieler" → name → Speichern → listed, available in every game.
- Build today's table: Spieler → pick saved players from the list (tap to add) and/or type a guest name → roster → lobby of any game.
- Promote a guest: roster entry "Gast" → "Speichern" → becomes a saved player, same roster position.
- Rename or delete a saved player: Spieler → saved list → rename / delete (with confirmation) → roster entries follow.
- First load after the update: an existing on-device roster is matched by name to saved players; matches become linked, the rest stay guests.

## In scope
- **S1** The server keeps saved players in a `players` table (id, name unique case-insensitive after trim, created_at) with an API to list, add, rename and delete.
  - edges: empty or whitespace name → rejected with a German message · duplicate name (any case) → 409 with message · rename to an existing name → 409 · delete of a missing id → 404 · names >40 chars → rejected.
- **S2** The Spieler page shows a "Gespeicherte Spieler" section: list (alphabetical), add, rename, delete.
  - edges: empty DB → empty state with one sentence and the add field · server unreachable → the section shows an error line; the roster still works with guests.
- **S3** A roster entry is either a saved player (linked to its DB id) or a guest (free text). Saved players are added by tapping them in the saved list; guests by typing. Each roster row shows which kind it is ("Gast" tag for guests).
  - edges: typing a name that matches a saved player (case-insensitive) → adds the saved player, not a guest · adding a saved player already in the roster → no duplicate, message · a guest with the same name as an existing roster entry → rejected as today.
- **S4** A guest can be saved with one tap; the entry becomes linked in place (same position).
  - edges: a saved player with that name exists → the entry links to it instead of creating a duplicate.
- **S5** Renaming a saved player updates every roster entry linked to it; deleting one asks for confirmation and removes it from the roster as well.
  - edges: delete while a game session is running → the running session keeps its copied names (sessions are snapshots, unchanged behaviour) · future tables that reference players (family-feud history) are removed with the player (ON DELETE CASCADE; `PRAGMA foreign_keys = ON` set in getDb).
- **S6** On load, roster entries that are not linked but whose name matches a saved player (case-insensitive, trimmed) become linked automatically; the rest stay guests.
  - edges: two roster entries matching one saved player → first one links, the second stays a guest · server unreachable → nothing changes, retried next load.
- **S7** Games receive the same `Player {id, name}` as today; a saved player's id is stable across sessions and devices (derived from the DB id), a guest's id stays client-generated. Existing games, demos and saved sessions keep working unchanged.
  - edges: an old saved session holding pre-update ids → still resumes (shape unchanged) · demo players never touch the DB.

## Non-goals
- Merging two saved players into one (e.g. "Alex" + "Alexander") — rename + delete covers the need for now.
- Live sync between several devices — Rue uses one device; a reload picks up DB changes.
- Player stats, avatars or per-game history — family-feud's survey history is the only consumer for now.
- Forcing saved players in other games — only family-feud will require them (in its own change).
- Archiving / soft-delete — Rue chose hard delete with history.

## Codebase touchpoints
- `src/lib/roster.svelte.ts` — entries gain the saved/guest link; linking on load (explorer: roster storage)
- `src/routes/spieler/+page.svelte` — saved-player section, guest tag, "Speichern" (explorer: roster)
- `src/lib/server/db.ts` — `PRAGMA foreign_keys = ON` outside the migration transaction (explorer: no FKs exist today)
- `migrations/0004_players.sql` — new table (explorer: migration pattern)
- new `src/routes/api/players/` endpoints, outside the `ContentType` union (explorer: content API)
- `src/lib/engine/types.ts` — `Player` shape only if a field is needed; adding is safe for `fits`, renaming is not (explorer: session shape check)
- `openspec/specs/roster/spec.md` — delta: "remembered on the device" now covers the saved store, duplicates across saved and guest, the removal semantics

## Risks
- R1 The roster can't reach the server (offline, server down) → accepted: guests keep working and nothing is lost; covered in S2/S6 edges.
- R2 `PRAGMA foreign_keys` can't be set inside a transaction → resolved: set it in getDb on open (explorer finding).
- R3 Changing `Player` breaks resumed sessions → resolved: keep `{id, name}`; the saved/guest link lives in the roster store, not in game state.

## Decisions
- Two changes, this one first; family-feud builds on it after merge — Rue, keeps each PR reviewable.
- Hard delete, history cascades with the player — Rue.
- Existing rosters link by name automatically — Rue.
- One device; no live sync — Rue.
- Saved-player list sorted alphabetically, name limit 40 chars — default, overridable at Gate 0.

## Done when
- Rue saves the regulars once, and on the next game night builds the roster by tapping them, adding a guest by typing.
- An old roster with matching names shows them linked after the update.
- Every existing game, demo and `proof:full` stays green.

## Split off
- none (family-feud is its own change that depends on this one)
