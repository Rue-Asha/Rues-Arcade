## ADDED Requirements

### Requirement: Duck seed words
The seeded Duck word list of a fresh database (all migrations applied) SHALL hold exactly 750 words, each with more than one
syllable, a noun or an adjective (no verb form in any shape: infinitive, conjugated, nominalised infinitive,
participle or participle-derived adjective), spelled as in the Duden (nouns capitalised, adjectives lower-case in the
uninflected base form, no proper names, abbreviations or inflected forms), and no two words SHALL rhyme (alike from the
last stressed vowel to the end; for compounds the last element decides; ä = e). The list SHALL have no duplicates
ignoring case with umlauts folded. Of the earlier 60 seed words only Katze, Gedicht, Sonne, Regen, Blume, Mauer, Feder,
Kette and Ente SHALL remain. An automated guard SHALL check the count, duplicates, syllables, rhyme keys and clean
letters against the migrated database, using a heuristic with a stress-approximating rhyme key; the Duden and word-class
criteria SHALL be checked by the reviewer.

#### Scenario: Fresh database holds exactly 750 Duck words
- **WHEN** a fresh database is migrated with all migrations
- **THEN** `duck_words` holds exactly 750 rows and the nine kept words Katze, Gedicht, Sonne, Regen, Blume, Mauer, Feder, Kette and Ente are among them
- **proof:** unit

#### Scenario: Dropped seed words are gone from a fresh database
- **WHEN** a fresh database is migrated with all migrations
- **THEN** none of the other 51 former seed words (Haus, Maus, Tatze, Hund, Mund, ...) is in `duck_words`
- **proof:** unit

#### Scenario: Every Duck seed word has more than one syllable
- **WHEN** the seeded words of a fresh database are counted by vowel groups
- **THEN** every word has at least two syllables
- **proof:** unit

#### Scenario: No two Duck seed words share a rhyme key
- **WHEN** the rhyme key of every seeded word of a fresh database is computed
- **THEN** all 750 keys are different
- **proof:** unit

#### Scenario: Duck seed words have no duplicates ignoring case and umlauts
- **WHEN** the seeded words of a fresh database are folded with `toLocaleLowerCase('de')`
- **THEN** all 750 folded words are different, and the same holds for a pair such as "Ärger" and "ärger"
- **proof:** unit

#### Scenario: Duck seed words are clean letter strings
- **WHEN** the seeded words of a fresh database are read
- **THEN** every word consists of letters only (umlauts and ß allowed), has no leading or trailing space and is at most 200 characters
- **proof:** unit

#### Scenario: Rhyme and syllable heuristic recognises known cases
- **WHEN** `syllables` and `rhymeKey` are applied to Katze and Tatze, Gedicht and Licht, Zeitung and Leitung, Haustür and Gebühr, Bär and Meer, Regen and Segen, and syllables to Haus, Ei, Haustür and Känguru
- **THEN** each pair has equal keys, Katze and Mauer have different keys, Haus and Ei have one syllable, Haustür two and Känguru three
- **proof:** unit

#### Scenario: Guard fails on a rhyming pair and a one-syllable word
- **WHEN** the guard's checks are applied to the list `Katze, Tatze, Haus` instead of the seeded words
- **THEN** the rhyme check reports Katze and Tatze, and the syllable check reports Haus
- **proof:** unit

#### Scenario: Duck seed words are Duden nouns or adjectives without verb forms
- **WHEN** the reviewer reads all 750 seed words
- **THEN** every word is a Duden noun (capitalised) or adjective (lower-case base form), none is a verb form, proper name, abbreviation or inflected form ("Regen" only as noun), and no two words truly rhyme
- **proof:** manual (no dictionary sensor, Rue's choice; reviewer pass over the migration's list)
