## MODIFIED Requirements

### Requirement: SQLite content store
Content SHALL live in a SQLite database via `node:sqlite`, with forward-only migrations applied at startup and
one structured table per content type: pair types `imposter_pairs` (crew, imposter) and `wavelength_spectra`
(left, right), and single-value types `codes_words` (word), `duck_words` (word) and `most_likely_prompts` (text).
The database file SHALL be gitignored.

#### Scenario: Fresh database runs with empty tables
- **WHEN** the server starts with no database file
- **THEN** all migrations are applied, every content table exists, the pair tables are empty, the single-value tables hold exactly their seed rows (91, 60, 60), and the app serves Home
- **proof:** e2e

#### Scenario: Migration failure refuses to start
- **WHEN** a migration throws during startup
- **THEN** the server does not start and the error names the failing migration
- **proof:** unit

#### Scenario: Migrations are applied once
- **WHEN** the server starts twice on the same database
- **THEN** each migration is recorded once and not re-run
- **proof:** unit

### Requirement: Content editor
Each game's start screen SHALL link to "Inhalte" (a card in its "Mehr zu <Spiel>" box), which lists the game's
content and lets the user add, edit, delete and bulk import entries: `a | b` per line for pair types, one entry per
line for single-value types.

#### Scenario: Add, edit and delete an entry
- **WHEN** the user adds "Hund | Katze", edits it to "Hund | Maus", then deletes it and confirms
- **THEN** the list shows the entry, then the edited entry, then no entry
- **proof:** e2e

#### Scenario: Delete asks for confirmation
- **WHEN** the user clicks delete and cancels the confirmation
- **THEN** the entry is still there
- **proof:** e2e

#### Scenario: Bulk import reports skipped and malformed lines
- **WHEN** the user bulk-imports lines containing an empty line, a line without `|` on line 3 and a duplicate of an existing entry
- **THEN** the empty line is skipped, line 3 is reported by number, the duplicate is skipped and counted, and all other lines are imported
- **proof:** unit

#### Scenario: Overlong text rejected
- **WHEN** an entry side is longer than the length limit
- **THEN** it is not saved and a message states the limit
- **proof:** unit

## ADDED Requirements

### Requirement: Single-value content
The content store SHALL support single-value content types (one text per entry) next to pair types: list, add,
edit, delete and bulk import through the same API and Inhalte page, with the same 200-character limit and the same
duplicate handling as pairs. In bulk import every non-empty line SHALL be one entry, `|` included as text. Single
entries SHALL be returned as `{ id, a, b: '' }`. Pair types SHALL behave as before.

#### Scenario: Add, edit and delete a single entry
- **WHEN** on the Codes Inhalte page the user adds "Laterne", edits it to "Leuchtturm-Laterne", then deletes it and confirms
- **THEN** the page shows one text field per entry (no second side), and the list shows the entry, then the edited entry, then no entry
- **proof:** e2e

#### Scenario: Single bulk import reports skipped, overlong and duplicate lines
- **WHEN** a single-value type bulk-imports "Anker", an empty line, a 201-character line on line 3, "Anker" again and "A | B"
- **THEN** "Anker" and "A | B" are imported, the empty line is skipped, line 3 is reported by number with the limit, and the second "Anker" is counted as duplicate
- **proof:** unit

#### Scenario: Duplicate single entry rejected
- **WHEN** "Anker" exists and the user adds "Anker" again, or edits another entry to "Anker"
- **THEN** it is not saved and "Diesen Eintrag gibt es schon." is shown (status 409)
- **proof:** unit

#### Scenario: Overlong single entry rejected
- **WHEN** a single entry longer than 200 characters is added or edited
- **THEN** it is not saved and the message states the limit (status 400)
- **proof:** unit

#### Scenario: Bulk import of single entries on the Inhalte page
- **WHEN** on the Duck Inhalte page the user pastes three new words, one per line, and imports
- **THEN** the report reads 3 imported and the three words are listed
- **proof:** e2e

### Requirement: Default content seeds
A forward-only seed migration SHALL fill the three single-value tables once: Codes 91 words (archive backup
`dev.db`, deduplicated), Duck 60 words and Most Likely To 60 prompts (archive backup `seeds/`), taken from
`/home/Rue/Repos/00_Archive/Party-Games-content-backup-2026-10-05/`. Like every migration it runs once per
database; entries the user later deletes SHALL stay deleted.

#### Scenario: Seeds land once on an existing database
- **WHEN** a database migrated before this change (only `0001_content.sql`, holding pairs) is migrated with all migrations, then migrated again
- **THEN** the pairs are unchanged, the three tables hold 91, 60 and 60 rows after the first run, and the second run adds nothing
- **proof:** unit

#### Scenario: Deleted seed entries stay deleted
- **WHEN** a seeded Codes word is deleted and the migrations run again
- **THEN** the word is still absent and the count is 90
- **proof:** unit

#### Scenario: Seed rows are clean
- **WHEN** the seed rows of a fresh database are read
- **THEN** every row is non-empty, at most 200 characters, and unique within its table
- **proof:** unit
