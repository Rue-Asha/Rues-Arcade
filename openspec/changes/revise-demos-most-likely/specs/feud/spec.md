## MODIFIED Requirements

### Requirement: Family Feud demo
Family Feud SHALL ship one committed demo script (surveys, tiebreak survey, seed, scripted actions) with Alex and Bo
against Cleo and Dani playing several rounds to the Gewinner screen and "Demo beendet". It SHALL reach every branch
of the Feud reducer that a normal game reaches: in the face-off a first answer that misses the board, both answers
missing (next pair), a number-one answer that wins at once, and two hits where the higher one wins; "Spielen" and
"Passen"; a board revealed completely; three strikes leading to a steal that succeeds and one that fails; the last
round counting double; and, because a tie after the last round is a normal outcome, sudden death on the tiebreak
survey. "Rückgängig" is a correction, not an outcome, and SHALL be named in a tip; the engine has no rematch. Hidden
survey information SHALL be shown openly with the [Demo] tag. The demo SHALL never touch the database, the roster
or the played-with history, and SHALL run on an empty database and under reduced motion. The demo SHALL go from the
third strike straight to the steal board, without the steal's full-screen handoff, because the handoff's "Weiter"
has no scripted control. In the demo, "Nicht auf der Tafel" SHALL be the highlighted control when the scripted
face-off answer or steal is a miss.

#### Scenario: Feud demo script plays to the end
- **WHEN** the Family Feud demo script's actions are applied to its fixture through the real reducer, twice
- **THEN** both runs reach the game over with identical states at every step, and every step changes the state
- **proof:** unit

#### Scenario: Feud demo face-off branches
- **WHEN** the demo's face-off steps are walked
- **THEN** one face-off opens with a miss and the second answer wins it, one has both answers miss and the next pair answers, one is won at once by the number-one answer, and one is won by the higher of two hits
- **proof:** unit ("Scenario: Feud demo covers every outcome branch")

#### Scenario: Feud demo plays and passes
- **WHEN** the demo's choose steps are walked
- **THEN** at least one is `play` (the face-off winner plays) and one is `pass` (the other team plays)
- **proof:** unit ("Scenario: Feud demo covers every outcome branch")

#### Scenario: Feud demo clears a board
- **WHEN** the demo's states are walked
- **THEN** in one round every answer on the board gets revealed and the playing team banks the pot without a steal
- **proof:** unit ("Scenario: Feud demo covers every outcome branch")

#### Scenario: Feud demo steals once and misses once
- **WHEN** the demo's steal steps are applied
- **THEN** each follows a third strike; one hits a hidden answer and the stealing team takes the pot (`stolen`), the other is a miss and the playing team keeps the pot
- **proof:** unit ("Scenario: Feud demo covers every outcome branch")

#### Scenario: Feud demo last round counts double
- **WHEN** the demo's last regular round is banked
- **THEN** the banked points are the pot × 2
- **proof:** unit ("Scenario: Feud demo covers every outcome branch")

#### Scenario: Feud demo ends in sudden death
- **WHEN** the last regular round closes
- **THEN** the scores are tied, the tiebreak survey is played as a face-off, its winner wins the game, and the end state is the game over with that winner
- **proof:** unit ("Scenario: Feud demo covers every outcome branch")

#### Scenario: Feud demo names undo
- **WHEN** the demo's tips are read
- **THEN** one tip names "Rückgängig", and no tip contains "!" or an emoji
- **proof:** unit ("Scenario: Feud demo covers every outcome branch")

#### Scenario: Feud demo by tapping highlighted controls
- **WHEN** on a server whose survey table is empty the user opens the Family Feud demo and taps only the highlighted control at each step
- **THEN** exactly one control is highlighted at each step, "Nicht auf der Tafel" included on the scripted misses, all rounds and the sudden death complete, the Gewinner screen and "Demo beendet" are shown, and the survey's answers are shown with the [Demo] tag without holding
- **proof:** e2e

#### Scenario: Feud demo leaves data untouched
- **WHEN** the Family Feud demo is played to the end
- **THEN** the played-with lists, the saved players, the roster and the saved session are unchanged
- **proof:** e2e

#### Scenario: Feud demo completes with reduced motion
- **WHEN** `prefers-reduced-motion: reduce` is set and the Family Feud demo is played
- **THEN** every step can be completed to "Demo beendet"
- **proof:** e2e
