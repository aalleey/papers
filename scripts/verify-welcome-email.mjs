// scripts/verify-welcome-email.mjs
// Automated verification script for PaperWala welcome email workflow

const BASE_URL = "http://localhost:3000";

async function run() {
  console.log("=== STEP 1: Admin Login to acquire session cookie ===");
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "admin@papermaker.pk",
      password: "admin123",
    }),
  });

  if (!loginRes.ok) {
    throw new Error(`Admin login failed: ${loginRes.status} ${await loginRes.text()}`);
  }

  const cookies = loginRes.headers.get("set-cookie") || "";
  const authCookie = cookies.split(";")[0];
  console.log("✓ Admin logged in successfully. Cookie obtained.");

  console.log("\n=== STEP 2: Public Client Registration (triggers Welcome Email) ===");
  const testTimestamp = Date.now();
  const testClient = {
    email: `sir.tariq.${testTimestamp}@lahoreschool.edu.pk`,
    fullName: "Sir Tariq Mahmood",
    academyName: "Punjab Star Model College Lahore",
    phone: "03001234567",
    planId: "standard",
  };

  const signupRes = await fetch(`${BASE_URL}/api/auth/client/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(testClient),
  });

  const signupData = await signupRes.json();
  if (!signupRes.ok || !signupData.success) {
    throw new Error(`Public signup failed: ${JSON.stringify(signupData)}`);
  }
  console.log(`✓ Educator registered: ${signupData.client.fullName} (${signupData.client.email})`);

  console.log("\n=== STEP 3: Verify Email Outbox via GET /api/admin/emails ===");
  const outboxRes = await fetch(`${BASE_URL}/api/admin/emails`, {
    headers: { Cookie: authCookie },
  });

  if (!outboxRes.ok) {
    throw new Error(`Fetching outbox failed: ${outboxRes.status}`);
  }

  const outboxData = await outboxRes.json();
  const matchingEmail = outboxData.emails.find((e) => e.to === testClient.email);

  if (!matchingEmail) {
    throw new Error(`Welcome email was not found in the outbox for ${testClient.email}!`);
  }

  console.log(`✓ Welcome email detected in outbox!`);
  console.log(`  - Recipient: ${matchingEmail.recipientName} <${matchingEmail.to}>`);
  console.log(`  - Subject: ${matchingEmail.subject}`);
  console.log(`  - Status: ${matchingEmail.status}`);
  console.log(`  - Template: ${matchingEmail.template}`);
  console.log(`  - Preview Text: ${matchingEmail.previewText}`);

  console.log("\n=== STEP 4: Verify Live Rendered HTML via GET /api/admin/emails/preview ===");
  const previewRes = await fetch(`${BASE_URL}/api/admin/emails/preview?email=${encodeURIComponent(testClient.email)}`, {
    headers: { Cookie: authCookie },
  });

  if (!previewRes.ok) {
    throw new Error(`Preview route failed: ${previewRes.status}`);
  }

  const previewHtml = await previewRes.text();
  const checks = [
    { label: "Urdu Greeting (محترم اساتذہ کرام)", pass: previewHtml.includes("محترم اساتذہ کرام") },
    { label: "Educator Full Name", pass: previewHtml.includes(testClient.fullName) },
    { label: "Academy Name", pass: previewHtml.includes(testClient.academyName) },
    { label: "PaperWala Branding", pass: previewHtml.includes("PaperWala") && previewHtml.includes("پیپر والا") },
    { label: "Punjab Board scheme", pass: previewHtml.includes("Punjab Boards") },
    { label: "CTA links", pass: previewHtml.includes("/select-questions") },
  ];

  for (const check of checks) {
    if (!check.pass) {
      throw new Error(`Missing expected element in email HTML: ${check.label}`);
    }
    console.log(`  ✓ Checked ${check.label}`);
  }

  console.log("\n=== STEP 5: Verify Admin Manual Educator Creation Triggers Welcome Email ===");
  const manualClient = {
    email: `prof.kamran.${testTimestamp}@faisalabad.edu.pk`,
    fullName: "Prof. Kamran Akram",
    academyName: "Faisalabad Science Academy",
    phone: "03219876543",
    planId: "annual",
  };

  const manualCreateRes = await fetch(`${BASE_URL}/api/admin/clients`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: authCookie,
    },
    body: JSON.stringify(manualClient),
  });

  const manualData = await manualCreateRes.json();
  if (!manualCreateRes.ok || !manualData.success) {
    throw new Error(`Admin manual client creation failed: ${JSON.stringify(manualData)}`);
  }
  console.log(`✓ Admin manually registered educator: ${manualData.client.fullName}`);

  const outboxRes2 = await fetch(`${BASE_URL}/api/admin/emails`, {
    headers: { Cookie: authCookie },
  });
  const outboxData2 = await outboxRes2.json();
  const matchingManualEmail = outboxData2.emails.find((e) => e.to === manualClient.email);

  if (!matchingManualEmail) {
    throw new Error(`Welcome email was not generated for admin-created client: ${manualClient.email}`);
  }
  console.log(`✓ Welcome email detected for admin-created educator: ${matchingManualEmail.to} (Status: ${matchingManualEmail.status})`);

  console.log("\n=== STEP 6: Verify Admin Resend Functionality (POST /api/admin/emails) ===");
  const resendRes = await fetch(`${BASE_URL}/api/admin/emails`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: authCookie,
    },
    body: JSON.stringify({ clientId: signupData.client.id }),
  });

  const resendData = await resendRes.json();
  if (!resendRes.ok || !resendData.success) {
    throw new Error(`Resend email failed: ${JSON.stringify(resendData)}`);
  }
  console.log(`✓ Resend email response: ${resendData.message}`);

  console.log("\n========================================================");
  console.log("🎉 ALL WELCOME EMAIL WORKFLOW TESTS PASSED SUCCESSFULLY!");
  console.log("========================================================");
}

run().catch((err) => {
  console.error("❌ Verification failed:", err);
  process.exit(1);
});
