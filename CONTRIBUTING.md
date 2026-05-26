# Contributing — Script Pipeline Guide

## Script Execution Order

Run validation scripts in this order. Each step depends on the previous one being clean, so **fix errors before moving to the next step**. This way you never get a later failure caused by an earlier issue.

| Step | Command | What it does | Why this order |
|------|---------|--------------|----------------|
| 1 | `bun run format:check` | Checks code formatting (Prettier) | Purely cosmetic — no logic impact. Fix formatting first so it doesn't mask real issues. |
| 2 | `bun run lint` | Checks code quality (ESLint) | Catches anti-patterns, unused vars, code smells. Independent of types/tests. |
| 3 | `bun run typecheck` | Checks type safety (TypeScript) | Must pass before tests — if types are broken, tests will fail for the wrong reasons. |
| 4 | `bun run test` | Runs unit & integration tests (Vitest) | Relies on types being correct. Catches runtime logic errors. |
| 5 | `bun run test:e2e` | Runs end-to-end tests (Playwright) | Depends on everything above. Slowest, so runs last. |
| 6 | `bun run build` | Creates production build (Next.js) | The ultimate gate — if this passes, everything else is green. |

## Auto-fix Scripts

These automatically fix issues (no manual editing needed):

| Command | What it does |
|---------|--------------|
| `bun run format` | Auto-formats all code with Prettier |
| `bun run lint:fix` | Auto-fixes ESLint issues where possible |

## CI Pipeline (All-in-One)

To run the entire pipeline in one command:

```bash
bun run ci
```

This runs: `format:check` → `lint` → `typecheck` → `test` → `test:e2e` → `build`

If any step fails, the pipeline stops. Fix the error and run `bun run ci` again.

## Development Scripts

These are for running the app, not for validation:

| Command | What it does |
|---------|--------------|
| `bun run dev` | Starts the local dev server with hot reload |
| `bun run start` | Starts the production server (requires `bun run build` first) |

## Git Hooks

| Command | What it does |
|---------|--------------|
| `bun run prepare` | Installs Husky git hooks (runs automatically on `bun install`) |
