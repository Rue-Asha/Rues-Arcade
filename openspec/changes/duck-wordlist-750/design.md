## Context

`duck_words.word` is `TEXT NOT NULL UNIQUE` (0002), binary collation, so `INSERT OR IGNORE` is the dedupe for the
741 new words (precedent 0007) and exact-text user words never duplicate. The 51 dropped seeds go with an explicit
`DELETE ... WHERE word IN (...)`. The nine kept words are not touched: a kept word the user deleted is not re-inserted.

## Decisions

- Rhyme: two words rhyme when they sound alike from the last stressed vowel to the end (Katze/Tatze, Gedicht/Licht,
  Zeitung/Leitung); for compounds the last element decides (Haustür rhymes with Gebühr); ä = e. Heuristic key:
  lower-case, ä to e, from the last vowel group onward, extended to the previous vowel group when the last syllable is
  a schwa (-e, -el, -en, -er). Syllables = vowel groups, a run of vowel letters (ei, ai, au, eu, äu, ie, aa, ee ...) is one.
- Source of truth is the database: the migrations (0003 + 0009) are the only copy of the list. The guard migrates a
  fresh DB with `migrate()` and reads `duck_words`; no copy of the list in a test or a script.
- The heuristic is a pure helper `src/lib/content/duck-rhyme.ts` (`syllables(word)`, `rhymeKey(word)`) with its own
  tests; the guard uses it. It runs in vitest, so it is part of `proof`.
- Migration 0009 keeps the list readable: one word per line, grouped by theme with a `--` comment per group.
- Nouns and adjectives allowed; everyday words a party group knows, no obscure technical terms (taste, not tested).
- Guard checks letters only (no spaces, digits, punctuation, `trim()`-stable) and not initial case: an adjective is
  lower-case by Duden, so noun capitalisation is part of the reviewer pass.
- New migration instead of editing 0003: Rue's choice, 0003 never re-runs on an existing database.

## Contracts

- `syllables(word: string): number` and `rhymeKey(word: string): string` exported from `src/lib/content/duck-rhyme.ts`.
- Migration file name `migrations/0009_duck_wordlist.sql`; the nine kept words are Katze, Gedicht, Sonne, Regen,
  Blume, Mauer, Feder, Kette, Ente.
