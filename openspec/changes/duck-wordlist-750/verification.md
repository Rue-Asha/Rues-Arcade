verified-at: 6d25d06

## Layer 1: `PORT=4802 npm run proof:full` (green)

```
Test Files  52 passed (52)
     Tests  499 passed (499)
  44 skipped
  902 passed (6.0m)
exit=0
```

## Layer 2: spec coverage

| Scenario | proof | Evidence |
|---|---|---|
| So geht's for the new games | e2e | `e2e/start.test.ts` › "Scenario: So geht's for the new games" ✓ (phone, desktop) |
| Inhalte card counts the seeded content | e2e | `e2e/start.test.ts` › "Scenario: Inhalte card counts the seeded content" ✓ (expects "750 Wörter ansehen und bearbeiten") |
| New start banners carry title, badge and range | e2e | `e2e/start.test.ts` › "Scenario: New start banners carry title, badge and range" ✓ |
| Fresh database runs with empty tables | e2e | `e2e/home.test.ts` › "Scenario: Fresh database runs with empty tables" ✓ (duck_words 750) |
| Migration failure refuses to start | unit | `src/lib/server/db.test.ts` › "Scenario: Migration failure refuses to start" ✓ |
| Seeds land once on an existing database | unit | `db.test.ts` › "Scenario: Seeds land once on an existing database" ✓ |
| Deleted seed entries stay deleted | unit | `db.test.ts` › "Scenario: Deleted seed entries stay deleted" ✓ |
| Seed rows are clean | unit | `db.test.ts` › "Scenario: Seed rows are clean" ✓ |
| Migration 0009 upgrades an existing Duck list | unit | `db.test.ts` › "Scenario: Migration 0009 upgrades an existing Duck list" ✓ |
| Migration 0009 keeps a deleted kept word deleted | unit | `db.test.ts` › "Scenario: Migration 0009 keeps a deleted kept word deleted" ✓ |
| Migration 0009 does not duplicate a word the user already added | unit | `db.test.ts` › "Scenario: Migration 0009 does not duplicate a word the user already added" ✓ |
| Migration 0009 removes a dropped seed word the user re-added | unit | `db.test.ts` › "Scenario: Migration 0009 removes a dropped seed word the user re-added" ✓ |
| Fresh database yields exactly the 750 seed words | unit | `db.test.ts` › "Scenario: Fresh database yields exactly the 750 seed words" ✓ |
| Fresh database holds exactly 750 Duck words | unit | `src/lib/server/duck-seed.test.ts` › "Scenario: Fresh database holds exactly 750 Duck words" ✓ |
| Dropped seed words are gone from a fresh database | unit | `duck-seed.test.ts` › "Scenario: Dropped seed words are gone from a fresh database" ✓ |
| Every Duck seed word has more than one syllable | unit | `duck-seed.test.ts` › "Scenario: Every Duck seed word has more than one syllable" ✓ |
| No two Duck seed words share a rhyme key | unit | `duck-seed.test.ts` › "Scenario: No two Duck seed words share a rhyme key" ✓ |
| Duck seed words have no duplicates ignoring case and umlauts | unit | `duck-seed.test.ts` › "Scenario: Duck seed words have no duplicates ignoring case and umlauts" ✓ |
| Duck seed words are clean letter strings | unit | `duck-seed.test.ts` › "Scenario: Duck seed words are clean letter strings" ✓ |
| Rhyme and syllable heuristic recognises known cases | unit | `src/lib/content/duck-rhyme.test.ts` › "Scenario: Rhyme and syllable heuristic recognises known cases" ✓ |
| Guard fails on a rhyming pair and a one-syllable word | unit | `duck-seed.test.ts` › "Scenario: Guard fails on a rhyming pair and a one-syllable word" ✓ |
| Duck seed words are Duden nouns or adjectives without verb forms | manual (no dictionary sensor) | word-list reviewer pass (orchestrator) |
| Package and lockfile carry 0.7.1 | unit | `scripts/version.test.ts` › "Scenario: Package and lockfile carry 0.7.1" ✓ |
| Release v0.7.1 published | manual (runs on GitHub after tag push) | checklist below |

Gaps: none.

## Manual checklist

- word-list reviewer pass (orchestrator): Duden spelling, word class, true rhymes over the 750 words in `migrations/0009_duck_wordlist.sql`
- After merge and `v0.7.1` tag push: release workflow passes `check-tag`, GitHub release v0.7.1 holds `rues-arcade-0.7.1.tgz` and `.sha256`
- Optional: `npm run dev`, open http://localhost:5173, Duck start screen shows "750 Wörter ansehen und bearbeiten"

## Diffstat (`git diff --stat main...flow/duck-wordlist-750`)

21 files changed, 1480 insertions(+), 13 deletions(-); main parts: `migrations/0009_duck_wordlist.sql` (+817), `src/lib/server/db.test.ts`, `src/lib/server/duck-seed.test.ts`, `src/lib/content/duck-rhyme.ts` and test, e2e count updates (`duck`, `home`, `start`), version bump to 0.7.1.

## Screenshots

none (no visual change; existing shots don't show the count)
