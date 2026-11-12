import { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = SITE_URL;

  const allowedPaths = [
    "/",
    "/notes",
    "/quick-paper",
    "/select-questions",
    "/paper-editor",
    "/pricing",
    "/paper-maker",
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
