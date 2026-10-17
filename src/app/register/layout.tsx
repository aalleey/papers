import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register School or Academy – #1 Online Paper Maker Pakistan",
  description:
    "Create your educator account on PaperWala. Generate unlimited board-pattern exam papers for Punjab Boards (BISE) & FBISE in English and Urdu Nastaliq.",
  alternates: {
    canonical: "/register",
  },
  openGraph: {
    title: "Register School or Academy | PaperWala – Online Paper Maker",
    description:
      "Join thousands of Pakistani schools and academies using PaperWala to generate board-pattern exam papers in 60 seconds.",
    url: "/register",
  },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
