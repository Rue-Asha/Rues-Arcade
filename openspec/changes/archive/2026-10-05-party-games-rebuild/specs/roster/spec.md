## ADDED Requirements

### Requirement: Shared roster
The Spieler screen SHALL let the user add, rename, remove and reorder players in one roster shared by all games
and remembered on the device.

#### Scenario: Roster survives reload
- **WHEN** the user adds Alex and Bo, moves Bo above Alex and reloads
- **THEN** the roster shows Bo, Alex in that order
- **proof:** e2e

#### Scenario: Rename and remove a player
- **WHEN** the user renames Alex to Ali and removes Bo
- **THEN** the roster contains only Ali
- **proof:** unit

#### Scenario: Empty or whitespace name rejected
- **WHEN** the user submits "" or "   " as a name
- **THEN** no player is added and a message explains why
- **proof:** unit

#### Scenario: Duplicate name rejected
- **WHEN** the roster contains "Alex" and the user adds or renames to "alex"
- **THEN** the change is rejected with a message
- **proof:** unit

#### Scenario: First run shows empty roster prompt
- **WHEN** the app is opened with no stored roster
- **THEN** Spieler shows an empty-state prompt to add players
- **proof:** e2e

#### Scenario: Storage unavailable works for the session
- **WHEN** `localStorage` throws on access
- **THEN** players can still be added and used until the page is closed
- **proof:** unit

### Requirement: Roster against game limits
A game's start SHALL be gated on its player limits.

#### Scenario: Below minimum disables start
- **WHEN** the roster has 2 players and the Imposter start screen is opened
- **THEN** "Los geht's" is disabled and shows "mind. 3 Spieler"
- **proof:** e2e

#### Scenario: Above maximum asks who plays
- **WHEN** the roster has more players than the game's maximum
- **THEN** the lobby asks the user to pick who plays and start is enabled only once the selection is within limits
- **proof:** e2e
