# System architecture

```mermaid
flowchart LR
  C[Homeowner React/Vite app] -->|Supabase JS + anon key| S[Shared Supabase project]
  D[Designer React/Vite app] -->|Supabase JS + anon key| S
  S --> A[Auth]
  S --> DB[(Postgres / RLS)]
  S --> ST[Storage: portfolio]
  D -->|functions.invoke| E[Supabase Edge Functions]
  E --> R[Razorpay Orders API]
  E --> DB
  C -->|optional media URL prefix| W[Cloudflare Worker]
  W --> ST
```

Both `src/config.js` files read `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` and optional `VITE_MEDIA_BASE_URL`; `src/supabaseClient.js` calls `createClient`. Values are intentionally excluded. Separate browser origins generally have separate local storage, so one Supabase project does not prove cross-domain session sharing. Auth redirect allowlists and provider config need live verification.

```mermaid
flowchart TB
  C[Client app origin] --> CC[Supabase JS client]
  D[Designer app origin] --> DC[Supabase JS client]
  CC --> AUTH[Same Supabase Auth project]
  DC --> AUTH
  AUTH --> ID[Auth user identity]
  ID -. trigger or client sync .-> U[public.users profile]
  U -. designer role/profile mapping .-> DP[designers profile]
  C -. browser storage is origin scoped .-> NOTE[Session sharing not automatic]
  D -. browser storage is origin scoped .-> NOTE
```

Client routes are public discovery/static pages, guest-only auth, auth-gated connect/profile and admin-gated admin screens. Designer routes include auth-gated onboarding/waitlist/profile/connect and a designer guard for dashboard. Guards are UX controls; RLS/server authorization is decisive.

Designer dashboard uploads directly to Storage `portfolio`, obtains public URLs and stores metadata in `project_images`. Homeowner config can prefix media paths with a Worker/CDN base. Worker source proxies public objects and caches them as immutable for one year; deployment/wiring and object-key immutability are unverified.

`supabase/migrations/0001_phase1_hardening.sql` adds view indexes/policies, `daily_view_counts`, `mv_public_marketplace_feed`, refresh trigger/function, and `users.profile_completed` plus `handle_new_user()`. This is migration intent, not deployed verification. See database and open-questions documents.
