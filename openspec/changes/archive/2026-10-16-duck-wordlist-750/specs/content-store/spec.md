## MODIFIED Requirements

### Requirement: SQLite content store
Content SHALL live in a SQLite database via `node:sqlite`, with forward-only migrations applied at startup and
one structured table per content type: pair types `imposter_pairs` (crew, imposter) and `wavelength_spectra`
(left, right), and single-value types `codes_words` (word), `duck_words` (word) and `most_likely_prompts` (text).
The database file SHALL be gitignored.

#### Scenario: Fresh database runs with empty tables
- **WHEN** the server starts with no database file
- **THEN** all migrations are applied, every content table exists, the pair tables are empty, the single-value tables hold exactly their seed rows (91, 750, 60), and the app serves Home
- **proof:** e2e

#### Scenario: Migration failure refuses to start
- **WHEN** a migration throws during startup
- **THEN** the server does not start and the error names the failing migration
- **proof:** unit

### Requirement: Default content seeds
A forward-only seed migration SHALL fill the three single-value tables once: Codes 91 words (archive backup
`dev.db`, deduplicated), Duck 60 words and Most Likely To 60 prompts (archive backup `seeds/`), taken from
`/home/Rue/Repos/00_Archive/Party-Games-content-backup-2026-10-05/`. A later forward-only migration
`0009_duck_wordlist.sql` SHALL delete the 51 Duck seed words that fail the Duck criteria and insert 741 new ones
without duplicating rows, so Duck holds 750 seed words; it SHALL NOT touch the nine kept words (Katze, Gedicht,
Sonne, Regen, Blume, Mauer, Feder, Kette, Ente) nor any user-added word, and migration 0003 SHALL stay unchanged.
Like every migration they run once per database; entries the user later deletes SHALL stay deleted.

#### Scenario: Seeds land once on an existing database
- **WHEN** a database migrated before this change (only `0001_content.sql`, holding pairs) is migrated with all migrations, then migrated again
- **THEN** the pairs are unchanged, the three tables hold 91, 750 and 60 rows after the first run, and the second run adds nothing
- **proof:** unit

#### Scenario: Deleted seed entries stay deleted
- **WHEN** a seeded Codes word is deleted and the migrations run again
- **THEN** the word is still absent and the count is 90
- **proof:** unit

#### Scenario: Seed rows are clean
- **WHEN** the seed rows of a fresh database are read
- **THEN** every row is non-empty, at most 200 characters, and unique within its table
- **proof:** unit

#### Scenario: Migration 0009 upgrades an existing Duck list
- **WHEN** a database migrated up to 0008 holds the 60 old seed words plus the user's own word "Anker" and is migrated with all migrations
- **THEN** the 51 dropped seed words (Haus, Maus, Tatze, Bette, Rente, ...) are gone, the nine kept words and "Anker" are still there, and `duck_words` holds 751 rows
- **proof:** unit

#### Scenario: Migration 0009 keeps a deleted kept word deleted
- **WHEN** a database migrated up to 0008 had the kept word "Katze" deleted and is migrated with all migrations
- **THEN** "Katze" is still absent and `duck_words` holds 749 rows
- **proof:** unit

#### Scenario: Migration 0009 does not duplicate a word the user already added
- **WHEN** a database migrated up to 0008 holds the user's own word that is also one of the 741 new words and is migrated with all migrations
- **THEN** that word exists exactly once and `duck_words` holds 750 rows
- **proof:** unit

#### Scenario: Migration 0009 removes a dropped seed word the user re-added
- **WHEN** a database migrated up to 0008 had "Haus" deleted and re-added by the user, and is migrated with all migrations
- **THEN** "Haus" is gone (identical text to the seed, accepted)
- **proof:** unit

#### Scenario: Fresh database yields exactly the 750 seed words
- **WHEN** a fresh database is migrated with 0003 followed by 0009
- **THEN** `duck_words` holds exactly 750 rows and the second migrate run changes nothing
- **proof:** unit
