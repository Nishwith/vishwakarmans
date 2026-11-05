# Engineering audit — current baseline

Audit date: 2026-11-04. Scope: both checked-out repositories and the current working trees, not production infrastructure. Baseline commits: homeowner `main` at `cb72c98`; designer `main` at `1011ed0`. Both worktrees had user edits before this session; those files were preserved. This work also changed the approval guard, carousel setters, admin/payment Edge Functions, focused tests and documentation.

## Verified baseline
- Homeowner package name: `vishwakarmans-user`; designer package name is also `vishwakarmans-user`.
- Both `.github/workflows/deploy.yml` files run on push to `main` and issue `wrangler pages deploy dist --project-name=vishwakarmans-user`. A designer build can therefore overwrite the homeowner Cloudflare Pages target. The prompt asks to preserve current production targets; this audit documents the collision and does not change either target.
- Designer `AuthRoutes.isApproved()` previously treated a designer row as sufficient unless a pending marker was present. It now requires the profile's `designer.is_verified === true` and no non-approved application status.
- Designer `admin-onboard` previously used the service-role key without an in-handler caller/admin check. It now verifies the bearer token and checks a server-only admin ID allowlist.
- The homeowner working tree already contains a geolocation control calling `get_designers_nearby` at a fixed 50 km. No migration defines that RPC or location schema; the added integration test mocks it.
- Worker source uses a one-year immutable cache for public Storage URLs without an invalidation path. The Worker is not verified as deployed; reused keys could serve stale media.
- Payment verification previously accepted browser-selected `tier` and `designer_id` after signature verification, without confirming they matched the Razorpay order/payment or caller. Order creation and verification now authenticate, bind designer ownership and plan metadata, and verify order amount/status with Razorpay.
- Both dashboard project cards referenced an undefined setter for previous image navigation. Corrected to `setCurrentImgIndex`.
- Homeowner `FeatureRequestModal` conditionally called hooks after an early return. Hooks now run consistently and effect work is skipped when no designer is selected.
- Designer onboarding inserts an application then ignores the result of a separate `users` profile update. This remains a partial-write risk; no transaction/schema authority exists in checked-in migrations.

## Verification results
- `npm run build -- --outDir=<temporary workspace path>`: passed for both apps. Build output was kept out of tracked `dist`.
- `npx vitest run`: passed, homeowner 4 tests; designer 12 tests (including 5 new approval checks). Designer run printed a jsdom navigation warning but exited 0.
- `npm run lint`: fails in both repos on pre-existing issues; details in `TESTING_REPORT.md`. The undefined setter error was removed from both results.
- Deno is not installed in this environment, so Edge Function typecheck/runtime tests could not be run.
- Playwright E2E was not run yet; tests require a local Vite server and pre-existing `test-results` contains generated artifacts that were not overwritten.

## External state not verified
No Supabase production schema/RLS, Edge Function deployment/secrets, Razorpay account, Cloudflare project, Netlify sites, GitHub Actions secrets or DNS were accessed. No production deployment or DB action was performed.
