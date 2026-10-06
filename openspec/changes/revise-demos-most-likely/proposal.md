## Why

Players learn a game from the start page, but the Erklärung card leads to an empty iframe page for every game, and
each demo shows only one short happy path. Most Likely also uses the wrong rules: it hands individual titles to the
most-pointed-at person, while the game Rue plays is team-based, where a team scores when its members point at the
same person.

Appetite: one flow run (~one long session). Exceeding it means renegotiating scope.

## What Changes

- **BREAKING** The Erklärung card, the route `/spiele/<slug>/erklaerung`, `static/explain/`, its e2e fixtures and
  the `explanation` capability are removed. An old link gets the normal 404 (S1).
- The Demo card becomes the way to learn a game, with copy that says so; the start page keeps "So geht's" (S1).
- Every game's single demo script plays more than one round and reaches every outcome branch its engine has for a
  normal game, with a tip per step that says why the step happens (S2–S8). Runner and registry stay unchanged.
- **BREAKING** Most Likely To is rebuilt as a team game: 4–20 players dealt into 2–8 teams, a team per turn, the
  team scores the size of its largest group that pointed at the same person, teams ranked at the Endstand.
  Saved sessions in the old shape are discarded with the existing notice (stateVersion 2) (S9–S12).
- Most Likely copy (pitch, "So geht's", "4–20 Spieler") and its look walk follow the new rules (S12).

## Capabilities

### New Capabilities

none

### Modified Capabilities

- `demo`: "one full round" becomes "several rounds, every outcome branch, a tip that says why" (S2).
- `catalogue`: no Erklärung card; Demo card copy; Most Likely range, pitch and "So geht's" (S1, S12).
- `most-likely`: team setup, team turns, team scoring, team Endstand, stateVersion 2, new demo (S8–S12).
- `imposter`, `wavelength`, `feud`, `codes`, `duck`: each game's demo requirement covers its outcome branches
  (S3–S7).

### Removed Capabilities

- `explanation`: removed entirely (S1). OpenSpec 1.4.1 cannot archive a delta that empties a capability ("Spec must
  have at least one requirement", tested with and without the main spec present), so the change carries no
  `explanation` delta; the spec directory `openspec/specs/explanation/` is deleted by a ⚠ task in unit 6.

## Non-Goals

- Several demos per game or a demo picker — Rue chose one long script. Mutually exclusive modes are named in tips only.
- Editable team names or team colours for Most Likely — not in the archive, not asked for.
- Recording who pointed at whom — Rue: the device only tracks team order and points.
- New Most Likely content or a content-store change — the `most_likely_prompts` table stays, no migration.
- Changing the CoachTip position or layout — only the tip texts change (Rue's "Erklärungsboxen" = the tips).
- A redirect from `/erklaerung` to the demo.

## Done criteria

- [ ] The start page of every game shows no Erklärung card, and `/spiele/<slug>/erklaerung` is gone (404).
- [ ] Each game's demo runs several rounds, reaches every outcome branch listed in S3–S8 and the game over, with a
      fitting tip per step.
- [ ] Most Likely plays in teams, scores the largest matching group per turn, and ranks teams at the Endstand.
- [ ] `npm run proof:full` is green, and the specs (most-likely, demo, catalogue; explanation removed) match the
      behaviour.

## Impact

- Removed: `src/routes/spiele/[slug]/erklaerung/`, `static/explain/`, `e2e/explain.test.ts`,
  `e2e/fixtures/explain/`, `openspec/specs/explanation/`.
- Rewritten: `src/lib/games/most-likely/{engine,engine.test,demo,demo.test,index}.ts`, `Screen.svelte`,
  `Setup.svelte`; `src/lib/games/{imposter,wavelength,feud,codes,duck}/demo.ts` + `demo.test.ts`.
- Touched for the demo: `imposter/Screen.svelte` and `duck/Screen.svelte` (skip confirmation in the demo),
  `feud/Screen.svelte` (the miss controls in the demo).
- Changed: start page (`src/routes/spiele/[slug]/+page.svelte`), `registry.test.ts`, e2e (home, start, deco, look,
  demo, feud-demo, codes, duck, most-likely, walks/most-likely).
- Data: none. Old Most Likely sessions in browsers are discarded once with the existing notice.
