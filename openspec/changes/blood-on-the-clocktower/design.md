## Context

Every game today is a `GameEntry` in `src/lib/games/registry.ts` with a required demo script, a content type with a
pool in SQLite, a lobby that takes the whole roster (or a picker above the maximum) and a session checked against the
demo's opening state (`loadGameSession` → `fits()` in `src/lib/session.ts`). The start page hard-codes the Demo and
Inhalte cards, `runner.test.ts` and `registry.test.ts` iterate every game's demo. The look is one token set in
`src/app.css` (Arcade-Abend, dark only, Sora + Press Start 2P). Blood on the Clocktower breaks each of these: no demo
(an explanation deck instead), no content, a player count chosen before the lobby, a state that is mostly private, its
own theme with a parchment day variant, and long-running real-time pieces (vote sweep, day timer). Inputs:
`scope.md` (S1–S38, decisions), `research/rules.md` (rules authority), `research/design-sources.md` (tokens, fonts,
icons, slides), `research/mobbin.md` (screen patterns).

## Goals / Non-Goals

**Goals:** scope.md S1–S38 in one change, in 11 units over 4 waves (Gate 2 revisions S39–S49: U12–U16 in 2 waves;
round 2 S50–S66: U17–U22 in 3 waves): generic contract first, rules as pure tested code,
theme before screens, screens per phase against one state contract, the deck last.

**Non-Goals:** see proposal.md → Non-Goals (Travellers, other scripts, status-effect tracking, automatic Slayer/Virgin,
a BotC demo, multi-device, CI changes, history/undo).

## Decisions

- **Slug `clocktower`, name "Blood on the Clocktower", colour token `clocktower`** (blood red, about #e0645a, distinct
  from `--imposter` and passing ink-on-colour contrast; `-ledge`, `-tint` companions), badge letter "B", pitch "Eine
  Stadt sucht ihren Dämon, die Bösen lügen, eine Person erzählt." Routes: `/spiele/clocktower`, `/lobby`,
  `/erklaerung`, `/spielen`.
- **The generic contract bends by optional fields, not a second registry.** `GameEntry.demo` becomes optional; an entry
  may carry `Explanation` (a component the generic `/spiele/[slug]/erklaerung` route renders), `shape` (the session
  template, required when there is no demo), `countFirst` and `variant(state)`. The start page derives its cards from
  the entry (Demo if `demo`, Inhalte if `contentType !== 'none'`, Erklärung if `Explanation`). Alternative: a separate
  BotC start page — duplicates the layout the catalogue spec says all games share.
- **U1 registers BotC with a placeholder engine** (an inline `def` in `clocktower/index.ts`, placeholder `Screen`,
  `Setup`, `Deck`) so the count-first start, lobby, Erklärung card and 404s are proven in wave 1. U5 swaps in the real
  engine, U6 the real Screen shell, U11 the real Deck; the placeholders' file names and props are the contract.
- **N lives in `src/lib/count.ts`** under `arcade:count:<slug>`: `loadCount` stores the default (roster size clamped)
  on first use, so later roster changes never move N (scope S2 edge). Start screen, lobby and the deck route all read it.
- **The lobby passes exactly N players** to `Setup`; BotC's `Setup` only lists them and starts (`onstart({})`), N =
  `players.length`. Seating, characters and reveal are phases of the game state, so they survive a reload (S16).
- **Rules are pure functions over plain data (U2), the reducer composes them (U5).** U2 owns every type in
  `types.ts`, so the state and action contract below exists from wave 1; U5 implements it; screens (U7–U10) only
  render state and dispatch actions. All randomness (fill, reroll, believed role, red herring, bluffs) uses the state's
  seeded `Rng` (`src/lib/engine/rng.ts`).
- **One state, two layers, no status effects.** Private: characters, believed role, red herring, Demon seat, bluffs,
  history, noted target, open questions. Public: phase, alive, ghost votes, today's nominations, block, execution,
  timer deadline. The public screens never read the private layer except through the night guide, the hold-to-view
  grimoire and the end reveal.
- **The night is a list of screens built at dusk.** `night.steps` comes from `nightSteps()` (U2); `night.screens` is
  `dusk`, the open questions, four screens per step, and `deaths` from night 2; `next` / `back` / `skip` move `night.at`.
  A starpass inserts the new Imp's step after the Imp's step; a "yes" to the Scarlet Woman question inserts her step.
  "Zurück" never undoes recorded data (target, starpass, answers) — it only moves the cursor.
- **Win detection sets `winner`, the flow decides when the teaser shows.** After the night death step the night
  continues to dawn; dawn shows the deaths, then the teaser instead of the timer. After an execution the announcement
  shows, then the teaser instead of dusk. "Ist gestorben" with a winner, a dusk answer with a winner and "Spiel ist
  entschieden" go to the teaser at once. Ambiguous cases add a `Question` and set no winner, so the public flow is
  identical (S33).
- **Ambiguity rules** (scope R8 decisions): the red herring is placed for a real or believed Fortune Teller; bluffs
  exclude the Drunk's believed role; only living Minions receive a starpass (never the Recluse); the Scarlet Woman is
  eligible when she is alive and ≥ 5 players were alive just before the Demon died; questions only for the true Mayor
  and Saint.
- **Time is never read inside the reducer.** `timer` carries `now`; the deadline is stored; screens compute the rest.
  The vote sweep runs in the UI (`VoteClock`) at `seatMs()` per seat — 2500 by default, overridden in e2e through
  `window.clocktowerSeatMs` (set by `page.addInitScript`) — and dispatches `mark` and `swept`. Reduced motion jumps the
  hand. Tests never wait 37.5 s.
- **Theme = shared tokens redefined under `html[data-theme='clocktower']`**, plus `[data-variant='day']` for parchment
  and a few BotC tokens (`--good`, `--good-tint`, `--outsider`, `--evil`, `--evil-tint`, `--demon`, `--font-display`,
  `--font-num`). Shared components (Button, Modal, PlayHeader, Stage) follow without edits. `hooks.server.ts` `handle`
  renders the attribute into `app.html` (`%arcade.theme%`) from the URL, so a reload shows no other theme first; the
  layout's `onNavigate` updates it inside `document.startViewTransition` (skipped without the API or under reduced
  motion); the play route applies `entry.variant(state)` the same way. Textures are CSS layers over a solid colour, so
  the look walk's contrast check stays valid (scope R2). Alternative: a wrapper `<div>` theme — leaves body and the
  shared header unthemed.
- **Fonts and icons are taken from Rue's presentation file.** Its assets sit in a gzip/base64 manifest in
  `<script type="__bundler/manifest">` (see `research/design-sources.md` §1): 22 single-path SVG icons (512 viewBox) and
  woff2 subsets of IM Fell English SC, IM Fell English (regular, italic) and Alegreya Sans 400/500/700. Builders keep
  only the latin subsets, add the OFL texts, and store icon paths as data in `characters.ts` (no SVG files, no raster).
  Google Fonts' latin subsets of the same families are an acceptable source if the extraction fails.
- **Character sheet is a component built early (U6) and placed twice**: on the setup board (U7, S13) and as the deck's
  last slide (U11, S38). Its fit-to-viewport scenarios are proven where it is a slide.
- **Phone sheet scrolls at 14px+; deck stays fullscreen** (2026-10-14, user decision after the build). On phone each
  sheet page (Gut, Böse) uses text of at least 14px and scrolls vertically inside the page, giving up "fits one screen
  for a photo" (17 Gut entries only fit at 9.5px). Desktop keeps four columns, no scroll. The deck stays
  `position: fixed; inset: 0`, covering the Arcade header and mute button while open; "Schließen" is the way out.
- **e2e stays small and local.** Rules are proven in vitest (`src/lib/games/clocktower/*.test.ts`); e2e proves flows and
  look. BotC e2e uses only localStorage (roster via `seedRoster`, sessions via `seedClocktower`), never the database,
  so phone and desktop projects never collide. Self-sized tests use `test.skip(info.project.name !== …)`, locators are
  exact-text and scoped to `live(page)`, every BotC screen joins `look.test.ts` through `e2e/walks/clocktower*.ts`.
- **Variant scenario and cross-phase e2e live in U10**: night → dawn, the public-screen comparison and the full game
  need every screen merged, so they run in wave 4.

### Gate 2 revisions (S39–S49, 2026-10-14)

- **UI references: mobbin.md (Mobbin research for S39–S49).** Every revision unit reads
  `openspec/changes/blood-on-the-clocktower/mobbin.md` before laying out its screens; the visual specifics (sizes,
  stroke widths, glyph shapes, where exactly a control sits) come from there and from the decisions below, the specs
  only fix what is checkable. Where mobbin.md and a decision below disagree, the decision wins.
- **What the vague items mean (read from the screenshots and code).** S42 "Info Boxen": the `.panel` boxes of the
  play screens, whose text is left-aligned today (Deal name screen, Wake with its "Vorschlag" box, the info card, the
  Imp target note, "Schlaf wieder ein", DeathStep head, Questions, Dawn, End teaser; dusk is already centred), plus the
  End reveal, whose character column is the only truly right-aligned text (`End.svelte` `.char { text-align: right }`).
  Both are covered: panels centre, and the S49 regrouping removes the right-aligned column. S45 "Kommunikations
  Buttons": the show-bar (`ShowBar.svelte`, `[data-testid="show-bar"]`), 8 chips plus a select and "Zeigen" in 3–4 rows
  above the circle. S48 "Side Infos unten links": the bold `.facts` lines left under the circle on the day screens
  ("Auf dem Block: Dani" in `Day.svelte`, "Nötig: n · Höchststand: h" and the sweep hint in `VoteClock.svelte`, the result
  detail, the nominator `.why` list). mobbin.md read S48 as a legend box; that reading is not used, the facts lines are.
  S46 "die Uhr": both the day timer (`Timer.svelte`, today a 30px "8:00" at the right of the title row) and the voting
  clock's thin hand (`Circle.svelte` `[data-hand]`), since "Uhr" fits both and both are cheap. S44: the sticky `.dock`
  on the night circle screen (`Wake.svelte`) and the death step (`DeathStep.svelte`); the day screens already keep their
  buttons in flow and are regression-checked.
- **Where decoration lives.** The page-level sky is a new motif `sky` (`src/lib/deco/Sky.svelte`, mapped in `Art.svelte`,
  chosen by `motifFor('clocktower', 'lobby' | 'play')`), so it sits in the existing `[data-deco]` backdrop slot of the
  lobby and play pages with the existing rules (aria-hidden, no pointer events, behind content via the `.scene`
  stacking). It draws stars, a moon and a sun as inline SVG and shows moon and stars under
  `html[data-variant='night']`, the sun under `[data-variant='day']`, by CSS only, so the variant morph that already
  exists animates it and no state reaches the decoration. Decoration keeps to the margins and never under text; text
  keeps its solid card surfaces, so the composite contrast check stays valid (scope R2). The day's "livelier" parchment
  is gradient layers in `app.css` over the existing solid `--ground`; any token change is mirrored in `tokens.ts` with
  its contrast pairs. The circle's ornament is not a motif: it lives inside `Circle.svelte` as an aria-hidden
  `[data-deco][data-motif="circle"]` SVG under the seats, because it must follow `seatPositions()`; it holds no text
  (paths only, no numerals), so the look walk's text checks see only seats. The ghost-vote token's ornament is inline
  in the same component.
- **Characters on the setup circle (S41)** use a new optional `Circle` prop `token?: (i) => CharacterId | null` that
  renders `CharacterIcon` (team colour) inside the seat; only `SetupBoard` passes it, so no public circle can show one.
  The seat's `aria-label` gains the character name only when `token` returns one.
- **S44 against the repo learning "measure each phase's primary-action bottom on phone".** The sticky dock was the build's
  answer to that learning (keep "Weiter" in the first viewport). Rue chose the other side: the circle and its
  information in one piece, "Weiter" at the end. The learning still applies as measuring, not pinning: when the content
  plus the action exceed the viewport, shrink the content (circle capped by the viewport height, compact show-bar) and
  let the action follow below the fold; with 15 seats on a phone it may need a scroll. The cap needs no `Circle.svelte`
  change: `Circle` measures its own width, so the night and day screens wrap it in a container of
  `width: min(100%, <viewport height minus the measured chrome>)`. The night's Grimoire hold button moves before the
  navigation, so the navigation is the last control (S44 spec), and is no longer below the fold on the circle screen.
- **Show-bar (S45)**: one compact control group (mobbin.md: a segmented group with the select and "Zeigen" beside it),
  in flow next to the circle instead of 3–4 rows above it; the items, preselection and full-screen cards are unchanged.
- **Centred panels (S42)**: `text-align: center` with a readable measure (about 36ch, `text-wrap: balance`) per panel
  component. mobbin.md suggests keeping label/value rows left-aligned; Rue asked for centred text, so they centre too
  (the "Vorschlag" lines are short). No global `.panel` rule in
  `app.css`, because the setup board, character board and sheet must keep their alignment.
- **Day emphasis (S46, S48)**: the timer moves out of the heading row into its own block in the first viewport (larger
  than the heading); the hand gets the presentation's red, reaches the seat, and a hub; a new `Facts.svelte`
  (`[data-testid="day-facts"]`) boxes the facts lines on every day screen.
- **End reveal by team (S49)**: group by `alignment()` of the seat's character at the end (the Drunk is good, a starpassed
  Minion or Scarlet Woman holds `imp` and is evil), winning team first; rows carry `CharacterIcon`; the character stays a
  text column but left-aligned.
- **Voting slide animation (S40)** follows the presentation (research/design-sources.md "Voting slide (15) in detail"):
  hand rotates linearly from the seat after the nominee to the nominee (about 0.75 s per seat), then holds about 3 s and
  repeats; ⌈N/2⌉ voters spread around the ring turn red by an opacity step on a red fill; the centre count is stacked
  numerals switched by opacity steps in step with the hand, red at the threshold. The timeline is pure data from
  `deck.ts` (`voteTimeline(n)`: seats, voters, per-voter times, hand duration), so it is unit-tested and the e2e test
  can seek WAAPI animations to a time. Under reduced motion the slide renders the end state with no animation.
- **Look-walk budget.** The look walk takes about 2 min of its 300 s budget per project. Revision units reuse the existing
  walk screens (they all already cover lobby, setup, night circle, death step, day, clock, end, deck); each unit adds at
  most two shots, seeks or pauses the voting-slide animation before shooting, and reports the look test's duration
  before and after.

### Gate 2 revisions, round 2 (S50–S66, 2026-10-15)

- **Inputs: feedback-2026-10-15.md and mobbin-r2.md.** Every round-2 unit reads Rue's verbatim feedback and explore
  answers (`feedback-2026-10-15.md`) and the Mobbin references (`mobbin-r2.md`, Rue: every UI/UX item gets Mobbin)
  before it lays out a screen. The visual specifics below cite mobbin-r2.md by section; where mobbin-r2.md and Rue's
  words or scope.md disagree, Rue wins: sectors are centred on their seat (Rue, S53), not `[i, i+1)·360/n` (mobbin-r2
  §5); marking has no select-all/clear pair (round-2 non-goal) and no "N markiert" line (it does not fit the centre at
  5–9 seats, see the fit estimate); the dawn death uses the same ~1 s animation as the execution (S64 "the same"), not
  mobbin-r2 §6's slower 1.4 s variant.
- **One owner for `Circle.svelte`.** Ten S-items land on the shared circle (S52, S53, S54, S57, S58, S59, S60, S63, S64,
  S65). U17 makes every `Circle.svelte` and `circle.ts` change in wave 1 — node face, badges, rings, marks, sector
  wedge, n ticks, press feedback, death animation and the centre slot — behind the props in Contracts; U18–U22 only
  pass props. No later unit edits `Circle.svelte`; a needed change there is a deviation the unit reports.
- **Seat node (S52; mobbin-r2 §1, §3).** Number on a small pill on the node's top rim (12px, bold); without an icon the
  name fills the node's face (Alegreya Sans 600, `clamp(15px, 0.3·d, 20px)`, one line, ellipsis); with an icon (setup,
  held grimoire) the icon sits in the face's upper part (≈ 0.47·d) and the name on a ribbon over the lower rim (own
  surface, same size, max width `min(56px, neighbour distance − 8px)`). Badge slots on the rim, each a disc of ≈ 0.4·d
  with a 2px ring in the node's background colour to cut it off (Clubhouse, Discord in §3): block at 45° (top right),
  ghost vote at 135° (bottom right; on icon nodes at 45°, where no block ever shows), check at 225° for seats the user taps (`marked`, `pointed`; never `lit`) (bottom
  left). Glyphs are inline SVG paths: an axe for the block (§3 "axe/guillotine"), a raised hand for the ghost vote (§3
  "hand/ballot"), a check for marks.
- **Ghost-vote badge (S60; mobbin-r2 §3 Clubhouse muted badge).** Unused: light-blue disc (`--ghost`) with the hand
  glyph (`--ghost-ink`). Spent: grey (`--spent`), hollow (outline only) and the glyph struck through, so the two states
  differ in shape as well as colour (S15 "not colour only"). The seat keeps `data-ghost` and its accessible label; the
  "✕ ●"/"✕ ○" pill and its text go (Rue's S47 "still readable ✕ ●/✕ ○" is superseded by S60).
- **Block badge (S59).** Blood-red disc (`--clocktower`) with the axe in `--ink`; the seat keeps `data-block`, loses the
  red border/box-shadow and the "▼" badge.
- **Nomination rings (S58; mobbin-r2 §3 Jomo ring-as-state).** Two 2px rings outside the node: inner solid turquoise
  (`--nominee`) at d/2 + 3px, outer dashed orange (`--nominator`) at d/2 + 7px, partial opacity but ≥ 3:1 against the
  day ground; badges sit on top of them. Solid vs dashed and inner vs outer keep them apart without colour. Availability
  comes from two engine helpers that the reducer's nomination guards also use, so rings and rules cannot disagree.
- **Press feedback (S57; mobbin-r2 §1).** pointerdown: scale 0.93 plus a short gold glow; release: spring to 1.06 then 1
  and a one-shot ripple ring from the node centre; ≤ 500 ms, on the `scale`/`transform`/`opacity` properties only (the
  seat's `translate(-50%, -50%)` placement stays untouched by using the individual `scale` property or a child layer).
  `navigator.vibrate?.(10)` on an enabled seat's click; disabled seats neither animate nor vibrate. Reduced motion: no
  scale, spring or ripple. Vibration ignores the sound mute flag (it is touch feedback, not sound).
- **Marks while a text is shown (S65; mobbin-r2 §2 Badoo/Bond/Deezer).** A marked seat gets a gold ring and the check
  badge (`pointed` prop, distinct from `marked`, which keeps meaning "woken / voting / target"). State machine, all UI
  state in `Wake.svelte`, nothing stored: `card` (lifted out of `ShowBar` via `onshow`) and `pointed: number[]`.
  Seat tap → `card ? toggle pointed : step behaviour` (the Imp's `target`); the target's `disabled` reasons ("bereits
  tot", starpass) apply only while no text is shown. Close (tap on the text, Escape) → `card = null, pointed = []`.
  "Zeigen" while a text is shown → replace `card`, keep `pointed`. Leaving the screen or a reload unmounts both. The
  Minion info → bluffs preselection on close stays.
- **Show texts in the circle's centre (S65).** `ShowCard` renders inside `Circle`'s centre slot (`[data-centre]`, a disc
  inside the inner ring) on its own solid surface disc, so the composite contrast check stays valid; it keeps
  `data-testid="show-card"`, closes on tap or Escape, and is no `<dialog>`. Sizes from the fit estimate below.
- **Blind bluffs (S66).** `ShowBar` drops the `[data-testid="bluffs"]` preview; "Neu würfeln" stays and dispatches
  `bluffs` blind until the bluffs were shown once (`seen`, as today). `drawBluffs` excludes the Drunk from the Outsider
  pool (it already excludes the believed role); with no other Outsider free it returns 3 Townsfolk.
- **Held grimoire (S51).** `HoldGrimoire` passes `token` (the true character; the Drunk shows the Drunk's icon) instead
  of `label`; the extras that the text tag carried ("Drunk (glaubt: X)", "Red Herring", "Dämon") move to short notes
  under the circle inside the held card, naming their seats with `who()`.
- **Vote sweep (S53; mobbin-r2 §5).** Time stays out of the reducer. `VoteClock` keeps one `setTimeout` per seat time
  (so Playwright's clock drives it) and on entering sector k sets the hand to that sector's end boundary with a linear
  transition of exactly one seat time, so the hand turns at a constant speed (360/N degrees per seat time) and never
  rests. At "Abstimmung beginnen" the hand jumps without transition from the nominee's centre to the start boundary
  (180/N degrees on); after the sweep it returns to the nominee's centre. The lit sector is a wedge at ≈ 15% of
  `--clocktower` under the seats (seat faces are opaque, so seat text contrast is unchanged). During the sweep seats
  outside the hand's sector are `disabled` ("Zeiger ist woanders"): dimmed by Circle's disabled style, no press
  feedback, tap ignored — the spotlight effect of mobbin-r2 §1 (Apple Games: the active disc full colour, siblings
  desaturated). Tap or Space on the in-sector seat toggles its vote; dead seats without a ghost vote stay
  unmarkable. Reduced motion: no transition, the hand jumps to the centre of the in-sector seat. The tick sound plays
  per sector entry (sound spec unchanged: "each seat the vote hand reaches").
- **Confirm by tapping (S53), smaller design.** The UI drops the ± stepper; the reducer already keeps `votes` equal to
  the marks in the UI flow (`swept` sets it to `voters.length`, `mark` on confirm moves it by one), so the reducer is
  unchanged and the `count` action stays for fixtures and tests (`fixtures.voted()`, the day walk builders). The bigger
  design — dropping `count` so the reducer enforces `votes = voters.length` — would touch `fixtures.ts`, the walks'
  exported builders and five test files for no visible difference.
- **Execution death (S63).** `DayState` gains `killed: number | null` (the seat today's execution killed; null when the
  executed seat was already dead or nobody was executed), set by `execute` and `endDay`. `stateVersion` stays 1 (not
  shipped); `shape` follows `init`. The execution announcement passes `dying={killed === null ? [] : [killed]}` (empty
  under reduced motion, as `Dawn` does). Death keyframes (mobbin-r2 §6 Duolingo capture ring): a red ring pulses out,
  the node sinks 4px and fades into the dead style; 1000 ms, transform/opacity only; dawn reuses them (S64).
- **Block card (S61; mobbin-r2 §7 Runbuds/Premier League).** `BlockCard.svelte` replaces the "Auf dem Block: X" facts
  line on the grimoire: parchment card, thin gold frame, a blood-red header strip with the axe glyph, "Auf dem Block",
  the name in IM Fell English SC, and "<v> Stimmen" as the largest text; votes from the last nomination with result
  `block` whose nominee is the holder. No "needs N" line (the vote screens' facts box shows "Nötig").
- **Timer top right (S56; mobbin-r2 §4).** The head becomes a wrapping flex row: heading, then the unchanged `Timer`
  pushed to the right edge, top-aligned; neither sticky nor fixed. On every day screen that shows it (grimoire,
  nominator, clock, sweep, confirm, result).
- **No text selection, one background tone (S50, S62).** `app.css`: `html { user-select: none; -webkit-user-select:
  none; -webkit-touch-callout: none; cursor: default }`, with `input, textarea, [contenteditable]` restoring `text`
  selection and the text cursor (buttons keep `pointer`). The Clocktower body's gradient layers move to a fixed
  full-viewport layer (`body::before`, `position: fixed; inset: 0; z-index: -1`; `background-attachment: fixed` is
  ignored by iOS Safari) over the solid `--ground`, so every scroll position shows the same tone.
- **Deck voting slide (S55).** `voteTimeline` uses `sweepAt` with the deck's own 750 ms seat time: the hand starts on
  the boundary after the nominee (0.5 seat units), turns N sectors at constant speed, voters turn red on sector entry;
  the lit wedge steps sector by sector (opacity/transform steps); N ticks at `tickAngles(N)`. The app mechanics slides
  are reworded for the round-2 mechanics (badges and rings, sector rule, confirm by tapping, centre texts and marks).
- **Fit estimates (repo learning: measure before layouting; flow learning: dense screens get a fit estimate).**
  Phone 390×844: the content column is 358px (16px gutters), and every circle's box is 358px (setup cap 360, night
  `min(100%, 100svh − 120px)`, day/vote `min(100%, 100svh − 380px)` = 464 → 358). Desktop 1280×800: setup 360, day and
  vote 420, night 640. `seatSize`: 15 seats → 47px (phone), 48 (desktop setup), 56 (desktop day), 76 (desktop night);
  5–8 seats → 76px everywhere. Ring radius r = (box − d)/2; neighbour distance 2r·sin(180°/N) = 64.7px at 15 seats on
  phone. The held grimoire's card is `min(560px, 100% − 32px)` with its padding given back to the circle: 358px on
  phone (15 seats → 47px), 560px on desktop (→ 74px); its 70svh (591px) height holds the 358px circle plus three note
  lines.
  - **S52, 15 seats on phone (d = 47px):** face 39px across. Name at 15px (≥ 1.25 × the 12px number): 4-letter fixture
    names ≈ 26–30px fit; about 5 characters fit before the ellipsis (6–7 on the 56px ribbon). Icon nodes: icon 22px in
    the upper face, ribbon 18px tall from 14px to 32px below the centre, clearing every neighbour by ≥ 1px (tightest at
    the 24°/48° diagonal pair with the 56px cap). Badges 19px, reaching ≤ 3px past the node's square. Rings at 26.5 and
    30.5px radius → 63px footprint < 64.7px neighbour distance, so neighbouring rings never touch. **Legibility
    exception:** at 15 seats on a phone names longer than about 5 characters (6 on a ribbon) end in an ellipsis
    (before: about 7 at 11px, which was under the 12px floor); the full name stays in the accessible name and `title`.
  - **S65 centre:** the slot is a disc of radius `ornament().inner − 4` = r − d/2 − 10. Phone: 5–9 seats (d = 76) →
    186px across — the binding case, smaller than at 15 seats (244px), because fewer seats get bigger nodes; desktop
    night → 468px. Fitting a 186px disc (bounding-box half-diagonal ≤ 93px): digit 96px (≈ 52×96 → 55 ✓), "Ja"/"Nein"
    40px (≈ 90×46 → 51 ✓), "Das ist der Dämon" 20px on two balanced lines (≈ 120×48 → 65 ✓), "Deine Minions" 20px
    (≈ 140×24 → 71 ✓), character icon 40px + name 20px ("Fortune Teller" ≈ 146px; 146×68 → 81 ✓), "Du bist" 16px +
    icon + name (146×92 → 86.5 ✓), bluffs as three rows of icon 24px + name 16px (≈ 142×80 → 81.5 ✓). **Legibility
    exception:** the centre character text shows icon and name only (no team line, German explanation or ability text;
    those stay on the step's role card screen), the bluffs text drops the lead "Diese Charaktere sind nicht im Spiel",
    and there is no "N markiert" line — none of them fit 186px at the 16px floor. No text is shrunk below its floor.
  - **S56 head on phone:** the timer pill is ≈ 194px wide for "8:00" (52px digits) and ≈ 270px for "Zeit um", leaving
    ≈ 152px (2–3 lines of the 22px heading) or less beside it; below ~140px the heading wraps under the timer, which
    stays top right.
- **Superseded and modified scenarios (round 2).** A changed behaviour is a spec change: each is rewritten in
  `specs/clocktower/spec.md` and its test changed by the named unit, never silently. Superseded (old title removed, new
  title in its place): "Tapping any seat during the sweep toggles its vote" → "Only the seat in the hand's sector can
  vote" (U19); "Space marks only the seat under the hand" → "Space votes only for the seat in the hand's sector" (U19);
  "Confirm corrects missed timing" → "Confirm toggles votes by tapping seats" (U19); "Ghost-vote token decorated and
  readable" → "Ghost-vote badge shows whether the vote is left" (U17); "Show-bar opens full-screen cards" → "Show texts
  appear in the circle's centre" (U18); "Bluffs can be rerolled before showing" → "Bluffs stay hidden until shown"
  (U18); manual "Circle and ghost token look approved" → "Circle look approved" (the badge goes to "Seat nodes
  approved"); manual "Voting animation like the presentation" → "Voting slide like the game" (U22). Modified THEN, same
  title: Circle shows seats, alive and ghost votes · Circle legible on phone and desktop · Death on the circle is
  animated · Character icons fit fifteen seats · Block holder marked on the circle (U17); Bluffs are good characters not
  in play · Grimoire visible only while held (U18); Real short sweep marks votes · Reduced motion hand jumps · Voting
  clock hand stands out (U19); Day timer stands out · Day facts sit in a box (U21); Voting slide timeline follows the
  count · Voting slide sweeps and counts up · Voting slide shows the end state under reduced motion · Deck explains the
  app (U22); manual Day clock emphasis approved. Same scenario, test steps or locators change: Dawn shows the night's
  deaths and Public screen gives nothing away (U17, `.mark` → badge), Full Clocktower game (U19, votes by confirm taps
  instead of "Stimme mehr").
- **Look-walk budget (round 2).** The look walk is ≈ 2 min of its 300 s per project. U17 adds no shot (its node changes
  show in the existing setup, night, day and clock shots), U18 at most two (centre text with marks at 15 seats on
  phone; held grimoire with icons), U19 none (the sweep shot shows the sector), U20 none, U21 at most one (15-seat
  grimoire with rings, block card and badges), U22 none (seeks the voting slide to its end). Expected growth ≤ 15 s per
  project; each unit reports the look test's duration before and after.

## Contracts

Owner in brackets; everything else only uses it.

**Generic game contract [U1]** — `src/lib/engine/types.ts`, `src/lib/games/registry.ts`, `src/lib/count.ts`:
```ts
// GameDef: contentType widens, nothing else changes
contentType: ContentType | 'none';   // 'none' ⇒ minContent 0, no Inhalte, no content fetch, /inhalte → 404

export interface ExplanationProps { count: number; onclose(): void }
export interface GameEntry {
	def: GameDef<any, any, any>;
	Screen: Component<ScreenProps>;
	Setup: Component<SetupProps>;               // unchanged: { players, onstart(config) }
	demo?: DemoScript<any, any>;                // absent ⇒ no Demo card, /demo → 404, skipped by generic demo tests
	Explanation?: Component<ExplanationProps>;  // present ⇒ Erklärung card, /erklaerung renders it
	shape?: object;                             // session template; required when demo is absent
	countFirst?: true;                          // start-screen stepper, lobby exactly N
	variant?(state: any): 'day' | 'night';      // applied to <html data-variant> by the play route [U4]
	status(state: any): Status;
	pitch: string;
	savedOnly?: true;
	onchange?(prev: unknown, next: unknown): void;
}
export function loadGameSession(entry: GameEntry)  // like = entry.shape ?? start(entry.def, entry.demo!).state

// src/lib/count.ts — key `arcade:count:<slug>`, value a decimal string
export function loadCount(slug: string, range: { min: number; max: number }, rosterSize: number): number;
export function saveCount(slug: string, n: number): void;
```
Routes: `/spiele/[slug]/erklaerung/+page.server.ts` (404 unless `Explanation`) and `+page.svelte` (renders
`<entry.Explanation count={loadCount(…)} onclose={() => goto(base)} />`); `/spiele/[slug]/demo/+page.server.ts` (404
unless `demo`); `inhalte/+page.server.ts` 404 for `'none'`. Placeholders created by U1 and replaced later (the placeholder `init` returns `{ seats, phase: { kind: 'setup' } }` with
seats shaped like `Seat`, and `status` returns `["Aufbau"]`):
`clocktower/index.ts` (inline def → U5), `clocktower/Screen.svelte` (→ U6), `clocktower/Deck.svelte` (→ U11; a heading
"Erklärung" and a "Schließen" button calling `onclose`), `clocktower/Setup.svelte` (final: lists the N players,
"Spiel starten" → `onstart({})`).

**Types [U2]** — `src/lib/games/clocktower/types.ts` (seat indices are 0-based; seat number = index + 1):
```ts
export type Team = 'townsfolk' | 'outsider' | 'minion' | 'demon';
export type Alignment = 'good' | 'evil';
export type CharacterId =
	| 'washerwoman' | 'librarian' | 'investigator' | 'chef' | 'empath' | 'fortune-teller' | 'undertaker'
	| 'monk' | 'ravenkeeper' | 'virgin' | 'slayer' | 'soldier' | 'mayor'
	| 'butler' | 'drunk' | 'recluse' | 'saint'
	| 'poisoner' | 'spy' | 'scarlet-woman' | 'baron'
	| 'imp';
export type Trigger = 'first' | 'each' | 'each*' | 'death' | 'day' | 'passive' | 'setup';
export interface Character { id: CharacterId; name: string; team: Team; ability: string; de: string; hint: string; trigger: Trigger; icon: string }
// ability: TPI text verbatim · de: German explanation (cards, sheet) · hint: German "how to run" for the wake screen · icon: SVG path d, viewBox 0 0 512 512
export type TeamCounts = Record<Team, number>;

export interface Seat { player: Player; character: CharacterId | null; believed: CharacterId | null; alive: boolean; ghostVote: boolean }
// believed: the Drunk's Townsfolk, else null · ghostVote: true until spent (only meaningful when dead)

export type NightStepKind = 'minion-info' | 'demon-info' | 'new-imp' | CharacterId;
export interface NightStep { kind: NightStepKind; seats: number[]; as: CharacterId | null; note: string | null }
// as: the role the woken seat is woken as (believed role for the Drunk, 'imp' for new-imp, null for info steps)

export type Question = { kind: 'scarlet-woman' | 'saint' | 'mayor'; seat: number };
export type NightScreen =
	| { screen: 'dusk' }
	| { screen: 'question'; question: Question }
	| { screen: 'wake' | 'card' | 'circle' | 'sleep'; step: number }   // index into NightState.steps
	| { screen: 'deaths' };
export interface NightState { number: number; steps: NightStep[]; screens: NightScreen[]; at: number; target: number | null; starpass: number | null; deaths: number[] }

export interface Nomination { nominator: number; nominee: number; voters: number[]; votes: number | null; result: 'block' | 'tie' | 'none' | null }
export interface DayState { number: number; deadline: number | null; pending: number | null; nominations: Nomination[]; high: number; block: number | null; executed: number | null; closed: boolean; deaths: number[] }
// pending: nominee tapped, nominator not yet chosen · deaths: dawn's deaths (night) shown at dawn

export type Phase =
	| { kind: 'setup' }
	| { kind: 'reveal'; seat: number; shown: boolean }
	| { kind: 'night' }                                               // where: state.night
	| { kind: 'dawn'; screen: 'wake' | 'deaths' | 'timer' }
	| { kind: 'day'; screen: 'grimoire' | 'nominator' | 'clock' | 'sweep' | 'confirm' | 'result' | 'execution' }
	| { kind: 'over'; revealed: boolean };

export interface DemonEvent { night: number; from: number; to: number; was: CharacterId; kind: 'starpass' | 'scarlet-woman' }
// the new Demon's seat gets character 'imp'; was = its character before (for the end reveal)
export interface ClocktowerState {
	rng: Rng;
	seats: Seat[];
	locked: boolean;
	redHerring: number | null;
	demon: number | null;          // current Demon seat
	bluffs: CharacterId[];         // 3 after lock
	history: DemonEvent[];
	phase: Phase;
	night: NightState | null;      // current or last night
	today: DayState | null;        // current or last day
	lastExecution: number | null;  // executed on the day before tonight (Undertaker)
	questions: Question[];         // asked at the next dusk
	winner: Alignment | null;
}
export type ClocktowerAction =
	| { type: 'swap'; a: number; b: number } | { type: 'move'; from: number; to: number }
	| { type: 'assign'; seat: number; character: CharacterId | null }
	| { type: 'fill' } | { type: 'reroll' }                                  // "Zufällig", "Alles neu"
	| { type: 'believe'; character: CharacterId | null }                    // null = random
	| { type: 'herring'; seat: number | null }                              // null = random
	| { type: 'lock' }
	| { type: 'show' } | { type: 'hide' }
	| { type: 'next' } | { type: 'back' } | { type: 'skip' }
	| { type: 'answer'; yes: boolean } | { type: 'declare'; winner: Alignment }
	| { type: 'target'; seat: number | null } | { type: 'starpass'; seat: number | null } | { type: 'bluffs' }
	| { type: 'deaths'; seats: number[] }
	| { type: 'timer'; minutes: number | null; now: number }
	| { type: 'nominee'; seat: number } | { type: 'nominate'; nominator: number } | { type: 'cancel' }
	| { type: 'vote' } | { type: 'mark'; seat: number; on: boolean } | { type: 'swept' }
	| { type: 'count'; votes: number } | { type: 'confirm' }
	| { type: 'execute'; seat: number } | { type: 'died'; seat: number }
	| { type: 'revive'; seat: number } | { type: 'ghost'; seat: number; on: boolean }
	| { type: 'endDay' }
	| { type: 'reveal' };
export type Info =
	| { kind: 'pair'; seats: [number, number]; character: CharacterId }   // Washerwoman/Librarian/Investigator
	| { kind: 'zero' }                                                     // Librarian: 0 Outsider
	| { kind: 'number'; n: number }                                        // Chef, Empath
	| { kind: 'demon'; seats: number[] }                                   // Fortune Teller: Demon + red herring
	| { kind: 'character'; character: CharacterId }                        // Undertaker
	| { kind: 'none' };
```
An action that is not valid in the current state returns the state unchanged (same object).

**Pure rules [U2]** — `src/lib/games/clocktower/`:
```ts
// characters.ts
export const characters: Character[]; export const byId: Record<CharacterId, Character>;
export function alignment(id: CharacterId): Alignment;
// setup.ts
export function required(count: number, baron: boolean): TeamCounts;
export function counts(seats: Seat[]): TeamCounts;                         // by true character
export function problems(seats: Seat[], redHerring: number | null): string[];  // German; [] = valid & complete
export function fill(seats: Seat[], rng: Rng): [Seat[] | null, Rng];       // null = no valid fill ("zu viele …")
export function believable(seats: Seat[]): CharacterId[];                  // Townsfolk not in play
export function needsHerring(seats: Seat[]): boolean;
export function herringOptions(seats: Seat[]): number[];                   // good seats
export function drawBluffs(seats: Seat[], rng: Rng): [CharacterId[], Rng];
// night.ts
export function nightSteps(state: ClocktowerState, night: number): NightStep[];
// info.ts
export function info(state: ClocktowerState, step: NightStep): Info;
// vote.ts
export const SEAT_MS = 2500;
export function seatMs(): number;                                          // globalThis.clocktowerSeatMs ?? SEAT_MS
export function threshold(alive: number): number;                          // ⌈alive / 2⌉
export function voteOrder(nominee: number, count: number): number[];       // after the nominee, clockwise, nominee last
export function sweepMs(count: number, perSeat?: number): number;
export function voteResult(votes: number, alive: number, high: number): 'block' | 'tie' | 'none';
// fixtures.ts — states built directly (no reducer), locked, phase reveal seat 0
export function seated(characters: CharacterId[], opts?: { believed?: CharacterId; redHerring?: number; seed?: number }): ClocktowerState;
export const F5: CharacterId[]; export const F7: CharacterId[]; export const F15: CharacterId[];
```
Fixtures (seat 1 first; players Alex, Bo, Cleo, Dani, Eli, Fey, Gus, Hana, Ida, Jo, Kai, Lu, Mo, Nia, Ole):
- **F5**: washerwoman, empath, poisoner, imp, fortune-teller (red herring seat 1).
- **F7**: chef, investigator, monk, ravenkeeper, slayer, spy, imp.
- **F15**: washerwoman, librarian, investigator, chef, empath, fortune-teller, undertaker, monk, ravenkeeper, butler,
  saint, poisoner, spy, scarlet-woman, imp (red herring seat 8).

Expected night order: F5 N1 poisoner, washerwoman, empath, fortune-teller · N2 poisoner, imp, empath, fortune-teller,
deaths. F7 N1 minion-info, demon-info, investigator, chef, spy · N2 monk, imp, ravenkeeper, spy, deaths. F15 N1
minion-info, demon-info, poisoner, washerwoman, librarian, investigator, chef, empath, fortune-teller, butler, spy · N2
(no execution) poisoner, monk, imp, ravenkeeper, empath, fortune-teller, butler, spy, deaths.

**Reducer and entry [U5]** — `clocktower/engine.ts` exports `clocktower: GameDef<ClocktowerState, ClocktowerAction,
Record<string, never>>` (`slug 'clocktower'`, `colour 'clocktower'`, 5–15, `contentType 'none'`, `minContent 0`,
`stateVersion 1`) and `shape: ClocktowerState`; `def.phase(state)` returns one key per screen (e.g. `night-2-7`,
`day-1-clock`) so `Stage` transitions each. `clocktower/win.ts` holds the win and question checks.
`clocktower/index.ts` wires `def`, `Screen`, `Setup`, `Explanation: Deck`, `shape`, `countFirst`, `status`
(game-engine delta formats), `variant` (`day` for dawn and day, else `night`) and the pitch. `e2e/clocktower-session.ts`:
```ts
export async function seedClocktower(page: Page, state: ClocktowerState): Promise<void>; // localStorage session + count
export function play(state: ClocktowerState, actions: ClocktowerAction[]): ClocktowerState;
```

**Theme [U4]** — `html[data-theme='clocktower'][data-variant='night'|'day']`; tokens listed above, mirrored in
`tokens.ts` as `clocktowerNight` / `clocktowerDay` with their contrast pairs. Fonts in `static/fonts/`:
`im-fell-english-sc-latin.woff2`, `im-fell-english-latin.woff2`, `im-fell-english-italic-latin.woff2`,
`alegreya-sans-latin-400.woff2`, `-500`, `-700`, plus `IMFellEnglish-OFL.txt`, `AlegreyaSans-OFL.txt`. Motif
`clocktower` in `motifs.ts`, art `src/lib/deco/Clocktower.svelte`.

**Components and shell [U6]** — `src/lib/games/clocktower/`:
```ts
Screen.svelte    { state: game, dispatch }  // phase.kind → SetupBoard | Deal | Night | Day (dawn, day) | End
Circle.svelte    { seats: Seat[]; size?: 'setup' | 'play'; label?: (i: number) => string | null; marked?: number[];
                   block?: number | null; hand?: number | null; handMs?: number; dying?: number[];
                   disabled?: (i: number) => string | null; onseat?: (i: number) => void;
                   onswap?: (a: number, b: number) => void; onmove?: (from: number, to: number) => void; center?: Snippet }
                 // <div data-circle><button data-seat="n" aria-label="Platz n, <Name>[, tot, Stimme|keine Stimme]">…
                 // data-dead, data-ghost, data-marked, data-block on the seat; [data-hand] style --angle
circle.ts        seatPositions(count, size): { x: number; y: number }[]; seatSize(count, size): number; angleOf(seat, count): number
RoleCard.svelte  { character: CharacterId }   // data-testid="role-card": icon, name, team, de, ability
CharacterIcon.svelte { id: CharacterId; size?: number }
Sheet.svelte     {}                            // data-testid="sheet"; phone: pages "Gut" / "Böse"
SetupBoard.svelte, Deal.svelte, Night.svelte, Day.svelte, End.svelte   // placeholders: phase name + "Weiter" (next)
```

**Test file owners** — U1 `e2e/clocktower-start.test.ts`, `e2e/walks/clocktower.ts` (+ stub walks
`clocktower-setup|night|day|end|deck.ts`, each `export async function walk(page, check) {}`), edits in
`home.test.ts`, `start.test.ts`, `look.test.ts`, `registry.test.ts`, `runner.test.ts`; U2 `clocktower/{characters,
setup,night,info,vote}.test.ts`; U3 `sound.test.ts`; U4 `e2e/clocktower-theme.test.ts`, `deco.test.ts`,
`tokens.test.ts`, `motifs.test.ts`; U5 `clocktower/engine.test.ts`, `win.test.ts`, `status.test.ts` (BotC block),
`e2e/clocktower-session.test.ts`; U6 `clocktower/circle.test.ts`, `sheet.test.ts`; U7 `e2e/clocktower-setup.test.ts`,
`walks/clocktower-setup.ts`; U8 `e2e/clocktower-night.test.ts`, `walks/clocktower-night.ts`; U9
`e2e/clocktower-day.test.ts`, `walks/clocktower-day.ts`, `clocktower/timer.test.ts`; U10 `e2e/clocktower-end.test.ts`,
`e2e/clocktower-game.test.ts`, `walks/clocktower-end.ts`; U11 `clocktower/deck.test.ts`, `e2e/clocktower-deck.test.ts`,
`walks/clocktower-deck.ts`.

**Gate 2 revision contracts [U12–U16]:**
```ts
// motifs.ts [U12]: Motif gains 'sky'; motifFor('clocktower', 'lobby' | 'play') === 'sky', other games unchanged
// Sky.svelte [U12]: <svg> with [data-star] ×≥5, [data-moon], [data-sun]; visibility by html[data-variant]
// Circle.svelte [U13], existing props and DOM unchanged ([data-seat], aria-label, data-dead/-ghost/-marked/-block, [data-hand]), plus:
token?: (i: number) => CharacterId | null;   // setup only: CharacterIcon in the seat, name added to aria-label
// ornament: <svg data-deco data-motif="circle" aria-hidden="true"> under the seats; ghost token .mark keeps its text
// Facts.svelte [U15]: { children: Snippet } → <div data-testid="day-facts">
// deck.ts [U16]:
export function voteTimeline(n: number): { seats: number; nominee: 0; voters: number[]; at: number[]; handMs: number; holdMs: number };
```
Night and day screens [U14, U15] cap the circle by wrapping `Circle` in a sized container; they do not edit
`Circle.svelte`. Revision test files: U12 `e2e/clocktower-atmosphere.test.ts`, `motifs.test.ts`, `tokens.test.ts`; U13
`e2e/clocktower-circle.test.ts`, `circle.test.ts`, `walks/clocktower-setup.ts`; U14 `e2e/clocktower-night-layout.test.ts`,
`clocktower-night.test.ts`, `walks/clocktower-night.ts`; U15 `e2e/clocktower-day-layout.test.ts`,
`clocktower-day.test.ts`, `walks/clocktower-day.ts`; U16 `clocktower-end.test.ts`, `clocktower-game.test.ts`,
`walks/clocktower-end.ts`, `deck.test.ts`, `clocktower-deck.test.ts`, `walks/clocktower-deck.ts`. Tests that need
night or day states import the existing builders (`walks/clocktower-day.ts` exports, `e2e/clocktower-session.ts`)
read-only.

**Gate 2 round 2 contracts [U17–U22]** (angles in degrees clockwise from the top; seat indices 0-based; sizes in px;
times in ms):
```ts
// circle.ts [U17]
export function tickAngles(count: number): number[];          // count angles, (k + 0.5) · 360 / count — the sector boundaries
export function sectorOf(deg: number, count: number): number; // seat whose sector [angleOf(i) − 180/count, angleOf(i) + 180/count) holds deg (any real); a boundary belongs to the next seat clockwise
export function wedge(seat: number, count: number, box: number): string; // SVG path d of the seat's sector, from the centre to the outer ring, in the box's px
ornament(count, box)                                           // as before; ticks = tickAngles(count) (was 12 fixed), drawn as <path data-ticks={count}>
// Circle.svelte [U17] — existing props and DOM kept ([data-seat], aria-label, data-dead/-ghost/-marked/-block, [data-hand], label, token), plus:
hand?: number | null;      // seat units, fractional allowed: angle = hand · 360 / count; k + 0.5 = boundary after seat k; values ≥ count keep turning clockwise
handMs?: number;           // ms of the hand's linear transition (0 = jump)
sector?: number | null;    // lit sector: <path data-sector={i + 1} aria-hidden> under the seats, fill ≈ 15% --clocktower
rings?: (i: number) => { nominee: boolean; nominator: boolean };  // <span data-avail="nominee"> (inner, solid, --nominee) / <span data-avail="nominator"> (outer, dashed, --nominator), outside the node
pointed?: number[];        // storyteller's marks (S65): data-pointed on the seat, gold ring + check badge
center?: Snippet;          // rendered in <div data-centre>: a disc of diameter 2 · (ornament().inner − 4) px, centred; its diameter as --centre
// node: <span class="no"> on the top rim, <span class="name"> (face, or ribbon under an icon); badges <span data-badge="block|ghost|check" aria-hidden>, ghost with data-spent when used up
// press: enabled seat → scale/ripple ≤ 500 ms + navigator.vibrate?.(10) on click, then onseat; disabled seat → nothing; reduced motion → no animation
// dying: the death keyframes, 1000 ms, transform/opacity only, once on mount of the seat in `dying`
// tokens [U17] in app.css (both variants) and tokens.ts with non-text pairs ≥ 3:1: --ghost, --ghost-ink, --spent, --nominee, --nominator
// vote.ts [U19]
export function sweepAt(ms: number, nominee: number, count: number, perSeat?: number): { hand: number; seat: number } | null;
// hand = nominee + 0.5 + ms / perSeat (seat units), seat = the seat whose sector holds it (= voteOrder(nominee, count)[⌊ms / perSeat⌋]); null once ms ≥ sweepMs(count, perSeat)
// ShowBar.svelte [U18]: { state, dispatch, step, onshow: (card: Card) => void } — renders no ShowCard and no bluff names
// ShowCard.svelte [U18]: { card: Card; onclose(): void } — rendered by Wake in Circle's center slot, data-testid="show-card", no <dialog>
// engine.ts [U21]
export function canBeNominated(s: ClocktowerState, seat: number): boolean; // a day with nominations open and the seat not yet nominated today (a pending nominee still counts as not nominated)
export function canNominate(s: ClocktowerState, seat: number): boolean;    // a day with nominations open, the seat alive and not yet nominated anyone today
// types.ts [U21]: DayState gains killed: number | null — the seat today's execution killed (null: nobody, or already dead)
// BlockCard.svelte [U21]: { name: string; votes: number } → <section data-testid="block-card">
// deck.ts [U22]: voteTimeline(n) → { seats, nominee: 0, voters, at, handMs: n · SEAT_MS, holdMs, start: 0.5 }  // at[j]: entry into voter j's sector
```
Round-2 test files: U17 `circle.test.ts`, `tokens.test.ts`, new `e2e/clocktower-node.test.ts`, `e2e/clocktower-circle.test.ts`,
`e2e/clocktower-day.test.ts`, `e2e/clocktower-game.test.ts`; U18 `setup.test.ts`, `e2e/clocktower-night.test.ts`, new
`e2e/clocktower-show.test.ts`, `walks/clocktower-night.ts`; U19 `vote.test.ts`, new `e2e/clocktower-vote.test.ts`,
`e2e/clocktower-day.test.ts`, `e2e/clocktower-circle.test.ts`, `e2e/clocktower-game.test.ts`; U20 new `e2e/ui-text.test.ts`,
`e2e/clocktower-atmosphere.test.ts`; U21 `engine.test.ts`, `e2e/clocktower-day-layout.test.ts`, new
`e2e/clocktower-day-marks.test.ts`, `walks/clocktower-day.ts`; U22 `deck.test.ts`, `e2e/clocktower-deck.test.ts`,
`walks/clocktower-deck.ts`. Builders in `walks/clocktower-day.ts`, `e2e/clocktower-session.ts` and `fixtures.ts` are
imported read-only and keep their signatures.

## Risks / Trade-offs

- [Generic contract change breaks six games' tests] → U1 owns every generic file and test; "unchanged and green"
  lists in tasks.md; the other six games keep their demo, content and lobby behaviour.
- [A themed html/body breaks look checks (scope R2)] → tokens on `html`, textures as layers over solid colours, the
  look walk covers both variants; contrast pairs for both variants in `tokens.test.ts`.
- [View Transitions missing (R3)] → feature-detected, plain navigation otherwise, tested with the API deleted.
- [Real-time sweep slows tests (R4)] → `seatMs()` injectable; one e2e runs a real short sweep; durations in vitest.
- [e2e time grows (R5)] → rules in vitest; e2e per phase seeds its state directly with `seedClocktower`; self-sized
  tests in one project; walks seed their own state instead of tapping through.
- [15 seats + header on 390×844 (R6)] → circle geometry unit-tested for 5–15; each phase's primary action measured in
  e2e on phone before layouting (repo learning).
- [IP and licence (R7)] → attribution on the sheet and a credits slide; no TPI artwork; icons as data with CC BY 3.0
  credit.
- [Placeholders in wave 1–2 make a half-working game on the feature branch] → nothing ships before Verify; each
  placeholder has a named owner unit.
- [Wave-3 units each need state that later screens produce] → every phase e2e seeds its own state from `play(…)`;
  cross-phase flows (variant switch, public-screen comparison, full game) are U10's.
- [Ten round-2 S-items meet in `Circle.svelte`] → U17 owns it alone in wave 1 and exposes every new look as a prop;
  later units only pass props and report a needed Circle change as a deviation.
- [CSS transitions run in real time, Playwright's clock does not drive them] → the sweep's sector logic runs on timers
  (clock-driven), the hand's constancy is proven by its per-sector target angle and linear transition, not by sampling.
- [State shape grows while U7–U10 build] → the contract above is fixed at U2; a needed change is a deviation reported
  by the unit and merged by the orchestrator, `stateVersion` stays 1 until the change ships.

## Migration Plan

None: no schema, migration, API or dependency change. Existing sessions of the six games keep their shape; BotC starts
at `stateVersion` 1.

### Circle contract as built by U17 (round 2, wave 1)
Later units of round 2 rely on this; it records U17's report, including where it departs from the plan above.
- `tickAngles(count)`: degrees clockwise from the top, (k + 0.5)·360/count; tick k lies between seats k+1 and k+2.
- `sectorOf(deg, count)`: 0-based seat whose sector [angleOf(i) − 180/count, angleOf(i) + 180/count) holds deg; any real deg; a boundary belongs to the next seat clockwise.
- `wedge(seat, count, box)`: SVG path d from the box centre (px) to the outer hairline ring (radius box/2 − 1 px), ±180/count degrees around the seat.
- `ornament(count, box)`: `ticks` holds count ticks drawn as `<path data-ticks={count}>`; `inner` in px.
- Circle `hand?: number | null`: seat units, fractional; angle = hand·360/count deg; k + 0.5 is the boundary after seat k; values ≥ count keep turning clockwise; `[data-hand]` with `--angle` (deg). `handMs?: number`: ms of the hand's linear transform transition (0 = jump).
- Circle `sector?: number | null`: 0-based seat; `<path data-sector={i+1} aria-hidden>` under the seats (--clocktower at 15% opacity, no pointer events).
- Circle `rings?: (i) => { nominee: boolean; nominator: boolean }`: `<span data-avail="nominee">` solid 2px --nominee ring at d/2 + 3px; `<span data-avail="nominator">` dashed 2px --nominator ring at d/2 + 7px; aria-hidden, no pointer events, full opacity (tokens ≥ 3:1, opacity would lower the composite).
- Circle `pointed?: number[]`: 0-based; `data-pointed`, 3px --gold ring and a check badge. `marked?: number[]`: seats the user taps (voters, death step, setup pick), `data-marked`, tint plus a check badge. `lit?: number[]`: the night's own highlight (woken seat, the Imp's target; Wake passes these), `data-marked` and the same tint but no check badge (decisions D1, verify r7, and its follow-up).
- Circle `center?: Snippet`: in `<div data-centre>`, a disc of diameter 2·(ornament().inner − 4) px, exposed as `--centre` (px); its direct children, buttons and links get pointer events.
- Circle `dying?: number[]`: 0-based; class `dying` runs keyframes `death` (1000 ms: translateY 4px sink, fade to 0.35, return; transform/opacity only) once on mount, child `[data-pulse]` runs `death-ring` (1000 ms, scale 1 → 1.7, opacity 0.9 → 0); none under reduced motion.
- Seat node: `.no` 12px bold pill centred on the top rim; `.name` (title = full name) clamp(15px, 0.3·d, 20px), one line, ellipsis. With `token`: icon 0.47·d in the face, name on a ribbon at centre + 0.28·d, max width min(56px, neighbour distance − 8px). Seats placed with left/top = centre − d/2 (no translate); `.circle` has padding-block 8px.
- Badges `<span data-badge="block|ghost|check" aria-hidden>`: discs 0.4·d with a 2px ring in the face colour at radius d/2 + 2px; block 45° (axe), ghost 135° (raised hand; `data-spent` hollow --spent ring, grey glyph, `[data-strike]`), check 225°; on icon nodes all at 45°.
- Press: enabled seat pointerdown → scale 0.93 in 90 ms with a gold glow on `[data-ripple]`; click → spring 0.93 → 1.06 → 1 in 340 ms, ripple 460 ms, `navigator.vibrate?.(10)`, then `onseat`. Disabled seat (`disabled(i)` returns a reason) does nothing; reduced motion: no animation.
- Tokens (app.css night/day, tokens.ts): --ghost, --ghost-ink, --spent, --nominee, --nominator; `clocktowerMarks` exports the non-text pairs (≥ 3:1).
