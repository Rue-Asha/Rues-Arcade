# imposter Specification

## Purpose
TBD - created by archiving change party-games-rebuild. Update Purpose after archive.
## Requirements
### Requirement: Imposter round flow
Imposter SHALL take 3–12 players. Each round draws a pair; one random player gets the imposter question, all
others the crew question; `{NAME}`/`{NAME2}` are filled with distinct random player names once per round. In the
reveal phase each player in turn holds to view their question; between players the screen shows
"Gib das Handy an <Name>". Then the crew question is shown to all, then the imposter is unmasked, then the next
round starts. Skip redraws the pair and restarts the reveal. There is no scoring; rounds repeat until the
players leave.

#### Scenario: Full Imposter round
- **WHEN** 4 players play a round from reveal through unmask to the next round
- **THEN** exactly one player saw the imposter question, all players then see the crew question, the unmask names that player, and a new round starts in reveal
- **proof:** e2e

#### Scenario: Hand-over between players
- **WHEN** a player finishes viewing their question in the reveal phase
- **THEN** the screen shows "Gib das Handy an <next player>" before the next question can be viewed
- **proof:** e2e

#### Scenario: Skip redraws and restarts the reveal
- **WHEN** Skip is used during the reveal
- **THEN** a different pair is drawn (when the pool has more than one) and the reveal restarts at the first player
- **proof:** unit

#### Scenario: Name placeholders filled with distinct names
- **WHEN** the drawn pair contains `{NAME}` and `{NAME2}` and there are 3 players
- **THEN** both are replaced with two different player names, the same for every player in that round
- **proof:** unit

### Requirement: Imposter pair drawing
Pairs SHALL be drawn without repeats until the pool is exhausted, then reshuffled.

#### Scenario: No repeats until the pool is exhausted
- **WHEN** rounds are played on a pool of 5 pairs
- **THEN** the first 5 rounds use 5 different pairs and round 6 draws again from all 5
- **proof:** unit

#### Scenario: Pool of one pair repeats
- **WHEN** the pool has exactly one pair
- **THEN** every round uses that pair
- **proof:** unit

### Requirement: Imposter demo script
Imposter SHALL ship one committed demo script (content + seed + scripted actions) with Alex, Bo, Cleo and Dani that
plays one round and ends at "Demo beendet" on the "Nächste Runde" step. It SHALL reach every branch of the Imposter reducer: handover and
reading per player, the last reader leading to the crew phase, revealing the crew question, unmasking, revealing the
imposter, a skip that redraws the pair mid-reveal, and "Nächste Runde" as the last step. The engine has no game end and
does not record whether the group caught the imposter, so the tips SHALL narrate the caught imposter and say that
rounds go on until the group ends the game. Hidden questions SHALL keep the [Demo] tag.

#### Scenario: Imposter demo script plays to the end
- **WHEN** the Imposter demo script's actions are applied to its fixture through the real reducer, twice
- **THEN** both runs reach the end state with identical states at every step, and every step changes the state
- **proof:** unit

#### Scenario: Imposter demo skip redraws mid-reveal
- **WHEN** the demo reaches its `skip` step after at least one player has read
- **THEN** a different pair is dealt, the reveal restarts at the first player, and the imposter stays the same player
- **proof:** unit ("Scenario: Imposter demo covers every outcome branch")

#### Scenario: Imposter demo reveals the crew question and the imposter
- **WHEN** the demo's states are walked
- **THEN** in the round the last `seen` leads to the crew phase, the crew question is revealed, `unmask` follows and the imposter is revealed
- **proof:** unit ("Scenario: Imposter demo covers every outcome branch")

#### Scenario: Imposter demo ends on the next-round step
- **WHEN** the demo reaches its `nextRound` step
- **THEN** it is the last of 16 steps, a new deal and an imposter drawn from the RNG start round 2, and its tip says rounds go on until "Spiel beenden"
- **proof:** unit ("Scenario: Imposter demo covers every outcome branch")

#### Scenario: Imposter demo plays exactly one round
- **WHEN** the demo's states are walked
- **THEN** the script has 16 steps, every state before the last belongs to round 1, and the imposter is revealed once
- **proof:** unit ("Regression: Imposter demo plays one round and stops at the next-round step")

#### Scenario: Imposter demo narrates the caught imposter
- **WHEN** the tip of the imposter-reveal step is read
- **THEN** it names that round's imposter and says the group found the imposter, and no tip contains "!" or an emoji
- **proof:** unit ("Scenario: Imposter demo covers every outcome branch")

#### Scenario: Imposter demo by tapping highlighted controls
- **WHEN** the user opens Imposter's Demo and taps only the highlighted control at each step, including the skip
- **THEN** exactly one control is highlighted at each step, the round completes and "Demo beendet" is shown
- **proof:** e2e

### Requirement: Imposter played-with store
A forward-only migration `0008` SHALL add the table `imposter_played (pair_id, player_id)` with the primary key
(pair_id, player_id), `pair_id` referencing `imposter_pairs(id)` and `player_id` referencing `players(id)`, both
ON DELETE CASCADE, and the column `imposter_pairs.interchangeable` (NOT NULL, default 0). `GET /api/imposter/played`
SHALL return `[{ pairId, playerIds }]` for every pair with at least one entry, pairs and players in ascending id
order. `POST /api/imposter/played` with `{ pairId, playerIds }` SHALL add those players to that pair's list and
answer 204; an unknown pair id or player id SHALL be skipped silently, a player already on the list SHALL not be
added twice, and a body without an integer `pairId` and an array of integer `playerIds` SHALL be answered 400.
`DELETE /api/imposter/played/<pair>/<player>` SHALL remove that entry and answer 204, or 404 when there is none.

#### Scenario: Imposter migration 0008 on a fresh and an existing database
- **WHEN** a fresh database is migrated, and a database migrated through `0007` holding 2 Imposter pairs is migrated with all migrations and then again
- **THEN** both hold an empty `imposter_played` table, the 2 pairs are unchanged with `interchangeable` 0, and `0008_imposter_played.sql` is recorded once
- **proof:** unit

#### Scenario: Imposter played-with has no duplicates
- **WHEN** Alex is added to a pair's list, then Alex, Bo and Bo again are added to the same list
- **THEN** the list holds Alex and Bo once each
- **proof:** unit

#### Scenario: Imposter played-with skips unknown pairs and players
- **WHEN** `POST /api/imposter/played` is called with a pair id that does not exist, and with an existing pair and the player ids of Alex and of a player that does not exist
- **THEN** both calls answer 204, no row exists for the unknown pair, and the existing pair's list holds only Alex
- **proof:** unit

#### Scenario: Imposter played-with follows a deleted pair or player
- **WHEN** Alex is on the lists of pairs X and Y, Bo is on X's list, then pair Y is deleted and then saved player Bo is deleted
- **THEN** `GET /api/imposter/played` returns only X with Alex, and Alex is unchanged as a saved player
- **proof:** unit

#### Scenario: Imposter played-with API rejects a malformed body
- **WHEN** `POST /api/imposter/played` is called with no body, with `pairId` "3", and with `playerIds` [1, "x"]
- **THEN** each call answers 400 and the table is unchanged
- **proof:** unit

#### Scenario: Imposter played-with entry removed
- **WHEN** Alex is on a pair's list and `DELETE /api/imposter/played/<pair>/<Alex>` is called twice
- **THEN** the first call answers 204 and the list no longer holds Alex, the second answers 404
- **proof:** unit

### Requirement: Imposter crew reveal records the round
When the crew question is revealed in a round (the `reveal` action in phase `crew`), the play route SHALL post the
dealt pair with every saved player of that round (player id `player-<n>`) to `/api/imposter/played`. Guests SHALL
never be recorded, and a round with only guests SHALL post nothing. A pair skipped before the reveal and a round
ended before the reveal SHALL record nothing. A dispatch that does not uncover the crew question (any other action,
a second `reveal`, a reload) SHALL post nothing; a repeated post is harmless because entries are unique. The demo
SHALL never record.

#### Scenario: Imposter crew reveal records the saved players
- **WHEN** on a fresh server saved players Alex, Bo and Cleo and the guest Dani play a round on a pool of one pair up to "Crew-Frage aufdecken"
- **THEN** the post is answered 204 and the pair's list holds exactly Alex, Bo and Cleo
- **proof:** e2e

#### Scenario: Imposter round ended before the reveal records nothing
- **WHEN** on a fresh server saved players Alex, Bo and Cleo all read their question and "Spiel beenden" is confirmed in the crew phase before the crew question is revealed
- **THEN** `GET /api/imposter/played` returns no entry for the pair
- **proof:** e2e

#### Scenario: Imposter skipped pair is not recorded
- **WHEN** a round of saved players skips pair X during the hand-over, then the crew question of the new pair Y is revealed
- **THEN** exactly one post is sent, for Y with the saved players' ids
- **proof:** unit

#### Scenario: Imposter guests are never recorded
- **WHEN** the crew question is revealed in a round of saved Alex with guests Bo and Cleo, and in a round of guests only
- **THEN** the first posts only Alex's id, the second posts nothing
- **proof:** unit

#### Scenario: Imposter reveal records once
- **WHEN** every action of a round is dispatched, `reveal` is dispatched again on the uncovered crew question, and the unmask and next round follow
- **THEN** exactly one post is sent, at the transition from the covered to the uncovered crew question
- **proof:** unit

#### Scenario: Imposter demo neither records nor shows who knows
- **WHEN** the Imposter demo is played to the end
- **THEN** no request to `/api/imposter/played` is made and no "Wer kennt die Frage?" control is shown at any step
- **proof:** e2e

### Requirement: Imposter played-with on Inhalte
On the Imposter Inhalte page every pair card SHALL carry a "Gespielt mit" button with `aria-expanded` that expands
and collapses that card's played-with section; every card starts collapsed, each card expands on its own, and the
state is not persisted. The section (group "Spielerliste") SHALL list the saved players on the pair's list, each
with "Entfernen", show "Noch niemand." when the list is empty, and offer a "+ <Name>" button for every saved player
not on the list (none when there are no saved players). Adding and removing SHALL go through the played-with API
and change the card only when the response is ok. The Inhalte pages of the other games SHALL be unchanged.

#### Scenario: Imposter card edits its played-with list
- **WHEN** on a fresh server with saved players Alex, Bo and Cleo and a pair whose list holds Alex, the user expands "Gespielt mit" on that card, taps "+ Bo", removes Alex and reloads
- **THEN** before the reload the section lists Bo and offers "+ Alex" and "+ Cleo"; after the reload the card is collapsed, and expanded again it lists Bo and not Alex
- **proof:** e2e

#### Scenario: Imposter played-with section collapses per card
- **WHEN** on a fresh server with two pairs the user expands "Gespielt mit" on one card, then reloads
- **THEN** before the reload only that card shows its section and the other card's button reads `aria-expanded` false; after the reload both are collapsed
- **proof:** e2e

#### Scenario: Imposter played-with section with nobody on the list
- **WHEN** on a fresh server with saved players Alex and Bo the user expands "Gespielt mit" on a pair with an empty list
- **THEN** the section shows "Noch niemand." and the buttons "+ Alex" and "+ Bo"
- **proof:** e2e

#### Scenario: Imposter played-with section without saved players
- **WHEN** on a fresh server with no saved players the user expands "Gespielt mit" on a pair
- **THEN** the section shows "Noch niemand." and no button starting with "+"
- **proof:** e2e

#### Scenario: Imposter played-with card unchanged on a failed request
- **WHEN** Alex is on a pair's list and the user taps "Entfernen" while the delete request is answered with 500
- **THEN** the section still lists Alex
- **proof:** e2e

#### Scenario: Other games' Inhalte cards carry no played-with or flag
- **WHEN** on a fresh server the Wavelength Inhalte page with one spectrum is opened
- **THEN** its card has no "Gespielt mit" button and no button whose name ends in "austauschbar", and the add form has no "Austauschbar" toggle
- **proof:** e2e

### Requirement: Imposter who knows the prompt
A corner control "Wer kennt die Frage?" (HoldToView, corner) SHALL be rendered during a round from the hand-over
to the first player through every view phase and the crew phase until the crew question is revealed, and SHALL
show while held the names of the players of this round whose saved player is on the current pair's played-with list, in round order, or
"Noch niemand aus dieser Runde." when there is none. Guests and saved players outside this round SHALL never be
listed. Once the crew question is revealed, and in the unmask phase, the control SHALL not be rendered. The history
SHALL be fetched from `/api/imposter/played` once per deal (when a round starts or a skip deals a new pair), not on
every hand-over or phase change, so a later round of the same game shows what earlier rounds recorded. The demo
SHALL not show the control. On a phone (390×844) the control SHALL not push a phase's primary action below the
first viewport.

#### Scenario: Imposter hold shows who of the round knows the prompt
- **WHEN** on a fresh server saved Alex and Bo and the guest Cleo play a pair whose list holds Alex and the saved player Eli (not in the round), and the host holds "Wer kennt die Frage?" at the first hand-over, then releases it
- **THEN** while held exactly "Alex" is listed; after release no name is shown
- **proof:** e2e

#### Scenario: Imposter hold with nobody of the round on the list
- **WHEN** on a fresh server a round of saved players plays a pair whose list holds only a saved player outside the round, and the host holds the control
- **THEN** "Noch niemand aus dieser Runde." is shown and no name
- **proof:** e2e

#### Scenario: Imposter control only until the crew reveal
- **WHEN** a round goes from the first hand-over through the view phases to the crew phase, the crew question is revealed and the unmask follows
- **THEN** the control is present at every hand-over, every view phase and the covered crew phase, and absent after "Crew-Frage aufdecken" and in the unmask phase
- **proof:** e2e

#### Scenario: Imposter control follows a skip
- **WHEN** on a fresh server with two pairs, one listing saved Alex and one with an empty list, the host holds the control, skips the pair and holds it again
- **THEN** one hold lists "Alex" and the other shows "Noch niemand aus dieser Runde."
- **proof:** e2e

#### Scenario: Imposter later round shows earlier records
- **WHEN** on a fresh server saved Alex, Bo and Cleo play round 1 of a pool of one pair past the crew reveal into round 2, and the host holds the control at round 2's first hand-over
- **THEN** Alex, Bo and Cleo are listed
- **proof:** e2e

#### Scenario: Imposter history loaded once per deal
- **WHEN** a round of 3 players goes from the first hand-over through all hand-overs and view phases to the covered crew phase
- **THEN** exactly one `GET /api/imposter/played` was made in that round
- **proof:** e2e

#### Scenario: Imposter control keeps the primary action in the first viewport
- **WHEN** on a phone (390×844) a round is at the first hand-over, a view phase and the covered crew phase, measured after animations end
- **THEN** in each the primary action's bottom edge and the control lie within the first 844px
- **proof:** e2e

### Requirement: Interchangeable Imposter pairs
Each Imposter pair SHALL carry the flag `interchangeable`, off by default; existing pairs, pairs added by bulk import
(`crew | imposter`, no flag syntax) and pairs added by the importer stay off. The content API SHALL return the flag
on every Imposter pair (`{ id, a, b, interchangeable }`), accept it on add and edit (`interchangeable` true or false;
omitted on edit keeps the stored value), and no other content type SHALL carry it. The duplicate check stays on
(crew, imposter), so a pair with its sides swapped is a different pair. On the Imposter Inhalte page every card SHALL
show an icon button named "<crew> | <imposter> austauschbar" with `aria-pressed`, drawn as a reverse arrow when on
and as a crossed-out arrow when off; tapping it saves the flipped flag. The add form SHALL have a toggle
"Austauschbar" (`aria-pressed`, off) whose value is saved with the new pair and which turns off again after adding.

#### Scenario: Imposter flag toggled on a card survives a reload
- **WHEN** on a fresh server the user taps the "… austauschbar" button of a pair that is off, reloads, then taps it again and reloads
- **THEN** after the first reload the button reads `aria-pressed` true, after the second false
- **proof:** e2e

#### Scenario: Imposter pair added as interchangeable
- **WHEN** on a fresh server the user fills both sides, turns "Austauschbar" on and taps "Hinzufügen"
- **THEN** the new card's "… austauschbar" button reads `aria-pressed` true and the form's "Austauschbar" toggle is off again
- **proof:** e2e

#### Scenario: Imposter flag stored and returned by the API
- **WHEN** one pair is added with `interchangeable` true and one without it, the first is edited without the flag and the second edited with `interchangeable` true, then the first edited with false
- **THEN** the list returns true, false; then true, true; then false, true, and every Imposter item carries `interchangeable` as a boolean
- **proof:** unit

#### Scenario: Imposter import adds pairs with the flag off
- **WHEN** "Hund | Katze" and "Tee | Kaffee" are bulk-imported as Imposter pairs
- **THEN** both are imported with `interchangeable` false and the sides as written
- **proof:** unit

#### Scenario: Imposter swapped pair is not a duplicate
- **WHEN** "Hund | Katze" exists and "Katze | Hund" is added
- **THEN** it is saved (status 201) as a second pair
- **proof:** unit

#### Scenario: Only Imposter pairs carry the flag
- **WHEN** a Wavelength spectrum and a Codes word are added with `interchangeable` true and listed
- **THEN** each item is exactly `{ id, a, b }` and no other table has an `interchangeable` column
- **proof:** unit

#### Scenario: Imposter flag icons read as on and off
- **WHEN** the Imposter Inhalte page with one pair on and one off is looked at on phone and desktop
- **THEN** the on button reads as a reverse arrow and the off button as the same arrow crossed out, both at least 44px
- **proof:** manual (visual judgement of the two icons on the verifier's screenshots at Gate 2)

### Requirement: Swapped deal for interchangeable pairs
When a round deals an interchangeable pair, the engine SHALL decide 50/50 from the round's seeded RNG whether the
crew gets `a` and the imposter `b` or the crew gets `b` and the imposter `a`. A pair that is not interchangeable, or
carries no flag, SHALL always deal `a` to the crew and `b` to the imposter and SHALL draw no extra number from the
RNG, so the demo's states stay as they are. A skip SHALL redraw the decision together with the pair. Name
placeholders SHALL be filled the same way on both sides, and the crew reveal and the unmask SHALL show the sides as
they were dealt. The state shape and `stateVersion` stay unchanged.

#### Scenario: Imposter interchangeable pair swaps across seeds
- **WHEN** a pool of one interchangeable pair "A?" | "B?" is started with seeds 1 to 40
- **THEN** at least one game deals "B?" to the crew and "A?" to the imposter, at least one deals "A?" to the crew, and in every game crew and imposter text differ
- **proof:** unit

#### Scenario: Imposter fixed pair never swaps
- **WHEN** a pool of one pair with `interchangeable` false, and one without the flag, are each started with seeds 1 to 40 and played for 3 rounds
- **THEN** every round deals `a` to the crew and `b` to the imposter, and both pools give identical states for the same seed
- **proof:** unit

#### Scenario: Imposter swap is deterministic
- **WHEN** a pool of interchangeable pairs is started twice with the same seed and the same actions, skips and next rounds included
- **THEN** both runs give identical states at every step
- **proof:** unit

#### Scenario: Imposter skip redraws the swap
- **WHEN** a pool of two interchangeable pairs is started with seeds 1 to 40 and skipped once in the hand-over
- **THEN** after the skip the crew text belongs to the other pair, and across the seeds both sides of it are dealt to the crew
- **proof:** unit

#### Scenario: Imposter reveal and unmask show the dealt sides
- **WHEN** a swapped deal of "A?" | "B?" with 4 players is played through the view phases to the crew reveal and the unmask
- **THEN** every crew player viewed "B?", the imposter viewed "A?", the crew phase's `crew` is "B?" and the unmask's `imposter` is "A?"
- **proof:** unit

