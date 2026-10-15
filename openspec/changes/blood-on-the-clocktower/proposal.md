## Why

Rue hosts Blood on the Clocktower game nights with no physical grimoire and runs them from her own slides, sheet and
notes. The storyteller has to juggle role distribution, the night order, nominations, vote counting and win conditions
by hand, and players have no shared view of who is alive and who still has a ghost vote.

Appetite: one change, multi-session (≈ 10–12 units in 4–5 waves), the explanation deck and character sheet in the last
wave. Exceeding it means renegotiating scope. Gate 2 revisions round 2 (S50–S66, 2026-10-15): about 5–6 units in 3
waves (U17–U22), then Verify and Gate 2 again.

## What Changes

- New game **Blood on the Clocktower** (script Trouble Brewing, slug `clocktower`, 5–15 players) in the catalogue with
  its own tile, motif, colour and range "5–15 Spieler" (S1).
- **BREAKING (internal contract)** The generic game contract bends for a game without demo and content: `GameEntry.demo`
  becomes optional, an entry can offer an explanation deck instead (`Explanation`), `contentType` may be `'none'`, the
  session shape template is explicit per game (`shape`) instead of always the demo's opening state, and a game can be
  count-first (`countFirst`). Generic demo/runner/registry tests skip games without a demo (S2–S4, S16).
- Count-first start screen: the storyteller picks the player count N (5–15) before the lobby; the start screen shows an
  "Erklärung" card instead of Demo and no Inhalte card; the lobby requires exactly N roster players (S2–S4).
- Own dark old-world theme on every BotC route (night violet-black, gold, blood red, good-blue; IM Fell English SC and
  Alegreya Sans, self-hosted OFL fonts), parchment on day screens, animated day/night change, a view transition into
  and out of BotC and between its routes; other games unchanged (S5, S6).
- Own synth sounds: bell at dusk and dawn, tick per seat during the vote sweep, role reveal tone, gong at game end (S7).
- Storyteller setup: seating circle, all 22 characters with live team counters from the setup table (Baron aware),
  manual or seeded random assignment, Drunk's believed role, Fortune Teller red herring, confirm and lock, character
  sheet on the board (S8–S13); private seat-by-seat role reveal (S14).
- Shared play surface: the grimoire circle with alive/dead and ghost-vote markers, header status "Nacht k"/"Tag k"
  with the alive count, reload-safe versioned session (S15, S16).
- Guided nights in the official order with a 4-screen cycle per waking step, computed true info as a suggestion, a
  show-bar of full-screen cards, a hold-to-view grimoire, Imp target note and starpass, and a private death step
  (S17–S24).
- Public days: dawn with the night's deaths, a deadline-based day timer, enforced nominations, a voting clock whose hand
  sweeps the circle, official vote results with the block, seat actions for Slayer/Virgin-style outcomes, end of day
  with the execution (S25–S31).
- Automatic win detection by the official rules, private resolution of ambiguous cases at the next dusk, and a
  two-step end reveal (S32–S34).
- An "Erklärung" deck rebuilt from Rue's presentation, adapted to N, plus slides on the app's mechanics and a character
  sheet in the look of her PDF, reused on the setup board (S35–S38).
- Gate 2 revisions, round 2 (S50–S66): no text selection or I-beam on UI text in the whole app (S50); the held night
  grimoire shows character icons (S51); every seat node shows the name large and the number small (S52); the vote hand
  turns at a constant speed, the hand's sector lights up and a vote counts only in that sector, confirmed by tapping
  seats instead of a count stepper (S53); n ticks on the sector boundaries of every circle and the same look on the
  deck's voting slide (S54, S55); the day timer top right (S56); press feedback and vibration on seat taps (S57);
  nomination rings (S58); round block and ghost-vote badges (S59, S60); a block card with the votes (S61); one
  background tone over the whole page (S62); death animations at the execution and at dawn (S63, S64); show texts in
  the circle's centre with seats marked by tapping (S65); bluffs hidden until shown and never the Drunk (S66).

## Non-Goals

- Travellers, exile votes, Fabled — 5–15 players only (more than 15 needs Travellers).
- Other scripts (Bad Moon Rising, Sects & Violets, custom scripts).
- Tracking poison, drunkenness in effect, Monk/Soldier protection, Butler master, or any status effect beyond alive/dead
  and ghost votes — the storyteller owns them.
- Automatic resolution of Slayer shots or Virgin triggers — the storyteller records the outcome through the generic
  seat actions.
- A demo (scripted tap-through) for BotC — replaced by the explanation deck.
- Multi-device play, player phones, remote viewers.
- Any CI workflow change — speed-ups belong to `faster-ci`; this change only follows its e2e idioms.
- A day/night history log or undo beyond the night guide's "Zurück" and the seat corrections.
- Round 2: a select-all control for marking players (S65) and vibration on iOS (no vibration API there).

## Done criteria

- [ ] From the home screen Rue can open BotC with a smooth transition, pick 5–15 players, watch the deck with the right
      role counts, run a full game (setup, reveal, nights, days with votes, end) on one device, and the right team is
      revealed for: demon executed, starpass, Scarlet Woman takeover, Saint executed, Mayor win, 2 alive.
- [ ] The night guide wakes exactly the right characters in the official order on night 1 and later nights for 5, 7
      and 15 players.
- [ ] `npm run proof:full` is green, and the look walk covers every BotC screen on phone and desktop.
- [ ] In a vote only the seat whose sector holds the hand can vote, and corrections are made by tapping seats in the
      confirm step; show texts appear in the circle's centre while tapped players are marked around it.
- [ ] Other games look and behave as before, except that no UI text can be selected anywhere (S50).

## Capabilities

### New Capabilities

- `clocktower`: Blood on the Clocktower (Trouble Brewing) — rules data, setup board, role reveal, grimoire circle,
  session, night guide, day with nominations and voting clock, win detection, end reveal, explanation deck and
  character sheet (S8–S38 except the look and sounds); Gate 2 revisions S40–S49 and, in round 2, seat nodes, press
  feedback, nomination rings, badges, block card, death animation, the vote sector rule, centre show texts with marks
  and blind bluffs (S51–S61, S63–S66).

### Modified Capabilities

- `catalogue`: BotC joins the registered games; the start screen's "Mehr zu" box holds the cards a game has (Demo,
  Inhalte, Erklärung); count-first start screen with the player-count stepper; BotC start screen (S1–S3).
- `demo`: a game may have no demo (BotC); its demo route is not found; generic demo checks skip it (S3).
- `roster`: count-first games require exactly N roster players in the lobby (S4).
- `game-engine`: games without content (`'none'`), explicit session shape template per game, BotC's round status (S3,
  S15, S16).
- `design-system`: the Arcade-Abend look is scoped to every route except BotC's; BotC's own theme with day and night
  variants, fonts and themed transitions, one background tone over the whole page; BotC tile look; no selectable UI
  text in the whole app (S1, S5, S6, S50, S62).
- `sound`: BotC's own effects — bell, tick, role reveal, gong (S7).

## Impact

- Generic wiring: `src/lib/games/registry.ts`, `src/lib/engine/types.ts`, `src/lib/session.ts` use via
  `loadGameSession`, start/lobby/demo/inhalte routes under `src/routes/spiele/[slug]/`, a new `erklaerung` route, new
  `src/lib/count.ts`; generic tests `registry.test.ts`, `runner.test.ts`, `status.test.ts`.
- Theme: `src/app.css`, `src/app.html`, `src/hooks.server.ts`, `src/routes/+layout.svelte`, the play route,
  `src/lib/ui/tokens.ts`, `static/fonts/` (IM Fell English SC/regular/italic, Alegreya Sans 400/500/700 + OFL texts),
  `src/lib/deco/` (motif `clocktower`), `GameTile.svelte`, `src/lib/sound.ts`.
- New `src/lib/games/clocktower/` (rules data, pure rules, reducer, components, screens, deck) and e2e files
  `e2e/clocktower-*.test.ts`, `e2e/walks/clocktower*.ts`, `e2e/clocktower-session.ts`; `e2e/look.test.ts` gains the
  BotC walk; `e2e/home.test.ts` gains the tile.
- No schema, migration, API or dependency change. BotC stores nothing in the database; its session and player count
  live in localStorage like every game's session.
- IP: character names and ability texts belong to The Pandemonium Institute; icons are game-icons.net glyphs (CC BY
  3.0) with attribution on the sheet and a credits slide; no TPI artwork or logos.
