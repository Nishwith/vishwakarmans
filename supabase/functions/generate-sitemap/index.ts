import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const BASE_URL = "https://vishwakarmans.com";
export const LAUNCH_CITIES = [
  "hyderabad",
  "bangalore",
  "kolkata",
  "delhi",
  "mumbai",
  "chennai",
];

export const LAUNCH_CATEGORIES = ["interior", "commercial"];

export const SEO_CATEGORIES = ["interior", "exterior", "commercial", "home", "office"];

export const STATIC_ROUTES = [
  "/",
  "/about",
  "/contact",
  "/designers",
  "/compare",
  "/terms",
  "/privacy",
];

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

export async function buildSitemapXml(supabase: any): Promise<string> {
  // 1. Fetch unique slug and city values from active profiles in designers table
  let designers: Array<{ slug?: string; id?: string | number; city?: string }> = [];

  const { data: withSlug, error: slugErr } = await supabase
    .from("designers")
    .select("slug, city, is_public, is_subscription_active")
    .eq("is_public", true);

  if (!slugErr && withSlug && withSlug.length > 0) {
    designers = withSlug;
  } else {
    // Fallback if slug column is not present
    const { data: fallbackData } = await supabase
      .from("designers")
      .select("id, city, is_public, is_subscription_active")
      .eq("is_public", true);

    designers = (fallbackData || []).map((d: any) => ({
      slug: d.slug || d.id,
      city: d.city,
    }));
  }

  // Filter unique cities (seeded with the 6 core launch cities)
  const uniqueCities = [
    ...new Set([
      ...LAUNCH_CITIES,
      ...designers
        .map((d) => d.city)
        .filter((c): c is string => typeof c === "string" && c.trim().length > 0)
        .map((c) => c.trim()),
    ]),
  ];

  const xmlUrls: string[] = [];

  // 2. Static global routes
  for (const route of STATIC_ROUTES) {
    xmlUrls.push(`  <url><loc>${BASE_URL}${route === "/" ? "/" : route}</loc></url>`);
  }

  // 3. SEO Category + City landing pages
  for (const city of uniqueCities) {
    const formattedCity = encodeURIComponent(city.toLowerCase().replace(/\s+/g, "-"));
    for (const category of SEO_CATEGORIES) {
      const formattedCat = encodeURIComponent(category.toLowerCase().trim());
      xmlUrls.push(
        `  <url><loc>${BASE_URL}/designers/${formattedCat}/${formattedCity}</loc></url>`
      );
    }
  }

  // 4. Designer profile pages
  for (const designer of designers) {
    const slug = designer.slug || designer.id;
    if (slug != null) {
      const formattedSlug = encodeURIComponent(String(slug).toLowerCase().trim());
      xmlUrls.push(`  <url><loc>${BASE_URL}/designer/${formattedSlug}</loc></url>`);
    }
  }

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${xmlUrls.join("\n")}\n</urlset>`;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseAnonKey =
      Deno.env.get("SUPABASE_ANON_KEY") ||
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ||
      "";

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
    });

    const xml = await buildSitemapXml(supabase);

    return new Response(xml, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml",
      },
    });
  } catch (error: any) {
    return new Response(`Error generating sitemap: ${error?.message || error}`, {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "text/plain" },
    });
  }
});
