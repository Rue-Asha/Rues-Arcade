## ADDED Requirements

### Requirement: Family Feud lobby takes saved players only
Family Feud SHALL take 4–20 players, and every chosen player SHALL be a saved player (player-database). While a
chosen player is a guest, the lobby SHALL show no setup but a neutral message naming the guests and a link
"Spieler speichern" to `/spieler?from=/spiele/family-feud/lobby`. Below 4 players the start screen SHALL show the
generic "mind. 4 Spieler"; above 20 the lobby SHALL show the generic "Wer spielt mit?" picker, and the gate SHALL
apply to the chosen players.

#### Scenario: Feud guest blocks start
- **WHEN** the roster holds 4 saved players and 1 guest and the Family Feud lobby is opened
- **THEN** no team setup is shown, a message names the guest and says Family Feud needs saved players, the link "Spieler speichern" leads to `/spieler?from=/spiele/family-feud/lobby`, and no text contains "!"
- **proof:** e2e

#### Scenario: Feud roster of guests only
- **WHEN** the roster holds 4 guests and the Family Feud lobby is opened
- **THEN** no team setup is shown, the message names all 4 guests and the link to Spieler is shown
- **proof:** e2e

#### Scenario: Feud with exactly four saved players
- **WHEN** the roster holds exactly 4 saved players and the Family Feud lobby is opened
- **THEN** the setup shows two teams of 2 and "Weiter" is enabled
- **proof:** e2e

#### Scenario: Feud needs four players
- **WHEN** the roster holds 3 saved players and the Family Feud start screen is opened
- **THEN** "Los geht's" is disabled and "mind. 4 Spieler" is shown
- **proof:** e2e

#### Scenario: Feud takes twenty players
- **WHEN** the roster holds 20 saved players and the Family Feud lobby is opened
- **THEN** no "Wer spielt mit?" picker is shown and the setup deals two teams of 10
- **proof:** e2e

#### Scenario: Feud roster above maximum asks who plays
- **WHEN** the roster holds 21 saved players and the Family Feud lobby is opened
- **THEN** "Wer spielt mit?" is shown and the team setup appears only once 4–20 players are chosen
- **proof:** e2e

### Requirement: Family Feud teams and rounds
The setup SHALL deal the chosen players into two teams alternately in roster order, let the user move a player to
the other team by tapping it, and reshuffle both teams with "Mischen". Team names SHALL be editable, default "Team
A" and "Team B"; an empty name SHALL fall back to its default; two names equal after trimming, ignoring case,
SHALL disable "Weiter" with "Die Teams brauchen verschiedene Namen.". While a team has fewer than 2 players
"Weiter" SHALL be disabled with "Jedes Team braucht mind. 2 Spieler.". Rounds SHALL be 1–8, default 3. While the
database holds fewer than rounds + 1 surveys, "Weiter" SHALL be disabled with a message stating both numbers and a
link to `/spiele/family-feud/inhalte`. "Weiter" hands the device to the host and opens the host prep.

#### Scenario: Feud teams dealt from the roster
- **WHEN** the Family Feud lobby is opened with 6 saved players
- **THEN** two teams of 3 named "Team A" and "Team B" are shown, the rounds offer 1–8 with 3 selected, and "Weiter" is enabled
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
The host prep SHALL list every survey in the database with "k von n kennen sie" (k = players of this game on its
played-with list, n = players of this game), "gespielt mit X" (size of its played-with list) and "neu" when that
list is empty, and a badge "alle kennen sie" when k = n. It SHALL sort by known (k) or by played (X), ascending,
known by default. The host SHALL pick up to N surveys for N rounds, in pick order, remove a pick, and open a survey
to see all its answers with points in board order. "Start" SHALL be enabled only when all N slots are filled and
SHALL start the game with the picked surveys as rounds and a tiebreak survey drawn like "Zufällig auffüllen" from
the surveys not picked.

#### Scenario: Feud prep shows who knows a survey
- **WHEN** survey X's played-with list holds 2 of the game's 4 players and 1 other saved player, survey Y's list is empty, and the host prep is opened
- **THEN** X shows "2 von 4 kennen sie" and "gespielt mit 3", and Y shows "neu"
- **proof:** e2e

#### Scenario: Feud prep sorts by known and by played
- **WHEN** surveys with different known and played counts are listed and the sort is switched from known to played
- **THEN** the list is first ordered by k ascending, then by X ascending
- **proof:** e2e

#### Scenario: Feud prep refuses an extra pick
- **WHEN** with 2 rounds the host picks 2 surveys and then taps a third
- **THEN** the third is not picked, "Schon 2 Umfragen gewählt." is shown and the 2 picks stay
- **proof:** e2e

#### Scenario: Feud survey everyone knows stays pickable
- **WHEN** a survey's played-with list holds all players of the game
- **THEN** it shows the badge "alle kennen sie" and can still be picked
- **proof:** e2e

#### Scenario: Feud prep opens a survey's answers
- **WHEN** the host opens a survey in the prep
- **THEN** its question and all its answers with points are shown, ordered by points descending
- **proof:** e2e

#### Scenario: Feud prep removes a pick
- **WHEN** the host picks a survey and then removes it
- **THEN** its slot is empty again and the survey can be picked again
- **proof:** e2e

#### Scenario: Feud Start hands over the picked surveys
- **WHEN** with 2 rounds one slot is filled and then the second, and "Start" is tapped
- **THEN** with one slot "Start" is disabled; after Start the saved session holds the 2 picked surveys in pick order as rounds and a tiebreak survey that is neither of them
- **proof:** e2e

### Requirement: Family Feud random fill
"Zufällig auffüllen" SHALL fill only the empty slots and keep hand-picked surveys. It SHALL prefer surveys no
player of this game knows (k = 0), then those with the smallest k, choosing randomly among equals. It SHALL be
disabled while every slot is filled. The tiebreak survey SHALL be drawn by the same rule from the surveys not
picked.

#### Scenario: Feud fill keeps hand-picked surveys
- **WHEN** 3 slots have 1 hand-picked survey and the fill runs
- **THEN** the hand-picked survey stays in its slot and only the 2 empty slots are filled, with surveys not yet picked
- **proof:** unit

#### Scenario: Feud fill prefers unknown surveys
- **WHEN** the fill runs for 2 slots over surveys with k = 0, 0, 1 and 2
- **THEN** it fills both slots with the two k = 0 surveys
- **proof:** unit

#### Scenario: Feud fill falls back to the least known
- **WHEN** the fill runs for 3 slots over surveys with k = 0, 1, 1 and 3
- **THEN** it picks the k = 0 survey and both k = 1 surveys
- **proof:** unit

#### Scenario: Feud tiebreak survey drawn like the fill
- **WHEN** the tiebreak survey is drawn after 2 picks over surveys with k = 0 (picked), 0 and 1
- **THEN** it is the unpicked k = 0 survey
- **proof:** unit

#### Scenario: Feud fill avoids known surveys on the real store
- **WHEN** on a fresh database 25 of the 26 surveys are played with the game's players and the host fills 1 slot
- **THEN** the slot holds the one survey none of them knows
- **proof:** e2e

#### Scenario: Feud fill disabled when all slots are picked
- **WHEN** every slot is picked by hand
- **THEN** "Zufällig auffüllen" is disabled
- **proof:** e2e

### Requirement: Family Feud played-with history
Each survey SHALL keep a played-with list of saved players. The list SHALL be visible and editable (add a saved
player, remove one) only in the host prep, never in Inhalte or during play. When a round is closed ("Nächste
Runde" or "Zum Ergebnis" on its result, the sudden-death round included), every player of the game SHALL be added
to that round's survey list. A player already on a list SHALL not be added twice. Deleting a saved player SHALL
remove their entries. The demo SHALL never record.

#### Scenario: Feud prep edits a survey's played-with list
- **WHEN** in the host prep the host adds a saved player to a survey's list, removes another, and reloads the prep
- **THEN** after reload the list holds the added player and not the removed one
- **proof:** e2e

#### Scenario: Feud played-with list hidden outside prep
- **WHEN** a survey has a played-with list and its Inhalte page and a running game showing it are opened
- **THEN** neither shows any player of that list, "kennen sie" or "gespielt mit"
- **proof:** e2e

#### Scenario: Feud played-with has no duplicates
- **WHEN** the same player is added to a survey's list twice, once by hand and once by a closed round
- **THEN** the list holds that player once
- **proof:** unit

#### Scenario: Feud played-with follows a deleted player
- **WHEN** a saved player on two surveys' lists is deleted
- **THEN** both lists no longer hold that player and the other entries are unchanged
- **proof:** unit

#### Scenario: Feud closed rounds are recorded
- **WHEN** 4 saved players play a 2-round game to the winner screen
- **THEN** both rounds' surveys list all 4 players
- **proof:** e2e

#### Scenario: Feud early end records only closed rounds
- **WHEN** round 1 is closed, round 2 is played up to its board and "Spiel beenden" is confirmed
- **THEN** round 1's survey lists the players and round 2's survey list is unchanged
- **proof:** e2e

#### Scenario: Feud tiebreak survey is recorded
- **WHEN** a game ends in a tie, the sudden-death face-off is won and its round is closed
- **THEN** the tiebreak survey lists all players of the game
- **proof:** e2e

### Requirement: Family Feud survey peek
During play a subtle corner control SHALL show the full survey (question, all answers with points) while held
(HoldToView) and hide it on release. Holding it SHALL neither block nor skip a running tile animation; under
reduced motion it SHALL show and hide instantly.

#### Scenario: Feud peek shows the survey while held
- **WHEN** on the board with hidden tiles the host holds the corner control, then releases it
- **THEN** while held the question and every answer with its points are shown; after release they are hidden again
- **proof:** e2e

#### Scenario: Feud peek does not block a tile flip
- **WHEN** a tile is revealed and the corner control is held while its flip runs
- **THEN** the flip animation finishes and the tile shows its answer and points
- **proof:** e2e

#### Scenario: Feud peek instant under reduced motion
- **WHEN** `prefers-reduced-motion: reduce` is set and the corner control is held and released
- **THEN** the survey shows and hides with no running animation
- **proof:** e2e

### Requirement: Family Feud face-off
Each round SHALL open with a face-off. The app SHALL name one player per team, advancing each team's own rotation
by one each time a pair is named and wrapping after its last player. In round r (0-based) team r mod 2 answers
first. For each named player the host SHALL reveal the matching tile or mark "Nicht auf der Tafel". A #1 answer
from the first player SHALL win at once and the second player is skipped; otherwise the higher-ranked answer wins
and a miss loses to a hit. If both miss, the next pair SHALL be named. The winning team SHALL choose "Spielen" or
"Passen"; on "Passen" the other team plays the board.

#### Scenario: Feud face-off names players in rotation
- **WHEN** Team A [A1, A2, A3] and Team B [B1, B2] play rounds 1–3 with one pair each
- **THEN** the named pairs are A1/B1, A2/B2, A3/B1
- **proof:** unit

#### Scenario: Feud face-off rotation wraps for a team of two
- **WHEN** a team of 2 plays 5 rounds with one pair each
- **THEN** its named players are 1, 2, 1, 2, 1
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
- **THEN** the face-off continues and each time the next pair in both rotations is named
- **proof:** unit

#### Scenario: Feud winner chooses Spielen or Passen
- **WHEN** Team A wins the face-off and chooses "Spielen", and in another round Team A wins and chooses "Passen"
- **THEN** in the first round Team A plays the board, in the second Team B plays it
- **proof:** unit

#### Scenario: Feud face-off screen names both players
- **WHEN** a Family Feud round starts
- **THEN** the screen shows the question, names one player of each team, shows the hidden tiles with their rank numbers and offers "Nicht auf der Tafel"
- **proof:** e2e

### Requirement: Family Feud board
On the board the playing team SHALL answer together; the host SHALL tap a hidden tile to reveal it or give a
strike. Three strike pods SHALL show the strike count. The pot SHALL be the sum of the points of all revealed
answers, face-off answers included. When every tile is revealed, the playing team SHALL bank the pot.

#### Scenario: Feud pot includes face-off answers
- **WHEN** the face-off revealed tile #2 (25 points) and the playing team reveals tile #3 (18 points)
- **THEN** the pot is 43
- **proof:** unit

#### Scenario: Feud strikes fill the pods
- **WHEN** the host gives 2 strikes on the board
- **THEN** the state counts 2 strikes and the screen shows 2 of 3 strike pods filled
- **proof:** e2e

#### Scenario: Feud cleared board banks the pot
- **WHEN** the playing team reveals the last hidden tile
- **THEN** the round goes to its result and the playing team gains the pot times the round's multiplier
- **proof:** unit

### Requirement: Family Feud steal
After the third strike the other team SHALL get exactly one answer. A hit SHALL reveal that tile and give the
stealing team the pot including it; a miss SHALL give the playing team the pot.

#### Scenario: Feud third strike opens the steal
- **WHEN** the host gives the third strike
- **THEN** the phase is steal for the other team and no further strike is possible
- **proof:** unit

#### Scenario: Feud steal hit takes the pot
- **WHEN** with a pot of 40 the stealing team hits a 15-point tile
- **THEN** the tile is revealed and the stealing team gains 55 times the multiplier
- **proof:** unit

#### Scenario: Feud steal miss leaves the pot
- **WHEN** with a pot of 40 the stealing team misses
- **THEN** the playing team gains 40 times the multiplier
- **proof:** unit

### Requirement: Family Feud round result
The result SHALL flip every remaining hidden tile open in a muted look without points, show the pot times the
multiplier counting up into the team's score, and offer "Nächste Runde", or "Zum Ergebnis" after the last round.
The last round SHALL count double and be marked "Doppelte Punkte" from its face-off on; a 1-round game's only
round is the last.

#### Scenario: Feud last round counts double
- **WHEN** a 3-round game banks 40 in each round
- **THEN** rounds 1 and 2 add 40 and round 3 adds 80
- **proof:** unit

#### Scenario: Feud single round counts double
- **WHEN** a 1-round game banks 40
- **THEN** the team gains 80
- **proof:** unit

#### Scenario: Feud double round marked before it starts
- **WHEN** a 2-round game shows round 1's face-off and then round 2's face-off
- **THEN** "Doppelte Punkte" is not shown in round 1 and is shown in round 2
- **proof:** e2e

#### Scenario: Feud result shows the remaining answers muted
- **WHEN** a round ends with 2 tiles still hidden
- **THEN** both tiles show their answers marked muted and without points, the team's score reaches its new total, and "Nächste Runde" is offered
- **proof:** e2e

### Requirement: Family Feud end and sudden death
After the last round the team with the higher score SHALL win, shown on the winner screen. On a tie a
sudden-death face-off SHALL start on the tiebreak survey, continuing both rotations: the higher answer wins the
game, a #1 answer from the first player wins at once, and if both miss the next pair is named, without end.

#### Scenario: Feud higher score wins
- **WHEN** the last round is closed with scores 120 and 80
- **THEN** the phase is game over with the 120 team as winner
- **proof:** unit

#### Scenario: Feud tie goes to sudden death
- **WHEN** the last round is closed with scores 80 and 80
- **THEN** a face-off on the tiebreak survey starts with the next pair in both rotations, and the team with the higher answer wins the game once that round is closed
- **proof:** unit

#### Scenario: Feud sudden death never ends in a draw
- **WHEN** in sudden death both named players miss through every player of both teams and one more pair
- **THEN** the face-off is still running and the rotation has wrapped
- **proof:** unit

#### Scenario: Full Feud game
- **WHEN** 4 saved players play a 2-round game through the UI with a face-off, "Spielen", reveals, three strikes and a steal
- **THEN** each result shows the gained points, "Zum Ergebnis" leads to the winner screen naming the team with the higher score, and both scores are shown
- **proof:** e2e

### Requirement: Family Feud undo
The host SHALL undo the last action (face-off answer, reveal, strike, Spielen/Passen, steal answer) step by step
back to the start of the current round, its result included. A closed round SHALL not be undone. With nothing to
undo the control SHALL be disabled.

#### Scenario: Feud undo steps back through the round
- **WHEN** after a face-off, "Spielen", a reveal and a strike the host undoes four times
- **THEN** each undo restores the state before the matching action, the last one the face-off before "Spielen"
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
- **WHEN** a round's face-off is shown before any answer
- **THEN** "Rückgängig" is disabled
- **proof:** e2e

### Requirement: Family Feud engine and session
Family Feud SHALL be a pure reducer with its RNG in the state (game-engine) that takes its round and tiebreak
surveys as copies in its config, save after every action and resume on reload; "Spiel beenden" SHALL clear the
session; an old or corrupt save SHALL be discarded with the notice.

#### Scenario: Feud engine is deterministic and pure
- **WHEN** Family Feud is initialised twice with the same players, config and seed, given the same actions, and an action is applied to a frozen state
- **THEN** both runs end deeply equal and the frozen state is not mutated
- **proof:** unit

#### Scenario: Feud session resumes after reload
- **WHEN** a Family Feud game is on the board after a reveal and a strike and the page is reloaded
- **THEN** the same tiles, strikes, pot and scores are shown, with no discarded-state notice
- **proof:** e2e

#### Scenario: Feud game keeps its survey copy
- **WHEN** during a game the current round's survey is deleted, another round's survey is edited, and the page is reloaded
- **THEN** the current question and answers are still shown and the later round still uses its original answers
- **proof:** e2e

#### Scenario: Feud old or corrupt save discarded
- **WHEN** the stored Family Feud session is not valid JSON, or carries a state version other than the engine's, and the play screen is opened
- **THEN** the discarded-state notice is shown and the app does not crash
- **proof:** e2e

#### Scenario: Leaving Feud clears the session
- **WHEN** "Spiel beenden" is confirmed during a Family Feud game and the start screen is opened
- **THEN** no "Weiterspielen" is offered
- **proof:** e2e

### Requirement: Family Feud demo
Family Feud SHALL ship a committed demo fixture (surveys, seed, scripted actions) with Alex and Bo against Cleo
and Dani playing one round: face-off, "Spielen", a reveal, three strikes, a steal and the result, to "Demo
beendet". Hidden survey information SHALL be shown openly with the [Demo] tag. The demo SHALL never touch the
database, the roster or the played-with history, and SHALL run on an empty database and under reduced motion.
The demo SHALL go from the third strike straight to the steal board, without the steal's full-screen handoff,
because the handoff's "Weiter" has no scripted control.

#### Scenario: Feud demo script plays to the end
- **WHEN** the Family Feud demo script's actions are applied to its fixture through the real reducer, twice
- **THEN** both runs reach the result with identical states at every step, passing face-off, Spielen, a reveal, three strikes and a steal
- **proof:** unit

#### Scenario: Feud demo by tapping highlighted controls
- **WHEN** on a server whose survey table is empty the user opens the Family Feud demo and taps only the highlighted control at each step
- **THEN** the round completes, "Demo beendet" is shown, and the survey's answers are shown with the [Demo] tag without holding
- **proof:** e2e

#### Scenario: Feud demo leaves data untouched
- **WHEN** the Family Feud demo is played to the end
- **THEN** the played-with lists, the saved players, the roster and the saved session are unchanged
- **proof:** e2e

#### Scenario: Feud demo completes with reduced motion
- **WHEN** `prefers-reduced-motion: reduce` is set and the Family Feud demo is played
- **THEN** every step can be completed to "Demo beendet"
- **proof:** e2e

### Requirement: Family Feud look, motion and sound
The board SHALL be ledge tiles showing their rank number while hidden; a versus header SHALL show both team names
and scores; strike pods SHALL reuse Lives; "Spielen/Passen" and the steal SHALL open with a full-screen handoff in
the team's colour (the demo excepted, see its requirement). Motion SHALL be: tile flip (rotateX), strike pod pop with a short board shake and an X stamp,
pot count-up into the score, staggered reveal of the remaining tiles — transform/opacity only, never blocking
input, instant under reduced motion. Sounds SHALL use `play()`: reveal on a revealed tile, wrong on a strike or a
miss, correct when a team banks the pot, win on the winner screen. Copy SHALL be neutral German with no "!" and no
emoji.

#### Scenario: Feud board fits a phone
- **WHEN** a survey with 8 answers is on the board at 390px
- **THEN** the page does not scroll horizontally and all 8 tiles lie within the viewport width
- **proof:** e2e

#### Scenario: Feud versus header shows both teams
- **WHEN** a Family Feud round is on the board
- **THEN** a header shows both team names with their scores
- **proof:** e2e

#### Scenario: Feud handoff in team colour
- **WHEN** a face-off is won and later a third strike is given
- **THEN** each opens a full-screen handoff naming the team that acts next, in that team's colour
- **proof:** e2e

#### Scenario: Feud motion uses transform and opacity only
- **WHEN** a tile is revealed, a strike is given and a round result is shown, with motion allowed
- **THEN** every animation that runs animates only transform or opacity
- **proof:** e2e

#### Scenario: Feud motion never blocks input
- **WHEN** a strike is tapped while a tile flip is running
- **THEN** the strike is counted immediately
- **proof:** e2e

#### Scenario: Feud reduced motion is instant
- **WHEN** `prefers-reduced-motion: reduce` is set and a tile is revealed, a strike given and a result shown
- **THEN** no animation is running after each step and the score shows its final value
- **proof:** e2e

#### Scenario: Feud copy reads neutral
- **WHEN** a full Family Feud game is played and every visible text is collected
- **THEN** none contains "!" or an emoji
- **proof:** e2e

#### Scenario: Feud screens meet the look rules
- **WHEN** the look walk renders the Family Feud start, lobby, prep, face-off, handoff, board, steal, result and winner screens
- **THEN** text contrast is at least 4.5:1, touch targets are at least 44px and no screen scrolls horizontally at 390px
- **proof:** e2e ("Scenario: Text contrast meets 4.5:1", "Scenario: Touch targets are at least 44px", "Scenario: No horizontal scroll on phone")

#### Scenario: Feud cues sound right
- **WHEN** Rue plays a Family Feud round with sound on
- **THEN** a reveal plays reveal, a strike plays wrong, banking the pot plays correct and the winner screen plays win
- **proof:** manual (audio judgement on a real device at Gate 2)

#### Scenario: Feud screens approved on screenshots
- **WHEN** Rue reviews the look-walk screenshots of every Family Feud screen at 390px and 1280px
- **THEN** Rue approves the board, motion stills, art and desktop use of width as consistent with the other games, and the copy as neutral
- **proof:** manual (visual and tone judgement at Gate 2)
