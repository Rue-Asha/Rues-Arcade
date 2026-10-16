## Why

The Duck word list ("What rhymes with duck") is 60 words built as 30 rhyming pairs, mostly one syllable, so a round
runs out quickly and the pairs give each other away. Rue wants 750 words that each stand on their own.

## What Changes

- **S1** The 60 seed words are reduced to the nine that meet the criteria (one word per former rhyming pair at most,
  more than one syllable, no adjective misused as a noun): Katze, Gedicht, Sonne, Regen, Blume, Mauer, Feder, Kette,
  Ente. A kept word the user deleted on an existing database stays deleted.
- **S2** The seed list holds exactly 750 words (9 kept + 741 new): more than one syllable, nouns or adjectives only,
  Duden spelling in base form, no two words rhyme, no duplicates ignoring case and umlauts.
- **S3** New forward-only migration `migrations/0009_duck_wordlist.sql` deletes the 51 dropped seed words and inserts
  the 741 new ones without duplicating rows; user-added words are untouched; 0003 stays unchanged.
- **S4** An automated guard over the seeded list of a fresh database (after all migrations) checks count 750, no
  duplicates, more than one syllable, no shared heuristic rhyme key, clean letters. Duden and word-class criteria are
  checked by the reviewer, not by a sensor.
- **S5** Release 0.7.1: `package.json` + `package-lock.json`, version test and release spec retitled (mirrors
  cb84400), tag `v0.7.1` after merge.

## Capabilities

### New Capabilities

### Modified Capabilities
- `duck`: new requirement "Duck seed words" (750 words, criteria, guard).
- `content-store`: seed counts (91, 750, 60) and the 0009 upgrade behaviour.
- `catalogue`: the Duck Inhalte card counts "750 Wörter".
- `release`: Version 0.7.0 becomes Version 0.7.1.

## Non-Goals

- Words must have a common rhyme partner outside the list: Rue declined, hard-to-rhyme words are allowed.
- A dictionary sensor (hunspell-de) or duden.de lookups: Rue chose the reviewer pass.
- Applying the criteria to user-added words or to the Inhalte add/import flow: only the seed list changes.
- Changes to Duck gameplay, draw logic or UI.
- Other games' content.

## Done criteria

- [ ] A fresh database has exactly 750 Duck words and the S4 guard is green.
- [ ] The reviewer found no non-Duden word, verb form or rhyming pair (or the fixer replaced them).
- [ ] An existing database upgraded to 0.7.1 holds the new words, the dropped seeds are gone, user-added words are still there.
- [ ] `npm run proof` and `npm run proof:full` are green.
- [ ] v0.7.1 is tagged and the release workflow published it.

## Appetite

One session. Exceeding it (e.g. the word list needing several review rounds) means renegotiating scope.

## Impact

- `migrations/0009_duck_wordlist.sql` (new), `src/lib/content/duck-rhyme.ts` (new helper) and tests, `src/lib/server/db.test.ts`,
  `e2e/home.test.ts`, `e2e/start.test.ts`, `e2e/duck.test.ts` (demo deletes every seed word through the API: 750 requests),
  `package.json`, `package-lock.json`, `scripts/version.test.ts`.
- Risks accepted: the rhyme key is a stress heuristic, the reviewer checks true rhymes (R1); no sensor for Duden and
  verb forms (R2); a dropped seed word the user re-added by hand is removed by 0009 (R3).
