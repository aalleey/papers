import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Online Paper Maker – Paste, Scan & Export Board Pattern Papers",
  description:
    "Create board-pattern exam papers instantly from any topic, image (OCR), or raw text. Translate between English & Urdu Nastaliq and download editable Word (.docx) or 1-page A4 PDF.",
  keywords: [
    "AI online paper maker",
    "quick paper maker online",
    "board pattern test generator",
    "exam paper maker in Word docx",
    "Urdu English bilingual paper maker",
    "OCR exam scanner Pakistan",
  ],
  alternates: {
    canonical: "/quick-paper",
  },
  openGraph: {
    title: "AI Online Paper Maker – Paste, Scan & Export Board Pattern Papers | PaperWala",
    description:
      "Generate, scan (OCR), translate, and format board-pattern exam papers in English & Urdu. Download editable Word (.docx) or print 1-page A4 PDF.",
    url: "/quick-paper",
  },
};

export default function QuickPaperLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
