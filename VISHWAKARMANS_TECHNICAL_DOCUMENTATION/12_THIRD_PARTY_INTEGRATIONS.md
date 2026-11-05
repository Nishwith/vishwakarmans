# Third-party integrations

| Service | Purpose/evidence | Status limits |
|---|---|---|
| Supabase | Auth, DB, Storage in both apps; migration/functions | Code active; live project settings unknown. |
| Razorpay | Designer checkout and Edge Function order/signature verification | Source flow present; webhook/reconciliation absent in inspected tree. |
| Google OAuth | Auth service and sign-in button in both apps | Code wired; provider/redirect settings unknown. |
| Cloudflare Workers | Media proxy Worker and Wrangler config | Source exists; deployment/wiring unknown. |
| Netlify | Redirect/header files and workflow; deployment URLs supplied in request | Connected sites/domains unverified. |
| GitHub Actions | `.github/workflows/deploy.yml` | Workflow exists; secrets/run status unverified. |
| pg_cron | Migration schedules view rollup | SQL intent present; extension/job state unverified. |

Do not infer integrations from packages alone. Secret values are excluded.
