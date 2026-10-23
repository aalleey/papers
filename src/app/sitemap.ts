import { MetadataRoute } from "next";
import { SEO_LANDINGS } from "@/lib/seo-landings";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl =
    process.env.APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "https://paperwala.world");

  const now = new Date();
  const ogImage = `${baseUrl}/opengraph-image`;

  const routes: Array<{
    path: string;
    changeFrequency: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
    priority: number;
  }> = [
    { path: "", changeFrequency: "daily", priority: 1.0 },
    { path: "/select-questions", changeFrequency: "daily", priority: 0.95 },
    { path: "/quick-paper", changeFrequency: "daily", priority: 0.95 },
    { path: "/paper-editor", changeFrequency: "weekly", priority: 0.9 },
    { path: "/pricing", changeFrequency: "weekly", priority: 0.85 },
    { path: "/register", changeFrequency: "monthly", priority: 0.75 },
    { path: "/login", changeFrequency: "monthly", priority: 0.65 },
    ...SEO_LANDINGS.map((l) => ({
      path: `/paper-maker/${l.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
  ];

  return routes.map((route) => {
    const fullUrl = `${baseUrl}${route.path}`;
    return {
      url: fullUrl,
      lastModified: now,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
      images: [ogImage],
      alternates: {
        languages: {
          "en-PK": fullUrl,
          "ur-PK": fullUrl,
        },
      },
    };
  });
}

