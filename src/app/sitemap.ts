import { MetadataRoute } from "next";
import { SEO_LANDINGS } from "@/lib/seo-landings";
import { getNotesCatalog } from "@/lib/notes";
import { SITE_URL } from "@/lib/site-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL;
  const now = new Date();
  const ogImage = `${baseUrl}/opengraph-image`;

  const notesRoutes: Array<{
    path: string;
    changeFrequency: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
    priority: number;
  }> = [{ path: "/notes", changeFrequency: "daily", priority: 0.92 }];

  try {
    const catalog = await getNotesCatalog();
    for (const cls of catalog.classes) {
      for (const subj of cls.subjects) {
        notesRoutes.push({
          path: `/notes/${subj.classSlug}/${subj.slug}`,
          changeFrequency: "weekly",
          priority: 0.88,
        });
        for (const ch of subj.chapters) {
          notesRoutes.push({
            path: `/notes/${ch.classSlug}/${ch.subjectSlug}/${ch.slug}`,
            changeFrequency: "weekly",
            priority: 0.85,
          });
        }
      }
    }
  } catch (err) {
    console.error("Failed to build dynamic /notes sitemap routes:", err);
  }

  const routes: Array<{
    path: string;
    changeFrequency: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
    priority: number;
  }> = [
    { path: "", changeFrequency: "daily", priority: 1.0 },
    { path: "/select-questions", changeFrequency: "daily", priority: 0.95 },
    { path: "/quick-paper", changeFrequency: "daily", priority: 0.95 },
    { path: "/paper-editor", changeFrequency: "weekly", priority: 0.9 },
    { path: "/paper-maker", changeFrequency: "weekly", priority: 0.9 },
    { path: "/pricing", changeFrequency: "weekly", priority: 0.85 },
    { path: "/register", changeFrequency: "monthly", priority: 0.75 },
    { path: "/login", changeFrequency: "monthly", priority: 0.65 },
    ...SEO_LANDINGS.map((l) => ({
      path: `/paper-maker/${l.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
    ...notesRoutes,
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
