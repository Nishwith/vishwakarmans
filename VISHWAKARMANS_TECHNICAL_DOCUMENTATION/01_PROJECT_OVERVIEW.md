# Vishwakarmans — project overview

## Product
Vishwakarmans is described as a marketplace operated by SANAR IT Solutions Pvt. Ltd. for property owners seeking design professionals and designers seeking portfolio visibility and leads. Business/deployment claims in the request are context, not independently verified production facts.

## Architecture and stack
Two independent React/Vite applications share Supabase Auth, Postgres and Storage. Both use React 19, Vite 7, React Router 7, Supabase JS 2, JavaScript/JSX and Tailwind CSS 4. TanStack Query, Framer Motion, Lucide and react-hot-toast are used where imported. Tests include Vitest/Testing Library and Playwright. Designer app also contains Razorpay Edge Functions.

## Implemented product shape
The homeowner app has public discovery/profile pages, client auth/profile, leads/contact, admin routes and a designer management view. The designer app has registration, onboarding, waitlist/approval checks, dashboard, portfolio/project management, leads and billing/subscription UI. A payment verification Edge Function and admin onboarding function are present. Source presence does not establish deployed functionality; consult the feature matrix.

## Important findings
Designer gating reads `designers.is_verified`; onboarding writes `designer_applications`. A complete application status review/synchronization process is not established by the frontend source. Payment checkout calls server-side order and signature verification functions; no webhook/expiry automation was found. A migration defines profile completion, auth user trigger logic, analytics rollups, and a materialized marketplace feed, but it is not the full schema nor proof of deployed state.

## Files
See `05_FILE_BY_FILE_CODEBASE_MAP.md` for recursive inventory and `18_OPEN_QUESTIONS_AND_UNVERIFIED_ASSUMPTIONS.md` for gaps.
