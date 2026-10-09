## MODIFIED Requirements

### Requirement: CI workflow
`.github/workflows/ci.yml` SHALL run on pull requests and pushes to `main` with `contents: read` and call
`.github/workflows/gate.yml`: on the `homelab-check` runner for pull requests, on `ubuntu-24.04` for pushes to
`main`. A newer run for the same pull request SHALL cancel the one still running; push runs SHALL NOT be cancelled.
The gate SHALL run `npm run check`, `npm run package`, `npm run test:unit`, verify the tarball's sha256, run the e2e
suite against the unpacked tarball, and upload the tarball and checksum as the `release-tarball` artifact; the app
SHALL be built exactly once per gate run. `ci.yml` SHALL call the `Rue-Asha/ci` security-baseline workflow pinned by
commit SHA. Every `uses:` SHALL be pinned to a full SHA.

#### Scenario: CI is green on the change's PR
- **WHEN** the change's pull request is opened on GitHub
- **THEN** the `ci` job and the `security-baseline` jobs pass and a `release-tarball` artifact is uploaded
- **proof:** manual (runs on GitHub; the change's own PR shows the checks green)

#### Scenario: Push to main runs on a GitHub-hosted runner
- **WHEN** a commit is pushed to `main`
- **THEN** the `ci` job of its run reports the `ubuntu-24.04` runner and uploads `release-tarball`
- **proof:** manual (runs on GitHub after merge; the run's job page shows the runner)

#### Scenario: Superseded PR run is cancelled
- **WHEN** a second commit is pushed to a pull request branch while its `ci` run is still running
- **THEN** the earlier run ends as cancelled and the new run starts
- **proof:** manual (runs on GitHub; proven by pushing twice to the change's own PR)

#### Scenario: Gate builds once
- **WHEN** the gate job runs
- **THEN** its log shows exactly one `vite build` before the e2e step
- **proof:** manual (CI log; read on the change's PR run)

### Requirement: Release workflow
`.github/workflows/release.yml` SHALL run on `v*` tags, check that the tag equals `v` + `package.json`
version, wait for the `ci` run that the push of the tagged commit to `main` started and require it to succeed, and
publish a GitHub release with the tarball and its sha256 that this run uploaded, with build provenance attested. It
SHALL NOT build or test the app again.

#### Scenario: Tag does not match the version
- **WHEN** a tag `v9.9.9` is pushed while `package.json` says `0.1.0`
- **THEN** the `check-tag` job fails and no release is published
- **proof:** manual (runs on GitHub on a tag push; tagging is manual and outside this change)

#### Scenario: Tagged commit has no green push run
- **WHEN** a tag is pushed on a commit that has no `ci` push run on `main`, or whose run failed
- **THEN** the `check-tag` job fails with an error naming the commit and no release is published
- **proof:** manual (runs on GitHub on a tag push; tagging is manual and outside this change)

#### Scenario: Release publishes the tested tarball
- **WHEN** the version tag is pushed on a merged `main` commit whose `ci` push run is green
- **THEN** the release holds the tarball and `.sha256` from that run's `release-tarball` artifact, and the release
  run contains no gate job
- **proof:** manual (runs on GitHub at the next release; the checksum on the release equals the artifact's)
