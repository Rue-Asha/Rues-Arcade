# Scope: family-feud

Triage: feature (set) — the last open game in the catalogue, ported from the Party-Games archive with rule fixes, a structured survey content type, host prep with survey picking and per-player "played with" history. Depends on `player-database` (merged first). Appetite: two sessions.

## Problem
Family Feud is the last "Bald" tile in Rue's Arcade. The archive version works but leaves the host memorising up to 64 answers, has no undo, an unruled face-off, and no way to avoid surveys the table already knows.

## Flows
- Setup: catalogue → Family Feud → lobby (saved players only) → Setup: two teams (tap-to-move, Mischen, editable names), rounds 1–8 (default 3) → Weiter (hand device to host).
- Host prep: list of surveys from the DB with "k von n kennen sie" and total played-by, sortable → pick up to N → "Zufällig auffüllen" fills the empty slots → open a survey to see its answers and edit its "played with" list → Start.
- Round: question shown → face-off (one player per team, named by the app) → winner team chooses Spielen/Passen → board (team answers together; host reveals tiles or gives a strike) → clear the board → pot to the playing team, or 3 strikes → steal (one answer by the other team) → result: remaining tiles flip, pot × multiplier counts into the score → next round.
- End: after round N the higher score wins; a tie → sudden-death face-off → winner screen.
- Content: Inhalte → surveys list → add / edit (question + answer rows) / delete / bulk import.
- Demo: the Family Feud demo walks a round with Alex, Bo, Cleo, Dani (2 vs 2) on committed fixtures.

## In scope
- **S1** Family Feud is a registered game: tile with colour, player range "4–20 Spieler" and pitch; it is no longer in the "Bald" list (only Charade remains); the start page has its banner, three neutral rule lines, nouns (Umfrage/Umfragen) and the Mehr-zu cards.
  - edges: none (catalogue scaffolding is generic, mirrors the other games).
- **S2** The lobby only accepts saved players for Family Feud; with a guest in the roster, start is blocked with a message and a link to save them. 4–20 players; below 4 "mind. 4 Spieler"; above 20 the generic "Wer spielt mit?" picker.
  - edges: roster with only guests → blocked, link to Spieler · exactly 4 → playable 2 vs 2.
- **S3** Setup splits the players into two teams (tap-to-move, Mischen), each team ≥ 2, with editable team names (default "Team A"/"Team B"), and a round count 1–8, default 3.
  - edges: a team below 2 → Weiter disabled with a reason · empty or identical team names → falls back to / rejected with a message · fewer surveys in the DB than rounds + 1 → start blocked with a link to Inhalte.
- **S4** Survey content type: own table; a survey is a question plus 3–8 answers with points; board order by points descending. Inhalte shows survey cards, an edit form with answer rows (add/remove row), delete, bulk import in the format `Frage | Antwort : Zahl | …` (split on the last `:`), with per-line errors. The 26 archive surveys ship as a seed migration.
  - edges: duplicate question (case-insensitive) → 409 / reported as duplicate on import · duplicate answer text within a survey → rejected · points ≤ 0 or non-integer → rejected · sum > 100 → rejected · fewer than 3 or more than 8 answers → rejected · question or answer > 200 chars → rejected · equal points → stable order by entry order.
- **S5** Host prep lists all surveys, each with "k von n kennen sie" (players of this game in its played-with list) and "gespielt mit X" in total; sortable by both; the host picks up to N surveys for the N rounds, can open one to see all answers, and can remove a pick.
  - edges: picking more than N → the extra pick is refused · a survey every player knows → still pickable, badge says so · empty played-with list → "neu".
- **S6** "Zufällig auffüllen" fills only the empty slots; hand-picked surveys stay. It prefers surveys nobody at the table knows, then those known by the fewest.
  - edges: all slots already picked → button disabled · fewer unknown surveys than slots → fills with the least-known.
- **S7** Each survey keeps a "played with" list of saved players. It is visible and editable (add a saved player / remove one) only in host prep — never in Inhalte or during play. When a round with a survey is played to the end (including the tiebreak survey), all players of the game are added automatically.
  - edges: a game ended early via "Spiel beenden" → only fully played rounds are recorded · a player already on the list → not duplicated · a saved player deleted → their entries vanish (cascade from player-database) · demo → never records.
- **S8** During play a subtle corner control lets the host see the full survey (all answers + points) while holding it; releasing hides it.
  - edges: holding during a tile animation → doesn't block or skip it · reduced motion → instant.
- **S9** Face-off: the app names one player per team, rotating through each team round by round. Each gives one answer; the host reveals the matching tile or marks "Nicht auf der Tafel" per player. The higher-ranked answer wins; a #1 answer wins at once; if both miss, the next pair is named. The winning team chooses Spielen or Passen.
  - edges: first player hits #1 → second player is skipped · team of 2 over 5 rounds → rotation wraps · both answers miss repeatedly → pairs keep rotating.
- **S10** Board: the playing team answers together; the host taps a tile to reveal it or gives a strike; 3 strike pods show the count. All tiles revealed → the playing team banks the pot. Pot = sum of revealed answers' points, face-off answers included.
  - edges: the face-off already revealed every tile → board is cleared at once.
- **S11** Steal: after the 3rd strike the other team gets one answer; hit → that tile is revealed and the stealing team takes the pot including it; miss → the playing team banks the pot.
  - edges: none beyond hit/miss (one answer, no strikes in steal).
- **S12** Round result: all remaining tiles flip open in a muted look (no points), the pot is multiplied (last round ×2, marked before the round starts) and counts up into the team's score; then "Nächste Runde" or the end.
  - edges: 1 round only → that round is the last and counts ×2.
- **S13** End: the higher score wins with the winner screen. A tie → a sudden-death face-off on a fresh survey (drawn like S6, never one of the game's rounds): one player per team, higher answer wins the game; both miss → next pair.
  - edges: tie and both pairs miss every answer through the whole rotation → rotation continues (no draw ending).
- **S14** Undo: the host can undo the last action (reveal, strike, Spielen/Passen, steal answer) step by step back to the start of the current round; a finished round can't be undone.
  - edges: nothing to undo → control disabled · undo of a 3rd strike → back from steal to the board.
- **S15** Look and motion: own colour token, motif and badge; the board is ledge tiles showing the rank number while hidden; a versus header with both team names and scores; strike pods reuse Lives; a full-screen team-colour handoff for Spielen/Passen and steal. Motion: tile flip (rotateX), strike pod pop + short board shake + X stamp, pot count-up into the score, staggered reveal of the remaining tiles. Transform/opacity only, never blocks input, instant under reduced motion. Sounds via `play()` (reveal, wrong, correct, win).
  - edges: 390px phone with 8 answers → no horizontal scroll, all tiles visible · 1280px desktop → board not lost in whitespace.
- **S16** Demo: a scripted round with Alex, Bo, Cleo, Dani (2 vs 2) on fixtures: face-off, Spielen, a reveal, strikes, steal, result; hidden survey info tagged [Demo]; never touches the DB, roster or played-with history.
  - edges: empty DB → demo still runs · reduced motion → still completes.
- **S17** The running game is saved after every action and resumes on reload, like every game; "Spiel beenden" clears it.
  - edges: a survey edited or deleted during a running game → the game keeps its copy (snapshot) · an old/corrupt save → discarded with the notice.

## Non-goals
- Typed answers or fuzzy matching — the host judges spoken answers (Rue).
- Fast Money / bonus round — Rue chose Double/Triple + tiebreak only.
- Per-player turns on the board — the team answers together (Rue).
- Host as a player or a host in the roster — the host is whoever holds the phone (Rue).
- A separate host device — one shared device.
- Played-with history in Inhalte — prep only (Rue).
- Rules explanation page under `static/explain/` — no game has one yet; the empty state applies.
- Archive sound files — the design-system spec allows synthesised sound only.

## Codebase touchpoints
- `src/lib/games/feud/{engine.ts,index.ts,Screen.svelte,Setup.svelte,demo.ts}` + tests — new game, Codes as template for teams/scores/winners (explorer: arcade architecture)
- `src/lib/games/registry.ts`, `registry.test.ts:25`, `e2e/home.test.ts:30` — register, drop from comingSoon
- `src/routes/spiele/[slug]/+page.svelte` — rules and nouns maps
- `src/routes/spiele/[slug]/lobby/+page.svelte` — saved-players-only gate (built on player-database)
- `src/lib/content/types.ts`, `src/lib/server/content.ts`, `src/lib/content/parse.ts`, `src/routes/spiele/[slug]/inhalte/+page.svelte`, `src/lib/ui/Card.svelte:17`, `src/routes/api/content/...` — the store only knows pair/single types ≤200 chars; surveys need a structured type (explorer)
- `migrations/0005_*.sql` — survey table, survey↔player played-with link table (FK → players, ON DELETE CASCADE), seed of the 26 archive surveys from `00_Archive/Party-Games-content-backup-2026-10-05/dev.db`
- `src/app.css`, `src/lib/ui/tokens.ts` (+test), `src/lib/deco/motifs.ts` (+test), `src/lib/deco/<Name>.svelte`, `Art.svelte`, `src/lib/ui/GameTile.svelte` — colour, motif, badge
- `e2e/feud.test.ts`, `e2e/walks/feud.ts`, `e2e/look.test.ts:149-151` — scenarios and look walk
- Specs: new `feud` capability; deltas for catalogue (registered list, one "Bald" tile), content-store (survey type, tables, seed counts), design-system (look of the new game), roster (saved-only gate if it lands there)

## Risks
- R1 The content store is built around `{id,a,b}` pairs → resolved: surveys get their own structured type with its own validation; the planner decides how far the shared Inhalte code is generalised vs. a survey-specific path.
- R2 Depends on player-database → resolved: build starts only after it is merged; then main is merged into flow/family-feud.
- R3 Two sessions of work in many cross-cutting files → accepted: the planner cuts units with clear file ownership.
- R4 Hold-to-peek visible to the table → accepted: the host angles the phone; it's a fallback, not the main view.

## Decisions
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

## Done when
- Rue hosts a 3-round game with two teams on the phone: prep shows who knows which survey, the face-off, steal and the ×2 last round work, a mistap is undone, a tie goes to sudden death.
- A second game with the same people shows those surveys as known, and "Zufällig auffüllen" avoids them.
- Inhalte manages surveys, the 26 archive surveys are there, and `proof:full` is green with screenshots at 390 and 1280.

## Split off
- `player-database` — its own change, built and merged first.
