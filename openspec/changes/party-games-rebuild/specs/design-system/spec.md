## ADDED Requirements

### Requirement: Arcade-Abend tokens
The app SHALL style every screen from one set of CSS tokens taken from the A1 · Arcade-Abend artboard
(`design/look-A1-P2-arcade-abend.dc.html`): ground #111234, primary #6bd672, Imposter #eb616d,
leader-gold #f4c34a, Wavelength #38ccc8, Sora for UI, Press Start 2P for the logo letter and scores only.
The UI SHALL be German and dark only. WCAG's inactive-control contrast exemption applies to disabled buttons and
form controls only, not to locked tiles or other greyed-out content.

#### Scenario: Text contrast meets 4.5:1
- **WHEN** every text/background token pair used by the components is evaluated
- **THEN** each pair has a contrast ratio of at least 4.5:1
- **proof:** e2e

#### Scenario: Look approved on screenshots
- **WHEN** Rue reviews the e2e screenshots of Home, Spieler, a game start screen, a reveal and a scoreboard at 390px and 1280px
- **THEN** Rue approves the look as Arcade-Abend
- **proof:** manual (visual judgement at Gate 2)

### Requirement: Shared components
The design system SHALL provide: button with press state (sinks into its 5px ledge), game tile, card,
scoreboard, lives, modal, hold-to-view, and coach tip. Interactive controls SHALL have touch targets of at
least 44×44px.

#### Scenario: Touch targets are at least 44px
- **WHEN** Home, Spieler and each game screen are rendered at 390px width
- **THEN** every button, link and input has a bounding box at least 44px high and wide
- **proof:** e2e

#### Scenario: Hold-to-view reveals only while held
- **WHEN** a player presses and holds the hold-to-view control, then releases it
- **THEN** the hidden content is visible while held and hidden again after release
- **proof:** e2e

### Requirement: Responsive layout
Every main screen SHALL be designed for phone (390px) and desktop (≥1280px) without an empty desktop, and
all main screens SHALL follow one alignment rule.

#### Scenario: No horizontal scroll on phone
- **WHEN** each main screen is rendered at 390px width
- **THEN** the document does not scroll horizontally, and a screenshot is written to `test-results/shots/`
- **proof:** e2e

#### Scenario: Desktop uses the width
- **WHEN** each main screen is rendered at 1280px width
- **THEN** a screenshot is written to `test-results/shots/` and Rue judges the desktop layout not empty and consistently aligned
- **proof:** manual (visual judgement at Gate 2, on the e2e screenshots)

### Requirement: Motion
The app SHALL animate screen and phase transitions, give juicy press feedback, count scores up, and play a
per-phase reveal animation, using transform/opacity only. Motion SHALL never block input.

#### Scenario: Reduced motion makes transitions instant
- **WHEN** the browser reports `prefers-reduced-motion: reduce`
- **THEN** screen transitions complete instantly and scores show their final value without counting up
- **proof:** e2e

#### Scenario: Motion never blocks input
- **WHEN** a player taps a control while a transition or count-up is running
- **THEN** the tap is handled immediately
- **proof:** e2e
