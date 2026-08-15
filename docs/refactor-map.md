# Legacy-to-monorepo refactor map

## Application shell

| Legacy location                               | New location                                       | Change                                                                                                    |
| --------------------------------------------- | -------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `src/App.tsx` and `src/components/Layout.jsx` | `apps/web/src/app/router.tsx` and `app/layouts/`   | Route composition is separated from reusable layouts.                                                     |
| Per-page authentication checks                | `app/providers/AuthProvider.tsx` and `app/guards/` | One auth subscription and reusable route guards now control protected routes.                             |
| `src/firebase.js`                             | `shared/lib/firebase/` and `shared/lib/env.ts`     | Firebase clients and emulator wiring are split by service and configured with Vite environment variables. |

## Features

| Legacy location                                                                                    | New module               |
| -------------------------------------------------------------------------------------------------- | ------------------------ |
| `src/pages/Home.tsx`, `About.tsx`, `Social.tsx`, `Professionalism.tsx`, `Service.tsx`, `Apply.tsx` | `modules/marketing/`     |
| `src/pages/Login.jsx`, `Signup.jsx`                                                                | `modules/auth/`          |
| `src/pages/Brothers.tsx`                                                                           | `modules/members/`       |
| `src/pages/Profile.jsx`                                                                            | `modules/profile/`       |
| `src/pages/Delibs.jsx` and deliberation components                                                 | `modules/deliberations/` |
| `src/pages/Retreat.tsx` and `BingoGame`                                                            | `modules/retreat/`       |

Each stateful module now separates Firebase access (`api/`), subscription/action state (`hooks/`), reusable feature UI (`components/`), and route composition (`pages/`).

## Operational code

The legacy `CsvToFirestore.jsx` and `MoveDocumentsComponent.tsx` components performed maintenance work from the browser. Their responsibilities now live in explicit, dry-run-first scripts:

- `scripts/migrate-deliberations.ts`
- `scripts/migrate-legacy-users.ts`
- `scripts/seed-emulator.ts`
- `scripts/check-orphaned-assets.ts`

Privileged and scheduled operations have server-side equivalents under `apps/functions/src`.

## Assets

The original files from `public/` were copied byte-for-byte into categorized directories under `apps/web/src/shared/assets/`. Only fixed browser files remain in `apps/web/public/`. `shared/lib/assets.ts` supports both static filenames and dynamic `Brothers/<normalized-name>.webp` member-photo lookups.

## Compatibility boundaries

The web repositories retain the existing Firestore collection names and direct-write behavior so the refactor does not require an immediate data migration. Matching callable Cloud Functions are included for the hardened end state. After clients are moved to those callables, Firestore rules can be tightened to reject privileged browser writes.

## Styling: Tailwind CSS v4 migration (foundation + pilot)

The web app is migrating from CSS Modules + Bootstrap/react-bootstrap to **Tailwind CSS v4** (CSS-first config). This section tracks what is done and what remains.

### Foundation (complete)

- Added `tailwindcss` and `@tailwindcss/vite` (dev deps) and wired the Vite plugin in `apps/web/vite.config.ts`.
- Single style entry at `apps/web/src/shared/styles/tailwind.css` (imported once from `main.tsx`). It replaces the old `tokens.css` / `globals.css` / `utilities.css`.
- Design tokens are mapped into Tailwind's theme via `@theme` (colors `ink`/`accent`/`gold`/`surface`/`muted-surface`/`text`/`brand`/`brand-dark`/`maroon`/`maroon-dark`, radii, `shadow-elevated`, `font-sans` = Typekit `alibaba-sans`, and the `fade-in` animation). Use these as normal utilities, e.g. `bg-brand`, `text-ink`, `shadow-elevated`.
- **`react-bootstrap` was fully removed** — no source references remain.

### Cascade-layer strategy (important — read before migrating more pages)

`tailwind.css` declares layer order explicitly:

```css
@layer bootstrap, theme, base, components, utilities;
@import "bootstrap/dist/css/bootstrap.css" layer(bootstrap);
@import "tailwindcss";
```

Bootstrap is pinned to the **lowest-priority** layer, so Tailwind utilities always win on migrated components. Un-migrated pages still import their own per-component `.module.css` **unlayered**, and unlayered rules beat any layered rule regardless of specificity — so legacy pages keep rendering exactly as before. This is what lets the migration proceed page-by-page without visual regressions.

When a page is fully migrated, delete its `.module.css` import. Bootstrap's CSS (and the `bootstrap` package) can only be removed once **every** page below is off Bootstrap classes.

### Pilot migrated (complete)

Shared UI: `Button`, `OutlinedButton`, `Modal`, `Logo`, `PageHero`, `Toggle`, `ResponsiveButton`, `SiteHeader`, `SiteFooter`, `MobileNavigation`, `EmptyState`, `LoadingState`, `Carousel` (react-bootstrap `Carousel` replaced with a custom fade carousel). Marketing: `HomePage`, `HeroParallax`, `PillarsSection`, `FamilyCarousel`. All corresponding `.module.css` files were deleted.

Note: `HeroParallax` now applies the intended hero font sizes (`text-[2.625rem]` h1, `text-[1.25rem]` p). The original CSS selectors (`.img-txt p`) never matched the markup, so those sizes were "dead" — this preserves the visual **intent**, so eyeball it against the design and adjust if the old (browser-default) sizing was actually desired.

### Remaining Bootstrap-removal roadmap (future passes)

Pages/components still using Bootstrap classes and/or legacy CSS Modules:

- **auth**: `LoginForm`, `SignupForm`, `LoginPage`, `SignupPage`
- **deliberations**: `AdminDashboard`, `CandidateCard`, `CandidateDetails`, `MemberBallot`, `VoteControls`, `VoteResults`
- **marketing**: `AboutPage`, `ApplyPage`, `ProfessionalismPage`, `ServicePage`, `SocialPage`, `MajorBreakdownChart`, `RushTimeline`
- **members**: `MemberDetailsModal`
- **profile**: `ProfileView`, `ProfilePage`
- **retreat**: `BingoBoard`
- **shell/shared**: `SiteShell` (still references some Bootstrap grid classes)

Recommended order: finish marketing pages next (they share the pilot's patterns), then auth (forms — replace `form-control`/`form-label`/`form-check` with Tailwind), then deliberations/members/profile/retreat. After the last one, remove `@import "bootstrap..."` from `tailwind.css` and drop `bootstrap` from `apps/web/package.json`.

### Verification (must be run locally)

The sandbox npm registry returned 403 for all packages, so dependencies could not be installed and the build/tests could **not** be run here. All pilot changes are source-verified by inspection only. Before relying on them, run from the repo root:

```bash
npm install
npm run build      # or: npm --workspace apps/web run build
npm test
```

Then spot-check the Home page, header/footer, mobile nav, and the family carousel in a browser at desktop and mobile widths.
