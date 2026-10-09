No app code changes; every task changes tests or CI only. "Unchanged and green" means the test passes without
changing its expectations. No test is deleted and no assertion is weakened: a test either keeps running in both
projects or moves to exactly the one design.md → D2 names. Run `npm run build` before a scoped `npx playwright test
<file>`; run `proof:full` with `run_in_background`. Baseline for every timing claim: run `37815613665` (e2e 1588 s,
568 tests, 2 workers).

Waves: Wave 1: U1 ∥ U2 ∥ U3 · Wave 2: U4 · after merge: U5.

## 1. Look rules share one walk

> unit: depends=none · files=e2e/look.test.ts

- [x] 1.1 Move the six walk-based look scenarios into one `test.describe` whose `beforeAll({ browser }, info)` sets
      `test.setTimeout(300_000)` and opens a page. It first asserts the project's viewport and touch flag on that
      page, so it fails loudly if the context did not get the project's `use` options. Then it attaches the request
      listener of "Decoration loads no external assets" and calls `walk()` once with a combined `check`: settle once,
      then run the touch, contrast, Press Start 2P, copy and asset collectors, plus `shot` on `phone`, or `shot` +
      `reach` on `desktop`, into one result object per rule (design.md → D1). Each `test()` keeps its exact current
      name and asserts only its own result. "No horizontal scroll on phone" and "Desktop uses the width" keep their
      `test.skip`. The reduced-motion and "Motion never blocks input" tests stay outside the describe, unchanged.
      `npx playwright test e2e/look.test.ts` green.
      Unchanged and green: Touch targets are at least 44px · Text contrast meets 4.5:1 · Press Start 2P stays limited
      to logo and scores · Decoration loads no external assets · New copy has no exclamation marks · No horizontal
      scroll on phone · Desktop uses the width · Reduced motion makes transitions instant · Motion never blocks input.
- [x] 1.2 Prove the isolation: inject one violation (e.g. a 30 px button on one screen), and run
      `look.test.ts`. Only "Touch targets are at least 44px" may fail, and its message names the screen. Revert the
      injection, keep the output as evidence. Also record the file's run time against the baseline (look total 15.8
      test-min). (Scenario: A broken look rule fails only its scenario · Look rules walk the app once per project)

## 2. Self-sized and request-only tests run in one project

> unit: depends=none · files=e2e/pager.test.ts, e2e/players.test.ts, e2e/feud-prep.test.ts, e2e/feud-prep-pages.test.ts, e2e/feud-prep-cards.test.ts, e2e/feud-setup.test.ts, e2e/feud-controls.test.ts, e2e/feud.test.ts, e2e/healthz.test.ts, e2e/players-api.test.ts, CLAUDE.md

- [x] 2.1 Add `test.skip(info.project.name !== '<project>', '<reason>')` as the first line of each of the 26 tests in
      the design.md → D2 table: 15 to `phone`, 11 to `desktop`. Use the existing reasons' style (`'390px layout'`,
      `'resizes the window'`). Before each one, re-read the body: the first page assertion must come after a
      `setViewportSize`, and the body must not use `touchscreen`. Any test that fails this check stays in both
      projects and is listed in the unit's report. The scoped run of every touched file is green.
      Unchanged and green: all 26 tests by name, in their project.
- [x] 2.2 Request-only tests: the same skip, to `desktop` with reason `'server only'`, in `healthz.test.ts` (3) and
      `players-api.test.ts` (2). Green.
- [x] 2.3 `CLAUDE.md` → Harness: one sentence saying that tests which set their own viewport or only call the API
      run in one project. Then, from the JSON report of a run of the touched files: every test from 2.1/2.2 is
      skipped in exactly one project and passes in the other, and no other test is skipped. Keep the output as
      evidence. (`--list` cannot show this, because the skips are runtime.) (Scenario: Self-sized tests run in one
      project)

## 3. CI: runner by event, cancel superseded PRs, build once, promote the release artifact

> unit: depends=none · files=.github/workflows/ci.yml, .github/workflows/gate.yml, .github/workflows/release.yml, README.md

- [x] 3.1 `ci.yml`: the runner chosen by event, plus the `concurrency` block from design.md → D4. Fix the gate's
      header comment (it is no longer shared with `release.yml`).
- [x] 3.2 `gate.yml`: replace `npm run proof` + `npm run package` with `npm run check`, then `npm run package`, then
      `npm run test:unit` (design.md → D3). Keep the comment on the missing npm cache.
- [x] 3.3 `release.yml` per design.md → D5: `check-tag` gets `actions: read`, finds the push run with a retry of
      up to 2 min, watches it with `--exit-status` and outputs `ci-run-id`. `publish` downloads `release-tarball`
      with that `run-id` and `github-token` and gets `actions: read`. The `gate` job is removed. The error text for
      a missing run names the SHA. The error for a missing artifact tells you to rerun the push run. Take the
      parked stash `wip ci/release-promotes-ci-artifact` as the starting point (`git stash show -p`); do not pop it.
- [x] 3.4 `README.md` release section: the release checks the tag and the green push run, then publishes that
      run's tarball, and the tag should follow the merge within the artifact retention.
- [x] 3.5 Lint locally: `actionlint` and `zizmor` on `.github/workflows/` (the security-baseline runs both). Both
      must be clean, and every `uses:` still pinned to a full SHA.

## 4. Verify on the PR and measure workers

> unit: depends=1,2,3 · files=playwright.config.ts

- [ ] 4.1 `npm run proof:full` green locally, then open the PR (ship policy: merge). On its run, record the e2e
      step time against 1588 s (target: at least 300 s shorter) and confirm exactly one `vite build` in the gate log.
      (Scenario: CI is green on the change's PR · Gate builds once)
- [ ] 4.2 Push a second commit while the PR run is running: the first run ends as cancelled. (Scenario: Superseded
      PR run is cancelled)
- [ ] 4.3 Try workers per design.md → D6: set `workers: process.env.CI ? 4 : undefined` in `playwright.config.ts`
      and push. Keep it only if the e2e step is ≥20% faster than 4.1 and two consecutive runs are green; otherwise
      revert it. Record both timings and the decision in the PR description.

## 5. After merge

> unit: depends=4 · files=none

- [ ] 5.1 Check the push run on `main`: its `ci` job runs on `ubuntu-24.04` and uploads `release-tarball`.
      (Scenario: Push to main runs on a GitHub-hosted runner)
- [ ] 5.2 ⚠ irreversible (publish) At the next release, which Rue tags by hand: the release run has no gate job,
      and the `.sha256` on the release equals the push run's artifact. (Scenario: Release publishes the tested
      tarball · Tagged commit has no green push run is proven only if it ever happens; no artificial bad tag)
