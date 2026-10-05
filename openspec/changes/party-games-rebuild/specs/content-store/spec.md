## ADDED Requirements

### Requirement: SQLite content store
Content SHALL live in a SQLite database via `node:sqlite`, with forward-only migrations applied at startup and
one structured table per content type (`imposter_pairs`: crew, imposter; `wavelength_spectra`: left, right).
The database file SHALL be gitignored.

#### Scenario: Fresh database runs with empty tables
- **WHEN** the server starts with no database file
- **THEN** all migrations are applied, the content tables exist and are empty, and the app serves Home
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
Each game's start screen SHALL link to "Inhalte", which lists the game's content and lets the user add, edit,
delete and bulk import entries (`a | b` per line).

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

### Requirement: Importer
`npm run import -- <old-db> --into <new.db>` SHALL read an old-schema SQLite file and import
`imposter_prompts` (crew_question, imposter_question) and `wavelength_prompts` (left_text, right_text) into the
new schema, printing counts per table.

#### Scenario: Import prints counts
- **WHEN** the importer runs on an old-schema fixture with 3 imposter and 2 wavelength rows
- **THEN** the new database holds 3 pairs and 2 spectra and the output prints both counts
- **proof:** unit

#### Scenario: Re-running the import adds no duplicates
- **WHEN** the importer runs twice into the same target
- **THEN** the row counts after the second run equal those after the first
- **proof:** unit

#### Scenario: Missing table is named, the other still imported
- **WHEN** the old database has `imposter_prompts` but no `wavelength_prompts`
- **THEN** the importer names the missing table, imports the imposter rows, and exits non-zero
- **proof:** unit

#### Scenario: Source missing or not SQLite
- **WHEN** the source path does not exist, is not a SQLite file (including a zero-byte file), or holds neither `imposter_prompts` nor `wavelength_prompts`
- **THEN** the importer prints a clear error and exits non-zero without creating the target
- **proof:** unit

#### Scenario: Name placeholders preserved
- **WHEN** an imported question contains `{NAME}` or `{NAME2}`
- **THEN** the stored text contains the placeholder unchanged
- **proof:** unit

### Requirement: Minimum content pool
A game SHALL NOT start without enough content; it says so and links to Inhalte.

#### Scenario: Empty pool blocks start
- **WHEN** the Imposter content table is empty and the start screen is opened with enough players
- **THEN** start is disabled, a message says content is missing, and a link leads to Inhalte
- **proof:** e2e

#### Scenario: Demo works with an empty database
- **WHEN** the content tables are empty and the user starts a game's Demo
- **THEN** the Demo runs on its committed fixtures
- **proof:** e2e
