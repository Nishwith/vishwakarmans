# File-by-file codebase map

Inventory covers runtime source/configuration, tests, static assets, SQL, scripts and project docs. It excludes `node_modules`, `dist`, `.git`, designer `test-results`, and Supabase `.temp`. `.env` filenames are inventoried, but values are never read or disclosed. Binary assets are catalogued by type/path, not decoded. Rows include imports, line counts and detected backend references; detailed flows are in docs 03, 04, 06–11.

## Homeowner application

| Relative path | Responsibility category | Imports | Backend references | Lines |
|---|---|---|---|---:|
| `.env` | Local runtime env file; values withheld | — | — | — |
| `.gitignore` | Generated/local file exclusions | — | — | — |
| `eslint.config.js` | Lint configuration | @eslint/js, globals, eslint-plugin-react-hooks, eslint-plugin-react-refresh, eslint/config | — | 30 |
| `index.html` | HTML shell and metadata |  | — | 37 |
| `package-lock.json` | Dependencies and npm scripts |  | — | 5003 |
| `package.json` | Dependencies and npm scripts |  | — | 42 |
| `playwright.config.js` | Browser test configuration | @playwright/test | — | 23 |
| `README.md` | Project documentation |  | — | 38 |
| `supabase.zip` | Archive; provenance not established | — | — | — |
| `vite.config.js` | Vite build/dev configuration | vite, @vitejs/plugin-react, @tailwindcss/vite | — | 33 |
| `.github/workflows/deploy.yml` | CI/deploy automation |  | — | 37 |
| `.vscode/extensions.json` | Editor workspace configuration |  | — | 4 |
| `.vscode/settings.json` | Editor workspace configuration |  | — | 25 |
| `public/_headers` | Static media or hosting directive | — | — | — |
| `public/_redirects` | Static media or hosting directive | — | — | — |
| `public/background.jpg` | Static media or hosting directive | — | — | — |
| `public/Commercial.jpg` | Static media or hosting directive | — | — | — |
| `public/interior.jpg` | Static media or hosting directive | — | — | — |
| `public/logo.png` | Static media or hosting directive | — | — | — |
| `public/assets/boutique_studio_materials.png` | Static media or hosting directive | — | — | — |
| `src/App.jsx` | Route composition and guards | react-router-dom, ./components/Navbar, ./components/Footer, ./components/ScrollToTop, react-hot-toast, react, ./pages/Home, ./pages/Designers, ./pages/DesignerProfile, ./pages/Login, ./pages/Register, ./pages/Connect, ./pages/UserProfile, ./pages/AboutContact, ./pages/TermsOfServices, ./pages/Privacy, ./pages/UpdatePassword, ./pages/NotFound, ./pages/CompleteProfile | — | 108 |
| `src/config.js` | Project asset/configuration |  | — | 19 |
| `src/index.css` | Global/feature styling |  | — | 136 |
| `src/main.jsx` | React application bootstrap | react, react-dom/client, @tanstack/react-query, ./App.jsx | — | 24 |
| `src/setupTests.js` | Project asset/configuration |  | — | 2 |
| `src/supabaseClient.js` | Project asset/configuration | @supabase/supabase-js, ./config | — | 4 |
| `src/components/AuthRoutes.jsx` | UI, guard or feature module | react, react-router-dom, ../hooks/useAuth, lucide-react | — | 117 |
| `src/components/CategoryTabs.jsx` | UI, guard or feature module | react, lucide-react | — | 50 |
| `src/components/DesignerCard.jsx` | UI, guard or feature module | react, lucide-react, react-router-dom | — | 76 |
| `src/components/Footer.jsx` | UI, guard or feature module | react, react-router-dom | — | 201 |
| `src/components/GoogleSignInButton.jsx` | UI, guard or feature module | react, ../services/authService, lucide-react, react-hot-toast | — | 57 |
| `src/components/LeadWizardModal.jsx` | UI, guard or feature module | react, framer-motion, lucide-react | — | 269 |
| `src/components/Navbar.jsx` | UI, guard or feature module | react, react-router-dom, lucide-react, ../hooks/useAuth, ../services/authService, @tanstack/react-query | — | 214 |
| `src/components/ScrollToTop.jsx` | UI, guard or feature module | react, react-router-dom | — | 12 |
| `src/components/SkeletonCard.jsx` | UI, guard or feature module | react | — | 38 |
| `src/hooks/useAuth.js` | Reusable query/state hook | @tanstack/react-query, ../services/authService | — | 31 |
| `src/hooks/useDesigners.js` | Reusable query/state hook | react, ../supabaseClient | designers | 89 |
| `src/hooks/useProjects.js` | Reusable query/state hook | @tanstack/react-query | — | 64 |
| `src/pages/AboutContact.jsx` | Page/route; see app guide | react, react-router-dom, ../supabaseClient, react-hot-toast | contact_messages | 272 |
| `src/pages/AdminDashboard.jsx` | Page/route; see app guide | react, react-router-dom, ../supabaseClient, react-hot-toast, @tanstack/react-query, ../services/authService | admin-onboard, contact_messages, designer_applications, designers, portfolio, reviews, users | 1936 |
| `src/pages/CompleteProfile.jsx` | Page/route; see app guide | react, react-router-dom, @tanstack/react-query, react-hot-toast, lucide-react, ../supabaseClient, ../services/authService | — | 176 |
| `src/pages/Connect.jsx` | Page/route; see app guide | react, ../supabaseClient, react-router-dom | connections | 207 |
| `src/pages/DesignerDashboard.jsx` | Page/route; see app guide | react, react-router-dom, ../supabaseClient, react-hot-toast, ../utils/imageCompression, @tanstack/react-query, ../services/authService | connections, designer_projects, designers, portfolio, project_images, users | 1423 |
| `src/pages/DesignerProfile.jsx` | Page/route; see app guide | react, react-router-dom, ../supabaseClient, react-hot-toast, framer-motion, ../components/LeadWizardModal | connections, designer_projects, designers, increment_profile_view, reviews, users | 1074 |
| `src/pages/Designers.jsx` | Page/route; see app guide | react, ../supabaseClient, react-hot-toast, react-router-dom, ../components/SkeletonCard, framer-motion, ../hooks/useAuth | designers, get_designers_nearby | 580 |
| `src/pages/Home.jsx` | Page/route; see app guide | react, react-router-dom, ../supabaseClient, ../hooks/useAuth | designers | 675 |
| `src/pages/Login.jsx` | Page/route; see app guide | react, react-router-dom, lucide-react, react-hot-toast, @tanstack/react-query, ../services/authService, ../supabaseClient, ../components/GoogleSignInButton | users | 201 |
| `src/pages/NotFound.jsx` | Page/route; see app guide | react, react-router-dom, lucide-react | — | 62 |
| `src/pages/Privacy.jsx` | Page/route; see app guide | react, lucide-react | — | 123 |
| `src/pages/Register.jsx` | Page/route; see app guide | react, react-router-dom, react-hot-toast, ../services/authService, ../services/supabaseClient, ../components/GoogleSignInButton | designers | 200 |
| `src/pages/TermsOfServices.jsx` | Page/route; see app guide | react | — | 140 |
| `src/pages/UpdatePassword.jsx` | Page/route; see app guide | react, ../supabaseClient, react-router-dom, lucide-react, react-hot-toast, @tanstack/react-query, ../services/authService | — | 87 |
| `src/pages/UserProfile.jsx` | Page/route; see app guide | react, ../supabaseClient, react-hot-toast, react-router-dom, @tanstack/react-query, ../services/authService | users | 334 |
| `src/services/authService.js` | Auth/data service | ./supabaseClient | users | 91 |
| `src/services/projectService.js` | Auth/data service | ./supabaseClient | connections, designer_projects, designers, portfolio, project_images, reviews | 140 |
| `src/services/supabaseClient.js` | Auth/data service | @supabase/supabase-js, ../config | — | 5 |
| `src/utils/imageCompression.js` | Validation/media/view utility |  | — | 31 |
| `src/utils/useLogProfileView.js` | Validation/media/view utility | react, ../supabaseClient | increment_profile_view | 25 |
| `src/utils/validation.js` | Validation/media/view utility |  | — | 18 |
| `src/__tests__/integration.test.jsx` | Automated test specification | react, @testing-library/react, react-router-dom, @tanstack/react-query, vitest, ../components/AuthRoutes, ../pages/Designers, ../pages/Connect, ../hooks/useAuth | — | 255 |
| `supabase/config.toml` | Supabase CLI configuration |  | — | 415 |
| `supabase/functions/admin-onboard/.npmrc` | Edge Function handler/config | — | — | — |
| `supabase/functions/admin-onboard/deno.json` | Edge Function handler/config |  | — | 6 |
| `supabase/functions/admin-onboard/index.ts` | Edge Function handler/config | https://deno.land/std@0.168.0/http/server.ts, https://esm.sh/@supabase/supabase-js@2 | designers, users | 99 |
| `supabase/migrations/0001_phase1_hardening.sql` | SQL schema/policy/function changes |  | — | 310 |
| `tests/e2e/auth-onboarding-flow.spec.js` | Automated test specification | @playwright/test | — | 130 |
| `tests/e2e/project-upload-flow.spec.js` | Automated test specification | @playwright/test | — | 175 |
| `worker/media-proxy.js` | Media proxy runtime/config |  | — | 45 |
| `worker/wrangler.toml` | Media proxy runtime/config |  | — | 11 |

## Designer application

| Relative path | Responsibility category | Imports | Backend references | Lines |
|---|---|---|---|---:|
| `.env` | Local runtime env file; values withheld | — | — | — |
| `.gitignore` | Generated/local file exclusions | — | — | — |
| `eslint.config.js` | Lint configuration | @eslint/js, globals, eslint-plugin-react-hooks, eslint-plugin-react-refresh, eslint/config | — | 30 |
| `index.html` | HTML shell and metadata |  | — | 39 |
| `package-lock.json` | Dependencies and npm scripts |  | — | 5004 |
| `package.json` | Dependencies and npm scripts |  | — | 42 |
| `playwright.config.js` | Browser test configuration | @playwright/test | — | 23 |
| `README.md` | Project documentation |  | — | 38 |
| `vite.config.js` | Vite build/dev configuration | vite, @vitejs/plugin-react, @tailwindcss/vite | — | 33 |
| `.github/workflows/deploy.yml` | CI/deploy automation |  | — | 37 |
| `.vscode/extensions.json` | Editor workspace configuration |  | — | 4 |
| `.vscode/settings.json` | Editor workspace configuration |  | — | 25 |
| `public/_headers` | Static media or hosting directive | — | — | — |
| `public/_redirects` | Static media or hosting directive | — | — | — |
| `public/background.jpg` | Static media or hosting directive | — | — | — |
| `public/Commercial.jpg` | Static media or hosting directive | — | — | — |
| `public/interior.jpg` | Static media or hosting directive | — | — | — |
| `public/logo.png` | Static media or hosting directive | — | — | — |
| `public/assets/boutique_studio_materials.png` | Static media or hosting directive | — | — | — |
| `src/App.jsx` | Route composition and guards | react-router-dom, ./components/Navbar, ./components/Footer, ./components/ScrollToTop, react-hot-toast, react, ./pages/Login, ./pages/Register, ./pages/Connect, ./pages/UserProfile, ./pages/AboutContact, ./pages/Faqs, ./pages/TermsOfServices, ./pages/Privacy, ./pages/UpdatePassword, ./pages/NotFound, ./pages/UnifiedOnboarding, ./pages/Waitlist | — | 107 |
| `src/config.js` | Project asset/configuration |  | — | 19 |
| `src/index.css` | Global/feature styling |  | — | 136 |
| `src/main.jsx` | React application bootstrap | react, react-dom/client, @tanstack/react-query, ./App.jsx | — | 24 |
| `src/setupTests.js` | Project asset/configuration |  | — | 2 |
| `src/supabaseClient.js` | Project asset/configuration | @supabase/supabase-js, ./config | — | 4 |
| `src/components/AuthRoutes.jsx` | UI, guard or feature module | react, react-router-dom, ../hooks/useAuth, ../supabaseClient, react-hot-toast, lucide-react | — | 235 |
| `src/components/BillingTab.jsx` | UI, guard or feature module | react, lucide-react, react-hot-toast, ../supabaseClient | payment_history | 271 |
| `src/components/Footer.jsx` | UI, guard or feature module | react, react-router-dom | — | 194 |
| `src/components/GoogleSignInButton.jsx` | UI, guard or feature module | react, ../services/authService, lucide-react, react-hot-toast | — | 78 |
| `src/components/Navbar.jsx` | UI, guard or feature module | react, react-router-dom, lucide-react, ../hooks/useAuth, ../services/authService, @tanstack/react-query | — | 193 |
| `src/components/ScrollToTop.jsx` | UI, guard or feature module | react, react-router-dom | — | 12 |
| `src/hooks/useAuth.js` | Reusable query/state hook | @tanstack/react-query, ../services/authService | — | 31 |
| `src/hooks/useDesigners.js` | Reusable query/state hook | react, ../supabaseClient | designers | 89 |
| `src/hooks/useLogProjectView.js` | Reusable query/state hook | react, ../supabaseClient | project_views_log | 31 |
| `src/hooks/useProjects.js` | Reusable query/state hook | @tanstack/react-query | — | 64 |
| `src/pages/AboutContact.jsx` | Page/route; see app guide | react, react-router-dom, ../supabaseClient, react-hot-toast | contact_messages | 272 |
| `src/pages/Connect.jsx` | Page/route; see app guide | react, ../supabaseClient, react-router-dom | connections | 207 |
| `src/pages/DesignerDashboard.jsx` | Page/route; see app guide | react, react-router-dom, ../supabaseClient, ../components/BillingTab, react-hot-toast, ../utils/imageCompression, @tanstack/react-query, ../services/authService | connections, create-razorpay-order, designer_projects, designers, portfolio, project_images, users | 1627 |
| `src/pages/Faqs.jsx` | Page/route; see app guide | react, lucide-react, react-router-dom | — | 117 |
| `src/pages/Login.jsx` | Page/route; see app guide | react, react-router-dom, lucide-react, react-hot-toast, @tanstack/react-query, ../services/authService, ../components/GoogleSignInButton | — | 194 |
| `src/pages/NotFound.jsx` | Page/route; see app guide | react, react-router-dom, lucide-react | — | 62 |
| `src/pages/Privacy.jsx` | Page/route; see app guide | react, lucide-react | — | 123 |
| `src/pages/Register.jsx` | Page/route; see app guide | react, react-router-dom, lucide-react, react-hot-toast, ../services/authService, ../components/GoogleSignInButton, ../supabaseClient | users | 158 |
| `src/pages/TermsOfServices.jsx` | Page/route; see app guide | react | — | 140 |
| `src/pages/UnifiedOnboarding.jsx` | Page/route; see app guide | react, ../supabaseClient, react-router-dom, react-hot-toast | designer_applications, users | 325 |
| `src/pages/UpdatePassword.jsx` | Page/route; see app guide | react, ../supabaseClient, react-router-dom, lucide-react, react-hot-toast, @tanstack/react-query, ../services/authService | — | 87 |
| `src/pages/UserProfile.jsx` | Page/route; see app guide | react, ../supabaseClient, react-hot-toast, react-router-dom, @tanstack/react-query, ../services/authService | users | 417 |
| `src/pages/Waitlist.jsx` | Page/route; see app guide | react, react-router-dom, lucide-react, ../services/authService, @tanstack/react-query, ../supabaseClient | designers | 106 |
| `src/services/authService.js` | Auth/data service | ./supabaseClient | designer_applications, designers, users | 123 |
| `src/services/projectService.js` | Auth/data service | ./supabaseClient | connections, designer_projects, designers, portfolio, project_images, reviews | 140 |
| `src/services/supabaseClient.js` | Auth/data service | @supabase/supabase-js, ../config | — | 5 |
| `src/utils/imageCompression.js` | Validation/media/view utility |  | — | 31 |
| `src/utils/useLogProfileView.js` | Validation/media/view utility | react, ../supabaseClient | increment_profile_view | 25 |
| `src/utils/validation.js` | Validation/media/view utility |  | — | 18 |
| `src/__tests__/approval.test.jsx` | Automated test specification | vitest, ../components/AuthRoutes | — | 32 |
| `src/__tests__/integration.test.jsx` | Automated test specification | react, @testing-library/react, @testing-library/user-event, react-router-dom, @tanstack/react-query, vitest, ../components/AuthRoutes, ../pages/UnifiedOnboarding, ../pages/DesignerDashboard, ../pages/Waitlist, ../services/authService, ../services/projectService, ../hooks/useAuth | — | 478 |
| `supabase/config.toml` | Supabase CLI configuration |  | — | 425 |
| `supabase/functions/admin-onboard/.npmrc` | Edge Function handler/config | — | — | — |
| `supabase/functions/admin-onboard/deno.json` | Edge Function handler/config |  | — | 6 |
| `supabase/functions/admin-onboard/index.ts` | Edge Function handler/config | https://deno.land/std@0.168.0/http/server.ts, https://esm.sh/@supabase/supabase-js@2 | designers, users | 99 |
| `supabase/functions/create-razorpay-order/index.ts` | Edge Function handler/config | https://deno.land/std@0.168.0/http/server.ts, https://esm.sh/@supabase/supabase-js@2 | designers | 84 |
| `supabase/functions/verify-razorpay-payment/index.ts` | Edge Function handler/config | https://deno.land/std@0.168.0/http/server.ts, https://esm.sh/@supabase/supabase-js@2 | designers, payment_history | 165 |
| `supabase/migrations/0001_phase1_hardening.sql` | SQL schema/policy/function changes |  | — | 310 |
| `tests/e2e/auth-onboarding-flow.spec.js` | Automated test specification | @playwright/test | — | 130 |
| `tests/e2e/project-upload-flow.spec.js` | Automated test specification | @playwright/test | — | 175 |
| `worker/media-proxy.js` | Media proxy runtime/config |  | — | 45 |
| `worker/wrangler.toml` | Media proxy runtime/config |  | — | 11 |

### Inventory limits
Responsibility categories combine path context with observed imports/backend references; see module guides for feature behavior. Binaries were identified but not visually inspected. Generated caches, bundles and Playwright traces are excluded. .env values were not read.
