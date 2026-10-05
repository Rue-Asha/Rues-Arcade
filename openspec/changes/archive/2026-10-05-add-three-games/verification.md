verified-at: 7a8849d

## Layer 1 — `npm run proof:full`: green

svelte-check: 458 files, 0 errors, 0 warnings · build ok · vitest: 24 files, 173 tests passed · Playwright: 236 passed, 2 skipped (by design: phone-only and desktop-only look checks).

```
  -  232 [desktop] › e2e/look.test.ts:353:1 › Scenario: No horizontal scroll on phone
  ✓  231 [phone] › e2e/look.test.ts:353:1 › Scenario: No horizontal scroll on phone (1.0m)
  -  234 [phone] › e2e/look.test.ts:358:1 › Scenario: Desktop uses the width
  ✓  235 [phone] › e2e/look.test.ts:476:2 › reduced motion › Scenario: Reduced motion makes transitions instant (245ms)
  ✓  236 [phone] › e2e/look.test.ts:488:1 › Scenario: Motion never blocks input (306ms)
  ✓  233 [desktop] › e2e/look.test.ts:358:1 › Scenario: Desktop uses the width (1.0m)
  ✓  237 [desktop] › e2e/look.test.ts:476:2 › reduced motion › Scenario: Reduced motion makes transitions instant (223ms)
  ✓  238 [desktop] › e2e/look.test.ts:488:1 › Scenario: Motion never blocks input (264ms)

  Slow test file: [phone] › e2e/look.test.ts (5.7m)
  Slow test file: [desktop] › e2e/look.test.ts (5.6m)
  Consider running tests from slow files in parallel. See: https://playwright.dev/docs/test-parallel
  2 skipped
  236 passed (6.3m)
```

## Layer 2 — spec coverage

113 scenarios: 107 ✓ by a passed test, 6 manual, 0 gaps.

| Scenario | proof | Evidence |
|---|---|---|
| catalogue › Tiles for registered games | e2e | `e2e/home.test.ts` › "Scenario: Tiles for registered games" ✓ (desktop+phone) |
| catalogue › Player range derived from engine limits | unit | `src/lib/games/registry.test.ts` › "Scenario: Player range derived from engine limits" ✓ |
| catalogue › Bald tiles have no actions | e2e | `e2e/home.test.ts` › "Scenario: Bald tiles have no actions" ✓ (desktop+phone) |
| catalogue › Each tile shows a one-line pitch | e2e | `e2e/deco.test.ts` › "Scenario: Each tile shows a one-line pitch" ✓ (desktop+phone) |
| catalogue › Start banner carries title, badge and player range | e2e | `e2e/start.test.ts` › "Scenario: Start banner carries title, badge and player range" ✓ (desktop+phone) |
| catalogue › Start panel first on phone, right column on desktop | e2e | `e2e/start.test.ts` › "Scenario: Start panel first on phone, right column on desktop" ✓ (desktop+phone) |
| catalogue › Same start layout for both games | e2e ("Scenario: Start panel first on phone, right column on desktop") | `e2e/start.test.ts` › "Scenario: Start panel first on phone, right column on desktop" ✓ (desktop+phone) |
| catalogue › Mehr-zu cards keep their targets | e2e | `e2e/start.test.ts` › "Scenario: Mehr-zu cards keep their targets" ✓ (desktop+phone) |
| catalogue › Inhalte card shows the real content count | e2e | `e2e/start.test.ts` › "Scenario: Inhalte card shows the real content count" ✓ (desktop+phone) |
| catalogue › Los geht's opens the lobby | e2e | `e2e/start.test.ts` › "Scenario: Los geht's opens the lobby" ✓ (desktop+phone) |
| catalogue › So geht's covers both Wavelength modes | e2e | `e2e/start.test.ts` › "Scenario: So geht's covers both Wavelength modes" ✓ (desktop+phone) |
| catalogue › So geht's for the new games | e2e | `e2e/start.test.ts` › "Scenario: So geht's for the new games" ✓ (desktop+phone) |
| catalogue › Inhalte card counts the seeded content | e2e | `e2e/start.test.ts` › "Scenario: Inhalte card counts the seeded content" ✓ (desktop+phone) |
| catalogue › New start banners carry title, badge and range | e2e | `e2e/start.test.ts` › "Scenario: New start banners carry title, badge and range" ✓ (desktop+phone) |
| codes › Codes teams dealt from the roster | e2e | `e2e/codes.test.ts` › "Scenario: Codes teams dealt from the roster" ✓ (desktop+phone) |
| codes › Codes start blocked by a team below two | e2e | `e2e/codes.test.ts` › "Scenario: Codes start blocked by a team below two" ✓ (desktop+phone) |
| codes › Codes needs four players | e2e | `e2e/codes.test.ts` › "Scenario: Codes needs four players" ✓ (desktop+phone) |
| codes › Codes roster above maximum asks who plays | e2e | `e2e/codes.test.ts` › "Scenario: Codes roster above maximum asks who plays" ✓ (desktop+phone) |
| codes › Codes words do not repeat until the pool is used | unit | `src/lib/games/codes/engine.test.ts` › "Scenario: Codes words do not repeat until the pool is used" ✓ |
| codes › Empty Codes pool blocks start | e2e | `e2e/codes.test.ts` › "Scenario: Empty Codes pool blocks start" ✓ (desktop+phone) |
| codes › Two-player teams swap roles every round | unit | `src/lib/games/codes/engine.test.ts` › "Scenario: Two-player teams swap roles every round" ✓ |
| codes › Teams of different sizes rotate independently | unit | `src/lib/games/codes/engine.test.ts` › "Scenario: Teams of different sizes rotate independently" ✓ |
| codes › Opening team rotates from a random start | unit | `src/lib/games/codes/engine.test.ts` › "Scenario: Opening team rotates from a random start" ✓ |
| codes › Codes word visible only while held | e2e | `e2e/codes.test.ts` › "Scenario: Codes word visible only while held" ✓ (desktop+phone) |
| codes › Anderes Wort returns the rejected word | unit | `src/lib/games/codes/engine.test.ts` › "Scenario: Anderes Wort returns the rejected word" ✓ |
| codes › Anderes Wort on a pool of one word | unit | `src/lib/games/codes/engine.test.ts` › "Scenario: Anderes Wort on a pool of one word" ✓; also `e2e/codes.test.ts` › "Scenario: Anderes Wort on a pool of one word" ✓ (desktop+phone) |
| codes › Codes play screen names team, explainer and guessers | e2e | `e2e/codes.test.ts` › "Scenario: Codes play screen names team, explainer and guessers" ✓ (desktop+phone) |
| codes › Codes points by attempt | unit | `src/lib/games/codes/engine.test.ts` › "Scenario: Codes points by attempt" ✓ |
| codes › Daneben passes to the next team | unit | `src/lib/games/codes/engine.test.ts` › "Scenario: Daneben passes to the next team" ✓ |
| codes › Überspringen from the third miss | unit | `src/lib/games/codes/engine.test.ts` › "Scenario: Überspringen from the third miss" ✓ |
| codes › Full Codes game | e2e | `e2e/codes.test.ts` › "Scenario: Full Codes game" ✓ (desktop+phone) |
| codes › Codes skipped round result | e2e | `e2e/codes.test.ts` › "Scenario: Codes skipped round result" ✓ (desktop+phone) |
| codes › Codes tie shown as Unentschieden | e2e | `e2e/codes.test.ts` › "Scenario: Codes tie shown as Unentschieden" ✓ (desktop+phone) |
| codes › Codes rematch keeps the teams | unit | `src/lib/games/codes/engine.test.ts` › "Scenario: Codes rematch keeps the teams" ✓ |
| codes › Codes engine is deterministic and pure | unit | `src/lib/games/codes/engine.test.ts` › "Scenario: Codes engine is deterministic and pure" ✓ |
| codes › Codes session resumes after reload | e2e | `e2e/codes.test.ts` › "Scenario: Codes session resumes after reload" ✓ (desktop+phone) |
| codes › Leaving Codes asks for confirmation | e2e | `e2e/codes.test.ts` › "Scenario: Leaving Codes asks for confirmation" ✓ (desktop+phone) |
| codes › Codes demo script plays to the end | unit | `src/lib/games/codes/demo.test.ts` › "Scenario: Codes demo script plays to the end" ✓ |
| codes › Codes demo by tapping highlighted controls | e2e | `e2e/codes.test.ts` › "Scenario: Codes demo by tapping highlighted controls" ✓ (desktop+phone) |
| codes › Codes cues sound right | manual (audio judgement on a real device at Gate 2) | manual — checklist below |
| codes › Codes art on tile and start screen | e2e | `e2e/codes.test.ts` › "Scenario: Codes art on tile and start screen" ✓ (desktop+phone) |
| codes › Codes screens meet the look rules | e2e ("Scenario: Text contrast meets 4.5:1", "Scenario: Touch targets are at least 44px", "Scenario: No horizontal scroll on phone") | `e2e/look.test.ts` (walks `e2e/walks/codes.ts`) › all three ✓ (contrast and touch targets desktop+phone; horizontal scroll phone) |
| codes › Codes copy reads neutral | e2e | `e2e/codes.test.ts` › "Scenario: Codes copy reads neutral" ✓ (desktop+phone) |
| content-store › Fresh database runs with empty tables | e2e | `e2e/home.test.ts` › "Scenario: Fresh database runs with empty tables" ✓ (desktop+phone) |
| content-store › Migration failure refuses to start | unit | `src/lib/server/db.test.ts` › "Scenario: Migration failure refuses to start" ✓ |
| content-store › Migrations are applied once | unit | `src/lib/server/db.test.ts` › "Scenario: Migrations are applied once" ✓ |
| content-store › Add, edit and delete an entry | e2e | `e2e/content.test.ts` › "Scenario: Add, edit and delete an entry" ✓ (desktop+phone) |
| content-store › Delete asks for confirmation | e2e | `e2e/content.test.ts` › "Scenario: Delete asks for confirmation" ✓ (desktop+phone) |
| content-store › Bulk import reports skipped and malformed lines | unit | `src/lib/server/content.test.ts` › "Scenario: Bulk import reports skipped and malformed lines" ✓ |
| content-store › Overlong text rejected | unit | `src/lib/content/parse.test.ts` › "Scenario: Overlong text rejected" ✓ |
| content-store › Add, edit and delete a single entry | e2e | `e2e/content.test.ts` › "Scenario: Add, edit and delete a single entry" ✓ (desktop+phone) |
| content-store › Single bulk import reports skipped, overlong and duplicate lines | unit | `src/lib/server/content.test.ts` › "Scenario: Single bulk import reports skipped, overlong and duplicate lines" ✓ |
| content-store › Duplicate single entry rejected | unit | `src/lib/server/content.test.ts` › "Scenario: Duplicate single entry rejected" ✓ |
| content-store › Overlong single entry rejected | unit | `src/lib/server/content.test.ts` › "Scenario: Overlong single entry rejected" ✓ |
| content-store › Bulk import of single entries on the Inhalte page | e2e | `e2e/content.test.ts` › "Scenario: Bulk import of single entries on the Inhalte page" ✓ (desktop+phone) |
| content-store › Seeds land once on an existing database | unit | `src/lib/server/db.test.ts` › "Scenario: Seeds land once on an existing database" ✓ |
| content-store › Deleted seed entries stay deleted | unit | `src/lib/server/db.test.ts` › "Scenario: Deleted seed entries stay deleted" ✓ |
| content-store › Seed rows are clean | unit | `src/lib/server/db.test.ts` › "Scenario: Seed rows are clean" ✓ |
| design-system › Text contrast meets 4.5:1 | e2e | `e2e/look.test.ts` › "Scenario: Text contrast meets 4.5:1" ✓ (desktop+phone) |
| design-system › Look approved on screenshots | manual (visual judgement at Gate 2) | manual — checklist below, `shots/` |
| design-system › New game colours meet contrast | unit | `src/lib/ui/tokens.test.ts` › "Scenario: New game colours meet contrast" ✓ |
| design-system › New games get their own motifs | unit | `src/lib/deco/motifs.test.ts` › "Scenario: New games get their own motifs" ✓ |
| design-system › New tiles carry their own badge | e2e | `e2e/home.test.ts` › "Scenario: New tiles carry their own badge" ✓ (desktop+phone) |
| design-system › New games' screens approved on screenshots | manual (visual and tone judgement at Gate 2) | manual — checklist below, `shots/` |
| duck › Duck lobby offers Zielpunkte | e2e | `e2e/duck.test.ts` › "Scenario: Duck lobby offers Zielpunkte" ✓ (desktop+phone) |
| duck › Duck needs four players | e2e | `e2e/duck.test.ts` › "Scenario: Duck needs four players" ✓ (desktop+phone) |
| duck › Duck roster above maximum asks who plays | e2e | `e2e/duck.test.ts` › "Scenario: Duck roster above maximum asks who plays" ✓ (desktop+phone) |
| duck › Duck target survives reload | e2e | `e2e/duck.test.ts` › "Scenario: Duck target survives reload" ✓ (desktop+phone) |
| duck › Chuck starts random and moves after a played word | unit | `src/lib/games/duck/engine.test.ts` › "Scenario: Chuck starts random and moves after a played word" ✓ |
| duck › Chuck stays on skip and at game end | unit | `src/lib/games/duck/engine.test.ts` › "Scenario: Chuck stays on skip and at game end" ✓ |
| duck › Chuck shown in banner, scoring card and standings | e2e | `e2e/duck.test.ts` › "Scenario: Chuck shown in banner, scoring card and standings" ✓ (desktop+phone) |
| duck › Duck word revealed to everyone | e2e | `e2e/duck.test.ts` › "Scenario: Duck word revealed to everyone" ✓ (desktop+phone) |
| duck › Duck skip asks first and keeps the word used | unit | `src/lib/games/duck/engine.test.ts` › "Scenario: Duck skip asks first and keeps the word used" ✓ |
| duck › Duck skip can be cancelled | e2e | `e2e/duck.test.ts` › "Scenario: Duck skip can be cancelled" ✓ (desktop+phone) |
| duck › Duck words do not repeat until the pool is used | unit | `src/lib/games/duck/engine.test.ts` › "Scenario: Duck words do not repeat until the pool is used" ✓ |
| duck › Point boxes set and clear the score | unit | `src/lib/games/duck/engine.test.ts` › "Scenario: Point boxes set and clear the score" ✓ |
| duck › Score capped at the target | unit | `src/lib/games/duck/engine.test.ts` › "Scenario: Score capped at the target" ✓ |
| duck › DUCKY letters cross and restore within the word | unit | `src/lib/games/duck/engine.test.ts` › "Scenario: DUCKY letters cross and restore within the word" ✓ |
| duck › Duck ends at target or zero lives | unit | `src/lib/games/duck/engine.test.ts` › "Scenario: Duck ends at target or zero lives" ✓ |
| duck › Duck standings sorted with struck letters | e2e | `e2e/duck.test.ts` › "Scenario: Duck standings sorted with struck letters" ✓ (desktop+phone) |
| duck › Duck tie at the top reads Unentschieden | e2e | `e2e/duck.test.ts` › "Scenario: Duck tie at the top reads Unentschieden" ✓ (desktop+phone) |
| duck › Full Duck game | e2e | `e2e/duck.test.ts` › "Scenario: Full Duck game" ✓ (desktop+phone) |
| duck › Duck Neue Runde redraws Chuck | unit | `src/lib/games/duck/engine.test.ts` › "Scenario: Duck Neue Runde redraws Chuck" ✓ |
| duck › Duck engine is deterministic and pure | unit | `src/lib/games/duck/engine.test.ts` › "Scenario: Duck engine is deterministic and pure" ✓ |
| duck › Duck session resumes after reload | e2e | `e2e/duck.test.ts` › "Scenario: Duck session resumes after reload" ✓ (desktop+phone) |
| duck › Leaving Duck asks for confirmation | e2e | `e2e/duck.test.ts` › "Scenario: Leaving Duck asks for confirmation" ✓ (desktop+phone) |
| duck › Duck demo script plays to the end | unit | `src/lib/games/duck/demo.test.ts` › "Scenario: Duck demo script plays to the end" ✓ |
| duck › Duck demo by tapping highlighted controls | e2e | `e2e/duck.test.ts` › "Scenario: Duck demo by tapping highlighted controls" ✓ (desktop+phone) |
| duck › Duck cues sound right | manual (audio judgement on a real device at Gate 2) | manual — checklist below |
| duck › Duck art on tile and start screen | e2e | `e2e/duck.test.ts` › "Scenario: Duck art on tile and start screen" ✓ (desktop+phone) |
| duck › Duck screens meet the look rules | e2e ("Scenario: Text contrast meets 4.5:1", "Scenario: Touch targets are at least 44px", "Scenario: No horizontal scroll on phone") | `e2e/look.test.ts` (walks `e2e/walks/duck.ts`) › all three ✓ (contrast and touch targets desktop+phone; horizontal scroll phone) |
| duck › Duck copy reads neutral | e2e | `e2e/duck.test.ts` › "Scenario: Duck copy reads neutral" ✓ (desktop+phone) |
| most-likely › Most Likely lobby offers rounds | e2e | `e2e/most-likely.test.ts` › "Scenario: Most Likely lobby offers rounds" ✓ (desktop+phone) |
| most-likely › Most Likely needs three players | e2e | `e2e/most-likely.test.ts` › "Scenario: Most Likely needs three players" ✓ (desktop+phone) |
| most-likely › Most Likely roster above maximum asks who plays | e2e | `e2e/most-likely.test.ts` › "Scenario: Most Likely roster above maximum asks who plays" ✓ (desktop+phone) |
| most-likely › Most Likely prompts do not repeat until the pool is used | unit | `src/lib/games/most-likely/engine.test.ts` › "Scenario: Most Likely prompts do not repeat until the pool is used" ✓ |
| most-likely › Anderer Spruch returns the rejected prompt | unit | `src/lib/games/most-likely/engine.test.ts` › "Scenario: Anderer Spruch returns the rejected prompt" ✓ |
| most-likely › Confirm needs at least one player | e2e | `e2e/most-likely.test.ts` › "Scenario: Confirm needs at least one player" ✓ (desktop+phone) |
| most-likely › Tied pick gives every chosen player a title | unit | `src/lib/games/most-likely/engine.test.ts` › "Scenario: Tied pick gives every chosen player a title" ✓ |
| most-likely › Full Most Likely To game | e2e | `e2e/most-likely.test.ts` › "Scenario: Full Most Likely To game" ✓ (desktop+phone) |
| most-likely › Most Likely tie at the top reads Unentschieden | e2e | `e2e/most-likely.test.ts` › "Scenario: Most Likely tie at the top reads Unentschieden" ✓ (desktop+phone) |
| most-likely › Most Likely rematch keeps the players | unit | `src/lib/games/most-likely/engine.test.ts` › "Scenario: Most Likely rematch keeps the players" ✓ |
| most-likely › Most Likely engine is deterministic and pure | unit | `src/lib/games/most-likely/engine.test.ts` › "Scenario: Most Likely engine is deterministic and pure" ✓ |
| most-likely › Most Likely session resumes after reload | e2e | `e2e/most-likely.test.ts` › "Scenario: Most Likely session resumes after reload" ✓ (desktop+phone) |
| most-likely › Leaving Most Likely asks for confirmation | e2e | `e2e/most-likely.test.ts` › "Scenario: Leaving Most Likely asks for confirmation" ✓ (desktop+phone) |
| most-likely › Most Likely demo script plays to the end | unit | `src/lib/games/most-likely/demo.test.ts` › "Scenario: Most Likely demo script plays to the end" ✓ |
| most-likely › Most Likely demo by tapping highlighted controls | e2e | `e2e/most-likely.test.ts` › "Scenario: Most Likely demo by tapping highlighted controls" ✓ (desktop+phone) |
| most-likely › Most Likely cues sound right | manual (audio judgement on a real device at Gate 2) | manual — checklist below |
| most-likely › Most Likely art on tile and start screen | e2e | `e2e/most-likely.test.ts` › "Scenario: Most Likely art on tile and start screen" ✓ (desktop+phone) |
| most-likely › Most Likely screens meet the look rules | e2e ("Scenario: Text contrast meets 4.5:1", "Scenario: Touch targets are at least 44px", "Scenario: No horizontal scroll on phone") | `e2e/look.test.ts` (walks `e2e/walks/most-likely.ts`) › all three ✓ (contrast and touch targets desktop+phone; horizontal scroll phone) |
| most-likely › Most Likely copy reads neutral | e2e | `e2e/most-likely.test.ts` › "Scenario: Most Likely copy reads neutral" ✓ (desktop+phone) |
| release › Package and lockfile carry 0.2.0 | unit | `scripts/version.test.ts` › "Scenario: Package and lockfile carry 0.2.0" ✓ |
| release › Release v0.2.0 published | manual (runs on GitHub after the ship-time tag push) | manual — ship-time step (task 6.1), checklist below |

## Manual checklist (Gate 2)

Start with `npm run dev` → http://localhost:5173, sound on, on a phone if possible.

- [ ] Codes cues sound right: play one Codes round (Treffer, Daneben, Überspringen); cues fit and none is missing or doubled.
- [ ] Duck cues sound right: play one Duck word through scoring; cues fit.
- [ ] Most Likely cues sound right: play one Most Likely round through the reveal; cues fit.
- [ ] Look approved on screenshots: skim `shots/phone-look-home.png` and `shots/desktop-look-home.png`; the home grid still reads as one arcade with five tiles.
- [ ] New games' screens approved on screenshots: skim `shots/*-look-{start,lobby}-{codes,duck,most-likely}.png` and the `*-look-codes-*`, `*-look-duck-*`, `*-look-most-likely-*` game screens on phone and desktop; look and tone are right.
- [ ] Release v0.2.0 published (ship time, after Gate 2): tag `v0.2.0` pushed, GitHub release v0.2.0 exists with `rues-arcade-0.2.0.tgz` and its `.sha256` attached.

## Diffstat

`git diff --stat main...flow/add-three-games`: 145 files changed, 6541 insertions(+), 75 deletions(-)

Top-level: `src/` 42 files (games/codes, games/duck, games/most-likely, content, deco, ui, server, routes), `e2e/` 12 (incl. `e2e/walks/`), `openspec/` 86 (change dir, incl. the 72 committed `shots/`), `migrations/` 2, `scripts/` 1, `package.json`, `package-lock.json`.

## Screenshots

`openspec/changes/add-three-games/shots/` — 72 files, phone and desktop each:

- home: `{phone,desktop}-home.png`, `{phone,desktop}-look-home.png`
- start: `{phone,desktop}-look-start-{codes,duck,most-likely}.png`
- lobby: `{phone,desktop}-lobby-{codes-seven,duck,most-likely}.png`, `{phone,desktop}-look-lobby-{codes,duck,most-likely}.png`
- inhalte: `{phone,desktop}-inhalte-codes.png`
- codes: `{phone,desktop}-look-codes-{reveal,reveal-held,play,play-late,result,result-skipped,gameover}.png`
- duck: `{phone,desktop}-look-duck-{reveal,reveal-shown,scoring,scoring-locked,skip,standings,gameover}.png`, `{phone,desktop}-duck-demo-scoring.png`
- most-likely: `{phone,desktop}-look-most-likely-{prompt,pick,pick-chosen,reveal,gameover}.png`, `{phone,desktop}-most-likely-{prompt,pick,tie,gameover}.png`

Not shot by the e2e run: the So-geht's pages of the new games and the Inhalte pages of Duck and Most Likely (single-text mode is shot only for Codes).

## Review

Round 1 (fresh-context reviewer on `git diff main...flow/add-three-games`): no weakened tests (every changed pre-existing test is justified by the delta specs), no spec mismatch, no correctness findings. Two weak tests:

- [weak] `src/lib/games/codes/engine.test.ts` — "Scenario: Anderes Wort on a pool of one word" did not pin down "the button is disabled on screen". → **Fixed** in 7a8849d: e2e test of the same name on a one-word pool asserts "Anderes Wort" is disabled; shown red with the condition broken.
- [weak] `e2e/codes.test.ts` — "Scenario: Codes roster above maximum asks who plays" checked only the upper bound. → **Fixed** in 7a8849d: asserts "höchstens 20", Weiter enabled at 20 and 4, disabled at 3; shown red with `minPlayers` 3.

Noted, not a finding (no scenario covers it): Duck's "Neue Runde" resets the used-word list, while the Codes and Most Likely rematches keep theirs. Left for the Gate 2 judgement.

Round 2 (reviewer on `git diff ecb9914..7a8849d`): no findings. Verifier round 2 at 7a8849d: proof:full green, 0 gaps.
