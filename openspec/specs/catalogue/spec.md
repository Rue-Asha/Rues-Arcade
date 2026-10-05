# catalogue Specification

## Purpose
TBD - created by archiving change party-games-rebuild. Update Purpose after archive.
## Requirements
### Requirement: Home catalogue from the registry
Home SHALL show one tile per registered game with its name, colour and player range, all read from the game's
own registry entry; the player range text SHALL be derived from the engine's limits, never typed separately.

#### Scenario: Tiles for registered games
- **WHEN** Home is opened
- **THEN** Imposter and Wavelength tiles are shown, each linking to its start screen
- **proof:** e2e

#### Scenario: Player range derived from engine limits
- **WHEN** the tile label is computed for each registered game
- **THEN** it equals the text formatted from that game's `minPlayers`/`maxPlayers` (Imposter "3–12 Spieler")
- **proof:** unit

### Requirement: Locked later games
Home SHALL show Duck, Family Feud, Codes, Most Likely To and Charade as neutral, greyed "Bald verfügbar" tiles
with no actions.

#### Scenario: Bald tiles have no actions
- **WHEN** Home is opened and a "Bald verfügbar" tile is clicked
- **THEN** the five locked tiles are shown, none is a link or button, and the page does not change
- **proof:** e2e

### Requirement: Tile pitch
Each registered game's Home tile SHALL show a one-line pitch from the game's registry entry (`pitch`), under
its name and above its player range. Locked "Bald" tiles show no pitch.

#### Scenario: Each tile shows a one-line pitch
- **WHEN** Home is opened
- **THEN** the Imposter tile shows "Alle bekommen dieselbe Frage, bis auf eine Person." and the Wavelength tile shows "Einen Punkt auf einer Skala zwischen zwei Begriffen finden, gemeinsam oder in Teams."
- **proof:** e2e

### Requirement: Game start screen layout
Each game's start screen SHALL open with a banner in the game's colour carrying the title, the letter badge,
the player range and the pitch. Below it, the start panel ("Weiterspielen" when a session is saved, the start
button "Los geht's", player and content checks) SHALL come first on phone and sit in the right column on
desktop (≥1024px), "So geht's" SHALL follow it on phone and fill the left column on desktop, and at the bottom a
box "Mehr zu <Spiel>" SHALL hold three cards, Erklärung, Demo and Inhalte, each a link with a one-line
description. Both games SHALL use the same layout. The play header (Demo, Spiel beenden) is unchanged.

#### Scenario: Start banner carries title, badge and player range
- **WHEN** the Imposter start screen is opened
- **THEN** a banner shows the heading "Imposter", the badge "I", "3–12 Spieler" and the Imposter pitch
- **proof:** e2e

#### Scenario: Start panel first on phone, right column on desktop
- **WHEN** a start screen is rendered at 390px and at 1280px
- **THEN** at 390px the "Los geht's" panel sits above "So geht's" and the "Mehr zu" box comes last; at 1280px the panel sits to the right of "So geht's", top-aligned with it, and the "Mehr zu" box spans below both
- **proof:** e2e

#### Scenario: Same start layout for both games
- **WHEN** the Imposter and the Wavelength start screens are rendered
- **THEN** both show banner, start panel, "So geht's" and "Mehr zu <Spiel>" in the same order and arrangement
- **proof:** e2e ("Scenario: Start panel first on phone, right column on desktop")

#### Scenario: Mehr-zu cards keep their targets
- **WHEN** the Imposter start screen is opened
- **THEN** the box "Mehr zu Imposter" holds the links "Erklärung" → `/spiele/imposter/erklaerung`, "Demo" → `/spiele/imposter/demo?from=/spiele/imposter` and "Inhalte" → `/spiele/imposter/inhalte`, each with its one-line description, and following "Demo" then "Demo beenden" returns to the start screen
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

