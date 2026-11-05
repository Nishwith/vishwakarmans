# Open questions and unverified assumptions

1. What schema, constraints, policies and grants are actually deployed? No live catalog was inspected.
2. What is authoritative base-schema history? One migration is present; `supabase.zip` provenance is unknown.
3. Are prompt-supplied RLS policies current? Export all commands, roles, USING/WITH CHECK and permissive/restrictive flags.
4. Where is `is_admin()` defined, how are roles assigned, and what validates `admin-onboard`?
5. How does admin review `designer_applications`; are status and `designers.is_verified` synchronized?
6. Is `handle_new_user()` attached in production and how does it coexist with designer upsert/retries?
7. What are Auth redirect allowlists, OAuth linking settings and cross-domain login expectations?
8. Are payment functions deployed with secrets? Are verification/idempotency, webhook/reconciliation, refunds and expiry implemented elsewhere?
9. What are live bucket visibility, MIME/size limits, object ownership rules, cleanup and Worker cache configuration?
10. Is `increment_profile_view` deployed? Is migration/pg_cron active and materialized view current?
11. What are current Netlify sites/domains, environment mappings, CI secrets and canonical/SEO settings?
12. Binary assets were inventoried by path/type, not visually audited. Generated `dist`, `node_modules`, `.git`, and Playwright results were excluded. Supabase `.temp` is local generated metadata.
13. Counts under these exclusions: 69 homeowner files and 67 designer files after adding the approval unit test. `App.jsx` declares 13 and 17 `<Route path=...>` patterns respectively, including aliases/wildcard; nested guard routes are still counted once each.
14. Builds and Vitest suites were run as documented in `TESTING_REPORT.md`; Playwright and Deno function checks were unavailable. `.env` values and production personal records were not copied into documentation.
15. The current worktree has modifications/untracked assets in both repos outside the new documentation folder (including application source and `dist` artifacts). This audit did not edit those paths; documentation describes the checked-out working tree, which may differ from the committed baseline.
