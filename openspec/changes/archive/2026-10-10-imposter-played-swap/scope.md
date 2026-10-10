# Scope: imposter-played-swap

Triage: feature — Imposter prompts get a played-with history like Feud surveys plus an interchangeable flag, then release 0.6.0; needs migration 0008 and an Imposter state change. Escalated from tweak (set) by the user on 2026-10-10. Appetite: one session.

## Problem
The host of an Imposter round can't tell whether the players already know a prompt, so pairs get replayed
blind; and every pair is one-way (crew text always to the crew), which limits how often a pair can be reused.

## Flows
- Edit history: Inhalte (Imposter) → card → "Gespielt mit" toggle → remove a player / add a saved player via +Name chip.
- Play: lobby → Imposter round → handover/view/crew phases with a hold-to-view "who knows this prompt" control → crew prompt revealed → players recorded automatically → unmask → next round.
- Flag: Inhalte (Imposter) → card or add form → reverse-arrow toggle (crossed arrow = off) → stored → next draw of that pair may swap sides.
- Release: version 0.6.0 in package.json/lockfile/version test/release spec in the same PR; tag v0.6.0 pushed after merge.

## In scope
- **S1** A played-with history per Imposter pair is stored in the DB (new table `imposter_played(pair_id, player_id)`, migration `0008`, FK cascade on both sides, dedupe by primary key) with list/add/remove API routes like `/api/feud/played`.
  - edges: unknown pair or player id on add → skipped silently, as Feud; deleting a pair or a saved player removes its rows (cascade); same player added twice → one row; fresh DB → empty table.
- **S2** When the crew prompt is revealed in a round (phase `crew`, `reveal`), every saved player of that round is recorded as having played that pair; guests are never recorded.
  - edges: skipped/redrawn pairs are never recorded; a round ended before the crew reveal records nothing; re-render or session resume must not record twice in a harmful way (INSERT OR IGNORE is enough); the demo never records; a round with only guests records nothing.
- **S3** On the Inhalte page each Imposter card has a "Gespielt mit" toggle showing the recorded saved players with "Entfernen" each, "Noch niemand." when empty, and "+ Name" chips for every saved player not yet on the list (same UX as Feud Prep's played list).
  - edges: no saved players at all → list/empty text without chips; add/remove updates the card only on res.ok; the toggle is per card and not persisted; other content types (non-Imposter) are unchanged.
- **S4** During a round, a hold-to-view control (existing `HoldToView`) shows which players *of this round* have played the current prompt, from round start (handover) through the view phases until the crew prompt is revealed; after the reveal it is gone.
  - edges: nobody of this round on the list → "Noch niemand aus dieser Runde."; guests never listed; after a skip the control reflects the new pair; the history is loaded once at round start (and reflects S2 writes in later rounds of the same game); the demo shows no such control; it must not push the primary action below the first phone viewport (header ~230px).
- **S5** Each Imposter pair carries an `interchangeable` flag (DB column with default off, so all existing pairs keep today's behaviour). It's shown and toggled as a small icon button on each Inhalte card (reverse arrow = on, crossed-out arrow = off, with an accessible label) and can be set in the add form; edits persist.
  - edges: bulk import keeps `crew | imposter` and imports with the flag off; existing rows and the seed stay off; the UNIQUE(crew, imposter) dedupe is unchanged (a swapped duplicate is not detected); only Imposter pairs get the flag, other content types unchanged.
- **S6** When a round draws an interchangeable pair, it decides 50/50 (from the round's seeded rng) which text goes to the crew and which to the imposter; a non-interchangeable pair always gives `crew` text to the crew and `imposter` text to the imposter.
  - edges: the decision is redrawn on skip together with the pair; the crew-reveal and unmask phases show the side that was actually dealt; deterministic for a given seed; the demo script stays as it is (its pairs are non-interchangeable).
- **S7** Release 0.6.0: package.json, package-lock.json, `scripts/version.test.ts` (retitled) and the release spec's version requirement say 0.6.0, in the same PR. The tag `v0.6.0` is pushed on the merge commit after the PR merges (release.yml then creates the GitHub release).
  - edges: none (mechanical bump, pattern from 42a90ae).

## Non-goals
- Using the history when drawing (prefer unknown prompts, Feud-style fill/badges/sort) — the user chose "only show".
- A Feud-style prep step before Imposter — editing lives on the Inhalte cards.
- Setting the flag through bulk import (e.g. `a <> b`) — user chose no.
- Any change to the Imposter demo script or its tips — user: "Es muss keine Anpassung an der Demo vorgenommen werden" (only what a state-version bump mechanically requires).
- Detecting swapped duplicates (b|a vs a|b) — dedupe stays as today.
- Showing the full history (players not in this round) during play — user chose "only this round".

## Codebase touchpoints
- `migrations/0008_*.sql` — new `imposter_played` table + `interchangeable` column on `imposter_pairs` (explorer: imposter storage; pattern `0005_feud.sql`).
- `src/lib/server/played.ts`, `src/routes/api/feud/played/**` — Feud's played module and routes, hardcoded to feud tables; copy or parametrise for Imposter (explorer: feud played).
- `src/lib/server/content.ts`, `src/lib/content/types.ts`, `src/routes/api/content/[type]/**` — generic pair store (`a`,`b` only); needs the flag for `imposter_pairs` (explorer: imposter storage).
- `src/routes/spiele/[slug]/inhalte/+page.svelte` (+ `.server.ts`) — generic Inhalte page; Imposter cards get the played toggle and the flag button (explorer: imposter storage).
- `src/lib/games/imposter/engine.ts` (`deal`/`draw`/`bind`, `stateVersion: 1`), `Screen.svelte`, `demo.ts` — swap in `bind`, state change, hold control (explorer: imposter storage).
- `src/lib/games/registry.ts` `onchange`, `src/lib/games/feud/record.ts` — pattern for auto-recording; `src/lib/players.ts` `savedId()`; `src/lib/ui/HoldToView.svelte` (explorer: feud played).
- `package.json`, `package-lock.json`, `scripts/version.test.ts`, `openspec/specs/release/spec.md` — bump (explorer: release).

## Risks
- R1 State shape change (swap decision, maybe saved ids) needs `stateVersion` 2; saved sessions are validated against the demo's opening state → accepted: an in-progress Imposter session from 0.5.x is discarded on upgrade; the planner must keep demo tests green without changing the demo script.
- R2 e2e on the shared DB (played writes, Inhalte card order) → accepted: follow the repo learnings (`emptyServer`, origin header in helpers, per-project names, exact-text locators).
- R3 Pushing tag v0.6.0 leaves the machine → resolved: it's named in the Gate 2 ship line, so Gate 2 approval covers it; it's done only after the merge, on the merged main commit.

## Decisions
- Track escalated to feature — migration + 7 S-items exceed tweak (user, 2026-10-10).
- History is edited on the Inhalte cards, not in a prep step — Imposter has no prep, keeps the setup flow (user).
- A pair counts as played at the crew reveal; skipped pairs never — at that moment the prompt is spent, matches the hold control's end (user).
- Drawing ignores the history — smaller; history is display-only (user).
- The hold control lists only this round's players — others are noise (user).
- `interchangeable` defaults off for existing and new pairs — today's behaviour stays unless chosen (user).
- Import doesn't set the flag (user).
- Swap is 50/50 per draw from the seeded rng — deterministic tests, matches "both prompts usable for both roles" (orchestrator, from the request).
- Release bump goes into this PR; the tag is pushed after merge — release.yml needs the merged commit's green CI run (explorer: release; user wants one PR).

## Done when
- In Inhalte → Imposter, a card shows the reverse-arrow button; toggling it survives a reload; "Gespielt mit" lists, adds and removes saved players.
- Playing a round with saved players, holding the control before the crew reveal shows who of the round knows the prompt; after the reveal those players appear on the card's list.
- An interchangeable pair sometimes gives the crew the imposter text across seeds; a non-interchangeable one never does.
- `npm run proof:full` is green; the PR carries version 0.6.0; after merge `v0.6.0` is tagged and the GitHub release exists.

## Split off
- none
