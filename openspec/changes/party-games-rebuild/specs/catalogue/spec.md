## ADDED Requirements

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
