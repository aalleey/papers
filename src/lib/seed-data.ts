export interface SeedBoard {
  id: string;
  name: string;
  name_ur: string;
}

export interface SeedClass {
  id: string;
  name: string;
  numeric_order: number;
}

export interface SeedCourse {
  id: string;
  board_id: string;
  class_id: string;
  name: string;
  is_active: boolean;
}

export interface SeedSubject {
  id: string;
  course_id: string;
  name: string;
  name_ur: string;
}

export interface SeedChapter {
  id: string;
  subject_id: string;
  number: number;
  title: string;
  title_ur: string;
}

export interface SeedTopic {
  id: string;
  chapter_id: string;
  number: number;
  title: string;
  title_ur: string;
}

export interface SeedQuestion {
  id: string;
  chapter_id: string;
  topic_id?: string;
  type: 'mcq' | 'short' | 'long';
  source: 'exercise' | 'extra' | 'past_paper';
  source_ref: string;
  concept_tag: string;
  correct_option?: number; // 1 to 4
  marks: number;
  difficulty: 'easy' | 'medium' | 'hard';
  is_active: boolean;
  source_note: string;
  translations: {
    language: 'en' | 'ur';
    text: string;
    options?: string[];
    answer?: string;
  }[];
}

export const SEED_BOARDS: SeedBoard[] = [
  { id: "b1000000-0000-0000-0000-000000000001", name: "Punjab Board", name_ur: "پنجاب بورڈ" },
  { id: "b1000000-0000-0000-0000-000000000002", name: "Federal Board", name_ur: "فیڈرل بورڈ" },
  { id: "b1000000-0000-0000-0000-000000000003", name: "KPK Board", name_ur: "خیبر پختونخوا بورڈ" },
  { id: "b1000000-0000-0000-0000-000000000004", name: "Sindh Board", name_ur: "سندھ بورڈ" },
];

export const SEED_CLASSES: SeedClass[] = [
  { id: "c0500000-0000-0000-0000-000000000005", name: "Class 5", numeric_order: 5 },
  { id: "c0600000-0000-0000-0000-000000000006", name: "Class 6", numeric_order: 6 },
  { id: "c0700000-0000-0000-0000-000000000007", name: "Class 7", numeric_order: 7 },
  { id: "c0800000-0000-0000-0000-000000000008", name: "Class 8", numeric_order: 8 },
  { id: "c0900000-0000-0000-0000-000000000009", name: "Class 9", numeric_order: 9 },
  { id: "c1000000-0000-0000-0000-000000000010", name: "Class 10", numeric_order: 10 },
  { id: "c1100000-0000-0000-0000-000000000011", name: "Class 11", numeric_order: 11 },
  { id: "c1200000-0000-0000-0000-000000000012", name: "Class 12", numeric_order: 12 },
];

export const SEED_COURSES: SeedCourse[] = [
  {
    id: "cr100000-0000-0000-0000-000000000001",
    board_id: "b1000000-0000-0000-0000-000000000001", // Punjab
    class_id: "c1000000-0000-0000-0000-000000000010", // Class 10
    name: "Class 10 (Old)",
    is_active: true,
  },
  {
    id: "cr100000-0000-0000-0000-000000000002",
    board_id: "b1000000-0000-0000-0000-000000000001",
    class_id: "c0900000-0000-0000-0000-000000000009",
    name: "Class 9 (General Science)",
    is_active: true,
  },
  {
    id: "cr100000-0000-0000-0000-000000000003",
    board_id: "b1000000-0000-0000-0000-000000000001",
    class_id: "c1100000-0000-0000-0000-000000000011",
    name: "FSc Pre-Engineering Part 1",
    is_active: true,
  },
  {
    id: "cr100000-0000-0000-0000-000000000004",
    board_id: "b1000000-0000-0000-0000-000000000001",
    class_id: "c1200000-0000-0000-0000-000000000012",
    name: "FSc Pre-Engineering Part 2",
    is_active: true,
  },
];

export const SEED_SUBJECTS: SeedSubject[] = [
  {
    id: "s1000000-0000-0000-0000-000000000001",
    course_id: "cr100000-0000-0000-0000-000000000001", // Class 10 (Old)
    name: "Mathematics",
    name_ur: "ریاضی",
  },
  {
    id: "s1000000-0000-0000-0000-000000000002",
    course_id: "cr100000-0000-0000-0000-000000000001",
    name: "Physics",
    name_ur: "طبیعیات",
  },
  {
    id: "s1000000-0000-0000-0000-000000000003",
    course_id: "cr100000-0000-0000-0000-000000000001",
    name: "Chemistry",
    name_ur: "کیمیا",
  },
];

export const SEED_CHAPTERS: SeedChapter[] = [
  {
    id: "ch100000-0000-0000-0000-000000000001",
    subject_id: "s1000000-0000-0000-0000-000000000001", // Math
    number: 1,
    title: "Quadratic Equations",
    title_ur: "دو درجی مساواتیں",
  },
  {
    id: "ch100000-0000-0000-0000-000000000002",
    subject_id: "s1000000-0000-0000-0000-000000000001",
    number: 2,
    title: "Theory of Quadratic Equations",
    title_ur: "دو درجی مساواتوں کا نظریہ",
  },
  {
    id: "ch100000-0000-0000-0000-000000000003",
    subject_id: "s1000000-0000-0000-0000-000000000001",
    number: 3,
    title: "Variations",
    title_ur: "تغیرات",
  },
  {
    id: "ch100000-0000-0000-0000-000000000004",
    subject_id: "s1000000-0000-0000-0000-000000000001",
    number: 4,
    title: "Partial Fractions",
    title_ur: "جزوی کسریں",
  },
  {
    id: "ch100000-0000-0000-0000-000000000005",
    subject_id: "s1000000-0000-0000-0000-000000000001",
    number: 5,
    title: "Sets and Functions",
    title_ur: "سیٹ اور تفاعلات",
  },
  {
    id: "ch100000-0000-0000-0000-000000000006",
    subject_id: "s1000000-0000-0000-0000-000000000001",
    number: 6,
    title: "Basic Statistics",
    title_ur: "بنیادی شماریات",
  },
  {
    id: "ch100000-0000-0000-0000-000000000007",
    subject_id: "s1000000-0000-0000-0000-000000000001",
    number: 7,
    title: "Introduction to Trigonometry",
    title_ur: "علم المثلث کا تعارف",
  },
];

export const SEED_TOPICS: SeedTopic[] = [
  {
    id: "t1000000-0000-0000-0000-000000000001",
    chapter_id: "ch100000-0000-0000-0000-000000000001",
    number: 1,
    title: "Standard Form of Quadratic Equation",
    title_ur: "دو درجی مساوات کی معیاری شکل",
  },
  {
    id: "t1000000-0000-0000-0000-000000000002",
    chapter_id: "ch100000-0000-0000-0000-000000000001",
    number: 2,
    title: "Solution by Factorization",
    title_ur: "بذریعہ تجزی حل",
  },
  {
    id: "t1000000-0000-0000-0000-000000000003",
    chapter_id: "ch100000-0000-0000-0000-000000000001",
    number: 3,
    title: "Quadratic Formula",
    title_ur: "دو درجی فارمولا",
  },
  {
    id: "t1000000-0000-0000-0000-000000000004",
    chapter_id: "ch100000-0000-0000-0000-000000000002",
    number: 1,
    title: "Discriminant of Quadratic Equation",
    title_ur: "دو درجی مساوات کا فرق کنندہ",
  },
  {
    id: "t1000000-0000-0000-0000-000000000005",
    chapter_id: "ch100000-0000-0000-0000-000000000003",
    number: 1,
    title: "Ratio, Proportion and Variations",
    title_ur: "نسبت، تناسب اور تغیرات",
  },
  {
    id: "t1000000-0000-0000-0000-000000000006",
    chapter_id: "ch100000-0000-0000-0000-000000000007",
    number: 1,
    title: "Trigonometric Ratios and Identities",
    title_ur: "مثلثی نسبتیں اور مماثلتیں",
  },
];

// 30 Sample Questions with mixed types, difficulties, LaTeX, and Urdu translations
export const SEED_QUESTIONS: SeedQuestion[] = [
  // 1. MCQ - LaTeX - Ch 1 (Sample Note on all)
  {
    id: "q0000001-0000-0000-0000-000000000001",
    chapter_id: "ch100000-0000-0000-0000-000000000001",
    topic_id: "t1000000-0000-0000-0000-000000000001",
    type: "mcq",
    source: "exercise",
    source_ref: "Ex 1.1 Q1",
    concept_tag: "standard_form",
    correct_option: 2,
    marks: 1,
    difficulty: "easy",
    is_active: true,
    source_note: "SAMPLE - delete before launch",
    translations: [
      {
        language: "en",
        text: "The standard form of a quadratic equation is $ax^2 + bx + c = 0$ where:",
        options: ["$a = 0$", "$a \\neq 0$", "$b = 0$", "$c = 0$"],
        answer: "Option B ($a \\neq 0$)",
      },
      {
        language: "ur",
        text: "دو درجی مساوات $ax^2 + bx + c = 0$ کی معیاری شکل میں شرط ہے کہ:",
        options: ["$a = 0$", "$a \\neq 0$", "$b = 0$", "$c = 0$"],
        answer: "آپشن B",
      },
    ],
  },

  // 2. MCQ - LaTeX - Ch 1
  {
    id: "q0000002-0000-0000-0000-000000000002",
    chapter_id: "ch100000-0000-0000-0000-000000000001",
    topic_id: "t1000000-0000-0000-0000-000000000003",
    type: "mcq",
    source: "exercise",
    source_ref: "Ex 1.2 Q1",
    concept_tag: "quadratic_formula",
    correct_option: 1,
    marks: 1,
    difficulty: "medium",
    is_active: true,
    source_note: "SAMPLE - delete before launch",
    translations: [
      {
        language: "en",
        text: "The quadratic formula for $ax^2 + bx + c = 0$ is $x = $:",
        options: [
          "$\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$",
          "$\\frac{b \\pm \\sqrt{b^2 - 4ac}}{2a}$",
          "$\\frac{-b \\pm \\sqrt{b^2 + 4ac}}{2a}$",
          "$\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2}$",
        ],
        answer: "Option A",
      },
      {
        language: "ur",
        text: "مساوات $ax^2 + bx + c = 0$ کو حل کرنے کے لیے دو درجی فارمولا ہے:",
        options: [
          "$\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$",
          "$\\frac{b \\pm \\sqrt{b^2 - 4ac}}{2a}$",
          "$\\frac{-b \\pm \\sqrt{b^2 + 4ac}}{2a}$",
          "$\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2}$",
        ],
        answer: "آپشن A",
      },
    ],
  },

  // 3. MCQ - Ch 1
  {
    id: "q0000003-0000-0000-0000-000000000003",
    chapter_id: "ch100000-0000-0000-0000-000000000001",
    topic_id: "t1000000-0000-0000-0000-000000000001",
    type: "mcq",
    source: "past_paper",
    source_ref: "LHR 2022 Group 1",
    concept_tag: "pure_quadratic",
    correct_option: 3,
    marks: 1,
    difficulty: "easy",
    is_active: true,
    source_note: "SAMPLE - delete before launch",
    translations: [
      {
        language: "en",
        text: "In a quadratic equation $ax^2 + bx + c = 0$, if $b = 0$, it is called a:",
        options: ["Linear equation", "Cubic equation", "Pure quadratic equation", "Reciprocal equation"],
        answer: "Option C",
      },
      {
        language: "ur",
        text: "اگر دو درجی مساوات $ax^2 + bx + c = 0$ میں $b = 0$ ہو تو کہلاتی ہے:",
        options: ["یک درجی مساوات", "مکعبی مساوات", "پیور دو درجی مساوات", "معکوس مساوات"],
        answer: "آپشن C",
      },
    ],
  },

  // 4. MCQ - Ch 2 - LaTeX
  {
    id: "q0000004-0000-0000-0000-000000000004",
    chapter_id: "ch100000-0000-0000-0000-000000000002",
    topic_id: "t1000000-0000-0000-0000-000000000004",
    type: "mcq",
    source: "exercise",
    source_ref: "Ex 2.1 Q1",
    concept_tag: "discriminant",
    correct_option: 2,
    marks: 1,
    difficulty: "medium",
    is_active: true,
    source_note: "SAMPLE - delete before launch",
    translations: [
      {
        language: "en",
        text: "The discriminant of the quadratic equation $ax^2 + bx + c = 0$ is:",
        options: ["$b^2 + 4ac$", "$b^2 - 4ac$", "$-b^2 - 4ac$", "$\\sqrt{b^2 - 4ac}$"],
        answer: "Option B ($b^2 - 4ac$)",
      },
      {
        language: "ur",
        text: "دو درجی مساوات $ax^2 + bx + c = 0$ کا فرق کنندہ (Discriminant) ہوتا ہے:",
        options: ["$b^2 + 4ac$", "$b^2 - 4ac$", "$-b^2 - 4ac$", "$\\sqrt{b^2 - 4ac}$"],
        answer: "آپشن B",
      },
    ],
  },

  // 5. MCQ - Ch 2
  {
    id: "q0000005-0000-0000-0000-000000000005",
    chapter_id: "ch100000-0000-0000-0000-000000000002",
    topic_id: "t1000000-0000-0000-0000-000000000004",
    type: "mcq",
    source: "past_paper",
    source_ref: "FSD 2021 Group 2",
    concept_tag: "cube_roots_of_unity",
    correct_option: 1,
    marks: 1,
    difficulty: "medium",
    is_active: true,
    source_note: "SAMPLE - delete before launch",
    translations: [
      {
        language: "en",
        text: "The sum of all cube roots of unity $1 + \\omega + \\omega^2$ equals:",
        options: ["$0$", "$1$", "$-1$", "$3$"],
        answer: "Option A (0)",
      },
      {
        language: "ur",
        text: "اکائی کے تمام جزر المکعب کا مجموعہ $1 + \\omega + \\omega^2$ برابر ہوتا ہے:",
        options: ["$0$", "$1$", "$-1$", "$3$"],
        answer: "آپشن A (0)",
      },
    ],
  },

  // 6. MCQ - Ch 3
  {
    id: "q0000006-0000-0000-0000-000000000006",
    chapter_id: "ch100000-0000-0000-0000-000000000003",
    topic_id: "t1000000-0000-0000-0000-000000000005",
    type: "mcq",
    source: "exercise",
    source_ref: "Ex 3.1 Q1",
    concept_tag: "ratio_proportion",
    correct_option: 4,
    marks: 1,
    difficulty: "easy",
    is_active: true,
    source_note: "SAMPLE - delete before launch",
    translations: [
      {
        language: "en",
        text: "In the proportion $a : b = c : d$, the extremes are:",
        options: ["$b$ and $c$", "$a$ and $b$", "$c$ and $d$", "$a$ and $d$"],
        answer: "Option D ($a$ and $d$)",
      },
      {
        language: "ur",
        text: "تناسب $a : b = c : d$ میں طرفین (Extremes) ہیں:",
        options: ["$b$ اور $c$", "$a$ اور $b$", "$c$ اور $d$", "$a$ اور $d$"],
        answer: "آپشن D",
      },
    ],
  },

  // 7. MCQ - Ch 4
  {
    id: "q0000007-0000-0000-0000-000000000007",
    chapter_id: "ch100000-0000-0000-0000-000000000004",
    type: "mcq",
    source: "exercise",
    source_ref: "Ex 4.1 Q1",
    concept_tag: "partial_fractions",
    correct_option: 2,
    marks: 1,
    difficulty: "easy",
    is_active: true,
    source_note: "SAMPLE - delete before launch",
    translations: [
      {
        language: "en",
        text: "A fraction in which the degree of the numerator is strictly less than the degree of denominator is called:",
        options: ["Improper fraction", "Proper fraction", "Composite fraction", "Identity"],
        answer: "Option B",
      },
    ],
  },

  // 8. MCQ - Ch 5
  {
    id: "q0000008-0000-0000-0000-000000000008",
    chapter_id: "ch100000-0000-0000-0000-000000000005",
    type: "mcq",
    source: "past_paper",
    source_ref: "RWP 2023",
    concept_tag: "de_morgans_laws",
    correct_option: 1,
    marks: 1,
    difficulty: "medium",
    is_active: true,
    source_note: "SAMPLE - delete before launch",
    translations: [
      {
        language: "en",
        text: "According to De Morgan's Law, $(A \\cup B)'$ is equal to:",
        options: ["$A' \\cap B'$", "$A' \\cup B'$", "$A \\cap B$", "$A' - B'$"],
        answer: "Option A",
      },
    ],
  },

  // 9. MCQ - Ch 6
  {
    id: "q0000009-0000-0000-0000-000000000009",
    chapter_id: "ch100000-0000-0000-0000-000000000006",
    type: "mcq",
    source: "exercise",
    source_ref: "Ex 6.2 Q2",
    concept_tag: "mode",
    correct_option: 3,
    marks: 1,
    difficulty: "easy",
    is_active: true,
    source_note: "SAMPLE - delete before launch",
    translations: [
      {
        language: "en",
        text: "The most frequent observation in a given dataset is known as:",
        options: ["Mean", "Median", "Mode", "Variance"],
        answer: "Option C",
      },
    ],
  },

  // 10. MCQ - Ch 7 - LaTeX
  {
    id: "q0000010-0000-0000-0000-000000000010",
    chapter_id: "ch100000-0000-0000-0000-000000000007",
    topic_id: "t1000000-0000-0000-0000-000000000006",
    type: "mcq",
    source: "exercise",
    source_ref: "Ex 7.4 Q1",
    concept_tag: "trig_identity",
    correct_option: 2,
    marks: 1,
    difficulty: "medium",
    is_active: true,
    source_note: "SAMPLE - delete before launch",
    translations: [
      {
        language: "en",
        text: "The fundamental trigonometric identity states that $\\sin^2 \\theta + \\cos^2 \\theta = $:",
        options: ["$0$", "$1$", "$2$", "$-1$"],
        answer: "Option B (1)",
      },
      {
        language: "ur",
        text: "بنیادی مثلثی مماثلت کے مطابق $\\sin^2 \\theta + \\cos^2 \\theta$ برابر ہے:",
        options: ["$0$", "$1$", "$2$", "$-1$"],
        answer: "آپشن B (1)",
      },
    ],
  },

  // 11. MCQ - Ch 7
  {
    id: "q0000011-0000-0000-0000-000000000011",
    chapter_id: "ch100000-0000-0000-0000-000000000007",
    type: "mcq",
    source: "extra",
    source_ref: "Model Paper 2024",
    concept_tag: "radian_degree",
    correct_option: 1,
    marks: 1,
    difficulty: "easy",
    is_active: true,
    source_note: "SAMPLE - delete before launch",
    translations: [
      {
        language: "en",
        text: "$180^\\circ$ in radians is equal to:",
        options: ["$\\pi$", "$\\frac{\\pi}{2}$", "$2\\pi$", "$\\frac{\\pi}{4}$"],
        answer: "Option A (pi)",
      },
    ],
  },

  // 12. MCQ - Ch 1
  {
    id: "q0000012-0000-0000-0000-000000000012",
    chapter_id: "ch100000-0000-0000-0000-000000000001",
    topic_id: "t1000000-0000-0000-0000-000000000002",
    type: "mcq",
    source: "exercise",
    source_ref: "Ex 1.1 Q2",
    concept_tag: "solution_set",
    correct_option: 3,
    marks: 1,
    difficulty: "hard",
    is_active: true,
    source_note: "SAMPLE - delete before launch",
    translations: [
      {
        language: "en",
        text: "The solution set of $x^2 - 4 = 0$ is:",
        options: ["$\\{2\\}$", "$\\{-2\\}$", "$\\{\\pm 2\\}$", "$\\{4\\}$"],
        answer: "Option C",
      },
    ],
  },

  // 13. Short - Ch 1 - LaTeX
  {
    id: "q0000013-0000-0000-0000-000000000013",
    chapter_id: "ch100000-0000-0000-0000-000000000001",
    topic_id: "t1000000-0000-0000-0000-000000000002",
    type: "short",
    source: "exercise",
    source_ref: "Ex 1.1 Q2 (ii)",
    concept_tag: "solve_by_factorization",
    marks: 2,
    difficulty: "easy",
    is_active: true,
    source_note: "SAMPLE - delete before launch",
    translations: [
      {
        language: "en",
        text: "Solve by factorization: $3y^2 = y(y - 5)$.",
        answer: "Rearrange to $2y^2 + 5y = 0 \\implies y(2y + 5) = 0$. Hence $y = 0$ or $y = -\\frac{5}{2}$. Solution set is $\\{0, -\\frac{5}{2}\\}$.",
      },
      {
        language: "ur",
        text: "تجزی کے طریقے سے حل کیجیے: $3y^2 = y(y - 5)$",
        answer: "$3y^2 - y^2 + 5y = 0 \\implies 2y^2 + 5y = 0 \\implies y(2y + 5) = 0$. پس حل سیٹ $\\{0, -\\frac{5}{2}\\}$ ہے۔",
      },
    ],
  },

  // 14. Short - Ch 1 - LaTeX
  {
    id: "q0000014-0000-0000-0000-000000000014",
    chapter_id: "ch100000-0000-0000-0000-000000000001",
    topic_id: "t1000000-0000-0000-0000-000000000001",
    type: "short",
    source: "exercise",
    source_ref: "Ex 1.1 Q1 (i)",
    concept_tag: "pure_quadratic_conversion",
    marks: 2,
    difficulty: "medium",
    is_active: true,
    source_note: "SAMPLE - delete before launch",
    translations: [
      {
        language: "en",
        text: "Write the equation $(x + 7)(x - 3) = -7$ in standard form and point out if it is pure quadratic.",
        answer: "$x^2 + 4x - 21 = -7 \\implies x^2 + 4x - 14 = 0$. It is not pure quadratic because the linear coefficient $4 \\neq 0$.",
      },
      {
        language: "ur",
        text: "مساوات $(x + 7)(x - 3) = -7$ کو معیاری شکل میں لکھیے اور بتائیے کہ کیا یہ پیور دو درجی مساوات ہے یا نہیں؟",
        answer: "$x^2 + 4x - 14 = 0$. چونکہ $x$ کا کوفیشنٹ صفر نہیں ہے اس لیے یہ پیور دو درجی مساوات نہیں ہے۔",
      },
    ],
  },

  // 15. Short - Ch 2 - LaTeX
  {
    id: "q0000015-0000-0000-0000-000000000015",
    chapter_id: "ch100000-0000-0000-0000-000000000002",
    topic_id: "t1000000-0000-0000-0000-000000000004",
    type: "short",
    source: "past_paper",
    source_ref: "LHR 2023 Group 2",
    concept_tag: "discriminant_calc",
    marks: 2,
    difficulty: "easy",
    is_active: true,
    source_note: "SAMPLE - delete before launch",
    translations: [
      {
        language: "en",
        text: "Find the discriminant of the quadratic equation $2x^2 + 3x - 1 = 0$.",
        answer: "Here $a = 2, b = 3, c = -1$. Discriminant $= b^2 - 4ac = 3^2 - 4(2)(-1) = 9 + 8 = 17$.",
      },
      {
        language: "ur",
        text: "دو درجی مساوات $2x^2 + 3x - 1 = 0$ کا فرق کنندہ معلوم کیجیے۔",
        answer: "فرق کنندہ $= b^2 - 4ac = (3)^2 - 4(2)(-1) = 9 + 8 = 17$",
      },
    ],
  },

  // 16. Short - Ch 2
  {
    id: "q0000016-0000-0000-0000-000000000016",
    chapter_id: "ch100000-0000-0000-0000-000000000002",
    type: "short",
    source: "exercise",
    source_ref: "Ex 2.2 Q2",
    concept_tag: "evaluate_omega",
    marks: 2,
    difficulty: "medium",
    is_active: true,
    source_note: "SAMPLE - delete before launch",
    translations: [
      {
        language: "en",
        text: "Evaluate: $(1 - \\omega - \\omega^2)^7$.",
        answer: "$1 - (\\omega + \\omega^2) = 1 - (-1) = 2$. Therefore $(2)^7 = 128$.",
      },
      {
        language: "ur",
        text: "قیمت معلوم کیجیے: $(1 - \\omega - \\omega^2)^7$",
        answer: "$(1 - (\\omega + \\omega^2))^7 = (1 - (-1))^7 = 2^7 = 128$",
      },
    ],
  },

  // 17. Short - Ch 3
  {
    id: "q0000017-0000-0000-0000-000000000017",
    chapter_id: "ch100000-0000-0000-0000-000000000003",
    type: "short",
    source: "past_paper",
    source_ref: "GRW 2021",
    concept_tag: "find_x_proportion",
    marks: 2,
    difficulty: "easy",
    is_active: true,
    source_note: "SAMPLE - delete before launch",
    translations: [
      {
        language: "en",
        text: "Find the value of $x$ in the proportion: $4 : x :: 5 : 15$.",
        answer: "Product of extremes = Product of means $\\implies 5x = 4 \\times 15 = 60 \\implies x = 12$.",
      },
      {
        language: "ur",
        text: "تناسب $4 : x :: 5 : 15$ میں $x$ کی قیمت معلوم کیجیے۔",
        answer: "طرفین کا حاصل ضرب = وسطین کا حاصل ضرب $\\implies 5x = 60 \\implies x = 12$",
      },
    ],
  },

  // 18. Short - Ch 3
  {
    id: "q0000018-0000-0000-0000-000000000018",
    chapter_id: "ch100000-0000-0000-0000-000000000003",
    type: "short",
    source: "exercise",
    source_ref: "Ex 3.2 Q1",
    concept_tag: "direct_variation",
    marks: 2,
    difficulty: "medium",
    is_active: true,
    source_note: "SAMPLE - delete before launch",
    translations: [
      {
        language: "en",
        text: "If $y$ varies directly as $x$, and $y = 8$ when $x = 2$, find $y$ when $x = 5$.",
        answer: "$y = kx \\implies 8 = 2k \\implies k = 4$. When $x = 5$, $y = 4(5) = 20$.",
      },
    ],
  },

  // 19. Short - Ch 4
  {
    id: "q0000019-0000-0000-0000-000000000019",
    chapter_id: "ch100000-0000-0000-0000-000000000004",
    type: "short",
    source: "exercise",
    source_ref: "Ex 4.1 Q1",
    concept_tag: "fraction_types",
    marks: 2,
    difficulty: "easy",
    is_active: true,
    source_note: "SAMPLE - delete before launch",
    translations: [
      {
        language: "en",
        text: "Define a proper fraction with an example.",
        answer: "A rational fraction $\\frac{N(x)}{D(x)}$ with $D(x) \\neq 0$ is proper if the degree of $N(x)$ is strictly less than the degree of $D(x)$. Example: $\\frac{2}{x+1}$.",
      },
    ],
  },

  // 20. Short - Ch 5
  {
    id: "q0000020-0000-0000-0000-000000000020",
    chapter_id: "ch100000-0000-0000-0000-000000000005",
    type: "short",
    source: "exercise",
    source_ref: "Ex 5.1 Q1",
    concept_tag: "set_difference",
    marks: 2,
    difficulty: "easy",
    is_active: true,
    source_note: "SAMPLE - delete before launch",
    translations: [
      {
        language: "en",
        text: "If $X = \\{1, 4, 7, 9\\}$ and $Y = \\{2, 4, 5, 9\\}$, find $X - Y$.",
        answer: "$X - Y = \\{1, 7\\}$.",
      },
    ],
  },

  // 21. Short - Ch 6
  {
    id: "q0000021-0000-0000-0000-000000000021",
    chapter_id: "ch100000-0000-0000-0000-000000000006",
    type: "short",
    source: "exercise",
    source_ref: "Ex 6.2 Q3",
    concept_tag: "arithmetic_mean",
    marks: 2,
    difficulty: "easy",
    is_active: true,
    source_note: "SAMPLE - delete before launch",
    translations: [
      {
        language: "en",
        text: "Find the arithmetic mean of $12, 14, 19, 21, 24$.",
        answer: "Mean $= \\frac{\\sum x}{n} = \\frac{12 + 14 + 19 + 21 + 24}{5} = \\frac{90}{5} = 18$.",
      },
    ],
  },

  // 22. Short - Ch 7 - LaTeX
  {
    id: "q0000022-0000-0000-0000-000000000022",
    chapter_id: "ch100000-0000-0000-0000-000000000007",
    topic_id: "t1000000-0000-0000-0000-000000000006",
    type: "short",
    source: "past_paper",
    source_ref: "SWL 2022",
    concept_tag: "degree_to_radian",
    marks: 2,
    difficulty: "easy",
    is_active: true,
    source_note: "SAMPLE - delete before launch",
    translations: [
      {
        language: "en",
        text: "Convert $45^\\circ$ into radians.",
        answer: "$45^\\circ = 45 \\times \\frac{\\pi}{180} = \\frac{\\pi}{4}$ radians.",
      },
      {
        language: "ur",
        text: "$45^\\circ$ کو ریڈین میں تبدیل کیجیے۔",
        answer: "$45^\\circ = 45 \\times \\frac{\\pi}{180} = \\frac{\\pi}{4}$ ریڈین۔",
      },
    ],
  },

  // 23. Long - Ch 1 - LaTeX
  {
    id: "q0000023-0000-0000-0000-000000000023",
    chapter_id: "ch100000-0000-0000-0000-000000000001",
    topic_id: "t1000000-0000-0000-0000-000000000003",
    type: "long",
    source: "exercise",
    source_ref: "Ex 1.2 Q1 (x)",
    concept_tag: "solve_quadratic_formula",
    marks: 5,
    difficulty: "hard",
    is_active: true,
    source_note: "SAMPLE - delete before launch",
    translations: [
      {
        language: "en",
        text: "Solve the equation using the quadratic formula: $-(l + m) - lx^2 + (2l + m)x = 0$ where $l \\neq 0$.",
        answer: "Standard form: $lx^2 - (2l + m)x + (l + m) = 0$. $a = l, b = -(2l + m), c = (l + m)$. Discriminant $= m^2$. $x = \\frac{(2l + m) \\pm m}{2l}$. Therefore $x = 1$ or $x = \\frac{l + m}{l}$.",
      },
      {
        language: "ur",
        text: "دو درجی فارمولا استعمال کرتے ہوئے مساوات حل کیجیے: $-(l + m) - lx^2 + (2l + m)x = 0$ جبکہ $l \\neq 0$۔",
        answer: "معیاری شکل: $lx^2 - (2l + m)x + (l + m) = 0$۔ فارمولا کی مدد سے حل کرنے پر $x = 1$ اور $x = \\frac{l+m}{l}$ حاصل ہوتا ہے۔",
      },
    ],
  },

  // 24. Long - Ch 1 - LaTeX
  {
    id: "q0000024-0000-0000-0000-000000000024",
    chapter_id: "ch100000-0000-0000-0000-000000000001",
    type: "long",
    source: "exercise",
    source_ref: "Ex 1.3 Q12",
    concept_tag: "exponential_equation",
    marks: 5,
    difficulty: "hard",
    is_active: true,
    source_note: "SAMPLE - delete before launch",
    translations: [
      {
        language: "en",
        text: "Solve the exponential equation: $4 \\cdot 2^{2x + 1} - 9 \\cdot 2^x + 1 = 0$.",
        answer: "Let $y = 2^x$. Equation becomes $8y^2 - 9y + 1 = 0 \\implies (8y - 1)(y - 1) = 0$. So $y = 1 \\implies 2^x = 2^0 \\implies x = 0$; or $y = \\frac{1}{8} = 2^{-3} \\implies x = -3$. Solution set is $\\{0, -3\\}$.",
      },
      {
        language: "ur",
        text: "قوت نمائی مساوات حل کیجیے: $4 \\cdot 2^{2x + 1} - 9 \\cdot 2^x + 1 = 0$",
        answer: "فرض کریں $y = 2^x$۔ مساوات $8y^2 - 9y + 1 = 0$ بن جاتی ہے۔ پس $x = 0$ اور $x = -3$ حاصل ہوگا۔ حل سیٹ $\\{0, -3\\}$ ہے۔",
      },
    ],
  },

  // 25. Long - Ch 2
  {
    id: "q0000025-0000-0000-0000-000000000025",
    chapter_id: "ch100000-0000-0000-0000-000000000002",
    type: "long",
    source: "exercise",
    source_ref: "Ex 2.5 Q1",
    concept_tag: "form_equation_from_roots",
    marks: 4,
    difficulty: "medium",
    is_active: true,
    source_note: "SAMPLE - delete before launch",
    translations: [
      {
        language: "en",
        text: "If $\\alpha, \\beta$ are the roots of $x^2 + px + q = 0$, form an equation whose roots are $\\alpha^2, \\beta^2$.",
        answer: "Sum of given roots $S_1 = -p$, product $P_1 = q$. New sum $S = \\alpha^2 + \\beta^2 = (\\alpha+\\beta)^2 - 2\\alpha\\beta = p^2 - 2q$. New product $P = (\\alpha\\beta)^2 = q^2$. Equation: $x^2 - (p^2 - 2q)x + q^2 = 0$.",
      },
    ],
  },

  // 26. Long - Ch 3 - LaTeX
  {
    id: "q0000026-0000-0000-0000-000000000026",
    chapter_id: "ch100000-0000-0000-0000-000000000003",
    topic_id: "t1000000-0000-0000-0000-000000000005",
    type: "long",
    source: "exercise",
    source_ref: "Ex 3.4 Q1 (i)",
    concept_tag: "componendo_dividendo",
    marks: 4,
    difficulty: "hard",
    is_active: true,
    source_note: "SAMPLE - delete before launch",
    translations: [
      {
        language: "en",
        text: "Prove by theorem of componendo-dividendo: if $\\frac{a}{b} = \\frac{c}{d}$, then $\\frac{4a + 5b}{4a - 5b} = \\frac{4c + 5d}{4c - 5d}$.",
        answer: "Given $\\frac{a}{b} = \\frac{c}{d}$. Multiply both sides by $\\frac{4}{5} \\implies \\frac{4a}{5b} = \\frac{4c}{5d}$. Applying componendo-dividendo theorem gives $\\frac{4a + 5b}{4a - 5b} = \\frac{4c + 5d}{4c - 5d}$.",
      },
      {
        language: "ur",
        text: "مسئلہ ترکیب و تفصیل نسبت کے ذریعے ثابت کریں: اگر $\\frac{a}{b} = \\frac{c}{d}$ ہو تو $\\frac{4a + 5b}{4a - 5b} = \\frac{4c + 5d}{4c - 5d}$۔",
        answer: "دونوں اطراف کو $\\frac{4}{5}$ سے ضرب دینے پر: $\\frac{4a}{5b} = \\frac{4c}{5d}$۔ مسئلہ ترکیب و تفصیل نسبت لگانے سے مطلوبہ نتیجہ حاصل ہوتا ہے۔",
      },
    ],
  },

  // 27. Long - Ch 4 - LaTeX
  {
    id: "q0000027-0000-0000-0000-000000000027",
    chapter_id: "ch100000-0000-0000-0000-000000000004",
    type: "long",
    source: "past_paper",
    source_ref: "LHR 2021",
    concept_tag: "partial_fraction_resolution",
    marks: 4,
    difficulty: "hard",
    is_active: true,
    source_note: "SAMPLE - delete before launch",
    translations: [
      {
        language: "en",
        text: "Resolve into partial fractions: $\\frac{7x - 9}{(x + 1)(x - 3)}$.",
        answer: "Let $\\frac{7x - 9}{(x + 1)(x - 3)} = \\frac{A}{x + 1} + \\frac{B}{x - 3}$. Multiplying by denominator gives $7x - 9 = A(x - 3) + B(x + 1)$. Putting $x = -1 \\implies A = 4$. Putting $x = 3 \\implies B = 3$. Hence $\\frac{4}{x + 1} + \\frac{3}{x - 3}$.",
      },
    ],
  },

  // 28. Long - Ch 5
  {
    id: "q0000028-0000-0000-0000-000000000028",
    chapter_id: "ch100000-0000-0000-0000-000000000005",
    type: "long",
    source: "exercise",
    source_ref: "Ex 5.2 Q1",
    concept_tag: "de_morgan_verification",
    marks: 4,
    difficulty: "medium",
    is_active: true,
    source_note: "SAMPLE - delete before launch",
    translations: [
      {
        language: "en",
        text: "If $U = \\{1, 2, 3, ..., 10\\}$, $A = \\{1, 3, 5, 7, 9\\}$, $B = \\{2, 3, 5, 7\\}$, verify De Morgan's Law: $(A \\cup B)' = A' \\cap B'$.",
        answer: "$A \\cup B = \\{1, 2, 3, 5, 7, 9\\}$. $(A \\cup B)' = \\{4, 6, 8, 10\\}$. $A' = \\{2, 4, 6, 8, 10\\}$, $B' = \\{1, 4, 6, 8, 9, 10\\}$. $A' \\cap B' = \\{4, 6, 8, 10\\}$. LHS = RHS verified.",
      },
    ],
  },

  // 29. Long - Ch 7 - LaTeX
  {
    id: "q0000029-0000-0000-0000-000000000029",
    chapter_id: "ch100000-0000-0000-0000-000000000007",
    topic_id: "t1000000-0000-0000-0000-000000000006",
    type: "long",
    source: "exercise",
    source_ref: "Ex 7.4 Q20",
    concept_tag: "trig_identity_proof",
    marks: 4,
    difficulty: "hard",
    is_active: true,
    source_note: "SAMPLE - delete before launch",
    translations: [
      {
        language: "en",
        text: "Prove the identity: $\\frac{1 + \\sin \\theta}{1 - \\sin \\theta} - \\frac{1 - \\sin \\theta}{1 + \\sin \\theta} = 4 \\tan \\theta \\sec \\theta$.",
        answer: "LHS $= \\frac{(1 + \\sin\\theta)^2 - (1 - \\sin\\theta)^2}{1 - \\sin^2\\theta} = \\frac{4\\sin\\theta}{\\cos^2\\theta} = 4 \\cdot \\frac{\\sin\\theta}{\\cos\\theta} \\cdot \\frac{1}{\\cos\\theta} = 4\\tan\\theta\\sec\\theta = $ RHS.",
      },
      {
        language: "ur",
        text: "مماثلت ثابت کیجیے: $\\frac{1 + \\sin \\theta}{1 - \\sin \\theta} - \\frac{1 - \\sin \\theta}{1 + \\sin \\theta} = 4 \\tan \\theta \\sec \\theta$",
        answer: "بائیں جانب (LHS) کا مشترک مخرج لے کر آسان کرنے سے: $\\frac{4\\sin\\theta}{\\cos^2\\theta} = 4\\tan\\theta\\sec\\theta =$ دائیں جانب (RHS)۔",
      },
    ],
  },

  // 30. Long - Ch 6
  {
    id: "q0000030-0000-0000-0000-000000000030",
    chapter_id: "ch100000-0000-0000-0000-000000000006",
    type: "long",
    source: "exercise",
    source_ref: "Ex 6.3 Q4",
    concept_tag: "standard_deviation",
    marks: 4,
    difficulty: "hard",
    is_active: true,
    source_note: "SAMPLE - delete before launch",
    translations: [
      {
        language: "en",
        text: "Calculate the standard deviation $S$ for the data values: $12, 6, 7, 3, 15, 10, 18, 5$.",
        answer: "Sum $\\sum X = 76, n = 8, \\bar{X} = 9.5$. $\\sum X^2 = 912$. $S = \\sqrt{\\frac{\\sum X^2}{n} - (\\bar{X})^2} = \\sqrt{\\frac{912}{8} - (9.5)^2} = \\sqrt{114 - 90.25} = \\sqrt{23.75} \\approx 4.87$.",
      },
    ],
  },
];
