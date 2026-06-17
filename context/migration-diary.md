# Next.js Migration Diary

## 2026-06-16 - Apply Supabase realtime payloads to tables

- Hardened the shared AG Grid realtime handler so incoming Supabase payloads update existing rows, insert missing rows, remove deleted rows, or reload when the payload is incomplete.
- Updated catalog `catLabos` realtime handling so UPDATE payloads also refresh the visible lab panel, lab dropdown option, and analysis subscription when the selected laboratory changes.
- Updated files realtime handling to reload the current file table when `Archivo_Analisis` emits a relevant payload, including DELETE events where Supabase may not include the full old row.
- Changed the file delete API to remove the matching `Archivo_Analisis` relation after deleting the storage object, so file deletions emit realtime table changes.
- Verified `npm run build` succeeds without starting the dev server.

## 2026-06-16 - Reuse and UI compaction

- Added reusable popup primitives: `PopupShell` for markup and `PopupRuntime` for the browser-side promise APIs used by the grids.
- Removed legacy public UI scripts for login, popups, loadscreen, searchbar, no-cache, Alpine, and countries; `public/` now only keeps static assets still needed by the app.
- Added `BackToDashboard` as the shared return-to-dashboard partial.
- Added `withApiUser` and small API helpers so route handlers share authentication boilerplate instead of repeating it.
- Added `sanitizeFileName` and `uploadAnalysisFile` to centralize file upload, relation insert, and filename cleanup.
- Reworked create-analysis and upload-file routes to use the shared upload helper and fixed the undefined filename variable.
- Fixed the files page popup typo and replaced login's public script with a client component.
- Rebuilt `app/globals.css` with a cleaner modern Tailwind treatment for layout, cards, controls, AG Grid, popups, and login.
- Verified `npm run build` succeeds without starting the dev server.

## 2026-06-16 - Button and panel standardization

- Added reusable `Panel`, `PanelToolbar`, and `PanelBody` components for consistent page panel layouts.
- Standardized button classes around `btn-primary`, `btn-secondary`, and `btn-danger`, while keeping legacy aliases for compatibility.
- Updated catalog, laboratories, and files pages to use the shared panel grid classes instead of ad hoc card/dashboard layouts.
- Updated AG Grid dynamic action buttons to use the standardized button variants.
- Refined global Tailwind panel, toolbar, responsive grid, and button styles for consistent sizing, spacing, and interaction states.
- Verified `npm run build` succeeds. Stopped an existing process on port 3000 that was locking `.next/trace`; no dev server was started.

## 2026-06-17 - Universal loading screen

- Converted `LoadScreen` into a universal loading component with `overlay`, `page`, and `inline` modes plus contextual message/detail copy.
- Added `app/loading.jsx` so App Router page transitions use the same loading screen pattern.
- Updated lazy AG Grid dynamic imports to use `LoadScreen mode="inline"` instead of a one-off text fallback.
- Removed the forced timeout from `window.activateLoadScreen`; it now shows the overlay until `window.deactivateLoadScreen` runs.
- Updated `readJsonResponse` to close the overlay after HTTP responses complete.
- Added contextual loading messages for loading analyses, files, laboratories, uploads, deletes, and description saves.
- Avoided double activation in lab selection and validation paths that do not perform a request.
- Verified `npm run build` succeeds and no dev server is listening on port 3000.
