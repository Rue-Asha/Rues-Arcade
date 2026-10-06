## ADDED Requirements

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
- **THEN** `feud_surveys` holds 26 surveys after the first run and the second run adds nothing
- **proof:** unit

#### Scenario: Deleted seed surveys stay deleted
- **WHEN** a seeded survey is deleted and the migrations run again
- **THEN** the survey is still absent and the count is 25
- **proof:** unit

#### Scenario: Seed surveys are valid
- **WHEN** the seed surveys of a fresh database are read
- **THEN** every survey passes the survey validation and all 26 questions are distinct ignoring case
- **proof:** unit
