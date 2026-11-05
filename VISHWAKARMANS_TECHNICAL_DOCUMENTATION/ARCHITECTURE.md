# Current architecture and target boundaries

## Current checked-out system
Two React/Vite frontends connect to one Supabase project pattern. Homeowner client and admin experiences are in `vishwakarmans-user`; designer registration/portal is in `vishwakarmans-designers`. Supabase Auth sessions are origin-local in browser storage. Postgres and Storage are shared backend services. Designer/payment/admin operations use Supabase Edge Functions. A media Worker proxies public Supabase media; no R2 implementation exists in the inspected source.

## Deployment reality
Despite the stated development constraint preferring Netlify, checked-in GitHub Actions workflows deploy pushes to `main` using Cloudflare Wrangler. Both target `vishwakarmans-user`. This collision is confirmed in source; current production target is unknown. Do not deploy, change DNS, or repoint either workflow until separate intended staging and production targets are confirmed. Future `.com` domains in the prompt are not current settings.

## Approval/auth boundaries
Designer dashboard frontend guard now requires `designers.is_verified === true`. This is UX only. RLS/server authorization must restrict designer operations, and live policies are unavailable. `admin-onboard` verifies JWT and a server-configured `ADMIN_USER_IDS` allowlist before service-role writes.

## Payment boundaries
Order creation now authenticates owner and stores plan/designer/user in Razorpay order notes. Verification independently checks caller ownership, signature, Razorpay order notes, amount and captured payment state before writing entitlement/history. Sequential duplicate detection is present but atomic idempotency is not. No webhook/reconciliation/expiry worker was found.

## Migration path
Only `0001_phase1_hardening.sql` is checked in; it contains analytics, materialized view, trigger/function and profile completion changes, not the complete marketplace schema. A secure transaction for onboarding or payments requires authoritative schema and staging migration validation.

## R2 target
R2 remains a future test-environment architecture: authenticated upload endpoint/Worker → validated object key → R2; DB stores object metadata; CDN delivers responsive variants. Existing Supabase Storage must remain readable until migration and rollback are verified. No R2 code or credentials were added in this work session.
