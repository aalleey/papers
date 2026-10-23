export interface SeoLanding {
  slug: string;
  shortLabel: string;
  h1: string;
  title: string;
  description: string;
  keywords: string[];
  intro: string;
  points: string[];
  faqs: { q: string; a: string }[];
}

const commonFaqs = (label: string) => [
  {
    q: `Is PaperWala free to try for ${label}?`,
    a: `Yes. You can browse the question bank and preview a ${label} paper for free. Printing, PDF and Word export need a paid plan: Rs. 30 per paper or Rs. 2,000 per month for unlimited papers.`,
  },
  {
    q: "Can I get the paper in Urdu and English?",
    a: "Yes. Papers can be Bilingual, English only or Urdu only, with proper Urdu Nastaliq text. AI can convert questions between English and Urdu.",
  },
  {
    q: "Can I add my school name and logo?",
    a: "Yes. Save your school name, logo and layout once as your paper template in your profile, and every new paper uses it automatically.",
  },
];

export const SEO_LANDINGS: SeoLanding[] = [
  {
    slug: "9th-class-paper-maker",
    shortLabel: "9th Class Paper Maker",
    h1: "9th Class Paper Maker Online (Punjab Board Pattern)",
    title: "9th Class Paper Maker Online - Punjab Board Pattern Papers in 60 Seconds",
    description:
      "Make 9th class exam papers online in minutes. Chapter-wise MCQs, short and long questions, bilingual Urdu/English, PDF and Word download. Used by Pakistani schools and academies.",
    keywords: [
      "9th class paper maker",
      "9th class paper generator",
      "matric part 1 paper maker",
      "9th class model paper",
      "BISE paper pattern 9th",
      "9th class chapter wise test maker",
    ],
    intro:
      "Create a complete 9th class test or full-book paper from a chapter-wise question bank. Choose chapters, let the board pattern pick questions, edit the paper, then print or download it.",
    points: [
      "Chapter-wise MCQs, short and long questions for 9th class subjects",
      "Punjab Board and Federal Board paper styles",
      "OMR bubble sheet and automatic answer key",
      "Paper versions A, B, C and D with shuffled MCQs",
    ],
    faqs: commonFaqs("9th class"),
  },
  {
    slug: "10th-class-paper-maker",
    shortLabel: "10th Class Paper Maker",
    h1: "10th Class Paper Maker Online (Matric Board Pattern)",
    title: "10th Class Paper Maker Online - Matric Board Pattern Paper Generator",
    description:
      "Generate 10th class papers online: board pattern selection, bilingual Urdu/English, school header and logo, OMR sheet, PDF and Word export. Fast, simple and made for Pakistan.",
    keywords: [
      "10th class paper maker",
      "10th class paper generator",
      "matric part 2 paper maker",
      "10th class computer paper",
      "10th class model paper",
      "matric board paper generator online",
    ],
    intro:
      "Build 10th class monthly tests, send-up and pre-board papers in a few clicks. Pick the chapters, adjust marks and print a clean, board-style paper with your school branding.",
    points: [
      "Question bank for 10th class including Computer Science, Physics, Chemistry, Math & Biology",
      "Board pairing scheme with one-click question selection",
      "Custom school name, logo and watermark",
      "Editable Word (.docx) and one-page A4 PDF",
    ],
    faqs: commonFaqs("10th class"),
  },
  {
    slug: "fsc-ics-paper-maker",
    shortLabel: "FSc & ICS Paper Maker",
    h1: "FSc and ICS Paper Maker Online (1st and 2nd Year)",
    title: "FSc & ICS Paper Maker Online - 1st Year and 2nd Year Paper Generator",
    description:
      "Online paper maker for 11th and 12th class (FSc, ICS). Create board pattern papers with MCQs, short and long questions, math formulas, Urdu and English, PDF and Word export.",
    keywords: [
      "fsc paper maker",
      "ics paper maker",
      "1st year paper generator",
      "2nd year paper maker",
      "intermediate paper maker online",
      "11th 12th class test generator",
    ],
    intro:
      "Make intermediate papers for colleges and academies with math and science formulas rendered properly, bilingual text and a professional header.",
    points: [
      "Formula-friendly questions with KaTeX rendering",
      "Part-I and Part-II board style layouts",
      "Shuffled versions to reduce cheating",
      "Save your institute template for every paper",
    ],
    faqs: commonFaqs("FSc and ICS"),
  },
  {
    slug: "bise-punjab-board-paper-maker",
    shortLabel: "Punjab Board (BISE) Paper Maker",
    h1: "Punjab Board (BISE) Exam Paper Maker Online",
    title: "Punjab Board (BISE) Paper Maker - Lahore, Gujranwala, Multan, Rawalpindi & Faisalabad",
    description:
      "Create official Punjab Board (BISE) pattern papers for Lahore, Gujranwala, Rawalpindi, Faisalabad, Multan, Sargodha, Bahawalpur, DG Khan & Sahiwal boards in 60 seconds.",
    keywords: [
      "punjab board paper maker",
      "bise lahore paper generator",
      "bise gujranwala paper maker",
      "bise faisalabad test generator",
      "bise rawalpindi paper maker",
      "bise multan paper generator",
      "punjab board pairing scheme paper generator",
    ],
    intro:
      "Generate examination papers matching all 9 Punjab Boards (BISE) pairing schemes, section divisions, marks distribution, and bilingual English + Urdu Nastaliq layout.",
    points: [
      "Matches all 9 BISE Punjab Board examination layouts and marks distribution",
      "1-Click Automatic Board Pattern question selection",
      "Bilingual side-by-side English and Urdu Nastaliq columns",
      "2-Tests-on-1-Page landscape mode to save 50% photocopy costs",
    ],
    faqs: commonFaqs("Punjab Board (BISE)"),
  },
  {
    slug: "fbise-federal-board-paper-maker",
    shortLabel: "FBISE Federal Board Paper Maker",
    h1: "Federal Board (FBISE) SLO-Based Paper Maker Online",
    title: "FBISE Paper Maker Online - Federal Board Islamabad Exam Paper Generator",
    description:
      "Build Federal Board (FBISE Islamabad) style examination papers online with official header formatting, version codes, OMR bubble sheets, and bilingual Urdu/English export.",
    keywords: [
      "fbise paper maker",
      "federal board paper generator",
      "fbise slo paper maker",
      "federal board model paper generator",
      "fbise exam header template",
    ],
    intro:
      "Switch to the dedicated Federal Board (FBISE) header and table layout in one click, complete with candidate roll number boxes, version codes, and structured sections.",
    points: [
      "Dedicated FBISE table layout & candidate roll number grid",
      "Supports Version A, B, C, D paper codes",
      "OMR bubble sheet and teacher answer key export",
      "Download as editable Microsoft Word (.docx) or print-ready PDF",
    ],
    faqs: commonFaqs("Federal Board (FBISE)"),
  },
  {
    slug: "bilingual-urdu-english-paper-maker",
    shortLabel: "Urdu English Bilingual Paper Maker",
    h1: "Urdu and English Bilingual Exam Paper Maker",
    title: "Urdu English Bilingual Exam Paper Maker - Nastaliq Paper Generator",
    description:
      "Create bilingual exam papers with Urdu Nastaliq and English side by side. AI English to Urdu and Urdu to English question conversion, OCR scan, PDF and Word export.",
    keywords: [
      "urdu paper maker",
      "bilingual paper generator",
      "urdu nastaliq paper",
      "english to urdu paper converter",
      "اردو پیپر میکر",
      "آن لائن اردو پیپر بنانے والی ویب سائٹ",
    ],
    intro:
      "Prepare Urdu medium, English medium or bilingual papers without InPage. Convert a whole paper between languages with AI and edit any question before printing.",
    points: [
      "Authentic Noto Nastaliq Urdu typography for print",
      "AI conversion of a full paper between English and Urdu in one click",
      "Scan a printed paper photo with OCR and convert it into an editable paper",
      "Bilingual two-column question layout",
    ],
    faqs: commonFaqs("bilingual Urdu & English"),
  },
  {
    slug: "word-docx-exam-paper-generator",
    shortLabel: "Word (.docx) & 1-Page PDF Paper Maker",
    h1: "Download Exam Papers in Editable Microsoft Word (.docx) & 1-Page PDF",
    title: "Exam Paper Maker with Microsoft Word (.docx) & 1-Page PDF Download",
    description:
      "Generate school and academy exam papers online and download them as fully editable Microsoft Word (.docx) files or 1-page auto-fit A4 PDFs with answer keys.",
    keywords: [
      "download exam paper in word",
      "docx paper generator",
      "editable word test maker",
      "1 page pdf exam generator",
      "2 tests on 1 page paper maker",
    ],
    intro:
      "Need to tweak formatting in MS Word or fit two tests onto a single A4 sheet? PaperWala exports clean, structured .docx documents and 1-page print layouts.",
    points: [
      "One-click Microsoft Word (.docx) download with tables, headers, and Urdu text",
      "1-Page and 2-Per-Page (Duplex) A4, Letter, and Legal print modes",
      "Automatic MCQ Answer Key and OMR Bubble Sheet",
      "Custom academy logo, watermark, and decorative page border",
    ],
    faqs: commonFaqs("Word and PDF export"),
  },
  {
    slug: "online-paper-maker-pakistan",
    shortLabel: "Online Paper Maker Pakistan",
    h1: "Online Paper Maker for Pakistani Schools and Academies",
    title: "Online Paper Maker Pakistan - Exam Paper Generator for Schools & Academies",
    description:
      "PaperWala is an online exam paper maker for Pakistan: BISE and FBISE patterns, question bank, AI quick paper, school branding, answer keys, Word and PDF export. From Rs. 30 per paper.",
    keywords: [
      "paper maker",
      "online paper maker",
      "exam paper generator pakistan",
      "paper generator for teachers",
      "test paper maker",
      "paper wala",
      "school test generator software pakistan",
    ],
    intro:
      "PaperWala helps teachers, schools and academies prepare exam papers in minutes instead of hours, with the exact layout Pakistani boards expect.",
    points: [
      "Board question bank plus AI Quick Paper from any text or image",
      "Your own saved template: logo, header, fonts and instructions",
      "Answer key and OMR bubble sheet included",
      "Simple pricing: Rs. 30 per paper or Rs. 2,000 per month",
    ],
    faqs: commonFaqs("Pakistani schools"),
  },
];

export function getLanding(slug: string) {
  return SEO_LANDINGS.find((l) => l.slug === slug);
}
