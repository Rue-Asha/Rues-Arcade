# catalogue Specification

## Purpose
TBD - created by archiving change party-games-rebuild. Update Purpose after archive.
## Requirements
### Requirement: Home catalogue from the registry
Home SHALL show one tile per registered game with its name, colour and player range, all read from the game's
own registry entry; the player range text SHALL be derived from the engine's limits, never typed separately. The
registered games SHALL be Imposter, Wavelength, Codes, What Rhymes with Duck, Most Likely To, Family Feud and Blood on
the Clocktower (slug `clocktower`, 5–15 players). With more roster players than a game's maximum the existing "Wer
spielt mit?" picker applies, for Blood on the Clocktower as for every game.

#### Scenario: Tiles for registered games
- **WHEN** Home is opened
- **THEN** Imposter, Wavelength, Codes, What Rhymes with Duck, Most Likely To, Family Feud and Blood on the Clocktower tiles are shown, each linking to its start screen (`/spiele/imposter`, `/spiele/wavelength`, `/spiele/codes`, `/spiele/duck`, `/spiele/most-likely`, `/spiele/family-feud`, `/spiele/clocktower`), the Most Likely To tile reads "4–20 Spieler" and the Blood on the Clocktower tile reads "5–15 Spieler"
- **proof:** e2e

#### Scenario: Player range derived from engine limits
- **WHEN** the tile label is computed for each registered game
- **THEN** it equals the text formatted from that game's `minPlayers`/`maxPlayers` (Imposter "3–12 Spieler", Codes "4–20 Spieler", What Rhymes with Duck "4–16 Spieler", Most Likely To "4–20 Spieler", Family Feud "4–20 Spieler", Blood on the Clocktower "5–15 Spieler")
- **proof:** unit

#### Scenario: Registry lists Blood on the Clocktower last
- **WHEN** the registry is read
- **THEN** the slugs are imposter, wavelength, codes, duck, most-likely, family-feud, clocktower in that order, all unique, Charade is still the only locked game, and the clocktower entry has colour `clocktower`, content type `none`, `minContent` 0, no demo, an explanation deck and `countFirst`
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
- **THEN** the Imposter tile shows "Alle bekommen dieselbe Frage, bis auf eine Person.", the Wavelength tile "Einen Punkt auf einer Skala zwischen zwei Begriffen finden, gemeinsam oder in Teams.", the Codes tile "Teams erraten ein geheimes Wort aus Ein-Wort-Hinweisen, reihum.", the Duck tile "Alle suchen gleichzeitig einen Reim auf dasselbe Wort.", the Most Likely To tile "Ein Spruch, alle zeigen auf eine Person, und ein Team punktet, wenn es sich einig ist." and the Family Feud tile "Zwei Teams suchen die häufigsten Antworten einer Umfrage."
- **proof:** e2e

### Requirement: Game start screen layout
Each game's start screen SHALL open with a banner in the game's colour carrying the title, the letter badge,
the player range and the pitch. Below it, the start panel ("Weiterspielen" when a session is saved, the start
button "Los geht's", player and content checks) SHALL come first on phone and sit in the right column on
desktop (≥1024px), "So geht's" SHALL follow it on phone and fill the left column on desktop, and at the bottom a
box "Mehr zu <Spiel>" SHALL hold the cards the game has, each a link with a one-line description: Demo when the game
has a demo script, Inhalte when the game has a content pool, and Erklärung when the game has an explanation deck. A
game with a demo SHALL use its Demo card as the way to learn the game, and its line SHALL say so; a game with an
explanation deck SHALL use its Erklärung card for that. The route `/spiele/<slug>/erklaerung` SHALL exist only for a
game with an explanation deck; for every other game an old link to it gets the normal unknown-route 404, with no
redirect. All games SHALL use the same layout. The Demo card SHALL be the only way into a game's demo; the play header
offers no Demo (game-engine "Play header").

#### Scenario: Start banner carries title, badge and player range
- **WHEN** the Imposter start screen is opened
- **THEN** a banner shows the heading "Imposter", the badge "I", "3–12 Spieler" and the Imposter pitch
- **proof:** e2e

#### Scenario: Start panel first on phone, right column on desktop
- **WHEN** a start screen is rendered at 390px and at 1280px
- **THEN** at 390px the "Los geht's" panel sits above "So geht's" and the "Mehr zu" box comes last; at 1280px the panel sits to the right of "So geht's", top-aligned with it, and the "Mehr zu" box spans below both
- **proof:** e2e

#### Scenario: Same start layout for both games
- **WHEN** the start screens of all seven games are rendered
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

### Requirement: Start screens of the new games
The Codes, What Rhymes with Duck and Most Likely To start screens SHALL carry their own "So geht's" rules (three
lines each, neutral German) and count their content with their own nouns: Codes and Duck "Wort" / "Wörter", Most
Likely To "Spruch" / "Sprüche". Most Likely To's rules SHALL describe the team game: a team per turn, pointing on
three, points for the largest group that pointed at the same person, the team with the most points wins.

#### Scenario: So geht's for the new games
- **WHEN** the Codes, Duck and Most Likely To start screens are opened
- **THEN** each "So geht's" holds three rules, the first reading "In Teams: pro Runde kennen alle Erklärer dasselbe geheime Wort.", "Ein Wort wird für alle aufgedeckt, alle suchen gleichzeitig einen Reim darauf." and "Reihum ist ein Team dran und bekommt einen Spruch: Wer würde am ehesten …?" respectively, Most Likely To's rules name the team points and the winning team, and none contains "!"
- **proof:** e2e

#### Scenario: Inhalte card counts the seeded content
- **WHEN** on a fresh database the Codes, Duck and Most Likely To start screens are opened
- **THEN** the Inhalte cards read "91 Wörter ansehen und bearbeiten", "750 Wörter ansehen und bearbeiten" and "60 Sprüche ansehen und bearbeiten"
- **proof:** e2e

#### Scenario: New start banners carry title, badge and range
- **WHEN** the Codes, Duck and Most Likely To start screens are opened
- **THEN** the banners show "Codes" with badge "C" and "4–20 Spieler", "What Rhymes with Duck" with badge "W" and "4–16 Spieler", and "Most Likely To" with badge "M" and "4–20 Spieler", each with its pitch
- **proof:** e2e

### Requirement: Family Feud start screen
The Family Feud start screen SHALL carry the banner "Family Feud" with badge "F", "4–20 Spieler" and its pitch,
three neutral "So geht's" rules, and count its content as "Umfrage" / "Umfragen" in the Inhalte card of its "Mehr
zu Family Feud" box, which holds the Demo and Inhalte cards like every game.

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
- **THEN** the box "Mehr zu Family Feud" holds Demo and Inhalte and no Erklärung, and the Inhalte card reads "26 Umfragen ansehen und bearbeiten"
- **proof:** e2e

### Requirement: Player count before the lobby
A count-first game (Blood on the Clocktower) SHALL let the storyteller choose the player count N on its start screen,
before the lobby, with a stepper labelled "Spielerzahl" ("Weniger" / "Mehr", each at least 44px) limited to the
game's `minPlayers`–`maxPlayers` (5–15). The first time the start screen is shown, N SHALL default to the roster size
clamped to 5–15 and be stored on the device; afterwards the stored N SHALL be used everywhere (start screen, lobby,
explanation deck, reload) and roster changes SHALL NOT change it. A stored value outside the range or not a number
SHALL be replaced by the default. "Los geht's" SHALL be enabled for any valid N regardless of the roster size (the
lobby handles missing or extra players), and the start panel SHALL read "<N> Spieler · <k> im Kader".

#### Scenario: Count defaults to the roster size, clamped
- **WHEN** the Blood on the Clocktower start screen is opened for the first time with a roster of 9, of 3 and of 20 players (each in a fresh browser context)
- **THEN** the stepper shows 9, 5 and 15 respectively
- **proof:** e2e

#### Scenario: Count stays within 5 to 15
- **WHEN** "Weniger" is tapped at 5 and "Mehr" at 15
- **THEN** "Weniger" is disabled at 5, "Mehr" is disabled at 15, and the value never leaves 5–15
- **proof:** e2e

#### Scenario: Chosen count persists
- **WHEN** N is set to 11, the page is reloaded, the lobby is opened and the start screen is opened again
- **THEN** the start screen shows 11 after the reload and again on return, and the lobby asks for 11 players
- **proof:** e2e

#### Scenario: Roster changes keep the chosen count
- **WHEN** N is 8 with a roster of 8 and two players are then added on the Spieler screen
- **THEN** the start screen still shows 8 and reads "8 Spieler · 10 im Kader"
- **proof:** e2e

#### Scenario: Invalid stored count falls back to the default
- **WHEN** the stored count is "3", "16" or "abc" and the count is loaded for a roster of 7
- **THEN** the loaded count is 7 and the stored value is replaced by 7
- **proof:** unit

### Requirement: Blood on the Clocktower start screen
The Blood on the Clocktower start screen SHALL carry the banner "Blood on the Clocktower" with badge "B", "5–15 Spieler"
and the pitch "Eine Stadt sucht ihren Dämon, die Bösen lügen, eine Person erzählt.", three neutral "So geht's" rules,
the count stepper, and a box "Mehr zu Blood on the Clocktower" holding exactly one card, "Erklärung" →
`/spiele/clocktower/erklaerung` with the line "Spiel per Folien lernen, passend zur Spielerzahl". It SHALL show no Demo
card, no Inhalte card and no content check line. `/spiele/clocktower/demo` and `/spiele/clocktower/inhalte` SHALL be
answered with the normal 404. The Home tile SHALL show the same pitch.

#### Scenario: Clocktower banner, rules and pitch
- **WHEN** Home and the Blood on the Clocktower start screen are opened
- **THEN** the tile shows the pitch "Eine Stadt sucht ihren Dämon, die Bösen lügen, eine Person erzählt.", the banner shows "Blood on the Clocktower" with badge "B", "5–15 Spieler" and the pitch, and "So geht's" holds three rules, the first reading "Eine Person erzählt und führt das Grimoire, alle anderen bekommen geheim eine Rolle.", none containing "!"
- **proof:** e2e

#### Scenario: Erklärung card instead of Demo and Inhalte
- **WHEN** the Blood on the Clocktower start screen is opened
- **THEN** the box "Mehr zu Blood on the Clocktower" holds exactly one link, "Erklärung" → `/spiele/clocktower/erklaerung` with the line "Spiel per Folien lernen, passend zur Spielerzahl", no "Demo" or "Inhalte" link exists, no content check line is shown, and following "Erklärung" then closing it returns to the start screen
- **proof:** e2e

#### Scenario: Clocktower demo and Inhalte are not found
- **WHEN** `/spiele/clocktower/demo` and `/spiele/clocktower/inhalte` are opened
- **THEN** each response status is 404 with the normal not-found page, and neither redirects
- **proof:** e2e

