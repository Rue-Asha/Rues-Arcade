# Scope: duck-wordlist-750

Triage: tweak — Duck seed list cleaned to Rue's criteria and expanded to 750 words via a new migration, released as 0.7.1. Appetite: one session.

## Problem
The Duck word list ("What rhymes with duck") is 60 words built as 30 rhyming pairs, mostly one syllable,
so a round runs out quickly and the pairs give each other away. Rue wants 750 words that each stand on their own.

## Flows
- Fresh install: migrations run → `duck_words` holds the 750 seed words → Duck draws from them.
- Existing install (Rue's running instance): upgrade to 0.7.1 → migration 0009 runs once → dropped seed
  words gone, new words added, Rue's own words untouched.

## In scope
- **S1** The existing 60 seed words are reduced to those meeting the criteria (S2): one word per former
  rhyming pair at most, no one-syllable words, no adjectives misused as nouns. Kept:
  Katze, Gedicht, Sonne, Regen, Blume, Mauer, Feder, Kette, Ente (9 words; "Bette" is not a Duden noun).
  - edges: a kept word the user deleted on an existing DB stays deleted (not re-inserted).
- **S2** The seed list holds exactly 750 words after the change (9 kept + 741 new), each meeting all of:
  - more than one syllable (compounds count, e.g. "Haustür");
  - nouns or adjectives only. No verbs in any form: no infinitives, no conjugated forms, no nominalised
    infinitives ("das Laufen"), no participles or participle-derived adjectives ("spannend", "gebrochen");
  - a real word in the Duden: correct Duden spelling, nouns capitalised, adjectives lowercase in their base
    (uninflected positive) form; no proper names, abbreviations or inflected forms;
  - no two words in the list rhyme (definition under Decisions);
  - no duplicates, case-insensitively with umlauts folded (`toLocaleLowerCase('de')`).
  - edges: words that are both noun and verb infinitive in spelling ("Regen") are allowed only as nouns,
    capitalised; ä and e count as the same sound for rhyme ("Bär"/"Meer").
- **S3** Existing databases get the new list through a new forward-only migration `0009_*.sql`:
  it deletes the seed words dropped in S1 and inserts the 741 new words without duplicating rows;
  user-added words are untouched. Migration 0003 stays unchanged.
  - edges: a new word the user already added themselves → no duplicate row; a dropped seed word the user
    re-added by hand is indistinguishable from the seed and is removed (accepted, see R3);
    fresh DB → 0003 then 0009 yields exactly the 750 seed words.
- **S4** An automated guard over the seeded list (fresh DB after all migrations) checks: exactly 750 words,
  no duplicates (de case fold), every word > 1 syllable (vowel-group count), no two words sharing a
  heuristic rhyme key, nouns capitalised. The Duden and word-class criteria are checked by the reviewer
  (Rue's choice: reviewer pass, no dictionary sensor).
  - edges: the heuristic is an approximation of stress (see R1); it must pass on the final list and fail on a
    known rhyming pair (e.g. Katze/Tatze) and a one-syllable word.
- **S5** Release 0.7.1: package.json + package-lock.json at 0.7.1, version test and the release spec
  requirement retitled to 0.7.1 (mirrors cb84400), tag `v0.7.1` pushed after merge.
  - edges: none (same mechanism as 0.7.0).

## Non-goals
- Words must have a common rhyme partner outside the list — Rue declined; hard-to-rhyme words are allowed.
- A dictionary sensor (hunspell-de) or duden.de lookups — Rue chose the reviewer pass.
- Applying the criteria to user-added words or to the Inhalte add/import flow — only the seed list changes.
- Changes to Duck gameplay, draw logic or UI.
- Other games' content.

## Codebase touchpoints
- `migrations/0003_seed_content.sql:95` — current 60-word seed; unchanged (explorer).
- `migrations/0009_*.sql` — new: delete dropped seeds, insert new words; precedent `0007_show_surveys.sql`
  (DELETE placeholders + INSERT OR IGNORE). Check whether `duck_words.word` is UNIQUE in `0002`; if not,
  insert with `WHERE NOT EXISTS` (explorer).
- `src/lib/server/db.ts:36-56` — migration runner, forward-only, tracked in `schema_migrations` (explorer).
- `src/lib/server/db.test.ts:146` — seed count `duck_words: 60` → 750 (explorer).
- `openspec/specs/content-store/spec.md:14, 163-166` — "Duck 60 words … archive backup" and "(91, 60, 60)" →
  delta spec (explorer).
- `openspec/specs/release/spec.md` (~l.73-86), `scripts/version.test.ts`, `package.json`, `package-lock.json`
  — 0.7.1 (explorer).
- `e2e/duck.test.ts`, `e2e/content.test.ts`, demo script — check for reliance on specific seed words
  (Haus, Maus, …) or the count 60 (not checked by the explorer).

## Risks
- R1 Rhyme and syllables can't be decided mechanically (stress) → accepted: S4 uses a heuristic key
  (last vowel group onward, extended to the previous vowel group when the last syllable is a schwa
  -e/-el/-en/-er), the reviewer checks true rhymes on top.
- R2 "Duden word" and "no verb form" have no sensor → accepted (Rue's choice): reviewer pass over all 750,
  the builder runs with Model: opus for the word generation.
- R3 A dropped seed word re-added by the user is removed by 0009 → accepted: identical text, unlikely.
- R4 e2e or demo relies on old seed words or the count → planner checks and lists those files in the unit.

## Decisions
- Rhyme definition: two words rhyme when they sound alike from the last stressed vowel to the end
  (Katze/Tatze, Gedicht/Licht, Zeitung/Leitung); for compounds the last element decides (Haustür rhymes
  with Gebühr). ä = e for rhyme. — Rue's "keines reimt sich untereinander", made checkable.
- Nouns and adjectives allowed — Rue chose this over nouns only.
- Keep everyday words a party group knows; avoid obscure technical terms — taste guideline for the builder,
  not a tested criterion.
- New migration rather than editing 0003 — Rue's choice; forward-only migrations never re-run 0003.

## Done when
- A fresh DB has exactly 750 Duck words, the S4 guard is green, and the reviewer found no non-Duden word,
  verb form or rhyming pair (or the fixer replaced them).
- Rue's existing instance shows the new words after upgrading, Rue's own words still there.
- v0.7.1 is tagged and the release workflow published it.

## Split off
- none
