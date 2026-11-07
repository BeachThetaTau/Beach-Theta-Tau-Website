# Beach Theta Tau Website

Monorepo for the Theta Tau Xi Epsilon Chapter website at California State University, Long Beach.

## Architecture

- `apps/web`: Vite + React application organized by business module.
- `apps/functions`: Firebase Cloud Functions for privileged operations.
- `packages/contracts`: shared frontend/backend TypeScript contracts.
- `firebase`: Firestore indexes, security rules, Storage rules, and emulator seed data.
- `scripts`: explicit maintenance and migration commands. Scripts default to dry-run where data could be changed.
- `tests/e2e`: Playwright browser tests.
- `docs`: architecture, data model, authorization, validation notes, the legacy refactor map, and operational runbooks.

The web application follows a vertical-feature structure. Business modules may use shared UI and infrastructure, while `shared/` does not import from business modules. Route composition, providers, guards, and layouts live under `src/app`.

## Requirements

- Node.js 20 or newer
- npm 10 or newer
- Firebase CLI for emulator and deployment commands

## Local development

```bash
npm install
cp apps/web/.env.example apps/web/.env.local
npm run dev
```

The root `package-lock.json` is committed and CI installs with `npm ci`. Use the Node version in `.nvmrc`.

The web app runs at `http://localhost:5173` by default.

### Firebase emulators

Set `VITE_USE_FIREBASE_EMULATORS=true` in `apps/web/.env.local`, then run:

```bash
npm run emulators
npm run seed:emulator
```

## Validation

```bash
npm run verify    # lint, format check, tools type-check, unit tests, build
npm run test:e2e  # Playwright (needs: npx playwright install chromium)
```

GitHub Actions runs the same checks on every pull request and push to `main`. See [`docs/ci.md`](docs/ci.md) for what each check does, how to run it locally, and known issues. [`docs/validation.md`](docs/validation.md) records the checks done during the original refactor.

## Environment variables

All browser-exposed Firebase values use Vite's `VITE_` prefix. See `apps/web/.env.example`. Firebase web configuration is not a secret; access control belongs in Firestore/Storage rules and privileged Cloud Functions.

`VITE_LEGACY_ADMIN_UIDS` exists only to preserve the previous deliberations administrator while custom claims are rolled out. Remove it after assigning the `admin` role through `scripts/grant-admin.mjs` and removing the matching compatibility clause from Firebase rules.

## Data migrations

Potentially destructive scripts are dry-run by default:

```bash
npm exec tsx scripts/migrate-legacy-users.ts -- --before-year=2026
npm exec tsx scripts/migrate-legacy-users.ts -- --before-year=2026 --apply

npm exec tsx scripts/migrate-deliberations.ts -- candidates.csv
npm exec tsx scripts/migrate-deliberations.ts -- candidates.csv --apply
```

Production scripts use Application Default Credentials. Point them at an emulator with `FIRESTORE_EMULATOR_HOST=127.0.0.1:8080`.

## Deployment

```bash
npm run build
firebase deploy
```

Vercel can also deploy the web workspace using the root `vercel.json`.
