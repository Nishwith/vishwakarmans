# Deployment and environment

Both package manifests define `npm run dev` (`vite --host`), `npm run build`, `npm run lint` (`eslint .`) and `npm run preview`. Commands were not executed. Both repos contain Vite config, HTML entry, Netlify `_redirects`/`_headers`, GitHub deploy workflow, Playwright config and Supabase CLI config. `dist`, dependencies and CLI `.temp` are generated/local state.

Vite names read by source: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, optional `VITE_MEDIA_BASE_URL`. `.env` values are omitted. Razorpay/Supabase Edge Function secrets belong server-side in Supabase, not browser builds.

The request names Netlify reference domains, not independently verified current production domains. Signup redirects use current origin in client app; designer callback logic is in its auth service. Verify Supabase redirect allowlist, OAuth URLs, Netlify env mappings, custom domains, Worker routing and workflow secrets in their respective consoles. Review SPA fallback, headers, canonical/SEO and sitemap/robots assets before deployment. No deployment or DNS action performed.
