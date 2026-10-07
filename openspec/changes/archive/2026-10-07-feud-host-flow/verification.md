verified-at: 2d5b1dd

## Layer 1: PORT=4815 npm run proof:full: green
```

  Slow test file: [phone] › e2e/look.test.ts (8.4m)
  Slow test file: [desktop] › e2e/look.test.ts (7.4m)
  Consider running tests from slow files in parallel. See: https://playwright.dev/docs/test-parallel
  2 skipped
  436 passed (10.1m)
EXIT 0
```
Note: a first run at the same tip failed 3 tests (Imposter demo, Duck lobby, Feud content CRUD) with net::ERR_NETWORK_IO_SUSPENDED / ERR_SOCKET_NOT_CONNECTED on page.goto; environmental, all three passed on the rerun.

## Layer 2: spec coverage

| Scenario | proof | Evidence |
|---|---|---|
| Touch targets are at least 44px | e2e | `e2e/look.test.ts` › "Scenario: Touch targets are at least 44px" ✓ (phone+desktop) |
| Hold-to-view reveals only while held | e2e | `e2e/imposter.test.ts` › "Scenario: Hold-to-view reveals only while held" ✓ (phone+desktop) |
| Danger and warning buttons | e2e ("Scenario: Feud fault and undo read as what they are") | `e2e/feud-controls.test.ts` › "Scenario: Feud fault and undo read as what they are" ✓ (phone+desktop) |
| Feud teams dealt from the roster | e2e | `e2e/feud-setup.test.ts` › "Scenario: Feud teams dealt from the roster" ✓ (phone+desktop) |
| Feud rounds picker in one row on desktop | e2e | `e2e/feud-setup.test.ts` › "Scenario: Feud rounds picker in one row on desktop" ✓ (phone+desktop) |
| Feud rounds picker wraps on a phone | e2e | `e2e/feud-setup.test.ts` › "Scenario: Feud rounds picker wraps on a phone" ✓ (phone+desktop) |
| Feud tap moves a player and Mischen keeps all players | e2e | `e2e/feud-setup.test.ts` › "Scenario: Feud tap moves a player and Mischen keeps all players" ✓ (phone+desktop) |
| Feud team below two blocks Weiter | e2e | `e2e/feud-setup.test.ts` › "Scenario: Feud team below two blocks Weiter" ✓ (phone+desktop) |
| Feud empty team name falls back | e2e | `e2e/feud-setup.test.ts` › "Scenario: Feud empty team name falls back" ✓ (phone+desktop) |
| Feud identical team names rejected | e2e | `e2e/feud-setup.test.ts` › "Scenario: Feud identical team names rejected" ✓ (phone+desktop) |
| Feud too few surveys block start | e2e | `e2e/feud-setup.test.ts` › "Scenario: Feud too few surveys block start" ✓ (phone+desktop) |
| Feud prep shows who knows a survey | e2e | `e2e/feud-prep.test.ts` › "Scenario: Feud prep shows who knows a survey" ✓ (phone+desktop) |
| Feud prep sorts by known and by played | e2e | `e2e/feud-prep.test.ts` › "Scenario: Feud prep sorts by known and by played" ✓ (phone+desktop) |
| Feud prep refuses an extra pick | e2e | `e2e/feud-prep.test.ts` › "Scenario: Feud prep refuses an extra pick" ✓ (phone+desktop) |
| Feud survey everyone knows stays pickable | e2e | `e2e/feud-prep.test.ts` › "Scenario: Feud survey everyone knows stays pickable" ✓ (phone+desktop) |
| Feud prep card shows all answers | e2e | `e2e/feud-prep-cards.test.ts` › "Scenario: Feud prep card shows all answers" ✓ (phone+desktop) |
| Feud prep card wraps a long question | e2e | `e2e/feud-prep-cards.test.ts` › "Scenario: Feud prep card wraps a long question" ✓ (phone+desktop) |
| Feud picked slot shows the survey | e2e | `e2e/feud-prep-cards.test.ts` › "Scenario: Feud picked slot shows the survey" ✓ (phone+desktop) |
| Feud played-with section collapses per card | e2e | `e2e/feud-prep-cards.test.ts` › "Scenario: Feud played-with section collapses per card" ✓ (phone+desktop) |
| Feud played-with section with nobody on the list | e2e | `e2e/feud-prep-cards.test.ts` › "Scenario: Feud played-with section with nobody on the list" ✓ (phone+desktop) |
| Feud prep grid by width | e2e | `e2e/feud-prep-cards.test.ts` › "Scenario: Feud prep grid by width" ✓ (phone+desktop) |
| Feud picking keeps the grid in place | e2e | `e2e/feud-prep-cards.test.ts` › "Scenario: Feud picking keeps the grid in place" ✓ (phone+desktop) |
| Feud prep removes a pick | e2e | `e2e/feud-prep.test.ts` › "Scenario: Feud prep removes a pick" ✓ (phone+desktop) |
| Feud Start hands over the picked surveys | e2e | `e2e/feud-prep.test.ts` › "Scenario: Feud Start hands over the picked surveys" ✓ (phone+desktop) |
| Feud face-off names players in rotation | unit | `src/lib/games/feud/engine.test.ts` › "Scenario: Feud face-off names players in rotation" ✓ |
| Feud face-off rotation wraps for a team of two | unit | `src/lib/games/feud/engine.test.ts` › "Scenario: Feud face-off rotation wraps for a team of two" ✓ |
| Feud buzzing team answers first | unit | `src/lib/games/feud/engine.test.ts` › "Scenario: Feud buzzing team answers first" ✓ |
| Feud every round asks for the buzz | unit | `src/lib/games/feud/engine.test.ts` › "Scenario: Feud every round asks for the buzz" ✓ |
| Feud number one answer wins at once | unit | `src/lib/games/feud/engine.test.ts` › "Scenario: Feud number one answer wins at once" ✓ |
| Feud higher answer wins the face-off | unit | `src/lib/games/feud/engine.test.ts` › "Scenario: Feud higher answer wins the face-off" ✓ |
| Feud one miss loses the face-off | unit | `src/lib/games/feud/engine.test.ts` › "Scenario: Feud one miss loses the face-off" ✓ |
| Feud both miss names the next pair | unit | `src/lib/games/feud/engine.test.ts` › "Scenario: Feud both miss names the next pair" ✓ |
| Feud winner chooses Spielen or Passen | unit | `src/lib/games/feud/engine.test.ts` › "Scenario: Feud winner chooses Spielen or Passen" ✓ |
| Feud face-off screen names both players | e2e | `e2e/feud.test.ts` › "Scenario: Feud face-off screen names both players" ✓ (phone+desktop) |
| Feud team choice shows both teams | e2e | `e2e/feud-round.test.ts` › "Scenario: Feud team choice shows both teams" ✓ (phone+desktop) |
| Feud undo steps back through the round | unit | `src/lib/games/feud/engine.test.ts` › "Scenario: Feud undo steps back through the round" ✓ |
| Feud undo of the reveal covers the question again | unit | `src/lib/games/feud/engine.test.ts` › "Scenario: Feud undo of the reveal covers the question again" ✓ |
| Feud undo of the buzz returns to the choice | unit | `src/lib/games/feud/engine.test.ts` › "Scenario: Feud undo of the buzz returns to the choice" ✓ |
| Feud undo stops at the round start | unit | `src/lib/games/feud/engine.test.ts` › "Scenario: Feud undo stops at the round start" ✓ |
| Feud undo of the third strike returns to the board | unit | `src/lib/games/feud/engine.test.ts` › "Scenario: Feud undo of the third strike returns to the board" ✓ |
| Feud undo fixes a mistap | e2e | `e2e/feud.test.ts` › "Scenario: Feud undo fixes a mistap" ✓ (phone+desktop) |
| Feud undo disabled with nothing to undo | e2e | `e2e/feud.test.ts` › "Scenario: Feud undo disabled with nothing to undo" ✓ (phone+desktop) |
| Feud fault and undo read as what they are | e2e | `e2e/feud-controls.test.ts` › "Scenario: Feud fault and undo read as what they are" ✓ (phone+desktop) |
| Feud disabled undo keeps its place | e2e | `e2e/feud-controls.test.ts` › "Scenario: Feud disabled undo keeps its place" ✓ (phone+desktop) |
| Feud fault row fits a phone | e2e | `e2e/feud-controls.test.ts` › "Scenario: Feud fault row fits a phone" ✓ (phone+desktop) |
| Feud demo script plays to the end | unit | `src/lib/games/feud/demo.test.ts` › "Scenario: Feud demo script plays to the end" ✓ |
| Feud demo reveals and picks the buzzer | unit ("Scenario: Feud demo covers every outcome branch") | `src/lib/games/feud/demo.test.ts` › "Scenario: Feud demo covers every outcome branch" ✓ |
| Feud demo face-off branches | unit ("Scenario: Feud demo covers every outcome branch") | `src/lib/games/feud/demo.test.ts` › "Scenario: Feud demo covers every outcome branch" ✓ |
| Feud demo plays and passes | unit ("Scenario: Feud demo covers every outcome branch") | `src/lib/games/feud/demo.test.ts` › "Scenario: Feud demo covers every outcome branch" ✓ |
| Feud demo clears a board | unit ("Scenario: Feud demo covers every outcome branch") | `src/lib/games/feud/demo.test.ts` › "Scenario: Feud demo covers every outcome branch" ✓ |
| Feud demo steals once and misses once | unit ("Scenario: Feud demo covers every outcome branch") | `src/lib/games/feud/demo.test.ts` › "Scenario: Feud demo covers every outcome branch" ✓ |
| Feud demo last round counts double | unit ("Scenario: Feud demo covers every outcome branch") | `src/lib/games/feud/demo.test.ts` › "Scenario: Feud demo covers every outcome branch" ✓ |
| Feud demo ends in sudden death | unit ("Scenario: Feud demo covers every outcome branch") | `src/lib/games/feud/demo.test.ts` › "Scenario: Feud demo covers every outcome branch" ✓ |
| Feud demo names undo | unit ("Scenario: Feud demo covers every outcome branch") | `src/lib/games/feud/demo.test.ts` › "Scenario: Feud demo covers every outcome branch" ✓ |
| Feud demo by tapping highlighted controls | e2e | `e2e/feud-demo.test.ts` › "Scenario: Feud demo by tapping highlighted controls" ✓ (phone+desktop) |
| Feud demo leaves data untouched | e2e | `e2e/feud-demo.test.ts` › "Scenario: Feud demo leaves data untouched" ✓ (phone+desktop) |
| Feud demo completes with reduced motion | e2e | `e2e/feud-demo.test.ts` › "Scenario: Feud demo completes with reduced motion" ✓ (phone+desktop) |
| Feud prep pages by width | e2e | `e2e/feud-prep-pages.test.ts` › "Scenario: Feud prep pages by width" ✓ (phone+desktop) |
| Feud prep without pager for one page | e2e | `e2e/feud-prep-pages.test.ts` › "Scenario: Feud prep without pager for one page" ✓ (phone+desktop) |
| Feud sort goes to page 1 | e2e | `e2e/feud-prep-pages.test.ts` › "Scenario: Feud sort goes to page 1" ✓ (phone+desktop) |
| Feud picks stay across pages | e2e | `e2e/feud-prep-pages.test.ts` › "Scenario: Feud picks stay across pages" ✓ (phone+desktop) |
| Feud prep page clamps to the last page | unit | `src/lib/games/feud/prep.test.ts` › "Scenario: Feud prep page clamps to the last page" ✓ |
| Feud prep page count | unit | `src/lib/games/feud/prep.test.ts` › "Scenario: Feud prep page count" ✓ |
| Feud question covered at round start | e2e | `e2e/feud-round.test.ts` › "Scenario: Feud question covered at round start" ✓ (phone+desktop) |
| Feud reveal shows the question | e2e | `e2e/feud-round.test.ts` › "Scenario: Feud reveal shows the question" ✓ (phone+desktop) |
| Feud peek works before the reveal | e2e | `e2e/feud-round.test.ts` › "Scenario: Feud peek works before the reveal" ✓ (phone+desktop) |
| Feud next round starts covered | unit | `src/lib/games/feud/engine.test.ts` › "Scenario: Feud next round starts covered" ✓ |
| Feud nothing counts before the reveal | unit | `src/lib/games/feud/engine.test.ts` › "Scenario: Feud nothing counts before the reveal" ✓ |

All 68 scenarios (65 feud, 3 design-system) have a passing test. 2 skipped tests are project-conditional look.test.ts skips, not Feud scenarios.

## Gaps
none

## Manual checklist
none (no `manual` proof lines); judge the screenshots below at Gate 2.

## Diffstat
31 files changed, 2112 insertions(+), 197 deletions(-)

## Screenshots (not committed)
Directory: /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/d7372d66-be04-4b48-86a3-b6001e6cdf4a/scratchpad/feud-shots/ (32 files):
- desktop-inhalte-family-feud.png
- desktop-look-feud-board.png
- desktop-look-feud-buzz.png
- desktop-look-feud-faceoff-double.png
- desktop-look-feud-faceoff.png
- desktop-look-feud-handoff.png
- desktop-look-feud-peek-held.png
- desktop-look-feud-prep.png
- desktop-look-feud-question.png
- desktop-look-feud-result-double.png
- desktop-look-feud-result.png
- desktop-look-feud-steal-handoff.png
- desktop-look-feud-steal.png
- desktop-look-feud-winner.png
- desktop-look-lobby-family-feud.png
- desktop-look-start-family-feud.png
- phone-inhalte-family-feud.png
- phone-look-feud-board.png
- phone-look-feud-buzz.png
- phone-look-feud-faceoff-double.png
- phone-look-feud-faceoff.png
- phone-look-feud-handoff.png
- phone-look-feud-peek-held.png
- phone-look-feud-prep.png
- phone-look-feud-question.png
- phone-look-feud-result-double.png
- phone-look-feud-result.png
- phone-look-feud-steal-handoff.png
- phone-look-feud-steal.png
- phone-look-feud-winner.png
- phone-look-lobby-family-feud.png
- phone-look-start-family-feud.png

## Review

Round 1 (fresh-context reviewer + verifier at 486941c):
- [gap · spec wording] "fresh database (26 / all but 6 / all but 3)" while the seed holds 247 surveys → fe85601: scenarios say "a database reduced to N surveys".
- [weak] Feud rounds picker wraps on a phone: average options per row, labels 1..8 unchecked → a00e4ee: labels asserted 1..8 in both picker tests, >1 option on every row; red against a reversed picker and a forced 7+1 wrap.
- [weak] Feud disabled undo keeps its place: compared relative geometry only → f3b5da6: no state pair has undo disabled with the buzzer group already gone, so the scenario's THEN now states what is measurable (x, width, height and offset to the action stay; the row may move down when the buzzer group unmounts). Test unchanged; red against a 20px spacer while disabled.
- [weak] Feud prep page clamps to the last page: last-6 content unchecked → 2d5b1dd: slicing moved into pure `pageItems` in prep.ts, test asserts last page [6..11] and page 0 [0..5]; red without the clamp.

Round 2 (at 2d5b1dd): reviewer — no findings; verifier — 68/68 scenarios covered, proof:full green (436 passed, 2 skipped). A first run had 3 network failures outside this change (ERR_NETWORK_IO_SUSPENDED / ERR_SOCKET_NOT_CONNECTED, machine suspend); the unchanged rerun was green.
