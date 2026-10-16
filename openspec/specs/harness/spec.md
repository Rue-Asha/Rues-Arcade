# harness Specification

## Purpose
TBD - created by archiving change party-games-rebuild. Update Purpose after archive.
## Requirements
### Requirement: Proof commands
The repo SHALL provide `npm run proof` (svelte-check, build, unit tests) and `npm run proof:full` (proof plus
Playwright e2e). Both SHALL print the name of every passed test and exit non-zero on any failure. The e2e
server SHALL listen on `$PORT` and use a fresh per-port database so up to three runs can execute at once.

#### Scenario: Proof prints test names and passes
- **WHEN** `npm run proof` runs on a clean checkout with all tests passing
- **THEN** the output lists each passed unit test by name and the command exits 0
- **proof:** manual (infrastructure; proven by running it — its output is the evidence every other unit relies on)

#### Scenario: Proof fails on a failing check
- **WHEN** a typecheck error, build error or failing test is present
- **THEN** `npm run proof` (and `npm run proof:full`) exits non-zero
- **proof:** manual (infrastructure; proven by running it once with a deliberately failing test during U1)

#### Scenario: Proof-full runs e2e on an isolated database
- **WHEN** `PORT=4701 npm run proof:full` runs
- **THEN** Playwright lists every passed e2e test by name, and the server used `.e2e/4701.db`, not the dev database
- **proof:** manual (infrastructure; proven by running it)

### Requirement: E2E runs each check once per viewport
Every e2e test whose result can depend on the project's emulation SHALL run in both the `phone` and the `desktop`
project. A test that sets its own viewport before every assertion SHALL run in one project only: `phone` when it
uses only phone sizes, `desktop` when it uses a desktop size, alone or alongside a phone size. A test that only
uses the `request` fixture SHALL run in `desktop` only.

#### Scenario: Self-sized tests run in one project
- **WHEN** the e2e suite runs
- **THEN** every test that calls `setViewportSize` before its assertions, and every request-only test, runs in
  exactly one project and is reported skipped in the other
- **proof:** manual (suite structure; the run's JSON report is read at Gate 2 — the skips are runtime `test.skip`,
  so `--list` still lists both projects)

### Requirement: Look rules share one walk
The look rules in `e2e/look.test.ts` SHALL be checked on one walk per project that visits every screen and runs
every look check on each screen it visits. Each look rule SHALL remain its own test with its scenario name, and it
SHALL fail only when its own rule finds a violation.

#### Scenario: Look rules walk the app once per project
- **WHEN** the e2e suite runs
- **THEN** the app is walked once per project, and each look scenario is reported as its own test with its own
  result
- **proof:** manual (suite structure; proven by the e2e step's timing and list output on the change's PR)

#### Scenario: A broken look rule fails only its scenario
- **WHEN** one screen violates exactly one look rule
- **THEN** only that rule's scenario fails, and its message names the screen
- **proof:** manual (proven once during the build with a deliberately injected violation, then reverted)

