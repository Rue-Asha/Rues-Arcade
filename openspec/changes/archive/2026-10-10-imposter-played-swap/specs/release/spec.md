## RENAMED Requirements

- FROM: `### Requirement: Version 0.5.1`
- TO: `### Requirement: Version 0.6.0`

## MODIFIED Requirements

### Requirement: Version 0.6.0
`package.json` and `package-lock.json` SHALL carry version 0.6.0. After the change is merged, tag `v0.6.0` SHALL be
pushed so the release workflow publishes `rues-arcade-0.6.0.tgz` with its sha256.

#### Scenario: Package and lockfile carry 0.6.0
- **WHEN** `package.json` and `package-lock.json` (root and `packages[""]`) are read
- **THEN** all three versions are "0.6.0"
- **proof:** unit

#### Scenario: Release v0.6.0 published
- **WHEN** tag `v0.6.0` is pushed on the merged `main`
- **THEN** the release workflow passes `check-tag` and a GitHub release v0.6.0 holds `rues-arcade-0.6.0.tgz` and its `.sha256`
- **proof:** manual (runs on GitHub after the ship-time tag push)
