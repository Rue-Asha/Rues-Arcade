## Why

Rue's party-game app (archive: `00_Archive/Party-Games`) works, but every game is a 900–1150-line page
mixing UI, state and persistence, with four separate lobbies, duplicated editors and no tests, and players
can't learn a game inside the app. Rebuild from scratch on a game-engine foundation, port the two finished
games (Imposter, Wavelength) with their content, add a guided Demo and committed Explanation slides per game,
and restyle toward a "gamer vibe".

Appetite: ~3 sessions (foundation + Imposter + Wavelength); everything else is split off. Exceeding it means renegotiating scope.

**Extension at Gate 2 (2026-10-05, Rue):** S18–S21 reopen this change before ship instead of a follow-up change —
the decoration variant "Spielbrett", a restructured start screen, neutral copy, and a Wavelength Koop mode so
two or three people can play. Appetite for the extension: ~1 session (units U15–U20).

## What Changes

New repo "Rue's Arcade" (`Rues-Arcade`, SvelteKit + Vite + TypeScript, adapter-node, node:sqlite). Nothing is
reused verbatim from the archive; the archive's pure rule functions are ported.

- Harness: `npm run proof` / `npm run proof:full` (S1).
- Releasable like Life-Manager: `ci.yml`, `release.yml`, `scripts/package.mjs`, env-configured server, `/healthz` (S1b).
- Design system in look A1 · Arcade-Abend, dark only, German UI (S2); motion (S3); synth sound with mute (S17).
- Home catalogue with locked "Bald verfügbar" tiles (S4); one shared roster on the device (S5).
- Engine contract: each game is a pure reducer with seeded RNG; sessions saved per action and resumed (S6).
- SQLite content store with forward-only migrations (S7), per-game content editor (S8), one-off importer
  from the old DB (S9), and a "not enough content" guard (S10).
- Imposter (S11) and Wavelength (S12) as faithful ports.
- Guided Demo framework (S13) with one scripted round per game (S14, S15).
- Explanation viewer for committed `static/explain/<slug>/index.html` slides (S16).

Added at Gate 2:
- Decoration "Spielbrett": inline-SVG illustrations from each game's own shapes on Home (banner, tile art),
  start screens, lobby and behind play screens, with permanent ambient motion that reduced motion turns off (S18).
- Start screen: banner with title, badge, player range and pitch; start panel first on phone / right column on
  desktop; "Mehr zu <Spiel>" box with Erklärung, Demo, Inhalte cards; start button reads "Los geht's" (S19).
- A one-line pitch on each Home tile; all new copy neutral and grown-up (S20).
- Wavelength mode switch Koop | Versus in the lobby: Koop = all chosen players (2–18) as one team, every player
  psychic once per round, one shared score, game over with total, average per turn and a rating tier;
  Wavelength's range becomes 2–18; old Versus saves still resume (S21).

## Capabilities

### New Capabilities
- `harness`: proof and proof-full commands (S1).
- `release`: CI, release workflow, packaging, server runtime config and health check (S1b).
- `design-system`: Arcade-Abend tokens, shared components, layout rules, motion (S2, S3), decoration (S18), neutral copy (S20).
- `sound`: synth SFX and mute toggle (S17).
- `catalogue`: Home tiles derived from the game registry (S4), tile pitch (S20), game start screen layout (S19).
- `roster`: shared device roster (S5).
- `game-engine`: reducer contract, seeded RNG, session save/resume (S6).
- `content-store`: SQLite schema and migrations, content editor, importer, minimum-pool guard (S7–S10).
- `imposter`: Imposter rules and its demo script (S11, S14).
- `wavelength`: Wavelength rules, Koop | Versus modes and its demo script (S12, S15, S21).
- `demo`: guided demo framework (S13).
- `explanation`: explanation viewer (S16).

### Modified Capabilities
- none (new repo, `openspec/specs/` is empty)

## Non-Goals

- Duck, Family Feud, Codes, Most Likely To — Rue wants to touch up their rules first; each its own later change (Split off).
- Charade — new game, later change.
- Multi-device rooms / phones joining — single device by decision.
- Content in git, or content for not-yet-ported games in the new DB — public repo, third-party material.
- Migrating old localStorage saves or old lobby rosters — nothing was deployed.
- Homelab LXC/role/deploy entry — separate later change; releases and deploy bumps stay manual.
- Light mode, English UI, accounts, auto-judging answers.
- Uploading explanations through the UI — they arrive by commit.
- A Koop demo script; per-player points in Koop.
- Decoration variants 2 (Automat) and 3 (Nachtlicht) — mocked, not chosen.

## Done criteria

- [ ] On phone and desktop, Rue can set up a roster, play a full game of Imposter and of Wavelength with the
      imported content, reload mid-game and continue.
- [ ] Each game's Demo plays one full round on the same example, end to end, by tapping the highlighted controls.
- [ ] Erklärung shows the empty state, and shows an HTML file once one is committed.
- [ ] `npm run proof:full` and CI are green; Rue approves the look on screenshots at Gate 2.
- [ ] Two people can play a full Wavelength Koop game; Rue approves the decorated screens on screenshots.

## Impact

- New GitHub repo `Rue-Asha/Rues-Arcade` (public), created only at Ship with consent; old `Rue-Asha/Party-Games` untouched.
- Content reaches the server once as a DB file produced by the importer from
  `00_Archive/Party-Games-content-backup-2026-10-05/dev.db`; Rue copies it to the host data dir (README).
- Homelab deploy is a later change in Homelab-Managment.
