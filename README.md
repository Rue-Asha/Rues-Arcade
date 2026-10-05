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
