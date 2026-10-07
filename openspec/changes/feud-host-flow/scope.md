# Scope: feud-host-flow

Triage: feature — Feud host flow: buzzer team per face-off, hidden question, fault/undo buttons, prep survey cards with answers + pagination, rounds picker layout. 8 S-items, one game, no schema. Appetite: one session.

## Problem
Rue hosts Family Feud on one device. During prep she can't see survey answers without expanding each one, the list is a long single column, and the rounds picker stacks vertically. During a round the question is readable before she reads it aloud, the starting team is fixed by round parity instead of whoever buzzed first, and fault/undo buttons don't read as what they are.

## Flows
- Prep: Los geht's → teams → prep: browse survey cards (paged grid), see answers + points on each card, expand "Gespielt mit" when needed, pick N surveys → start.
- Round: question hidden → host reads it aloud from her notes → taps "Frage aufdecken" → players buzz → host taps the team that buzzed first → face-off (that team answers first) → choose (Spielen/Passen) → board → steal → result → next round (hidden again).

## In scope
- **S1** The rounds picker in Feud setup lays its options out in one horizontal row (wrapping when it doesn't fit), at 390px and 1280px.
  - edges: 8 options on phone → wrap to a second row, no horizontal page scroll.
- **S2** At the start of every round the question is covered by a "Frage aufdecken" control; tapping it shows the question. Until revealed, tiles, "Fehler", "nicht auf der Tafel" and the buzzer-team choice are disabled. It stays revealed for the rest of the round and is covered again in the next round.
  - edges: undo right after reveal → covered again; the hold-to-peek corner (question + answers) stays available to the host before reveal (that's her cheat sheet); demo mode reveals via a scripted step.
- **S3** After reveal, each face-off starts with the host choosing which team buzzed first (two team buttons, team names + colours). That team answers first in the face-off; everything after (face-off winner, Spielen/Passen, board, steal) runs automatically as today. Replaces "team round mod 2 answers first".
  - edges: undo after choosing → back to the choice; every round asks again (incl. round 1); the demo script includes the choice.
- **S4** "Fehler" (board) and "nicht auf der Tafel" (face-off and steal) are red (danger). Their "Rückgängig" is an orange (warning) square icon-only button (↶ arrow, aria-label "Rückgängig") directly to the right, same height, narrower than the action.
  - edges: undo unavailable → the square button shows disabled, layout doesn't shift; phone 390px: action + square fit one row.
- **S5** Every survey card in prep (the full list and the picked slots) shows the question plus all answers with points, compactly, without expanding.
  - edges: survey with 8 answers → card stays readable (two-column answer list on wide cards is fine); long question → wraps.
- **S6** Each card has a collapsible "Gespielt mit" section (collapsed by default) holding the per-player played list with add/remove as today and the existing badges ("k von n kennen sie", "neu", "alle kennen sie") stay visible on the card.
  - edges: nobody played it → section shows "noch niemand"; expanded state is per card and not persisted.
- **S7** The survey list in prep is a card grid: 1 column on phone, 2–3 columns on desktop (≥1280 fills the width).
  - edges: picking or unpicking a card doesn't reflow the page position of other cards.
- **S8** The survey list is paged: 6 cards per page on phone, 12 on desktop, with Zurück/Weiter and "Seite x von y". Changing sort jumps to page 1.
  - edges: ≤ one page of surveys → no pager; current page becomes empty (e.g. after content change) → clamp to last page; picked surveys on other pages stay picked; empty list → existing empty state.

## Non-goals
- Hiding the Demo button during rounds, red "Spiel beenden" with confirm across all games — split off to `arcade-polish`.
- Pagination for other games' content and the shared Inhalte page — `arcade-polish`.
- General redesign after "Los geht's", missing transitions/animations, Mobbin research — `arcade-polish` (S4's button variants are added to the shared Button so arcade-polish reuses them).
- Tracking "played" per team instead of per player — the per-player model stays.
- A real buzzer (device input) — the host taps the team.

## Codebase touchpoints
- `src/lib/games/feud/Setup.svelte:83-92` — `.seg` has no rule in this file, `.opt` is display:grid → vertical stack (explorer: rounds picker).
- `src/lib/games/feud/Prep.svelte`, `prep.ts`, `prep.test.ts` — list → paged card grid, answers on card, collapsible played section (explorer: survey list).
- `src/lib/games/feud/engine.ts` — `opener(s) = s.round % 2` (:84-86) used by `due()`/`answer()`; add reveal + buzzer-team actions, bump `stateVersion`; undo is a snapshot stack (`past`, `reduce` :247) (explorer: round flow).
- `src/lib/games/feud/Screen.svelte` — question card (:216), peek (:161-174), buttons (:175-177, :291, :300, :309).
- `src/lib/ui/Button.svelte` — only primary/secondary/ghost today; add `danger` and `warning` variants and an icon-square form.
- `src/lib/games/feud/demo.ts`, `demo.test.ts`, `engine.test.ts` — script steps and tests for reveal + buzzer choice.
- `openspec/specs/feud/spec.md` — face-off (:224), prep (:83-150), undo (:362), demo (:422); `openspec/specs/design-system/spec.md` for the Button variants.

## Risks
- R1 stateVersion bump drops a session saved mid-game by the old version → accepted: existing mechanism, sessions are short.
- R2 Button variants added here could clash with arcade-polish's redesign → accepted: arcade-polish restyles the variants, the names stay.

## Decisions
- Buzzer team chosen every round, not only round 1 — Rue: each face-off has its own buzz.
- Question reveal comes before the buzzer choice and gates the board — matches the archive's "Frage aufdecken" (questionRevealed disabled tiles and "Falsch" until revealed) and the real order: read aloud, buzz, answer.
- Cards show answers with points uncollapsed; only "Gespielt mit" collapses — Rue writes questions + answers on paper during prep.
- Page size by width (6 / 12), sort resets to page 1 — Rue.
- "nicht auf der Tafel" gets the same red + orange-undo treatment as "Fehler" — Rue ("dasselbe gilt").

## Done when
- Prep on phone and desktop: grid of cards with answers + points, pager appears with >6 / >12 surveys, "Gespielt mit" expands per card, rounds picker is one row.
- A round: question hidden until tapped, then team choice, then the chosen team answers first; Fehler / nicht auf der Tafel are red with an orange square undo next to them.
- `npm run proof:full` green.

## Split off
- `arcade-polish` (already created): end-game confirm instead of Demo during rounds (all games), pagination for all content lists, redesign after "Los geht's" with Mobbin, transitions/animations.
- Face-off, both named players miss → the chosen team stays first for the next pair, no new buzz — planner addition, Rue approved at Gate 1.
- S8 edge "empty list" dropped: setup blocks Weiter below rounds + 1 surveys, prep never shows an empty list — planner addition, Rue approved at Gate 1.
