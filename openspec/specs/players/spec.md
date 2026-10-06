# players Specification

## Purpose
TBD - created by archiving change player-database. Update Purpose after archive.
## Requirements
### Requirement: Saved-player store
The server SHALL keep saved players in a `players` table (`id INTEGER PRIMARY KEY AUTOINCREMENT`, so ids are never reused,, `name`, `created_at`), created by
the forward-only migration `0004_players.sql`, and SHALL offer a JSON API: `GET /api/players` lists all saved players
sorted alphabetically (case-insensitive), `POST /api/players` adds one, `PATCH /api/players/<id>` renames one and
`DELETE /api/players/<id>` deletes one. Names SHALL be trimmed, non-empty, at most 40 characters and unique
case-insensitively. Rejections SHALL carry a German `message`: 400 for an empty or overlong name, 409 for a duplicate,
404 for an unknown id.

#### Scenario: Add, rename, delete and list saved players
- **WHEN** "Cleo", " alex " and "Bo" are added, "Bo" is renamed to "Bea" and "Cleo" is deleted
- **THEN** the list is exactly "alex", "Bea" in that order, each with a numeric id, and the stored names are trimmed
- **proof:** unit

#### Scenario: Empty or whitespace saved name rejected
- **WHEN** "" or "   " is added, or a saved player is renamed to "   "
- **THEN** the response is 400 with "Bitte gib einen Namen ein." and the table is unchanged
- **proof:** unit

#### Scenario: Request without a usable name rejected
- **WHEN** `POST /api/players` or `PATCH /api/players/<id>` is sent with an empty body or the body `null`
- **THEN** the response is 400 with "Bitte gib einen Namen ein." and the table is unchanged
- **proof:** e2e

#### Scenario: Overlong saved name rejected
- **WHEN** a 41-character name is added or a saved player is renamed to one
- **THEN** the response is 400 with a message naming the limit of 40 characters and the table is unchanged
- **proof:** unit

#### Scenario: Duplicate saved name rejected
- **WHEN** "Alex" is saved and "ALEX " is added, or another saved player is renamed to "alex"
- **THEN** the response is 409 with a message naming the name and the table still holds one "Alex"
- **proof:** unit

#### Scenario: Unknown saved player id
- **WHEN** a missing id is renamed or deleted
- **THEN** the response is 404 with a message and the table is unchanged
- **proof:** unit

#### Scenario: Players API round trip on the server
- **WHEN** the running server receives a POST, PATCH, GET and DELETE on `/api/players` for a name unique to the test
- **THEN** the responses are 201, 200, 200 (listing the renamed player) and 204, and a final GET no longer lists it
- **proof:** e2e

### Requirement: Foreign keys for player references
Every database connection SHALL be opened with `PRAGMA foreign_keys = ON` (outside any migration transaction), so
tables that reference `players(id)` with `ON DELETE CASCADE` lose their rows when the player is deleted.

#### Scenario: Deleting a player cascades to referencing rows
- **WHEN** a database opened through `openDb` and migrated has a test table referencing `players(id) ON DELETE CASCADE`, holds a row for "Alex", and "Alex" is deleted through the store
- **THEN** the referencing row is gone and `PRAGMA foreign_keys` reads 1
- **proof:** unit

#### Scenario: Players table arrives once on an existing database
- **WHEN** a database migrated with `0001`–`0003` holding content is migrated with all migrations, then again
- **THEN** an empty `players` table exists, the content is unchanged and `0004_players.sql` is recorded once
- **proof:** unit

### Requirement: Gespeicherte Spieler section
The Spieler page SHALL show a "Gespeicherte Spieler" section listing the saved players alphabetically, with an add
field, rename and delete (delete asks for confirmation). Server rejections SHALL be shown as the section's message.
If the server cannot be reached the section SHALL show an error line, and the roster SHALL keep working with guests.

#### Scenario: Save, rename and delete in the Spieler page
- **WHEN** the user saves "Ute" and "Rita", renames "Ute" to "Uta", then deletes "Rita" and confirms
- **THEN** the section lists "Rita", "Ute", then "Rita", "Uta", then only "Uta", and after a reload still only "Uta"
- **proof:** e2e

#### Scenario: Deleting a saved player asks for confirmation
- **WHEN** the user taps delete on a saved player and cancels the confirmation
- **THEN** the saved player is still listed
- **proof:** e2e

#### Scenario: Duplicate saved name shows the server message
- **WHEN** "Ute" is saved and the user saves "ute" in the section
- **THEN** the section shows the 409 message and lists "Ute" once
- **proof:** e2e

#### Scenario: No saved players shows an empty state
- **WHEN** Spieler is opened on a server whose `players` table is empty
- **THEN** the section shows one sentence explaining saved players and the add field
- **proof:** e2e

#### Scenario: Server unreachable keeps guests working
- **WHEN** requests to `/api/players` fail and the user opens Spieler and types "Gustav"
- **THEN** the section shows an error line, and "Gustav" is added to the roster as a guest
- **proof:** e2e

