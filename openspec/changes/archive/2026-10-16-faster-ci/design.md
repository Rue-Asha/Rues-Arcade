## Context

Measured on the v0.5.0 push run (`37815613665`, `origin/main` 00f66a8). The gate job takes 27 min: `npm ci` 6 s,
Playwright install 3 s, `proof` 51 s, `package` 16 s, e2e 1588 s. e2e runs 568 tests on 2 workers, 51 test-minutes
split almost evenly between `phone` and `desktop`. A run's wall time is 55–98 min because PR and push runs share
the one `homelab-check` runner instance of this repo (check01: 4 cores, shared with Homelab-Managment and
Life-Manager). A release runs the gate again on `ubuntu-24.04` (~27 min).

Where e2e time goes that is repetition rather than coverage:

| Repetition | Test-minutes | Saved |
|---|---|---|
| `look.test.ts`: 6 rules × 2 projects, each walks the whole app (60–108 s per walk, ~80 s of it walk + settle) | 15.8 | ~11.5 |
| 26 tests set their own viewport, yet run in both projects | 2.8 | 1.4 |
| `healthz` / `players-api` request-only tests in both projects | <0.1 | <0.1 |

## Goals / Non-Goals

**Goals:** cut e2e test-minutes without dropping any assertion on any viewport it asserts today. Stop PR and push
runs from queueing behind each other. Stop releases from rerunning the gate. Build once per gate run.

**Non-Goals:** see the proposal. In particular, the `desktop` project keeps running every game-logic test.

## Decisions

**D1: The look walk runs in a `beforeAll`, and the rules stay separate tests.** The walk-based scenarios move into
one `test.describe`. Its `beforeAll({ browser })` opens a page, walks once, and on each screen runs all checks into
one result object per rule (`small`, `low`, `stray` + `seen`, `foreign` + `screens`, `loud` + `seen`, `empty`). The
phone screenshot (`shot`) runs only in `phone`, `reach` + `shot` only in `desktop`. Each `test()` keeps its exact
name and asserts only its own result. `No horizontal scroll on phone` and `Desktop uses the width` keep their
`test.skip` lines.
- Why: the scenario names are cited in the proof lines of `design-system`, `feud`, `codes`, `duck` and `most-likely`.
  Keeping them avoids a spec delta in five capabilities, and a red rule stays a red test with its name.
- Each screen settles once before all checks run. The font and copy rules ran unsettled before, so they now see
  the screen at rest, which is the state players see. Outgoing `[data-leaving]` stages are gone by then, and those
  were `inert`/`aria-hidden` anyway.
- `browser.newContext()` inside the test runner gets the project's `use` options (baseURL, viewport, isMobile,
  hasTouch, extraHTTPHeaders). The build task checks this once with an `expect` on `page.viewportSize()` and the
  touch flag before walking.
- The hook timeout is set with `test.setTimeout(300_000)` inside the `beforeAll`. The walk takes ~1.5–2 min.
- Alternatives considered:
  - `test.describe.serial`: a failing rule would skip the rules after it.
  - One test with `expect.soft` per rule: renames the scenarios, so five specs would need new proof lines.
  - A `@look` tag with a custom reporter: too much machinery.

**D2: Self-sized tests run in one project, using the repo's `test.skip` idiom.** This is the same line as
`frame.test.ts:143`: `test.skip(info.project.name !== 'phone', '<why>')`. The project depends on what the test
sets:
- Only phone sizes → `phone`, which also keeps the touch emulation.
- Only desktop, or both → `desktop`. Narrowing and widening a window only happens on desktop, and there
  `setViewportSize` is an exact resize without mobile emulation.

The assignment, from the test bodies on `main`:

| Project | Tests |
|---|---|
| `phone` (15) | `feud-controls` "Feud fault row fits a phone"; `feud-prep-cards` "…wraps a long question"; `feud-prep-pages` "Feud sort goes to page 1", "Feud picks stay across pages"; `feud-prep` "…pager rises in a new page"; `feud-setup` "…wraps on a phone"; `feud` "Feud board fits a phone"; `pager` "…instant under reduced motion", "Added entry shows on page 1", "Deleting the last entry…", "Import goes to page 1"; `players` "Deleting the last saved player…", "Saving a player shows its page", "…differs only by a diacritic", "Roster stays unpaged" |
| `desktop` (11) | `feud-prep-cards` "Feud prep grid by width", "Feud picking keeps the grid in place"; `feud-prep-pages` "Feud prep pages by width", "…without pager for one page"; `feud-setup` "…in one row on desktop"; `pager` "Inhalte pages by width", "Survey cards page by width", "Pager hidden…", "Pager page clamps across 1024px", "Pager clamped page stays…"; `players` "Saved players page by width" |

Request-only tests (`healthz.test.ts`, `players-api.test.ts`) skip outside `desktop`.
- Alternative considered: tags plus `grepInvert` per project in `playwright.config.ts`. It is central, but a new
  pattern, and the reason would sit away from the test.

**D3: The gate runs `check` → `package` → `test:unit`.** `package` is the only build. `test:unit` must come after
it, because `scripts/package.test.ts` copies `build/`. `proof` stays the local command and is unchanged.

**D4: ci.yml picks the runner by event and cancels superseded PR runs.**
```yaml
concurrency:
  group: ci-${{ github.event.pull_request.number || github.sha }}
  cancel-in-progress: ${{ github.event_name == 'pull_request' }}
```
The runner is `${{ github.event_name == 'push' && '["ubuntu-24.04"]' || '["self-hosted","homelab-check"]' }}`.
- Push runs go to GitHub-hosted because the release publishes their tarball. Homelab-Managment's check-runner spec
  already requires release builds off the check host.
- Keying push runs by SHA means two merges never cancel each other.

**D5: release.yml promotes the push run's artifact.** `check-tag` gets `actions: read`. After the version check, it
finds the run with `gh run list --workflow ci.yml --event push --commit "$GITHUB_SHA"`. It retries for up to
2 minutes, because a tag pushed right after the merge can arrive before that run is registered. It then waits with
`gh run watch --exit-status` and outputs the run id. `publish` downloads `release-tarball` with that `run-id`,
re-verifies the sha256, attests and creates the release. The `gate` job goes away.
- If the artifact has expired (90 days), the error tells you to rerun the push run, which uploads it again.
- The parked stash `wip ci/release-promotes-ci-artifact` is the prior art; the retry is the addition.
- Alternative considered: a `workflow_run` trigger. It runs in the default branch's context without the tag ref,
  and the version check would need the tag passed through by hand.

**D6: Workers are measured, not assumed.** First, the PR runs D1–D5 at 2 workers to get a baseline. Then
`workers: process.env.CI ? 4 : undefined` is tried on the same PR. It stays if the e2e step is ≥20% faster and two
consecutive runs are green; otherwise it is reverted. Local runs keep Playwright's default.

## Risks / Trade-offs

- [The walk fails in `beforeAll`] → every walk-based look test reports the same error, as an error rather than a
  rule failure. This is acceptable: a broken walk is a broken app flow, and the other e2e files catch it by name.
- [A failing look test restarts the worker] → Playwright reruns `beforeAll` for the remaining tests, so a red run
  walks twice. This only costs time on red runs.
- [Settling before the font/copy checks hides a stray font in a transition] → outgoing stages are inert and
  invisible to players at rest. The `Phase transition` e2e covers transitions separately.
- [4 workers on check01 compete with the two other runners] → D6 only keeps 4 if it is measurably faster on
  check01 itself.
- [A self-sized test quietly depended on the project's emulation] → only the 26 listed tests change project. Their
  bodies set the viewport before the first page assertion; the API setup `expect`s run before that and do not
  depend on it.

## Migration Plan

Merge as one PR. The push run after the merge is the first on `ubuntu-24.04`, and the next tag is the first
promoted release. Rollback: revert the PR. The old gate-in-release path comes back with it.

## Open Questions

none
