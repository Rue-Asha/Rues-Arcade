verified-at: 486941c

## Layer 1: PORT=4813 npm run proof:full: green
```
  ✓  438 [desktop] › e2e/look.test.ts:483:1 › Scenario: Motion never blocks input (284ms)

  Slow test file: [phone] › e2e/look.test.ts (8.3m)
  Slow test file: [desktop] › e2e/look.test.ts (8.2m)
  Consider running tests from slow files in parallel. See: https://playwright.dev/docs/test-parallel
  2 skipped
  436 passed (10.8m)
EXIT 0
```

## Layer 2: spec coverage

| Scenario | proof | Evidence |
|---|---|---|
| Touch targets are at least 44px | e2e | `e2e/look.test.ts` › "Scenario: Touch targets are at least 44px" ✓ (phone+desktop for e2e) |
| Hold-to-view reveals only while held | e2e | `e2e/imposter.test.ts` › "Scenario: Hold-to-view reveals only while held" ✓ (phone+desktop for e2e) |
| Danger and warning buttons | e2e ("Scenario: Feud fault and undo read as what they are") | `` › "Scenario: Scenario: Feud fault and undo read as what they are" ✓ (phone+desktop for e2e) |
| Feud teams dealt from the roster | e2e | `e2e/feud-setup.test.ts` › "Scenario: Feud teams dealt from the roster" ✓ (phone+desktop for e2e) |
| Feud rounds picker in one row on desktop | e2e | `e2e/feud-setup.test.ts` › "Scenario: Feud rounds picker in one row on desktop" ✓ (phone+desktop for e2e) |
| Feud rounds picker wraps on a phone | e2e | `e2e/feud-setup.test.ts` › "Scenario: Feud rounds picker wraps on a phone" ✓ (phone+desktop for e2e) |
| Feud tap moves a player and Mischen keeps all players | e2e | `e2e/feud-setup.test.ts` › "Scenario: Feud tap moves a player and Mischen keeps all players" ✓ (phone+desktop for e2e) |
| Feud team below two blocks Weiter | e2e | `e2e/feud-setup.test.ts` › "Scenario: Feud team below two blocks Weiter" ✓ (phone+desktop for e2e) |
| Feud empty team name falls back | e2e | `e2e/feud-setup.test.ts` › "Scenario: Feud empty team name falls back" ✓ (phone+desktop for e2e) |
| Feud identical team names rejected | e2e | `e2e/feud-setup.test.ts` › "Scenario: Feud identical team names rejected" ✓ (phone+desktop for e2e) |
| Feud too few surveys block start | e2e | `e2e/feud-setup.test.ts` › "Scenario: Feud too few surveys block start" ✓ (phone+desktop for e2e) |
| Feud prep shows who knows a survey | e2e | `e2e/feud-prep.test.ts` › "Scenario: Feud prep shows who knows a survey" ✓ (phone+desktop for e2e) |
| Feud prep sorts by known and by played | e2e | `e2e/feud-prep.test.ts` › "Scenario: Feud prep sorts by known and by played" ✓ (phone+desktop for e2e) |
| Feud prep refuses an extra pick | e2e | `e2e/feud-prep.test.ts` › "Scenario: Feud prep refuses an extra pick" ✓ (phone+desktop for e2e) |
| Feud survey everyone knows stays pickable | e2e | `e2e/feud-prep.test.ts` › "Scenario: Feud survey everyone knows stays pickable" ✓ (phone+desktop for e2e) |
| Feud prep card shows all answers | e2e | `e2e/feud-prep-cards.test.ts` › "Scenario: Feud prep card shows all answers" ✓ (phone+desktop for e2e) |
| Feud prep card wraps a long question | e2e | `e2e/feud-prep-cards.test.ts` › "Scenario: Feud prep card wraps a long question" ✓ (phone+desktop for e2e) |
| Feud picked slot shows the survey | e2e | `e2e/feud-prep-cards.test.ts` › "Scenario: Feud picked slot shows the survey" ✓ (phone+desktop for e2e) |
| Feud played-with section collapses per card | e2e | `e2e/feud-prep-cards.test.ts` › "Scenario: Feud played-with section collapses per card" ✓ (phone+desktop for e2e) |
| Feud played-with section with nobody on the list | e2e | `e2e/feud-prep-cards.test.ts` › "Scenario: Feud played-with section with nobody on the list" ✓ (phone+desktop for e2e) |
| Feud prep grid by width | e2e | `e2e/feud-prep-cards.test.ts` › "Scenario: Feud prep grid by width" ✓ (phone+desktop for e2e) |
| Feud picking keeps the grid in place | e2e | `e2e/feud-prep-cards.test.ts` › "Scenario: Feud picking keeps the grid in place" ✓ (phone+desktop for e2e) |
| Feud prep removes a pick | e2e | `e2e/feud-prep.test.ts` › "Scenario: Feud prep removes a pick" ✓ (phone+desktop for e2e) |
| Feud Start hands over the picked surveys | e2e | `e2e/feud-prep.test.ts` › "Scenario: Feud Start hands over the picked surveys" ✓ (phone+desktop for e2e) |
| Feud face-off names players in rotation | unit | `src/lib/games/feud/engine.test.ts` › "Scenario: Feud face-off names players in rotation" ✓ (phone+desktop for e2e) |
| Feud face-off rotation wraps for a team of two | unit | `src/lib/games/feud/engine.test.ts` › "Scenario: Feud face-off rotation wraps for a team of two" ✓ (phone+desktop for e2e) |
| Feud buzzing team answers first | unit | `src/lib/games/feud/engine.test.ts` › "Scenario: Feud buzzing team answers first" ✓ (phone+desktop for e2e) |
| Feud every round asks for the buzz | unit | `src/lib/games/feud/engine.test.ts` › "Scenario: Feud every round asks for the buzz" ✓ (phone+desktop for e2e) |
| Feud number one answer wins at once | unit | `src/lib/games/feud/engine.test.ts` › "Scenario: Feud number one answer wins at once" ✓ (phone+desktop for e2e) |
| Feud higher answer wins the face-off | unit | `src/lib/games/feud/engine.test.ts` › "Scenario: Feud higher answer wins the face-off" ✓ (phone+desktop for e2e) |
| Feud one miss loses the face-off | unit | `src/lib/games/feud/engine.test.ts` › "Scenario: Feud one miss loses the face-off" ✓ (phone+desktop for e2e) |
| Feud both miss names the next pair | unit | `src/lib/games/feud/engine.test.ts` › "Scenario: Feud both miss names the next pair" ✓ (phone+desktop for e2e) |
| Feud winner chooses Spielen or Passen | unit | `src/lib/games/feud/engine.test.ts` › "Scenario: Feud winner chooses Spielen or Passen" ✓ (phone+desktop for e2e) |
| Feud face-off screen names both players | e2e | `e2e/feud.test.ts` › "Scenario: Feud face-off screen names both players" ✓ (phone+desktop for e2e) |
| Feud team choice shows both teams | e2e | `e2e/feud-round.test.ts` › "Scenario: Feud team choice shows both teams" ✓ (phone+desktop for e2e) |
| Feud undo steps back through the round | unit | `src/lib/games/feud/engine.test.ts` › "Scenario: Feud undo steps back through the round" ✓ (phone+desktop for e2e) |
| Feud undo of the reveal covers the question again | unit | `src/lib/games/feud/engine.test.ts` › "Scenario: Feud undo of the reveal covers the question again" ✓ (phone+desktop for e2e) |
| Feud undo of the buzz returns to the choice | unit | `src/lib/games/feud/engine.test.ts` › "Scenario: Feud undo of the buzz returns to the choice" ✓ (phone+desktop for e2e) |
| Feud undo stops at the round start | unit | `src/lib/games/feud/engine.test.ts` › "Scenario: Feud undo stops at the round start" ✓ (phone+desktop for e2e) |
| Feud undo of the third strike returns to the board | unit | `src/lib/games/feud/engine.test.ts` › "Scenario: Feud undo of the third strike returns to the board" ✓ (phone+desktop for e2e) |
| Feud undo fixes a mistap | e2e | `e2e/feud.test.ts` › "Scenario: Feud undo fixes a mistap" ✓ (phone+desktop for e2e) |
| Feud undo disabled with nothing to undo | e2e | `e2e/feud.test.ts` › "Scenario: Feud undo disabled with nothing to undo" ✓ (phone+desktop for e2e) |
| Feud fault and undo read as what they are | e2e | `e2e/feud-controls.test.ts` › "Scenario: Feud fault and undo read as what they are" ✓ (phone+desktop for e2e) |
| Feud disabled undo keeps its place | e2e | `e2e/feud-controls.test.ts` › "Scenario: Feud disabled undo keeps its place" ✓ (phone+desktop for e2e) |
| Feud fault row fits a phone | e2e | `e2e/feud-controls.test.ts` › "Scenario: Feud fault row fits a phone" ✓ (phone+desktop for e2e) |
| Feud demo script plays to the end | unit | `src/lib/games/feud/demo.test.ts` › "Scenario: Feud demo script plays to the end" ✓ (phone+desktop for e2e) |
| Feud demo reveals and picks the buzzer | unit ("Scenario: Feud demo covers every outcome branch") | `` › "Scenario: Scenario: Feud demo covers every outcome branch" ✓ (phone+desktop for e2e) |
| Feud demo face-off branches | unit ("Scenario: Feud demo covers every outcome branch") | `` › "Scenario: Scenario: Feud demo covers every outcome branch" ✓ (phone+desktop for e2e) |
| Feud demo plays and passes | unit ("Scenario: Feud demo covers every outcome branch") | `` › "Scenario: Scenario: Feud demo covers every outcome branch" ✓ (phone+desktop for e2e) |
| Feud demo clears a board | unit ("Scenario: Feud demo covers every outcome branch") | `` › "Scenario: Scenario: Feud demo covers every outcome branch" ✓ (phone+desktop for e2e) |
| Feud demo steals once and misses once | unit ("Scenario: Feud demo covers every outcome branch") | `` › "Scenario: Scenario: Feud demo covers every outcome branch" ✓ (phone+desktop for e2e) |
| Feud demo last round counts double | unit ("Scenario: Feud demo covers every outcome branch") | `` › "Scenario: Scenario: Feud demo covers every outcome branch" ✓ (phone+desktop for e2e) |
| Feud demo ends in sudden death | unit ("Scenario: Feud demo covers every outcome branch") | `` › "Scenario: Scenario: Feud demo covers every outcome branch" ✓ (phone+desktop for e2e) |
| Feud demo names undo | unit ("Scenario: Feud demo covers every outcome branch") | `` › "Scenario: Scenario: Feud demo covers every outcome branch" ✓ (phone+desktop for e2e) |
| Feud demo by tapping highlighted controls | e2e | `e2e/feud-demo.test.ts` › "Scenario: Feud demo by tapping highlighted controls" ✓ (phone+desktop for e2e) |
| Feud demo leaves data untouched | e2e | `e2e/feud-demo.test.ts` › "Scenario: Feud demo leaves data untouched" ✓ (phone+desktop for e2e) |
| Feud demo completes with reduced motion | e2e | `e2e/feud-demo.test.ts` › "Scenario: Feud demo completes with reduced motion" ✓ (phone+desktop for e2e) |
| Feud prep pages by width | e2e | `e2e/feud-prep-pages.test.ts` › "Scenario: Feud prep pages by width" ✓ (phone+desktop for e2e) |
| Feud prep without pager for one page | e2e | `e2e/feud-prep-pages.test.ts` › "Scenario: Feud prep without pager for one page" ✓ (phone+desktop for e2e) |
| Feud sort goes to page 1 | e2e | `e2e/feud-prep-pages.test.ts` › "Scenario: Feud sort goes to page 1" ✓ (phone+desktop for e2e) |
| Feud picks stay across pages | e2e | `e2e/feud-prep-pages.test.ts` › "Scenario: Feud picks stay across pages" ✓ (phone+desktop for e2e) |
| Feud prep page clamps to the last page | unit | `src/lib/games/feud/prep.test.ts` › "Scenario: Feud prep page clamps to the last page" ✓ (phone+desktop for e2e) |
| Feud prep page count | unit | `src/lib/games/feud/prep.test.ts` › "Scenario: Feud prep page count" ✓ (phone+desktop for e2e) |
| Feud question covered at round start | e2e | `e2e/feud-round.test.ts` › "Scenario: Feud question covered at round start" ✓ (phone+desktop for e2e) |
| Feud reveal shows the question | e2e | `e2e/feud-round.test.ts` › "Scenario: Feud reveal shows the question" ✓ (phone+desktop for e2e) |
| Feud peek works before the reveal | e2e | `e2e/feud-round.test.ts` › "Scenario: Feud peek works before the reveal" ✓ (phone+desktop for e2e) |
| Feud next round starts covered | unit | `src/lib/games/feud/engine.test.ts` › "Scenario: Feud next round starts covered" ✓ (phone+desktop for e2e) |
| Feud nothing counts before the reveal | unit | `src/lib/games/feud/engine.test.ts` › "Scenario: Feud nothing counts before the reveal" ✓ (phone+desktop for e2e) |

All 73 scenarios have a passing test. 2 skipped tests in the run (`look.test.ts` "Desktop uses the width" on phone, "No horizontal scroll on phone" on desktop) are project-conditional skips, not Feud scenarios.

## Gaps
- Spec wording (not test): scenarios "Feud prep pages by width" and "Feud prep without pager for one page" say "fresh database (26 surveys)" / "on a fresh database". The real seed has 247 surveys; the tests delete down to 26 (or 6). Spec should say "a database reduced to 26 surveys". Same for "Feud too few surveys block start" ("fresh database, all but 3 deleted").

## Manual checklist
none (no `manual` proof lines); judge the screenshots below at Gate 2.

## Diffstat
30 files changed, 2002 insertions(+), 197 deletions(-)

## Screenshots (not committed)
Directory: /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/d7372d66-be04-4b48-86a3-b6001e6cdf4a/scratchpad/feud-shots/ (32 files: phone-* and desktop-* of inhalte-family-feud, look-feud-{board,buzz,faceoff,faceoff-double,handoff,peek-held,prep,question,result,result-double,steal,steal-handoff,winner}, look-lobby-family-feud, look-start-family-feud)
