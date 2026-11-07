import { db } from "./db";
import {
  SEED_BOARDS,
  SEED_CLASSES,
  SEED_COURSES,
  SEED_SUBJECTS,
  SEED_CHAPTERS,
  SEED_TOPICS,
  SEED_QUESTIONS,
} from "./seed-data";
import {
  Board,
  ClassItem,
  Course,
  Subject,
  Chapter,
  Topic,
  Question,
  QuestionTranslation,
} from "./types";
import { getUrduTranslation } from "./urdu-translations";

export interface NotesChapterSummary {
  id: string;
  slug: string;
  number: number;
  title: string;
  titleUr: string | null;
  subjectId: string;
  subjectSlug: string;
  subjectName: string;
  subjectNameUr: string | null;
  classId: string;
  classSlug: string;
  className: string;
  boardName: string;
  courseName: string;
  topics: Topic[];
  totalQuestions: number;
  mcqCount: number;
  shortCount: number;
  longCount: number;
  exerciseCount: number;
  extraCount: number;
  solvedShortLongCount: number;
}

export interface NotesSubjectSummary {
  slug: string;
  primarySubjectId: string;
  name: string;
  nameUr: string | null;
  classId: string;
  classSlug: string;
  className: string;
  chapters: NotesChapterSummary[];
  totalQuestions: number;
  mcqCount: number;
  shortCount: number;
  longCount: number;
}

export interface NotesClassSummary {
  id: string;
  slug: string;
  name: string;
  displayName: string;
  numericOrder: number;
  subjects: NotesSubjectSummary[];
  totalChapters: number;
  totalQuestions: number;
}

export interface NotesChapterDetail extends NotesChapterSummary {
  questions: Question[];
}

export function slugifyText(input: string): string {
  return input
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function buildClassSlug(cls: ClassItem): string {
  switch (cls.numeric_order) {
    case 9:
      return "9th-class";
    case 10:
      return "10th-class";
    case 11:
      return "1st-year-11th-class";
    case 12:
      return "2nd-year-12th-class";
    case 8:
      return "8th-class";
    case 7:
      return "7th-class";
    case 6:
      return "6th-class";
    case 5:
      return "5th-class";
    default:
      return slugifyText(cls.name) || `class-${cls.numeric_order}`;
  }
}

export function buildClassDisplayName(cls: ClassItem): string {
  switch (cls.numeric_order) {
    case 9:
      return "9th Class (Matric Part-I)";
    case 10:
      return "10th Class (Matric Part-II)";
    case 11:
      return "1st Year (11th Class / FSc & ICS)";
    case 12:
      return "2nd Year (12th Class / FSc & ICS)";
    default:
      return cls.name;
  }
}

function mergeById<T extends { id: string }>(live: T[], seed: T[]): T[] {
  const map = new Map<string, T>();
  for (const s of seed) {
    map.set(s.id, s);
  }
  for (const l of live) {
    map.set(l.id, l);
  }
  return Array.from(map.values());
}

function enrichQuestionTranslations(q: Question): Question {
  const translations: QuestionTranslation[] = [...(q.translations || [])];
  const en = translations.find((t) => t.language === "en");
  const ur = translations.find((t) => t.language === "ur");

  if (en && !ur) {
    const fallback = getUrduTranslation(en.text, en.options);
    if (fallback.text_ur) {
      translations.push({
        language: "ur",
        text: fallback.text_ur,
        options: fallback.options_ur || (en.options ? [...en.options] : null),
        answer: null,
      });
    }
  }

  return {
    ...q,
    translations,
  };
}

const SOURCE_RANK: Record<string, number> = {
  exercise: 0,
  past_paper: 1,
  extra: 2,
};

function naturalCompare(a?: string | null, b?: string | null): number {
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
}

function sortChapterQuestions(questions: Question[]): Question[] {
  return [...questions].sort((a, b) => {
    const srA = SOURCE_RANK[a.source] ?? 3;
    const srB = SOURCE_RANK[b.source] ?? 3;
    if (srA !== srB) return srA - srB;
    const refCmp = naturalCompare(a.source_ref, b.source_ref);
    if (refCmp !== 0) return refCmp;
    return a.id.localeCompare(b.id);
  });
}

async function loadMergedData() {
  const [liveBoards, liveClasses, liveCourses, liveSubjects, liveChapters, liveTopics, liveQuestions] =
    await Promise.all([
      db.getBoards(),
      db.getClasses(),
      db.getCourses(),
      db.getSubjects(),
      db.getChapters(),
      db.getTopics(),
      db.getQuestions({ isAuthenticatedAdmin: true }),
    ]);

  const seedQuestionsTyped: Question[] = SEED_QUESTIONS.map((sq) => ({
    id: sq.id,
    chapter_id: sq.chapter_id,
    topic_id: sq.topic_id || null,
    type: sq.type,
    source: sq.source,
    source_ref: sq.source_ref || null,
    concept_tag: sq.concept_tag || null,
    correct_option: sq.correct_option ?? null,
    marks: sq.marks,
    difficulty: sq.difficulty,
    is_active: sq.is_active,
    source_note: sq.source_note || null,
    translations: sq.translations.map((t) => ({
      language: t.language,
      text: t.text,
      options: t.options ?? null,
      answer: t.answer ?? null,
    })),
  }));

  const boards = mergeById<Board>(liveBoards, SEED_BOARDS as Board[]);
  const classes = mergeById<ClassItem>(liveClasses, SEED_CLASSES as ClassItem[]).sort(
    (a, b) => b.numeric_order - a.numeric_order
  );
  const courses = mergeById<Course>(liveCourses, SEED_COURSES as Course[]).filter(
    (c) => c.is_active !== false
  );
  const subjects = mergeById<Subject>(liveSubjects, SEED_SUBJECTS as Subject[]);
  const chapters = mergeById<Chapter>(liveChapters, SEED_CHAPTERS as Chapter[]);
  const topics = mergeById<Topic>(liveTopics, SEED_TOPICS as Topic[]);
  const allQuestions = mergeById<Question>(liveQuestions, seedQuestionsTyped)
    .filter((q) => q.is_active !== false)
    .map(enrichQuestionTranslations);

  return { boards, classes, courses, subjects, chapters, topics, allQuestions };
}

export async function getNotesCatalog(): Promise<{
  classes: NotesClassSummary[];
  allChapters: NotesChapterSummary[];
  questionMap: Map<string, Question[]>;
}> {
  const { boards, classes, courses, subjects, chapters, topics, allQuestions } =
    await loadMergedData();

  const boardById = new Map(boards.map((b) => [b.id, b]));
  const courseById = new Map(courses.map((c) => [c.id, c]));
  const subjectById = new Map(subjects.map((s) => [s.id, s]));
  const classById = new Map(classes.map((c) => [c.id, c]));

  const topicsByChapter = new Map<string, Topic[]>();
  for (const t of topics) {
    const arr = topicsByChapter.get(t.chapter_id) || [];
    arr.push(t);
    topicsByChapter.set(t.chapter_id, arr);
  }
  for (const arr of topicsByChapter.values()) {
    arr.sort((a, b) => a.number - b.number);
  }

  const questionMap = new Map<string, Question[]>();
  for (const q of allQuestions) {
    const arr = questionMap.get(q.chapter_id) || [];
    arr.push(q);
    questionMap.set(q.chapter_id, arr);
  }
  for (const [chId, arr] of questionMap.entries()) {
    questionMap.set(chId, sortChapterQuestions(arr));
  }

  // Group active chapters with >= 1 question into Class -> Subject -> Chapters
  const classBuckets = new Map<
    string,
    {
      cls: ClassItem;
      classSlug: string;
      subjectsMap: Map<
        string,
        {
          slug: string;
          primarySubjectId: string;
          name: string;
          nameUr: string | null;
          chapters: NotesChapterSummary[];
          usedChapterSlugs: Set<string>;
        }
      >;
    }
  >();

  const sortedChapters = [...chapters].sort((a, b) => a.number - b.number);

  for (const ch of sortedChapters) {
    const chQuestions = questionMap.get(ch.id) || [];
    if (chQuestions.length === 0) continue;

    const subj = subjectById.get(ch.subject_id);
    if (!subj) continue;
    const course = courseById.get(subj.course_id);
    if (!course) continue;
    const cls = classById.get(course.class_id);
    if (!cls) continue;
    const board = boardById.get(course.board_id);

    const classSlug = buildClassSlug(cls);
    const subjectSlug = slugifyText(subj.name) || `subject-${subj.id.slice(0, 6)}`;

    let classBucket = classBuckets.get(classSlug);
    if (!classBucket) {
      classBucket = {
        cls,
        classSlug,
        subjectsMap: new Map(),
      };
      classBuckets.set(classSlug, classBucket);
    }

    let subjBucket = classBucket.subjectsMap.get(subjectSlug);
    if (!subjBucket) {
      subjBucket = {
        slug: subjectSlug,
        primarySubjectId: subj.id,
        name: subj.name,
        nameUr: subj.name_ur || null,
        chapters: [],
        usedChapterSlugs: new Set(),
      };
      classBucket.subjectsMap.set(subjectSlug, subjBucket);
    } else if (!subjBucket.nameUr && subj.name_ur) {
      subjBucket.nameUr = subj.name_ur;
    }

    let baseChapterSlug = `unit-${ch.number}-${slugifyText(ch.title)}`;
    if (!baseChapterSlug || baseChapterSlug === `unit-${ch.number}-`) {
      baseChapterSlug = `unit-${ch.number}`;
    }
    let chapterSlug = baseChapterSlug;
    let suffix = 2;
    while (subjBucket.usedChapterSlugs.has(chapterSlug)) {
      chapterSlug = `${baseChapterSlug}-${suffix++}`;
    }
    subjBucket.usedChapterSlugs.add(chapterSlug);

    let mcqCount = 0;
    let shortCount = 0;
    let longCount = 0;
    let exerciseCount = 0;
    let extraCount = 0;
    let solvedShortLongCount = 0;

    for (const q of chQuestions) {
      if (q.type === "mcq") mcqCount++;
      else if (q.type === "short") shortCount++;
      else if (q.type === "long") longCount++;

      if (q.source === "exercise") exerciseCount++;
      else extraCount++;

      if (q.type !== "mcq") {
        const hasAns = q.translations?.some((t) => Boolean(t.answer && t.answer.trim()));
        if (hasAns) solvedShortLongCount++;
      }
    }

    subjBucket.chapters.push({
      id: ch.id,
      slug: chapterSlug,
      number: ch.number,
      title: ch.title,
      titleUr: ch.title_ur || null,
      subjectId: subj.id,
      subjectSlug,
      subjectName: subj.name,
      subjectNameUr: subj.name_ur || null,
      classId: cls.id,
      classSlug,
      className: buildClassDisplayName(cls),
      boardName: board?.name || "Punjab & Federal Board",
      courseName: course.name,
      topics: topicsByChapter.get(ch.id) || [],
      totalQuestions: chQuestions.length,
      mcqCount,
      shortCount,
      longCount,
      exerciseCount,
      extraCount,
      solvedShortLongCount,
    });
  }

  const classSummaries: NotesClassSummary[] = [];
  const allChapters: NotesChapterSummary[] = [];

  const orderedClassBuckets = Array.from(classBuckets.values()).sort(
    (a, b) => b.cls.numeric_order - a.cls.numeric_order
  );

  for (const cb of orderedClassBuckets) {
    const subjectSummaries: NotesSubjectSummary[] = [];
    let classTotalChapters = 0;
    let classTotalQuestions = 0;

    const orderedSubjs = Array.from(cb.subjectsMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    for (const sb of orderedSubjs) {
      sb.chapters.sort((a, b) => a.number - b.number);
      const totalQuestions = sb.chapters.reduce((acc, c) => acc + c.totalQuestions, 0);
      const mcqCount = sb.chapters.reduce((acc, c) => acc + c.mcqCount, 0);
      const shortCount = sb.chapters.reduce((acc, c) => acc + c.shortCount, 0);
      const longCount = sb.chapters.reduce((acc, c) => acc + c.longCount, 0);

      // Prefer the subject ID that holds the most questions (e.g. 2026-27 new course)
      const richestChapter = [...sb.chapters].sort(
        (a, b) => b.totalQuestions - a.totalQuestions
      )[0];

      subjectSummaries.push({
        slug: sb.slug,
        primarySubjectId: richestChapter ? richestChapter.subjectId : sb.primarySubjectId,
        name: sb.name,
        nameUr: sb.nameUr,
        classId: cb.cls.id,
        classSlug: cb.classSlug,
        className: buildClassDisplayName(cb.cls),
        chapters: sb.chapters,
        totalQuestions,
        mcqCount,
        shortCount,
        longCount,
      });

      classTotalChapters += sb.chapters.length;
      classTotalQuestions += totalQuestions;
      allChapters.push(...sb.chapters);
    }

    if (subjectSummaries.length > 0) {
      classSummaries.push({
        id: cb.cls.id,
        slug: cb.classSlug,
        name: cb.cls.name,
        displayName: buildClassDisplayName(cb.cls),
        numericOrder: cb.cls.numeric_order,
        subjects: subjectSummaries,
        totalChapters: classTotalChapters,
        totalQuestions: classTotalQuestions,
      });
    }
  }

  return { classes: classSummaries, allChapters, questionMap };
}

export async function getNotesSubject(
  classSlug: string,
  subjectSlug: string
): Promise<{ cls: NotesClassSummary; subject: NotesSubjectSummary } | null> {
  const catalog = await getNotesCatalog();
  const cls = catalog.classes.find((c) => c.slug === classSlug);
  if (!cls) return null;
  const subject = cls.subjects.find((s) => s.slug === subjectSlug);
  if (!subject) return null;
  return { cls, subject };
}

export async function getNotesChapter(
  classSlug: string,
  subjectSlug: string,
  chapterSlug: string
): Promise<{
  cls: NotesClassSummary;
  subject: NotesSubjectSummary;
  chapter: NotesChapterDetail;
} | null> {
  const catalog = await getNotesCatalog();
  const cls = catalog.classes.find((c) => c.slug === classSlug);
  if (!cls) return null;
  const subject = cls.subjects.find((s) => s.slug === subjectSlug);
  if (!subject) return null;
  const chSummary = subject.chapters.find((c) => c.slug === chapterSlug);
  if (!chSummary) return null;

  const questions = catalog.questionMap.get(chSummary.id) || [];
  return {
    cls,
    subject,
    chapter: {
      ...chSummary,
      questions,
    },
  };
}
