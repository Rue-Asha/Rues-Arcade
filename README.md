# Rue's Arcade

Party games for one shared device (phone or laptop passed around the table).

## Setup

Requires Node.js ≥ 22.18 (`node:sqlite` without a flag, and `npm run import` loads TypeScript directly).

```sh
npm install
npx playwright install chromium   # once, for e2e
npm run dev                       # http://localhost:5173
```

## Checks

```sh
npm run proof        # typecheck, build, unit tests
npm run proof:full   # proof + Playwright e2e on phone and desktop viewports
```

`proof:full` serves the production build on `$PORT` (default 4173) with a throwaway database at
`.e2e/$PORT.db`, so several runs on different ports don't interfere.

## Content import

Content is never committed. The Imposter pairs and Wavelength spectra from the old Party-Games app are imported
once from the local backup into a new-schema database:

```sh
npm run import -- ../00_Archive/Party-Games-content-backup-2026-10-05/dev.db --into rues-arcade.db
```

The source is opened read-only; the target is created and migrated if needed. The importer prints one line per
table (`imposter_pairs: 35 imported, 0 already present`). Re-running it adds no duplicates. If a source table is
missing, it names it, still imports the other one and exits 1.

Then stop the service, copy `rues-arcade.db` to the host's data directory (the file `DATABASE_PATH` points at),
and start it again. From then on, content is edited in the app under "Inhalte".

## Release

```sh
npm run package      # dist/rues-arcade-<version>.tgz + .sha256
```

The tarball holds a runnable server: `build/`, `migrations/`, the production `package.json`, the lockfile and
its production `node_modules`. Unpack it and start it with `node build`; it reads `PORT`, `HOST`,
`DATABASE_PATH` and `PROTOCOL_HEADER`, creates the database directory if needed and applies migrations on
start. `GET /healthz` answers 200 while the database does.

To publish a release, bump `version` in `package.json` on `main`, then tag that commit `v<version>` and push the
tag. The `release` workflow checks that the tag matches the version, reruns CI (proof, package, e2e against the
unpacked tarball) and publishes a GitHub release with the tarball and its `.sha256`. Tagging is manual.

Deploying a release is not part of this repo: the Homelab change in Homelab-Managment will install it on the
host and bump its version from then on.
