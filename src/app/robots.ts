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

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/quick-paper",
          "/select-questions",
          "/paper-editor",
          "/pricing",
          "/register",
          "/login",
        ],
        disallow: ["/api/", "/admin/"],
      },
      {
        userAgent: "Googlebot",
        allow: [
          "/",
          "/quick-paper",
          "/select-questions",
          "/paper-editor",
          "/pricing",
          "/register",
          "/login",
        ],
        disallow: ["/api/", "/admin/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
