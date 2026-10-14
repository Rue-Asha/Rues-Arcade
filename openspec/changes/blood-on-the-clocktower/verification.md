verified-at: ccd34ad

# Verification r2

## Layer 1: `PORT=4712 npm run proof:full` (green, run 1 of 1)

Unit: `npx vitest run --reporter=verbose` 468 passed (468). Full log: /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/full1.log

```
  ✓  821 [desktop] › e2e/feud.test.ts:586:1 › Scenario: Feud motion never blocks input (3.1s)
  ✓  822 [desktop] › e2e/feud.test.ts:617:1 › Scenario: Feud reduced motion is instant (1.9s)
Error: attempt to write a readonly database
    at addPlayed (src/lib/server/played.ts:22:43)
    at POST (src/routes/api/feud/played/+server.ts:13:2)
  ✓  823 [desktop] › e2e/feud.test.ts:667:1 › Scenario: Feud peek does not block a tile flip (4.4s)
  ✓  824 [desktop] › e2e/feud.test.ts:697:1 › Scenario: Feud peek instant under reduced motion (1.3s)
  ✓  680 [desktop] › e2e/look.test.ts:211:2 › look walk › Scenario: Touch targets are at least 44px (0ms)
  ✓  825 [desktop] › e2e/look.test.ts:215:2 › look walk › Scenario: Text contrast meets 4.5:1 (0ms)
  ✓  826 [desktop] › e2e/look.test.ts:219:2 › look walk › Scenario: Press Start 2P stays limited to logo and scores (0ms)
  ✓  827 [desktop] › e2e/look.test.ts:224:2 › look walk › Scenario: Decoration loads no external assets (0ms)
  ✓  828 [desktop] › e2e/look.test.ts:229:2 › look walk › Scenario: New copy has no exclamation marks (0ms)
  -  829 [desktop] › e2e/look.test.ts:234:2 › look walk › Scenario: No horizontal scroll on phone
  ✓  830 [desktop] › e2e/look.test.ts:239:2 › look walk › Scenario: Desktop uses the width (0ms)
  ✓  831 [desktop] › e2e/look.test.ts:353:2 › reduced motion › Scenario: Reduced motion makes transitions instant (200ms)
  ✓  832 [desktop] › e2e/look.test.ts:365:1 › Scenario: Motion never blocks input (252ms)

  42 skipped
  790 passed (5.4m)
exit 0
```

## Layer 2: spec coverage (206 scenarios: 76 unit, 122 e2e, 8 manual, 0 gaps)

Prefix collisions between scenario titles: none. Names matched by containing "Scenario: <title>"; parametrized or nested tests (e.g. "(motion)"/"(reduced)" suffix, describe > sub-test) count when the title appears in the name.
e2e single-project by design (test.skip on the other project): Drag a seat to a new place (desktop), Full Clocktower game (phone), Sheet fits one desktop viewport (desktop), Sheet on phone is two pages (phone), Header wraps on a phone (phone), No horizontal scroll on phone (phone).

| Scenario | proof | Evidence |
|---|---|---|
| Tiles for registered games | e2e | `e2e/home.test.ts` › "Scenario: Tiles for registered games" ✓ (phone+desktop) |
| Player range derived from engine limits | unit | `src/lib/games/registry.test.ts` › "Scenario: Player range derived from engine limits" ✓ |
| Registry lists Blood on the Clocktower last | unit | `src/lib/games/registry.test.ts` › "Scenario: Registry lists Blood on the Clocktower last" ✓ |
| Start banner carries title, badge and player range | e2e | `e2e/start.test.ts` › "Scenario: Start banner carries title, badge and player range" ✓ (phone+desktop) |
| Start panel first on phone, right column on desktop | e2e | `e2e/start.test.ts` › "Scenario: Start panel first on phone, right column on desktop" ✓ (phone+desktop) |
| Same start layout for both games | e2e ("Scenario: Start panel first on phone, right column on … | `e2e/start.test.ts` › "Scenario: Start panel first on phone, right column on desktop" ✓ (phone+desktop) |
| Mehr-zu cards keep their targets | e2e | `e2e/start.test.ts` › "Scenario: Mehr-zu cards keep their targets" ✓ (phone+desktop) |
| Old Erklärung link is not found | e2e | `e2e/start.test.ts` › "Scenario: Old Erklärung link is not found" ✓ (phone+desktop) |
| Inhalte card shows the real content count | e2e | `e2e/start.test.ts` › "Scenario: Inhalte card shows the real content count" ✓ (phone+desktop) |
| Los geht's opens the lobby | e2e | `e2e/start.test.ts` › "Scenario: Los geht's opens the lobby" ✓ (phone+desktop) |
| So geht's covers both Wavelength modes | e2e | `e2e/start.test.ts` › "Scenario: So geht's covers both Wavelength modes" ✓ (phone+desktop) |
| Count defaults to the roster size, clamped | e2e | `e2e/clocktower-start.test.ts` › "Scenario: Count defaults to the roster size, clamped" ✓ (phone+desktop) |
| Count stays within 5 to 15 | e2e | `e2e/clocktower-start.test.ts` › "Scenario: Count stays within 5 to 15" ✓ (phone+desktop) |
| Chosen count persists | e2e | `e2e/clocktower-start.test.ts` › "Scenario: Chosen count persists" ✓ (phone+desktop) |
| Roster changes keep the chosen count | e2e | `e2e/clocktower-start.test.ts` › "Scenario: Roster changes keep the chosen count" ✓ (phone+desktop) |
| Invalid stored count falls back to the default | unit | `src/lib/count.test.ts` › "Scenario: Invalid stored count falls back to the default" ✓ |
| Clocktower banner, rules and pitch | e2e | `e2e/clocktower-start.test.ts` › "Scenario: Clocktower banner, rules and pitch" ✓ (phone+desktop) |
| Erklärung card instead of Demo and Inhalte | e2e | `e2e/clocktower-start.test.ts` › "Scenario: Erklärung card instead of Demo and Inhalte" ✓ (phone+desktop) |
| Clocktower demo and Inhalte are not found | e2e | `e2e/clocktower-start.test.ts` › "Scenario: Clocktower demo and Inhalte are not found" ✓ (phone+desktop) |
| Twenty-two characters by team | unit | `src/lib/games/clocktower/characters.test.ts` › "Scenario: Twenty-two characters by team" ✓ |
| Setup table for every count | unit | `src/lib/games/clocktower/setup.test.ts` › "Scenario: Setup table for every count" ✓ |
| Swap two seats by tapping | e2e | `e2e/clocktower-setup.test.ts` › "Scenario: Swap two seats by tapping" ✓ (phone+desktop) |
| Drag a seat to a new place | e2e | `e2e/clocktower-setup.test.ts` › "Scenario: Drag a seat to a new place" ✓ (desktop) |
| Swap seats by keyboard | e2e | `e2e/clocktower-setup.test.ts` › "Scenario: Swap seats by keyboard" ✓ (phone+desktop) |
| Five and fifteen seats fit the setup board | e2e | `e2e/clocktower-setup.test.ts` › "Scenario: Five and fifteen seats fit the setup board" ✓ (phone+desktop) |
| Seat order carries into the game | unit | `src/lib/games/clocktower/engine.test.ts` › "Scenario: Seat order carries into the game" ✓ |
| Counters follow the setup table | e2e | `e2e/clocktower-setup.test.ts` › "Scenario: Counters follow the setup table" ✓ (phone+desktop) |
| Baron changes the requirement live | e2e | `e2e/clocktower-setup.test.ts` › "Scenario: Baron changes the requirement live" ✓ (phone+desktop) |
| Over-assigned team shown as an error | e2e | `e2e/clocktower-setup.test.ts` › "Scenario: Over-assigned team shown as an error" ✓ (phone+desktop) |
| Each character at most once | unit | `src/lib/games/clocktower/engine.test.ts` › "Scenario: Each character at most once" ✓ |
| Assign by seat or by character first | e2e | `e2e/clocktower-setup.test.ts` › "Scenario: Assign by seat or by character first" ✓ (phone+desktop) |
| Random fill keeps manual choices | unit | `src/lib/games/clocktower/engine.test.ts` › "Scenario: Random fill keeps manual choices" ✓ |
| Random fill with a manual Baron | unit | `src/lib/games/clocktower/engine.test.ts` › "Scenario: Random fill with a manual Baron" ✓ |
| Alles neu rerolls every seat | unit | `src/lib/games/clocktower/engine.test.ts` › "Scenario: Alles neu rerolls every seat" ✓ |
| Impossible manual choice is flagged | e2e | `e2e/clocktower-setup.test.ts` › "Scenario: Impossible manual choice is flagged" ✓ (phone+desktop) |
| Random distribution is seeded | unit | `src/lib/games/clocktower/engine.test.ts` › "Scenario: Random distribution is seeded" ✓ |
| Believed role is a Townsfolk not in play | unit | `src/lib/games/clocktower/engine.test.ts` › "Scenario: Believed role is a Townsfolk not in play" ✓ |
| Red herring is a good player | unit | `src/lib/games/clocktower/engine.test.ts` › "Scenario: Red herring is a good player" ✓ |
| Drunk Fortune Teller gets a red herring | unit | `src/lib/games/clocktower/engine.test.ts` › "Scenario: Drunk Fortune Teller gets a red herring" ✓ |
| Reassigning clears stale picks | unit | `src/lib/games/clocktower/engine.test.ts` › "Scenario: Reassigning clears stale picks" ✓ |
| Drunk and red herring on the board | e2e | `e2e/clocktower-setup.test.ts` › "Scenario: Drunk and red herring on the board" ✓ (phone+desktop) |
| Weiter needs a complete valid distribution | e2e | `e2e/clocktower-setup.test.ts` › "Scenario: Weiter needs a complete valid distribution" ✓ (phone+desktop) |
| Confirm before the reveal | e2e | `e2e/clocktower-setup.test.ts` › "Scenario: Confirm before the reveal" ✓ (phone+desktop) |
| Locked distribution cannot change | unit | `src/lib/games/clocktower/engine.test.ts` › "Scenario: Locked distribution cannot change" ✓ |
| Setup board shows the character sheet | e2e | `e2e/clocktower-setup.test.ts` › "Scenario: Setup board shows the character sheet" ✓ (phone+desktop) |
| Reveal walks seat by seat | e2e | `e2e/clocktower-setup.test.ts` › "Scenario: Reveal walks seat by seat" ✓ (phone+desktop) |
| Drunk sees the believed Townsfolk | e2e | `e2e/clocktower-setup.test.ts` › "Scenario: Drunk sees the believed Townsfolk" ✓ (phone+desktop) |
| Card stays until hidden | e2e | `e2e/clocktower-setup.test.ts` › "Scenario: Card stays until hidden" ✓ (phone+desktop) |
| Hidden card leaves nothing readable | e2e | `e2e/clocktower-setup.test.ts` › "Scenario: Hidden card leaves nothing readable" ✓ (phone+desktop) |
| Reload mid-reveal resumes hidden | e2e | `e2e/clocktower-setup.test.ts` › "Scenario: Reload mid-reveal resumes hidden" ✓ (phone+desktop) |
| Circle shows seats, alive and ghost votes | e2e | `e2e/clocktower-day.test.ts` › "Scenario: Circle shows seats, alive and ghost votes" ✓ (phone+desktop) |
| Circle geometry for five to fifteen seats | unit | `src/lib/games/clocktower/circle.test.ts` › "Scenario: Circle geometry for five to fifteen seats" ✓ |
| Circle legible on phone and desktop | e2e | `e2e/clocktower-day.test.ts` › "Scenario: Circle legible on phone and desktop" ✓ (phone+desktop) |
| Header shows the night or day and the alive count | e2e | `e2e/clocktower-day.test.ts` › "Scenario: Header shows the night or day and the alive count" ✓ (phone+desktop) |
| Death on the circle is animated | e2e | `e2e/clocktower-day.test.ts` › "Scenario: Death on the circle is animated" ✓ (phone+desktop) |
| Every phase survives a reload | unit | `src/lib/games/clocktower/engine.test.ts` › "Scenario: Every phase survives a reload" ✓ |
| Stale Clocktower session discarded | e2e | `e2e/clocktower-session.test.ts` › "Scenario: Stale Clocktower session discarded" ✓ (phone+desktop) |
| Spiel beenden clears the Clocktower session | e2e | `e2e/clocktower-session.test.ts` › "Scenario: Spiel beenden clears the Clocktower session" ✓ (phone+desktop) |
| Night starts with Alle schlafen ein | e2e | `e2e/clocktower-night.test.ts` › "Scenario: Night starts with Alle schlafen ein" ✓ (phone+desktop) |
| Night order for 5, 7 and 15 players | unit | `src/lib/games/clocktower/night.test.ts` › "Scenario: Night order for 5, 7 and 15 players" ✓ |
| Small games have no evil info | unit | `src/lib/games/clocktower/night.test.ts` › "Scenario: Small games have no evil info" ✓ |
| Conditional wakes on other nights | unit | `src/lib/games/clocktower/night.test.ts` › "Scenario: Conditional wakes on other nights" ✓ |
| Drunk wakes at the believed slot | unit | `src/lib/games/clocktower/night.test.ts` › "Scenario: Drunk wakes at the believed slot" ✓ |
| New Imp wakes as Imp | unit | `src/lib/games/clocktower/night.test.ts` › "Scenario: New Imp wakes as Imp" ✓ |
| Each waking step is four screens | e2e | `e2e/clocktower-night.test.ts` › "Scenario: Each waking step is four screens" ✓ (phone+desktop) |
| Group steps name every seat | e2e | `e2e/clocktower-night.test.ts` › "Scenario: Group steps name every seat" ✓ (phone+desktop) |
| Skip and back keep state | unit | `src/lib/games/clocktower/engine.test.ts` › "Scenario: Skip and back keep state" ✓ |
| Pair info for the first-night Townsfolk | unit | `src/lib/games/clocktower/info.test.ts` › "Scenario: Pair info for the first-night Townsfolk" ✓ |
| Chef counts evil pairs around the circle | unit | `src/lib/games/clocktower/info.test.ts` › "Scenario: Chef counts evil pairs around the circle" ✓ |
| Empath skips dead neighbours | unit | `src/lib/games/clocktower/info.test.ts` › "Scenario: Empath skips dead neighbours" ✓ |
| Fortune Teller and Undertaker info | unit | `src/lib/games/clocktower/info.test.ts` › "Scenario: Fortune Teller and Undertaker info" ✓ |
| Roles without info | unit | `src/lib/games/clocktower/info.test.ts` › "Scenario: Roles without info" ✓ |
| Suggestion labelled with its caveat | e2e | `e2e/clocktower-night.test.ts` › "Scenario: Suggestion labelled with its caveat" ✓ (phone+desktop) |
| Show-bar opens full-screen cards | e2e | `e2e/clocktower-night.test.ts` › "Scenario: Show-bar opens full-screen cards" ✓ (phone+desktop) |
| Role preselects its cards | e2e | `e2e/clocktower-night.test.ts` › "Scenario: Role preselects its cards" ✓ (phone+desktop) |
| Bluffs are good characters not in play | unit | `src/lib/games/clocktower/setup.test.ts` › "Scenario: Bluffs are good characters not in play" ✓ |
| Bluffs can be rerolled before showing | e2e | `e2e/clocktower-night.test.ts` › "Scenario: Bluffs can be rerolled before showing" ✓ (phone+desktop) |
| Grimoire visible only while held | e2e | `e2e/clocktower-night.test.ts` › "Scenario: Grimoire visible only while held" ✓ (phone+desktop) |
| Release outside the button hides the grimoire | e2e | `e2e/clocktower-night.test.ts` › "Scenario: Release outside the button hides the grimoire" ✓ (phone+desktop) |
| Grimoire by keyboard | e2e | `e2e/clocktower-night.test.ts` › "Scenario: Grimoire by keyboard" ✓ (phone+desktop) |
| No grimoire by day | e2e | `e2e/clocktower-night.test.ts` › "Scenario: No grimoire by day" ✓ (phone+desktop) |
| Noted target prefills the death step | e2e | `e2e/clocktower-night.test.ts` › "Scenario: Noted target prefills the death step" ✓ (phone+desktop) |
| Starpass makes a living Minion the Imp | unit | `src/lib/games/clocktower/engine.test.ts` › "Scenario: Starpass makes a living Minion the Imp" ✓ |
| Scarlet Woman forced on a starpass | unit | `src/lib/games/clocktower/engine.test.ts` › "Scenario: Scarlet Woman forced on a starpass" ✓ |
| Starpass without a living Minion | unit | `src/lib/games/clocktower/engine.test.ts` › "Scenario: Starpass without a living Minion" ✓ |
| Imp wählt sich selbst wakes the new Imp | e2e | `e2e/clocktower-night.test.ts` › "Scenario: Imp wählt sich selbst wakes the new Imp" ✓ (phone+desktop) |
| Death step records the night's deaths | unit | `src/lib/games/clocktower/engine.test.ts` › "Scenario: Death step records the night's deaths" ✓ |
| Dead seats cannot be selected | e2e | `e2e/clocktower-night.test.ts` › "Scenario: Dead seats cannot be selected" ✓ (phone+desktop) |
| Win check after the death step | unit | `src/lib/games/clocktower/engine.test.ts` › "Scenario: Win check after the death step" ✓ |
| Dawn shows the night's deaths | e2e | `e2e/clocktower-day.test.ts` › "Scenario: Dawn shows the night's deaths" ✓ (phone+desktop) |
| Day timer dialog | e2e | `e2e/clocktower-day.test.ts` › "Scenario: Day timer dialog" ✓ (phone+desktop) |
| Reload keeps the remaining time | e2e | `e2e/clocktower-day.test.ts` › "Scenario: Reload keeps the remaining time" ✓ (phone+desktop) |
| Timer reads Zeit um at zero and never blocks | e2e | `e2e/clocktower-day.test.ts` › "Scenario: Timer reads Zeit um at zero and never blocks" ✓ (phone+desktop) |
| Timer keeps running during a vote | e2e | `e2e/clocktower-day.test.ts` › "Scenario: Timer keeps running during a vote" ✓ (phone+desktop) |
| Remaining time from the deadline | unit | `src/lib/games/clocktower/timer.test.ts` › "Scenario: Remaining time from the deadline" ✓ |
| Nomination rules enforced | unit | `src/lib/games/clocktower/engine.test.ts` › "Scenario: Nomination rules enforced" ✓ |
| Unavailable choices show a reason | e2e | `e2e/clocktower-day.test.ts` › "Scenario: Unavailable choices show a reason" ✓ (phone+desktop) |
| Zurück cancels the nomination unused | e2e | `e2e/clocktower-day.test.ts` › "Scenario: Zurück cancels the nomination unused" ✓ (phone+desktop) |
| Clock points at the nominee | e2e | `e2e/clocktower-day.test.ts` › "Scenario: Clock points at the nominee" ✓ (phone+desktop) |
| Sweep order ends at the nominee | unit | `src/lib/games/clocktower/vote.test.ts` › "Scenario: Sweep order ends at the nominee" ✓ |
| Sweep lasts 2.5 seconds per seat | unit | `src/lib/games/clocktower/vote.test.ts` › "Scenario: Sweep lasts 2.5 seconds per seat" ✓ |
| Real short sweep marks votes | e2e | `e2e/clocktower-day.test.ts` › "Scenario: Real short sweep marks votes" ✓ (phone+desktop) |
| Dead without ghost vote cannot be marked | e2e | `e2e/clocktower-day.test.ts` › "Scenario: Dead without ghost vote cannot be marked" ✓ (phone+desktop) |
| Confirm corrects missed timing | e2e | `e2e/clocktower-day.test.ts` › "Scenario: Confirm corrects missed timing" ✓ (phone+desktop) |
| Dead voters spend their ghost vote | unit | `src/lib/games/clocktower/engine.test.ts` › "Scenario: Dead voters spend their ghost vote" ✓ |
| Reduced motion hand jumps | e2e | `e2e/clocktower-day.test.ts` › "Scenario: Reduced motion hand jumps" ✓ (phone+desktop) |
| Vote result by threshold and high-water mark | unit | `src/lib/games/clocktower/engine.test.ts` › "Scenario: Vote result by threshold and high-water mark" ✓ |
| Threshold uses living players at vote time | unit | `src/lib/games/clocktower/engine.test.ts` › "Scenario: Threshold uses living players at vote time" ✓ |
| Block holder marked on the circle | e2e | `e2e/clocktower-day.test.ts` › "Scenario: Block holder marked on the circle" ✓ (phone+desktop) |
| Seat actions name no character | e2e | `e2e/clocktower-day.test.ts` › "Scenario: Seat actions name no character" ✓ (phone+desktop) |
| Immediate execution ends the day | unit | `src/lib/games/clocktower/engine.test.ts` › "Scenario: Immediate execution ends the day" ✓ |
| Death by day runs the win check | unit | `src/lib/games/clocktower/engine.test.ts` › "Scenario: Death by day runs the win check" ✓ |
| Corrections by day | unit | `src/lib/games/clocktower/engine.test.ts` › "Scenario: Corrections by day" ✓ |
| Tag beenden executes the block holder | e2e | `src/lib/games/clocktower/engine.test.ts` › "Scenario: Tag beenden executes the block holder" ✓ (phone+desktop) |
| No execution after a tie or without nominations | e2e | `e2e/clocktower-day.test.ts` › "Scenario: No execution after a tie or without nominations" ✓ (phone+desktop) |
| Executing a dead player counts as the execution | unit | `src/lib/games/clocktower/engine.test.ts` › "Scenario: Executing a dead player counts as the execution" ✓ |
| Good wins when the Demon dies | unit | `src/lib/games/clocktower/win.test.ts` › "Scenario: Good wins when the Demon dies" ✓ |
| Evil wins at two alive | unit | `src/lib/games/clocktower/win.test.ts` › "Scenario: Evil wins at two alive" ✓ |
| Both at once good wins | unit | `src/lib/games/clocktower/win.test.ts` › "Scenario: Both at once good wins" ✓ |
| Recluse never counts as the Demon | unit | `src/lib/games/clocktower/win.test.ts` › "Scenario: Recluse never counts as the Demon" ✓ |
| New Demon checked after a starpass | unit | `src/lib/games/clocktower/win.test.ts` › "Scenario: New Demon checked after a starpass" ✓ |
| Scarlet Woman question at the next dusk | unit | `src/lib/games/clocktower/win.test.ts` › "Scenario: Scarlet Woman question at the next dusk" ✓ |
| Scarlet Woman needs five alive before the death | unit | `src/lib/games/clocktower/win.test.ts` › "Scenario: Scarlet Woman needs five alive before the death" ✓ |
| Saint executed asks at dusk | unit | `src/lib/games/clocktower/win.test.ts` › "Scenario: Saint executed asks at dusk" ✓ |
| Mayor question at dusk | unit | `src/lib/games/clocktower/win.test.ts` › "Scenario: Mayor question at dusk" ✓ |
| Drunk Mayor or Saint never asks | unit | `src/lib/games/clocktower/win.test.ts` › "Scenario: Drunk Mayor or Saint never asks" ✓ |
| Public screen gives nothing away | e2e | `e2e/clocktower-game.test.ts` › "Scenario: Public screen gives nothing away" ✓ (phone+desktop) |
| Storyteller declares the winner at night | e2e | `e2e/clocktower-night.test.ts` › "Scenario: Storyteller declares the winner at night" ✓ (phone+desktop) |
| Teaser names no team | e2e | `e2e/clocktower-end.test.ts` › "Scenario: Teaser names no team" ✓ (phone+desktop) |
| Reveal shows the winning team and every seat | e2e | `e2e/clocktower-end.test.ts` › "Scenario: Reveal shows the winning team and every seat" ✓ (phone+desktop) |
| Reload on the teaser keeps it hidden | e2e | `e2e/clocktower-end.test.ts` › "Scenario: Reload on the teaser keeps it hidden" ✓ (phone+desktop) |
| Session cleared only on leaving | e2e | `e2e/clocktower-end.test.ts` › "Scenario: Session cleared only on leaving" ✓ (phone+desktop) |
| Winner for every ending | unit | `src/lib/games/clocktower/win.test.ts` › "Scenario: Winner for every ending" ✓ |
| Full Clocktower game | e2e | `e2e/clocktower-game.test.ts` › "Scenario: Full Clocktower game" ✓ (phone) |
| Deck navigation by tap, swipe and keys | e2e | `e2e/clocktower-deck.test.ts` › "Scenario: Deck navigation by tap, swipe and keys" ✓ (phone+desktop) |
| Deck readable without horizontal scroll | e2e | `e2e/clocktower-deck.test.ts` › "Scenario: Deck readable without horizontal scroll" ✓ (phone+desktop) |
| Deck closes to the start screen | e2e | `e2e/clocktower-deck.test.ts` › "Scenario: Deck closes to the start screen" ✓ (phone+desktop) |
| Slide change animated, crossfade under reduced motion | e2e | `e2e/clocktower-deck.test.ts` › "Scenario: Slide change animated, crossfade under reduced motion" ✓ (phone+desktop) |
| Deck carries the presentation's content | manual (content comparison by Rue at Gate 2) | Gate 2 checklist (below) |
| Role-count slide for every count | unit | `src/lib/games/clocktower/deck.test.ts` › "Scenario: Role-count slide for every count" ✓ |
| Voting slide uses half the players | unit | `src/lib/games/clocktower/deck.test.ts` › "Scenario: Voting slide uses half the players" ✓ |
| Official win wording in the deck | unit | `src/lib/games/clocktower/deck.test.ts` › "Scenario: Official win wording in the deck" ✓ |
| Deck follows the chosen count | e2e | `e2e/clocktower-deck.test.ts` › "Scenario: Deck follows the chosen count" ✓ (phone+desktop) |
| Deck explains the app | e2e | `e2e/clocktower-deck.test.ts` › "Scenario: Deck explains the app" ✓ (phone+desktop) |
| App slides read clearly | manual (wording judgement by Rue at Gate 2) | Gate 2 checklist (below) |
| Sheet lists all characters | unit | `src/lib/games/clocktower/sheet.test.ts` › "Scenario: Sheet lists all characters" ✓ |
| Sheet fits one desktop viewport | e2e | `e2e/clocktower-deck.test.ts` › "Scenario: Sheet fits one desktop viewport" ✓ (desktop) |
| Sheet on phone is two pages | e2e | `e2e/clocktower-deck.test.ts` › "Scenario: Sheet on phone is two pages" ✓ (phone) |
| Credits slide names the sources | e2e | `e2e/clocktower-deck.test.ts` › "Scenario: Credits slide names the sources" ✓ (phone+desktop) |
| Sheet in the look of the PDF | manual (visual judgement at Gate 2) | Gate 2 checklist (below) |
| Only the expected control is enabled | e2e | `e2e/demo.test.ts` › "Scenario: Only the expected control is enabled" ✓ (phone+desktop) |
| Hidden information shown with Demo tag | e2e | `e2e/demo.test.ts` › "Scenario: Hidden information shown with Demo tag" ✓ (phone+desktop) |
| Demo leaves real data untouched | e2e | `e2e/demo.test.ts` › "Scenario: Demo leaves real data untouched" ✓ (phone+desktop) |
| Exiting returns to the starting screen | e2e | `e2e/demo.test.ts` › "Scenario: Exiting returns to the starting screen" ✓ (phone+desktop) |
| Reload during demo returns to start screen | e2e | `e2e/demo.test.ts` › "Scenario: Reload during demo returns to start screen" ✓ (phone+desktop) |
| Demo steppable with reduced motion | e2e | `e2e/demo.test.ts` › "Scenario: Demo steppable with reduced motion" ✓ (phone+desktop) |
| Every demo covers its outcome branches over several rounds | unit ("Scenario: Imposter demo covers every outcome branch",… | `src/lib/games/imposter/demo.test.ts` › "Scenario: Imposter demo covers every outcome branch" ✓; `src/lib/games/wavelength/demo.test.ts` › "Scenario: Wavelength demo covers every outcome branch" ✓; `src/lib/games/feud/demo.test.ts` › "Scenario: Feud demo covers every outcome branch" ✓; `src/lib/games/codes/demo.test.ts` › "Scenario: Codes demo covers every outcome branch" ✓; `src/lib/games/duck/demo.test.ts` › "Scenario: Duck demo covers every outcome branch" ✓; `src/lib/games/most-likely/demo.test.ts` › "Scenario: Most Likely demo covers every outcome branch" ✓ |
| Demo tips read neutral | unit ("Scenario: Imposter demo covers every outcome branch",… | `src/lib/games/imposter/demo.test.ts` › "Scenario: Imposter demo covers every outcome branch" ✓; `src/lib/games/wavelength/demo.test.ts` › "Scenario: Wavelength demo tips read neutral" ✓; `src/lib/games/feud/demo.test.ts` › "Scenario: Feud demo covers every outcome branch" ✓; `src/lib/games/codes/demo.test.ts` › "Scenario: Codes demo covers every outcome branch" ✓; `src/lib/games/duck/demo.test.ts` › "Scenario: Duck demo covers every outcome branch" ✓; `src/lib/games/most-likely/demo.test.ts` › "Scenario: Most Likely demo covers every outcome branch" ✓ |
| Demo tips say why the step happens | manual (wording judgement by Rue at Gate 2) | Gate 2 checklist (below) |
| Long demo progress reads correctly | e2e ("Scenario: Feud demo by tapping highlighted controls", … | `e2e/feud-demo.test.ts` › "Scenario: Feud demo by tapping highlighted controls" ✓ (phone+desktop); `e2e/most-likely.test.ts` › "Scenario: Most Likely demo by tapping highlighted controls" ✓ (phone+desktop); `e2e/duck.test.ts` › "Scenario: Duck demo by tapping highlighted controls" ✓ (phone+desktop) |
| Generic demo checks skip a game without a demo | unit | `src/lib/demo/runner.test.ts` › "Scenario: Generic demo checks skip a game without a demo" ✓ |
| Game without a demo has no demo route | e2e ("Scenario: Clocktower demo and Inhalte are not found") | `e2e/clocktower-start.test.ts` › "Scenario: Clocktower demo and Inhalte are not found" ✓ (phone+desktop) |
| Text contrast meets 4.5:1 | e2e | `e2e/look.test.ts` › "Scenario: Text contrast meets 4.5:1" ✓ (phone+desktop) |
| Look approved on screenshots | manual (visual judgement at Gate 2) | Gate 2 checklist (below) |
| Clocktower colour meets contrast | unit | `src/lib/ui/tokens.test.ts` › "Scenario: Clocktower colour meets contrast" ✓ |
| Other games keep the Arcade-Abend look | e2e | `e2e/clocktower-theme.test.ts` › "Scenario: Other games keep the Arcade-Abend look" ✓ (phone+desktop) |
| Clocktower tokens meet contrast in both variants | unit | `src/lib/ui/tokens.test.ts` › "Scenario: Clocktower tokens meet contrast in both variants" ✓ |
| Theme only on Clocktower routes | e2e | `e2e/clocktower-theme.test.ts` › "Scenario: Theme only on Clocktower routes" ✓ (phone+desktop) |
| No theme flash on reload | e2e | `e2e/clocktower-theme.test.ts` › "Scenario: No theme flash on reload" ✓ (phone+desktop) |
| Clocktower fonts are self-hosted | e2e | `e2e/clocktower-theme.test.ts` › "Scenario: Clocktower fonts are self-hosted" ✓ (phone+desktop) |
| Clocktower look rules on every screen | e2e ("Scenario: Text contrast meets 4.5:1", "Scenario: Touch… | `e2e/look.test.ts` › "Scenario: Text contrast meets 4.5:1" ✓ (phone+desktop); `e2e/look.test.ts` › "Scenario: Touch targets are at least 44px" ✓ (phone+desktop); `e2e/look.test.ts` › "Scenario: No horizontal scroll on phone" ✓ (phone); `e2e/look.test.ts` › "Scenario: Press Start 2P stays limited to logo and scores" ✓ (phone+desktop); `e2e/look.test.ts` › "Scenario: Decoration loads no external assets" ✓ (phone+desktop) |
| Day and night variants switch with an animation | e2e | `e2e/clocktower-game.test.ts` › "Scenario: Day and night variants switch with an animation" ✓ (phone+desktop) |
| Clocktower ambient motion off under reduced motion | e2e | `e2e/clocktower-theme.test.ts` › "Scenario: Clocktower ambient motion off under reduced motion" ✓ (phone+desktop) |
| Clocktower gets its own motif | unit | `src/lib/deco/motifs.test.ts` › "Scenario: Clocktower gets its own motif" ✓ |
| Clocktower tile and start art | e2e | `e2e/deco.test.ts` › "Scenario: Clocktower tile and start art" ✓ (phone+desktop) |
| Clocktower look approved on screenshots | manual (visual judgement at Gate 2, on the verifier's screenshots) | Gate 2 checklist (below) |
| Home to Clocktower runs a view transition | e2e | `e2e/clocktower-theme.test.ts` › "Scenario: Home to Clocktower runs a view transition" ✓ (phone+desktop) |
| Navigation without View Transitions | e2e | `e2e/clocktower-theme.test.ts` › "Scenario: Navigation without View Transitions" ✓ (phone+desktop) |
| Reduced motion skips the view transition | e2e | `e2e/clocktower-theme.test.ts` › "Scenario: Reduced motion skips the view transition" ✓ (phone+desktop) |
| Back button leaves Clocktower | e2e | `e2e/clocktower-theme.test.ts` › "Scenario: Back button leaves Clocktower" ✓ (phone+desktop) |
| Transitions feel smooth | manual (motion feel is a visual judgement, at Gate 2) | Gate 2 checklist (below) |
| Reload mid-game resumes the same phase | e2e | `e2e/imposter.test.ts` › "Scenario: Reload mid-game resumes the same phase" ✓ (phone+desktop) |
| Spiel beenden clears the session | e2e | `e2e/imposter.test.ts` › "Scenario: Spiel beenden clears the session" ✓ (phone+desktop) |
| Old or corrupt saved state discarded | e2e | `e2e/start.test.ts` › "Scenario: Old or corrupt saved state discarded" ✓ (phone+desktop) |
| Two tabs last write wins | unit | `src/lib/session.test.ts` › "Scenario: Two tabs last write wins" ✓ |
| Roster edit mid-game keeps the session snapshot | unit | `src/lib/session.test.ts` › "Scenario: Roster edit mid-game keeps the session snapshot" ✓ |
| Game without a demo checks its explicit template | unit | `src/lib/games/clocktower/engine.test.ts` › "Scenario: Game without a demo checks its explicit template" ✓ |
| Round status per game | unit | `src/lib/games/status.test.ts` › "Scenario: Round status per game" ✓ |
| Last round fills the progress line | unit ("Scenario: Round status per game") | `src/lib/games/status.test.ts` › "Scenario: Round status per game" ✓ |
| Duck progress follows the leading score | unit | `src/lib/games/status.test.ts` › "Scenario: Duck progress follows the leading score" ✓ |
| Status and progress in the header | e2e | `e2e/frame.test.ts` › "Scenario: Status and progress in the header" ✓ (phone+desktop) |
| Status without a total has no progress line | e2e | `e2e/frame.test.ts` › "Scenario: Status without a total has no progress line" ✓ (phone+desktop) |
| Header wraps on a phone | e2e | `e2e/frame.test.ts` › "Scenario: Header wraps on a phone" ✓ (phone) |
| Clocktower status per phase | unit | `src/lib/games/status.test.ts` › "Scenario: Clocktower status per phase" ✓ |
| Game without content starts without a content fetch | e2e | `e2e/clocktower-start.test.ts` › "Scenario: Game without content starts without a content fetch" ✓ (phone+desktop) |
| Games with content keep their content gate | e2e ("Scenario: Empty pool blocks start") | `e2e/start.test.ts` › "Scenario: Empty pool blocks start" ✓ (phone+desktop) |
| Below minimum disables start | e2e | `e2e/start.test.ts` › "Scenario: Below minimum disables start" ✓ (phone+desktop) |
| Above maximum asks who plays | e2e | `e2e/start.test.ts` › "Scenario: Above maximum asks who plays" ✓ (phone+desktop) |
| Fewer than N offers adding players | e2e | `e2e/clocktower-start.test.ts` › "Scenario: Fewer than N offers adding players" ✓ (phone+desktop) |
| More than N picks exactly N | e2e | `e2e/clocktower-start.test.ts` › "Scenario: More than N picks exactly N" ✓ (phone+desktop) |
| Exactly N goes to the start | e2e | `e2e/clocktower-start.test.ts` › "Scenario: Exactly N goes to the start" ✓ (phone+desktop) |
| Count changed while in the lobby | e2e | `e2e/clocktower-start.test.ts` › "Scenario: Count changed while in the lobby" ✓ (phone+desktop) |
| Roster above the Clocktower maximum | e2e | `e2e/clocktower-start.test.ts` › "Scenario: Roster above the Clocktower maximum" ✓ (phone+desktop) |
| Clocktower effects obey mute and first interaction | unit | `src/lib/sound.test.ts` › "Scenario: Clocktower effects obey mute and first interaction" ✓ |
| Clocktower effects without WebAudio | unit | `src/lib/sound.test.ts` › "Scenario: Clocktower effects without WebAudio" ✓ |
| Clocktower sounds at the right moments | manual (audio judgement on a real device at Gate 2) | Gate 2 checklist (below) |

## Manual checklist (Gate 2)

Start: `npm run dev` → http://localhost:5173

1. Deck content: open the Clocktower explanation deck and compare it with the presentation (Deck carries the presentation's content).
2. App slides: read the deck's app slides (grimoire, night, vote, end) for clear wording (App slides read clearly).
3. Sheet: open the character sheet slide and judge it against the PDF look (Sheet in the look of the PDF).
4. Demo tips: play the other games' demos and judge that each tip says why the step happens (Demo tips say why the step happens).
5. Look: click through start, lobby, setup, reveal, night, dawn, day, vote, end on phone and desktop width, or judge the screenshots below (Look approved on screenshots; Clocktower look approved on screenshots).
6. Motion: switch between phases and slides, judge that transitions feel smooth (Transitions feel smooth).
7. Sound: with sound on, play reveal, dusk, dawn, a vote and the end on a real device: chime on reveal, bell at dusk and dawn, soft tick in the sweep, gong on the teaser (Clocktower sounds at the right moments).

## Diffstat

`git diff --stat origin/main...flow/blood-on-the-clocktower`: 125 files changed, 14395 insertions(+), 68 deletions(-)

     e2e/clocktower-day.test.ts                         | 505 ++++++++++++
     e2e/clocktower-deck.test.ts                        | 317 ++++++++
     e2e/clocktower-end.test.ts                         | 134 ++++
     e2e/clocktower-game.test.ts                        | 196 +++++
     e2e/clocktower-night.test.ts                       | 408 ++++++++++
     e2e/clocktower-session.test.ts                     |  47 ++
     e2e/clocktower-session.ts                          |  26 +
     e2e/clocktower-setup.test.ts                       | 423 ++++++++++
     e2e/clocktower-start.test.ts                       | 299 +++++++
     e2e/clocktower-theme.test.ts                       | 279 +++++++
     e2e/deco.test.ts                                   |  40 +
     e2e/home.test.ts                                   |   3 +-
     e2e/look.test.ts                                   |   2 +
     e2e/start.test.ts                                  |   3 +-
     e2e/walks/clocktower-day.ts                        | 134 ++++
     e2e/walks/clocktower-deck.ts                       |  27 +
     e2e/walks/clocktower-end.ts                        |  59 ++
     e2e/walks/clocktower-night.ts                      | 108 +++
     e2e/walks/clocktower-setup.ts                      |  64 ++
     e2e/walks/clocktower.ts                            |  44 ++
     .../changes/blood-on-the-clocktower/.openspec.yaml |   2 +
     openspec/changes/blood-on-the-clocktower/design.md | 325 ++++++++
     openspec/changes/blood-on-the-clocktower/flow.yaml |  22 +
     .../changes/blood-on-the-clocktower/proposal.md    |  97 +++
     .../research/design-sources.md                     | 135 ++++
     .../blood-on-the-clocktower/research/mobbin.md     | 152 ++++
     .../blood-on-the-clocktower/research/rules.md      | 379 +++++++++
     openspec/changes/blood-on-the-clocktower/scope.md  | 180 +++++
     .../specs/catalogue/spec.md                        | 135 ++++
     .../specs/clocktower/spec.md                       | 867 +++++++++++++++++++++
     .../blood-on-the-clocktower/specs/demo/spec.md     |  76 ++
     .../specs/design-system/spec.md                    | 135 ++++
     .../specs/game-engine/spec.md                      | 105 +++
     .../blood-on-the-clocktower/specs/roster/spec.md   |  44 ++
     .../blood-on-the-clocktower/specs/sound/spec.md    |  22 +
     openspec/changes/blood-on-the-clocktower/tasks.md  | 167 ++++
     .../blood-on-the-clocktower/verification.md        | 302 +++++++
     src/app.css                                        | 152 ++++
     src/app.html                                       |   5 +-
     src/hooks.server.ts                                |  20 +-
     src/lib/count.test.ts                              |  41 +
     src/lib/count.ts                                   |  17 +
     src/lib/deco/Art.svelte                            |   3 +
     src/lib/deco/Clocktower.svelte                     | 125 +++
     src/lib/deco/motifs.test.ts                        |  24 +
     src/lib/deco/motifs.ts                             |   6 +-
     src/lib/demo/runner.test.ts                        |  12 +-
     src/lib/engine/types.ts                            |   3 +-
     src/lib/games/clocktower/CharacterBoard.svelte     | 155 ++++
     src/lib/games/clocktower/CharacterIcon.svelte      |  36 +
     src/lib/games/clocktower/Circle.svelte             | 342 ++++++++
     src/lib/games/clocktower/Dawn.svelte               |  94 +++
     src/lib/games/clocktower/Day.svelte                | 147 ++++
     src/lib/games/clocktower/Deal.svelte               | 103 +++
     src/lib/games/clocktower/DeathStep.svelte          |  95 +++
     src/lib/games/clocktower/Deck.svelte               | 150 ++++
     src/lib/games/clocktower/End.svelte                | 187 +++++
     src/lib/games/clocktower/HoldGrimoire.svelte       |  42 +
     src/lib/games/clocktower/Night.svelte              |  59 ++
     src/lib/games/clocktower/Questions.svelte          |  66 ++
     src/lib/games/clocktower/RoleCard.svelte           |  74 ++
     src/lib/games/clocktower/Screen.svelte             |  25 +
     src/lib/games/clocktower/SeatActions.svelte        |  52 ++
     src/lib/games/clocktower/Setup.svelte              |  47 ++
     src/lib/games/clocktower/SetupBoard.svelte         | 187 +++++
     src/lib/games/clocktower/Sheet.svelte              | 307 ++++++++
     src/lib/games/clocktower/ShowBar.svelte            | 181 +++++
     src/lib/games/clocktower/ShowCard.svelte           | 151 ++++
     src/lib/games/clocktower/Slide.svelte              | 585 ++++++++++++++
     src/lib/games/clocktower/Timer.svelte              |  30 +
     src/lib/games/clocktower/VoteClock.svelte          | 136 ++++
     src/lib/games/clocktower/Wake.svelte               | 257 ++++++
     src/lib/games/clocktower/characters.test.ts        |  68 ++
     src/lib/games/clocktower/characters.ts             | 279 +++++++
     src/lib/games/clocktower/circle.test.ts            |  46 ++
     src/lib/games/clocktower/circle.ts                 |  36 +
     src/lib/games/clocktower/deck.test.ts              | 100 +++
     src/lib/games/clocktower/deck.ts                   | 510 ++++++++++++
     src/lib/games/clocktower/engine.test.ts            | 690 ++++++++++++++++
     src/lib/games/clocktower/engine.ts                 | 399 ++++++++++
     src/lib/games/clocktower/fixtures.ts               |  74 ++
     src/lib/games/clocktower/index.ts                  |  37 +
     src/lib/games/clocktower/info.test.ts              |  95 +++
     src/lib/games/clocktower/info.ts                   |  52 ++
     src/lib/games/clocktower/label.ts                  |  10 +
     src/lib/games/clocktower/night.test.ts             | 122 +++
     src/lib/games/clocktower/night.ts                  |  53 ++
     src/lib/games/clocktower/setup.test.ts             | 201 +++++
     src/lib/games/clocktower/setup.ts                  | 141 ++++
     src/lib/games/clocktower/sheet.test.ts             |  63 ++
     src/lib/games/clocktower/timer.test.ts             |  24 +
     src/lib/games/clocktower/timer.ts                  |   8 +
     src/lib/games/clocktower/types.ts                  | 105 +++
     src/lib/games/clocktower/vote.test.ts              |  47 ++
     src/lib/games/clocktower/vote.ts                   |  27 +
     src/lib/games/clocktower/win.test.ts               | 205 +++++
     src/lib/games/clocktower/win.ts                    |  45 ++
     src/lib/games/registry.test.ts                     |  46 +-
     src/lib/games/registry.ts                          |  21 +-
     src/lib/games/status.test.ts                       |  28 +
     src/lib/sound.test.ts                              |  37 +-
     src/lib/sound.ts                                   |  18 +-
     src/lib/theme.ts                                   |  24 +
     src/lib/ui/GameTile.svelte                         |   4 +
     src/lib/ui/tokens.test.ts                          |  58 +-
     src/lib/ui/tokens.ts                               | 126 ++-
     src/routes/+layout.svelte                          |  17 +
     src/routes/spiele/[slug]/+page.server.ts           |   3 +-
     src/routes/spiele/[slug]/+page.svelte              | 146 +++-
     src/routes/spiele/[slug]/demo/+page.server.ts      |  10 +
     src/routes/spiele/[slug]/demo/+page.svelte         |   8 +-
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
     125 files changed, 14395 insertions(+), 68 deletions(-)

## Screenshots (not in the repo; from this run's test-results/shots, copied to the scratchpad)

- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/phone-look-start-clocktower.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/phone-look-lobby-clocktower.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/phone-look-clocktower-setup-7-empty.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/phone-look-clocktower-setup-7-complete.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/phone-look-clocktower-reveal-7-name.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/phone-look-clocktower-reveal-7-card.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/phone-look-clocktower-wake-pair.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/phone-look-clocktower-card-pair.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/phone-look-clocktower-circle-pair.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/phone-look-clocktower-deaths.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/phone-look-clocktower-dawn-deaths-7.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/phone-look-clocktower-grimoire-7.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/phone-look-clocktower-clock-7.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/phone-look-clocktower-execution-7.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/phone-look-clocktower-end-teaser-evil.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/phone-look-clocktower-end-reveal-evil.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/phone-look-clocktower-deck-title.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/phone-look-clocktower-deck-sheet.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/phone-look-clocktower-deck-app-vote.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/desktop-look-start-clocktower.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/desktop-look-lobby-clocktower.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/desktop-look-clocktower-setup-7-empty.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/desktop-look-clocktower-setup-7-complete.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/desktop-look-clocktower-reveal-7-name.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/desktop-look-clocktower-reveal-7-card.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/desktop-look-clocktower-wake-pair.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/desktop-look-clocktower-card-pair.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/desktop-look-clocktower-circle-pair.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/desktop-look-clocktower-deaths.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/desktop-look-clocktower-dawn-deaths-7.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/desktop-look-clocktower-grimoire-7.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/desktop-look-clocktower-clock-7.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/desktop-look-clocktower-execution-7.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/desktop-look-clocktower-end-teaser-evil.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/desktop-look-clocktower-end-reveal-evil.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/desktop-look-clocktower-deck-title.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/desktop-look-clocktower-deck-sheet.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/desktop-look-clocktower-deck-app-vote.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/phone-look-clocktower-deck-sheet-boese.png
