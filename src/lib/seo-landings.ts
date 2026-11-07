export type SeoLandingCategory = "board" | "class" | "subject" | "feature";

export interface SeoLanding {
  slug: string;
  shortLabel: string;
  category: SeoLandingCategory;
  urduSubtitle?: string;
  h1: string;
  title: string;
  description: string;
  keywords: string[];
  intro: string;
  highlights?: { label: string; value: string }[];
  points: string[];
  syllabusDetails?: {
    heading: string;
    body: string;
    items: string[];
  };
  primaryCtaHref?: string;
  primaryCtaLabel?: string;
  faqs: { q: string; a: string }[];
}

export const SEO_CATEGORY_META: Record<
  SeoLandingCategory,
  { title: string; badge: string; description: string }
> = {
  board: {
    title: "Punjab BISE & Federal Board (FBISE) Paper Makers",
    badge: "Educational Boards",
    description:
      "Dedicated online paper makers formatted for all 9 Punjab Boards (BISE) and Federal Board Islamabad (FBISE) pairing schemes, roll-number headers, and bilingual layouts.",
  },
  class: {
    title: "Matric & Intermediate Class Paper Makers",
    badge: "Classes & Streams",
    description:
      "Generate chapter-wise tests, monthly exams, send-ups, and pre-board question papers for 9th, 10th, 1st Year (11th), and 2nd Year (12th) across FSc and ICS streams.",
  },
  subject: {
    title: "Subject-Wise Exam Paper Generators",
    badge: "Subjects",
    description:
      "Specialized paper makers with KaTeX math formulas, Python & code blocks, chemical equations, and authentic Noto Nastaliq Urdu typography without InPage.",
  },
  feature: {
    title: "Bilingual Urdu, Word (.docx) & Academy Paper Tools",
    badge: "Features & Export",
    description:
      "Export editable Microsoft Word (.docx) files, 1-page A4 PDFs, shuffled Paper Codes A/B/C/D, OMR bubble sheets, and AI-translated English-Urdu papers.",
  },
};

const pricingFaq = (label: string) => ({
  q: `What does PaperWala cost for ${label} papers?`,
  a: `You can explore PaperWala and test AI topic search online. Generating and exporting print-ready PDF or editable Word (.docx) ${label} papers starts at Rs. 30 per paper (Pay-As-You-Go) or Rs. 2,000/month for unlimited school and academy papers.`,
});

interface BiseBoardSpec {
  slug: string;
  city: string;
  cityUr: string;
  districts: string;
  academyHubNote: string;
  extraKeyword: string;
}

const PUNJAB_BISE_SPECS: BiseBoardSpec[] = [
  {
    slug: "bise-lahore-paper-maker",
    city: "Lahore",
    cityUr: "لاہور",
    districts: "Lahore, Kasur, Sheikhupura, and Nankana Sahib",
    academyHubNote:
      "Built for high-volume schools and evening coaching academies across Johar Town, Gulberg, Iqbal Town, Model Town, Kasur, and Sheikhupura running daily and weekly test sessions.",
    extraKeyword: "lahore board pairing scheme paper maker",
  },
  {
    slug: "bise-gujranwala-paper-maker",
    city: "Gujranwala",
    cityUr: "گوجرانوالہ",
    districts: "Gujranwala, Sialkot, Gujrat, Narowal, Hafizabad, and Mandi Bahauddin",
    academyHubNote:
      "Tailored for schools, science colleges, and academies across Gujranwala division—including Sialkot, Gujrat, Wazirabad, Kamoke, and Narowal—following official BISE Gujranwala pairing schemes.",
    extraKeyword: "gujranwala board test paper generator",
  },
  {
    slug: "bise-rawalpindi-paper-maker",
    city: "Rawalpindi",
    cityUr: "راولپنڈی",
    districts: "Rawalpindi, Attock, Chakwal, Jhelum, Murree, and Talagang",
    academyHubNote:
      "Ideal for Potohar-region institutions that teach either BISE Rawalpindi or dual BISE + FBISE sections, letting teachers switch between Punjab Board and Federal Board headers in one click.",
    extraKeyword: "rawalpindi board exam paper maker",
  },
  {
    slug: "bise-faisalabad-paper-maker",
    city: "Faisalabad",
    cityUr: "فیصل آباد",
    districts: "Faisalabad, Jhang, Toba Tek Singh, and Chiniot",
    academyHubNote:
      "Designed for Faisalabad division campuses, science academies, and private school networks preparing Matric and FSc/ICS students with bilingual Urdu Nastaliq and English test papers.",
    extraKeyword: "faisalabad board paper generator online",
  },
  {
    slug: "bise-multan-paper-maker",
    city: "Multan",
    cityUr: "ملتان",
    districts: "Multan, Khanewal, Vehari, and Lodhran",
    academyHubNote:
      "Trusted workflow for South Punjab schools and coaching centers across Multan, Bosan Road academy hubs, Khanewal, Burewala, Vehari, and Lodhran running chapter-wise and send-up series.",
    extraKeyword: "multan board paper maker online",
  },
  {
    slug: "bise-sargodha-paper-maker",
    city: "Sargodha",
    cityUr: "سرگودھا",
    districts: "Sargodha, Khushab, Mianwali, and Bhakkar",
    academyHubNote:
      "Supports Urdu-medium, English-medium, and bilingual classrooms across Sargodha, Bhalwal, Jauharabad, Mianwali, and Bhakkar without requiring a dedicated InPage operator.",
    extraKeyword: "sargodha board test generator",
  },
  {
    slug: "bise-bahawalpur-paper-maker",
    city: "Bahawalpur",
    cityUr: "بہاولپور",
    districts: "Bahawalpur, Bahawalnagar, and Rahim Yar Khan",
    academyHubNote:
      "Helps schools and academies in Bahawalpur, Sadiqabad, Khanpur, Rahim Yar Khan, and Bahawalnagar print 2-tests-on-1-page A4 papers to cut photocopy expenses in half.",
    extraKeyword: "bahawalpur board exam paper generator",
  },
  {
    slug: "bise-dg-khan-paper-maker",
    city: "DG Khan",
    cityUr: "ڈیرہ غازی خان",
    districts: "Dera Ghazi Khan, Muzaffargarh, Layyah, and Rajanpur",
    academyHubNote:
      "Gives teachers in Dera Ghazi Khan, Muzaffargarh, Kot Addu, Layyah, and Rajanpur instant access to clean Nastaliq Urdu and KaTeX math papers right from a laptop or phone browser.",
    extraKeyword: "dera ghazi khan board paper maker",
  },
  {
    slug: "bise-sahiwal-paper-maker",
    city: "Sahiwal",
    cityUr: "ساہیوال",
    districts: "Sahiwal, Okara, and Pakpattan",
    academyHubNote:
      "Built for Sahiwal, Okara, Depalpur, Renala Khurd, and Pakpattan schools and academies running structured weekly test series, mid-terms, and pre-board examinations.",
    extraKeyword: "sahiwal board paper generator online",
  },
];

function buildPunjabBoardLanding(spec: BiseBoardSpec): SeoLanding {
  const boardName = `BISE ${spec.city}`;
  return {
    slug: spec.slug,
    shortLabel: `${boardName} Paper Maker`,
    category: "board",
    urduSubtitle: `${spec.cityUr} بورڈ (${boardName}) پیٹرن کے مطابق نویں، دسویں اور انٹر کے امتحانی پرچے آن لائن تیار کریں`,
    h1: `${boardName} Paper Maker Online – Official Board Pattern Generator`,
    title: `${boardName} Paper Maker – Matric & Inter Pattern`,
    description: `Create ${boardName} board-pattern exam papers online in 60s for 9th, 10th, FSc & ICS. Bilingual Urdu Nastaliq, OMR, PDF & Word export.`,
    keywords: [
      `${boardName.toLowerCase()} paper maker`,
      `${boardName.toLowerCase()} paper generator`,
      `${spec.city.toLowerCase()} board paper maker`,
      `${boardName.toLowerCase()} model paper`,
      spec.extraKeyword,
      "punjab board paper maker",
      `${spec.cityUr} بورڈ پیپر میکر`,
    ],
    intro: `Prepare print-ready ${boardName} examination papers for schools, colleges, and coaching academies across ${spec.districts}. PaperWala formats your Objective MCQs and Subjective Short/Long Questions according to the official Punjab Textbook Board (PCTB) 2026–27 syllabus and ${boardName} pairing scheme.`,
    highlights: [
      { label: "Jurisdiction", value: spec.districts },
      { label: "Classes Covered", value: "9th, 10th, 1st Year & 2nd Year" },
      { label: "Mediums", value: "Bilingual, English & Urdu Nastaliq" },
      { label: "Downloads", value: "1-Page PDF, Word (.docx) & Answer Key" },
    ],
    points: [
      `Exact ${boardName} SSC (Matric) and HSSC (FSc / ICS) section divisions and marks tags`,
      "Side-by-side English and Noto Nastaliq Urdu columns without installing InPage",
      "Shuffled Paper Codes A, B, C, and D with OMR bubble sheets and teacher answer keys",
      "Custom school or academy name, crest logo, exam title, time allowed, and watermark",
    ],
    syllabusDetails: {
      heading: `${boardName} Exam Pattern & Regional Coverage`,
      body: spec.academyHubNote,
      items: [
        `Objective Paper (Part-I): 4-option MCQ table with ${boardName} paper code box (A/B/C/D) and optional OMR bubble strip`,
        "Subjective Paper (Part-II, Section-I): 2-mark Short Questions grouped with board-style choice prompts (e.g., Attempt any 5 out of 8)",
        "Subjective Paper (Part-II, Section-II): Detailed Long Questions with (a) and (b) part subdivisions and exact mark allocations",
        "Syllabus Alignment: Updated for PCTB 2026–27 Matric & Intermediate textbooks plus AI Topic Search for any SLO concept",
      ],
    },
    faqs: [
      {
        q: `Does PaperWala follow the ${boardName} 2026–27 pairing scheme and syllabus?`,
        a: `Yes. PaperWala follows the Punjab Curriculum and Textbook Board (PCTB) syllabus used by ${boardName} across ${spec.districts}, with 1-click board pattern selection for MCQs, Short Questions, and Long Questions.`,
      },
      {
        q: `Can schools in ${spec.city} add their own logo and header instead of ${boardName}?`,
        a: "Yes. You keep the official board section structure while displaying your own school, college, or academy name, monogram, campus address, and test title at the top of every paper.",
      },
      {
        q: "Can I export the paper in editable Microsoft Word (.docx) and Urdu Nastaliq?",
        a: "Yes. Every paper can be printed directly as a 1-page or 2-per-page A4 PDF or downloaded as an editable Microsoft Word (.docx) file with aligned Urdu Nastaliq and English text.",
      },
      pricingFaq(boardName),
    ],
  };
}

export const SEO_LANDINGS: SeoLanding[] = [
  // =========================================================================
  // BOARDS (All Punjab BISE Overview + 9 Individual BISE Boards + FBISE)
  // =========================================================================
  {
    slug: "bise-punjab-board-paper-maker",
    shortLabel: "Punjab Board (All BISE)",
    category: "board",
    urduSubtitle: "تمام 9 پنجاب بورڈز (BISE) کے پیٹرن کے مطابق آن لائن امتحانی پرچے تیار کریں",
    h1: "Punjab Board (BISE) Exam Paper Maker Online",
    title: "Punjab Board (BISE) Paper Maker – All 9 Boards Pattern",
    description:
      "Create official Punjab Board (BISE) pattern papers for Lahore, Gujranwala, Rawalpindi, Faisalabad, Multan, Sargodha, Bahawalpur, DG Khan & Sahiwal in 60 seconds.",
    keywords: [
      "punjab board paper maker",
      "bise lahore paper generator",
      "bise gujranwala paper maker",
      "bise faisalabad test generator",
      "bise rawalpindi paper maker",
      "bise multan paper generator",
      "punjab board pairing scheme paper generator",
      "پنجاب بورڈ پیپر میکر",
    ],
    intro:
      "Generate examination papers matching all 9 Punjab Boards (BISE) pairing schemes, section divisions, marks distribution, and bilingual English + Urdu Nastaliq layout.",
    highlights: [
      { label: "Boards Supported", value: "All 9 Punjab BISE Boards" },
      { label: "Syllabus", value: "PCTB 2026–27 Matric & Inter" },
      { label: "Anti-Cheating", value: "Paper Codes A, B, C & D + OMR" },
      { label: "Paper Saving", value: "1-Page & 2-Tests-on-1-Page Modes" },
    ],
    points: [
      "Matches all 9 BISE Punjab Board examination layouts and marks distribution",
      "1-Click Automatic Board Pattern question selection from chapter-wise bank",
      "Bilingual side-by-side English and Urdu Nastaliq columns without InPage",
      "2-Tests-on-1-Page landscape mode to save 50% photocopy costs for academies",
    ],
    syllabusDetails: {
      heading: "Standardized Across All 9 Punjab Educational Boards",
      body: "All nine BISE boards in Punjab share the Punjab Curriculum & Textbook Board (PCTB) syllabus and unified SSC/HSSC examination format. PaperWala automates the tedious table alignment, Urdu right-to-left formatting, and marks calculation.",
      items: [
        "Covers BISE Lahore, Gujranwala, Rawalpindi, Faisalabad, Multan, Sargodha, Bahawalpur, DG Khan, and Sahiwal",
        "Supports daily class tests, weekly academy series, monthly assessments, send-ups, and pre-board exams",
        "AI Bilingual Converter translates English-only or Urdu-only questions into side-by-side bilingual papers",
        "Instant teacher grading key generated for every shuffled MCQ paper version",
      ],
    },
    faqs: [
      {
        q: "Do all 9 Punjab BISE boards use the same paper layout in PaperWala?",
        a: "Yes. All 9 Punjab Boards follow the unified PCTB curriculum and objective/subjective marks structure. You can customize total marks, attempt choices, and header details for any short test or full board exam.",
      },
      {
        q: "Can I get the paper in both Urdu Nastaliq and English?",
        a: "Yes. Choose Bilingual (side-by-side English and Urdu), English-only, or Urdu-only. AI can also translate questions between English and Urdu in one click.",
      },
      {
        q: "Can I save my school or academy header template?",
        a: "Yes. Save your institution name, logo, watermark, and default instructions once in your profile so every new paper uses your branding automatically.",
      },
      pricingFaq("Punjab Board (BISE)"),
    ],
  },

  ...PUNJAB_BISE_SPECS.map(buildPunjabBoardLanding),

  {
    slug: "fbise-federal-board-paper-maker",
    shortLabel: "FBISE Federal Board",
    category: "board",
    urduSubtitle: "فیڈرل بورڈ اسلام آباد (FBISE) کے SLO پیٹرن کے مطابق آن لائن پیپر جنریٹر",
    h1: "Federal Board (FBISE) SLO-Based Paper Maker Online",
    title: "FBISE Paper Maker Online – Federal Board SLO Generator",
    description:
      "Build Federal Board (FBISE Islamabad) SLO-based examination papers online with official header formatting, version codes, OMR bubble sheets, PDF & Word export.",
    keywords: [
      "fbise paper maker",
      "federal board paper generator",
      "fbise slo based paper generator",
      "fbise slo paper maker",
      "federal board model paper generator",
      "fbise exam header template",
      "فیڈرل بورڈ پیپر میکر",
    ],
    intro:
      "Switch to the dedicated Federal Board (FBISE Islamabad) header and table layout in one click—complete with candidate roll-number boxes, version codes, SLO-focused questions, and structured Sections A, B, and C.",
    highlights: [
      { label: "Board Format", value: "FBISE Islamabad (SSC-I/II & HSSC-I/II)" },
      { label: "Question Style", value: "SLO-Based Conceptual + Textbook Bank" },
      { label: "Header Grid", value: "Roll No. Boxes, Version Code & Sig. Block" },
      { label: "Export Options", value: "Print-Ready PDF & Editable Word (.docx)" },
    ],
    points: [
      "Dedicated FBISE table header with candidate roll-number digit boxes",
      "AI Topic Search & AI Quick Paper Maker to generate conceptual SLO-based questions on any topic",
      "Supports Version A, B, C, D shuffled MCQ codes with OMR bubble sheets and answer keys",
      "Download as editable Microsoft Word (.docx) or print-ready A4 PDF",
    ],
    syllabusDetails: {
      heading: "Built for FBISE Affiliated Schools, Colleges & Cantt/Fazaia Campuses",
      body: "Federal Board exams emphasize Student Learning Outcomes (SLOs), analytical short questions, and structured headers. PaperWala combines a dedicated FBISE header preset with AI SLO question generation.",
      items: [
        "Section-A (Objective): Timed MCQ sheet with roll-number boxes, version code, and OMR bubbles",
        "Section-B & Section-C (Subjective): Analytical short-response and extended-response questions with clear mark tags",
        "AI SLO Generator: Enter any National Curriculum SLO or topic in AI Quick Paper to produce conceptual MCQs and short questions",
        "Works for FBISE schools across Islamabad, Rawalpindi, Cantt/Garrison campuses, and overseas Pakistani schools",
      ],
    },
    faqs: [
      {
        q: "How do I create conceptual SLO-based questions for Federal Board (FBISE)?",
        a: "Use the AI Topic Search on the Question Bank or open AI Quick Paper (/quick-paper), type your syllabus SLO or topic, and generate conceptual MCQs, short questions, and long questions with bilingual support.",
      },
      {
        q: "Does PaperWala include the Federal Board roll-number box header?",
        a: "Yes. In the Live Paper Editor template settings, select the FBISE header style to display the structured Federal Board roll-number grid, version code, and time/marks table.",
      },
      {
        q: "Can overseas FBISE schools use PaperWala?",
        a: "Yes. PaperWala runs in any modern browser worldwide and exports standard A4/Letter PDFs and Microsoft Word (.docx) documents.",
      },
      pricingFaq("Federal Board (FBISE)"),
    ],
  },

  // =========================================================================
  // CLASSES & STREAMS (9th, 10th, 1st Year, 2nd Year, FSc & ICS)
  // =========================================================================
  {
    slug: "9th-class-paper-maker",
    shortLabel: "9th Class Paper Maker",
    category: "class",
    urduSubtitle: "نویں جماعت (میٹرک پارٹ 1) کے بورڈ پیٹرن امتحانی پرچے آن لائن تیار کریں",
    h1: "9th Class Paper Maker Online (Matric Part-I Board Pattern)",
    title: "9th Class Paper Maker Online – Matric Part-1 Generator",
    description:
      "Make 9th class exam papers online in 60 seconds. 2026-27 syllabus chapter-wise MCQs, short & long questions, bilingual Urdu/English, PDF and Word download.",
    keywords: [
      "9th class paper maker",
      "9th class paper generator",
      "matric part 1 paper maker",
      "matric paper maker",
      "9th class model paper",
      "BISE paper pattern 9th",
      "9th class chapter wise test maker",
      "نویں کلاس پیپر میکر",
    ],
    intro:
      "Create complete 9th class chapter tests, monthly exams, send-ups, or full-book papers aligned with the 2026–27 syllabus. Pick your chapters, auto-fill the board pattern, customize your school header, and export.",
    highlights: [
      { label: "Level", value: "SSC Part-I / Class 9 (Science & Arts)" },
      { label: "Syllabus", value: "Updated 2026–27 New Syllabus Ready" },
      { label: "Test Types", value: "Chapter Test, Monthly, Half-Book & Full-Book" },
      { label: "Languages", value: "Bilingual, English Medium & Urdu Medium" },
    ],
    points: [
      "Chapter-wise MCQs, short questions, and long questions for 9th class subjects",
      "Punjab Board (BISE) and Federal Board (FBISE) paper layouts",
      "OMR bubble sheet and automatic grading answer key included",
      "Paper versions A, B, C, and D with shuffled MCQs to prevent copying",
    ],
    syllabusDetails: {
      heading: "9th Class Assessment Formats Supported",
      body: "9th class students face their very first board examination, so regular practice on authentic board-style sheets builds exam confidence and time management.",
      items: [
        "25-Mark & 30-Mark Daily/Weekly Chapter Tests (2-per-page landscape mode saves paper)",
        "50-Mark Computer Science & 60-Mark Physics, Chemistry, and Biology board-pattern papers",
        "75-Mark Mathematics, English, and Urdu full-length send-up and pre-board papers",
        "Instant AI Topic Search to pull extra MCQs and short questions on any 9th-grade chapter concept",
      ],
    },
    faqs: [
      {
        q: "Does the 9th class paper maker support the new 2026–27 syllabus?",
        a: "Yes. PaperWala supports the updated 2026–27 curriculum and also lets you generate or scan questions from any newly revised textbook chapter using AI Quick Paper and OCR.",
      },
      {
        q: "Can I make a short 25-mark weekly test for 9th class instead of a full board paper?",
        a: "Yes. You can pick exact counts of MCQs, short questions, and long questions for a 20, 25, or 30-mark test and print two copies on a single A4 page.",
      },
      {
        q: "Can I add my school name and logo?",
        a: "Yes. Save your school name, logo, and layout once in your profile, and every 9th class paper uses your branding automatically.",
      },
      pricingFaq("9th class"),
    ],
  },
  {
    slug: "10th-class-paper-maker",
    shortLabel: "10th Class Paper Maker",
    category: "class",
    urduSubtitle: "دسویں جماعت (میٹرک پارٹ 2) کے بورڈ پیٹرن ٹیسٹ اور پری بورڈ پیپرز تیار کریں",
    h1: "10th Class Paper Maker Online (Matric Board Pattern)",
    title: "10th Class Paper Maker Online – Matric Paper Generator",
    description:
      "Generate 10th class board-pattern papers online: chapter-wise question bank, bilingual Urdu/English, school header & logo, OMR sheet, PDF and Word export.",
    keywords: [
      "10th class paper maker",
      "10th class paper generator",
      "matric paper maker",
      "matric part 2 paper maker",
      "10th class computer paper",
      "10th class model paper",
      "matric board paper generator online",
      "دسویں کلاس پیپر میکر",
    ],
    intro:
      "Build 10th class chapter tests, quarter-book rounds, send-ups, and pre-board papers in under a minute. Select chapters from the verified question bank, apply board marks, and print with your school or academy crest.",
    highlights: [
      { label: "Level", value: "SSC Part-II / Class 10 (Matric)" },
      { label: "Verified Bank", value: "Computer Science, Math, Physics, Chem & More" },
      { label: "Anti-Cheating", value: "4 Shuffled Codes (A, B, C, D) + Answer Keys" },
      { label: "Exports", value: "1-Page A4 PDF & Editable MS Word (.docx)" },
    ],
    points: [
      "Verified 10th class question bank including 2026–27 Computer Science, Math, Physics & Chemistry",
      "1-click board pairing scheme selection for balanced MCQs, Short & Long questions",
      "Custom school/academy name, monogram logo, watermark, and decorative page borders",
      "Editable Word (.docx) and 1-page auto-fit A4 PDF export",
    ],
    syllabusDetails: {
      heading: "Built for Matric Test Sessions, Send-Ups & Pre-Board Rounds",
      body: "During the final months before Matric board exams, schools and academies run intensive chapter-wise, half-book, and full-book test rounds. PaperWala eliminates late-night typing and formatting.",
      items: [
        "Chapter-wise & Half-Book Rounds: Combine questions across multiple chapters in seconds",
        "Shuffled Batch Versions: Hand out Codes A, B, C, and D in packed academy halls",
        "Bilingual Precision: English and Urdu Nastaliq appear side by side just like real BISE papers",
        "Teacher Grading Keys: Print separate MCQ answer keys for rapid checking of large Matric batches",
      ],
    },
    faqs: [
      {
        q: "Which 10th class subjects are available in PaperWala?",
        a: "PaperWala includes verified syllabus chapters for 10th Class Computer Science (Operating Systems, System Recovery, Python Programming, Digital Entrepreneurship), Mathematics, Physics, and Chemistry, plus AI topic generation and OCR scanning for Biology, English, Urdu, Islamiat, and Pak Studies.",
      },
      {
        q: "Can I create 4 shuffled MCQ versions for my academy's 10th class test session?",
        a: "Yes. Toggle Paper Codes A, B, C, and D in the Paper Editor to shuffle MCQ order and receive matching answer keys for each code.",
      },
      {
        q: "Can I edit a 10th class paper in Microsoft Word after generating it?",
        a: "Yes. Click Download Word (.docx) to get a cleanly structured table document you can open and customize in MS Word.",
      },
      pricingFaq("10th class"),
    ],
  },
  {
    slug: "1st-year-11th-class-paper-maker",
    shortLabel: "1st Year (11th) Paper Maker",
    category: "class",
    urduSubtitle: "فرسٹ ایئر (گیارہویں جماعت / انٹر پارٹ 1) کے ایف ایس سی اور آئی سی ایس پیپرز آن لائن بنائیں",
    h1: "1st Year (11th Class) Paper Maker Online – FSc & ICS Part-I",
    title: "1st Year (11th Class) Paper Maker – FSc & ICS Generator",
    description:
      "Create 1st Year (11th class / HSSC Part-I) exam papers online for FSc Pre-Medical, Pre-Engineering & ICS. KaTeX math formulas, Urdu/English, PDF & Word export.",
    keywords: [
      "1st year paper maker",
      "11th class paper generator",
      "11th class paper maker",
      "hssc part 1 paper maker",
      "fsc part 1 paper generator",
      "ics part 1 test maker",
      "انٹر پیپر میکر",
    ],
    intro:
      "Prepare college-standard 1st Year (Class 11 / HSSC Part-I) test papers for FSc Pre-Medical, FSc Pre-Engineering, ICS, and Humanities. Render complex math, physics, and chemistry equations cleanly alongside college branding.",
    highlights: [
      { label: "Level", value: "HSSC Part-I / 1st Year (Class 11)" },
      { label: "Streams", value: "FSc Pre-Med, Pre-Eng, ICS & Arts" },
      { label: "Typesetting", value: "KaTeX Calculus/Vectors + Code Blocks" },
      { label: "Board Styles", value: "All 9 Punjab BISE & FBISE Islamabad" },
    ],
    points: [
      "85-mark Science/ICS and 100-mark Mathematics & English HSSC Part-I board layouts",
      "Crisp KaTeX mathematical equations, Greek symbols, matrices, and chemical formulas",
      "AI Quick Paper & OCR Scanner to turn any college lecturer's notes or textbook page into a formatted test",
      "Shuffled Paper Codes A–D with OMR bubble sheets for entry-test style practice",
    ],
    syllabusDetails: {
      heading: "Designed for Intermediate Colleges & Evening Coaching Academies",
      body: "1st Year papers involve longer subjective sections (8 out of 12 short questions, 3 out of 5 long questions) and dense scientific notation that breaks ordinary word processors.",
      items: [
        "Supports standard HSSC marks splits: 17/20 MCQs + multi-group Short Questions + two-part Long Questions",
        "Native rendering for trigonometry, matrices, vectors, thermodynamics equations, and C/Python code",
        "Reusable college header template for monthly tests, December exams, and send-up examinations",
        "Export to 1-page A4 PDF for quick quizzes or multi-page board booklet format for full 3-hour exams",
      ],
    },
    faqs: [
      {
        q: "Does PaperWala handle 1st Year Mathematics matrices, limits, and trigonometry symbols?",
        a: "Yes. PaperWala uses KaTeX mathematical typesetting so fractions, matrices, square roots, Greek letters, and trigonometric identities print sharply without blurry pasted screenshots.",
      },
      {
        q: "Can college lecturers paste their own 1st Year questions into PaperWala?",
        a: "Yes. Use AI Quick Paper (/quick-paper) to paste raw typed questions, upload a photo of a book page via OCR, or generate topic-specific HSSC Part-I questions in seconds.",
      },
      pricingFaq("1st Year (11th class)"),
    ],
  },
  {
    slug: "2nd-year-12th-class-paper-maker",
    shortLabel: "2nd Year (12th) Paper Maker",
    category: "class",
    urduSubtitle: "سیکنڈ ایئر (بارہویں جماعت / انٹر پارٹ 2) کے پری بورڈ اور ٹیسٹ سیشن پرچے تیار کریں",
    h1: "2nd Year (12th Class) Paper Maker Online – FSc & ICS Part-II",
    title: "2nd Year (12th Class) Paper Maker – Inter Part-2 Studio",
    description:
      "Generate 2nd Year (12th class / HSSC Part-II) board-pattern exam papers online for FSc & ICS. Calculus, organic chemistry, programming, OMR & Word/PDF export.",
    keywords: [
      "2nd year paper maker",
      "12th class paper generator",
      "12th class paper maker",
      "hssc part 2 paper generator",
      "fsc part 2 paper maker",
      "ics part 2 paper generator",
      "pre board paper generator",
    ],
    intro:
      "Run structured 2nd Year (Class 12 / HSSC Part-II) weekly tests, grand test series, send-ups, and pre-board exams for FSc and ICS batches—complete with calculus integrals, organic chemistry structures, and C/database questions.",
    highlights: [
      { label: "Level", value: "HSSC Part-II / 2nd Year (Class 12)" },
      { label: "Ideal For", value: "Academy Test Sessions, Send-Ups & Pre-Boards" },
      { label: "OMR Ready", value: "Bubble Sheets + 4 Shuffled MCQ Codes" },
      { label: "Output", value: "Editable Word (.docx) & Print-Ready PDF" },
    ],
    points: [
      "Handles 2nd Year derivatives, integrals, electromagnetism equations, and C/SQL syntax cleanly",
      "4 anti-cheating MCQ versions (A, B, C, D) ideal for large 2nd Year academy test halls",
      "OMR bubble sheets prepare HSSC Part-II students for board objective sheets and MDCAT/ECAT drills",
      "Download editable MS Word (.docx) or print 1-page / multi-page A4 PDFs immediately",
    ],
    syllabusDetails: {
      heading: "Built for High-Stakes 2nd Year Pre-Board & Grand Test Series",
      body: "In 2nd Year, academies run back-to-back chapter, quarter-book, half-book, and full-book tests right up to board exams and entry tests. PaperWala keeps formatting consistent across every subject department.",
      items: [
        "Mathematics Part-II: Clean differentiation, integration, analytic geometry, and linear inequalities notation",
        "Physics & Chemistry Part-II: Electrostatics, nuclear physics, and organic/inorganic reaction equations",
        "ICS Part-II Computer Science: Databases (MS Access/SQL) and C/Python programming questions with code formatting",
        "Instant Answer Keys: Hand checking keys to invigilators the moment the paper is printed",
      ],
    },
    faqs: [
      {
        q: "Can academies run full 2nd Year pre-board series on PaperWala?",
        a: "Yes. With the Rs. 2,000/month unlimited plan, academies can generate unlimited chapter-wise, half-book, and full-book pre-board papers across all 2nd Year subjects and batches.",
      },
      {
        q: "Does PaperWala include OMR bubble sheets for 2nd Year MCQ tests?",
        a: "Yes. You can enable the 4-option OMR bubble sheet and shuffled Paper Codes A–D on any 2nd Year objective test.",
      },
      pricingFaq("2nd Year (12th class)"),
    ],
  },
  {
    slug: "fsc-ics-paper-maker",
    shortLabel: "FSc & ICS Paper Maker",
    category: "class",
    urduSubtitle: "ایف ایس سی (پری میڈیکل / پری انجینئرنگ) اور آئی سی ایس کالجز کے لیے آن لائن پیپر میکر",
    h1: "FSc and ICS Paper Maker Online (1st & 2nd Year)",
    title: "FSc & ICS Paper Maker Online – Intermediate Exam Studio",
    description:
      "Online paper maker for FSc Pre-Medical, FSc Pre-Engineering & ICS (11th & 12th class). Create board-pattern papers with KaTeX math, code, Urdu/English & Word/PDF.",
    keywords: [
      "fsc paper maker",
      "ics paper maker",
      "1st year paper generator",
      "2nd year paper maker",
      "intermediate paper maker online",
      "11th 12th class test generator",
      "انٹر پیپر میکر",
    ],
    intro:
      "Make intermediate papers for colleges and coaching academies with scientific equations, programming code blocks, bilingual text, and an official BISE or FBISE college header.",
    highlights: [
      { label: "Tracks", value: "FSc Pre-Medical, FSc Pre-Eng & ICS" },
      { label: "Classes", value: "Part-I (11th) & Part-II (12th)" },
      { label: "Formulas", value: "Native KaTeX Math & Monospace Code" },
      { label: "Branding", value: "Saved College Crest, Watermark & Header" },
    ],
    points: [
      "Formula-accurate Physics, Chemistry, and Mathematics questions with KaTeX rendering",
      "Part-I and Part-II Punjab BISE & Federal Board HSSC layouts",
      "Shuffled versions A, B, C, and D to prevent hall cheating",
      "Save your college or academy template once for every department",
    ],
    syllabusDetails: {
      heading: "One Platform for Pre-Medical, Pre-Engineering & ICS Departments",
      body: "Colleges no longer need separate tools for Math equations, Computer code, and Urdu/Islamiat compulsory papers.",
      items: [
        "FSc Pre-Medical: Biology, Physics, and Chemistry 85-mark board layouts with diagrams/terminology support",
        "FSc Pre-Engineering: 100-mark Mathematics + 85-mark Physics & Chemistry with full symbolic typesetting",
        "ICS (Computer Science): 75/85-mark Computer Science papers with clean indentation for code output questions",
        "Compulsory Subjects: English, Urdu Nastaliq, Islamiat, and Pakistan Studies on the same college header",
      ],
    },
    faqs: [
      {
        q: "Can different subject lecturers in a college share the same header style?",
        a: "Yes. Save your college name, crest, watermark, and font preferences as your template so Science, Computer, and Humanities papers look uniform.",
      },
      {
        q: "Does PaperWala support both BISE and FBISE intermediate patterns?",
        a: "Yes. Switch between Punjab BISE and Federal Board (FBISE) header and section layouts in the Paper Editor.",
      },
      pricingFaq("FSc and ICS"),
    ],
  },

  // =========================================================================
  // SUBJECTS (10th CS, 9th CS, Math, Physics, Chemistry, Biology, English, Urdu/Isl/PakSt)
  // =========================================================================
  {
    slug: "10th-class-computer-science-paper-maker",
    shortLabel: "10th Computer Science",
    category: "subject",
    urduSubtitle: "دسویں کلاس کمپیوٹر سائنس (نیا نصاب 2026-27: آپریٹنگ سسٹمز اور پائتھن پروگرامنگ) پیپر میکر",
    h1: "10th Class Computer Science Paper Maker (2026–27 New Syllabus)",
    title: "10th Class Computer Science Paper Maker – Python & OS",
    description:
      "Create 10th class Computer Science test papers from 785+ verified bilingual questions: Operating Systems, System Recovery, Python & Digital Entrepreneurship.",
    keywords: [
      "10th class computer science paper",
      "class 10 computer science test paper",
      "10th class computer science chapter wise questions",
      "python programming 10th class mcqs",
      "operating system 10th class short questions",
      "2026-27 new syllabus paper maker",
      "10th computer paper maker online",
    ],
    intro:
      "Generate chapter-wise and full-book 10th Class Computer Science papers aligned with the updated 2026–27 PCTB syllabus. Choose verified bilingual questions on Operating Systems, System Recovery, Python Programming, and Digital Entrepreneurship—with English and Urdu Nastaliq side by side.",
    highlights: [
      { label: "Active Bank", value: "785+ Verified Bilingual CS Questions" },
      { label: "Syllabus", value: "New 2026–27 PCTB (Python & OS)" },
      { label: "Board Marks", value: "50 Marks (10 MCQs + Short + Long Qs)" },
      { label: "Code Support", value: "Clean Python Syntax & Output Blocks" },
    ],
    points: [
      "Ready-made verified bank for Unit 1 (Operating Systems), Unit 2 (System Recovery), Unit 3 (Python Programming) & Unit 8 (Digital Entrepreneurship)",
      "Bilingual English + Urdu Nastaliq translations for every MCQ, Short Question, and Long Question",
      "1-Click 50-Mark Board Pattern (10 MCQs, Short Question sections, and 8-mark Long Questions)",
      "Export editable Word (.docx) or 1-page A4 PDF with Python code preserved cleanly",
    ],
    syllabusDetails: {
      heading: "2026–27 Class 10 Computer Science Chapters & Question Types",
      body: "With the syllabus shift from C to Python Programming and modern system administration, teachers need fresh, accurate chapter-wise test banks rather than outdated past papers.",
      items: [
        "Unit 1 – Operating Systems: Structure and Services (process states, memory management, kernel & OS functions)",
        "Unit 2 – System Recovery and Advanced Maintenance (backup strategies, troubleshooting, recovery tools)",
        "Unit 3 – Introduction to Python Programming (variables, data types, operators, loops, conditionals & code-tracing MCQs)",
        "Unit 8 – Digital Entrepreneurship (digital business models, e-commerce, freelancing & startup concepts)",
      ],
    },
    primaryCtaHref: "/select-questions?chapter=3",
    primaryCtaLabel: "Open 10th Computer Question Bank",
    faqs: [
      {
        q: "Does PaperWala include Python programming MCQs and short questions for 10th class?",
        a: "Yes! Unit 3 (Introduction to Python Programming) includes verified exercise, extra, and conceptual MCQs, short questions, and programming long questions in both English and Urdu.",
      },
      {
        q: "Are Operating Systems (Chapter 1) short and long questions available in Urdu and English?",
        a: "Yes. Every question in Unit 1 (Operating Systems: Structure and Services) includes side-by-side English and authentic Noto Nastaliq Urdu text.",
      },
      {
        q: "What is the 10th Class Computer Science board paper pattern?",
        a: "Standard BISE 10th Computer Science papers carry 50 marks: 10 MCQs (10 marks), 3 sections of Short Questions (attempt 4 out of 6 in each = 24 marks), and Long Questions (attempt 2 out of 3, 8 marks each = 16 marks). PaperWala builds this pattern in one click.",
      },
      pricingFaq("10th Class Computer Science"),
    ],
  },
  {
    slug: "9th-class-computer-science-paper-maker",
    shortLabel: "9th Computer Science",
    category: "subject",
    urduSubtitle: "نویں جماعت کمپیوٹر سائنس کے یونٹ وائز ٹیسٹ اور بورڈ پیٹرن پرچے آن لائن تیار کریں",
    h1: "9th Class Computer Science Paper Maker Online",
    title: "9th Class Computer Science Paper Maker – Board Pattern",
    description:
      "Make 9th class Computer Science exam papers online with chapter-wise MCQs, short & long questions, bilingual English/Urdu Nastaliq, OMR sheet, PDF & Word export.",
    keywords: [
      "9th class computer science paper",
      "class 9 computer test maker",
      "9th computer chapter wise test",
      "9th class computer model paper",
      "2026-27 new syllabus computer paper 9th",
      "matric computer science paper generator",
    ],
    intro:
      "Build 9th Class Computer Science weekly quizzes, monthly tests, and 50-mark send-up papers online. Combine syllabus bank questions with AI Topic Search to generate bilingual MCQs, short questions, and long questions on any Class 9 unit.",
    highlights: [
      { label: "Class", value: "9th Class (Matric Part-I)" },
      { label: "Paper Total", value: "50 Marks Board Pattern or Custom Test" },
      { label: "Languages", value: "Bilingual English + Urdu Nastaliq" },
      { label: "Exports", value: "Word (.docx), 1-Page PDF & Answer Key" },
    ],
    points: [
      "Matches the 50-mark BISE & FBISE 9th Computer Science objective and subjective layout",
      "AI Topic Search generates fresh SLO-aligned MCQs & short questions on algorithms, hardware, networks, HTML/web & data",
      "Side-by-side English and Urdu Nastaliq formatting for bilingual Matric sections",
      "4 shuffled MCQ paper codes (A, B, C, D) with automatic teacher grading keys",
    ],
    syllabusDetails: {
      heading: "Structured for Class 9 Computer Science Teachers & Academies",
      body: "Whether your school teaches English-medium or Urdu-medium Computer Science, PaperWala keeps technical terms accurate while providing clear Urdu translations.",
      items: [
        "10-Mark Objective MCQ Grid with optional OMR bubble sheet",
        "24-Mark Short Questions split into board-style choice groups (Attempt any 4 of 6)",
        "16-Mark Long Questions (Attempt any 2 of 3) with exact marks tags",
        "Scan any new 2026–27 textbook exercise page via OCR in AI Quick Paper to build a test in seconds",
      ],
    },
    faqs: [
      {
        q: "Can I create a bilingual English + Urdu 9th Computer Science paper?",
        a: "Yes. Select Bilingual mode in the Paper Editor, or click AI Bilingual Converter to translate English Computer Science questions into clear Urdu Nastaliq while keeping technical terms understandable.",
      },
      {
        q: "Can I print two 25-mark 9th Computer tests on one A4 sheet?",
        a: "Yes. Enable 2-Per-Page mode in the Paper Editor to print two complete class tests side by side on one A4 page.",
      },
      pricingFaq("9th Class Computer Science"),
    ],
  },
  {
    slug: "mathematics-paper-maker",
    shortLabel: "Mathematics Paper Maker",
    category: "subject",
    urduSubtitle: "ریاضی (Mathematics) کے مساوات، الجبرا، ٹرگنومیٹری اور تھیورمز والے پرچے آن لائن تیار کریں",
    h1: "Mathematics Exam Paper Maker Online (9th, 10th, FSc & ICS)",
    title: "Mathematics Paper Maker Online – KaTeX Formula Studio",
    description:
      "Create 9th, 10th, 1st Year & 2nd Year Mathematics exam papers online with crisp KaTeX equations, bilingual Urdu/English statements, theorems, PDF & Word export.",
    keywords: [
      "math paper maker online",
      "mathematics exam paper generator",
      "10th class math paper maker",
      "9th class math test generator",
      "fsc math paper maker",
      "quadratic equations test maker",
      "ریاضی پیپر میکر",
    ],
    intro:
      "Stop fighting broken equation editors and blurry pasted images. PaperWala typesets fractions, radicals, quadratic equations, matrices, trigonometry, vectors, and calculus integrals natively with KaTeX alongside Urdu Nastaliq and English word problems.",
    highlights: [
      { label: "Classes", value: "9th, 10th (75 Marks) & FSc/ICS (100 Marks)" },
      { label: "Math Engine", value: "Print-Sharp KaTeX LaTeX Equations" },
      { label: "Seeded Units", value: "Quadratic Eq., Variations, Partial Fractions, Trig & Sets" },
      { label: "Bilingual", value: "English + الریاضی Urdu Nastaliq Statements" },
    ],
    points: [
      "Sharp mathematical notation for algebra, matrices, sets, trigonometry, differentiation, and integration",
      "Bilingual word problems and theorem statements in English and Urdu Nastaliq",
      "Supports compulsory Theorem question formatting (e.g., Q.9 compulsory 8-mark theorem in Matric)",
      "Download as editable Word (.docx) or print razor-sharp 1-page A4 PDFs",
    ],
    syllabusDetails: {
      heading: "Built Around Pakistani Board Mathematics Pairing Schemes",
      body: "Matric (75 marks) and Intermediate (100 marks) Mathematics papers follow strict section rules, including multiple short-question parts and compulsory geometry theorems.",
      items: [
        "Matric Math (75 Marks): 15 MCQs + 3 Short Question groups (6 out of 9 each = 36 marks) + 3 Long Questions (including compulsory 8-mark Theorem = 24 marks)",
        "Inter Math (100 Marks): 20 MCQs + 3 Short Question groups (25 attempts = 50 marks) + 3 out of 5 Long Questions (30 marks)",
        "Includes 10th Math chapters: Quadratic Equations, Theory of Quadratic Equations, Variations, Partial Fractions, Sets & Functions, Basic Statistics, and Trigonometry",
        "AI Math Generator: Type any exercise topic (e.g., Cramer's Rule or Integration by Parts) to generate ready-to-print problems",
      ],
    },
    faqs: [
      {
        q: "How does PaperWala format fractions, square roots, and matrices on printed papers?",
        a: "PaperWala renders all mathematical expressions with KaTeX typesetting, producing textbook-grade fractions, exponents, matrices, and integrals at full print resolution.",
      },
      {
        q: "Can I create Urdu-medium or Bilingual Mathematics papers?",
        a: "Yes. Math equations stay in standard left-to-right mathematical notation while question prompts render in right-to-left Noto Nastaliq Urdu alongside English.",
      },
      pricingFaq("Mathematics"),
    ],
  },
  {
    slug: "physics-paper-maker",
    shortLabel: "Physics Paper Maker",
    category: "subject",
    urduSubtitle: "فزکس (طبیعیات) کے نیومیریکلز، فارمولے اور بورڈ پیٹرن پرچے آن لائن بنائیں",
    h1: "Physics Exam Paper Maker Online (9th, 10th & FSc)",
    title: "Physics Paper Maker Online – Numericals & Board Pattern",
    description:
      "Generate 9th, 10th & FSc Physics exam papers online with SI units, KaTeX formulas, conceptual SLO short questions, theory + numerical long questions & PDF/Word.",
    keywords: [
      "physics paper maker online",
      "9th class physics paper generator",
      "10th class physics test maker",
      "fsc physics paper maker",
      "physics numerical paper generator",
      "طبیعیات پیپر میکر",
    ],
    intro:
      "Prepare balanced Physics tests combining conceptual MCQs, reasoning short questions, theoretical derivations, and 5-mark numerical problems—with proper superscripts, Greek symbols, vector notation, and SI units.",
    highlights: [
      { label: "Board Marks", value: "60 Marks (Matric) & 85 Marks (FSc)" },
      { label: "Long Q Format", value: "Part (a) Theory + Part (b) Numerical" },
      { label: "Equations", value: "Vectors, Greek Letters & SI Units via KaTeX" },
      { label: "Languages", value: "Bilingual Urdu/English & English Medium" },
    ],
    points: [
      "Pairs theoretical derivations (Part a: 4 marks) with numerical problems (Part b: 5 marks) cleanly",
      "Renders scientific notation (10⁻³¹, Ω, μ, λ, Δv/Δt) accurately in both PDF and Word exports",
      "AI Topic Search creates conceptual 'Why/Give reason' SLO short questions for BISE and FBISE",
      "Shuffled MCQ codes A–D with instant answer keys for academy test sessions",
    ],
    syllabusDetails: {
      heading: "Matches Official BISE & FBISE Physics Paper Structure",
      body: "Physics board papers require careful balance between book definitions, conceptual SLO questions, and multi-step numericals.",
      items: [
        "Matric Physics (60 Marks): 12 MCQs + 3 Short Question sections (5 of 8 each = 30 marks) + 2 of 3 Long Questions (9 marks each: 4 theory + 5 numerical = 18 marks)",
        "FSc Physics (85 Marks): 17 MCQs + 3 Short Question sections (22 attempts = 44 marks) + 3 of 5 Long Questions (8 marks each: 5 theory + 3 numerical = 24 marks)",
        "Bilingual Support: Urdu Nastaliq statements paired with English scientific terms for Punjab BISE students",
      ],
    },
    faqs: [
      {
        q: "Can I format Part (a) theory and Part (b) numerical together in Physics long questions?",
        a: "Yes. Long questions support clear (a) and (b) part splits with individual mark tags (e.g., 4+5 or 5+3) matching BISE and FBISE Physics papers.",
      },
      {
        q: "Can AI generate Physics numericals and conceptual short questions?",
        a: "Yes. Enter any Physics chapter or law (such as Ohm's Law, Simple Harmonic Motion, or Coulomb's Law) in AI Topic Search or AI Quick Paper to generate conceptual questions and numericals.",
      },
      pricingFaq("Physics"),
    ],
  },
  {
    slug: "chemistry-paper-maker",
    shortLabel: "Chemistry Paper Maker",
    category: "subject",
    urduSubtitle: "کیمسٹری (کیمیا) کے کیمیائی مساوات اور بورڈ پیٹرن ٹیسٹ پیپرز آن لائن تیار کریں",
    h1: "Chemistry Exam Paper Maker Online (9th, 10th & FSc)",
    title: "Chemistry Paper Maker Online – Equations & Board Pattern",
    description:
      "Create 9th, 10th & FSc Chemistry exam papers online with balanced chemical equations, subscripts, organic reactions, bilingual Urdu/English & Word/PDF export.",
    keywords: [
      "chemistry paper maker online",
      "10th class chemistry paper generator",
      "9th class chemistry test maker",
      "fsc chemistry paper maker",
      "organic chemistry test generator",
      "کیمسٹری پیپر میکر",
    ],
    intro:
      "Build clean, legible Chemistry test papers with properly formatted chemical subscripts, reversible equilibrium arrows, ionic charges, and organic reaction chains—available in English, Urdu Nastaliq, or side-by-side Bilingual mode.",
    highlights: [
      { label: "Board Marks", value: "60 Marks (Matric) & 85 Marks (FSc)" },
      { label: "Notation", value: "Subscripts, Reversible Arrows & Ions" },
      { label: "Coverage", value: "Physical, Inorganic, Organic & Environmental" },
      { label: "Exports", value: "1-Page PDF, Word (.docx) & OMR Key" },
    ],
    points: [
      "Clean chemical formulas (H₂SO₄, CaCO₃, reversible ⇌ arrows, oxidation states) via KaTeX & Unicode",
      "Supports Matric (60-mark) and FSc Part-I / Part-II (85-mark) Chemistry pairing schemes",
      "Scan textbook reaction pages with OCR or generate topic tests via AI Quick Paper",
      "Bilingual Urdu Nastaliq + English columns for Punjab Board schools and academies",
    ],
    syllabusDetails: {
      heading: "Tailored for Matric & FSc Chemistry Teachers",
      body: "Typing subscripts, reaction conditions, and Urdu translations in MS Word or InPage normally takes hours per Chemistry test. PaperWala formats them in seconds.",
      items: [
        "9th & 10th Chemistry: Chemical Equilibrium, Acids/Bases & Salts, Organic Chemistry, Hydrocarbons, Biochemistry, Atmosphere & Water",
        "FSc Chemistry: Stoichiometry, Atomic Structure, Chemical Bonding, Electrochemistry, s/p/d-Block Elements & Organic Conversions",
        "4 Shuffled MCQ Codes (A, B, C, D) with automatic grading keys for MDCAT and board prep batches",
      ],
    },
    faqs: [
      {
        q: "Do chemical subscripts and reaction arrows print properly in PDF and Word?",
        a: "Yes. Chemical formulas, subscripts, superscripts, and reversible reaction arrows render cleanly in both the PDF print studio and downloaded Microsoft Word (.docx) files.",
      },
      {
        q: "Can I translate an English Chemistry test into Bilingual English + Urdu?",
        a: "Yes. Use the 1-click AI Bilingual Converter in the Paper Editor or AI Quick Paper to add accurate Urdu Nastaliq translations alongside your English Chemistry questions.",
      },
      pricingFaq("Chemistry"),
    ],
  },
  {
    slug: "biology-paper-maker",
    shortLabel: "Biology Paper Maker",
    category: "subject",
    urduSubtitle: "بیالوجی (حیاتیات) کے نویں، دسویں اور ایف ایس سی پری میڈیکل پیپرز آن لائن بنائیں",
    h1: "Biology Exam Paper Maker Online (9th, 10th & FSc Pre-Medical)",
    title: "Biology Paper Maker Online – Matric & FSc Pre-Medical",
    description:
      "Generate 9th, 10th & FSc Pre-Medical Biology exam papers online. Chapter-wise MCQs, short definitions, two-part long questions, bilingual Urdu/English & Word/PDF.",
    keywords: [
      "biology paper maker online",
      "9th class biology paper generator",
      "10th class biology test maker",
      "fsc biology paper maker",
      "pre medical test generator pakistan",
      "بیالوجی پیپر میکر",
    ],
    intro:
      "Create Matric Science and FSc Pre-Medical Biology papers with accurate biological terminology, chapter-paired long questions, OMR MCQ bubble sheets (ideal for MDCAT foundation), and side-by-side Urdu Nastaliq translations.",
    highlights: [
      { label: "Streams", value: "9th/10th Science & FSc Pre-Medical" },
      { label: "Board Totals", value: "60 Marks (SSC) & 85 Marks (HSSC)" },
      { label: "MDCAT Prep", value: "OMR Bubble Sheets + Shuffled Codes A–D" },
      { label: "Mediums", value: "Bilingual Urdu/English & English Only" },
    ],
    points: [
      "Matches 60-mark Matric and 85-mark FSc Pre-Medical Biology section weights",
      "OMR bubble sheets and 4 shuffled MCQ codes train Pre-Medical students for board & MDCAT exams",
      "Bilingual layout pairs English biological terms with authentic Urdu Nastaliq explanations",
      "AI Topic Search generates chapter-wise MCQs, differences, and labeled-function questions instantly",
    ],
    syllabusDetails: {
      heading: "Built for Science Schools & Pre-Medical Coaching Academies",
      body: "Biology tests demand high MCQ volume, crisp compare-and-contrast short questions, and paired (a)+(b) long questions across chapters.",
      items: [
        "Matric Biology (60 Marks): 12 MCQs + 3 Short Question sections (5 of 8 each = 30 marks) + 2 of 3 paired Long Questions (4+5 marks = 18 marks)",
        "FSc Pre-Medical Biology (85 Marks): 17 MCQs + 3 Short Question groups (44 marks) + 3 of 5 paired Long Questions (4+4 marks = 24 marks)",
        "2-Tests-on-1-Page mode lets academies run daily 20-MCQ + 5-Short-Question Biology drills at half the printing cost",
      ],
    },
    faqs: [
      {
        q: "Can Pre-Medical academies generate MCQ-only OMR tests for Biology?",
        a: "Yes! You can create a pure MCQ test (e.g., 30, 50, or 68 MCQs) with 4 shuffled versions (A, B, C, D), OMR bubble sheets, and instant grading keys.",
      },
      {
        q: "Are Urdu-medium Biology papers supported?",
        a: "Yes. Choose Bilingual or Urdu-only mode to render biological statements in authentic Noto Nastaliq Urdu.",
      },
      pricingFaq("Biology"),
    ],
  },
  {
    slug: "english-paper-maker",
    shortLabel: "English Paper Maker",
    category: "subject",
    urduSubtitle: "انگلش (9th، 10th، فرسٹ ایئر اور سیکنڈ ایئر) کے گرامر، ٹرانسلیشن اور معروضی پرچے بنائیں",
    h1: "English Exam Paper Maker Online (9th, 10th, 1st & 2nd Year)",
    title: "English Paper Maker Online – Grammar, MCQs & Translation",
    description:
      "Create 9th, 10th, 1st Year & 2nd Year English exam papers online: grammar/vocabulary MCQs, comprehension, Urdu-to-English translation passages, essays & Word/PDF.",
    keywords: [
      "english paper maker online",
      "9th class english paper generator",
      "10th class english test maker",
      "1st year 2nd year english paper maker",
      "english grammar mcq generator pakistan",
      "urdu to english paragraph test maker",
    ],
    intro:
      "Assemble complete BISE and FBISE English compulsory papers—combining 4-column Objective Grammar/Spelling/Synonym MCQs with Subjective short questions, stanza/comprehension passages, letters, essays, and Urdu-to-English translation paragraphs.",
    highlights: [
      { label: "Classes", value: "9th, 10th (75 Marks) & 11th, 12th (100 Marks)" },
      { label: "Translation", value: "Native Nastaliq Urdu Passages Included" },
      { label: "Objective", value: "Verb Form, Spelling, Synonym & Grammar MCQs" },
      { label: "Editable", value: "Full MS Word (.docx) & 1-Page PDF Export" },
    ],
    points: [
      "Mixes English passages and Urdu Nastaliq translation paragraphs seamlessly in one document without InPage",
      "Structured 4-column MCQ tables for correct form of verb, spelling, synonyms/antonyms, and grammar",
      "AI Quick Paper generates unseen comprehension passages, grammar MCQs, and translation exercises on demand",
      "Download as editable Microsoft Word (.docx) to fine-tune essay/letter/idiom prompts",
    ],
    syllabusDetails: {
      heading: "Solves the #1 Headache in Pakistani English Papers: Mixing English & Urdu Passages",
      body: "Every Matric and 2nd Year English paper requires an Urdu Nastaliq paragraph for translation into English (or English-to-Urdu in 9th/1st Year). Normally teachers paste low-resolution InPage images into MS Word—PaperWala renders both scripts natively.",
      items: [
        "Objective Sheet (19 or 20 Marks): Verb forms, correct spellings, synonyms/antonyms, and parts-of-speech MCQs",
        "Lesson Short Questions, Poem Stanza / Paraphrasing, and Unseen Comprehension blocks",
        "Letters, Applications, Stories, Dialogues, Essays, Idioms/Phrasal Verbs, and Active/Passive Voice",
        "Crisp Urdu Nastaliq paragraph block for Urdu-to-English translation questions",
      ],
    },
    faqs: [
      {
        q: "Can I include an Urdu Nastaliq paragraph inside an English paper for translation questions?",
        a: "Yes! PaperWala supports Urdu Nastaliq natively inside English papers, so your Urdu-to-English translation passage prints sharply without needing InPage screenshots.",
      },
      {
        q: "Can I generate unseen comprehension passages or grammar MCQs with AI?",
        a: "Yes. Open AI Quick Paper (/quick-paper) and ask for verb-form MCQs, preposition MCQs, or comprehension questions for your target class.",
      },
      pricingFaq("English"),
    ],
  },
  {
    slug: "urdu-islamiat-pak-studies-paper-maker",
    shortLabel: "Urdu, Islamiat & Pak Studies",
    category: "subject",
    urduSubtitle: "بغیر ان پیج (InPage) کے اردو، اسلامیات لازمی اور مطالعہ پاکستان کے نستعلیق پرچے تیار کریں",
    h1: "Urdu, Islamiat & Pakistan Studies Paper Maker (Without InPage)",
    title: "Urdu, Islamiat & Pak Studies Paper Maker – Nastaliq Online",
    description:
      "Make Urdu, Islamiat Compulsory, Tarjuma-tul-Quran & Pakistan Studies exam papers online in Noto Nastaliq without InPage. Right-to-left PDF & Word (.docx) export.",
    keywords: [
      "urdu paper maker",
      "urdu exam paper maker online",
      "paper maker without inpage",
      "inpage alternative",
      "islamiat paper maker online",
      "pak studies paper generator",
      "اردو پیپر میکر",
      "آن لائن اردو پیپر بنانے والی ویب سائٹ",
    ],
    intro:
      "Create right-to-left Urdu Compulsory, Islamiat Lazmi, Tarjuma-tul-Quran, and bilingual Pakistan Studies exam papers directly in your browser using authentic Noto Nastaliq Urdu—no InPage license, broken font files, or third-party typist needed.",
    highlights: [
      { label: "Subjects", value: "Urdu, Islamiat, Tarjuma-tul-Quran & Pak Studies" },
      { label: "Typography", value: "Authentic Right-to-Left Noto Nastaliq" },
      { label: "InPage Needed?", value: "Zero — 100% Browser-Based" },
      { label: "Input Modes", value: "Type, Paste, Voice/AI or Photo OCR Scan" },
    ],
    points: [
      "True right-to-left (RTL) Nastaliq layout for Urdu MCQs (الف، ب، ج، د), ash'aar tashreeh, khulasa, and essays",
      "Supports Arabic Quranic / Hadith text alongside Urdu Nastaliq for Islamiat & Tarjuma-tul-Quran papers",
      "Bilingual side-by-side mode for 9th, 10th, and 2nd Year Pakistan Studies & Islamiat (English + Urdu mediums)",
      "Export print-ready A4 PDFs or editable Microsoft Word (.docx) documents",
    ],
    syllabusDetails: {
      heading: "Replace Desktop InPage with Instant Cloud Nastaliq Formatting",
      body: "In most Pakistani schools, Urdu and Islamiat teachers must wait days for an InPage typist. With PaperWala, any teacher can scan a textbook page, paste Urdu text, or generate topic questions in minutes.",
      items: [
        "Urdu Compulsory (75 / 100 Marks): Kathir-ul-Intikhabi MCQs, Nazm & Ghazal Tashreeh, Iqtibas ki Tashreeh, Sabaq ka Khulasa, Khat/Darkhwast & Mazmoon",
        "Islamiat Compulsory & Tarjuma-tul-Quran (50 Marks): MCQs, Quranic/Hadith translations, and thematic short/long questions",
        "Pakistan Studies (50 Marks): Bilingual English + Urdu Nastaliq MCQs, short questions, and 8-mark detailed questions",
      ],
    },
    primaryCtaHref: "/quick-paper",
    primaryCtaLabel: "Create Urdu / Islamiat Paper Now",
    faqs: [
      {
        q: "How can I make a 9th or 10th class Urdu paper without InPage?",
        a: "Open PaperWala in Chrome, Edge, or mobile browser, choose Urdu or Bilingual mode, type/paste or generate your questions in AI Quick Paper, and print a Noto Nastaliq PDF or download Word (.docx)—no InPage installation required.",
      },
      {
        q: "Does PaperWala support Arabic Quranic verses inside Islamiat and Tarjuma-tul-Quran papers?",
        a: "Yes. Unicode Arabic verses with diacritics (harakat) and Urdu Nastaliq translations render side by side cleanly.",
      },
      pricingFaq("Urdu, Islamiat & Pak Studies"),
    ],
  },

  // =========================================================================
  // FEATURES & GENERAL (Bilingual Urdu/English, Word/PDF, Online Paper Maker PK)
  // =========================================================================
  {
    slug: "bilingual-urdu-english-paper-maker",
    shortLabel: "Urdu-English Bilingual",
    category: "feature",
    urduSubtitle: "انگلش اور اردو نستعلیق (دو لسانی / Bilingual) امتحانی پرچے ایک کلک میں تیار کریں",
    h1: "Urdu and English Bilingual Exam Paper Maker",
    title: "Bilingual Urdu English Paper Maker – Nastaliq Without InPage",
    description:
      "Create bilingual exam papers with Urdu Nastaliq and English side by side. 1-click AI English↔Urdu question translator, OCR scan, PDF and Word (.docx) export.",
    keywords: [
      "urdu paper maker",
      "urdu nastaliq paper maker",
      "bilingual paper maker",
      "english urdu paper maker",
      "paper maker without inpage",
      "inpage alternative",
      "english to urdu paper translator",
      "اردو پیپر میکر",
      "آن لائن پیپر میکر",
    ],
    intro:
      "Prepare Urdu-medium, English-medium, or side-by-side Bilingual papers without InPage. Convert an entire English paper into Urdu Nastaliq (or Urdu into English) with AI in one click, then edit any question before printing.",
    highlights: [
      { label: "Layouts", value: "Bilingual 2-Column, English-Only, Urdu-Only" },
      { label: "AI Translator", value: "1-Click Full Paper English ↔ Urdu" },
      { label: "Font", value: "Native Print-Sharp Noto Nastaliq Urdu" },
      { label: "OCR Scanner", value: "Convert Book Photos to Editable Papers" },
    ],
    points: [
      "Authentic Noto Nastaliq Urdu typography rendered directly in the browser",
      "1-click AI Bilingual Converter translates every MCQ, Short Question, and Long Question",
      "Scan a printed paper or textbook photo with Vision OCR and turn it into an editable bilingual test",
      "Balanced two-column layout (English on left, Urdu Nastaliq on right) matching Punjab BISE papers",
    ],
    syllabusDetails: {
      heading: "Serve Both English-Medium and Urdu-Medium Sections on One Sheet",
      body: "Schools and academies with mixed-medium sections save 50% of typing and printing effort by issuing a single side-by-side bilingual board paper—exactly how official BISE papers are printed.",
      items: [
        "Switch live between Bilingual, English-only, and Urdu-only views in the Paper Editor without retyping",
        "Preserves mathematical formulas, numbers, and scientific symbols cleanly inside Urdu sentences",
        "Exports aligned RTL/LTR tables to Microsoft Word (.docx) and 1-page A4 PDF",
      ],
    },
    primaryCtaHref: "/quick-paper",
    primaryCtaLabel: "Try Bilingual Paper Studio",
    faqs: [
      {
        q: "Do I need InPage or Nastaliq fonts installed on my PC to print Urdu papers?",
        a: "No. PaperWala loads Noto Nastaliq Urdu directly in the browser, so Urdu text prints sharply from any Windows PC, Mac, Chromebook, or smartphone.",
      },
      {
        q: "Can AI convert my English-only test into a Bilingual English + Urdu paper?",
        a: "Yes! Click the AI Bilingual button in the Live Paper Editor or AI Quick Paper Studio to generate accurate Urdu Nastaliq translations for all questions and MCQ options.",
      },
      pricingFaq("bilingual Urdu & English"),
    ],
  },
  {
    slug: "word-docx-exam-paper-generator",
    shortLabel: "Word (.docx) & 1-Page PDF",
    category: "feature",
    urduSubtitle: "امتحانی پرچے ایڈیٹیبل مائیکروسافٹ ورڈ (.docx) اور 1-Page A4 PDF میں ڈاؤن لوڈ کریں",
    h1: "Download Exam Papers in Editable Microsoft Word (.docx) & 1-Page PDF",
    title: "Word (.docx) & 1-Page PDF Exam Paper Maker Online",
    description:
      "Generate school and academy exam papers online and download them as fully editable Microsoft Word (.docx) files or 1-page auto-fit A4 PDFs with OMR & answer keys.",
    keywords: [
      "word docx paper maker",
      "paper maker pdf download",
      "1 page exam paper pdf",
      "shuffled paper codes a b c d",
      "paper with answer key",
      "omr bubble sheet generator",
      "make urdu paper in word",
    ],
    intro:
      "Need to tweak wording in MS Word, print an exact 1-page A4 test, or fit two class tests onto a single sheet? PaperWala exports structured .docx documents, auto-fit PDFs, OMR bubble sheets, and teacher answer keys.",
    highlights: [
      { label: "Word Export", value: "Editable .docx with Tables & Urdu RTL" },
      { label: "PDF Modes", value: "1-Page Auto-Fit, Standard & 2-on-1 Duplex" },
      { label: "Paper Sizes", value: "A4, US Letter & Legal Page Presets" },
      { label: "Extras", value: "Shuffled Codes A–D, OMR & Answer Key" },
    ],
    points: [
      "One-click Microsoft Word (.docx) download with aligned headers, 4-column MCQ grids, and Urdu text",
      "1-Page Auto-Fit and 2-Tests-Per-Page (Landscape Duplex) A4, Letter, and Legal print modes",
      "Automatic MCQ Answer Key and 4-option OMR Bubble Sheet generation",
      "Custom school/academy logo, background watermark, and decorative page border",
    ],
    syllabusDetails: {
      heading: "Cut Academy Photocopy Bills in Half with 1-Page & 2-Per-Page Layouts",
      body: "Printing costs are a major monthly expense for Pakistani schools and tuition academies. PaperWala's compact typography and 2-per-page landscape mode fit two complete chapter tests onto one A4 sheet.",
      items: [
        "Editable .docx: Open in Microsoft Word 2016/2019/365 or Google Docs for custom edits",
        "1-Page Auto-Fit PDF: Automatically tunes spacing and margins so short tests don't spill 2 lines onto page 2",
        "Anti-Cheating Codes A, B, C, D: Shuffle MCQ order and print all 4 versions with matching teacher keys",
      ],
    },
    faqs: [
      {
        q: "Are Urdu Nastaliq and Bilingual columns editable inside the downloaded Word (.docx) file?",
        a: "Yes. PaperWala builds native Word tables with proper right-to-left paragraph direction for Urdu cells and left-to-right alignment for English cells, so you can edit every word in MS Word.",
      },
      {
        q: "How does 2-Tests-on-1-Page mode work?",
        a: "In the Paper Editor settings, switch to 2-Per-Page mode to place two identical (or Code A / Code B) tests side by side on a landscape A4 sheet—ready to cut in half after photocopying.",
      },
      pricingFaq("Word and PDF export"),
    ],
  },
  {
    slug: "online-paper-maker-pakistan",
    shortLabel: "Online Paper Maker Pakistan",
    category: "feature",
    urduSubtitle: "پاکستان کے سکولز، کالجز اور اکیڈمیز کے لیے نمبر 1 آن لائن پیپر بنانے والی ویب سائٹ",
    h1: "Online Paper Maker for Pakistani Schools, Colleges & Academies",
    title: "Online Paper Maker Pakistan – School & Academy Exam Software",
    description:
      "PaperWala is Pakistan's online exam paper maker (paper banane wali website): BISE & FBISE patterns, AI quick paper, Urdu Nastaliq, school logo, OMR, Word & PDF.",
    keywords: [
      "online paper maker",
      "paper maker online",
      "online paper maker pakistan",
      "paper generator pakistan",
      "paper banane wali website",
      "paper maker for teachers",
      "paper maker for academies",
      "school exam software pakistan",
      "آن لائن پیپر بنانے والی ویب سائٹ",
      "پیپر میکر",
    ],
    intro:
      "PaperWala (پیپر والا — پاکستان کی آن لائن پیپر بنانے والی ویب سائٹ) helps teachers, school principals, and academy owners prepare board-pattern exam papers in 60 seconds instead of spending hours in InPage or MS Word.",
    highlights: [
      { label: "Built For", value: "Schools, Colleges, Academies & Teachers" },
      { label: "Boards", value: "All 9 Punjab BISE + Federal Board (FBISE)" },
      { label: "Classes", value: "9th, 10th, 1st Year (11th) & 2nd Year (12th)" },
      { label: "Pricing", value: "Rs. 30 / Paper or Rs. 2,000 / Month Unlimited" },
    ],
    points: [
      "Verified chapter-wise question bank plus AI Quick Paper from any topic, pasted text, or book photo (OCR)",
      "Saved institution template: school/academy name, monogram crest, watermark, fonts, and instructions",
      "Shuffled Paper Codes A, B, C, D with OMR bubble sheets and automatic teacher answer keys",
      "Transparent local pricing: Rs. 30 per paper or Rs. 2,000/month unlimited papers",
    ],
    syllabusDetails: {
      heading: "Used Across Every Exam Cycle in the Pakistani Academic Calendar",
      body: "From daily tuition-center quizzes to full-school annual examinations, one PaperWala account standardizes paper quality across every class and subject.",
      items: [
        "Daily & Weekly Academy Tests: Reuse your academy header and generate 4 shuffled versions in 60 seconds",
        "Monthly, First-Term & Mid-Term School Exams: Consistent typography and crest branding across all teachers",
        "December Exams, Send-Ups & Pre-Board Rounds: Full 50, 60, 75, 85, and 100-mark BISE & FBISE papers",
      ],
    },
    faqs: [
      {
        q: "How do I make an exam paper online in Pakistan with PaperWala?",
        a: "Sign in, pick questions from the Board Question Bank (/select-questions) or paste/generate topics in AI Quick Paper (/quick-paper), customize your school header in the Live Paper Editor, and export PDF or Word (.docx).",
      },
      {
        q: "Is PaperWala suitable for coaching academies and tuition centers?",
        a: "Yes! Academies save their logo and header once, generate weekly chapter tests with shuffled Codes A–D, print 2 tests per A4 page to save photocopy costs, and check papers fast with automatic answer keys.",
      },
      pricingFaq("Pakistani schools and academies"),
    ],
  },
];

export function getLanding(slug: string): SeoLanding | undefined {
  return SEO_LANDINGS.find((l) => l.slug === slug);
}

export function getLandingsByCategory(category: SeoLandingCategory): SeoLanding[] {
  return SEO_LANDINGS.filter((l) => l.category === category);
}
