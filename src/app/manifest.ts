import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PaperWala – #1 Online Paper Maker & Board Exam Studio",
    short_name: "PaperWala",
    description:
      "Create BISE & FBISE board-pattern exam papers online in 60 seconds. #1 paper maker for 9th, 10th, FSc & ICS with Bilingual Urdu Nastaliq, PDF & Word export.",
    start_url: "/",
    id: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#f8fafc",
    theme_color: "#059669",
    lang: "en-PK",
    dir: "ltr",
    categories: ["education", "productivity", "utilities"],
    icons: [
      {
        src: "/icon",
        sizes: "64x64",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Board Question Bank",
        short_name: "Question Bank",
        description: "Select chapter-wise MCQs, Short & Long questions for 9th, 10th, 11th & 12th.",
        url: "/select-questions",
      },
      {
        name: "AI Quick Paper Maker",
        short_name: "AI Quick Paper",
        description: "Generate, OCR scan, or translate exam papers into Urdu & English.",
        url: "/quick-paper",
      },
      {
        name: "Live Paper Editor & Print",
        short_name: "Paper Studio",
        description: "Customize school header, Paper Codes A/B/C/D, OMR bubbles & Word (.docx) export.",
        url: "/paper-editor",
      },
      {
        name: "School & Academy Pricing",
        short_name: "Pricing",
        description: "View Rs. 30 per paper and Rs. 2,000/month unlimited educator plans.",
        url: "/pricing",
      },
    ],
  };
}
