verified-at: 5701ca9

## Layer 1: `npm run proof:full` green

```
Test Files  38 passed (38)
     Tests  343 passed (343)
Running 606 tests using 8 workers
  35 skipped
  571 passed (4.3m)
EXIT 0
```

The 35 skips are the by-design single-project e2e tests (including the phone-only viewport test on desktop).

## Layer 2: spec coverage

| Scenario | proof | Evidence |
|---|---|---|
| Package and lockfile carry 0.6.0 | unit | `scripts/version.test.ts` ✓ |
| Release v0.6.0 published | manual (runs on GitHub after the ship-time tag push) | checklist |
| Imposter migration 0008 on a fresh and an existing database | unit | `src/lib/server/imposter-played.test.ts` ✓ |
| Imposter played-with has no duplicates | unit | `src/lib/server/imposter-played.test.ts` ✓ |
| Imposter played-with skips unknown pairs and players | unit | `src/lib/server/imposter-played.test.ts` ✓ |
| Imposter played-with follows a deleted pair or player | unit | `src/lib/server/imposter-played.test.ts` ✓ |
| Imposter played-with API rejects a malformed body | unit | `src/lib/server/imposter-played.test.ts` ✓ |
| Imposter played-with entry removed | unit | `src/lib/server/imposter-played.test.ts` ✓ |
| Imposter crew reveal records the saved players | e2e | `e2e/imposter-played.test.ts` ✓ phone, desktop |
| Imposter round ended before the reveal records nothing | e2e | `e2e/imposter-played.test.ts` ✓ phone, desktop |
| Imposter skipped pair is not recorded | unit | `src/lib/games/imposter/played.test.ts` ✓ |
| Imposter guests are never recorded | unit | `src/lib/games/imposter/played.test.ts` ✓ |
| Imposter reveal records once | unit | `src/lib/games/imposter/played.test.ts` ✓ |
| Imposter demo neither records nor shows who knows | e2e | `e2e/imposter-played.test.ts` ✓ phone, desktop |
| Imposter card edits its played-with list | e2e | `e2e/imposter-inhalte-played.test.ts` ✓ phone, desktop |
| Imposter played-with section collapses per card | e2e | `e2e/imposter-inhalte-played.test.ts` ✓ phone, desktop |
| Imposter played-with section with nobody on the list | e2e | `e2e/imposter-inhalte-played.test.ts` ✓ phone, desktop |
| Imposter played-with section without saved players | e2e | `e2e/imposter-inhalte-played.test.ts` ✓ phone, desktop |
| Imposter played-with card unchanged on a failed request | e2e | `e2e/imposter-inhalte-played.test.ts` ✓ phone, desktop |
| Other games' Inhalte cards carry no played-with or flag | e2e | `e2e/imposter-inhalte-played.test.ts` ✓ phone, desktop |
| Imposter hold shows who of the round knows the prompt | e2e | `e2e/imposter-known.test.ts` ✓ phone, desktop |
| Imposter hold with nobody of the round on the list | e2e | `e2e/imposter-known.test.ts` ✓ phone, desktop |
| Imposter control only until the crew reveal | e2e | `e2e/imposter-known.test.ts` ✓ phone, desktop |
| Imposter control follows a skip | e2e | `e2e/imposter-known.test.ts` ✓ phone, desktop |
| Imposter later round shows earlier records | e2e | `e2e/imposter-known.test.ts` ✓ phone, desktop |
| Imposter history loaded once per deal | e2e | `e2e/imposter-known.test.ts` ✓ phone, desktop |
| Imposter control keeps the primary action in the first viewport | e2e | `e2e/imposter-known.test.ts` ✓ phone (desktop skipped by design) |
| Imposter flag toggled on a card survives a reload | e2e | `e2e/imposter-flag.test.ts` ✓ phone, desktop |
| Imposter pair added as interchangeable | e2e | `e2e/imposter-flag.test.ts` ✓ phone, desktop |
| Imposter flag stored and returned by the API | unit | `src/lib/server/content.test.ts` ✓ |
| Imposter import adds pairs with the flag off | unit | `src/lib/server/content.test.ts` ✓ |
| Imposter swapped pair is not a duplicate | unit | `src/lib/server/content.test.ts` ✓ |
| Only Imposter pairs carry the flag | unit | `src/lib/server/content.test.ts` ✓ |
| Imposter flag icons read as on and off | manual (visual judgement of the two icons on the verifier's screenshots at Gate 2) | `shots/phone-inhalte-imposter-flag.png`, `shots/desktop-inhalte-imposter-flag.png`; `e2e/imposter-flag.test.ts` also ✓ phone, desktop |
| Imposter interchangeable pair swaps across seeds | unit | `src/lib/games/imposter/engine.test.ts` ✓ |
| Imposter fixed pair never swaps | unit | `src/lib/games/imposter/engine.test.ts` ✓ |
| Imposter swap is deterministic | unit | `src/lib/games/imposter/engine.test.ts` ✓ |
| Imposter skip redraws the swap | unit | `src/lib/games/imposter/engine.test.ts` ✓ |
| Imposter reveal and unmask show the dealt sides | unit | `src/lib/games/imposter/engine.test.ts` ✓ |

Round 2: rechecked the scenarios touched by 5701ca9 (malformed body now also covers non-JSON, missing `playerIds`, non-array `playerIds`, table unchanged; records-once pins the covered phase to no post and the uncovered one to exactly one post with the right ids). All 39 names found in the green run or in the unit files that passed (38/38 files, 343 tests).

Gaps: none.

## Manual checklist

- Release v0.6.0 published: after the merge, push tag `v0.6.0` and confirm the release workflow passes `check-tag` and the release holds `rues-arcade-0.6.0.tgz` and its `.sha256`.
- Imposter flag icons: open `shots/phone-inhalte-imposter-flag.png` and `shots/desktop-inhalte-imposter-flag.png`; the on button must read as a reverse arrow, the off one as the same arrow crossed out, both at least 44px.
- Imposter "Wer kennt die Frage?" control: open `shots/phone-imposter-known.png` and `shots/desktop-imposter-known.png`, or run `npm run dev` and hold the corner control at a hand-over.

## Diffstat (origin/main...flow/imposter-played-swap)

39 files changed, 1964 insertions(+), 34 deletions(-) (as of 5701ca9, before this commit); source, tests, migration `0008_imposter_played.sql`, version 0.6.0, and the change dir.

## Screenshots

- `openspec/changes/imposter-played-swap/shots/phone-imposter-known.png`
- `openspec/changes/imposter-played-swap/shots/desktop-imposter-known.png`
- `openspec/changes/imposter-played-swap/shots/phone-inhalte-imposter-flag.png`
- `openspec/changes/imposter-played-swap/shots/desktop-inhalte-imposter-flag.png`
