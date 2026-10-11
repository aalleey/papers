// scripts/verify-http-paid-gating.mjs
async function testHttpEndpoints() {
  console.log("=== TESTING API PAID SUBSCRIPTION GATING ON HTTP ===");

  // 1. Unauthenticated request to /api/paper/questions
  console.log("\n[Test 1] Unauthenticated GET /api/paper/questions");
  const res1 = await fetch("http://localhost:3000/api/paper/questions?chapter=3");
  console.log("  Status:", res1.status, "=> EXPECTED: 401");
  const json1 = await res1.json();
  console.log("  Body:", json1);
  if (res1.status !== 401 || !json1.requireLogin) {
    throw new Error("Test 1 failed: Expected 401 with requireLogin");
  }

  // 2. Unauthenticated request to POST /api/papers
  console.log("\n[Test 2] Unauthenticated POST /api/papers");
  const res2 = await fetch("http://localhost:3000/api/papers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "Test Paper", totalMarks: 50 }),
  });
  console.log("  Status:", res2.status, "=> EXPECTED: 401");
  const json2 = await res2.json();
  console.log("  Body:", json2);
  if (res2.status !== 401) {
    throw new Error("Test 2 failed: Expected 401");
  }

  // 3. Create a FREE client session
  console.log("\n[Test 3] Create Free client and test /api/paper/questions");
  const signupRes = await fetch("http://localhost:3000/api/auth/client/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: `free-tester-${Date.now()}@paperwala.pk`,
      fullName: "Free Test Educator",
      planId: "free",
    }),
  });
  const cookieHeader = signupRes.headers.get("set-cookie");
  const signupData = await signupRes.json();
  console.log("  Free client created:", signupData.client?.email, "Plan:", signupData.client?.subscription?.planName);

  // 4. Test GET /api/paper/questions with Free client cookie
  console.log("\n[Test 4] Free client GET /api/paper/questions (should be 403 Forbidden)");
  const res4 = await fetch("http://localhost:3000/api/paper/questions?chapter=3", {
    headers: { Cookie: cookieHeader || "" },
  });
  console.log("  Status:", res4.status, "=> EXPECTED: 403");
  const json4 = await res4.json();
  console.log("  Body:", json4);
  if (res4.status !== 403 || !json4.requireSubscription) {
    throw new Error("Test 4 failed: Free client should be blocked with 403 and requireSubscription");
  }

  // 5. Test POST /api/papers with Free client cookie (should be 403 Forbidden)
  console.log("\n[Test 5] Free client POST /api/papers (should be 403 Forbidden)");
  const res5 = await fetch("http://localhost:3000/api/papers", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader || "",
    },
    body: JSON.stringify({
      title: "Free Attempt Paper",
      subject: "Computer Science",
      totalMarks: 50,
    }),
  });
  console.log("  Status:", res5.status, "=> EXPECTED: 403");
  const json5 = await res5.json();
  console.log("  Body:", json5);
  if (res5.status !== 403 || !json5.requireSubscription) {
    throw new Error("Test 5 failed: Free client should not be allowed to save/generate paper");
  }

  // 6. Upgrade client to Standard Plan (Paid)
  console.log("\n[Test 6] Upgrade client to Standard Plan");
  const upgradeRes = await fetch("http://localhost:3000/api/auth/client/subscription", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader || "",
    },
    body: JSON.stringify({
      planId: "standard",
      email: signupData.client.email,
      fullName: signupData.client.fullName,
    }),
  });
  const upgradeCookie = upgradeRes.headers.get("set-cookie") || cookieHeader;
  const upgradeData = await upgradeRes.json();
  console.log("  Upgraded Plan:", upgradeData.client?.subscription?.planName, "Status:", upgradeData.client?.subscription?.status);

  // 7. Test GET /api/paper/questions with Paid Standard client (should succeed with 200)
  console.log("\n[Test 7] Paid Standard client GET /api/paper/questions (should be 200 OK)");
  const res7 = await fetch("http://localhost:3000/api/paper/questions?chapter=3", {
    headers: { Cookie: upgradeCookie || "" },
  });
  console.log("  Status:", res7.status, "=> EXPECTED: 200");
  const json7 = await res7.json();
  console.log("  Questions count:", json7.questions?.length);
  if (res7.status !== 200 || !json7.questions) {
    throw new Error("Test 7 failed: Paid subscriber should successfully load questions");
  }

  // 8. Test POST /api/papers with Paid Standard client (should succeed with 201)
  console.log("\n[Test 8] Paid Standard client POST /api/papers (should be 201 Created)");
  const res8 = await fetch("http://localhost:3000/api/papers", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: upgradeCookie || "",
    },
    body: JSON.stringify({
      title: "Paid Exam Paper",
      subject: "Computer Science",
      totalMarks: 75,
      mcqCount: 10,
      shortCount: 5,
      longCount: 2,
    }),
  });
  console.log("  Status:", res8.status, "=> EXPECTED: 201");
  const json8 = await res8.json();
  console.log("  Saved Paper ID:", json8.paper?.id, "Success:", json8.success);
  if (res8.status !== 201 || !json8.success) {
    throw new Error("Test 8 failed: Paid subscriber should successfully generate/save paper");
  }

  console.log("\n=== ALL HTTP INTEGRATION TESTS PASSED PERFECTLY! ===");
}

testHttpEndpoints().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
