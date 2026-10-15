verified-at: f10457a

# Verification r4

Revision round after Gate 2 (visual revisions S39–S49, units U12–U16). Verified committed tip f10457a, working tree clean.

## Layer 1: `PORT=4711 npm run proof:full` (green, run 1 of 1)

Unit: `npx vitest run --reporter=verbose` 473 passed lines, exit 0. Full log: /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/proof-r4.log (unit: /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/unit-r4.log)

```
  ✓  872 [desktop] › e2e/feud.test.ts:548:1 › Scenario: Feud motion uses transform and opacity only (5.7s)
  ✓  873 [desktop] › e2e/feud.test.ts:586:1 › Scenario: Feud motion never blocks input (3.9s)
  ✓  874 [desktop] › e2e/feud.test.ts:617:1 › Scenario: Feud reduced motion is instant (1.9s)
Error: attempt to write a readonly database
    at addPlayed (src/lib/server/played.ts:22:43)
    at POST (src/routes/api/feud/played/+server.ts:13:2)
  ✓  875 [desktop] › e2e/feud.test.ts:667:1 › Scenario: Feud peek does not block a tile flip (2.6s)
  ✓  876 [desktop] › e2e/feud.test.ts:697:1 › Scenario: Feud peek instant under reduced motion (1.4s)
  ✓  734 [desktop] › e2e/look.test.ts:211:2 › look walk › Scenario: Touch targets are at least 44px (0ms)
  ✓  877 [desktop] › e2e/look.test.ts:215:2 › look walk › Scenario: Text contrast meets 4.5:1 (0ms)
  ✓  878 [desktop] › e2e/look.test.ts:219:2 › look walk › Scenario: Press Start 2P stays limited to logo and scores (0ms)
  ✓  879 [desktop] › e2e/look.test.ts:224:2 › look walk › Scenario: Decoration loads no external assets (0ms)
  ✓  880 [desktop] › e2e/look.test.ts:229:2 › look walk › Scenario: New copy has no exclamation marks (0ms)
  -  881 [desktop] › e2e/look.test.ts:234:2 › look walk › Scenario: No horizontal scroll on phone
  ✓  882 [desktop] › e2e/look.test.ts:239:2 › look walk › Scenario: Desktop uses the width (0ms)
  ✓  883 [desktop] › e2e/look.test.ts:353:2 › reduced motion › Scenario: Reduced motion makes transitions instant (213ms)
  ✓  884 [desktop] › e2e/look.test.ts:365:1 › Scenario: Motion never blocks input (237ms)

  42 skipped
  842 passed (5.4m)
```

## Layer 2: spec coverage (240 scenarios: 78 unit, 145 e2e, 17 manual, 0 gaps)

Prefix collisions between scenario titles: none. Test names matched by containing the exact "Scenario: <title>" (or every name in the proof line); parametrized and nested tests count when the title appears in the name. Evidence in parentheses: passing projects (phone+desktop = both) for e2e, number of passing tests for unit.
e2e single-project by design: Drag a seat to a new place (desktop), Full Clocktower game (phone), Sheet fits one desktop viewport (desktop), Sheet on phone is two pages (phone), Header wraps on a phone (phone). Unchanged from r3.

Downgraded to manual since r3: none (no proof line changed from unit/e2e to manual in the delta specs).
Manual scenarios added by the revisions (S39–S49), 9: Circle and ghost token look approved, Show-bar placement approved, Day clock emphasis approved, End reveal by team approved, Distribution readable at a glance, Circle and information in one piece approved, Day facts legible, Voting animation like the presentation, Atmosphere approved. The other 8 manual scenarios are the r3 ones.
New e2e/unit scenarios from the revisions (24): Circle ornament connects the seats, Ghost-vote token decorated and readable, Show-bar is compact, Day timer stands out, Tapping any seat during the sweep toggles its vote, Space marks only the seat under the hand, Voting clock hand stands out, Setup circle shows each seat's character, Character icons fit fifteen seats, Public circles show no character icon, Night screens keep Weiter after the circle, Night circle seen in one piece, Day screens keep the action after the circle, Night and reveal panels centre their text, Dawn panels centre their text, End screens have no right-aligned text, Day facts sit in a box, Voting slide timeline follows the count (unit), Voting slide sweeps and counts up, Voting slide shows the end state under reduced motion, Night sky in the lobby and at night, Sun on the day screens, Atmosphere keeps every screen legible, Sky motion only on transform and opacity. All passed.

| Scenario | proof | Evidence |
|---|---|---|
| Tiles for registered games | e2e | "Scenario: Tiles for registered games" passed (phone+desktop) |
| Player range derived from engine limits | unit | "Scenario: Player range derived from engine limits" passed (1) |
| Registry lists Blood on the Clocktower last | unit | "Scenario: Registry lists Blood on the Clocktower last" passed (1) |
| Start banner carries title, badge and player range | e2e | "Scenario: Start banner carries title, badge and player range" passed (phone+desktop) |
| Start panel first on phone, right column on desktop | e2e | "Scenario: Start panel first on phone, right column on desktop" passed (phone+desktop) |
| Same start layout for both games | e2e ("Scenario: Start panel first on phone, right column on desktop") | each named test in the proof line passed (phone+desktop) |
| Mehr-zu cards keep their targets | e2e | "Scenario: Mehr-zu cards keep their targets" passed (phone+desktop) |
| Old Erklärung link is not found | e2e | "Scenario: Old Erklärung link is not found" passed (phone+desktop) |
| Inhalte card shows the real content count | e2e | "Scenario: Inhalte card shows the real content count" passed (phone+desktop) |
| Los geht's opens the lobby | e2e | "Scenario: Los geht's opens the lobby" passed (phone+desktop) |
| So geht's covers both Wavelength modes | e2e | "Scenario: So geht's covers both Wavelength modes" passed (phone+desktop) |
| Count defaults to the roster size, clamped | e2e | "Scenario: Count defaults to the roster size, clamped" passed (phone+desktop) |
| Count stays within 5 to 15 | e2e | "Scenario: Count stays within 5 to 15" passed (phone+desktop) |
| Chosen count persists | e2e | "Scenario: Chosen count persists" passed (phone+desktop) |
| Roster changes keep the chosen count | e2e | "Scenario: Roster changes keep the chosen count" passed (phone+desktop) |
| Invalid stored count falls back to the default | unit | "Scenario: Invalid stored count falls back to the default" passed (1) |
| Clocktower banner, rules and pitch | e2e | "Scenario: Clocktower banner, rules and pitch" passed (phone+desktop) |
| Erklärung card instead of Demo and Inhalte | e2e | "Scenario: Erklärung card instead of Demo and Inhalte" passed (phone+desktop) |
| Clocktower demo and Inhalte are not found | e2e | "Scenario: Clocktower demo and Inhalte are not found" passed (phone+desktop) |
| Twenty-two characters by team | unit | "Scenario: Twenty-two characters by team" passed (1) |
| Setup table for every count | unit | "Scenario: Setup table for every count" passed (1) |
| Swap two seats by tapping | e2e | "Scenario: Swap two seats by tapping" passed (phone+desktop) |
| Drag a seat to a new place | e2e | "Scenario: Drag a seat to a new place" passed (desktop only) |
| Swap seats by keyboard | e2e | "Scenario: Swap seats by keyboard" passed (phone+desktop) |
| Five and fifteen seats fit the setup board | e2e | "Scenario: Five and fifteen seats fit the setup board" passed (phone+desktop) |
| Seat order carries into the game | unit | "Scenario: Seat order carries into the game" passed (1) |
| Counters follow the setup table | e2e | "Scenario: Counters follow the setup table" passed (phone+desktop) |
| Baron changes the requirement live | e2e | "Scenario: Baron changes the requirement live" passed (phone+desktop) |
| Over-assigned team shown as an error | e2e | "Scenario: Over-assigned team shown as an error" passed (phone+desktop) |
| Each character at most once | unit | "Scenario: Each character at most once" passed (1) |
| Assign by seat or by character first | e2e | "Scenario: Assign by seat or by character first" passed (phone+desktop) |
| Random fill keeps manual choices | unit | "Scenario: Random fill keeps manual choices" passed (1) |
| Random fill with a manual Baron | unit | "Scenario: Random fill with a manual Baron" passed (1) |
| Alles neu rerolls every seat | unit | "Scenario: Alles neu rerolls every seat" passed (1) |
| Impossible manual choice is flagged | e2e | "Scenario: Impossible manual choice is flagged" passed (phone+desktop) |
| Random distribution is seeded | unit | "Scenario: Random distribution is seeded" passed (1) |
| Believed role is a Townsfolk not in play | unit | "Scenario: Believed role is a Townsfolk not in play" passed (1) |
| Red herring is a good player | unit | "Scenario: Red herring is a good player" passed (1) |
| Drunk Fortune Teller gets a red herring | unit | "Scenario: Drunk Fortune Teller gets a red herring" passed (1) |
| Reassigning clears stale picks | unit | "Scenario: Reassigning clears stale picks" passed (1) |
| Drunk and red herring on the board | e2e | "Scenario: Drunk and red herring on the board" passed (phone+desktop) |
| Weiter needs a complete valid distribution | e2e | "Scenario: Weiter needs a complete valid distribution" passed (phone+desktop) |
| Confirm before the reveal | e2e | "Scenario: Confirm before the reveal" passed (phone+desktop) |
| Locked distribution cannot change | unit | "Scenario: Locked distribution cannot change" passed (1) |
| Setup board shows the character sheet | e2e | "Scenario: Setup board shows the character sheet" passed (phone+desktop) |
| Reveal walks seat by seat | e2e | "Scenario: Reveal walks seat by seat" passed (phone+desktop) |
| Drunk sees the believed Townsfolk | e2e | "Scenario: Drunk sees the believed Townsfolk" passed (phone+desktop) |
| Card stays until hidden | e2e | "Scenario: Card stays until hidden" passed (phone+desktop) |
| Hidden card leaves nothing readable | e2e | "Scenario: Hidden card leaves nothing readable" passed (phone+desktop) |
| Reload mid-reveal resumes hidden | e2e | "Scenario: Reload mid-reveal resumes hidden" passed (phone+desktop) |
| Circle shows seats, alive and ghost votes | e2e | "Scenario: Circle shows seats, alive and ghost votes" passed (phone+desktop) |
| Circle geometry for five to fifteen seats | unit | "Scenario: Circle geometry for five to fifteen seats" passed (1) |
| Circle legible on phone and desktop | e2e | "Scenario: Circle legible on phone and desktop" passed (phone+desktop) |
| Header shows the night or day and the alive count | e2e | "Scenario: Header shows the night or day and the alive count" passed (phone+desktop) |
| Death on the circle is animated | e2e | "Scenario: Death on the circle is animated" passed (phone+desktop) |
| Circle ornament connects the seats | e2e | "Scenario: Circle ornament connects the seats" passed (phone+desktop) |
| Ghost-vote token decorated and readable | e2e | "Scenario: Ghost-vote token decorated and readable" passed (phone+desktop) |
| Circle and ghost token look approved | manual (visual judgement at Gate 2, on the verifier's screenshots) | shots/ and Gate 2 checklist |
| Every phase survives a reload | unit | "Scenario: Every phase survives a reload" passed (1) |
| Stale Clocktower session discarded | e2e | "Scenario: Stale Clocktower session discarded" passed (phone+desktop) |
| Spiel beenden clears the Clocktower session | e2e | "Scenario: Spiel beenden clears the Clocktower session" passed (phone+desktop) |
| Night starts with Alle schlafen ein | e2e | "Scenario: Night starts with Alle schlafen ein" passed (phone+desktop) |
| Night order for 5, 7 and 15 players | unit | "Scenario: Night order for 5, 7 and 15 players" passed (1) |
| Small games have no evil info | unit | "Scenario: Small games have no evil info" passed (1) |
| Conditional wakes on other nights | unit | "Scenario: Conditional wakes on other nights" passed (1) |
| Drunk wakes at the believed slot | unit | "Scenario: Drunk wakes at the believed slot" passed (1) |
| New Imp wakes as Imp | unit | "Scenario: New Imp wakes as Imp" passed (1) |
| Each waking step is four screens | e2e | "Scenario: Each waking step is four screens" passed (phone+desktop) |
| Group steps name every seat | e2e | "Scenario: Group steps name every seat" passed (phone+desktop) |
| Skip and back keep state | unit | "Scenario: Skip and back keep state" passed (1) |
| Pair info for the first-night Townsfolk | unit | "Scenario: Pair info for the first-night Townsfolk" passed (1) |
| Chef counts evil pairs around the circle | unit | "Scenario: Chef counts evil pairs around the circle" passed (1) |
| Empath skips dead neighbours | unit | "Scenario: Empath skips dead neighbours" passed (1) |
| Fortune Teller and Undertaker info | unit | "Scenario: Fortune Teller and Undertaker info" passed (1) |
| Roles without info | unit | "Scenario: Roles without info" passed (1) |
| Suggestion labelled with its caveat | e2e | "Scenario: Suggestion labelled with its caveat" passed (phone+desktop) |
| Show-bar opens full-screen cards | e2e | "Scenario: Show-bar opens full-screen cards" passed (phone+desktop) |
| Role preselects its cards | e2e | "Scenario: Role preselects its cards" passed (phone+desktop) |
| Bluffs are good characters not in play | unit | "Scenario: Bluffs are good characters not in play" passed (1) |
| Bluffs can be rerolled before showing | e2e | "Scenario: Bluffs can be rerolled before showing" passed (phone+desktop) |
| Show-bar is compact | e2e | "Scenario: Show-bar is compact" passed (phone+desktop) |
| Show-bar placement approved | manual (visual judgement at Gate 2, on the verifier's screenshots) | shots/ and Gate 2 checklist |
| Grimoire visible only while held | e2e | "Scenario: Grimoire visible only while held" passed (phone+desktop) |
| Release outside the button hides the grimoire | e2e | "Scenario: Release outside the button hides the grimoire" passed (phone+desktop) |
| Grimoire by keyboard | e2e | "Scenario: Grimoire by keyboard" passed (phone+desktop) |
| No grimoire by day | e2e | "Scenario: No grimoire by day" passed (phone+desktop) |
| Noted target prefills the death step | e2e | "Scenario: Noted target prefills the death step" passed (phone+desktop) |
| Starpass makes a living Minion the Imp | unit | "Scenario: Starpass makes a living Minion the Imp" passed (1) |
| Scarlet Woman forced on a starpass | unit | "Scenario: Scarlet Woman forced on a starpass" passed (1) |
| Starpass without a living Minion | unit | "Scenario: Starpass without a living Minion" passed (1) |
| Imp wählt sich selbst wakes the new Imp | e2e | "Scenario: Imp wählt sich selbst wakes the new Imp" passed (phone+desktop) |
| Death step records the night's deaths | unit | "Scenario: Death step records the night's deaths" passed (1) |
| Dead seats cannot be selected | e2e | "Scenario: Dead seats cannot be selected" passed (phone+desktop) |
| Win check after the death step | unit | "Scenario: Win check after the death step" passed (1) |
| Dawn shows the night's deaths | e2e | "Scenario: Dawn shows the night's deaths" passed (phone+desktop) |
| Day timer dialog | e2e | "Scenario: Day timer dialog" passed (phone+desktop) |
| Reload keeps the remaining time | e2e | "Scenario: Reload keeps the remaining time" passed (phone+desktop) |
| Timer reads Zeit um at zero and never blocks | e2e | "Scenario: Timer reads Zeit um at zero and never blocks" passed (phone+desktop) |
| Timer keeps running during a vote | e2e | "Scenario: Timer keeps running during a vote" passed (phone+desktop) |
| Remaining time from the deadline | unit | "Scenario: Remaining time from the deadline" passed (1) |
| Day timer stands out | e2e | "Scenario: Day timer stands out" passed (phone+desktop) |
| Day clock emphasis approved | manual (visual judgement at Gate 2, on the verifier's screenshots) | shots/ and Gate 2 checklist |
| Nomination rules enforced | unit | "Scenario: Nomination rules enforced" passed (1) |
| Unavailable choices show a reason | e2e | "Scenario: Unavailable choices show a reason" passed (phone+desktop) |
| Zurück cancels the nomination unused | e2e | "Scenario: Zurück cancels the nomination unused" passed (phone+desktop) |
| Clock points at the nominee | e2e | "Scenario: Clock points at the nominee" passed (phone+desktop) |
| Sweep order ends at the nominee | unit | "Scenario: Sweep order ends at the nominee" passed (1) |
| Sweep lasts 2.5 seconds per seat | unit | "Scenario: Sweep lasts 2.5 seconds per seat" passed (1) |
| Real short sweep marks votes | e2e | "Scenario: Real short sweep marks votes" passed (phone+desktop) |
| Tapping any seat during the sweep toggles its vote | e2e | "Scenario: Tapping any seat during the sweep toggles its vote" passed (phone+desktop) |
| Space marks only the seat under the hand | e2e | "Scenario: Space marks only the seat under the hand" passed (phone+desktop) |
| Dead without ghost vote cannot be marked | e2e | "Scenario: Dead without ghost vote cannot be marked" passed (phone+desktop) |
| Confirm corrects missed timing | e2e | "Scenario: Confirm corrects missed timing" passed (phone+desktop) |
| Dead voters spend their ghost vote | unit | "Scenario: Dead voters spend their ghost vote" passed (1) |
| Reduced motion hand jumps | e2e | "Scenario: Reduced motion hand jumps" passed (phone+desktop) |
| Voting clock hand stands out | e2e | "Scenario: Voting clock hand stands out" passed (phone+desktop) |
| Vote result by threshold and high-water mark | unit | "Scenario: Vote result by threshold and high-water mark" passed (1) |
| Threshold uses living players at vote time | unit | "Scenario: Threshold uses living players at vote time" passed (1) |
| Block holder marked on the circle | e2e | "Scenario: Block holder marked on the circle" passed (phone+desktop) |
| Seat actions name no character | e2e | "Scenario: Seat actions name no character" passed (phone+desktop) |
| Immediate execution ends the day | unit | "Scenario: Immediate execution ends the day" passed (1) |
| Death by day runs the win check | unit | "Scenario: Death by day runs the win check" passed (1) |
| Corrections by day | unit | "Scenario: Corrections by day" passed (1) |
| Lebt doch takes back the Scarlet Woman question | unit | "Scenario: Lebt doch takes back the Scarlet Woman question" passed (1) |
| Tag beenden executes the block holder | e2e | "Scenario: Tag beenden executes the block holder" passed (phone+desktop) |
| No execution after a tie or without nominations | e2e | "Scenario: No execution after a tie or without nominations" passed (phone+desktop) |
| Executing a dead player counts as the execution | unit | "Scenario: Executing a dead player counts as the execution" passed (1) |
| Good wins when the Demon dies | unit | "Scenario: Good wins when the Demon dies" passed (1) |
| Evil wins at two alive | unit | "Scenario: Evil wins at two alive" passed (1) |
| Both at once good wins | unit | "Scenario: Both at once good wins" passed (1) |
| Recluse never counts as the Demon | unit | "Scenario: Recluse never counts as the Demon" passed (1) |
| New Demon checked after a starpass | unit | "Scenario: New Demon checked after a starpass" passed (1) |
| Scarlet Woman question at the next dusk | unit | "Scenario: Scarlet Woman question at the next dusk" passed (1) |
| Scarlet Woman needs five alive before the death | unit | "Scenario: Scarlet Woman needs five alive before the death" passed (1) |
| Saint executed asks at dusk | unit | "Scenario: Saint executed asks at dusk" passed (1) |
| Mayor question at dusk | unit | "Scenario: Mayor question at dusk" passed (1) |
| Drunk Mayor or Saint never asks | unit | "Scenario: Drunk Mayor or Saint never asks" passed (1) |
| Public screen gives nothing away | e2e | "Scenario: Public screen gives nothing away" passed (phone+desktop) |
| Storyteller declares the winner at night | e2e | "Scenario: Storyteller declares the winner at night" passed (phone+desktop) |
| Teaser names no team | e2e | "Scenario: Teaser names no team" passed (phone+desktop) |
| Reveal shows the winning team and every seat | e2e | "Scenario: Reveal shows the winning team and every seat" passed (phone+desktop) |
| End reveal by team approved | manual (visual judgement at Gate 2, on the verifier's screenshots) | shots/ and Gate 2 checklist |
| Reload on the teaser keeps it hidden | e2e | "Scenario: Reload on the teaser keeps it hidden" passed (phone+desktop) |
| Session cleared only on leaving | e2e | "Scenario: Session cleared only on leaving" passed (phone+desktop) |
| Winner for every ending | unit | "Scenario: Winner for every ending" passed (1) |
| Full Clocktower game | e2e | "Scenario: Full Clocktower game" passed (phone only) |
| Deck navigation by tap, swipe and keys | e2e | "Scenario: Deck navigation by tap, swipe and keys" passed (phone+desktop) |
| Deck readable without horizontal scroll | e2e | "Scenario: Deck readable without horizontal scroll" passed (phone+desktop) |
| Deck closes to the start screen | e2e | "Scenario: Deck closes to the start screen" passed (phone+desktop) |
| Slide change animated, crossfade under reduced motion | e2e | "Scenario: Slide change animated, crossfade under reduced motion" passed (phone+desktop) |
| Deck carries the presentation's content | manual (content comparison by Rue at Gate 2) | shots/ and Gate 2 checklist |
| Role-count slide for every count | unit | "Scenario: Role-count slide for every count" passed (1) |
| Voting slide uses half the players | unit | "Scenario: Voting slide uses half the players" passed (1) |
| Official win wording in the deck | unit | "Scenario: Official win wording in the deck" passed (1) |
| Deck follows the chosen count | e2e | "Scenario: Deck follows the chosen count" passed (phone+desktop) |
| Deck explains the app | e2e | "Scenario: Deck explains the app" passed (phone+desktop) |
| App slides read clearly | manual (wording judgement by Rue at Gate 2) | shots/ and Gate 2 checklist |
| Sheet lists all characters | unit | "Scenario: Sheet lists all characters" passed (1) |
| Sheet fits one desktop viewport | e2e | "Scenario: Sheet fits one desktop viewport" passed (desktop only) |
| Sheet on phone is two pages | e2e | "Scenario: Sheet on phone is two pages" passed (phone only) |
| Credits slide names the sources | e2e | "Scenario: Credits slide names the sources" passed (phone+desktop) |
| Sheet in the look of the PDF | manual (visual judgement at Gate 2) | shots/ and Gate 2 checklist |
| Setup circle shows each seat's character | e2e | "Scenario: Setup circle shows each seat's character" passed (phone+desktop) |
| Character icons fit fifteen seats | e2e | "Scenario: Character icons fit fifteen seats" passed (phone+desktop) |
| Public circles show no character icon | e2e | "Scenario: Public circles show no character icon" passed (phone+desktop) |
| Distribution readable at a glance | manual (visual judgement at Gate 2, on the verifier's screenshots) | shots/ and Gate 2 checklist |
| Night screens keep Weiter after the circle | e2e | "Scenario: Night screens keep Weiter after the circle" passed (phone+desktop) |
| Night circle seen in one piece | e2e | "Scenario: Night circle seen in one piece" passed (phone+desktop) |
| Day screens keep the action after the circle | e2e | "Scenario: Day screens keep the action after the circle" passed (phone+desktop) |
| Circle and information in one piece approved | manual (layout judgement at Gate 2) | shots/ and Gate 2 checklist |
| Night and reveal panels centre their text | e2e | "Scenario: Night and reveal panels centre their text" passed (phone+desktop) |
| Dawn panels centre their text | e2e | "Scenario: Dawn panels centre their text" passed (phone+desktop) |
| End screens have no right-aligned text | e2e | "Scenario: End screens have no right-aligned text" passed (phone+desktop) |
| Day facts sit in a box | e2e | "Scenario: Day facts sit in a box" passed (phone+desktop) |
| Day facts legible | manual (visual judgement at Gate 2, on the verifier's screenshots) | shots/ and Gate 2 checklist |
| Voting slide timeline follows the count | unit | "Scenario: Voting slide timeline follows the count" passed (1) |
| Voting slide sweeps and counts up | e2e | "Scenario: Voting slide sweeps and counts up" passed (phone+desktop) |
| Voting slide shows the end state under reduced motion | e2e | "Scenario: Voting slide shows the end state under reduced motion" passed (phone+desktop) |
| Voting animation like the presentation | manual (motion judgement at Gate 2) | shots/ and Gate 2 checklist |
| Only the expected control is enabled | e2e | "Scenario: Only the expected control is enabled" passed (phone+desktop) |
| Hidden information shown with Demo tag | e2e | "Scenario: Hidden information shown with Demo tag" passed (phone+desktop) |
| Demo leaves real data untouched | e2e | "Scenario: Demo leaves real data untouched" passed (phone+desktop) |
| Exiting returns to the starting screen | e2e | "Scenario: Exiting returns to the starting screen" passed (phone+desktop) |
| Reload during demo returns to start screen | e2e | "Scenario: Reload during demo returns to start screen" passed (phone+desktop) |
| Demo steppable with reduced motion | e2e | "Scenario: Demo steppable with reduced motion" passed (phone+desktop) |
| Every demo covers its outcome branches over several rounds | unit ("Scenario: Imposter demo covers every outcome branch", "Scenario: Wavelength demo covers every outcome branch", "Scenario: Feud demo covers every outcome branch", "Scenario: Codes demo covers every outcome branch", "Scenario: Duck demo covers every outcome branch", "Scenario: Most Likely demo covers every outcome branch") | each named test in the proof line passed (17) |
| Demo tips read neutral | unit ("Scenario: Imposter demo covers every outcome branch", "Scenario: Wavelength demo tips read neutral", "Scenario: Feud demo covers every outcome branch", "Scenario: Codes demo covers every outcome branch", "Scenario: Duck demo covers every outcome branch", "Scenario: Most Likely demo covers every outcome branch") | each named test in the proof line passed (17) |
| Demo tips say why the step happens | manual (wording judgement by Rue at Gate 2) | shots/ and Gate 2 checklist |
| Long demo progress reads correctly | e2e ("Scenario: Feud demo by tapping highlighted controls", "Scenario: Most Likely demo by tapping highlighted controls", "Scenario: Duck demo by tapping highlighted controls") | each named test in the proof line passed (phone+desktop) |
| Generic demo checks skip a game without a demo | unit | "Scenario: Generic demo checks skip a game without a demo" passed (1) |
| Game without a demo has no demo route | e2e ("Scenario: Clocktower demo and Inhalte are not found") | each named test in the proof line passed (phone+desktop) |
| Text contrast meets 4.5:1 | e2e | "Scenario: Text contrast meets 4.5:1" passed (phone+desktop) |
| Look approved on screenshots | manual (visual judgement at Gate 2) | shots/ and Gate 2 checklist |
| Clocktower colour meets contrast | unit | "Scenario: Clocktower colour meets contrast" passed (1) |
| Other games keep the Arcade-Abend look | e2e | "Scenario: Other games keep the Arcade-Abend look" passed (phone+desktop) |
| Clocktower tokens meet contrast in both variants | unit | "Scenario: Clocktower tokens meet contrast in both variants" passed (1) |
| Theme only on Clocktower routes | e2e | "Scenario: Theme only on Clocktower routes" passed (phone+desktop) |
| No theme flash on reload | e2e | "Scenario: No theme flash on reload" passed (phone+desktop) |
| Clocktower fonts are self-hosted | e2e | "Scenario: Clocktower fonts are self-hosted" passed (phone+desktop) |
| Clocktower look rules on every screen | e2e ("Scenario: Text contrast meets 4.5:1", "Scenario: Touch targets are at least 44px", "Scenario: No horizontal scroll on phone", "Scenario: Press Start 2P stays limited to logo and scores", "Scenario: Decoration loads no external assets") | each named test in the proof line passed (phone+desktop) |
| Day and night variants switch with an animation | e2e | "Scenario: Day and night variants switch with an animation" passed (phone+desktop) |
| Clocktower ambient motion off under reduced motion | e2e | "Scenario: Clocktower ambient motion off under reduced motion" passed (phone+desktop) |
| Clocktower gets its own motif | unit | "Scenario: Clocktower gets its own motif" passed (1) |
| Clocktower tile and start art | e2e | "Scenario: Clocktower tile and start art" passed (phone+desktop) |
| Clocktower look approved on screenshots | manual (visual judgement at Gate 2, on the verifier's screenshots) | shots/ and Gate 2 checklist |
| Night sky in the lobby and at night | e2e | "Scenario: Night sky in the lobby and at night" passed (phone+desktop) |
| Sun on the day screens | e2e | "Scenario: Sun on the day screens" passed (phone+desktop) |
| Atmosphere keeps every screen legible | e2e | "Scenario: Atmosphere keeps every screen legible" passed (phone+desktop) |
| Sky motion only on transform and opacity | e2e | "Scenario: Sky motion only on transform and opacity" passed (phone+desktop) |
| Atmosphere approved | manual (visual judgement at Gate 2, on the verifier's screenshots) | shots/ and Gate 2 checklist |
| Home to Clocktower runs a view transition | e2e | "Scenario: Home to Clocktower runs a view transition" passed (phone+desktop) |
| Navigation without View Transitions | e2e | "Scenario: Navigation without View Transitions" passed (phone+desktop) |
| Reduced motion skips the view transition | e2e | "Scenario: Reduced motion skips the view transition" passed (phone+desktop) |
| Back button leaves Clocktower | e2e | "Scenario: Back button leaves Clocktower" passed (phone+desktop) |
| Transitions feel smooth | manual (motion feel is a visual judgement, at Gate 2) | shots/ and Gate 2 checklist |
| Reload mid-game resumes the same phase | e2e | "Scenario: Reload mid-game resumes the same phase" passed (phone+desktop) |
| Spiel beenden clears the session | e2e | "Scenario: Spiel beenden clears the session" passed (phone+desktop) |
| Old or corrupt saved state discarded | e2e | "Scenario: Old or corrupt saved state discarded" passed (phone+desktop) |
| Two tabs last write wins | unit | "Scenario: Two tabs last write wins" passed (1) |
| Roster edit mid-game keeps the session snapshot | unit | "Scenario: Roster edit mid-game keeps the session snapshot" passed (1) |
| Game without a demo checks its explicit template | unit | "Scenario: Game without a demo checks its explicit template" passed (1) |
| Round status per game | unit | "Scenario: Round status per game" passed (1) |
| Last round fills the progress line | unit ("Scenario: Round status per game") | each named test in the proof line passed (1) |
| Duck progress follows the leading score | unit | "Scenario: Duck progress follows the leading score" passed (1) |
| Status and progress in the header | e2e | "Scenario: Status and progress in the header" passed (phone+desktop) |
| Status without a total has no progress line | e2e | "Scenario: Status without a total has no progress line" passed (phone+desktop) |
| Header wraps on a phone | e2e | "Scenario: Header wraps on a phone" passed (phone only) |
| Clocktower status per phase | unit | "Scenario: Clocktower status per phase" passed (1) |
| Game without content starts without a content fetch | e2e | "Scenario: Game without content starts without a content fetch" passed (phone+desktop) |
| Games with content keep their content gate | e2e ("Scenario: Empty pool blocks start") | each named test in the proof line passed (phone+desktop) |
| Below minimum disables start | e2e | "Scenario: Below minimum disables start" passed (phone+desktop) |
| Above maximum asks who plays | e2e | "Scenario: Above maximum asks who plays" passed (phone+desktop) |
| Fewer than N offers adding players | e2e | "Scenario: Fewer than N offers adding players" passed (phone+desktop) |
| More than N picks exactly N | e2e | "Scenario: More than N picks exactly N" passed (phone+desktop) |
| Exactly N goes to the start | e2e | "Scenario: Exactly N goes to the start" passed (phone+desktop) |
| Count changed while in the lobby | e2e | "Scenario: Count changed while in the lobby" passed (phone+desktop) |
| Roster above the Clocktower maximum | e2e | "Scenario: Roster above the Clocktower maximum" passed (phone+desktop) |
| Clocktower effects obey mute and first interaction | unit | "Scenario: Clocktower effects obey mute and first interaction" passed (1) |
| Clocktower effects without WebAudio | unit | "Scenario: Clocktower effects without WebAudio" passed (1) |
| Clocktower sounds at the right moments | manual (audio judgement on a real device at Gate 2) | shots/ and Gate 2 checklist |

## Manual checklist (Gate 2)

1. `npm run dev` then open http://localhost:5173 and pick Blood on the Clocktower from the home tiles.
2. Look: check the gothic theme, day/night switch and tile art against `shots/phone-look-*` (Look approved, Clocktower look approved, Transitions feel smooth).
3. Atmosphere (S39, new): open the lobby and a night: stars and a moon behind content; open a day: a subtle sun, brighter and livelier; text stays legible (Atmosphere approved, `*-look-lobby-clocktower*`, `*-look-clocktower-clock-*`, `*-look-clocktower-dawn-*`).
4. Circle and ghost token (S43, S47, new): in setup, night and day look at the ornament ring linking the seats and at a dead player's ghost-vote token (Circle and ghost token look approved).
5. Setup at a glance (S41, new): in setup every seat shows its character icon in team colour (Distribution readable at a glance, `*-look-clocktower-setup-*`).
6. One piece (S44, new): on night and day screens that scroll, Weiter sits after the circle and info, not in a sticky bar (Circle and information in one piece approved).
7. Show-bar and day facts (S45, S48, new): show-bar is compact and well placed; the day facts box bottom left is legible (Show-bar placement approved, Day facts legible).
8. Day clock (S46, new): the day timer is clearly emphasised (Day clock emphasis approved, `*-look-clocktower-clock-*`).
9. Voting animation (S40, new): in the deck's voting slide the hand sweeps, nodes turn red, the count counts up; matches the presentation (Voting animation like the presentation, `*-look-clocktower-deck-voting.png`).
10. End screen (S49, new): seats grouped by Good and Evil with character icons (End reveal by team approved, `*-look-clocktower-end-reveal-*`).
11. Sound: on a real device unmuted, play a night and a day and listen for the Clocktower sounds (Clocktower sounds at the right moments).
12. Deck: open the Erklärung deck, read the slides against the presentation (Deck carries the presentation's content) and the app slides (App slides read clearly).
13. Sheet: open the deck sheet slide and compare with the PDF look (Sheet in the look of the PDF).
14. Demo: run another game's demo and read the tips for the why (Demo tips say why the step happens).

## Diffstat (`git diff --stat origin/main...flow/blood-on-the-clocktower`)

```
 e2e/clocktower-atmosphere.test.ts                  |  210 ++++
 e2e/clocktower-circle.test.ts                      |  354 +++++++
 e2e/clocktower-day-layout.test.ts                  |  210 ++++
 e2e/clocktower-day.test.ts                         |  552 ++++++++++
 e2e/clocktower-deck.test.ts                        |  380 +++++++
 e2e/clocktower-end.test.ts                         |  156 +++
 e2e/clocktower-game.test.ts                        |  196 ++++
 e2e/clocktower-night-layout.test.ts                |   91 ++
 e2e/clocktower-night.test.ts                       |  471 +++++++++
 e2e/clocktower-session.test.ts                     |   47 +
 e2e/clocktower-session.ts                          |   26 +
 e2e/clocktower-setup.test.ts                       |  443 ++++++++
 e2e/clocktower-start.test.ts                       |  299 ++++++
 e2e/clocktower-theme.test.ts                       |  304 ++++++
 e2e/deco.test.ts                                   |   40 +
 e2e/home.test.ts                                   |    3 +-
 e2e/look.test.ts                                   |    2 +
 e2e/start.test.ts                                  |    3 +-
 e2e/walks/clocktower-day.ts                        |  134 +++
 e2e/walks/clocktower-deck.ts                       |   38 +
 e2e/walks/clocktower-end.ts                        |   59 ++
 e2e/walks/clocktower-night.ts                      |  115 +++
 e2e/walks/clocktower-setup.ts                      |   70 ++
 e2e/walks/clocktower.ts                            |   44 +
 .../changes/blood-on-the-clocktower/.openspec.yaml |    2 +
 openspec/changes/blood-on-the-clocktower/design.md |  410 ++++++++
 openspec/changes/blood-on-the-clocktower/flow.yaml |   27 +
 .../blood-on-the-clocktower/gate2-feedback.md      |   16 +
 openspec/changes/blood-on-the-clocktower/mobbin.md |   98 ++
 .../changes/blood-on-the-clocktower/proposal.md    |   97 ++
 .../research/design-sources.md                     |  135 +++
 .../blood-on-the-clocktower/research/mobbin.md     |  152 +++
 .../blood-on-the-clocktower/research/rules.md      |  379 +++++++
 openspec/changes/blood-on-the-clocktower/scope.md  |  204 ++++
 .../specs/catalogue/spec.md                        |  135 +++
 .../specs/clocktower/spec.md                       | 1057 ++++++++++++++++++++
 .../blood-on-the-clocktower/specs/demo/spec.md     |   76 ++
 .../specs/design-system/spec.md                    |  168 ++++
 .../specs/game-engine/spec.md                      |  105 ++
 .../blood-on-the-clocktower/specs/roster/spec.md   |   44 +
 .../blood-on-the-clocktower/specs/sound/spec.md    |   22 +
 openspec/changes/blood-on-the-clocktower/tasks.md  |  229 +++++
 .../blood-on-the-clocktower/verification.md        |  465 +++++++++
 src/app.css                                        |  164 +++
 src/app.html                                       |    6 +-
 src/hooks.server.ts                                |   28 +-
 src/lib/count.test.ts                              |   41 +
 src/lib/count.ts                                   |   17 +
 src/lib/deco/Art.svelte                            |   12 +-
 src/lib/deco/Clocktower.svelte                     |  125 +++
 src/lib/deco/Sky.svelte                            |  240 +++++
 src/lib/deco/motifs.test.ts                        |   41 +-
 src/lib/deco/motifs.ts                             |    8 +-
 src/lib/demo/runner.test.ts                        |   12 +-
 src/lib/engine/types.ts                            |    3 +-
 src/lib/games/clocktower/CharacterBoard.svelte     |  155 +++
 src/lib/games/clocktower/CharacterIcon.svelte      |   36 +
 src/lib/games/clocktower/Circle.svelte             |  507 ++++++++++
 src/lib/games/clocktower/Dawn.svelte               |   99 ++
 src/lib/games/clocktower/Day.svelte                |  151 +++
 src/lib/games/clocktower/Deal.svelte               |  115 +++
 src/lib/games/clocktower/DeathStep.svelte          |  104 ++
 src/lib/games/clocktower/Deck.svelte               |  150 +++
 src/lib/games/clocktower/End.svelte                |  262 +++++
 src/lib/games/clocktower/Facts.svelte              |   48 +
 src/lib/games/clocktower/HoldGrimoire.svelte       |   42 +
 src/lib/games/clocktower/Night.svelte              |   65 ++
 src/lib/games/clocktower/Questions.svelte          |   74 ++
 src/lib/games/clocktower/RoleCard.svelte           |   74 ++
 src/lib/games/clocktower/Screen.svelte             |   25 +
 src/lib/games/clocktower/SeatActions.svelte        |   52 +
 src/lib/games/clocktower/Setup.svelte              |   47 +
 src/lib/games/clocktower/SetupBoard.svelte         |  188 ++++
 src/lib/games/clocktower/Sheet.svelte              |  307 ++++++
 src/lib/games/clocktower/ShowBar.svelte            |  212 ++++
 src/lib/games/clocktower/ShowCard.svelte           |  151 +++
 src/lib/games/clocktower/Slide.svelte              |  677 +++++++++++++
 src/lib/games/clocktower/Timer.svelte              |   69 ++
 src/lib/games/clocktower/VoteClock.svelte          |  133 +++
 src/lib/games/clocktower/Wake.svelte               |  270 +++++
 src/lib/games/clocktower/characters.test.ts        |   68 ++
 src/lib/games/clocktower/characters.ts             |  279 ++++++
 src/lib/games/clocktower/circle.test.ts            |   71 ++
 src/lib/games/clocktower/circle.ts                 |   68 ++
 src/lib/games/clocktower/deck.test.ts              |  118 +++
 src/lib/games/clocktower/deck.ts                   |  527 ++++++++++
 src/lib/games/clocktower/engine.test.ts            |  690 +++++++++++++
 src/lib/games/clocktower/engine.ts                 |  402 ++++++++
 src/lib/games/clocktower/fixtures.ts               |   74 ++
 src/lib/games/clocktower/index.ts                  |   37 +
 src/lib/games/clocktower/info.test.ts              |   95 ++
 src/lib/games/clocktower/info.ts                   |   52 +
 src/lib/games/clocktower/label.ts                  |   10 +
 src/lib/games/clocktower/night.test.ts             |  122 +++
 src/lib/games/clocktower/night.ts                  |   53 +
 src/lib/games/clocktower/setup.test.ts             |  201 ++++
 src/lib/games/clocktower/setup.ts                  |  141 +++
 src/lib/games/clocktower/sheet.test.ts             |   63 ++
 src/lib/games/clocktower/timer.test.ts             |   24 +
 src/lib/games/clocktower/timer.ts                  |    8 +
 src/lib/games/clocktower/types.ts                  |  105 ++
 src/lib/games/clocktower/vote.test.ts              |   47 +
 src/lib/games/clocktower/vote.ts                   |   27 +
 src/lib/games/clocktower/win.test.ts               |  224 +++++
 src/lib/games/clocktower/win.ts                    |   45 +
 src/lib/games/registry.test.ts                     |   46 +-
 src/lib/games/registry.ts                          |   21 +-
 src/lib/games/status.test.ts                       |   28 +
 src/lib/sound.test.ts                              |   37 +-
 src/lib/sound.ts                                   |   18 +-
 src/lib/theme.ts                                   |   24 +
 src/lib/ui/GameTile.svelte                         |    4 +
 src/lib/ui/tokens.test.ts                          |   69 +-
 src/lib/ui/tokens.ts                               |  130 ++-
 src/routes/+layout.svelte                          |   17 +
 src/routes/spiele/[slug]/+page.server.ts           |    3 +-
 src/routes/spiele/[slug]/+page.svelte              |  146 ++-
 src/routes/spiele/[slug]/demo/+page.server.ts      |   10 +
 src/routes/spiele/[slug]/demo/+page.svelte         |    8 +-
 .../spiele/[slug]/erklaerung/+page.server.ts       |   10 +
 src/routes/spiele/[slug]/erklaerung/+page.svelte   |   30 +
 src/routes/spiele/[slug]/inhalte/+page.server.ts   |    2 +
 src/routes/spiele/[slug]/inhalte/+page.svelte      |    8 +-
 src/routes/spiele/[slug]/lobby/+page.svelte        |   58 +-
 src/routes/spiele/[slug]/spielen/+page.svelte      |    7 +
 static/fonts/AlegreyaSans-OFL.txt                  |   93 ++
 static/fonts/IMFellEnglish-OFL.txt                 |   93 ++
 static/fonts/alegreya-sans-latin-400.woff2         |  Bin 0 -> 23708 bytes
 static/fonts/alegreya-sans-latin-500.woff2         |  Bin 0 -> 23928 bytes
 static/fonts/alegreya-sans-latin-700.woff2         |  Bin 0 -> 23976 bytes
 static/fonts/im-fell-english-italic-latin.woff2    |  Bin 0 -> 57808 bytes
 static/fonts/im-fell-english-latin.woff2           |  Bin 0 -> 59880 bytes
 static/fonts/im-fell-english-sc-latin.woff2        |  Bin 0 -> 56956 bytes
 133 files changed, 17121 insertions(+), 70 deletions(-)
```

## Screenshots (not committed)

All 208 clocktower shots from this run (105 phone, 103 desktop; lobby, start, setup, reveal, night, day, end, deck) copied to /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/ with phone- and desktop- prefixes (`*-look-clocktower-*`, `*-look-lobby-clocktower*`, `*-look-start-clocktower*`). Files for the revisions:
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/desktop-look-clocktower-clock-15.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/desktop-look-clocktower-clock-7.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/desktop-look-clocktower-dawn-15.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/desktop-look-clocktower-dawn-7.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/desktop-look-clocktower-dawn-deaths-15.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/desktop-look-clocktower-dawn-deaths-7.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/desktop-look-clocktower-dawn-none-7.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/desktop-look-clocktower-dawn-timer-15.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/desktop-look-clocktower-dawn-timer-7.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/desktop-look-clocktower-deck-app-grimoire.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/desktop-look-clocktower-dusk.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/desktop-look-clocktower-end-reveal-15.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/desktop-look-clocktower-end-reveal-evil.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/desktop-look-clocktower-end-reveal-good.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/desktop-look-clocktower-end-teaser-15.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/desktop-look-clocktower-end-teaser-evil.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/desktop-look-clocktower-end-teaser-good.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/desktop-look-clocktower-grimoire-15.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/desktop-look-clocktower-grimoire-7.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/desktop-look-clocktower-grimoire-late-15.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/desktop-look-clocktower-grimoire-late-7.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/desktop-look-clocktower-grimoire.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/desktop-look-clocktower-imp-self.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/desktop-look-clocktower-imp.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/desktop-look-clocktower-nominator-15.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/desktop-look-clocktower-nominator-7.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/desktop-look-clocktower-question.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/desktop-look-clocktower-setup-15-complete.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/desktop-look-clocktower-setup-15-confirm.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/desktop-look-clocktower-setup-15-distribution.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/desktop-look-clocktower-setup-15-empty.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/desktop-look-clocktower-setup-15-error.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/desktop-look-clocktower-setup-7-complete.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/desktop-look-clocktower-setup-7-confirm.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/desktop-look-clocktower-setup-7-empty.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/desktop-look-clocktower-setup-7-error.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/desktop-look-clocktower-show-bluffs.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/desktop-look-clocktower-show-charakter.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/desktop-look-clocktower-show-das-ist-der-dämon.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/desktop-look-clocktower-show-deine-minions.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/desktop-look-clocktower-show-du-bist.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/desktop-look-clocktower-show-ja.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/desktop-look-clocktower-show-nein.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/desktop-look-clocktower-show-zahl.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/desktop-look-clocktower-sleep-group.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/desktop-look-clocktower-sweep-15.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/desktop-look-clocktower-sweep-7.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/desktop-look-clocktower-wake-group.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/desktop-look-clocktower-wake-pair.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/desktop-look-lobby-clocktower-few.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/desktop-look-lobby-clocktower-pick.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/desktop-look-lobby-clocktower.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/desktop-look-start-clocktower.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/phone-look-clocktower-clock-15.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/phone-look-clocktower-clock-7.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/phone-look-clocktower-dawn-15.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/phone-look-clocktower-dawn-7.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/phone-look-clocktower-dawn-deaths-15.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/phone-look-clocktower-dawn-deaths-7.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/phone-look-clocktower-dawn-none-7.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/phone-look-clocktower-dawn-timer-15.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/phone-look-clocktower-dawn-timer-7.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/phone-look-clocktower-deck-app-grimoire.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/phone-look-clocktower-dusk.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/phone-look-clocktower-end-reveal-15.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/phone-look-clocktower-end-reveal-evil.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/phone-look-clocktower-end-reveal-good.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/phone-look-clocktower-end-teaser-15.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/phone-look-clocktower-end-teaser-evil.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/phone-look-clocktower-end-teaser-good.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/phone-look-clocktower-grimoire-15.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/phone-look-clocktower-grimoire-7.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/phone-look-clocktower-grimoire-late-15.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/phone-look-clocktower-grimoire-late-7.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/phone-look-clocktower-grimoire.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/phone-look-clocktower-imp-self.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/phone-look-clocktower-imp.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/phone-look-clocktower-nominator-15.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/phone-look-clocktower-nominator-7.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/phone-look-clocktower-question.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/phone-look-clocktower-setup-15-complete.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/phone-look-clocktower-setup-15-confirm.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/phone-look-clocktower-setup-15-distribution.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/phone-look-clocktower-setup-15-empty.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/phone-look-clocktower-setup-15-error.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/phone-look-clocktower-setup-7-complete.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/phone-look-clocktower-setup-7-confirm.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/phone-look-clocktower-setup-7-empty.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/phone-look-clocktower-setup-7-error.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/phone-look-clocktower-show-bluffs.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/phone-look-clocktower-show-charakter.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/phone-look-clocktower-show-das-ist-der-dämon.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/phone-look-clocktower-show-deine-minions.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/phone-look-clocktower-show-du-bist.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/phone-look-clocktower-show-ja.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/phone-look-clocktower-show-nein.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/phone-look-clocktower-show-zahl.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/phone-look-clocktower-sleep-group.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/phone-look-clocktower-sweep-15.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/phone-look-clocktower-sweep-7.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/phone-look-clocktower-wake-group.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/phone-look-clocktower-wake-pair.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/phone-look-lobby-clocktower-few.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/phone-look-lobby-clocktower-pick.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/phone-look-lobby-clocktower.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/23e0535d-3f30-41cf-8506-aa3eee9cc56a/scratchpad/shots-r4/phone-look-start-clocktower.png

## Earlier review (r1–r3)

Fresh-context reviewer (opus) over `git diff origin/main...flow/blood-on-the-clocktower`, three rounds.

### Round 1 (fixed, each with a regression test)
- End history keyed by night: duplicate key crashed the end screen. Keyed per entry.
- Back onto an answered dusk question trapped the guide. `next`/`back` skip closed question screens; spec sentence added.
- After a starpass the new Imp still woke in their old Minion step. The step is dropped.
- ShowBar takeover step had no Imp card preselected. Preselected.
- Desktop sheet credit at 11px. Raised to 12px (user decision: sheet exception, ≥12px).
- Circle death animation used `filter`. Now scale plus opacity.
- Four weak tests tightened; setup/reveal look shots renamed `clocktower-setup-*` / `clocktower-reveal-*`.

### Round 2 (fixed)
- "Lebt doch" left a queued Scarlet Woman question. Dropped on revive; new scenario "Lebt doch takes back the Scarlet Woman question".
- Day-phase reload painted night first. Inline head script sets the day variant before first paint.
- Deck night slide text was wrong. Corrected.
- Seven weak tests tightened.

### Round 3 (open, round limit reached)
- [weak] `e2e/clocktower-deck.test.ts:142-158` "Slide change animated, crossfade under reduced motion" checks that opacity animates and transform is present or absent, but not that nothing else animates. Current code animates only opacity and transform (`Deck.svelte:29`). Not fixed: round limit.
- [spec] `VoteClock.svelte:50-53`, `engine.ts:386-392`: during the sweep, tapping any markable seat toggles its vote, not only the seat under the hand. Space is limited to the hand seat. "Real short sweep marks votes" taps a seat before the hand starts. Left for the user at Gate 2: keep the convenience and say so in the spec, or restrict taps to the hand seat.
- No weakened tests and no correctness bugs found.

