# RLS and security audit

## Scope
No live Supabase policy catalog was inspected. The migration concerns analytics policies, daily counts, materialized view and functions; it does not contain the prompt's complete table policy inventory. Prompt policy names/expressions are **unverified supplied assertions**, not verified deployed policies. No critical/high confirmed vulnerability is declared based solely on those assertions.

## Migration-backed observations
- Confirmed in SQL source: replaces `project_views_log` public insert policy with authenticated insert and admin-only select; no update/delete policies are created there.
- Confirmed in SQL source: enables RLS on `daily_view_counts`, adds admin-only select and grants public select on a materialized feed projection that omits email/phone/subscription fields.
- Positive hardening in source: SECURITY DEFINER functions set `search_path=public,pg_temp`; verify deployed ownership/grants and execution privileges.
- Unknown: whether SQL has been applied, auth trigger attached, cron available, or existing policies conflict.

## Verify against live policy definitions
The supplied inventory alleges broad INSERT/DELETE on `connections`, duplicate permissive SELECT/INSERT policies, public project/image/designer reads, update policies on designer fields, reviews without relationship validation, and broad Storage uploads. PostgreSQL permissive policies can OR together. Export all policies with command, roles, USING and WITH CHECK; evaluate overlaps before assigning severity.

Test anonymous lead creation/deletion and arbitrary designer IDs; client/designer isolation; subscription restrictions; admin escalation; review eligibility; storage path ownership/type/size; payment-history mutation; and sensitive columns reachable through public profile reads. Review `is_admin()` and Edge Function auth/CORS. These are verification cases, not confirmed findings. Remediation should follow evidence and preserve intended behavior.

## Source changes in this work session
The admin onboarding Edge Function now authenticates its bearer token and allows only UUIDs in server secret `ADMIN_USER_IDS`. Payment handlers authenticate callers, verify designer ownership, bind exact plan/designer in Razorpay order notes, and check Razorpay-reported amount and captured state. These changes reduce source risks but are not deployed and have not passed Deno/Razorpay staging tests. Payment history lookup is not race-safe without database uniqueness and an atomic transaction.
