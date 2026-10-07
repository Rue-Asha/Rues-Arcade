# Research: arcade-polish (Mobbin, 2026-10-07)

Read from origin/main after feud-host-flow (PR #16). Heads Up, Trivia Crack, HQ, Jackbox, Psych and Kahoot web are not on Mobbin; every citation below was checked against its app name.

## Current weaknesses (origin/main)
- Frame `src/routes/spiele/[slug]/spielen/+page.svelte`: header shows "Läuft" + name only (:50-61); Demo at :56; "Spiel beenden" `secondary` at :58; Modal "Beenden" `primary` at :82; `Stage` (:73) only `{#key}` + `in:rise`, old screen vanishes instantly.
- Imposter `imposter/Screen.svelte`: rail holds only the order list, "Runde N" hidden in it (:41, :105-127); handover is a plain Card (:44-53); reveal centred, buttons left outside the card (:94-101); no game over (stays so).
- Wavelength: round label at top of main (:63-69); prep stacks Card + Dial + buttons, Dial off-centre (:73-82, Dial.svelte:165); game over duplicates the live Scoreboard in the rail (:117-134).
- Codes: handover Card + HoldToView compete (:76-87); play mixes left text with a centred ring, second HoldToView below actions (:89-119); game over moves Scoreboard to main (:146-155).
- Duck: scoring drops `.split` for a full-width grid with its own head (:99-162); reveal stacks banner + Card + reveal (:166-194); rail role changes per phase (:195-203).
- Most Likely: result points static, no countUp (:96); hand-rolled final board (:118-133); rail disappears at game over (:140).
- Feud: no `.split` at all (:193-362); own topline (:215-225); `Handoff.svelte` is a fixed body overlay (:203-212).
- Cross-game: round status in 4 places; handover built 4 ways; `.outcome`/`.score`/`.teams`/`.winner` copy-pasted; no alignment rule; desktop lower half empty; 5 different game-over compositions.

## Mobbin evidence
- Header with progress + exit: Kahoot https://mobbin.com/screens/e89c5ee8-9c58-4a7c-a17b-ecd9162820fa · Duolingo https://mobbin.com/screens/ef9d6413-1e91-4f2c-8317-25d63ceee5bf · Babbel web https://mobbin.com/screens/418437b3-aa52-45ba-a1f1-a0c35730347f
- Handover: Tolan https://mobbin.com/screens/9c0946df-1832-4343-8d11-b8b544bc306c · Abode https://mobbin.com/screens/707a92d5-abd2-4738-bb97-dd88aa3dc7cb
- Anchored action bar (not its empty sides): Duolingo web https://mobbin.com/screens/fe47e553-ea8d-40b2-8176-91063c68439b
- Round result "+N": Kahoot https://mobbin.com/screens/e89c5ee8-9c58-4a7c-a17b-ecd9162820fa · https://mobbin.com/screens/f1b8b048-fef6-42fa-b2b5-007772c8f906
- Standings: Kahoot flow https://mobbin.com/flows/e267f920-23e0-4423-ae27-fc676a73958f (screen ID e5957ba2 inferred, unverified)
- Game over: Kahoot podium https://mobbin.com/screens/d0d3afb2-789d-4934-92fd-8ddcb19e16e4 · https://mobbin.com/screens/904858e1-5a29-41cf-9ccd-6ec9218071e3 · Higgsfield https://mobbin.com/screens/456d9910-d86a-47d8-8a45-ce30bba8ecfa
- Reveal: Alan https://mobbin.com/screens/16e0bd29-9b43-43b9-9c84-86eb24d1d72a · Deepstash https://mobbin.com/screens/dd9df113-cd8d-47e4-a0ef-11a38f224671

## Motion vocabulary (tokens next to `--ease-out` / `--dur` in `src/app.css`)
- Tokens: `--ease-in: cubic-bezier(0.5,0,0.75,0)`, `--ease-pop: cubic-bezier(0.34,1.56,0.64,1)`, `--dur-out: 0.18s`, `--dur-in: 0.42s`, `--dur-hero: 0.56s`.
- phase-out: opacity 1→0, translateY 0→-8px, 180ms `--ease-in`; outgoing node in the same grid cell, `inert` + `aria-hidden` and `data-demo` stripped at once.
- phase-in: existing `rise` (420ms, y 12) with 60ms delay, overlapping the out (≈480ms total).
- handover: colour band scaleX 0→1 from the left, 320ms `--ease-out`, then name pops (scale .92→1, 300ms `--ease-pop`); out: band up + fade, 200ms. Feud's `lift` folds into it.
- reveal: existing `burst` (560ms) + one 20° turn of the `.reveal::before` sunburst over 1.2s, run once.
- score: existing `countUp` (1100ms); `+N` chip pops 300ms `--ease-pop`; Scoreboard rows `animate:flip` 400ms; lead crown pops on change.
- fault: Feud shake (360ms) + stamp (800ms), reused for Codes "Daneben" and Duck letter loss.
- winner: reveal burst + 10–14 Spielbrett deco pieces (game colour + gold) flying out once, 900ms, 30ms stagger, aria-hidden, pointer-events none.
- Reduced motion: every Svelte/WAAPI transition returns duration 0 via `reducedMotion()` — the global CSS rule does not cover WAAPI or Svelte JS transitions.
