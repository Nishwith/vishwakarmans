# Designer application

## Routes and entry
`src/main.jsx` mounts React Query and `App.jsx`. Routes include guest login/register and aliases, public info/FAQ/password pages, auth-gated onboarding/waitlist/connect/profile, and designer-guarded `/dashboard`. `OnboardingGuard` wraps routes; dashboard is lazy-loaded.

## Registration and approval
`Register.jsx` calls `signUp` then upserts `users` with designer role. `UnifiedOnboarding.jsx` retrieves user/application data, collects professional fields, inserts `designer_applications`, and updates `users`. `AuthRoutes.jsx` defines approval/profile checks. `Waitlist.jsx` reads `designers.is_verified`. Client `AdminDashboard.jsx` can update designer verification. The complete administrator review and synchronization lifecycle is not established; do not assume application status and verification are aligned.

## Dashboard modules
`DesignerDashboard.jsx` combines dashboard overview, profile, projects/images, connections/leads, subscription and settings. Projects use `designer_projects`, images `project_images`, media Storage `portfolio`, leads `connections`, profiles `designers`/`users`. `BillingTab.jsx` presents billing/payment history. The large page combines queries, mutations and rendering; inspect exact error handling/policies before extending.

## Payments
Dashboard invokes `create-razorpay-order` with tier and designer ID, launches Razorpay Checkout, then invokes `verify-razorpay-payment`. Both functions validate the caller bearer token; server code checks designer ownership and creates order notes binding user/designer/tier. Verification checks HMAC, fetches Razorpay order and payment, confirms paid/captured state and amount, then updates subscription fields and inserts history. Sequential replay is rejected through a history lookup, but concurrent idempotency needs a unique constraint/transaction. No webhook or scheduled expiry implementation was found. Edge runtime tests and staging deployment remain pending.

## Shared patterns
Auth, query, compression, service and styling files resemble the homeowner repo but are independent copies that may drift. See `05_FILE_BY_FILE_CODEBASE_MAP.md`. `.env` and Supabase `.temp` metadata are excluded from documentation values.
