## Why

Rue hosts Family Feud on one device. During prep she can't see survey answers without expanding each one, the list
is a long single column, and the rounds picker stacks vertically. During a round the question is readable before she
reads it aloud, the starting team is fixed by round parity instead of whoever buzzed first, and fault/undo buttons
don't read as what they are.

Appetite: one session. Exceeding it means renegotiating scope.

## What Changes

- Feud setup: the rounds picker lays its 8 options out in one horizontal row, wrapping on a phone (S1).
- **BREAKING** Every round starts with the question covered by "Frage aufdecken"; tiles, "Nicht auf der Tafel" and the
  team choice stay disabled until it is tapped. The hold-to-peek corner stays available before the reveal (S2).
- **BREAKING** After the reveal the host taps the team that buzzed first; that team answers first in the face-off.
  This replaces "team round mod 2 answers first". Both new steps are undoable and part of the demo script. Saved
  sessions of the old shape are discarded with the existing notice (`stateVersion` 2) (S2, S3).
- "Fehler" and "Nicht auf der Tafel" become red (danger) buttons with an orange (warning) square icon-only
  "Rückgängig" directly to their right. The shared Button gains `danger`, `warning` and an icon-square form (S4).
- Feud prep: every survey is a card showing the question and all answers with points; "Gespielt mit" collapses per
  card; the list is a card grid (1 column on phone, 2–3 on desktop) paged at 6 / 12 cards with Zurück/Weiter and
  "Seite x von y" (S5–S8).

## Capabilities

### New Capabilities

none

### Modified Capabilities

- `feud`: rounds picker layout (teams and rounds), host prep as a paged card grid, question reveal, buzzer team per
  face-off, undo covering both new steps and the new correction controls, demo script with reveal and buzz steps
  (S1–S8).
- `design-system`: the shared Button offers `danger` and `warning` variants and an icon-only square form (S4).

## Non-Goals

- Hiding the Demo button during rounds, red "Spiel beenden" with confirm across all games — split off to
  `arcade-polish`.
- Pagination for other games' content and the shared Inhalte page — `arcade-polish`.
- General redesign after "Los geht's", missing transitions/animations, Mobbin research — `arcade-polish` (S4's button
  variants are added to the shared Button so arcade-polish reuses them).
- Tracking "played" per team instead of per player — the per-player model stays.
- A real buzzer (device input) — the host taps the team.

## Done criteria

- [ ] Prep on phone and desktop: grid of cards with answers + points, pager appears with >6 / >12 surveys,
      "Gespielt mit" expands per card, rounds picker is one row.
- [ ] A round: question hidden until tapped, then team choice, then the chosen team answers first; Fehler / Nicht auf
      der Tafel are red with an orange square undo next to them.
- [ ] `npm run proof:full` green.

## Impact

- Engine: `src/lib/games/feud/engine.ts` (+ `engine.test.ts`) — new state fields and actions, `stateVersion` 2.
- Screens: `src/lib/games/feud/Screen.svelte`, `Setup.svelte`, `Prep.svelte`, `prep.ts` (+ `prep.test.ts`).
- Demo: `src/lib/games/feud/demo.ts` (+ `demo.test.ts`).
- Shared UI: `src/lib/ui/Button.svelte` (additive variants; existing callers unchanged).
- e2e: `e2e/helpers.ts`, `e2e/feud*.test.ts`, `e2e/walks/feud.ts`, new `e2e/feud-prep-cards.test.ts`,
  `e2e/feud-prep-pages.test.ts`, `e2e/feud-round.test.ts`, `e2e/feud-controls.test.ts`.
- Data: none. Feud sessions saved by the old version are discarded once with the existing notice (R1, accepted).
