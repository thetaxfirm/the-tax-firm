import { getPublishedBlogArticles } from "../db";

const BASE_URL = "https://thetaxfirm.us";

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

const STATIC_PAGES = [
  { path: "/", priority: "1.0", changefreq: "weekly" },
  { path: "/blog", priority: "0.8", changefreq: "daily" },
  { path: "/services/fractional-cfo", priority: "0.9", changefreq: "monthly" },
  { path: "/services/bookkeeping", priority: "0.9", changefreq: "monthly" },
];

function entry(loc: string, opts: { priority: string; changefreq: string; lastmod?: string }): string {
  let xml = `  <url>\n    <loc>${loc}</loc>\n`;
  if (opts.lastmod) xml += `    <lastmod>${opts.lastmod}</lastmod>\n`;
  xml += `    <changefreq>${opts.changefreq}</changefreq>\n`;
  xml += `    <priority>${opts.priority}</priority>\n`;
  xml += `  </url>`;
  return xml;
}

export async function generateSitemapXml(): Promise<string> {
  const today = new Date().toISOString().split("T")[0];
  const entries: string[] = [];

  // Static pages
  for (const page of STATIC_PAGES) {
    entries.push(entry(`${BASE_URL}${page.path}`, { priority: page.priority, changefreq: page.changefreq, lastmod: today }));
  }

  // Try to fetch dynamic articles from DB
  let dynamicSlugs = new Set<string>();
  try {
    const result = await getPublishedBlogArticles({ limit: 1000 });
    const articles = result.items;
    dynamicSlugs = new Set(articles.map((a) => a.slug));

    for (const article of articles) {
      const lastmod = article.publishedAt
        ? new Date(article.publishedAt).toISOString().split("T")[0]
        : today;
      entries.push(entry(`${BASE_URL}/blog/${article.slug}`, { priority: "0.7", changefreq: "monthly", lastmod }));
    }
  } catch {
    // DB not available — fall through to static slugs only
  }

  // Static blog slugs (skip if already covered by dynamic)
  for (const slug of STATIC_BLOG_SLUGS) {
    if (!dynamicSlugs.has(slug)) {
      entries.push(entry(`${BASE_URL}/blog/${slug}`, { priority: "0.7", changefreq: "monthly" }));
    }
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join("\n")}
</urlset>
`;
}
