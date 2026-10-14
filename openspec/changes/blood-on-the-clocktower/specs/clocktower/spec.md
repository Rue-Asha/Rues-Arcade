## ADDED Requirements

### Requirement: Trouble Brewing rules data
The game SHALL carry the 22 Trouble Brewing characters as data: id, English name, team (13 Townsfolk, 4 Outsiders, 4
Minions, 1 Demon), the ability text verbatim from `research/rules.md` §2 (TPI), a German explanation in neutral German
without "!", a trigger label (first night, each night, each night*, on death, by day, passive, setup) and an icon
(single-path SVG, game-icons.net, CC BY 3.0). It SHALL carry the setup table of `research/rules.md` §1 for 5–15 players
and the Baron's change (+2 Outsiders, −2 Townsfolk).

#### Scenario: Twenty-two characters by team
- **WHEN** the character list is read
- **THEN** it holds exactly 22 unique ids, 13 Townsfolk, 4 Outsiders, 4 Minions and 1 Demon, each with a non-empty English name, the ability text of rules.md §2, a non-empty German explanation without "!", a trigger label and an icon path
- **proof:** unit

#### Scenario: Setup table for every count
- **WHEN** the required team counts are computed for 5 to 15 players without and with the Baron
- **THEN** they equal the table (5: 3/0/1/1, 6: 3/1/1/1, 7: 5/0/1/1, 8: 5/1/1/1, 9: 5/2/1/1, 10: 7/0/2/1, 11: 7/1/2/1, 12: 7/2/2/1, 13: 9/0/3/1, 14: 9/1/3/1, 15: 9/2/3/1) and with the Baron each has 2 Townsfolk fewer and 2 Outsiders more
- **proof:** unit

### Requirement: Seating circle in setup
The setup board (Setup 1, storyteller only) SHALL show the N players as a seating circle in roster order that the
storyteller can reorder by dragging a seat onto another place or by tapping two seats to swap them; seat numbers SHALL
follow clockwise order from the top and SHALL be the seat numbers used everywhere after. Swapping SHALL also work by
keyboard (focus a seat, Enter, focus another, Enter).

#### Scenario: Swap two seats by tapping
- **WHEN** a 7-player setup board is open and seat 2 then seat 5 are tapped
- **THEN** the names of seats 2 and 5 are exchanged, seat numbers 1–7 stay in clockwise order from the top, and the change survives a reload
- **proof:** e2e

#### Scenario: Drag a seat to a new place
- **WHEN** on the desktop board the player on seat 1 is dragged onto seat 4
- **THEN** that player sits on seat 4 and the players between move up one seat, keeping clockwise order
- **proof:** e2e

#### Scenario: Swap seats by keyboard
- **WHEN** seat 3 is focused and Enter pressed, then seat 6 is focused and Enter pressed
- **THEN** the players of seats 3 and 6 are exchanged
- **proof:** e2e

#### Scenario: Five and fifteen seats fit the setup board
- **WHEN** the setup board is rendered with 5 and with 15 players at 390×844 and 1280×800
- **THEN** every seat is at least 44px, no two seats overlap, every seat lies inside the viewport width and the page does not scroll horizontally
- **proof:** e2e

#### Scenario: Seat order carries into the game
- **WHEN** seats are swapped and moved in setup and the distribution is locked
- **THEN** the seats keep the new order through the reveal, the nights and the days, and seat number = position + 1
- **proof:** unit

### Requirement: Character board with team counters
The setup board SHALL list all 22 characters grouped under Townsfolk, Outsider, Minions and Dämon, each group headed by
a live counter "assigned / required" from the setup table for N. A Baron in play SHALL change the requirement live to
+2 Outsiders and −2 Townsfolk; removing it SHALL revert. A team assigned beyond its requirement SHALL be shown as an
error in text, not by colour alone. Each character SHALL be assigned to at most one seat; a character already on a
seat SHALL show that seat and be unavailable for another seat until it is removed there.

#### Scenario: Counters follow the setup table
- **WHEN** the setup board opens for 7 players
- **THEN** it lists 22 characters under the four team headings and the counters read "Townsfolk 0 / 5", "Outsider 0 / 0", "Minions 0 / 1" and "Dämon 0 / 1"
- **proof:** e2e

#### Scenario: Baron changes the requirement live
- **WHEN** for 8 players the Baron is assigned, then removed again
- **THEN** with the Baron the counters require 3 Townsfolk and 3 Outsiders, and without it 5 and 1 again
- **proof:** e2e

#### Scenario: Over-assigned team shown as an error
- **WHEN** for 5 players the Poisoner and the Spy are both assigned
- **THEN** the Minions counter reads "2 / 1" with the text "zu viele" next to it, and "Weiter" is disabled
- **proof:** e2e

#### Scenario: Each character at most once
- **WHEN** the Empath is on seat 2 and an assignment of the Empath to seat 4 is dispatched
- **THEN** the state is unchanged, and on the board the Empath shows "Platz 2" and is disabled while seat 4 is selected
- **proof:** unit

### Requirement: Manual and random assignment
The storyteller SHALL assign characters by tapping a seat then a character, or a character then a seat, and remove one
by tapping it again. "Zufällig" SHALL fill every empty seat with a valid distribution that keeps the manually chosen
characters and respects a chosen Baron; "Alles neu" SHALL reassign every seat. A manual choice that no fill can complete
SHALL be flagged, and "Zufällig" SHALL then fill nothing and say why. All randomness SHALL come from the game's seeded
RNG.

#### Scenario: Assign by seat or by character first
- **WHEN** seat 1 then "Chef" are tapped, and then "Imp" then seat 3 are tapped
- **THEN** seat 1 holds the Chef and seat 3 the Imp, and the counters show 1 Townsfolk and 1 Demon assigned
- **proof:** e2e

#### Scenario: Random fill keeps manual choices
- **WHEN** for 10 players the Empath is on seat 3 and "Zufällig" is dispatched
- **THEN** seat 3 still holds the Empath, every seat holds a character, each character appears once and the teams equal `required(10, baronInPlay)` (7/0/2/1 without the Baron, 5/2/2/1 with it, since random fill may draw the Baron)
- **proof:** unit

#### Scenario: Random fill with a manual Baron
- **WHEN** for 7 players the Baron is on seat 1 and "Zufällig" is dispatched
- **THEN** the distribution is 3 Townsfolk, 2 Outsiders, 1 Minion (the Baron) and 1 Demon
- **proof:** unit

#### Scenario: Alles neu rerolls every seat
- **WHEN** a complete distribution with manual choices exists and "Alles neu" is dispatched twice from the same state with the same seed
- **THEN** each result is a valid distribution for N, both results are equal, and the manual choices are not kept
- **proof:** unit

#### Scenario: Impossible manual choice is flagged
- **WHEN** for 5 players the Poisoner and the Spy are assigned and "Zufällig" is tapped
- **THEN** no empty seat is filled and the board reads "Diese Verteilung geht nicht auf: zu viele Minions."
- **proof:** e2e

#### Scenario: Random distribution is seeded
- **WHEN** two games with the same seed and players receive the same setup actions
- **THEN** their distributions, believed role, red herring and bluffs are equal, and a different seed gives a different distribution for at least one of 20 seeds
- **proof:** unit

### Requirement: Drunk and red herring
When the Drunk is assigned the storyteller SHALL pick a believed Townsfolk that is not in play, or accept a random one;
when a Fortune Teller is in play, or the Drunk believes they are the Fortune Teller, the storyteller SHALL pick a red
herring among the good players (the Fortune Teller themself included), or accept a random one. Reassigning a seat SHALL
clear picks that no longer hold: a believed role that is now in play, a believed role of a seat that is no longer the
Drunk, and a red herring without a (believed) Fortune Teller or on a seat that is now evil.

#### Scenario: Believed role is a Townsfolk not in play
- **WHEN** for 8 players the Drunk is assigned while the Chef is in play, and believed roles Chef and Monk are dispatched
- **THEN** Chef is rejected (state unchanged) and Monk is accepted; a random pick is always a Townsfolk not in play
- **proof:** unit

#### Scenario: Red herring is a good player
- **WHEN** a Fortune Teller is in play and red herrings on the Imp's seat, on a Townsfolk's seat and on the Fortune Teller's own seat are dispatched
- **THEN** the Imp's seat is rejected and the other two are accepted
- **proof:** unit

#### Scenario: Drunk Fortune Teller gets a red herring
- **WHEN** the Drunk believes they are the Fortune Teller and no real Fortune Teller is in play
- **THEN** a red herring is required before "Weiter" and can be picked or randomised
- **proof:** unit

#### Scenario: Reassigning clears stale picks
- **WHEN** the Drunk believes Monk, then the Drunk's seat is reassigned to the Chef; and separately the Fortune Teller with a red herring is removed; and separately the Drunk believes Monk and the Monk is then assigned to another seat
- **THEN** in each case the believed role or red herring is cleared
- **proof:** unit

#### Scenario: Drunk and red herring on the board
- **WHEN** the Drunk and the Fortune Teller are assigned on the board
- **THEN** the Drunk's seat shows a "glaubt" picker offering only Townsfolk not in play, a "Red Herring" picker offers only good players, and "Zufällig" fills both
- **proof:** e2e

### Requirement: Confirm and lock the distribution
"Weiter" on the setup board SHALL be enabled only for a complete, valid distribution (every seat assigned, team counts
as required, believed role and red herring set where needed) and SHALL ask "Rollen sind verteilt und notiert?" before
the reveal. Cancelling SHALL keep everything; confirming SHALL lock the distribution and seating for the rest of the
game.

#### Scenario: Weiter needs a complete valid distribution
- **WHEN** a 6-player board has one empty seat, then all seats filled but the Drunk without a believed role, then a believed role picked
- **THEN** "Weiter" is disabled in the first two states and enabled in the third
- **proof:** e2e

#### Scenario: Confirm before the reveal
- **WHEN** "Weiter" is tapped, the dialog "Rollen sind verteilt und notiert?" is cancelled with "Zurück", then "Weiter" is tapped again and confirmed
- **THEN** after cancelling the board shows the same distribution and seating, and after confirming the reveal of seat 1 is shown
- **proof:** e2e

#### Scenario: Locked distribution cannot change
- **WHEN** after the lock assign, swap, move, randomise and reroll actions are dispatched
- **THEN** the state is unchanged
- **proof:** unit

### Requirement: Character sheet on the setup board
The setup board SHALL show the character sheet (the same component as the deck's last slide) below the board.

#### Scenario: Setup board shows the character sheet
- **WHEN** the setup board is opened
- **THEN** below the board one `[data-testid="sheet"]` lists all 22 characters with their ability texts and the "So gewinnt ihr" box
- **proof:** e2e

### Requirement: Private role reveal
After the lock the game SHALL walk the seats in seat order: a screen with only the player's name and seat number and
"Rolle zeigen"; then an animated role card with the character's icon, English name, team, German explanation and the
original ability text, and "Verbergen & weitergeben"; then the next seat. The Drunk SHALL see their believed
Townsfolk's card and never "Drunk". The card SHALL stay until hidden (no timer), a hidden card SHALL leave no character
text in the page, a reload SHALL resume at the same seat with the card hidden, and after the last seat the game SHALL
move to night 1.

#### Scenario: Reveal walks seat by seat
- **WHEN** a locked 5-player game reaches the reveal and each seat's card is shown and hidden
- **THEN** each seat starts with only "<Name>", "Platz n" and "Rolle zeigen" and no character name, the card shows icon, name, team, German explanation and ability text, and hiding seat 5's card starts night 1 (header "Nacht 1 · 5 von 5 leben")
- **proof:** e2e

#### Scenario: Drunk sees the believed Townsfolk
- **WHEN** the Drunk's seat, believing Empath, reveals the card
- **THEN** the card shows "Empath" with the Empath's team, explanation and ability, and the page contains no text "Drunk"
- **proof:** e2e

#### Scenario: Card stays until hidden
- **WHEN** a role card is shown and the clock advances 5 minutes
- **THEN** the card is still shown
- **proof:** e2e

#### Scenario: Hidden card leaves nothing readable
- **WHEN** a card is hidden and the stage transition has ended
- **THEN** no element in the page contains that seat's character name, team or ability text
- **proof:** e2e

#### Scenario: Reload mid-reveal resumes hidden
- **WHEN** seat 3's card is shown and the page is reloaded
- **THEN** seat 3's name screen with "Rolle zeigen" is shown and the card is hidden
- **proof:** e2e

### Requirement: Grimoire circle
The default play screen SHALL be the grimoire circle: N numbered seats in clockwise order with names; each seat SHALL
show alive or dead, and for the dead whether the ghost vote is still available, by shape and label (for example a
shroud and "Stimme" / "keine Stimme"), not colour only; no character SHALL be shown by default. A seat's death SHALL be
animated (finite, transform/opacity, instant under reduced motion). 5 to 15 seats SHALL be legible on phone and
desktop.

#### Scenario: Circle shows seats, alive and ghost votes
- **WHEN** a day with 7 seats is shown where seat 2 is dead with a ghost vote and seat 5 is dead without one
- **THEN** seats 1–7 are numbered clockwise from the top with their names, seat 2 shows the dead marker and "Stimme", seat 5 the dead marker and "keine Stimme", the markers differ in shape, and no character name is in the page
- **proof:** e2e

#### Scenario: Circle geometry for five to fifteen seats
- **WHEN** seat positions are computed for 5 to 15 seats in a 340px and an 640px box
- **THEN** seat 1 is at the top, seats run clockwise at equal angles, no two 44px seat boxes overlap and every box lies inside the container
- **proof:** unit

#### Scenario: Circle legible on phone and desktop
- **WHEN** the day grimoire is rendered with 5 and with 15 seats at 390×844 and 1280×800
- **THEN** every seat is at least 44px with its number and name visible, and the page does not scroll horizontally
- **proof:** e2e

#### Scenario: Header shows the night or day and the alive count
- **WHEN** an 8-player game is opened at `/spielen` in night 2 with 7 alive and on day 2 with 6 alive
- **THEN** the header status reads "Nacht 2 · 7 von 8 leben" and "Tag 2 · 6 von 8 leben" in Alegreya Sans
- **proof:** e2e

#### Scenario: Death on the circle is animated
- **WHEN** dawn shows a death with motion allowed, and again with `prefers-reduced-motion: reduce`
- **THEN** with motion the dying seat runs a finite transform/opacity animation, and under reduced motion no animation runs and the dead marker shows at once
- **proof:** e2e

### Requirement: Clocktower session
The game state SHALL survive a reload at any point through the existing per-game session, versioned by `stateVersion`
and checked against the entry's explicit shape template; a stale-version session SHALL be discarded with the existing
notice; "Spiel beenden" SHALL clear it.

#### Scenario: Every phase survives a reload
- **WHEN** states in setup, reveal, every night screen kind, dawn, day with an open nomination, during a vote and at the end are serialised and loaded
- **THEN** each fits the shape template and loads deeply equal to the saved state
- **proof:** unit

#### Scenario: Stale Clocktower session discarded
- **WHEN** a Clocktower session with an older version is stored and `/spiele/clocktower/spielen` is opened
- **THEN** the discard notice is shown and the session is removed
- **proof:** e2e

#### Scenario: Spiel beenden clears the Clocktower session
- **WHEN** a running Clocktower game is ended with "Spiel beenden" and "Beenden" and the start screen is reopened
- **THEN** no "Weiterspielen" is offered and no session is stored
- **proof:** e2e

### Requirement: Dusk
Each night SHALL start with a generic "Alle schlafen ein" screen (public, bell) whose "Weiter" leads to the private
questions of S33 if any are open, then to the first waking step.

#### Scenario: Night starts with Alle schlafen ein
- **WHEN** night 1 begins after the reveal, and night 2 begins after a day
- **THEN** "Alle schlafen ein" is shown with "Weiter", no player or character name is on that screen, and "Weiter" shows the first waking step ("Wecke …")
- **proof:** e2e

### Requirement: Night order
The night guide SHALL walk only the characters that wake that night, in the official order of `research/rules.md` §3.
First night: Minion info and Demon info with 3 bluffs (7+ players only), Poisoner, Washerwoman, Librarian, Investigator,
Chef, Empath, Fortune Teller, Butler, Spy. Other nights: Poisoner, Monk, Scarlet Woman (only after a takeover), Imp,
Ravenkeeper (if alive at dusk; marked "nur wenn heute Nacht gestorben"), Empath, Fortune Teller, Undertaker (only if
someone was executed today), Butler, Spy. Characters dead at dusk SHALL be skipped; the Drunk SHALL wake at the slot of
the believed Townsfolk; a new Imp (starpass or takeover) SHALL wake as the Imp from then on. Nights from 2 on SHALL end
with the death step; night 1 SHALL have no Imp step and no death step.

#### Scenario: Night order for 5, 7 and 15 players
- **WHEN** the steps of night 1 and night 2 are built for the 5-, 7- and 15-player fixtures of the design
- **THEN** each list equals the official order filtered to the characters in play, with Minion and Demon info only for 7 and 15, no Imp step on night 1, and the death step last on night 2
- **proof:** unit

#### Scenario: Small games have no evil info
- **WHEN** night 1 is built for 5 and 6 players
- **THEN** it holds no Minion info, no Demon info and no bluffs
- **proof:** unit

#### Scenario: Conditional wakes on other nights
- **WHEN** night 2 is built after a day with no execution, then after a day with an execution, with the Ravenkeeper alive, and with the Monk dead
- **THEN** the Undertaker wakes only after the execution, the Ravenkeeper step is present and marked "nur wenn heute Nacht gestorben", the Monk is skipped, and the Scarlet Woman step is absent without a takeover
- **proof:** unit

#### Scenario: Drunk wakes at the believed slot
- **WHEN** the Drunk believes Empath and night 1 is built
- **THEN** the Drunk's seat wakes in the Empath slot, labelled as Empath, and no real Empath step exists
- **proof:** unit

#### Scenario: New Imp wakes as Imp
- **WHEN** the Imp starpassed to the Poisoner in night 2 and night 3 is built
- **THEN** the former Poisoner's seat wakes in the Imp slot and no Poisoner step exists, and the old Imp's seat is skipped
- **proof:** unit

### Requirement: Waking step cycle
Each waking step SHALL be a cycle of four screens: (1) "Wecke <Name> (#n)" (private: the character, how to run it, and
the computed true info); (2) the role card with its explanation; (3) the grimoire circle with the show-bar; (4) a
generic "Schlaf wieder ein", whose "Weiter" opens the next step. Every step SHALL offer "Überspringen" (to the next
step's first screen) and the guide SHALL offer "Zurück" to the previous screen, across steps; neither SHALL lose
recorded state. A group step SHALL name every seat to wake.

#### Scenario: Each waking step is four screens
- **WHEN** night 1 of a 5-player game reaches the Empath on seat 2 (Bo)
- **THEN** the screens are "Wecke Bo (#2)" with "Empath" and its hint, then the Empath card, then the circle with the show-bar, then "Schlaf wieder ein", and "Weiter" then shows the next step's "Wecke …"
- **proof:** e2e

#### Scenario: Group steps name every seat
- **WHEN** night 1 of a 10-player game with the minions on seats 3 (Cleo) and 4 (Dani) reaches Minion info
- **THEN** the wake screen reads "Wecke Cleo (#3) und Dani (#4)"
- **proof:** e2e

#### Scenario: Skip and back keep state
- **WHEN** the Imp's target is noted, "Überspringen" is used on the next step and "Zurück" is used twice
- **THEN** skipping lands on the following step's wake screen, "Zurück" returns screen by screen into the previous step, and the noted target is unchanged
- **proof:** unit

### Requirement: True info suggestion
The wake screen SHALL show the computed true info, labelled "Vorschlag" with the caveat that poison, the Drunk, the Spy
and the Recluse may change it: Washerwoman, Librarian, Investigator — a matching player and character plus one other
player (Librarian "0 Outsider" when none are in play, the Drunk shown as Drunk); Chef — the number of adjacent evil
pairs; Empath — evil among the nearest living neighbours; Fortune Teller — the Demon's seat and the red herring;
Undertaker — the character executed today (the Drunk shown as Drunk); Ravenkeeper — no precomputed info (the show-bar
is used); Spy, Butler, Monk, Poisoner — no info. A Drunk's step SHALL show the true value with a note that the player
is the Drunk. Chef and Empath SHALL use the current seating and alive state.

#### Scenario: Pair info for the first-night Townsfolk
- **WHEN** info is computed for the Washerwoman, Librarian and Investigator in a fixture with a Chef, a Recluse and a Spy, and for the Librarian in a game without Outsiders and in one with the Drunk
- **THEN** each returns a seat holding a matching character, that character and one other seat; the Librarian returns "0 Outsider" without Outsiders and names the Drunk as "Drunk"
- **proof:** unit

#### Scenario: Chef counts evil pairs around the circle
- **WHEN** evil players sit on seats 1, 2, 3 and 7 of 7 (three in a row plus a wrap-around neighbour of seat 1)
- **THEN** the Chef info is 3
- **proof:** unit

#### Scenario: Empath skips dead neighbours
- **WHEN** the Empath sits on seat 4, seat 5 is dead, seat 6 is the Imp and seat 3 is good
- **THEN** the Empath info is 1
- **proof:** unit

#### Scenario: Fortune Teller and Undertaker info
- **WHEN** info is computed for the Fortune Teller with a red herring, and for the Undertaker after the Drunk was executed today
- **THEN** the Fortune Teller info names the Demon's seat and the red herring's seat, and the Undertaker info is "Drunk"
- **proof:** unit

#### Scenario: Roles without info
- **WHEN** info is computed for the Ravenkeeper, Spy, Butler, Monk and Poisoner
- **THEN** each returns no info
- **proof:** unit

#### Scenario: Suggestion labelled with its caveat
- **WHEN** the Empath's wake screen is shown, and the wake screen of a Drunk believing Empath
- **THEN** the info is under "Vorschlag" with the line "Gift, Drunk, Spy und Recluse können das ändern.", and the Drunk's screen also reads "Diese Person ist der Drunk."
- **proof:** e2e

### Requirement: Show-bar
Screen (3) of a waking step SHALL offer a show-bar whose items open a full-screen card that closes on tap: a character
card (picker over all 22 characters), "Das ist der Dämon", "Deine Minions", the 3 bluffs, "Du bist" plus a character, a
big number 0–9, and Ja / Nein. The items a role needs SHALL be preselected (Washerwoman, Librarian, Investigator: the
character; Chef, Empath: the number; Fortune Teller: Ja/Nein; Minion info: "Das ist der Dämon"; Demon info: "Deine
Minions" then the bluffs; new Imp by starpass or takeover: "Du bist" Imp; Undertaker, Ravenkeeper: the character).
The bluffs SHALL be 3 good characters not in play, suggested as 2 Townsfolk and 1 Outsider when possible, never the
Drunk's believed role, drawn from the seeded RNG and rerollable before they are shown.

#### Scenario: Show-bar opens full-screen cards
- **WHEN** each show-bar item is opened on the circle screen and the card is tapped
- **THEN** each opens a card covering the viewport with its content (a character, "Das ist der Dämon", "Deine Minions", three bluff characters, "Du bist" with a character, a digit, "Ja" or "Nein") and the tap closes it
- **proof:** e2e

#### Scenario: Role preselects its cards
- **WHEN** the circle screens of the Washerwoman, Chef, Fortune Teller, Minion info, Demon info, a new Imp after a starpass and a Scarlet Woman after her takeover are shown
- **THEN** the preselected items are the Washerwoman's Townsfolk character, a number, Ja/Nein, "Das ist der Dämon", "Deine Minions" with the bluffs, and "Du bist" Imp for both new Imps
- **proof:** e2e

#### Scenario: Bluffs are good characters not in play
- **WHEN** bluffs are drawn for many seeds with the Drunk believing Monk
- **THEN** each draw has 3 distinct good characters, none in play and never the Monk, 2 Townsfolk and 1 Outsider whenever an Outsider is free, and the same seed gives the same bluffs
- **proof:** unit

#### Scenario: Bluffs can be rerolled before showing
- **WHEN** "Neu würfeln" is tapped at Demon info before the bluffs card is opened
- **THEN** the three bluffs change and still are good characters not in play
- **proof:** e2e

### Requirement: Hold-to-view grimoire
At night a "Grimoire" button SHALL show every seat's character (plus the Drunk's believed role, the red herring and the
Demon marker) only while it is held, and hide them on release, also when released outside the button, and by keyboard
(Space held). It SHALL not exist during the day.

#### Scenario: Grimoire visible only while held
- **WHEN** "Grimoire" is held on a night screen and released
- **THEN** while held every seat shows its character, the Drunk's seat "Drunk (glaubt: <X>)", the red herring and the Demon marker, and after release none of that text is in the page
- **proof:** e2e

#### Scenario: Release outside the button hides the grimoire
- **WHEN** "Grimoire" is pressed, the pointer moves off the button and is released there
- **THEN** the characters are hidden
- **proof:** e2e

#### Scenario: Grimoire by keyboard
- **WHEN** "Grimoire" is focused, Space is held and released, with `prefers-reduced-motion: reduce`
- **THEN** the characters show while Space is held and hide on release, with no animation running
- **proof:** e2e

#### Scenario: No grimoire by day
- **WHEN** a day screen is shown
- **THEN** no "Grimoire" control exists
- **proof:** e2e

### Requirement: Imp step
The Imp's waking step SHALL offer "Ziel notieren" (a seat, which prefills the death step) and "Imp wählt sich selbst":
the storyteller then picks a living Minion as the new Imp — only the Scarlet Woman when she is alive and at least 5
players are alive — and a "Du bist: Imp" wake for the new Imp SHALL follow in the same night. Without a living Minion
the Imp simply dies. Monk protection and the Soldier are the storyteller's call: they record no death.

#### Scenario: Noted target prefills the death step
- **WHEN** at the Imp step seat 4 is noted with "Ziel notieren" and the night reaches "Wer ist heute Nacht gestorben?"
- **THEN** seat 4 is preselected, other living seats can be added, "Niemand" clears the selection
- **proof:** e2e

#### Scenario: Starpass makes a living Minion the Imp
- **WHEN** in night 2 the Imp chooses themself and the Poisoner is picked
- **THEN** the Demon seat becomes the Poisoner's, a "new Imp" step for that seat follows tonight, the old Imp is prefilled as dead at the death step, and the history records a starpass
- **proof:** unit

#### Scenario: Scarlet Woman forced on a starpass
- **WHEN** the Imp chooses themself while the Scarlet Woman and the Poisoner are alive and 6 players are alive
- **THEN** only the Scarlet Woman can be picked; with 4 players alive both can
- **proof:** unit

#### Scenario: Starpass without a living Minion
- **WHEN** the Imp chooses themself while every Minion is dead
- **THEN** no new Imp is made, the Imp is prefilled as dead, and after the death step good wins
- **proof:** unit

#### Scenario: Imp wählt sich selbst wakes the new Imp
- **WHEN** "Imp wählt sich selbst" is used and the Poisoner on seat 3 (Cleo) is picked
- **THEN** after the Imp's "Schlaf wieder ein" the guide shows "Wecke Cleo (#3)" with "Du bist" and Imp preselected in the show-bar
- **proof:** e2e

### Requirement: Night death step
Nights from 2 on SHALL end with a private "Wer ist heute Nacht gestorben?" step: a multi-select of living seats,
prefilled with the noted Imp target or the starpassed Imp, with "Niemand" allowed; dead seats SHALL not be selectable.
After it the win check SHALL run, then dawn.

#### Scenario: Death step records the night's deaths
- **WHEN** seats 2 and 5 are selected at the death step and confirmed, and in another night "Niemand"
- **THEN** seats 2 and 5 are dead with their ghost votes available and are tonight's deaths; with "Niemand" nobody dies
- **proof:** unit

#### Scenario: Dead seats cannot be selected
- **WHEN** the death step is shown with seat 6 already dead
- **THEN** seat 6 is disabled with "bereits tot", and a deaths action naming seat 6 leaves the state unchanged
- **proof:** e2e

#### Scenario: Win check after the death step
- **WHEN** the death step leaves 2 players alive
- **THEN** evil has won, and dawn is followed by the end teaser instead of the timer
- **proof:** unit

### Requirement: Dawn
Dawn SHALL show "Alle aufwachen" (bell) for the storyteller to announce, then the circle with the night's deaths
animated in, or "Niemand ist gestorben", then a timer dialog: default 8 minutes, adjustable 1–59 ("Minute weniger" /
"Minute mehr"), "Timer starten" or "Ohne Timer". The timer SHALL be stored as a deadline so a reload keeps the remaining
time.

#### Scenario: Dawn shows the night's deaths
- **WHEN** night 2 ends with seat 3 dead, and another night with nobody dead
- **THEN** after "Alle aufwachen" the circle shows seat 3 dying, and in the other case "Niemand ist gestorben"
- **proof:** e2e

#### Scenario: Day timer dialog
- **WHEN** the timer dialog opens, "Minute weniger" is tapped 8 times and "Minute mehr" 60 times
- **THEN** it starts at "8 min", never goes below "1 min" or above "59 min", and "Ohne Timer" opens the day without a timer
- **proof:** e2e

#### Scenario: Reload keeps the remaining time
- **WHEN** a 5-minute timer is started, the clock advances 2 minutes and the page is reloaded
- **THEN** the timer shows 3:00 or less and more than 2:55
- **proof:** e2e

### Requirement: Day timer
The day timer SHALL count down on the grimoire screen; at 0 it SHALL turn red and read "Zeit um" but never block; it
SHALL keep running during nominations and votes; the day SHALL be endable at any time.

#### Scenario: Timer reads Zeit um at zero and never blocks
- **WHEN** the clock passes the deadline
- **THEN** the timer reads "Zeit um" in the evil colour, and nominations and "Tag beenden" still work
- **proof:** e2e

#### Scenario: Timer keeps running during a vote
- **WHEN** a vote is in progress and the clock advances 1 minute
- **THEN** the timer on the clock screen shows 1 minute less
- **proof:** e2e

#### Scenario: Remaining time from the deadline
- **WHEN** the remaining time is computed for a deadline 125 s ahead, 0 s ahead and 30 s past
- **THEN** it is "2:05", "Zeit um" and "Zeit um"
- **proof:** unit

### Requirement: Nominations
A nomination SHALL be made by tapping the nominee, then picking the nominator. The game SHALL enforce: one open
nomination at a time, only living players nominate, each player nominates at most once and is nominated at most once
per day, self-nomination is allowed, dead players can be nominated, no nominations after an immediate execution.
Unavailable choices SHALL be disabled with a reason. "Zurück" before the vote starts SHALL cancel the nomination
without using it up.

#### Scenario: Nomination rules enforced
- **WHEN** nominations are dispatched with a dead nominator, a repeated nominator, a repeated nominee, while another is open, after an immediate execution, as a self-nomination and of a dead nominee
- **THEN** the first five leave the state unchanged and the last two open a nomination
- **proof:** unit

#### Scenario: Unavailable choices show a reason
- **WHEN** Bo has nominated and Cleo has been nominated today and Dani is dead, and a nomination is started
- **THEN** Cleo is disabled as nominee with "heute schon nominiert", and as nominators Bo is disabled with "hat heute schon nominiert" and Dani with "ist tot"
- **proof:** e2e

#### Scenario: Zurück cancels the nomination unused
- **WHEN** Alex nominates Bo and "Zurück" is tapped before "Abstimmung beginnen"
- **THEN** Alex can still nominate and Bo can still be nominated today
- **proof:** e2e

### Requirement: Voting clock
After a nomination the circle SHALL become a clock whose hand points from the centre at the nominee, with "Abstimmung
beginnen" and "Zurück", the threshold ⌈alive/2⌉ and today's high-water mark shown. On start the hand SHALL sweep
clockwise one seat per 2.5 s (injectable for tests) from the seat after the nominee and end at the nominee, who votes
last (15 seats = 37.5 s). The storyteller SHALL mark the seat under the hand as voting by tapping it or pressing Space;
marked seats light up; dead players without a ghost vote SHALL not be markable. Under reduced motion the hand SHALL jump
seat to seat. After the sweep a confirm screen SHALL show the count prefilled from the marks, the marks editable and a
count stepper for timing corrections; confirming SHALL spend the ghost vote of every dead player marked as voting.

#### Scenario: Clock points at the nominee
- **WHEN** Alex (seat 1) nominates Dani (seat 4) in a 7-player day with 6 alive and a high-water mark of 3
- **THEN** the hand points at seat 4, "Abstimmung beginnen" and "Zurück" are shown, and the clock reads "Nötig: 3" and "Höchststand: 3"
- **proof:** e2e

#### Scenario: Sweep order ends at the nominee
- **WHEN** the vote order is computed for the nominee on seat 3 of 7 and on seat 7 of 7
- **THEN** it is seats 4, 5, 6, 7, 1, 2, 3 and seats 1–7
- **proof:** unit

#### Scenario: Sweep lasts 2.5 seconds per seat
- **WHEN** the sweep duration is computed for 5 and 15 seats with the default seat time
- **THEN** it is 12.5 s and 37.5 s
- **proof:** unit

#### Scenario: Real short sweep marks votes
- **WHEN** the seat time is set to 300 ms for the test, a vote is started, seat 5 is tapped and Space is pressed while the hand is on seat 6
- **THEN** seats 5 and 6 light up as voting, the hand ends on the nominee, and the confirm screen shows the count 2
- **proof:** e2e

#### Scenario: Dead without ghost vote cannot be marked
- **WHEN** the hand reaches a dead seat without a ghost vote and it is tapped
- **THEN** it does not light up and is labelled "keine Stimme"
- **proof:** e2e

#### Scenario: Confirm corrects missed timing
- **WHEN** on the confirm screen seat 2 is marked additionally and the count stepper is raised by one
- **THEN** the count reads 4 and the confirmed vote records 4 votes and the marked voters
- **proof:** e2e

#### Scenario: Dead voters spend their ghost vote
- **WHEN** a vote is confirmed with the dead seat 5 among the voters
- **THEN** seat 5 has no ghost vote any more and the confirmed votes include it
- **proof:** unit

#### Scenario: Reduced motion hand jumps
- **WHEN** `prefers-reduced-motion: reduce` is set and a vote runs with a short seat time
- **THEN** the hand moves seat by seat with no running transform animation
- **proof:** e2e

### Requirement: Vote result
A confirmed vote SHALL put the nominee on the block, replacing any previous holder, when its votes are at least
⌈alive/2⌉ (living players at vote time) and more than today's high-water mark; votes equal to the high-water mark SHALL
be a tie that clears the block while the mark stays; otherwise nothing SHALL change. Dead players' votes count fully.
The block holder SHALL be marked on the circle.

#### Scenario: Vote result by threshold and high-water mark
- **WHEN** with 7 alive votes of 3, 4, then 5, then 5 again, then 4 are confirmed for five nominees
- **THEN** the results are "zu wenig" (3 < 4), on the block (4), on the block replacing it (5), tie with nobody on the block (5), and nothing (4 < 5 after the tie)
- **proof:** unit

#### Scenario: Threshold uses living players at vote time
- **WHEN** 8 players are alive at the first vote and 7 at a later vote the same day, and 2 of the 4 votes come from dead players
- **THEN** the thresholds are 4 and 4, and the dead votes count toward the total
- **proof:** unit

#### Scenario: Block holder marked on the circle
- **WHEN** a vote puts seat 4 on the block and a later vote puts seat 6 on it
- **THEN** the circle marks seat 4 "auf dem Block", then only seat 6
- **proof:** e2e

### Requirement: Seat actions by day
Tapping a seat during the day SHALL also offer "Sofort hinrichten" (execution now, nominations close, the day moves to
its execution announcement), "Ist gestorben" (death without execution) and corrections ("Lebt doch", "Geisterstimme
zurück" / "Geisterstimme weg"). None of these SHALL name a character. An immediate execution while someone is on the
block SHALL replace the block; a death or execution by day SHALL trigger the win check.

#### Scenario: Seat actions name no character
- **WHEN** a living seat, then a dead seat with a ghost vote, is tapped by day
- **THEN** the living seat offers "Nominieren", "Sofort hinrichten" and "Ist gestorben", the dead seat "Lebt doch" and "Geisterstimme weg", and no character name appears
- **proof:** e2e

#### Scenario: Immediate execution ends the day
- **WHEN** seat 4 is on the block and "Sofort hinrichten" is dispatched for seat 2
- **THEN** seat 2 is dead and today's execution, the block is cleared, nominations are closed and the day moves to the execution announcement
- **proof:** unit

#### Scenario: Death by day runs the win check
- **WHEN** "Ist gestorben" is dispatched for the Imp's seat with no Scarlet Woman in play
- **THEN** the Imp's seat is dead, no execution is recorded, good is the winner and the end teaser follows at once
- **proof:** unit

#### Scenario: Corrections by day
- **WHEN** "Lebt doch", "Geisterstimme weg" and "Geisterstimme zurück" are dispatched for dead seats
- **THEN** the first seat is alive again and the ghost vote flags change accordingly
- **proof:** unit

### Requirement: End of day
"Tag beenden" SHALL ask for confirmation, then announce "<Name> wird hingerichtet" for the block holder or "Heute wird
niemand hingerichtet"; the executed seat SHALL be marked dead (executing a dead player counts as the day's execution
but changes nothing else); then the win check; then dusk. A tie or no nominations SHALL mean no execution, and the
Undertaker's step tonight SHALL follow whether there was an execution.

#### Scenario: Tag beenden executes the block holder
- **WHEN** Dani is on the block and "Tag beenden" is tapped and confirmed
- **THEN** "Dani wird hingerichtet" is shown, Dani's seat is marked dead, and "Weiter" starts night 2 (header "Nacht 2 · …")
- **proof:** e2e

#### Scenario: No execution after a tie or without nominations
- **WHEN** a day ends after a tie, and another day ends without nominations
- **THEN** each shows "Heute wird niemand hingerichtet" and no seat changes
- **proof:** e2e

#### Scenario: Executing a dead player counts as the execution
- **WHEN** a dead player is on the block when the day ends
- **THEN** the seat stays dead, today's execution is that seat, and tonight's Undertaker step shows its character
- **proof:** unit

### Requirement: Win detection
The game SHALL detect wins by the official rules: good wins when the Demon dies and no Scarlet Woman takes over; evil
wins when only 2 players are alive; when both trigger at once good wins. The check SHALL run after the night death step,
after every death or execution by day and at the end of the day, against the current Demon seat (after a starpass or
takeover the new one). The Recluse SHALL never count as the Demon.

#### Scenario: Good wins when the Demon dies
- **WHEN** the Imp is executed with no Scarlet Woman in play
- **THEN** the winner is good
- **proof:** unit

#### Scenario: Evil wins at two alive
- **WHEN** a night death leaves 2 players alive, the Imp among them
- **THEN** the winner is evil
- **proof:** unit

#### Scenario: Both at once good wins
- **WHEN** an execution kills the Imp and leaves 2 players alive
- **THEN** the winner is good
- **proof:** unit

#### Scenario: Recluse never counts as the Demon
- **WHEN** the Recluse dies by day
- **THEN** no winner is set unless 2 players are left alive
- **proof:** unit

#### Scenario: New Demon checked after a starpass
- **WHEN** after a starpass to the Poisoner the old Imp's seat is dead and later the new Imp is executed
- **THEN** no winner after the starpass night, and good wins after the execution
- **proof:** unit

### Requirement: Ambiguous outcomes resolved at dusk
Cases the app cannot decide alone SHALL be asked privately at the next dusk, after "Alle schlafen ein", never on the
public screen, and the public screens SHALL look the same in every case until then: the Demon died while the true
Scarlet Woman was alive and at least 5 players were alive just before ("Wurde die Scarlet Woman zum Dämon?" — yes: she
is the Demon and wakes as Imp tonight; no: good wins); the true Saint was executed ("Wirkte seine Fähigkeit?" — yes:
evil wins); at dusk exactly 3 are alive, nobody was executed today and a true Mayor lives ("Mayor-Sieg?" — yes: good
wins). A Drunk believing Mayor or Saint SHALL never trigger a question. At night the storyteller SHALL also be able to
declare "Spiel ist entschieden" with the winning team (RB p.28). An answered question SHALL not be asked again: the
answer stays recorded, and "Zurück" and "Weiter" pass over its screen.

#### Scenario: Scarlet Woman question at the next dusk
- **WHEN** the Imp is executed with the Scarlet Woman alive and 6 players alive before the execution, and at dusk the question is answered yes, and in a second game no
- **THEN** no winner is set at the execution, the dusk asks "Wurde die Scarlet Woman zum Dämon?", yes makes her seat the Demon with a Scarlet Woman step tonight and a takeover in the history, and no makes good the winner
- **proof:** unit

#### Scenario: Scarlet Woman needs five alive before the death
- **WHEN** the Imp is executed with the Scarlet Woman alive and 5 players alive before (4 after), and in a second game with 4 alive before
- **THEN** the first asks at dusk and the second sets good as winner at once
- **proof:** unit

#### Scenario: Saint executed asks at dusk
- **WHEN** the true Saint is executed and at dusk "Wirkte seine Fähigkeit?" is answered yes, and in a second game no
- **THEN** yes makes evil the winner and no continues the night
- **proof:** unit

#### Scenario: Mayor question at dusk
- **WHEN** a day ends without an execution with exactly 3 alive including the true Mayor, and "Mayor-Sieg?" is answered yes
- **THEN** good is the winner
- **proof:** unit

#### Scenario: Drunk Mayor or Saint never asks
- **WHEN** the Drunk believing Saint is executed, and a day ends with 3 alive including the Drunk believing Mayor and no execution
- **THEN** no question is asked at the next dusk
- **proof:** unit

#### Scenario: Public screen gives nothing away
- **WHEN** a day ends executing the Imp with an eligible Scarlet Woman in one game, and executing a Townsfolk in another
- **THEN** the execution announcement and the "Alle schlafen ein" screen read the same in both, and the question appears only after "Weiter" on the dusk screen
- **proof:** e2e

#### Scenario: Storyteller declares the winner at night
- **WHEN** at dusk "Spiel ist entschieden" is chosen with evil
- **THEN** the night ends at once, the winner is evil and the header reads "Spielende"
- **proof:** e2e

### Requirement: End reveal
When the game is won, the current phase SHALL finish (its announcement is shown), then a "Das Spiel ist vorbei" screen
SHALL appear that does not name the winner (gong); "Weiter" SHALL reveal the winning team with a themed animation, then
every seat: character (the Drunk as "Drunk (glaubte: X)"), alive, ghost vote, and the Demon history (starpass,
takeover); then "Zurück zum Start". A reload on the teaser SHALL keep it hidden; the session SHALL be cleared only when
leaving through "Zurück zum Start".

#### Scenario: Teaser names no team
- **WHEN** the game ends and the teaser is shown
- **THEN** it reads "Das Spiel ist vorbei" with "Weiter", and contains neither "Gut", "Böse", "Dämon" nor any character name
- **proof:** e2e

#### Scenario: Reveal shows the winning team and every seat
- **WHEN** "Weiter" is tapped on the teaser of a game won by good after a starpass, with the Drunk believing Chef
- **THEN** "Das Gute gewinnt" is shown with the team's colour, then one row per seat with character, alive or dead and ghost vote, the Drunk's row reads "Drunk (glaubte: Chef)", the history reads the starpass from the old to the new Imp, and "Zurück zum Start" is offered
- **proof:** e2e

#### Scenario: Reload on the teaser keeps it hidden
- **WHEN** the teaser is shown and the page is reloaded
- **THEN** the teaser is shown again and no team is named
- **proof:** e2e

#### Scenario: Session cleared only on leaving
- **WHEN** the reveal is shown, the page is reloaded, then "Zurück zum Start" is tapped
- **THEN** after the reload the reveal is still shown, and after leaving the start screen offers no "Weiterspielen"
- **proof:** e2e

#### Scenario: Winner for every ending
- **WHEN** the reducer plays the six endings: Demon executed, starpass then new Imp executed, Scarlet Woman takeover then she is executed with 4 alive before, true Saint executed (yes at dusk), Mayor win (yes at dusk), 2 alive after a night death
- **THEN** the winners are good, good, good, evil, good and evil
- **proof:** unit

#### Scenario: Full Clocktower game
- **WHEN** 5 players play from the start screen through setup ("Zufällig"), the reveal, night 1, a day nominating and executing the Imp, to the end
- **THEN** the teaser and then "Das Gute gewinnt" with every seat's character are shown
- **proof:** e2e

### Requirement: Explanation deck
"Erklärung" SHALL open a responsive deck rebuilt from Rue's presentation (all its content, re-laid-out for phone and
desktop, not a scaled 1920×1080 canvas) with tap/click on the left or right half, swipe and arrow keys to move, a
progress indicator ("n / M"), animated slide transitions (crossfade only under reduced motion) and a close control back
to the start screen. A deep link to a single slide is not required.

#### Scenario: Deck navigation by tap, swipe and keys
- **WHEN** the deck is opened and the right half is tapped, then ArrowRight, ArrowLeft, a left swipe and a tap on the left half are used
- **THEN** the progress reads "1 / M", "2 / M", "3 / M", "2 / M", "3 / M" and "2 / M", and ArrowLeft on the first slide stays on "1 / M"
- **proof:** e2e

#### Scenario: Deck readable without horizontal scroll
- **WHEN** every slide is shown at 390×844 and 1280×800
- **THEN** no slide scrolls horizontally, body text is at least 16px and each slide's content fits the viewport or scrolls vertically inside it
- **proof:** e2e

#### Scenario: Deck closes to the start screen
- **WHEN** "Schließen" is tapped on any slide
- **THEN** the Blood on the Clocktower start screen is shown
- **proof:** e2e

#### Scenario: Slide change animated, crossfade under reduced motion
- **WHEN** a slide changes with motion allowed, and with `prefers-reduced-motion: reduce`
- **THEN** with motion the outgoing and incoming slides run finite transform/opacity animations, and under reduced motion only opacity animates
- **proof:** e2e

#### Scenario: Deck carries the presentation's content
- **WHEN** Rue pages through the deck next to her presentation
- **THEN** every slide's content of the presentation is present, re-laid-out for the screen
- **proof:** manual (content comparison by Rue at Gate 2)

### Requirement: Deck adapts to the player count
The role-count slide SHALL be computed from N with the setup table and show the Baron variant; the voting slide SHALL
use ⌈N/2⌉; for 5–6 players the deck SHALL note "keine Minion/Dämon-Info"; the deck's wording SHALL follow the official
rules (evil wins when only two players are alive), not "evil outnumbers good". Changing N on the start screen after
opening the deck SHALL update the deck the next time it is opened.

#### Scenario: Role-count slide for every count
- **WHEN** the role-count slide content is computed for every N from 5 to 15
- **THEN** it shows the table's Townsfolk/Outsider/Minion/Demon numbers for N, the Baron line with 2 Townsfolk fewer and 2 Outsiders more, and for 5 and 6 the note "keine Minion/Dämon-Info"
- **proof:** unit

#### Scenario: Voting slide uses half the players
- **WHEN** the voting slide content is computed for N = 5, 12 and 15
- **THEN** it reads "3 Stimmen nötig", "6 Stimmen nötig" and "8 Stimmen nötig" for N players alive
- **proof:** unit

#### Scenario: Official win wording in the deck
- **WHEN** all deck texts are read
- **THEN** they contain "nur noch zwei" for evil's win and contain neither "outnumber" nor "mehr Böse als Gute"
- **proof:** unit

#### Scenario: Deck follows the chosen count
- **WHEN** N is 12 and the deck's role-count slide is opened, then the deck is closed, N set to 9 and the deck reopened
- **THEN** it first shows 7 Townsfolk, 2 Outsider, 2 Minions, 1 Dämon and then 5, 2, 1, 1
- **proof:** e2e

### Requirement: App mechanics in the deck
The deck SHALL add slides explaining this app's mechanics: the grimoire circle and ghost-vote markers, the private
night guide (wake → card → circle → sleep), the show-bar, the day timer, nominations and the voting clock (tap or
Space), and the end reveal.

#### Scenario: Deck explains the app
- **WHEN** the deck is paged through
- **THEN** slides with the headings "Das Grimoire", "Die Nacht in der App", "Karten zeigen", "Der Tag-Timer", "Nominieren und abstimmen" and "Das Ende" exist, the voting slide names tapping and the Space key
- **proof:** e2e

#### Scenario: App slides read clearly
- **WHEN** Rue reads the app mechanics slides
- **THEN** Rue finds them correct for the finished app and neutral in tone
- **proof:** manual (wording judgement by Rue at Gate 2)

### Requirement: Character sheet
The deck SHALL end with a character sheet in the look of Rue's `Character Sheet.pdf` (not a copy): all 22 characters
with icon, name, team and a more detailed German explanation plus the original ability text, a "So gewinnt ihr" box
with the official win rules, and an icon attribution line (game-icons.net, CC BY 3.0); it SHALL fit one desktop
viewport (1280×800) without scrolling and on phone be two swipeable pages, Gut and Böse, whose text is at least 14px and
that each scroll vertically within the page, never horizontally. A credits slide SHALL
carry the icon attribution and the note that the characters belong to The Pandemonium Institute. The same component
SHALL be used on the setup board.

#### Scenario: Sheet lists all characters
- **WHEN** the sheet component is rendered on the server
- **THEN** it holds the 22 names with team, German explanation and ability text, the "So gewinnt ihr" box with "Das Gute gewinnt, wenn der Dämon stirbt." and "Das Böse gewinnt, wenn nur noch zwei Spieler leben.", and the line naming game-icons.net and CC BY 3.0
- **proof:** unit

#### Scenario: Sheet fits one desktop viewport
- **WHEN** the sheet slide is shown at 1280×800
- **THEN** the whole sheet lies inside the viewport and nothing in it scrolls
- **proof:** e2e

#### Scenario: Sheet on phone is two pages
- **WHEN** the sheet slide is shown at 390×844 and swiped
- **THEN** the first page "Gut" holds the 17 good characters and the second "Böse" the 5 evil ones, each page uses text of at least 14px, every entry is reachable by scrolling the page vertically, nothing scrolls horizontally, and the swipe changes the page
- **proof:** e2e

#### Scenario: Credits slide names the sources
- **WHEN** the credits slide is shown
- **THEN** it names game-icons.net with CC BY 3.0 and The Pandemonium Institute as owner of Blood on the Clocktower
- **proof:** e2e

#### Scenario: Sheet in the look of the PDF
- **WHEN** Rue compares the sheet with her `Character Sheet.pdf` on desktop and phone
- **THEN** Rue finds it recognisably the same sheet, readable at 14px or more on the scrolling phone pages
- **proof:** manual (visual judgement at Gate 2)
