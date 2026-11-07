import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Layers,
  HelpCircle,
} from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import {
  SEO_LANDINGS,
  SEO_CATEGORY_META,
  SeoLandingCategory,
  getLanding,
  getLandingsByCategory,
} from "@/lib/seo-landings";

const siteUrl =
  process.env.APP_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://paperwala.world");

export const dynamicParams = false;

export function generateStaticParams() {
  return SEO_LANDINGS.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = getLanding(slug);
  if (!page) return {};
  const path = `/paper-maker/${page.slug}`;
  const fullTitle = `${page.title} | PaperWala`;

  return {
    title: { absolute: fullTitle },
    description: page.description,
    keywords: page.keywords,
    alternates: {
      canonical: path,
      languages: {
        "en-PK": path,
        "ur-PK": path,
      },
    },
    openGraph: {
      type: "website",
      locale: "en_PK",
      alternateLocale: ["ur_PK", "en_US"],
      siteName: "PaperWala",
      title: fullTitle,
      description: page.description,
      url: path,
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: page.h1 }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: page.description,
      images: ["/twitter-image"],
    },
  };
}

const CATEGORY_ORDER: SeoLandingCategory[] = ["board", "class", "subject", "feature"];

export default async function SeoLandingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = getLanding(slug);
  if (!page) notFound();

  const url = `${siteUrl}/paper-maker/${page.slug}`;
  const hubUrl = `${siteUrl}/paper-maker`;
  const catMeta = SEO_CATEGORY_META[page.category];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: `${page.title} | PaperWala`,
        description: page.description,
        inLanguage: ["en-PK", "ur-PK"],
        isPartOf: { "@type": "WebSite", name: "PaperWala", url: siteUrl },
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${url}#app`,
        name: `PaperWala – ${page.shortLabel}`,
        url,
        applicationCategory: "EducationalApplication",
        operatingSystem: "All (Web Browser, Windows, macOS, Android, iOS)",
        description: page.description,
        offers: {
          "@type": "AggregateOffer",
          lowPrice: "30",
          highPrice: "2000",
          priceCurrency: "PKR",
          offerCount: "2",
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
          { "@type": "ListItem", position: 2, name: "Paper Makers", item: hubUrl },
          { "@type": "ListItem", position: 3, name: page.shortLabel, item: url },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: page.faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };

  const primaryHref = page.primaryCtaHref || "/select-questions";
  const primaryLabel = page.primaryCtaLabel || "Start Making a Paper";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header */}
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <BrandLogo size="sm" variant="full" />
          <nav
            aria-label="Page navigation"
            className="flex items-center gap-3 sm:gap-5 text-xs font-bold text-slate-600"
          >
            <Link href="/paper-maker" className="hidden sm:inline hover:text-emerald-700 transition-colors">
              All Boards &amp; Subjects
            </Link>
            <Link href="/quick-paper" className="hidden md:inline hover:text-emerald-700 transition-colors">
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

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-12">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="text-xs font-medium text-slate-500 flex flex-wrap items-center gap-1.5">
          <Link href="/" className="hover:text-emerald-700 hover:underline">
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <Link href="/paper-maker" className="hover:text-emerald-700 hover:underline">
            Paper Makers
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-slate-800 font-semibold">{page.shortLabel}</span>
        </nav>

        {/* Hero Card */}
        <section className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-10 space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>{catMeta.badge} &bull; 2026–27 Syllabus Ready</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-[40px] font-black tracking-tight text-slate-900 leading-[1.18]">
            {page.h1}
          </h1>

          {page.urduSubtitle && (
            <p
              dir="rtl"
              className="font-urdu text-lg sm:text-xl font-bold text-emerald-900 leading-loose bg-emerald-50/60 border border-emerald-100 rounded-2xl px-4 py-2.5"
            >
              {page.urduSubtitle}
            </p>
          )}

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl">
            {page.intro}
          </p>

          {/* Key Specs Strip */}
          {page.highlights && page.highlights.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
              {page.highlights.map((h) => (
                <div
                  key={h.label}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-0.5"
                >
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    {h.label}
                  </div>
                  <div className="text-xs font-extrabold text-slate-900 leading-snug">
                    {h.value}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href={primaryHref}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm shadow-sm transition-all"
            >
              <span>{primaryLabel}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href={primaryHref === "/quick-paper" ? "/select-questions" : "/quick-paper"}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white border border-slate-300 hover:border-emerald-300 hover:bg-emerald-50/40 text-slate-800 font-bold text-sm transition-colors"
            >
              <span>
                {primaryHref === "/quick-paper"
                  ? "Browse Question Bank"
                  : "AI Quick Paper & OCR"}
              </span>
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl text-xs font-bold text-emerald-800 hover:underline"
            >
              <span>Plans from Rs. 30 / paper</span>
            </Link>
          </div>
        </section>

        {/* Key Features */}
        <section className="space-y-4" aria-labelledby="features-heading">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <h2 id="features-heading" className="text-xl sm:text-2xl font-black tracking-tight">
              What You Get with PaperWala
            </h2>
          </div>
          <ul className="grid sm:grid-cols-2 gap-3.5">
            {page.points.map((p) => (
              <li
                key={p}
                className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-start gap-3 text-sm font-medium text-slate-700 leading-relaxed"
              >
                <span className="mt-0.5 w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-black text-xs flex items-center justify-center shrink-0">
                  ✓
                </span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Board / Class / Subject Specific Deep-Dive */}
        {page.syllabusDetails && (
          <section
            className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-4 shadow-xs"
            aria-labelledby="syllabus-details-heading"
          >
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-600 shrink-0" />
              <h2
                id="syllabus-details-heading"
                className="text-xl sm:text-2xl font-black tracking-tight text-slate-900"
              >
                {page.syllabusDetails.heading}
              </h2>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              {page.syllabusDetails.body}
            </p>
            <ul className="space-y-2.5 pt-1">
              {page.syllabusDetails.items.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 leading-relaxed"
                >
                  <span className="text-emerald-600 font-black mt-0.5">&bull;</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* How It Works */}
        <section className="space-y-4" aria-labelledby="workflow-heading">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-600 shrink-0" />
            <h2 id="workflow-heading" className="text-xl sm:text-2xl font-black tracking-tight">
              How to Create Your Exam Paper in 60 Seconds
            </h2>
          </div>
          <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {[
              {
                step: "1",
                title: "Choose Syllabus or AI",
                desc: "Pick chapters from the Question Bank or enter/scan any topic in AI Quick Paper.",
              },
              {
                step: "2",
                title: "Apply Board Pattern",
                desc: "Auto-select balanced MCQs, Short Questions, and Long Questions with official marks.",
              },
              {
                step: "3",
                title: "Add School Branding",
                desc: "Apply your saved school/academy crest, bilingual Urdu/English mode, and Paper Codes A–D.",
              },
              {
                step: "4",
                title: "Export PDF or Word",
                desc: "Print a 1-page A4 PDF or download an editable Microsoft Word (.docx) with answer keys.",
              },
            ].map((s) => (
              <li
                key={s.step}
                className="p-4 rounded-2xl bg-white border border-slate-200/90 space-y-1.5"
              >
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-emerald-600 text-white text-xs font-black">
                  {s.step}
                </span>
                <h3 className="font-extrabold text-sm text-slate-900">{s.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{s.desc}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Visible FAQs (All Answers Rendered in HTML for Crawlers & Teachers) */}
        <section className="space-y-4" aria-labelledby="faq-heading">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <h2 id="faq-heading" className="text-xl sm:text-2xl font-black tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="space-y-3">
            {page.faqs.map((f) => (
              <article
                key={f.q}
                className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs"
              >
                <h3 className="font-extrabold text-sm text-slate-900">{f.q}</h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                  {f.a}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* Categorized Internal Linking Directory */}
        <section
          className="pt-6 border-t border-slate-200 space-y-6"
          aria-labelledby="more-makers-heading"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h2 id="more-makers-heading" className="text-lg sm:text-xl font-black tracking-tight">
              Explore Board, Class &amp; Subject Paper Makers
            </h2>
            <Link
              href="/paper-maker"
              className="text-xs font-bold text-emerald-700 hover:underline"
            >
              View Complete Directory →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CATEGORY_ORDER.map((cat) => {
              const items = getLandingsByCategory(cat).filter((l) => l.slug !== page.slug);
              if (items.length === 0) return null;
              return (
                <div
                  key={cat}
                  className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 space-y-2.5"
                >
                  <h3 className="text-xs font-black uppercase tracking-wider text-emerald-800">
                    {SEO_CATEGORY_META[cat].title}
                  </h3>
                  <ul className="flex flex-wrap gap-1.5">
                    {items.map((o) => (
                      <li key={o.slug}>
                        <Link
                          href={`/paper-maker/${o.slug}`}
                          className="inline-block px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-emerald-50 border border-slate-200/80 hover:border-emerald-200 text-xs font-semibold text-slate-700 hover:text-emerald-800 transition-colors"
                        >
                          {o.shortLabel}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white py-8 text-xs text-slate-500">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            &copy; {new Date().getFullYear()} PaperWala PK. Online Paper Maker for BISE &amp; FBISE Schools and Academies.
          </div>
          <div className="flex flex-wrap items-center gap-4 font-semibold text-slate-600">
            <Link href="/" className="hover:text-emerald-700">Home</Link>
            <Link href="/paper-maker" className="hover:text-emerald-700">All Paper Makers</Link>
            <Link href="/select-questions" className="hover:text-emerald-700">Question Bank</Link>
            <Link href="/quick-paper" className="hover:text-emerald-700">AI Quick Paper</Link>
            <Link href="/pricing" className="hover:text-emerald-700">Pricing</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
