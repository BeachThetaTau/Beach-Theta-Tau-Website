# Architecture

## Dependency direction

1. `app/` composes providers, guards, layouts, and routes.
2. `modules/` contain business features. A module exposes its public surface through `index.ts`.
3. `shared/` contains infrastructure and generic UI. It must not import business modules.
4. `packages/contracts` contains serializable types shared by web and Functions.
5. Firebase Functions own privileged writes; repositories isolate the remaining client SDK access.

## Web module pattern

Each stateful feature uses the same layers:

- `api/`: Firebase or HTTP operations and data mapping.
- `hooks/`: subscription lifecycle, loading/error state, and user actions.
- `components/`: presentation and small interaction units.
- `pages/`: route-level composition only.
- `schemas/` or `utils/`: validation and deterministic transformations.

Marketing is mostly static, so its repeated content is stored in `content/` and rendered by components.

## Authentication and authorization

`AuthProvider` is the single browser auth subscription. Guards handle authentication and roles before pages render. Role claims come from Firebase custom claims. A temporary legacy UID fallback preserves the old deliberations administrator until claims are assigned.

## Asset strategy

Only files that must keep stable public URLs live in `apps/web/public`. Images are bundled under `shared/assets`, categorized by use. `assetUrl()` provides one lookup path for fixed filenames and dynamic `Brothers/<name>.webp` profile photos.

## Operational code

Data migration code does not run in the browser. Scripts are explicit and dry-run by default. Cloud Functions provide deployable server-side boundaries for role changes, approvals, deliberation operations, and scheduled archiving.
