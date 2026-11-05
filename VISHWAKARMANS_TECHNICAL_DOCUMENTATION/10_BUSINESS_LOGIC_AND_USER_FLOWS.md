# Business logic and user flows

## Client auth/profile
Register → auth service signup with current-origin email redirect and metadata → Supabase Auth → callback/session → optional profile completion writes `users`. Migration defines a new-user trigger function, but attachment is unknown. Google button calls OAuth service; provider setup is external. Auth/profile synchronization failure can leave partial state.

```mermaid
sequenceDiagram
  actor Client
  participant UI as Register/Login
  participant Auth as Supabase Auth
  participant DB as users table
  Client->>UI: Submit credentials / Google
  UI->>Auth: signUp or OAuth
  Auth-->>Client: verification redirect/session
  Note over Auth,DB: handle_new_user exists in migration; trigger attachment unknown
  Client->>UI: Return and restore session
  UI->>DB: Fetch/update profile as needed
```

## Designer onboarding/approval
Register → Auth signup → `users` upsert as designer → email verification → session → `UnifiedOnboarding` reads existing data, validates and inserts `designer_applications`, updates `users` → `Waitlist` reads `designers.is_verified` → dashboard guard admits eligible designer. Admin UI updates `designers.is_verified`; full application review/status sync is not established.

```mermaid
flowchart LR
  A[Register] --> B[Supabase email verification]
  B --> C[users upsert role designer]
  C --> D[UnifiedOnboarding]
  D --> E[Insert designer_applications]
  E --> F[Waitlist checks designers.is_verified]
  F -->|true| G[Dashboard guard]
  F -->|false or absent| H[Waitlist]
  I[Client admin UI] -. updates is_verified .-> F
  E -. status review/synchronization unknown .-> I
```

Approval specifically depends on the `designers.is_verified` check found in the designer waitlist/guard code. The handoff from `designer_applications` to that profile flag is not demonstrated as an enforced backend workflow.

```mermaid
stateDiagram-v2
  [*] --> Registered
  Registered --> EmailVerified
  EmailVerified --> OnboardingSubmitted
  OnboardingSubmitted --> Pending: application row (status handling unknown)
  Pending --> Approved: admin sets designers.is_verified true
  Pending --> Waitlist: flag false or profile absent
  Approved --> Dashboard: guard accepts
```

## Projects and media
Dashboard loads designer and nested project/image data → inserts project → compresses/uploads to `portfolio` → obtains public URL → inserts `project_images`. Edit path deletes image metadata/adds new uploads. Separate DB/storage calls can partially fail. Public profile renders projects/images; storage object cleanup on delete needs confirmation.

```mermaid
sequenceDiagram
  actor Designer
  participant UI as DesignerDashboard
  participant Storage as Supabase Storage
  participant DB as Postgres
  participant Public as Homeowner profile
  Designer->>UI: Select project images
  UI->>UI: Compress files
  UI->>Storage: Upload to portfolio
  Storage-->>UI: Public URL
  UI->>DB: Insert project_images rows
  Public->>DB: Read project/image metadata
  Public->>Storage: Request image URL
```

## Discovery and lead
Client loads designer list, applies UI filters, opens profile, reads portfolio/reviews, then lead wizard validates fields and writes/upserts `connections`. Designer app queries leads and updates status/timestamp or deletes. Client-side validation and guards do not establish RLS behavior. Verify deployed policies for ownership and subscription restrictions.

```mermaid
flowchart LR
  A[Discover designers] --> B[Open designer profile]
  B --> C[Lead wizard validation]
  C --> D[Write connections row]
  D --> E[Designer dashboard reads lead]
  E --> F[Update status or delete]
  F -. client visibility depends on query/policy .-> G[Client connections view]
```

## Payments
Plan action → invoke `create-razorpay-order` → Edge Function calls Razorpay Orders API → browser Checkout → success response includes payment/order/signature → invoke `verify-razorpay-payment` → server HMAC verification → subscription update and payment history insert. No webhook, reconciliation or scheduled expiry flow was found. Verify idempotency/deployment/secrets.

```mermaid
sequenceDiagram
  actor Designer
  participant UI as Dashboard
  participant Edge as Supabase Edge Functions
  participant Razorpay
  participant DB as Postgres
  Designer->>UI: Select plan
  UI->>Edge: create-razorpay-order
  Edge->>Razorpay: Create order
  Razorpay-->>UI: Checkout details
  Designer->>Razorpay: Complete checkout
  Razorpay-->>UI: payment/order/signature
  UI->>Edge: verify-razorpay-payment
  Edge->>Edge: Verify HMAC signature
  Edge->>DB: Update subscription + insert history
  Note over Razorpay,Edge: Webhook/reconciliation not found in source
```

Contact form writes `contact_messages`; admin triages. Reviews are queried/inserted through client services. Logout calls Supabase sign-out; auth hooks observe state. Production RLS and error outcomes remain unverified.
