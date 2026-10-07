# most-likely Specification

## Purpose
TBD - created by archiving change add-three-games. Update Purpose after archive.
## Requirements
### Requirement: Most Likely To setup
Most Likely To SHALL take 4–20 players from the roster and 5, 10, 15 or 20 rounds, default 10. Fewer than 4
players SHALL block the start like every game; more than 20 SHALL ask who plays like every game.

#### Scenario: Most Likely lobby offers rounds
- **WHEN** the Most Likely To lobby is opened with 4 chosen players
- **THEN** the rounds offer 5, 10, 15 and 20 with 10 selected, two teams of two are dealt, and "Los geht's" is enabled
- **proof:** e2e

#### Scenario: Most Likely needs four players
- **WHEN** the roster has 3 players and the Most Likely To start screen is opened
- **THEN** "Los geht's" is disabled and "mind. 4 Spieler" is shown
- **proof:** e2e

#### Scenario: Most Likely roster above maximum asks who plays
- **WHEN** the roster has 21 players and the Most Likely To lobby is opened
- **THEN** "Wer spielt mit?" is shown with "höchstens 20", and "Weiter" is enabled only once 4–20 players are chosen
- **proof:** e2e

### Requirement: Most Likely prompt
Each turn SHALL show one prompt ("Wer würde am ehesten …?") drawn without repeats until the pool is used, then
reshuffled. "Anderer Spruch" SHALL swap it for a different prompt and put the rejected prompt back into the pool. With
a pool of one prompt the prompt SHALL stay the same and "Anderer Spruch" SHALL be disabled. An empty pool SHALL be
caught by the existing content gate on the start screen.

#### Scenario: Most Likely prompts do not repeat until the pool is used
- **WHEN** turns are played on a pool of 3 prompts
- **THEN** the first 3 turns use 3 different prompts and turn 4 draws again from all 3
- **proof:** unit

#### Scenario: Anderer Spruch returns the rejected prompt
- **WHEN** on a pool of 3 prompts the first prompt is swapped with "Anderer Spruch" and 3 more turns are played
- **THEN** the new prompt differs from the rejected one, the rejected prompt is not marked used, and it is shown again before the pool is reshuffled
- **proof:** unit

#### Scenario: Most Likely pool of one keeps its prompt
- **WHEN** the pool holds one prompt and `redraw` is dispatched
- **THEN** the prompt is unchanged
- **proof:** unit

### Requirement: Most Likely Endstand
After the last turn of the last round the Endstand SHALL rank the teams by score with their players, highlight the
top team(s), show "Unentschieden" with every tied team when several share the top, and offer "Nochmal spielen".
"Nochmal spielen" SHALL keep the teams and rounds, reset the scores to 0, start at round 1 and draw a new opener.

#### Scenario: Most Likely Endstand ranks teams
- **WHEN** a game with 3 teams ends with scores 5, 9, 2
- **THEN** the Endstand lists Team 2 (9), Team 1 (5), Team 3 (2) in that order, names Team 2 as winner and shows each team's players
- **proof:** e2e

#### Scenario: Most Likely tie at the top reads Unentschieden
- **WHEN** a game ends with team scores 4, 4, 2
- **THEN** the Endstand shows "Unentschieden" with both top teams highlighted and the third ranked below
- **proof:** e2e

#### Scenario: Most Likely rematch keeps the teams
- **WHEN** the rematch is started from the Endstand
- **THEN** a new game starts with the same teams, players and rounds, all scores 0, round 1, and the opener drawn from the RNG
- **proof:** unit

### Requirement: Most Likely engine, session and demo
Most Likely To SHALL be a pure reducer with its RNG in the state, save after every action and resume on reload;
"Spiel beenden" SHALL ask for confirmation in the arcade Modal. Its `stateVersion` SHALL be 2, so a session saved in
the old individual-titles shape is discarded with the existing notice. It SHALL ship one committed demo script with
Alex, Bo, Cleo and Dani as two teams of two (Alex & Bo, Cleo & Dani) playing 5 rounds through every outcome branch
to "Demo beendet", gated like the existing demos. Sound SHALL use the existing cues: press on controls, reveal on
the result, win at the Endstand.

#### Scenario: Most Likely engine is deterministic and pure
- **WHEN** Most Likely To is initialised twice with the same players, config, content and seed, given the same actions, and an action is applied to a frozen state
- **THEN** both runs end deeply equal and the frozen state is not mutated
- **proof:** unit

#### Scenario: Most Likely session resumes after reload
- **WHEN** a Most Likely To game is on the count screen of round 2 and the page is reloaded
- **THEN** the same team, round, prompt and scores are shown on the count screen, with no discarded-state notice
- **proof:** e2e

#### Scenario: Old Most Likely session is discarded
- **WHEN** a version-1 Most Likely To session (individual titles) is stored and the start screen is opened
- **THEN** the notice "Der gespeicherte Spielstand passte nicht mehr zu dieser Version und wurde verworfen." is shown and no "Weiterspielen" is offered
- **proof:** e2e

#### Scenario: Leaving Most Likely asks for confirmation
- **WHEN** "Spiel beenden" is tapped during a Most Likely To game and the Modal is dismissed with "Weiterspielen"
- **THEN** the Modal "Spiel beenden?" was shown and the game continues in the same phase
- **proof:** e2e

#### Scenario: Most Likely demo script plays to the end
- **WHEN** the Most Likely To demo script's actions are applied to its fixture through the real reducer, twice
- **THEN** both runs reach the end state with identical states at every step, and every step changes the state
- **proof:** unit

#### Scenario: Most Likely demo plays two teams of two
- **WHEN** the Most Likely To demo script is started through the real engine
- **THEN** its opening state has two teams, Alex & Bo and Cleo & Dani, 5 rounds and all scores 0
- **proof:** unit ("Scenario: Most Likely demo covers every outcome branch")

#### Scenario: Most Likely demo full match
- **WHEN** the demo reaches a count step where both members of a team pointed at the same person
- **THEN** the scripted `score` is 2 and that team's score rises by 2
- **proof:** unit ("Scenario: Most Likely demo covers every outcome branch")

#### Scenario: Most Likely demo no match
- **WHEN** the demo reaches a count step where the members pointed at different people
- **THEN** the scripted `score` is 0 ("Alle verschieden") and no score changes
- **proof:** unit ("Scenario: Most Likely demo covers every outcome branch")

#### Scenario: Most Likely demo redraw
- **WHEN** the demo reaches its `redraw` step on a turn's prompt
- **THEN** the prompt changes and the turn's team stays the same
- **proof:** unit ("Scenario: Most Likely demo covers every outcome branch")

#### Scenario: Most Likely demo rounds and opener rotation
- **WHEN** the demo's states are walked
- **THEN** each round gives both teams one turn, the opener of round 2 is the team that went second in round 1, and all 5 rounds are played
- **proof:** unit ("Scenario: Most Likely demo covers every outcome branch")

#### Scenario: Most Likely demo game over and rematch
- **WHEN** the demo's last turn is resolved
- **THEN** the game reaches the Endstand with one winning team, and the final step taps "Nochmal spielen", which starts a new game with the same teams and scores 0
- **proof:** unit ("Scenario: Most Likely demo covers every outcome branch")

#### Scenario: Most Likely demo names what two teams of two cannot show
- **WHEN** the demo's tips are read
- **THEN** one tip names the partial match of larger teams (for example 2 of 3 score 2) and one names the "Unentschieden" ending, and no tip contains "!" or an emoji
- **proof:** unit ("Scenario: Most Likely demo covers every outcome branch")

#### Scenario: Most Likely demo by tapping highlighted controls
- **WHEN** on a server with an empty database the user opens Most Likely To's Demo and taps only the highlighted control at each step
- **THEN** exactly one control is highlighted at each step, including the count choice the script names, the 5 rounds and the Endstand complete, and "Demo beendet" is shown
- **proof:** e2e

#### Scenario: Most Likely cues sound right
- **WHEN** Rue plays a Most Likely To turn with sound on
- **THEN** the result plays reveal and the Endstand plays win
- **proof:** manual (audio judgement on a real device at Gate 2)

### Requirement: Most Likely look and copy
Most Likely To SHALL have its own colour token, tile badge, tile and start-banner art (motif `most-likely`), the
shared crew and rings art in lobby and play, and all its screens SHALL pass the arcade look rules. Its copy SHALL be
neutral German with no "!" and no emoji. Its pitch SHALL read "Ein Spruch, alle zeigen auf eine Person, und ein
Team punktet, wenn es sich einig ist." Names SHALL be shown as entered, umlauts included.

#### Scenario: Most Likely art on tile and start screen
- **WHEN** Home and the Most Likely To start screen are opened
- **THEN** the tile and start banner each hold `data-motif="most-likely"` art with at least one drawn shape, in `--most-likely` colours, aria-hidden and without pointer events
- **proof:** e2e

#### Scenario: Most Likely screens meet the look rules
- **WHEN** the look walk renders the Most Likely To start, lobby with teams, turn, count, result and Endstand screens at phone and desktop sizes
- **THEN** text contrast is at least 4.5:1, touch targets are at least 44px and no screen scrolls horizontally at 390px
- **proof:** e2e ("Scenario: Text contrast meets 4.5:1", "Scenario: Touch targets are at least 44px", "Scenario: No horizontal scroll on phone")

#### Scenario: Most Likely copy reads neutral
- **WHEN** a full Most Likely To team game is played and every visible text is collected
- **THEN** none contains "!" or an emoji
- **proof:** e2e

### Requirement: Most Likely teams
The lobby SHALL deal the chosen players into teams named "Team 1" … "Team n", as evenly as possible (sizes differ
by at most 1), default 2 teams. A −/+ stepper SHALL set the team count from 2 to min(8, floor(players / 2)) and
deal again; tapping a player chip SHALL move that player to the next team (wrapping); "Mischen" SHALL deal the
players again in a random order with the same count. Every team SHALL need at least 2 players: otherwise "Los geht's"
is disabled and a `role="alert"` hint says which team is too small. Team sizes differing by more than 1 SHALL show a
neutral hint and still allow the start.

#### Scenario: Most Likely deals teams evenly
- **WHEN** 7 player ids are dealt into 3 teams
- **THEN** the teams hold 3, 2 and 2 players, every player is in exactly one team, and player i sits in team i mod 3
- **proof:** unit

#### Scenario: Most Likely team stepper is bounded by the players
- **WHEN** the Most Likely To lobby is opened with 5, then 16, then 20 chosen players
- **THEN** the team count starts at 2, "Weniger Teams" is disabled at 2, and "Mehr Teams" is disabled at 2, 8 and 8 teams respectively
- **proof:** e2e

#### Scenario: Most Likely chip moves a player to the next team
- **WHEN** with 6 players in 2 teams the chip of a Team 1 player is tapped
- **THEN** that player is listed in Team 2, Team 1 has 2 and Team 2 has 4 players, the uneven-teams hint is shown and "Los geht's" stays enabled
- **proof:** e2e

#### Scenario: Most Likely team of one blocks the start
- **WHEN** with 4 players in 2 teams a Team 1 chip is tapped so Team 1 holds one player
- **THEN** "Los geht's" is disabled and a `role="alert"` hint names Team 1 as needing at least 2 players
- **proof:** e2e

#### Scenario: Most Likely shuffle keeps the team sizes
- **WHEN** with 7 players in 3 teams "Mischen" is tapped
- **THEN** the teams still hold 3, 2 and 2 players and every player is in exactly one team
- **proof:** e2e

#### Scenario: Most Likely shows umlaut names as entered
- **WHEN** the roster holds "Jörg", "Ümit", "Bo" and "Cleo" and the Most Likely To lobby and a turn are shown
- **THEN** the team chips and the turn's player names read "Jörg" and "Ümit" exactly
- **proof:** e2e

### Requirement: Most Likely turns
At game start the opening team SHALL be drawn from the RNG. Round r SHALL open with team (opener + r) mod n and the
other teams SHALL follow in team order, one turn each (archive rule). Each turn SHALL show "<Team> ist dran", the
team's player names, the prompt, "Runde r / R", the team's position in the round ("Team k / n"), and the hint that the
team members count to three and point at the same moment at the person who fits best. "Alle haben gezeigt" SHALL
open the count.

#### Scenario: Most Likely opener comes from the RNG
- **WHEN** Most Likely To is initialised with 3 teams under several seeds
- **THEN** the opening team is the one the seeded RNG draws, and at least two seeds give different openers
- **proof:** unit

#### Scenario: Most Likely opener rotates each round
- **WHEN** a game with 3 teams opens with Team 2 and two full rounds are played
- **THEN** round 1 plays Team 2, Team 3, Team 1 and round 2 plays Team 3, Team 1, Team 2
- **proof:** unit

#### Scenario: Most Likely turn screen names the team
- **WHEN** a Most Likely To game with teams Alex & Bo and Cleo & Dani starts
- **THEN** the turn shows "<opening team> ist dran", that team's player names, the prompt, "Runde 1 / 5", "Team 1 / 2" and the hint "Zählt bis drei und zeigt gleichzeitig auf die Person, die am besten passt."
- **proof:** e2e

### Requirement: Most Likely scoring
After "Alle haben gezeigt" the device SHALL ask how many team members pointed at the same person (the largest
group) and offer "Alle verschieden" (0) and every number from 2 to the team's size. The team SHALL score that number
(2 people match → 2 points, nobody matches → 0). Any other count SHALL be ignored. The device SHALL track only the
team order, the current turn and the team scores, never who pointed at whom. The result SHALL show the points and
the prompt; its button SHALL read "Nächstes Team", "Nächste Runde" on the last turn of a round, and "Zum Ergebnis"
on the last turn of the game.

#### Scenario: Most Likely count choices follow the team size
- **WHEN** the count screen is shown for a team of 2 and later for a team of 3
- **THEN** the choices are "Alle verschieden" and "2", then "Alle verschieden", "2" and "3"
- **proof:** e2e

#### Scenario: Most Likely team scores its largest group
- **WHEN** a team of 3 at score 1 records 3, and another team at score 0 records "Alle verschieden"
- **THEN** the first team's score is 4 and the second's stays 0, and the result phase holds 3 and 0 as the turn's points
- **proof:** unit

#### Scenario: Most Likely ignores impossible counts
- **WHEN** a team of 3 is on the count screen and `score` is dispatched with 1, then with 4
- **THEN** the state is unchanged both times
- **proof:** unit

#### Scenario: Most Likely keeps no record of who pointed at whom
- **WHEN** a full game is played to the Endstand
- **THEN** no state along the way holds a player index or id beyond the team rosters, only team scores, order, round, turn, prompt and phase
- **proof:** unit

#### Scenario: Most Likely result names the next step
- **WHEN** a game with 2 teams and 5 rounds is played turn by turn
- **THEN** the first turn's result shows the prompt, its points and "Nächstes Team", the second turn's "Nächste Runde", and the last turn of round 5 "Zum Ergebnis"
- **proof:** e2e

#### Scenario: Full Most Likely team game
- **WHEN** 4 players in 2 teams play 5 rounds, recording 2 and "Alle verschieden" in turn
- **THEN** each turn shows the team, prompt, count and result, and after round 5 the Endstand ranks both teams by score
- **proof:** e2e

