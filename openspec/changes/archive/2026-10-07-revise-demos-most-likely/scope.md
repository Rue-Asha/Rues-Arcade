# Scope: revise-demos-most-likely

Triage: feature — escalated from tweak (set by Rue) at explore: six demo scripts rewritten, Most Likely rebuilt as a team game, explanation capability removed; > 5 S-items, parallel units. One PR. Appetite: one flow run (~one long session).

## Problem
Players learn a game from the start page, but the Erklärung card leads to an empty iframe page for every game, and each demo shows only one short happy path. Most Likely also uses the wrong rules: it hands individual titles to the most-pointed-at person, while the game Rue plays is team-based, where a team scores when its members point at the same person.

## Flows
- Learn a game: start page → "Demo" card → demo plays several rounds through every outcome branch, with a tip box per step → "Demo beendet" → back to the start page.
- Play Most Likely: start page → lobby (roster 4–20) → teams dealt evenly (2–8 teams, ≥2 each, tap a chip to move a player) + rounds (5/10/15/20, default 10) → per turn: "<Team> ist dran", prompt, team members point at the same moment → device enters how many team members pointed at the same person → result → next team … → Endstand (ranked teams, winner or "Unentschieden") → Nochmal spielen / Spiel beenden.

## In scope
- **S1** The start page has no Erklärung card. The route `/spiele/<slug>/erklaerung`, `static/explain/`, its e2e fixtures and the `explanation` capability (spec + tests) are removed. The Demo card is the primary way to learn the game, with copy that says so (e.g. "So geht's" / "Spiel per Demo lernen", final wording at Gate 1). The "So geht's" rules section on the start page stays and is updated for Most Likely.
  - edges: an old link or bookmark to `/erklaerung` → 404 from the normal unknown-route handling (no redirect) | catalogue/start specs and tests that name the Erklärung card are updated.
- **S2** Demo coverage rule (applies to S3–S8): every game's single demo script plays more than one round, and it reaches every outcome branch the engine has for a normal game: each scoring outcome, each special action that changes the flow (redraw, pass, steal, skip, …), and the game-over screen with a "Nochmal spielen" end state. Mutually exclusive modes (for example Wavelength Koop vs Versus) can't share one run: the script plays one mode and its tips name the other. Each step's tip (the CoachTip box) explains *why* the step happens, in neutral German, with no "!". `demo` spec "one full round" becomes "covers every outcome branch". The demo still never touches the session, roster or DB, works with reduced motion, and has one script per game (runner and registry stay unchanged).
  - edges: a branch that's unreachable with the fixture's seed → change the seed/config, never fake state | a very long script → the progress bar "Schritt n/N" still reads correctly | runner.test.ts generic checks still pass (players include Alex, deterministic, ends "Demo beendet").
- **S3** Imposter demo: covers the explorer's missing branches: imposter caught and not caught (whatever the engine distinguishes), `skip`, `nextRound` into a second round, plus every remaining engine branch the planner finds in the reducer.
  - edges: the [Demo] tag on hidden info stays.
- **S4** Wavelength demo (Versus): results of 4, 3, 2 and 0 points across turns, `redraw`, more than one round, game over with the winner, `again`; tips mention Koop as the other mode.
  - edges: tips that tests assert verbatim are updated with the tests.
- **S5** Feud demo: the faceoff where the first answer misses the board, pass in choose, a steal that succeeds and one that fails, revealing the whole board, more than one round, final ×2, game over. Uses the tiebreak survey only if the engine reaches it in a normal game.
- **S6** Codes demo: correct on the first try, missed then guessed, both teams missing, more than one round, game over.
- **S7** Duck demo: a no-score round, a multi-match round, letter loss up to a player's elimination, reaching the target and game over.
- **S8** Most Likely demo (on the new rules from S9–S11): 2+ teams of uneven size if the fixture's 4 players allow, otherwise 2×2. Covers a full match (team scores team size), a partial match (where applicable), no match (0), redraw, more than one round, game over with a winner and a tie case named in a tip.
  - edges: demo players Alex, Bo, Cleo, Dani → 2 teams of 2. A larger fixture is allowed if the runner allows it.
- **S9** Most Likely setup: roster 4–20 players. Players are dealt into 2–8 teams, as evenly as possible (sizes differ by at most 1), with a −/+ team count stepper, tap a player chip to move them to the next team, and a shuffle button (Wavelength Setup pattern). Each team needs ≥2 players, otherwise start is blocked with a role=alert hint. If team sizes differ by more than 1, a neutral hint shows but start is allowed. Team names are "Team 1…n". Rounds 5/10/15/20, default 10.
  - edges: roster <4 → start page/lobby gate as for other games | roster >20 → player pick as for other games | 8 teams need ≥16 players, so the stepper's max is min(8, floor(n/2)) | an umlaut name is shown as-is.
- **S10** Most Likely turn: a random opening team at game start. The opener rotates by one each round, and the other teams follow in order (archive rule). Each turn shows "<Team> ist dran", the team's player names, the prompt, round and turn counters, and the hint that the team members count to three and point at the same moment at the person who fits best. Prompts don't repeat until the pool is exhausted, then the used set resets. Redraw gives another prompt.
  - edges: pool of 1 prompt → redraw returns the same prompt (or is disabled, whichever the current spec does) | empty pool → existing content gate.
- **S11** Most Likely scoring: after pointing, the device asks how many team members pointed at the same person (largest group). The choices are "Alle verschieden" (0) and 2…team size. The team scores that number (2 people match → 2 points; 1 → 0). The device tracks only team order, the current turn and team scores, never who pointed at whom. The result screen shows the points and the prompt, then the next team. The last turn of a round says "Nächste Runde", the last turn of the game "Zum Ergebnis". Endstand: teams ranked by score, winner, or "Unentschieden" with the tied teams. "Nochmal spielen" keeps the teams, resets the scores and picks a new opener.
  - edges: a 2-player team → choices 0 or 2 | an old saved session in the old shape → stateVersion bump, discarded with the existing notice.
- **S12** Most Likely copy and look: the pitch, "So geht's" lines, player range "4–20 Spieler", and the look walk (`e2e/walks/most-likely.ts`) cover lobby with teams, turn, result and Endstand at phone and desktop sizes. The design-system rules hold (contrast, 44px touch targets, no horizontal scroll at 390px).

## Non-goals
- Several demos per game or a demo picker — Rue chose one long script. Mutually exclusive modes are named in tips only.
- Editable team names or team colours for Most Likely — not in the archive, not asked for.
- Recording who pointed at whom — Rue: the device only tracks team order and points.
- New Most Likely content or a content-store change — the `most_likely_prompts` table stays, no migration.
- Changing the CoachTip position or layout — only the tip texts change (Rue's "Erklärungsboxen" = the tips).
- A redirect from `/erklaerung` to the demo.

## Codebase touchpoints
- `src/routes/spiele/[slug]/+page.svelte` — remove the Erklärung card (L75), rework the Demo card copy, update the Most Likely "So geht's" lines (L33-37) (explorer: demo/explain)
- `src/routes/spiele/[slug]/erklaerung/`, `static/explain/`, `e2e/explain.test.ts`, `e2e/fixtures/explain/`, `openspec/specs/explanation/` — removed (explorer: demo/explain)
- `src/lib/games/{imposter,wavelength,feud,codes,duck,most-likely}/demo.ts` + `demo.test.ts` — rewritten scripts and tests (explorer: demo/explain)
- `src/lib/demo/runner.ts`, `runner.test.ts` — unchanged contract, generic test must stay green (explorer: demo/explain)
- `src/lib/games/most-likely/{engine,engine.test,index}.ts`, `Screen.svelte`, `Setup.svelte` — rebuilt; Setup pattern from `src/lib/games/wavelength/Setup.svelte` / `codes/Setup.svelte` (explorer: current ML)
- `src/lib/games/registry.test.ts`, `e2e/home.test.ts`, `e2e/start.test.ts`, `e2e/deco.test.ts`, `e2e/look.test.ts` (L155, L167-172), `e2e/most-likely.test.ts`, `e2e/walks/most-likely.ts`, `e2e/demo.test.ts`, `e2e/feud-demo.test.ts` — updated (explorers)
- `openspec/specs/{most-likely,demo,catalogue,explanation}/spec.md` — delta specs (explorers)

## Risks
- R1 Some branches may be unreachable with 4 fixed demo players or one seed (Duck elimination, Imposter not-caught) → accepted: change the seed/config. If the runner really can't reach a branch, the builder reports it and that branch becomes a tip-only mention, recorded as a deviation for Gate 2.
- R2 Long demos slow the e2e tap-throughs and the look walk (4m budget) → accepted: the look walk shoots demos at selected steps, not all.
- R3 Archive vs Rue's rules: Rue deliberately overrides the archive (team size ≥2, max 8 teams, points = largest matching group, rounds 5–20) → resolved at explore. The archive is canonical for everything else (opener rotation, prompt reset, result/Endstand flow).
- R4 Shared e2e files (start.test.ts, look.test.ts) are touched by several units → planner gives ownership per file or orders the units.

## Decisions
- Erklärung capability removed entirely, the demo is the explanation — Rue: good demos make the explanation obsolete.
- One long script per game, no multi-demo — the smaller design. Multi-demo would have allowed real Koop/Versus demos.
- Most Likely scoring = size of the largest group within the team that pointed at the same person (≥2, else 0) — Rue, overriding the archive's +1 for exactly-2 teams.
- Teams dealt evenly, uneven allowed with a hint; 2–8 teams; roster 4–20 — Rue.
- Rounds 5/10/15/20, default 10 — Rue (keeps the current picker).
- Escalated tweak → feature, one PR — Rue.
- Every existing test (unit, e2e, look walk) that the change breaks is updated by the unit that breaks it, in the same unit — Rue at Gate 0: "dort wo tests scheitern könnten, solltest du die auch anpassen".

## Done when
- The start page of every game shows no Erklärung card, and `/spiele/<slug>/erklaerung` is gone.
- Each game's demo runs several rounds, reaches every outcome branch listed in S3–S8 and the game over, with a fitting tip per step.
- Most Likely plays in teams, scores the largest matching group per turn, and ranks teams at the Endstand.
- `npm run proof:full` is green, and the specs (most-likely, demo, catalogue; explanation removed) match the behaviour.

## Split off
- none
