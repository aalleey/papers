import type { Metadata } from "next";

const siteUrl =
  process.env.APP_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://paperwala.world");

export const metadata: Metadata = {
  title: "School & Academy Pricing – Unlimited Online Paper Maker",
  description:
    "Affordable online paper making plans for Pakistani schools, colleges & academies. Start at Rs. 30 per paper or Rs. 2,000/month unlimited board papers.",
  keywords: [
    "online paper maker pricing Pakistan",
    "school exam software price",
    "academy test generator subscription",
    "unlimited paper generator Pakistan",
    "PaperWala subscription plans",
  ],
  alternates: {
    canonical: "/pricing",
    languages: {
      "en-PK": "/pricing",
      "ur-PK": "/pricing",
    },
  },
  openGraph: {
    type: "website",
    locale: "en_PK",
    siteName: "PaperWala",
    title: "School & Academy Pricing – Unlimited Paper Maker | PaperWala",
    description:
      "Affordable online paper making plans for Pakistani schools, colleges, and coaching academies. Start at Rs. 30 per paper or Rs. 2,000/month unlimited.",
    url: "/pricing",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "PaperWala School & Academy Pricing Plans",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "School & Academy Pricing – Unlimited Paper Maker | PaperWala",
    description:
      "Affordable online paper making plans for Pakistani schools, colleges & academies. Start at Rs. 30 per paper or Rs. 2,000/month unlimited board papers.",
    images: ["/twitter-image"],
  },
};

const pricingJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${siteUrl}/pricing#webpage`,
      "url": `${siteUrl}/pricing`,
      "name": "School & Academy Pricing Plans – PaperWala Online Paper Maker",
      "description":
        "Affordable online paper making plans for Pakistani schools, colleges, and coaching academies. Start with Rs. 30 per paper or Rs. 2,000/month unlimited board-pattern papers.",
      "mainEntity": {
        "@type": "OfferCatalog",
        "name": "PaperWala Educator & School Plans",
        "itemListElement": [
          {
            "@type": "Offer",
            "name": "Pay As You Go Plan",
            "description": "Single board-pattern exam paper generation credit with PDF & Word export.",
            "price": "30",
            "priceCurrency": "PKR",
            "availability": "https://schema.org/InStock",
            "url": `${siteUrl}/pricing`,
          },
          {
            "@type": "Offer",
            "name": "Monthly Unlimited Educator Plan",
            "description": "Unlimited board-pattern exam papers, AI Quick Paper Maker, Bilingual translator & Word export for 30 days.",
            "price": "2000",
            "priceCurrency": "PKR",
            "availability": "https://schema.org/InStock",
            "url": `${siteUrl}/pricing`,
          },
        ],
      },
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
          "name": "Pricing Plans",
          "item": `${siteUrl}/pricing`,
        },
      ],
    },
  ],
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingJsonLd) }}
      />
      {children}
    </>
  );
}

