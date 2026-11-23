/**
 * Cloudflare Pages Function proxy for /sitemap.xml
 * Intercepts GET /sitemap.xml before SPA wildcard redirect (/* /index.html 200)
 * Proxies to Supabase Edge Function generate-sitemap and caches response.
 */
export async function onRequestGet(context) {
  const { env } = context;
  const supabaseUrl = (
    env?.VITE_SUPABASE_URL ||
    env?.SUPABASE_URL ||
    "https://amcsynborvioqgqmsbhn.supabase.co"
  ).replace(/\/+$/, "");

  const supabaseKey =
    env?.VITE_SUPABASE_ANON_KEY ||
    env?.SUPABASE_ANON_KEY ||
    "sb_publishable_89JrjDbtxpLrr-I_-SyCOQ_YnUuMHnc";

  try {
    const edgeFunctionUrl = `${supabaseUrl}/functions/v1/generate-sitemap`;
    const response = await fetch(edgeFunctionUrl, {
      method: "GET",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    });

    if (!response.ok) {
      return new Response(
        `<?xml version="1.0" encoding="UTF-8"?><error>Failed to fetch upstream sitemap: ${response.statusText}</error>`,
        {
          status: response.status,
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
          },
        }
      );
    }

    const xml = await response.text();

    return new Response(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?><error>Sitemap generation error: ${error?.message || "Unknown error"}</error>`,
      {
        status: 500,
        headers: {
          "Content-Type": "application/xml; charset=utf-8",
        },
      }
    );
  }
}
