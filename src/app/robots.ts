import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "https://paperwala.world");

  const allowedPaths = [
    "/",
    "/quick-paper",
    "/select-questions",
    "/paper-editor",
    "/pricing",
    "/register",
    "/login",
    "/opengraph-image",
    "/twitter-image",
    "/icon",
    "/apple-icon",
  ];

  const disallowedPaths = [
    "/api/",
    "/admin/",
    "/profile",
    "/verification-pending",
  ];

  return {
    rules: [
      {
        userAgent: "*",
        allow: allowedPaths,
        disallow: disallowedPaths,
      },
      {
        userAgent: [
          "Googlebot",
          "Googlebot-Image",
          "Bingbot",
          "OAI-SearchBot",
          "ChatGPT-User",
          "PerplexityBot",
          "ClaudeBot",
          "Google-Extended",
        ],
        allow: allowedPaths,
        disallow: disallowedPaths,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}

