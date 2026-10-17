import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "School & Academy Pricing Plans – Unlimited Online Paper Maker",
  description:
    "Affordable online paper making plans for Pakistani schools, colleges, and coaching academies. Start with Rs. 30 per paper or Rs. 2,000/month unlimited board-pattern papers.",
  keywords: [
    "online paper maker pricing Pakistan",
    "school exam software price",
    "academy test generator subscription",
    "unlimited paper generator Pakistan",
  ],
  alternates: {
    canonical: "/pricing",
  },
  openGraph: {
    title: "School & Academy Pricing Plans – Unlimited Online Paper Maker | PaperWala",
    description:
      "Affordable online paper making plans for Pakistani schools, colleges, and coaching academies. Unlimited board-pattern exam papers with custom branding.",
    url: "/pricing",
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
