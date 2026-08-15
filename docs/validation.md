# Refactor validation

The refactor was checked at the repository boundary before delivery.

## Completed checks

- Built `packages/contracts` with TypeScript project references.
- Strictly type-checked the web application, Cloud Functions, developer scripts, and Playwright specs. Temporary ambient declarations were used only by the delivery environment because npm dependencies could not be installed there; they are not part of this repository.
- Emitted the Cloud Functions JavaScript and confirmed it contains no runtime import of the private workspace contracts package.
- Resolved every relative and `@/` source import.
- Parsed all repository JSON and all 34 CSS files.
- Confirmed `shared/` has no dependency on `app/` or a business module.
- Confirmed browser source uses Vite environment variables rather than `process.env`.
- Confirmed the legacy browser-run migration components are absent.
- Compared all 92 original media assets byte-for-byte after categorization: no files are missing, changed, or added.
- Confirmed `apps/web/public/` contains only `favicon.svg`, `robots.txt`, and `site.webmanifest`.

## Checks that require dependency installation

The delivery environment could not resolve `registry.npmjs.org` (`EAI_AGAIN`), so it was not possible to perform a fresh npm installation. No lockfile was fabricated. After cloning or extracting the repository in a networked environment, run:

```bash
npm install
npm run build
npm test
npm run lint
npx playwright install chromium
npm run test:e2e
```

The first `npm install` creates the root `package-lock.json`; commit it, then change CI and deployment from `npm install` to `npm ci`.
