verified-at: 211431a

## Layer 1: PORT=4712 npm run proof:full (green, one run, exit 0)

```
  ✓  686 [desktop] › e2e/look.test.ts:211:2 › look walk › Scenario: Touch targets are at least 44px (1ms)
  ✓  823 [desktop] › e2e/look.test.ts:215:2 › look walk › Scenario: Text contrast meets 4.5:1 (0ms)
  ✓  824 [desktop] › e2e/look.test.ts:219:2 › look walk › Scenario: Press Start 2P stays limited to logo and scores (0ms)
  ✓  825 [desktop] › e2e/look.test.ts:224:2 › look walk › Scenario: Decoration loads no external assets (0ms)
  ✓  826 [desktop] › e2e/look.test.ts:229:2 › look walk › Scenario: New copy has no exclamation marks (0ms)
  -  827 [desktop] › e2e/look.test.ts:234:2 › look walk › Scenario: No horizontal scroll on phone
  ✓  828 [desktop] › e2e/look.test.ts:239:2 › look walk › Scenario: Desktop uses the width (0ms)
  ✓  829 [desktop] › e2e/look.test.ts:353:2 › reduced motion › Scenario: Reduced motion makes transitions instant (215ms)
  ✓  830 [desktop] › e2e/look.test.ts:365:1 › Scenario: Motion never blocks input (316ms)

  42 skipped
  788 passed (6.0m)
```

Unit: 50 files, 466 tests passed. e2e: 788 passed, 42 skipped (project-bound tests).

## Layer 2: spec coverage (206 scenarios: 76 unit, 122 e2e, 8 manual, 0 gaps)

| Scenario | proof | Evidence |
|---|---|---|
| catalogue: Tiles for registered games | e2e | e2e/home.test.ts › "Scenario: Tiles for registered games" ✓ (desktop, phone) |
| catalogue: Player range derived from engine limits | unit | src/lib/games/registry.test.ts › "Scenario: Player range derived from engine limits" ✓ |
| catalogue: Registry lists Blood on the Clocktower last | unit | src/lib/games/registry.test.ts › "Scenario: Registry lists Blood on the Clocktower last" ✓ |
| catalogue: Start banner carries title, badge and player range | e2e | e2e/start.test.ts › "Scenario: Start banner carries title, badge and player range" ✓ (desktop, phone) |
| catalogue: Start panel first on phone, right column on desktop | e2e | e2e/start.test.ts › "Scenario: Start panel first on phone, right column on desktop" ✓ (desktop, phone) |
| catalogue: Same start layout for both games | e2e ("Scenario: Start panel first on phone, right column on desktop") | e2e/start.test.ts › "Scenario: Start panel first on phone, right column on desktop" ✓ (desktop, phone) |
| catalogue: Mehr-zu cards keep their targets | e2e | e2e/start.test.ts › "Scenario: Mehr-zu cards keep their targets" ✓ (desktop, phone) |
| catalogue: Old Erklärung link is not found | e2e | e2e/start.test.ts › "Scenario: Old Erklärung link is not found" ✓ (desktop, phone) |
| catalogue: Inhalte card shows the real content count | e2e | e2e/start.test.ts › "Scenario: Inhalte card shows the real content count" ✓ (desktop, phone) |
| catalogue: Los geht's opens the lobby | e2e | e2e/start.test.ts › "Scenario: Los geht's opens the lobby" ✓ (desktop, phone) |
| catalogue: So geht's covers both Wavelength modes | e2e | e2e/start.test.ts › "Scenario: So geht's covers both Wavelength modes" ✓ (desktop, phone) |
| catalogue: Count defaults to the roster size, clamped | e2e | e2e/clocktower-start.test.ts › "Scenario: Count defaults to the roster size, clamped" ✓ (desktop, phone) |
| catalogue: Count stays within 5 to 15 | e2e | e2e/clocktower-start.test.ts › "Scenario: Count stays within 5 to 15" ✓ (desktop, phone) |
| catalogue: Chosen count persists | e2e | e2e/clocktower-start.test.ts › "Scenario: Chosen count persists" ✓ (desktop, phone) |
| catalogue: Roster changes keep the chosen count | e2e | e2e/clocktower-start.test.ts › "Scenario: Roster changes keep the chosen count" ✓ (desktop, phone) |
| catalogue: Invalid stored count falls back to the default | unit | src/lib/count.test.ts › "Scenario: Invalid stored count falls back to the default" ✓ |
| catalogue: Clocktower banner, rules and pitch | e2e | e2e/clocktower-start.test.ts › "Scenario: Clocktower banner, rules and pitch" ✓ (desktop, phone) |
| catalogue: Erklärung card instead of Demo and Inhalte | e2e | e2e/clocktower-start.test.ts › "Scenario: Erklärung card instead of Demo and Inhalte" ✓ (desktop, phone) |
| catalogue: Clocktower demo and Inhalte are not found | e2e | e2e/clocktower-start.test.ts › "Scenario: Clocktower demo and Inhalte are not found" ✓ (desktop, phone) |
| clocktower: Twenty-two characters by team | unit | src/lib/games/clocktower/characters.test.ts › "Scenario: Twenty-two characters by team" ✓ |
| clocktower: Setup table for every count | unit | src/lib/games/clocktower/setup.test.ts › "Scenario: Setup table for every count" ✓ |
| clocktower: Swap two seats by tapping | e2e | e2e/clocktower-setup.test.ts › "Scenario: Swap two seats by tapping" ✓ (desktop, phone) |
| clocktower: Drag a seat to a new place | e2e | e2e/clocktower-setup.test.ts › "Scenario: Drag a seat to a new place" ✓ (desktop) |
| clocktower: Swap seats by keyboard | e2e | e2e/clocktower-setup.test.ts › "Scenario: Swap seats by keyboard" ✓ (desktop, phone) |
| clocktower: Five and fifteen seats fit the setup board | e2e | e2e/clocktower-setup.test.ts › "Scenario: Five and fifteen seats fit the setup board" ✓ (desktop, phone) |
| clocktower: Seat order carries into the game | unit | src/lib/games/clocktower/engine.test.ts › "Scenario: Seat order carries into the game" ✓ |
| clocktower: Counters follow the setup table | e2e | e2e/clocktower-setup.test.ts › "Scenario: Counters follow the setup table" ✓ (desktop, phone) |
| clocktower: Baron changes the requirement live | e2e | e2e/clocktower-setup.test.ts › "Scenario: Baron changes the requirement live" ✓ (desktop, phone) |
| clocktower: Over-assigned team shown as an error | e2e | e2e/clocktower-setup.test.ts › "Scenario: Over-assigned team shown as an error" ✓ (desktop, phone) |
| clocktower: Each character at most once | unit | src/lib/games/clocktower/engine.test.ts › "Scenario: Each character at most once" ✓ |
| clocktower: Assign by seat or by character first | e2e | e2e/clocktower-setup.test.ts › "Scenario: Assign by seat or by character first" ✓ (desktop, phone) |
| clocktower: Random fill keeps manual choices | unit | src/lib/games/clocktower/engine.test.ts › "Scenario: Random fill keeps manual choices" ✓ |
| clocktower: Random fill with a manual Baron | unit | src/lib/games/clocktower/engine.test.ts › "Scenario: Random fill with a manual Baron" ✓ |
| clocktower: Alles neu rerolls every seat | unit | src/lib/games/clocktower/engine.test.ts › "Scenario: Alles neu rerolls every seat" ✓ |
| clocktower: Impossible manual choice is flagged | e2e | e2e/clocktower-setup.test.ts › "Scenario: Impossible manual choice is flagged" ✓ (desktop, phone) |
| clocktower: Random distribution is seeded | unit | src/lib/games/clocktower/engine.test.ts › "Scenario: Random distribution is seeded" ✓ |
| clocktower: Believed role is a Townsfolk not in play | unit | src/lib/games/clocktower/engine.test.ts › "Scenario: Believed role is a Townsfolk not in play" ✓ |
| clocktower: Red herring is a good player | unit | src/lib/games/clocktower/engine.test.ts › "Scenario: Red herring is a good player" ✓ |
| clocktower: Drunk Fortune Teller gets a red herring | unit | src/lib/games/clocktower/engine.test.ts › "Scenario: Drunk Fortune Teller gets a red herring" ✓ |
| clocktower: Reassigning clears stale picks | unit | src/lib/games/clocktower/engine.test.ts › "Scenario: Reassigning clears stale picks" ✓ |
| clocktower: Drunk and red herring on the board | e2e | e2e/clocktower-setup.test.ts › "Scenario: Drunk and red herring on the board" ✓ (desktop, phone) |
| clocktower: Weiter needs a complete valid distribution | e2e | e2e/clocktower-setup.test.ts › "Scenario: Weiter needs a complete valid distribution" ✓ (desktop, phone) |
| clocktower: Confirm before the reveal | e2e | e2e/clocktower-setup.test.ts › "Scenario: Confirm before the reveal" ✓ (desktop, phone) |
| clocktower: Locked distribution cannot change | unit | src/lib/games/clocktower/engine.test.ts › "Scenario: Locked distribution cannot change" ✓ |
| clocktower: Setup board shows the character sheet | e2e | e2e/clocktower-setup.test.ts › "Scenario: Setup board shows the character sheet" ✓ (desktop, phone) |
| clocktower: Reveal walks seat by seat | e2e | e2e/clocktower-setup.test.ts › "Scenario: Reveal walks seat by seat" ✓ (desktop, phone) |
| clocktower: Drunk sees the believed Townsfolk | e2e | e2e/clocktower-setup.test.ts › "Scenario: Drunk sees the believed Townsfolk" ✓ (desktop, phone) |
| clocktower: Card stays until hidden | e2e | e2e/clocktower-setup.test.ts › "Scenario: Card stays until hidden" ✓ (desktop, phone) |
| clocktower: Hidden card leaves nothing readable | e2e | e2e/clocktower-setup.test.ts › "Scenario: Hidden card leaves nothing readable" ✓ (desktop, phone) |
| clocktower: Reload mid-reveal resumes hidden | e2e | e2e/clocktower-setup.test.ts › "Scenario: Reload mid-reveal resumes hidden" ✓ (desktop, phone) |
| clocktower: Circle shows seats, alive and ghost votes | e2e | e2e/clocktower-day.test.ts › "Scenario: Circle shows seats, alive and ghost votes" ✓ (desktop, phone) |
| clocktower: Circle geometry for five to fifteen seats | unit | src/lib/games/clocktower/circle.test.ts › "Scenario: Circle geometry for five to fifteen seats" ✓ |
| clocktower: Circle legible on phone and desktop | e2e | e2e/clocktower-day.test.ts › "Scenario: Circle legible on phone and desktop" ✓ (desktop, phone) |
| clocktower: Header shows the night or day and the alive count | e2e | e2e/clocktower-day.test.ts › "Scenario: Header shows the night or day and the alive count" ✓ (desktop, phone) |
| clocktower: Death on the circle is animated | e2e | e2e/clocktower-day.test.ts › "Scenario: Death on the circle is animated" ✓ (desktop, phone) |
| clocktower: Every phase survives a reload | unit | src/lib/games/clocktower/engine.test.ts › "Scenario: Every phase survives a reload" ✓ |
| clocktower: Stale Clocktower session discarded | e2e | e2e/clocktower-session.test.ts › "Scenario: Stale Clocktower session discarded" ✓ (desktop, phone) |
| clocktower: Spiel beenden clears the Clocktower session | e2e | e2e/clocktower-session.test.ts › "Scenario: Spiel beenden clears the Clocktower session" ✓ (desktop, phone) |
| clocktower: Night starts with Alle schlafen ein | e2e | e2e/clocktower-night.test.ts › "Scenario: Night starts with Alle schlafen ein" ✓ (desktop, phone) |
| clocktower: Night order for 5, 7 and 15 players | unit | src/lib/games/clocktower/night.test.ts › "Scenario: Night order for 5, 7 and 15 players" ✓ |
| clocktower: Small games have no evil info | unit | src/lib/games/clocktower/night.test.ts › "Scenario: Small games have no evil info" ✓ |
| clocktower: Conditional wakes on other nights | unit | src/lib/games/clocktower/night.test.ts › "Scenario: Conditional wakes on other nights" ✓ |
| clocktower: Drunk wakes at the believed slot | unit | src/lib/games/clocktower/night.test.ts › "Scenario: Drunk wakes at the believed slot" ✓ |
| clocktower: New Imp wakes as Imp | unit | src/lib/games/clocktower/night.test.ts › "Scenario: New Imp wakes as Imp" ✓ |
| clocktower: Each waking step is four screens | e2e | e2e/clocktower-night.test.ts › "Scenario: Each waking step is four screens" ✓ (desktop, phone) |
| clocktower: Group steps name every seat | e2e | e2e/clocktower-night.test.ts › "Scenario: Group steps name every seat" ✓ (desktop, phone) |
| clocktower: Skip and back keep state | unit | src/lib/games/clocktower/engine.test.ts › "Scenario: Skip and back keep state" ✓ |
| clocktower: Pair info for the first-night Townsfolk | unit | src/lib/games/clocktower/info.test.ts › "Scenario: Pair info for the first-night Townsfolk" ✓ |
| clocktower: Chef counts evil pairs around the circle | unit | src/lib/games/clocktower/info.test.ts › "Scenario: Chef counts evil pairs around the circle" ✓ |
| clocktower: Empath skips dead neighbours | unit | src/lib/games/clocktower/info.test.ts › "Scenario: Empath skips dead neighbours" ✓ |
| clocktower: Fortune Teller and Undertaker info | unit | src/lib/games/clocktower/info.test.ts › "Scenario: Fortune Teller and Undertaker info" ✓ |
| clocktower: Roles without info | unit | src/lib/games/clocktower/info.test.ts › "Scenario: Roles without info" ✓ |
| clocktower: Suggestion labelled with its caveat | e2e | e2e/clocktower-night.test.ts › "Scenario: Suggestion labelled with its caveat" ✓ (desktop, phone) |
| clocktower: Show-bar opens full-screen cards | e2e | e2e/clocktower-night.test.ts › "Scenario: Show-bar opens full-screen cards" ✓ (desktop, phone) |
| clocktower: Role preselects its cards | e2e | e2e/clocktower-night.test.ts › "Scenario: Role preselects its cards" ✓ (desktop, phone) |
| clocktower: Bluffs are good characters not in play | unit | src/lib/games/clocktower/setup.test.ts › "Scenario: Bluffs are good characters not in play" ✓ |
| clocktower: Bluffs can be rerolled before showing | e2e | e2e/clocktower-night.test.ts › "Scenario: Bluffs can be rerolled before showing" ✓ (desktop, phone) |
| clocktower: Grimoire visible only while held | e2e | e2e/clocktower-night.test.ts › "Scenario: Grimoire visible only while held" ✓ (desktop, phone) |
| clocktower: Release outside the button hides the grimoire | e2e | e2e/clocktower-night.test.ts › "Scenario: Release outside the button hides the grimoire" ✓ (desktop, phone) |
| clocktower: Grimoire by keyboard | e2e | e2e/clocktower-night.test.ts › "Scenario: Grimoire by keyboard" ✓ (desktop, phone) |
| clocktower: No grimoire by day | e2e | e2e/clocktower-day.test.ts › "Scenario: No grimoire by day" ✓ (desktop, phone) |
| clocktower: Noted target prefills the death step | e2e | e2e/clocktower-night.test.ts › "Scenario: Noted target prefills the death step" ✓ (desktop, phone) |
| clocktower: Starpass makes a living Minion the Imp | unit | src/lib/games/clocktower/engine.test.ts › "Scenario: Starpass makes a living Minion the Imp" ✓ |
| clocktower: Scarlet Woman forced on a starpass | unit | src/lib/games/clocktower/engine.test.ts › "Scenario: Scarlet Woman forced on a starpass" ✓ |
| clocktower: Starpass without a living Minion | unit | src/lib/games/clocktower/engine.test.ts › "Scenario: Starpass without a living Minion" ✓ |
| clocktower: Imp wählt sich selbst wakes the new Imp | e2e | e2e/clocktower-night.test.ts › "Scenario: Imp wählt sich selbst wakes the new Imp" ✓ (desktop, phone) |
| clocktower: Death step records the night's deaths | unit | src/lib/games/clocktower/engine.test.ts › "Scenario: Death step records the night's deaths" ✓ |
| clocktower: Dead seats cannot be selected | e2e | e2e/clocktower-night.test.ts › "Scenario: Dead seats cannot be selected" ✓ (desktop, phone) |
| clocktower: Win check after the death step | unit | src/lib/games/clocktower/engine.test.ts › "Scenario: Win check after the death step" ✓ |
| clocktower: Dawn shows the night's deaths | e2e | e2e/clocktower-day.test.ts › "Scenario: Dawn shows the night's deaths" ✓ (desktop, phone) |
| clocktower: Day timer dialog | e2e | e2e/clocktower-day.test.ts › "Scenario: Day timer dialog" ✓ (desktop, phone) |
| clocktower: Reload keeps the remaining time | e2e | e2e/clocktower-day.test.ts › "Scenario: Reload keeps the remaining time" ✓ (desktop, phone) |
| clocktower: Timer reads Zeit um at zero and never blocks | e2e | e2e/clocktower-day.test.ts › "Scenario: Timer reads Zeit um at zero and never blocks" ✓ (desktop, phone) |
| clocktower: Timer keeps running during a vote | e2e | e2e/clocktower-day.test.ts › "Scenario: Timer keeps running during a vote" ✓ (desktop, phone) |
| clocktower: Remaining time from the deadline | unit | src/lib/games/clocktower/timer.test.ts › "Scenario: Remaining time from the deadline" ✓ |
| clocktower: Nomination rules enforced | unit | src/lib/games/clocktower/engine.test.ts › "Scenario: Nomination rules enforced" ✓ |
| clocktower: Unavailable choices show a reason | e2e | e2e/clocktower-day.test.ts › "Scenario: Unavailable choices show a reason" ✓ (desktop, phone) |
| clocktower: Zurück cancels the nomination unused | e2e | e2e/clocktower-day.test.ts › "Scenario: Zurück cancels the nomination unused" ✓ (desktop, phone) |
| clocktower: Clock points at the nominee | e2e | e2e/clocktower-day.test.ts › "Scenario: Clock points at the nominee" ✓ (desktop, phone) |
| clocktower: Sweep order ends at the nominee | unit | src/lib/games/clocktower/vote.test.ts › "Scenario: Sweep order ends at the nominee" ✓ |
| clocktower: Sweep lasts 2.5 seconds per seat | unit | src/lib/games/clocktower/vote.test.ts › "Scenario: Sweep lasts 2.5 seconds per seat" ✓ |
| clocktower: Real short sweep marks votes | e2e | e2e/clocktower-day.test.ts › "Scenario: Real short sweep marks votes" ✓ (desktop, phone) |
| clocktower: Dead without ghost vote cannot be marked | e2e | e2e/clocktower-day.test.ts › "Scenario: Dead without ghost vote cannot be marked" ✓ (desktop, phone) |
| clocktower: Confirm corrects missed timing | e2e | e2e/clocktower-day.test.ts › "Scenario: Confirm corrects missed timing" ✓ (desktop, phone) |
| clocktower: Dead voters spend their ghost vote | unit | src/lib/games/clocktower/engine.test.ts › "Scenario: Dead voters spend their ghost vote" ✓ |
| clocktower: Reduced motion hand jumps | e2e | e2e/clocktower-day.test.ts › "Scenario: Reduced motion hand jumps" ✓ (desktop, phone) |
| clocktower: Vote result by threshold and high-water mark | unit | src/lib/games/clocktower/engine.test.ts › "Scenario: Vote result by threshold and high-water mark" ✓ |
| clocktower: Threshold uses living players at vote time | unit | src/lib/games/clocktower/engine.test.ts › "Scenario: Threshold uses living players at vote time" ✓ |
| clocktower: Block holder marked on the circle | e2e | e2e/clocktower-day.test.ts › "Scenario: Block holder marked on the circle" ✓ (desktop, phone) |
| clocktower: Seat actions name no character | e2e | e2e/clocktower-day.test.ts › "Scenario: Seat actions name no character" ✓ (desktop, phone) |
| clocktower: Immediate execution ends the day | unit | src/lib/games/clocktower/engine.test.ts › "Scenario: Immediate execution ends the day" ✓ |
| clocktower: Death by day runs the win check | unit | src/lib/games/clocktower/engine.test.ts › "Scenario: Death by day runs the win check" ✓ |
| clocktower: Corrections by day | unit | src/lib/games/clocktower/engine.test.ts › "Scenario: Corrections by day" ✓ |
| clocktower: Tag beenden executes the block holder | e2e | e2e/clocktower-day.test.ts › "Scenario: Tag beenden executes the block holder" ✓ (desktop, phone) |
| clocktower: No execution after a tie or without nominations | e2e | e2e/clocktower-day.test.ts › "Scenario: No execution after a tie or without nominations" ✓ (desktop, phone) |
| clocktower: Executing a dead player counts as the execution | unit | src/lib/games/clocktower/engine.test.ts › "Scenario: Executing a dead player counts as the execution" ✓ |
| clocktower: Good wins when the Demon dies | unit | src/lib/games/clocktower/win.test.ts › "Scenario: Good wins when the Demon dies" ✓ |
| clocktower: Evil wins at two alive | unit | src/lib/games/clocktower/win.test.ts › "Scenario: Evil wins at two alive" ✓ |
| clocktower: Both at once good wins | unit | src/lib/games/clocktower/win.test.ts › "Scenario: Both at once good wins" ✓ |
| clocktower: Recluse never counts as the Demon | unit | src/lib/games/clocktower/win.test.ts › "Scenario: Recluse never counts as the Demon" ✓ |
| clocktower: New Demon checked after a starpass | unit | src/lib/games/clocktower/win.test.ts › "Scenario: New Demon checked after a starpass" ✓ |
| clocktower: Scarlet Woman question at the next dusk | unit | src/lib/games/clocktower/win.test.ts › "Scenario: Scarlet Woman question at the next dusk" ✓ |
| clocktower: Scarlet Woman needs five alive before the death | unit | src/lib/games/clocktower/win.test.ts › "Scenario: Scarlet Woman needs five alive before the death" ✓ |
| clocktower: Saint executed asks at dusk | unit | src/lib/games/clocktower/win.test.ts › "Scenario: Saint executed asks at dusk" ✓ |
| clocktower: Mayor question at dusk | unit | src/lib/games/clocktower/win.test.ts › "Scenario: Mayor question at dusk" ✓ |
| clocktower: Drunk Mayor or Saint never asks | unit | src/lib/games/clocktower/win.test.ts › "Scenario: Drunk Mayor or Saint never asks" ✓ |
| clocktower: Public screen gives nothing away | e2e | e2e/clocktower-game.test.ts › "Scenario: Public screen gives nothing away" ✓ (desktop, phone) |
| clocktower: Storyteller declares the winner at night | e2e | e2e/clocktower-night.test.ts › "Scenario: Storyteller declares the winner at night" ✓ (desktop, phone) |
| clocktower: Teaser names no team | e2e | e2e/clocktower-end.test.ts › "Scenario: Teaser names no team" ✓ (desktop, phone) |
| clocktower: Reveal shows the winning team and every seat | e2e | e2e/clocktower-end.test.ts › "Scenario: Reveal shows the winning team and every seat" ✓ (desktop, phone) |
| clocktower: Reload on the teaser keeps it hidden | e2e | e2e/clocktower-end.test.ts › "Scenario: Reload on the teaser keeps it hidden" ✓ (desktop, phone) |
| clocktower: Session cleared only on leaving | e2e | e2e/clocktower-end.test.ts › "Scenario: Session cleared only on leaving" ✓ (desktop, phone) |
| clocktower: Winner for every ending | unit | src/lib/games/clocktower/win.test.ts › "Scenario: Winner for every ending" ✓ |
| clocktower: Full Clocktower game | e2e | e2e/clocktower-game.test.ts › "Scenario: Full Clocktower game" ✓ (phone) |
| clocktower: Deck navigation by tap, swipe and keys | e2e | e2e/clocktower-deck.test.ts › "Scenario: Deck navigation by tap, swipe and keys" ✓ (desktop, phone) |
| clocktower: Deck readable without horizontal scroll | e2e | e2e/clocktower-deck.test.ts › "Scenario: Deck readable without horizontal scroll" ✓ (desktop, phone) |
| clocktower: Deck closes to the start screen | e2e | e2e/clocktower-deck.test.ts › "Scenario: Deck closes to the start screen" ✓ (desktop, phone) |
| clocktower: Slide change animated, crossfade under reduced motion | e2e | e2e/clocktower-deck.test.ts › "Scenario: Slide change animated, crossfade under reduced motion" ✓ (desktop, phone) |
| clocktower: Deck carries the presentation's content | manual (content comparison by Rue at Gate 2) | see checklist |
| clocktower: Role-count slide for every count | unit | src/lib/games/clocktower/deck.test.ts › "Scenario: Role-count slide for every count" ✓ |
| clocktower: Voting slide uses half the players | unit | src/lib/games/clocktower/deck.test.ts › "Scenario: Voting slide uses half the players" ✓ |
| clocktower: Official win wording in the deck | unit | src/lib/games/clocktower/deck.test.ts › "Scenario: Official win wording in the deck" ✓ |
| clocktower: Deck follows the chosen count | e2e | e2e/clocktower-deck.test.ts › "Scenario: Deck follows the chosen count" ✓ (desktop, phone) |
| clocktower: Deck explains the app | e2e | e2e/clocktower-deck.test.ts › "Scenario: Deck explains the app" ✓ (desktop, phone) |
| clocktower: App slides read clearly | manual (wording judgement by Rue at Gate 2) | see checklist |
| clocktower: Sheet lists all characters | unit | src/lib/games/clocktower/sheet.test.ts › "Scenario: Sheet lists all characters" ✓ |
| clocktower: Sheet fits one desktop viewport | e2e | e2e/clocktower-deck.test.ts › "Scenario: Sheet fits one desktop viewport" ✓ (desktop) |
| clocktower: Sheet on phone is two pages | e2e | e2e/clocktower-deck.test.ts › "Scenario: Sheet on phone is two pages" ✓ (phone) |
| clocktower: Credits slide names the sources | e2e | e2e/clocktower-deck.test.ts › "Scenario: Credits slide names the sources" ✓ (desktop, phone) |
| clocktower: Sheet in the look of the PDF | manual (visual judgement at Gate 2) | see checklist |
| demo: Only the expected control is enabled | e2e | e2e/demo.test.ts › "Scenario: Only the expected control is enabled" ✓ (desktop, phone) |
| demo: Hidden information shown with Demo tag | e2e | e2e/demo.test.ts › "Scenario: Hidden information shown with Demo tag" ✓ (desktop, phone) |
| demo: Demo leaves real data untouched | e2e | e2e/demo.test.ts › "Scenario: Demo leaves real data untouched" ✓ (desktop, phone) |
| demo: Exiting returns to the starting screen | e2e | e2e/demo.test.ts › "Scenario: Exiting returns to the starting screen" ✓ (desktop, phone) |
| demo: Reload during demo returns to start screen | e2e | e2e/demo.test.ts › "Scenario: Reload during demo returns to start screen" ✓ (desktop, phone) |
| demo: Demo steppable with reduced motion | e2e | e2e/demo.test.ts › "Scenario: Demo steppable with reduced motion" ✓ (desktop, phone) |
| demo: Every demo covers its outcome branches over several rounds | unit ("Scenario: Imposter demo covers every outcome branch", "Scenario: Wavelength demo covers every outcome branch", "Scenario: Feud demo covers every outcome branch", "Scenario: Codes demo covers every outcome branch", "Scenario: Duck demo covers every outcome branch", "Scenario: Most Likely demo covers every outcome branch") | src/lib/games/imposter/demo.test.ts › "Scenario: Imposter demo covers every outcome branch" ✓ |
| demo: Demo tips read neutral | unit ("Scenario: Imposter demo covers every outcome branch", "Scenario: Wavelength demo tips read neutral", "Scenario: Feud demo covers every outcome branch", "Scenario: Codes demo covers every outcome branch", "Scenario: Duck demo covers every outcome branch", "Scenario: Most Likely demo covers every outcome branch") | src/lib/games/imposter/demo.test.ts › "Scenario: Imposter demo covers every outcome branch" ✓ |
| demo: Demo tips say why the step happens | manual (wording judgement by Rue at Gate 2) | see checklist |
| demo: Long demo progress reads correctly | e2e ("Scenario: Feud demo by tapping highlighted controls", "Scenario: Most Likely demo by tapping highlighted controls", "Scenario: Duck demo by tapping highlighted controls") | e2e/feud-demo.test.ts › "Scenario: Feud demo by tapping highlighted controls" ✓ (desktop, phone) |
| demo: Generic demo checks skip a game without a demo | unit | src/lib/demo/runner.test.ts › "Scenario: Generic demo checks skip a game without a demo" ✓ |
| demo: Game without a demo has no demo route | e2e ("Scenario: Clocktower demo and Inhalte are not found") | e2e/clocktower-start.test.ts › "Scenario: Clocktower demo and Inhalte are not found" ✓ (desktop, phone) |
| design-system: Text contrast meets 4.5:1 | e2e | e2e/look.test.ts › "Scenario: Text contrast meets 4.5:1" ✓ (desktop, phone) |
| design-system: Look approved on screenshots | manual (visual judgement at Gate 2) | see checklist |
| design-system: Clocktower colour meets contrast | unit | src/lib/ui/tokens.test.ts › "Scenario: Clocktower colour meets contrast" ✓ |
| design-system: Other games keep the Arcade-Abend look | e2e | e2e/clocktower-theme.test.ts › "Scenario: Other games keep the Arcade-Abend look" ✓ (desktop, phone) |
| design-system: Clocktower tokens meet contrast in both variants | unit | src/lib/ui/tokens.test.ts › "Scenario: Clocktower tokens meet contrast in both variants" ✓ |
| design-system: Theme only on Clocktower routes | e2e | e2e/clocktower-theme.test.ts › "Scenario: Theme only on Clocktower routes" ✓ (desktop, phone) |
| design-system: No theme flash on reload | e2e | e2e/clocktower-theme.test.ts › "Scenario: No theme flash on reload" ✓ (desktop, phone) |
| design-system: Clocktower fonts are self-hosted | e2e | e2e/clocktower-theme.test.ts › "Scenario: Clocktower fonts are self-hosted" ✓ (desktop, phone) |
| design-system: Clocktower look rules on every screen | e2e ("Scenario: Text contrast meets 4.5:1", "Scenario: Touch targets are at least 44px", "Scenario: No horizontal scroll on phone", "Scenario: Press Start 2P stays limited to logo and scores", "Scenario: Decoration loads no external assets") | e2e/look.test.ts › "Scenario: Text contrast meets 4.5:1" ✓ (desktop, phone) |
| design-system: Day and night variants switch with an animation | e2e | e2e/clocktower-game.test.ts › "Scenario: Day and night variants switch with an animation" ✓ (desktop, phone) |
| design-system: Clocktower ambient motion off under reduced motion | e2e | e2e/clocktower-theme.test.ts › "Scenario: Clocktower ambient motion off under reduced motion" ✓ (desktop, phone) |
| design-system: Clocktower gets its own motif | unit | src/lib/deco/motifs.test.ts › "Scenario: Clocktower gets its own motif" ✓ |
| design-system: Clocktower tile and start art | e2e | e2e/deco.test.ts › "Scenario: Clocktower tile and start art" ✓ (desktop, phone) |
| design-system: Clocktower look approved on screenshots | manual (visual judgement at Gate 2, on the verifier's screenshots) | see checklist |
| design-system: Home to Clocktower runs a view transition | e2e | e2e/clocktower-theme.test.ts › "Scenario: Home to Clocktower runs a view transition" ✓ (desktop, phone) |
| design-system: Navigation without View Transitions | e2e | e2e/clocktower-theme.test.ts › "Scenario: Navigation without View Transitions" ✓ (desktop, phone) |
| design-system: Reduced motion skips the view transition | e2e | e2e/clocktower-theme.test.ts › "Scenario: Reduced motion skips the view transition" ✓ (desktop, phone) |
| design-system: Back button leaves Clocktower | e2e | e2e/clocktower-theme.test.ts › "Scenario: Back button leaves Clocktower" ✓ (desktop, phone) |
| design-system: Transitions feel smooth | manual (motion feel is a visual judgement, at Gate 2) | see checklist |
| game-engine: Reload mid-game resumes the same phase | e2e | e2e/imposter.test.ts › "Scenario: Reload mid-game resumes the same phase" ✓ (desktop, phone) |
| game-engine: Spiel beenden clears the session | e2e | e2e/imposter.test.ts › "Scenario: Spiel beenden clears the session" ✓ (desktop, phone) |
| game-engine: Old or corrupt saved state discarded | e2e | e2e/start.test.ts › "Scenario: Old or corrupt saved state discarded" ✓ (desktop, phone) |
| game-engine: Two tabs last write wins | unit | src/lib/session.test.ts › "Scenario: Two tabs last write wins" ✓ |
| game-engine: Roster edit mid-game keeps the session snapshot | unit | src/lib/session.test.ts › "Scenario: Roster edit mid-game keeps the session snapshot" ✓ |
| game-engine: Game without a demo checks its explicit template | unit | src/lib/games/clocktower/engine.test.ts › "Scenario: Game without a demo checks its explicit template" ✓ |
| game-engine: Round status per game | unit | src/lib/games/status.test.ts › "Scenario: Round status per game" ✓ |
| game-engine: Last round fills the progress line | unit ("Scenario: Round status per game") | src/lib/games/status.test.ts › "Scenario: Round status per game" ✓ |
| game-engine: Duck progress follows the leading score | unit | src/lib/games/status.test.ts › "Scenario: Duck progress follows the leading score" ✓ |
| game-engine: Status and progress in the header | e2e | e2e/frame.test.ts › "Scenario: Status and progress in the header" ✓ (desktop, phone) |
| game-engine: Status without a total has no progress line | e2e | e2e/frame.test.ts › "Scenario: Status without a total has no progress line" ✓ (desktop, phone) |
| game-engine: Header wraps on a phone | e2e | e2e/frame.test.ts › "Scenario: Header wraps on a phone" ✓ (phone) |
| game-engine: Clocktower status per phase | unit | src/lib/games/status.test.ts › "Scenario: Clocktower status per phase" ✓ |
| game-engine: Game without content starts without a content fetch | e2e | e2e/clocktower-start.test.ts › "Scenario: Game without content starts without a content fetch" ✓ (desktop, phone) |
| game-engine: Games with content keep their content gate | e2e ("Scenario: Empty pool blocks start") | e2e/start.test.ts › "Scenario: Empty pool blocks start" ✓ (desktop, phone) |
| roster: Below minimum disables start | e2e | e2e/start.test.ts › "Scenario: Below minimum disables start" ✓ (desktop, phone) |
| roster: Above maximum asks who plays | e2e | e2e/start.test.ts › "Scenario: Above maximum asks who plays" ✓ (desktop, phone) |
| roster: Fewer than N offers adding players | e2e | e2e/clocktower-start.test.ts › "Scenario: Fewer than N offers adding players" ✓ (desktop, phone) |
| roster: More than N picks exactly N | e2e | e2e/clocktower-start.test.ts › "Scenario: More than N picks exactly N" ✓ (desktop, phone) |
| roster: Exactly N goes to the start | e2e | e2e/clocktower-start.test.ts › "Scenario: Exactly N goes to the start" ✓ (desktop, phone) |
| roster: Count changed while in the lobby | e2e | e2e/clocktower-start.test.ts › "Scenario: Count changed while in the lobby" ✓ (desktop, phone) |
| roster: Roster above the Clocktower maximum | e2e | e2e/clocktower-start.test.ts › "Scenario: Roster above the Clocktower maximum" ✓ (desktop, phone) |
| sound: Clocktower effects obey mute and first interaction | unit | src/lib/sound.test.ts › "Scenario: Clocktower effects obey mute and first interaction" ✓ |
| sound: Clocktower effects without WebAudio | unit | src/lib/sound.test.ts › "Scenario: Clocktower effects without WebAudio" ✓ |
| sound: Clocktower sounds at the right moments | manual (audio judgement on a real device at Gate 2) | see checklist |

## Manual checklist (npm run dev -> http://localhost:5173)

- Catalogue: open the start screen, Blood on the Clocktower tile is last; open it and check the start panel and badge.
- Deck content: open the explanation deck from the lobby and compare slides with the presentation (Deck carries the presentation's content).
- App slides: read the app slides (show, night, grimoire, vote, timer, end) for wording clarity.
- Sheet: open the sheet slide on phone width and compare with the PDF look; it scrolls at >=14px by design.
- Demo tips: run the Clocktower demo and check each tip says why the step happens.
- Look: walk lobby, setup, reveal, night, dawn, day, vote, end on phone and desktop; check the night and day themes against the screenshots.
- Motion: play a night and a day, judge that transitions feel smooth.
- Sound: on a real device play a night, dawn, execution and end, check cues fit the moments.

## Diffstat

```
 .../spiele/[slug]/erklaerung/+page.server.ts       |  10 +
 src/routes/spiele/[slug]/erklaerung/+page.svelte   |  30 +
 src/routes/spiele/[slug]/inhalte/+page.server.ts   |   2 +
 src/routes/spiele/[slug]/inhalte/+page.svelte      |   8 +-
 src/routes/spiele/[slug]/lobby/+page.svelte        |  58 +-
 src/routes/spiele/[slug]/spielen/+page.svelte      |   7 +
 static/fonts/AlegreyaSans-OFL.txt                  |  93 +++
 static/fonts/IMFellEnglish-OFL.txt                 |  93 +++
 static/fonts/alegreya-sans-latin-400.woff2         | Bin 0 -> 23708 bytes
 static/fonts/alegreya-sans-latin-500.woff2         | Bin 0 -> 23928 bytes
 static/fonts/alegreya-sans-latin-700.woff2         | Bin 0 -> 23976 bytes
 static/fonts/im-fell-english-italic-latin.woff2    | Bin 0 -> 57808 bytes
 static/fonts/im-fell-english-latin.woff2           | Bin 0 -> 59880 bytes
 static/fonts/im-fell-english-sc-latin.woff2        | Bin 0 -> 56956 bytes
 124 files changed, 14025 insertions(+), 68 deletions(-)
```

## Screenshots (not committed)

- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/desktop-look-clocktower-card-pair.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/desktop-look-clocktower-circle-pair.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/desktop-look-clocktower-clock-7.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/desktop-look-clocktower-dawn-7.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/desktop-look-clocktower-deaths.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/desktop-look-clocktower-deck-app-vote.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/desktop-look-clocktower-deck-sheet.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/desktop-look-clocktower-deck-title.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/desktop-look-clocktower-dusk.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/desktop-look-clocktower-end-reveal-evil.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/desktop-look-clocktower-end-teaser-good.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/desktop-look-clocktower-execution-7.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/desktop-look-clocktower-grimoire-7.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/desktop-look-clocktower-show-du-bist.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/desktop-look-clocktower-wake-pair.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/desktop-look-lobby-clocktower-pick.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/desktop-look-lobby-clocktower.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/desktop-look-start-clocktower.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/phone-look-clocktower-card-pair.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/phone-look-clocktower-circle-pair.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/phone-look-clocktower-clock-7.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/phone-look-clocktower-dawn-7.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/phone-look-clocktower-deaths.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/phone-look-clocktower-deck-app-vote.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/phone-look-clocktower-deck-sheet.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/phone-look-clocktower-deck-title.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/phone-look-clocktower-dusk.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/phone-look-clocktower-end-reveal-evil.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/phone-look-clocktower-end-teaser-good.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/phone-look-clocktower-execution-7.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/phone-look-clocktower-grimoire-7.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/phone-look-clocktower-show-du-bist.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/phone-look-clocktower-wake-pair.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/phone-look-lobby-clocktower-pick.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/phone-look-lobby-clocktower.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/phone-look-start-clocktower.png
- Full set: /home/Rue/.cache/flow/Rues-Arcade/blood-on-the-clocktower/test-results/shots/ (phone-look-clocktower-*, desktop-look-clocktower-*)
