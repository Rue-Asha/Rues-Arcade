## MODIFIED Requirements

### Requirement: Arcade-Abend tokens
The app SHALL style every screen from one set of CSS tokens taken from the A1 · Arcade-Abend artboard
(`design/look-A1-P2-arcade-abend.dc.html`): ground #111234, primary #6bd672, Imposter #eb616d,
leader-gold #f4c34a, Wavelength #38ccc8, Sora for UI, Press Start 2P for the logo letter and scores only. Each
further game SHALL get its own colour token with `-ledge` and `-tint` companions: Codes (violet, about #9d8cff),
Duck (orange, about #ff9f43) and Most Likely To (pink, about #f27bc4).
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

## ADDED Requirements

### Requirement: Look of the new games
Codes, What Rhymes with Duck and Most Likely To SHALL each get the full look of Imposter and Wavelength: colour
token with ledge and tint, a tile badge icon drawn as inline SVG, own art for tile and start banner (motifs
`codes`, `duck`, `most-likely`) under the existing decoration rules (aria-hidden, no pointer events, no external
assets, ambient motion on transform/opacity only and off under reduced motion), and the shared crew art in the
lobby and rings behind play.

#### Scenario: New game colours meet contrast
- **WHEN** the token contrast pairs are evaluated with the three new colours and tints
- **THEN** ink on each new colour, each new colour on surface, and every text token on each new tint reach at least 4.5:1
- **proof:** unit

#### Scenario: New games get their own motifs
- **WHEN** the motif is looked up for codes, duck and most-likely at tile, start, lobby and play
- **THEN** tile and start return `codes`, `duck` and `most-likely`, lobby returns `crew` and play returns `rings`
- **proof:** unit

#### Scenario: New tiles carry their own badge
- **WHEN** Home is opened
- **THEN** the Codes, Duck and Most Likely To tiles each show an SVG badge that differs from the fallback badge and from each other
- **proof:** e2e

#### Scenario: New games' screens approved on screenshots
- **WHEN** Rue reviews the e2e screenshots of every new screen of Codes, Duck and Most Likely To at 390px and 1280px
- **THEN** Rue approves their look, art and desktop use of width as consistent with Imposter and Wavelength, and the copy as neutral
- **proof:** manual (visual and tone judgement at Gate 2)
