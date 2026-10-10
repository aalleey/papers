import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://paperwala.pk";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/select-questions", "/paper-editor"],
        disallow: ["/api/", "/admin/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
