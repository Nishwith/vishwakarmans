# Implementation Plan — NEW-01 to NEW-07

**Approval boundary:** NEW-02 has been explicitly approved and implemented in the designer application. NEW-01 and NEW-03 to NEW-07 remain proposal-only; do not begin them until reviewed. Work remains confined to development/testing; no production data, database schema, media, payment settings, DNS, hosting or domain changes.

## Phase 0 — Verification prerequisites

1. Resolve npm registry/cache access and add reproducible locked `@playwright/test` and JSX-aware React lint dependency to both packages. Keep versions aligned where feasible.
2. Configure Playwright to start each Vite app on loopback, use only local/mock backends, isolate test output under test-results, and reuse only the explicitly configured local test server. Confirm browser installation.
3. Provision Deno and Supabase CLI in development tooling; run Edge Function type checks without deploying. Keep production secrets out of local files.
4. Identify Netlify staging site/context and isolated Supabase project. Verify staging-only `ADMIN_USER_IDS`, `SUPABASE_URL`, service-role secret, Razorpay test key ID/secret, and designer-app `VITE_RAZORPAY_KEY_ID` are configured without disclosing their values. Existing repo workflows point at Cloudflare Pages; resolve this mismatch before deployment, without switching final hosting/domain.
5. Obtain schema/RLS exports read-only from staging or a disposable schema snapshot. If unavailable, keep database-dependent work blocked rather than guessing.

## Feature sequence, implementation and verification gates

### 1. NEW-02 — Route/access matrix (P1) — In Progress

- **Implemented:** Shared account-state helper; state-aware guards; role=`designer` with no rows routes to onboarding; incomplete designer row routes to owner-scoped `/profile` completion form; pending/unknown and unverified states remain on waitlist; verified/approved complete designer reaches dashboard. Contact/FAQ route aliases retained. Waitlist polling checks application status as well as verification.
- **Tests:** 45 Vitest tests pass across 8 files, including route state, direct paths, mobile support links, browser back, owner-row update and negative dashboard access.
- **Open gate:** Staging RLS authorization for the profile update was not available for verification. Keep status In Progress until that check is complete.

### 2. NEW-04 — Admin inquiry read-only mode (P1)

- **Implement:** In admin override, render inquiry/client data read-only and omit status/delete controls. Preserve profile/portfolio/admin functions shown to be separately authorized. Add backend denial for unauthorized inquiry mutations only after deployed policy review.
- **Tests:** Admin UI cannot invoke mutations; direct API update/delete denied in staging; assigned designer retains authorized workflow; existing authorized profile operations still work.
- **Gate:** UI and data-layer restriction agree; no broad admin capability removed.

### 3. NEW-03 — Contact details before status change (P1)

- **Implement:** Read assigned connection and minimum client fields; show name, phone/email actions, and full inquiry requirements for New Request, Hold, Active. Never widen user table access generally.
- **Tests:** Each status; missing contact details; assigned vs different designer vs anonymous RLS checks.
- **Gate:** RLS denies cross-designer access and client PII is limited to the assigned inquiry.

### 4. NEW-01 — Materials list (P2)

- **Implement:** Render room materials as accessible list items; retain room label and safe legacy string support.
- **Tests:** Array, string, blank, malformed legacy data; responsive visual check.
- **Gate:** No migration needed unless staging fixtures identify unsupported storage shape.

### 5. NEW-05 — Video management (P2; legal/schema gate)

- **Preflight:** Confirm `designers.video_link` and `designers.video_link_2` in deployed schema and data; inspect column grants/views/RLS and identify current consent records. Confirm source conflict: current checked-out collaboration form has no video fields; existing inputs are in designer dashboard profile form.
- **Implement after approval:** Retain original inputs; add only missing status/final YouTube URL/published/updated metadata; add admin-only Designers Videos section; status Pending/In Editing/Published; validate and save final YouTube URL; public profile reads only final URL, hides absent URL. Do not implement external video editing/uploading/publishing.
- **Consent:** Draft versioned consent capture for editing/branding, official YouTube publication, profile embedding, ownership/usage and withdrawal/removal. Legal review required before presenting or storing new consent. Append a versioned record; never silently update old consent.
- **Tests:** Original field round-trip; status/URL admin authorization; public response leakage; only one final embed; missing final URL hides section; consent version and withdrawal history.
- **Gate:** Live schema inspection, admin policy review, legal text approval, and staging RLS tests complete.

### 6. NEW-06 — Business location and nearby search (P2; database gate)

- **Preflight:** Inspect `designers`, `users.location` type, deployed `get_designers_nearby`, PostGIS extension, indexes, function security mode and policies. Distinguish business/office location from user residential location.
- **Implement after approval:** Store locality/city/state/PIN and optional business coordinates in agreed schema; implement 5/10/25/50 km filtering using verified geography semantics; return explicit public fields plus distance; enforce public/verified eligibility.
- **Tests:** Coordinate order and radius boundaries, invalid radius, geolocation denial, city/radius composition, RLS/public projection, query plan and staging migration rollback.
- **Gate:** No production migration; staging schema and privacy review pass.

### 7. NEW-07 — VIP onboarding (P3; depends on NEW-06)

- **Implement:** Add approved business-location fields to VIP onboarding; rely on existing dashboard completion form for remaining profile data; remove “Make Featured” only from VIP form and ensure new VIP payload defaults to standard. Preserve separate admin feature workflows.
- **Tests:** VIP provisioning/default status, address persistence, incomplete-profile completion, verification flow, unrelated featured operations.
- **Gate:** NEW-06 field model accepted and VIP route verified without approval bypass.

## Cross-cutting test strategy

- **Static:** ESLint with JSX usage rules and no disabled legitimate rules; production build for both apps.
- **Unit/integration:** Vitest for rendering, route state, status and payload behavior; mocked Supabase for UI paths.
- **E2E:** Playwright only against local Vite web servers on loopback, with deterministic mocked backend/test fixtures; no production URL or payment credential. Keep artifacts isolated and avoid exposing client PII in traces.
- **Backend:** Deno `check`/`test` for Edge Functions; Supabase local/disposable DB migration tests; staging-only RLS authorization tests for assigned, unassigned, admin and anonymous users.
- **Payments:** Razorpay test mode only; wrong owner/tier/amount, uncaptured, replay/concurrency and error cases. No production keys.
- **Release:** Compare each feature to acceptance criteria; inspect diffs and data projections; confirm rollback plan for staging migration. No deployment to production in this phase.

## Blockers and assumptions

- Live database schema, RLS policies, PostGIS, video consent records and deployed RPC definitions are not available in repository evidence.
- Deno and Supabase CLI are absent from PATH.
- npm registry package metadata/cache is unavailable (`ENOTCACHED` for `@playwright/test`; install attempts stalled when registry access was tried). No package/lockfile changes were committed by the interrupted install attempts.
- Exact Netlify staging IDs, admin allowlist UUIDs and Razorpay test credentials were not available. No secret values were requested or written.
- Current source conflicts with request’s claim that collaboration application already holds two video links; deployed/source branch must be checked before video implementation.
