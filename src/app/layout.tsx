import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Noto_Nastaliq_Urdu } from "next/font/google";
import "katex/dist/katex.min.css";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const notoNastaliqUrdu = Noto_Nastaliq_Urdu({
  variable: "--font-urdu",
  subsets: ["arabic"],
  weight: ["400", "700"],
});

const siteUrl =
  process.env.APP_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://paperwala.world");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "PaperWala – #1 Online Paper Maker & Board Pattern Exam Generator",
    template: "%s | PaperWala – Online Paper Maker",
  },
  description:
    "Create board-pattern exam papers online in 60 seconds. #1 online paper maker for 9th, 10th, FSc & ICS (Punjab BISE & FBISE) with Urdu Nastaliq, PDF & Word export.",
  keywords: [
    "online paper maker",
    "online paper generator",
    "paper making website",
    "board pattern paper maker",
    "online test maker Pakistan",
    "PaperWala",
    "Paper Wala",
    "پیپر والا",
    "آن لائن پیپر بنانے والی ویب سائٹ",
    "Pakistani exam generator",
    "matric paper maker online",
    "9th class online paper maker",
    "10th class board pattern paper generator",
    "1st year 2nd year test generator",
    "Punjab board exam paper maker",
    "BISE Lahore paper generator",
    "BISE Gujranwala paper maker",
    "BISE Rawalpindi test maker",
    "BISE Faisalabad paper generator",
    "BISE Multan paper maker",
    "FBISE paper generator",
    "Federal board online paper maker",
    "Urdu Nastaliq test maker without InPage",
    "bilingual English Urdu exam paper generator",
    "download exam paper in Word docx",
    "school exam software Pakistan",
    "OMR bubble sheet generator",
    "Pakistani academy test generator",
  ],
  authors: [{ name: "PaperWala Education Systems", url: siteUrl }],
  creator: "PaperWala Education Systems",
  publisher: "PaperWala",
  applicationName: "PaperWala – Online Paper Maker",
  category: "education",
  alternates: {
    canonical: "/",
    languages: {
      "en-PK": "/",
      "ur-PK": "/",
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
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
    title: "PaperWala – #1 Online Paper Maker & Board Pattern Exam Generator",
    description:
      "Create board-pattern exam papers online in 60 seconds. #1 online paper maker for 9th, 10th, FSc & ICS (Punjab BISE & FBISE) with Urdu Nastaliq, PDF & Word export.",
  },
  twitter: {
    card: "summary_large_image",
    title: "PaperWala – #1 Online Paper Maker & Board Pattern Exam Generator",
    description:
      "Create board-pattern exam papers online in 60 seconds. #1 online paper maker for 9th, 10th, FSc & ICS (Punjab BISE & FBISE) with Urdu Nastaliq, PDF & Word export.",
  },
};

const rootJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      "url": siteUrl,
      "name": "PaperWala – Online Paper Maker & Board Pattern Exam Generator",
      "alternateName": ["PaperWala", "Paper Wala", "پیپر والا", "Online Paper Maker Pakistan"],
      "description":
        "Create board-pattern exam papers online in 60 seconds for 9th, 10th, 1st Year & 2nd Year across all Punjab Boards (BISE) and Federal Board (FBISE).",
      "inLanguage": ["en-PK", "ur-PK"],
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${siteUrl}/select-questions?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "WebApplication",
      "@id": `${siteUrl}/#webapp`,
      "name": "PaperWala – Online Paper Maker & Board Pattern Exam Generator",
      "url": siteUrl,
      "applicationCategory": "EducationalApplication",
      "operatingSystem": "All",
      "browserRequirements": "Requires JavaScript. Works on Chrome, Edge, Safari, Firefox, Android & iOS.",
      "description":
        "Online paper making application for schools, colleges, and coaching academies. Generate board-pattern MCQs, Short Questions, and Long Questions in English, Urdu Nastaliq, and Bilingual formats with 1-page PDF print and editable Microsoft Word (.docx) export.",
      "featureList": [
        "Punjab Boards (BISE Lahore, Gujranwala, Rawalpindi, Faisalabad, Multan, Sargodha, Bahawalpur, DG Khan, Sahiwal) & FBISE Islamabad Board Pattern",
        "9th, 10th, 1st Year (11th), and 2nd Year (12th) Syllabus Question Bank",
        "AI Instant Topic Paper Maker, Vision OCR Scanner, and Bilingual English-Urdu Translator",
        "Editable Microsoft Word (.docx) Download & 1-Page Auto-Fit A4 PDF Print",
        "Paper Versions A, B, C, D with OMR Bubble Sheets and Automatic Answer Keys",
      ],
      "offers": {
        "@type": "AggregateOffer",
        "lowPrice": "30",
        "highPrice": "2000",
        "priceCurrency": "PKR",
        "offerCount": "3",
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
      "url": siteUrl,
      "areaServed": {
        "@type": "Country",
        "name": "Pakistan",
      },
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
