## MODIFIED Requirements

### Requirement: Game start screen layout
Each game's start screen SHALL open with a banner in the game's colour carrying the title, the letter badge,
the player range and the pitch. Below it, the start panel ("Weiterspielen" when a session is saved, the start
button "Los geht's", player and content checks) SHALL come first on phone and sit in the right column on
desktop (≥1024px), "So geht's" SHALL follow it on phone and fill the left column on desktop, and at the bottom a
box "Mehr zu <Spiel>" SHALL hold two cards, Demo and Inhalte, each a link with a one-line description. The Demo
card SHALL be the way to learn the game, and its line SHALL say so. There SHALL be no Erklärung card and no
`/spiele/<slug>/erklaerung` route; an old link to it gets the normal unknown-route 404, with no redirect. All games
SHALL use the same layout. The Demo card SHALL be the only way into a game's demo; the play header offers no Demo
(game-engine "Play header").

#### Scenario: Start banner carries title, badge and player range
- **WHEN** the Imposter start screen is opened
- **THEN** a banner shows the heading "Imposter", the badge "I", "3–12 Spieler" and the Imposter pitch
- **proof:** e2e

#### Scenario: Start panel first on phone, right column on desktop
- **WHEN** a start screen is rendered at 390px and at 1280px
- **THEN** at 390px the "Los geht's" panel sits above "So geht's" and the "Mehr zu" box comes last; at 1280px the panel sits to the right of "So geht's", top-aligned with it, and the "Mehr zu" box spans below both
- **proof:** e2e

#### Scenario: Same start layout for both games
- **WHEN** the start screens of all six games are rendered
- **THEN** each shows banner, start panel, "So geht's" and "Mehr zu <Spiel>" in the same order and arrangement
- **proof:** e2e ("Scenario: Start panel first on phone, right column on desktop")

#### Scenario: Mehr-zu cards keep their targets
- **WHEN** the Imposter start screen is opened
- **THEN** the box "Mehr zu Imposter" holds exactly two links, "Demo" → `/spiele/imposter/demo?from=/spiele/imposter` with the line "Spiel per Demo lernen, mehrere Runden zum Mittippen" and "Inhalte" → `/spiele/imposter/inhalte` with its count line, no "Erklärung" link exists, and following "Demo" then "Demo beenden" returns to the start screen
- **proof:** e2e

#### Scenario: Old Erklärung link is not found
- **WHEN** `/spiele/imposter/erklaerung` is opened
- **THEN** the response status is 404, the normal not-found page is shown, and the URL is not redirected to the demo
- **proof:** e2e

#### Scenario: Inhalte card shows the real content count
- **WHEN** a fresh database holds 3 Wavelength spectra and the Wavelength start screen is opened
- **THEN** the Inhalte card reads "3 Spektren ansehen und bearbeiten"
- **proof:** e2e

#### Scenario: Los geht's opens the lobby
- **WHEN** the roster and content are sufficient and "Los geht's" on the start screen is tapped
- **THEN** the game's lobby is shown
- **proof:** e2e

#### Scenario: So geht's covers both Wavelength modes
- **WHEN** the Wavelength start screen is opened
- **THEN** the first "So geht's" rule reads "Gemeinsam oder in Teams: pro Zug ein Spektrum zwischen zwei Begriffen."
- **proof:** e2e

