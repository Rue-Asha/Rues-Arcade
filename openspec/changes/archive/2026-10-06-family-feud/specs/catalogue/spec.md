## MODIFIED Requirements

### Requirement: Home catalogue from the registry
Home SHALL show one tile per registered game with its name, colour and player range, all read from the game's
own registry entry; the player range text SHALL be derived from the engine's limits, never typed separately. The
registered games SHALL be Imposter, Wavelength, Codes, What Rhymes with Duck, Most Likely To and Family Feud.

#### Scenario: Tiles for registered games
- **WHEN** Home is opened
- **THEN** Imposter, Wavelength, Codes, What Rhymes with Duck, Most Likely To and Family Feud tiles are shown, each linking to its start screen (`/spiele/imposter`, `/spiele/wavelength`, `/spiele/codes`, `/spiele/duck`, `/spiele/most-likely`, `/spiele/family-feud`)
- **proof:** e2e

#### Scenario: Player range derived from engine limits
- **WHEN** the tile label is computed for each registered game
- **THEN** it equals the text formatted from that game's `minPlayers`/`maxPlayers` (Imposter "3–12 Spieler", Codes "4–20 Spieler", What Rhymes with Duck "4–16 Spieler", Most Likely To "3–20 Spieler", Family Feud "4–20 Spieler")
- **proof:** unit

### Requirement: Locked later games
Home SHALL show Charade as a neutral, greyed "Bald verfügbar" tile with no actions.

#### Scenario: Bald tiles have no actions
- **WHEN** Home is opened and the "Bald verfügbar" tile is clicked
- **THEN** exactly one locked tile, Charade, is shown, it is not a link or button, and the page does not change
- **proof:** e2e

### Requirement: Tile pitch
Each registered game's Home tile SHALL show a one-line pitch from the game's registry entry (`pitch`), under
its name and above its player range. Locked "Bald" tiles show no pitch.

#### Scenario: Each tile shows a one-line pitch
- **WHEN** Home is opened
- **THEN** the Imposter tile shows "Alle bekommen dieselbe Frage, bis auf eine Person.", the Wavelength tile "Einen Punkt auf einer Skala zwischen zwei Begriffen finden, gemeinsam oder in Teams.", the Codes tile "Teams erraten ein geheimes Wort aus Ein-Wort-Hinweisen, reihum.", the Duck tile "Alle suchen gleichzeitig einen Reim auf dasselbe Wort.", the Most Likely To tile "Ein Spruch, und alle zeigen auf die Person, die am besten passt." and the Family Feud tile "Zwei Teams suchen die häufigsten Antworten einer Umfrage."
- **proof:** e2e

### Requirement: Game start screen layout
Each game's start screen SHALL open with a banner in the game's colour carrying the title, the letter badge,
the player range and the pitch. Below it, the start panel ("Weiterspielen" when a session is saved, the start
button "Los geht's", player and content checks) SHALL come first on phone and sit in the right column on
desktop (≥1024px), "So geht's" SHALL follow it on phone and fill the left column on desktop, and at the bottom a
box "Mehr zu <Spiel>" SHALL hold three cards, Erklärung, Demo and Inhalte, each a link with a one-line
description. All games SHALL use the same layout. The play header (Demo, Spiel beenden) is unchanged.

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


## ADDED Requirements

### Requirement: Family Feud start screen
The Family Feud start screen SHALL carry the banner "Family Feud" with badge "F", "4–20 Spieler" and its pitch,
three neutral "So geht's" rules, and count its content as "Umfrage" / "Umfragen" in the Inhalte card of its "Mehr
zu Family Feud" box, which holds the Erklärung, Demo and Inhalte cards like every game.

#### Scenario: Family Feud banner carries title, badge and range
- **WHEN** the Family Feud start screen is opened
- **THEN** the banner shows "Family Feud" with badge "F", "4–20 Spieler" and the Family Feud pitch
- **proof:** e2e

#### Scenario: So geht's for Family Feud
- **WHEN** the Family Feud start screen is opened
- **THEN** "So geht's" holds three rules, the first reading "Zwei Teams, eine Umfrage: gesucht sind die häufigsten Antworten.", and none contains "!"
- **proof:** e2e

#### Scenario: Family Feud Inhalte card counts the seeded surveys
- **WHEN** on a fresh database the Family Feud start screen is opened
- **THEN** the box "Mehr zu Family Feud" holds Erklärung, Demo and Inhalte, and the Inhalte card reads "26 Umfragen ansehen und bearbeiten"
- **proof:** e2e
