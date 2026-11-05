# Codebase onboarding guide

## Repositories and local commands
`vishwakarmans-user` is the homeowner/client app plus admin screens. `vishwakarmans-designers` is the designer portal. Both package scripts define `npm run dev`, `npm run build`, `npm run lint` and `npm run preview`; no tests/build were executed during this audit. Configure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`; homeowner media can use `VITE_MEDIA_BASE_URL`. Never put service-role/Razorpay secrets in browser env.

## Where features live
Routes: `src/App.jsx`; guards: `src/components/AuthRoutes.jsx`; auth: `src/services/authService.js` and `src/hooks/useAuth.js`; data: `src/services/projectService.js`, hooks and pages; migration SQL under `supabase/migrations`; server handlers under `supabase/functions`; media Worker under `worker`.

Auth identity is Supabase Auth; profile data is in `users`; designer onboarding uses `designer_applications`; designer profile, projects, image metadata and leads use `designers`, `designer_projects`, `project_images`, `connections`. Admin Edge Function additionally requires server secret `ADMIN_USER_IDS` containing approved user UUIDs. Payment Edge Functions need Supabase and Razorpay server secrets. Verify schema and RLS before changing backend operations. See security/audit docs for caveats.

Before a release, review the relevant route/data path, test against a disposable database, validate redirect and env configuration in Supabase/Netlify, inspect `_redirects`/`_headers`, and follow repository CI. Test command scripts are not declared in package manifests; use existing test configuration carefully and establish the correct invocation from repo documentation.
