## Why

Rue plays with the same people again and again, but the roster is a per-device list of free-text names, so the same
person shows up as "Alex", "alex " or "Alexander". Anything that remembers who played what (family-feud's survey
history) needs one stable identity per real person.

## What Changes

- New `players` table (migration `0004_players.sql`) and a JSON API under `/api/players` to list, add, rename and
  delete saved players; names unique case-insensitively after trim, at most 40 characters.
- `PRAGMA foreign_keys = ON` on every database open, so later tables (family-feud history) can reference `players`
  with `ON DELETE CASCADE`.
- The Spieler page gets a "Gespeicherte Spieler" section (alphabetical list, add, rename, delete with confirmation).
- A roster entry is either a saved player (id derived from the DB id) or a guest (free text, client id, "Gast" tag).
  Saved players are added by tapping them; typing a saved player's name adds the saved player. A guest can be saved
  in place with one tap.
- Renaming or deleting a saved player updates or removes its roster entries.
- On load, unlinked roster entries whose name matches a saved player are linked automatically.
- Games keep receiving `Player { id, name }`; sessions, demos and existing games are unchanged.

## Capabilities

### New Capabilities
- `players`: the server-side saved-player store (table, API, foreign-key support) and its "Gespeicherte Spieler"
  section on the Spieler page.

### Modified Capabilities
- `roster`: entries are saved players or guests; duplicates are checked across both; typing a saved name links it;
  guests can be saved in place; rename/delete of a saved player follows into the roster; existing rosters link by name
  on load; ids of saved players are stable across sessions and devices.

## Non-Goals

- Merging two saved players into one (e.g. "Alex" + "Alexander") — rename + delete covers the need for now.
- Live sync between several devices — Rue uses one device; a reload picks up DB changes.
- Player stats, avatars or per-game history — family-feud's survey history is the only consumer for now.
- Forcing saved players in other games — only family-feud will require them (in its own change).
- Archiving / soft-delete — Rue chose hard delete with history.

## Done criteria

- [ ] Rue saves the regulars once, and on the next game night builds the roster by tapping them, adding a guest by
      typing.
- [ ] An old roster with matching names shows them linked after the update.
- [ ] Every existing game, demo and `proof:full` stays green.

## Appetite

One session.

## Impact

- New: `migrations/0004_players.sql`, `src/lib/players.ts`, `src/lib/server/players.ts`,
  `src/routes/api/players/+server.ts`, `src/routes/api/players/[id]/+server.ts`, `e2e/players.test.ts`.
- Changed: `src/lib/server/db.ts` (foreign keys on open), `src/lib/roster.svelte.ts`, `src/routes/spieler/+page.svelte`,
  `src/routes/+layout.svelte` (sync on load), `src/routes/spiele/[slug]/lobby/+page.svelte` (waits for the sync),
  `e2e/helpers.ts`, `e2e/roster.test.ts` (locators scoped to "Dabei").
- `Player` in `src/lib/engine/types.ts` is unchanged; no saved-session shape changes.
- Data: the production DB gets an empty `players` table once, on the next (manual) deploy.
