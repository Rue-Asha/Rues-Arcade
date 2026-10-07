## MODIFIED Requirements

### Requirement: Shared components
The design system SHALL provide: button with press state (sinks into its 5px ledge), game tile, card,
scoreboard, lives, modal, hold-to-view, and coach tip. The button SHALL come in the variants primary, secondary,
ghost, danger (red, `--imposter` with `--imposter-ledge`, ink text) and warning (orange, `--duck` with
`--duck-ledge`, ink text), and in an icon-only square form (as wide as it is high, an SVG icon as content, its
accessible name given as a label) usable with any variant. Interactive controls SHALL have touch targets of at
least 44×44px.

#### Scenario: Touch targets are at least 44px
- **WHEN** Home, Spieler and each game screen are rendered at 390px width
- **THEN** every button, link and input has a bounding box at least 44px high and wide
- **proof:** e2e

#### Scenario: Hold-to-view reveals only while held
- **WHEN** a player presses and holds the hold-to-view control, then releases it
- **THEN** the hidden content is visible while held and hidden again after release
- **proof:** e2e

#### Scenario: Danger and warning buttons
- **WHEN** a danger button and a warning icon-square button are rendered side by side (Feud's "Fehler" and its "Rückgängig")
- **THEN** the danger button has the `--imposter` background, the warning square has the `--duck` background, is as wide as it is high, shows no visible text and is named by its label
- **proof:** e2e ("Scenario: Feud fault and undo read as what they are")
