# Mobbin research: Blood on the Clocktower storyteller app

Scope: explore phase, screens a) to h). All results are iOS (portrait phone); Mobbin has no
circular-table, grimoire, or storyteller-script references, so d), e) and g) lean on adjacent
patterns. App names were checked in every result; none of the cited apps were silently swapped.
Screen cites: `https://mobbin.com/screens/<id>`; flow cites: flow URL + screen ID.
Where the ID of a flow screen was not identifiable from the preview, only the flow URL is given.

## a) Lobby: player count first, then players, Explanation button

References
- PlayStation App, "Starting a party" flow: https://mobbin.com/flows/3a2b825e-bf6e-4714-a086-ad1d36e2b966
  A "Player Limit" slider with tick labels (4/8/12/16) sits in the setup sheet before the party
  starts; the primary action is a full-width pill. Slider screen ID not identified (flow only).
  Its member picker, screen 52c2dbad-1e25-417a-8064-2efda6b90484 (https://mobbin.com/screens/52c2dbad-1e25-417a-8064-2efda6b90484),
  shows selected people as removable chips above the list and a CTA that counts ("Invite 2 Players").
- Airbnb, "Add more guests" flow: https://mobbin.com/flows/a7d2ac7d-8a44-435b-9fe5-bf0628fdc59d
  Minus/plus stepper with "(9 left)" remaining count, CTA disabled until something changes.
  Screen 5a697b83-ee2b-4a3f-a51e-5acd0d2f2990 is the flow's first screen (reservation); the stepper is a later one, ID not identified.
- Xbox, "Adding people to a party" flow: https://mobbin.com/flows/9b896c2d-8f09-43e4-bc6f-7470facae6c9
  Party roster as a plain list with a clear "Add people" button; weak on visual identity, useful as the minimal baseline.
- Vocabulary, rules card: https://mobbin.com/screens/c9662770-5bee-4842-a722-e3bfb8d46e0a
  Four icon+line rules in a card above one Start button; a good shape for an "Explanation" teaser.

Recommendations
1. Make the count the first, only decision on screen: large numerals 5-20 with minus/plus (44px+ targets) or a snapping slider with tick labels, and a live "N of 20 seated" line. Players come second, below it, so the count gates the list.
2. Saved players as tappable chips (PlayStation pattern), selected ones collapse into a seat row; the CTA label counts and states what is missing ("Add 3 more players") and stays disabled until count matches.
3. "Explanation" as a secondary outlined button next to the main CTA, never competing with it; it opens a full-screen slide deck (see carousel notes below), dismissible with a close icon.
4. Motion: when the count changes, animate seat placeholders appearing around a small ring preview (stagger 30ms), so the number feels physical.

Slide deck for the Explanation button (carousel references)
- Posh tutorial (dark): https://mobbin.com/screens/c4d89b6c-5bd9-44d2-b186-6f960be9e556 : "1/4" pill, segmented progress bar, large title, one Next button.
- Oura (dark navy, illustrated): https://mobbin.com/screens/978210eb-c854-4186-9fca-c377e45c1b47 : thin segmented progress bottom-left, Next bottom-right, illustration in a framed panel; closest in mood to our old-world look.
- Matter: https://mobbin.com/screens/94d4b728-bd14-4d69-afad-0f15a082fcf0 : active dot stretches to a pill.
- Recommendation: one idea per slide, illustration on top, 2 lines of text, segmented progress at top (taps jump), swipe plus a persistent Next, final slide's button reads "Got it" and returns to the lobby with state intact.

## b) Setup board: assign roles manually or randomly, constraint display

References
- Splitwise "Assign items": https://mobbin.com/screens/b6aa841f-0ec4-47d8-b4ee-4b047e706053
  Check rows, "2 items selected" counter, "Deselect all" ghost action, CTA that restates the count ("Assign 2 items").
- Formula 1 team builder: https://mobbin.com/screens/221164dc-6104-4959-b0fc-2f8e7c1acfcb
  A budget bar ("Cost Cap") with Reset/Done in the header, cards with large Add buttons. Good model for a live constraint meter.
- Premier League squad builder: https://mobbin.com/screens/eb934fd4-6628-42d9-8625-76bf75dfa19f
  Roles grouped under coloured section headers (Goalkeepers/Defenders...) with per-group slots: maps to Townsfolk/Outsiders/Minions/Demon groups.
- Docusign recipients action sheet: https://mobbin.com/screens/78c1e060-d4d8-42c9-a915-f3c7957f1a11
  Per-row "more" opens an iOS action sheet with Move up / Remove (red) / Cancel.

Recommendations
1. Pin a constraint strip at the top: four team counters ("Townsfolk 5/7 · Outsiders 1/1 · Minions 1/1 · Demon 1/1") that turn gold when satisfied and blood-red when over; the Start button is disabled with a reason line until all are green.
2. Roles grouped by team with section headers (Premier League); each row is player + assigned role chip, tap opens a role picker sheet; "Randomize all" and per-row shuffle icon, plus "Clear" as a ghost action.
3. Randomize respects locked rows (lock icon on manually set roles) so the storyteller can pin the Drunk/Baron before dealing.
4. Motion: on randomize, flip the role chips with a short staggered card-flip; counters count up/down rather than jump.

## c) Pass-the-phone private role reveal

References
- Amazon Alexa "Hand your phone to Sam": https://mobbin.com/screens/14ad5889-b8d7-43f1-891b-7ac593308435 : bottom sheet with a two-phone illustration, name in the title, one Continue.
- Tolan "It's Sam's turn!": https://mobbin.com/screens/9c0946df-1832-4343-8d11-b8b544bc306c : large avatar with initial, name in the headline, blurred backdrop so nothing else is legible.
- Deepstash "Tap to reveal the idea": https://mobbin.com/screens/3daab469-5284-4e39-986a-03fe55e8b846 : framed card with a pulsing gold dot and "Tap to reveal", Continue below.
- Fanatics Live card: https://mobbin.com/screens/a5bdb78d-ce91-4563-afff-d11410cd1fc7 : dark, gold-trimmed card with title, subtitle in gold, status tag: the right material feel for a role card.
- Alma "Hold to commit": https://mobbin.com/screens/97588293-92fc-4324-b1ae-e9c7ecd95a73 : press-and-hold confirmation.

Recommendations
1. Three states, three screens: (1) "Pass to <Name>" with only the name, huge, on a sealed-parchment backdrop; (2) tap target covering most of the screen reveals the card; (3) card visible with a "Hide and pass on" button. Never show the role during the handoff screen.
2. Reveal as a card flip or wax-seal break (300-500ms); role icon large on top, name, team in team colour, 2-3 line description below; scrollable only if the text overflows.
3. Hiding must be an explicit tap (hold-to-hide or a clear button), not a timer, so a slow reader is never cut off; after hiding, auto-advance to the next player's name screen with a cross-fade.
4. Show a discreet progress count ("3 of 9") only on the name screen, not the reveal screen. Add a "Show again" affordance for the current player until they hide.

## d) Circular seating layout, 5 to 20 players, alive/dead/ghost vote

References (weak: no round-table reference exists)
- DAZN lineups: https://mobbin.com/screens/a48a5a9b-d452-4832-99b0-29137b70f6f3 : numbered circles placed on a fixed pitch, name beneath, small badges (card, sub arrow) on the circle edge: this is the badge-on-token idiom we need.
- Clubhouse room: https://mobbin.com/screens/991fb0c8-deb2-4e7c-8c0b-96a1bcd681a8 : status icons (muted, raise-hand) attached to the avatar corner; name below with a small status glyph.
- Binance viewers grid: https://mobbin.com/screens/a3d66278-78dd-4ec2-b620-204404aed974 : dense 5-column avatar+name grid; shows what the 20-player density looks like when truncated (names clip).
- Duolingo league podium for dead/alive-style ranking contrast is not applicable; skipped.

Recommendations
1. Seat tokens on a ring (angle = 360/N, seat 1 at top), token 44px minimum on phone with the seat number inside; name in a label outside the ring, shortened to 8 characters with ellipsis, full name on tap. At N=20 on 390px, use a ring radius of about 150px and put names only on tap or in a bottom sheet.
2. Status must work without colour: alive = bright gold rim; dead = desaturated, shroud/skull glyph, name struck; ghost vote still available = small white dove/vote token on the rim, spent = hollow token. Keep at most two badges per token.
3. Tap a seat opens an action sheet (kill, revive, use ghost vote, nominate, show role); long-press not required.
4. Centre of the ring is free real estate: day/night phase, day number, alive count ("11 alive · 4 ghost votes"). The voting clock hand (g) sweeps from this centre.
5. Desktop: same ring but with names always shown and a side panel for the selected seat.

## e) Night script: step-by-step guided narrator

References
- Recime step view: https://mobbin.com/screens/4439d48a-0f3c-443c-8249-fd951894e316 : "Step 1 of 4" header, segmented bar across the top, large readable body text, single orange Next beside a list button.
- Lifesum step footer: https://mobbin.com/screens/ab7fa00d-553b-4f2e-afe5-1bc45eed34c0 : bottom bar with prev arrow, "Step 3 of 4", next arrow.
- Hers "What comes next": https://mobbin.com/screens/2a4b82e2-361d-493e-81c9-914995bf3438 : numbered list with a dark primary button.
- DoorDash Dasher course: https://mobbin.com/screens/e0437656-6e51-4524-8610-22a1f50fc564 : numbered stepper dots at top.

Recommendations
1. One role per screen: header "Night 2 · Step 4 of 11"; hero = role icon + player name + seat number ("Wake: Empath, seat 7 Mira"); below a 4-line checklist: wake, show/tell, act, sleep, each ticks when done (the guided sequence in the brief).
2. A single primary button at the thumb zone that changes label per sub-step ("Wake Mira" > "Show role" > "Done acting" > "Put to sleep" > "Next: Fortune Teller"); a smaller secondary "Skip (role not in play / dead)".
3. Make the script text 20px+ with the line to speak aloud in italics and storyteller-only notes in a dimmer block; dead or absent roles are skipped but listed greyed so the narrator can still fake the call.
4. A back arrow always available; an overview sheet (Recime's list button) shows the whole night order with the current step highlighted.
5. Motion: cross-fade between roles with a soft candle-dim, nothing flashy; the narrator reads in low light.

## f) Day timer: 1 to 59 min, red at zero, non-blocking

References
- MyDyson timer (dark, radial minutes picker): https://mobbin.com/screens/dc998c33-e98b-4348-acfa-c8bc61c838f7 : dial drag sets minutes, number in the middle, Cancel/Set pair.
- Tiimo focus: https://mobbin.com/screens/c3fc7fe3-d701-4586-9748-9746be5d6864 : big time, "+1 min" quick-add next to the pause pill.
- Hevy clock sheet: https://mobbin.com/screens/2ae07c12-4429-41ff-9444-103806f75005 : -15s/+15s flanking a ring: adjustment while running.
- Oura: https://mobbin.com/screens/08366dca-8bef-401f-a5d2-2514448fdf7d : slim ring, "Time remaining", outlined end button on a dark photo.
- (Not Boring) Timer, overtime "+00:10:24": https://mobbin.com/screens/f5bad9eb-dcd6-401c-9da8-f894057b7639 : counts past zero as "+" rather than stopping.

Recommendations
1. Large digits (mm:ss, tabular numerals), thin ring around them; adjust with -1/+1 minute buttons (and +5) both before and during the countdown; clamp 1-59.
2. At 0 do not modal: ring and digits turn blood-red, a gentle pulse, and the display counts up as "+0:42" (Not Boring pattern). Optional single soft bell, never an overlay that blocks the grimoire.
3. Pause/resume and "Reset" as secondary; the timer lives as a compact chip in the grimoire header and expands on tap, so seating stays visible.
4. Respect reduced-motion for the pulse; do not rely on colour alone, so also show "Time's up" text.

## g) Voting moment: clock hand sweep, then vote count entry

References (nothing matches the sweep)
- Premier League fan vote results: https://mobbin.com/screens/282012c2-cc4a-43a4-af0f-06604b85eaf5 : ranked rows with a vote % column; useful for the post-vote tally.
- Numo poll: https://mobbin.com/screens/d2aafebf-52dd-4c4e-b5ed-5b6802d5810d : bars with a ring-checked chosen option.
- Brave Browser poll, with "Show Details / Change Vote": https://mobbin.com/screens/103d2a0d-e9d7-4387-9d33-dd1a39bb126b
- Airbnb guest stepper (for entering counts): https://mobbin.com/flows/a7d2ac7d-8a44-435b-9fe5-bf0628fdc59d (stepper screen, ID not identified)
- Toggl Track dial (hand/handle on a ring, duration in centre): https://mobbin.com/screens/7d529202-56a3-40a4-a83d-5975c1b2a417

Recommendations
1. The hand starts at the nominee's left neighbour and sweeps clockwise one seat at a time (about 1.2s per seat, ease with a small tick bounce when passing each token), driven by the storyteller tap "Next seat" or by autoplay with pause; each seat gets a Vote / Abstain two-button pill when the hand rests on it.
2. Keep tokens on the ring; voted seats fill red, abstain stays hollow; the centre shows the running count against the threshold ("5 / 6 needed") in large type.
3. When the hand finishes, replace the centre with a numeric stepper entry (large minus/plus, tap to type) prefilled with the counted votes so the storyteller can correct for ghost votes, then "Confirm".
4. Resolve with a ranked list (Premier League pattern) if several nominations are on the block, with the highest highlighted; tie rule shown explicitly.

## h) End of game: teaser, winning team, everyone's roles

References
- Paired "You won!" ribbon + confetti: https://mobbin.com/screens/bc0f0c0f-d7e6-4833-b143-b45032f3693f : ribbon banner over podium; here confetti would be replaced by embers.
- Riot Mobile match details: https://mobbin.com/screens/b4116f8d-3f99-42c1-a796-619c5652c061 and https://mobbin.com/screens/3a6b0664-83c4-41b8-967d-9694d63669d0 : team result tag (Victory/Defeat) on a hero image, dark player rows with expandable details; the best fit for "everyone's roles".
- NBA recap: https://mobbin.com/screens/7e5b2f79-c2bd-4685-bb53-7a62e70673e6 : split hero in the two team colours, winner big, tabbed summary below.
- Runbuds "It's a dead heat!": https://mobbin.com/screens/66e1a5fd-e65b-4cbc-99c2-36613627f74d : saturated red full-bleed result card, name plates overlapping avatars.

Recommendations
1. Two beats: (1) teaser, near-black screen with "The game is over" and a single tap/hold-to-continue so the table builds tension; (2) winner reveal, full-bleed team colour (gold for good, blood red for evil), big title, short reason ("The Demon was executed").
2. Below the title, a list of all players: seat, name, role icon, role name, final alive/dead status, with team colour on the left edge and the original role vs. current alignment if it changed; Riot-style rows, evil players grouped last.
3. Motion: stagger rows revealing one at a time (about 60ms each); tapping a row opens the role card again. Skip confetti; use drifting ash/candle sparks.
4. Actions: "Play again (same players)" primary, "New game" secondary, "Back to arcade" tertiary.

## Cross-cutting

- Touch targets: 44px minimum, 48px for primary actions and ring tokens; keep 8px between adjacent targets; at 20 seats the ring needs a bottom sheet for actions rather than inline buttons.
- Destructive steps (kill, execute, end game early, restart, leave mid-night): use a confirm dialog with the consequence in plain text and a named red action ("Kill Mira", not "OK"), Cancel/"Nevermind" as the lighter button (Lyft https://mobbin.com/screens/eef1ecdd-472e-4683-bcdc-1f96193ba123, Peerspace https://mobbin.com/screens/2b2bdae0-6d45-44ab-8bdf-bcb5516480cc, Once, dark glass dialog https://mobbin.com/screens/1be16210-a004-4e9e-8eb2-09ace455f214). For irreversible whole-game actions, use hold-to-confirm (Alma). Offer a short "Undo" toast for reversible grimoire edits instead of confirming every tap.
- Shared-screen readability from across a table: ring labels 16px+ on desktop and on phone only seat number plus status; headings 28px+; contrast at least 4.5:1 gold-on-black and red-on-black (check blood red, as it fails easily); never encode state in colour alone (dead = glyph + strike-through; ghost vote = token shape); keep chrome minimal during the day so the ring dominates.
- Privacy: any screen that shows a role must be unmistakably private (name screen first, role card second, hidden by explicit tap); a global "hide everything" control in the grimoire header for when the phone is put down.
- Motion: one idea per transition (card flip, hand sweep, ember fade), 200-500ms, ease-out; honour `prefers-reduced-motion` by swapping sweeps/flips for cross-fades.
- Persistence: show phase and night/day number in a fixed header chip so a returning storyteller always knows where the game stands.
- Mobbin gap summary: nothing for round-table layouts, clock-hand sweeps, role-card dealing, storyteller scripts; Mobbin covers app UI patterns, not tabletop games, so these screens rely on analogies.
