# Feature implementation matrix

| Feature | Application | Status | Frontend files | Backend dependency | Notes |
|---|---|---|---|---|---|
| Public home | Client | Implemented in source | `Home.jsx`, shared UI | Static/assets and queries | Production unknown |
| Discovery/search | Client | Implemented in source | `Designers.jsx`, `useDesigners.js` | designers/projects | Filters in source |
| Profile/portfolio | Client | Implemented in source | `DesignerProfile.jsx` | designers/projects/images/storage | Visibility policy unknown |
| Email/password auth | Both | Implemented in source | Register/Login/auth service | Supabase Auth | Redirect config unknown |
| Google OAuth | Both | Partially implemented | Google button/auth service | Supabase provider | Console setup unknown |
| Client profile | Client | Implemented in source | CompleteProfile/UserProfile | users | Migration adds completion flag |
| Designer onboarding | Designer | Implemented in source | UnifiedOnboarding | users/applications | Admin lifecycle unclear |
| Designer approval | Client admin + designer | Partially implemented | AdminDashboard/Waitlist/guards | designers/application | Verified flag is used |
| Designer dashboard | Designer | Implemented in source | DesignerDashboard | multiple tables | RLS unverified |
| Portfolio CRUD | Designer | Implemented in source | dashboard/compression | projects/images/storage | Partial failure cleanup unclear |
| Leads/status | Both | Implemented in source | LeadWizard/Connect/dashboard | connections | Policy unknown |
| Reviews | Client | Partially implemented | profile/hooks/services | reviews | Eligibility enforcement unknown |
| Contact form | Client | Implemented in source | AboutContact | contact_messages | Abuse controls unknown |
| Subscription checkout | Designer | Implemented in source | dashboard/BillingTab | Razorpay Edge Functions | No webhook found |
| Payment verification | Designer | Implemented in source; staging unverified | dashboard + Edge Function | Razorpay order/payment API | Auth, owner, plan and amount checks; atomic replay handling pending |
| Payment history | Designer | Partially implemented | BillingTab/dashboard | payment_history | Schema/RLS unavailable |
| View analytics | Both/migration | Partially implemented | view hooks | RPC/log/cron/matview | RPC body absent |
| Media proxy | Both | Partially implemented | config/Worker | Cloudflare | Wiring unknown |
| Nearby designer discovery | Client | Partially implemented | `Designers.jsx` | `get_designers_nearby` RPC and location columns | Fixed 50 km call; RPC/schema absent from checked-in migrations |
| Designer comparison | Client | Not found | — | — | Homepage copy mentions comparison, but no compare workflow/state/page was identified |
| R2 media storage | Both | Planned/not found | — | Cloudflare R2 | No R2 binding or secure upload endpoint found |
| Notifications | Both | Not found | — | — | No notification module identified |
