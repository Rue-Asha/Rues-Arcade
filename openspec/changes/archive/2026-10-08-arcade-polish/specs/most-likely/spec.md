## MODIFIED Requirements

### Requirement: Most Likely turns
At game start the opening team SHALL be drawn from the RNG. Round r SHALL open with team (opener + r) mod n and the
other teams SHALL follow in team order, one turn each (archive rule). Each turn SHALL open with the shared Handoff
"<Team> ist dran" and show the team's player names, the prompt, and the hint that the team members count to three and
point at the same moment at the person who fits best; the play header status SHALL read "Runde r / R · Team k / n",
the team's position in the round (game-engine "Round status in the play header"). "Alle haben gezeigt" SHALL open the
count.

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
- **THEN** the Handoff reads "<opening team> ist dran", the stage shows that team's player names, the prompt and the hint "Zählt bis drei und zeigt gleichzeitig auf die Person, die am besten passt.", and the header status reads "Runde 1 / 5 · Team 1 / 2"
- **proof:** e2e
