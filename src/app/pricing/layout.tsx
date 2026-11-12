import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site-url";

const siteUrl = SITE_URL;

export const metadata: Metadata = {
  title: "School & Academy Subscription Plans – Unlimited Online Paper Maker",
  description:
    "Subscribe to PaperWala for Rs. 2,000/month (50% OFF). Generate unlimited BISE & FBISE board-pattern exam papers with custom school logo, Urdu Nastaliq, PDF & Word export.",
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
    title: "School & Academy Subscription – Unlimited Paper Maker | PaperWala",
    description:
      "Get unlimited board-pattern exam paper generation for Pakistani schools, colleges, and coaching academies for Rs. 2,000/month (50% OFF).",
    url: "/pricing",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "PaperWala School & Academy Subscription Plans",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "School & Academy Subscription – Unlimited Paper Maker | PaperWala",
    description:
      "Subscribe to PaperWala for Rs. 2,000/month (50% OFF). Generate unlimited BISE & FBISE board-pattern exam papers with custom school logo, PDF & Word export.",
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
      "name": "School & Academy Subscription Plans – PaperWala Online Paper Maker",
      "description":
        "Unlimited online paper making subscription for Pakistani schools, colleges, and coaching academies at Rs. 2,000/month (50% OFF).",
      "mainEntity": {
        "@type": "OfferCatalog",
        "name": "PaperWala Educator & School Subscription Plans",
        "itemListElement": [
          {
            "@type": "Offer",
            "name": "Monthly Unlimited Educator Plan",
            "description":
              "Unlimited board-pattern exam papers, AI Quick Paper Maker, Bilingual translator, custom school header & Word/PDF export for 30 days.",
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
