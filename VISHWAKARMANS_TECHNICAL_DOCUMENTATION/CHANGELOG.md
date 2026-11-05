# Changelog

## 2026-11-05 — NEW-02 designer routes and profile completion
- Added explicit account-state routing for no-record signup, incomplete designer profile, pending application, unknown review status, approved-but-unverified and approved/verified accounts.
- New designer signups with `users.role = designer` are no longer mistaken for an existing application; pending status still wins over a verified-looking designer row.
- Routed incomplete profile navigation to an owner-scoped completion form; retained the generic Profile Settings page for other eligible states.
- Kept `RequireAuth`, `RequireDesigner` and exact verification/application approval checks. No database schema or RLS policy changed; staging RLS still needs verification.
- Preserved Contact and FAQ paths (`/aboutcontact`, `/faqs`, `/faq`) and aligned Waitlist status polling with the application status.
- Added route, state, profile update, support navigation and browser-history tests. Full designer Vitest suite: 45 passed; lint: 0 errors, 2 existing hook warnings; isolated build passed.
- **Status: In Progress** pending staging RLS verification. NEW-01 and NEW-03 through NEW-07 were not implemented.

## 2026-11-04 — audit and security stabilization
- Added strict designer verification requirement to dashboard approval guard.
- Corrected previous-image navigation state setter in both dashboard project cards.
- Fixed conditional hook order in the homeowner admin feature-request modal.
- Added admin UUID allowlist validation to both `admin-onboard` copies; added input/method checks and Auth cleanup on profile creation failure.
- Bound Razorpay order creation and verification to authenticated designer ownership and stored order metadata; verify paid/captured amount and reject sequential duplicate transaction IDs.
- Added approval unit coverage and updated approved integration fixture.
- Added engineering audit, bug register, security audit, architecture, roadmap and testing report.
- No production deployment, DNS change, production database migration or production media operation performed.
