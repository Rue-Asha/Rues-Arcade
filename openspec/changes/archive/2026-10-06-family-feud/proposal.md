## Why

Family Feud is the last "Bald" tile in Rue's Arcade. The archive version works but leaves the host memorising up to
64 answers, has no undo, an unruled face-off, and no way to avoid surveys the table already knows.

Appetite: two sessions. Exceeding it means renegotiating scope.

Built only after `player-database` is merged into `main` (saved players with stable ids, the `players` table);
`main` is then merged into `flow/family-feud`.

## What Changes

- **Family Feud registered** (S1): tile with colour, "4–20 Spieler" and pitch; it leaves the "Bald" list (only
  Charade remains); start page with banner, three rule lines, nouns Umfrage/Umfragen and the Mehr-zu cards.
- **Saved players only** (S2): the lobby blocks guests for Family Feud with a message and a link to Spieler.
- **Setup** (S3): two teams (tap-to-move, Mischen, editable names), 1–8 rounds (default 3), start blocked while
  the DB holds fewer than rounds + 1 surveys.
- **Survey content type** (S4): own table, question plus 3–8 answers with points, Inhalte editor with answer rows,
  bulk import `Frage | Antwort : Zahl | …`, the 26 archive surveys as a seed migration.
- **Host prep** (S5–S7): all surveys with "k von n kennen sie" and "gespielt mit X", sortable; pick up to N;
  "Zufällig auffüllen" prefers unknown surveys; each survey's "played with" list of saved players, editable only
  in prep, filled automatically when a round is played to the end; cascades with deleted players.
- **Play** (S8–S14): hold-to-peek survey in a corner; face-off with named, rotating players and Spielen/Passen;
  board with strikes; steal; result with muted remaining tiles and ×2 on the last round; higher score wins, a tie
  goes to a sudden-death face-off; step-by-step undo within the current round.
- **Look, demo, session** (S15–S17): own colour, motif and badge, ledge tiles, versus header, strike pods,
  team-colour handoff, tile flip and other motion on transform/opacity only, synth sounds; a scripted demo with
  Alex, Bo, Cleo and Dani; save after every action and resume, with survey snapshots.

## Capabilities

### New Capabilities
- `feud`: Family Feud lobby gate, setup, host prep, played-with history, play rules, undo, session, demo, look and
  motion (S2, S3, S5–S17).

### Modified Capabilities
- `catalogue`: six registered games, only Charade locked, Family Feud pitch and start screen (S1).
- `content-store`: survey content type with its own table and validation, played-with table, seed of 26 surveys
  (S4, storage side of S7).
- `design-system`: Family Feud colour token, badge and motif (S15).

## Non-Goals

- Typed answers or fuzzy matching — the host judges spoken answers (Rue).
- Fast Money / bonus round — Rue chose Double/Triple + tiebreak only.
- Per-player turns on the board — the team answers together (Rue).
- Host as a player or a host in the roster — the host is whoever holds the phone (Rue).
- A separate host device — one shared device.
- Played-with history in Inhalte — prep only (Rue).
- Rules explanation page under `static/explain/` — no game has one yet; the empty state applies.
- Archive sound files — the design-system spec allows synthesised sound only.

## Done criteria

- [ ] Rue hosts a 3-round game with two teams on the phone: prep shows who knows which survey, the face-off, steal
      and the ×2 last round work, a mistap is undone, a tie goes to sudden death.
- [ ] A second game with the same people shows those surveys as known, and "Zufällig auffüllen" avoids them.
- [ ] Inhalte manages surveys, the 26 archive surveys are there, and `proof:full` is green with screenshots at 390
      and 1280.

## Impact

- New: `src/lib/games/feud/` (engine, setup, prep, screen, demo, record), `src/lib/server/{surveys,played}.ts`,
  `src/lib/content/survey.ts`, `src/routes/api/feud/played/`, `src/routes/spiele/[slug]/inhalte/SurveyEditor.svelte`,
  `src/lib/deco/Feud.svelte`, `migrations/0005_feud.sql`, `migrations/0006_seed_surveys.sql`,
  `e2e/feud*.test.ts`, `e2e/walks/feud.ts`.
- Changed: content types, content server and API routes (survey branch), registry (`savedOnly`, `onchange`),
  lobby (saved-only gate), play route (calls `onchange`), start and Inhalte pages, Card, GameTile, Lives, tokens,
  motifs, Art, cross-cutting e2e (home, start, deco, look, helpers).
- Data: the production DB gets two tables and 26 seed surveys once, on the next (manual) deploy; the played-with
  table references `players` from player-database.
