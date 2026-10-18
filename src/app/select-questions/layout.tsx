import type { Metadata } from "next";

const siteUrl =
  process.env.APP_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://paperwala.world");

export const metadata: Metadata = {
  title: "Board Question Bank – 9th, 10th, FSc & ICS Paper Maker",
  description:
    "Select chapter-wise MCQs, Short & Long questions for Punjab BISE and Federal FBISE boards. Build custom bilingual exam papers online in 60 seconds.",
  keywords: [
    "9th class online paper maker",
    "10th class board pattern paper generator",
    "1st year 2nd year test maker",
    "BISE Lahore question bank",
    "FBISE board pattern paper maker",
    "chapter wise test generator Pakistan",
    "AI topic search exam questions",
    "matric FSc ICS question bank online",
  ],
  alternates: {
    canonical: "/select-questions",
    languages: {
      "en-PK": "/select-questions",
      "ur-PK": "/select-questions",
    },
  },
  openGraph: {
    type: "website",
    locale: "en_PK",
    siteName: "PaperWala",
    title: "Board Question Bank – 9th, 10th, FSc & ICS | PaperWala",
    description:
      "Select chapter-wise MCQs, Short & Long questions for Punjab Boards (BISE) and Federal Board (FBISE). Build custom bilingual exam papers in 60 seconds.",
    url: "/select-questions",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "PaperWala Board Pattern Question Bank – 9th, 10th, 1st & 2nd Year",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Board Question Bank – 9th, 10th, FSc & ICS | PaperWala",
    description:
      "Select chapter-wise MCQs, Short & Long questions for Punjab BISE and Federal FBISE boards. Build custom bilingual exam papers online in 60 seconds.",
    images: ["/twitter-image"],
  },
};

const selectQuestionsJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      "@id": `${siteUrl}/select-questions#webpage`,
      "url": `${siteUrl}/select-questions`,
      "name": "Board Question Bank – 9th, 10th, FSc & ICS Paper Maker | PaperWala",
      "description":
        "Select chapter-wise MCQs, Short & Long questions for Punjab BISE and Federal FBISE boards. Build custom bilingual exam papers online in 60 seconds.",
      "inLanguage": ["en-PK", "ur-PK"],
      "isPartOf": { "@id": `${siteUrl}/#website` },
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
          "name": "Board Pattern Question Bank",
          "item": `${siteUrl}/select-questions`,
        },
      ],
    },
  ],
};

export default function SelectQuestionsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(selectQuestionsJsonLd) }}
      />
      {children}
    </>
  );
}

