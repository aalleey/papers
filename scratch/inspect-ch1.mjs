import fs from "fs";

const html = fs.readFileSync("ref/Select Questions Chapter 01.html", "utf-8");

const topicMatches = [...html.matchAll(/class="topic-btn"[^>]*data-topic="([^"]+)"[^>]*>([\s\S]*?)<\/button>/g)];
const topics = topicMatches.map((m) => ({
  val: m[1],
  text: m[2].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim(),
}));
console.log("Topics count:", topics.length);
console.log("Topics:", topics);

const cardCount = (html.match(/class="question-card/g) || []).length;
console.log("Question cards count in Chapter 01:", cardCount);
