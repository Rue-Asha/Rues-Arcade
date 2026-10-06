## Context

Six games share one demo runner (`src/lib/demo/runner.ts`): a `DemoScript` (players, config, content, seed, steps)
is played through the real reducer, one scripted action per step, and only the control whose `data-action` equals
the step's action type is enabled and marked `data-demo="expected"`. The runner and registry stay as they are; this
change rewrites the six scripts, rebuilds Most Likely To as a team game, and removes the unused explanation viewer.
Scope: `scope.md` (S1–S12, approved at Gate 0).

## Goals / Non-Goals

**Goals:** every demo is a several-round walkthrough that reaches each outcome branch of its engine; Most Likely
plays by Rue's team rules; the start page teaches through the demo only.

**Non-Goals:** as in proposal.md (no multi-demo, no team names/colours, no pick recording, no content change, no
CoachTip layout change, no `/erklaerung` redirect).

## Decisions

### Branch checklist per engine

The per-game delta specs list each reducer branch as its own scenario, all proven by one unit test per game
("Scenario: <Game> demo covers every outcome branch"), which walks the script's states and asserts each branch
occurs. Branches an ordinary game cannot reach with the demo's fixed players, or that the engine does not have,
are named in a tip and listed here:

| Game | Not scripted | Why |
|---|---|---|
| Imposter | game over, "Nochmal spielen" | the engine has no game end; rounds continue until "Spiel beenden" |
| Imposter | caught vs not caught | the engine does not record the vote; the two unmask tips narrate one of each |
| Wavelength | Koop (turn rotation, rating) | mutually exclusive mode (S2); the tips name it |
| Feud | rematch | the engine and the Gewinner screen have none |
| Feud | undo | a correction, not an outcome; a tip names "Rückgängig" |
| Duck | game end by lost lives alone | the final word ends by target and elimination at once (reason "target"); a tip names the lives-only end |
| Most Likely | partial match (2 of 3+) | the fixed players Alex, Bo, Cleo, Dani give 2 teams of 2, whose choices are 0 or 2; a tip names it |
| Most Likely | tie at the Endstand | a tip names "Unentschieden"; the scripted game has a winner |

Pool reshuffles after exhaustion are not outcomes and are not required (a script may reach them).

### Controls the demo cannot reach today

The builder of each demo unit owns the game's Screen file for this:

- **Imposter, Duck — skip.** The first "Überspringen" only opens the confirmation Modal; the Modal's button carries
  the same `action="skip"`, so two controls would be `expected` at once and the e2e tap-through (`toHaveCount(1)`)
  fails. In the demo, the confirmation must leave exactly one expected control (for example: the first tap
  dispatches directly while a demo runs, or the opener stops being expected while the Modal is open).
- **Feud — miss.** "Nicht auf der Tafel" carries `action="miss"`, but the scripted action is
  `{ type: 'answer', tile: null }` or `{ type: 'steal', tile: null }`, so no control is expected. In the demo, the
  miss button must be the expected control when the scripted step's `tile` is `null`.
- **Most Likely — count.** Several choice buttons dispatch the same action type; only the one whose value equals
  the scripted `matched` is `expected` (pattern: Feud's `scripted` tile, Duck's boxes). Built by unit 1.

### Most Likely To on team rules

- Config `{ teams: string[][]; rounds }`, player ids per team like Wavelength and Codes. Team names "Team 1…n".
- Turn order as in Codes: `startTeam` drawn from the RNG at game start and on rematch; round r opens with
  `(startTeam + r) mod n`, the other teams follow in index order. One turn per team per round.
- Phases `prompt → count → result → (next team | next round | gameOver)`. `point` opens the count screen, `score`
  with `matched ∈ {0, 2…team size}` adds `matched` to the team (anything else is a no-op), `next` advances.
  The state holds teams, scores, order and the current turn only — no per-player pick.
- Prompts: the existing draw (no repeats until the pool is used, `redraw` puts the rejected prompt back, a pool of
  one keeps its prompt and the button stays disabled) moves from per round to per turn.
- Setup follows `wavelength/Setup.svelte`: `seat` per player id, −/+ stepper from 2 to `maxTeams(n)` =
  min(8, floor(n/2)), chip tap moves to the next team, "Mischen" redeals the same sizes. Default 2 teams. A team
  under 2 players blocks "Los geht's" with a `role="alert"` hint; sizes differing by more than 1 show a neutral
  hint and still allow the start.
- `stateVersion` 1 → 2; `loadGameSession` already discards a stored state of another version with the existing
  notice.
- Copy (final wording at Gate 1): pitch "Ein Spruch, alle zeigen auf eine Person, und ein Team punktet, wenn es
  sich einig ist."; "So geht's": "Reihum ist ein Team dran und bekommt einen Spruch: Wer würde am ehesten …?",
  "Das Team zählt bis drei, und alle zeigen gleichzeitig auf die Person, die am besten passt.", "Zeigen mehrere auf
  dieselbe Person, bekommt das Team so viele Punkte, wie es Finger sind. Am Ende gewinnt das Team mit den meisten
  Punkten."; turn "<Team> ist dran", hint "Zählt bis drei und zeigt gleichzeitig auf die Person, die am besten
  passt."; count heading "Wie viele aus <Team> haben auf dieselbe Person gezeigt?" with "Alle verschieden", "2" …;
  result button "Nächstes Team", "Nächste Runde" on a round's last turn, "Zum Ergebnis" on the game's last turn.

### Start page

The "Mehr zu <Spiel>" box keeps its layout and holds two cards, Demo first, then Inhalte. The Demo card keeps the
title "Demo" (every e2e opens it by that name, and "So geht's" is already the rules heading) and gets the line
"Spiel per Demo lernen, mehrere Runden zum Mittippen" (final wording at Gate 1). The route directory goes, so
`/spiele/<slug>/erklaerung` falls through to the normal 404.

### Shared test files

Every test a unit breaks is fixed in that unit (Rue at Gate 0). Each shared file has one owner per wave:

| File | Owner(s), in order |
|---|---|
| `e2e/start.test.ts`, `src/routes/spiele/[slug]/+page.svelte` | U1 (Most Likely range and "So geht's") → U6 (cards, Erklärung) |
| `e2e/look.test.ts` | U6 only (explain fixture route and the two erklaerung shots); the Most Likely walk lives in `e2e/walks/most-likely.ts` (U1) |
| `e2e/home.test.ts`, `e2e/deco.test.ts`, `src/lib/games/registry.test.ts` | U1 only |
| `e2e/demo.test.ts` | U2 (Imposter) → U5 (Wavelength); step counts are read from the imported scripts, not typed |
| `e2e/most-likely.test.ts` | U1 → U4 (its demo scenario only) |
| `e2e/feud-demo.test.ts` / `e2e/codes.test.ts` / `e2e/duck.test.ts` | U3 / U7 / U8 (demo scenarios only) |
| `src/lib/demo/runner.test.ts` | nobody; it must stay green with every script |

## Contracts

Created by U1 and used by U4 (the Most Likely demo). Shapes are not changed without re-planning.

```ts
// src/lib/games/most-likely/engine.ts
export interface MostLikelyConfig { teams: string[][]; rounds: 5 | 10 | 15 | 20 }   // player ids per team
export const ROUND_OPTIONS: MostLikelyConfig['rounds'][];        // [5, 10, 15, 20]
export const DEFAULT_ROUNDS = 10, MIN_TEAM_SIZE = 2, MIN_TEAMS = 2, MAX_TEAMS = 8;
export function maxTeams(players: number): number;               // min(MAX_TEAMS, floor(players / MIN_TEAM_SIZE))
export function dealTeams<T>(players: T[], count: number): T[][]; // player i → team i mod count
export function choices(teamSize: number): number[];             // [0, 2, …, teamSize]
export type MostLikelyPhase = 'prompt' | 'count' | 'result' | 'gameOver';
export interface MostLikelyTeam { name: string; players: Player[]; score: number }
export interface MostLikelyState {
	rng: Rng; pool: ContentItem[]; used: number[];
	teams: MostLikelyTeam[]; rounds: number;
	round: number;          // 0-based
	startTeam: number;      // opener of round 0
	turn: number;           // 0-based position in this round's order
	prompt: ContentItem; phase: MostLikelyPhase;
	lastPoints: number | null;
}
export type MostLikelyAction =
	| { type: 'redraw' } | { type: 'point' } | { type: 'score'; matched: number }
	| { type: 'next' } | { type: 'rematch' };
export function order(s: MostLikelyState): number[];             // team indexes of this round, opener first
export function current(s: MostLikelyState): number;             // team index on turn
export function ranking(s: MostLikelyState): { team: MostLikelyTeam; rank: number }[];
export function leaders(s: MostLikelyState): MostLikelyTeam[];
// GameDef: minPlayers 4, maxPlayers 20, minContent 1, stateVersion 2
```

Screen: the count choices are buttons with `data-action="score"`; in a demo only the one whose value equals the
scripted step's `matched` is enabled and `data-demo="expected"`. U1 ships an interim `demo.ts` on these types
(Alex & Bo vs Cleo & Dani, a few steps) so `runner.test.ts`, `registry.test.ts` and the Most Likely demo
tap-through stay green; U4 replaces the script.

## Risks / Trade-offs

- [A branch is unreachable with the fixture's seed] → change the seed, survey points or config, never fake state;
  if the runner truly can't reach it, the builder reports it and the branch becomes a tip-only mention, recorded as
  a deviation for Gate 2 (R1).
- [Long scripts slow the e2e tap-throughs, played several times in `demo.test.ts`] → accepted; the look walk does
  not walk demos (R2).
- [Most Likely's 5-round minimum makes its demo ~30 steps] → accepted; the progress line "Schritt n/N" is checked
  at every step by the tap-through.
- [The Feud tie needs exact survey points for sudden death] → the builder designs the fixture's points so the
  scores tie after the ×2 final; otherwise R1 applies.

## Migration Plan

No data migration. Browsers holding a version-1 Most Likely session see the existing "Der gespeicherte Spielstand
passte nicht mehr …" notice once. Rollback is a revert of the merge.
