verified-at: bd1d6eb

# Verification — party-games-rebuild (round 6)

Round 6 after the Gate 2 reopen (S18–S21: decoration, start-screen layout, Wavelength Koop, neutral copy).

## Layer 1 — `npm run proof:full` (green, exit 0)

```
COMPLETED 428 FILES 0 ERRORS 0 WARNINGS 0 FILES_WITH_PROBLEMS   (svelte-check --fail-on-warnings)
✓ built in 389ms                                                (vite build)
 Test Files  17 passed (17)
      Tests  109 passed (109)                                   (vitest)
  ✓  121 [phone] › e2e/demo.test.ts:193:1 › Scenario: Demo steppable with reduced motion (1.2s)
  ✓  123 [desktop] › e2e/wavelength.test.ts:300:1 › Scenario: Koop session resumes after reload (4.4s)
  ✓  126 [desktop] › e2e/wavelength.test.ts:328:1 › Scenario: Turn verdicts read neutral (306ms)
  ✓  124 [desktop] › e2e/demo.test.ts:201:1 › Scenario: Demo works with an empty database (15.5s)
  ✓  109 [phone] › e2e/look.test.ts:216:1 › Scenario: Text contrast meets 4.5:1 (29.4s)
  ✓  125 [phone] › e2e/demo.test.ts:201:1 › Scenario: Demo works with an empty database (16.9s)
  ✓  122 [desktop] › e2e/look.test.ts:216:1 › Scenario: Text contrast meets 4.5:1 (29.5s)
  ✓  127 [phone] › e2e/look.test.ts:286:1 › Scenario: Press Start 2P stays limited to logo and scores (20.9s)
  ✓  128 [desktop] › e2e/look.test.ts:286:1 › Scenario: Press Start 2P stays limited to logo and scores (21.8s)
  ✓  129 [phone] › e2e/look.test.ts:315:1 › Scenario: Decoration loads no external assets (29.1s)
  ✓  130 [desktop] › e2e/look.test.ts:315:1 › Scenario: Decoration loads no external assets (29.6s)
  ✓  131 [phone] › e2e/look.test.ts:330:1 › Scenario: New copy has no exclamation marks (21.8s)
  ✓  132 [desktop] › e2e/look.test.ts:330:1 › Scenario: New copy has no exclamation marks (22.8s)
  -  134 [desktop] › e2e/look.test.ts:345:1 › Scenario: No horizontal scroll on phone
  ✓  133 [phone] › e2e/look.test.ts:345:1 › Scenario: No horizontal scroll on phone (30.7s)
  -  136 [phone] › e2e/look.test.ts:350:1 › Scenario: Desktop uses the width
  ✓  137 [phone] › e2e/look.test.ts:468:2 › reduced motion › Scenario: Reduced motion makes transitions instant (243ms)
  ✓  138 [phone] › e2e/look.test.ts:480:1 › Scenario: Motion never blocks input (253ms)
  ✓  135 [desktop] › e2e/look.test.ts:350:1 › Scenario: Desktop uses the width (30.6s)
  ✓  139 [desktop] › e2e/look.test.ts:468:2 › reduced motion › Scenario: Reduced motion makes transitions instant (206ms)
  ✓  140 [desktop] › e2e/look.test.ts:480:1 › Scenario: Motion never blocks input (270ms)

  2 skipped
  138 passed (3.0m)
```

The 2 Playwright skips are by design: `Scenario: No horizontal scroll on phone` skips on `desktop`,
`Scenario: Desktop uses the width` skips on `phone` (`test.skip(info.project.name !== …)` in `e2e/look.test.ts`).
Run on Node v26.8.1; `engines.node` is `>=22.18`. Since round 5: vitest 87 → 109, Playwright 100 → 138 passed.

## Layer 2 — spec coverage

Collected from the 12 delta specs at bd1d6eb: 117 scenarios (83 in round 5, 34 added for S18–S21). Each unit/e2e name
was matched against the green Layer 1 output; e2e rows passed in both projects (`phone`, `desktop`) unless noted.

| Scenario | proof | Evidence |
|---|---|---|
| Tiles for registered games | e2e | `e2e/home.test.ts:6` › "Scenario: Tiles for registered games" ✓ |
| Player range derived from engine limits | unit | `src/lib/games/registry.test.ts` › "Scenario: Player range derived from engine limits" ✓ |
| Bald tiles have no actions | e2e | `e2e/home.test.ts:22` › "Scenario: Bald tiles have no actions" ✓ |
| Each tile shows a one-line pitch | e2e | `e2e/deco.test.ts:9` › "Scenario: Each tile shows a one-line pitch" ✓ |
| Start banner carries title, badge and player range | e2e | `e2e/start.test.ts:87` › "Scenario: Start banner carries title, badge and player range" ✓ |
| Start panel first on phone, right column on desktop | e2e | `e2e/start.test.ts:97` › "Scenario: Start panel first on phone, right column on desktop" ✓ |
| Same start layout for both games | e2e ("Scenario: Start panel first on phone, right column on desktop") | `e2e/start.test.ts:97` › "Scenario: Start panel first on phone, right column on desktop" ✓ |
| Mehr-zu cards keep their targets | e2e | `e2e/start.test.ts:135` › "Scenario: Mehr-zu cards keep their targets" ✓ |
| Inhalte card shows the real content count | e2e | `e2e/start.test.ts:156` › "Scenario: Inhalte card shows the real content count" ✓ |
| Los geht's opens the lobby | e2e | `e2e/start.test.ts:69` › "Scenario: Los geht's opens the lobby" ✓ |
| So geht's covers both Wavelength modes | e2e | `e2e/start.test.ts:80` › "Scenario: So geht's covers both Wavelength modes" ✓ |
| Fresh database runs with empty tables | e2e | `e2e/home.test.ts:40` › "Scenario: Fresh database runs with empty tables" ✓ |
| Migration failure refuses to start | unit | `src/lib/server/db.test.ts` › "Scenario: Migration failure refuses to start" ✓ |
| Migrations are applied once | unit | `src/lib/server/db.test.ts` › "Scenario: Migrations are applied once" ✓ |
| Add, edit and delete an entry | e2e | `e2e/content.test.ts:15` › "Scenario: Add, edit and delete an entry" ✓ |
| Delete asks for confirmation | e2e | `e2e/content.test.ts:46` › "Scenario: Delete asks for confirmation" ✓ |
| Bulk import reports skipped and malformed lines | unit | `src/lib/server/content.test.ts` › "Scenario: Bulk import reports skipped and malformed lines" ✓ |
| Overlong text rejected | unit | `src/lib/content/parse.test.ts`, `src/lib/server/content.test.ts` › "Scenario: Overlong text rejected" ✓ |
| Import prints counts | unit | `scripts/import.test.ts` › "Scenario: Import prints counts" ✓ |
| Re-running the import adds no duplicates | unit | `scripts/import.test.ts` › "Scenario: Re-running the import adds no duplicates" ✓ |
| Missing table is named, the other still imported | unit | `scripts/import.test.ts` › "Scenario: Missing table is named, the other still imported" ✓ |
| Source missing or not SQLite | unit | `scripts/import.test.ts` › "Scenario: Source missing or not SQLite" ✓ |
| Name placeholders preserved | unit | `scripts/import.test.ts` › "Scenario: Name placeholders preserved" ✓ |
| Empty pool blocks start | e2e | `e2e/start.test.ts:50` › "Scenario: Empty pool blocks start" ✓ |
| Demo works with an empty database | e2e | `e2e/demo.test.ts:201` › "Scenario: Demo works with an empty database" ✓ |
| Only the expected control is enabled | e2e | `e2e/demo.test.ts:54` › "Scenario: Only the expected control is enabled" ✓ |
| Hidden information shown with Demo tag | e2e | `e2e/demo.test.ts:86` › "Scenario: Hidden information shown with Demo tag" ✓ |
| Demo leaves real data untouched | e2e | `e2e/demo.test.ts:100` › "Scenario: Demo leaves real data untouched" ✓ |
| Exiting returns to the starting screen | e2e | `e2e/demo.test.ts:142` › "Scenario: Exiting returns to the starting screen" ✓ |
| Reload during demo returns to start screen | e2e | `e2e/demo.test.ts:183` › "Scenario: Reload during demo returns to start screen" ✓ |
| Demo steppable with reduced motion | e2e | `e2e/demo.test.ts:193` › "Scenario: Demo steppable with reduced motion" ✓ |
| Text contrast meets 4.5:1 | e2e | `e2e/look.test.ts:216` › "Scenario: Text contrast meets 4.5:1" ✓ |
| Look approved on screenshots | manual (visual judgement at Gate 2) | `shots/*.png` (106 files; `{phone,desktop}-look-<screen>.png` walk all screens) |
| Touch targets are at least 44px | e2e | `e2e/look.test.ts:193` › "Scenario: Touch targets are at least 44px" ✓ |
| Hold-to-view reveals only while held | e2e | `e2e/imposter.test.ts:75` › "Scenario: Hold-to-view reveals only while held" ✓ |
| No horizontal scroll on phone | e2e | `e2e/look.test.ts:345` › "Scenario: No horizontal scroll on phone" ✓ (phone; skipped on desktop by design) |
| Desktop uses the width | manual (visual judgement at Gate 2, on the e2e screenshots) | `shots/desktop-look-*.png`; coarse check `e2e/look.test.ts:350` › "Scenario: Desktop uses the width" ✓ (desktop; skipped on phone by design) |
| Reduced motion makes transitions instant | e2e | `e2e/look.test.ts:468` › "Scenario: Reduced motion makes transitions instant" ✓ |
| Motion never blocks input | e2e | `e2e/look.test.ts:480` › "Scenario: Motion never blocks input" ✓ |
| Decoration on every main screen | e2e | `e2e/deco.test.ts:98` › "Scenario: Decoration on every main screen" ✓ |
| Decoration is hidden and never takes pointer events | e2e | `e2e/deco.test.ts:142` › "Scenario: Decoration is hidden and never takes pointer events" ✓ |
| Ambient motion runs during play | e2e | `e2e/deco.test.ts:189` › "Scenario: Ambient motion runs during play" ✓ |
| Reduced motion turns ambient motion off | e2e | `e2e/deco.test.ts:205` › "Scenario: Reduced motion turns ambient motion off" ✓ |
| Game without its own art gets the neutral fallback | unit | `src/lib/deco/motifs.test.ts` › "Scenario: Game without its own art gets the neutral fallback" ✓ |
| Contrast and layout rules hold with decoration | e2e ("Scenario: Text contrast meets 4.5:1", "Scenario: No horizontal scroll on phone") | `e2e/look.test.ts:216` › "Scenario: Text contrast meets 4.5:1" ✓, `e2e/look.test.ts:345` › "Scenario: No horizontal scroll on phone" ✓ (phone) — both over the decorated walk |
| Press Start 2P stays limited to logo and scores | e2e | `e2e/look.test.ts:286` › "Scenario: Press Start 2P stays limited to logo and scores" ✓ |
| Decoration loads no external assets | e2e | `e2e/look.test.ts:315` › "Scenario: Decoration loads no external assets" ✓ |
| Decorated screens approved on screenshots | manual (visual judgement at Gate 2) | `shots/{phone,desktop}-look-*.png` incl. new `look-*-koop-*` and `look-lobby-wavelength-koop` |
| New copy has no exclamation marks | e2e | `e2e/look.test.ts:330` › "Scenario: New copy has no exclamation marks" ✓ |
| New copy reads neutral and grown-up | manual (tone is a judgement call, at Gate 2) | Gate 2 checklist; mechanical half `e2e/look.test.ts:330` › "Scenario: New copy has no exclamation marks" ✓ |
| No explanation shows empty state | e2e | `e2e/explain.test.ts:17` › "Scenario: No explanation shows empty state" ✓ |
| Committed explanation is shown sandboxed | e2e | `e2e/explain.test.ts:25` › "Scenario: Committed explanation is shown sandboxed" ✓ |
| Close by button or Esc | e2e | `e2e/explain.test.ts:47` › "Scenario: Close by button or Esc" ✓ |
| Same seed and actions give the same state | unit | `src/lib/games/imposter/engine.test.ts`, `src/lib/games/wavelength/engine.test.ts` › "Scenario: Same seed and actions give the same state" ✓ |
| Reducer does not mutate its input | unit | `src/lib/games/imposter/engine.test.ts`, `src/lib/games/wavelength/engine.test.ts` › "Scenario: Reducer does not mutate its input" ✓ |
| Reload mid-game resumes the same phase | e2e | `e2e/imposter.test.ts:109` › "Scenario: Reload mid-game resumes the same phase" ✓ |
| Spiel beenden clears the session | e2e | `e2e/imposter.test.ts:132` › "Scenario: Spiel beenden clears the session" ✓ |
| Old or corrupt saved state discarded | e2e | `e2e/start.test.ts:187` › "Scenario: Old or corrupt saved state discarded" ✓ |
| Two tabs last write wins | unit | `src/lib/session.test.ts` › "Scenario: Two tabs last write wins" ✓ |
| Roster edit mid-game keeps the session snapshot | unit | `src/lib/session.test.ts` › "Scenario: Roster edit mid-game keeps the session snapshot" ✓ |
| Proof prints test names and passes | manual (infrastructure; proven by running it — its output is the evidence every other unit relies on) | this file's Layer 1: every test prints by name, exit 0 |
| Proof fails on a failing check | manual (infrastructure; proven by running it once with a deliberately failing test during U1) | proven by the U1 builder; not re-run here |
| Proof-full runs e2e on an isolated database | manual (infrastructure; proven by running it) | `e2e/healthz.test.ts:14` › "Scenario: Proof-full runs e2e on an isolated database" ✓ |
| Full Imposter round | e2e | `e2e/imposter.test.ts:39` › "Scenario: Full Imposter round" ✓ |
| Hand-over between players | e2e | `e2e/imposter.test.ts:62` › "Scenario: Hand-over between players" ✓ |
| Skip redraws and restarts the reveal | unit | `src/lib/games/imposter/engine.test.ts` › "Scenario: Skip redraws and restarts the reveal" ✓ |
| Name placeholders filled with distinct names | unit | `src/lib/games/imposter/engine.test.ts` › "Scenario: Name placeholders filled with distinct names" ✓ |
| No repeats until the pool is exhausted | unit | `src/lib/games/imposter/engine.test.ts` › "Scenario: No repeats until the pool is exhausted" ✓ |
| Pool of one pair repeats | unit | `src/lib/games/imposter/engine.test.ts` › "Scenario: Pool of one pair repeats" ✓ |
| Imposter demo script plays to the end | unit | `src/lib/games/imposter/engine.test.ts` › "Scenario: Imposter demo script plays to the end" ✓ |
| Imposter demo by tapping highlighted controls | e2e | `e2e/demo.test.ts:40` › "Scenario: Imposter demo by tapping highlighted controls" ✓ |
| CI is green on the change's PR | manual (runs on GitHub; the change's own PR shows the checks green) | pending-ship — task 21.1 (⚠, shipper after Gate 2) |
| Tag does not match the version | manual (runs on GitHub on a tag push; tagging is manual and outside this change) | `.github/workflows/release.yml` job `check-tag`; runs on a manual tag push, outside this change |
| Package produces a verifiable tarball | unit | `scripts/package.test.ts` › "Scenario: Package produces a verifiable tarball" ✓ |
| Missing database directory is created | unit | `src/lib/server/db.test.ts` › "Scenario: Missing database directory is created" ✓ |
| Server starts from any working directory | e2e | `e2e/healthz.test.ts:25` › "Scenario: Server starts from any working directory" ✓ |
| Healthy server | e2e | `e2e/healthz.test.ts:9` › "Scenario: Healthy server" ✓ |
| Unhealthy database | unit | `src/routes/healthz/healthz.test.ts` › "Scenario: Unhealthy database" ✓ |
| Harness declared with merge policy | manual (documentation; checked by reading the file at Gate 1/2) | `CLAUDE.md` `## Harness` lists proof, proof-full, run, package, `ship: merge` |
| Roster survives reload | e2e | `e2e/roster.test.ts:13` › "Scenario: Roster survives reload" ✓ |
| Rename and remove a player | unit | `src/lib/roster.test.ts` › "Scenario: Rename and remove a player" ✓ |
| Empty or whitespace name rejected | unit | `src/lib/roster.test.ts` › "Scenario: Empty or whitespace name rejected" ✓ |
| Duplicate name rejected | unit | `src/lib/roster.test.ts` › "Scenario: Duplicate name rejected" ✓ |
| First run shows empty roster prompt | e2e | `e2e/roster.test.ts:4` › "Scenario: First run shows empty roster prompt" ✓ |
| Storage unavailable works for the session | unit | `src/lib/roster.test.ts` › "Scenario: Storage unavailable works for the session" ✓ |
| Below minimum disables start | e2e | `e2e/start.test.ts:6` › "Scenario: Below minimum disables start" ✓ |
| Above maximum asks who plays | e2e | `e2e/start.test.ts:24` › "Scenario: Above maximum asks who plays" ✓ |
| Mute is remembered | unit | `src/lib/sound.test.ts` › "Scenario: Mute is remembered" ✓ |
| No sound before first interaction | unit | `src/lib/sound.test.ts` › "Scenario: No sound before first interaction" ✓ |
| WebAudio unavailable stays silent | unit | `src/lib/sound.test.ts` › "Scenario: WebAudio unavailable stays silent" ✓ |
| Effects sound right | manual (audio judgement on a real device at Gate 2) | Gate 2 checklist |
| Full Wavelength game | e2e | `e2e/wavelength.test.ts:80` › "Scenario: Full Wavelength game" ✓ |
| Scoring bands | unit | `src/lib/games/wavelength/engine.test.ts` › "Scenario: Scoring bands" ✓ |
| Target at the extremes scores correctly | unit | `src/lib/games/wavelength/engine.test.ts` › "Scenario: Target at the extremes scores correctly" ✓ |
| Psychic rotates within the team | unit | `src/lib/games/wavelength/engine.test.ts` › "Scenario: Psychic rotates within the team" ✓ |
| Tie for first shown as tie | e2e | `e2e/wavelength.test.ts:173` › "Scenario: Tie for first shown as tie" ✓ |
| Play again keeps the teams | unit | `src/lib/games/wavelength/engine.test.ts` › "Scenario: Play again keeps the teams" ✓ |
| Redraw changes spectrum and target | unit | `src/lib/games/wavelength/engine.test.ts` › "Scenario: Redraw changes spectrum and target" ✓ |
| Dial by keyboard | e2e | `e2e/wavelength.test.ts:125` › "Scenario: Dial by keyboard" ✓ |
| Dial by drag | e2e | `e2e/wavelength.test.ts:145` › "Scenario: Dial by drag" ✓ |
| Wavelength demo script plays to the end | unit | `src/lib/games/wavelength/engine.test.ts` › "Scenario: Wavelength demo script plays to the end" ✓ |
| Wavelength demo stays the Versus demo | unit | `src/lib/games/wavelength/engine.test.ts` › "Scenario: Wavelength demo stays the Versus demo" ✓ |
| Wavelength demo by tapping highlighted controls | e2e | `e2e/demo.test.ts:47` › "Scenario: Wavelength demo by tapping highlighted controls" ✓ |
| Four or more players default to Versus | e2e | `e2e/wavelength.test.ts:222` › "Scenario: Four or more players default to Versus" ✓ |
| Two or three players get Koop only | e2e | `e2e/wavelength.test.ts:249` › "Scenario: Two or three players get Koop only" ✓ |
| One player cannot start Wavelength | e2e | `e2e/start.test.ts:173` › "Scenario: One player cannot start Wavelength" ✓ |
| Wavelength player range reads 2–18 | unit | `src/lib/games/registry.test.ts` › "Scenario: Wavelength player range reads 2–18" ✓ |
| Full Wavelength Koop game | e2e | `e2e/wavelength.test.ts:267` › "Scenario: Full Wavelength Koop game" ✓ |
| Koop psychic order | unit | `src/lib/games/wavelength/engine.test.ts` › "Scenario: Koop psychic order" ✓ |
| Koop keeps one shared score | unit | `src/lib/games/wavelength/engine.test.ts` › "Scenario: Koop keeps one shared score" ✓ |
| Koop rating tiers | unit | `src/lib/games/wavelength/engine.test.ts` › "Scenario: Koop rating tiers" ✓ |
| Koop average per turn | unit | `src/lib/games/wavelength/engine.test.ts` › "Scenario: Koop average per turn" ✓ |
| Koop play again keeps players and mode | unit | `src/lib/games/wavelength/engine.test.ts` › "Scenario: Koop play again keeps players and mode" ✓ |
| Koop session resumes after reload | e2e | `e2e/wavelength.test.ts:300` › "Scenario: Koop session resumes after reload" ✓ |
| Saved Versus session from before resumes | unit | `src/lib/games/registry.test.ts` › "Scenario: Saved Versus session from before resumes" ✓ |
| Turn verdicts read neutral | e2e | `e2e/wavelength.test.ts:328` › "Scenario: Turn verdicts read neutral" ✓ |
| Wavelength demo tips read neutral | unit | `src/lib/games/wavelength/demo.test.ts` › "Scenario: Wavelength demo tips read neutral" ✓ |

117 scenarios: 106 ✓ automated (45 unit, 61 e2e — 2 of them via named proof lines; all passed in Layer 1), 10 manual,
1 pending-ship ("CI is green on the change's PR", task 21.1). Gaps: none.

## Manual (Gate 2)

Start: `npm run dev` → http://localhost:5173 (or page through `shots/`).

- Look approved on screenshots: page through `shots/{phone,desktop}-look-*.png` and `shots/{phone,desktop}-wavelength-*.png`; Inhalte shots show leftover e2e entries.
- Decorated screens approved on screenshots: home, both start screens, lobbies and play screens in `shots/{phone,desktop}-look-*.png` carry banner/art; judge the U17/U19/U20 taste items in flow.yaml notes (phone banner art over h1, rings behind the header bar, desktop Koop game over top half, '8 Punkte' in Press Start 2P, phone Koop result band labels vs. needle, desktop Koop lobby buttons left-aligned).
- New: Koop screens `shots/{phone,desktop}-look-lobby-wavelength-koop.png`, `look-wavelength-koop-{prep,result,gameover}.png`, plus `lobby-wavelength-koop{,-two}.png`, `wavelength-koop-{prep,result,gameover}.png`.
- Desktop uses the width: on `shots/desktop-look-*.png`, judge whether each screen uses the 1280px width (automated check is coarse).
- New copy reads neutral and grown-up: read the start screens' pitch and "So geht's", Koop lobby hints, Koop prep/result/game-over copy and turn verdicts on the shots — plain, no puns or slogans.
- Effects sound right: on a real phone, press/reveal/correct/wrong/win sound distinct, no sound before the first tap, mute survives a reload.
- Harness declared with merge policy: read `CLAUDE.md` `## Harness` — `ship: merge` is there.
- Proof fails on a failing check: optional — add `expect(1).toBe(2)` to any unit test, `npm run proof`, see it fail, revert.
- Tag does not match the version: nothing to do now; `release.yml` `check-tag` runs on the first `v*` tag push.

Pending-ship (not a gap): "CI is green on the change's PR" — after task 21.1 (⚠ irreversible, with consent), confirm the PR's `ci` and `security-baseline` checks are green and `release-tarball` is uploaded. Task 21.2 (ruleset) has no scenario.

## Diffstat

`git diff --stat main...flow/party-games-rebuild` (at bd1d6eb, before this commit):
239 files changed, 16138 insertions(+), 1 deletion(-) — of which 88 are `shots/*.png` (round 5's).

`git diff --stat 48b71b5...flow/party-games-rebuild` (the reopen, S18–S21):
63 files changed, 4399 insertions(+), 202 deletions(-) — src (deco components, Wavelength Koop engine/Setup/Screen, start/lobby/play routes, GameTile), e2e (deco, look, start, wavelength), change artifacts and mocks in `design/`.

## Screenshots

`openspec/changes/party-games-rebuild/shots/` — refreshed from this run's `test-results/shots/`: 106 PNGs
(74 changed, 14 byte-identical to round 5, 18 new).

New (Koop):
- `shots/{phone,desktop}-look-lobby-wavelength-koop.png`
- `shots/{phone,desktop}-look-wavelength-koop-prep.png`
- `shots/{phone,desktop}-look-wavelength-koop-result.png`
- `shots/{phone,desktop}-look-wavelength-koop-gameover.png`
- `shots/{phone,desktop}-lobby-wavelength-koop.png`, `shots/{phone,desktop}-lobby-wavelength-koop-two.png`
- `shots/{phone,desktop}-wavelength-koop-prep.png`, `-result.png`, `-gameover.png`

Refreshed (decoration, start layout): `shots/{phone,desktop}-look-home.png`, `look-start-imposter.png`, `look-start-wavelength.png`,
`look-lobby-imposter.png`, `look-lobby-wavelength.png`, `look-lobby-wavelength-short.png`, `look-lobby-pick.png`, every `look-imposter-*` and `look-wavelength-*`.
