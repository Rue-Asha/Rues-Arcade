## Context

The play route (`src/routes/spiele/[slug]/spielen/+page.svelte`) draws a header with "Läuft", the game name, a Demo
button and a `secondary` "Spiel beenden"; its Modal's "Beenden" is `primary`. `Stage.svelte` is `{#key}` + `in:rise`, so
the old screen vanishes. The demo route duplicates that header. Each of the six `Screen.svelte` files builds its own
round label, handover, result, scoreboard and game over (research.md → Current weaknesses), Feud's `Handoff.svelte` is a
fixed overlay moved to `<body>`, and Feud prep owns the only pager (`prep.ts` `pageCount`/`clampPage`/`pageItems`).
Inhalte shows 50 entries (30 survey cards) and "Mehr anzeigen"; "Gespeicherte Spieler" lists everyone. Motion lives in
`src/lib/motion.ts` (`rise`, `countUp`, `pulse`) with `--ease-out`/`--dur` in `app.css`; `reducedMotion()` gates the JS
transitions that exist today. Archive rules are canonical: nothing here changes a reducer.

## Goals / Non-Goals

**Goals:** scope.md S1–S16 — header without Demo with round status, one Pager, phase out/in motion, one in-game
frame with shared Handoff / Reveal / Outcome / Scoreboard / Winner, motion tokens.

**Non-Goals:** see proposal.md → Non-Goals (server paging, roster paging, Imposter game over, podium, horizontal
slides, redesign before "Los geht's", new colours/fonts, rule changes, sound for the new motion).

## Decisions

- **Round status is data on the registry entry.** `GameEntry.status(state)` returns `{ parts, progress }`; the header
  joins the parts with " · " as separate `<span>`s inside one `<p>`, so both `getByText('Runde 1 / 5', { exact })` and
  `getByText('Runde 1 / 1 · Zug 1 / 2', { exact })` keep matching. U1 writes all six functions (pure, no UI); U3 renders
  them and, in the same unit, deletes the six in-Screen round labels, so no wave ends with the text twice on screen.
  Alternative: each game unit adds its own status — leaves the header empty for two waves and the frame untestable.
- **Duck's status is "Ziel T Punkte" with progress = leading score / target, clamped to 1** (Rue at Gate 1). Duck has
  no round count; its target is the one fixed number, and the leader's distance to it is the game's progress.
- **The demo header shows the status too** (Rue accepted at Gate 1). The demo route uses the same `PlayHeader` with label "Demo" and no "Spiel
  beenden"; otherwise removing Imposter's rail label would drop the round from the demo (`e2e/demo.test.ts:50`).
- **Stage keeps the outgoing node in the same grid cell.** `{#key}` with `in:rise` (delay 60ms) and `out:phaseOut`;
  host is `display: grid` and both children sit in `grid-area: 1 / 1`. Stage marks the outgoing node at outro start
  (`inert`, `aria-hidden`, `data-leaving`, removes every `data-demo`) and drops any earlier outgoing node when a new
  change starts. Vertical only (Non-Goals).
- **Shared in-game pieces are new files in `src/lib/ui`** (`GameFrame`, `Handoff`, `Reveal`, `Outcome`, `Winner`) plus a
  backward-compatible `Scoreboard`; Screens compose them. Feud's `Handoff.svelte` goes when U10 moves Feud over.
- **Scoreboard sorts itself and plays FLIP from `before`.** Stage remounts the Screen per phase, so a mounted Scoreboard
  never sees a score change. Rows carry `before`; the board renders the `before` order, then on the next frame the
  score order with `animate:flip` (`--dur-in`). Reduced motion renders the final order directly. Sorting is stable, so
  today's pre-sorted callers keep their order.
- **Pager arithmetic moves to `src/lib/ui/pager.ts`.** `feud/prep.ts` re-exports `pageCount`, `clampPage`, `pageItems` so
  `prep.test.ts` stays as it is. Consumers wrap the shown slice in `{#key page}` with `in:rise` for the page motion.
- **Frame checks are one helper, called per game.** `expectFrame(page)` in `e2e/helpers.ts` (U3) checks the stage card,
  hero, action row, rail position, first-viewport primary action, desktop reach and alignment for the current screen;
  each game unit calls it in its own "<Game> screens use the stage and rail frame" test. No cross-game check joins
  `look.test.ts`, which would turn red for games not yet moved.
- **Imposter and Wavelength walks move out of `look.test.ts`** into `e2e/walks/imposter.ts` and `e2e/walks/wavelength.ts`
  (U3, no behaviour change), so every game unit owns exactly its walk file.
- **Motion values** from research.md: tokens `--ease-in: cubic-bezier(0.5, 0, 0.75, 0)`, `--ease-pop: cubic-bezier(0.34,
  1.56, 0.64, 1)`, `--dur-out: 0.18s`, `--dur-in: 0.42s`, `--dur-hero: 0.56s`; phase-out 180ms y −8px; handoff band scaleX
  320ms `--ease-out`, name pop 300ms `--ease-pop`; reveal burst 560ms + one 20° sunburst turn over 1.2s; `+N` chip pop
  300ms; Scoreboard FLIP 400ms; fault = Feud shake 360ms + stamp 800ms; winner = 12 pieces, 900ms, 30ms stagger.
- **Feud's steal Handoff keeps its local "Weiter"** inline; the demo still skips it (feud delta).

## Contracts

Shared between units; the owner is the unit that creates it.

**Status (U1)** — `src/lib/games/registry.ts`, implemented in each `src/lib/games/<g>/index.ts`:
```ts
export interface Status {
	parts: string[];          // joined with " · " by the header
	progress: number | null;  // 0..1; null = no progress line (Imposter); Duck = min(1, max(scores) / target)
}
export interface GameEntry { /* …existing… */ status(state: any): Status }
```
Formats: game-engine delta → "Round status in the play header".

**Motion (U1)** — `src/lib/ui/tokens.ts` gains `export const motion = { 'ease-in', 'ease-pop', 'ease-out', 'dur-out': 180,
'dur-in': 420, 'dur-hero': 560 }` (strings for easings, ms for durations), mirrored by `app.css` `:root`
(`--dur-*` in seconds). `src/lib/motion.ts`, every function a no-op / duration 0 under `reducedMotion()`:
```ts
export function rise(node: Element, o?: { delay?: number; y?: number }): TransitionConfig;  // dur-in, ease-out
export function phaseOut(node: Element): TransitionConfig;   // dur-out, ease-in, opacity 1→0, translateY 0→-8px
export function pop(node: Element, o?: { delay?: number }): TransitionConfig;  // scale .92→1, 300ms, ease-pop
export function band(node: Element): TransitionConfig;       // scaleX 0→1 from the left, 320ms, ease-out
export function burst(node: HTMLElement): void;              // existing reveal burst, dur-hero
export function turn(node: HTMLElement): void;               // one 20° rotate over 1200ms, iterations 1
export function fault(shake?: HTMLElement, stamp?: HTMLElement): void;  // Feud's shake 360ms + stamp 800ms
export function scatter(pieces: HTMLElement[]): void;        // winner pieces fly out once, 900ms, 30ms stagger
// countUp, pulse, reducedMotion, ease: unchanged
```

**Pager (U2)** — `src/lib/ui/pager.ts`:
```ts
export const PAGE = { narrow: 6, wide: 12, query: '(min-width: 1024px)' } as const;
export function pageCount(total: number, size: number): number;            // ≥ 1
export function clampPage(page: number, total: number, size: number): number;  // 0-based
export function pageItems<T>(list: T[], page: number, size: number): T[];
export function pageOf(index: number, size: number): number;               // page holding item `index`
```
`src/lib/ui/Pager.svelte`: props `{ page: number ($bindable, 0-based, clamped by the parent); total: number; size: number }`;
renders `<nav aria-label="Seiten">` with Buttons "Zurück" / "Weiter" (`size="sm"`, ≥ 44px) and `Seite x von y` only when
`pageCount(total, size) > 1`.

**Stage and header DOM (U3)** — tests and Screens rely on:
```html
<header class="bar"> … <p data-testid="status"><span>Runde 2 / 5</span> · <span>Team 1 / 2</span></p>
  <div data-testid="progress" style="--p: 0.4"></div> … "Spiel beenden" (danger) </header>
<div data-stage-host>                                  <!-- display: grid -->
  <div data-stage>incoming / current</div>
  <div data-stage data-leaving inert aria-hidden="true">outgoing, no [data-demo]</div>
</div>
```
`src/lib/ui/PlayHeader.svelte`: props `{ name: string; label: string; status: Status | null; onend?: () => void }`
("Spiel beenden" only when `onend` is given). `e2e/helpers.ts` gains `live(page): Locator`
(`[data-stage]:not([data-leaving])`), `expectFrame(page): Promise<void>` (checks per design-system "In-game frame",
reading the DOM below) and `expectInstant(page): Promise<void>` (next frame: one `[data-stage]`, no running finite
animation). `shot()` and look.test's `settle()` wait for every finite animation in `[data-stage]`, `[data-piece]` and
`[data-testid="points"]` count-ups.

**Frame DOM (U4)** — `src/lib/ui/GameFrame.svelte`, props `{ hero: Snippet; children?: Snippet; actions?: Snippet;
rail?: Snippet }`:
```html
<div class="frame" data-frame>
  <section data-frame="stage"> <div data-hero>…centred…</div> …children, left-aligned…
    <div data-frame="actions">…primary first…</div> </section>
  <aside data-frame="rail">…</aside>                   <!-- beside from 1024px, below on phone -->
</div>
```
**Components (U4)** — all in `src/lib/ui`, each usable as the `hero`:
```ts
Handoff  { heading: string; label?: string; note?: string; colour?: string }  // data-testid="handoff"; colour = token name, default the game colour (--c)
Reveal   { shown: boolean; covered: Snippet; children: Snippet }              // [data-testid="covered"] | [data-testid="reveal"], burst + turn when shown
Outcome  { verdict: string; points: number }                                  // h2[data-testid="verdict"], p.data[data-testid="points"] "+N", .miss when 0
Winner   { names: string[]; label?: string; note?: string; colour?: string }  // one name → name, several → "Unentschieden" + names; 12 [data-piece], none under reduced motion
Scoreboard { rows: ScoreRow[]; detail?: Snippet<[ScoreRow]> }                 // section[aria-label="Punktestand"], row[data-acting] marker in --c
interface ScoreRow { name: string; score: number; before?: number; lead?: boolean; acting?: boolean }
```
`src/lib/ui/scoreboard.ts`: `ranked<T extends { score: number }>(rows: T[], by?: (r: T) => number): T[]` (stable, descending)
and `moved(before: string[], after: string[]): string[]` (names whose index changed).

**Test file owners** — each game unit owns its `Screen.svelte`, its e2e files and its walk:
U5 `e2e/imposter.test.ts`, `walks/imposter.ts`; U6 `e2e/wavelength.test.ts`, `walks/wavelength.ts`; U7 `e2e/codes.test.ts`,
`walks/codes.ts`; U8 `e2e/duck.test.ts`, `walks/duck.ts`; U9 `e2e/most-likely.test.ts`, `walks/most-likely.ts`; U10
`e2e/feud.test.ts`, `feud-round`, `feud-controls`, `feud-demo`, `feud-history`, `walks/feud.ts`. Earlier waves touch these
only where stated in tasks.md (U2 one loop in `feud.test.ts`; U3 the walk extraction and, if `proof:full` shows the need,
locator scoping to `live(page)`).

## Risks / Trade-offs

- [Outgoing node duplicates text, roles and `data-demo` for ~180ms] → `inert` + `aria-hidden` + `data-demo` stripped at
  outro start; `getByText` still sees it, so U3 scopes failing locators to `live(page)` and runs `proof:full`.
- [The global reduced-motion CSS rule doesn't cover WAAPI or Svelte JS transitions] → every helper gates on
  `reducedMotion()`; unit test over all helpers plus a per-game reduced-motion e2e.
- [Inline Handoff or a narrow centred card fails desktop reach] → the rail stays beside the stage; `expectFrame` checks
  ≥ 75% width.
- [Large e2e churn from moved labels, handover and game-over markup] → headings, testids and button names stay; each
  game's tests belong to the unit that moves that game.
- [Finite sunburst / winner motion adds ~1s per screenshot wait; phase overlap adds ~0.5s per step] → `shot()`/`settle()`
  wait for finite animations; long demo tap-throughs keep step-based `test.setTimeout`.
- [Removing Feud's overlay touches feud scenarios] → feud delta spec.
- [Scoreboard FLIP from `before` relies on each Screen passing pre-result scores] → Screens derive them from state
  (`lastScore`, `lastResult`, `lastPoints`, `gain`, `baseScores`); no reducer change.

## Migration Plan

None: no schema, storage or API change. Saved sessions keep their shape; the header reads them through `status`.
