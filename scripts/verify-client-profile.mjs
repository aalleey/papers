import assert from "node:assert";

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

async function main() {
  console.log("=========================================================");
  console.log("   PAPERWALA - CLIENT PROFILE & PAPER HISTORY TESTS      ");
  console.log("=========================================================");

  // 1. Logged-out cannot read / write history
  console.log("\n1. Testing: /api/papers locked when logged out...");
  const g = await fetch(`${BASE_URL}/api/papers`);
  assert.strictEqual(g.status, 401);
  const p = await fetch(`${BASE_URL}/api/papers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "x" }),
  });
  assert.strictEqual(p.status, 401);
  console.log("   --> PASS: GET/POST blocked with 401");

  // 2. Signup pay-as-you-go client (5 credits)
  console.log("\n2. Testing: signup on pay-as-you-go plan...");
  const email = `profile_${Date.now()}@school.pk`;
  const signup = await fetch(`${BASE_URL}/api/auth/client/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, fullName: "History Tester", academyName: "Test Academy", planId: "pay_as_you_go" }),
  });
  const cookie = signup.headers.get("set-cookie").split(";")[0];
  const signupData = await signup.json();
  const clientId = signupData.client.id;
  assert.strictEqual(signupData.client.subscription.paperCredits, 5);
  console.log(`   --> PASS: client ${clientId} created with 5 credits`);

  // 3. Fresh history is empty
  console.log("\n3. Testing: empty history + zero stats...");
  const h0 = await (await fetch(`${BASE_URL}/api/papers`, { headers: { Cookie: cookie } })).json();
  assert.strictEqual(h0.papers.length, 0);
  assert.strictEqual(h0.stats.totalPapers, 0);
  console.log("   --> PASS");

  // 4. Record papers
  console.log("\n4. Testing: recording 3 generated papers...");
  const payloads = [
    { title: "Test 1", subject: "Computer Science", mcqCount: 10, shortCount: 5, longCount: 1, totalMarks: 25, languageMode: "Bilingual", exportMode: "all", className: "10th", syllabus: "Unit-1", version: "A" },
    { title: "Test 2", subject: "Computer Science", mcqCount: 7, shortCount: 6, longCount: 2, totalMarks: 29, languageMode: "English", exportMode: "questions", className: "10th", syllabus: "Unit-2", version: "B" },
    { title: "Test 3", subject: "Mathematics", mcqCount: 8, shortCount: 5, longCount: 1, totalMarks: 23, languageMode: "Urdu", exportMode: "key", className: "10th", syllabus: "Quadratics", version: "C" },
  ];
  let last;
  for (const body of payloads) {
    const r = await fetch(`${BASE_URL}/api/papers`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify(body),
    });
    assert.strictEqual(r.status, 201);
    last = await r.json();
  }
  assert.strictEqual(last.client.subscription.paperCredits, 2, "3 credits should be consumed");
  console.log("   --> PASS: 3 papers saved, credits 5 -> 2");

  // 5. History + stats correct
  console.log("\n5. Testing: history and stats aggregation...");
  const h = await (await fetch(`${BASE_URL}/api/papers`, { headers: { Cookie: cookie } })).json();
  assert.strictEqual(h.papers.length, 3);
  assert.strictEqual(h.stats.totalPapers, 3);
  assert.strictEqual(h.stats.totalQuestions, 16 + 15 + 14);
  assert.strictEqual(h.stats.totalMarks, 25 + 29 + 23);
  assert.strictEqual(h.stats.bySubject[0].subject, "Computer Science");
  assert.strictEqual(h.stats.bySubject[0].count, 2);
  assert.strictEqual(h.stats.papersThisWeek, 3);
  assert.strictEqual(h.stats.perDay.length, 14);
  assert.strictEqual(h.stats.perDay[13].count, 3);
  console.log("   --> PASS: totals, subject breakdown and 14-day chart correct");

  // 6. Credits exhausted state is visible
  console.log("\n6. Testing: history isolated per client...");
  const other = await fetch(`${BASE_URL}/api/auth/client/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: `other_${Date.now()}@school.pk`, fullName: "Other", planId: "free" }),
  });
  const otherCookie = other.headers.get("set-cookie").split(";")[0];
  const oh = await (await fetch(`${BASE_URL}/api/papers`, { headers: { Cookie: otherCookie } })).json();
  assert.strictEqual(oh.papers.length, 0, "other client must not see this history");
  console.log("   --> PASS");

  // 7. Admin can view the client's profile + history
  console.log("\n7. Testing: admin views client profile history...");
  const adminLogin = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@papermaker.pk", password: "admin123" }),
  });
  const adminCookie = adminLogin.headers.get("set-cookie").split(";")[0];

  const noAuth = await fetch(`${BASE_URL}/api/admin/clients/${clientId}/papers`);
  assert.strictEqual(noAuth.status, 401);
  const asClient = await fetch(`${BASE_URL}/api/admin/clients/${clientId}/papers`, { headers: { Cookie: cookie } });
  assert.strictEqual(asClient.status, 401, "clients must not use the admin endpoint");

  const ad = await fetch(`${BASE_URL}/api/admin/clients/${clientId}/papers`, { headers: { Cookie: adminCookie } });
  assert.strictEqual(ad.status, 200);
  const adData = await ad.json();
  assert.strictEqual(adData.papers.length, 3);
  assert.strictEqual(adData.client.email, email);
  console.log("   --> PASS: admin sees profile + 3 papers; visitors/clients blocked");

  // 8. Seeded demo clients have history
  console.log("\n8. Testing: seeded demo client has history...");
  const seed = await (await fetch(`${BASE_URL}/api/admin/clients/client-seed-002/papers`, { headers: { Cookie: adminCookie } })).json();
  assert.ok(seed.stats.totalPapers >= 30, "seed client 2 should have 31 papers");
  console.log(`   --> PASS: ${seed.client.fullName} has ${seed.stats.totalPapers} papers`);

  // 8b. Re-login keeps plan, credits, name and history
  console.log("\n8b. Testing: re-login preserves plan / credits / name / history...");
  const relogin = await fetch(`${BASE_URL}/api/auth/client/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: "whatever" }),
  });
  const reData = await relogin.json();
  assert.strictEqual(reData.client.subscription.planId, "pay_as_you_go", "plan must not reset to free");
  assert.strictEqual(reData.client.subscription.paperCredits, 2, "credits must persist");
  assert.strictEqual(reData.client.fullName, "History Tester", "name must persist");
  const reCookie = relogin.headers.get("set-cookie").split(";")[0];
  const reHist = await (await fetch(`${BASE_URL}/api/papers`, { headers: { Cookie: reCookie } })).json();
  assert.strictEqual(reHist.papers.length, 3);
  console.log("   --> PASS");

  // 9. Deleting client removes history
  console.log("\n9. Testing: deleting client cascades history...");
  await fetch(`${BASE_URL}/api/admin/clients/${clientId}`, { method: "DELETE", headers: { Cookie: adminCookie } });
  const gone = await fetch(`${BASE_URL}/api/admin/clients/${clientId}/papers`, { headers: { Cookie: adminCookie } });
  assert.strictEqual(gone.status, 404);
  console.log("   --> PASS");

  console.log("\n=========================================================");
  console.log("   ALL PROFILE & HISTORY TESTS PASSED (100%)             ");
  console.log("=========================================================\n");
}

main().catch((err) => {
  console.error("Test failed with error:", err);
  process.exit(1);
});
