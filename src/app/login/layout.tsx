import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Educator Sign In – Online Paper Maker & Board Exam Portal",
  description:
    "Sign in to your PaperWala educator account to generate board-pattern exam papers, access saved papers, and export Word (.docx) or 1-page A4 PDF exams.",
  alternates: {
    canonical: "/login",
    languages: {
      "en-PK": "/login",
      "ur-PK": "/login",
    },
  },
  openGraph: {
    type: "website",
    locale: "en_PK",
    siteName: "PaperWala",
    title: "Educator Sign In | PaperWala – Online Paper Maker",
    description:
      "Sign in to PaperWala to create and download board-pattern exam papers for 9th, 10th, FSc & ICS.",
    url: "/login",
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Educator Sign In | PaperWala – Online Paper Maker",
    description:
      "Sign in to PaperWala to create and download board-pattern exam papers for 9th, 10th, FSc & ICS.",
    images: ["/twitter-image"],
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

