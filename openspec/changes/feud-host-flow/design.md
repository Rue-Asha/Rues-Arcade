## Context

Family Feud ships (change `family-feud`, demo revised in `revise-demos-most-likely`). The host flow has three rough
spots Rue named at Gate 0: prep (answers hidden behind "Öffnen", one long column, vertical rounds picker), the round
start (question readable at once, opener fixed by `round % 2`), and the correction controls (plain secondary/primary
buttons). One game, no schema change. Scope: `scope.md` (S1–S8); motivation and non-goals: `proposal.md`.

## Goals / Non-Goals

**Goals:** S1–S8 as specified in `specs/feud` and `specs/design-system`, with each unit green on `proof:full`.

**Non-Goals:** everything listed under Non-Goals in `proposal.md` (arcade-polish items, per-team history, a real
buzzer).

## Decisions

- **Buzzer team chosen every round, not only round 1** — Rue: each face-off has its own buzz. The choice is per
  round: when both named players miss and the next pair is named, the chosen team stays first (no second buzz).
- **Question reveal comes before the buzzer choice and gates the board** — matches the archive's "Frage aufdecken"
  (questionRevealed disabled tiles and "Falsch" until revealed) and the real order: read aloud, buzz, answer.
- **Cards show answers with points uncollapsed; only "Gespielt mit" collapses** — Rue writes questions + answers on
  paper during prep.
- **Page size by width (6 / 12), sort resets to page 1** — Rue. The width switch is `(min-width: 1024px)`, the
  breakpoint `app.css` already uses for desktop layouts.
- **"Nicht auf der Tafel" gets the same red + orange-undo treatment as "Fehler"** — Rue ("dasselbe gilt"). Only
  the undo next to these actions becomes the square; the undo on the Spielen/Passen and steal handoffs and on the
  result stays a text button.
- **Reveal and buzz are engine state, not Screen state.** Two fields and two actions in the reducer instead of a
  local `$state` in Screen: undo already is the reducer's snapshot stack, the demo can only script reducer actions,
  and a reload mid-round must keep the question covered/uncovered. Cost: `stateVersion` 2 (R1, accepted). The
  alternative — a Screen-local flag — would have needed a second undo path and couldn't be scripted.
- **Danger and warning reuse existing tokens** (`--imposter`, `--duck` and their ledges, ink text — both pairs are
  already in the contrast list). No new tokens; arcade-polish restyles the variants, the names stay (R2).
- **No new phase.** The face-off phase stays `faceoff`; `asked`/`first` gate it. Adding phases `question`/`buzz`
  would ripple through Stage remounts, handoff logic and `acting`.
- **Unreachable edge dropped:** S8's "empty list → existing empty state" can't occur in prep (setup blocks "Weiter"
  below rounds + 1 surveys) and prep has no empty state; it gets no scenario. "Current page becomes empty" is proven
  on the pure page function (surveys are fixed while prep is open).

## Contracts

**Engine (U3 only, listed because demo, Screen and tests all read it).** `src/lib/games/feud/engine.ts`:

```ts
interface FeudState { …; asked: boolean; first: number | null }   // both reset by init and fresh()
type FeudAction = … | { type: 'ask' } | { type: 'buzz'; team: number };
opener(s): number   // s.first ?? 0 — meaningful only once s.first !== null; signature unchanged so Screen typechecks
stateVersion: 2
```

`ask`: only in `faceoff` with `!asked`. `buzz`: only in `faceoff` with `asked`, `first === null`, `answers.length ===
0`, team 0 or 1. `answer`: only with `asked && first !== null`. Both new actions go through `reduce`'s snapshot path,
so `snapshot()` must copy `asked` and `first`. Anything else returns the same state object.

**Demo highlighting (U3).** On a `buzz` step only the scripted team's Button carries `action="buzz"`; the other
carries `action="buzz-other"` (never expected), same pattern as `missing` for "Nicht auf der Tafel". The reveal
Button carries `action="ask"`. The script keeps today's openers (A, B, A, sudden death B) so scores and the tie are
unchanged; its length grows by 8 steps (39), so the demo e2e tests need `test.setTimeout` from the step count.

**Button (U3).** `src/lib/ui/Button.svelte` props become:

```ts
variant: 'primary' | 'secondary' | 'ghost' | 'danger' | 'warning';
square?: boolean;   // width = height of the size, padding 0, children = an SVG icon
label?: string;     // aria-label; required in practice when square
```

Existing callers are untouched.

**Prep DOM (U2 produces, U1's helpers and U3's flows consume).**
- List cards: `ul[aria-label="Alle Umfragen"] > li[data-survey="<id>"]`, each with a button named exactly "Wählen"
  ("Gewählt" and disabled when picked). Only list cards carry `data-survey`; slot cards in
  `ol[aria-label="Gewählte Umfragen"]` carry `data-slot="<index>"` and keep the "Entfernen" button.
- Pager: `nav[aria-label="Seiten"]` with buttons named exactly "Zurück" and "Weiter" and the text "Seite x von y";
  absent with one page. "Zurück" disabled on page 1, "Weiter" on the last.
- "Gespielt mit": a button named "Gespielt mit" with `aria-expanded` per card; the expanded section keeps the group
  `aria-label="Spielerliste"`.
- `prep.ts`: `pageCount(total: number, size: number): number` (≥ 1) and `clampPage(page: number, total: number,
  size: number): number` (0-based), next to the existing `rows`/`sortRows`/`fill`/`drawTiebreak`.

**e2e helpers (U1 produces, U2 and U3 use).** In `e2e/helpers.ts`:

```ts
surveyCard(page: Page, id: number): Promise<Locator>  // to page 1 via nav "Seiten" Zurück, then Weiter until [data-survey=id] exists
chooseSurveys(page: Page, ids: number[]): Promise<void>  // surveyCard + "Wählen" for each, in order
```

Both work with and without the pager, so U1 is green on today's prep and U2/U3 are green on either side of the
wave-2 merge. U3 adds `openFaceoff(page, team = 'Team A')` (taps "Frage aufdecken", then the team button) to the
same file; U2 doesn't edit `helpers.ts`.

**Shared test files and their owners.** U1: `helpers.ts` (wave 1), then U3. `feud.test.ts`, `feud-history.test.ts`,
`walks/feud.ts`: U1 (wave 1, only `begin()`/survey picking), then U3. `feud-prep.test.ts`, `feud-setup.test.ts`: U2.
`feud-demo.test.ts`: U3. New files get one owner each (see tasks).

## Risks / Trade-offs

- [R1 stateVersion bump drops a session saved mid-game by the old version] → accepted: existing mechanism, sessions
  are short.
- [R2 Button variants added here could clash with arcade-polish's redesign] → accepted: arcade-polish restyles the
  variants, the names stay.
- [Pager-aware helper written before the pager exists] → the DOM contract above is exact; the wave-2 merge runs
  `proof:full`, which is the first run with both sides.
- [Look walk shots change (covered question, buzz, prep cards)] → U3 adds shots of the covered question and the team
  choice; Rue judges them at Gate 2 under the existing "Feud screens approved on screenshots" scenario.
