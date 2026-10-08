## MODIFIED Requirements

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
