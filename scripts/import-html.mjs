// Usage: node scripts/import-html.mjs "<path-to-html>" <out.json> <course_id>
// Parses a saved "Select Questions" page into Paper Maker's structure.
import fs from "node:fs";
import crypto from "node:crypto";

const [, , inPath, outPath, courseId] = process.argv;
if (!inPath || !outPath || !courseId) {
  console.error('Usage: node scripts/import-html.mjs "<html>" <out.json> <course_id>');
  process.exit(1);
}

// Deterministic UUID so re-running the import yields the same ids (idempotent seeds).
const uuid = (key) => {
  const h = crypto.createHash("sha1").update(`papermaker:${key}`).digest("hex");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-5${h.slice(13, 16)}-${((parseInt(h[16], 16) & 3) | 8).toString(16)}${h.slice(17, 20)}-${h.slice(20, 32)}`;
};
const html = fs.readFileSync(inPath, "utf8");

const decode = (s) =>
  s
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&amp;/g, "&");

// Replace rendered KaTeX blocks with $tex$ using the embedded annotation.
function restoreKatex(fragment) {
  let out = fragment;
  for (;;) {
    const start = out.search(/<span class="katex(-display)?">/);
    if (start === -1) break;
    // walk balanced <span> tags to find the end of this katex block
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

// Split into cards
const cardRe = /<div class="question-card[^"]*" data-id="([^"]+)" data-type="(\w+)" data-chapter-id="([^"]+)">/g;
const starts = [];
let cm;
while ((cm = cardRe.exec(html))) starts.push({ idx: cm.index, id: cm[1], type: cm[2], chapterKey: cm[3] });

const topics = new Map(); // number -> title
const questions = [];
const problems = [];

starts.forEach((s, i) => {
  const block = html.slice(s.idx, i + 1 < starts.length ? starts[i + 1].idx : s.idx + 20000);
  const topicTag = pick(block, "topic-tag") || "";
  const exTag = pick(block, "exercise-tag");
  const remark = pick(block, "remarks-tag");
  const qText = pick(block, "question-text");

  let topicNumber = null;
  const tm = topicTag.match(/^(\d+)\.(\d+)\s+(.+)$/);
  if (tm) {
    topicNumber = Number(tm[2]);
    topics.set(topicNumber, tm[3].trim());
  }

  const q = {
    original_id: s.id,
    type: s.type,
    topic_number: topicNumber,
    source: topicTag === "Exercise" || exTag ? "exercise" : "extra",
    source_ref: exTag ? exTag.replace(/^Ex:\s*/, "Ex ") : null,
    concept_tag: remark,
    text_en: qText,
    options: null,
    correct_option: null,
  };

  if (s.type === "mcq") {
    const opts = [...block.matchAll(/<li class="option( correct-option)?\s*">\s*<b>[A-D]\)<\/b>\s*([\s\S]*?)<\/li>/g)];
    q.options = opts.map((o) => toText(o[2]));
    const ci = opts.findIndex((o) => Boolean(o[1]));
    q.correct_option = ci >= 0 ? ci + 1 : null;
    if (q.options.length !== 4) problems.push(`${s.id}: ${q.options.length} options`);
    if (!q.correct_option) problems.push(`${s.id}: no correct option marked`);
  }
  if (!q.text_en) problems.push(`${s.id}: empty text`);
  questions.push(q);
});

// Duplicate rule (same chapter + same English text): keep the first, skip the rest.
const seen = new Map();
const kept = [];
const skipped = [];
for (const q of questions) {
  const k = (q.text_en || "").toLowerCase();
  if (seen.has(k)) skipped.push({ original_id: q.original_id, duplicate_of: seen.get(k), text_en: q.text_en });
  else {
    seen.set(k, q.original_id);
    kept.push(q);
  }
}

const srcFile = inPath.split(/[\\/]/).pop();
const TOPIC_URDU = {
  1: "بنیادی سے اعلیٰ انٹرپرینیورشپ",
  2: "مسائل کا حل اور موافقت",
  3: "اخلاقی کاروباری طریقہ کار اور ڈیجیٹل اخلاقیات",
  4: "قانونی فریم ورک اور تعمیل",
  5: "اسٹریٹجک مارکیٹنگ اور برانڈنگ",
};

const unit = html.match(/Unit-(\d+)\s+([^<]+?)\s*</) || [];
const subject = { id: uuid(`${courseId}:subject:computer`), course_id: courseId, name: "Computer Science", name_ur: "کمپیوٹر سائنس" };
const chapterNumber = Number(unit[1] || 8);
const chapter = {
  id: uuid(`${subject.id}:chapter:${chapterNumber}`),
  subject_id: subject.id,
  number: chapterNumber,
  title: (unit[2] || "Digital Entrepreneurship").trim(),
  title_ur: "ڈیجیٹل انٹرپرینیورشپ",
};
const topicRows = [...topics.entries()]
  .sort((a, b) => a[0] - b[0])
  .map(([number, title]) => ({
    id: uuid(`${chapter.id}:topic:${number}`),
    chapter_id: chapter.id,
    number,
    title,
    title_ur: TOPIC_URDU[number] || null,
  }));
const topicId = (n) => topicRows.find((t) => t.number === n)?.id || null;
const MARKS = { mcq: 1, short: 2, long: 5 };

const out = {
  source_file: srcFile,
  subject,
  chapter,
  topics: topicRows,
  questions: kept.map((q) => ({
    id: uuid(`question:${q.original_id}`),
    chapter_id: chapter.id,
    topic_id: q.topic_number ? topicId(q.topic_number) : null,
    type: q.type,
    source: q.source,
    source_ref: q.source_ref || null,
    concept_tag: q.concept_tag || null,
    correct_option: q.correct_option ?? null,
    marks: MARKS[q.type],
    difficulty: "medium",
    is_active: true,
    source_note: `Imported from ${srcFile} (id ${q.original_id})`,
    translations: [{ language: "en", text: q.text_en, ...(q.options ? { options: q.options } : {}) }],
  })),
  skipped_duplicates: skipped,
};

fs.writeFileSync(outPath, JSON.stringify(out, null, 2) + "\n", "utf8");
const count = (t) => kept.filter((q) => q.type === t).length;
console.log(`Chapter ${chapter.number}: ${chapter.title}`);
console.log(`Topics: ${topicRows.map((t) => `${chapter.number}.${t.number}`).join(", ")}`);
console.log(`Parsed ${questions.length}, kept ${kept.length} (mcq ${count("mcq")}, short ${count("short")}, long ${count("long")}), skipped ${skipped.length} duplicate(s)`);
console.log(`With LaTeX: ${kept.filter((q) => /\$/.test(q.text_en + (q.options || []).join(""))).length}`);
console.log(problems.length ? `Problems:\n - ${problems.join("\n - ")}` : "Problems: none");
