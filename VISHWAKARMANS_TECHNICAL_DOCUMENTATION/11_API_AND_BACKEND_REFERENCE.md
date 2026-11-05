# API and backend reference

Both apps use Supabase JS with `createClient(URL, anonKey)`, Auth, PostgREST `.from(table)`, Storage upload/public URL and RPC `increment_profile_view`. `services/authService.js` wraps auth; `services/projectService.js` wraps project/connection/review operations; direct page/dashboard queries also exist.

Tables observed: `users`, `designers`, `designer_applications`, `designer_projects`, `project_images`, `connections`, `reviews`, `contact_messages`, `payment_history`, `project_views_log`; migration objects include `daily_view_counts`, `mv_public_marketplace_feed`, `mv_refresh_state`.

Edge Functions: `admin-onboard` (both repos, designer onboarding from client admin page) now requires a verified bearer user ID in server-side `ADMIN_USER_IDS`; designer repo also has `create-razorpay-order` and `verify-razorpay-payment`. Payment handlers authenticate the designer owner, bind the plan in Razorpay order notes and verify reported amount/captured state. Duplicate history lookup rejects sequential replays but is not atomic. No webhook function identified. Worker `worker/media-proxy.js` fetches media origin. Google OAuth runs through Supabase Auth.

Code config names: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, optional `VITE_MEDIA_BASE_URL`. Server-side function secrets include Supabase service credentials, Razorpay credentials and `ADMIN_USER_IDS`; store them only in Supabase function secrets, never Vite. Values omitted.
