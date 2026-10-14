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

**Goals:** scope.md S1–S38 in one change, in 11 units over 4 waves (Gate 2 revisions S39–S49: U12–U16 in 2 waves): generic contract first, rules as pure tested code,
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
- [State shape grows while U7–U10 build] → the contract above is fixed at U2; a needed change is a deviation reported
  by the unit and merged by the orchestrator, `stateVersion` stays 1 until the change ships.

## Migration Plan

None: no schema, migration, API or dependency change. Existing sessions of the six games keep their shape; BotC starts
at `stateVersion` 1.
