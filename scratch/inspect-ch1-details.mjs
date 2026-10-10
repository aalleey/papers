import fs from "fs";

const html = fs.readFileSync("ref/Select Questions Chapter 01.html", "utf-8");

// Look for topic filter or sidebar
const sidebarMatch = html.match(/<aside[\s\S]*?<\/aside>|<div class="[^"]*sidebar[^"]*"[\s\S]*?<\/div>/i);
if (sidebarMatch) {
  console.log("Found sidebar:", sidebarMatch[0].slice(0, 500));
} else {
  // Check for filter buttons
  const buttons = [...html.matchAll(/<button[^>]*class="([^"]*)"[^>]*>([\s\S]*?)<\/button>/gi)];
  console.log("Total buttons:", buttons.length);
  const filterBtns = buttons.filter(b => b[1].includes("filter") || b[1].includes("topic"));
  console.log("Filter/topic buttons:", filterBtns.slice(0, 10).map(b => b[0]));
}

// Check sample question card
const firstCard = html.match(/<div class="question-card[^"]*"[\s\S]*?<\/div>\s*<\/div>/i);
if (firstCard) {
  console.log("Sample card:\n", firstCard[0].slice(0, 600));
}
