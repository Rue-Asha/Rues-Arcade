## ADDED Requirements

### Requirement: Guided demo
Each game's start screen (a card in its "Mehr zu <Spiel>" box) and the header during play SHALL offer "Demo". The demo plays one full round of the
game's committed fixture with fixed players (Alex, Bo, Cleo, Dani) through the real engine; each step shows a
coach tip with progress ("Schritt 3/12") and only the expected control is enabled; hidden information is shown
openly with a [Demo] tag; "Demo beenden" is available at every step.

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
