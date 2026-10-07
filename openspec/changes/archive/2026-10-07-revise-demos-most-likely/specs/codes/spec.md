## MODIFIED Requirements

### Requirement: Codes engine, session and demo
Codes SHALL be a pure reducer with its RNG in the state (game-engine), save after every action and resume on
reload; "Spiel beenden" SHALL ask for confirmation in the arcade Modal. It SHALL ship one committed demo script
(content, seed, scripted actions) with Alex, Bo, Cleo and Dani in 2 teams playing 4 rounds to the Endstand and
"Demo beendet", gated like the existing demos. The script SHALL reach every branch of the Codes reducer: "Anderes
Wort", a word guessed on the first try (3 points), a miss then a guess by the other team (2 points), both teams
missing and the word guessed on the third try (1 point), three misses and "Überspringen" (0 points), the next
round opening with the next team and explainer, the Endstand with a winner, and "Nochmal spielen". Sound SHALL use
the existing cues: press on controls, reveal when the word is shown, correct on "Erraten", wrong on "Daneben", win
at the Endstand.

#### Scenario: Codes engine is deterministic and pure
- **WHEN** Codes is initialised twice with the same players, config, content and seed, given the same actions, and an action is applied to a frozen state
- **THEN** both runs end deeply equal and the frozen state is not mutated
- **proof:** unit

#### Scenario: Codes session resumes after reload
- **WHEN** a Codes game is in Spiel after one "Daneben" and the page is reloaded
- **THEN** the same team, attempt and point value are shown, with no discarded-state notice
- **proof:** e2e

#### Scenario: Leaving Codes asks for confirmation
- **WHEN** "Spiel beenden" is tapped during a Codes game and the Modal is dismissed with "Weiterspielen"
- **THEN** the Modal "Spiel beenden?" was shown and the game continues in the same phase
- **proof:** e2e

#### Scenario: Codes demo script plays to the end
- **WHEN** the Codes demo script's actions are applied to its fixture through the real reducer, twice
- **THEN** both runs reach the end state with identical states at every step, and every step changes the state
- **proof:** unit

#### Scenario: Codes demo scores 3, 2 and 1 and skips once
- **WHEN** the demo's rounds are walked
- **THEN** one word is guessed at attempt 0 for 3 points, one after one miss by the other team for 2 points, one after both teams missed for 1 point, and one ends with "Überspringen" after three misses for 0 points
- **proof:** unit ("Scenario: Codes demo covers every outcome branch")

#### Scenario: Codes demo redraws a word
- **WHEN** the demo reaches its `redraw` step
- **THEN** the word changes before the round starts, and the round's team and explainers stay the same
- **proof:** unit ("Scenario: Codes demo covers every outcome branch")

#### Scenario: Codes demo rotates opener and explainer
- **WHEN** the demo's states are walked
- **THEN** each new round opens with the next team and each team's explainer moves to its next player
- **proof:** unit ("Scenario: Codes demo covers every outcome branch")

#### Scenario: Codes demo ends with a winner and plays again
- **WHEN** the demo's last round is closed
- **THEN** the Endstand shows one winning team, and the final step taps "Nochmal spielen", which starts a new game with all scores 0; no tip contains "!" or an emoji
- **proof:** unit ("Scenario: Codes demo covers every outcome branch")

#### Scenario: Codes demo by tapping highlighted controls
- **WHEN** on a server with an empty database the user opens Codes' Demo and taps only the highlighted control at each step
- **THEN** exactly one control is highlighted at each step, the 4 rounds and the Endstand complete, "Demo beendet" is shown, and the word is shown with the [Demo] tag without holding
- **proof:** e2e

#### Scenario: Codes cues sound right
- **WHEN** Rue plays a Codes round with sound on
- **THEN** "Erraten" plays correct, "Daneben" plays wrong and the Endstand plays win
- **proof:** manual (audio judgement on a real device at Gate 2)
