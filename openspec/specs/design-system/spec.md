# design-system Specification

## Purpose
TBD - created by archiving change party-games-rebuild. Update Purpose after archive.
## Requirements
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

### Requirement: Decoration "Spielbrett"
The app SHALL decorate its main screens with flat geometric inline-SVG illustrations built from each game's
own shapes (mock: `design/deco-1-spielbrett.html`), colour only as lines and small fills on tint backgrounds:
Home banner (board-grid pattern, Wavelength dial with bands, tilted Imposter mask card, dashed lock pieces) and
tile art (Imposter: a row of masks, the odd one lifts; Wavelength: a dial with rings; "Bald" tiles: a dashed
corner); per-game start banners (Wavelength: a large dial labelled "Kalt" and "Heiß"; Imposter: the mask row);
a lobby banner with a teams/players motif; and faint rings or arcs behind the play screens that never compete
with the game content. A game without its own art SHALL get a neutral fallback. Decoration SHALL be
`aria-hidden`, SHALL never take pointer events, and SHALL load no external assets. Ambient motion (dial needle
sweep about 7 s, mask lift) SHALL run permanently, play included, on transform/opacity only, and SHALL be off
under `prefers-reduced-motion: reduce`. Press Start 2P SHALL stay limited to the logo and scores.

#### Scenario: Decoration on every main screen
- **WHEN** Home, both start screens, both lobbies and both play screens are opened
- **THEN** Home shows the home banner art and tile art (masks, dial, dashed corner on every "Bald" tile), each start screen shows its game's banner art (Wavelength dial with "Kalt" and "Heiß", Imposter mask row), each lobby shows the crew art, and each play screen shows the rings backdrop behind the game content
- **proof:** e2e

#### Scenario: Decoration is hidden and never takes pointer events
- **WHEN** any decorated screen is rendered
- **THEN** every decoration element is `aria-hidden="true"` with `pointer-events: none`, and a tap at the centre of each visible control reaches that control
- **proof:** e2e

#### Scenario: Ambient motion runs during play
- **WHEN** Home and a Wavelength play screen are open with motion allowed
- **THEN** at least one infinite decoration animation is running on each, and it animates only transform or opacity
- **proof:** e2e

#### Scenario: Reduced motion turns ambient motion off
- **WHEN** `prefers-reduced-motion: reduce` is set and Home, a start screen and a play screen are opened
- **THEN** no decoration animation is running
- **proof:** e2e

#### Scenario: Game without its own art gets the neutral fallback
- **WHEN** the motif is looked up for a slug that has no art of its own, for tile, start and play
- **THEN** the neutral motif is returned, while Imposter and Wavelength get their own motifs
- **proof:** unit

#### Scenario: Contrast and layout rules hold with decoration
- **WHEN** the look walk renders every main screen with decoration present
- **THEN** every text/background pair still meets 4.5:1 and no screen scrolls horizontally at 390px
- **proof:** e2e ("Scenario: Text contrast meets 4.5:1", "Scenario: No horizontal scroll on phone")

#### Scenario: Press Start 2P stays limited to logo and scores
- **WHEN** the look walk renders every main screen
- **THEN** every text rendered in Press Start 2P belongs to the logo, a score or a dial band label, and none of it sits inside a banner, a tile, the "Mehr zu" box or the decoration
- **proof:** e2e

#### Scenario: Decoration loads no external assets
- **WHEN** the look walk renders every main screen
- **THEN** every request the page makes goes to the app's own origin
- **proof:** e2e

#### Scenario: Decorated screens approved on screenshots
- **WHEN** Rue reviews the refreshed e2e screenshots of Home, both start screens, the lobbies, the play screens and Koop game over at 390px and 1280px
- **THEN** Rue approves the decoration as the chosen "Spielbrett" variant, with the desktop width used
- **proof:** manual (visual judgement at Gate 2)

### Requirement: Neutral copy
The app SHALL keep all copy added with the decoration, the start-screen box, the tile pitches and Wavelength
Koop (banners, pitches, card descriptions, mode switch, Koop rating) neutral and grown-up: plain description, no
exclamation marks, no puns, no "Spieleabend"-style slogans.

#### Scenario: New copy has no exclamation marks
- **WHEN** the banners, tile pitches, "Mehr zu" box, Wavelength mode switch and Koop game-over texts are read from the rendered screens
- **THEN** none contains "!" and none contains "Spieleabend"
- **proof:** e2e

#### Scenario: New copy reads neutral and grown-up
- **WHEN** Rue reads the new copy on the refreshed screenshots
- **THEN** Rue finds no puns or slogans and approves the tone
- **proof:** manual (tone is a judgement call, at Gate 2)

