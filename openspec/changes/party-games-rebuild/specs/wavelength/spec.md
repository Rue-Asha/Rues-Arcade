## ADDED Requirements

### Requirement: Wavelength game flow
Wavelength SHALL take 2–6 teams of 2–3 players and 1–5 rounds (default 3). Each turn draws a spectrum
(left | right) and a random target; only the psychic sees the target (hold-to-view); the team sets the dial;
lock-in scores 4/3/2/0 by distance bands as in the archive (21 bands over 180°, target centre clamped so all
five bands fit); a result is shown. The psychic rotates within the team each round; a round is every team
taking one turn; game over shows the winner or a tie.

#### Scenario: Full Wavelength game
- **WHEN** 2 teams of 2 play 1 round
- **THEN** each team takes one turn with reveal, dial, lock-in and result, and the game-over screen shows the winner
- **proof:** e2e

#### Scenario: Scoring bands
- **WHEN** the dial is locked at distances 0, 1, 2 and 3 band widths from the target
- **THEN** the scores are 4, 3, 2 and 0
- **proof:** unit

#### Scenario: Target at the extremes scores correctly
- **WHEN** the target is at its lowest or highest allowed position and the dial is at 0° or 180°
- **THEN** the score equals the band the dial falls in, and positions beyond the dial ends are not possible
- **proof:** unit

#### Scenario: Psychic rotates within the team
- **WHEN** a team of 3 plays three rounds
- **THEN** each of its players is psychic once
- **proof:** unit

#### Scenario: Tie for first shown as tie
- **WHEN** two teams end with the same highest score
- **THEN** game over shows a tie between them
- **proof:** unit

#### Scenario: Redraw changes spectrum and target
- **WHEN** the psychic redraws before the team sets the dial
- **THEN** a different spectrum (when the pool has more than one) and a new target are drawn
- **proof:** unit

### Requirement: Dial input
The dial SHALL be operable by touch drag, mouse and keyboard (arrow keys).

#### Scenario: Dial by keyboard
- **WHEN** the dial is focused and the right arrow key is pressed
- **THEN** the dial moves right by one step
- **proof:** e2e

#### Scenario: Dial by drag
- **WHEN** the dial needle is dragged with the mouse or a touch pointer
- **THEN** the dial follows the pointer within 0°–180°
- **proof:** e2e

### Requirement: Wavelength demo script
Wavelength SHALL ship a committed demo fixture that plays one full round (2 teams × 1 turn) with Alex, Bo, Cleo
and Dani and ends at "Demo beendet".

#### Scenario: Wavelength demo script plays to the end
- **WHEN** the Wavelength demo script's actions are applied to its fixture through the real reducer, twice
- **THEN** both runs reach the end state with identical states at every step
- **proof:** unit

#### Scenario: Wavelength demo by tapping highlighted controls
- **WHEN** the user opens Wavelength's Demo and taps only the highlighted control at each step
- **THEN** both turns complete and "Demo beendet" is shown
- **proof:** e2e
