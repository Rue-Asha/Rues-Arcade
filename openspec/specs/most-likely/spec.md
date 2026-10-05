# most-likely Specification

## Purpose
TBD - created by archiving change add-three-games. Update Purpose after archive.
## Requirements
### Requirement: Most Likely To setup
Most Likely To SHALL take 3–20 players from the roster and 5, 10, 15 or 20 rounds, default 10.

#### Scenario: Most Likely lobby offers rounds
- **WHEN** the Most Likely To lobby is opened with 3 chosen players
- **THEN** the rounds offer 5, 10, 15 and 20 with 10 selected, and "Los geht's" is enabled
- **proof:** e2e

#### Scenario: Most Likely needs three players
- **WHEN** the roster has 2 players and the Most Likely To start screen is opened
- **THEN** "Los geht's" is disabled and "mind. 3 Spieler" is shown
- **proof:** e2e

#### Scenario: Most Likely roster above maximum asks who plays
- **WHEN** the roster has 21 players and the Most Likely To lobby is opened
- **THEN** "Wer spielt mit?" is shown with "höchstens 20", and "Weiter" is enabled only once 3–20 players are chosen
- **proof:** e2e

### Requirement: Most Likely prompt
Each round SHALL show one prompt ("Wer würde am ehesten …?") drawn without repeats until the pool is used, then
reshuffled. "Anderer Spruch" SHALL swap it for a different prompt and put the rejected prompt back into the pool.

#### Scenario: Most Likely prompts do not repeat until the pool is used
- **WHEN** rounds are played on a pool of 3 prompts
- **THEN** the first 3 rounds use 3 different prompts and round 4 draws again from all 3
- **proof:** unit

#### Scenario: Anderer Spruch returns the rejected prompt
- **WHEN** on a pool of 3 prompts the first prompt is swapped with "Anderer Spruch" and 3 more rounds are played
- **THEN** the new prompt differs from the rejected one, the rejected prompt is not marked used, and it is shown again before the pool is reshuffled
- **proof:** unit

### Requirement: Most Likely pick and reveal
The prompt screen SHALL tell everyone to point at the person who fits on 3. The reader SHALL then tap the player(s)
most pointed at, one or more for a tie, and confirm; confirming SHALL need at least one chosen player. The reveal
SHALL show the prompt with the chosen player(s) as title holder(s), and each SHALL get +1 title.

#### Scenario: Confirm needs at least one player
- **WHEN** the pick screen is shown with no player chosen, then one is tapped, then tapped again
- **THEN** the confirm button is disabled, then enabled, then disabled again
- **proof:** e2e

#### Scenario: Tied pick gives every chosen player a title
- **WHEN** Alex and Cleo are chosen and confirmed
- **THEN** the reveal shows the prompt with Alex and Cleo as title holders, and both titles rise by 1 while the others stay
- **proof:** unit

#### Scenario: Full Most Likely To game
- **WHEN** 3 players play 5 rounds, choosing one player per round, a tie in the last round
- **THEN** each round shows a prompt, the pick and the reveal, and after round 5 the Endstand shows the ranking by titles
- **proof:** e2e

### Requirement: Most Likely Endstand
After the last round the Endstand SHALL rank players by titles, highlight the top holder(s), show "Unentschieden"
when several share the top, and offer a rematch with the same players.

#### Scenario: Most Likely tie at the top reads Unentschieden
- **WHEN** the game ends with titles 3, 3, 1
- **THEN** the Endstand shows "Unentschieden" with both top players highlighted and the third ranked below
- **proof:** e2e

#### Scenario: Most Likely rematch keeps the players
- **WHEN** the rematch is started from the Endstand
- **THEN** a new game starts with the same players and rounds, all titles 0 and round 1
- **proof:** unit

### Requirement: Most Likely engine, session and demo
Most Likely To SHALL be a pure reducer with its RNG in the state, save after every action and resume on reload;
"Spiel beenden" SHALL ask for confirmation in the arcade Modal. It SHALL ship a committed demo fixture with Alex, Bo,
Cleo and Dani playing one round to "Demo beendet", gated like the existing demos. Sound SHALL use the existing cues:
press on controls, reveal on the reveal, win at the Endstand.

#### Scenario: Most Likely engine is deterministic and pure
- **WHEN** Most Likely To is initialised twice with the same players, config, content and seed, given the same actions, and an action is applied to a frozen state
- **THEN** both runs end deeply equal and the frozen state is not mutated
- **proof:** unit

#### Scenario: Most Likely session resumes after reload
- **WHEN** a Most Likely To game is on the pick screen of round 2 with one player chosen and the page is reloaded
- **THEN** round 2 with the same prompt and titles is shown, with no discarded-state notice
- **proof:** e2e

#### Scenario: Leaving Most Likely asks for confirmation
- **WHEN** "Spiel beenden" is tapped during a Most Likely To game and the Modal is dismissed with "Weiterspielen"
- **THEN** the Modal "Spiel beenden?" was shown and the game continues in the same phase
- **proof:** e2e

#### Scenario: Most Likely demo script plays to the end
- **WHEN** the Most Likely To demo script's actions are applied to its fixture through the real reducer, twice
- **THEN** both runs reach the end state with identical states at every step
- **proof:** unit

#### Scenario: Most Likely demo by tapping highlighted controls
- **WHEN** on a server with an empty database the user opens Most Likely To's Demo and taps only the highlighted control at each step
- **THEN** the round completes and "Demo beendet" is shown
- **proof:** e2e

#### Scenario: Most Likely cues sound right
- **WHEN** Rue plays a Most Likely To round with sound on
- **THEN** the reveal plays reveal and the Endstand plays win
- **proof:** manual (audio judgement on a real device at Gate 2)

### Requirement: Most Likely look and copy
Most Likely To SHALL have its own colour token, tile badge, tile and start-banner art (motif `most-likely`), the
shared crew and rings art in lobby and play, and all its screens SHALL pass the arcade look rules. Its copy SHALL be
neutral German with no "!" and no emoji.

#### Scenario: Most Likely art on tile and start screen
- **WHEN** Home and the Most Likely To start screen are opened
- **THEN** the tile and start banner each hold `data-motif="most-likely"` art with at least one drawn shape, in `--most-likely` colours, aria-hidden and without pointer events
- **proof:** e2e

#### Scenario: Most Likely screens meet the look rules
- **WHEN** the look walk renders the Most Likely To start, lobby, prompt, pick, reveal and Endstand screens
- **THEN** text contrast is at least 4.5:1, touch targets are at least 44px and no screen scrolls horizontally at 390px
- **proof:** e2e ("Scenario: Text contrast meets 4.5:1", "Scenario: Touch targets are at least 44px", "Scenario: No horizontal scroll on phone")

#### Scenario: Most Likely copy reads neutral
- **WHEN** a full Most Likely To game is played and every visible text is collected
- **THEN** none contains "!" or an emoji
- **proof:** e2e

