// scripts/append-ch3-sql.mjs
import fs from "node:fs";

const data = JSON.parse(fs.readFileSync("src/lib/data/computer10-ch3.json", "utf8"));

function escapeSql(str) {
  if (str === null || str === undefined) return "null";
  return "'" + str.replace(/'/g, "''") + "'";
}

const sql = `
-- ==============================================================================
-- Computer Science Class 10 (New) 2026-27 - Chapter 3: Introduction to Python Programming
-- Imported from ${data.source_file} (147 questions)
-- ==============================================================================

-- Chapter 3
insert into public.chapters (id, subject_id, number, title, title_ur) values
  ('${data.chapter.id}', '${data.chapter.subject_id}', ${data.chapter.number}, ${escapeSql(data.chapter.title)}, ${escapeSql(data.chapter.title_ur)})
on conflict (id) do update set number = excluded.number, title = excluded.title, title_ur = excluded.title_ur;

-- Topics
insert into public.topics (id, chapter_id, number, title, title_ur) values
${data.topics.map(t => `  ('${t.id}', '${t.chapter_id}', ${t.number}, ${escapeSql(t.title)}, ${escapeSql(t.title_ur)})`).join(",\n")}
on conflict (id) do update set number = excluded.number, title = excluded.title, title_ur = excluded.title_ur;

-- Questions (${data.questions.length} questions)
insert into public.questions (id, chapter_id, topic_id, type, source, source_ref, concept_tag, correct_option, marks, difficulty, is_active, source_note) values
${data.questions.map(q => {
  const top = q.topic_id ? `'${q.topic_id}'` : "null";
  const corr = q.correct_option !== null && q.correct_option !== undefined ? q.correct_option : "null";
  return `  ('${q.id}', '${q.chapter_id}', ${top}, '${q.type}', '${q.source}', ${escapeSql(q.source_ref)}, ${escapeSql(q.concept_tag)}, ${corr}, ${q.marks}, '${q.difficulty}', ${q.is_active}, ${escapeSql(q.source_note)})`;
}).join(",\n")}
on conflict (id) do update set
  type = excluded.type,
  source = excluded.source,
  source_ref = excluded.source_ref,
  concept_tag = excluded.concept_tag,
  correct_option = excluded.correct_option,
  marks = excluded.marks,
  difficulty = excluded.difficulty,
  source_note = excluded.source_note;

-- Question Translations (${data.questions.length} translations)
insert into public.question_translations (question_id, language, text, options, answer) values
${data.questions.map(q => {
  const t = q.translations[0];
  const opts = t.options ? `${escapeSql(JSON.stringify(t.options))}::jsonb` : "null";
  const ans = t.answer ? escapeSql(t.answer) : "null";
  return `  ('${q.id}', '${t.language}', ${escapeSql(t.text)}, ${opts}, ${ans})`;
}).join(",\n")}
on conflict do nothing;
`;

fs.appendFileSync("supabase/seed.sql", sql, "utf8");
console.log(`Appended ${data.questions.length} Chapter 3 questions to supabase/seed.sql`);
