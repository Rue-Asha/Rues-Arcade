## Why

Hosts running a game on the shared device see a Demo button they can't use mid-game, scroll long content lists with
"Mehr anzeigen", and get six games that each lay out rounds, handovers, results and game over differently, with an
empty lower half on desktop and screens that vanish instead of transitioning.

Appetite: 2–3 sessions. Exceeding it means renegotiating scope.

## What Changes

- **BREAKING** The play header loses its Demo control; Demo is reachable only from the start screen's Demo card. "Spiel
  beenden" becomes the red `danger` Button with its full label, and the confirm Modal's "Beenden" is `danger` too (S1).
- The play header shows the game's round status from a per-game `status(state)` in Sora, with a thin progress line in
  the game colour; no Screen renders its own round label any more. The demo header shows the same status (S2).
- A shared `Pager` (Zurück / "Seite x von y" / Weiter, 6 per page below 1024px, 12 from 1024px, hidden when one page
  holds everything) lifted from Feud prep; Feud prep uses it unchanged (S3).
- **BREAKING** Inhalte lists every content type, Feud survey cards included, newest first through the Pager instead
  of "Mehr anzeigen" (S4). Spieler → "Gespeicherte Spieler" pages through the Pager, alphabetical across pages; the
  roster stays unpaged (S5).
- Every phase change fades and lifts the outgoing screen out (≤200ms) while the incoming one rises in, overlapping; the
  outgoing node is `inert`, `aria-hidden` and has no `data-demo`. Under reduced motion it is instant. Motion never
  blocks input (S6–S8).
- Every in-game screen of every game uses one frame: a stage card with one centred hero and an action row at its
  bottom, and a rail (Scoreboard, order or teams) beside it from 1024px, below it on phone; text and actions
  left-aligned. Feud and Duck scoring move into it (S9).
- Shared in-game components the Screens compose: `Handoff` inline in the stage for every pass-the-device moment
  (replacing Feud's fixed overlay) (S10), covered → reveal card with burst and one sunburst turn (S11), `Outcome` with
  verdict and a counting `+N` (Most Likely gains the count-up) (S12), Scoreboard rows that reorder by FLIP with an
  acting-team marker (S13), a winner reveal with a one-time deco-piece burst and exactly one final Scoreboard in the
  rail at every game over except Imposter (S14).
- Codes "Daneben" and Duck letter loss reuse Feud's fault motion (shake + stamp) (S15).
- Motion tokens `--ease-in`, `--ease-pop`, `--dur-out`, `--dur-in`, `--dur-hero` in `src/app.css` and `tokens.ts`;
  every new motion uses them and the look rules stay green (S16).

## Capabilities

### New Capabilities

none

### Modified Capabilities

- `game-engine`: play header (no Demo, red "Spiel beenden", danger confirm) and the per-game round status (S1, S2).
- `demo`: the demo is offered from the start screen only; exiting returns there (S1).
- `catalogue`: the start-screen layout no longer promises an unchanged play header with Demo (S1).
- `design-system`: shared Pager, in-game frame, Handoff, Reveal, Outcome, Scoreboard reorder, game over with winner
  burst, fault motion, phase transitions and motion tokens; Shared components and Motion extended (S3, S6–S16).
- `content-store`: the Inhalte list pages through the Pager instead of "Mehr anzeigen" (S4).
- `players`: "Gespeicherte Spieler" pages through the Pager (S5).
- `feud`: handoffs are inline in the stage instead of a full-screen overlay; the demo wording follows (S10).
- `codes`: the Endstand's ranked list moves to the rail and a skipped round shows "+0" (S12, S14).
- `most-likely`: the round and team position move to the header status; the turn opens with the Handoff (S2, S10).

## Non-Goals

- Server-side paging, search or filters in lists — the lists are small enough to load whole.
- Paging the roster — capped by each game's player maximum.
- An Imposter game-over screen — the game has none by its rules.
- A podium for the top 3 — Rue chose the deco burst.
- Horizontal slide transitions — vertical continues today's motion and avoids mid-animation scroll width.
- Redesigning home, start screens, setup, lobby, Inhalte or Spieler beyond the Pager — only screens after "Los geht's".
- New tokens, fonts or colours beyond the motion tokens — must blend with Arcade-Abend.
- Rule or scoring changes in any game — archive rules are canonical.
- Sound for the new motion.

## Done criteria

- [ ] Playing any of the 6 games on phone and desktop shows no Demo, a red "Spiel beenden", the round status in the
      header, and one consistent stage + rail layout from first handover to game over.
- [ ] Phase changes visibly fade out and rise in; with reduced motion they're instant.
- [ ] Inhalte and Gespeicherte Spieler page with Zurück / Weiter like Feud prep.
- [ ] Rue approves the Gate 2 screenshots of every game's phases on both widths.
- [ ] `npm run proof:full` green.

## Impact

- Frame: `src/routes/spiele/[slug]/spielen/+page.svelte`, `src/routes/spiele/[slug]/demo/+page.svelte`, new
  `src/lib/ui/PlayHeader.svelte`, `src/lib/ui/Stage.svelte`, `src/lib/motion.ts`, `src/app.css`, `src/lib/ui/tokens.ts`.
- Registry: `src/lib/games/registry.ts` (`status` on `GameEntry`), each game's `index.ts`.
- Shared UI: new `Pager`, `GameFrame`, `Handoff`, `Reveal`, `Outcome`, `Winner` in `src/lib/ui`; `Scoreboard.svelte`.
- Screens: all six `src/lib/games/*/Screen.svelte`, `wavelength/Dial.svelte`, `feud/Board.svelte`; `feud/Handoff.svelte`
  goes away; `feud/Prep.svelte` + `prep.ts` use the shared pager.
- Lists: `src/routes/spiele/[slug]/inhalte/+page.svelte`, `SurveyEditor.svelte`, `src/routes/spieler/+page.svelte`.
- Tests: `e2e/helpers.ts`, `e2e/look.test.ts` and its walks (Imposter and Wavelength walks move to `e2e/walks/`), every
  game's e2e, `e2e/demo.test.ts`, `e2e/content.test.ts`, `e2e/players.test.ts`, new `e2e/frame.test.ts` and
  `e2e/pager.test.ts`.
- No schema, migration, API or dependency change.
