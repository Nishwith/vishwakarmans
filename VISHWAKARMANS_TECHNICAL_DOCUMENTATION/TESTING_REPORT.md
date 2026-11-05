# Testing report

## NEW-02 implementation verification (2026-11-05)

| Command | Result |
|---|---|
| Designer `npm run lint` | Passed with 0 errors and 2 existing hook dependency warnings in `DesignerDashboard.jsx` (lines 480 and 1170). |
| Designer `npx vitest run` | Passed: 8 files, 45 tests. jsdom emitted unsupported `scrollTo`/document navigation warnings; exit code 0. |
| Focused NEW-02 Vitest matrix | Passed: 38 tests across 7 files. |
| Designer build to `.codex-vitest-tmp/build` | Passed (`npx vite build --outDir .codex-vitest-tmp/build --emptyOutDir`). |
| `git diff --check` | No whitespace issue in NEW-02 edits; it reports pre-existing trailing whitespace at homeowner `src/pages/DesignerProfile.jsx:91` and a pre-existing blank line at designer `src/__tests__/integration.test.jsx:476`. |
| Playwright | Not run; `@playwright/test` is still absent from manifest/lockfile and registry/cache install remains blocked. |
| Deno/Supabase/RLS | Not run/verified; Deno and Supabase CLI are unavailable and no staging DB/RLS access was provided. |

**Build artifact preservation incident:** `npm run build` was started in the designer repo, intending to stop it before it touched the pre-existing dirty `dist`. The Ctrl-C arrived after Vite had completed; the command exited successfully and wrote into `dist`. The tracked `dist` status remains the same as at task start, but the directory had pre-existing ignored bundle files: Vite rebuilt or removed several ignored generated chunks and rewrote the already-modified `dist/index.html`. The original bytes for replaced ignored artifacts were not backed up and are not recoverable from Git. No further build was run against `dist`; a second build completed in `.codex-vitest-tmp/build`. This deviation is disclosed rather than represented as full preservation.

NEW-02 remains **In Progress** until the designer-row owner update is verified against staging RLS. No RLS changes were made.

## Executed

| Command | Result |
|---|---|
| Homeowner `npm run build -- --outDir=<isolated temp>` | Passed; generated output kept outside tracked `dist`. |
| Designer `npm run build -- --outDir=<isolated temp>` | Passed; generated output kept outside tracked `dist`. |
| Homeowner `npx vitest run` | Passed: 1 file, 4 tests. |
| Designer `npx vitest run` | Passed: 2 files, 12 tests, including 5 added approval tests. Printed jsdom navigation warning but exited 0. |
| Homeowner `npm run lint` | Failed with 15 errors and 1 warning. Includes Playwright `process` global, test unused arg, unused imports/vars and other existing lint issues. Conditional-hook and undefined-setter errors no longer appear. |
| Designer `npm run lint` | Failed with 14 errors and 2 warnings. Includes Playwright `process`/`Buffer`, existing integration globals/imports, Fast Refresh exports/empty catch, unused variables and hook dependency warnings. The undefined dashboard setter no longer appears. |

Build output was placed under the allowed Codex visualization temporary workspace to avoid modifying pre-existing generated `dist` changes.

## Not run
- Playwright E2E: not run. `@playwright/test`/`playwright` are absent from the manifest and `node_modules`; `npx` attempted an unavailable package fetch and was interrupted. Existing `test-results` artifacts were preserved; no dependency was installed.
- Edge Function Deno checks: `deno` is not installed.
- Razorpay test-mode, live Supabase RLS/Storage/security tests, Netlify previews and deploy validation require external credentials/configuration and were not attempted.

## Added tests
`src/__tests__/approval.test.jsx` covers absent verification, exact boolean verification, pending application denial and approved application acceptance. Existing integration fixture now marks its approved designer verified. The homeowner admin modal change is covered by the build/lint pass for hook-order checks; a dedicated render test remains to add.
# Follow-up investigation (2026-11-05)

- ESLint was rerun in both worktrees. Homeowner baseline had 15 errors/1 warning; after correcting actual unused symbols/parameters, catch handling, and undefined Node globals, 4 JSX-only `no-unused-vars` false positives and 1 hook dependency warning remain. The appropriate `eslint-plugin-react` JSX usage rule is not declared/locked, and npm registry/cache attempts failed with `ENOTCACHED`; no rules were disabled.
- Designer lint now reports 0 errors and 2 hook dependency warnings. Approval predicates were moved to a utility module to satisfy Fast Refresh, and the empty catch was replaced with error logging.
- Playwright config now uses a loopback Vite server and isolated `test-results/playwright` output. `@playwright/test` is absent from manifests/lockfiles, package installation failed due npm registry/cache unavailability, and E2E was not run.
- Deno and Supabase CLI are absent from PATH. Function checks were not run; exact `deno check` commands and absence of function test files are documented in `TECHNICAL_DEPENDENCY_REPORT.md`.
- No NEW-01 to NEW-07 feature implementation, production database/data/configuration, deployment, or production media change was made.
