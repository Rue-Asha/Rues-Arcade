## MODIFIED Requirements

### Requirement: Shared roster
The Spieler screen SHALL let the user add, rename, remove and reorder players in one roster shared by all games
and remembered on the device. Each roster entry SHALL be either a saved player (linked to its `players` row) or a
guest (free text); names SHALL be unique across both kinds, case-insensitively. Saved players SHALL be renamed only
through the saved-player store; removing a saved player's entry from the roster SHALL NOT delete the saved player.

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

#### Scenario: Removing a saved player's entry keeps the saved player
- **WHEN** the roster holds saved player "Alex" and the user removes the entry
- **THEN** the roster no longer holds Alex and the saved-player list still does
- **proof:** unit

## ADDED Requirements

### Requirement: Saved players and guests in the roster
Saved players SHALL be added to the roster by tapping them in the saved list; typed names SHALL be added as guests,
unless they match a saved player (case-insensitive, trimmed), in which case the saved player is added. Each roster
row SHALL show its kind: guests carry a "Gast" tag.

#### Scenario: Tapping a saved player adds it to the roster
- **WHEN** "Ute" is saved and the user taps "Ute" in the saved list, then types "Gustav"
- **THEN** the roster shows "Ute" without a tag and "Gustav" with "Gast"
- **proof:** e2e

#### Scenario: Typed name matching a saved player adds the saved player
- **WHEN** "Alex" is saved and the user types " alex "
- **THEN** the roster holds one entry named "Alex" linked to the saved player, not a guest
- **proof:** unit

#### Scenario: Saved player already in the roster is not added twice
- **WHEN** saved player "Alex" is in the roster and the user taps it again or types "alex"
- **THEN** the roster still holds one "Alex" and a message says Alex is already in
- **proof:** unit

#### Scenario: Guest named like a roster entry rejected
- **WHEN** the roster holds guest "Gustav" and the user types "gustav"
- **THEN** no entry is added and the message says Gustav is already in
- **proof:** unit

### Requirement: Save a guest in place
A guest entry SHALL offer "Speichern"; saving it SHALL create the saved player (or link to an existing one of that
name) and turn the entry into a saved-player entry at the same position.

#### Scenario: Saving a guest links it in place
- **WHEN** the roster is guest "Bo", guest "Gustav", guest "Cleo" and the user saves "Gustav"
- **THEN** the saved list holds "Gustav", and the roster is Bo, Gustav, Cleo with Gustav linked to the new saved player and no longer a guest
- **proof:** unit

#### Scenario: Saving a guest whose name is already saved links to it
- **WHEN** the roster holds guest "alex", "Alex" is then saved in the saved-player section, and the user saves the guest
- **THEN** no second saved player is created and the entry is linked to the existing "Alex" at the same position
- **proof:** unit

#### Scenario: Speichern on a guest row
- **WHEN** the user types "Wanda", taps "Speichern" on its row and reloads
- **THEN** the row has no "Gast" tag and "Wanda" is listed under "Gespeicherte Spieler"
- **proof:** e2e

### Requirement: Saved-player changes follow into the roster
Renaming a saved player SHALL rename every roster entry linked to it; deleting one SHALL ask for confirmation and
remove its roster entry. Running sessions SHALL keep their copied players.

#### Scenario: Renaming a saved player renames its roster entry
- **WHEN** saved player "Alex" is in the roster at position 2 and is renamed to "Alexander"
- **THEN** the roster shows "Alexander" at position 2 with the same id
- **proof:** unit

#### Scenario: Deleting a saved player removes its roster entry
- **WHEN** saved player "Rita" is in the roster and the user deletes "Rita" in the saved list and confirms
- **THEN** "Rita" is neither in the saved list nor in the roster, also after a reload
- **proof:** e2e

#### Scenario: Deleting a saved player mid-game keeps the session snapshot
- **WHEN** a session was started with saved player "Alex" and "Alex" is then deleted
- **THEN** the stored session still contains "Alex" with the same id
- **proof:** unit

### Requirement: Link existing roster entries on load
On every app load the roster SHALL fetch the saved players, refresh the names of linked entries, and link unlinked
entries whose trimmed name matches a saved player case-insensitively; at most one entry links to a saved player, the
rest stay guests. If the server cannot be reached nothing SHALL change and the next load tries again. The lobby SHALL
wait for this first sync before taking its player selection.

#### Scenario: Matching guests become linked on load
- **WHEN** the stored roster is guests "alex", "Gustav" and "Bo" and "Alex" and "Bo" are saved
- **THEN** after the sync "alex" and "Bo" are linked in place (keeping their positions) and "Gustav" stays a guest
- **proof:** unit

#### Scenario: Two entries matching one saved player
- **WHEN** the stored roster holds guests "Alex" and "alex " and "Alex" is saved
- **THEN** the first entry links, the second stays a guest
- **proof:** unit

#### Scenario: Server unreachable leaves the roster unchanged
- **WHEN** the sync request fails, and on the next load the server answers
- **THEN** the roster is unchanged after the failed sync and linked after the next one
- **proof:** unit

#### Scenario: Old roster shows linked after the update
- **WHEN** a roster stored before this change (ids `p1`, `p2`) holds "Vera" and "Gustav" and "Vera" is saved, and Spieler is opened
- **THEN** "Vera" shows without "Gast" and "Gustav" with "Gast"
- **proof:** e2e

### Requirement: Stable player identity
Games SHALL keep receiving `Player { id, name }`. A saved player's id SHALL be derived from its DB id
(`player-<dbId>`), so it is the same across sessions and devices; a guest's id SHALL stay client-generated. Demo
players SHALL never touch the saved-player store.

#### Scenario: Saved player id is the same on every device
- **WHEN** two rosters with separate storage each add saved player "Alex"
- **THEN** both entries have the id `player-<dbId of Alex>`, and a guest added to each gets a different client id
- **proof:** unit

#### Scenario: Old session resumes after the update
- **WHEN** a session saved with pre-update ids (`p1`–`p3`) exists and the roster holding those names gets linked on load
- **THEN** reopening the game resumes the same phase with the same players
- **proof:** e2e

#### Scenario: Demo leaves saved players untouched
- **WHEN** saved player "Vera" exists and a game's Demo is played to the end
- **THEN** `GET /api/players` returns the same list as before and the roster is unchanged
- **proof:** e2e
