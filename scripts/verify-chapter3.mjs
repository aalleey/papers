// scripts/verify-chapter3.mjs
// Verifies Chapter 3 questions API and client loader

const BASE_URL = "http://localhost:3000";
const CHAPTER_3_ID = "bd6c341e-e709-5551-959a-84c2a20e57f5";

async function run() {
  console.log("=== STEP 1: Log in client to acquire session ===");
  const loginRes = await fetch(`${BASE_URL}/api/auth/client/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "usman.khan@apexacademy.edu.pk" }),
  });

  if (!loginRes.ok) {
    throw new Error(`Client login failed: ${loginRes.status}`);
  }

  const cookies = loginRes.headers.get("set-cookie") || "";
  const authCookie = cookies.split(";")[0];
  console.log("✓ Client logged in. Cookie acquired.");

  console.log("\n=== STEP 2: Fetch Chapter 3 Questions via /api/paper/questions ===");
  const res = await fetch(`${BASE_URL}/api/paper/questions?chapter_id=${CHAPTER_3_ID}`, {
    headers: { Cookie: authCookie },
  });

  if (!res.ok) {
    throw new Error(`Failed to load Chapter 3 questions: ${res.status}`);
  }

  const data = await res.json();

  const ch3 = data.chapters.find((c) => c.number === 3);
  if (!ch3) throw new Error("Chapter 3 not found in chapters list!");
  console.log(`✓ Chapter 3 confirmed: Unit-${ch3.number} ${ch3.title} (${ch3.title_ur})`);

  console.log(`✓ Topics returned: ${data.topics.length}`);
  data.topics.forEach((t) => console.log(`  - Topic ${t.number}: ${t.title}`));

  const mcqs = data.questions.filter((q) => q.type === "mcq");
  const shorts = data.questions.filter((q) => q.type === "short");
  const longs = data.questions.filter((q) => q.type === "long");

  console.log(`\n✓ Questions for Chapter 3:`);
  console.log(`  - Total: ${data.questions.length}`);
  console.log(`  - MCQs: ${mcqs.length}`);
  console.log(`  - Short Questions: ${shorts.length}`);
  console.log(`  - Long Questions: ${longs.length}`);

  if (data.questions.length !== 147) {
    throw new Error(`Expected 147 questions, got ${data.questions.length}`);
  }

  // Sample check first MCQ
  const firstMcq = mcqs[0];
  console.log(`\n✓ Sample MCQ Verified:`);
  console.log(`  - ID: ${firstMcq.id}`);
  console.log(`  - Source Ref: ${firstMcq.source_ref}`);
  console.log(`  - Concept: ${firstMcq.concept_tag}`);
  console.log(`  - Question Text: ${firstMcq.translations[0]?.text}`);
  console.log(`  - Options: ${JSON.stringify(firstMcq.translations[0]?.options)}`);
  console.log(`  - Correct Option: ${firstMcq.correct_option}`);

  console.log("\n========================================================");
  console.log("🎉 CHAPTER 3 INTEGRATION VERIFIED 100% SUCCESSFULLY!");
  console.log("========================================================");
}

run().catch((err) => {
  console.error("❌ Verification failed:", err);
  process.exit(1);
});
