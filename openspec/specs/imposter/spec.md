# imposter Specification

## Purpose
TBD - created by archiving change party-games-rebuild. Update Purpose after archive.
## Requirements
### Requirement: Imposter round flow
Imposter SHALL take 3–12 players. Each round draws a pair; one random player gets the imposter question, all
others the crew question; `{NAME}`/`{NAME2}` are filled with distinct random player names once per round. In the
reveal phase each player in turn holds to view their question; between players the screen shows
"Gib das Handy an <Name>". Then the crew question is shown to all, then the imposter is unmasked, then the next
round starts. Skip redraws the pair and restarts the reveal. There is no scoring; rounds repeat until the
players leave.

#### Scenario: Full Imposter round
- **WHEN** 4 players play a round from reveal through unmask to the next round
- **THEN** exactly one player saw the imposter question, all players then see the crew question, the unmask names that player, and a new round starts in reveal
- **proof:** e2e

#### Scenario: Hand-over between players
- **WHEN** a player finishes viewing their question in the reveal phase
- **THEN** the screen shows "Gib das Handy an <next player>" before the next question can be viewed
- **proof:** e2e

#### Scenario: Skip redraws and restarts the reveal
- **WHEN** Skip is used during the reveal
- **THEN** a different pair is drawn (when the pool has more than one) and the reveal restarts at the first player
- **proof:** unit

#### Scenario: Name placeholders filled with distinct names
- **WHEN** the drawn pair contains `{NAME}` and `{NAME2}` and there are 3 players
- **THEN** both are replaced with two different player names, the same for every player in that round
- **proof:** unit

### Requirement: Imposter pair drawing
Pairs SHALL be drawn without repeats until the pool is exhausted, then reshuffled.

#### Scenario: No repeats until the pool is exhausted
- **WHEN** rounds are played on a pool of 5 pairs
- **THEN** the first 5 rounds use 5 different pairs and round 6 draws again from all 5
- **proof:** unit

#### Scenario: Pool of one pair repeats
- **WHEN** the pool has exactly one pair
- **THEN** every round uses that pair
- **proof:** unit

### Requirement: Imposter demo script
Imposter SHALL ship one committed demo script (content + seed + scripted actions) with Alex, Bo, Cleo and Dani that
plays two rounds and ends at "Demo beendet". It SHALL reach every branch of the Imposter reducer: handover and
reading per player, the last reader leading to the crew phase, revealing the crew question, unmasking, revealing the
imposter, a skip that redraws the pair mid-reveal, and "Nächste Runde" into round 2. The engine has no game end and
does not record whether the group caught the imposter, so the tips SHALL narrate one caught and one uncaught
imposter and say that rounds go on until the group ends the game. Hidden questions SHALL keep the [Demo] tag.

#### Scenario: Imposter demo script plays to the end
- **WHEN** the Imposter demo script's actions are applied to its fixture through the real reducer, twice
- **THEN** both runs reach the end state with identical states at every step, and every step changes the state
- **proof:** unit

#### Scenario: Imposter demo skip redraws mid-reveal
- **WHEN** the demo reaches its `skip` step after at least one player has read
- **THEN** a different pair is dealt, the reveal restarts at the first player, and the imposter stays the same player
- **proof:** unit ("Scenario: Imposter demo covers every outcome branch")

#### Scenario: Imposter demo reveals the crew question and the imposter
- **WHEN** the demo's states are walked
- **THEN** in each round the last `seen` leads to the crew phase, the crew question is revealed, `unmask` follows and the imposter is revealed
- **proof:** unit ("Scenario: Imposter demo covers every outcome branch")

#### Scenario: Imposter demo plays a second round
- **WHEN** the demo reaches its `nextRound` step
- **THEN** round 2 starts with a new deal and an imposter drawn from the RNG, and every player hands over and reads again
- **proof:** unit ("Scenario: Imposter demo covers every outcome branch")

#### Scenario: Imposter demo narrates caught and not caught
- **WHEN** the tips of the two imposter-reveal steps are read
- **THEN** each names that round's imposter, one says the group found the imposter and the other that the imposter got through, a tip says rounds go on until "Spiel beenden", and no tip contains "!" or an emoji
- **proof:** unit ("Scenario: Imposter demo covers every outcome branch")

#### Scenario: Imposter demo by tapping highlighted controls
- **WHEN** the user opens Imposter's Demo and taps only the highlighted control at each step, including the skip
- **THEN** exactly one control is highlighted at each step, both rounds complete and "Demo beendet" is shown
- **proof:** e2e

