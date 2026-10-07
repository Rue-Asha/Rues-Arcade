# Scope: arcade-polish

Triage: feature — cross-game polish: play header without Demo, shared pager for content lists, in-game redesign within Arcade-Abend, in/out phase motion. 16 S-items, all 6 games, no schema. Appetite: 2–3 sessions.

## Problem
Hosts running a game on the shared device see a Demo button they can't use mid-game, scroll long content lists with "Mehr anzeigen", and get six games that each lay out rounds, handovers, results and game over differently, with an empty lower half on desktop and screens that vanish instead of transitioning.

## Flows
- Play: start screen → setup → "Los geht's" → phases (handover → reveal/play → result → standings) → game over → "Nochmal spielen" | "Spiel beenden" → confirm → start screen.
- Demo: start screen Demo card → demo → "Demo beenden" → start screen (no longer reachable from a running game).
- Content: start screen → Inhalte → page through entries → add / delete / import.
- Players: Spieler → Gespeicherte Spieler → page through → delete.
- Feud prep: setup → prep survey cards → page through → pick → start (pager behaviour unchanged, component shared).

## Model
- The play route owns the frame: header (game name, round status, progress line, "Spiel beenden") and a Stage that holds the current phase screen.
- Each game supplies its Screen and a `status(state)` string; the frame draws the status, the game never draws its own round label.
- Inside a Screen: one stage card (hero + action row) and a rail (Scoreboard / order / teams). Handoff, Outcome, Scoreboard, reveal and winner are shared components the Screens compose.
- Pager is a shared UI component over a client-side list; data stays loaded whole.

## In scope
- **S1** On `/spielen` the header has no Demo control; "Spiel beenden" is the red `danger` Button with its full label; the confirm Modal's "Beenden" is `danger` too; confirming still clears the session and returns to the start screen.
  - edges: stale/discarded session notice → still no Demo; Demo stays on the start-screen card; demo "Demo beenden" returns to the start screen (spec scenario "Exiting returns to the starting screen" now starts there, `e2e/demo.test.ts:189` moves); Imposter demo tip mentioning "Spiel beenden" stays valid (label unchanged).
- **S2** The play header shows the game's round status from a per-game `status(state)` (e.g. "Runde 2 / 5 · Team Blau") in Sora and a thin progress line in the game colour; no Screen renders its own round label any more.
  - edges: game not loaded yet / discarded → no status line; games without a fixed round count (Imposter) → status without total, no progress line; last round → line full; phone 390px → header wraps without horizontal scroll; Press Start 2P never used for it.
- **S3** A shared `Pager` in `src/lib/ui` (Zurück / "Seite x von y" / Weiter), 6 items per page below 1024px and 12 from 1024px, hidden when everything fits on one page; Feud prep uses it with unchanged behaviour (sort → page 1, picks survive paging).
  - edges: resize across 1024px → current page clamped; exactly 6 / 12 items → no pager; Feud prep e2e (`feud-prep-pages.test.ts`) stays green.
- **S4** Inhalte lists every content type (incl. Feud survey cards) through the Pager, newest first, replacing "Mehr anzeigen".
  - edges: empty list → existing empty state, no pager; adding an entry → page 1 showing it; deleting the last entry on the last page → previous page; import adding many → page 1; seed sizes (codes 91, duck 60, most-likely 60, feud 247) page correctly.
- **S5** Spieler → "Gespeicherte Spieler" pages through the Pager, alphabetical across pages; the roster list stays unpaged.
  - edges: 0 saved players → existing empty state, no pager; deleting the last one on a page → previous page; saving a new player → list stays on the page that contains it.
- **S6** On every phase change the outgoing screen fades and lifts out (≤200ms, opacity/transform only) while the incoming one rises in, overlapping; the outgoing node is `inert`, `aria-hidden` and carries no `data-demo` from the moment it starts leaving.
  - edges: rapid taps through phases → at most one outgoing node; undo (Feud) → same transition; reload mid-game → incoming only, no out.
- **S7** Under reduced motion a phase change is instant: no outgoing node on the next frame and no running finite animation (Svelte and WAAPI transitions return duration 0).
  - edges: handover, reveal, score, winner and pager motion all covered; ambient deco rule unchanged.
- **S8** Motion never blocks input: the incoming screen's primary button dispatches on the first tap during a transition.
  - edges: demo expected-control gating unaffected.
- **S9** Every in-game screen of every game uses one frame: a stage card holding one hero and an action row at its bottom, and a rail (Scoreboard, order or teams) beside it from 1024px, below it on phone. Feud and Duck scoring move into this frame. Alignment rule: text and actions left-aligned, only the hero centred inside its card.
  - edges: primary action fully inside the first viewport at 390×844 and 1280×800 on every walk screen; desktop reach (≥75% width) holds; 44px targets and 4.5:1 contrast hold; no horizontal scroll.
- **S10** A shared `Handoff` renders every pass-the-device moment inline in the stage — Imposter handover, Wavelength prep, Codes reveal intro, Most Likely prompt, Feud choose/steal — with the next player/team as heading on a game-colour band (`data-testid="handoff"`); it replaces Feud's fixed overlay.
  - edges: team games → team colour; long names wrap; rail stays visible on desktop; existing headings like "Gib das Handy an Bo" keep their text.
- **S11** Every reveal (Imposter crew/unmask, Duck word, Codes word, Feud question, Wavelength target) goes covered card → reveal card with the shared burst and a single sunburst turn (finite).
  - edges: HoldToView behaviour unchanged; reduced motion → instant reveal.
- **S12** Every round result in Wavelength, Codes, Most Likely and Feud uses a shared Outcome: verdict heading plus `+N` counting up to the final value in Press Start (`data-testid="points"`); Most Likely gains the count-up.
  - edges: 0 points → miss style, "+0" shown; reduced motion → final number at once.
- **S13** Scoreboard rows reorder by transform (FLIP) when ranks change and end in sorted order; the acting team's row carries the game-colour marker.
  - edges: ties keep stable order; no rank change → no movement.
- **S14** Every game over except Imposter (Wavelength, Codes, Duck, Most Likely, Feud) shows the winner reveal and "Nochmal spielen" in the stage and exactly one final Scoreboard in the rail; the winner moment bursts 10–14 deco pieces once (finite, aria-hidden, no pointer events).
  - edges: tie for first → shared winner wording; reduced motion → no pieces.
- **S15** Codes "Daneben" and Duck letter loss reuse Feud's fault motion (shake + stamp).
  - edges: reduced motion → none.
- **S16** Motion tokens (`--ease-in`, `--ease-pop`, `--dur-out`, `--dur-in`, `--dur-hero`) live in `src/app.css` `:root` and `tokens.ts`, and every new motion uses them; `look.test.ts` (44px, contrast, Press Start limit, no external assets, no horizontal scroll, desktop fill) stays green on both projects.
  - edges: `shot()`/`settle()` wait for the new finite animations.

## Non-goals
- Server-side paging, search or filters in lists — the lists are small enough to load whole.
- Paging the roster — capped by each game's player maximum.
- An Imposter game-over screen — the game has none by its rules.
- A podium for the top 3 — Rue chose the deco burst.
- Horizontal slide transitions — vertical continues today's motion and avoids mid-animation scroll width.
- Redesigning home, start screens, setup, lobby, Inhalte or Spieler beyond the Pager — only screens after "Los geht's".
- New tokens, fonts or colours beyond the motion tokens — must blend with Arcade-Abend.
- Rule or scoring changes in any game — archive rules are canonical.
- Sound for the new motion.

## Codebase touchpoints
- `src/routes/spiele/[slug]/spielen/+page.svelte` — header (:50-61), Demo (:56), "Spiel beenden" (:58), Modal (:79-85), Stage (:73) (explorer: end-game/demo).
- `src/lib/ui/Stage.svelte`, `src/lib/motion.ts` — in/out transition, reduced-motion gating (explorer: visuals).
- `src/lib/ui/Button.svelte` — `danger` variant exists (explorer: end-game/demo).
- `src/lib/games/*/Screen.svelte` (6 games), `feud/Handoff.svelte`, `feud/Board.svelte`, `wavelength/Dial.svelte`, `ui/Scoreboard.svelte`, `ui/HoldToView.svelte`, `ui/Lives.svelte` — frame, Handoff, Outcome, reveal, game over (research.md).
- game registry / `def.phase` — add `status(state)` per game (explorer: visuals).
- `src/lib/games/feud/Prep.svelte:30-53,198-203`, `feud/prep.ts:51-62`, `prep.test.ts` — pager extraction (explorer: pagination).
- `src/routes/spiele/[slug]/inhalte/+page.svelte:65-68,260-261`, `SurveyEditor.svelte` — "Mehr anzeigen" → Pager (explorer: pagination).
- `src/routes/spieler/+page.svelte:218` — saved players list (explorer: pagination).
- `src/app.css` `:root`, `.rise`, `.split`; `src/lib/ui/tokens.ts` + `tokens.test.ts` — motion tokens, frame layout (explorer: visuals).
- Specs: demo (Guided demo :6, scenario :33), game-engine (:20, :29), catalogue :46, content-store Content editor :27-36, players "Gespeicherte Spieler section" :63, design-system (Motion, Responsive layout, Shared components), each game's spec for result/handover/game over.
- Tests: `e2e/demo.test.ts:189`, `deco.test.ts:97`, `look.test.ts` + `e2e/walks/*`, `e2e/helpers.ts` (`shot`, `settle`, `surveyCard`, `chooseSurveys`), per-game e2e with "Spiel beenden"/Modal, `feud-prep-pages.test.ts`, `imposter/demo.test.ts:78`.

## Risks
- R1 The outgoing node duplicates text/role/`data-demo` matches for ~180ms → resolved in S6: `inert` + `aria-hidden` + strip `data-demo` at outro start; e2e helpers scope to the live stage.
- R2 The global reduced-motion CSS rule doesn't cover WAAPI or Svelte JS transitions → resolved in S7: every transition gates on `reducedMotion()`.
- R3 An inline Handoff or a narrow centred card fails desktop reach → resolved in S9/S10: the rail stays beside the stage.
- R4 Large e2e churn from moved labels, handover and game-over markup across 6 games → accepted: keep headings, testids and button names stable where possible; planner gives each game's tests to the unit that owns that game.
- R5 Finite sunburst/winner motion adds ~1s per screenshot wait → accepted.
- R6 Removing Feud's Handoff overlay touches feud spec scenarios → accepted, delta spec in feud.

## Decisions
- One change, not split — Rue.
- Demo removed from the play header entirely — Rue.
- Pager 6 / 12 everywhere, lifted from Feud prep — Rue (initial suggestion).
- Motion: every phase change transitions in and out, plus a bit of game-show flair — Rue.
- Redesign consults Mobbin but blends with Arcade-Abend (research.md) — Rue.
- Appetite 2–3 sessions; pager only on Gespeicherte Spieler; add → page 1, delete last on page → previous page — delegated by Rue.
- Taste calls, Rue took all of these picks: left alignment with centred hero; inline Handoff in the stage; deco-piece winner burst (no podium); vertical transitions; full-label red "Spiel beenden"; round status in the shared header; final Scoreboard in the rail at game over.

## Done when
- Playing any of the 6 games on phone and desktop shows no Demo, a red "Spiel beenden", the round status in the header, and one consistent stage + rail layout from first handover to game over.
- Phase changes visibly fade out and rise in; with reduced motion they're instant.
- Inhalte and Gespeicherte Spieler page with Zurück / Weiter like Feud prep.
- Rue approves the Gate 2 screenshots of every game's phases on both widths.
- `npm run proof:full` green.

## Split off
- none
