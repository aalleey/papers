// scripts/seed-ch3-remote.mjs
// Seeds Chapter 3 questions, topics, and translations into remote Supabase database

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

const ch3Path = path.resolve(__dirname, "../src/lib/data/computer10-ch3.json");
const ch3Data = JSON.parse(fs.readFileSync(ch3Path, "utf-8"));

async function seed() {
  console.log("=== SEEDING CHAPTER 3 TO REMOTE SUPABASE ===");

  // 1. Ensure Subject exists
  const { error: subErr } = await supabase.from("subjects").upsert({
    id: ch3Data.subject.id,
    course_id: ch3Data.subject.course_id,
    name: ch3Data.subject.name,
    name_ur: ch3Data.subject.name_ur,
  });
  if (subErr) console.warn("Subject upsert notice:", subErr.message);
  else console.log("✓ Subject confirmed/upserted:", ch3Data.subject.name);

  // 2. Upsert Chapter
  const { error: chapErr } = await supabase.from("chapters").upsert({
    id: ch3Data.chapter.id,
    subject_id: ch3Data.chapter.subject_id,
    number: ch3Data.chapter.number,
    title: ch3Data.chapter.title,
    title_ur: ch3Data.chapter.title_ur,
  });
  if (chapErr) throw new Error(`Chapter upsert failed: ${chapErr.message}`);
  console.log(`✓ Chapter 3 upserted: ${ch3Data.chapter.title} [ID: ${ch3Data.chapter.id}]`);

  // 3. Upsert Topics
  for (const topic of ch3Data.topics) {
    const { error: topErr } = await supabase.from("topics").upsert({
      id: topic.id,
      chapter_id: topic.chapter_id,
      number: topic.number,
      title: topic.title,
      title_ur: topic.title_ur,
    });
    if (topErr) console.warn(`Topic ${topic.number} notice:`, topErr.message);
  }
  console.log(`✓ ${ch3Data.topics.length} Topics upserted.`);

  // 4. Batch Upsert Questions
  const questionsPayload = ch3Data.questions.map((q) => ({
    id: q.id,
    chapter_id: q.chapter_id,
    topic_id: q.topic_id || null,
    type: q.type,
    source: q.source,
    source_ref: q.source_ref || null,
    concept_tag: q.concept_tag || null,
    correct_option: q.correct_option ?? null,
    marks: q.marks,
    difficulty: q.difficulty,
    is_active: q.is_active,
    source_note: q.source_note || null,
  }));

  // Batch in chunks of 50
  for (let i = 0; i < questionsPayload.length; i += 50) {
    const chunk = questionsPayload.slice(i, i + 50);
    const { error: qErr } = await supabase.from("questions").upsert(chunk);
    if (qErr) throw new Error(`Questions chunk ${i} upsert failed: ${qErr.message}`);
  }
  console.log(`✓ ${questionsPayload.length} Questions upserted to remote Supabase.`);

  // 5. Batch Upsert Translations
  const translationsPayload = [];
  for (const q of ch3Data.questions) {
    for (const t of q.translations) {
      translationsPayload.push({
        question_id: q.id,
        language: t.language,
        text: t.text,
        options: t.options ? JSON.stringify(t.options) : null,
        answer: t.answer || null,
      });
    }
  }

  for (let i = 0; i < translationsPayload.length; i += 50) {
    const chunk = translationsPayload.slice(i, i + 50);
    const { error: tErr } = await supabase.from("question_translations").upsert(chunk);
    if (tErr) throw new Error(`Translations chunk ${i} upsert failed: ${tErr.message}`);
  }
  console.log(`✓ ${translationsPayload.length} Translations upserted to remote Supabase.`);

  // Verify total count in Supabase
  const { count: totalQuestions } = await supabase.from("questions").select("*", { count: "exact", head: true });
  console.log(`\n🎉 Remote Supabase now has ${totalQuestions} TOTAL QUESTIONS!`);
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
