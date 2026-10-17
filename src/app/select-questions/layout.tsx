import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Board Pattern Question Bank – 9th, 10th, 1st & 2nd Year Paper Maker",
  description:
    "Select chapter-wise MCQs, Short Questions & Long Questions for all Punjab Boards (BISE) and Federal Board (FBISE). Build custom board-pattern exam papers online in 60 seconds.",
  keywords: [
    "9th class online paper maker",
    "10th class board pattern paper generator",
    "1st year 2nd year test maker",
    "BISE Lahore question bank",
    "FBISE board pattern paper maker",
    "chapter wise test generator Pakistan",
  ],
  alternates: {
    canonical: "/select-questions",
  },
  openGraph: {
    title: "Board Pattern Question Bank – 9th, 10th, 1st & 2nd Year | PaperWala",
    description:
      "Select chapter-wise MCQs, Short & Long questions for Punjab Boards (BISE) and Federal Board (FBISE). Build custom bilingual exam papers in 60 seconds.",
    url: "/select-questions",
  },
};

export default function SelectQuestionsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
