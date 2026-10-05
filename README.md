# Rue's Arcade

Party games for one shared device (phone or laptop passed around the table).

## Setup

Requires Node.js ≥ 22.5 (uses `node:sqlite`).

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
