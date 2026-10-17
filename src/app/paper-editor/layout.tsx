import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live Board Pattern Paper Editor, Word (.docx) & PDF Print Studio",
  description:
    "Customize school and academy exam headers, Paper Codes (A/B/C/D), OMR bubble sheets, and bilingual Urdu/English layouts. Export to editable Word (.docx) or 1-page A4 PDF.",
  keywords: [
    "board pattern paper editor",
    "custom school header exam maker",
    "OMR bubble sheet paper generator",
    "version A B C D paper maker",
    "download board paper in Word docx",
  ],
  alternates: {
    canonical: "/paper-editor",
  },
  openGraph: {
    title: "Live Board Pattern Paper Editor & Print Studio | PaperWala",
    description:
      "Customize school and academy exam headers, Paper Codes (A/B/C/D), OMR bubble sheets, and bilingual Urdu/English layouts.",
    url: "/paper-editor",
  },
};

export default function PaperEditorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
