import type { Metadata } from "next";

const siteUrl =
  process.env.APP_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://paperwala.world");

export const metadata: Metadata = {
  title: "Live Board Paper Editor, AI Bilingual & Word/PDF Print Studio",
  description:
    "Customize school exam headers, Paper Codes (A/B/C/D), OMR bubble sheets & AI English-Urdu conversion. Export editable Word (.docx) or 1-page A4 PDF.",
  keywords: [
    "board pattern paper editor",
    "custom school header exam maker",
    "OMR bubble sheet paper generator",
    "version A B C D paper maker",
    "download board paper in Word docx",
    "convert English paper to Urdu AI",
    "convert Urdu paper to English AI",
    "1 page exam print studio",
  ],
  alternates: {
    canonical: "/paper-editor",
    languages: {
      "en-PK": "/paper-editor",
      "ur-PK": "/paper-editor",
    },
  },
  openGraph: {
    type: "website",
    locale: "en_PK",
    siteName: "PaperWala",
    title: "Live Board Paper Editor, AI Bilingual & Print Studio | PaperWala",
    description:
      "Customize school exam headers, Paper Codes (A/B/C/D), OMR bubble sheets & AI English-Urdu conversion. Export editable Word (.docx) or 1-page A4 PDF.",
    url: "/paper-editor",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "PaperWala Live Board Paper Editor & Print Studio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Live Board Paper Editor, AI Bilingual & Print Studio | PaperWala",
    description:
      "Customize school exam headers, Paper Codes (A/B/C/D), OMR bubble sheets & AI English-Urdu conversion. Export editable Word (.docx) or 1-page A4 PDF.",
    images: ["/twitter-image"],
  },
};

const paperEditorJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": `${siteUrl}/paper-editor#app`,
      "name": "PaperWala Live Board Pattern Paper Editor & Print Studio",
      "url": `${siteUrl}/paper-editor`,
      "applicationCategory": "EducationalApplication",
      "operatingSystem": "All",
      "description":
        "Customize school and academy exam headers, Paper Codes (A/B/C/D), OMR bubble sheets, and AI bilingual Urdu/English conversion. Export to editable Word (.docx) or 1-page A4 PDF.",
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": siteUrl,
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Live Paper Editor & Print Studio",
          "item": `${siteUrl}/paper-editor`,
        },
      ],
    },
  ],
};

export default function PaperEditorLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(paperEditorJsonLd) }}
      />
      {children}
    </>
  );
}

