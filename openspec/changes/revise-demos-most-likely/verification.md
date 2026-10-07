verified-at: b152d08

## Layer 1 — proof:full (green)
```
  ✓  396 [desktop] › e2e/look.test.ts:483:1 › Scenario: Motion never blocks input (268ms)
  Slow test file: [phone] › e2e/look.test.ts (8.0m)
  Slow test file: [desktop] › e2e/look.test.ts (7.9m)
  Consider running tests from slow files in parallel. See: https://playwright.dev/docs/test-parallel
  2 skipped
  394 passed (10.0m)
EXIT=0
```

Unit: 32 files, 292 tests passed. e2e: 394 passed, 2 skipped (look.test.ts viewport-conditional: Desktop uses the width on phone, No horizontal scroll on phone on desktop; neither is a gap).

## Layer 2 — spec coverage

| Scenario | proof | Evidence |
|---|---|---|
| Tiles for registered games (catalogue) | e2e |  `e2e/home.test.ts` › "Scenario: Tiles for registered games" ✓; |
| Player range derived from engine limits (catalogue) | unit |  `src/lib/games/registry.test.ts` › "Scenario: Player range derived from engine limits" ✓; |
| Each tile shows a one-line pitch (catalogue) | e2e |  `e2e/deco.test.ts` › "Scenario: Each tile shows a one-line pitch" ✓; |
| Start banner carries title, badge and player range (catalogue) | e2e |  `e2e/start.test.ts` › "Scenario: Start banner carries title, badge and player range" ✓; |
| Start panel first on phone, right column on desktop (catalogue) | e2e |  `e2e/start.test.ts` › "Scenario: Start panel first on phone, right column on desktop" ✓; |
| Same start layout for both games (catalogue) | e2e |  `e2e/start.test.ts` › "Scenario: Start panel first on phone, right column on desktop" ✓; |
| Mehr-zu cards keep their targets (catalogue) | e2e |  `e2e/start.test.ts` › "Scenario: Mehr-zu cards keep their targets" ✓; |
| Old Erklärung link is not found (catalogue) | e2e |  `e2e/start.test.ts` › "Scenario: Old Erklärung link is not found" ✓; |
| Inhalte card shows the real content count (catalogue) | e2e |  `e2e/start.test.ts` › "Scenario: Inhalte card shows the real content count" ✓; |
| Los geht's opens the lobby (catalogue) | e2e |  `e2e/start.test.ts` › "Scenario: Los geht's opens the lobby" ✓; |
| So geht's covers both Wavelength modes (catalogue) | e2e |  `e2e/start.test.ts` › "Scenario: So geht's covers both Wavelength modes" ✓; |
| So geht's for the new games (catalogue) | e2e |  `e2e/start.test.ts` › "Scenario: So geht's for the new games" ✓; |
| Inhalte card counts the seeded content (catalogue) | e2e |  `e2e/start.test.ts` › "Scenario: Inhalte card counts the seeded content" ✓; |
| New start banners carry title, badge and range (catalogue) | e2e |  `e2e/start.test.ts` › "Scenario: New start banners carry title, badge and range" ✓; |
| Family Feud banner carries title, badge and range (catalogue) | e2e |  `e2e/start.test.ts` › "Scenario: Family Feud banner carries title, badge and range" ✓; |
| So geht's for Family Feud (catalogue) | e2e |  `e2e/start.test.ts` › "Scenario: So geht's for Family Feud" ✓; |
| Family Feud Inhalte card counts the seeded surveys (catalogue) | e2e |  `e2e/start.test.ts` › "Scenario: Family Feud Inhalte card counts the seeded surveys" ✓; |
| Codes engine is deterministic and pure (codes) | unit |  `src/lib/games/codes/engine.test.ts` › "Scenario: Codes engine is deterministic and pure" ✓; |
| Codes session resumes after reload (codes) | e2e |  `e2e/codes.test.ts` › "Scenario: Codes session resumes after reload" ✓; |
| Leaving Codes asks for confirmation (codes) | e2e |  `e2e/codes.test.ts` › "Scenario: Leaving Codes asks for confirmation" ✓; |
| Codes demo script plays to the end (codes) | unit |  `src/lib/games/codes/demo.test.ts` › "Scenario: Codes demo script plays to the end" ✓; |
| Codes demo scores 3, 2 and 1 and skips once (codes) | unit |  `src/lib/games/codes/demo.test.ts` › "Scenario: Codes demo covers every outcome branch" ✓; |
| Codes demo redraws a word (codes) | unit |  `src/lib/games/codes/demo.test.ts` › "Scenario: Codes demo covers every outcome branch" ✓; |
| Codes demo rotates opener and explainer (codes) | unit |  `src/lib/games/codes/demo.test.ts` › "Scenario: Codes demo covers every outcome branch" ✓; |
| Codes demo ends with a winner and plays again (codes) | unit |  `src/lib/games/codes/demo.test.ts` › "Scenario: Codes demo covers every outcome branch" ✓; |
| Codes demo by tapping highlighted controls (codes) | e2e |  `e2e/codes.test.ts` › "Scenario: Codes demo by tapping highlighted controls" ✓; |
| Codes cues sound right (codes) | manual (audio judgement on a real device at Gate 2) | manual: Gate 2 checklist |
| Only the expected control is enabled (demo) | e2e |  `e2e/demo.test.ts` › "Scenario: Only the expected control is enabled" ✓; |
| Hidden information shown with Demo tag (demo) | e2e |  `e2e/demo.test.ts` › "Scenario: Hidden information shown with Demo tag" ✓; |
| Demo leaves real data untouched (demo) | e2e |  `e2e/demo.test.ts` › "Scenario: Demo leaves real data untouched" ✓; |
| Exiting returns to the starting screen (demo) | e2e |  `e2e/demo.test.ts` › "Scenario: Exiting returns to the starting screen" ✓; |
| Reload during demo returns to start screen (demo) | e2e |  `e2e/demo.test.ts` › "Scenario: Reload during demo returns to start screen" ✓; |
| Demo steppable with reduced motion (demo) | e2e |  `e2e/demo.test.ts` › "Scenario: Demo steppable with reduced motion" ✓; |
| Every demo covers its outcome branches over several rounds (demo) | unit |  `src/lib/games/imposter/demo.test.ts` › "Scenario: Imposter demo covers every outcome branch" ✓; `src/lib/games/wavelength/demo.test.ts` › "Scenario: Wavelength demo covers every outcome branch" ✓; `src/lib/games/feud/demo.test.ts` › "Scenario: Feud demo covers every outcome branch" ✓; `src/lib/games/codes/demo.test.ts` › "Scenario: Codes demo covers every outcome branch" ✓; `src/lib/games/duck/demo.test.ts` › "Scenario: Duck demo covers every outcome branch" ✓; `src/lib/games/most-likely/demo.test.ts` › "Scenario: Most Likely demo covers every outcome branch" ✓; |
| Demo tips read neutral (demo) | unit |  `src/lib/games/imposter/demo.test.ts` › "Scenario: Imposter demo covers every outcome branch" ✓; `src/lib/games/wavelength/demo.test.ts` › "Scenario: Wavelength demo tips read neutral" ✓; `src/lib/games/feud/demo.test.ts` › "Scenario: Feud demo covers every outcome branch" ✓; `src/lib/games/codes/demo.test.ts` › "Scenario: Codes demo covers every outcome branch" ✓; `src/lib/games/duck/demo.test.ts` › "Scenario: Duck demo covers every outcome branch" ✓; `src/lib/games/most-likely/demo.test.ts` › "Scenario: Most Likely demo covers every outcome branch" ✓; |
| Demo tips say why the step happens (demo) | manual (wording judgement by Rue at Gate 2) | manual: Gate 2 checklist |
| Long demo progress reads correctly (demo) | e2e |  `e2e/feud-demo.test.ts` › "Scenario: Feud demo by tapping highlighted controls" ✓; `e2e/most-likely.test.ts` › "Scenario: Most Likely demo by tapping highlighted controls" ✓; `e2e/duck.test.ts` › "Scenario: Duck demo by tapping highlighted controls" ✓; |
| Duck engine is deterministic and pure (duck) | unit |  `src/lib/games/duck/engine.test.ts` › "Scenario: Duck engine is deterministic and pure" ✓; |
| Duck session resumes after reload (duck) | e2e |  `e2e/duck.test.ts` › "Scenario: Duck session resumes after reload" ✓; |
| Leaving Duck asks for confirmation (duck) | e2e |  `e2e/duck.test.ts` › "Scenario: Leaving Duck asks for confirmation" ✓; |
| Duck demo script plays to the end (duck) | unit |  `src/lib/games/duck/demo.test.ts` › "Scenario: Duck demo script plays to the end" ✓; |
| Duck demo skips a word (duck) | unit |  `src/lib/games/duck/demo.test.ts` › "Scenario: Duck demo covers every outcome branch" ✓; |
| Duck demo scores none, one match and a multi-match (duck) | unit |  `src/lib/games/duck/demo.test.ts` › "Scenario: Duck demo covers every outcome branch" ✓; |
| Duck demo loses letters to elimination (duck) | unit |  `src/lib/games/duck/demo.test.ts` › "Scenario: Duck demo covers every outcome branch" ✓; |
| Duck demo ends at target with an elimination (duck) | unit |  `src/lib/games/duck/demo.test.ts` › "Scenario: Duck demo covers every outcome branch" ✓; |
| Duck demo plays a new round (duck) | unit |  `src/lib/games/duck/demo.test.ts` › "Scenario: Duck demo covers every outcome branch" ✓; |
| Duck demo by tapping highlighted controls (duck) | e2e |  `e2e/duck.test.ts` › "Scenario: Duck demo by tapping highlighted controls" ✓; |
| Duck cues sound right (duck) | manual (audio judgement on a real device at Gate 2) | manual: Gate 2 checklist |
| Feud demo script plays to the end (feud) | unit |  `src/lib/games/feud/demo.test.ts` › "Scenario: Feud demo script plays to the end" ✓; |
| Feud demo face-off branches (feud) | unit |  `src/lib/games/feud/demo.test.ts` › "Scenario: Feud demo covers every outcome branch" ✓; |
| Feud demo plays and passes (feud) | unit |  `src/lib/games/feud/demo.test.ts` › "Scenario: Feud demo covers every outcome branch" ✓; |
| Feud demo clears a board (feud) | unit |  `src/lib/games/feud/demo.test.ts` › "Scenario: Feud demo covers every outcome branch" ✓; |
| Feud demo steals once and misses once (feud) | unit |  `src/lib/games/feud/demo.test.ts` › "Scenario: Feud demo covers every outcome branch" ✓; |
| Feud demo last round counts double (feud) | unit |  `src/lib/games/feud/demo.test.ts` › "Scenario: Feud demo covers every outcome branch" ✓; |
| Feud demo ends in sudden death (feud) | unit |  `src/lib/games/feud/demo.test.ts` › "Scenario: Feud demo covers every outcome branch" ✓; |
| Feud demo names undo (feud) | unit |  `src/lib/games/feud/demo.test.ts` › "Scenario: Feud demo covers every outcome branch" ✓; |
| Feud demo by tapping highlighted controls (feud) | e2e |  `e2e/feud-demo.test.ts` › "Scenario: Feud demo by tapping highlighted controls" ✓; |
| Feud demo leaves data untouched (feud) | e2e |  `e2e/feud-demo.test.ts` › "Scenario: Feud demo leaves data untouched" ✓; |
| Feud demo completes with reduced motion (feud) | e2e |  `e2e/feud-demo.test.ts` › "Scenario: Feud demo completes with reduced motion" ✓; |
| Imposter demo script plays to the end (imposter) | unit |  `src/lib/games/imposter/demo.test.ts` › "Scenario: Imposter demo script plays to the end" ✓; |
| Imposter demo skip redraws mid-reveal (imposter) | unit |  `src/lib/games/imposter/demo.test.ts` › "Scenario: Imposter demo covers every outcome branch" ✓; |
| Imposter demo reveals the crew question and the imposter (imposter) | unit |  `src/lib/games/imposter/demo.test.ts` › "Scenario: Imposter demo covers every outcome branch" ✓; |
| Imposter demo plays a second round (imposter) | unit |  `src/lib/games/imposter/demo.test.ts` › "Scenario: Imposter demo covers every outcome branch" ✓; |
| Imposter demo narrates caught and not caught (imposter) | unit |  `src/lib/games/imposter/demo.test.ts` › "Scenario: Imposter demo covers every outcome branch" ✓; |
| Imposter demo by tapping highlighted controls (imposter) | e2e |  `e2e/demo.test.ts` › "Scenario: Imposter demo by tapping highlighted controls" ✓; |
| Most Likely lobby offers rounds (most-likely) | e2e |  `e2e/most-likely.test.ts` › "Scenario: Most Likely lobby offers rounds" ✓; |
| Most Likely needs four players (most-likely) | e2e |  `e2e/most-likely.test.ts` › "Scenario: Most Likely needs four players" ✓; |
| Most Likely roster above maximum asks who plays (most-likely) | e2e |  `e2e/most-likely.test.ts` › "Scenario: Most Likely roster above maximum asks who plays" ✓; |
| Most Likely prompts do not repeat until the pool is used (most-likely) | unit |  `src/lib/games/most-likely/engine.test.ts` › "Scenario: Most Likely prompts do not repeat until the pool is used" ✓; |
| Anderer Spruch returns the rejected prompt (most-likely) | unit |  `src/lib/games/most-likely/engine.test.ts` › "Scenario: Anderer Spruch returns the rejected prompt" ✓; |
| Most Likely pool of one keeps its prompt (most-likely) | unit |  `src/lib/games/most-likely/engine.test.ts` › "Scenario: Most Likely pool of one keeps its prompt" ✓; |
| Most Likely Endstand ranks teams (most-likely) | e2e |  `e2e/most-likely.test.ts` › "Scenario: Most Likely Endstand ranks teams" ✓; |
| Most Likely tie at the top reads Unentschieden (most-likely) | e2e |  `e2e/most-likely.test.ts` › "Scenario: Most Likely tie at the top reads Unentschieden" ✓; |
| Most Likely rematch keeps the teams (most-likely) | unit |  `src/lib/games/most-likely/engine.test.ts` › "Scenario: Most Likely rematch keeps the teams" ✓; |
| Most Likely engine is deterministic and pure (most-likely) | unit |  `src/lib/games/most-likely/engine.test.ts` › "Scenario: Most Likely engine is deterministic and pure" ✓; |
| Most Likely session resumes after reload (most-likely) | e2e |  `e2e/most-likely.test.ts` › "Scenario: Most Likely session resumes after reload" ✓; |
| Old Most Likely session is discarded (most-likely) | e2e |  `e2e/most-likely.test.ts` › "Scenario: Old Most Likely session is discarded" ✓; |
| Leaving Most Likely asks for confirmation (most-likely) | e2e |  `e2e/most-likely.test.ts` › "Scenario: Leaving Most Likely asks for confirmation" ✓; |
| Most Likely demo script plays to the end (most-likely) | unit |  `src/lib/games/most-likely/demo.test.ts` › "Scenario: Most Likely demo script plays to the end" ✓; |
| Most Likely demo plays two teams of two (most-likely) | unit |  `src/lib/games/most-likely/demo.test.ts` › "Scenario: Most Likely demo covers every outcome branch" ✓; |
| Most Likely demo full match (most-likely) | unit |  `src/lib/games/most-likely/demo.test.ts` › "Scenario: Most Likely demo covers every outcome branch" ✓; |
| Most Likely demo no match (most-likely) | unit |  `src/lib/games/most-likely/demo.test.ts` › "Scenario: Most Likely demo covers every outcome branch" ✓; |
| Most Likely demo redraw (most-likely) | unit |  `src/lib/games/most-likely/demo.test.ts` › "Scenario: Most Likely demo covers every outcome branch" ✓; |
| Most Likely demo rounds and opener rotation (most-likely) | unit |  `src/lib/games/most-likely/demo.test.ts` › "Scenario: Most Likely demo covers every outcome branch" ✓; |
| Most Likely demo game over and rematch (most-likely) | unit |  `src/lib/games/most-likely/demo.test.ts` › "Scenario: Most Likely demo covers every outcome branch" ✓; |
| Most Likely demo names what two teams of two cannot show (most-likely) | unit |  `src/lib/games/most-likely/demo.test.ts` › "Scenario: Most Likely demo covers every outcome branch" ✓; |
| Most Likely demo by tapping highlighted controls (most-likely) | e2e |  `e2e/most-likely.test.ts` › "Scenario: Most Likely demo by tapping highlighted controls" ✓; |
| Most Likely cues sound right (most-likely) | manual (audio judgement on a real device at Gate 2) | manual: Gate 2 checklist |
| Most Likely art on tile and start screen (most-likely) | e2e |  `e2e/most-likely.test.ts` › "Scenario: Most Likely art on tile and start screen" ✓; |
| Most Likely screens meet the look rules (most-likely) | e2e |  `e2e/look.test.ts` › "Scenario: Text contrast meets 4.5:1" ✓; `e2e/look.test.ts` › "Scenario: Touch targets are at least 44px" ✓; `e2e/look.test.ts` › "Scenario: No horizontal scroll on phone" ✓; |
| Most Likely copy reads neutral (most-likely) | e2e |  `e2e/most-likely.test.ts` › "Scenario: Most Likely copy reads neutral" ✓; |
| Most Likely deals teams evenly (most-likely) | unit |  `src/lib/games/most-likely/engine.test.ts` › "Scenario: Most Likely deals teams evenly" ✓; |
| Most Likely team stepper is bounded by the players (most-likely) | e2e |  `e2e/most-likely.test.ts` › "Scenario: Most Likely team stepper is bounded by the players" ✓; |
| Most Likely chip moves a player to the next team (most-likely) | e2e |  `e2e/most-likely.test.ts` › "Scenario: Most Likely chip moves a player to the next team" ✓; |
| Most Likely team of one blocks the start (most-likely) | e2e |  `e2e/most-likely.test.ts` › "Scenario: Most Likely team of one blocks the start" ✓; |
| Most Likely shuffle keeps the team sizes (most-likely) | e2e |  `e2e/most-likely.test.ts` › "Scenario: Most Likely shuffle keeps the team sizes" ✓; |
| Most Likely shows umlaut names as entered (most-likely) | e2e |  `e2e/most-likely.test.ts` › "Scenario: Most Likely shows umlaut names as entered" ✓; |
| Most Likely opener comes from the RNG (most-likely) | unit |  `src/lib/games/most-likely/engine.test.ts` › "Scenario: Most Likely opener comes from the RNG" ✓; |
| Most Likely opener rotates each round (most-likely) | unit |  `src/lib/games/most-likely/engine.test.ts` › "Scenario: Most Likely opener rotates each round" ✓; |
| Most Likely turn screen names the team (most-likely) | e2e |  `e2e/most-likely.test.ts` › "Scenario: Most Likely turn screen names the team" ✓; |
| Most Likely count choices follow the team size (most-likely) | e2e |  `e2e/most-likely.test.ts` › "Scenario: Most Likely count choices follow the team size" ✓; |
| Most Likely team scores its largest group (most-likely) | unit |  `src/lib/games/most-likely/engine.test.ts` › "Scenario: Most Likely team scores its largest group" ✓; |
| Most Likely ignores impossible counts (most-likely) | unit |  `src/lib/games/most-likely/engine.test.ts` › "Scenario: Most Likely ignores impossible counts" ✓; |
| Most Likely keeps no record of who pointed at whom (most-likely) | unit |  `src/lib/games/most-likely/engine.test.ts` › "Scenario: Most Likely keeps no record of who pointed at whom" ✓; |
| Most Likely result names the next step (most-likely) | e2e |  `e2e/most-likely.test.ts` › "Scenario: Most Likely result names the next step" ✓; |
| Full Most Likely team game (most-likely) | e2e |  `e2e/most-likely.test.ts` › "Scenario: Full Most Likely team game" ✓; |
| Wavelength demo script plays to the end (wavelength) | unit |  `src/lib/games/wavelength/engine.test.ts` › "Scenario: Wavelength demo script plays to the end" ✓; |
| Wavelength demo stays the Versus demo (wavelength) | unit |  `src/lib/games/wavelength/engine.test.ts` › "Scenario: Wavelength demo stays the Versus demo" ✓; |
| Wavelength demo scores 4, 3, 2 and 0 (wavelength) | unit |  `src/lib/games/wavelength/demo.test.ts` › "Scenario: Wavelength demo covers every outcome branch" ✓; |
| Wavelength demo redraws before and after the target is shown (wavelength) | unit |  `src/lib/games/wavelength/demo.test.ts` › "Scenario: Wavelength demo covers every outcome branch" ✓; |
| Wavelength demo plays a second round (wavelength) | unit |  `src/lib/games/wavelength/demo.test.ts` › "Scenario: Wavelength demo covers every outcome branch" ✓; |
| Wavelength demo ends with a winner and plays again (wavelength) | unit |  `src/lib/games/wavelength/demo.test.ts` › "Scenario: Wavelength demo covers every outcome branch" ✓; |
| Wavelength demo names Koop (wavelength) | unit |  `src/lib/games/wavelength/demo.test.ts` › "Scenario: Wavelength demo covers every outcome branch" ✓; |
| Wavelength demo by tapping highlighted controls (wavelength) | e2e |  `e2e/demo.test.ts` › "Scenario: Wavelength demo by tapping highlighted controls" ✓; |
| Turn verdicts read neutral (wavelength) | e2e |  `e2e/wavelength.test.ts` › "Scenario: Turn verdicts read neutral" ✓; |
| Wavelength demo tips read neutral (wavelength) | unit |  `src/lib/games/wavelength/demo.test.ts` › "Scenario: Wavelength demo tips read neutral" ✓; |

## Manual checklist (run: `npm run dev` → http://localhost:5173)
- Codes, Duck, Most Likely: play a round on a real device and judge the sound cues (3 'cues sound right' scenarios).
- Any demo: step through and read the tips for wording; each should say why the step happens (Demo tips say why the step happens).

## Diffstat
```
 CLAUDE.md                                          |   1 -
 e2e/codes.test.ts                                  |   6 +-
 e2e/deco.test.ts                                   |   2 +-
 e2e/demo.test.ts                                   |  44 ++-
 e2e/duck.test.ts                                   |  17 +-
 e2e/explain.test.ts                                |  65 ----
 e2e/feud-demo.test.ts                              |   2 +
 e2e/fixtures/explain/index.html                    |  30 --
 e2e/fixtures/explain/pixel.png                     | Bin 74 -> 0 bytes
 e2e/home.test.ts                                   |   2 +-
 e2e/look.test.ts                                   |  17 +-
 e2e/most-likely.test.ts                            | 376 ++++++++++++++++-----
 e2e/start.test.ts                                  |  24 +-
 e2e/walks/most-likely.ts                           |  28 +-
 .../revise-demos-most-likely/.openspec.yaml        |   2 +
 .../changes/revise-demos-most-likely/design.md     | 151 +++++++++
 .../changes/revise-demos-most-likely/flow.yaml     |  14 +
 .../changes/revise-demos-most-likely/proposal.md   |  70 ++++
 openspec/changes/revise-demos-most-likely/scope.md |  73 ++++
 .../specs/catalogue/spec.md                        | 116 +++++++
 .../revise-demos-most-likely/specs/codes/spec.md   |  62 ++++
 .../revise-demos-most-likely/specs/demo/spec.md    |  63 ++++
 .../revise-demos-most-likely/specs/duck/spec.md    |  68 ++++
 .../revise-demos-most-likely/specs/feud/spec.md    |  70 ++++
 .../specs/imposter/spec.md                         |  39 +++
 .../specs/most-likely/spec.md                      | 267 +++++++++++++++
 .../specs/wavelength/spec.md                       |  64 ++++
 openspec/changes/revise-demos-most-likely/tasks.md |  69 ++++
 openspec/specs/explanation/spec.md                 |  28 --
 src/lib/games/codes/demo.test.ts                   |  80 ++++-
 src/lib/games/codes/demo.ts                        |  90 ++++-
 src/lib/games/duck/Screen.svelte                   |  10 +-
 src/lib/games/duck/demo.test.ts                    | 108 ++++--
 src/lib/games/duck/demo.ts                         |  66 +++-
 src/lib/games/feud/Screen.svelte                   |   9 +-
 src/lib/games/feud/demo.test.ts                    | 103 +++++-
 src/lib/games/feud/demo.ts                         | 173 +++++++++-
 src/lib/games/imposter/Screen.svelte               |   9 +-
 src/lib/games/imposter/demo.test.ts                |  83 +++++
 src/lib/games/imposter/demo.ts                     |  57 ++--
 src/lib/games/imposter/engine.test.ts              |  34 --
 src/lib/games/most-likely/Screen.svelte            | 260 ++++++++------
 src/lib/games/most-likely/Setup.svelte             | 225 +++++++++---
 src/lib/games/most-likely/demo.test.ts             | 114 +++++--
 src/lib/games/most-likely/demo.ts                  |  63 +++-
 src/lib/games/most-likely/engine.test.ts           | 273 ++++++++++-----
 src/lib/games/most-likely/engine.ts                | 146 +++++---
 src/lib/games/most-likely/index.ts                 |   2 +-
 src/lib/games/registry.test.ts                     |   6 +-
 src/lib/games/wavelength/demo.test.ts              |  75 +++-
 src/lib/games/wavelength/demo.ts                   | 103 +++++-
 src/lib/games/wavelength/engine.test.ts            |  10 +-
 src/routes/spiele/[slug]/+page.svelte              |  16 +-
 src/routes/spiele/[slug]/erklaerung/+page.svelte   | 157 ---------
 static/explain/README.md                           |  35 --
 55 files changed, 3104 insertions(+), 973 deletions(-)
```

## Screenshots
204 files in `openspec/changes/revise-demos-most-likely/shots/` (phone-* and desktop-*, e.g. `shots/desktop-look-duck-scoring.png`).
