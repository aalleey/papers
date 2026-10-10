import fs from "node:fs";

const data = JSON.parse(fs.readFileSync("src/lib/data/computer10-ch8.json", "utf8"));

function escapeSql(str) {
  if (str === null || str === undefined) return "null";
  return "'" + str.replace(/'/g, "''") + "'";
}

let sql = `\n-- ==============================================================================
-- Computer Science Class 10 (New) 2026-27 - Chapter 8: Digital Entrepreneurship
-- Imported from ${data.source_file} (180 questions)
-- ==============================================================================

-- Course
insert into public.courses (id, board_id, class_id, name, is_active) values
  ('cr100000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000010', '10th (New) 2026-27', true)
on conflict (id) do update set name = excluded.name, is_active = excluded.is_active;

-- Subjects
insert into public.subjects (id, course_id, name, name_ur) values
  ('${data.subject.id}', '${data.subject.course_id}', ${escapeSql(data.subject.name)}, ${escapeSql(data.subject.name_ur)}),
  ('s1000000-0000-0000-0000-000000000004', 'cr100000-0000-0000-0000-000000000001', ${escapeSql(data.subject.name)}, ${escapeSql(data.subject.name_ur)})
on conflict (id) do update set name = excluded.name, name_ur = excluded.name_ur;

-- Chapter 8
insert into public.chapters (id, subject_id, number, title, title_ur) values
  ('${data.chapter.id}', '${data.chapter.subject_id}', ${data.chapter.number}, ${escapeSql(data.chapter.title)}, ${escapeSql(data.chapter.title_ur || "ڈیجیٹل انٹرپرینیورشپ")}),
  ('ch100000-0000-0000-0000-000000000008', 's1000000-0000-0000-0000-000000000004', ${data.chapter.number}, ${escapeSql(data.chapter.title)}, ${escapeSql(data.chapter.title_ur || "ڈیجیٹل انٹرپرینیورشپ")})
on conflict (id) do update set number = excluded.number, title = excluded.title, title_ur = excluded.title_ur;

-- Topics
insert into public.topics (id, chapter_id, number, title, title_ur) values
${data.topics.map(t => `  ('${t.id}', '${t.chapter_id}', ${t.number}, ${escapeSql(t.title)}, ${escapeSql(t.title_ur)})`).join(",\n")}
on conflict (id) do update set number = excluded.number, title = excluded.title, title_ur = excluded.title_ur;

-- Questions (180 questions)
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

-- Question Translations (180 translations)
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
console.log("Successfully appended 180 questions + hierarchy to supabase/seed.sql!");
