## ADDED Requirements

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
Imposter SHALL ship a committed demo fixture (content + seed + scripted actions) that plays one full round with
Alex, Bo, Cleo and Dani and ends at "Demo beendet".

#### Scenario: Imposter demo script plays to the end
- **WHEN** the Imposter demo script's actions are applied to its fixture through the real reducer, twice
- **THEN** both runs reach the end state with identical states at every step
- **proof:** unit

#### Scenario: Imposter demo by tapping highlighted controls
- **WHEN** the user opens Imposter's Demo and taps only the highlighted control at each step
- **THEN** the round completes and "Demo beendet" is shown
- **proof:** e2e
