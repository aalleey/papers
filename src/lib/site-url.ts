/**
 * Single source of truth for the canonical production origin.
 * Never uses VERCEL_URL or VERCEL_PROJECT_PRODUCTION_URL if they point to
 * *.vercel.app or www.*, preventing Google Search Console "Page with redirect"
 * and "Redirect error" issues in sitemap.xml, robots.txt, and canonical tags.
 */
function resolveCanonicalSiteUrl(): string {
  const raw =
    process.env.APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://paperwala.world";

  try {
    const parsed = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
    // Never allow preview *.vercel.app or www. hosts to leak into canonical/sitemap URLs
    if (
      parsed.hostname.endsWith(".vercel.app") ||
      parsed.hostname === "localhost" ||
      parsed.hostname === "127.0.0.1"
    ) {
      return "https://paperwala.world";
    }
    if (parsed.hostname.startsWith("www.")) {
      parsed.hostname = parsed.hostname.slice(4);
    }
    parsed.protocol = "https:";
    return parsed.origin;
  } catch {
    return "https://paperwala.world";
  }
}

export const SITE_URL = resolveCanonicalSiteUrl();
