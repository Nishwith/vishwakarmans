# Authentication and authorization

Both applications create Supabase clients from Vite URL/anon key configuration. Auth service wrappers expose password sign-in/signup, Google OAuth, sign-out, reset/update password, session/user lookup, auth-state subscription and public profile operations.

## Client
Signup directs email verification to current `window.location.origin`. `useAuth` exposes cached session/user/profile; `AuthRoutes` implements guest/auth/admin/onboarding UI gating. `CompleteProfile` supports client profile completion.

## Designer
Registration signs up and upserts a `users` row as designer. Onboarding inserts `designer_applications` and updates user information. Waitlist reads `designers.is_verified`; dashboard guard now requires that exact flag to be true. `admin-onboard` validates the bearer token and checks its UUID against server-only `ADMIN_USER_IDS`; deployment must provision the allowlist. Application status and verification synchronization still depends on admin workflow and database state.

## Role and session caveats
The migration's `handle_new_user()` inserts role `client`; attachment to auth.users is not established in that file. Designer registration separately upserts the role. Conflict/retry semantics and possibility of both roles require schema and policy review. Separate site origins normally have separate localStorage; shared Auth does not itself share a browser session. OAuth provider linking and redirect allowlists are dashboard configuration, unverified.

Frontend guards are not data authorization. The prompt mentions `is_admin()` policies, but its definition is absent. Verify role assignment, function ownership/search_path and deployed RLS. Never treat successful navigation as proof of authorization.
