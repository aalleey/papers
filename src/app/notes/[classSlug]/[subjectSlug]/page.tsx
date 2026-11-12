import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BookOpen, Sparkles } from "lucide-react";
import { SiteNavbar } from "@/components/SiteNavbar";
import { getNotesSubject } from "@/lib/notes";
import { SITE_URL } from "@/lib/site-url";

export const dynamic = "force-dynamic";

const siteUrl = SITE_URL;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ classSlug: string; subjectSlug: string }>;
}): Promise<Metadata> {
  const { classSlug, subjectSlug } = await params;
  const data = await getNotesSubject(classSlug, subjectSlug);
  if (!data) return {};

  const { cls, subject } = data;
  const path = `/notes/${cls.slug}/${subject.slug}`;
  const fullTitle = `${cls.name} ${subject.name} Notes, Solved MCQs & Questions | PaperWala`;
  const description = `Chapter-wise ${cls.name} ${subject.name} solved MCQs (${subject.mcqCount}), short questions (${subject.shortCount}), and long questions (${subject.longCount}) in English & Urdu for BISE & FBISE.`;

  return {
    title: { absolute: fullTitle },
    description,
    keywords: [
      `${cls.name.toLowerCase()} ${subject.name.toLowerCase()} notes`,
      `${cls.name.toLowerCase()} ${subject.name.toLowerCase()} solved mcqs`,
      `${cls.name.toLowerCase()} ${subject.name.toLowerCase()} short questions`,
      `${cls.name.toLowerCase()} ${subject.name.toLowerCase()} chapter wise questions`,
      `${subject.name.toLowerCase()} 2026-27 syllabus notes`,
    ],
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
      description,
      url: path,
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: fullTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: ["/twitter-image"],
    },
  };
}

export default async function SubjectNotesPage({
  params,
}: {
  params: Promise<{ classSlug: string; subjectSlug: string }>;
}) {
  const { classSlug, subjectSlug } = await params;
  const data = await getNotesSubject(classSlug, subjectSlug);
  if (!data) notFound();

  const { cls, subject } = data;
  const pageUrl = `${siteUrl}/notes/${cls.slug}/${subject.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${pageUrl}#collection`,
        url: pageUrl,
        name: `${cls.name} ${subject.name} Chapter-Wise Notes & Solved MCQs`,
        description: `Complete chapter-wise solved MCQs, short questions, and long questions for ${cls.displayName} ${subject.name}.`,
        inLanguage: ["en-PK", "ur-PK"],
      },
      {
        "@type": "ItemList",
        name: `${cls.name} ${subject.name} Units`,
        numberOfItems: subject.chapters.length,
        itemListElement: subject.chapters.map((ch, idx) => ({
          "@type": "ListItem",
          position: idx + 1,
          name: `Unit ${ch.number}: ${ch.title}`,
          url: `${pageUrl}/${ch.slug}`,
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
          { "@type": "ListItem", position: 2, name: "Study Notes", item: `${siteUrl}/notes` },
          { "@type": "ListItem", position: 3, name: `${cls.name} ${subject.name}`, item: pageUrl },
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

      <SiteNavbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
        <nav
          aria-label="Breadcrumb"
          className="text-xs font-medium text-slate-500 flex flex-wrap items-center gap-1.5"
        >
          <Link href="/" className="hover:text-emerald-700 hover:underline">
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <Link href="/notes" className="hover:text-emerald-700 hover:underline">
            Study Notes
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-slate-800 font-semibold">
            {cls.name} {subject.name}
          </span>
        </nav>

        {/* Subject Hero */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 space-y-4 shadow-xs">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>{cls.displayName} &bull; Chapter-Wise Notes</span>
          </div>

          <div className="flex flex-wrap items-baseline gap-3">
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900">
              {cls.name} {subject.name} Notes, Solved MCQs &amp; Important Questions
            </h1>
            {subject.nameUr && (
              <span className="font-urdu text-xl font-bold text-emerald-800" dir="rtl">
                ({subject.nameUr})
              </span>
            )}
          </div>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl">
            Select any unit below to study solved exercise &amp; conceptual MCQs, short questions, and long questions in Bilingual English + Urdu Nastaliq—or click Generate Paper to create a printable BISE/FBISE test.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="text-lg font-black text-slate-900">{subject.chapters.length}</div>
              <div className="text-[11px] font-semibold text-slate-500">Published Units</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="text-lg font-black text-emerald-700">{subject.mcqCount}</div>
              <div className="text-[11px] font-semibold text-slate-500">Solved MCQs</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="text-lg font-black text-blue-700">{subject.shortCount}</div>
              <div className="text-[11px] font-semibold text-slate-500">Short Questions</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="text-lg font-black text-purple-700">{subject.longCount}</div>
              <div className="text-[11px] font-semibold text-slate-500">Long Questions</div>
            </div>
          </div>
        </section>

        {/* Units Grid */}
        <section className="space-y-4" aria-labelledby="units-heading">
          <h2 id="units-heading" className="text-xl font-black tracking-tight text-slate-900">
            All {cls.name} {subject.name} Units ({subject.chapters.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subject.chapters.map((ch) => (
              <article
                key={ch.id}
                className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between gap-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2 text-xs font-bold">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Unit {ch.number}
                    </span>
                    <span className="text-slate-500">{ch.totalQuestions} Total Questions</span>
                  </div>

                  <Link
                    href={`/notes/${cls.slug}/${subject.slug}/${ch.slug}`}
                    className="block text-base sm:text-lg font-black text-slate-900 hover:text-emerald-700 transition-colors"
                  >
                    {ch.title}
                  </Link>

                  {ch.titleUr && (
                    <div
                      dir="rtl"
                      className="font-urdu text-sm font-bold text-emerald-900/80 leading-relaxed text-right"
                    >
                      {ch.titleUr}
                    </div>
                  )}

                  {ch.topics.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {ch.topics.slice(0, 4).map((t) => (
                        <span
                          key={t.id}
                          className="px-2 py-0.5 rounded-md bg-slate-100 text-[11px] font-medium text-slate-600"
                        >
                          {t.title}
                        </span>
                      ))}
                      {ch.topics.length > 4 && (
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[11px] font-medium text-slate-500">
                          +{ch.topics.length - 4} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs font-semibold text-slate-600">
                    {ch.mcqCount} MCQs &bull; {ch.shortCount} Shorts &bull; {ch.longCount} Longs
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/notes/${cls.slug}/${subject.slug}/${ch.slug}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Open Notes</span>
                    </Link>
                    <Link
                      href={`/select-questions?subject_id=${encodeURIComponent(
                        ch.subjectId
                      )}&chapter_id=${encodeURIComponent(ch.id)}`}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
                    >
                      <span>Make Test</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white py-8 text-xs text-slate-500">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>&copy; {new Date().getFullYear()} PaperWala PK. Study Notes &amp; Exam Studio.</div>
          <div className="flex flex-wrap items-center gap-4 font-semibold text-slate-600">
            <Link href="/" className="hover:text-emerald-700">Home</Link>
            <Link href="/notes" className="hover:text-emerald-700">All Notes</Link>
            <Link href="/paper-maker" className="hover:text-emerald-700">Paper Makers</Link>
            <Link href="/pricing" className="hover:text-emerald-700">Pricing</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
