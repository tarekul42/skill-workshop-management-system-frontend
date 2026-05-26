# Agent Guardrails — SWMS Frontend

## File Safety Guard

- NEVER use `rm -rf`, `fs.rmSync({recursive:true})`, or equivalent destructive operations
- NEVER overwrite a file that has more than 50 lines without first reading it completely
- NEVER modify `package.json` dependencies without running the package manager immediately after
- NEVER edit files in `node_modules/`, `.next/`, or `dist/`
- NEVER modify `.env` or `.env.local` files — only create `.env.example` templates
- NEVER push to `main` or `master` branch directly — always create a feature branch

## Testing Discipline Guard

- Every test file MUST be independently runnable (`vitest run path/to/test.ts`)
- NEVER import from other test files
- NEVER share mutable state between tests
- ALWAYS use `vi.fn()` or `vi.mock()` for external dependencies
- ALWAYS clean up mocks in `afterEach` or `afterAll`
- Mock the NETWORK LAYER (api-client), not the service layer
- For React components: mock `@/lib/api/services`, NOT `@tanstack/react-query`
- NEVER mock `console.log` unless the test specifically verifies logging behavior

## Coverage Expectations

- Utility functions (formatters, masking, validation): 100% line coverage required
- React components: 80% line coverage minimum — focus on interaction logic
- NEVER skip testing error paths, loading states, or empty states
- NEVER write tests that only assert "renders without crashing"

## Naming Conventions

- Test files: `<component>.test.tsx` or `<module>.test.ts`
- Place in same directory: `src/lib/formatters.test.ts` OR `__tests__/formatters.test.ts`
- E2E tests: `e2e/<feature>.spec.ts`
- Describe blocks: use the component/module name as the outer describe
- Test names: use "should [expected behavior] when [condition]" format

## CI/CD Pipeline Guard

- NEVER use `secrets.*` in steps that echo or log output
- NEVER hardcode API keys, tokens, or passwords in workflow files
- ALWAYS use `actions/checkout@v4` as the first step in every job
- ALWAYS cache `node_modules` and `.next/cache` for frontend builds
- ALWAYS use `concurrency` groups to prevent parallel deployments
- NEVER auto-deploy to production on `main` push without all checks passing
- ALWAYS deploy to a preview/staging environment first
- Pin all GitHub Actions to a specific SHA, not just a tag

## Frontend-Specific Guard

- This project uses Tailwind CSS v4 — theme customization is in `src/app/globals.css` using `@theme` blocks
- The project uses `@/` as the path alias for `src/` (configured in both `tsconfig.json` and `vitest.config.ts`)
- ALWAYS mock `next/navigation` (useRouter, usePathname) in component tests
- ALWAYS mock `next/headers` and `next/cookies` in server action tests
- NEVER use relative imports like `../../lib/formatters` when `@/lib/formatters` is available
- This project uses `import { motion } from "motion/react"` (v12), not `"framer-motion"`
