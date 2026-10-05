# Scope: add-three-games

Triage: feature — three new games, content-store change (single-value content + seed migration), release v0.2.0; > 1 session. Appetite: two sessions (one flow run).

## Problem
Rue's Arcade ships only Imposter and Wavelength; the three games the group played in the archived Party-Games app (Codes, What Rhymes with Duck, Who is most likely to) sit as locked "Bald" tiles. The group can't play them on the new arcade.

## Flows
- Codes: Home tile → start page → Setup (teams from roster, rounds) → Lobby → Aufdecken (explainers hold to view) → Spiel (turn ring, Erraten/Daneben/Überspringen) → Rundenergebnis → … → Endstand → Nochmal / zurück.
- Duck: Home tile → start page → Setup (Zielpunkte) → Lobby → Aufdecken (Chuck banner, word for all) → Wertung (points + DUCKY per player) → Punktestand → … → Spielende → Neue Runde / zurück.
- Most Likely To: Home tile → start page → Setup (rounds) → Lobby → Spruch → everyone points on 3 → reader taps the winner(s) → Reveal → … → Endstand (ranking by titles).
- Content: /spiele/<slug>/inhalte for each new game: list, add, edit, delete, bulk import (one entry per line).
- Demo: /spiele/<slug>/demo for each new game.
- Release: version 0.2.0 → merge → tag v0.2.0 → release workflow publishes the tarball.

## In scope

### Codes (port of archive `src/lib/games/codes.ts`, Passwort-style — NOT Codenames)
- **S1** Setup builds 2–5 teams from the roster; each team needs ≥2 players, more allowed; team building like Wavelength (deal, shuffle, move a player). Rounds 1–8, default 5.
  - edges: a team with <2 players or <2 teams → start blocked with a neutral hint; roster < 4 → blocked by player limits; roster over max → "Wer spielt mit?" picker.
  - added at Gate 1: 4–20 players; team count offered `2 … min(5, floor(n/2))`; the start-blocking hint reads "Jedes Team braucht mind. 2 Spieler."
- **S2** One round = one secret word drawn from the Codes pool without repeats until the pool is used, then reshuffle (arcade `draw()` pattern).
  - edges: pool below minContent → start screen blocks (existing gate).
- **S3** Explainer per team = `players[roundIndex % team.size]`; all other team members guess together with one guess. For 2-player teams roles swap every round (archive behaviour).
  - edges: teams of different sizes rotate independently.
- **S4** Opening team: random at game start, then (start + roundIndex) mod teams; turn passes team by team in that order.
- **S5** Aufdecken: screen names this round's explainers; the word is visible only while held (HoldToView). "Anderes Wort" draws a different word; the rejected word goes back to the pool (archive bug fix).
  - edges: pool of 1 word → "Anderes Wort" disabled or no-op without error.
- **S6** Spiel: heading names active team, explainer, guesser(s); turn ring in this round's order with the current point value in the centre. Word re-check for explainers via HoldToView (replaces archive "Wort zeigen" toggle).
- **S7** "Erraten" awards 3 / 2 / 1 points (attempt 0 / 1 / ≥2) to the active team and ends the round; "Daneben" passes to the next team (wraps, attempt +1).
- **S8** "Überspringen" appears from attempt ≥3 and ends the round with 0 points.
- **S9** Rundenergebnis shows points + team or "Übersprungen", and the word; "Nächste Runde" / "Zum Ergebnis" after the last round.
- **S10** Endstand: winner team(s), "Unentschieden" when several share the top score, ranked list; rematch keeps teams, resets scores, new random opener.

### What Rhymes with Duck (port of archive `src/lib/games/duck.ts` incl. v2 fix 5becabf)
- **S11** Setup: 4–16 solo players from roster; Zielpunkte 10/20/30/40/50, default 10, persisted with the session.
- **S12** Chuck the Duck: random player at start, moves to the next player in roster order after each played word; stays on skip and at game end. Chuck is visible in the banner, on the player's scoring card and in standings ("Als Nächstes bekommt … Chuck the Duck").
- **S13** Aufdecken: Chuck banner + rule line ("Ein Reim-Match mit <name> bringt +2 Extrapunkte"), "Wort aufdecken" reveals the word to everyone; "Wort spielen" → Wertung. "Überspringen" (with confirmation) draws a new word; the skipped word stays used; Chuck stays.
- **S14** Wertung: one card per player; point grid of T boxes (tap k → score k; tap top filled box → k−1) and DUCKY letters (tap → lose that letter and those after it; tap crossed → restore). Points and letters from earlier words are locked.
  - edges: score cannot exceed T (archive behaviour); restoring lives capped at the word's baseline.
- **S15** "Weiter": game ends when any score ≥ T or any player has 0 lives (reason: target reached if both); otherwise Chuck moves and Punktestand shows rows sorted by score with DUCKY letters (lost ones struck).
- **S16** Spielende: winner(s) = everyone tied at the top score ("Unentschieden" on a tie — archive bug fix), reason line, rest of ranking with correct tied ranks; "Neue Runde" restarts with the same players, new random Chuck.

### Who is most likely to (new format)
- **S17** Setup: 3–20 players from roster; rounds 5/10/15/20, default 10.
  - added at Gate 1: maximum 20 players (replaces "max as roster").
- **S18** Each round shows one prompt ("Wer würde am ehesten …?") drawn without repeats until the pool is used; "Anderer Spruch" swaps it (rejected prompt back to pool).
- **S19** Everyone points at 3; the reader taps the player(s) most pointed at (one or more for a tie) and confirms; at least one must be chosen.
- **S20** Reveal shows the prompt with the chosen player(s) as title holder(s); each gets +1 title.
- **S21** Endstand after the last round: ranking by titles, top holder(s) highlighted, "Unentschieden" when tied; rematch with same players.

### Shared
- **S22** Content store supports single-value content types (one text per entry) alongside pairs: editor list/add/edit/delete and bulk import of one entry per line, same 200-char limit and duplicate handling as pairs. New types: Codes words, Duck words, Most-Likely prompts.
  - edges: empty line / over 200 chars → import report error; duplicate → rejected like pairs; existing pair types unchanged.
- **S23** A forward-only seed migration fills the three new tables once: Codes 91 words (backup dev.db, deduped), Duck 60 words, Most Likely To 60 prompts (backup seeds), from `/home/Rue/Repos/00_Archive/Party-Games-content-backup-2026-10-05/`.
  - edges: existing DB on deploy → seeds land once; entries the user later deletes stay deleted.
  - added at Gate 1 (e2e data isolation): the shared e2e DB starts with seeds. Game e2e tests play on seeded content and read the drawn word or prompt from the saved session (`arcade:session:<slug>`) or the hold control, never assuming a pool size. Exact or empty pools (empty-pool gate, demos on an empty DB, seeded counts) run on `emptyServer`. Tests that add content on the shared DB use unique tagged texts and never delete seed rows.
- **S24** Catalogue: the three tiles become playable (removed from "Bald"); Family Feud and Charade stay locked. Each game has a start page with "So geht's" rules and the content count.
- **S25** Full look per game like Imposter/Wavelength: own colour token (+ledge, tint, contrast-checked), tile badge SVG, banner art and deco motifs.
  - added at Gate 1: ambient art motion animates only transform/opacity and runs only under `prefers-reduced-motion: no-preference`.
  - added at Gate 1: each game's look coverage goes through its own `e2e/walks/<slug>.ts` (`walk(page, check)`, start page → lobby → every phase), called from `look.test.ts`; game units never edit `look.test.ts`.
  - added at Gate 1: the neutral-fallback example in `motifs.test.ts` moves from duck to a still-locked game (charade / family-feud).
- **S26** Demo per game: scripted walk-through with Alex/Bo/Cleo/Dani and fixture content, gated like existing demos.
- **S27** Sound: existing cues (press/reveal/correct/wrong/win) used at matching moments (e.g. Erraten → correct, Daneben → wrong, Endstand → win).
- **S28** Session resume: each game saves after every action and resumes on reload; leaving mid-game asks for confirmation (arcade Modal).
- **S29** Copy follows arcade tone: neutral German, no "!", no emoji in text.
- **S30** Release: package.json + lockfile version 0.2.0; after merge, tag `v0.2.0` pushed so the release workflow publishes `rues-arcade-0.2.0.tgz`.

## Non-goals
- Codenames-style grid, rhyme timer, enforced rhyme scoring, secret/anonymous voting, vote counts per player — Rue chose the archive mechanics / "nur Gewinner antippen".
- Timers in any game — none in the archive games.
- Explanation pages (static/explain) — none exist for the current games either.
- English content.
- CHANGELOG file — release notes are auto-generated.
- Deploy / Homelab version bump — stays manual.
- Unlocking Family Feud / Charade.

## Codebase touchpoints
- `src/lib/games/<slug>/{engine,demo,index}.ts`, `Screen.svelte`, `Setup.svelte`, tests — per game (explorer: adding a game)
- `src/lib/games/registry.ts` — entries, `comingSoon` (explorer)
- `src/routes/spiele/[slug]/+page.svelte` (rules, nouns), `inhalte/+page.svelte` (sides) — hardcoded per game/content type (explorer)
- `src/lib/ui/Card.svelte`, `GameTile.svelte`, `src/lib/deco/motifs.ts`, `src/lib/deco/*.svelte`, `Art.svelte` (explorer)
- `src/app.css`, `src/lib/ui/tokens.ts` (colour tokens, grounds/textPairs) (explorer)
- `src/lib/content/types.ts`, `src/lib/content/parse.ts`, `src/lib/server/content.ts`, `/api/content/[type]` — single-value content (explorer)
- `migrations/0002_*.sql` (tables), seed migration (explorer)
- `e2e/helpers.ts` (`seedContent` pairs only), `e2e/look|demo|home|deco.test.ts`, `registry.test.ts`, `motifs.test.ts` — hardcoded game lists (explorer)
- `package.json`, `package-lock.json` version; `.github/workflows/release.yml` checks tag == version (explorer)
- Specs: new `codes`, `duck`, `most-likely` capabilities; deltas catalogue, content-store, design-system, demo, release (if touched)

## Risks
- R1 Content-store generalisation could break pair types → accepted: existing imposter/wavelength unit + e2e must stay green; contract unit first.
- R2 Cross-cutting e2e suites hardcode game lists; three parallel game units would collide there → resolved in planning: one contract unit owns shared files, game units only add their own.
- R3 Seed migration is new territory (data in a migration) → accepted: forward-only, runs once per DB; e2e DB gets seeds too, so e2e tests must not assume empty tables (use `emptyServer`).
- R4 Tag push triggers a public release → resolved: only after merge, under Gate 2 consent, version must equal tag.
- R5 Codes teams of 3+ deviate from archive → accepted: Rue's decision; 2-player teams behave exactly as archive.

## Decisions
- Codes and Duck are faithful ports of the archive; deviations only for listed bug fixes and arcade conventions — Rue: archive is the deployed game.
- Codes word visible only via HoldToView — Rue chose it over "others look away".
- Codes teams ≥2, more allowed, explainer rotates within team — Rue.
- Most Likely To: everyone points, reader taps only the winner(s), titles ranking — Rue.
- Default content via seed migration — Rue.
- Full deco package per game — Rue.
- Version 0.2.0, tag v0.2.0 — Rue's request.

## Done when
- All three tiles on Home open playable games on phone and desktop; a full game of each runs from setup to Endstand.
- Fresh DB has the seeded words/prompts; the Inhalte page of each game edits single entries.
- `proof:full` green; screenshots of every new screen at 390 and 1280 for Gate 2.
- After merge, GitHub release v0.2.0 exists with the tarball.

## Split off
- none
