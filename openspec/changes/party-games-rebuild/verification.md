verified-at: 777b90c

# Verification — party-games-rebuild (round 3)

## Layer 1 — `npm run proof:full` (green, exit 0)

```
COMPLETED 409 FILES 0 ERRORS 0 WARNINGS 0 FILES_WITH_PROBLEMS   (svelte-check --fail-on-warnings)
✓ built in 215ms                                                (vite build)
 Test Files  15 passed (15)
      Tests  86 passed (86)                                     (vitest)
  ✓  86 [phone] › e2e/demo.test.ts:181:1 › Scenario: Reload during demo returns to start screen (1.1s)
  ✓  87 [desktop] › e2e/demo.test.ts:181:1 › Scenario: Reload during demo returns to start screen (1.1s)
  ✓  88 [phone] › e2e/demo.test.ts:191:1 › Scenario: Demo steppable with reduced motion (1.0s)
  ✓  89 [desktop] › e2e/demo.test.ts:191:1 › Scenario: Demo steppable with reduced motion (972ms)
  ✓  82 [desktop] › e2e/look.test.ts:175:1 › Scenario: Text contrast meets 4.5:1 (20.7s)
  -  92 [desktop] › e2e/look.test.ts:232:1 › Scenario: No horizontal scroll on phone
  ✓  83 [phone] › e2e/look.test.ts:232:1 › Scenario: No horizontal scroll on phone (21.9s)
  -  94 [phone] › e2e/look.test.ts:237:1 › Scenario: Desktop uses the width
  ✓  95 [phone] › e2e/look.test.ts:355:2 › reduced motion › Scenario: Reduced motion makes transitions instant (233ms)
  ✓  96 [phone] › e2e/look.test.ts:367:1 › Scenario: Motion never blocks input (272ms)
  ✓  91 [desktop] › e2e/demo.test.ts:199:1 › Scenario: Demo works with an empty database (16.9s)
  ✓  90 [phone] › e2e/demo.test.ts:199:1 › Scenario: Demo works with an empty database (18.6s)
  ✓  93 [desktop] › e2e/look.test.ts:237:1 › Scenario: Desktop uses the width (22.0s)
  ✓  97 [desktop] › e2e/look.test.ts:355:2 › reduced motion › Scenario: Reduced motion makes transitions instant (224ms)
  ✓  98 [desktop] › e2e/look.test.ts:367:1 › Scenario: Motion never blocks input (255ms)

  2 skipped
  96 passed (1.3m)
```

The 2 Playwright skips are by design: `Scenario: No horizontal scroll on phone` skips on `desktop`,
`Scenario: Desktop uses the width` skips on `phone` (`test.skip(info.project.name !== …)` in `e2e/look.test.ts`).
Run on Node v26.8.1; `engines.node` is `>=22.18`.

## Layer 2 — spec coverage

Re-collected from the delta specs at 777b90c: 81 scenarios. e2e rows passed in both projects (`phone`, `desktop`) unless noted.

| Scenario | proof | Evidence |
|---|---|---|
| Tiles for registered games | e2e | `e2e/home.test.ts` › "Scenario: Tiles for registered games" ✓ |
| Player range derived from engine limits | unit | `src/lib/games/registry.test.ts` › "Scenario: Player range derived from engine limits" ✓ |
| Bald tiles have no actions | e2e | `e2e/home.test.ts` › "Scenario: Bald tiles have no actions" ✓ |
| Fresh database runs with empty tables | e2e | `e2e/home.test.ts` › "Scenario: Fresh database runs with empty tables" ✓ |
| Migration failure refuses to start | unit | `src/lib/server/db.test.ts` › "Scenario: Migration failure refuses to start" ✓ (+ "(server init hook rejects)" ✓) |
| Migrations are applied once | unit | `src/lib/server/db.test.ts` › "Scenario: Migrations are applied once" ✓ |
| Add, edit and delete an entry | e2e | `e2e/content.test.ts` › "Scenario: Add, edit and delete an entry" ✓ |
| Delete asks for confirmation | e2e | `e2e/content.test.ts` › "Scenario: Delete asks for confirmation" ✓ |
| Bulk import reports skipped and malformed lines | unit | `src/lib/server/content.test.ts` › "Scenario: Bulk import reports skipped and malformed lines" ✓ |
| Overlong text rejected | unit | `src/lib/server/content.test.ts` › "Scenario: Overlong text rejected" ✓ (+ `src/lib/content/parse.test.ts` "(bulk line)" ✓) |
| Import prints counts | unit | `scripts/import.test.ts` › "Scenario: Import prints counts" ✓ |
| Re-running the import adds no duplicates | unit | `scripts/import.test.ts` › "Scenario: Re-running the import adds no duplicates" ✓ |
| Missing table is named, the other still imported | unit | `scripts/import.test.ts` › "Scenario: Missing table is named, the other still imported" ✓ |
| Source missing or not SQLite | unit | `scripts/import.test.ts` › "importer › Scenario: Source missing or not SQLite" ✓ (wording widened in r3: zero-byte file, neither table, target not created) |
| Name placeholders preserved | unit | `scripts/import.test.ts` › "Scenario: Name placeholders preserved" ✓ |
| Empty pool blocks start | e2e | `e2e/start.test.ts` › "Scenario: Empty pool blocks start" ✓ |
| Demo works with an empty database | e2e | `e2e/demo.test.ts:199` › "Scenario: Demo works with an empty database" ✓ |
| Only the expected control is enabled | e2e | `e2e/demo.test.ts` › "Scenario: Only the expected control is enabled" ✓ |
| Hidden information shown with Demo tag | e2e | `e2e/demo.test.ts` › "Scenario: Hidden information shown with Demo tag" ✓ |
| Demo leaves real data untouched | e2e | `e2e/demo.test.ts:98` › "Scenario: Demo leaves real data untouched" ✓ |
| Exiting returns to the starting screen | e2e | `e2e/demo.test.ts:140` › "Scenario: Exiting returns to the starting screen" ✓ |
| Reload during demo returns to start screen | e2e | `e2e/demo.test.ts:181` › "Scenario: Reload during demo returns to start screen" ✓ |
| Demo steppable with reduced motion | e2e | `e2e/demo.test.ts:191` › "Scenario: Demo steppable with reduced motion" ✓ |
| Text contrast meets 4.5:1 | e2e | `e2e/look.test.ts:175` › "Scenario: Text contrast meets 4.5:1" ✓ (requirement now states the WCAG inactive-control exemption covers disabled buttons/form controls only) |
| Look approved on screenshots | manual (visual judgement at Gate 2) | `shots/*.png` (88 files; `{phone,desktop}-look-<screen>.png` walk all screens) |
| Touch targets are at least 44px | e2e | `e2e/look.test.ts` › "Scenario: Touch targets are at least 44px" ✓ |
| Hold-to-view reveals only while held | e2e | `e2e/imposter.test.ts` › "Scenario: Hold-to-view reveals only while held" ✓ |
| No horizontal scroll on phone | e2e | `e2e/look.test.ts:232` › "Scenario: No horizontal scroll on phone" ✓ (phone; skipped on desktop by design) |
| Desktop uses the width | manual (visual judgement at Gate 2, on the e2e screenshots) | `shots/desktop-look-*.png`; coarse check `e2e/look.test.ts:237` › "Scenario: Desktop uses the width" ✓ (desktop) |
| Reduced motion makes transitions instant | e2e | `e2e/look.test.ts:355` › "reduced motion › Scenario: Reduced motion makes transitions instant" ✓ |
| Motion never blocks input | e2e | `e2e/look.test.ts:367` › "Scenario: Motion never blocks input" ✓ |
| No explanation shows empty state | e2e | `e2e/explain.test.ts` › "Scenario: No explanation shows empty state" ✓ |
| Committed explanation is shown sandboxed | e2e | `e2e/explain.test.ts` › "Scenario: Committed explanation is shown sandboxed" ✓ |
| Close by button or Esc | e2e | `e2e/explain.test.ts` › "Scenario: Close by button or Esc" ✓ |
| Same seed and actions give the same state | unit | `src/lib/games/{imposter,wavelength}/engine.test.ts` › "Scenario: Same seed and actions give the same state" ✓ ✓ |
| Reducer does not mutate its input | unit | `src/lib/games/{imposter,wavelength}/engine.test.ts` › "Scenario: Reducer does not mutate its input" ✓ ✓ |
| Reload mid-game resumes the same phase | e2e | `e2e/imposter.test.ts` › "Scenario: Reload mid-game resumes the same phase" ✓ |
| Spiel beenden clears the session | e2e | `e2e/imposter.test.ts` › "Scenario: Spiel beenden clears the session" ✓ |
| Old or corrupt saved state discarded | unit | `src/lib/session.test.ts` › "session › Scenario: Old or corrupt saved state discarded" ✓ (wording widened in r3: state lacking the game's shape) |
| Two tabs last write wins | unit | `src/lib/session.test.ts` › "Scenario: Two tabs last write wins" ✓ |
| Roster edit mid-game keeps the session snapshot | unit | `src/lib/session.test.ts` › "Scenario: Roster edit mid-game keeps the session snapshot" ✓ |
| Proof prints test names and passes | manual (infrastructure) | this file's Layer 1: every test prints by name (vitest verbose, playwright list), exit 0 |
| Proof fails on a failing check | manual (infrastructure; proven during U1) | proven by the U1 builder with a deliberately failing test; not re-run here |
| Proof-full runs e2e on an isolated database | manual (infrastructure) | `e2e/healthz.test.ts` › "Scenario: Proof-full runs e2e on an isolated database" ✓ |
| Full Imposter round | e2e | `e2e/imposter.test.ts` › "Scenario: Full Imposter round" ✓ |
| Hand-over between players | e2e | `e2e/imposter.test.ts` › "Scenario: Hand-over between players" ✓ |
| Skip redraws and restarts the reveal | unit | `src/lib/games/imposter/engine.test.ts` › "Scenario: Skip redraws and restarts the reveal" ✓ |
| Name placeholders filled with distinct names | unit | `src/lib/games/imposter/engine.test.ts` › "Scenario: Name placeholders filled with distinct names" ✓ |
| No repeats until the pool is exhausted | unit | `src/lib/games/imposter/engine.test.ts` › "Scenario: No repeats until the pool is exhausted" ✓ |
| Pool of one pair repeats | unit | `src/lib/games/imposter/engine.test.ts` › "Scenario: Pool of one pair repeats" ✓ |
| Imposter demo script plays to the end | unit | `src/lib/games/imposter/engine.test.ts` › "Scenario: Imposter demo script plays to the end" ✓ |
| Imposter demo by tapping highlighted controls | e2e | `e2e/demo.test.ts` › "Scenario: Imposter demo by tapping highlighted controls" ✓ |
| CI is green on the change's PR | manual (runs on GitHub) | ship-time — deferred to ship, task 14.1 |
| Tag does not match the version | manual (runs on GitHub on a tag push) | `.github/workflows/release.yml` job `check-tag`; runs only on a manual tag push, outside this change |
| Package produces a verifiable tarball | unit | `scripts/package.test.ts` › "Scenario: Package produces a verifiable tarball" ✓ |
| Missing database directory is created | unit | `src/lib/server/db.test.ts` › "Scenario: Missing database directory is created" ✓ |
| Healthy server | e2e | `e2e/healthz.test.ts` › "Scenario: Healthy server" ✓ |
| Unhealthy database | unit | `src/routes/healthz/healthz.test.ts` › "Scenario: Unhealthy database" ✓ |
| Harness declared with merge policy | manual (documentation) | `CLAUDE.md` `## Harness` lists proof, proof-full, run, package, `ship: merge` |
| Roster survives reload | e2e | `e2e/roster.test.ts` › "Scenario: Roster survives reload" ✓ |
| Rename and remove a player | unit | `src/lib/roster.test.ts` › "Scenario: Rename and remove a player" ✓ |
| Empty or whitespace name rejected | unit | `src/lib/roster.test.ts` › "Scenario: Empty or whitespace name rejected" ✓ |
| Duplicate name rejected | unit | `src/lib/roster.test.ts` › "Scenario: Duplicate name rejected" ✓ |
| First run shows empty roster prompt | e2e | `e2e/roster.test.ts` › "Scenario: First run shows empty roster prompt" ✓ |
| Storage unavailable works for the session | unit | `src/lib/roster.test.ts` › "Scenario: Storage unavailable works for the session" ✓ |
| Below minimum disables start | e2e | `e2e/start.test.ts` › "Scenario: Below minimum disables start" ✓ |
| Above maximum asks who plays | e2e | `e2e/start.test.ts` › "Scenario: Above maximum asks who plays" ✓ |
| Mute is remembered | unit | `src/lib/sound.test.ts` › "Scenario: Mute is remembered" ✓ |
| No sound before first interaction | unit | `src/lib/sound.test.ts` › "Scenario: No sound before first interaction" ✓ |
| WebAudio unavailable stays silent | unit | `src/lib/sound.test.ts` › "Scenario: WebAudio unavailable stays silent" ✓ |
| Effects sound right | manual (audio judgement on a real device at Gate 2) | Gate 2 checklist |
| Full Wavelength game | e2e | `e2e/wavelength.test.ts` › "Scenario: Full Wavelength game" ✓ |
| Scoring bands | unit | `src/lib/games/wavelength/engine.test.ts` › "Scenario: Scoring bands" ✓ |
| Target at the extremes scores correctly | unit | `src/lib/games/wavelength/engine.test.ts` › "Scenario: Target at the extremes scores correctly" ✓ |
| Psychic rotates within the team | unit | `src/lib/games/wavelength/engine.test.ts` › "Scenario: Psychic rotates within the team" ✓ |
| Tie for first shown as tie | e2e | `e2e/wavelength.test.ts:173` › "Scenario: Tie for first shown as tie" ✓ (was unit in r2; the engine test is now "winners returns every team tied for first", uncounted); shot `shots/{phone,desktop}-wavelength-tie.png` |
| Redraw changes spectrum and target | unit | `src/lib/games/wavelength/engine.test.ts` › "Scenario: Redraw changes spectrum and target" ✓ |
| Dial by keyboard | e2e | `e2e/wavelength.test.ts` › "Scenario: Dial by keyboard" ✓ |
| Dial by drag | e2e | `e2e/wavelength.test.ts` › "Scenario: Dial by drag" ✓ |
| Wavelength demo script plays to the end | unit | `src/lib/games/wavelength/engine.test.ts` › "Scenario: Wavelength demo script plays to the end" ✓ |
| Wavelength demo by tapping highlighted controls | e2e | `e2e/demo.test.ts` › "Scenario: Wavelength demo by tapping highlighted controls" ✓ |

81 scenarios, 81 with evidence (72 automated: 35 unit, 37 e2e, all passed in Layer 1; 9 manual). Gaps: none.
Deferred to ship: "CI is green on the change's PR" (task 14.1).

## Manual (Gate 2)

- Look approved on screenshots: page through `shots/{phone,desktop}-look-*.png` (incl. `look-lobby-wavelength-short`, `look-imposter-handover`, `look-lobby-wavelength` for the r2 Sora round buttons) and `shots/{phone,desktop}-wavelength-tie.png`; Inhalte shots show leftover e2e entries.
- Desktop uses the width: on `shots/desktop-look-*.png`, judge whether each screen uses the 1280px width (automated check is coarse, ≥75% reach).
- Effects sound right: `npm run dev` → http://localhost:5173 on a real phone; press/reveal/correct/wrong/win sound distinct, no sound before the first tap, mute survives a reload.
- Harness declared with merge policy: read `CLAUDE.md` `## Harness` — `ship: merge` is there.
- Proof fails on a failing check: optional re-check — add `expect(1).toBe(2)` to any unit test, `npm run proof`, see it fail, revert.
- Tag does not match the version: nothing to do now; `release.yml` `check-tag` runs on the first `v*` tag push.
- CI is green on the change's PR: after 14.1, confirm the PR's checks are green.

## Diffstat

`git diff --stat main...flow/party-games-rebuild` (at 777b90c, before this commit):
208 files changed, 11758 insertions(+) — of which 86 are round-2 `shots/*.png`; without `shots/`: 122 files changed, 11758 insertions(+).

## Screenshots

`openspec/changes/party-games-rebuild/shots/` — 88 PNGs from this green run (`phone-*.png`, `desktop-*.png`),
including the look walk `{phone,desktop}-look-<screen>.png`. New since round 2:
`shots/phone-wavelength-tie.png`, `shots/desktop-wavelength-tie.png`.

- look-lobby-wavelength-short: `shots/phone-look-lobby-wavelength-short.png`, `shots/desktop-look-lobby-wavelength-short.png`
- look-imposter-handover: `shots/phone-look-imposter-handover.png`, `shots/desktop-look-imposter-handover.png`
- look-lobby-wavelength: `shots/phone-look-lobby-wavelength.png`, `shots/desktop-look-lobby-wavelength.png`
- wavelength-tie: `shots/phone-wavelength-tie.png`, `shots/desktop-wavelength-tie.png`
- look-wavelength-result: `shots/phone-look-wavelength-result.png`, `shots/desktop-look-wavelength-result.png`
- look-home: `shots/phone-look-home.png`, `shots/desktop-look-home.png`
