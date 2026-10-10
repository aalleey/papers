import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read .env.local
const envPath = path.resolve(__dirname, "../.env.local");
const envContent = fs.readFileSync(envPath, "utf-8");
const envVars = {};
for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eqIdx = trimmed.indexOf("=");
  if (eqIdx !== -1) {
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    envVars[key] = val;
  }
}

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Helper to ensure valid Postgres hex UUID
function toValidUuid(id) {
  if (!id) return id;
  return id
    .replace(/^cr/g, "ca")
    .replace(/^s/g, "d")
    .replace(/^ch/g, "ea")
    .replace(/^t/g, "f")
    .replace(/^q0/g, "aa");
}

// Load computer 10 ch8 json
const computerCh8Path = path.resolve(__dirname, "../src/lib/data/computer10-ch8.json");
const computerCh8Data = JSON.parse(fs.readFileSync(computerCh8Path, "utf-8"));

// 1. Boards
const boards = [
  { id: "b1000000-0000-0000-0000-000000000001", name: "Punjab Board", name_ur: "پنجاب بورڈ" },
  { id: "b1000000-0000-0000-0000-000000000002", name: "Federal Board", name_ur: "فیڈرل بورڈ" },
  { id: "b1000000-0000-0000-0000-000000000003", name: "KPK Board", name_ur: "خیبر پختونخوا بورڈ" },
  { id: "b1000000-0000-0000-0000-000000000004", name: "Sindh Board", name_ur: "سندھ بورڈ" },
];

// 2. Classes
const classes = [
  { id: "c0500000-0000-0000-0000-000000000005", name: "Class 5", numeric_order: 5 },
  { id: "c0600000-0000-0000-0000-000000000006", name: "Class 6", numeric_order: 6 },
  { id: "c0700000-0000-0000-0000-000000000007", name: "Class 7", numeric_order: 7 },
  { id: "c0800000-0000-0000-0000-000000000008", name: "Class 8", numeric_order: 8 },
  { id: "c0900000-0000-0000-0000-000000000009", name: "Class 9", numeric_order: 9 },
  { id: "c1000000-0000-0000-0000-000000000010", name: "Class 10", numeric_order: 10 },
  { id: "c1100000-0000-0000-0000-000000000011", name: "Class 11", numeric_order: 11 },
  { id: "c1200000-0000-0000-0000-000000000012", name: "Class 12", numeric_order: 12 },
];

// 3. Courses
const courses = [
  {
    id: toValidUuid("cr100000-0000-0000-0000-000000000001"),
    board_id: "b1000000-0000-0000-0000-000000000001",
    class_id: "c1000000-0000-0000-0000-000000000010",
    name: "Class 10 (Old)",
    is_active: true,
  },
  {
    id: toValidUuid("cr100000-0000-0000-0000-000000000002"),
    board_id: "b1000000-0000-0000-0000-000000000001",
    class_id: "c0900000-0000-0000-0000-000000000009",
    name: "Class 9 (General Science)",
    is_active: true,
  },
  {
    id: toValidUuid("cr100000-0000-0000-0000-000000000003"),
    board_id: "b1000000-0000-0000-0000-000000000001",
    class_id: "c1100000-0000-0000-0000-000000000011",
    name: "FSc Pre-Engineering Part 1",
    is_active: true,
  },
  {
    id: toValidUuid("cr100000-0000-0000-0000-000000000004"),
    board_id: "b1000000-0000-0000-0000-000000000001",
    class_id: "c1200000-0000-0000-0000-000000000012",
    name: "FSc Pre-Engineering Part 2",
    is_active: true,
  },
  {
    id: toValidUuid("cr100000-0000-0000-0000-000000000005"),
    board_id: "b1000000-0000-0000-0000-000000000001",
    class_id: "c1000000-0000-0000-0000-000000000010",
    name: "10th (New) 2026-27",
    is_active: true,
  },
];

// 4. Subjects
const subjects = [
  {
    id: toValidUuid("s1000000-0000-0000-0000-000000000001"),
    course_id: toValidUuid("cr100000-0000-0000-0000-000000000001"),
    name: "Mathematics",
    name_ur: "ریاضی",
  },
  {
    id: toValidUuid("s1000000-0000-0000-0000-000000000002"),
    course_id: toValidUuid("cr100000-0000-0000-0000-000000000001"),
    name: "Physics",
    name_ur: "طبیعیات",
  },
  {
    id: toValidUuid("s1000000-0000-0000-0000-000000000003"),
    course_id: toValidUuid("cr100000-0000-0000-0000-000000000001"),
    name: "Chemistry",
    name_ur: "کیمیا",
  },
  {
    id: computerCh8Data.subject.id,
    course_id: toValidUuid(computerCh8Data.subject.course_id),
    name: computerCh8Data.subject.name,
    name_ur: computerCh8Data.subject.name_ur,
  },
  {
    id: toValidUuid("s1000000-0000-0000-0000-000000000004"),
    course_id: toValidUuid("cr100000-0000-0000-0000-000000000001"),
    name: "Computer Science",
    name_ur: "کمپیوٹر سائنس",
  },
];

// 5. Chapters
const chapters = [
  { id: toValidUuid("ch100000-0000-0000-0000-000000000001"), subject_id: toValidUuid("s1000000-0000-0000-0000-000000000001"), number: 1, title: "Quadratic Equations", title_ur: "دو درجی مساواتیں" },
  { id: toValidUuid("ch100000-0000-0000-0000-000000000002"), subject_id: toValidUuid("s1000000-0000-0000-0000-000000000001"), number: 2, title: "Theory of Quadratic Equations", title_ur: "دو درجی مساواتوں کا نظریہ" },
  { id: toValidUuid("ch100000-0000-0000-0000-000000000003"), subject_id: toValidUuid("s1000000-0000-0000-0000-000000000001"), number: 3, title: "Variations", title_ur: "تغیرات" },
  { id: toValidUuid("ch100000-0000-0000-0000-000000000004"), subject_id: toValidUuid("s1000000-0000-0000-0000-000000000001"), number: 4, title: "Partial Fractions", title_ur: "جزوی کسریں" },
  { id: toValidUuid("ch100000-0000-0000-0000-000000000005"), subject_id: toValidUuid("s1000000-0000-0000-0000-000000000001"), number: 5, title: "Sets and Functions", title_ur: "سیٹ اور تفاعلات" },
  { id: toValidUuid("ch100000-0000-0000-0000-000000000006"), subject_id: toValidUuid("s1000000-0000-0000-0000-000000000001"), number: 6, title: "Basic Statistics", title_ur: "بنیادی شماریات" },
  { id: toValidUuid("ch100000-0000-0000-0000-000000000007"), subject_id: toValidUuid("s1000000-0000-0000-0000-000000000001"), number: 7, title: "Introduction to Trigonometry", title_ur: "علم المثلث کا تعارف" },
  { id: computerCh8Data.chapter.id, subject_id: computerCh8Data.chapter.subject_id, number: computerCh8Data.chapter.number, title: computerCh8Data.chapter.title, title_ur: computerCh8Data.chapter.title_ur },
  { id: toValidUuid("ch100000-0000-0000-0000-000000000008"), subject_id: toValidUuid("s1000000-0000-0000-0000-000000000004"), number: 8, title: "Digital Entrepreneurship", title_ur: "ڈیجیٹل انٹرپرینیورشپ" },
];

// 6. Topics
const mathTopics = [
  { id: toValidUuid("t1000000-0000-0000-0000-000000000001"), chapter_id: toValidUuid("ch100000-0000-0000-0000-000000000001"), number: 1, title: "Standard Form of Quadratic Equation", title_ur: "دو درجی مساوات کی معیاری شکل" },
  { id: toValidUuid("t1000000-0000-0000-0000-000000000002"), chapter_id: toValidUuid("ch100000-0000-0000-0000-000000000001"), number: 2, title: "Solution by Factorization", title_ur: "بذریعہ تجزی حل" },
  { id: toValidUuid("t1000000-0000-0000-0000-000000000003"), chapter_id: toValidUuid("ch100000-0000-0000-0000-000000000001"), number: 3, title: "Quadratic Formula", title_ur: "دو درجی فارمولا" },
  { id: toValidUuid("t1000000-0000-0000-0000-000000000004"), chapter_id: toValidUuid("ch100000-0000-0000-0000-000000000002"), number: 1, title: "Discriminant of Quadratic Equation", title_ur: "دو درجی مساوات کا فرق کنندہ" },
  { id: toValidUuid("t1000000-0000-0000-0000-000000000005"), chapter_id: toValidUuid("ch100000-0000-0000-0000-000000000003"), number: 1, title: "Ratio, Proportion and Variations", title_ur: "نسبت، تناسب اور تغیرات" },
  { id: toValidUuid("t1000000-0000-0000-0000-000000000006"), chapter_id: toValidUuid("ch100000-0000-0000-0000-000000000007"), number: 1, title: "Trigonometric Ratios and Identities", title_ur: "مثلثی نسبتیں اور مماثلتیں" },
];
const topics = [...mathTopics, ...computerCh8Data.topics];

// Parse seed.sql for math questions and translations
const seedSqlPath = path.resolve(__dirname, "../supabase/seed.sql");
const seedSql = fs.readFileSync(seedSqlPath, "utf-8");

function parseQuestionsFromSql() {
  const qSectionRegex = /insert into public\.questions[^;]+values\s*([\s\S]+?)\s*on conflict/i;
  const match = seedSql.match(qSectionRegex);
  if (!match) return [];
  const rows = [];
  const lines = match[1].trim().split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    const m = trimmed.match(/^\('([^']+)',\s*'([^']+)',\s*([^,]+),\s*'([^']+)',\s*'([^']+)',\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*(\d+),\s*'([^']+)',\s*(true|false),\s*([^)]+)\)/);
    if (m) {
      const cleanVal = (v) => v.trim().replace(/^'|'$/g, "");
      const topicVal = cleanVal(m[3]);
      const srcRefVal = cleanVal(m[6]);
      const tagVal = cleanVal(m[7]);
      const corrVal = cleanVal(m[8]);
      const noteVal = cleanVal(m[12]);
      rows.push({
        id: toValidUuid(m[1]),
        chapter_id: toValidUuid(m[2]),
        topic_id: topicVal === "null" ? null : toValidUuid(topicVal),
        type: m[4],
        source: m[5],
        source_ref: srcRefVal === "null" ? null : srcRefVal,
        concept_tag: tagVal === "null" ? null : tagVal,
        correct_option: corrVal === "null" ? null : parseInt(corrVal, 10),
        marks: parseInt(m[9], 10),
        difficulty: m[10],
        is_active: m[11] === "true",
        source_note: noteVal === "null" ? null : noteVal,
      });
    }
  }
  return rows;
}

function parseTranslationsFromSql() {
  const transSectionRegex = /insert into public\.question_translations[^;]+values\s*([\s\S]+?)\s*on conflict/i;
  const match = seedSql.match(transSectionRegex);
  if (!match) return [];
  const rows = [];
  const rawValues = match[1].trim();
  const lineRegex = /\('([^']+)',\s*'([^']+)',\s*'((?:[^']|'')*)',\s*([^,]+),\s*([^)]+)\)/g;
  let lMatch;
  while ((lMatch = lineRegex.exec(rawValues)) !== null) {
    const qId = toValidUuid(lMatch[1]);
    const lang = lMatch[2];
    const text = lMatch[3].replace(/''/g, "'");
    const rawOptions = lMatch[4].trim();
    let options = null;
    if (rawOptions !== "null" && rawOptions.startsWith("'[")) {
      try {
        const cleaned = rawOptions.replace(/::jsonb$/, "").replace(/^'|'$/g, "");
        options = JSON.parse(cleaned);
      } catch (e) {}
    }
    const rawAnswer = lMatch[5].trim();
    let answer = null;
    if (rawAnswer !== "null") {
      answer = rawAnswer.replace(/^'|'$/g, "").replace(/''/g, "'");
    }
    rows.push({
      question_id: qId,
      language: lang,
      text,
      options,
      answer,
    });
  }
  return rows;
}

async function runSeed() {
  console.log("=== SEEDING REMOTE SUPABASE DATABASE ===");
  console.log("URL:", supabaseUrl);

  // 1. Boards
  console.log("1. Upserting boards...");
  const { error: bErr } = await supabase.from("boards").upsert(boards);
  if (bErr) throw new Error("Boards failed: " + bErr.message);
  console.log(`   --> ${boards.length} boards seeded.`);

  // 2. Classes
  console.log("2. Upserting classes...");
  const { error: cErr } = await supabase.from("classes").upsert(classes);
  if (cErr) throw new Error("Classes failed: " + cErr.message);
  console.log(`   --> ${classes.length} classes seeded.`);

  // 3. Courses
  console.log("3. Upserting courses...");
  const { error: crErr } = await supabase.from("courses").upsert(courses);
  if (crErr) throw new Error("Courses failed: " + crErr.message);
  console.log(`   --> ${courses.length} courses seeded.`);

  // 4. Subjects
  console.log("4. Upserting subjects...");
  const { error: sErr } = await supabase.from("subjects").upsert(subjects);
  if (sErr) throw new Error("Subjects failed: " + sErr.message);
  console.log(`   --> ${subjects.length} subjects seeded.`);

  // 5. Chapters
  console.log("5. Upserting chapters...");
  const { error: chErr } = await supabase.from("chapters").upsert(chapters);
  if (chErr) throw new Error("Chapters failed: " + chErr.message);
  console.log(`   --> ${chapters.length} chapters seeded.`);

  // 6. Topics
  console.log("6. Upserting topics...");
  const { error: tErr } = await supabase.from("topics").upsert(topics);
  if (tErr) throw new Error("Topics failed: " + tErr.message);
  console.log(`   --> ${topics.length} topics seeded.`);

  // 7. Questions
  console.log("7. Upserting questions...");
  const mathQuestions = parseQuestionsFromSql();
  const compQuestions = computerCh8Data.questions.map((q) => ({
    id: q.id,
    chapter_id: q.chapter_id,
    topic_id: q.topic_id || null,
    type: q.type,
    source: q.source,
    source_ref: q.source_ref || null,
    concept_tag: q.concept_tag || null,
    correct_option: q.correct_option || null,
    marks: q.marks,
    difficulty: q.difficulty,
    is_active: q.is_active,
    source_note: q.source_note || null,
  }));
  const allQuestions = [...mathQuestions, ...compQuestions];

  // Chunk questions in batches of 50
  for (let i = 0; i < allQuestions.length; i += 50) {
    const chunk = allQuestions.slice(i, i + 50);
    const { error: qErr } = await supabase.from("questions").upsert(chunk);
    if (qErr) throw new Error("Questions chunk failed: " + qErr.message);
  }
  console.log(`   --> ${allQuestions.length} questions seeded.`);

  // 8. Translations
  console.log("8. Upserting question translations...");
  const mathTranslations = parseTranslationsFromSql();
  const compTranslations = [];
  for (const q of computerCh8Data.questions) {
    if (q.translations && Array.isArray(q.translations)) {
      for (const t of q.translations) {
        compTranslations.push({
          question_id: q.id,
          language: t.language,
          text: t.text,
          options: t.options || null,
          answer: t.answer || null,
        });
      }
    }
  }
  const allTranslations = [...mathTranslations, ...compTranslations];

  // Chunk translations in batches of 50
  for (let i = 0; i < allTranslations.length; i += 50) {
    const chunk = allTranslations.slice(i, i + 50);
    const { error: trErr } = await supabase.from("question_translations").upsert(chunk);
    if (trErr) throw new Error("Translations chunk failed: " + trErr.message);
  }
  console.log(`   --> ${allTranslations.length} question translations seeded.`);

  console.log("\n=========================================");
  console.log("   REMOTE SUPABASE SEEDING COMPLETED!    ");
  console.log("=========================================");
}

runSeed().catch((err) => {
  console.error("Seeding error:", err);
  process.exit(1);
});
