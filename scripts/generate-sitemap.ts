/**
 * Generates sitemap.xml from static pages + static blog slugs + dynamic blog articles from API.
 * Run: pnpm generate:sitemap
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_URL = "https://thetaxfirm.us";
const OUTPUT = path.resolve(__dirname, "..", "client", "public", "sitemap.xml");

// Static blog slugs (imported inline to avoid TS/JSX compilation issues)
const STATIC_BLOG_SLUGS = [
  "why-your-cpa-is-costing-you-thousands",
  "s-corp-election-guide-business-owners",
  "roth-conversion-strategy-high-income",
  "real-estate-tax-strategies-investors",
  "asset-protection-business-owners",
  "tax-planning-strategies-2026",
  "retirement-account-strategies-business-owners",
  "wealth-building-tax-efficient-strategies",
  "arcade-game-strategy-roth-conversion-tax-free",
  "cost-segregation-studies-real-estate-tax-savings",
  "entity-structuring-real-estate-investors-llc-scorp-guide",
  "augusta-rule-tax-free-home-rental-business-owners",
];

// Static pages with priority and changefreq
const STATIC_PAGES = [
  { path: "/", priority: "1.0", changefreq: "weekly" },
  { path: "/blog", priority: "0.8", changefreq: "daily" },
  { path: "/services/fractional-cfo", priority: "0.9", changefreq: "monthly" },
  { path: "/services/bookkeeping", priority: "0.9", changefreq: "monthly" },
];

interface ApiArticle {
  slug: string;
  publishedAt: string;
}

async function fetchDynamicSlugs(): Promise<ApiArticle[]> {
  try {
    const res = await fetch(`${BASE_URL}/api/blog/articles`);
    if (!res.ok) {
      console.warn(`[sitemap] API returned ${res.status}, using static slugs only`);
      return [];
    }
    const data = await res.json();
    return (data.articles || []).map((a: any) => ({
      slug: a.slug,
      publishedAt: a.publishedAt,
    }));
  } catch (err) {
    console.warn("[sitemap] Failed to fetch dynamic articles:", err);
    return [];
  }
}

function toXmlEntry(loc: string, opts: { priority: string; changefreq: string; lastmod?: string }): string {
  let entry = `  <url>\n    <loc>${loc}</loc>\n`;
  if (opts.lastmod) entry += `    <lastmod>${opts.lastmod}</lastmod>\n`;
  entry += `    <changefreq>${opts.changefreq}</changefreq>\n`;
  entry += `    <priority>${opts.priority}</priority>\n`;
  entry += `  </url>`;
  return entry;
}

async function main() {
  console.log("[sitemap] Generating sitemap.xml...");

  const dynamicArticles = await fetchDynamicSlugs();
  const dynamicSlugs = new Set(dynamicArticles.map((a) => a.slug));

  const today = new Date().toISOString().split("T")[0];
  const entries: string[] = [];

  // Static pages
  for (const page of STATIC_PAGES) {
    entries.push(toXmlEntry(`${BASE_URL}${page.path}`, {
      priority: page.priority,
      changefreq: page.changefreq,
      lastmod: today,
    }));
  }

  // Static blog posts
  for (const slug of STATIC_BLOG_SLUGS) {
    if (!dynamicSlugs.has(slug)) {
      entries.push(toXmlEntry(`${BASE_URL}/blog/${slug}`, {
        priority: "0.7",
        changefreq: "monthly",
      }));
    }
  }

  // Dynamic blog posts from API
  for (const article of dynamicArticles) {
    const lastmod = article.publishedAt
      ? new Date(article.publishedAt).toISOString().split("T")[0]
      : today;
    entries.push(toXmlEntry(`${BASE_URL}/blog/${article.slug}`, {
      priority: "0.7",
      changefreq: "monthly",
      lastmod,
    }));
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join("\n")}
</urlset>
`;

  fs.writeFileSync(OUTPUT, xml, "utf-8");
  console.log(`[sitemap] Written ${entries.length} URLs to ${OUTPUT}`);
}

main().catch(console.error);
