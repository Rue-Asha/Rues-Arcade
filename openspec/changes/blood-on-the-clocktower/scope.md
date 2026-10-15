# Scope: blood-on-the-clocktower

Triage: feature (set) — new game Blood on the Clocktower, script Trouble Brewing: own dark old-world theme, count-first lobby with an explanation deck instead of a demo, storyteller grimoire for setup, private role reveal, guided nights, public days with nominations and a voting clock, automatic end detection and an end reveal. Appetite: one change, multi-session (≈ 10–12 units in 4–5 waves), the explanation deck and character sheet in the last wave.

## Problem
Rue hosts Blood on the Clocktower game nights with no physical grimoire and runs them from her own slides, sheet and notes. The storyteller has to juggle role distribution, the night order, nominations, vote counting and win conditions by hand, and players have no shared view of who is alive and who still has a ghost vote.

## Research (inputs for every later agent)
- `research/rules.md` — rules digest with sources (rulebook page / wiki / TPI data). Rules questions are settled there; where scope.md deviates, scope.md wins.
- `research/design-sources.md` — presentation + character sheet: slides, tokens, fonts, clock slide, icons. Screenshots were in the explore session's scratchpad only (not needed later).
- `research/mobbin.md` — UI references and recommendations per screen.
- Originals (outside the repo, read-only): `~/Documents/Daddelei/Blood on the Clocktower - Game Night.html`, `Character Sheet.pdf`, `BOTC_Main_Rulebook_-_V1.pdf`, `Storyteller Guide.pdf`.

## Entity model (confirmed with Rue in explore)
- A **game** has a chosen **player count** N (5–15) and N **seats** in clockwise order; seat number = position (1…N).
- A **seat** holds a roster player (by roster id), a **character** (true role), for the Drunk a **believed Townsfolk**, `alive`, and `ghostVote` (dead players only; one, spent on first vote).
- **Private (storyteller) layer:** characters, the Drunk's believed role, the Fortune Teller's red herring, the current **Demon seat** (changes on Imp starpass / Scarlet Woman takeover), the demon bluffs, an optional noted Imp target per night, demon history.
- **Public layer:** phase (setup / reveal / night k step / day k), alive/dead, ghost votes, today's nominations (nominator, nominee, voters, votes), the high-water mark and who is on the block, whether someone was executed today, the day timer.
- Status effects (poison, drunkenness in effect, protection) are NOT tracked; the storyteller owns them.

## Flows
- Entry: home → BotC tile (smooth themed transition) → start screen: choose player count (5–15) → optional "Erklärung" deck (adapts to the count) → lobby: roster must hold exactly N players (add players / pick who plays) → start.
- Setup 1 (storyteller only): arrange the seating circle → assign characters (manual or random, constrained by the setup table and Baron) → Drunk's believed role, red herring → character sheet below → "Weiter" → confirm → Setup 2.
- Setup 2 (private, one player at a time, seat order): name → "Rolle zeigen" → role card reveal → hide & pass → … → night 1.
- Night k: "Alle schlafen ein" (dusk) → [private storyteller questions if a day event is unresolved] → per waking step in official order: "Wecke <Name> (#n)" with hints + true info → role card → circle + show-bar → "Schlaf wieder ein" → next → (night ≥ 2) "Wer ist gestorben?" → win check → dawn.
- Day k: "Alle aufwachen" → deaths appear on the circle → set timer (default 8 min, 1–59) or skip → grimoire circle with timer → nominations: tap nominee → pick nominator → clock appears → "Abstimmung beginnen" / "Zurück" → sweep, votes marked → confirm count → result (block / not / tie) → … → "Tag beenden" → confirm → execution announced (or none) → win check → dusk.
- End: "Das Spiel ist vorbei" teaser (no team named) → tap → winning team + every seat's role, alive, ghost vote, history → back to start.

## In scope

### Catalogue, lobby, theme
- **S1** BotC appears in the catalogue as a playable game with its own tile, motif and colour, range text "5–15 Spieler".
  - edges: roster > 15 → existing picker; registry/order tests updated for the new entry.
- **S2** The BotC start screen lets the storyteller choose the player count N (5–15, stepper) before the lobby; the default is the roster size clamped to 5–15; the choice persists (reload, deck, lobby).
  - edges: count < 5 or > 15 impossible; changing N after opening the deck updates the deck; roster changes do not silently change N.
- **S3** The BotC start screen shows an "Erklärung" card instead of the Demo card, and no Inhalte card (BotC has no content pool). Other games keep Demo and Inhalte unchanged.
  - edges: `/spiele/<botc>/demo` and `/inhalte` → 404 (or redirect to start); generic demo/runner/registry tests skip games without a demo instead of failing.
- **S4** The lobby requires exactly N roster players: fewer → "Spieler hinzufügen" (returns to the lobby); more → "Wer spielt mit?" picker limited to exactly N; exactly N → start.
  - edges: saved and guest players both allowed; umlaut names; N changed while in the lobby.
- **S5** All BotC routes (start, lobby, deck, play) use a dark old-world theme taken from the presentation (night violet-black, gold, blood red, good-blue; IM Fell English SC titles, Alegreya Sans text, self-hosted OFL fonts); day screens of the game use the parchment variant, night screens the dark one, and the change between them is animated. Other games are visually unchanged.
  - edges: look rules hold for both variants (contrast ≥ 4.5:1, touch targets ≥ 44px, no horizontal scroll at 390px, no external requests, pixel font not used); reduced motion → no ambient loops, instant cuts; no theme flash on reload.
- **S6** Navigating from home into BotC (and back out) is a smooth themed transition (view transition: colour/background morph, no hard cut); navigation between BotC routes is also animated.
  - edges: browser without View Transitions → plain navigation, no error; reduced motion → no transition; back button works.
- **S7** BotC has its own atmospheric sounds through the existing synth and mute flag: a bell at dusk and dawn, a soft tick per seat while the vote hand sweeps, a reveal tone on role reveal, a gong on game end.
  - edges: muted → silent; no AudioContext before first interaction.

### Setup
- **S8** Setup 1 shows the N players as a seating circle the storyteller can reorder (drag, or tap two to swap); seat numbers follow clockwise order and are used everywhere after.
  - edges: 5 and 15 seats fit on phone (390×844) and desktop (1280×800); keyboard-reachable swap.
- **S9** Setup 1 shows all 22 TB characters grouped by team (Townsfolk, Outsiders, Minions, Demon) with live counters "assigned / required" from the setup table for N; a Baron in play changes the requirement live to +2 Outsiders / −2 Townsfolk.
  - edges: removing the Baron reverts; over-assigning a team is shown as an error; each character at most once.
- **S10** The storyteller assigns characters manually (tap player then character, or the reverse), and "Zufällig" fills all empty seats with a valid random distribution (respecting already chosen ones, Baron included); "Alles neu" rerolls everything.
  - edges: random with a manually chosen Baron fills +2 Outsiders; a manual choice that makes the distribution impossible is flagged; determinism via the game seed for tests.
- **S11** When the Drunk is assigned, the storyteller picks (or accepts a random) believed Townsfolk that is not in play; when a Fortune Teller (real or believed) is in play, a red herring (good player) is picked or randomised.
  - edges: the believed role can't be an in-play Townsfolk; red herring may be the Fortune Teller themself; reassigning clears stale picks.
- **S12** "Weiter" is enabled only for a complete valid distribution and asks for confirmation ("Rollen sind verteilt und notiert?") before Setup 2.
  - edges: cancel keeps everything; after confirm the distribution is locked.
- **S13** The setup board shows the same character sheet as the deck at the bottom.
  - edges: none (shared component from S29).
- **S14** Setup 2 walks seat by seat: only the name (+ seat number) → "Rolle zeigen" → animated card reveal with icon, character name (EN), team, German explanation and the original ability text → "Verbergen & weitergeben" → next; after the last seat the game moves to night 1.
  - edges: the Drunk sees their believed Townsfolk, never "Drunk"; no auto-hide; a hidden card leaves nothing readable behind; reload mid-reveal resumes at the same seat, hidden.

### Shared play surface
- **S15** The default play screen is the grimoire circle: N numbered seats clockwise with names; each seat shows alive/dead and, for the dead, whether the ghost vote is still available (shape + label, not colour only); no roles are shown by default.
  - edges: 5–15 seats legible on phone and desktop; the dead seat change is animated; header status shows "Nacht k" / "Tag k" and alive count.
- **S16** The game state survives a reload at any point (existing per-game session, versioned).
  - edges: a stale-version session is discarded with the existing notice; "Spiel beenden" clears it.

### Night
- **S17** Each night starts with a generic "Alle schlafen ein" screen (bell); "Weiter" starts the waking steps.
  - edges: none.
- **S18** The night guide walks only the characters that wake that night, in the official order (first night vs other nights, `research/rules.md` §3): first night — [7+ players: Minion info, Demon info + 3 bluffs], Poisoner, Washerwoman, Librarian, Investigator, Chef, Empath, Fortune Teller, Butler, Spy; other nights — Poisoner, Monk, Scarlet Woman (only after a takeover), Imp, Ravenkeeper (if alive at dusk; "nur wenn heute Nacht gestorben"), Empath, Fortune Teller, Undertaker (only if executed today), Butler, Spy. Dead characters are skipped; the Drunk wakes at the believed Townsfolk's slot.
  - edges: 5–6 players → no Minion/Demon info, no bluffs; night 1 has no Imp step and no deaths; a new Imp (starpass/takeover) wakes as Imp from then on.
- **S19** Each waking step is a 4-screen cycle: (1) "Wecke <Name> (#n)" — private, shows role, how to run it, and the computed true info; (2) role card with explanation; (3) grimoire circle with the show-bar; (4) generic "Schlaf wieder ein" → next step. Every step offers "Überspringen" and the guide offers "Zurück" to the previous screen.
  - edges: group steps (Minion info wakes all minions; Demon info) name every seat to wake; skipping does not lose state.
- **S20** Computed true info on screen (1), labelled as a suggestion that poison, the Drunk, the Spy and the Recluse may change: Washerwoman/Librarian/Investigator (a matching player + character, or "0 Outsider"), Chef (evil pairs), Empath (evil living neighbours), Fortune Teller (Demon seat + red herring), Undertaker (character executed today), Ravenkeeper (no precompute; uses the show-bar), Spy/Butler/Monk/Poisoner (no info).
  - edges: Chef/Empath use current seating and alive state; Empath skips dead neighbours; the Drunk's "info" still shows the true value with the drunk caveat.
- **S21** The show-bar on screen (3) lets the storyteller show, full screen and tap-to-close: a character card (picker over all TB characters), "Das ist der Dämon", "Deine Minions", the 3 bluffs, "Du bist" + character, a big number 0–9, Ja/Nein; the cards a role needs are preselected.
  - edges: bluffs are 3 good characters not in play (suggested 2 Townsfolk + 1 Outsider, never the Drunk's believed role) and can be rerolled before showing.
- **S22** A hold-to-view "Grimoire" button at night shows every seat's character (and the Drunk's believed role, red herring, Demon marker) while held and hides them on release; it does not exist during the day.
  - edges: release outside the button hides; keyboard hold; reduced motion.
- **S23** The Imp step offers "Ziel notieren" (prefills the death step) and "Imp wählt sich selbst": the storyteller picks a living Minion as the new Imp (the Scarlet Woman is forced if she is alive and ≥ 5 players are alive), then a "Du bist: Imp" wake for the new Imp follows in the same night.
  - edges: no living Minion → the Imp just dies (good win at the death step); Monk protection is the storyteller's call (they simply don't record a death).
- **S24** Nights ≥ 2 end with a private "Wer ist heute Nacht gestorben?" step (multi-select, prefilled with the noted Imp target or starpassed Imp, "Niemand" allowed); then the win check; then dawn.
  - edges: the Mayor bounce is just a different selection; selecting an already dead player is impossible.

### Day
- **S25** Dawn: "Alle aufwachen" (bell) → the storyteller announces → the circle shows the night's deaths with an animation (or "Niemand ist gestorben") → timer dialog: default 8 min, adjustable 1–59, or no timer.
  - edges: reload during the countdown keeps the remaining time (deadline-based).
- **S26** The day timer counts down on the grimoire screen; at 0 it turns red and is marked "Zeit um" but never blocks; the day can end any time.
  - edges: keeps running during votes (orientation only); reload keeps the deadline.
- **S27** Nominations: tap the nominee, then pick the nominator. The app enforces: one open nomination at a time, only living players nominate, each player nominates once and is nominated once per day, self-nomination allowed, dead players can be nominated. Unavailable choices are disabled with a reason.
  - edges: "Zurück" before the vote starts cancels the nomination without using it up.
- **S28** The voting clock: a hand from the centre points at the nominee; "Abstimmung beginnen" / "Zurück". On start the hand sweeps clockwise one seat per 2.5 s from the seat after the nominee and ends at the nominee (who votes last). The storyteller marks the seat under the hand as voting by tapping it or pressing Space; tapping any other markable seat during the sweep also toggles its vote, for corrections (user decision at Gate 2, 2026-10-14); Space acts only on the seat under the hand; marked seats light up; dead players without a ghost vote can't be marked. After the sweep: confirm screen with the count prefilled from the marks, editable marks and a count stepper ("Timing verpasst" corrections). Dead players marked as voting lose their ghost vote.
  - edges: 15 seats = 37.5 s; reduced motion → the hand jumps seat to seat; the threshold ⌈alive/2⌉ and the current high-water mark are shown during the vote.
- **S29** Vote result per the rules: votes ≥ ⌈alive/2⌉ and > today's high-water mark → on the block (replacing the previous); equal to the high-water mark → tie, nobody on the block, the bar stays; otherwise nothing changes. The block holder is marked on the circle.
  - edges: dead votes count fully; threshold uses living players at vote time.
- **S30** Tapping a seat during the day also offers "Sofort hinrichten" (Virgin-style: execution now, nominations close, day ends), "Ist gestorben" (Slayer etc., no execution) and corrections ("Lebt doch", ghost vote zurück/weg). None of these name a character.
  - edges: an immediate execution while someone is on the block replaces it; dying mid-day triggers the win check (S33).
- **S31** "Tag beenden" → confirm → announcement: "<Name> wird hingerichtet" (block holder) or "Heute wird niemand hingerichtet"; the executed seat is marked dead (executing a dead player counts as the execution but changes nothing); then the win check; then dusk.
  - edges: tie or no nominations → no execution; the Undertaker step tonight depends on it.

### End of game
- **S32** Win detection (official rules): good wins when the Demon dies and no Scarlet Woman takes over; evil wins when only 2 players are alive; if both trigger at once, good wins. Checked after the night death step, after every day death/execution and at day end.
  - edges: the Recluse never counts as the Demon; after a starpass/takeover the new Demon seat is the one checked.
- **S33** Ambiguous cases are resolved privately at the next dusk, never on the public screen: Demon died with an eligible Scarlet Woman ("Wurde die Scarlet Woman zum Dämon?" yes → she wakes as Imp tonight / no → good wins), Saint executed ("Wirkte seine Fähigkeit?" yes → evil wins), dusk with exactly 3 alive, no execution today and a living true Mayor ("Mayor-Sieg?" yes → good wins). The public screen behaves the same in every case until then. The storyteller can also declare "Spiel ist entschieden → Sieger" privately at night (RB p.28).
  - edges: a Drunk "Mayor" or "Saint" never triggers a question; SW eligibility counts ≥ 5 alive just before the Demon's death.
- **S34** When the game ends, after the current phase a "Das Spiel ist vorbei" screen appears that does not name the winner; "Weiter" reveals the winning team with a themed animation, then every seat: character (Drunk shows "Drunk (glaubte: X)"), alive, ghost vote, Demon history (starpass/takeover); then "Zurück zum Start".
  - edges: reload on the teaser keeps it hidden; the session is cleared only on leaving.

### Explanation deck and character sheet (last wave)
- **S35** "Erklärung" opens a responsive deck rebuilt from the presentation (all its content, re-laid-out for phone and desktop, not a scaled 1920×1080 canvas): tap/click halves, swipe, arrow keys, a progress indicator, animated slide transitions, close back to the start screen.
  - edges: phone 390×844 and desktop 1280×800 readable with no horizontal scroll; reduced motion → crossfade only; deep link to a slide not required.
- **S36** The role-count slide is computed from N (setup table) and shows the Baron variant; the voting slide uses ⌈N/2⌉; the wording follows the official rules (evil wins at 2 alive), not the PDF's "outnumber".
  - edges: every N from 5 to 15; 5–6 players note "keine Minion/Dämon-Info".
- **S37** The deck adds slides explaining this app's mechanics: the grimoire circle and ghost-vote markers, the private night guide (wake → card → circle → sleep), the show-bar, the day timer, nominations and the voting clock (tap/Space), the end reveal.
  - edges: none (content).
- **S38** The deck ends with a character sheet in the look of `Character Sheet.pdf` (not a copy): all 22 characters with icon, name, team and a more detailed German explanation plus the original ability text, re-proportioned so it fits one desktop viewport and, on phone, two swipeable pages (Gut / Böse) whose text is at least 14px and that scroll vertically within the page, with no horizontal scroll (changed 2026-10-14, user decision: was "each fit one screen for a photo"). The same component is reused by S13.
  - edges: "how to win" box with the official rules; icon attribution line (CC BY 3.0) on the sheet and a credits slide.

### Gate 2 revisions (2026-10-14, user feedback after looking at the build)
Verbatim feedback is in `gate2-feedback.md`. The palette stays; nothing here may lower legibility (contrast ≥ 4.5:1, existing text-size floors).
- **S39** Atmosphere: the lobby and the nights are visibly night-themed (e.g. stars and a moon in the background); the day screen subtly shows a sun and is brighter and livelier. Decoration is inline (no external assets), behind content, and never reduces legibility.

- **S40** The deck's voting slide gets the reference animation from `~/Documents/Daddelei/Blood on the Clocktower - Game Night.html`: a clock hand sweeps around the circle, the nodes it passes turn red as votes, and a vote count counts up. Reduced motion shows the end state.

- **S41** Setup: the storyteller sees every seat's character at a glance, in or under the circle, as the character icon in its team colour, without opening anything.

- **S42** The info boxes center their text instead of aligning it right.

- **S43** The grimoire circle (setup, night, day) looks less flat: decorated with ornament and visibly connected seats (e.g. a ring linking them), on the livelier background from S39.

- **S44** When a screen has to scroll, "Weiter" (the primary action) sits at the very end of the content instead of a sticky bar that cuts it off; the circle with the players and the info should be visible in one piece as far as possible.

- **S45** The communication buttons (show-bar) get a better placement and a more compact form.

- **S46** During the day the clock/timer is more visible and more emphasised.

- **S47** The ghost-vote token is more decorated (still ✕ ● / ✕ ○ readable, accessible label unchanged).

- **S48** The side info at the bottom left goes into a small box and becomes more legible.

- **S49** End screen: seats are grouped by Good and Evil, each with its character's icon.

### Gate 2 revisions, round 2 (2026-10-15, user feedback after looking at the build)
Verbatim feedback and Rue's explore answers are in `feedback-2026-10-15.md`; the element identification is in its answers, the Mobbin references in `mobbin-r2.md` (Rue: every UI/UX item gets Mobbin). Same legibility floor as round 1. Seat-node and centre-text layouts get a fit estimate for 15 seats on a 390×844 phone at planning time.

UI/UX
- **S50** No text cursor (I-beam) and no text selection on UI text anywhere in the app (all games, headings, info boxes, show texts, timer, counts); input fields keep their caret and selection.
- **S51** The night grimoire shows every seat's character icon in its team colour on the seat, as setup does (S41), instead of the text tag.
- **S52** Every seat node (setup, grimoire, night, dawn, day, vote clock) shows the player's name large and the seat number small. With an icon on the node: icon on the node, name below it, seat number small above or in a corner, wherever it reads best.
- **S53** Vote sweep: the hand turns at a constant speed instead of jumping seat to seat (same order: from the seat after the nominee, nominee last; same total time). The circle is divided into n equal sectors, one per seat, centred on that seat; the sector the hand is in lights up in a light red. A tap on a seat or Space casts or toggles a vote only for the seat whose sector holds the hand; taps on other seats do nothing during the sweep. In the confirm step after the sweep, tapping a seat toggles its vote and the count follows the voters (replaces the ± count), then Bestätigen.
- **S54** The decorative tick marks inside the circle are computed from n: n subtle ticks on the sector boundaries of S53, on every circle.
- **S55** The deck's voting slide uses the same look as S53/S54 (constant hand, light red sector, n ticks, counting votes). Reduced motion shows the end state.
- **S56** The day countdown keeps its size and look but moves to the top right of the day screen's head (next to the heading, below the app header, scrolls with the content) on every screen that shows it today.
- **S57** Tapping a seat gives clear feedback: the node presses in and springs back with a short glow/ripple, and the device vibrates briefly where the browser supports it (Android; iOS has no vibration API). Reduced motion: no scale or spring, the state change stays visible.
- **S58** During the day each seat shows two subtle rings outside the node: turquoise while the player can still be nominated today, orange while the player can still nominate today. Each ring disappears once that has happened and both reset at the next day. Dead players get only the turquoise ring (they cannot nominate but can be nominated).
- **S59** The player on the chopping block gets a round badge with a fitting symbol (e.g. an axe) instead of the red outline and the ▼ badge.
- **S60** The ghost vote becomes a round badge in the same style: light blue while the ghost vote is unused, greyed out once spent (replaces the S47 pill; accessible label unchanged).
- **S61** The day info box about the chopping block is a decorated card in the game's look with the S59 symbol and colour, the player's name and the number of votes they received.
- **S62** The page background has one continuous tone over the full page height on day and night screens; no cut or second shade below the first viewport.
- **S63** When the execution is final, the executed player's seat plays a short death animation (about 1 s). Reduced motion: instant.
- **S64** At dawn, players who died in the night play the same death animation (instead of the current mild settle). Reduced motion: instant.

Functions
- **S65** Show-bar texts appear in the centre of the circle instead of a fullscreen dialog, so the circle stays visible; the show-bar itself stays as it is. While a text is shown, tapping seats marks or unmarks them (several, up to all, with S57 feedback) so the storyteller can show who is meant; closing the text clears the marks, and seat taps go back to the step's behaviour (e.g. the Imp's target).
- **S66** Bluffs: the bluff names are not shown under the show-bar before "Zeigen"; "Neu würfeln" stays and draws again blind; the bluffs are visible only once shown (S65). The Drunk can never be drawn as a bluff.

## Non-goals
- Travellers, exile votes, Fabled — 5–15 players only (more than 15 needs Travellers).
- Other scripts (Bad Moon Rising, Sects & Violets, custom scripts).
- Tracking poison, drunkenness in effect, Monk/Soldier protection, Butler master, or any status effect beyond alive/dead and ghost votes — the storyteller owns them.
- Automatic resolution of Slayer shots or Virgin triggers — the storyteller records the outcome through the generic seat actions.
- A demo (scripted tap-through) for BotC — replaced by the explanation deck.
- Multi-device play, player phones, remote viewers.
- Any CI workflow change — speed-ups belong to `faster-ci`; this change only follows its e2e idioms.
- A day/night history log or undo beyond the night guide's "Zurück" and the seat corrections.
- Round 2: a select-all control for marking (S65) and vibration on iOS.

## Codebase touchpoints
- `src/lib/games/registry.ts` (+ `registry.test.ts`) — new entry; `GameEntry.demo` becomes optional or an `explanation` field is added; order/range/contract tests. (explorer: game wiring)
- `src/lib/engine/types.ts` — `GameDef` contract; BotC needs no content (`contentType`/`minContent` must allow "none"). (explorer: game wiring)
- `src/lib/session.ts` — `fits()` currently uses the demo opening state as the shape template; BotC needs its own template (nullable fields need placeholders). (explorers: persistence, wiring)
- `src/lib/demo/runner.test.ts`, `src/routes/spiele/[slug]/demo/`, start page `+page.svelte` (`rules`, `nouns`, `cards` maps) — demo-less game, Erklärung card, no Inhalte card. (explorer: wiring)
- `src/routes/spiele/[slug]/lobby/+page.svelte`, `src/lib/roster.svelte.ts` — count-first lobby (exactly N). (explorer: wiring)
- `src/routes/spiele/[slug]/spielen/+page.svelte`, `src/lib/ui/Stage.svelte`, `PlayHeader` — play page, phase key, status. (explorer: wiring/theming)
- `src/app.css`, `src/lib/ui/tokens.ts` (+ `tokens.test.ts`), `src/app.html`, `static/fonts/` — scoped theme tokens, new fonts. (explorer: theming)
- `src/routes/+layout.svelte` — per-route theme hook and `onNavigate` view transition. (explorer: theming)
- `src/lib/motion.ts`, `src/lib/sound.ts`, `src/lib/deco/motifs.ts`, `GameTile.svelte`, `Art.svelte` — motion helpers, new sounds, motif/icon. (explorer: theming)
- New: `src/lib/games/<botc>/` (engine, rules data, Screen, Setup, components) and a deck route.
- e2e: `e2e/look.test.ts` + new `e2e/walks/<botc>.ts`, `e2e/home.test.ts`, `e2e/start.test.ts`, `e2e/frame.test.ts`, `e2e/deco.test.ts`, reduced-motion list. (explorers: theming, wiring, CI)
- Specs with deltas: catalogue, demo, roster, game-engine, design-system, sound; new capability for the game. (explorers)

## Risks
- R1 Generic contracts assume every game has a demo and content (runner, registry, session `fits()`, start cards) → resolved: planned as a contract unit in wave 1 (optional demo, content "none", explicit session template), with spec deltas.
- R2 A themed html/body breaks look checks (contrast composite ignores background images; header shared) → accepted: theme via tokens on a route-level attribute, textures only as CSS layers over a solid background-color, look walk covers both variants.
- R3 View Transitions not in every browser → accepted: progressive enhancement, plain navigation otherwise.
- R4 The vote sweep is real-time (2.5 s × N) → accepted: the sweep duration is injectable so e2e and unit tests don't wait; one e2e runs a real short sweep.
- R5 e2e time grows (look walk ≈ 2 min already, CI e2e ≈ 13 min) → accepted: BotC tests use `test.skip(info.project.name !== …)` where self-sized, join the existing look walk, and test rules in vitest, not e2e.
- R6 15 seats + header (~230 px) on a 390×844 phone → accepted: measure each phase's primary action before layouting (repo learning).
- R7 IP and licence: the repo is public; character names/abilities belong to The Pandemonium Institute; the icons look like game-icons.net (CC BY 3.0) → accepted: attribution on the sheet and a credits slide; no TPI artwork or logos.
- R8 Rules gaps the sources don't settle (Drunk FT red herring, Drunk's role as bluff, Recluse receiving a starpass) → resolved by decisions below.

## Decisions
- Player count 5–15, chosen before the lobby — Rue: the deck adapts to it; Travellers are out (rulebook: > 15 only with Travellers).
- Evil wins at 2 living players (official) — Rue chose the official rule over "evil outnumbers good"; the deck and sheet must show the official wording.
- Ambiguous ability outcomes are resolved privately at the next dusk — Rue; nothing on the public screen hints at them.
- Votes: tap the seat or press Space while the hand passes, then confirm with an editable count — Rue. Superseded 2026-10-15 by S53: a vote counts only in the seat's sector, corrections by tapping seats in the confirm step.
- Night deaths are entered privately at the end of the night, revealed at dawn — Rue.
- UI and explanations in German, character names in English with the original ability text quoted — Rue.
- Seating is set in Setup 1 by drag/swap — Rue.
- The app replaces info tokens with a show-bar — Rue.
- Nominator and nominee are both recorded, and nomination rules are enforced — Rue.
- True info is computed as a suggestion for the storyteller — Rue.
- Hold-to-view grimoire at night only — Rue.
- Own sounds: bell, tick, reveal, gong — Rue.
- One change; the deck and sheet come last so they can explain the finished mechanics — Rue.
- Day screens on parchment, night screens dark, as in the presentation — follows the deck's day/night split.
- The red herring is placed whenever a Fortune Teller is in play or believed (Drunk), since it is harmless and keeps the Drunk-FT believable; bluffs exclude the Drunk's believed role; only living Minions can receive a starpass (no Recluse) — rules gaps, R8.
- Speed of checks: no CI change in this change; rules logic tested in vitest, e2e only for flows and look — Rue asked for efficient checks; faster-ci owns the workflows.

## Done when
- From the home screen Rue can open BotC with a smooth transition, pick 5–15 players, watch the deck with the right role counts, run a full game (setup, reveal, nights, days with votes, end) on one device, and the right team is revealed for: demon executed, starpass, Scarlet Woman takeover, Saint executed, Mayor win, 2 alive.
- The night guide wakes exactly the right characters in the official order on night 1 and later nights for 5, 7 and 15 players.
- `npm run proof:full` is green, and the look walk covers every BotC screen on phone and desktop.
- Other games look and behave as before.

## Split off
- none
