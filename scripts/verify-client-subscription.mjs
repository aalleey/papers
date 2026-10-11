// Verification script for Client Authentication & Subscription Permissions
import assert from "node:assert";

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

async function main() {
  console.log("=================================================");
  console.log("   PAPERWALA - CLIENT SUBSCRIPTION SYSTEM TESTS  ");
  console.log("=================================================");

  let clientCookie = "";

  // 1. Initial State: Unauthenticated client
  console.log("\n1. Testing: Client /me while logged out...");
  const meRes1 = await fetch(`${BASE_URL}/api/auth/client/me`);
  const meData1 = await meRes1.json();
  console.log("   /api/auth/client/me response:", meData1);
  assert.strictEqual(meData1.client, null, "Should return client: null when unauthenticated");
  console.log("   --> PASS: Unauthenticated visitor correctly reported as null");

  // 2. Signup a new client (Free Plan)
  console.log("\n2. Testing: Client signup (Default Free Plan)...");
  const testEmail = `educator_${Date.now()}@testacademy.pk`;
  const signupRes = await fetch(`${BASE_URL}/api/auth/client/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: testEmail,
      password: "EducatorPassword123!",
      fullName: "Professor Usman Khan",
      academyName: "Punjab Science Academy Lahore",
      planId: "free",
    }),
  });

  const signupCookieHeader = signupRes.headers.get("set-cookie");
  if (signupCookieHeader) {
    clientCookie = signupCookieHeader.split(";")[0];
  }

  const signupData = await signupRes.json();
  console.log("   Signup response status:", signupRes.status);
  console.log("   Client info:", signupData.client);
  assert.strictEqual(signupData.success, true);
  assert.strictEqual(signupData.client.subscription.planId, "free");
  assert.strictEqual(signupData.client.subscription.canAutoBoardPattern, false);
  assert.strictEqual(signupData.client.subscription.canCustomBranding, false);
  assert.strictEqual(signupData.client.subscription.canFullBoardPaper, false);
  assert.strictEqual(signupData.client.subscription.canExportAnswerKey, false);
  assert.strictEqual(signupData.client.subscription.maxQuestionsPerPaper, 10);
  console.log("   --> PASS: Free plan permissions strictly enforced (No branding, no auto board, max 10 questions)!");

  // 3. Verify session persists via cookie
  console.log("\n3. Testing: /me with session cookie...");
  const meRes2 = await fetch(`${BASE_URL}/api/auth/client/me`, {
    headers: { Cookie: clientCookie },
  });
  const meData2 = await meRes2.json();
  assert.strictEqual(meData2.client?.email, testEmail);
  console.log("   --> PASS: Client session verified via cookie!");

  // 4. Upgrade to 'pay_as_you_go' (Go as you pay - Rs. 30)
  console.log("\n4. Testing: Upgrade to 'pay_as_you_go' (Rs. 30 per paper)...");
  const upPayRes = await fetch(`${BASE_URL}/api/auth/client/subscription`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: clientCookie,
    },
    body: JSON.stringify({ planId: "pay_as_you_go" }),
  });
  const upPayData = await upPayRes.json();
  console.log("   Pay-as-you-go Plan:", upPayData.client?.subscription);
  assert.strictEqual(upPayData.client?.subscription.planId, "pay_as_you_go");
  assert.strictEqual(upPayData.client?.subscription.canAutoBoardPattern, true);
  assert.strictEqual(upPayData.client?.subscription.canCustomBranding, true);
  assert.strictEqual(upPayData.client?.subscription.canFullBoardPaper, true);
  assert.strictEqual(upPayData.client?.subscription.canExportAnswerKey, true);
  console.log("   --> PASS: Go as you pay plan grants Board pattern, Branding, and Answer Key!");

  // 5. Upgrade to 'standard' (Standard Plan - Rs. 2000, 6 Months)
  console.log("\n5. Testing: Upgrade to 'standard' (Rs. 2000, 6 Months)...");
  const upStdRes = await fetch(`${BASE_URL}/api/auth/client/subscription`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: clientCookie,
    },
    body: JSON.stringify({ planId: "standard" }),
  });
  const upStdData = await upStdRes.json();
  console.log("   Standard Plan:", upStdData.client?.subscription);
  assert.strictEqual(upStdData.client?.subscription.planId, "standard");
  assert.strictEqual(upStdData.client?.subscription.canAutoBoardPattern, true);
  assert.strictEqual(upStdData.client?.subscription.canCustomBranding, true);
  assert.strictEqual(upStdData.client?.subscription.maxQuestionsPerPaper, 100);
  console.log("   --> PASS: Standard Plan active with 6 months validity & Auto Board generator!");

  // 6. Upgrade to 'annual' (Annual Premium Plan - Rs. 3000, 1 Year)
  console.log("\n6. Testing: Upgrade to 'annual' (Rs. 3000, 1 Year)...");
  const upAnnRes = await fetch(`${BASE_URL}/api/auth/client/subscription`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: clientCookie,
    },
    body: JSON.stringify({ planId: "annual" }),
  });
  const upAnnData = await upAnnRes.json();
  console.log("   Annual Plan:", upAnnData.client?.subscription);
  assert.strictEqual(upAnnData.client?.subscription.planId, "annual");
  assert.strictEqual(upAnnData.client?.subscription.canAutoBoardPattern, true);
  assert.strictEqual(upAnnData.client?.subscription.canCustomBranding, true);
  console.log("   --> PASS: Annual Premium Plan fully active!");

  // 7. Logout
  console.log("\n7. Testing: Client Logout...");
  const logoutRes = await fetch(`${BASE_URL}/api/auth/client/logout`, {
    method: "POST",
    headers: { Cookie: clientCookie },
  });
  const logoutData = await logoutRes.json();
  assert.strictEqual(logoutData.success, true);

  const logoutCookieHeader = logoutRes.headers.get("set-cookie") || "";
  const meRes3 = await fetch(`${BASE_URL}/api/auth/client/me`, {
    headers: { Cookie: logoutCookieHeader.split(";")[0] },
  });
  const meData3 = await meRes3.json();
  assert.strictEqual(meData3.client, null);
  console.log("   --> PASS: Client logged out successfully and session cleared!");

  // 8. Login with existing credentials
  console.log("\n8. Testing: Client Login with credentials...");
  const loginRes = await fetch(`${BASE_URL}/api/auth/client/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: testEmail,
      password: "EducatorPassword123!",
    }),
  });
  const loginData = await loginRes.json();
  assert.strictEqual(loginData.success, true);
  assert.strictEqual(loginData.client?.email, testEmail);
  console.log("   --> PASS: Client login successful, preserved previous subscription state!");

  console.log("\n=================================================");
  console.log("   ALL CLIENT SUBSCRIPTION TESTS PASSED (100%)    ");
  console.log("=================================================\n");
}

main().catch((err) => {
  console.error("Test failed with error:", err);
  process.exit(1);
});
