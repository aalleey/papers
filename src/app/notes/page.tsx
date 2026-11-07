import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Sparkles, Layers } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { getNotesCatalog } from "@/lib/notes";

export const dynamic = "force-dynamic";

const siteUrl =
  process.env.APP_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://paperwala.world");

const pageTitle = "Study Notes, Solved MCQs & Chapter-Wise Questions | PaperWala";
const pageDescription =
  "Chapter-wise solved MCQs, exercise & extra short questions, and long questions for 9th, 10th, FSc & ICS (2026-27 Punjab BISE & FBISE syllabus) in English & Urdu.";

export const metadata: Metadata = {
  title: { absolute: pageTitle },
  description: pageDescription,
  keywords: [
    "10th class computer science chapter wise questions",
    "python programming 10th class mcqs",
    "operating system 10th class short questions",
    "10th class math notes",
    "matric solved mcqs pakistan",
    "2026-27 new syllabus notes",
    "chapter wise question bank pakistan",
  ],
  alternates: {
    canonical: "/notes",
    languages: {
      "en-PK": "/notes",
      "ur-PK": "/notes",
    },
  },
  openGraph: {
    type: "website",
    locale: "en_PK",
    alternateLocale: ["ur_PK", "en_US"],
    siteName: "PaperWala",
    title: pageTitle,
    description: pageDescription,
    url: "/notes",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: pageTitle }],
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle,
    description: pageDescription,
    images: ["/twitter-image"],
  },
};

export default async function NotesHubPage() {
  const { classes, allChapters } = await getNotesCatalog();
  const totalQuestions = classes.reduce((sum, c) => sum + c.totalQuestions, 0);

  const hubUrl = `${siteUrl}/notes`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${hubUrl}#collection`,
        url: hubUrl,
        name: pageTitle,
        description: pageDescription,
        inLanguage: ["en-PK", "ur-PK"],
        isPartOf: { "@type": "WebSite", name: "PaperWala", url: siteUrl },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
          { "@type": "ListItem", position: 2, name: "Study Notes & Question Bank", item: hubUrl },
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
            <Link href="/paper-maker" className="hidden sm:inline hover:text-emerald-700 transition-colors">
              Paper Makers
            </Link>
            <Link href="/quick-paper" className="hidden md:inline hover:text-emerald-700 transition-colors">
              AI Quick Paper
            </Link>
            <Link href="/pricing" className="hover:text-emerald-700 transition-colors">
              Pricing
            </Link>
            <Link
              href="/select-questions"
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
            >
              Make a Paper
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-12">
        <nav aria-label="Breadcrumb" className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
          <Link href="/" className="hover:text-emerald-700 hover:underline">
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-slate-800 font-semibold">Study Notes &amp; Solved MCQs</span>
        </nav>

        {/* Hero */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 space-y-5 shadow-xs">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>2026–27 Syllabus &bull; Bilingual English &amp; Urdu</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-[42px] font-black tracking-tight text-slate-900 leading-[1.16]">
            Chapter-Wise Study Notes, Solved MCQs &amp; Board Question Bank
          </h1>

          <p
            dir="rtl"
            className="font-urdu text-lg sm:text-xl font-bold text-emerald-900 leading-loose bg-emerald-50/60 border border-emerald-100 rounded-2xl px-4 py-2.5"
          >
            چپٹر وائز حل شدہ معروضی سوالات (MCQs)، مختصر اور تفصیلی سوالات — انگلش اور اردو نستعلیق میں!
          </p>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl">
            Preview chapter-wise solved MCQs, textbook exercise questions, and conceptual board questions for Pakistani schools and academies. Active paid subscribers get full access to every solved question and can turn any chapter into a formatted BISE or FBISE exam paper in one click.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-2xl pt-1">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="text-xl font-black text-emerald-700">{totalQuestions}+</div>
              <div className="text-[11px] font-semibold text-slate-500">Active Questions</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="text-xl font-black text-teal-700">{allChapters.length}</div>
              <div className="text-[11px] font-semibold text-slate-500">Published Units</div>
            </div>
            <div className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="text-xl font-black text-indigo-700">EN + اردو</div>
              <div className="text-[11px] font-semibold text-slate-500">Bilingual &amp; Self-Quiz</div>
            </div>
          </div>
        </section>

        {/* Classes & Subjects Listing */}
        {classes.map((cls) => (
          <section key={cls.slug} className="space-y-6" aria-labelledby={`class-${cls.slug}`}>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-200 pb-3">
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700">
                  Board Syllabus Notes
                </span>
                <h2
                  id={`class-${cls.slug}`}
                  className="text-xl sm:text-2xl font-black tracking-tight text-slate-900"
                >
                  {cls.displayName}
                </h2>
              </div>
              <span className="text-xs font-bold text-slate-500">
                {cls.subjects.length} {cls.subjects.length === 1 ? "Subject" : "Subjects"} &bull;{" "}
                {cls.totalQuestions} Questions
              </span>
            </div>

            <div className="space-y-6">
              {cls.subjects.map((subj) => (
                <div
                  key={subj.slug}
                  className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-2xs space-y-5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-baseline gap-2.5">
                        <Link
                          href={`/notes/${cls.slug}/${subj.slug}`}
                          className="text-lg sm:text-xl font-black text-slate-900 hover:text-emerald-700 transition-colors"
                        >
                          {cls.name} {subj.name} Notes &amp; Solved MCQs
                        </Link>
                        {subj.nameUr && (
                          <span className="font-urdu text-base font-bold text-emerald-800" dir="rtl">
                            ({subj.nameUr})
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 font-medium">
                        {subj.chapters.length} {subj.chapters.length === 1 ? "Unit" : "Units"} &bull;{" "}
                        {subj.mcqCount} Solved MCQs &bull; {subj.shortCount} Short Qs &bull;{" "}
                        {subj.longCount} Long Qs
                      </p>
                    </div>

                    <Link
                      href={`/notes/${cls.slug}/${subj.slug}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 font-extrabold text-xs shrink-0 transition-colors"
                    >
                      <span>View All {subj.name} Units</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {subj.chapters.map((ch) => (
                      <Link
                        key={ch.id}
                        href={`/notes/${cls.slug}/${subj.slug}/${ch.slug}`}
                        className="group p-4 rounded-2xl bg-slate-50/80 hover:bg-white border border-slate-200/90 hover:border-emerald-300 hover:shadow-sm transition-all flex flex-col justify-between gap-3"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-2 text-[11px] font-bold">
                            <span className="text-emerald-700 uppercase tracking-wider">
                              Unit {ch.number}
                            </span>
                            <span className="text-slate-500">{ch.totalQuestions} Qs</span>
                          </div>
                          <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-emerald-700 leading-snug transition-colors">
                            {ch.title}
                          </h3>
                          {ch.titleUr && (
                            <div
                              dir="rtl"
                              className="font-urdu text-xs text-slate-600 leading-relaxed text-right"
                            >
                              {ch.titleUr}
                            </div>
                          )}
                        </div>

                        <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                          <span>
                            {ch.mcqCount} MCQs &bull; {ch.shortCount} SQ &bull; {ch.longCount} LQ
                          </span>
                          <BookOpen className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* Bottom CTA */}
        <section className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-3xl p-6 sm:p-10 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-emerald-300">
              <Layers className="w-4 h-4" />
              <span>PaperWala Exam Studio</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black">
              Are You a School or Academy Teacher?
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
              Generate ready-to-print BISE &amp; FBISE board-pattern question papers from any chapter above—complete with your school crest, shuffled Paper Codes A–D, OMR sheets, PDF &amp; MS Word (.docx) export.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <Link
              href="/select-questions"
              className="px-6 py-3 rounded-xl bg-white text-emerald-950 hover:bg-emerald-50 font-black text-xs sm:text-sm inline-flex items-center gap-2"
            >
              <span>Open Paper Maker</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/pricing"
              className="px-5 py-3 rounded-xl bg-emerald-950/60 hover:bg-emerald-950 text-white border border-emerald-400/30 font-bold text-xs sm:text-sm"
            >
              View Plans (Rs. 30 / paper)
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white py-8 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            &copy; {new Date().getFullYear()} PaperWala PK. Free Study Notes &amp; Online Board Paper Maker.
          </div>
          <div className="flex flex-wrap items-center gap-4 font-semibold text-slate-600">
            <Link href="/" className="hover:text-emerald-700">Home</Link>
            <Link href="/paper-maker" className="hover:text-emerald-700">Board Paper Makers</Link>
            <Link href="/select-questions" className="hover:text-emerald-700">Question Bank</Link>
            <Link href="/quick-paper" className="hover:text-emerald-700">AI Quick Paper</Link>
            <Link href="/pricing" className="hover:text-emerald-700">Pricing</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
