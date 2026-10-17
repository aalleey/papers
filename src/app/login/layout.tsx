import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Educator Sign In – Online Paper Maker & Board Pattern Portal",
  description:
    "Sign in to your PaperWala educator account to generate board-pattern exam papers, access saved question papers, and export Word (.docx) or 1-page A4 PDF exams.",
  alternates: {
    canonical: "/login",
  },
  openGraph: {
    title: "Educator Sign In | PaperWala – Online Paper Maker",
    description:
      "Sign in to PaperWala to create and download board-pattern exam papers for 9th, 10th, FSc & ICS.",
    url: "/login",
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
