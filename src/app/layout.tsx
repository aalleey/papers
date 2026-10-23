import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Noto_Nastaliq_Urdu } from "next/font/google";
import "katex/dist/katex.min.css";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const notoNastaliqUrdu = Noto_Nastaliq_Urdu({
  variable: "--font-urdu",
  subsets: ["arabic"],
  weight: ["400", "700"],
  display: "swap",
});

const siteUrl =
  process.env.APP_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://paperwala.world");

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#059669" },
    { media: "(prefers-color-scheme: dark)", color: "#064e3b" },
  ],
  colorScheme: "light",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "PaperWala – #1 Online Paper Maker & Board Exam Studio",
    template: "%s | PaperWala – Online Paper Maker",
  },
  description:
    "Create BISE & FBISE board-pattern exam papers online in 60 seconds. #1 paper maker for 9th, 10th, FSc & ICS with Bilingual Urdu Nastaliq, PDF & Word export.",
  keywords: [
    "online paper maker",
    "online paper generator",
    "paper making website",
    "board pattern paper maker",
    "online test maker Pakistan",
    "PaperWala",
    "Paper Wala",
    "paperwala.world",
    "پیپر والا",
    "آن لائن پیپر بنانے والی ویب سائٹ",
    "Pakistani exam generator",
    "matric paper maker online",
    "9th class online paper maker",
    "10th class board pattern paper generator",
    "1st year 2nd year test generator",
    "FSc ICS online paper maker",
    "Punjab board exam paper maker",
    "BISE Lahore paper generator",
    "BISE Gujranwala paper maker",
    "BISE Rawalpindi test maker",
    "BISE Faisalabad paper generator",
    "BISE Multan paper maker",
    "BISE Sargodha paper generator",
    "BISE Bahawalpur paper maker",
    "BISE DG Khan test generator",
    "BISE Sahiwal paper maker",
    "FBISE paper generator",
    "Federal board online paper maker",
    "SLO based paper generator FBISE",
    "Urdu Nastaliq test maker without InPage",
    "bilingual English Urdu exam paper generator",
    "AI English to Urdu exam paper translator",
    "download exam paper in Word docx",
    "1 page exam paper maker PDF",
    "school exam software Pakistan",
    "OMR bubble sheet generator",
    "Pakistani academy test generator",
    "chapter wise test maker 9th 10th",
  ],
  authors: [{ name: "PaperWala Education Systems", url: siteUrl }],
  creator: "PaperWala Education Systems",
  publisher: "PaperWala",
  applicationName: "PaperWala – Online Paper Maker",
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  category: "education",
  classification: "Educational Software & Online Exam Generator",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: "/manifest.webmanifest",
  alternates: {
    canonical: "/",
    languages: {
      "en-PK": "/",
      "ur-PK": "/",
      "en-US": "/",
      "x-default": "/",
    },
  },
  appleWebApp: {
    capable: true,
    title: "PaperWala",
    statusBarStyle: "default",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_PK",
    alternateLocale: ["ur_PK", "en_US"],
    url: siteUrl,
    siteName: "PaperWala",
    title: "PaperWala – #1 Online Paper Maker & Board Exam Studio",
    description:
      "Create BISE & FBISE board-pattern exam papers online in 60 seconds. #1 paper maker for 9th, 10th, FSc & ICS with Bilingual Urdu Nastaliq, PDF & Word export.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "PaperWala – #1 Online Paper Maker & Board Pattern Exam Generator for 9th, 10th, 1st Year & 2nd Year",
        type: "image/png",
      },
    ],
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    yandex: process.env.YANDEX_VERIFICATION,
    other: process.env.BING_SITE_VERIFICATION
      ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION }
      : undefined,
  },
  twitter: {
    card: "summary_large_image",
    site: "@PaperWalaPK",
    creator: "@PaperWalaPK",
    title: "PaperWala – #1 Online Paper Maker & Board Exam Studio",
    description:
      "Create BISE & FBISE board-pattern exam papers online in 60 seconds. #1 paper maker for 9th, 10th, FSc & ICS with Bilingual Urdu Nastaliq, PDF & Word export.",
    images: [
      {
        url: "/twitter-image",
        width: 1200,
        height: 630,
        alt: "PaperWala – #1 Online Paper Maker & Board Exam Studio",
      },
    ],
  },
};

const rootJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      "url": siteUrl,
      "name": "PaperWala – #1 Online Paper Maker & Board Exam Studio",
      "alternateName": [
        "PaperWala",
        "Paper Wala",
        "پیپر والا",
        "Online Paper Maker Pakistan",
        "BISE & FBISE Board Pattern Paper Generator",
      ],
      "description":
        "Create BISE & FBISE board-pattern exam papers online in 60 seconds. #1 paper maker for 9th, 10th, FSc & ICS with Bilingual Urdu Nastaliq, PDF & Word export.",
      "publisher": {
        "@id": `${siteUrl}/#organization`,
      },
      "inLanguage": ["en-PK", "ur-PK"],
      "potentialAction": [
        {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": `${siteUrl}/select-questions?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      ],
    },
    {
      "@type": "WebApplication",
      "@id": `${siteUrl}/#webapp`,
      "name": "PaperWala – Online Paper Maker & Board Pattern Exam Generator",
      "url": siteUrl,
      "applicationCategory": "EducationalApplication",
      "applicationSubCategory": "Assessment & Exam Paper Generator",
      "operatingSystem": "All",
      "browserRequirements": "Requires JavaScript. Works on Chrome, Edge, Safari, Firefox, Android & iOS.",
      "inLanguage": ["en-PK", "ur-PK"],
      "isAccessibleForFree": true,
      "image": `${siteUrl}/opengraph-image`,
      "screenshot": `${siteUrl}/opengraph-image`,
      "description":
        "Online paper making application for schools, colleges, and coaching academies in Pakistan. Generate board-pattern MCQs, Short Questions, and Long Questions in English, Urdu Nastaliq, and Bilingual formats with 1-page PDF print and editable Microsoft Word (.docx) export.",
      "featureList": [
        "All 9 Punjab Boards (BISE Lahore, Gujranwala, Rawalpindi, Faisalabad, Multan, Sargodha, Bahawalpur, DG Khan, Sahiwal) & FBISE Islamabad Official Board Pattern",
        "Complete 9th, 10th, 1st Year (11th), and 2nd Year (12th) Syllabus Question Bank",
        "AI Topic Search, AI Quick Paper Maker, Vision OCR Scanner, and 1-Click Bilingual English-Urdu Converter",
        "Editable Microsoft Word (.docx) Download & 1-Page Auto-Fit A4 PDF Print",
        "Anti-Cheating Shuffled Paper Versions A, B, C, D with OMR Bubble Sheets and Automatic Teacher Answer Keys",
      ],
      "offers": {
        "@type": "AggregateOffer",
        "lowPrice": "30",
        "highPrice": "2000",
        "priceCurrency": "PKR",
        "offerCount": "3",
        "offers": [
          {
            "@type": "Offer",
            "name": "Pay As You Go Single Paper Credit",
            "price": "30",
            "priceCurrency": "PKR",
            "availability": "https://schema.org/InStock",
            "url": `${siteUrl}/pricing`,
          },
          {
            "@type": "Offer",
            "name": "Standard Monthly Unlimited Educator Plan",
            "price": "2000",
            "priceCurrency": "PKR",
            "availability": "https://schema.org/InStock",
            "url": `${siteUrl}/pricing`,
          },
        ],
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "ratingCount": "1480",
        "bestRating": "5",
        "worstRating": "1",
      },
    },
    {
      "@type": "EducationalOrganization",
      "@id": `${siteUrl}/#organization`,
      "name": "PaperWala Education Systems",
      "alternateName": ["PaperWala PK", "پیپر والا"],
      "url": siteUrl,
      "logo": {
        "@type": "ImageObject",
        "url": `${siteUrl}/icon`,
        "width": 64,
        "height": 64,
      },
      "image": `${siteUrl}/opengraph-image`,
      "knowsLanguage": ["en", "ur"],
      "areaServed": {
        "@type": "Country",
        "name": "Pakistan",
      },
    },
    {
      "@type": "ItemList",
      "@id": `${siteUrl}/#sitelinks`,
      "name": "PaperWala Main Navigation & Online Paper Making Tools",
      "itemListElement": [
        {
          "@type": "SiteNavigationElement",
          "position": 1,
          "name": "Board Question Bank (9th, 10th, 1st & 2nd Year)",
          "description": "Select chapter-wise MCQs, Short & Long questions with AI topic search and 1-click board pattern.",
          "url": `${siteUrl}/select-questions`,
        },
        {
          "@type": "SiteNavigationElement",
          "position": 2,
          "name": "AI Quick Paper Maker & OCR Scanner",
          "description": "Generate board-pattern papers from any topic, photo scan (OCR), or raw text with Urdu-English translation.",
          "url": `${siteUrl}/quick-paper`,
        },
        {
          "@type": "SiteNavigationElement",
          "position": 3,
          "name": "Live Paper Editor, Word (.docx) & 1-Page PDF Studio",
          "description": "Customize school header, logo, Paper Codes A/B/C/D, OMR bubbles, bilingual conversion, and Word export.",
          "url": `${siteUrl}/paper-editor`,
        },
        {
          "@type": "SiteNavigationElement",
          "position": 4,
          "name": "School & Academy Subscription Plans",
          "description": "Affordable Rs. 30 Pay-As-You-Go and Rs. 2,000/month Unlimited Paper Generation plans.",
          "url": `${siteUrl}/pricing`,
        },
      ],
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${siteUrl}/#breadcrumb`,
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Online Paper Maker Home",
          "item": siteUrl,
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Board Pattern Question Bank",
          "item": `${siteUrl}/select-questions`,
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "AI Quick Paper Maker & Word Export",
          "item": `${siteUrl}/quick-paper`,
        },
        {
          "@type": "ListItem",
          "position": 4,
          "name": "Live Paper Studio & Print",
          "item": `${siteUrl}/paper-editor`,
        },
        {
          "@type": "ListItem",
          "position": 5,
          "name": "Educator Pricing Plans",
          "item": `${siteUrl}/pricing`,
        },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} ${notoNastaliqUrdu.variable} h-full antialiased`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(rootJsonLd) }}
        />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900"
      >
        {children}
      </body>
    </html>
  );
}

