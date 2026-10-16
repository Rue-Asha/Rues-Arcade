verified-at: a4d8584

## Layer 1: `PORT=4802 npm run proof:full` (green)

```
Test Files  52 passed (52)
     Tests  499 passed (499)
  44 skipped
  902 passed (5.9m)
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

- word-list reviewer pass (orchestrator): round 1 done, 13 replacements in round 2
- After merge and `v0.7.1` tag push: release workflow passes `check-tag`, GitHub release v0.7.1 holds `rues-arcade-0.7.1.tgz` and `.sha256`
- Optional: `npm run dev`, open http://localhost:5173, Duck start screen shows "750 Wörter ansehen und bearbeiten"

## Diffstat (`git diff --stat main...flow/duck-wordlist-750`)

22 files changed, 1546 insertions(+), 13 deletions(-); main parts: `migrations/0009_duck_wordlist.sql` (+817), `src/lib/server/db.test.ts`, `src/lib/server/duck-seed.test.ts`, `src/lib/content/duck-rhyme.ts` and test, e2e count updates (`duck`, `home`, `start`), version bump to 0.7.1.

## Screenshots

none (no visual change; existing shots don't show the count)

## Review

Round 1 (code reviewer, fresh context): no findings. Note: e2e/duck.test.ts demo setup now deletes in parallel batches of 50 — a setup change, not a weaker expectation.

Round 1 (word-list reviewer, opus; it looked up all 750 words on duden.de although Rue had declined external lookups — the brief did not forbid it, orchestrator's miss):
- Pure rhymes missed by the heuristic: Lakritze/Skizze, Brezel/Rätsel → fixed: rhyme key folds tz/zz/z → ts (test added, seen red), Lakritze → Kompott, Brezel → Hackfleisch; the new key also caught Trapez/Fischernetz (impure, but not separable by the heuristic) → Fischernetz → Päckchen. (a4d8584, 28a4722)
- Not a Duden headword: Klingelschild → Teesieb. Plural-only: Ohrenschützer → Armreif. (28a4722)
- Regional per Duden, replaced on Rue's decision: Semmel → Brühe, Knödel → Ochse, Metzger → Enkel, Rodel → Brosche, Schemel → Kühlbox, Reibe → Bulle, Murmel → Zielscheibe, Schnürsenkel → Kniestrumpf. (28a4722)
- ~190 impure-rhyme pairs (b/p, d/t, g/k, ü/i, ö/e, eu/ei, ng/nk, vowel length) → not a finding: Rue decided impure rhymes stay, only same endings are excluded (scope.md Decisions, verify round 1).
- Rare but standard words (Tümmler, Kescher, …) → kept on Rue's decision. Verb forms, one-syllable words: none.

Round 2 (code reviewer, fresh context): no findings. Accepted limitation: the heuristic treats a stressed final -el/-en/-er as schwa (would miss Kamel/Hotel); no such pair is in the list. The 13 replacement words were checked by the orchestrator against the criteria (standard German nouns, no verb form, no pure rhyme per the fixer's key check).
