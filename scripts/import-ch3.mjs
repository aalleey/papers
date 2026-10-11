// scripts/import-ch3.mjs
// Extracts all questions from "ref/Select Questions Chapter 03.html"
// Generates "src/lib/data/computer10-ch3.json" and seeds Supabase + seed-data.ts

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.resolve(__dirname, "../ref/Select Questions Chapter 03.html");
const outJsonPath = path.resolve(__dirname, "../src/lib/data/computer10-ch3.json");

const html = fs.readFileSync(htmlPath, "utf8");

// Deterministic UUID helper
const uuid = (key) => {
  const h = crypto.createHash("sha1").update(`papermaker:${key}`).digest("hex");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-5${h.slice(13, 16)}-${((parseInt(h[16], 16) & 3) | 8).toString(16)}${h.slice(17, 20)}-${h.slice(20, 32)}`;
};

const decode = (s) =>
  s
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&amp;/g, "&");

// Restore KaTeX equations back into standard LaTeX ($formula$)
function restoreKatex(fragment) {
  let out = fragment;
  for (;;) {
    const start = out.search(/<span class="katex(-display)?">/);
    if (start === -1) break;
    const re = /<\/?span\b[^>]*>/g;
    re.lastIndex = start;
    let depth = 0;
    let end = -1;
    let m;
    while ((m = re.exec(out))) {
      depth += m[0].startsWith("</") ? -1 : 1;
      if (depth === 0) {
        end = re.lastIndex;
        break;
      }
    }
    if (end === -1) break;
    const block = out.slice(start, end);
    const tex = block.match(/<annotation encoding="application\/x-tex">([\s\S]*?)<\/annotation>/);
    out = out.slice(0, start) + (tex ? `$${decode(tex[1]).trim()}$` : "") + out.slice(end);
  }
  return out;
}

const toText = (fragment) =>
  decode(restoreKatex(fragment).replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, " "))
    .replace(/[ \t]+/g, " ")
    .replace(/\s*\n\s*/g, "\n")
    .replace(/\$ ([.,?:;!])/g, "$$$1")
    .trim();

const pick = (block, cls) => {
  const m = block.match(new RegExp(`<(\\w+) class="${cls}[^"]*">([\\s\\S]*?)</\\1>`));
  return m ? toText(m[2]) : null;
};

// Find all question cards
const cardRe = /<div class="question-card[^"]*" data-id="([^"]+)" data-type="(\w+)" data-chapter-id="([^"]+)">/g;
const starts = [];
let cm;
while ((cm = cardRe.exec(html))) {
  starts.push({ idx: cm.index, id: cm[1], type: cm[2], chapterKey: cm[3] });
}

console.log(`Found ${starts.length} question cards in HTML.`);

const courseId = "ca100000-0000-0000-0000-000000000005"; // Class 10 (New) 2026-27
const subjectId = "1def1b99-7726-55ec-8b98-17c3f3c85c6a"; // Computer Science
const chapterNumber = 3;
const chapterId = uuid(`${subjectId}:chapter:${chapterNumber}`);

// Canonical Topics for Chapter 3
const topicDefinitions = [
  { number: 1, title: "Introduction to Python Programming", title_ur: "پائتھن پروگرامنگ کا تعارف", match: ["3.1 Introduction to Python Programming"] },
  { number: 2, title: "Basic Programming Concepts", title_ur: "بنیادی پروگرامنگ کے تصورات", match: ["3.1.1 Basic Programming Concepts"] },
  { number: 3, title: "Basic Python Syntax and Structure", title_ur: "بنیادی پائتھن سنٹیکس اور ساخت", match: ["3.2 Basic Python Syntax and Structure"] },
  { number: 4, title: "Operators and Expressions", title_ur: "آپریٹرز اور ایکسپریشنز", match: ["3.3 Operators and Expressions"] },
  { number: 5, title: "Exercise Questions", title_ur: "مشقی سوالات", match: ["Exercise"] },
];

const topicRows = topicDefinitions.map((t) => ({
  id: uuid(`${chapterId}:topic:${t.number}`),
  chapter_id: chapterId,
  number: t.number,
  title: t.title,
  title_ur: t.title_ur,
}));

function getTopicIdForTag(tag) {
  if (!tag) return null;
  const trimmed = tag.trim();
  for (const t of topicDefinitions) {
    if (t.match.some((m) => trimmed.includes(m) || m.includes(trimmed))) {
      return topicRows.find((r) => r.number === t.number)?.id || null;
    }
  }
  return null;
}

const questions = [];
const problems = [];

starts.forEach((s, i) => {
  const block = html.slice(s.idx, i + 1 < starts.length ? starts[i + 1].idx : s.idx + 30000);
  const topicTag = pick(block, "topic-tag") || "";
  const exTag = pick(block, "exercise-tag");
  const remark = pick(block, "remarks-tag");
  const qText = pick(block, "question-text");
  const boardTag = pick(block, "board-tag");

  const topicId = getTopicIdForTag(topicTag);

  const q = {
    original_id: s.id,
    type: s.type, // 'mcq' | 'short' | 'long'
    topic_id: topicId,
    source: topicTag === "Exercise" || exTag ? "exercise" : boardTag ? "past_paper" : "extra",
    source_ref: exTag ? exTag.replace(/^Ex:\s*/, "Ex ") : boardTag || null,
    concept_tag: remark || null,
    text_en: qText,
    options: null,
    correct_option: null,
  };

  if (s.type === "mcq") {
    const opts = [...block.matchAll(/<li class="option( correct-option)?\s*">\s*<b>[A-D]\)<\/b>\s*([\s\S]*?)<\/li>/g)];
    q.options = opts.map((o) => toText(o[2]));
    const ci = opts.findIndex((o) => Boolean(o[1]));
    q.correct_option = ci >= 0 ? ci + 1 : null;

    if (q.options.length !== 4) {
      problems.push(`${s.id}: expected 4 options, found ${q.options.length}`);
    }
    if (!q.correct_option) {
      problems.push(`${s.id}: no correct option marked`);
    }
  }

  if (!q.text_en) {
    problems.push(`${s.id}: empty question text`);
  }

  questions.push(q);
});

// Remove exact duplicates
const seen = new Map();
const kept = [];
const skipped = [];

for (const q of questions) {
  const k = (q.text_en || "").toLowerCase();
  if (seen.has(k)) {
    skipped.push({ original_id: q.original_id, duplicate_of: seen.get(k), text_en: q.text_en });
  } else {
    seen.set(k, q.original_id);
    kept.push(q);
  }
}

const MARKS = { mcq: 1, short: 2, long: 5 };

const out = {
  source_file: "Select Questions Chapter 03.html",
  subject: {
    id: subjectId,
    course_id: courseId,
    name: "Computer Science",
    name_ur: "کمپیوٹر سائنس",
  },
  chapter: {
    id: chapterId,
    subject_id: subjectId,
    number: chapterNumber,
    title: "Introduction to Python Programming",
    title_ur: "پائتھن پروگرامنگ کا تعارف",
  },
  topics: topicRows,
  questions: kept.map((q) => ({
    id: uuid(`question:${q.original_id}`),
    chapter_id: chapterId,
    topic_id: q.topic_id,
    type: q.type,
    source: q.source,
    source_ref: q.source_ref || null,
    concept_tag: q.concept_tag || null,
    correct_option: q.correct_option ?? null,
    marks: MARKS[q.type] || 1,
    difficulty: "medium",
    is_active: true,
    source_note: `Imported from Select Questions Chapter 03.html (id ${q.original_id})`,
    translations: [
      {
        language: "en",
        text: q.text_en,
        ...(q.options ? { options: q.options } : {}),
      },
    ],
  })),
  skipped_duplicates: skipped,
};

fs.writeFileSync(outJsonPath, JSON.stringify(out, null, 2) + "\n", "utf8");

const countType = (t) => kept.filter((q) => q.type === t).length;
console.log(`\n=== IMPORT SUMMARY ===`);
console.log(`Chapter 3: ${out.chapter.title} (${out.chapter.title_ur})`);
console.log(`Chapter ID: ${out.chapter.id}`);
console.log(`Topics Created: ${out.topics.length}`);
out.topics.forEach((t) => console.log(`  - ${t.number}. ${t.title} (${t.title_ur}) [ID: ${t.id}]`));
console.log(`Total Questions Parsed: ${questions.length}`);
console.log(`Kept: ${kept.length} (MCQs: ${countType("mcq")}, Short: ${countType("short")}, Long: ${countType("long")})`);
console.log(`Skipped Duplicates: ${skipped.length}`);
console.log(`Problems Encountered: ${problems.length}`);
if (problems.length > 0) {
  problems.slice(0, 10).forEach((p) => console.log(`  - ${p}`));
}
console.log(`\nSaved successfully to: ${outJsonPath}`);
