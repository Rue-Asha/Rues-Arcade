# duck Specification

## Purpose
TBD - created by archiving change add-three-games. Update Purpose after archive.
## Requirements
### Requirement: Duck setup
What Rhymes with Duck SHALL be a port of the archive's Duck (`src/lib/games/duck.ts` incl. the v2 fix 5becabf).
It SHALL take 4–16 solo players from the roster. The lobby SHALL offer Zielpunkte 10, 20, 30, 40, 50, default 10;
the chosen target SHALL be part of the saved session.

#### Scenario: Duck lobby offers Zielpunkte
- **WHEN** the Duck lobby is opened with 4 chosen players
- **THEN** "Zielpunkte" offers 10, 20, 30, 40 and 50 with 10 selected, and "Los geht's" is enabled
- **proof:** e2e

#### Scenario: Duck needs four players
- **WHEN** the roster has 3 players and the Duck start screen is opened
- **THEN** "Los geht's" is disabled and "mind. 4 Spieler" is shown
- **proof:** e2e

#### Scenario: Duck roster above maximum asks who plays
- **WHEN** the roster has 17 players and the Duck lobby is opened
- **THEN** "Wer spielt mit?" is shown with "höchstens 16", and "Weiter" is enabled only once 4–16 players are chosen
- **proof:** e2e

#### Scenario: Duck target survives reload
- **WHEN** Duck is started with Zielpunkte 30 and the page is reloaded during Aufdecken
- **THEN** the same word phase and players are shown and the target still reads 30
- **proof:** e2e

### Requirement: Chuck the Duck
Chuck the Duck SHALL go to a random player at game start and move to the next player in roster order (wrapping)
after each played word; it SHALL stay on a skip and at game end. Chuck SHALL be visible in the Aufdecken banner, on
that player's scoring card and in the standings ("Als Nächstes bekommt <Name> Chuck the Duck.").

#### Scenario: Chuck starts random and moves after a played word
- **WHEN** Duck is initialised with 4 players under two seeds, and in one game a word is played and scored without ending the game
- **THEN** the starting holder comes from the RNG (the two seeds can differ), and after "Weiter" Chuck sits with the next player in order, wrapping from the last to the first
- **proof:** unit

#### Scenario: Chuck stays on skip and at game end
- **WHEN** a word is skipped, and in another game the played word ends the game
- **THEN** Chuck's holder is unchanged in both cases
- **proof:** unit

#### Scenario: Chuck shown in banner, scoring card and standings
- **WHEN** a Duck word goes through Aufdecken, Wertung and Punktestand
- **THEN** Aufdecken shows a Chuck banner with the holder's name, Wertung marks the holder's card, and Punktestand reads "Als Nächstes bekommt <next holder> Chuck the Duck."
- **proof:** e2e

### Requirement: Duck Aufdecken
Aufdecken SHALL show the Chuck banner and the rule line "Ein Reim-Match mit <Name> bringt +2 Extrapunkte."; "Wort
aufdecken" SHALL show the word to everyone; "Wort spielen" SHALL go to Wertung. "Überspringen" SHALL ask for
confirmation in the arcade Modal, then draw a new word; the skipped word stays used and Chuck stays. Words SHALL be
drawn without repeats until the pool is used, then reshuffled.

#### Scenario: Duck word revealed to everyone
- **WHEN** a Duck word is in Aufdecken and "Wort aufdecken" is tapped
- **THEN** the rule line names Chuck's holder, the word is shown openly, and "Wort spielen" opens Wertung
- **proof:** e2e

#### Scenario: Duck skip asks first and keeps the word used
- **WHEN** "Überspringen" is tapped, the confirmation is accepted, and the pool has 3 words
- **THEN** a different word is shown, the skipped word stays marked used and is not drawn again before the pool is reshuffled, and Chuck is unchanged
- **proof:** unit

#### Scenario: Duck skip can be cancelled
- **WHEN** "Überspringen" is tapped and the confirmation is cancelled
- **THEN** the same word is still shown
- **proof:** e2e

#### Scenario: Duck words do not repeat until the pool is used
- **WHEN** words are played on a pool of 3
- **THEN** the first 3 words differ and the 4th is drawn again from all 3
- **proof:** unit

### Requirement: Duck Wertung
Wertung SHALL show one card per player with a point grid of T boxes (T = Zielpunkte) and the letters D U C K Y.
Tapping box k SHALL set the score to k; tapping the topmost filled box SHALL set it to k−1. Tapping an active letter
SHALL cross out that letter and those after it; tapping a crossed letter SHALL restore lives up to and including
it. Points and letters from earlier words SHALL be locked: the score never drops below the word's starting score,
lives never rise above the word's starting lives, and the score never exceeds T.

#### Scenario: Point boxes set and clear the score
- **WHEN** a player at score 2 at the start of the word taps box 5, then box 5 again, then box 1
- **THEN** the score is 5, then 4, then still 4 (box 1 is locked from an earlier word)
- **proof:** unit

#### Scenario: Score capped at the target
- **WHEN** the target is 10 and a player taps the last box
- **THEN** the score is 10 and no box beyond 10 exists
- **proof:** unit

#### Scenario: DUCKY letters cross and restore within the word
- **WHEN** a player with 4 lives at the start of the word taps "C", then the crossed "K", then the "Y" lost in an earlier word
- **THEN** lives are 2, then 4, then still 4
- **proof:** unit

### Requirement: Duck standings and end
"Weiter" SHALL end the game when any score is ≥ T or any player has 0 lives (reason "target reached" when both);
otherwise Chuck moves and Punktestand SHALL list the players sorted by score with their DUCKY letters, lost ones
struck. Spielende SHALL name every player tied at the top score as winner ("Unentschieden" on a tie, archive bug
fix), the reason line, and the rest of the ranking with correct tied ranks. "Neue Runde" SHALL restart with the same
players, scores and lives reset, and a new random Chuck.

#### Scenario: Duck ends at target or zero lives
- **WHEN** "Weiter" is dispatched with a score at T, with a player at 0 lives, with both, and with neither
- **THEN** the game ends with reason target reached, lives lost, target reached, and continues to Punktestand respectively
- **proof:** unit

#### Scenario: Duck standings sorted with struck letters
- **WHEN** a word ends with scores 3, 0, 5, 1 and one player lost "Y"
- **THEN** Punktestand lists the players in order 5, 3, 1, 0 and shows that player's "Y" struck
- **proof:** e2e

#### Scenario: Duck tie at the top reads Unentschieden
- **WHEN** the game ends with scores 10, 10, 4, 4
- **THEN** Spielende shows "Unentschieden" with both top players, and the other two share rank 3
- **proof:** e2e

#### Scenario: Full Duck game
- **WHEN** 4 players play Duck with target 10 and one word ends with a player at 10 points
- **THEN** Spielende names that player as winner with the reason that the target was reached, and "Neue Runde" starts a new game with the same players, all scores 0, five letters each and Aufdecken shown
- **proof:** e2e

#### Scenario: Duck Neue Runde redraws Chuck
- **WHEN** "Neue Runde" is dispatched
- **THEN** scores are 0, lives are 5, the players are the same and Chuck's holder comes from the RNG
- **proof:** unit

### Requirement: Duck engine, session and demo
Duck SHALL be a pure reducer with its RNG in the state, save after every action and resume on reload; "Spiel
beenden" SHALL ask for confirmation in the arcade Modal. It SHALL ship one committed demo script with Alex, Bo, Cleo
and Dani playing several words with Zielpunkte 10 to Spielende and "Demo beendet", gated like the existing demos.
The script SHALL reach every branch of the Duck reducer: "Überspringen" on a word, a word nobody scores on, a word
with exactly one match (3 points each, +2 for matching Chuck's holder), a word where several players share a rhyme (1 point
each), letters lost on missing rhymes word after word until one player loses the last letter, Chuck moving after
each played word, and a final word where one player reaches 10 while another loses the last letter, so Spielende
gives the reason "target reached"; a tip SHALL name the game end by lost lives alone. The last step SHALL tap
"Neue Runde". Sound SHALL use the existing cues: press on controls, reveal on "Wort aufdecken", wrong when a letter
is crossed, correct on "Weiter" when points were added, win at Spielende.

#### Scenario: Duck engine is deterministic and pure
- **WHEN** Duck is initialised twice with the same players, config, content and seed, given the same actions, and an action is applied to a frozen state
- **THEN** both runs end deeply equal and the frozen state is not mutated
- **proof:** unit

#### Scenario: Duck session resumes after reload
- **WHEN** a Duck game is in Wertung with one box tapped and the page is reloaded
- **THEN** Wertung shows the same scores, lives and Chuck holder, with no discarded-state notice
- **proof:** e2e

#### Scenario: Leaving Duck asks for confirmation
- **WHEN** "Spiel beenden" is tapped during a Duck game and the Modal is dismissed with "Weiterspielen"
- **THEN** the Modal "Spiel beenden?" was shown and the game continues in the same phase
- **proof:** e2e

#### Scenario: Duck demo script plays to the end
- **WHEN** the Duck demo script's actions are applied to its fixture through the real reducer, twice
- **THEN** both runs reach the end state with identical states at every step, and every step changes the state
- **proof:** unit

#### Scenario: Duck demo skips a word
- **WHEN** the demo reaches its `skip` step
- **THEN** a different word is drawn and Chuck's holder is unchanged
- **proof:** unit ("Scenario: Duck demo covers every outcome branch")

#### Scenario: Duck demo scores none, one match and a multi-match
- **WHEN** the demo's committed words are walked
- **THEN** one word adds no points to anyone, one gives exactly two matching players 3 points each, with 2 extra for the player who matched Chuck's holder, and one adds 1 to each of three or more players sharing a rhyme
- **proof:** unit ("Scenario: Duck demo covers every outcome branch")

#### Scenario: Duck demo loses letters to elimination
- **WHEN** the demo's states are walked
- **THEN** one player's lives fall over several words from 5 to 0, at most one letter per word, and Chuck moves to the next player after each played word that does not end the game
- **proof:** unit ("Scenario: Duck demo covers every outcome branch")

#### Scenario: Duck demo ends at target with an elimination
- **WHEN** the demo's final word is committed
- **THEN** one player is at 10 points and another at 0 lives, the game ends with reason "target", and a tip names the end by lost lives alone
- **proof:** unit ("Scenario: Duck demo covers every outcome branch")

#### Scenario: Duck demo plays a new round
- **WHEN** the demo's last step is applied
- **THEN** it is "Neue Runde": a new game starts with the same players, all scores 0 and five letters each; no tip contains "!" or an emoji
- **proof:** unit ("Scenario: Duck demo covers every outcome branch")

#### Scenario: Duck demo by tapping highlighted controls
- **WHEN** on a server with an empty database the user opens Duck's Demo and taps only the highlighted control at each step, including the skip
- **THEN** exactly one control is highlighted at each step, the words are played and scored through Spielende, and "Demo beendet" is shown
- **proof:** e2e

#### Scenario: Duck cues sound right
- **WHEN** Rue plays a Duck word with sound on
- **THEN** "Wort aufdecken" plays reveal, crossing a letter plays wrong and Spielende plays win
- **proof:** manual (audio judgement on a real device at Gate 2)

### Requirement: Duck look and copy
Duck SHALL have its own colour token, tile badge, tile and start-banner art (motif `duck`), the shared crew and rings
art in lobby and play, and all its screens SHALL pass the arcade look rules. Its copy SHALL be neutral German with no
"!" and no emoji (the archive's 🦆 becomes art or plain text).

#### Scenario: Duck art on tile and start screen
- **WHEN** Home and the Duck start screen are opened
- **THEN** the Duck tile and start banner each hold `data-motif="duck"` art with at least one drawn shape, in `--duck` colours, aria-hidden and without pointer events
- **proof:** e2e

#### Scenario: Duck screens meet the look rules
- **WHEN** the look walk renders the Duck start, lobby, Aufdecken, Wertung, Punktestand and Spielende screens
- **THEN** text contrast is at least 4.5:1, touch targets (point boxes and letters included) are at least 44px and no screen scrolls horizontally at 390px
- **proof:** e2e ("Scenario: Text contrast meets 4.5:1", "Scenario: Touch targets are at least 44px", "Scenario: No horizontal scroll on phone")

#### Scenario: Duck copy reads neutral
- **WHEN** a full Duck game is played and every visible text is collected
- **THEN** none contains "!" or an emoji
- **proof:** e2e

