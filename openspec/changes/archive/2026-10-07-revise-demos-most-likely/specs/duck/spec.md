## MODIFIED Requirements

### Requirement: Duck engine, session and demo
Duck SHALL be a pure reducer with its RNG in the state, save after every action and resume on reload; "Spiel
beenden" SHALL ask for confirmation in the arcade Modal. It SHALL ship one committed demo script with Alex, Bo, Cleo
and Dani playing several words with Zielpunkte 10 to Spielende and "Demo beendet", gated like the existing demos.
The script SHALL reach every branch of the Duck reducer: "Überspringen" on a word, a word nobody scores on, a word
with exactly one match (3 points each, +2 for matching Chuck's holder), a word where several players share a rhyme (1 point
each), letters lost on missing rhymes word after word until one player loses the last letter, Chuck moving after
each played word, and a final word where one player reaches 10 while another loses the last letter, so Spielende
gives the reason "target reached"; a tip SHALL name the game end by lost lives alone. The last step SHALL tap
"Neue Runde". Sound SHALL use the existing cues: press on controls, reveal on "Wort aufdecken", wrong when a letter
is crossed, correct on "Weiter" when points were added, win at Spielende.

#### Scenario: Duck engine is deterministic and pure
- **WHEN** Duck is initialised twice with the same players, config, content and seed, given the same actions, and an action is applied to a frozen state
- **THEN** both runs end deeply equal and the frozen state is not mutated
- **proof:** unit

#### Scenario: Duck session resumes after reload
- **WHEN** a Duck game is in Wertung with one box tapped and the page is reloaded
- **THEN** Wertung shows the same scores, lives and Chuck holder, with no discarded-state notice
- **proof:** e2e

#### Scenario: Leaving Duck asks for confirmation
- **WHEN** "Spiel beenden" is tapped during a Duck game and the Modal is dismissed with "Weiterspielen"
- **THEN** the Modal "Spiel beenden?" was shown and the game continues in the same phase
- **proof:** e2e

#### Scenario: Duck demo script plays to the end
- **WHEN** the Duck demo script's actions are applied to its fixture through the real reducer, twice
- **THEN** both runs reach the end state with identical states at every step, and every step changes the state
- **proof:** unit

#### Scenario: Duck demo skips a word
- **WHEN** the demo reaches its `skip` step
- **THEN** a different word is drawn and Chuck's holder is unchanged
- **proof:** unit ("Scenario: Duck demo covers every outcome branch")

#### Scenario: Duck demo scores none, one match and a multi-match
- **WHEN** the demo's committed words are walked
- **THEN** one word adds no points to anyone, one gives exactly two matching players 3 points each, with 2 extra for the player who matched Chuck's holder, and one adds 1 to each of three or more players sharing a rhyme
- **proof:** unit ("Scenario: Duck demo covers every outcome branch")

#### Scenario: Duck demo loses letters to elimination
- **WHEN** the demo's states are walked
- **THEN** one player's lives fall over several words from 5 to 0, at most one letter per word, and Chuck moves to the next player after each played word that does not end the game
- **proof:** unit ("Scenario: Duck demo covers every outcome branch")

#### Scenario: Duck demo ends at target with an elimination
- **WHEN** the demo's final word is committed
- **THEN** one player is at 10 points and another at 0 lives, the game ends with reason "target", and a tip names the end by lost lives alone
- **proof:** unit ("Scenario: Duck demo covers every outcome branch")

#### Scenario: Duck demo plays a new round
- **WHEN** the demo's last step is applied
- **THEN** it is "Neue Runde": a new game starts with the same players, all scores 0 and five letters each; no tip contains "!" or an emoji
- **proof:** unit ("Scenario: Duck demo covers every outcome branch")

#### Scenario: Duck demo by tapping highlighted controls
- **WHEN** on a server with an empty database the user opens Duck's Demo and taps only the highlighted control at each step, including the skip
- **THEN** exactly one control is highlighted at each step, the words are played and scored through Spielende, and "Demo beendet" is shown
- **proof:** e2e

#### Scenario: Duck cues sound right
- **WHEN** Rue plays a Duck word with sound on
- **THEN** "Wort aufdecken" plays reveal, crossing a letter plays wrong and Spielende plays win
- **proof:** manual (audio judgement on a real device at Gate 2)
