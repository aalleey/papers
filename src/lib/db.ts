import {
  Board,
  ClassItem,
  Course,
  Subject,
  Chapter,
  Topic,
  Question,
  QuestionTranslation,
  CsvImportRow,
  ClientUser,
  SubscriptionPlanId,
  getPlanPermissions,
  PaperRecord,
  ClientPaperStats,
  EmailRecord,
  InvoiceRecord,
} from "./types";
import {
  SEED_BOARDS,
  SEED_CLASSES,
  SEED_COURSES,
  SEED_SUBJECTS,
  SEED_CHAPTERS,
  SEED_TOPICS,
  SEED_QUESTIONS,
} from "./seed-data";
import { createServerSupabaseClient } from "./supabase/server";
import { createAdminSupabaseClient } from "./supabase/admin";

export const SEED_CLIENTS: ClientUser[] = [
  {
    id: "admin-client-ali",
    email: "ali.khaliq50@gmail.com",
    fullName: "Ali Khaliq",
    academyName: "PaperWala Administration",
    phone: "0300-1234567",
    password: "laptop321",
    role: "client",
    subscription: {
      planId: "annual",
      planName: "Administrator Premium Plan",
      status: "active",
      expiresAt: new Date(Date.now() + 3650 * 24 * 60 * 60 * 1000).toISOString(),
      paperCredits: 999999,
      canAutoBoardPattern: true,
      canCustomBranding: true,
      canExportAnswerKey: true,
      canFullBoardPaper: true,
      canUnlimitedExport: true,
      canAccessAllClasses: true,
      maxQuestionsPerPaper: 100,
    },
    createdAt: new Date().toISOString(),
    isVerified: true,
    notes: "Default System Administrator Account",
  },
  {
    id: "client-seed-001",
    email: "usman.khan@apexacademy.edu.pk",
    fullName: "Professor Usman Khan",
    academyName: "Apex Science Academy Lahore",
    phone: "0300-9458291",
    password: "apexPassword123",
    role: "client",
    subscription: {
      planId: "standard",
      planName: "Standard Plan",
      status: "active",
      expiresAt: new Date(Date.now() + 140 * 24 * 60 * 60 * 1000).toISOString(),
      paperCredits: 999999,
      canAutoBoardPattern: true,
      canCustomBranding: true,
      canExportAnswerKey: true,
      canFullBoardPaper: true,
      canUnlimitedExport: true,
      canAccessAllClasses: true,
      maxQuestionsPerPaper: 100,
    },
    createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
    notes: "Senior Educator • Matric & FSc Board Examination Specialist",
  },
  {
    id: "client-seed-002",
    email: "ayesha.s@kips.edu.pk",
    fullName: "Dr. Ayesha Siddiqui",
    academyName: "KIPS Preparatory College Rawalpindi",
    phone: "0321-4829104",
    password: "kipsPassword123",
    role: "client",
    subscription: {
      planId: "annual",
      planName: "Annual Premium Plan",
      status: "active",
      expiresAt: new Date(Date.now() + 310 * 24 * 60 * 60 * 1000).toISOString(),
      paperCredits: 999999,
      canAutoBoardPattern: true,
      canCustomBranding: true,
      canExportAnswerKey: true,
      canFullBoardPaper: true,
      canUnlimitedExport: true,
      canAccessAllClasses: true,
      maxQuestionsPerPaper: 100,
    },
    createdAt: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000).toISOString(),
    notes: "Annual Subscriber • 200+ students per batch",
  },
  {
    id: "client-seed-003",
    email: "tariq.educator@punjabcollege.pk",
    fullName: "Tariq Mehmood",
    academyName: "Punjab Group of Colleges Multan",
    phone: "0333-5182940",
    password: "pgcPassword123",
    role: "client",
    subscription: {
      planId: "pay_as_you_go",
      planName: "Go as you pay",
      status: "active",
      expiresAt: null,
      paperCredits: 12,
      canAutoBoardPattern: true,
      canCustomBranding: true,
      canExportAnswerKey: true,
      canFullBoardPaper: true,
      canUnlimitedExport: false,
      canAccessAllClasses: true,
      maxQuestionsPerPaper: 100,
    },
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    notes: "Pay-as-you-go customer with 12 remaining paper credits",
  },
  {
    id: "client-seed-004",
    email: "sajid.hussain@ghs.gov.pk",
    fullName: "Sajid Hussain",
    academyName: "Govt High School No. 1 Faisalabad",
    phone: "0312-7729103",
    password: "ghsPassword123",
    role: "client",
    subscription: {
      planId: "free",
      planName: "Free Plan",
      status: "active",
      expiresAt: null,
      paperCredits: 0,
      canAutoBoardPattern: false,
      canCustomBranding: false,
      canExportAnswerKey: false,
      canFullBoardPaper: false,
      canUnlimitedExport: false,
      canAccessAllClasses: true,
      maxQuestionsPerPaper: 10,
    },
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    notes: "Free Tier Educator exploring computer science unit 2",
  },
  {
    id: "client-seed-005",
    email: "maryam.noor@alilm.edu.pk",
    fullName: "Maryam Noor",
    academyName: "Al-Ilm Grammar School Gujranwala",
    phone: "0345-6671829",
    password: "alilmPassword123",
    role: "client",
    subscription: {
      planId: "standard",
      planName: "Standard Plan",
      status: "suspended",
      expiresAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      paperCredits: 0,
      canAutoBoardPattern: true,
      canCustomBranding: true,
      canExportAnswerKey: true,
      canFullBoardPaper: true,
      canUnlimitedExport: true,
      canAccessAllClasses: true,
      maxQuestionsPerPaper: 100,
    },
    createdAt: new Date(Date.now() - 190 * 24 * 60 * 60 * 1000).toISOString(),
    notes: "Account suspended due to expired term - pending renewal",
  },
];

// Generates believable demo paper history for seeded clients
function buildSeedPapers(): PaperRecord[] {
  const specs: { clientId: string; count: number; spanDays: number }[] = [
    { clientId: "client-seed-001", count: 22, spanDays: 38 },
    { clientId: "client-seed-002", count: 31, spanDays: 52 },
    { clientId: "client-seed-003", count: 7, spanDays: 14 },
    { clientId: "client-seed-004", count: 3, spanDays: 4 },
    { clientId: "client-seed-005", count: 12, spanDays: 180 },
  ];
  const subjects = ["Computer Science", "Computer Science", "Mathematics", "Physics"];
  const syllabi = [
    "Unit-1 Operating Systems",
    "Unit-2 System Recovery and Advanced Maintenance",
    "Unit-8 Digital Entrepreneurship",
    "Quadratic Equations",
  ];
  const langs: PaperRecord["languageMode"][] = ["Bilingual", "Bilingual", "English", "Urdu"];
  const modes: PaperRecord["exportMode"][] = ["all", "questions", "all", "key"];
  const out: PaperRecord[] = [];
  const client = (id: string) => SEED_CLIENTS.find((c) => c.id === id)!;

  specs.forEach((s) => {
    for (let i = 0; i < s.count; i++) {
      const mcq = 7 + (i % 3) * 2;
      const short = 5 + (i % 2);
      const long = 1 + (i % 2);
      const days = (i / Math.max(1, s.count - 1)) * s.spanDays;
      out.push({
        id: `paper-${s.clientId}-${i + 1}`,
        clientId: s.clientId,
        title: `Test No. ${s.count - i} - ${subjects[i % subjects.length]}`,
        institution: client(s.clientId).academyName || "Educator Academy",
        subject: subjects[i % subjects.length],
        className: "10th",
        syllabus: syllabi[i % syllabi.length],
        mcqCount: mcq,
        shortCount: short,
        longCount: long,
        questionCount: mcq + short + long,
        totalMarks: mcq + short * 2 + long * 5,
        languageMode: langs[i % langs.length],
        version: ["A", "B", "C", "D"][i % 4],
        exportMode: modes[i % modes.length],
        createdAt: new Date(Date.now() - days * 24 * 60 * 60 * 1000 - i * 3600000).toISOString(),
      });
    }
  });
  return out;
}

// In-memory / development store initialized from seed data
interface MockStore {
  boards: Board[];
  classes: ClassItem[];
  courses: Course[];
  subjects: Subject[];
  chapters: Chapter[];
  topics: Topic[];
  questions: Question[];
  clients: ClientUser[];
  papers: PaperRecord[];
  emails: EmailRecord[];
  invoices: InvoiceRecord[];
}

// Helper to determine whether the app is executing in live production mode
export function isProductionEnvironment(): boolean {
  return process.env.NODE_ENV === "production" && process.env.ENABLE_DEMO_SEED !== "true";
}

// Returns the active partition environment for user & client data: 'production' or 'development'
export function getCurrentDataEnvironment(): "production" | "development" {
  return isProductionEnvironment() ? "production" : "development";
}

// Global reference to retain state across Next.js dev reloads
const globalForStore = globalThis as unknown as { mockStore?: MockStore };

function initMockStore(): MockStore {
  const isProd = isProductionEnvironment();

  if (globalForStore.mockStore) {
    if (!globalForStore.mockStore.clients) {
      globalForStore.mockStore.clients = isProd ? [] : [...SEED_CLIENTS];
    }
    if (!globalForStore.mockStore.papers) {
      globalForStore.mockStore.papers = isProd ? [] : buildSeedPapers();
    }
    if (!globalForStore.mockStore.emails) {
      globalForStore.mockStore.emails = [];
    }
    if (!globalForStore.mockStore.invoices) {
      globalForStore.mockStore.invoices = [];
    }
    return globalForStore.mockStore;
  }

  const initialQuestions: Question[] = SEED_QUESTIONS.map((sq) => {
    const translations: QuestionTranslation[] = sq.translations.map((t) => ({
      language: t.language,
      text: t.text,
      options: t.options || null,
      answer: t.answer || null,
    }));

    return {
      id: sq.id,
      chapter_id: sq.chapter_id,
      topic_id: sq.topic_id || null,
      type: sq.type,
      source: sq.source,
      source_ref: sq.source_ref || null,
      concept_tag: sq.concept_tag || null,
      correct_option: sq.correct_option || null,
      marks: sq.marks,
      difficulty: sq.difficulty,
      is_active: sq.is_active,
      source_note: sq.source_note || null,
      created_at: new Date().toISOString(),
      translations,
    };
  });

  const store: MockStore = {
    boards: [...SEED_BOARDS],
    classes: [...SEED_CLASSES],
    courses: [...SEED_COURSES],
    subjects: [...SEED_SUBJECTS],
    chapters: [...SEED_CHAPTERS],
    topics: [...SEED_TOPICS],
    questions: initialQuestions,
    clients: isProd ? [] : [...SEED_CLIENTS],
    papers: isProd ? [] : buildSeedPapers(),
    emails: [],
    invoices: [],
  };

  globalForStore.mockStore = store;
  return store;
}

// Data Service
export const db = {
  // Boards
  async getBoards(): Promise<Board[]> {
    const serverClient = await createServerSupabaseClient();
    if (serverClient) {
      const { data, error } = await serverClient.from("boards").select("*").order("name");
      if (!error && data && data.length > 0) return data as Board[];
    }
    const adminClient = createAdminSupabaseClient();
    if (adminClient) {
      const { data, error } = await adminClient.from("boards").select("*").order("name");
      if (!error && data && data.length > 0) return data as Board[];
    }
    const store = initMockStore();
    return [...store.boards].sort((a, b) => a.name.localeCompare(b.name));
  },

  async createBoard(name: string, name_ur?: string | null): Promise<Board> {
    const adminClient = createAdminSupabaseClient();
    if (adminClient) {
      const { data, error } = await adminClient
        .from("boards")
        .insert({ name, name_ur: name_ur || null })
        .select()
        .single();
      if (!error && data) return data as Board;
    }
    const store = initMockStore();
    const newBoard: Board = {
      id: `b${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name,
      name_ur: name_ur || null,
      created_at: new Date().toISOString(),
    };
    store.boards.push(newBoard);
    return newBoard;
  },

  async updateBoard(id: string, name: string, name_ur?: string | null): Promise<Board | null> {
    const adminClient = createAdminSupabaseClient();
    if (adminClient) {
      const { data, error } = await adminClient
        .from("boards")
        .update({ name, name_ur: name_ur || null })
        .eq("id", id)
        .select()
        .single();
      if (!error && data) return data as Board;
    }
    const store = initMockStore();
    const index = store.boards.findIndex((b) => b.id === id);
    if (index === -1) return null;
    store.boards[index] = { ...store.boards[index], name, name_ur: name_ur || null };
    return store.boards[index];
  },

  async deleteBoard(id: string): Promise<boolean> {
    const adminClient = createAdminSupabaseClient();
    if (adminClient) {
      const { error } = await adminClient.from("boards").delete().eq("id", id);
      return !error;
    }
    const store = initMockStore();
    const initialLen = store.boards.length;
    store.boards = store.boards.filter((b) => b.id !== id);
    return store.boards.length < initialLen;
  },

  // Classes
  async getClasses(): Promise<ClassItem[]> {
    const serverClient = await createServerSupabaseClient();
    if (serverClient) {
      const { data, error } = await serverClient.from("classes").select("*").order("numeric_order");
      if (!error && data && data.length > 0) return data as ClassItem[];
    }
    const adminClient = createAdminSupabaseClient();
    if (adminClient) {
      const { data, error } = await adminClient.from("classes").select("*").order("numeric_order");
      if (!error && data && data.length > 0) return data as ClassItem[];
    }
    const store = initMockStore();
    return [...store.classes].sort((a, b) => a.numeric_order - b.numeric_order);
  },

  // Courses
  async getCourses(boardId?: string): Promise<Course[]> {
    const serverClient = await createServerSupabaseClient();
    if (serverClient) {
      let q = serverClient.from("courses").select("*");
      if (boardId) q = q.eq("board_id", boardId);
      const { data, error } = await q.order("name");
      if (!error && data && data.length > 0) return data as Course[];
    }
    const adminClient = createAdminSupabaseClient();
    if (adminClient) {
      let q = adminClient.from("courses").select("*");
      if (boardId) q = q.eq("board_id", boardId);
      const { data, error } = await q.order("name");
      if (!error && data && data.length > 0) return data as Course[];
    }
    const store = initMockStore();
    let courses = [...store.courses];
    if (boardId) {
      courses = courses.filter((c) => c.board_id === boardId);
    }
    return courses.sort((a, b) => a.name.localeCompare(b.name));
  },

  async createCourse(course: Omit<Course, "id" | "created_at">): Promise<Course> {
    const adminClient = createAdminSupabaseClient();
    if (adminClient) {
      const { data, error } = await adminClient.from("courses").insert(course).select().single();
      if (!error && data) return data as Course;
    }
    const store = initMockStore();
    const newCourse: Course = {
      ...course,
      id: `cr${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      created_at: new Date().toISOString(),
    };
    store.courses.push(newCourse);
    return newCourse;
  },

  async updateCourse(id: string, course: Partial<Course>): Promise<Course | null> {
    const adminClient = createAdminSupabaseClient();
    if (adminClient) {
      const { data, error } = await adminClient.from("courses").update(course).eq("id", id).select().single();
      if (!error && data) return data as Course;
    }
    const store = initMockStore();
    const index = store.courses.findIndex((c) => c.id === id);
    if (index === -1) return null;
    store.courses[index] = { ...store.courses[index], ...course };
    return store.courses[index];
  },

  async deleteCourse(id: string): Promise<boolean> {
    const adminClient = createAdminSupabaseClient();
    if (adminClient) {
      const { error } = await adminClient.from("courses").delete().eq("id", id);
      return !error;
    }
    const store = initMockStore();
    store.courses = store.courses.filter((c) => c.id !== id);
    return true;
  },

  // Subjects
  async getSubjects(courseId?: string): Promise<Subject[]> {
    const serverClient = await createServerSupabaseClient();
    if (serverClient) {
      let q = serverClient.from("subjects").select("*");
      if (courseId) q = q.eq("course_id", courseId);
      const { data, error } = await q.order("name");
      if (!error && data && data.length > 0) return data as Subject[];
    }
    const adminClient = createAdminSupabaseClient();
    if (adminClient) {
      let q = adminClient.from("subjects").select("*");
      if (courseId) q = q.eq("course_id", courseId);
      const { data, error } = await q.order("name");
      if (!error && data && data.length > 0) return data as Subject[];
    }
    const store = initMockStore();
    let subjects = [...store.subjects];
    if (courseId) {
      subjects = subjects.filter((s) => s.course_id === courseId);
    }
    return subjects.sort((a, b) => a.name.localeCompare(b.name));
  },

  async createSubject(subject: Omit<Subject, "id" | "created_at">): Promise<Subject> {
    const adminClient = createAdminSupabaseClient();
    if (adminClient) {
      const { data, error } = await adminClient.from("subjects").insert(subject).select().single();
      if (!error && data) return data as Subject;
    }
    const store = initMockStore();
    const newSubject: Subject = {
      ...subject,
      id: `s${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      created_at: new Date().toISOString(),
    };
    store.subjects.push(newSubject);
    return newSubject;
  },

  async updateSubject(id: string, subject: Partial<Subject>): Promise<Subject | null> {
    const adminClient = createAdminSupabaseClient();
    if (adminClient) {
      const { data, error } = await adminClient.from("subjects").update(subject).eq("id", id).select().single();
      if (!error && data) return data as Subject;
    }
    const store = initMockStore();
    const index = store.subjects.findIndex((s) => s.id === id);
    if (index === -1) return null;
    store.subjects[index] = { ...store.subjects[index], ...subject };
    return store.subjects[index];
  },

  async deleteSubject(id: string): Promise<boolean> {
    const adminClient = createAdminSupabaseClient();
    if (adminClient) {
      const { error } = await adminClient.from("subjects").delete().eq("id", id);
      return !error;
    }
    const store = initMockStore();
    store.subjects = store.subjects.filter((s) => s.id !== id);
    return true;
  },

  // Chapters
  async getChapters(subjectId?: string): Promise<Chapter[]> {
    const serverClient = await createServerSupabaseClient();
    if (serverClient) {
      let q = serverClient.from("chapters").select("*");
      if (subjectId) q = q.eq("subject_id", subjectId);
      const { data, error } = await q.order("number");
      if (!error && data && data.length > 0) return data as Chapter[];
    }
    const adminClient = createAdminSupabaseClient();
    if (adminClient) {
      let q = adminClient.from("chapters").select("*");
      if (subjectId) q = q.eq("subject_id", subjectId);
      const { data, error } = await q.order("number");
      if (!error && data && data.length > 0) return data as Chapter[];
    }
    const store = initMockStore();
    let chapters = [...store.chapters];
    if (subjectId) {
      chapters = chapters.filter((c) => c.subject_id === subjectId);
    }
    return chapters.sort((a, b) => a.number - b.number);
  },

  async createChapter(chapter: Omit<Chapter, "id" | "created_at">): Promise<Chapter> {
    const adminClient = createAdminSupabaseClient();
    if (adminClient) {
      const { data, error } = await adminClient.from("chapters").insert(chapter).select().single();
      if (!error && data) return data as Chapter;
    }
    const store = initMockStore();
    const newChapter: Chapter = {
      ...chapter,
      id: `ch${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      created_at: new Date().toISOString(),
    };
    store.chapters.push(newChapter);
    return newChapter;
  },

  async updateChapter(id: string, chapter: Partial<Chapter>): Promise<Chapter | null> {
    const adminClient = createAdminSupabaseClient();
    if (adminClient) {
      const { data, error } = await adminClient.from("chapters").update(chapter).eq("id", id).select().single();
      if (!error && data) return data as Chapter;
    }
    const store = initMockStore();
    const index = store.chapters.findIndex((c) => c.id === id);
    if (index === -1) return null;
    store.chapters[index] = { ...store.chapters[index], ...chapter };
    return store.chapters[index];
  },

  async deleteChapter(id: string): Promise<boolean> {
    const adminClient = createAdminSupabaseClient();
    if (adminClient) {
      const { error } = await adminClient.from("chapters").delete().eq("id", id);
      return !error;
    }
    const store = initMockStore();
    store.chapters = store.chapters.filter((c) => c.id !== id);
    return true;
  },

  // Topics
  async getTopics(chapterId?: string): Promise<Topic[]> {
    const serverClient = await createServerSupabaseClient();
    if (serverClient) {
      let q = serverClient.from("topics").select("*");
      if (chapterId) q = q.eq("chapter_id", chapterId);
      const { data, error } = await q.order("number");
      if (!error && data && data.length > 0) return data as Topic[];
    }
    const adminClient = createAdminSupabaseClient();
    if (adminClient) {
      let q = adminClient.from("topics").select("*");
      if (chapterId) q = q.eq("chapter_id", chapterId);
      const { data, error } = await q.order("number");
      if (!error && data && data.length > 0) return data as Topic[];
    }
    const store = initMockStore();
    let topics = [...store.topics];
    if (chapterId) {
      topics = topics.filter((t) => t.chapter_id === chapterId);
    }
    return topics.sort((a, b) => a.number - b.number);
  },

  async createTopic(topic: Omit<Topic, "id" | "created_at">): Promise<Topic> {
    const adminClient = createAdminSupabaseClient();
    if (adminClient) {
      const { data, error } = await adminClient.from("topics").insert(topic).select().single();
      if (!error && data) return data as Topic;
    }
    const store = initMockStore();
    const newTopic: Topic = {
      ...topic,
      id: `t${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      created_at: new Date().toISOString(),
    };
    store.topics.push(newTopic);
    return newTopic;
  },

  async updateTopic(id: string, topic: Partial<Topic>): Promise<Topic | null> {
    const adminClient = createAdminSupabaseClient();
    if (adminClient) {
      const { data, error } = await adminClient.from("topics").update(topic).eq("id", id).select().single();
      if (!error && data) return data as Topic;
    }
    const store = initMockStore();
    const index = store.topics.findIndex((t) => t.id === id);
    if (index === -1) return null;
    store.topics[index] = { ...store.topics[index], ...topic };
    return store.topics[index];
  },

  async deleteTopic(id: string): Promise<boolean> {
    const adminClient = createAdminSupabaseClient();
    if (adminClient) {
      const { error } = await adminClient.from("topics").delete().eq("id", id);
      return !error;
    }
    const store = initMockStore();
    store.topics = store.topics.filter((t) => t.id !== id);
    return true;
  },

  // Questions
  async getQuestions(filters?: {
    chapterId?: string;
    topicId?: string;
    type?: string;
    difficulty?: string;
    source?: string;
    search?: string;
    isActiveOnly?: boolean;
    isAuthenticatedAdmin?: boolean;
  }): Promise<Question[]> {
    // Security check: Questions are NOT publicly readable!
    // If not authenticated as admin, return empty list!
    if (filters?.isAuthenticatedAdmin === false) {
      return [];
    }

    const serverClient = await createServerSupabaseClient();
    if (serverClient) {
      let q = serverClient.from("questions").select("*, translations:question_translations(*)");
      if (filters?.chapterId) q = q.eq("chapter_id", filters.chapterId);
      if (filters?.topicId) q = q.eq("topic_id", filters.topicId);
      if (filters?.type && filters.type !== "all") q = q.eq("type", filters.type);
      if (filters?.difficulty && filters.difficulty !== "all") q = q.eq("difficulty", filters.difficulty);
      if (filters?.source && filters.source !== "all") q = q.eq("source", filters.source);
      if (filters?.isActiveOnly) q = q.eq("is_active", true);

      const { data, error } = await q.order("created_at", { ascending: false });
      if (!error && data && data.length > 0) {
        let results = (data as any[]).map((row) => ({
          ...row,
          translations: (row.translations || []).map((t: any) => ({
            ...t,
            options:
              typeof t.options === "string"
                ? (() => {
                    try {
                      return JSON.parse(t.options);
                    } catch {
                      return [];
                    }
                  })()
                : Array.isArray(t.options)
                ? t.options
                : null,
          })),
        })) as Question[];

        if (filters?.search) {
          const s = filters.search.toLowerCase();
          results = results.filter((item) => {
            const matchRef = item.source_ref?.toLowerCase().includes(s);
            const matchTag = item.concept_tag?.toLowerCase().includes(s);
            const matchTrans = item.translations?.some((t) => t.text.toLowerCase().includes(s));
            return matchRef || matchTag || matchTrans;
          });
        }
        return results;
      }
    }

    const adminClient = createAdminSupabaseClient();
    if (adminClient) {
      let q = adminClient.from("questions").select("*, translations:question_translations(*)");
      if (filters?.chapterId) q = q.eq("chapter_id", filters.chapterId);
      if (filters?.topicId) q = q.eq("topic_id", filters.topicId);
      if (filters?.type && filters.type !== "all") q = q.eq("type", filters.type);
      if (filters?.difficulty && filters.difficulty !== "all") q = q.eq("difficulty", filters.difficulty);
      if (filters?.source && filters.source !== "all") q = q.eq("source", filters.source);
      if (filters?.isActiveOnly) q = q.eq("is_active", true);

      const { data, error } = await q.order("created_at", { ascending: false });
      if (!error && data && data.length > 0) {
        let results = (data as any[]).map((row) => ({
          ...row,
          translations: (row.translations || []).map((t: any) => ({
            ...t,
            options:
              typeof t.options === "string"
                ? (() => {
                    try {
                      return JSON.parse(t.options);
                    } catch {
                      return [];
                    }
                  })()
                : Array.isArray(t.options)
                ? t.options
                : null,
          })),
        })) as Question[];

        if (filters?.search) {
          const s = filters.search.toLowerCase();
          results = results.filter((item) => {
            const matchRef = item.source_ref?.toLowerCase().includes(s);
            const matchTag = item.concept_tag?.toLowerCase().includes(s);
            const matchTrans = item.translations?.some((t) => t.text.toLowerCase().includes(s));
            return matchRef || matchTag || matchTrans;
          });
        }
        return results;
      }
    }

    const store = initMockStore();
    let questions = [...store.questions];

    if (filters?.chapterId) {
      questions = questions.filter((q) => q.chapter_id === filters.chapterId);
    }
    if (filters?.topicId) {
      questions = questions.filter((q) => q.topic_id === filters.topicId);
    }
    if (filters?.type && filters.type !== "all") {
      questions = questions.filter((q) => q.type === filters.type);
    }
    if (filters?.difficulty && filters.difficulty !== "all") {
      questions = questions.filter((q) => q.difficulty === filters.difficulty);
    }
    if (filters?.source && filters.source !== "all") {
      questions = questions.filter((q) => q.source === filters.source);
    }
    if (filters?.isActiveOnly) {
      questions = questions.filter((q) => q.is_active);
    }
    if (filters?.search) {
      const s = filters.search.toLowerCase();
      questions = questions.filter((item) => {
        const matchRef = item.source_ref?.toLowerCase().includes(s);
        const matchTag = item.concept_tag?.toLowerCase().includes(s);
        const matchTrans = item.translations?.some((t) => t.text.toLowerCase().includes(s));
        return matchRef || matchTag || matchTrans;
      });
    }

    return questions;
  },

  async getQuestionById(id: string): Promise<Question | null> {
    const serverClient = await createServerSupabaseClient();
    if (serverClient) {
      const { data, error } = await serverClient
        .from("questions")
        .select("*, translations:question_translations(*)")
        .eq("id", id)
        .single();
      if (!error && data) return data as Question;
    }
    const adminClient = createAdminSupabaseClient();
    if (adminClient) {
      const { data, error } = await adminClient
        .from("questions")
        .select("*, translations:question_translations(*)")
        .eq("id", id)
        .single();
      if (!error && data) return data as Question;
    }
    const store = initMockStore();
    return store.questions.find((q) => q.id === id) || null;
  },

  async saveQuestion(question: {
    id?: string;
    chapter_id: string;
    topic_id?: string | null;
    type: "mcq" | "short" | "long";
    source: "exercise" | "extra" | "past_paper";
    source_ref?: string | null;
    concept_tag?: string | null;
    correct_option?: number | null;
    marks: number;
    difficulty: "easy" | "medium" | "hard";
    is_active?: boolean;
    source_note?: string | null;
    translations: {
      language: "en" | "ur";
      text: string;
      options?: string[] | null;
      answer?: string | null;
    }[];
  }): Promise<Question> {
    const qId = question.id || crypto.randomUUID();
    const adminClient = createAdminSupabaseClient();
    if (adminClient) {
      const questionPayload = {
        id: qId,
        chapter_id: question.chapter_id,
        topic_id: question.topic_id || null,
        type: question.type,
        source: question.source,
        source_ref: question.source_ref || null,
        concept_tag: question.concept_tag || null,
        correct_option: question.type === "mcq" ? question.correct_option : null,
        marks: question.marks,
        difficulty: question.difficulty,
        is_active: question.is_active ?? true,
        source_note: question.source_note || null,
      };

      const { error: upsertErr } = await adminClient
        .from("questions")
        .upsert(questionPayload);

      if (!upsertErr) {
        // Replace translations
        await adminClient.from("question_translations").delete().eq("question_id", qId);
        for (const t of question.translations) {
          if (!t.text.trim()) continue;
          await adminClient.from("question_translations").insert({
            question_id: qId,
            language: t.language,
            text: t.text,
            options: t.options ? JSON.stringify(t.options) : null,
            answer: t.answer || null,
          });
        }
      }
    }

    const store = initMockStore();
    const id = qId;

    const newQuestion: Question = {
      id,
      chapter_id: question.chapter_id,
      topic_id: question.topic_id || null,
      type: question.type,
      source: question.source,
      source_ref: question.source_ref || null,
      concept_tag: question.concept_tag || null,
      correct_option: question.type === "mcq" ? question.correct_option || null : null,
      marks: question.marks,
      difficulty: question.difficulty,
      is_active: question.is_active ?? true,
      source_note: question.source_note || null,
      translations: question.translations
        .filter((t) => t.text.trim().length > 0)
        .map((t) => ({
          language: t.language,
          text: t.text,
          options: t.options ?? null,
          answer: t.answer ?? null,
        })),
    };

    const existingIdx = store.questions.findIndex((q) => q.id === id);
    if (existingIdx >= 0) {
      store.questions[existingIdx] = newQuestion;
    } else {
      store.questions.unshift(newQuestion);
    }

    return newQuestion;
  },

  async toggleQuestionActive(id: string): Promise<boolean> {
    const adminClient = createAdminSupabaseClient();
    if (adminClient) {
      const q = await this.getQuestionById(id);
      if (q) {
        const { error } = await adminClient
          .from("questions")
          .update({ is_active: !q.is_active })
          .eq("id", id);
        return !error;
      }
    }
    const store = initMockStore();
    const q = store.questions.find((item) => item.id === id);
    if (q) {
      q.is_active = !q.is_active;
      return true;
    }
    return false;
  },

  async deleteQuestion(id: string): Promise<boolean> {
    const adminClient = createAdminSupabaseClient();
    if (adminClient) {
      const { error } = await adminClient.from("questions").delete().eq("id", id);
      return !error;
    }
    const store = initMockStore();
    store.questions = store.questions.filter((q) => q.id !== id);
    return true;
  },

  // Import CSV Rows into Questions
  async importCsvQuestions(
    subjectId: string,
    rows: CsvImportRow[]
  ): Promise<{ importedCount: number; skippedDuplicates: number; errors: string[] }> {
    const chapters = await this.getChapters(subjectId);
    const existingQuestions = await this.getQuestions();
    let importedCount = 0;
    let skippedDuplicates = 0;
    const errors: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const targetChapter = chapters.find((c) => c.number === row.chapter_number);
      if (!targetChapter) {
        errors.push(`Row ${i + 1}: Chapter number ${row.chapter_number} not found in selected subject.`);
        continue;
      }

      // Check duplicates (same chapter + same English text)
      const isDuplicate = existingQuestions.some((eq) => {
        if (eq.chapter_id !== targetChapter.id) return false;
        const enTrans = eq.translations?.find((t) => t.language === "en");
        return enTrans?.text.trim().toLowerCase() === row.text_en.trim().toLowerCase();
      });

      if (isDuplicate) {
        skippedDuplicates++;
        continue;
      }

      // Find topic if topic_number specified
      let topicId: string | null = null;
      if (row.topic_number) {
        const topics = await this.getTopics(targetChapter.id);
        const t = topics.find((top) => top.number === row.topic_number);
        if (t) topicId = t.id;
      }

      const translations: {
        language: "en" | "ur";
        text: string;
        options?: string[] | null;
        answer?: string | null;
      }[] = [];

      // English translation
      const optionsEn =
        row.type === "mcq" && row.option_a && row.option_b && row.option_c && row.option_d
          ? [row.option_a, row.option_b, row.option_c, row.option_d]
          : null;

      translations.push({
        language: "en",
        text: row.text_en,
        options: optionsEn,
        answer: row.answer_en || null,
      });

      // Urdu translation if provided
      if (row.text_ur && row.text_ur.trim()) {
        translations.push({
          language: "ur",
          text: row.text_ur,
          options: optionsEn,
          answer: row.answer_en || null,
        });
      }

      await this.saveQuestion({
        chapter_id: targetChapter.id,
        topic_id: topicId,
        type: row.type,
        source: row.source || "exercise",
        source_ref: row.source_ref || null,
        concept_tag: row.concept_tag || null,
        correct_option: row.type === "mcq" ? row.correct_option || null : null,
        marks: row.marks || (row.type === "mcq" ? 1 : row.type === "short" ? 2 : 5),
        difficulty: row.difficulty || "medium",
        is_active: true,
        source_note: "CSV Import",
        translations,
      });

      importedCount++;
    }

    return { importedCount, skippedDuplicates, errors };
  },

  // =========================================================================
  // CLIENT USERS & SUBSCRIPTION MANAGEMENT (Admin Control & Persistence)
  // =========================================================================

  async getClients(params?: { search?: string; planId?: string; status?: string }): Promise<ClientUser[]> {
    const adminClient = createAdminSupabaseClient();
    const env = getCurrentDataEnvironment();

    if (adminClient) {
      try {
        let q = adminClient.from("clients").select("*");
        if (isProductionEnvironment()) {
          q = q.eq("environment", "production");
        }
        if (params?.planId && params.planId !== "all") {
          q = q.eq("subscription->>planId", params.planId);
        }
        const { data, error } = await q.order("created_at", { ascending: false });
        if (!error && data) {
          let clients: ClientUser[] = data.map((row) => {
            const sub = (row.subscription || {}) as any;
            const password = sub.password || row.password || null;
            const paymentSubmission = sub.paymentSubmission || row.payment_submission || null;
            const isVerified = sub.isVerified !== undefined ? sub.isVerified : (row.is_verified ?? (sub.status === "active"));

            return {
              id: row.id,
              email: row.email,
              fullName: row.full_name,
              academyName: row.academy_name,
              phone: row.phone,
              password,
              role: (row.role as "client") || "client",
              subscription: {
                ...sub,
                status: sub.status || "active",
              },
              paymentSubmission,
              isVerified,
              notes: row.notes,
              createdAt: row.created_at,
              updatedAt: row.updated_at,
            };
          });

          if (params?.search) {
            const query = params.search.toLowerCase().trim();
            clients = clients.filter(
              (c) =>
                c.fullName.toLowerCase().includes(query) ||
                c.email.toLowerCase().includes(query) ||
                (c.phone && c.phone.toLowerCase().includes(query)) ||
                (c.academyName && c.academyName.toLowerCase().includes(query)) ||
                (c.paymentSubmission?.transactionRef && c.paymentSubmission.transactionRef.toLowerCase().includes(query))
            );
          }

          if (params?.status && params.status !== "all") {
            if (params.status === "pending_verification") {
              clients = clients.filter((c) => c.subscription.status === "pending_verification" || c.isVerified === false);
            } else if (params.status === "active") {
              clients = clients.filter((c) => c.subscription.status === "active" && c.isVerified !== false);
            } else {
              clients = clients.filter((c) => c.subscription.status === params.status);
            }
          }

          return clients;
        }
      } catch {
        // Fallback to in-memory store if table not created yet
      }
    }

    const store = initMockStore();
    let clients = [...store.clients];

    if (params?.search) {
      const q = params.search.toLowerCase().trim();
      clients = clients.filter(
        (c) =>
          c.fullName.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          (c.phone && c.phone.toLowerCase().includes(q)) ||
          (c.academyName && c.academyName.toLowerCase().includes(q)) ||
          (c.paymentSubmission?.transactionRef && c.paymentSubmission.transactionRef.toLowerCase().includes(q))
      );
    }

    if (params?.planId && params.planId !== "all") {
      clients = clients.filter((c) => c.subscription.planId === params.planId);
    }

    if (params?.status && params.status !== "all") {
      if (params.status === "pending_verification") {
        clients = clients.filter((c) => c.subscription.status === "pending_verification" || c.isVerified === false);
      } else if (params.status === "active") {
        clients = clients.filter((c) => c.subscription.status === "active" && c.isVerified !== false);
      } else {
        clients = clients.filter((c) => c.subscription.status === params.status);
      }
    }

    // Sort by createdAt descending (newest registered first)
    return clients.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  async getClientById(id: string): Promise<ClientUser | null> {
    const adminClient = createAdminSupabaseClient();

    if (adminClient) {
      try {
        const { data, error } = await adminClient
          .from("clients")
          .select("*")
          .eq("id", id)
          .maybeSingle();
        if (!error && data) {
          const sub = (data.subscription || {}) as any;
          const password = sub.password || data.password || null;
          const paymentSubmission = sub.paymentSubmission || data.payment_submission || null;
          const isVerified = sub.isVerified !== undefined ? sub.isVerified : (data.is_verified ?? (sub.status === "active"));

          return {
            id: data.id,
            email: data.email,
            fullName: data.full_name,
            academyName: data.academy_name,
            phone: data.phone,
            password,
            role: (data.role as "client") || "client",
            subscription: {
              ...sub,
              status: sub.status || "active",
            },
            paymentSubmission,
            isVerified,
            notes: data.notes,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
          };
        }
      } catch {
        // Fallback to in-memory store
      }
    }

    const store = initMockStore();
    const client = store.clients.find((c) => c.id === id);
    return client ? JSON.parse(JSON.stringify(client)) : null;
  },

  async getClientByEmail(email: string): Promise<ClientUser | null> {
    const adminClient = createAdminSupabaseClient();

    if (adminClient) {
      try {
        const { data, error } = await adminClient
          .from("clients")
          .select("*")
          .ilike("email", email)
          .maybeSingle();
        if (!error && data) {
          const sub = (data.subscription || {}) as any;
          const password = sub.password || data.password || null;
          const paymentSubmission = sub.paymentSubmission || data.payment_submission || null;
          const isVerified = sub.isVerified !== undefined ? sub.isVerified : (data.is_verified ?? (sub.status === "active"));

          return {
            id: data.id,
            email: data.email,
            fullName: data.full_name,
            academyName: data.academy_name,
            phone: data.phone,
            password,
            role: (data.role as "client") || "client",
            subscription: {
              ...sub,
              status: sub.status || "active",
            },
            paymentSubmission,
            isVerified,
            notes: data.notes,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
          };
        }
      } catch {
        // Fallback to in-memory store
      }
    }

    const store = initMockStore();
    let client = store.clients.find((c) => c.email.toLowerCase() === email.toLowerCase());
    if (!client && email.toLowerCase() === "ali.khaliq50@gmail.com") {
      client = SEED_CLIENTS[0];
      store.clients.unshift(client);
    }
    return client ? JSON.parse(JSON.stringify(client)) : null;
  },

  async saveClient(clientData: {
    id?: string;
    email: string;
    fullName: string;
    academyName?: string | null;
    phone?: string | null;
    password?: string | null;
    planId?: SubscriptionPlanId;
    subscription?: Partial<ClientUser["subscription"]>;
    paymentSubmission?: ClientUser["paymentSubmission"];
    isVerified?: boolean;
    notes?: string | null;
  }): Promise<ClientUser> {
    const adminClient = createAdminSupabaseClient();
    const env = getCurrentDataEnvironment();

    const explicitPlan = clientData.planId !== undefined || clientData.subscription !== undefined;
    const defaultSub = getPlanPermissions(clientData.planId || "standard");
    const password = clientData.password || (clientData.subscription as any)?.password || null;
    const isVerified = clientData.isVerified !== undefined
      ? clientData.isVerified
      : (clientData.subscription?.status === "active");
    const paymentSubmission = clientData.paymentSubmission || (clientData.subscription as any)?.paymentSubmission || null;

    const mergedSub: Record<string, unknown> = {
      ...defaultSub,
      ...(clientData.subscription || {}),
      password,
      isVerified,
      paymentSubmission,
    };

    const clientId = clientData.id || `client-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    if (adminClient) {
      try {
        const payload: Record<string, unknown> = {
          id: clientId,
          email: clientData.email,
          full_name: clientData.fullName,
          academy_name: clientData.academyName || "My Academy",
          phone: clientData.phone || null,
          role: "client",
          subscription: mergedSub,
          notes: clientData.notes || null,
          environment: env,
          updated_at: new Date().toISOString(),
        };

        const { data, error } = await adminClient
          .from("clients")
          .upsert(payload)
          .select()
          .single();

        if (!error && data) {
          const sub = (data.subscription || {}) as any;
          return {
            id: data.id,
            email: data.email,
            fullName: data.full_name,
            academyName: data.academy_name,
            phone: data.phone,
            password: sub.password || password || null,
            role: (data.role as "client") || "client",
            subscription: sub,
            paymentSubmission: sub.paymentSubmission || paymentSubmission || null,
            isVerified: sub.isVerified ?? isVerified ?? false,
            notes: data.notes,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
          };
        } else if (error) {
          console.error("Supabase saveClient error:", error);
        }
      } catch (err) {
        console.error("Supabase saveClient catch error:", err);
      }
    }

    const store = initMockStore();
    const existingIndex = store.clients.findIndex(
      (c) => c.email.toLowerCase() === clientData.email.toLowerCase()
    );

    if (existingIndex >= 0) {
      const existing = store.clients[existingIndex];
      const updated: ClientUser = {
        ...existing,
        fullName: clientData.fullName || existing.fullName,
        academyName: clientData.academyName !== undefined ? clientData.academyName : existing.academyName,
        phone: clientData.phone !== undefined ? clientData.phone : existing.phone,
        password: password !== undefined ? password : existing.password,
        notes: clientData.notes !== undefined ? clientData.notes : existing.notes,
        subscription: (explicitPlan ? mergedSub : existing.subscription) as any,
        paymentSubmission: paymentSubmission !== undefined ? paymentSubmission : existing.paymentSubmission,
        isVerified: isVerified !== undefined ? isVerified : existing.isVerified,
        updatedAt: new Date().toISOString(),
      };
      store.clients[existingIndex] = updated;
      return JSON.parse(JSON.stringify(updated));
    }

    const newClient: ClientUser = {
      id: clientId,
      email: clientData.email,
      fullName: clientData.fullName,
      academyName: clientData.academyName || "My Academy",
      phone: clientData.phone || null,
      password,
      role: "client",
      subscription: mergedSub as any,
      paymentSubmission,
      isVerified,
      createdAt: new Date().toISOString(),
      notes: clientData.notes || null,
    };

    store.clients.unshift(newClient);
    return JSON.parse(JSON.stringify(newClient));
  },

  async updateClient(id: string, updates: Partial<ClientUser>): Promise<ClientUser | null> {
    const adminClient = createAdminSupabaseClient();

    if (adminClient) {
      try {
        // Fetch current row from Supabase to preserve existing subscription fields
        const { data: existing } = await adminClient
          .from("clients")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        const currentSub = (existing?.subscription || {}) as any;
        const finalPassword = updates.password !== undefined
          ? updates.password
          : (currentSub.password || null);
        const finalIsVerified = updates.isVerified !== undefined
          ? updates.isVerified
          : (updates.subscription?.status === "active" ? true : (currentSub.isVerified ?? false));
        const finalPaymentSub = updates.paymentSubmission !== undefined
          ? updates.paymentSubmission
          : (currentSub.paymentSubmission || null);

        const mergedSub: Record<string, unknown> = {
          ...currentSub,
          ...(updates.subscription || {}),
          password: finalPassword,
          isVerified: finalIsVerified,
          paymentSubmission: finalPaymentSub,
        };

        if (updates.isVerified === true || updates.subscription?.status === "active") {
          mergedSub.isVerified = true;
          mergedSub.status = "active";
        }

        const payload: Record<string, unknown> = {
          updated_at: new Date().toISOString(),
          subscription: mergedSub,
        };
        if (updates.fullName !== undefined) payload.full_name = updates.fullName;
        if (updates.academyName !== undefined) payload.academy_name = updates.academyName;
        if (updates.phone !== undefined) payload.phone = updates.phone;
        if (updates.notes !== undefined) payload.notes = updates.notes;

        const { data, error } = await adminClient
          .from("clients")
          .update(payload)
          .eq("id", id)
          .select()
          .single();

        if (!error && data) {
          const sub = (data.subscription || {}) as any;
          return {
            id: data.id,
            email: data.email,
            fullName: data.full_name,
            academyName: data.academy_name,
            phone: data.phone,
            password: sub.password || finalPassword || null,
            role: (data.role as "client") || "client",
            subscription: sub,
            paymentSubmission: sub.paymentSubmission || finalPaymentSub || null,
            isVerified: sub.isVerified ?? finalIsVerified ?? false,
            notes: data.notes,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
          };
        } else if (error) {
          console.error("Supabase updateClient error:", error);
        }
      } catch (err) {
        console.error("Supabase updateClient catch error:", err);
      }
    }

    const store = initMockStore();
    const index = store.clients.findIndex((c) => c.id === id);
    if (index === -1) return null;

    const current = store.clients[index];
    const currentSub = (current.subscription || {}) as any;
    const finalPassword = updates.password !== undefined ? updates.password : current.password;
    const finalIsVerified = updates.isVerified !== undefined
      ? updates.isVerified
      : (updates.subscription?.status === "active" ? true : current.isVerified);
    const finalPaymentSub = updates.paymentSubmission !== undefined
      ? updates.paymentSubmission
      : current.paymentSubmission;

    const mergedSub = {
      ...currentSub,
      ...(updates.subscription || {}),
      password: finalPassword,
      isVerified: finalIsVerified,
      paymentSubmission: finalPaymentSub,
    };

    if (updates.isVerified === true || updates.subscription?.status === "active") {
      mergedSub.isVerified = true;
      mergedSub.status = "active";
    }

    const updated: ClientUser = {
      ...current,
      ...updates,
      id: current.id,
      role: "client",
      password: finalPassword,
      subscription: mergedSub as any,
      paymentSubmission: finalPaymentSub,
      isVerified: finalIsVerified,
      updatedAt: new Date().toISOString(),
    };

    store.clients[index] = updated;
    return JSON.parse(JSON.stringify(updated));
  },

  async deleteClient(id: string): Promise<boolean> {
    const adminClient = createAdminSupabaseClient();

    if (adminClient) {
      try {
        const { error } = await adminClient
          .from("clients")
          .delete()
          .eq("id", id);
        if (!error) return true;
      } catch {
        // Fallback to store
      }
    }

    const store = initMockStore();
    const prevLen = store.clients.length;
    store.clients = store.clients.filter((c) => c.id !== id);
    store.papers = store.papers.filter((p) => p.clientId !== id);
    return store.clients.length < prevLen;
  },

  // =========================================================================
  // PAPER GENERATION HISTORY
  // =========================================================================

  async savePaper(data: Omit<PaperRecord, "id" | "createdAt">): Promise<PaperRecord> {
    const adminClient = createAdminSupabaseClient();
    const env = getCurrentDataEnvironment();
    const id = `paper-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const createdAt = new Date().toISOString();

    if (adminClient) {
      try {
        const payload = {
          id,
          client_id: data.clientId,
          title: data.title,
          institution: data.institution,
          subject: data.subject,
          class_name: data.className,
          syllabus: data.syllabus,
          mcq_count: data.mcqCount,
          short_count: data.shortCount,
          long_count: data.longCount,
          question_count: data.questionCount,
          total_marks: data.totalMarks,
          language_mode: data.languageMode,
          version: data.version,
          export_mode: data.exportMode,
          environment: env,
          created_at: createdAt,
        };

        const { data: inserted, error } = await adminClient
          .from("papers")
          .insert(payload)
          .select()
          .single();

        if (!error && inserted) {
          return {
            id: inserted.id,
            clientId: inserted.client_id,
            title: inserted.title,
            institution: inserted.institution,
            subject: inserted.subject,
            className: inserted.class_name,
            syllabus: inserted.syllabus,
            mcqCount: inserted.mcq_count,
            shortCount: inserted.short_count,
            longCount: inserted.long_count,
            questionCount: inserted.question_count,
            totalMarks: inserted.total_marks,
            languageMode: inserted.language_mode,
            version: inserted.version,
            exportMode: inserted.export_mode,
            createdAt: inserted.created_at,
          };
        }
      } catch {
        // Fallback to store
      }
    }

    const store = initMockStore();
    const record: PaperRecord = { ...data, id, createdAt };
    store.papers.unshift(record);
    return JSON.parse(JSON.stringify(record));
  },

  async getPapersByClient(clientId: string, limit = 200): Promise<PaperRecord[]> {
    const adminClient = createAdminSupabaseClient();
    const env = getCurrentDataEnvironment();

    if (adminClient) {
      try {
        const { data, error } = await adminClient
          .from("papers")
          .select("*")
          .eq("client_id", clientId)
          .eq("environment", env)
          .order("created_at", { ascending: false })
          .limit(limit);

        if (!error && data) {
          return data.map((row) => ({
            id: row.id,
            clientId: row.client_id,
            title: row.title,
            institution: row.institution,
            subject: row.subject,
            className: row.class_name,
            syllabus: row.syllabus,
            mcqCount: row.mcq_count,
            shortCount: row.short_count,
            longCount: row.long_count,
            questionCount: row.question_count,
            totalMarks: row.total_marks,
            languageMode: row.language_mode,
            version: row.version,
            exportMode: row.export_mode,
            createdAt: row.created_at,
          }));
        }
      } catch {
        // Fallback to store
      }
    }

    const store = initMockStore();
    return store.papers
      .filter((p) => p.clientId === clientId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit)
      .map((p) => ({ ...p }));
  },

  async getClientPaperStats(clientId: string): Promise<ClientPaperStats> {
    const papers = await this.getPapersByClient(clientId, 10000);
    const now = Date.now();
    const DAY = 24 * 60 * 60 * 1000;

    const bySubject = new Map<string, number>();
    const byLanguage = new Map<string, number>();
    papers.forEach((p) => {
      bySubject.set(p.subject, (bySubject.get(p.subject) || 0) + 1);
      byLanguage.set(p.languageMode, (byLanguage.get(p.languageMode) || 0) + 1);
    });

    const perDay: { date: string; count: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now - i * DAY);
      const key = d.toISOString().substring(0, 10);
      perDay.push({
        date: key,
        count: papers.filter((p) => p.createdAt.substring(0, 10) === key).length,
      });
    }

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    return {
      totalPapers: papers.length,
      papersThisMonth: papers.filter((p) => new Date(p.createdAt) >= monthStart).length,
      papersThisWeek: papers.filter((p) => now - new Date(p.createdAt).getTime() <= 7 * DAY).length,
      totalQuestions: papers.reduce((s, p) => s + p.questionCount, 0),
      totalMarks: papers.reduce((s, p) => s + p.totalMarks, 0),
      withAnswerKey: papers.filter((p) => p.exportMode === "key" || p.exportMode === "all").length,
      lastPaperAt: papers[0]?.createdAt || null,
      bySubject: [...bySubject.entries()]
        .map(([subject, count]) => ({ subject, count }))
        .sort((a, b) => b.count - a.count),
      byLanguage: [...byLanguage.entries()]
        .map(([language, count]) => ({ language, count }))
        .sort((a, b) => b.count - a.count),
      perDay,
    };
  },

  // =========================================================================
  // FINANCE: INVOICES
  // =========================================================================

  async getInvoices(limit = 200): Promise<InvoiceRecord[]> {
    const adminClient = createAdminSupabaseClient();
    const environment = getCurrentDataEnvironment();
    if (adminClient) {
      try {
        const { data, error } = await adminClient.from("invoices").select("*")
          .eq("environment", environment).order("issued_at", { ascending: false }).limit(limit);
        if (!error && data) return data.map((row) => ({
          id: row.id, invoiceNumber: row.invoice_number, clientId: row.client_id,
          clientName: row.client_name, clientEmail: row.client_email, academyName: row.academy_name,
          description: row.description, amount: Number(row.amount), status: row.status,
          dueDate: row.due_date, issuedAt: row.issued_at, paidAt: row.paid_at,
          paymentMethod: row.payment_method, transactionRef: row.transaction_ref, notes: row.notes,
        }));
      } catch { /* fall back to local store */ }
    }
    return initMockStore().invoices.slice().sort((a, b) => b.issuedAt.localeCompare(a.issuedAt)).slice(0, limit);
  },

  async createInvoice(data: Omit<InvoiceRecord, "id" | "invoiceNumber" | "issuedAt">): Promise<InvoiceRecord> {
    const id = `inv-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const issuedAt = new Date().toISOString();
    const invoiceNumber = `PW-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    const record: InvoiceRecord = { ...data, id, invoiceNumber, issuedAt };
    const adminClient = createAdminSupabaseClient();
    if (adminClient) {
      try {
        const { data: inserted, error } = await adminClient.from("invoices").insert({
          id, invoice_number: invoiceNumber, client_id: record.clientId, client_name: record.clientName,
          client_email: record.clientEmail, academy_name: record.academyName || null, description: record.description,
          amount: record.amount, status: record.status, due_date: record.dueDate, issued_at: issuedAt,
          paid_at: record.paidAt || null, payment_method: record.paymentMethod || null,
          transaction_ref: record.transactionRef || null, notes: record.notes || null,
          environment: getCurrentDataEnvironment(),
        }).select().single();
        if (!error && inserted) return { ...record, id: inserted.id, invoiceNumber: inserted.invoice_number };
      } catch { /* fall back to local store */ }
    }
    initMockStore().invoices.unshift(record);
    return JSON.parse(JSON.stringify(record));
  },

  async updateInvoice(id: string, updates: Partial<Pick<InvoiceRecord, "status" | "paidAt" | "paymentMethod" | "transactionRef" | "notes">>): Promise<InvoiceRecord | null> {
    const adminClient = createAdminSupabaseClient();
    if (adminClient) {
      try {
        const { data, error } = await adminClient.from("invoices").update({
          status: updates.status, paid_at: updates.paidAt, payment_method: updates.paymentMethod,
          transaction_ref: updates.transactionRef, notes: updates.notes,
        }).eq("id", id).select().single();
        if (!error && data) return { id: data.id, invoiceNumber: data.invoice_number, clientId: data.client_id, clientName: data.client_name, clientEmail: data.client_email, academyName: data.academy_name, description: data.description, amount: Number(data.amount), status: data.status, dueDate: data.due_date, issuedAt: data.issued_at, paidAt: data.paid_at, paymentMethod: data.payment_method, transactionRef: data.transaction_ref, notes: data.notes };
      } catch { /* fall back to local store */ }
    }
    const invoice = initMockStore().invoices.find((item) => item.id === id);
    if (!invoice) return null;
    Object.assign(invoice, updates);
    return JSON.parse(JSON.stringify(invoice));
  },

  // =========================================================================
  // TRANSACTIONAL EMAILS OUTBOX (Welcome & Notifications)
  // =========================================================================

  async saveEmail(data: Omit<EmailRecord, "id" | "sentAt">): Promise<EmailRecord> {
    const adminClient = createAdminSupabaseClient();
    const env = getCurrentDataEnvironment();
    const id = `email-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const sentAt = new Date().toISOString();

    if (adminClient) {
      try {
        const payload = {
          id,
          recipient_email: data.to,
          recipient_name: data.recipientName,
          subject: data.subject,
          template: data.template,
          status: data.status,
          preview_text: data.previewText,
          html_content: data.htmlContent,
          error: data.error || null,
          environment: env,
          created_at: sentAt,
        };

        const { data: inserted, error } = await adminClient
          .from("email_outbox")
          .insert(payload)
          .select()
          .single();

        if (!error && inserted) {
          return {
            id: inserted.id,
            to: inserted.recipient_email,
            recipientName: inserted.recipient_name,
            subject: inserted.subject,
            template: inserted.template,
            status: inserted.status,
            previewText: inserted.preview_text,
            htmlContent: inserted.html_content,
            sentAt: inserted.created_at,
            error: inserted.error,
          };
        }
      } catch {
        // Fallback to store
      }
    }

    const store = initMockStore();
    const record: EmailRecord = { ...data, id, sentAt };
    store.emails.unshift(record);
    return JSON.parse(JSON.stringify(record));
  },

  async getEmails(limit = 100): Promise<EmailRecord[]> {
    const adminClient = createAdminSupabaseClient();
    const env = getCurrentDataEnvironment();

    if (adminClient) {
      try {
        const { data, error } = await adminClient
          .from("email_outbox")
          .select("*")
          .eq("environment", env)
          .order("created_at", { ascending: false })
          .limit(limit);

        if (!error && data) {
          return data.map((row) => ({
            id: row.id,
            to: row.recipient_email,
            recipientName: row.recipient_name,
            subject: row.subject,
            template: row.template,
            status: row.status,
            previewText: row.preview_text,
            htmlContent: row.html_content,
            sentAt: row.created_at,
            error: row.error,
          }));
        }
      } catch {
        // Fallback to store
      }
    }

    const store = initMockStore();
    return store.emails
      .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())
      .slice(0, limit)
      .map((e) => ({ ...e }));
  },

  async getEmailsByRecipient(to: string): Promise<EmailRecord[]> {
    const adminClient = createAdminSupabaseClient();
    const env = getCurrentDataEnvironment();

    if (adminClient) {
      try {
        const { data, error } = await adminClient
          .from("email_outbox")
          .select("*")
          .ilike("recipient_email", to)
          .eq("environment", env)
          .order("created_at", { ascending: false });

        if (!error && data) {
          return data.map((row) => ({
            id: row.id,
            to: row.recipient_email,
            recipientName: row.recipient_name,
            subject: row.subject,
            template: row.template,
            status: row.status,
            previewText: row.preview_text,
            htmlContent: row.html_content,
            sentAt: row.created_at,
            error: row.error,
          }));
        }
      } catch {
        // Fallback to store
      }
    }

    const store = initMockStore();
    return store.emails
      .filter((e) => e.to.toLowerCase() === to.toLowerCase())
      .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())
      .map((e) => ({ ...e }));
  },
};
