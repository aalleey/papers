import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SEO_LANDINGS, getLanding } from "@/lib/seo-landings";

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

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = getLanding(slug);
  if (!page) return {};
  const path = `/paper-maker/${page.slug}`;
  return {
    title: page.title,
    description: page.description,
    keywords: page.keywords,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "en_PK",
      siteName: "PaperWala",
      title: page.title,
      description: page.description,
      url: path,
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: page.h1 }],
    },
    twitter: { card: "summary_large_image", title: page.title, description: page.description, images: ["/twitter-image"] },
  };
}

export default async function SeoLandingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = getLanding(slug);
  if (!page) notFound();

  const url = `${siteUrl}/paper-maker/${page.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": url,
        url,
        name: page.title,
        description: page.description,
        inLanguage: "en-PK",
        isPartOf: { "@type": "WebSite", name: "PaperWala", url: siteUrl },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
          { "@type": "ListItem", position: 2, name: page.h1, item: url },
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

  const others = SEO_LANDINGS.filter((l) => l.slug !== page.slug);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="font-black text-lg tracking-tight">
            PaperWala
          </Link>
          <nav className="flex items-center gap-4 text-xs font-semibold text-slate-600">
            <Link href="/pricing" className="hover:text-emerald-700">Pricing</Link>
            <Link href="/login" className="hover:text-emerald-700">Sign In</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-10">
        <nav aria-label="Breadcrumb" className="text-xs text-slate-500">
          <Link href="/" className="hover:underline">Home</Link> / <span>{page.h1}</span>
        </nav>

        <section className="space-y-4">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">{page.h1}</h1>
          <p className="text-base text-slate-600 leading-relaxed">{page.intro}</p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link href="/select-questions" className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm">
              Start Making a Paper
            </Link>
            <Link href="/quick-paper" className="px-5 py-3 rounded-xl bg-white border border-slate-300 font-bold text-sm hover:bg-slate-100">
              AI Quick Paper
            </Link>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-extrabold">What you get</h2>
          <ul className="grid sm:grid-cols-2 gap-3">
            {page.points.map((p) => (
              <li key={p} className="p-4 rounded-2xl bg-white border border-slate-200 text-sm font-medium text-slate-700">
                {p}
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-extrabold">How it works</h2>
          <ol className="list-decimal list-inside space-y-1.5 text-sm text-slate-700">
            <li>Pick your class, subject and chapters.</li>
            <li>Select questions manually or use the board pattern.</li>
            <li>Edit the header, logo, language and layout.</li>
            <li>Print the paper or download PDF / Word with the answer key.</li>
          </ol>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-extrabold">Frequently asked questions</h2>
          <div className="space-y-3">
            {page.faqs.map((f) => (
              <div key={f.q} className="p-4 rounded-2xl bg-white border border-slate-200">
                <h3 className="font-bold text-sm">{f.q}</h3>
                <p className="text-sm text-slate-600 mt-1 leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-extrabold">More paper makers</h2>
          <ul className="flex flex-wrap gap-2">
            {others.map((o) => (
              <li key={o.slug}>
                <Link href={`/paper-maker/${o.slug}`} className="inline-block px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:text-emerald-700">
                  {o.h1}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
