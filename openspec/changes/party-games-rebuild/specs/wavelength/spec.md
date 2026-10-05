## ADDED Requirements

### Requirement: Wavelength game flow
Wavelength SHALL be played in one of two modes chosen in the lobby (see "Wavelength modes"). In Versus it SHALL
take 2–6 teams of 2–3 players (4–18 players) and 1–5 rounds (default 3). Each turn draws a spectrum
(left | right) and a random target; only the psychic sees the target (hold-to-view); the team sets the dial;
lock-in scores 4/3/2/0 by distance bands as in the archive (21 bands over 180°, target centre clamped so all
five bands fit); a result is shown. The psychic rotates within the team each round; a round is every team
taking one turn; game over shows the winner or a tie, and "Nochmal spielen" starts a new game with the same teams.

#### Scenario: Full Wavelength game
- **WHEN** 2 teams of 2 play 1 round in Versus
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
- **proof:** e2e

#### Scenario: Play again keeps the teams
- **WHEN** "Nochmal spielen" is tapped at game over
- **THEN** a new game starts with the same teams and players, every score at 0, round 1 and the first team's turn
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
Wavelength SHALL ship a committed demo fixture that plays one full Versus round (2 teams × 1 turn) with Alex, Bo,
Cleo and Dani and ends at "Demo beendet". There is no Koop demo; the demo stays the Versus demo.

#### Scenario: Wavelength demo script plays to the end
- **WHEN** the Wavelength demo script's actions are applied to its fixture through the real reducer, twice
- **THEN** both runs reach the end state with identical states at every step
- **proof:** unit

#### Scenario: Wavelength demo stays the Versus demo
- **WHEN** the Wavelength demo script is started through the real engine
- **THEN** its opening state is a Versus game with two teams (Alex & Bo, Cleo & Dani) and no Koop mode
- **proof:** unit

#### Scenario: Wavelength demo by tapping highlighted controls
- **WHEN** the user opens Wavelength's Demo and taps only the highlighted control at each step
- **THEN** both turns complete and "Demo beendet" is shown
- **proof:** e2e

### Requirement: Wavelength modes
The Wavelength lobby SHALL offer a mode switch "Koop | Versus". Versus needs at least 4 chosen players; Koop
takes 2–18. With 2–3 chosen players Versus SHALL be disabled with its reason shown and Koop preselected; with
4 or more both are available and Versus is the default. Wavelength's limits SHALL be 2–18 players, so the
player range on its tile and start screen reads "2–18 Spieler", and fewer than 2 players SHALL block the start
with the reason shown.

#### Scenario: Four or more players default to Versus
- **WHEN** the Wavelength lobby is opened with 4 chosen players
- **THEN** the mode switch shows Koop and Versus, both enabled, with Versus selected and the team formation shown
- **proof:** e2e

#### Scenario: Two or three players get Koop only
- **WHEN** the Wavelength lobby is opened with 2 chosen players, and again with 3
- **THEN** Koop is selected, Versus is disabled and "Versus braucht mind. 4 Spieler." is shown, and "Los geht's" is enabled
- **proof:** e2e

#### Scenario: One player cannot start Wavelength
- **WHEN** the roster has 1 player and the Wavelength start screen is opened
- **THEN** "Los geht's" is disabled and "mind. 2 Spieler" is shown
- **proof:** e2e

#### Scenario: Wavelength player range reads 2–18
- **WHEN** the player range is computed for Wavelength
- **THEN** it is "2–18 Spieler"
- **proof:** unit

### Requirement: Wavelength Koop mode
In Koop all chosen players SHALL form one team. A round SHALL be one turn per player: each player is psychic
once per round, in the order the players were chosen, and the others set the dial together. Turn scoring is
unchanged (4/3/2/0). Rounds are 1–5 (default 3). There SHALL be one shared score only, no per-player points.
Game over SHALL show the total, the average points per turn (one decimal, German format) and a rating tier from
that average: ≥ 3.5 "Sehr genau", ≥ 2.5 "Genau", ≥ 1.5 "Solide", ≥ 0.5 "Ungenau", below 0.5 "Weit daneben".
"Nochmal spielen" SHALL start a new Koop game with the same players in the same order.

#### Scenario: Full Wavelength Koop game
- **WHEN** 2 players start Wavelength in Koop with 1 round and each takes the psychic turn
- **THEN** the turn label counts "Zug 1 / 2" and "Zug 2 / 2", each player is psychic once, and game over shows the total, "Punkte pro Zug" with the average and a rating tier
- **proof:** e2e

#### Scenario: Koop psychic order
- **WHEN** 3 players play 2 rounds of Koop
- **THEN** the psychics are, in turn order, players 1, 2, 3, 1, 2, 3, and the game is over after the sixth turn
- **proof:** unit

#### Scenario: Koop keeps one shared score
- **WHEN** Koop turns are locked in at distances scoring 4, 0 and 2
- **THEN** the single team's score is 6 after the third turn, and the state holds no per-player points
- **proof:** unit

#### Scenario: Koop rating tiers
- **WHEN** the Koop result is computed for averages 4, 3.5, 3.49, 2.5, 1.5, 0.5, 0.49 and 0
- **THEN** the tiers are "Sehr genau", "Sehr genau", "Genau", "Genau", "Solide", "Ungenau", "Weit daneben" and "Weit daneben"
- **proof:** unit

#### Scenario: Koop average per turn
- **WHEN** a 3-player, 1-round Koop game ends with 8 points
- **THEN** the result reports 3 turns, total 8 and average 2.67, shown as "2,7"
- **proof:** unit

#### Scenario: Koop play again keeps players and mode
- **WHEN** "Nochmal spielen" is tapped at the end of a Koop game
- **THEN** a new Koop game starts with the same players in the same order, score 0, round 1 and the first player as psychic
- **proof:** unit

#### Scenario: Koop session resumes after reload
- **WHEN** a Koop game is in its second turn and the page is reloaded
- **THEN** the same turn, psychic and shared score are shown, with no discarded-state notice
- **proof:** e2e

### Requirement: Saved Versus sessions stay compatible
A Wavelength session saved before the mode switch existed (state version 1, no mode field) SHALL still resume
as a Versus game.

#### Scenario: Saved Versus session from before resumes
- **WHEN** a stored version-1 Wavelength state without `mode` or `turn` (as written before Koop existed) is loaded
- **THEN** it is restored, not discarded, is treated as Versus, and the next lock-in scores for the current team
- **proof:** unit
