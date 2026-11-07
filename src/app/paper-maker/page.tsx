import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import {
  SEO_LANDINGS,
  SEO_CATEGORY_META,
  SeoLandingCategory,
  getLandingsByCategory,
} from "@/lib/seo-landings";

const siteUrl =
  process.env.APP_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://paperwala.world");

const hubTitle = "All Board, Class & Subject Paper Makers Online | PaperWala";
const hubDescription =
  "Browse PaperWala's dedicated online paper makers for all 9 Punjab BISE boards, FBISE Islamabad, 9th, 10th, 1st Year & 2nd Year classes, and Matric/FSc/ICS subjects.";

export const metadata: Metadata = {
  title: { absolute: hubTitle },
  description: hubDescription,
  keywords: [
    "online paper maker pakistan",
    "bise lahore paper maker",
    "fbise paper maker",
    "9th class paper maker",
    "10th class paper maker",
    "fsc ics paper maker",
    "10th class computer science paper",
    "board pattern paper generator",
  ],
  alternates: {
    canonical: "/paper-maker",
    languages: {
      "en-PK": "/paper-maker",
      "ur-PK": "/paper-maker",
    },
  },
  openGraph: {
    type: "website",
    locale: "en_PK",
    alternateLocale: ["ur_PK", "en_US"],
    siteName: "PaperWala",
    title: hubTitle,
    description: hubDescription,
    url: "/paper-maker",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "PaperWala – Board, Class & Subject Online Paper Makers",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: hubTitle,
    description: hubDescription,
    images: ["/twitter-image"],
  },
};

const CATEGORIES: SeoLandingCategory[] = ["board", "class", "subject", "feature"];

export default function PaperMakerDirectoryPage() {
  const hubUrl = `${siteUrl}/paper-maker`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${hubUrl}#collection`,
        url: hubUrl,
        name: hubTitle,
        description: hubDescription,
        inLanguage: ["en-PK", "ur-PK"],
        isPartOf: { "@type": "WebSite", name: "PaperWala", url: siteUrl },
      },
      {
        "@type": "ItemList",
        name: "PaperWala Board, Class & Subject Paper Makers",
        numberOfItems: SEO_LANDINGS.length,
        itemListElement: SEO_LANDINGS.map((l, idx) => ({
          "@type": "ListItem",
          position: idx + 1,
          name: l.h1,
          url: `${siteUrl}/paper-maker/${l.slug}`,
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
          { "@type": "ListItem", position: 2, name: "Paper Makers", item: hubUrl },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <BrandLogo size="sm" variant="full" />
          <nav
            aria-label="Page navigation"
            className="flex items-center gap-3 sm:gap-5 text-xs font-bold text-slate-600"
          >
            <Link href="/notes" className="hidden sm:inline hover:text-emerald-700 transition-colors">
              Study Notes
            </Link>
            <Link href="/select-questions" className="hidden sm:inline hover:text-emerald-700 transition-colors">
              Question Bank
            </Link>
            <Link href="/quick-paper" className="hidden sm:inline hover:text-emerald-700 transition-colors">
              AI Quick Paper
            </Link>
            <Link href="/pricing" className="hover:text-emerald-700 transition-colors">
              Pricing
            </Link>
            <Link
              href="/login"
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
            >
              Sign In
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-12">
        <nav aria-label="Breadcrumb" className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
          <Link href="/" className="hover:text-emerald-700 hover:underline">
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-slate-800 font-semibold">Paper Makers</span>
        </nav>

        <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 space-y-4 shadow-xs">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Pakistan Board Exam Directory</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900">
            Online Paper Makers by Board, Class &amp; Subject
          </h1>
          <p
            dir="rtl"
            className="font-urdu text-lg sm:text-xl font-bold text-emerald-900 leading-loose"
          >
            پنجاب بورڈز (BISE)، فیڈرل بورڈ (FBISE)، میٹرک اور انٹر کے تمام مضامین کے لیے آن لائن پیپر میکر
          </p>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl">
            Choose your educational board, class level, or subject below to create official board-pattern exam papers in Bilingual English + Urdu Nastaliq with 1-page A4 PDF print and editable Microsoft Word (.docx) export.
          </p>
          <div className="flex flex-wrap gap-3 pt-1">
            <Link
              href="/select-questions"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm"
            >
              <span>Open Question Bank</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/quick-paper"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm"
            >
              <span>AI Quick Paper &amp; OCR</span>
            </Link>
          </div>
        </section>

        {CATEGORIES.map((cat) => {
          const meta = SEO_CATEGORY_META[cat];
          const items = getLandingsByCategory(cat);
          return (
            <section key={cat} className="space-y-4" aria-labelledby={`cat-${cat}`}>
              <div className="space-y-1">
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700">
                  {meta.badge}
                </span>
                <h2 id={`cat-${cat}`} className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                  {meta.title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
                  {meta.description}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/paper-maker/${item.slug}`}
                    className="group p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between gap-3"
                  >
                    <div className="space-y-1.5">
                      <h3 className="font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {item.shortLabel}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                        {item.description}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                      <span>Open {item.shortLabel}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </main>

      <footer className="border-t border-slate-200 bg-white py-8 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            &copy; {new Date().getFullYear()} PaperWala PK. Built for Pakistani Schools, Colleges &amp; Academies.
          </div>
          <div className="flex flex-wrap items-center gap-4 font-semibold text-slate-600">
            <Link href="/" className="hover:text-emerald-700">Home</Link>
            <Link href="/select-questions" className="hover:text-emerald-700">Question Bank</Link>
            <Link href="/quick-paper" className="hover:text-emerald-700">AI Quick Paper</Link>
            <Link href="/paper-editor" className="hover:text-emerald-700">Paper Editor</Link>
            <Link href="/pricing" className="hover:text-emerald-700">Pricing</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
