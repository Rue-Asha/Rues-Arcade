## Why

A CI run takes 55–98 minutes from push to green, but only ~27 of them are work, and 26 of those are e2e. The rest
is waiting: PR runs and pushes to `main` share the one `homelab-check` runner and queue behind each other. A
release then runs the whole gate a third time. Inside the suite, the six look rules each walk the entire app again
in both projects (12 walks, 15.8 of 51 test-minutes). 26 tests set their own viewport and still run once per
project. Nothing in this time is coverage; it is repetition.

Appetite: one session. Exceeding it means renegotiating scope.

## What Changes

- **Look rules share one walk per project.** `e2e/look.test.ts` walks the app once per project and runs every look
  check (touch targets, contrast, Press Start 2P, external assets, exclamation marks, horizontal scroll, desktop
  width) on each screen of that walk. Every scenario keeps its test name and its own pass/fail. 12 walks become 2.
- **Tests that size their own viewport run once.** The 26 tests that call `setViewportSize` (pager, saved players,
  Feud prep grid/pages/cards, Feud setup/controls/board) run only in the project that matches the device they
  model, following the existing `test.skip(info.project.name !== …)` idiom. The request-only tests (`healthz`,
  `players-api`) run once too.
- **The gate builds once.** It runs `check`, `package` and `test:unit` instead of `proof` followed by `package`,
  which built the app twice.
- **PR and push runs stop queueing behind each other.** PRs stay on `homelab-check`. Pushes to `main` run on
  `ubuntu-24.04`, the runner the release tarball must come from. A newer push to a PR branch cancels its running
  PR run. Push runs are never cancelled.
- **A release publishes the tarball CI already tested.** `release.yml` checks the tag and waits for the green
  `ci` push run of the tagged commit. It then publishes that run's `release-tarball` artifact instead of calling
  the gate again.
- **Measured: e2e workers.** Playwright runs 2 workers on both runners today (half of 4 cores). The change tries 4
  and keeps them only if the suite is measurably faster and stays green; otherwise it stays at 2.

Expected effect: about 13 test-minutes less (51 → ~38), so the e2e step drops from ~26 to ~19 min at 2 workers. On
top of that, the queue in front of PR runs goes away and a release takes ~2 minutes instead of ~30.

## Capabilities

### New Capabilities

none

### Modified Capabilities

- `release`: the CI workflow picks its runner by event, cancels superseded PR runs and builds once. The release
  workflow publishes the push run's tested tarball instead of rerunning the gate.
- `harness`: the e2e suite runs each look walk once per project, and tests that set their own viewport or only
  call the API run in one project.

## Non-Goals

- Dropping the `desktop` project for game-logic tests. That would save ~20 more test-minutes, but it gives up
  mouse-vs-touch and ≥1024px rail coverage, which this change promises to keep.
- Sharding e2e across jobs. Each repo has exactly one check runner, so PR runs would not get faster. Sharding only
  pays off on GitHub-hosted push runs and needs a separate build job.
- Removing the `waitForTimeout`s in `feud.test.ts` "Feud motion …". They sample animations over time on purpose.
- An npm cache. `npm ci` takes 6 s, and the job feeds a release.
- The same changes for Life-Manager. Its gate is a copy of this one, so it is the follow-up once this is merged.
- Moving `gate.yml` / `release.yml` into `Rue-Asha/ci` as shared workflows.

## Done criteria

- [ ] An e2e run reports each of the 7 look scenario names under its projects, as today, and 26 + 5 more skipped
      tests than on `main`, each skipped in exactly one project.
- [ ] The change's PR runs green on `homelab-check`, and its e2e step is at least 5 minutes shorter than on `main`
      (26 min).
- [ ] After merge, the push run on `main` runs on `ubuntu-24.04` and uploads `release-tarball`.
- [ ] A second push to a PR branch cancels that PR's running `ci` run.
- [ ] The gate log shows exactly one `vite build` before e2e.
- [ ] The next release tag publishes without a gate job, using the artifact of the push run.
- [ ] `npm run proof:full` green locally.

## Impact

- Tests: `e2e/look.test.ts`. Viewport-only `test.skip` lines in `e2e/pager.test.ts`, `e2e/players.test.ts`,
  `e2e/feud-prep.test.ts`, `e2e/feud-prep-pages.test.ts`, `e2e/feud-prep-cards.test.ts`, `e2e/feud-setup.test.ts`,
  `e2e/feud-controls.test.ts`, `e2e/feud.test.ts`, `e2e/healthz.test.ts` and `e2e/players-api.test.ts`. Possibly
  `playwright.config.ts` (workers).
- CI: `.github/workflows/ci.yml`, `.github/workflows/gate.yml`, `.github/workflows/release.yml`.
- Docs: `README.md` (release section), `CLAUDE.md` Harness (projects note).
- No app code, schema, API or dependency change. Coverage stays the same: every scenario still runs on every
  viewport it asserts.
- Supersedes the parked WIP on `ci/release-promotes-ci-artifact` (stash `wip ci/release-promotes-ci-artifact`),
  which already implements the release part and serves as prior art.
