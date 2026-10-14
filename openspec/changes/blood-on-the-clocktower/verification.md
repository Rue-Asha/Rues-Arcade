verified-at: f675175

# Verification r3

## Layer 1: `PORT=4712 npm run proof:full` (green, run 1 of 1)

Unit: `npx vitest run --reporter=verbose` 469 passed lines, exit 0. Full log: /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/full-r3.log (unit: /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/unit-r3.log)

```
```

## Layer 2: spec coverage (207 scenarios: 77 unit, 122 e2e, 8 manual, 0 gaps)

Prefix collisions between scenario titles: none. Test names matched by containing the exact "Scenario: <title>" (or every name in the proof line); parametrized and nested tests count when the title appears in the name. Evidence in parentheses is the number of passing hits (phone+desktop = both projects).
e2e single-project by design: Drag a seat to a new place (desktop), Full Clocktower game (phone), Sheet fits one desktop viewport (desktop), Sheet on phone is two pages (phone), Header wraps on a phone (phone), No horizontal scroll on phone (phone).
Changed since r2 and found passing: "Lebt doch takes back the Scarlet Woman question" (`src/lib/games/clocktower/win.test.ts`), "Reveal walks seat by seat", "No theme flash on reload".

| Scenario | proof | Evidence |
|---|---|---|
| Tiles for registered games | e2e | "Scenario: Tiles for registered games" passed (2/desktop+phone) |
| Player range derived from engine limits | unit | "Scenario: Player range derived from engine limits" passed (1) |
| Registry lists Blood on the Clocktower last | unit | "Scenario: Registry lists Blood on the Clocktower last" passed (1) |
| Start banner carries title, badge and player range | e2e | "Scenario: Start banner carries title, badge and player range" passed (2/desktop+phone) |
| Start panel first on phone, right column on desktop | e2e | "Scenario: Start panel first on phone, right column on desktop" passed (2/desktop+phone) |
| Same start layout for both games | e2e | each named test in the proof line passed (("Scenario: Start panel first on phone, right column on desktop")) |
| Mehr-zu cards keep their targets | e2e | "Scenario: Mehr-zu cards keep their targets" passed (2/desktop+phone) |
| Old Erklärung link is not found | e2e | "Scenario: Old Erklärung link is not found" passed (2/desktop+phone) |
| Inhalte card shows the real content count | e2e | "Scenario: Inhalte card shows the real content count" passed (2/desktop+phone) |
| Los geht's opens the lobby | e2e | "Scenario: Los geht's opens the lobby" passed (2/desktop+phone) |
| So geht's covers both Wavelength modes | e2e | "Scenario: So geht's covers both Wavelength modes" passed (2/desktop+phone) |
| Count defaults to the roster size, clamped | e2e | "Scenario: Count defaults to the roster size, clamped" passed (2/desktop+phone) |
| Count stays within 5 to 15 | e2e | "Scenario: Count stays within 5 to 15" passed (2/desktop+phone) |
| Chosen count persists | e2e | "Scenario: Chosen count persists" passed (2/desktop+phone) |
| Roster changes keep the chosen count | e2e | "Scenario: Roster changes keep the chosen count" passed (2/desktop+phone) |
| Invalid stored count falls back to the default | unit | "Scenario: Invalid stored count falls back to the default" passed (1) |
| Clocktower banner, rules and pitch | e2e | "Scenario: Clocktower banner, rules and pitch" passed (2/desktop+phone) |
| Erklärung card instead of Demo and Inhalte | e2e | "Scenario: Erklärung card instead of Demo and Inhalte" passed (2/desktop+phone) |
| Clocktower demo and Inhalte are not found | e2e | "Scenario: Clocktower demo and Inhalte are not found" passed (2/desktop+phone) |
| Twenty-two characters by team | unit | "Scenario: Twenty-two characters by team" passed (1) |
| Setup table for every count | unit | "Scenario: Setup table for every count" passed (1) |
| Swap two seats by tapping | e2e | "Scenario: Swap two seats by tapping" passed (2/desktop+phone) |
| Drag a seat to a new place | e2e | "Scenario: Drag a seat to a new place" passed (1/desktop) |
| Swap seats by keyboard | e2e | "Scenario: Swap seats by keyboard" passed (2/desktop+phone) |
| Five and fifteen seats fit the setup board | e2e | "Scenario: Five and fifteen seats fit the setup board" passed (4/desktop+phone) |
| Seat order carries into the game | unit | "Scenario: Seat order carries into the game" passed (1) |
| Counters follow the setup table | e2e | "Scenario: Counters follow the setup table" passed (2/desktop+phone) |
| Baron changes the requirement live | e2e | "Scenario: Baron changes the requirement live" passed (2/desktop+phone) |
| Over-assigned team shown as an error | e2e | "Scenario: Over-assigned team shown as an error" passed (2/desktop+phone) |
| Each character at most once | unit | "Scenario: Each character at most once" passed (1) |
| Assign by seat or by character first | e2e | "Scenario: Assign by seat or by character first" passed (2/desktop+phone) |
| Random fill keeps manual choices | unit | "Scenario: Random fill keeps manual choices" passed (1) |
| Random fill with a manual Baron | unit | "Scenario: Random fill with a manual Baron" passed (1) |
| Alles neu rerolls every seat | unit | "Scenario: Alles neu rerolls every seat" passed (1) |
| Impossible manual choice is flagged | e2e | "Scenario: Impossible manual choice is flagged" passed (2/desktop+phone) |
| Random distribution is seeded | unit | "Scenario: Random distribution is seeded" passed (1) |
| Believed role is a Townsfolk not in play | unit | "Scenario: Believed role is a Townsfolk not in play" passed (1) |
| Red herring is a good player | unit | "Scenario: Red herring is a good player" passed (1) |
| Drunk Fortune Teller gets a red herring | unit | "Scenario: Drunk Fortune Teller gets a red herring" passed (1) |
| Reassigning clears stale picks | unit | "Scenario: Reassigning clears stale picks" passed (1) |
| Drunk and red herring on the board | e2e | "Scenario: Drunk and red herring on the board" passed (2/desktop+phone) |
| Weiter needs a complete valid distribution | e2e | "Scenario: Weiter needs a complete valid distribution" passed (2/desktop+phone) |
| Confirm before the reveal | e2e | "Scenario: Confirm before the reveal" passed (2/desktop+phone) |
| Locked distribution cannot change | unit | "Scenario: Locked distribution cannot change" passed (1) |
| Setup board shows the character sheet | e2e | "Scenario: Setup board shows the character sheet" passed (2/desktop+phone) |
| Reveal walks seat by seat | e2e | "Scenario: Reveal walks seat by seat" passed (2/desktop+phone) |
| Drunk sees the believed Townsfolk | e2e | "Scenario: Drunk sees the believed Townsfolk" passed (2/desktop+phone) |
| Card stays until hidden | e2e | "Scenario: Card stays until hidden" passed (2/desktop+phone) |
| Hidden card leaves nothing readable | e2e | "Scenario: Hidden card leaves nothing readable" passed (2/desktop+phone) |
| Reload mid-reveal resumes hidden | e2e | "Scenario: Reload mid-reveal resumes hidden" passed (2/desktop+phone) |
| Circle shows seats, alive and ghost votes | e2e | "Scenario: Circle shows seats, alive and ghost votes" passed (2/desktop+phone) |
| Circle geometry for five to fifteen seats | unit | "Scenario: Circle geometry for five to fifteen seats" passed (1) |
| Circle legible on phone and desktop | e2e | "Scenario: Circle legible on phone and desktop" passed (2/desktop+phone) |
| Header shows the night or day and the alive count | e2e | "Scenario: Header shows the night or day and the alive count" passed (2/desktop+phone) |
| Death on the circle is animated | e2e | "Scenario: Death on the circle is animated" passed (2/desktop+phone) |
| Every phase survives a reload | unit | "Scenario: Every phase survives a reload" passed (1) |
| Stale Clocktower session discarded | e2e | "Scenario: Stale Clocktower session discarded" passed (2/desktop+phone) |
| Spiel beenden clears the Clocktower session | e2e | "Scenario: Spiel beenden clears the Clocktower session" passed (2/desktop+phone) |
| Night starts with Alle schlafen ein | e2e | "Scenario: Night starts with Alle schlafen ein" passed (2/desktop+phone) |
| Night order for 5, 7 and 15 players | unit | "Scenario: Night order for 5, 7 and 15 players" passed (1) |
| Small games have no evil info | unit | "Scenario: Small games have no evil info" passed (1) |
| Conditional wakes on other nights | unit | "Scenario: Conditional wakes on other nights" passed (1) |
| Drunk wakes at the believed slot | unit | "Scenario: Drunk wakes at the believed slot" passed (1) |
| New Imp wakes as Imp | unit | "Scenario: New Imp wakes as Imp" passed (1) |
| Each waking step is four screens | e2e | "Scenario: Each waking step is four screens" passed (2/desktop+phone) |
| Group steps name every seat | e2e | "Scenario: Group steps name every seat" passed (2/desktop+phone) |
| Skip and back keep state | unit | "Scenario: Skip and back keep state" passed (1) |
| Pair info for the first-night Townsfolk | unit | "Scenario: Pair info for the first-night Townsfolk" passed (1) |
| Chef counts evil pairs around the circle | unit | "Scenario: Chef counts evil pairs around the circle" passed (1) |
| Empath skips dead neighbours | unit | "Scenario: Empath skips dead neighbours" passed (1) |
| Fortune Teller and Undertaker info | unit | "Scenario: Fortune Teller and Undertaker info" passed (1) |
| Roles without info | unit | "Scenario: Roles without info" passed (1) |
| Suggestion labelled with its caveat | e2e | "Scenario: Suggestion labelled with its caveat" passed (2/desktop+phone) |
| Show-bar opens full-screen cards | e2e | "Scenario: Show-bar opens full-screen cards" passed (2/desktop+phone) |
| Role preselects its cards | e2e | "Scenario: Role preselects its cards" passed (2/desktop+phone) |
| Bluffs are good characters not in play | unit | "Scenario: Bluffs are good characters not in play" passed (1) |
| Bluffs can be rerolled before showing | e2e | "Scenario: Bluffs can be rerolled before showing" passed (2/desktop+phone) |
| Grimoire visible only while held | e2e | "Scenario: Grimoire visible only while held" passed (2/desktop+phone) |
| Release outside the button hides the grimoire | e2e | "Scenario: Release outside the button hides the grimoire" passed (2/desktop+phone) |
| Grimoire by keyboard | e2e | "Scenario: Grimoire by keyboard" passed (2/desktop+phone) |
| No grimoire by day | e2e | "Scenario: No grimoire by day" passed (4/desktop+phone) |
| Noted target prefills the death step | e2e | "Scenario: Noted target prefills the death step" passed (2/desktop+phone) |
| Starpass makes a living Minion the Imp | unit | "Scenario: Starpass makes a living Minion the Imp" passed (1) |
| Scarlet Woman forced on a starpass | unit | "Scenario: Scarlet Woman forced on a starpass" passed (1) |
| Starpass without a living Minion | unit | "Scenario: Starpass without a living Minion" passed (1) |
| Imp wählt sich selbst wakes the new Imp | e2e | "Scenario: Imp wählt sich selbst wakes the new Imp" passed (2/desktop+phone) |
| Death step records the night's deaths | unit | "Scenario: Death step records the night's deaths" passed (1) |
| Dead seats cannot be selected | e2e | "Scenario: Dead seats cannot be selected" passed (2/desktop+phone) |
| Win check after the death step | unit | "Scenario: Win check after the death step" passed (1) |
| Dawn shows the night's deaths | e2e | "Scenario: Dawn shows the night's deaths" passed (2/desktop+phone) |
| Day timer dialog | e2e | "Scenario: Day timer dialog" passed (2/desktop+phone) |
| Reload keeps the remaining time | e2e | "Scenario: Reload keeps the remaining time" passed (2/desktop+phone) |
| Timer reads Zeit um at zero and never blocks | e2e | "Scenario: Timer reads Zeit um at zero and never blocks" passed (2/desktop+phone) |
| Timer keeps running during a vote | e2e | "Scenario: Timer keeps running during a vote" passed (2/desktop+phone) |
| Remaining time from the deadline | unit | "Scenario: Remaining time from the deadline" passed (1) |
| Nomination rules enforced | unit | "Scenario: Nomination rules enforced" passed (1) |
| Unavailable choices show a reason | e2e | "Scenario: Unavailable choices show a reason" passed (2/desktop+phone) |
| Zurück cancels the nomination unused | e2e | "Scenario: Zurück cancels the nomination unused" passed (2/desktop+phone) |
| Clock points at the nominee | e2e | "Scenario: Clock points at the nominee" passed (2/desktop+phone) |
| Sweep order ends at the nominee | unit | "Scenario: Sweep order ends at the nominee" passed (1) |
| Sweep lasts 2.5 seconds per seat | unit | "Scenario: Sweep lasts 2.5 seconds per seat" passed (1) |
| Real short sweep marks votes | e2e | "Scenario: Real short sweep marks votes" passed (2/desktop+phone) |
| Dead without ghost vote cannot be marked | e2e | "Scenario: Dead without ghost vote cannot be marked" passed (2/desktop+phone) |
| Confirm corrects missed timing | e2e | "Scenario: Confirm corrects missed timing" passed (2/desktop+phone) |
| Dead voters spend their ghost vote | unit | "Scenario: Dead voters spend their ghost vote" passed (1) |
| Reduced motion hand jumps | e2e | "Scenario: Reduced motion hand jumps" passed (2/desktop+phone) |
| Vote result by threshold and high-water mark | unit | "Scenario: Vote result by threshold and high-water mark" passed (1) |
| Threshold uses living players at vote time | unit | "Scenario: Threshold uses living players at vote time" passed (1) |
| Block holder marked on the circle | e2e | "Scenario: Block holder marked on the circle" passed (2/desktop+phone) |
| Seat actions name no character | e2e | "Scenario: Seat actions name no character" passed (2/desktop+phone) |
| Immediate execution ends the day | unit | "Scenario: Immediate execution ends the day" passed (1) |
| Death by day runs the win check | unit | "Scenario: Death by day runs the win check" passed (1) |
| Corrections by day | unit | "Scenario: Corrections by day" passed (1) |
| Lebt doch takes back the Scarlet Woman question | unit | "Scenario: Lebt doch takes back the Scarlet Woman question" passed (1) |
| Tag beenden executes the block holder | e2e | "Scenario: Tag beenden executes the block holder" passed (2/desktop+phone) |
| No execution after a tie or without nominations | e2e | "Scenario: No execution after a tie or without nominations" passed (2/desktop+phone) |
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
| Public screen gives nothing away | e2e | "Scenario: Public screen gives nothing away" passed (2/desktop+phone) |
| Storyteller declares the winner at night | e2e | "Scenario: Storyteller declares the winner at night" passed (2/desktop+phone) |
| Teaser names no team | e2e | "Scenario: Teaser names no team" passed (2/desktop+phone) |
| Reveal shows the winning team and every seat | e2e | "Scenario: Reveal shows the winning team and every seat" passed (2/desktop+phone) |
| Reload on the teaser keeps it hidden | e2e | "Scenario: Reload on the teaser keeps it hidden" passed (2/desktop+phone) |
| Session cleared only on leaving | e2e | "Scenario: Session cleared only on leaving" passed (2/desktop+phone) |
| Winner for every ending | unit | "Scenario: Winner for every ending" passed (1) |
| Full Clocktower game | e2e | "Scenario: Full Clocktower game" passed (1/phone) |
| Deck navigation by tap, swipe and keys | e2e | "Scenario: Deck navigation by tap, swipe and keys" passed (2/desktop+phone) |
| Deck readable without horizontal scroll | e2e | "Scenario: Deck readable without horizontal scroll" passed (2/desktop+phone) |
| Deck closes to the start screen | e2e | "Scenario: Deck closes to the start screen" passed (2/desktop+phone) |
| Slide change animated, crossfade under reduced motion | e2e | "Scenario: Slide change animated, crossfade under reduced motion" passed (4/desktop+phone) |
| Deck carries the presentation's content | manual (content comparison by Rue at Gate 2) | shots/ and Gate 2 checklist |
| Role-count slide for every count | unit | "Scenario: Role-count slide for every count" passed (1) |
| Voting slide uses half the players | unit | "Scenario: Voting slide uses half the players" passed (1) |
| Official win wording in the deck | unit | "Scenario: Official win wording in the deck" passed (1) |
| Deck follows the chosen count | e2e | "Scenario: Deck follows the chosen count" passed (2/desktop+phone) |
| Deck explains the app | e2e | "Scenario: Deck explains the app" passed (2/desktop+phone) |
| App slides read clearly | manual (wording judgement by Rue at Gate 2) | shots/ and Gate 2 checklist |
| Sheet lists all characters | unit | "Scenario: Sheet lists all characters" passed (1) |
| Sheet fits one desktop viewport | e2e | "Scenario: Sheet fits one desktop viewport" passed (1/desktop) |
| Sheet on phone is two pages | e2e | "Scenario: Sheet on phone is two pages" passed (1/phone) |
| Credits slide names the sources | e2e | "Scenario: Credits slide names the sources" passed (2/desktop+phone) |
| Sheet in the look of the PDF | manual (visual judgement at Gate 2) | shots/ and Gate 2 checklist |
| Only the expected control is enabled | e2e | "Scenario: Only the expected control is enabled" passed (2/desktop+phone) |
| Hidden information shown with Demo tag | e2e | "Scenario: Hidden information shown with Demo tag" passed (2/desktop+phone) |
| Demo leaves real data untouched | e2e | "Scenario: Demo leaves real data untouched" passed (2/desktop+phone) |
| Exiting returns to the starting screen | e2e | "Scenario: Exiting returns to the starting screen" passed (2/desktop+phone) |
| Reload during demo returns to start screen | e2e | "Scenario: Reload during demo returns to start screen" passed (2/desktop+phone) |
| Demo steppable with reduced motion | e2e | "Scenario: Demo steppable with reduced motion" passed (2/desktop+phone) |
| Every demo covers its outcome branches over several rounds | unit | each named test in the proof line passed (("Scenario: Imposter demo covers every outcome branch", "Scenario: Wavelength demo covers every outcome branch", "Scenario: Feud demo covers every outcome branch", "Scenario: Codes demo covers every outcome branch", "Scenario: Duck demo covers every outcome branch", "Scenario: Most Likely demo covers every outcome branch")) |
| Demo tips read neutral | unit | each named test in the proof line passed (("Scenario: Imposter demo covers every outcome branch", "Scenario: Wavelength demo tips read neutral", "Scenario: Feud demo covers every outcome branch", "Scenario: Codes demo covers every outcome branch", "Scenario: Duck demo covers every outcome branch", "Scenario: Most Likely demo covers every outcome branch")) |
| Demo tips say why the step happens | manual (wording judgement by Rue at Gate 2) | shots/ and Gate 2 checklist |
| Long demo progress reads correctly | e2e | each named test in the proof line passed (("Scenario: Feud demo by tapping highlighted controls", "Scenario: Most Likely demo by tapping highlighted controls", "Scenario: Duck demo by tapping highlighted controls")) |
| Generic demo checks skip a game without a demo | unit | "Scenario: Generic demo checks skip a game without a demo" passed (1) |
| Game without a demo has no demo route | e2e | each named test in the proof line passed (("Scenario: Clocktower demo and Inhalte are not found")) |
| Text contrast meets 4.5:1 | e2e | "Scenario: Text contrast meets 4.5:1" passed (2/desktop+phone) |
| Look approved on screenshots | manual (visual judgement at Gate 2) | shots/ and Gate 2 checklist |
| Clocktower colour meets contrast | unit | "Scenario: Clocktower colour meets contrast" passed (1) |
| Other games keep the Arcade-Abend look | e2e | "Scenario: Other games keep the Arcade-Abend look" passed (2/desktop+phone) |
| Clocktower tokens meet contrast in both variants | unit | "Scenario: Clocktower tokens meet contrast in both variants" passed (1) |
| Theme only on Clocktower routes | e2e | "Scenario: Theme only on Clocktower routes" passed (2/desktop+phone) |
| No theme flash on reload | e2e | "Scenario: No theme flash on reload" passed (2/desktop+phone) |
| Clocktower fonts are self-hosted | e2e | "Scenario: Clocktower fonts are self-hosted" passed (2/desktop+phone) |
| Clocktower look rules on every screen | e2e | each named test in the proof line passed (("Scenario: Text contrast meets 4.5:1", "Scenario: Touch targets are at least 44px", "Scenario: No horizontal scroll on phone", "Scenario: Press Start 2P stays limited to logo and scores", "Scenario: Decoration loads no external assets")) |
| Day and night variants switch with an animation | e2e | "Scenario: Day and night variants switch with an animation" passed (2/desktop+phone) |
| Clocktower ambient motion off under reduced motion | e2e | "Scenario: Clocktower ambient motion off under reduced motion" passed (2/desktop+phone) |
| Clocktower gets its own motif | unit | "Scenario: Clocktower gets its own motif" passed (1) |
| Clocktower tile and start art | e2e | "Scenario: Clocktower tile and start art" passed (2/desktop+phone) |
| Clocktower look approved on screenshots | manual (visual judgement at Gate 2, on the verifier's screenshots) | shots/ and Gate 2 checklist |
| Home to Clocktower runs a view transition | e2e | "Scenario: Home to Clocktower runs a view transition" passed (2/desktop+phone) |
| Navigation without View Transitions | e2e | "Scenario: Navigation without View Transitions" passed (2/desktop+phone) |
| Reduced motion skips the view transition | e2e | "Scenario: Reduced motion skips the view transition" passed (2/desktop+phone) |
| Back button leaves Clocktower | e2e | "Scenario: Back button leaves Clocktower" passed (2/desktop+phone) |
| Transitions feel smooth | manual (motion feel is a visual judgement, at Gate 2) | shots/ and Gate 2 checklist |
| Reload mid-game resumes the same phase | e2e | "Scenario: Reload mid-game resumes the same phase" passed (2/desktop+phone) |
| Spiel beenden clears the session | e2e | "Scenario: Spiel beenden clears the session" passed (2/desktop+phone) |
| Old or corrupt saved state discarded | e2e | "Scenario: Old or corrupt saved state discarded" passed (2/desktop+phone) |
| Two tabs last write wins | unit | "Scenario: Two tabs last write wins" passed (1) |
| Roster edit mid-game keeps the session snapshot | unit | "Scenario: Roster edit mid-game keeps the session snapshot" passed (1) |
| Game without a demo checks its explicit template | unit | "Scenario: Game without a demo checks its explicit template" passed (1) |
| Round status per game | unit | "Scenario: Round status per game" passed (1) |
| Last round fills the progress line | unit | each named test in the proof line passed (("Scenario: Round status per game")) |
| Duck progress follows the leading score | unit | "Scenario: Duck progress follows the leading score" passed (1) |
| Status and progress in the header | e2e | "Scenario: Status and progress in the header" passed (2/desktop+phone) |
| Status without a total has no progress line | e2e | "Scenario: Status without a total has no progress line" passed (2/desktop+phone) |
| Header wraps on a phone | e2e | "Scenario: Header wraps on a phone" passed (1/phone) |
| Clocktower status per phase | unit | "Scenario: Clocktower status per phase" passed (1) |
| Game without content starts without a content fetch | e2e | "Scenario: Game without content starts without a content fetch" passed (2/desktop+phone) |
| Games with content keep their content gate | e2e | each named test in the proof line passed (("Scenario: Empty pool blocks start")) |
| Below minimum disables start | e2e | "Scenario: Below minimum disables start" passed (2/desktop+phone) |
| Above maximum asks who plays | e2e | "Scenario: Above maximum asks who plays" passed (2/desktop+phone) |
| Fewer than N offers adding players | e2e | "Scenario: Fewer than N offers adding players" passed (2/desktop+phone) |
| More than N picks exactly N | e2e | "Scenario: More than N picks exactly N" passed (2/desktop+phone) |
| Exactly N goes to the start | e2e | "Scenario: Exactly N goes to the start" passed (2/desktop+phone) |
| Count changed while in the lobby | e2e | "Scenario: Count changed while in the lobby" passed (2/desktop+phone) |
| Roster above the Clocktower maximum | e2e | "Scenario: Roster above the Clocktower maximum" passed (2/desktop+phone) |
| Clocktower effects obey mute and first interaction | unit | "Scenario: Clocktower effects obey mute and first interaction" passed (1) |
| Clocktower effects without WebAudio | unit | "Scenario: Clocktower effects without WebAudio" passed (1) |
| Clocktower sounds at the right moments | manual (audio judgement on a real device at Gate 2) | shots/ and Gate 2 checklist |

## Manual checklist (Gate 2)

1. `npm run dev` then open http://localhost:5173 and pick Blood on the Clocktower from the home tiles.
2. Look: check the gothic theme, day/night switch and tile art against `shots/phone-look-*` (Look approved, Clocktower look approved, Transitions feel smooth).
3. Sound: on a real device unmuted, play a night and a day and listen for the Clocktower sounds (Clocktower sounds at the right moments).
4. Deck: open the Erklärung deck, read the slides against the presentation (Deck carries the presentation's content) and read the app slides, incl. the changed deck-app-night slide (App slides read clearly).
5. Sheet: open the deck sheet slide and compare with the PDF look (Sheet in the look of the PDF).
6. Demo: run another game's demo and read the tips for the why (Demo tips say why the step happens).

## Diffstat (`git diff --stat origin/main...flow/blood-on-the-clocktower`)

```
 e2e/clocktower-day.test.ts                         | 514 ++++++++++++
 e2e/clocktower-deck.test.ts                        | 317 ++++++++
 e2e/clocktower-end.test.ts                         | 134 ++++
 e2e/clocktower-game.test.ts                        | 196 +++++
 e2e/clocktower-night.test.ts                       | 408 ++++++++++
 e2e/clocktower-session.test.ts                     |  47 ++
 e2e/clocktower-session.ts                          |  26 +
 e2e/clocktower-setup.test.ts                       | 443 +++++++++++
 e2e/clocktower-start.test.ts                       | 299 +++++++
 e2e/clocktower-theme.test.ts                       | 304 +++++++
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
 .../specs/clocktower/spec.md                       | 873 +++++++++++++++++++++
 .../blood-on-the-clocktower/specs/demo/spec.md     |  76 ++
 .../specs/design-system/spec.md                    | 136 ++++
 .../specs/game-engine/spec.md                      | 105 +++
 .../blood-on-the-clocktower/specs/roster/spec.md   |  44 ++
 .../blood-on-the-clocktower/specs/sound/spec.md    |  22 +
 openspec/changes/blood-on-the-clocktower/tasks.md  | 167 ++++
 .../blood-on-the-clocktower/verification.md        | 429 ++++++++++
 src/app.css                                        | 152 ++++
 src/app.html                                       |   6 +-
 src/hooks.server.ts                                |  28 +-
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
 src/lib/games/clocktower/engine.ts                 | 402 ++++++++++
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
 src/lib/games/clocktower/win.test.ts               | 224 ++++++
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
 125 files changed, 14614 insertions(+), 68 deletions(-)
```

## Screenshots (not committed)

Phase set copied from this run to /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/ (phone- and desktop- prefixes, `look-` names; `desktop-look-clocktower-deck-sheet-boese.png` does not exist, the boese sheet is phone-only):
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/desktop-look-clocktower-card-pair.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/desktop-look-clocktower-circle-pair.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/desktop-look-clocktower-clock-7.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/desktop-look-clocktower-dawn-7.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/desktop-look-clocktower-dawn-deaths-7.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/desktop-look-clocktower-deaths.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/desktop-look-clocktower-deck-app-night.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/desktop-look-clocktower-deck-app-vote.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/desktop-look-clocktower-deck-sheet.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/desktop-look-clocktower-deck-title.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/desktop-look-clocktower-dusk.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/desktop-look-clocktower-end-reveal-evil.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/desktop-look-clocktower-end-teaser-evil.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/desktop-look-clocktower-end-teaser-good.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/desktop-look-clocktower-execution-7.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/desktop-look-clocktower-grimoire-7.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/desktop-look-clocktower-reveal-7-card.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/desktop-look-clocktower-reveal-7-name.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/desktop-look-clocktower-setup-7-complete.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/desktop-look-clocktower-setup-7-empty.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/desktop-look-clocktower-show-du-bist.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/desktop-look-clocktower-wake-pair.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/desktop-look-lobby-clocktower-pick.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/desktop-look-lobby-clocktower.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/desktop-look-start-clocktower.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/phone-look-clocktower-card-pair.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/phone-look-clocktower-circle-pair.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/phone-look-clocktower-clock-7.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/phone-look-clocktower-dawn-7.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/phone-look-clocktower-dawn-deaths-7.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/phone-look-clocktower-deaths.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/phone-look-clocktower-deck-app-night.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/phone-look-clocktower-deck-app-vote.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/phone-look-clocktower-deck-sheet-boese.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/phone-look-clocktower-deck-sheet.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/phone-look-clocktower-deck-title.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/phone-look-clocktower-dusk.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/phone-look-clocktower-end-reveal-evil.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/phone-look-clocktower-end-teaser-evil.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/phone-look-clocktower-end-teaser-good.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/phone-look-clocktower-execution-7.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/phone-look-clocktower-grimoire-7.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/phone-look-clocktower-reveal-7-card.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/phone-look-clocktower-reveal-7-name.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/phone-look-clocktower-setup-7-complete.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/phone-look-clocktower-setup-7-empty.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/phone-look-clocktower-show-du-bist.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/phone-look-clocktower-wake-pair.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/phone-look-lobby-clocktower-pick.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/phone-look-lobby-clocktower.png
- /tmp/claude-1001/-home-Rue-Repos-Rues-Arcade/913b500e-2f4d-45c3-84e8-6936fe13c65c/scratchpad/shots/phone-look-start-clocktower.png
