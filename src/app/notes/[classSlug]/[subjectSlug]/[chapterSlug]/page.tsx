import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Sparkles, BookOpen, Lock, CheckCircle2 } from "lucide-react";
import { SiteNavbar } from "@/components/SiteNavbar";
import { NotesChapterViewer } from "@/components/NotesChapterViewer";
import { getCurrentClient, isCurrentUserAdmin } from "@/lib/auth";
import { getNotesChapter } from "@/lib/notes";
import { SITE_URL } from "@/lib/site-url";
import { isPaidSubscriber, Question } from "@/lib/types";

const PUBLIC_PREVIEW_MCQS = 5;
const PUBLIC_PREVIEW_SHORTS = 3;
const PUBLIC_PREVIEW_LONGS = 1;

function selectPublicPreviewQuestions(allQuestions: Question[]): Question[] {
  const out: Question[] = [];
  let mcqSeen = 0;
  let shortSeen = 0;
  let longSeen = 0;

  for (const q of allQuestions) {
    if (q.type === "mcq") {
      if (mcqSeen < PUBLIC_PREVIEW_MCQS) {
        out.push(q);
        mcqSeen++;
      }
    } else if (q.type === "short") {
      if (shortSeen < PUBLIC_PREVIEW_SHORTS) {
        out.push(q);
        shortSeen++;
      }
    } else if (q.type === "long") {
      if (longSeen < PUBLIC_PREVIEW_LONGS) {
        out.push(q);
        longSeen++;
      }
    }
  }
  return out;
}

export const dynamic = "force-dynamic";

const siteUrl = SITE_URL;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ classSlug: string; subjectSlug: string; chapterSlug: string }>;
}): Promise<Metadata> {
  const { classSlug, subjectSlug, chapterSlug } = await params;
  const data = await getNotesChapter(classSlug, subjectSlug, chapterSlug);
  if (!data) return {};

  const { cls, subject, chapter } = data;
  const path = `/notes/${cls.slug}/${subject.slug}/${chapter.slug}`;
  const fullTitle = `Unit ${chapter.number}: ${chapter.title} – ${cls.name} ${subject.name} MCQs & Notes | PaperWala`;
  const description = `${cls.name} ${subject.name} Unit ${chapter.number} (${chapter.title}): ${chapter.mcqCount} solved MCQs, ${chapter.shortCount} short questions & ${chapter.longCount} long questions in English & Urdu.`;

  return {
    title: { absolute: fullTitle },
    description,
    keywords: [
      `${chapter.title.toLowerCase()} ${cls.name.toLowerCase()} mcqs`,
      `${chapter.title.toLowerCase()} short questions`,
      `${cls.name.toLowerCase()} ${subject.name.toLowerCase()} chapter ${chapter.number} notes`,
      `${cls.name.toLowerCase()} ${subject.name.toLowerCase()} unit ${chapter.number} solved exercise`,
      ...chapter.topics.slice(0, 5).map((t) => `${t.title.toLowerCase()} mcqs`),
    ],
    alternates: {
      canonical: path,
      languages: {
        "en-PK": path,
        "ur-PK": path,
      },
    },
    openGraph: {
      type: "article",
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

export default async function ChapterNotesPage({
  params,
}: {
  params: Promise<{ classSlug: string; subjectSlug: string; chapterSlug: string }>;
}) {
  const { classSlug, subjectSlug, chapterSlug } = await params;
  const [data, clientUser, isAdmin] = await Promise.all([
    getNotesChapter(classSlug, subjectSlug, chapterSlug),
    getCurrentClient(),
    isCurrentUserAdmin(),
  ]);
  if (!data) notFound();

  const { cls, subject, chapter } = data;
  const isUnlocked = isPaidSubscriber(clientUser, isAdmin);
  const visibleQuestions = isUnlocked
    ? chapter.questions
    : selectPublicPreviewQuestions(chapter.questions);
  const hasLockedQuestions = chapter.questions.length > visibleQuestions.length;

  const pageUrl = `${siteUrl}/notes/${cls.slug}/${subject.slug}/${chapter.slug}`;
  const subjectUrl = `${siteUrl}/notes/${cls.slug}/${subject.slug}`;
  const generatorUrl = `/select-questions?subject_id=${encodeURIComponent(
    chapter.subjectId
  )}&chapter_id=${encodeURIComponent(chapter.id)}`;

  // Build FAQ schema exclusively from publicly visible preview/unlocked questions (100% Google-compliant)
  const faqEntities = visibleQuestions
    .filter((q) => {
      if (q.type !== "mcq") {
        return q.translations?.some((t) => Boolean(t.answer && t.answer.trim()));
      }
      return Boolean(q.correct_option);
    })
    .slice(0, 8)
    .map((q) => {
      const en = q.translations?.find((t) => t.language === "en");
      if (q.type === "mcq") {
        const opts = Array.isArray(en?.options) ? en.options : [];
        const ansIdx = (q.correct_option || 1) - 1;
        const ansLetter = String.fromCharCode(65 + ansIdx);
        const ansText = opts[ansIdx] || `Option ${ansLetter}`;
        return {
          "@type": "Question",
          name: en?.text || `Unit ${chapter.number} MCQ`,
          acceptedAnswer: {
            "@type": "Answer",
            text: `Correct Option: (${ansLetter}) ${ansText}`,
          },
        };
      }
      return {
        "@type": "Question",
        name: en?.text || `Unit ${chapter.number} Question`,
        acceptedAnswer: {
          "@type": "Answer",
          text: en?.answer || "",
        },
      };
    });

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LearningResource",
        "@id": `${pageUrl}#resource`,
        url: pageUrl,
        name: `${cls.name} ${subject.name} – Unit ${chapter.number}: ${chapter.title} Notes & Solved MCQs`,
        description: `Chapter-wise solved MCQs, short questions, and long questions for ${cls.displayName} ${subject.name} Unit ${chapter.number}: ${chapter.title}.`,
        educationalLevel: cls.displayName,
        learningResourceType: ["Study Notes", "Practice Quiz", "Question Bank"],
        inLanguage: ["en-PK", "ur-PK"],
        isAccessibleForFree: false,
        hasPart: [
          {
            "@type": "WebPageElement",
            isAccessibleForFree: true,
            cssSelector: ".notes-public-preview",
          },
          {
            "@type": "WebPageElement",
            isAccessibleForFree: false,
            cssSelector: ".notes-paywall-gate",
          },
        ],
        isPartOf: { "@type": "CollectionPage", name: `${cls.name} ${subject.name} Notes`, url: subjectUrl },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
          { "@type": "ListItem", position: 2, name: "Study Notes", item: `${siteUrl}/notes` },
          { "@type": "ListItem", position: 3, name: `${cls.name} ${subject.name}`, item: subjectUrl },
          {
            "@type": "ListItem",
            position: 4,
            name: `Unit ${chapter.number}: ${chapter.title}`,
            item: pageUrl,
          },
        ],
      },
      ...(faqEntities.length > 0
        ? [
            {
              "@type": "FAQPage",
              mainEntity: faqEntities,
            },
          ]
        : []),
    ],
  };

  const otherChapters = subject.chapters.filter((c) => c.slug !== chapter.slug);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <SiteNavbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        {/* Breadcrumb */}
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
          <Link
            href={`/notes/${cls.slug}/${subject.slug}`}
            className="hover:text-emerald-700 hover:underline"
          >
            {cls.name} {subject.name}
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-slate-800 font-semibold">
            Unit {chapter.number}: {chapter.title}
          </span>
        </nav>

        {/* Chapter Hero */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-9 space-y-4 shadow-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                {cls.displayName} &bull; {subject.name} &bull; Unit {chapter.number}
              </span>
            </span>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600">
              {chapter.courseName}
            </span>
            {isUnlocked ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300">
                <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                <span>Paid Subscriber Unlocked</span>
              </span>
            ) : hasLockedQuestions ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
                <Lock className="w-3 h-3 text-amber-700" />
                <span>Sample Preview + Paid Full Access</span>
              </span>
            ) : null}
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 leading-tight">
            Unit {chapter.number}: {chapter.title} — Solved MCQs, Short &amp; Long Questions
          </h1>

          {chapter.titleUr && (
            <p
              dir="rtl"
              className="font-urdu text-lg sm:text-xl font-bold text-emerald-900 leading-loose bg-emerald-50/60 border border-emerald-100 rounded-2xl px-4 py-2"
            >
              باب {chapter.number}: {chapter.titleUr} — حل شدہ معروضی، مختصر اور تفصیلی سوالات
            </p>
          )}

          <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
            Complete chapter-wise question bank and study notes for{" "}
            <strong>
              {cls.name} {subject.name} Unit {chapter.number} ({chapter.title})
            </strong>
            . Includes <strong>{chapter.mcqCount} solved MCQs</strong>,{" "}
            <strong>{chapter.shortCount} short questions</strong>, and{" "}
            <strong>{chapter.longCount} long questions</strong> covering textbook exercises and board concepts in English and Urdu Nastaliq.
          </p>

          {/* Topics Covered */}
          {chapter.topics.length > 0 && (
            <div className="pt-1 space-y-1.5">
              <div className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                Syllabus Topics Covered in Unit {chapter.number}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {chapter.topics.map((t) => (
                  <span
                    key={t.id}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 text-xs font-semibold text-slate-700"
                  >
                    {t.number}. {t.title}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              href={generatorUrl}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs sm:text-sm shadow-sm transition-all"
            >
              <span>Generate Printable Test from Unit {chapter.number}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href={`/notes/${cls.slug}/${subject.slug}`}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm"
            >
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span>All {subject.name} Units</span>
            </Link>
          </div>
        </section>

        {/* Interactive + Crawlable Chapter Questions & Answers */}
        <NotesChapterViewer
          chapterId={chapter.id}
          subjectId={chapter.subjectId}
          chapterNumber={chapter.number}
          chapterTitle={chapter.title}
          topics={chapter.topics}
          questions={visibleQuestions}
          isUnlocked={isUnlocked}
          isLoggedInFreeUser={Boolean(clientUser && !isUnlocked)}
          totalCounts={{
            total: chapter.totalQuestions,
            mcq: chapter.mcqCount,
            short: chapter.shortCount,
            long: chapter.longCount,
            exercise: chapter.exerciseCount,
            extra: chapter.extraCount,
          }}
        />

        {/* Other Chapters in Same Subject */}
        {otherChapters.length > 0 && (
          <section
            className="pt-6 border-t border-slate-200 space-y-4"
            aria-labelledby="other-units-heading"
          >
            <h2 id="other-units-heading" className="text-lg font-black tracking-tight text-slate-900">
              More {cls.name} {subject.name} Units
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {otherChapters.map((och) => (
                <Link
                  key={och.id}
                  href={`/notes/${cls.slug}/${subject.slug}/${och.slug}`}
                  className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-emerald-300 hover:shadow-xs transition-all space-y-1"
                >
                  <div className="text-[11px] font-bold text-emerald-700 uppercase">
                    Unit {och.number} &bull; {och.totalQuestions} Qs
                  </div>
                  <div className="text-sm font-extrabold text-slate-900">{och.title}</div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white py-8 text-xs text-slate-500">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>&copy; {new Date().getFullYear()} PaperWala PK. Study Notes &amp; Board Exam Generator.</div>
          <div className="flex flex-wrap items-center gap-4 font-semibold text-slate-600">
            <Link href="/" className="hover:text-emerald-700">Home</Link>
            <Link href="/notes" className="hover:text-emerald-700">Study Notes</Link>
            <Link href="/paper-maker" className="hover:text-emerald-700">Paper Makers</Link>
            <Link href="/pricing" className="hover:text-emerald-700">Pricing</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
