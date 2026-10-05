# Scope: party-games-rebuild

Triage: feature — new repo, data model, deploy pipeline, new features, redesign. Appetite: ~3 sessions (foundation + Imposter + Wavelength); everything else split off.

## Problem
Rue's party-game app (archive: `00_Archive/Party-Games`) works, but every game is a 900–1150-line page
mixing UI, state and persistence, with four separate lobbies, duplicated editors and no tests, and players
can't learn a game inside the app. Rebuild from scratch on a game-engine foundation, port the two finished
games (Imposter, Wavelength) with their content, add a guided Demo and committed Explanation slides per game,
and restyle toward a "gamer vibe".

## Flows
- Set up party: Home → Spieler (shared roster) → add/rename/remove players → back to Home.
- Play: Home → game tile → game start screen (rules summary, Demo, Erklärung, settings) → lobby/team
  formation from roster → rounds → game over → play again / Home.
- Resume: refresh or reopen mid-game → same phase restored → continue or "Spiel beenden".
- Demo: game start screen (or header during play) → Demo → coach tip + highlighted control per step →
  one full round on the fixed example → "Demo beendet" → back to where you were.
- Explanation: game start screen → Erklärung → fullscreen slides (iframe) → close; or empty state.
- Edit content: game start screen → Inhalte → list / add / edit / delete / bulk import.
- Import (CLI, once): `npm run import -- <old-db> --into <new.db>` → counts per table → copy the file to the host data dir (README).
- Add an explanation (commit): drop `static/explain/<slug>/index.html` (+ assets) → build/deploy → button shows it.

## Entity model
```
Roster (device) ── players ──▶ GameSession (per game, device)
Game (registry: slug, name, colour, player limits, phases)
 ├─ engine: pure reducer (state, action) → state; all randomness from seeded RNG
 ├─ content pool ◀── SQLite table(s) ◀── editor UI / importer
 ├─ demo: committed fixture content + seed + scripted actions → same engine
 └─ explanation: static/explain/<slug>/index.html (optional)
```

## In scope
- **S1** Harness: `npm run proof` (svelte-check, unit tests, build) and `npm run proof:full` (+ Playwright e2e)
  exist, print passed test names, exit non-zero on failure.
  - edges: none (infrastructure; proven by running it)
- **S1b** Releasable like Life-Manager: `ci.yml` (proof:full → `npm run package` tarball + sha256 → e2e against the
  unpacked tarball → artifact; calls `Rue-Asha/ci` security-baseline pinned by SHA), `release.yml` (tag must equal
  package.json version → ci → GitHub release with tgz + sha256), `scripts/package.mjs`; server reads `PORT`, `HOST`,
  `DATABASE_PATH`, `PROTOCOL_HEADER`, creates the DB dir, migrates on start; `GET /healthz` returns 200;
  `engines.node >=22.5`; `## Harness` in CLAUDE.md with `ship: merge`.
  - edges: tag ≠ version → release fails before publishing; DB dir missing → created; unhealthy DB → /healthz non-200.
- **S2** Design system in look **A1 · Arcade-Abend** (see Decisions): tokens + shared components (button with
  press state, game tile, card, scoreboard, lives, modal, hold-to-view, coach tip), German UI, dark only.
  - edges: phone 390px and desktop ≥1280px both designed (no empty desktop); one alignment rule for all
    main screens; text contrast ≥4.5:1; touch targets ≥44px.
- **S3** Motion: screen/phase transitions, juicy press feedback, score count-up, per-phase reveal animation.
  - edges: prefers-reduced-motion → transitions instant, no count-up animation; motion never blocks input.
- **S4** Home catalogue: one tile per registered game (name, colour, player range from the game's own config).
  - edges: player range text can't contradict the engine limits (derived, not typed); the five later games
    (Duck, Family Feud, Codes, Most Likely To, Charade) show as locked "Bald verfügbar" tiles with no actions.
- **S5** Shared roster: add, rename, remove, reorder players; remembered on the device.
  - edges: empty/whitespace name rejected; duplicate name (case-insensitive) rejected; roster below a
    game's minimum → start disabled with "mind. N Spieler"; above maximum → pick who plays; first run → empty
    roster prompt; storage unavailable → works for the session.
- **S6** Engine contract + resume: each game is a pure reducer with seeded RNG; a session is saved on every
  action and restored on reload; "Spiel beenden" clears it.
  - edges: saved state from an older version/corrupt → discarded with a notice, no crash; two tabs → last
    write wins (accepted); roster edited mid-game → running session keeps its own player snapshot.
- **S7** Content store: SQLite (node:sqlite), forward-only migrations applied at startup, one structured
  table per content type (imposter pairs; wavelength spectra); DB file gitignored.
  - edges: fresh DB → empty tables, app runs; migration failure → server refuses to start with the error.
- **S8** Content editor per game (Inhalte): list, add, edit, delete, bulk import (`a | b` per line).
  - edges: empty line skipped; malformed line → reported with line number, rest imported; duplicate →
    skipped and counted; delete asks for confirmation; very long text → limited length with message.
- **S9** Importer: `npm run import -- <old-db> --into <new.db>` reads an old-schema SQLite file (backup at
  `00_Archive/Party-Games-content-backup-2026-10-05/dev.db`) and imports `imposter_prompts` and
  `wavelength_prompts` into the new schema; prints counts.
  - edges: re-run → no duplicates (idempotent); missing table → named error, other table still imported;
    file missing/not SQLite → clear error, exit non-zero; `{NAME}` placeholders preserved.
- **S10** Empty or small pool: a game can't start without enough content; it says so and links to Inhalte.
  - edges: Demo still works with an empty DB (it uses committed fixtures).
- **S11** Imposter (faithful port): 3–12 players. Reveal: each player in turn holds to view their question
  (hold-to-view); one random player gets the imposter question; `{NAME}`/`{NAME2}` filled with distinct
  random player names → crew question shown to all → unmask imposter → next round. Skip redraws the pair
  and restarts the reveal. No scoring; rounds repeat until the players leave.
  - edges: pairs drawn without repeats until the pool is exhausted, then reshuffled; pool of 1 pair →
    repeats allowed; `{NAME2}` with only distinct names available (≥3 players guaranteed); handing over
    shows "Gib das Handy an <Name>" between players.
- **S12** Wavelength (faithful port): 2–6 teams of 2–3 players, 1–5 rounds (default 3). Per turn: draw
  spectrum (left|right) + random target → psychic-only reveal (hold-to-view) → team sets the dial →
  lock-in scores 4/3/2/0 by distance bands (as in the archive) → result. Psychic rotates within the team
  each round; a round = every team one turn; game over shows winner or tie.
  - edges: dial works with touch drag, mouse and keyboard (arrow keys); redraw changes spectrum and target;
    target at extremes (0°/180°) scores correctly; tie for first → shown as tie.
- **S13** Guided Demo framework: Demo button on each game's start screen and in the header during play.
  Plays one full round of committed fixture content with fixed players (Alex, Bo, Cleo, Dani) through the
  real engine; each step shows a coach tip ("Schritt 3/12") and only the expected control is enabled;
  hidden information is shown openly with a [Demo] tag; "Demo beenden" anytime.
  - edges: demo never reads or writes the saved session, roster or DB; exiting returns to the screen it
    was started from with the real session intact; reload during demo → back to the start screen;
    reduced motion → still fully steppable.
- **S14** Imposter demo script: one full round on its fixed example, ends at "Demo beendet".
  - edges: same example every run (proven by a test that plays the script to the end).
- **S15** Wavelength demo script: one full round (2 teams × 1 turn) on its fixed example.
  - edges: same as S14.
- **S16** Explanation viewer: "Erklärung" on each game's start screen opens `static/explain/<slug>/index.html`
  fullscreen in a sandboxed iframe (scripts allowed, no same-origin); close by button or Esc.
  - edges: file missing → "Für dieses Spiel gibt es noch keine Erklärung."; adding the file + rebuild is
    enough (no code change); `static/explain/README.md` documents the format; assets next to index.html load.
- **S17** Sound: original WebAudio synth SFX (press, reveal, correct, wrong, win) in every game; mute toggle
  remembered on the device.
  - edges: no sound before the first user interaction (autoplay policy); WebAudio unavailable → silent, no error.

## Non-goals
- Duck, Family Feud, Codes, Most Likely To — Rue wants to touch up their rules first; each its own later change (Split off).
- Charade — new game, later change.
- Multi-device rooms / phones joining — single device by decision.
- Content in git, or content for not-yet-ported games in the new DB — public repo, third-party material.
- Migrating old localStorage saves or old lobby rosters — nothing was deployed.
- Homelab LXC/role/deploy entry — separate later change; releases and deploy bumps stay manual.
- Light mode, English UI, accounts, auto-judging answers.
- Uploading explanations through the UI — they arrive by commit.

## Codebase touchpoints
- New repo; no existing code is reused verbatim. Archive references (read-only), from explorers:
  - `00_Archive/Party-Games/src/lib/games/{imposter,wavelength,types}.ts` — pure rule functions to port.
  - `00_Archive/Party-Games/src/routes/games/{imposter,wavelength}/+page.svelte` — phase machines and copy.
  - `00_Archive/Party-Games/migrations/*.sql` — old schema the importer reads.
  - `00_Archive/Party-Games/src/app.css` — old tokens (Midnight arcade), superseded by the A1 · Arcade-Abend artboard.
- Archive pain points to avoid: 900+-line pages, per-page localStorage restore, four lobbies, duplicated
  editors/server modules, two migration runners, JSON-text columns.

## Risks
- R1 Replacing the old public repo → resolved: separate new repo "Rue's Arcade"; the old repo stays untouched.
- R2 Heavy motion on low-end phones → accepted; reduced-motion path + transitions on transform/opacity only.
- R3 Explanation HTML that pulls CDN assets fails offline or under the sandbox → accepted; README asks for self-contained files.
- R4 Demo determinism → resolved by design: seeded RNG + scripted actions; a test runs each script to the end.
- R5 iOS WebAudio needs a user gesture → resolved in S17 edges.

## Decisions
- Separate new repo, display name "Rue's Arcade", slug `Rues-Arcade` (dir `/home/Rue/Repos/Rues-Arcade`, GitHub
  `Rue-Asha/Rues-Arcade`, public, created at Ship with consent; service name `rues-arcade`). Old `Rue-Asha/Party-Games`
  stays as it is — user, 2026-10-05 (corrected after: unrelated histories can't be PR'd).
- Home shows locked "Bald" tiles for the later games — user.
- Ship: same as Life-Manager → `ship: merge` (merge only lands code + runs CI). Release (tag) and deploy (Homelab
  version-bump PR → self-hosted runner) stay manual — user + explorer (Life-Manager pipeline).
- Homelab side (LXC, role, playbook, deploy.yml entry) is a separate later change in Homelab-Managment — user.
- Content reaches the server once as a file: importer writes a new-schema DB, Rue copies it to the host data dir
  (documented in README); afterwards content is edited in the app — user.
- Single device, no realtime, no server game state — user.
- SQLite + in-app editors, structured schema, content never committed (public repo, third-party content) — user.
- Demo = guided, you tap, locked to the highlighted control, button on start screen + header — user.
- Explanation = self-contained committed HTML in a sandboxed iframe — user.
- Motion: lots — user. Sound: synth SFX everywhere with mute — user.
- One shared roster on the device — user.
- Two-step plan: this change = foundation + Imposter + Wavelength; other games later after rule touch-ups — user.
- Import source = local backup (server was never deployed) — user.
- Ported games keep their archive rules ("finished") — only UI, structure and the new features change — user.
- Stack: SvelteKit + Vite + TypeScript, npm, adapter-node, node:sqlite (Rue's web-repo default + archive deploy target).
- Visual direction: **A1 design with palette P2 "Arcade-Abend"** — user, 2026-10-05, after A ("zu kindlich und zu grell")
  and A1 ("zu matt"). Source of truth: `design/look-A1-P2-arcade-abend.dc.html` in this change dir (canvas artboard
  "A1 · Arcade-Abend" on https://claude.ai/artifact/FX7bUJxszWwVgfDXGjX8gE); `design/look-A1-matt.dc.html` is the
  same design in the rejected muted palette, for reference only. Key traits: Sora (UI) + Press Start 2P (logo letter
  and scores only); neutral tiles, radii 10–14px, 5px bottom ledge that the button sinks into; game colour on icon
  badge, ledge, a 3px top edge and a 9% tint; primary button and leader row fully coloured. P2 core: ground #111234,
  primary #6bd672, Imposter #eb616d, Feud/leader-gold #f4c34a, Wavelength #38ccc8 (full token set in the artboard).
  Motion: ease-out rise, staggered entry, count-up, reveal pulse; no candy-saturated large fills.
- "Bald" tiles for later games are neutral/greyed; each later game gets its colour in its own change.
- Mobbin grounding for the look: Linear https://mobbin.com/sites/sections/7fa7a9aa-ee27-47ca-ae07-c8a3d4f02f46 ·
  Xbox https://mobbin.com/screens/ff4ca3bf-a3e5-441b-b6b6-fc925af73e69 · Discord https://mobbin.com/screens/fea6c171-22f1-45eb-86f1-eb5f769080c0 ·
  Spotify https://mobbin.com/screens/f55540ce-24bd-43ac-a919-0908f07e3e09 · Box Box Club https://mobbin.com/screens/47acfd35-2639-4115-b96c-d37f95c6efd5 ·
  counter-reference Duolingo https://mobbin.com/screens/fe966528-929c-475b-b917-9b342e3868a5.

## Mobbin refs (research 2026-10-05)
- Pass-the-phone hold-to-view: Lapse https://mobbin.com/screens/d1dcea39-d65e-40ec-8031-bb7d87fbf787
- Guided demo coach tips + End demo: Front https://mobbin.com/flows/fbcd68e6-4169-4e6c-81be-51d574c743d8 (screens feb77aee-0944-44e5-842f-0a65168188bf, c1f6b71a-be6e-4149-824c-f58777213f87)
- Desktop catalogue: Netflix games https://mobbin.com/screens/f556eaad-4619-4ce0-b4df-484483a47ce5 · hero https://mobbin.com/screens/f69a8814-090c-455c-a6c8-ab1ba233f050
- Mobile catalogue tiles: Kahoot https://mobbin.com/screens/fc8b90b8-182d-4b3c-af51-0a6f614fbf2f
- Lobby slots: yope https://mobbin.com/screens/b8e0f240-a969-41bb-af3a-4bb5d9d80499 · team shields Kahoot https://mobbin.com/screens/f9fda452-d5ed-4e25-bed7-8c192fa79dfb
- Round start 3-2-1: WHOOP https://mobbin.com/screens/b1ba4a60-53b2-447f-b368-5f09ef077a7e
- Scoreboard: Deezer https://mobbin.com/screens/68e01182-2a54-4865-b268-9faca50ed6f0 · Duolingo league https://mobbin.com/screens/3e548b43-1fad-4ac7-bf8b-a9513a2aa4fd · Higgsfield podium https://mobbin.com/screens/8301c753-ef5e-4ed6-a208-f13d44dadbfb
- Slide viewer: Cash App https://mobbin.com/screens/ab53c620-435b-48af-8570-eb2c8890c02d · Bumble arrows+dots https://mobbin.com/screens/56d5faa0-b9cd-438e-a73c-361996fa6dd3
- Backup of the only content copies: `00_Archive/Party-Games-content-backup-2026-10-05/` (seeds/*.sql, dev.db, static/sounds/).

## Done when
- On phone and desktop, Rue can set up a roster, play a full game of Imposter and of Wavelength with the
  imported content, reload mid-game and continue.
- Each game's Demo plays one full round on the same example, end to end, by tapping the highlighted controls.
- Erklärung shows the empty state, and shows an HTML file once one is committed.
- `npm run proof:full` and CI are green; Rue approves the look on screenshots at Gate 2.

## Split off
- **Homelab: deploy Rues-Arcade** — Terraform host entry, role copied from `life_manager`, `03_SERVICES` playbook,
  host_vars, deploy.yml dispatch option; started after the first release (explorer: Life-Manager pipeline).
- **Later games to import** (archive state from explorers; each needs a rule touch-up explore first):
  1. Duck (Was reimt sich auf Ente) — 4–16 players, DUCKY lives, Chuck the Duck, manual scoring; 60 words.
  2. Family Feud — 2 families, 7-phase host flow, steal, keyboard shortcuts, sounds; 26 surveys (14 adapted from US show boards → licensing check).
  3. Codes — 2–5 teams of 2, one-word clues, 3/2/1 points; 91 words (27 hand-added).
  4. Most Likely To — 2–5 teams of 2, point-at-the-same-person matching; 60 prompts.
  5. Charade — new; countdown timer; no rules or content yet.
