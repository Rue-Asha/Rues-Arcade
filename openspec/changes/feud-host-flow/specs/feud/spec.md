## MODIFIED Requirements

### Requirement: Family Feud teams and rounds
The setup SHALL deal the chosen players into two teams alternately in roster order, let the user move a player to
the other team by tapping it, and reshuffle both teams with "Mischen". Team names SHALL be editable, default "Team
A" and "Team B"; an empty name SHALL fall back to its default; two names equal after trimming, ignoring case,
SHALL disable "Weiter" with "Die Teams brauchen verschiedene Namen.". While a team has fewer than 2 players
"Weiter" SHALL be disabled with "Jedes Team braucht mind. 2 Spieler.". Rounds SHALL be 1–8, default 3. The rounds
picker SHALL lay its options out in one horizontal row in ascending order, wrapping to a further row only when they
don't fit, without horizontal page scroll. While the database holds fewer than rounds + 1 surveys, "Weiter" SHALL be
disabled with a message stating both numbers and a link to `/spiele/family-feud/inhalte`. "Weiter" hands the device
to the host and opens the host prep.

#### Scenario: Feud teams dealt from the roster
- **WHEN** the Family Feud lobby is opened with 6 saved players
- **THEN** two teams of 3 named "Team A" and "Team B" are shown, the rounds offer 1–8 with 3 selected, and "Weiter" is enabled
- **proof:** e2e

#### Scenario: Feud rounds picker in one row on desktop
- **WHEN** the Family Feud lobby is opened at 1280px
- **THEN** the 8 round options share one row (same top edge), ordered 1 to 8 from left to right
- **proof:** e2e

#### Scenario: Feud rounds picker wraps on a phone
- **WHEN** the Family Feud lobby is opened at 390px
- **THEN** the round options fill rows left to right in ascending order, more than one option per row and at most two rows, and the page does not scroll horizontally
- **proof:** e2e

#### Scenario: Feud tap moves a player and Mischen keeps all players
- **WHEN** with 6 players a player of Team A is tapped, then "Mischen" is tapped
- **THEN** after the tap that player is in Team B (4 vs 2); after Mischen both teams together hold the same 6 players, each team at least 2
- **proof:** e2e

#### Scenario: Feud team below two blocks Weiter
- **WHEN** with 4 players one player is moved so a team has 1 player
- **THEN** "Weiter" is disabled and "Jedes Team braucht mind. 2 Spieler." is shown
- **proof:** e2e

#### Scenario: Feud empty team name falls back
- **WHEN** the name of Team B is cleared and "Weiter" is tapped
- **THEN** the host prep names the teams "Team A" and "Team B"
- **proof:** e2e

#### Scenario: Feud identical team names rejected
- **WHEN** both teams are named "Füchse" and "füchse "
- **THEN** "Weiter" is disabled and "Die Teams brauchen verschiedene Namen." is shown
- **proof:** e2e

#### Scenario: Feud too few surveys block start
- **WHEN** on a fresh database all but 3 surveys are deleted and the setup is opened with 3 rounds, then 2 rounds are chosen
- **THEN** with 3 rounds "Weiter" is disabled, the message reads "Für 3 Runden braucht ihr mind. 4 Umfragen, es gibt 3." and a link leads to `/spiele/family-feud/inhalte`; with 2 rounds "Weiter" is enabled
- **proof:** e2e

### Requirement: Family Feud host prep
The host prep SHALL show every survey in the database as a card in a grid: 1 column at 390px, at least 2 columns at
1280px with the grid spanning the content width. Each card SHALL show, without expanding, the question (wrapping
when long) and all its answers with points in board order (a two-column answer list on wide cards is allowed), plus
"k von n kennen sie" (k = players of this game on its played-with list, n = players of this game), "gespielt mit X"
(size of its played-with list) or "neu" when that list is empty, and a badge "alle kennen sie" when k = n. Each card
SHALL have a "Gespielt mit" section, collapsed by default, that expands and collapses per card, is not persisted, and
holds the played-with list with add and remove, or "Noch niemand." when the list is empty. The prep SHALL sort by
known (k) or by played (X), ascending, known by default. The host SHALL pick up to N surveys for N rounds, in pick
order, and remove a pick; each filled slot SHALL show its survey as a card with the question and all answers with
points. Picking or unpicking SHALL NOT move any other card of the grid to another row or column. "Start" SHALL be
enabled only when all N slots are filled and SHALL start the game with the picked surveys as rounds and a tiebreak
survey drawn like "Zufällig auffüllen" from the surveys not picked.

#### Scenario: Feud prep shows who knows a survey
- **WHEN** survey X's played-with list holds 2 of the game's 4 players and 1 other saved player, survey Y's list is empty, and the host prep is opened
- **THEN** X's card shows "2 von 4 kennen sie" and "gespielt mit 3", and Y's card shows "neu", both with "Gespielt mit" collapsed
- **proof:** e2e

#### Scenario: Feud prep sorts by known and by played
- **WHEN** surveys with different known and played counts are listed and the sort is switched from known to played
- **THEN** the cards, read across all pages, are first ordered by k ascending, then by X ascending
- **proof:** e2e

#### Scenario: Feud prep refuses an extra pick
- **WHEN** with 2 rounds the host picks 2 surveys and then taps a third
- **THEN** the third is not picked, "Schon 2 Umfragen gewählt." is shown and the 2 picks stay
- **proof:** e2e

#### Scenario: Feud survey everyone knows stays pickable
- **WHEN** a survey's played-with list holds all players of the game
- **THEN** it shows the badge "alle kennen sie" and can still be picked
- **proof:** e2e

#### Scenario: Feud prep card shows all answers
- **WHEN** the host prep is opened and the card of the seeded survey with 8 answers is looked at without tapping anything
- **THEN** the card shows its question and all 8 answers with their points, ordered by points descending
- **proof:** e2e

#### Scenario: Feud prep card wraps a long question
- **WHEN** a survey with a question of 150 characters is shown in the prep at 390px
- **THEN** the question wraps inside its card, the card is no wider than the grid and the page does not scroll horizontally
- **proof:** e2e

#### Scenario: Feud picked slot shows the survey
- **WHEN** the host picks a survey
- **THEN** its slot shows the survey's question and all its answers with points
- **proof:** e2e

#### Scenario: Feud played-with section collapses per card
- **WHEN** the host expands "Gespielt mit" on one card, then reloads the prep
- **THEN** before the reload only that card shows its played-with list and the other cards stay collapsed with their badges visible; after the reload every card is collapsed
- **proof:** e2e

#### Scenario: Feud played-with section with nobody on the list
- **WHEN** the host expands "Gespielt mit" on a survey whose played-with list is empty
- **THEN** the section shows "Noch niemand." and an add control for every saved player
- **proof:** e2e

#### Scenario: Feud prep grid by width
- **WHEN** the host prep is opened at 390px and at 1280px
- **THEN** at 390px the cards lie in 1 column; at 1280px they lie in at least 2 columns and the grid spans the content width
- **proof:** e2e

#### Scenario: Feud picking keeps the grid in place
- **WHEN** the host picks a card of the grid, then removes that pick
- **THEN** after each step every other card of the page keeps its row and column in the grid
- **proof:** e2e

#### Scenario: Feud prep removes a pick
- **WHEN** the host picks a survey and then removes it
- **THEN** its slot is empty again and the survey can be picked again
- **proof:** e2e

#### Scenario: Feud Start hands over the picked surveys
- **WHEN** with 2 rounds one slot is filled and then the second, and "Start" is tapped
- **THEN** with one slot "Start" is disabled; after Start the saved session holds the 2 picked surveys in pick order as rounds and a tiebreak survey that is neither of them
- **proof:** e2e

### Requirement: Family Feud face-off
Each round SHALL open with a face-off. The app SHALL name one player per team, advancing each team's own rotation
by one each time a pair is named and wrapping after its last player. Once the question is uncovered (see Family Feud
question reveal) the host SHALL choose which team buzzed first with one of two buttons showing each team's name in
its team colour, in every round including round 1 and sudden death; until then no face-off answer SHALL be taken.
The chosen team answers first in the face-off. For each named player the host SHALL reveal the matching tile or
mark "Nicht auf der Tafel". A #1 answer from the first player SHALL win at once and the second player is skipped;
otherwise the higher-ranked answer wins and a miss loses to a hit. If both miss, the next pair SHALL be named, and
the chosen team answers first again. The winning team SHALL choose "Spielen" or "Passen"; on "Passen" the other team
plays the board.

#### Scenario: Feud face-off names players in rotation
- **WHEN** Team A [A1, A2, A3] and Team B [B1, B2] play rounds 1–3 with one pair each
- **THEN** the named pairs are A1/B1, A2/B2, A3/B1
- **proof:** unit

#### Scenario: Feud face-off rotation wraps for a team of two
- **WHEN** a team of 2 plays 5 rounds with one pair each
- **THEN** its named players are 1, 2, 1, 2, 1
- **proof:** unit

#### Scenario: Feud buzzing team answers first
- **WHEN** in round 1 the question is uncovered and Team B is chosen, and in round 2 Team B is chosen again
- **THEN** in both rounds Team B's named player is due first, and a #1 answer from them wins the face-off for Team B
- **proof:** unit

#### Scenario: Feud every round asks for the buzz
- **WHEN** a round, the next round and the sudden-death face-off each start, and a face-off answer is dispatched after the question is uncovered but before a team is chosen
- **THEN** each starts with no team chosen, and the answer leaves the state unchanged
- **proof:** unit

#### Scenario: Feud number one answer wins at once
- **WHEN** the first named player's answer is revealed as tile #1
- **THEN** the face-off ends, that player's team chooses, and the second player is not asked
- **proof:** unit

#### Scenario: Feud higher answer wins the face-off
- **WHEN** the first player hits tile #4 and the second hits tile #2
- **THEN** the second player's team wins the face-off and both tiles are revealed
- **proof:** unit

#### Scenario: Feud one miss loses the face-off
- **WHEN** the first player misses and the second hits tile #5
- **THEN** the second player's team wins the face-off
- **proof:** unit

#### Scenario: Feud both miss names the next pair
- **WHEN** both named players miss three times in a row
- **THEN** the face-off continues, each time the next pair in both rotations is named, and the chosen team stays first
- **proof:** unit

#### Scenario: Feud winner chooses Spielen or Passen
- **WHEN** Team A wins the face-off and chooses "Spielen", and in another round Team A wins and chooses "Passen"
- **THEN** in the first round Team A plays the board, in the second Team B plays it
- **proof:** unit

#### Scenario: Feud face-off screen names both players
- **WHEN** a Family Feud round starts, "Frage aufdecken" is tapped and Team A is chosen
- **THEN** the screen shows the question, names one player of each team, shows the hidden tiles with their rank numbers and offers "Nicht auf der Tafel"
- **proof:** e2e

#### Scenario: Feud team choice shows both teams
- **WHEN** the question is uncovered and the host taps the Team B button
- **THEN** before the tap two buttons show "Team A" and "Team B" with the backgrounds of their team colours; after it Team B's named player is marked "ist dran" and the tiles and "Nicht auf der Tafel" are enabled
- **proof:** e2e

### Requirement: Family Feud undo
The host SHALL undo the last action (question reveal, buzzer team, face-off answer, reveal, strike, Spielen/Passen,
steal answer) step by step back to the start of the current round, its result included. A closed round SHALL not be
undone. With nothing to undo the control SHALL be disabled. "Fehler" on the board and "Nicht auf der Tafel" in the
face-off and the steal SHALL be danger (red) buttons, each with its "Rückgängig" directly to its right as a warning
(orange) square icon-only button (an undo arrow, accessible name "Rückgängig"), as high as the action and narrower
than it, always rendered (shown disabled when nothing can be undone) so the row doesn't shift; at 390px the action
and its undo SHALL fit one row.

#### Scenario: Feud undo steps back through the round
- **WHEN** after a face-off, "Spielen", a reveal and a strike the host undoes four times
- **THEN** each undo restores the state before the matching action, the last one the face-off before "Spielen"
- **proof:** unit

#### Scenario: Feud undo of the reveal covers the question again
- **WHEN** the question is uncovered and undo is dispatched
- **THEN** the question is covered again and no team is chosen
- **proof:** unit

#### Scenario: Feud undo of the buzz returns to the choice
- **WHEN** after the reveal Team B is chosen and undo is dispatched
- **THEN** the question stays uncovered, no team is chosen, and choosing Team A then makes Team A's player due first
- **proof:** unit

#### Scenario: Feud undo stops at the round start
- **WHEN** a round is closed with "Nächste Runde" and undo is dispatched
- **THEN** the state is unchanged and undo reports nothing to undo
- **proof:** unit

#### Scenario: Feud undo of the third strike returns to the board
- **WHEN** the third strike opened the steal and the host undoes
- **THEN** the phase is board again with 2 strikes
- **proof:** unit

#### Scenario: Feud undo fixes a mistap
- **WHEN** on the board the host reveals the wrong tile and taps "Rückgängig"
- **THEN** that tile is hidden again and the pot is back to its earlier value
- **proof:** e2e

#### Scenario: Feud undo disabled with nothing to undo
- **WHEN** a round starts with the question still covered
- **THEN** "Rückgängig" is disabled; after "Frage aufdecken" it is enabled
- **proof:** e2e

#### Scenario: Feud fault and undo read as what they are
- **WHEN** the face-off, the board and the steal are shown
- **THEN** "Nicht auf der Tafel" (face-off, steal) and "Fehler" (board) have the `--imposter` background; directly to the right of each, on the same row, a button named "Rückgängig" with no visible text, an SVG icon and the `--duck` background is as high as the action, as wide as it is high, and narrower than the action
- **proof:** e2e

#### Scenario: Feud disabled undo keeps its place
- **WHEN** a round starts with nothing to undo, then the question is uncovered and Team A is chosen
- **THEN** before, the square "Rückgängig" next to "Nicht auf der Tafel" is shown and disabled; after, it is enabled; its box and the action's box are the same before and after
- **proof:** e2e

#### Scenario: Feud fault row fits a phone
- **WHEN** the board is shown at 390px
- **THEN** "Fehler" and its "Rückgängig" share one row inside the viewport and the page does not scroll horizontally
- **proof:** e2e

### Requirement: Family Feud demo
Family Feud SHALL ship one committed demo script (surveys, tiebreak survey, seed, scripted actions) with Alex and Bo
against Cleo and Dani playing several rounds to the Gewinner screen and "Demo beendet". Every round of the script,
sudden death included, SHALL start with a scripted "Frage aufdecken" step and a scripted buzzer-team step before
any face-off answer, and both teams SHALL be chosen first at least once. It SHALL reach every branch
of the Feud reducer that a normal game reaches: in the face-off a first answer that misses the board, both answers
missing (next pair), a number-one answer that wins at once, and two hits where the higher one wins; "Spielen" and
"Passen"; a board revealed completely; three strikes leading to a steal that succeeds and one that fails; the last
round counting double; and, because a tie after the last round is a normal outcome, sudden death on the tiebreak
survey. "Rückgängig" is a correction, not an outcome, and SHALL be named in a tip; the engine has no rematch. Hidden
survey information SHALL be shown openly with the [Demo] tag. The demo SHALL never touch the database, the roster
or the played-with history, and SHALL run on an empty database and under reduced motion. The demo SHALL go from the
third strike straight to the steal board, without the steal's full-screen handoff, because the handoff's "Weiter"
has no scripted control. In the demo, "Nicht auf der Tafel" SHALL be the highlighted control when the scripted
face-off answer or steal is a miss, and on a buzzer-team step only the scripted team's button SHALL be highlighted.

#### Scenario: Feud demo script plays to the end
- **WHEN** the Family Feud demo script's actions are applied to its fixture through the real reducer, twice
- **THEN** both runs reach the game over with identical states at every step, and every step changes the state
- **proof:** unit

#### Scenario: Feud demo reveals and picks the buzzer
- **WHEN** the demo's steps are walked round by round
- **THEN** every round, sudden death included, starts with the reveal step followed by a buzzer-team step before its first face-off answer, and Team A and Team B each are chosen first at least once
- **proof:** unit ("Scenario: Feud demo covers every outcome branch")

#### Scenario: Feud demo face-off branches
- **WHEN** the demo's face-off steps are walked
- **THEN** one face-off opens with a miss and the second answer wins it, one has both answers miss and the next pair answers, one is won at once by the number-one answer, and one is won by the higher of two hits
- **proof:** unit ("Scenario: Feud demo covers every outcome branch")

#### Scenario: Feud demo plays and passes
- **WHEN** the demo's choose steps are walked
- **THEN** at least one is `play` (the face-off winner plays) and one is `pass` (the other team plays)
- **proof:** unit ("Scenario: Feud demo covers every outcome branch")

#### Scenario: Feud demo clears a board
- **WHEN** the demo's states are walked
- **THEN** in one round every answer on the board gets revealed and the playing team banks the pot without a steal
- **proof:** unit ("Scenario: Feud demo covers every outcome branch")

#### Scenario: Feud demo steals once and misses once
- **WHEN** the demo's steal steps are applied
- **THEN** each follows a third strike; one hits a hidden answer and the stealing team takes the pot (`stolen`), the other is a miss and the playing team keeps the pot
- **proof:** unit ("Scenario: Feud demo covers every outcome branch")

#### Scenario: Feud demo last round counts double
- **WHEN** the demo's last regular round is banked
- **THEN** the banked points are the pot × 2
- **proof:** unit ("Scenario: Feud demo covers every outcome branch")

#### Scenario: Feud demo ends in sudden death
- **WHEN** the last regular round closes
- **THEN** the scores are tied, the tiebreak survey is played as a face-off, its winner wins the game, and the end state is the game over with that winner
- **proof:** unit ("Scenario: Feud demo covers every outcome branch")

#### Scenario: Feud demo names undo
- **WHEN** the demo's tips are read
- **THEN** one tip names "Rückgängig", and no tip contains "!" or an emoji
- **proof:** unit ("Scenario: Feud demo covers every outcome branch")

#### Scenario: Feud demo by tapping highlighted controls
- **WHEN** on a server whose survey table is empty the user opens the Family Feud demo and taps only the highlighted control at each step
- **THEN** exactly one control is highlighted at each step, "Frage aufdecken" on the reveal steps, the scripted team's button on the buzzer-team steps and "Nicht auf der Tafel" on the scripted misses included, all rounds and the sudden death complete, the Gewinner screen and "Demo beendet" are shown, and the survey's answers are shown with the [Demo] tag without holding
- **proof:** e2e

#### Scenario: Feud demo leaves data untouched
- **WHEN** the Family Feud demo is played to the end
- **THEN** the played-with lists, the saved players, the roster and the saved session are unchanged
- **proof:** e2e

#### Scenario: Feud demo completes with reduced motion
- **WHEN** `prefers-reduced-motion: reduce` is set and the Family Feud demo is played
- **THEN** every step can be completed to "Demo beendet"
- **proof:** e2e

## ADDED Requirements

### Requirement: Family Feud prep pages
The survey grid in the host prep SHALL be paged: 6 cards per page below 1024px viewport width, 12 from 1024px. While
there is more than one page, a pager (navigation "Seiten") SHALL offer "Zurück" and "Weiter" and show "Seite x von
y"; "Zurück" SHALL be disabled on the first page and "Weiter" on the last. With at most one page of surveys no pager
SHALL be shown. Changing the sort SHALL go to page 1. A current page that would be empty SHALL clamp to the last
page. Picks SHALL stay picked across pages.

#### Scenario: Feud prep pages by width
- **WHEN** on a fresh database (26 surveys) the host prep is opened at 390px and at 1280px, and "Weiter" is tapped
- **THEN** at 390px page 1 holds 6 cards and the pager reads "Seite 1 von 5"; at 1280px page 1 holds 12 cards and the pager reads "Seite 1 von 3"; after "Weiter" the pager reads "Seite 2 von …" and page 2 holds other cards than page 1
- **proof:** e2e

#### Scenario: Feud prep without pager for one page
- **WHEN** on a fresh database all but 6 surveys are deleted and the host prep is opened at 390px and at 1280px
- **THEN** all 6 cards are shown and no "Seiten" navigation exists
- **proof:** e2e

#### Scenario: Feud sort goes to page 1
- **WHEN** the host is on page 2 of the prep and switches the sort from known to played
- **THEN** the pager reads "Seite 1 von …" and the first card is the first of the played order
- **proof:** e2e

#### Scenario: Feud picks stay across pages
- **WHEN** with 2 rounds the host picks a survey on page 1, goes to page 2, picks a survey there and goes back to page 1
- **THEN** both slots hold the two picks in pick order and the page-1 card still shows "Gewählt"
- **proof:** e2e

#### Scenario: Feud prep page clamps to the last page
- **WHEN** with 6 per page the current page is 3 of 13 surveys and the list shrinks to 12 surveys
- **THEN** the current page is 2 and it holds the last 6 surveys
- **proof:** unit

#### Scenario: Feud prep page count
- **WHEN** the page count is computed for 0, 6, 7, 12, 13 and 26 surveys with 6 per page and with 12 per page
- **THEN** it is 1, 1, 2, 2, 3, 5 with 6 per page and 1, 1, 1, 1, 2, 3 with 12 per page
- **proof:** unit

### Requirement: Family Feud question reveal
Every round, sudden death included, SHALL start with the question covered by a "Frage aufdecken" control. Tapping it
SHALL show the question for the rest of the round. Until it is tapped the tiles, "Nicht auf der Tafel" and the
buzzer-team buttons SHALL be disabled, while the hold-to-peek corner (question and answers) stays available to the
host. The next round SHALL start covered again.

#### Scenario: Feud question covered at round start
- **WHEN** a Family Feud round starts
- **THEN** the question text is not shown, "Frage aufdecken" is shown, and the tiles, "Nicht auf der Tafel" and both team buttons are disabled
- **proof:** e2e

#### Scenario: Feud reveal shows the question
- **WHEN** "Frage aufdecken" is tapped, a team is chosen and an answer is given
- **THEN** after the tap the question is shown and "Frage aufdecken" is gone, the team buttons are enabled, and the question stays shown after the team choice and the answer
- **proof:** e2e

#### Scenario: Feud peek works before the reveal
- **WHEN** the question is still covered and the host holds the corner control
- **THEN** while held the question and every answer with its points are shown; after release they are hidden and the question is still covered
- **proof:** e2e

#### Scenario: Feud next round starts covered
- **WHEN** a round is closed with "Nächste Runde", and a last round closed in a tie starts sudden death
- **THEN** each new face-off starts with the question covered and no team chosen
- **proof:** unit

#### Scenario: Feud nothing counts before the reveal
- **WHEN** a face-off answer and a buzzer-team choice are dispatched while the question is covered
- **THEN** each leaves the state unchanged
- **proof:** unit
