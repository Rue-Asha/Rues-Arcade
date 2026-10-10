## Why

The host of an Imposter round can't tell whether the players already know a prompt, so pairs get replayed
blind; and every pair is one-way (crew text always to the crew), which limits how often a pair can be reused.

Appetite: one session. Exceeding it means renegotiating scope.

## What Changes

- Every Imposter pair keeps a played-with history of saved players: new table `imposter_played` (migration `0008`,
  FK cascade to pairs and players, unique per pair and player) with list/add/remove routes under
  `/api/imposter/played`, built like Feud's `/api/feud/played` (S1).
- When the crew question is revealed, every saved player of that round is recorded for the dealt pair. Guests,
  skipped pairs, rounds ended before the reveal and the demo record nothing (S2).
- On the Imposter Inhalte page each pair card gets a "Gespielt mit" toggle with the recorded players ("Entfernen"
  each, "Noch niemand." when empty) and "+ Name" chips for the other saved players, as in Feud's prep (S3).
- During a round, from the first hand-over until the crew reveal, a hold-to-view corner control "Wer kennt die
  Frage?" shows which players of this round have played the current pair (S4).
- Each Imposter pair gets an `interchangeable` flag (off by default, existing pairs stay off), toggled by an icon
  button on its Inhalte card and settable in the add form (S5).
- A round that draws an interchangeable pair decides 50/50 from its seeded RNG which side goes to the crew; other
  pairs deal as today (S6).
- Release 0.6.0: `package.json`, `package-lock.json`, `scripts/version.test.ts` and the release spec carry 0.6.0 in
  this PR; tag `v0.6.0` is pushed on the merged `main` in Ship (S7).

## Capabilities

### New Capabilities

none

### Modified Capabilities

- `imposter`: played-with store and API, recording at the crew reveal, played-with section on the Inhalte cards,
  the "who knows" hold control during a round, the interchangeable flag and the swapped deal (S1–S6).
- `release`: the version requirement moves from 0.5.1 to 0.6.0, tag scenario included (S7).

## Non-Goals

- Using the history when drawing (prefer unknown prompts, Feud-style fill/badges/sort) — the user chose "only show".
- A Feud-style prep step before Imposter — editing lives on the Inhalte cards.
- Setting the flag through bulk import (e.g. `a <> b`) — user chose no.
- Any change to the Imposter demo script or its tips — user: "Es muss keine Anpassung an der Demo vorgenommen
  werden" (only what a state-version bump mechanically requires; this plan needs no bump, see design.md).
- Detecting swapped duplicates (b|a vs a|b) — dedupe stays as today.
- Showing the full history (players not in this round) during play — user chose "only this round".

## Done criteria

- [ ] In Inhalte → Imposter, a card shows the reverse-arrow button; toggling it survives a reload; "Gespielt mit"
      lists, adds and removes saved players.
- [ ] Playing a round with saved players, holding the control before the crew reveal shows who of the round knows
      the prompt; after the reveal those players appear on the card's list.
- [ ] An interchangeable pair sometimes gives the crew the imposter text across seeds; a non-interchangeable one
      never does.
- [ ] `npm run proof:full` is green; the PR carries version 0.6.0; after merge `v0.6.0` is tagged and the GitHub
      release exists.

## Impact

- Data: ⚠ forward-only migration `migrations/0008_imposter_played.sql` (new table, new column with default 0).
- Server: `src/lib/content/types.ts`, `src/lib/server/content.ts`, `src/routes/api/content/[type]/**`, new
  `src/lib/server/imposter-played.ts` and `src/routes/api/imposter/played/**`.
- Game: `src/lib/games/imposter/engine.ts`, `Screen.svelte`, `index.ts`, new `played.svelte.ts`. No state shape
  change and no `stateVersion` bump; `demo.ts` is untouched.
- Inhalte: `src/routes/spiele/[slug]/inhalte/+page.svelte` and `+page.server.ts`.
- e2e: `e2e/helpers.ts`, new `e2e/imposter-played.test.ts`, `e2e/imposter-flag.test.ts`,
  `e2e/imposter-inhalte-played.test.ts`.
- Release: `package.json`, `package-lock.json`, `scripts/version.test.ts`; ⚠ tag `v0.6.0` pushed in Ship.
