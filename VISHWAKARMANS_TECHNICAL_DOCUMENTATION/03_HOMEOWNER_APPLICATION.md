# Homeowner application

## Structure and routes
`src/main.jsx` mounts React and TanStack Query. `src/App.jsx` installs BrowserRouter, navbar/footer/toasts and global `OnboardingGuard`, with lazy admin/designer management screens. Route definitions cover `/`, `/designers`, `/designers/:id`, `/aboutcontact`, `/terms`, `/privacy`, `/update-password`, `/complete-profile`, `/login`, `/register`, `/connect`, `/profile`, `/admin`, `/admin/manage-designer/:id`, and `*`. Guest/auth/admin route wrappers live in `components/AuthRoutes.jsx`.

## Main journeys
- Discovery: `pages/Designers.jsx`, `hooks/useDesigners.js`, `hooks/useProjects.js`, `services/projectService.js`; profile and portfolio in `pages/DesignerProfile.jsx`. Filters and display are frontend code; visible rows depend on database policies.
- Auth: `Register.jsx`, `Login.jsx`, `GoogleSignInButton.jsx`, `services/authService.js`, `hooks/useAuth.js`. Signup email redirect uses current origin. `CompleteProfile.jsx` handles missing profile information.
- Leads: `LeadWizardModal.jsx` gathers enquiry details; connection helpers/pages write/read `connections`; admin dashboard manages messages and records.
- Contact: `AboutContact.jsx` submits contact message records. `UserProfile.jsx` manages client details.
- Admin: `AdminDashboard.jsx` handles user/designer/application/contact/subscription workflows and invokes `admin-onboard`; a designer management route renders `DesignerDashboard.jsx`.

## Design/runtime
Tailwind utility classes and `src/index.css` supply styling; Lucide, Framer Motion, skeleton cards and toast feedback are used. Static assets and Netlify directives are in `public/`. The view hook calls `increment_profile_view`; its database implementation was not found in the sole migration.

The repository includes a `.env`, not reproduced here. `supabase.zip` exists, but its provenance was not treated as authoritative schema evidence. See inventory for every relevant file and open questions for runtime configuration gaps.
