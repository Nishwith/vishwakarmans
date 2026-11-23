import { describe, it, expect, vi } from "vitest";
import {
  generateSitemap,
  SEO_CATEGORIES,
  STATIC_ROUTES,
  LAUNCH_CITIES,
  LAUNCH_CATEGORIES,
} from "../../scripts/generate-sitemap.js";

describe("generateSitemap", () => {
  it("generates compliant sitemap XML with static, category/city, and designer pages", async () => {
    const mockDesigners = [
      { id: 101, slug: "elite-interiors", city: "Hyderabad" },
      { id: 102, slug: "modern-spaces", city: "Bangalore" },
      { id: 103, city: "Hyderabad" }, // Missing slug -> should fallback to id
    ];

    const mockSupabase = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ data: mockDesigners, error: null })),
        })),
      })),
    };

    const xml = await generateSitemap(mockSupabase);

    // Standard sitemap declaration and urlset xmlns
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');

    // Static routes
    expect(xml).toContain("<loc>https://vishwakarmans.com/</loc>");
    expect(xml).toContain("<loc>https://vishwakarmans.com/about</loc>");
    expect(xml).toContain("<loc>https://vishwakarmans.com/contact</loc>");

    // SEO Categories for Hyderabad
    for (const cat of SEO_CATEGORIES) {
      expect(xml).toContain(`<loc>https://vishwakarmans.com/designers/${cat}/hyderabad</loc>`);
    }

    // SEO Categories for Bangalore
    for (const cat of SEO_CATEGORIES) {
      expect(xml).toContain(`<loc>https://vishwakarmans.com/designers/${cat}/bangalore</loc>`);
    }

    // All 12 programmatic Launch URLs (6 cities x 2 categories: interior & commercial)
    for (const city of LAUNCH_CITIES) {
      for (const cat of LAUNCH_CATEGORIES) {
        expect(xml).toContain(`<loc>https://vishwakarmans.com/designers/${cat}/${city}</loc>`);
      }
    }

    // Designer profiles with slug and id fallback
    expect(xml).toContain("<loc>https://vishwakarmans.com/designer/elite-interiors</loc>");
    expect(xml).toContain("<loc>https://vishwakarmans.com/designer/modern-spaces</loc>");
    expect(xml).toContain("<loc>https://vishwakarmans.com/designer/103</loc>");
  });
});
