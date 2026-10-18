import type { Metadata } from "next";

const siteUrl =
  process.env.APP_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://paperwala.world");

export const metadata: Metadata = {
  title: "AI Quick Paper Maker – Paste, OCR Scan & Export Board Papers",
  description:
    "Create board-pattern exam papers instantly from any topic, image (OCR), or raw text. Translate between English & Urdu Nastaliq and export Word (.docx) or PDF.",
  keywords: [
    "AI online paper maker",
    "quick paper maker online",
    "board pattern test generator",
    "exam paper maker in Word docx",
    "Urdu English bilingual paper maker",
    "OCR exam scanner Pakistan",
    "photo to exam paper generator",
    "AI topic to test generator",
  ],
  alternates: {
    canonical: "/quick-paper",
    languages: {
      "en-PK": "/quick-paper",
      "ur-PK": "/quick-paper",
    },
  },
  openGraph: {
    type: "website",
    locale: "en_PK",
    siteName: "PaperWala",
    title: "AI Quick Paper Maker – Paste, OCR Scan & Export | PaperWala",
    description:
      "Generate, scan (OCR), translate, and format board-pattern exam papers in English & Urdu. Download editable Word (.docx) or print 1-page A4 PDF.",
    url: "/quick-paper",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "PaperWala AI Quick Paper Maker & OCR Exam Scanner",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Quick Paper Maker – Paste, OCR Scan & Export | PaperWala",
    description:
      "Create board-pattern exam papers instantly from any topic, image (OCR), or raw text. Translate between English & Urdu Nastaliq and export Word (.docx) or PDF.",
    images: ["/twitter-image"],
  },
};

const quickPaperJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": `${siteUrl}/quick-paper#app`,
      "name": "PaperWala AI Quick Paper Maker & OCR Exam Scanner",
      "url": `${siteUrl}/quick-paper`,
      "applicationCategory": "EducationalApplication",
      "operatingSystem": "All",
      "description":
        "Create board-pattern exam papers instantly from any topic, image (OCR), or raw text. Translate between English & Urdu Nastaliq and export Word (.docx) or 1-page A4 PDF.",
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
          "name": "AI Quick Paper Maker & OCR Scanner",
          "item": `${siteUrl}/quick-paper`,
        },
      ],
    },
  ],
};

export default function QuickPaperLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(quickPaperJsonLd) }}
      />
      {children}
    </>
  );
}

