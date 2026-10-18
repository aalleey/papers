import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account Verification Pending – Educator Portal",
  description:
    "Your PaperWala educator account or subscription payment verification status.",
  alternates: {
    canonical: "/verification-pending",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function VerificationPendingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
