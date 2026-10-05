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

