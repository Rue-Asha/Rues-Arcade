# codes Specification

## Purpose
TBD - created by archiving change add-three-games. Update Purpose after archive.
## Requirements
### Requirement: Codes setup
Codes SHALL be a port of the archive's Passwort-style game (not Codenames). It SHALL take 4–20 players from the
roster. The lobby SHALL deal the chosen players into teams like Wavelength (deal, shuffle, move a player to the
next team): 2–5 teams, default `min(5, floor(players / 2))`, each team needing at least 2 players and allowing
more. Rounds SHALL be 1–8, default 5. While a team has fewer than 2 players, "Los geht's" SHALL be disabled with
a neutral hint.

#### Scenario: Codes teams dealt from the roster
- **WHEN** the Codes lobby is opened with 7 chosen players
- **THEN** 3 teams are dealt (sizes 3, 2, 2), the team count offers 2 and 3 only, the rounds offer 1–8 with 5 selected, and "Los geht's" is enabled
- **proof:** e2e

#### Scenario: Codes start blocked by a team below two
- **WHEN** in the Codes lobby with 4 players in 2 teams a player is moved so one team has 1 player
- **THEN** "Los geht's" is disabled and "Jedes Team braucht mind. 2 Spieler." is shown, without "!"
- **proof:** e2e

#### Scenario: Codes needs four players
- **WHEN** the roster has 3 players and the Codes start screen is opened
- **THEN** "Los geht's" is disabled and "mind. 4 Spieler" is shown
- **proof:** e2e

#### Scenario: Codes roster above maximum asks who plays
- **WHEN** the roster has 21 players and the Codes lobby is opened
- **THEN** "Wer spielt mit?" is shown and the teams appear only once 4–20 players are chosen
- **proof:** e2e

### Requirement: Codes word draw
One round SHALL be one secret word drawn from the Codes pool without repeats until the pool is used, then
reshuffled (the arcade `draw()` pattern). A pool below `minContent` (1) SHALL block the start on the start screen.

#### Scenario: Codes words do not repeat until the pool is used
- **WHEN** rounds are played on a pool of 3 words
- **THEN** the first 3 rounds use 3 different words and round 4 draws again from all 3
- **proof:** unit

#### Scenario: Empty Codes pool blocks start
- **WHEN** the `codes_words` table of a fresh database is emptied and the Codes start screen is opened with 4 players
- **THEN** "Los geht's" is disabled, "Für Codes gibt es noch keine Inhalte." is shown and a link leads to `/spiele/codes/inhalte`
- **proof:** e2e

### Requirement: Codes roles and turn order
Each team's explainer in round r SHALL be `players[r % team.size]`; all other team members SHALL guess together
with one guess. Teams of different sizes rotate independently; in 2-player teams the roles swap every round, as
in the archive. The opening team SHALL be random at game start and then `(start + r) mod teams`; the turn SHALL
pass team by team in that order, wrapping.

#### Scenario: Two-player teams swap roles every round
- **WHEN** a team of 2 plays rounds 1, 2 and 3
- **THEN** its explainers are player 1, player 2, player 1, and the other player is the guesser each time
- **proof:** unit

#### Scenario: Teams of different sizes rotate independently
- **WHEN** a team of 2 and a team of 3 play 3 rounds
- **THEN** the 2-team's explainers are players 1, 2, 1, the 3-team's are players 1, 2, 3, and in every round the guessers are the team's other members
- **proof:** unit

#### Scenario: Opening team rotates from a random start
- **WHEN** a 3-team game starts with seed-chosen opener s and rounds 1–4 are played
- **THEN** the openers are s, s+1, s+2, s (mod 3), two different seeds can give different openers, and within a round a miss passes to the next team in that order, wrapping after the last
- **proof:** unit

### Requirement: Codes Aufdecken
The Aufdecken screen SHALL name this round's explainers; the word SHALL be visible only while held (HoldToView).
"Anderes Wort" SHALL draw a different word and put the rejected word back into the pool (archive bug fix). With a
pool of one word, "Anderes Wort" SHALL be disabled and the action a no-op without error.

#### Scenario: Codes word visible only while held
- **WHEN** a Codes round is in Aufdecken and an explainer holds, then releases the hold control
- **THEN** the screen names every team's explainer, the word is visible while held and hidden after release
- **proof:** e2e

#### Scenario: Anderes Wort returns the rejected word
- **WHEN** on a pool of 3 words the first word is rejected with "Anderes Wort" and 3 more rounds are played
- **THEN** the new word differs from the rejected one, the rejected word is not marked used, and it is drawn again before the pool is reshuffled
- **proof:** unit

#### Scenario: Anderes Wort on a pool of one word
- **WHEN** the Codes pool has exactly one word and "Anderes Wort" is dispatched
- **THEN** the state is unchanged and no error is thrown, and the button is disabled on screen
- **proof:** unit

### Requirement: Codes play and scoring
The Spiel screen SHALL name the active team, its explainer and its guesser(s), show a turn ring in this round's
order with the current point value in the centre, and let explainers re-check the word via HoldToView. "Erraten"
SHALL award 3 / 2 / 1 points (attempt 0 / 1 / ≥2) to the active team and end the round; "Daneben" SHALL pass to the
next team (wrapping, attempt +1). "Überspringen" SHALL appear from attempt ≥3 and end the round with 0 points.

#### Scenario: Codes play screen names team, explainer and guessers
- **WHEN** a Codes round moves from Aufdecken to Spiel with 2 teams of 2
- **THEN** the heading names the active team, its explainer and its guesser, the turn ring lists both teams in this round's order with "3" in its centre, and holding the hold control shows the word
- **proof:** e2e

#### Scenario: Codes points by attempt
- **WHEN** "Erraten" is dispatched at attempt 0, 1, 2 and 4 in four separate rounds
- **THEN** the active team gains 3, 2, 1 and 1 points and each round ends in its result
- **proof:** unit

#### Scenario: Daneben passes to the next team
- **WHEN** in a 3-team round "Daneben" is dispatched three times
- **THEN** the active team moves to the next team in the round's order each time, wraps back to the opener, and the attempt counts 1, 2, 3
- **proof:** unit

#### Scenario: Überspringen from the third miss
- **WHEN** "Überspringen" is dispatched at attempt 2 and then at attempt 3
- **THEN** at attempt 2 nothing changes and the button is not shown; at attempt 3 the round ends with 0 points for every team
- **proof:** unit

### Requirement: Codes round result and Endstand
Rundenergebnis SHALL show the points and the team, or "Übersprungen", and the word, with "Nächste Runde", or "Zum
Ergebnis" after the last round. Endstand SHALL show the winner team(s), "Unentschieden" when several share the top
score, and the ranked list; the rematch SHALL keep the teams, reset the scores and pick a new random opener.

#### Scenario: Full Codes game
- **WHEN** 4 players in 2 teams play 1 round in which the first team misses and the second guesses
- **THEN** the result shows "+2", the second team and the word, "Zum Ergebnis" leads to the Endstand naming the second team as winner above the ranked list
- **proof:** e2e

#### Scenario: Codes skipped round result
- **WHEN** a Codes round is skipped after three misses
- **THEN** the result shows "Übersprungen" and the word, and no team's score changed
- **proof:** e2e

#### Scenario: Codes tie shown as Unentschieden
- **WHEN** 2 teams play 2 rounds and each round the opening team guesses on the first attempt
- **THEN** the Endstand shows "Unentschieden" with both teams at 3 points
- **proof:** e2e

#### Scenario: Codes rematch keeps the teams
- **WHEN** the rematch is started from the Endstand
- **THEN** a new game starts with the same teams and players, all scores 0, round 1, and the opener drawn from the RNG
- **proof:** unit

### Requirement: Codes engine, session and demo
Codes SHALL be a pure reducer with its RNG in the state (game-engine), save after every action and resume on
reload; "Spiel beenden" SHALL ask for confirmation in the arcade Modal. It SHALL ship one committed demo script
(content, seed, scripted actions) with Alex, Bo, Cleo and Dani in 2 teams playing 4 rounds to the Endstand and
"Demo beendet", gated like the existing demos. The script SHALL reach every branch of the Codes reducer: "Anderes
Wort", a word guessed on the first try (3 points), a miss then a guess by the other team (2 points), both teams
missing and the word guessed on the third try (1 point), three misses and "Überspringen" (0 points), the next
round opening with the next team and explainer, the Endstand with a winner, and "Nochmal spielen". Sound SHALL use
the existing cues: press on controls, reveal when the word is shown, correct on "Erraten", wrong on "Daneben", win
at the Endstand.

#### Scenario: Codes engine is deterministic and pure
- **WHEN** Codes is initialised twice with the same players, config, content and seed, given the same actions, and an action is applied to a frozen state
- **THEN** both runs end deeply equal and the frozen state is not mutated
- **proof:** unit

#### Scenario: Codes session resumes after reload
- **WHEN** a Codes game is in Spiel after one "Daneben" and the page is reloaded
- **THEN** the same team, attempt and point value are shown, with no discarded-state notice
- **proof:** e2e

#### Scenario: Leaving Codes asks for confirmation
- **WHEN** "Spiel beenden" is tapped during a Codes game and the Modal is dismissed with "Weiterspielen"
- **THEN** the Modal "Spiel beenden?" was shown and the game continues in the same phase
- **proof:** e2e

#### Scenario: Codes demo script plays to the end
- **WHEN** the Codes demo script's actions are applied to its fixture through the real reducer, twice
- **THEN** both runs reach the end state with identical states at every step, and every step changes the state
- **proof:** unit

#### Scenario: Codes demo scores 3, 2 and 1 and skips once
- **WHEN** the demo's rounds are walked
- **THEN** one word is guessed at attempt 0 for 3 points, one after one miss by the other team for 2 points, one after both teams missed for 1 point, and one ends with "Überspringen" after three misses for 0 points
- **proof:** unit ("Scenario: Codes demo covers every outcome branch")

#### Scenario: Codes demo redraws a word
- **WHEN** the demo reaches its `redraw` step
- **THEN** the word changes before the round starts, and the round's team and explainers stay the same
- **proof:** unit ("Scenario: Codes demo covers every outcome branch")

#### Scenario: Codes demo rotates opener and explainer
- **WHEN** the demo's states are walked
- **THEN** each new round opens with the next team and each team's explainer moves to its next player
- **proof:** unit ("Scenario: Codes demo covers every outcome branch")

#### Scenario: Codes demo ends with a winner and plays again
- **WHEN** the demo's last round is closed
- **THEN** the Endstand shows one winning team, and the final step taps "Nochmal spielen", which starts a new game with all scores 0; no tip contains "!" or an emoji
- **proof:** unit ("Scenario: Codes demo covers every outcome branch")

#### Scenario: Codes demo by tapping highlighted controls
- **WHEN** on a server with an empty database the user opens Codes' Demo and taps only the highlighted control at each step
- **THEN** exactly one control is highlighted at each step, the 4 rounds and the Endstand complete, "Demo beendet" is shown, and the word is shown with the [Demo] tag without holding
- **proof:** e2e

#### Scenario: Codes cues sound right
- **WHEN** Rue plays a Codes round with sound on
- **THEN** "Erraten" plays correct, "Daneben" plays wrong and the Endstand plays win
- **proof:** manual (audio judgement on a real device at Gate 2)

### Requirement: Codes look and copy
Codes SHALL have its own colour token, tile badge, tile and start-banner art (motif `codes`), the shared crew and
rings art in lobby and play, and all its screens SHALL pass the arcade look rules. Its copy SHALL be neutral
German with no "!" and no emoji.

#### Scenario: Codes art on tile and start screen
- **WHEN** Home and the Codes start screen are opened
- **THEN** the Codes tile and start banner each hold `data-motif="codes"` art with at least one drawn shape, in `--codes` colours, aria-hidden and without pointer events
- **proof:** e2e

#### Scenario: Codes screens meet the look rules
- **WHEN** the look walk renders the Codes start, lobby, Aufdecken, Spiel, result and Endstand screens
- **THEN** text contrast is at least 4.5:1, touch targets are at least 44px and no screen scrolls horizontally at 390px
- **proof:** e2e ("Scenario: Text contrast meets 4.5:1", "Scenario: Touch targets are at least 44px", "Scenario: No horizontal scroll on phone")

#### Scenario: Codes copy reads neutral
- **WHEN** a full Codes game is played and every visible text is collected
- **THEN** none contains "!" or an emoji
- **proof:** e2e

