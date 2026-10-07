# release Specification

## Purpose
TBD - created by archiving change party-games-rebuild. Update Purpose after archive.
## Requirements
### Requirement: CI workflow
`.github/workflows/ci.yml` SHALL run on pull requests and pushes to `main` (and as `workflow_call`) with
`contents: read`, and SHALL: run `npm run proof:full`, run `npm run package`, verify the tarball's sha256,
run the e2e suite against the unpacked tarball, upload the tarball and checksum as an artifact, and call the
`Rue-Asha/ci` security-baseline workflow pinned by commit SHA. Every `uses:` SHALL be pinned to a full SHA.

#### Scenario: CI is green on the change's PR
- **WHEN** the change's pull request is opened on GitHub
- **THEN** the `ci` job and the `security-baseline` jobs pass and a `release-tarball` artifact is uploaded
- **proof:** manual (runs on GitHub; the change's own PR shows the checks green)

### Requirement: Release workflow
`.github/workflows/release.yml` SHALL run on `v*` tags, check that the tag equals `v` + `package.json`
version, rerun the CI workflow, and publish a GitHub release with the tarball and its sha256.

#### Scenario: Tag does not match the version
- **WHEN** a tag `v9.9.9` is pushed while `package.json` says `0.1.0`
- **THEN** the `check-tag` job fails and no release is published
- **proof:** manual (runs on GitHub on a tag push; tagging is manual and outside this change)

### Requirement: Package script
`npm run package` SHALL build the app and write `dist/rues-arcade-<version>.tgz` plus
`dist/rues-arcade-<version>.tgz.sha256`, the tarball containing a runnable server (build output, migrations,
production `package.json`, lockfile).

#### Scenario: Package produces a verifiable tarball
- **WHEN** `npm run package` runs
- **THEN** `dist/` holds the tgz and a `.sha256` file that `sha256sum -c` accepts
- **proof:** unit

### Requirement: Server runtime configuration
The production server SHALL read `PORT`, `HOST`, `DATABASE_PATH` and `PROTOCOL_HEADER`, create the
database's directory if it is missing, and apply the package's `migrations/` on start whatever its working
directory. `package.json` SHALL declare
`engines.node >=22.18`.

#### Scenario: Missing database directory is created
- **WHEN** the server starts with `DATABASE_PATH` pointing into a directory that does not exist
- **THEN** the directory and database file are created and migrations are applied
- **proof:** unit

#### Scenario: Server starts from any working directory
- **WHEN** the built server is started with a working directory other than the package root
- **THEN** it applies the migrations and `GET /healthz` returns 200
- **proof:** e2e

### Requirement: Health check
`GET /healthz` SHALL return 200 when the database answers a query, and a non-200 status otherwise.

#### Scenario: Healthy server
- **WHEN** `GET /healthz` is requested on a running server with a working database
- **THEN** the response status is 200
- **proof:** e2e

#### Scenario: Unhealthy database
- **WHEN** the database cannot be queried
- **THEN** `GET /healthz` returns a non-200 status
- **proof:** unit

### Requirement: Harness declaration
`CLAUDE.md` SHALL contain `## Harness` declaring proof, proof-full, run, package and `ship: merge`.

#### Scenario: Harness declared with merge policy
- **WHEN** `CLAUDE.md` is read
- **THEN** its `## Harness` section lists `proof`, `proof-full`, `run`, `package` and `ship: merge`
- **proof:** manual (documentation; checked by reading the file at Gate 1/2)

### Requirement: Version 0.3.1
`package.json` and `package-lock.json` SHALL carry version 0.3.1. After the change is merged, tag `v0.3.1` SHALL be
pushed so the release workflow publishes `rues-arcade-0.3.1.tgz` with its sha256.

#### Scenario: Package and lockfile carry 0.3.1
- **WHEN** `package.json` and `package-lock.json` (root and `packages[""]`) are read
- **THEN** all three versions are "0.3.1"
- **proof:** unit

#### Scenario: Release v0.3.1 published
- **WHEN** tag `v0.3.1` is pushed on the merged `main`
- **THEN** the release workflow passes `check-tag` and a GitHub release v0.3.1 holds `rues-arcade-0.3.1.tgz` and its `.sha256`
- **proof:** manual (runs on GitHub after the ship-time tag push)

