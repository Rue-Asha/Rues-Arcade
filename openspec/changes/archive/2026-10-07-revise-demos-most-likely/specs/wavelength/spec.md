## MODIFIED Requirements

### Requirement: Wavelength demo script
Wavelength SHALL ship one committed demo script that plays a Versus game of 2 rounds (2 teams × 2 turns) with
Alex & Bo against Cleo & Dani and ends at "Demo beendet". It SHALL reach every Versus branch of the reducer: a
redraw before the target is shown and one after, results of 4, 3, 2 and 0 points, "Weiter" to the other team and
into round 2 with the next psychic, the game over with one winning team, and "Nochmal spielen". There is no Koop
demo: the tips SHALL name Koop as the other mode.

#### Scenario: Wavelength demo script plays to the end
- **WHEN** the Wavelength demo script's actions are applied to its fixture through the real reducer, twice
- **THEN** both runs reach the end state with identical states at every step
- **proof:** unit

#### Scenario: Wavelength demo stays the Versus demo
- **WHEN** the Wavelength demo script is started through the real engine
- **THEN** its opening state is a Versus game with two teams (Alex & Bo, Cleo & Dani) and no Koop mode
- **proof:** unit

#### Scenario: Wavelength demo scores 4, 3, 2 and 0
- **WHEN** the demo's four `lockIn` steps are applied
- **THEN** their results are 4, 3, 2 and 0 points, one each
- **proof:** unit ("Scenario: Wavelength demo covers every outcome branch")

#### Scenario: Wavelength demo redraws before and after the target is shown
- **WHEN** the demo's `redraw` steps are applied
- **THEN** one happens in the prep phase and one after "Ziel anzeigen", each changes the spectrum and keeps the team and psychic
- **proof:** unit ("Scenario: Wavelength demo covers every outcome branch")

#### Scenario: Wavelength demo plays a second round
- **WHEN** the demo's states are walked
- **THEN** both teams play in round 1 and round 2, and in round 2 each team's psychic is its other player (Bo, Dani)
- **proof:** unit ("Scenario: Wavelength demo covers every outcome branch")

#### Scenario: Wavelength demo ends with a winner and plays again
- **WHEN** the demo's last turn is resolved
- **THEN** the game over shows one winning team with the higher score, and the final step taps "Nochmal spielen", which starts a new game with both scores 0
- **proof:** unit ("Scenario: Wavelength demo covers every outcome branch")

#### Scenario: Wavelength demo names Koop
- **WHEN** the demo's tips are read
- **THEN** at least one tip names Koop as the other mode
- **proof:** unit ("Scenario: Wavelength demo covers every outcome branch")

#### Scenario: Wavelength demo by tapping highlighted controls
- **WHEN** the user opens Wavelength's Demo and taps only the highlighted control at each step
- **THEN** all four turns and the game over complete and "Demo beendet" is shown
- **proof:** e2e

### Requirement: Neutral turn verdicts
The Wavelength result screen SHALL name each turn's outcome in the neutral tone of S20, in Versus and in Koop:
4 points "Genau getroffen.", 3 "Knapp daneben.", 2 "In der Nähe.", 0 "Kein Punkt." The Wavelength demo tips
SHALL use the same tone: each result tip opens with its turn's verdict and points (for example "Genau getroffen,
4 Punkte.").

#### Scenario: Turn verdicts read neutral
- **WHEN** a Wavelength turn is locked in on the target and another one far outside the bands
- **THEN** the result screens show "Genau getroffen." and "Kein Punkt.", and no verdict text contains "!"
- **proof:** e2e

#### Scenario: Wavelength demo tips read neutral
- **WHEN** the Wavelength demo script's tips are read
- **THEN** none contains "!" or an emoji, and the tips of the four result steps open with "Genau getroffen, 4 Punkte", "Knapp daneben, 3 Punkte", "In der Nähe, 2 Punkte" and "Kein Punkt" in the order the script plays them
- **proof:** unit
