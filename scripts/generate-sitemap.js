import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = "https://vishwakarmans.com";
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

export async function generateSitemap(supabase) {
  // 1. Fetch active designer profiles
  let designers = [];
  const { data: withSlug, error: slugErr } = await supabase
    .from("designers")
    .select("slug, city, is_public, is_subscription_active")
    .eq("is_public", true);

  if (!slugErr && withSlug && withSlug.length > 0) {
    designers = withSlug;
  } else {
    const { data: fallbackData } = await supabase
      .from("designers")
      .select("id, city, is_public, is_subscription_active")
      .eq("is_public", true);

    designers = (fallbackData || []).map((d) => ({
      slug: d.slug || d.id,
      city: d.city,
    }));
  }

  // 2. Filter unique cities
  const uniqueCities = [
    ...new Set(
      designers
        .map((d) => d.city)
        .filter((c) => typeof c === "string" && c.trim().length > 0)
        .map((c) => c.trim())
    ),
  ];

  const xmlUrls = [];

  // 3. Static global routes
  for (const route of STATIC_ROUTES) {
    xmlUrls.push(`  <url><loc>${BASE_URL}${route === "/" ? "/" : route}</loc></url>`);
  }

  // 4. SEO Category + City landing pages
  for (const city of uniqueCities) {
    const formattedCity = encodeURIComponent(city.toLowerCase().replace(/\s+/g, "-"));
    for (const category of SEO_CATEGORIES) {
      const formattedCat = encodeURIComponent(category.toLowerCase().trim());
      xmlUrls.push(
        `  <url><loc>${BASE_URL}/designers/${formattedCat}/${formattedCity}</loc></url>`
      );
    }
  }

  // 5. Designer profile pages
  for (const designer of designers) {
    const slug = designer.slug || designer.id;
    if (slug != null) {
      const formattedSlug = encodeURIComponent(String(slug).toLowerCase().trim());
      xmlUrls.push(`  <url><loc>${BASE_URL}/designer/${formattedSlug}</loc></url>`);
    }
  }

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${xmlUrls.join("\n")}\n</urlset>`;
}

// Run directly if executed via CLI
if (process.argv[1] === __filename) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "https://amcsynborvioqgqmsbhn.supabase.co";
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "sb_publishable_89JrjDbtxpLrr-I_-SyCOQ_YnUuMHnc";

  const supabase = createClient(supabaseUrl, supabaseKey);

  generateSitemap(supabase)
    .then((xml) => {
      console.log("Generated Sitemap XML preview:");
      console.log(xml.split("\n").slice(0, 15).join("\n"));
      console.log(`... Total lines: ${xml.split("\n").length}`);

      // Optionally write to public/sitemap.xml if public dir exists
      const publicDir = path.resolve(__dirname, "../public");
      if (fs.existsSync(publicDir)) {
        fs.writeFileSync(path.join(publicDir, "sitemap.xml"), xml, "utf-8");
        console.log(`Wrote sitemap to ${path.join(publicDir, "sitemap.xml")}`);
      }
    })
    .catch((err) => {
      console.error("Error generating sitemap:", err);
      process.exit(1);
    });
}
