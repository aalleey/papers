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

// In-memory / development store initialized from seed data
interface MockStore {
  boards: Board[];
  classes: ClassItem[];
  courses: Course[];
  subjects: Subject[];
  chapters: Chapter[];
  topics: Topic[];
  questions: Question[];
}

// Global reference to retain state across Next.js dev reloads
const globalForStore = globalThis as unknown as { mockStore?: MockStore };

function initMockStore(): MockStore {
  if (globalForStore.mockStore) {
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
      source_ref: sq.source_ref,
      concept_tag: sq.concept_tag,
      correct_option: sq.correct_option || null,
      marks: sq.marks,
      difficulty: sq.difficulty,
      is_active: sq.is_active,
      source_note: sq.source_note,
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
      if (!error && data) return data as Board[];
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
      if (!error && data) return data as ClassItem[];
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
      if (!error && data) return data as Course[];
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
      if (!error && data) return data as Subject[];
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
      if (!error && data) return data as Chapter[];
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
      if (!error && data) return data as Topic[];
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
      if (!error && data) {
        let results = data as Question[];
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
    const adminClient = createAdminSupabaseClient();
    if (adminClient) {
      const questionPayload = {
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

      let qId = question.id;
      if (qId) {
        await adminClient.from("questions").update(questionPayload).eq("id", qId);
        // Replace translations
        await adminClient.from("question_translations").delete().eq("question_id", qId);
      } else {
        const { data: createdQ } = await adminClient
          .from("questions")
          .insert(questionPayload)
          .select("id")
          .single();
        if (createdQ) qId = createdQ.id;
      }

      if (qId) {
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
        const fullQ = await this.getQuestionById(qId);
        if (fullQ) return fullQ;
      }
    }

    const store = initMockStore();
    const now = new Date().toISOString();
    const id = question.id || `q${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

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
};
