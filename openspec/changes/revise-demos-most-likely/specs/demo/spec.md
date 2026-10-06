## MODIFIED Requirements

### Requirement: Guided demo
Each game's start screen (the Demo card in its "Mehr zu <Spiel>" box) and the header during play SHALL offer
"Demo". Each game SHALL have exactly one demo script, played through the real engine with the game's committed
fixture and fixed players (Alex, Bo, Cleo, Dani). The script SHALL play more than one round and reach every outcome
branch the engine has for a normal game: each scoring outcome, each special action that changes the flow (redraw,
pass, steal, skip, …) and the game end with its "Nochmal spielen" control where the engine has one. Mutually
exclusive modes SHALL NOT share a run: the script plays one mode and its tips name the other. A branch the fixture
cannot reach SHALL be reached by changing the seed or config, never by faking state. Each step SHALL show a coach
tip with progress ("Schritt 3/12") that explains why the step happens, in neutral German without "!" or emoji; only
the expected control is enabled; hidden information is shown openly with a [Demo] tag; "Demo beenden" is available
at every step. The demo SHALL never touch the session, roster or database, and SHALL work with reduced motion.

#### Scenario: Only the expected control is enabled
- **WHEN** a demo step is shown
- **THEN** the coach tip shows "Schritt n/N", the expected control is highlighted, and tapping any other game control does nothing
- **proof:** e2e

#### Scenario: Hidden information shown with Demo tag
- **WHEN** a demo step shows information that is normally hidden (a question, a target)
- **THEN** it is visible without holding and marked [Demo]
- **proof:** e2e

#### Scenario: Demo leaves real data untouched
- **WHEN** a demo is played to the end
- **THEN** the saved session, the roster and the database are unchanged
- **proof:** e2e

#### Scenario: Exiting returns to the starting screen
- **WHEN** the demo is started from the header during a real game and "Demo beenden" is chosen
- **THEN** the game screen is shown again with the real session intact
- **proof:** e2e

#### Scenario: Reload during demo returns to start screen
- **WHEN** the page is reloaded during a demo
- **THEN** the game's start screen is shown
- **proof:** e2e

#### Scenario: Demo steppable with reduced motion
- **WHEN** `prefers-reduced-motion: reduce` is set and the demo is played
- **THEN** every step can be completed to "Demo beendet"
- **proof:** e2e

#### Scenario: Every demo covers its outcome branches over several rounds
- **WHEN** each game's demo script is played through its real reducer
- **THEN** it passes more than one round and every branch its game's spec lists under "<Game> demo covers every outcome branch"
- **proof:** unit ("Scenario: Imposter demo covers every outcome branch", "Scenario: Wavelength demo covers every outcome branch", "Scenario: Feud demo covers every outcome branch", "Scenario: Codes demo covers every outcome branch", "Scenario: Duck demo covers every outcome branch", "Scenario: Most Likely demo covers every outcome branch")

#### Scenario: Demo tips read neutral
- **WHEN** the tips of every game's demo script are read
- **THEN** each is non-empty and none contains "!" or an emoji
- **proof:** unit ("Scenario: Imposter demo covers every outcome branch", "Scenario: Wavelength demo tips read neutral", "Scenario: Feud demo covers every outcome branch", "Scenario: Codes demo covers every outcome branch", "Scenario: Duck demo covers every outcome branch", "Scenario: Most Likely demo covers every outcome branch")

#### Scenario: Demo tips say why the step happens
- **WHEN** Rue reads each demo from start to "Demo beendet"
- **THEN** every tip explains why the step happens, not only which control to tap, and the tips name the branches the script cannot show
- **proof:** manual (wording judgement by Rue at Gate 2)

#### Scenario: Long demo progress reads correctly
- **WHEN** a demo with more than 20 steps is tapped through
- **THEN** every step shows "Schritt n/N" with N equal to the script's length, and the end shows "Demo beendet"
- **proof:** e2e ("Scenario: Feud demo by tapping highlighted controls", "Scenario: Most Likely demo by tapping highlighted controls", "Scenario: Duck demo by tapping highlighted controls")
