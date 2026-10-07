Every behaviour task writes its scenario tests first, named "Scenario: <title>" as in the specs, from the THEN
clauses, and watches them fail before the code. Copy is neutral German, no "!" and no emoji. Every test a unit
breaks is fixed in that unit (Rue at Gate 0); shared files and their owners: design.md → Shared test files. Most
Likely shapes: design.md → Contracts. Branches a demo cannot show and the Screen fixes each demo needs: design.md →
Branch checklist per engine, Controls the demo cannot reach today. `src/lib/demo/runner.ts`, `runner.test.ts` and
`registry.ts` stay unchanged and green. Archive reference for Most Likely (turn order, prompt reset, result/Endstand
flow only; Rue's scoring and team rules win): `/home/Rue/Repos/00_Archive/Party-Games/`.

Waves: Wave 1: U1 ∥ U2 ∥ U3 · Wave 2: U4 ∥ U5 ∥ U6 · Wave 3: U7 ∥ U8.

## 1. Most Likely team game (Model: opus)

> unit: depends=none · scope=S9,S10,S11,S12 · files=src/lib/games/most-likely/engine.ts, src/lib/games/most-likely/engine.test.ts, src/lib/games/most-likely/index.ts, src/lib/games/most-likely/demo.ts, src/lib/games/most-likely/demo.test.ts, src/lib/games/most-likely/Setup.svelte, src/lib/games/most-likely/Screen.svelte, src/lib/games/registry.test.ts, src/routes/spiele/[slug]/+page.svelte, e2e/most-likely.test.ts, e2e/walks/most-likely.ts, e2e/home.test.ts, e2e/deco.test.ts, e2e/start.test.ts

- [x] 1.1 Engine on team rules per design.md ## Contracts: config with teams, `dealTeams`, `maxTeams`, `choices`, opener from the RNG and rotation (`order`, `current`), phases prompt → count → result → gameOver, `score` with `matched`, per-turn prompt draw, `ranking`/`leaders`, rematch, `minPlayers` 4, `stateVersion` 2; rewrite `engine.test.ts`; update the Most Likely range in `registry.test.ts` (Scenario: Most Likely deals teams evenly · Most Likely opener comes from the RNG · Most Likely opener rotates each round · Most Likely team scores its largest group · Most Likely ignores impossible counts · Most Likely keeps no record of who pointed at whom · Most Likely prompts do not repeat until the pool is used · Anderer Spruch returns the rejected prompt · Most Likely pool of one keeps its prompt · Most Likely rematch keeps the teams · Most Likely engine is deterministic and pure · Player range derived from engine limits)
- [x] 1.2 Interim demo on the new types: Alex & Bo vs Cleo & Dani, a few steps (point, score, next), so `runner.test.ts`, `registry.test.ts` ("every demo starts from four players") and the demo tap-through in `e2e/most-likely.test.ts` stay green; the tap-through reads its step count from the script (Scenario: Most Likely demo script plays to the end; unchanged and green: Most Likely demo by tapping highlighted controls). U4 replaces the script.
- [x] 1.3 Setup: team lobby after `wavelength/Setup.svelte` — stepper 2…`maxTeams(n)`, default 2, chip tap to the next team, "Mischen", `role="alert"` for a team under 2, neutral hint for sizes differing by more than 1, rounds 5/10/15/20 default 10 (Scenario: Most Likely lobby offers rounds · Most Likely needs four players · Most Likely roster above maximum asks who plays · Most Likely team stepper is bounded by the players · Most Likely chip moves a player to the next team · Most Likely team of one blocks the start · Most Likely shuffle keeps the team sizes · Most Likely shows umlaut names as entered)
- [x] 1.4 Screen: turn ("<Team> ist dran", names, prompt, "Runde r / R", "Team k / n", hint, "Alle haben gezeigt", "Anderer Spruch"), count choices (only the scripted one `expected` in a demo), result with the prompt, points and "Nächstes Team" / "Nächste Runde" / "Zum Ergebnis", team Endstand with "Unentschieden" and "Nochmal spielen"; sounds reveal on the result and win at the Endstand; rewrite `e2e/most-likely.test.ts` (Scenario: Most Likely turn screen names the team · Most Likely count choices follow the team size · Most Likely result names the next step · Full Most Likely team game · Most Likely Endstand ranks teams · Most Likely tie at the top reads Unentschieden · Most Likely session resumes after reload · Old Most Likely session is discarded · Leaving Most Likely asks for confirmation · Most Likely copy reads neutral; unchanged and green: Most Likely art on tile and start screen)
- [x] 1.5 Copy and walk: pitch in `index.ts`, Most Likely "So geht's" in the start page's `rules` (only that entry; the cards are U6's), `home.test.ts`, `deco.test.ts` and the Most Likely lines of `start.test.ts`; `e2e/walks/most-likely.ts` shoots start, lobby with teams, turn, count, result and Endstand; run `proof:full` green (Scenario: Tiles for registered games · Each tile shows a one-line pitch · So geht's for the new games · New start banners carry title, badge and range · Most Likely screens meet the look rules, via Text contrast meets 4.5:1 · Touch targets are at least 44px · No horizontal scroll on phone)

## 2. Imposter demo

> unit: depends=none · scope=S2,S3 · files=src/lib/games/imposter/demo.ts, src/lib/games/imposter/demo.test.ts, src/lib/games/imposter/Screen.svelte, e2e/demo.test.ts

- [x] 2.1 Script and new `demo.test.ts`: two rounds, a skip mid-reveal, crew and imposter reveals per round, `nextRound`, tips that say why, narrate one caught and one uncaught imposter and say rounds go on until "Spiel beenden" (Scenario: Imposter demo script plays to the end · Imposter demo covers every outcome branch, proving: Imposter demo skip redraws mid-reveal · Imposter demo reveals the crew question and the imposter · Imposter demo plays a second round · Imposter demo narrates caught and not caught)
- [x] 2.2 Skip in the demo: `Screen.svelte` leaves exactly one expected control while the skip confirmation is involved (design.md → Controls the demo cannot reach today); `e2e/demo.test.ts` reads the Imposter step count from the script and updates its Imposter-specific steps (Scenario: Imposter demo by tapping highlighted controls; unchanged and green: Only the expected control is enabled · Hidden information shown with Demo tag · Demo leaves real data untouched · Reload during demo returns to start screen · Demo steppable with reduced motion · Demo works with an empty database · Demo leaves saved players untouched)

## 3. Family Feud demo

> unit: depends=none · scope=S2,S5 · files=src/lib/games/feud/demo.ts, src/lib/games/feud/demo.test.ts, src/lib/games/feud/Screen.svelte, e2e/feud-demo.test.ts

- [x] 3.1 Script and `demo.test.ts`: three regular surveys plus the tiebreak, points chosen so the scores tie after the ×2 final; face-off miss-then-hit, both miss, number one at once, higher of two hits; Spielen and Passen; a cleared board; a successful and a failed steal; sudden death; a tip naming "Rückgängig" (Scenario: Feud demo script plays to the end · Feud demo covers every outcome branch, proving: Feud demo face-off branches · Feud demo plays and passes · Feud demo clears a board · Feud demo steals once and misses once · Feud demo last round counts double · Feud demo ends in sudden death · Feud demo names undo)
- [x] 3.2 Miss in the demo: `Screen.svelte` makes "Nicht auf der Tafel" the expected control when the scripted face-off answer or steal has `tile: null`; update `e2e/feud-demo.test.ts` (Scenario: Feud demo by tapping highlighted controls · Long demo progress reads correctly; unchanged and green: Feud demo leaves data untouched · Feud demo completes with reduced motion)

## 4. Most Likely demo

> unit: depends=1 · scope=S2,S8 · files=src/lib/games/most-likely/demo.ts, src/lib/games/most-likely/demo.test.ts, e2e/most-likely.test.ts

- [x] 4.1 Script and `demo.test.ts` on U1's engine: Alex & Bo vs Cleo & Dani, 5 rounds, full matches (2) and no matches (0), a redraw, opener rotation, a winning team, "Nochmal spielen" as the last step, tips naming the partial match of larger teams and "Unentschieden" (Scenario: Most Likely demo covers every outcome branch, proving: Most Likely demo plays two teams of two · Most Likely demo full match · Most Likely demo no match · Most Likely demo redraw · Most Likely demo rounds and opener rotation · Most Likely demo game over and rematch · Most Likely demo names what two teams of two cannot show; extended: Most Likely demo script plays to the end)
- [x] 4.2 Update the demo scenario in `e2e/most-likely.test.ts`: one highlighted control per step, the count choice included, through the Endstand (Scenario: Most Likely demo by tapping highlighted controls · Long demo progress reads correctly)

## 5. Wavelength demo

> unit: depends=2 · scope=S2,S4 · files=src/lib/games/wavelength/demo.ts, src/lib/games/wavelength/demo.test.ts, e2e/demo.test.ts

- [x] 5.1 Script and `demo.test.ts`: Versus, 2 rounds, redraw in prep and after "Ziel anzeigen", results 4, 3, 2 and 0, a winning team, "Nochmal spielen" as the last step, tips with the verdicts and a Koop mention (Scenario: Wavelength demo script plays to the end · Wavelength demo stays the Versus demo · Wavelength demo tips read neutral · Wavelength demo covers every outcome branch, proving: Wavelength demo scores 4, 3, 2 and 0 · Wavelength demo redraws before and after the target is shown · Wavelength demo plays a second round · Wavelength demo ends with a winner and plays again · Wavelength demo names Koop)
- [x] 5.2 `e2e/demo.test.ts` reads the Wavelength step count from the script and updates its Wavelength-specific steps (Scenario: Wavelength demo by tapping highlighted controls; unchanged and green: Only the expected control is enabled · Hidden information shown with Demo tag · Demo leaves real data untouched · Exiting returns to the starting screen · Demo steppable with reduced motion · Demo works with an empty database)

## 6. Start page without Erklärung

> unit: depends=1 · scope=S1 · files=src/routes/spiele/[slug]/+page.svelte, src/routes/spiele/[slug]/erklaerung/+page.svelte, static/explain/README.md, e2e/explain.test.ts, e2e/fixtures/explain/index.html, e2e/fixtures/explain/pixel.png, e2e/start.test.ts, e2e/look.test.ts, openspec/specs/explanation/spec.md

- [x] 6.1 Start page: the "Mehr zu" box holds Demo (first, line "Spiel per Demo lernen, mehrere Runden zum Mittippen", final wording from Gate 1) and Inhalte; update `start.test.ts` (Scenario: Mehr-zu cards keep their targets · Family Feud Inhalte card counts the seeded surveys · Los geht's opens the lobby; unchanged and green: Start banner carries title, badge and player range · Start panel first on phone, right column on desktop · Inhalte card shows the real content count · So geht's covers both Wavelength modes)
- [x] 6.2 ⚠ irreversible (deletion, recoverable only from git): delete `src/routes/spiele/[slug]/erklaerung/`, `static/explain/`, `e2e/explain.test.ts`, `e2e/fixtures/explain/`; drop the explain fixture route and the two erklaerung shots from `look.test.ts` (Scenario: Old Erklärung link is not found; unchanged and green: Text contrast meets 4.5:1 · Touch targets are at least 44px · No horizontal scroll on phone · New copy has no exclamation marks)
- [x] 6.3 ⚠ irreversible (deletion of a main spec, recoverable only from git): delete `openspec/specs/explanation/` — OpenSpec 1.4.1 refuses to archive a delta that empties a capability, so the change carries no `explanation` delta; check `openspec validate --specs --strict` stays green

## 7. Codes demo

> unit: depends=none · scope=S2,S6 · files=src/lib/games/codes/demo.ts, src/lib/games/codes/demo.test.ts, e2e/codes.test.ts

- [x] 7.1 Script and `demo.test.ts`: 4 rounds — 3 points first try, miss then 2 points by the other team, both teams miss then 1 point, three misses then "Überspringen"; a redraw; opener and explainer rotation; a winning team; "Nochmal spielen" as the last step (Scenario: Codes demo script plays to the end · Codes demo covers every outcome branch, proving: Codes demo scores 3, 2 and 1 and skips once · Codes demo redraws a word · Codes demo rotates opener and explainer · Codes demo ends with a winner and plays again)
- [x] 7.2 Update the demo scenario in `e2e/codes.test.ts` (Scenario: Codes demo by tapping highlighted controls)

## 8. Duck demo

> unit: depends=none · scope=S2,S7 · files=src/lib/games/duck/demo.ts, src/lib/games/duck/demo.test.ts, src/lib/games/duck/Screen.svelte, e2e/duck.test.ts

- [x] 8.1 Script and `demo.test.ts`: Zielpunkte 10, a skip, a no-score word, a one-match word with Chuck's +2, a multi-match word, one letter per word lost by one player down to 0, a final word with 10 points and the last letter at once (reason "target"), a tip naming the lives-only end, "Neue Runde" as the last step (Scenario: Duck demo script plays to the end · Duck demo covers every outcome branch, proving: Duck demo skips a word · Duck demo scores none, one match and a multi-match · Duck demo loses letters to elimination · Duck demo ends at target with an elimination · Duck demo plays a new round)
- [x] 8.2 Skip in the demo: `Screen.svelte` leaves exactly one expected control while the skip confirmation is involved (design.md → Controls the demo cannot reach today); update the demo scenario and its shot step in `e2e/duck.test.ts` (Scenario: Duck demo by tapping highlighted controls · Long demo progress reads correctly)
