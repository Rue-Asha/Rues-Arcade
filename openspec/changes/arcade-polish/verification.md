verified-at: 8bb8b28

## Layer 1 — proof:full (PORT=4801)

Green. 36 unit files / 319 tests passed; Playwright 565 passed, 3 skipped (viewport-conditional: frame 'Header wraps on a phone' desktop, look 'Desktop uses the width' phone, look 'No horizontal scroll on phone' desktop).

```
  ✓  547 [phone] › e2e/look.test.ts:177:1 › Scenario: Decoration loads no external assets (1.2m)
  ✓  557 [desktop] › e2e/look.test.ts:148:1 › Scenario: Press Start 2P stays limited to logo and scores (36.6s)
  ✓  558 [phone] › e2e/look.test.ts:197:1 › Scenario: New copy has no exclamation marks (43.0s)
  ✓  559 [desktop] › e2e/look.test.ts:177:1 › Scenario: Decoration loads no external assets (1.2m)
  ✓  560 [phone] › e2e/look.test.ts:212:1 › Scenario: No horizontal scroll on phone (1.2m)
  -  562 [phone] › e2e/look.test.ts:217:1 › Scenario: Desktop uses the width
  ✓  563 [phone] › e2e/look.test.ts:335:2 › reduced motion › Scenario: Reduced motion makes transitions instant (253ms)
  ✓  564 [phone] › e2e/look.test.ts:347:1 › Scenario: Motion never blocks input (315ms)
  ✓  561 [desktop] › e2e/look.test.ts:197:1 › Scenario: New copy has no exclamation marks (37.5s)
  -  565 [desktop] › e2e/look.test.ts:212:1 › Scenario: No horizontal scroll on phone
  ✓  566 [desktop] › e2e/look.test.ts:217:1 › Scenario: Desktop uses the width (1.2m)
  ✓  567 [desktop] › e2e/look.test.ts:335:2 › reduced motion › Scenario: Reduced motion makes transitions instant (232ms)
  ✓  568 [desktop] › e2e/look.test.ts:347:1 › Scenario: Motion never blocks input (251ms)

  Slow test file: [phone] › e2e/look.test.ts (6.2m)
  Slow test file: [desktop] › e2e/look.test.ts (5.9m)
  Consider running tests from slow files in parallel. See: https://playwright.dev/docs/test-parallel
  3 skipped
  565 passed (8.4m)
EXIT 0
```

## Layer 2 — spec coverage

117 scenarios, 0 gaps, 5 manual. e2e evidence counts are runs (phone + desktop). Full table also at /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/e9c24136-e1ba-417f-9a0c-d28a07cc61c5/scratchpad/table.md.

| Scenario | proof | Evidence |
|---|---|---|
| catalogue: Start banner carries title, badge and player range | e2e | ✓ Start banner carries title, badge and player range x2 e2e/start.test.ts |
| catalogue: Start panel first on phone, right column on desktop | e2e | ✓ Start panel first on phone, right column on desktop x2 e2e/start.test.ts |
| catalogue: Same start layout for both games | e2e ("Scenario: Start panel first on phone, right column on desktop") | ✓ Start panel first on phone, right column on desktop x2 e2e/start.test.ts |
| catalogue: Mehr-zu cards keep their targets | e2e | ✓ Mehr-zu cards keep their targets x2 e2e/start.test.ts |
| catalogue: Old Erklärung link is not found | e2e | ✓ Old Erklärung link is not found x2 e2e/start.test.ts |
| catalogue: Inhalte card shows the real content count | e2e | ✓ Inhalte card shows the real content count x2 e2e/start.test.ts |
| catalogue: Los geht's opens the lobby | e2e | ✓ Los geht's opens the lobby x2 e2e/start.test.ts |
| catalogue: So geht's covers both Wavelength modes | e2e | ✓ So geht's covers both Wavelength modes x2 e2e/start.test.ts |
| codes: Full Codes game | e2e | ✓ Full Codes game x2 e2e/codes.test.ts |
| codes: Codes skipped round result | e2e | ✓ Codes skipped round result x2 e2e/codes.test.ts |
| codes: Codes tie shown as Unentschieden | e2e | ✓ Codes tie shown as Unentschieden x2 e2e/codes.test.ts |
| codes: Codes rematch keeps the teams | unit | ✓ Codes rematch keeps the teams x1 src/lib/games/codes/engine.test.ts |
| content-store: Inhalte pages by width | e2e | ✓ Inhalte pages by width x2 e2e/pager.test.ts |
| content-store: Survey cards page by width | e2e | ✓ Survey cards page by width x2 e2e/pager.test.ts |
| content-store: Empty content list shows no pager | e2e | ✓ Empty content list shows no pager x2 e2e/pager.test.ts |
| content-store: Added entry shows on page 1 | e2e | ✓ Added entry shows on page 1 x2 e2e/pager.test.ts |
| content-store: Deleting the last entry on the last page goes back a page | e2e | ✓ Deleting the last entry on the last page goes back a page x2 e2e/pager.test.ts |
| content-store: Import goes to page 1 | e2e | ✓ Import goes to page 1 x2 e2e/pager.test.ts |
| content-store: Add, edit and delete an entry | e2e | ✓ Add, edit and delete an entry x2 e2e/content.test.ts |
| content-store: Delete asks for confirmation | e2e | ✓ Delete asks for confirmation x2 e2e/content.test.ts |
| content-store: Bulk import reports skipped and malformed lines | unit | ✓ Bulk import reports skipped and malformed lines x1 src/lib/server/content.test.ts |
| content-store: Overlong text rejected | unit | ✓ Overlong text rejected x1 src/lib/server/content.test.ts |
| demo: Only the expected control is enabled | e2e | ✓ Only the expected control is enabled x2 e2e/demo.test.ts |
| demo: Hidden information shown with Demo tag | e2e | ✓ Hidden information shown with Demo tag x2 e2e/demo.test.ts |
| demo: Demo leaves real data untouched | e2e | ✓ Demo leaves real data untouched x2 e2e/demo.test.ts |
| demo: Exiting returns to the starting screen | e2e | ✓ Exiting returns to the starting screen x2 e2e/demo.test.ts |
| demo: Reload during demo returns to start screen | e2e | ✓ Reload during demo returns to start screen x2 e2e/demo.test.ts |
| demo: Demo steppable with reduced motion | e2e | ✓ Demo steppable with reduced motion x2 e2e/demo.test.ts |
| demo: Every demo covers its outcome branches over several rounds | unit ("Scenario: Imposter demo covers every outcome branch", "Scenario: Wavelength demo covers every outcome branch", "Scenario: Feud demo covers every outcome branch", "Scenario: Codes demo covers every outcome branch", "Scenario: Duck demo covers every outcome branch", "Scenario: Most Likely demo covers every outcome branch") | ✓ Imposter demo covers every outcome branch x5 src/lib/games/imposter/demo.test.ts; Wavelength demo covers every outcome branch x1 src/lib/games/wavelength/demo.test.ts; Feud demo covers every outcome branch x1 src/lib/games/feud/demo.test.ts; Codes demo covers every outcome branch x1 src/lib/games/codes/demo.test.ts; Duck demo covers every outcome branch x1 src/lib/games/duck/demo.test.ts; Most Likely demo covers every outcome branch x8 src/lib/games/most-likely/demo.test.ts |
| demo: Demo tips read neutral | unit ("Scenario: Imposter demo covers every outcome branch", "Scenario: Wavelength demo tips read neutral", "Scenario: Feud demo covers every outcome branch", "Scenario: Codes demo covers every outcome branch", "Scenario: Duck demo covers every outcome branch", "Scenario: Most Likely demo covers every outcome branch") | ✓ Imposter demo covers every outcome branch x5 src/lib/games/imposter/demo.test.ts; Wavelength demo tips read neutral x1 src/lib/games/wavelength/demo.test.ts; Feud demo covers every outcome branch x1 src/lib/games/feud/demo.test.ts; Codes demo covers every outcome branch x1 src/lib/games/codes/demo.test.ts; Duck demo covers every outcome branch x1 src/lib/games/duck/demo.test.ts; Most Likely demo covers every outcome branch x8 src/lib/games/most-likely/demo.test.ts |
| demo: Demo tips say why the step happens | manual (wording judgement by Rue at Gate 2) | Gate 2 checklist |
| demo: Long demo progress reads correctly | e2e ("Scenario: Feud demo by tapping highlighted controls", "Scenario: Most Likely demo by tapping highlighted controls", "Scenario: Duck demo by tapping highlighted controls") | ✓ Feud demo by tapping highlighted controls x2 e2e/feud-demo.test.ts; Most Likely demo by tapping highlighted controls x2 e2e/most-likely.test.ts; Duck demo by tapping highlighted controls x2 e2e/duck.test.ts |
| design-system: Touch targets are at least 44px | e2e | ✓ Touch targets are at least 44px x2 e2e/look.test.ts |
| design-system: Hold-to-view reveals only while held | e2e | ✓ Hold-to-view reveals only while held x2 e2e/imposter.test.ts |
| design-system: Danger and warning buttons | e2e ("Scenario: Feud fault and undo read as what they are") | ✓ Feud fault and undo read as what they are x2 e2e/feud-controls.test.ts |
| design-system: Reduced motion makes transitions instant | e2e | ✓ Reduced motion makes transitions instant x2 e2e/look.test.ts |
| design-system: Motion never blocks input | e2e | ✓ Motion never blocks input x2 e2e/look.test.ts |
| design-system: Motion tokens in CSS and tokens.ts | unit | ✓ Motion tokens in CSS and tokens.ts x1 src/lib/ui/tokens.test.ts |
| design-system: Reduced motion zeroes every motion helper | unit | ✓ Reduced motion zeroes every motion helper x1 src/lib/motion.test.ts |
| design-system: Reduced motion covers every in-game motion | e2e ("Scenario: Imposter reduced motion is instant", "Scenario: Wavelength reduced motion is instant", "Scenario: Codes reduced motion is instant", "Scenario: Duck reduced motion is instant", "Scenario: Most Likely reduced motion is instant", "Scenario: Feud reduced motion is instant", "Scenario: Pager page change is instant under reduced motion") | ✓ Imposter reduced motion is instant x2 e2e/imposter.test.ts; Wavelength reduced motion is instant x2 e2e/wavelength.test.ts; Codes reduced motion is instant x2 e2e/codes.test.ts; Duck reduced motion is instant x2 e2e/duck.test.ts; Most Likely reduced motion is instant x2 e2e/most-likely.test.ts; Feud reduced motion is instant x2 e2e/feud.test.ts; Pager page change is instant under reduced motion x2 e2e/pager.test.ts |
| design-system: Phase motion approved on a real device | manual (motion feel is a visual judgement that screenshots cannot carry, at Gate 2) | Gate 2 checklist |
| design-system: Phase change fades out and rises in | e2e | ✓ Phase change fades out and rises in x2 e2e/frame.test.ts |
| design-system: Rapid taps leave at most one outgoing screen | e2e | ✓ Rapid taps leave at most one outgoing screen x2 e2e/frame.test.ts |
| design-system: Reload mid-game shows no outgoing screen | e2e | ✓ Reload mid-game shows no outgoing screen x2 e2e/frame.test.ts |
| design-system: Outgoing screen carries no demo target | e2e | ✓ Outgoing screen carries no demo target x2 e2e/frame.test.ts |
| design-system: Reduced motion phase change is instant | e2e | ✓ Reduced motion phase change is instant x2 e2e/frame.test.ts |
| design-system: Primary action dispatches during a transition | e2e | ✓ Primary action dispatches during a transition x2 e2e/frame.test.ts |
| design-system: Undo transitions like any phase change | e2e ("Scenario: Feud undo transitions like any phase change") | ✓ Feud undo transitions like any phase change x2 e2e/feud-round.test.ts |
| design-system: Pager page count | unit | ✓ Pager page count x1 src/lib/ui/pager.test.ts |
| design-system: Pager hidden when one page holds everything | e2e | ✓ Pager hidden when one page holds everything x2 e2e/pager.test.ts |
| design-system: Pager navigates pages | e2e ("Scenario: Inhalte pages by width", "Scenario: Feud prep pages by width") | ✓ Inhalte pages by width x2 e2e/pager.test.ts; Feud prep pages by width x2 e2e/feud-prep-pages.test.ts |
| design-system: Pager page clamps across 1024px | e2e | ✓ Pager page clamps across 1024px x2 e2e/pager.test.ts |
| design-system: Pager page change is instant under reduced motion | e2e | ✓ Pager page change is instant under reduced motion x2 e2e/pager.test.ts |
| design-system: Feud prep keeps its paging | e2e ("Scenario: Feud prep pages by width", "Scenario: Feud prep without pager for one page", "Scenario: Feud sort goes to page 1", "Scenario: Feud picks stay across pages") | ✓ Feud prep pages by width x2 e2e/feud-prep-pages.test.ts; Feud prep without pager for one page x2 e2e/feud-prep-pages.test.ts; Feud sort goes to page 1 x2 e2e/feud-prep-pages.test.ts; Feud picks stay across pages x2 e2e/feud-prep-pages.test.ts |
| design-system: Every in-game screen uses the stage and rail frame | e2e ("Scenario: Imposter screens use the stage and rail frame", "Scenario: Wavelength screens use the stage and rail frame", "Scenario: Codes screens use the stage and rail frame", "Scenario: Duck screens use the stage and rail frame", "Scenario: Most Likely screens use the stage and rail frame", "Scenario: Feud screens use the stage and rail frame") | ✓ Imposter screens use the stage and rail frame x2 e2e/imposter.test.ts; Wavelength screens use the stage and rail frame x2 e2e/wavelength.test.ts; Codes screens use the stage and rail frame x2 e2e/codes.test.ts; Duck screens use the stage and rail frame x2 e2e/duck.test.ts; Most Likely screens use the stage and rail frame x2 e2e/most-likely.test.ts; Feud screens use the stage and rail frame x2 e2e/feud.test.ts |
| design-system: Duck Wertung may scroll to its action on a phone | e2e ("Scenario: Duck screens use the stage and rail frame") | ✓ Duck screens use the stage and rail frame x2 e2e/duck.test.ts |
| design-system: Frame keeps the look rules | e2e ("Scenario: Touch targets are at least 44px", "Scenario: Text contrast meets 4.5:1", "Scenario: Press Start 2P stays limited to logo and scores", "Scenario: No horizontal scroll on phone", "Scenario: Desktop uses the width") | ✓ Touch targets are at least 44px x2 e2e/look.test.ts; Text contrast meets 4.5:1 x2 e2e/look.test.ts; Press Start 2P stays limited to logo and scores x2 e2e/look.test.ts; No horizontal scroll on phone x1 e2e/look.test.ts; Desktop uses the width x1 e2e/look.test.ts |
| design-system: In-game screens approved on screenshots | manual (visual judgement at Gate 2, on the verifier's screenshots) | Gate 2 checklist |
| design-system: Every pass-the-device moment uses the Handoff | e2e ("Scenario: Imposter handover uses the Handoff", "Scenario: Wavelength prep uses the Handoff", "Scenario: Codes reveal intro uses the Handoff", "Scenario: Most Likely prompt uses the Handoff", "Scenario: Feud handoff in team colour") | ✓ Imposter handover uses the Handoff x2 e2e/imposter.test.ts; Wavelength prep uses the Handoff x2 e2e/wavelength.test.ts; Codes reveal intro uses the Handoff x2 e2e/codes.test.ts; Most Likely prompt uses the Handoff x2 e2e/most-likely.test.ts; Feud handoff in team colour x2 e2e/feud.test.ts |
| design-system: Handoff wraps a long name | e2e | ✓ Handoff wraps a long name x2 e2e/imposter.test.ts |
| design-system: Every reveal uses the shared Reveal | e2e ("Scenario: Imposter reveals use the Reveal", "Scenario: Wavelength target uses the Reveal", "Scenario: Codes word uses the Reveal", "Scenario: Duck word uses the Reveal", "Scenario: Feud question uses the Reveal") | ✓ Imposter reveals use the Reveal x2 e2e/imposter.test.ts; Wavelength target uses the Reveal x2 e2e/wavelength.test.ts; Codes word uses the Reveal x2 e2e/codes.test.ts; Duck word uses the Reveal x2 e2e/duck.test.ts; Feud question uses the Reveal x2 e2e/feud-round.test.ts |
| design-system: Hold-to-view unchanged inside reveals | e2e ("Scenario: Hold-to-view reveals only while held", "Scenario: Codes word visible only while held") | ✓ Hold-to-view reveals only while held x2 e2e/imposter.test.ts; Codes word visible only while held x2 e2e/codes.test.ts |
| design-system: Outcome counts up to +N | e2e ("Scenario: Wavelength result uses the Outcome", "Scenario: Codes result uses the Outcome", "Scenario: Most Likely result counts up", "Scenario: Feud result uses the Outcome") | ✓ Wavelength result uses the Outcome x2 e2e/wavelength.test.ts; Codes result uses the Outcome x2 e2e/codes.test.ts; Most Likely result counts up x2 e2e/most-likely.test.ts; Feud result uses the Outcome x2 e2e/feud-round.test.ts |
| design-system: Zero points show +0 as a miss | e2e ("Scenario: Wavelength miss shows +0", "Scenario: Codes skipped round result") | ✓ Wavelength miss shows +0 x2 e2e/wavelength.test.ts; Codes skipped round result x2 e2e/codes.test.ts |
| design-system: Scoreboard order is stable | unit | ✓ Scoreboard order is stable x1 src/lib/ui/scoreboard.test.ts |
| design-system: Scoreboard rows move when ranks change | e2e | ✓ Scoreboard rows move when ranks change x2 e2e/codes.test.ts |
| design-system: Scoreboard marks the acting team | e2e | ✓ Scoreboard marks the acting team x2 e2e/codes.test.ts |
| design-system: Game over shows the winner in the stage and one Scoreboard in the rail | e2e ("Scenario: Wavelength game over uses the winner frame", "Scenario: Codes game over uses the winner frame", "Scenario: Duck game over uses the winner frame", "Scenario: Most Likely game over uses the winner frame", "Scenario: Feud game over uses the winner frame") | ✓ Wavelength game over uses the winner frame x2 e2e/wavelength.test.ts; Codes game over uses the winner frame x2 e2e/codes.test.ts; Duck game over uses the winner frame x2 e2e/duck.test.ts; Most Likely game over uses the winner frame x2 e2e/most-likely.test.ts; Feud game over uses the winner frame x2 e2e/feud.test.ts |
| design-system: Winner burst flies once | e2e | ✓ Winner burst flies once x2 e2e/wavelength.test.ts |
| design-system: Winner burst off under reduced motion | e2e | ✓ Winner burst off under reduced motion x2 e2e/wavelength.test.ts |
| design-system: Tie for first keeps the shared wording | e2e ("Scenario: Tie for first shown as tie", "Scenario: Codes tie shown as Unentschieden", "Scenario: Duck tie at the top reads Unentschieden", "Scenario: Most Likely tie at the top reads Unentschieden") | ✓ Tie for first shown as tie x2 e2e/wavelength.test.ts; Codes tie shown as Unentschieden x2 e2e/codes.test.ts; Duck tie at the top reads Unentschieden x2 e2e/duck.test.ts; Most Likely tie at the top reads Unentschieden x2 e2e/most-likely.test.ts |
| design-system: Codes Daneben plays the fault motion | e2e | ✓ Codes Daneben plays the fault motion x2 e2e/codes.test.ts |
| design-system: Duck letter loss plays the fault motion | e2e | ✓ Duck letter loss plays the fault motion x2 e2e/duck.test.ts |
| design-system: Feud strike keeps its motion | e2e ("Scenario: Feud motion uses transform and opacity only") | ✓ Feud motion uses transform and opacity only x2 e2e/feud.test.ts |
| feud: Feud demo script plays to the end | unit | ✓ Feud demo script plays to the end x1 src/lib/games/feud/demo.test.ts |
| feud: Feud demo reveals and picks the buzzer | unit ("Scenario: Feud demo covers every outcome branch") | ✓ Feud demo covers every outcome branch x1 src/lib/games/feud/demo.test.ts |
| feud: Feud demo face-off branches | unit ("Scenario: Feud demo covers every outcome branch") | ✓ Feud demo covers every outcome branch x1 src/lib/games/feud/demo.test.ts |
| feud: Feud demo plays and passes | unit ("Scenario: Feud demo covers every outcome branch") | ✓ Feud demo covers every outcome branch x1 src/lib/games/feud/demo.test.ts |
| feud: Feud demo clears a board | unit ("Scenario: Feud demo covers every outcome branch") | ✓ Feud demo covers every outcome branch x1 src/lib/games/feud/demo.test.ts |
| feud: Feud demo steals once and misses once | unit ("Scenario: Feud demo covers every outcome branch") | ✓ Feud demo covers every outcome branch x1 src/lib/games/feud/demo.test.ts |
| feud: Feud demo last round counts double | unit ("Scenario: Feud demo covers every outcome branch") | ✓ Feud demo covers every outcome branch x1 src/lib/games/feud/demo.test.ts |
| feud: Feud demo ends in sudden death | unit ("Scenario: Feud demo covers every outcome branch") | ✓ Feud demo covers every outcome branch x1 src/lib/games/feud/demo.test.ts |
| feud: Feud demo names undo | unit ("Scenario: Feud demo covers every outcome branch") | ✓ Feud demo covers every outcome branch x1 src/lib/games/feud/demo.test.ts |
| feud: Feud demo by tapping highlighted controls | e2e | ✓ Feud demo by tapping highlighted controls x2 e2e/feud-demo.test.ts |
| feud: Feud demo leaves data untouched | e2e | ✓ Feud demo leaves data untouched x2 e2e/feud-demo.test.ts |
| feud: Feud demo completes with reduced motion | e2e | ✓ Feud demo completes with reduced motion x2 e2e/feud-demo.test.ts |
| feud: Feud board fits a phone | e2e | ✓ Feud board fits a phone x2 e2e/feud.test.ts |
| feud: Feud versus header shows both teams | e2e | ✓ Feud versus header shows both teams x2 e2e/feud.test.ts |
| feud: Feud handoff in team colour | e2e | ✓ Feud handoff in team colour x2 e2e/feud.test.ts |
| feud: Feud motion uses transform and opacity only | e2e | ✓ Feud motion uses transform and opacity only x2 e2e/feud.test.ts |
| feud: Feud motion never blocks input | e2e | ✓ Feud motion never blocks input x2 e2e/feud.test.ts |
| feud: Feud reduced motion is instant | e2e | ✓ Feud reduced motion is instant x2 e2e/feud.test.ts |
| feud: Feud copy reads neutral | e2e | ✓ Feud copy reads neutral x2 e2e/feud.test.ts |
| feud: Feud screens meet the look rules | e2e ("Scenario: Text contrast meets 4.5:1", "Scenario: Touch targets are at least 44px", "Scenario: No horizontal scroll on phone") | ✓ Text contrast meets 4.5:1 x2 e2e/look.test.ts; Touch targets are at least 44px x2 e2e/look.test.ts; No horizontal scroll on phone x1 e2e/look.test.ts |
| feud: Feud cues sound right | manual (audio judgement on a real device at Gate 2) | Gate 2 checklist |
| feud: Feud screens approved on screenshots | manual (visual and tone judgement at Gate 2) | Gate 2 checklist |
| game-engine: Play header has no Demo | e2e | ✓ Play header has no Demo x2 e2e/frame.test.ts |
| game-engine: Ending asks with a red Beenden | e2e | ✓ Ending asks with a red Beenden x2 e2e/frame.test.ts |
| game-engine: Discarded session shows no Demo and no status | e2e | ✓ Discarded session shows no Demo and no status x2 e2e/frame.test.ts |
| game-engine: Round status per game | unit | ✓ Round status per game x1 src/lib/games/status.test.ts |
| game-engine: Last round fills the progress line | unit ("Scenario: Round status per game") | ✓ Round status per game x1 src/lib/games/status.test.ts |
| game-engine: Duck progress follows the leading score | unit | ✓ Duck progress follows the leading score x1 src/lib/games/status.test.ts |
| game-engine: Status and progress in the header | e2e | ✓ Status and progress in the header x2 e2e/frame.test.ts |
| game-engine: Status without a total has no progress line | e2e | ✓ Status without a total has no progress line x2 e2e/frame.test.ts |
| game-engine: Header wraps on a phone | e2e | ✓ Header wraps on a phone x1 e2e/frame.test.ts |
| most-likely: Most Likely opener comes from the RNG | unit | ✓ Most Likely opener comes from the RNG x1 src/lib/games/most-likely/engine.test.ts |
| most-likely: Most Likely opener rotates each round | unit | ✓ Most Likely opener rotates each round x1 src/lib/games/most-likely/engine.test.ts |
| most-likely: Most Likely turn screen names the team | e2e | ✓ Most Likely turn screen names the team x2 e2e/most-likely.test.ts |
| players: Save, rename and delete in the Spieler page | e2e | ✓ Save, rename and delete in the Spieler page x2 e2e/players.test.ts |
| players: Deleting a saved player asks for confirmation | e2e | ✓ Deleting a saved player asks for confirmation x2 e2e/players.test.ts |
| players: Duplicate saved name shows the server message | e2e | ✓ Duplicate saved name shows the server message x2 e2e/players.test.ts |
| players: No saved players shows an empty state | e2e | ✓ No saved players shows an empty state x2 e2e/players.test.ts |
| players: Server unreachable keeps guests working | e2e | ✓ Server unreachable keeps guests working x2 e2e/players.test.ts |
| players: Saved players page by width | e2e | ✓ Saved players page by width x2 e2e/players.test.ts |
| players: Deleting the last saved player on a page goes back a page | e2e | ✓ Deleting the last saved player on a page goes back a page x2 e2e/players.test.ts |
| players: Saving a player shows its page | e2e | ✓ Saving a player shows its page x2 e2e/players.test.ts |
| players: Roster stays unpaged | e2e | ✓ Roster stays unpaged x2 e2e/players.test.ts |

## Manual checklist (Gate 2)

- Demo tips say why the step happens: run `npm run dev`, open each game's Demo from the start screen card, read the tips.
- Phase motion approved on a real device: play a game on a phone, watch phase/screen changes in and out.
- In-game screens approved on screenshots: review the screenshots listed below (all 6 games, phone + desktop).
- Feud cues sound right: play Feud on a real device with sound on (buzz, strike, steal, reveal).
- Feud screens approved on screenshots: review the phone-look-feud-* shots.

## Diffstat

git diff --stat origin/main...flow/arcade-polish: 80 files changed, 5448 insertions(+), 1476 deletions(-)

## Screenshots (not committed)

Directory: /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/e9c24136-e1ba-417f-9a0c-d28a07cc61c5/scratchpad/arcade-polish-shots/ (208 PNGs, round 3 run, phone-* and desktop-*)

- Duck Wertung (phone): phone-look-duck-scoring.png, phone-look-duck-scoring-locked.png, phone-duck-demo-scoring.png
- Feud play (phone): phone-look-feud-{prep,handoff,question,peek-held,faceoff,faceoff-double,buzz,board,result,result-double,steal-handoff,steal}.png
- Game over / winner (phone): phone-look-wavelength-gameover.png, phone-look-wavelength-koop-gameover.png, phone-look-codes-gameover.png, phone-look-duck-gameover.png, phone-look-most-likely-gameover.png, phone-look-feud-winner.png, phone-most-likely-endstand.png (Imposter has no winner screen); desktop-look-*-gameover.png and desktop-look-feud-winner.png counterparts

## Questions

- Round-1 tied-rank question resolved: e2e/duck.test.ts now asserts `.rank` = 1,1,3,3 for "Duck tie at the top reads Unentschieden".
- Duck game over without best/target figure: spec silent (duck/spec.md Spielende names winner, reason, ranking; no best/target figure). Target still shown in header status "Ziel T Punkte".
