# Implementation Roadmap

This roadmap preserves the prior BUG-001 to BUG-012 audit and sequences the newly requested work. **No NEW-01 to NEW-07 feature code is included in this investigation.** Implementation sequence is proposed for review; do not start feature changes until the user approves it.

## Priority and dependency overview

| Priority | Work | Dependencies / gate |
|---|---|---|
| P0 | Engineering verification prerequisites: reproducible lint, Node Playwright package/lock, local E2E web server; Deno/Supabase CLI; isolated Netlify staging and admin/Razorpay test credentials. | npm registry/cache, Deno and Supabase CLI availability, staging project/site and test credentials. No production settings. |
| P1 | NEW-02 access/navigation state matrix. | Local route/form implementation and 45 Vitest tests are complete; staging RLS authorization for the owner-scoped update remains to be verified. |
| P1 | NEW-04 read-only admin Inquiries & Clients in Manage Workspace. | Inspect deployed `connections` grants/RLS and identify other explicitly authorized admin operations. |
| P1 | NEW-03 assigned client details in every inquiry status. | Confirm connection FK and `connections`/`users` RLS; define least-privilege joined data. |
| P2 | NEW-01 material list display. | Confirm legacy `room_materials` shapes from representative staging fixtures; no schema dependency expected. |
| P2 | NEW-05 video production metadata and admin workflow. | Read-only schema/data/RLS inspection; confirm source version; legal approval and versioned consent design; staging migration and YouTube URL policy. |
| P2 | NEW-06 business location and radius filtering. | Inspect deployed columns, PostGIS extension, RPC definitions, indexes and RLS; privacy review and staging migration. |
| P3 | NEW-07 VIP onboarding location and completion. | Agree NEW-06 business-location fields; verify VIP provisioning and completion/verification behavior. |

## Proposed implementation order

1. **Unblock local verification only.** Declare and lock Playwright and the JSX-aware lint dependency when package registry is reachable; finish local webServer isolation; install Deno/Supabase CLI through the approved development environment. Add no production configuration. Confirm Netlify staging context, isolated Supabase project and Razorpay test credentials by name/availability only.
2. **NEW-02 access and navigation — In Progress.** Implemented the route state matrix and profile completion path; 45 Vitest tests pass. Confirm the owner-scoped update against staging RLS before marking complete. A real-browser refresh/E2E run remains pending Playwright dependency availability.
3. **NEW-04 admin workspace permissions.** After policy inspection, make inquiry content read-only in admin override and enforce appropriate backend policy boundaries; regression-test other explicitly authorized Manage Workspace work and the assigned designer's status flow.
4. **NEW-03 inquiry contact details.** Establish assigned-designer-only read policy for the connection and minimum client contact projection; then expose contact actions across pending, on_hold and accepted statuses. Test authorization independently from UI state.
5. **NEW-01 materials list.** Normalize supported array/string values at presentation boundary and render accessible list items. No data migration unless representative staging data proves a format that cannot be safely rendered.
6. **NEW-05 video workflow.** Read-only inventory of live `designers` columns and policies first. Obtain legal review for consent language. Only then add minimal status/final URL/timestamps if absent; protect original links; add admin Videos list/actions and public final-only selection/rendering. Test that anonymous/public payloads never contain either original link.
7. **NEW-06 location search.** Inspect actual schema, PostGIS and current RPC; design business-only address storage separate from private user location. Create a staging-only migration/RPC with a public-field allowlist, approved/public filtering and validated 5/10/25/50 km radius; verify query plan and RLS before production consideration.
8. **NEW-07 VIP onboarding.** Reuse the accepted NEW-06 business-location model and existing designer dashboard profile-completion form. Remove Make Featured only from VIP form; keep distinct featured admin workflows and verify default status server-side.
9. **Release review.** Run lint, unit/integration suites, local Playwright E2E, Deno checks and staging-only DB/RLS/payment/media flows. Review acceptance criteria and diff. Do not change hosting provider, production schema/data/media, payment credentials, DNS, domains or production hosting in this roadmap phase.

## Prior audit stabilization carryover

- BUG-001, BUG-002, BUG-003, BUG-004, BUG-009 fixes are present in the current worktree, with runtime/staging limitations recorded in `BUG_REGISTER.md`.
- BUG-005 deployment target collision remains unresolved; current workflows reference Cloudflare Pages, while this phase requires Netlify testing. No workflow target was changed.
- BUG-006/BUG-007/BUG-008 require authoritative schema/transaction strategy before any data-layer migration.
- BUG-010 Playwright dependency is not declared/locked; registry/cache access prevented a safe package install in this run. Existing configs can be made ready for local-only server startup, but test execution remains blocked until dependencies are reproducibly installed.
- BUG-011 RPC/schema and BUG-012 Worker deployment/cache behavior remain unverified against live infrastructure.

## Current status

NEW-02 is **In Progress**: local behavior and tests are complete, but staging RLS authorization has not been verified. NEW-01 and NEW-03 to NEW-07 remain **Investigating**, with NEW-06 additionally **Blocked on live schema/PostGIS evidence**. NEW-05 database and consent records, deployed RLS, Edge Function secrets, payment test credentials, and staging infrastructure require verification before their implementation gates can pass.
