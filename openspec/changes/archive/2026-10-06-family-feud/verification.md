verified-at: 29fb8d4

# Verification: family-feud

## Layer 1: proof:full

Result: green (EXIT=0). Unit: 31 files, 270 tests passed. e2e: 380 passed, 2 skipped (project-specific: `No horizontal scroll on phone` on desktop, `Desktop uses the width` on phone). Round 3, after the fixer's steal-handoff, play-correct and loopback-origin changes.

```
  ✓  371 [desktop] › e2e/look.test.ts:298:1 › Scenario: Press Start 2P stays limited to logo and scores (58.8s)
  ✓  370 [phone] › e2e/look.test.ts:327:1 › Scenario: Decoration loads no external assets (1.2m)
  ✓  373 [phone] › e2e/look.test.ts:347:1 › Scenario: New copy has no exclamation marks (1.1m)
  ✓  372 [desktop] › e2e/look.test.ts:327:1 › Scenario: Decoration loads no external assets (1.2m)
  ✓  375 [desktop] › e2e/look.test.ts:347:1 › Scenario: New copy has no exclamation marks (1.0m)
  -  376 [desktop] › e2e/look.test.ts:362:1 › Scenario: No horizontal scroll on phone
  ✓  374 [phone] › e2e/look.test.ts:362:1 › Scenario: No horizontal scroll on phone (1.2m)
  -  378 [phone] › e2e/look.test.ts:367:1 › Scenario: Desktop uses the width
  ✓  379 [phone] › e2e/look.test.ts:485:2 › reduced motion › Scenario: Reduced motion makes transitions instant (233ms)
  ✓  380 [phone] › e2e/look.test.ts:497:1 › Scenario: Motion never blocks input (321ms)
  ✓  377 [desktop] › e2e/look.test.ts:367:1 › Scenario: Desktop uses the width (1.3m)
  ✓  381 [desktop] › e2e/look.test.ts:485:2 › reduced motion › Scenario: Reduced motion makes transitions instant (252ms)
  ✓  382 [desktop] › e2e/look.test.ts:497:1 › Scenario: Motion never blocks input (267ms)

  Slow test file: [phone] › e2e/look.test.ts (7.0m)
  Slow test file: [desktop] › e2e/look.test.ts (6.9m)
  Consider running tests from slow files in parallel. See: https://playwright.dev/docs/test-parallel
  2 skipped
  380 passed (8.4m)
EXIT=0
```

## Layer 2: spec coverage

Gaps: none. 115 scenarios: 112 with a passing test (44 unit, 68 e2e), 3 manual. Changed vs round 2: the "Overlong survey text rejected" row now points at `src/lib/server/surveys.test.ts` (round 2 named `src/lib/content/survey.test.ts`, which does not hold that test); the look-rules row's "No horizontal scroll on phone" moved from `look.test.ts:361` to `:362`. The steal-handoff demo exception and the "demo excepted" look wording add no scenario.

| Scenario | proof | Evidence |
|---|---|---|
| Tiles for registered games | e2e | `e2e/home.test.ts:6` › "Scenario: Tiles for registered games" ✓ (desktop+phone) |
| Player range derived from engine limits | unit | `src/lib/games/registry.test.ts` › "Player range derived from engine limits" ✓ |
| Bald tiles have no actions | e2e | `e2e/home.test.ts:26` › "Scenario: Bald tiles have no actions" ✓ (desktop+phone) |
| Each tile shows a one-line pitch | e2e | `e2e/deco.test.ts:13` › "Scenario: Each tile shows a one-line pitch" ✓ (desktop+phone) |
| Start banner carries title, badge and player range | e2e | `e2e/start.test.ts:87` › "Scenario: Start banner carries title, badge and player range" ✓ (desktop+phone) |
| Start panel first on phone, right column on desktop | e2e | `e2e/start.test.ts:181` › "Scenario: Start panel first on phone, right column on desktop" ✓ (desktop+phone) |
| Same start layout for both games | e2e ("Scenario: Start panel first on phone, right column on desktop") | `e2e/start.test.ts:181` › "Scenario: Start panel first on phone, right column on desktop" ✓ (desktop+phone) |
| Mehr-zu cards keep their targets | e2e | `e2e/start.test.ts:223` › "Scenario: Mehr-zu cards keep their targets" ✓ (desktop+phone) |
| Inhalte card shows the real content count | e2e | `e2e/start.test.ts:244` › "Scenario: Inhalte card shows the real content count" ✓ (desktop+phone) |
| Los geht's opens the lobby | e2e | `e2e/start.test.ts:69` › "Scenario: Los geht's opens the lobby" ✓ (desktop+phone) |
| So geht's covers both Wavelength modes | e2e | `e2e/start.test.ts:80` › "Scenario: So geht's covers both Wavelength modes" ✓ (desktop+phone) |
| Family Feud banner carries title, badge and range | e2e | `e2e/start.test.ts:129` › "Scenario: Family Feud banner carries title, badge and range" ✓ (desktop+phone) |
| So geht's for Family Feud | e2e | `e2e/start.test.ts:141` › "Scenario: So geht's for Family Feud" ✓ (desktop+phone) |
| Family Feud Inhalte card counts the seeded surveys | e2e | `e2e/start.test.ts:150` › "Scenario: Family Feud Inhalte card counts the seeded surveys" ✓ (desktop+phone) |
| Add, edit and delete a survey | e2e | `e2e/feud-content.test.ts:12` › "Scenario: Add, edit and delete a survey" ✓ (desktop+phone) |
| Survey board order by points | unit | `src/lib/server/surveys.test.ts` › "Survey board order by points" ✓ |
| Duplicate survey question rejected | unit | `src/lib/server/surveys.test.ts` › "Duplicate survey question rejected" ✓ |
| Duplicate answer within a survey rejected | unit | `src/lib/server/surveys.test.ts` › "Duplicate answer within a survey rejected" ✓ |
| Survey points must be whole numbers above zero | unit | `src/lib/server/surveys.test.ts` › "Survey points must be whole numbers above zero" ✓ |
| Survey points sum at most 100 | unit | `src/lib/server/surveys.test.ts` › "Survey points sum at most 100" ✓ |
| Survey needs three to eight answers | unit | `src/lib/server/surveys.test.ts` › "Survey needs three to eight answers" ✓ |
| Overlong survey text rejected | unit | `src/lib/server/surveys.test.ts` › "Overlong survey text rejected" ✓ |
| Survey bulk import reports per line | unit | `src/lib/server/surveys.test.ts` › "Survey bulk import reports per line" ✓ |
| Bulk import of surveys on the Inhalte page | e2e | `e2e/feud-content.test.ts:48` › "Scenario: Bulk import of surveys on the Inhalte page" ✓ (desktop+phone) |
| Deleting a survey removes its played-with entries | unit | `src/lib/server/surveys.test.ts` › "Deleting a survey removes its played-with entries" ✓ |
| Surveys seeded once | unit | `src/lib/server/surveys.test.ts` › "Surveys seeded once" ✓ |
| Deleted seed surveys stay deleted | unit | `src/lib/server/surveys.test.ts` › "Deleted seed surveys stay deleted" ✓ |
| Seed surveys are valid | unit | `src/lib/server/surveys.test.ts` › "Seed surveys are valid" ✓ |
| Family Feud colour meets contrast | unit | `src/lib/ui/tokens.test.ts` › "Family Feud colour meets contrast" ✓ |
| Family Feud gets its own motif | unit | `src/lib/deco/motifs.test.ts` › "Family Feud gets its own motif" ✓ |
| Family Feud tile carries its own badge | e2e | `e2e/deco.test.ts:222` › "Scenario: Family Feud tile carries its own badge" ✓ (desktop+phone) |
| Family Feud art on tile and start screen | e2e | `e2e/deco.test.ts:235` › "Scenario: Family Feud art on tile and start screen" ✓ (desktop+phone) |
| Feud guest blocks start | e2e | `e2e/feud-setup.test.ts:15` › "Scenario: Feud guest blocks start" ✓ (desktop+phone) |
| Feud roster of guests only | e2e | `e2e/feud-setup.test.ts:35` › "Scenario: Feud roster of guests only" ✓ (desktop+phone) |
| Feud with exactly four saved players | e2e | `e2e/feud-setup.test.ts:84` › "Scenario: Feud with exactly four saved players" ✓ (desktop+phone) |
| Feud needs four players | e2e | `e2e/feud-setup.test.ts:48` › "Scenario: Feud needs four players" ✓ (desktop+phone) |
| Feud takes twenty players | e2e | `e2e/feud-setup.test.ts:98` › "Scenario: Feud takes twenty players" ✓ (desktop+phone) |
| Feud roster above maximum asks who plays | e2e | `e2e/feud-setup.test.ts:64` › "Scenario: Feud roster above maximum asks who plays" ✓ (desktop+phone) |
| Feud teams dealt from the roster | e2e | `e2e/feud-setup.test.ts:112` › "Scenario: Feud teams dealt from the roster" ✓ (desktop+phone) |
| Feud tap moves a player and Mischen keeps all players | e2e | `e2e/feud-setup.test.ts:131` › "Scenario: Feud tap moves a player and Mischen keeps all players" ✓ (desktop+phone) |
| Feud team below two blocks Weiter | e2e | `e2e/feud-setup.test.ts:152` › "Scenario: Feud team below two blocks Weiter" ✓ (desktop+phone) |
| Feud empty team name falls back | e2e | `e2e/feud-setup.test.ts:166` › "Scenario: Feud empty team name falls back" ✓ (desktop+phone) |
| Feud identical team names rejected | e2e | `e2e/feud-setup.test.ts:182` › "Scenario: Feud identical team names rejected" ✓ (desktop+phone) |
| Feud too few surveys block start | e2e | `e2e/feud-setup.test.ts:198` › "Scenario: Feud too few surveys block start" ✓ (desktop+phone) |
| Feud prep shows who knows a survey | e2e | `e2e/feud-prep.test.ts:36` › "Scenario: Feud prep shows who knows a survey" ✓ (desktop+phone) |
| Feud prep sorts by known and by played | e2e | `e2e/feud-prep.test.ts:52` › "Scenario: Feud prep sorts by known and by played" ✓ (desktop+phone) |
| Feud prep refuses an extra pick | e2e | `e2e/feud-prep.test.ts:72` › "Scenario: Feud prep refuses an extra pick" ✓ (desktop+phone) |
| Feud survey everyone knows stays pickable | e2e | `e2e/feud-prep.test.ts:92` › "Scenario: Feud survey everyone knows stays pickable" ✓ (desktop+phone) |
| Feud prep opens a survey's answers | e2e | `e2e/feud-prep.test.ts:108` › "Scenario: Feud prep opens a survey's answers" ✓ (desktop+phone) |
| Feud prep removes a pick | e2e | `e2e/feud-prep.test.ts:128` › "Scenario: Feud prep removes a pick" ✓ (desktop+phone) |
| Feud Start hands over the picked surveys | e2e | `e2e/feud-prep.test.ts:147` › "Scenario: Feud Start hands over the picked surveys" ✓ (desktop+phone) |
| Feud fill keeps hand-picked surveys | unit | `src/lib/games/feud/prep.test.ts` › "Feud fill keeps hand-picked surveys" ✓ |
| Feud fill prefers unknown surveys | unit | `src/lib/games/feud/prep.test.ts` › "Feud fill prefers unknown surveys" ✓ |
| Feud fill falls back to the least known | unit | `src/lib/games/feud/prep.test.ts` › "Feud fill falls back to the least known" ✓ |
| Feud tiebreak survey drawn like the fill | unit | `src/lib/games/feud/prep.test.ts` › "Feud tiebreak survey drawn like the fill" ✓ |
| Feud fill avoids known surveys on the real store | e2e | `e2e/feud-prep.test.ts:174` › "Scenario: Feud fill avoids known surveys on the real store" ✓ (desktop+phone) |
| Feud fill disabled when all slots are picked | e2e | `e2e/feud-prep.test.ts:190` › "Scenario: Feud fill disabled when all slots are picked" ✓ (desktop+phone) |
| Feud prep edits a survey's played-with list | e2e | `e2e/feud-prep.test.ts:205` › "Scenario: Feud prep edits a survey's played-with list" ✓ (desktop+phone) |
| Feud played-with list hidden outside prep | e2e | `e2e/feud.test.ts:313` › "Scenario: Feud played-with list hidden outside prep" ✓ (desktop+phone) |
| Feud played-with has no duplicates | unit | `src/lib/server/played.test.ts` › "Feud played-with has no duplicates" ✓ |
| Feud played-with follows a deleted player | unit | `src/lib/server/played.test.ts` › "Feud played-with follows a deleted player" ✓ |
| Feud closed rounds are recorded | e2e | `e2e/feud-history.test.ts:53` › "Scenario: Feud closed rounds are recorded" ✓ (desktop+phone) |
| Feud early end records only closed rounds | e2e | `e2e/feud-history.test.ts:74` › "Scenario: Feud early end records only closed rounds" ✓ (desktop+phone) |
| Feud tiebreak survey is recorded | e2e | `e2e/feud-history.test.ts:95` › "Scenario: Feud tiebreak survey is recorded" ✓ (desktop+phone) |
| Feud peek shows the survey while held | e2e | `e2e/feud.test.ts:292` › "Scenario: Feud peek shows the survey while held" ✓ (desktop+phone) |
| Feud peek does not block a tile flip | e2e | `e2e/feud.test.ts:566` › "Scenario: Feud peek does not block a tile flip" ✓ (desktop+phone) |
| Feud peek instant under reduced motion | e2e | `e2e/feud.test.ts:596` › "Scenario: Feud peek instant under reduced motion" ✓ (desktop+phone) |
| Feud face-off names players in rotation | unit | `src/lib/games/feud/engine.test.ts` › "Feud face-off names players in rotation" ✓ |
| Feud face-off rotation wraps for a team of two | unit | `src/lib/games/feud/engine.test.ts` › "Feud face-off rotation wraps for a team of two" ✓ |
| Feud number one answer wins at once | unit | `src/lib/games/feud/engine.test.ts` › "Feud number one answer wins at once" ✓ |
| Feud higher answer wins the face-off | unit | `src/lib/games/feud/engine.test.ts` › "Feud higher answer wins the face-off" ✓ |
| Feud one miss loses the face-off | unit | `src/lib/games/feud/engine.test.ts` › "Feud one miss loses the face-off" ✓ |
| Feud both miss names the next pair | unit | `src/lib/games/feud/engine.test.ts` › "Feud both miss names the next pair" ✓ |
| Feud winner chooses Spielen or Passen | unit | `src/lib/games/feud/engine.test.ts` › "Feud winner chooses Spielen or Passen" ✓ |
| Feud face-off screen names both players | e2e | `e2e/feud.test.ts:62` › "Scenario: Feud face-off screen names both players" ✓ (desktop+phone) |
| Feud pot includes face-off answers | unit | `src/lib/games/feud/engine.test.ts` › "Feud pot includes face-off answers" ✓ |
| Feud strikes fill the pods | e2e | `e2e/feud.test.ts:176` › "Scenario: Feud strikes fill the pods" ✓ (desktop+phone) |
| Feud cleared board banks the pot | unit | `src/lib/games/feud/engine.test.ts` › "Feud cleared board banks the pot" ✓ |
| Feud third strike opens the steal | unit | `src/lib/games/feud/engine.test.ts` › "Feud third strike opens the steal" ✓ |
| Feud steal hit takes the pot | unit | `src/lib/games/feud/engine.test.ts` › "Feud steal hit takes the pot" ✓ |
| Feud steal miss leaves the pot | unit | `src/lib/games/feud/engine.test.ts` › "Feud steal miss leaves the pot" ✓ |
| Feud last round counts double | unit | `src/lib/games/feud/engine.test.ts` › "Feud last round counts double" ✓ |
| Feud single round counts double | unit | `src/lib/games/feud/engine.test.ts` › "Feud single round counts double" ✓ |
| Feud double round marked before it starts | e2e | `e2e/feud.test.ts:120` › "Scenario: Feud double round marked before it starts" ✓ (desktop+phone) |
| Feud result shows the remaining answers muted | e2e | `e2e/feud.test.ts:194` › "Scenario: Feud result shows the remaining answers muted" ✓ (desktop+phone) |
| Feud higher score wins | unit | `src/lib/games/feud/engine.test.ts` › "Feud higher score wins" ✓ |
| Feud tie goes to sudden death | unit | `src/lib/games/feud/engine.test.ts` › "Feud tie goes to sudden death" ✓ |
| Feud sudden death never ends in a draw | unit | `src/lib/games/feud/engine.test.ts` › "Feud sudden death never ends in a draw" ✓ |
| Full Feud game | e2e | `e2e/feud.test.ts:216` › "Scenario: Full Feud game" ✓ (desktop+phone) |
| Feud undo steps back through the round | unit | `src/lib/games/feud/engine.test.ts` › "Feud undo steps back through the round" ✓ |
| Feud undo stops at the round start | unit | `src/lib/games/feud/engine.test.ts` › "Feud undo stops at the round start" ✓ |
| Feud undo of the third strike returns to the board | unit | `src/lib/games/feud/engine.test.ts` › "Feud undo of the third strike returns to the board" ✓ |
| Feud undo fixes a mistap | e2e | `e2e/feud.test.ts:253` › "Scenario: Feud undo fixes a mistap" ✓ (desktop+phone) |
| Feud undo disabled with nothing to undo | e2e | `e2e/feud.test.ts:273` › "Scenario: Feud undo disabled with nothing to undo" ✓ (desktop+phone) |
| Feud engine is deterministic and pure | unit | `src/lib/games/feud/engine.test.ts` › "Feud engine is deterministic and pure" ✓ |
| Feud session resumes after reload | e2e | `e2e/feud.test.ts:338` › "Scenario: Feud session resumes after reload" ✓ (desktop+phone) |
| Feud game keeps its survey copy | e2e | `e2e/feud.test.ts:363` › "Scenario: Feud game keeps its survey copy" ✓ (desktop+phone) |
| Feud old or corrupt save discarded | e2e | `e2e/feud.test.ts:402` › "Scenario: Feud old or corrupt save discarded" ✓ (desktop+phone) |
| Leaving Feud clears the session | e2e | `e2e/feud.test.ts:420` › "Scenario: Leaving Feud clears the session" ✓ (desktop+phone) |
| Feud demo script plays to the end | unit | `src/lib/games/feud/demo.test.ts` › "Feud demo script plays to the end" ✓ |
| Feud demo by tapping highlighted controls | e2e | `e2e/feud-demo.test.ts:38` › "Scenario: Feud demo by tapping highlighted controls" ✓ (desktop+phone) |
| Feud demo leaves data untouched | e2e | `e2e/feud-demo.test.ts:54` › "Scenario: Feud demo leaves data untouched" ✓ (desktop+phone) |
| Feud demo completes with reduced motion | e2e | `e2e/feud-demo.test.ts:101` › "Scenario: Feud demo completes with reduced motion" ✓ (desktop+phone) |
| Feud board fits a phone | e2e | `e2e/feud.test.ts:446` › "Scenario: Feud board fits a phone" ✓ (desktop+phone) |
| Feud versus header shows both teams | e2e | `e2e/feud.test.ts:81` › "Scenario: Feud versus header shows both teams" ✓ (desktop+phone) |
| Feud handoff in team colour | e2e | `e2e/feud.test.ts:96` › "Scenario: Feud handoff in team colour" ✓ (desktop+phone) |
| Feud motion uses transform and opacity only | e2e | `e2e/feud.test.ts:467` › "Scenario: Feud motion uses transform and opacity only" ✓ (desktop+phone) |
| Feud motion never blocks input | e2e | `e2e/feud.test.ts:505` › "Scenario: Feud motion never blocks input" ✓ (desktop+phone) |
| Feud reduced motion is instant | e2e | `e2e/feud.test.ts:536` › "Scenario: Feud reduced motion is instant" ✓ (desktop+phone) |
| Feud copy reads neutral | e2e | `e2e/feud.test.ts:233` › "Scenario: Feud copy reads neutral" ✓ (desktop+phone) |
| Feud screens meet the look rules | e2e ("Scenario: Text contrast meets 4.5:1", "Scenario: Touch targets are at least 44px", "Scenario: No horizontal scroll on phone") | `e2e/look.test.ts:228` › "Scenario: Text contrast meets 4.5:1" ✓ (desktop+phone); `e2e/look.test.ts:205` › "Scenario: Touch targets are at least 44px" ✓ (desktop+phone); `e2e/look.test.ts:362` › "Scenario: No horizontal scroll on phone" ✓ (phone) |
| Feud cues sound right | manual (audio judgement on a real device at Gate 2) | manual: judged at Gate 2 (see checklist) |
| Feud screens approved on screenshots | manual (visual and tone judgement at Gate 2) | manual: judged at Gate 2 (see checklist) |
| Package and lockfile carry 0.3.0 | unit | `scripts/version.test.ts` › "Package and lockfile carry 0.3.0" ✓ |
| Release v0.3.0 published | manual (runs on GitHub after the ship-time tag push) | manual: after merge, tag `v0.3.0` on main and push it; see checklist |

## Manual checklist (Gate 2)

1. `npm run dev`, open http://localhost:5173/spiele/family-feud/lobby, play one round with sound on: strike buzzer, reveal ding, steal and winner cues sound right, and the correct cue plays only when a pot is banked (Feud cues sound right).
2. Look through `shots/*-look-feud-*.png` (phone and desktop) for layout, tone and team colours (Feud screens approved on screenshots).
3. After merge: tag `v0.3.0` on the merge commit on main and push the tag; check the release workflow passes `check-tag` and the GitHub release holds `rues-arcade-0.3.0.tgz` and `.sha256` (Release v0.3.0 published).

## Diffstat (git diff --stat origin/main...flow/family-feud)

```
 e2e/deco.test.ts                                   |  49 +-
 e2e/feud-content.test.ts                           |  81 +++
 e2e/feud-demo.test.ts                              | 111 ++++
 e2e/feud-history.test.ts                           | 120 ++++
 e2e/feud-prep.test.ts                              | 228 ++++++++
 e2e/feud-setup.test.ts                             | 220 ++++++++
 e2e/feud.test.ts                                   | 613 +++++++++++++++++++++
 e2e/helpers.ts                                     |  42 +-
 e2e/home.test.ts                                   |  17 +-
 e2e/look.test.ts                                   |   9 +-
 e2e/start.test.ts                                  |  42 +-
 e2e/walks/feud.ts                                  | 100 ++++
 migrations/0005_feud.sql                           |  12 +
 migrations/0006_seed_surveys.sql                   |  28 +
 openspec/changes/family-feud/.openspec.yaml        |   2 +
 openspec/changes/family-feud/design.md             | 247 +++++++++
 openspec/changes/family-feud/flow.yaml             |  11 +
 openspec/changes/family-feud/proposal.md           |  71 +++
 openspec/changes/family-feud/scope.md              |  99 ++++
 .../family-feud/shots/desktop-look-feud-board.png  | Bin 0 -> 75731 bytes
 .../shots/desktop-look-feud-faceoff-double.png     | Bin 0 -> 85776 bytes
 .../shots/desktop-look-feud-faceoff.png            | Bin 0 -> 70989 bytes
 .../shots/desktop-look-feud-handoff.png            | Bin 0 -> 22153 bytes
 .../shots/desktop-look-feud-peek-held.png          | Bin 0 -> 93801 bytes
 .../family-feud/shots/desktop-look-feud-prep.png   | Bin 0 -> 422219 bytes
 .../shots/desktop-look-feud-result-double.png      | Bin 0 -> 70375 bytes
 .../family-feud/shots/desktop-look-feud-result.png | Bin 0 -> 76331 bytes
 .../shots/desktop-look-feud-steal-handoff.png      | Bin 0 -> 19698 bytes
 .../family-feud/shots/desktop-look-feud-steal.png  | Bin 0 -> 74354 bytes
 .../family-feud/shots/desktop-look-feud-winner.png | Bin 0 -> 59189 bytes
 .../shots/desktop-look-lobby-family-feud.png       | Bin 0 -> 122169 bytes
 .../shots/desktop-look-start-family-feud.png       | Bin 0 -> 128686 bytes
 .../family-feud/shots/phone-look-feud-board.png    | Bin 0 -> 56748 bytes
 .../shots/phone-look-feud-faceoff-double.png       | Bin 0 -> 57804 bytes
 .../family-feud/shots/phone-look-feud-faceoff.png  | Bin 0 -> 58346 bytes
 .../family-feud/shots/phone-look-feud-handoff.png  | Bin 0 -> 17681 bytes
 .../shots/phone-look-feud-peek-held.png            | Bin 0 -> 53721 bytes
 .../family-feud/shots/phone-look-feud-prep.png     | Bin 0 -> 341482 bytes
 .../shots/phone-look-feud-result-double.png        | Bin 0 -> 54515 bytes
 .../family-feud/shots/phone-look-feud-result.png   | Bin 0 -> 58549 bytes
 .../shots/phone-look-feud-steal-handoff.png        | Bin 0 -> 14830 bytes
 .../family-feud/shots/phone-look-feud-steal.png    | Bin 0 -> 58527 bytes
 .../family-feud/shots/phone-look-feud-winner.png   | Bin 0 -> 44971 bytes
 .../shots/phone-look-lobby-family-feud.png         | Bin 0 -> 64712 bytes
 .../shots/phone-look-start-family-feud.png         | Bin 0 -> 88137 bytes
 .../changes/family-feud/specs/catalogue/spec.md    |  99 ++++
 .../family-feud/specs/content-store/spec.md        |  87 +++
 .../family-feud/specs/design-system/spec.md        |  28 +
 openspec/changes/family-feud/specs/feud/spec.md    | 504 +++++++++++++++++
 openspec/changes/family-feud/specs/release/spec.md |  20 +
 openspec/changes/family-feud/tasks.md              |  66 +++
 openspec/changes/family-feud/verification.md       | 270 +++++++++
 package-lock.json                                  |   4 +-
 package.json                                       |   2 +-
 scripts/version.test.ts                            |   4 +-
 src/app.css                                        |   3 +
 src/lib/content/survey.test.ts                     |  63 +++
 src/lib/content/survey.ts                          |  63 +++
 src/lib/content/types.ts                           |  26 +-
 src/lib/deco/Art.svelte                            |   3 +
 src/lib/deco/Feud.svelte                           |  91 +++
 src/lib/deco/motifs.test.ts                        |  20 +-
 src/lib/deco/motifs.ts                             |   6 +-
 src/lib/games/feud/Board.svelte                    | 149 +++++
 src/lib/games/feud/Handoff.svelte                  |  85 +++
 src/lib/games/feud/Prep.svelte                     | 340 ++++++++++++
 src/lib/games/feud/Screen.svelte                   | 517 +++++++++++++++++
 src/lib/games/feud/Setup.svelte                    | 233 ++++++++
 src/lib/games/feud/demo.test.ts                    |  42 ++
 src/lib/games/feud/demo.ts                         |  52 ++
 src/lib/games/feud/engine.test.ts                  | 370 +++++++++++++
 src/lib/games/feud/engine.ts                       | 254 +++++++++
 src/lib/games/feud/index.ts                        |  16 +
 src/lib/games/feud/prep.test.ts                    |  85 +++
 src/lib/games/feud/prep.ts                         |  49 ++
 src/lib/games/feud/record.ts                       |  12 +
 src/lib/games/registry.test.ts                     |  29 +-
 src/lib/games/registry.ts                          |   9 +-
 src/lib/server/content.ts                          |  31 +-
 src/lib/server/played.test.ts                      |  63 +++
 src/lib/server/played.ts                           |  27 +
 src/lib/server/surveys.test.ts                     | 267 +++++++++
 src/lib/server/surveys.ts                          |  81 +++
 src/lib/ui/Card.svelte                             |   3 +-
 src/lib/ui/CoachTip.svelte                         |   2 +-
 src/lib/ui/GameTile.svelte                         |   4 +
 src/lib/ui/HoldToView.svelte                       |  52 +-
 src/lib/ui/Lives.svelte                            |  45 +-
 src/lib/ui/tokens.test.ts                          |  13 +
 src/lib/ui/tokens.ts                               |  12 +-
 src/routes/api/content/[type]/+server.ts           |  13 +-
 src/routes/api/content/[type]/[id]/+server.ts      |  12 +-
 src/routes/api/content/[type]/import/+server.ts    |   7 +-
 src/routes/api/feud/played/+server.ts              |  15 +
 .../api/feud/played/[survey]/[player]/+server.ts   |  14 +
 src/routes/spiele/[slug]/+page.server.ts           |   4 +-
 src/routes/spiele/[slug]/+page.svelte              |   8 +-
 src/routes/spiele/[slug]/inhalte/+page.server.ts   |   7 +-
 src/routes/spiele/[slug]/inhalte/+page.svelte      | 257 ++++-----
 .../spiele/[slug]/inhalte/SurveyEditor.svelte      | 587 ++++++++++++++++++++
 src/routes/spiele/[slug]/lobby/+page.svelte        |  12 +
 src/routes/spiele/[slug]/spielen/+page.svelte      |   2 +
 102 files changed, 7054 insertions(+), 187 deletions(-)
```

## Screenshots

`openspec/changes/family-feud/shots/{phone,desktop}-look-<slug>.png`, slugs: feud-board, feud-faceoff, feud-faceoff-double, feud-handoff, feud-peek-held, feud-prep, feud-result, feud-result-double, feud-steal, feud-steal-handoff, feud-winner, lobby-family-feud, start-family-feud.

Round 3 shots match round 1 pixel-for-pixel up to animation and count-up noise. The seven round-2 differences were noise too: phone feud-faceoff-double was captured at a later frame of the entry fade (same layout and content, 5.5k pixels differ in brightness only); phone feud-result, feud-result-double, feud-steal, feud-winner differed in under 90 pixels in the score column (count-up); desktop feud-faceoff-double and feud-steal differed by at most 16/255 per channel. Twelve shots were re-committed to match this run; none differs in layout, colour or content.

## Review

Fresh-context reviewer, three rounds (diff `origin/main...flow/family-feud`). Final verified tip `29fb8d4`.

Resolved:
- Round 1: `UNIQUE COLLATE NOCASE` folds ASCII only, so "Äpfel nennen" and "äpfel nennen" were distinct questions → fixed in `src/lib/server/surveys.ts` (`toLocaleLowerCase('de')` on add, update, import; test added, red first). Release spec still said 0.2.0 → release delta spec for 0.3.0, version test retitled. Look test accepted any 127.0.0.1 port → narrowed. Five survey scenarios said "(status 400)" but did not check it → moved to `surveys.test.ts`, status pinned. Tiebreak test used one pick → two picks, random value 0.
- Round 2: look test accepted external main-frame origins → loopback hosts only. `play('correct')` fired on every result mount and for sudden death → `banks(before, after)` in `engine.ts`, cue only on the move into a result with points (unit test, red first). Demo skips the steal handoff while the look spec required it → exception written into the feud delta spec (Rue's confirmation pending at Gate 2).

Open after round 3 (low severity, not fixed; the loop is capped at 3 rounds):
- `e2e/look.test.ts:327-337` trusts any loopback origin the main frame visits; needed for the Feud walk's own server.
- `e2e/feud.test.ts:233-251` "Feud copy reads neutral": `snap()` never runs while a full-screen handoff is open, nor on setup and prep.
- `e2e/feud.test.ts:120-136` "Feud double round marked before it starts": checks `toHaveCount(0)` before the round-1 face-off has rendered, so it can pass on an empty page.
- `src/lib/games/feud/prep.test.ts:75-80` "Feud tiebreak survey drawn like the fill": with 3 surveys and 2 picks only one survey is left, so the rule is not exercised (the spec's own input forces it).
