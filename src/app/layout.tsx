import type { Metadata } from "next";
import { Inter, Noto_Nastaliq_Urdu } from "next/font/google";
import "katex/dist/katex.min.css";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const notoNastaliqUrdu = Noto_Nastaliq_Urdu({
  variable: "--font-urdu",
  subsets: ["arabic"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://paperwala.pk"),
  title: {
    default: "PaperWala | Pakistan's #1 School Exam & Test Paper Generator (پیپر والا)",
    template: "%s | PaperWala",
  },
  description:
    "PaperWala (پیپر والا) is Pakistan's premier exam generator for schools, colleges, and academies. Create board-standard papers for Punjab Boards (BISE) and Federal Board (FBISE) with authentic Urdu Nastaliq typography, KaTeX mathematical formulas, OMR bubble sheets, and automatic answer keys.",
  keywords: [
    "PaperWala",
    "Paper Wala",
    "پیپر والا",
    "Pakistani exam generator",
    "matric paper maker",
    "BISE Lahore past papers",
    "FBISE paper generator",
    "Punjab board exam paper maker",
    "Urdu Nastaliq test maker",
    "Class 10 Computer Science test",
    "Class 10 Mathematics paper",
    "school exam software Pakistan",
    "OMR sheet generator",
    "Pakistani academy test generator",
    "bilingual exam paper generator",
  ],
  authors: [{ name: "PaperWala Education Systems", url: "https://paperwala.pk" }],
  creator: "PaperWala Team",
  publisher: "PaperWala PK",
  applicationName: "PaperWala",
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
    url: "https://paperwala.pk",
    siteName: "PaperWala",
    title: "PaperWala | Pakistan's #1 School Exam & Test Paper Generator (پیپر والا)",
    description:
      "Generate board-standard exam papers for Pakistani schools in 60 seconds. Full Punjab Boards & FBISE coverage with Urdu Nastaliq and KaTeX mathematical formulas.",
  },
  twitter: {
    card: "summary_large_image",
    title: "PaperWala | Pakistan's #1 School Exam Paper Generator (پیپر والا)",
    description:
      "Generate board-standard exam papers for Pakistani schools in 60 seconds. Full Punjab Boards & FBISE coverage with Urdu Nastaliq and KaTeX math.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${notoNastaliqUrdu.variable} h-full antialiased`}>
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900"
      >
        {children}
      </body>
    </html>
  );
}
