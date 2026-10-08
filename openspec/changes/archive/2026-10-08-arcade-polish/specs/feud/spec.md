## MODIFIED Requirements

### Requirement: Family Feud demo
Family Feud SHALL ship one committed demo script (surveys, tiebreak survey, seed, scripted actions) with Alex and Bo
against Cleo and Dani playing several rounds to the Gewinner screen and "Demo beendet". Every round of the script,
sudden death included, SHALL start with a scripted "Frage aufdecken" step and a scripted buzzer-team step before
any face-off answer, and both teams SHALL be chosen first at least once. It SHALL reach every branch
of the Feud reducer that a normal game reaches: in the face-off a first answer that misses the board, both answers
missing (next pair), a number-one answer that wins at once, and two hits where the higher one wins; "Spielen" and
"Passen"; a board revealed completely; three strikes leading to a steal that succeeds and one that fails; the last
round counting double; and, because a tie after the last round is a normal outcome, sudden death on the tiebreak
survey. "Rückgängig" is a correction, not an outcome, and SHALL be named in a tip; the engine has no rematch. Hidden
survey information SHALL be shown openly with the [Demo] tag. The demo SHALL never touch the database, the roster
or the played-with history, and SHALL run on an empty database and under reduced motion. The demo SHALL go from the
third strike straight to the steal board, without the steal's Handoff, because the Handoff's "Weiter"
has no scripted control. In the demo, "Nicht auf der Tafel" SHALL be the highlighted control when the scripted
face-off answer or steal is a miss, and on a buzzer-team step only the scripted team's button SHALL be highlighted.

#### Scenario: Feud demo script plays to the end
- **WHEN** the Family Feud demo script's actions are applied to its fixture through the real reducer, twice
- **THEN** both runs reach the game over with identical states at every step, and every step changes the state
- **proof:** unit

#### Scenario: Feud demo reveals and picks the buzzer
- **WHEN** the demo's steps are walked round by round
- **THEN** every round, sudden death included, starts with the reveal step followed by a buzzer-team step before its first face-off answer, and Team A and Team B each are chosen first at least once
- **proof:** unit ("Scenario: Feud demo covers every outcome branch")

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
- **THEN** exactly one control is highlighted at each step, "Frage aufdecken" on the reveal steps, the scripted team's button on the buzzer-team steps and "Nicht auf der Tafel" on the scripted misses included, all rounds and the sudden death complete, the Gewinner screen and "Demo beendet" are shown, and the survey's answers are shown with the [Demo] tag without holding
- **proof:** e2e

#### Scenario: Feud demo leaves data untouched
- **WHEN** the Family Feud demo is played to the end
- **THEN** the played-with lists, the saved players, the roster and the saved session are unchanged
- **proof:** e2e

#### Scenario: Feud demo completes with reduced motion
- **WHEN** `prefers-reduced-motion: reduce` is set and the Family Feud demo is played
- **THEN** every step can be completed to "Demo beendet"
- **proof:** e2e

### Requirement: Family Feud look, motion and sound
The board SHALL be ledge tiles showing their rank number while hidden, inside the stage card of the in-game frame
(design-system "In-game frame"); a versus panel in the rail SHALL show both team names and scores; strike pods SHALL
reuse Lives; "Spielen/Passen" and the steal SHALL open with the shared Handoff inline in the stage card, in the team's
colour, with no fixed overlay (the steal's Handoff skipped in the demo, see its requirement). Motion SHALL be: tile
flip (rotateX), strike pod pop with a short board shake and an X stamp from the shared fault helper,
pot count-up into the score, staggered reveal of the remaining tiles — transform/opacity only, never blocking
input, instant under reduced motion. Sounds SHALL use `play()`: reveal on a revealed tile, wrong on a strike or a
miss, correct when a team banks the pot, win on the winner screen. Copy SHALL be neutral German with no "!" and no
emoji.

#### Scenario: Feud board fits a phone
- **WHEN** a survey with 8 answers is on the board at 390px
- **THEN** the page does not scroll horizontally and all 8 tiles lie within the viewport width
- **proof:** e2e

#### Scenario: Feud versus header shows both teams
- **WHEN** a Family Feud round is on the board
- **THEN** the rail shows both team names with their scores
- **proof:** e2e

#### Scenario: Feud handoff in team colour
- **WHEN** a face-off is won and later a third strike is given
- **THEN** each shows the shared Handoff inside the stage card naming the team that acts next on a band in that team's colour, no fixed overlay exists, and at 1280px the rail stays visible beside it
- **proof:** e2e

#### Scenario: Feud motion uses transform and opacity only
- **WHEN** a tile is revealed, a strike is given and a round result is shown, with motion allowed
- **THEN** every animation that runs animates only transform or opacity
- **proof:** e2e

#### Scenario: Feud motion never blocks input
- **WHEN** a strike is tapped while a tile flip is running
- **THEN** the strike is counted immediately
- **proof:** e2e

#### Scenario: Feud reduced motion is instant
- **WHEN** `prefers-reduced-motion: reduce` is set and the question is uncovered, a tile is revealed, a strike given, the choice Handoff, a result and the winner shown
- **THEN** no finite animation is running after each step, the score and `+N` show their final value, and no winner pieces exist
- **proof:** e2e

#### Scenario: Feud copy reads neutral
- **WHEN** a full Family Feud game is played and every visible text is collected
- **THEN** none contains "!" or an emoji
- **proof:** e2e

#### Scenario: Feud screens meet the look rules
- **WHEN** the look walk renders the Family Feud start, lobby, prep, face-off, handoff, board, steal, result and winner screens
- **THEN** text contrast is at least 4.5:1, touch targets are at least 44px and no screen scrolls horizontally at 390px
- **proof:** e2e ("Scenario: Text contrast meets 4.5:1", "Scenario: Touch targets are at least 44px", "Scenario: No horizontal scroll on phone")

#### Scenario: Feud cues sound right
- **WHEN** Rue plays a Family Feud round with sound on
- **THEN** a reveal plays reveal, a strike plays wrong, banking the pot plays correct and the winner screen plays win
- **proof:** manual (audio judgement on a real device at Gate 2)

#### Scenario: Feud screens approved on screenshots
- **WHEN** Rue reviews the look-walk screenshots of every Family Feud screen at 390px and 1280px
- **THEN** Rue approves the board, motion stills, art and desktop use of width as consistent with the other games, and the copy as neutral
- **proof:** manual (visual and tone judgement at Gate 2)

