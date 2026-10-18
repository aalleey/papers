import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Educator Profile & Saved Exam Papers",
  description:
    "Manage your PaperWala educator profile, subscription credits, school branding, and saved board-pattern exam papers.",
  alternates: {
    canonical: "/profile",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
