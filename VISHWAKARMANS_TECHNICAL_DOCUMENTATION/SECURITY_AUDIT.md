# Security audit

## High priority findings

### SEC-001 — privileged admin onboarding had no role check (mitigated in source)
- **Severity:** High
- **Repository/file:** both repos, `supabase/functions/admin-onboard/index.ts`
- **Evidence:** previous handler created a Supabase client with service-role key and directly created Auth user + designer row; it did not inspect Authorization or admin role. Config sets `verify_jwt=true`, which only requires a valid user JWT, not administrator status.
- **Scenario/impact:** any signed-in user able to invoke the function could request a pre-confirmed designer account and choose verification/featured fields.
- **Change:** handler now validates bearer token with Supabase Auth and checks caller UUID against `ADMIN_USER_IDS`, a server-only comma-separated function secret; fails closed if unset. Auth user cleanup is attempted if profile/designer insertion fails.
- **Remaining:** provision only approved admin UUIDs in staging, deploy only after review, test unauthorized and authorized callers. No external secret was set. CORS remains permissive but bearer auth/allowlist enforce access.

### SEC-002 — payment entitlement was not bound to authenticated owner/order (mitigated in source)
- **Severity:** High
- **Repository/files:** designer, `create-razorpay-order/index.ts`, `verify-razorpay-payment/index.ts`, dashboard caller.
- **Evidence:** old verification checked HMAC over Razorpay order/payment IDs but trusted browser `tier` and `designer_id`; it did not verify caller ownership, order amount, payment captured status or order metadata. It also ignored payment-history insert errors.
- **Scenario/impact:** a valid signed payment could be replayed with a different tier/designer ID; sequential repeats could reapply entitlement.
- **Change:** require a verified bearer user; validate designer ownership; order notes bind tier/designer/user; verification checks Razorpay order/payment IDs, INR amount, paid/captured status, and notes; duplicate history lookup rejects sequential replay; DB insert errors are no longer ignored.
- **Remaining:** read-before-write is not atomic under concurrent calls. Add a unique payment ID constraint and transactional entitlement operation after schema/duplicate audit. No webhook, retries, refunds or reconciliation are implemented. Deno and Razorpay staging tests remain pending.

## Other verified risks/unknowns
- Both main-branch workflows deploy to the same Cloudflare Pages project name. This is deployment-integrity risk; actual target ownership is unverified, so no workflow was changed.
- `is_admin()` and most RLS definitions are absent from checked-in migration. The supplied broad policies are not verified as production facts. Do not infer row isolation or admin safety until a live policy export is reviewed.
- `users.role` mutability/grants are unknown. The new privileged function uses an independent server-side UUID allowlist rather than trusting browser role data.
- Payment environment variables, Supabase secrets, function JWT configuration in production, Storage policies and production data were not inspected.

## Severity summary
Two high-severity code findings have source mitigations; both require staging validation. No production vulnerability status is claimed. No confirmed critical severity finding established. Policy risks remain open pending live schema/RLS evidence.
