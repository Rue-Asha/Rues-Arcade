## MODIFIED Requirements

### Requirement: Shared components
The design system SHALL provide: button with press state (sinks into its 5px ledge), game tile, card,
scoreboard, lives, modal, hold-to-view, coach tip, pager, and the in-game pieces the game screens compose: game frame
(stage card and rail), handoff, reveal, outcome and winner. The button SHALL come in the variants primary, secondary,
ghost, danger (red, `--imposter` with `--imposter-ledge`, ink text) and warning (orange, `--duck` with
`--duck-ledge`, ink text), and in an icon-only square form (as wide as it is high, an SVG icon as content, its
accessible name given as a label) usable with any variant. Interactive controls SHALL have touch targets of at
least 44×44px.

#### Scenario: Touch targets are at least 44px
- **WHEN** Home, Spieler and each game screen are rendered at 390px width
- **THEN** every button, link and input has a bounding box at least 44px high and wide
- **proof:** e2e

#### Scenario: Hold-to-view reveals only while held
- **WHEN** a player presses and holds the hold-to-view control, then releases it
- **THEN** the hidden content is visible while held and hidden again after release
- **proof:** e2e

#### Scenario: Danger and warning buttons
- **WHEN** a danger button and a warning icon-square button are rendered side by side (Feud's "Fehler" and its "Rückgängig")
- **THEN** the danger button has the `--imposter` background, the warning square has the `--duck` background, is as wide as it is high, shows no visible text and is named by its label
- **proof:** e2e ("Scenario: Feud fault and undo read as what they are")

### Requirement: Motion
The app SHALL animate screen and phase transitions, give juicy press feedback, count scores up, and play a
per-phase reveal animation, using transform/opacity only. Every motion added after the motion tokens SHALL take its
easing and duration from them: `--ease-in` (cubic-bezier(0.5, 0, 0.75, 0)), `--ease-pop` (cubic-bezier(0.34, 1.56,
0.64, 1)), `--dur-out` (0.18s), `--dur-in` (0.42s) and `--dur-hero` (0.56s), defined in `src/app.css` `:root` next to
`--ease-out` and `--dur` and mirrored in `src/lib/ui/tokens.ts`. Motion SHALL never block input. Under
`prefers-reduced-motion: reduce` every Svelte transition and every Web Animations call SHALL take duration 0 or not
run, because the global CSS rule does not reach them; the ambient decoration rule stays as it is.

#### Scenario: Reduced motion makes transitions instant
- **WHEN** the browser reports `prefers-reduced-motion: reduce`
- **THEN** screen transitions complete instantly and scores show their final value without counting up
- **proof:** e2e

#### Scenario: Motion never blocks input
- **WHEN** a player taps a control while a transition or count-up is running
- **THEN** the tap is handled immediately
- **proof:** e2e

#### Scenario: Motion tokens in CSS and tokens.ts
- **WHEN** `src/app.css` and `tokens.ts` are read
- **THEN** `:root` defines `--ease-in`, `--ease-pop`, `--dur-out`, `--dur-in` and `--dur-hero` with the values above, and `tokens.ts` holds the same values
- **proof:** unit

#### Scenario: Reduced motion zeroes every motion helper
- **WHEN** `prefers-reduced-motion: reduce` is reported and each motion helper (rise, phase out, pop, sunburst turn, fault, winner burst) is called
- **THEN** each Svelte transition returns duration 0 and no Web Animations call is made
- **proof:** unit

#### Scenario: Reduced motion covers every in-game motion
- **WHEN** `prefers-reduced-motion: reduce` is set and each game is played through its handover, reveal, result and game over, and a pager page is turned
- **THEN** after each step no finite animation is running, scores show their final value, and no winner pieces exist
- **proof:** e2e ("Scenario: Imposter reduced motion is instant", "Scenario: Wavelength reduced motion is instant", "Scenario: Codes reduced motion is instant", "Scenario: Duck reduced motion is instant", "Scenario: Most Likely reduced motion is instant", "Scenario: Feud reduced motion is instant", "Scenario: Pager page change is instant under reduced motion")

#### Scenario: Phase motion approved on a real device
- **WHEN** Rue plays a few phases of each game on a phone and a desktop browser
- **THEN** Rue finds the out/in transitions, reveals, score count-ups and winner burst lively but not in the way
- **proof:** manual (motion feel is a visual judgement that screenshots cannot carry, at Gate 2)

## ADDED Requirements

### Requirement: Phase transition
On every phase change the play and demo Stage SHALL keep the outgoing screen in the same grid cell as the incoming one
and fade and lift it out (opacity 1→0, translateY 0→−8px, `--dur-out` with `--ease-in`, at most 200ms) while the
incoming screen rises in (`rise`, `--dur-in`, starting about 60ms later), overlapping. From the moment it starts
leaving the outgoing node SHALL be `inert` and `aria-hidden="true"`, and SHALL hold no `data-demo` attribute. At most
one outgoing node SHALL exist at any time. A reload SHALL show the incoming screen only. Under reduced motion the
change SHALL be instant: no outgoing node on the next frame and no finite animation running. The incoming screen's
primary button SHALL dispatch on the first tap while the transition runs.

#### Scenario: Phase change fades out and rises in
- **WHEN** a phase change happens with motion allowed
- **THEN** for at most 200ms an outgoing stage node sits in the same grid cell as the incoming one, animating only opacity and transform, is `inert` and `aria-hidden`, and afterwards exactly one stage node remains
- **proof:** e2e

#### Scenario: Rapid taps leave at most one outgoing screen
- **WHEN** three phase changes are dispatched within 100ms
- **THEN** at no sampled moment does the stage hold more than one outgoing node, and the last phase is shown
- **proof:** e2e

#### Scenario: Reload mid-game shows no outgoing screen
- **WHEN** a game is reloaded mid-phase
- **THEN** from the first frame the stage holds only the incoming node
- **proof:** e2e

#### Scenario: Outgoing screen carries no demo target
- **WHEN** a demo step changes the phase and the stage is sampled during the transition
- **THEN** exactly one `[data-demo="expected"]` element exists, it lies inside the incoming node, and tapping it advances the demo
- **proof:** e2e

#### Scenario: Reduced motion phase change is instant
- **WHEN** `prefers-reduced-motion: reduce` is set and a phase change happens
- **THEN** on the next animation frame the stage holds one node and no finite animation is running
- **proof:** e2e

#### Scenario: Primary action dispatches during a transition
- **WHEN** a phase change happens and the incoming screen's primary button is tapped while the transition runs
- **THEN** the tap dispatches at once and the following phase is shown
- **proof:** e2e

#### Scenario: Undo transitions like any phase change
- **WHEN** Feud's "Rückgängig" steps back from the board to the choice with motion allowed
- **THEN** the board screen fades out and the choice screen rises in like any other phase change
- **proof:** e2e ("Scenario: Feud undo transitions like any phase change")

### Requirement: Pager
The shared `Pager` in `src/lib/ui` SHALL page a list that is loaded whole on the client: 6 items per page below
1024px viewport width and 12 from 1024px. While there is more than one page it SHALL show a navigation "Seiten" with
"Zurück", "Seite x von y" and "Weiter"; "Zurück" SHALL be disabled on the first page and "Weiter" on the last. With at
most one page of items no pager SHALL be shown. When the item count or the page size changes (a resize across 1024px),
a current page that would be empty SHALL clamp to the last page. A new page SHALL rise in, instantly under reduced
motion. Family Feud prep, Inhalte and "Gespeicherte Spieler" SHALL use it.

#### Scenario: Pager page count
- **WHEN** the page count is computed for 0, 6, 7, 12, 13, 26, 60, 91 and 247 items with 6 and with 12 per page
- **THEN** it is 1, 1, 2, 2, 3, 5, 10, 16, 42 with 6 per page and 1, 1, 1, 1, 2, 3, 5, 8, 21 with 12 per page
- **proof:** unit

#### Scenario: Pager hidden when one page holds everything
- **WHEN** an Inhalte list holds exactly 6 entries at 390px and exactly 12 at 1280px
- **THEN** all entries are listed and no "Seiten" navigation exists
- **proof:** e2e

#### Scenario: Pager navigates pages
- **WHEN** a list with several pages is on its first page, "Weiter" is tapped until the last page
- **THEN** "Zurück" is disabled on the first page, "Weiter" is disabled on the last, and the label counts "Seite x von y" along
- **proof:** e2e ("Scenario: Inhalte pages by width", "Scenario: Feud prep pages by width")

#### Scenario: Pager page clamps across 1024px
- **WHEN** the Codes Inhalte list of a fresh database is on page 10 of 16 at 390px and the viewport widens to 1280px
- **THEN** the pager reads "Seite 8 von 8"
- **proof:** e2e

#### Scenario: Pager page change is instant under reduced motion
- **WHEN** `prefers-reduced-motion: reduce` is set and "Weiter" is tapped on a paged list
- **THEN** on the next animation frame the new page is shown and no finite animation is running
- **proof:** e2e

#### Scenario: Feud prep keeps its paging
- **WHEN** the Feud prep pages, sorts and picks across pages through the shared Pager
- **THEN** it behaves as the Family Feud prep pages requirement says
- **proof:** e2e ("Scenario: Feud prep pages by width", "Scenario: Feud prep without pager for one page", "Scenario: Feud sort goes to page 1", "Scenario: Feud picks stay across pages")

### Requirement: In-game frame
Every in-game screen of every game, from the first handover to game over, SHALL use one frame: a stage card holding
exactly one hero and an action row at its bottom, and a rail (Scoreboard, order or teams) beside the stage card from
1024px viewport width, top-aligned with it, and below it on a phone. Feud's board and Duck's scoring SHALL sit in this
frame. Text and actions SHALL be left-aligned; only the hero is centred inside its card. The primary action SHALL lie
fully inside the first viewport at 390×844 and at 1280×800, except Duck's Wertung screen at 390×844, which MAY scroll to
its primary action and otherwise keeps the frame, the frame SHALL span at least 75% of the content width at
1280px, touch targets SHALL stay at least 44px, text contrast at least 4.5:1, and no screen SHALL scroll horizontally.

#### Scenario: Every in-game screen uses the stage and rail frame
- **WHEN** every phase screen of a game is rendered at 390×844 and at 1280×800
- **THEN** each holds one stage card with one hero and its action row as the card's last part, a rail right of the stage card and top-aligned at 1280px and below it at 390px, the primary action inside the first viewport, the frame at least 75% of the content width at 1280px, and every text outside the hero left-aligned
- **proof:** e2e ("Scenario: Imposter screens use the stage and rail frame", "Scenario: Wavelength screens use the stage and rail frame", "Scenario: Codes screens use the stage and rail frame", "Scenario: Duck screens use the stage and rail frame", "Scenario: Most Likely screens use the stage and rail frame", "Scenario: Feud screens use the stage and rail frame")

#### Scenario: Duck Wertung may scroll to its action on a phone
- **WHEN** Duck's Wertung screen is rendered at 390×844
- **THEN** its primary action may lie below the first viewport, and the screen still holds one hero, the action row as the stage card's last part, the rail below the stage card and no horizontal scroll; at 1280×800 the primary action lies inside the first viewport
- **proof:** e2e ("Scenario: Duck screens use the stage and rail frame")

#### Scenario: Frame keeps the look rules
- **WHEN** the look walk renders every in-game screen in the frame
- **THEN** touch targets are at least 44px, text contrast is at least 4.5:1, Press Start 2P stays on logo and scores, no screen scrolls horizontally at 390px and the desktop width is used
- **proof:** e2e ("Scenario: Touch targets are at least 44px", "Scenario: Text contrast meets 4.5:1", "Scenario: Press Start 2P stays limited to logo and scores", "Scenario: No horizontal scroll on phone", "Scenario: Desktop uses the width")

#### Scenario: In-game screens approved on screenshots
- **WHEN** Rue reviews the look-walk screenshots of every phase of every game at 390px and 1280px
- **THEN** Rue approves the stage and rail layout as one consistent frame that blends with Arcade-Abend
- **proof:** manual (visual judgement at Gate 2, on the verifier's screenshots)

### Requirement: Handoff
A shared `Handoff` SHALL render every pass-the-device moment inline in the stage card as its hero: Imposter handover,
Wavelength prep, Codes reveal intro, Most Likely To prompt and Feud choose and steal. It SHALL name the next player or
team as its heading on a band in the game colour, or in the team's own colour where a team has one (Family Feud), carry
`data-testid="handoff"`, and keep today's heading texts (for example "Gib das Handy an Bo"). Long names SHALL wrap. On
desktop the rail SHALL stay visible beside it. The band SHALL grow in from the left (`--ease-out`) and the name pop in
(`--ease-pop`), instantly under reduced motion.

#### Scenario: Every pass-the-device moment uses the Handoff
- **WHEN** each game reaches its pass-the-device moment
- **THEN** the stage card holds one `[data-testid="handoff"]` with the next player or team as heading on a band in the game or team colour, no fixed overlay exists, and at 1280px the rail is visible beside it
- **proof:** e2e ("Scenario: Imposter handover uses the Handoff", "Scenario: Wavelength prep uses the Handoff", "Scenario: Codes reveal intro uses the Handoff", "Scenario: Most Likely prompt uses the Handoff", "Scenario: Feud handoff in team colour")

#### Scenario: Handoff wraps a long name
- **WHEN** an Imposter player named "Maximiliane-Theodora von Hohenzollern" is next at 390px
- **THEN** the heading wraps inside the stage card and the page does not scroll horizontally
- **proof:** e2e

### Requirement: Reveal
Every reveal — Imposter crew question and unmask, Duck word, Codes word, Feud question and Wavelength target — SHALL go
from a covered card to a reveal card with the shared burst (`--dur-hero`) and a single 20° turn of the sunburst behind
it; both animations are finite and run once. HoldToView behaviour SHALL stay as it is. Under reduced motion the reveal
SHALL be instant.

#### Scenario: Every reveal uses the shared Reveal
- **WHEN** each reveal is triggered with motion allowed
- **THEN** a `[data-testid="reveal"]` card replaces the covered card, and every animation it runs is finite with one iteration and animates only transform or opacity
- **proof:** e2e ("Scenario: Imposter reveals use the Reveal", "Scenario: Wavelength target uses the Reveal", "Scenario: Codes word uses the Reveal", "Scenario: Duck word uses the Reveal", "Scenario: Feud question uses the Reveal")

#### Scenario: Hold-to-view unchanged inside reveals
- **WHEN** a held word or target is viewed through HoldToView
- **THEN** it is visible while held and hidden after release, as before
- **proof:** e2e ("Scenario: Hold-to-view reveals only while held", "Scenario: Codes word visible only while held")

### Requirement: Round outcome
Every round result in Wavelength, Codes, Most Likely To and Family Feud SHALL use a shared `Outcome`: a verdict heading
and `+N` in Press Start 2P (`data-testid="points"`) counting up to the final value; the `+N` chip pops in
(`--ease-pop`). Zero points SHALL show "+0" in a muted miss style. Most Likely To gains the count-up. Under reduced
motion the final number SHALL show at once. The one exception is the Family Feud sudden-death result, which banks no
points: it SHALL show the verdict without a `+N` line.

#### Scenario: Outcome counts up to +N
- **WHEN** a round result with N > 1 points is shown with motion allowed
- **THEN** the verdict heading is shown, `[data-testid="points"]` reads a value below "+N" while counting and ends at "+N"
- **proof:** e2e ("Scenario: Wavelength result uses the Outcome", "Scenario: Codes result uses the Outcome", "Scenario: Most Likely result counts up", "Scenario: Feud result uses the Outcome")

#### Scenario: Zero points show +0 as a miss
- **WHEN** a Wavelength turn scores 0 and a Codes round is skipped
- **THEN** each result shows "+0" in the miss style next to its verdict ("Kein Punkt.", "Übersprungen")
- **proof:** e2e ("Scenario: Wavelength miss shows +0", "Scenario: Codes skipped round result")

#### Scenario: Feud sudden-death result shows no points
- **WHEN** a Family Feud tiebreak question is decided
- **THEN** the verdict reads "Stichfrage entschieden" and no `[data-testid="points"]` is rendered
- **proof:** e2e ("Scenario: Feud tiebreak survey is recorded")

### Requirement: Scoreboard reorder
The Scoreboard SHALL sort its rows by score, ties in the given order, and when ranks change between the scores before
and after a result its rows SHALL move to their new places by transform (FLIP, `--dur-in`) and end in sorted order; with
no rank change no row moves. The row of the team or player whose turn it is SHALL carry a marker in the game colour.

#### Scenario: Scoreboard order is stable
- **WHEN** the Scoreboard order is computed for rows with ties, and the before/after orders are compared for scores that change no rank
- **THEN** tied rows keep their given order, and no row is reported as moving
- **proof:** unit

#### Scenario: Scoreboard rows move when ranks change
- **WHEN** a Codes round result lets the second team overtake the first
- **THEN** at least one Scoreboard row runs a transform animation and the rows end in score order
- **proof:** e2e

#### Scenario: Scoreboard marks the acting team
- **WHEN** a Codes round is in Spiel
- **THEN** exactly one Scoreboard row, the active team's, carries the acting marker in `--codes`
- **proof:** e2e

### Requirement: Game over
Every game over except Imposter's (Wavelength, Codes, What Rhymes with Duck, Most Likely To, Family Feud) SHALL show the
winner reveal as the stage hero with the game's replay control in the action row where the game has one ("Nochmal
spielen", Duck "Neue Runde"; Family Feud has none), and exactly one final Scoreboard in the rail. A tie for first SHALL
use the shared "Unentschieden" wording naming every tied winner; Wavelength Koop shows its total and rating as the
hero. The winner moment SHALL burst 10–14 decoration pieces in the game colour and gold once (finite, `aria-hidden`, no
pointer events); under reduced motion no pieces SHALL exist.

#### Scenario: Game over shows the winner in the stage and one Scoreboard in the rail
- **WHEN** each of the five games reaches game over at 390px and at 1280px
- **THEN** the stage card holds the winner reveal and the replay control where the game has one, and the page holds exactly one Scoreboard, inside the rail
- **proof:** e2e ("Scenario: Wavelength game over uses the winner frame", "Scenario: Codes game over uses the winner frame", "Scenario: Duck game over uses the winner frame", "Scenario: Most Likely game over uses the winner frame", "Scenario: Feud game over uses the winner frame")

#### Scenario: Winner burst flies once
- **WHEN** a Wavelength Versus game ends with motion allowed
- **THEN** between 10 and 14 winner pieces exist, each `aria-hidden` with `pointer-events: none`, each running one finite animation on transform or opacity, and a tap on "Nochmal spielen" reaches the button
- **proof:** e2e

#### Scenario: Winner burst off under reduced motion
- **WHEN** `prefers-reduced-motion: reduce` is set and a Wavelength Versus game ends
- **THEN** no winner pieces exist and no finite animation is running
- **proof:** e2e

#### Scenario: Tie for first keeps the shared wording
- **WHEN** a game ends with two teams or players sharing the top score
- **THEN** game over shows "Unentschieden" with both names
- **proof:** e2e ("Scenario: Tie for first shown as tie", "Scenario: Codes tie shown as Unentschieden", "Scenario: Duck tie at the top reads Unentschieden", "Scenario: Most Likely tie at the top reads Unentschieden")

### Requirement: Fault motion
Codes "Daneben" and the loss of a Duck letter SHALL play Feud's fault motion from one shared helper: a short shake of the
stage (about 360ms) and a stamp (about 800ms), transform/opacity only, none under reduced motion. Feud's strike SHALL use
the same helper.

#### Scenario: Codes Daneben plays the fault motion
- **WHEN** "Daneben" is tapped in a Codes round with motion allowed
- **THEN** the stage runs a translateX shake and a stamp runs a scale/opacity animation, both finite
- **proof:** e2e

#### Scenario: Duck letter loss plays the fault motion
- **WHEN** a Duck player's letter is crossed out in Wertung with motion allowed
- **THEN** the player's card runs a translateX shake and a stamp runs a scale/opacity animation, both finite
- **proof:** e2e

#### Scenario: Feud strike keeps its motion
- **WHEN** a Feud strike is given with motion allowed
- **THEN** the board shakes and the X stamp shows, transform and opacity only
- **proof:** e2e ("Scenario: Feud motion uses transform and opacity only")
