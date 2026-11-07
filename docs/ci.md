# Continuous integration

CI runs on GitHub Actions. Workflows live in `.github/workflows/`.

## What runs, and when

| Workflow / job                           | What it checks                                                                                  | Runs on                               |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------- |
| `ci.yml` / **Lint, format & type-check** | ESLint, Prettier, and type-checks `scripts/` and Playwright specs                               | Every PR and push to `main`           |
| `ci.yml` / **Unit tests**                | Vitest for `apps/web` and `apps/functions`                                                      | Every PR and push to `main`           |
| `ci.yml` / **Build**                     | `npm run build` for contracts, web, and functions                                               | Every PR and push to `main`           |
| `ci.yml` / **End-to-end (Playwright)**   | Headless Chromium against a production build                                                    | Every PR and push to `main`           |
| `dependency-review.yml`                  | Blocks PRs that add or upgrade runtime dependencies with known high or critical vulnerabilities | PRs touching dependency manifests     |
| `dependency-audit.yml`                   | Non-blocking `npm audit --omit=dev --audit-level=high` report                                   | Mondays 09:17 UTC and manual dispatch |
| `.github/dependabot.yml`                 | Weekly updates for npm and pinned GitHub Actions                                                | Weekly                                |

All workflows use read-only repository permissions. Actions are pinned to full commit SHAs, npm installs use `npm ci`, and `.nvmrc` is the Node version source. Playwright browsers are cached by Playwright version.

## Run the same checks locally

```bash
nvm use
npm ci
npm run lint
npm run format:check
npm run typecheck:tools
npm test
npm run build
npx playwright install chromium   # first time only
npm run test:e2e
```

`npm run verify` runs lint, format check, tools type-check, unit tests, and build. To inspect production dependency advisories, run `npm audit --omit=dev --audit-level=high`.

## Recommended branch protection for `main`

Require `Lint, format & type-check`, `Unit tests`, and `Build`. Add `End-to-end (Playwright)` after it has passed on a few real runs. Do not require `Dependency review`: it is skipped on PRs that do not touch dependencies.

## Known issues

- The initial audit found 41 advisories overall (3 critical, 10 high, 28 moderate), including 25 in production dependencies (1 critical, 6 high, 18 moderate). `proxy-addr` and `body-parser` have non-breaking fixes; the remaining production highs need a deliberate Firebase SDK upgrade review. The audit workflow reports without failing until this backlog is resolved.
- ESLint reports a `react-refresh/only-export-components` warning in `AuthProvider.tsx`.
- `firebase-admin` is on 13.x: it supports Node 22, but v14 dropped Node 18/20 support and removed legacy namespace imports, so upgrading it is a separate change. Cloud Functions now declare Node 22 in `engines`, which changes the runtime used on the next deploy.
- `deliberations.spec.ts` and `profile.spec.ts` contain skipped placeholders. There are no Firestore or Storage rules tests.
- The main JS bundle is about 1 MB and several marketing images are 1–2 MB; Vite reports chunk size warnings.
- Playwright could not be run in the implementation environment because browser downloads were unavailable. If its first CI run fails, inspect the uploaded `playwright-report` artifact.
