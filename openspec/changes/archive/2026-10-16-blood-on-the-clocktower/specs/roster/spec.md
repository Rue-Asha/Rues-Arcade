## MODIFIED Requirements

### Requirement: Roster against game limits
A game's start SHALL be gated on its player limits. For a count-first game (Blood on the Clocktower) the lobby SHALL
require exactly the chosen count N of roster players: with fewer, it SHALL say how many are missing and offer "Spieler
hinzufügen", which opens Spieler and returns to the lobby; with more, it SHALL show "Wer spielt mit?" with the first N
roster players preselected, allow at most N selected (further boxes disabled once N are chosen) and enable "Weiter" only
at exactly N; with exactly N, it SHALL go straight to the game's start. Saved players and guests SHALL both count. The
lobby SHALL read N when it opens, so an N changed on the start screen applies the next time the lobby is shown.

#### Scenario: Below minimum disables start
- **WHEN** the roster has 2 players and the Imposter start screen is opened
- **THEN** "Los geht's" is disabled and shows "mind. 3 Spieler"
- **proof:** e2e

#### Scenario: Above maximum asks who plays
- **WHEN** the roster has more players than the game's maximum
- **THEN** the lobby asks the user to pick who plays and start is enabled only once the selection is within limits
- **proof:** e2e

#### Scenario: Fewer than N offers adding players
- **WHEN** N is 7, the roster holds 5 players and the Blood on the Clocktower lobby is opened, then "Spieler hinzufügen" is followed, two guests are added and the way back is taken
- **THEN** the lobby first reads "Für 7 Spieler fehlen noch 2 im Kader." with "Spieler hinzufügen" linking to `/spieler?from=/spiele/clocktower/lobby`, and after adding two players it is back in the lobby with the start shown
- **proof:** e2e

#### Scenario: More than N picks exactly N
- **WHEN** N is 7 and the roster holds 9 players
- **THEN** "Wer spielt mit?" shows "7 von 7 gewählt" with the first 7 checked and the other 2 disabled, unchecking one enables them and disables "Weiter" ("6 von 7 gewählt"), and "Weiter" is enabled again only at exactly 7
- **proof:** e2e

#### Scenario: Exactly N goes to the start
- **WHEN** N is 5 and the roster holds 3 saved players and 2 guests, among them "Jürgen" and "Özlem"
- **THEN** the lobby shows no picker, lists all 5 names including "Jürgen" and "Özlem", and "Spiel starten" opens the play screen with those 5 players in roster order
- **proof:** e2e

#### Scenario: Count changed while in the lobby
- **WHEN** N is 7 with 9 roster players, two picks are changed in the lobby, the start screen is opened, N is set to 8 and the lobby is opened again
- **THEN** the picker reads "8 von 8 gewählt" with the first 8 roster players checked
- **proof:** e2e

#### Scenario: Roster above the Clocktower maximum
- **WHEN** N is 15 and the roster holds 18 players
- **THEN** the lobby shows the picker limited to 15 and starts with exactly the 15 checked players
- **proof:** e2e
