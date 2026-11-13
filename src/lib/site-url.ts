/**
 * Single source of truth for the canonical production origin.
 * Matches the live primary domain https://www.paperwala.world served by Vercel
 * (where apex paperwala.world 308-redirects to www.paperwala.world), preventing
 * Google Search Console "Page with redirect" and canonical-loop issues in
 * sitemap.xml, robots.txt, and <link rel="canonical"> tags.
 */
function resolveCanonicalSiteUrl(): string {
  const raw =
    process.env.APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://www.paperwala.world";

  try {
    const parsed = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
    if (
      parsed.hostname.endsWith(".vercel.app") ||
      parsed.hostname === "localhost" ||
      parsed.hostname === "127.0.0.1"
    ) {
      return "https://www.paperwala.world";
    }
    if (parsed.hostname === "paperwala.world") {
      parsed.hostname = "www.paperwala.world";
    }
    parsed.protocol = "https:";
    return parsed.origin;
  } catch {
    return "https://www.paperwala.world";
  }
}

export const SITE_URL = resolveCanonicalSiteUrl();
