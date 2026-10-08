## MODIFIED Requirements

### Requirement: Gespeicherte Spieler section
The Spieler page SHALL show a "Gespeicherte Spieler" section listing the saved players alphabetically, with an add
field, rename and delete (delete asks for confirmation). The list SHALL page through the shared Pager (design-system
"Pager"), 6 players per page below 1024px viewport width and 12 from 1024px, alphabetical across pages; with no saved
players the empty state SHALL show no pager. Saving a player SHALL show the page that holds it; deleting the last
player of a page SHALL go to the page before it. The roster list on the same page SHALL stay unpaged. Server
rejections SHALL be shown as the section's message. If the server cannot be reached the section SHALL show an error
line, and the roster SHALL keep working with guests.

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
- **THEN** the section shows one sentence explaining saved players and the add field, and no "Seiten" navigation
- **proof:** e2e

#### Scenario: Server unreachable keeps guests working
- **WHEN** requests to `/api/players` fail and the user opens Spieler and types "Gustav"
- **THEN** the section shows an error line, and "Gustav" is added to the roster as a guest
- **proof:** e2e

#### Scenario: Saved players page by width
- **WHEN** on a server with 13 saved players Spieler is opened at 390px and at 1280px, and "Weiter" is tapped
- **THEN** at 390px the section lists 6 players and its pager reads "Seite 1 von 3"; at 1280px 12 players and "Seite 1 von 2"; the first name after "Weiter" sorts after the last name of page 1
- **proof:** e2e

#### Scenario: Deleting the last saved player on a page goes back a page
- **WHEN** on a server with 7 saved players at 390px the user opens page 2 (one player) and deletes that player with confirmation
- **THEN** the section lists 6 players and shows no "Seiten" navigation
- **proof:** e2e

#### Scenario: Saving a player shows its page
- **WHEN** on a server with 12 saved players named "Anna 01" to "Anna 12" at 390px the user saves "Zora" while page 1 is shown
- **THEN** the section's pager reads "Seite 3 von 3" and "Zora" is listed
- **proof:** e2e

#### Scenario: Roster stays unpaged
- **WHEN** the roster holds 13 players and Spieler is opened at 390px
- **THEN** all 13 roster entries are listed and the roster section holds no "Seiten" navigation
- **proof:** e2e
