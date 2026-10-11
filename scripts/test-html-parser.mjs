// scripts/test-html-parser.mjs
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { parseQuestionsHtml } from "../src/lib/html-question-parser.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const files = [
  "Select Questions Chapter 01.html",
  "Select Questions Chapter 02.html",
  "Select Questions Chapter 03.html",
];

for (const f of files) {
  const filePath = path.resolve(__dirname, "../ref", f);
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping ${f} (not found)`);
    continue;
  }
  const content = fs.readFileSync(filePath, "utf-8");
  const res = parseQuestionsHtml(content);

  console.log(`\n========================================`);
  console.log(`FILE: ${f}`);
  console.log(`Header: ${res.metadata.rawChapterHeader}`);
  console.log(`Chapter: #${res.metadata.chapterNumber} "${res.metadata.chapterTitle}"`);
  console.log(`Subject: ${res.metadata.subjectName}`);
  console.log(`Class: ${res.metadata.className}`);
  console.log(`Topics Detected (${res.metadata.topics.length}):`, res.metadata.topics.map((t) => `${t.number}. ${t.title} (${t.count ?? 0})`));
  console.log(`Total Questions: ${res.stats.total} (MCQs: ${res.stats.mcq}, Short: ${res.stats.short}, Long: ${res.stats.long})`);
  console.log(`Bilingual count: ${res.stats.bilingual}`);
  console.log(`Warnings count: ${res.stats.warningsCount}`);

  // Sample question 1
  if (res.questions.length > 0) {
    const q1 = res.questions[0];
    console.log(`Sample Question 1:`);
    console.log(`  ID: ${q1.original_id} [${q1.type}]`);
    console.log(`  EN: ${q1.text_en.slice(0, 60)}...`);
    console.log(`  UR: ${q1.text_ur.slice(0, 60)}...`);
    if (q1.options_en) {
      console.log(`  Options EN:`, q1.options_en);
      console.log(`  Options UR:`, q1.options_ur);
      console.log(`  Correct: Option ${q1.correct_option}`);
    }
  }
}
