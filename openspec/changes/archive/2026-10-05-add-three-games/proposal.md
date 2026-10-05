## Why

Rue's Arcade ships only Imposter and Wavelength; the three games the group played in the archived Party-Games app
(Codes, What Rhymes with Duck, Who is most likely to) sit as locked "Bald" tiles. The group can't play them on
the new arcade.

Appetite: two sessions (one flow run). Exceeding it means renegotiating scope.

## What Changes

- **Codes** (S1–S10): faithful port of the archive's Passwort-style game (`src/lib/games/codes.ts`, not
  Codenames). 2–5 teams of ≥2 built from the roster, 1–8 rounds; one secret word per round, explainers see it
  only while holding; teams guess in a turn ring for 3/2/1 points, "Überspringen" from the third miss; Endstand
  with ties and rematch.
- **What Rhymes with Duck** (S11–S16): faithful port of the archive's Duck incl. the v2 fix 5becabf. 4–16 solo
  players, Zielpunkte 10–50; Chuck the Duck rotates after each played word; manual point grid and DUCKY letters
  with earlier words locked; game ends at the target or at 0 lives; Spielende with correct ties.
- **Most Likely To** (S17–S21): new format. ≥3 players, 5/10/15/20 rounds; a "Wer würde am ehesten …?" prompt per
  round, everyone points on 3, the reader taps the winner(s); titles ranking at the end.
- **Shared** (S22–S30): single-value content types (one text per entry) next to pairs, with editor and bulk
  import; a forward-only seed migration with the archive's words and prompts; the three tiles become playable with
  start pages; colour token, badge, banner and deco art per game; a demo per game; existing sound cues; session
  resume; neutral copy; release 0.2.0.

Bug fixes against the archive, as listed in scope.md: Codes' rejected word goes back to the pool; Duck's tie at
the top reads "Unentschieden" with correct tied ranks. Arcade conventions replace archive UI where scope.md says
so: Codes' word via HoldToView, teams of 3+ in Codes, the arcade lobby, Modal and demo.

## Capabilities

### New Capabilities
- `codes`: Codes rules, setup, flow, scoring, Endstand and demo script (S1–S10, plus S25–S29 for this game).
- `duck`: What Rhymes with Duck rules, setup, Chuck, scoring grid, end and demo script (S11–S16, plus S25–S29).
- `most-likely`: Most Likely To rules, setup, prompt, pick, reveal, Endstand and demo script (S17–S21, plus S25–S29).

### Modified Capabilities
- `content-store`: single-value content types and editor mode (S22), three new tables, seed migration (S23);
  "Fresh database" no longer means every table is empty.
- `catalogue`: five playable tiles, only Family Feud and Charade locked, pitches, start pages with rules and
  content count for the new games (S24).
- `design-system`: three new game colour tokens (S25), look of the new games (badge, tile and start art).
- `release`: version 0.2.0 and its tagged release (S30).

## Non-Goals

- Codenames-style grid, rhyme timer, enforced rhyme scoring, secret/anonymous voting, vote counts per player —
  Rue chose the archive mechanics / "nur Gewinner antippen".
- Timers in any game — none in the archive games.
- Explanation pages (static/explain) — none exist for the current games either.
- English content.
- CHANGELOG file — release notes are auto-generated.
- Deploy / Homelab version bump — stays manual.
- Unlocking Family Feud / Charade.

## Done criteria

- [ ] All three tiles on Home open playable games on phone and desktop; a full game of each runs from setup to Endstand.
- [ ] Fresh DB has the seeded words/prompts; the Inhalte page of each game edits single entries.
- [ ] `proof:full` green; screenshots of every new screen at 390 and 1280 for Gate 2.
- [ ] After merge, GitHub release v0.2.0 exists with the tarball.

## Impact

- New: `src/lib/games/{codes,duck,most-likely}/`, `src/lib/deco/{Codes,Duck,MostLikely}.svelte`,
  `migrations/0002_single_content.sql`, `migrations/0003_seed_content.sql`, `e2e/{codes,duck,most-likely}.test.ts`,
  `e2e/walks/*.ts`.
- Changed: content types, parser and server store; registry; start page and Inhalte page; GameTile, Card, tokens,
  motifs, Art; cross-cutting e2e suites (home, start, deco, look, content, helpers); `package.json` and lockfile
  version.
- Data: the production DB gets three new tables and their seed rows once, on the next (manual) deploy.
- Release: tag `v0.2.0` after merge publishes `rues-arcade-0.2.0.tgz` (ship-time, irreversible).
