## MODIFIED Requirements

### Requirement: Codes round result and Endstand
Rundenergebnis SHALL show the shared Outcome (design-system "Round outcome") with the points and the team, or
"Übersprungen" with "+0", and the word, with "Nächste Runde", or "Zum Ergebnis" after the last round. Endstand SHALL show
the winner team(s) as the stage hero, "Unentschieden" when several share the top score, "Nochmal spielen" in the action
row, and the ranked list as the one final Scoreboard in the rail; the rematch SHALL keep the teams, reset the scores and
pick a new random opener.

#### Scenario: Full Codes game
- **WHEN** 4 players in 2 teams play 1 round in which the first team misses and the second guesses
- **THEN** the result shows "+2", the second team and the word, "Zum Ergebnis" leads to the Endstand naming the second team as winner in the stage, with the ranked list in the rail
- **proof:** e2e

#### Scenario: Codes skipped round result
- **WHEN** a Codes round is skipped after three misses
- **THEN** the result shows "Übersprungen", "+0" in the miss style and the word, and no team's score changed
- **proof:** e2e

#### Scenario: Codes tie shown as Unentschieden
- **WHEN** 2 teams play 2 rounds and each round the opening team guesses on the first attempt
- **THEN** the Endstand shows "Unentschieden" with both teams at 3 points
- **proof:** e2e

#### Scenario: Codes rematch keeps the teams
- **WHEN** the rematch is started from the Endstand
- **THEN** a new game starts with the same teams and players, all scores 0, round 1, and the opener drawn from the RNG
- **proof:** unit
