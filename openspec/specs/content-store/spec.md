# content-store Specification

## Purpose
TBD - created by archiving change party-games-rebuild. Update Purpose after archive.
## Requirements
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

The list SHALL show the newest entries first and page through the shared Pager (design-system "Pager"): 6 entries or
survey cards per page below 1024px viewport width, 12 from 1024px, for every content type, Family Feud survey cards
included. There SHALL be no "Mehr anzeigen" button. An empty list SHALL show the existing empty state and no pager.
Adding an entry or importing entries SHALL go to page 1, which shows the newest entry first. Deleting the last entry of
the last page SHALL go to the page before it. On desktop the side column with the add form and bulk import SHALL stay
within the viewport and scroll on its own.

#### Scenario: Inhalte pages by width
- **WHEN** on a fresh database the Codes Inhalte page (91 words) is opened at 390px and at 1280px, and "Weiter" is tapped
- **THEN** at 390px the list holds 6 entries and the pager reads "Seite 1 von 16"; at 1280px it holds 12 entries and reads "Seite 1 von 8"; after "Weiter" it reads "Seite 2 von …" and holds other entries than page 1; no "Mehr anzeigen" button exists
- **proof:** e2e

#### Scenario: Survey cards page by width
- **WHEN** on a fresh database the Family Feud Inhalte page (247 surveys) is opened at 390px and at 1280px
- **THEN** at 390px 6 survey cards are listed and the pager reads "Seite 1 von 42"; at 1280px 12 cards and "Seite 1 von 21"
- **proof:** e2e

#### Scenario: Empty content list shows no pager
- **WHEN** on a fresh database the Imposter Inhalte page (no pairs) is opened
- **THEN** the existing empty state is shown and no "Seiten" navigation exists
- **proof:** e2e

#### Scenario: Added entry shows on page 1
- **WHEN** on a fresh database the user goes to page 3 of the Codes Inhalte list and adds "Zeppelinhafen"
- **THEN** the pager reads "Seite 1 von …" and "Zeppelinhafen" is the first entry of the list
- **proof:** e2e

#### Scenario: Deleting the last entry on the last page goes back a page
- **WHEN** on a fresh database at 390px the user opens page 16 of the Codes Inhalte list (one entry) and deletes that entry with confirmation
- **THEN** the pager reads "Seite 15 von 15" and the list holds 6 entries
- **proof:** e2e

#### Scenario: Import goes to page 1
- **WHEN** on a fresh database the user is on page 2 of the Duck Inhalte list and imports three new words
- **THEN** the pager reads "Seite 1 von …" and the three words are listed on that page
- **proof:** e2e

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
- **THEN** "Los geht's" is disabled, a message says content is missing, and a link leads to Inhalte
- **proof:** e2e

#### Scenario: Demo works with an empty database
- **WHEN** the content tables are empty and the user starts a game's Demo
- **THEN** the Demo runs on its committed fixtures
- **proof:** e2e

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

### Requirement: Survey content type
The content store SHALL hold Family Feud surveys in their own table `feud_surveys` (ContentType `feud_surveys`):
a question, unique ignoring case, and 3–8 answers in entry order, each a text and a whole number of points above
0, the points summing to at most 100; question and answers at most 200 characters, answer texts unique within a
survey. The board order SHALL be points descending, equal points in entry order. A table `feud_played` SHALL link
surveys to saved players (`players`) with ON DELETE CASCADE on both sides. The content API under
`/api/content/feud_surveys` SHALL list, add, edit, delete and bulk import surveys; the Inhalte page SHALL show
survey cards (question and answers), an edit form with one row per answer (add and remove rows), delete with
confirmation, and bulk import with one survey per line in the format `Frage | Antwort : Zahl | …`, each answer
split on its last `:`, reporting errors per line.

#### Scenario: Add, edit and delete a survey
- **WHEN** on the Family Feud Inhalte page the user adds a survey with 3 answer rows, edits it to add a fourth row and change a points value, then deletes it and confirms
- **THEN** the list shows the survey card with 3 answers, then with 4 answers and the new points, then no such card
- **proof:** e2e

#### Scenario: Survey board order by points
- **WHEN** a survey is entered with answers A 10, B 30, C 10, D 20
- **THEN** its board order is B, D, A, C
- **proof:** unit

#### Scenario: Duplicate survey question rejected
- **WHEN** a survey "Nenne ein Obst" exists and a survey "nenne ein obst " is added, or another survey is edited to that question
- **THEN** it is not saved and "Diese Frage gibt es schon." is returned with status 409
- **proof:** unit

#### Scenario: Duplicate answer within a survey rejected
- **WHEN** a survey is saved with the answers "Apfel" and "apfel"
- **THEN** it is not saved and a message says each answer may appear only once (status 400)
- **proof:** unit

#### Scenario: Survey points must be whole numbers above zero
- **WHEN** a survey is saved with an answer of 0, -3, 2.5 or "x" points
- **THEN** it is not saved and a message says points are whole numbers above 0 (status 400)
- **proof:** unit

#### Scenario: Survey points sum at most 100
- **WHEN** a survey is saved with points summing to 101, and another with points summing to 100
- **THEN** the first is rejected with a message stating the limit of 100 (status 400), the second is saved
- **proof:** unit

#### Scenario: Survey needs three to eight answers
- **WHEN** surveys with 2, 3, 8 and 9 answers are saved
- **THEN** those with 2 and 9 answers are rejected with a message stating 3 to 8 answers (status 400), those with 3 and 8 are saved
- **proof:** unit

#### Scenario: Overlong survey text rejected
- **WHEN** a survey with a 201-character question, or with a 201-character answer, is saved
- **THEN** it is not saved and the message states the limit of 200 characters (status 400)
- **proof:** unit

#### Scenario: Survey bulk import reports per line
- **WHEN** a bulk import holds a valid survey with the answer "Uhr: 12:00 : 30", an empty line, a line without "|" on line 3, a survey with 2 answers on line 4 and a survey whose question already exists
- **THEN** the valid survey is imported with the answer text "Uhr: 12:00" and 30 points, the empty line is skipped, lines 3 and 4 are reported by number with their reason, and the existing question is counted as duplicate
- **proof:** unit

#### Scenario: Bulk import of surveys on the Inhalte page
- **WHEN** on the Family Feud Inhalte page the user pastes two new surveys, one per line, and imports
- **THEN** the report reads 2 imported and both survey cards are listed
- **proof:** e2e

#### Scenario: Deleting a survey removes its played-with entries
- **WHEN** a survey whose played-with list holds 2 players is deleted
- **THEN** `feud_played` holds no row for that survey and the players are unchanged
- **proof:** unit

### Requirement: Default survey seeds
A forward-only seed migration SHALL fill `feud_surveys` once with the 26 surveys of the archive backup
(`/home/Rue/Repos/00_Archive/Party-Games-content-backup-2026-10-05/dev.db`, table `surveys`, `count` as points).
Like every migration it runs once per database; surveys the user later deletes SHALL stay deleted.

#### Scenario: Surveys seeded once
- **WHEN** a database migrated through `0004` is migrated with all migrations, then migrated again
- **THEN** `feud_surveys` holds 247 surveys after the first run and the second run adds nothing
- **proof:** unit

#### Scenario: Deleted seed surveys stay deleted
- **WHEN** a seeded survey is deleted and the migrations run again
- **THEN** the survey is still absent and the count is 246
- **proof:** unit

#### Scenario: Seed surveys are valid
- **WHEN** the seed surveys of a fresh database are read
- **THEN** every survey passes the survey validation and all 247 questions are distinct ignoring case
- **proof:** unit

### Requirement: Show survey seeds
A forward-only migration `0007` SHALL delete the 15 placeholder surveys of `0006` (the 12 generic ones plus the
three superseded by an original: Schneemann, Löcher, Auto) and insert 236 surveys from the show, translated into
German from the classpoint.io and BuzzFeed lists. Questions that only work in English (word play, rhymes, letter
or word completions) or only make sense in the US are left out. A survey the user already has under the same
question SHALL stay as it is; played-with entries of a deleted placeholder go with it.

#### Scenario: Show surveys replace the placeholders
- **WHEN** a database migrated through `0006`, holding a played-with entry on a placeholder and a user survey under a
  question that `0007` also inserts, is migrated with all migrations
- **THEN** the placeholder and its played-with entry are gone, the user survey keeps its answers, the 11 remaining
  `0006` surveys are kept and `feud_surveys` holds 247 surveys
- **proof:** unit

