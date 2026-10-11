import assert from "node:assert";

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

async function main() {
  console.log("=========================================================");
  console.log("   PAPERWALA - ADMIN USER & SUBSCRIPTION CONTROL TESTS   ");
  console.log("=========================================================");

  let adminCookie = "";

  // 1. Verify unauthenticated request to /api/admin/clients is blocked (401)
  console.log("\n1. Testing: Unauthorized visitor to /api/admin/clients...");
  const unauthRes = await fetch(`${BASE_URL}/api/admin/clients`);
  assert.strictEqual(unauthRes.status, 401, "Expected 401 Unauthorized for visitor");
  console.log("   --> PASS: Unauthenticated visitor blocked with 401 Unauthorized!");

  // 2. Admin Login
  console.log("\n2. Testing: Admin login...");
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "admin@papermaker.pk",
      password: "admin123",
    }),
  });
  assert.strictEqual(loginRes.status, 200, "Admin login failed");
  const loginData = await loginRes.json();
  assert.strictEqual(loginData.user?.role, "admin");
  const cookieHeader = loginRes.headers.get("set-cookie");
  assert.ok(cookieHeader, "Missing admin session cookie");
  adminCookie = cookieHeader.split(";")[0];
  console.log("   --> PASS: Admin login successful, session cookie obtained!");

  // 3. Admin retrieves registered clients list and stats
  console.log("\n3. Testing: GET /api/admin/clients with admin cookie...");
  const listRes = await fetch(`${BASE_URL}/api/admin/clients`, {
    headers: { Cookie: adminCookie },
  });
  assert.strictEqual(listRes.status, 200);
  const listData = await listRes.json();
  assert.ok(Array.isArray(listData.clients), "Clients should be an array");
  assert.ok(listData.stats, "Stats should exist");
  console.log(`   Found ${listData.clients.length} registered clients.`);
  console.log("   Stats overview:", listData.stats);
  assert.ok(listData.clients.length >= 5, "Expected seeded clients to be present");
  console.log("   --> PASS: Admin retrieved clients list and live stats!");

  // 4. Admin registers a new educator
  console.log("\n4. Testing: POST /api/admin/clients to register new educator...");
  const testEmail = `teacher_${Date.now()}@lahoreschool.pk`;
  const createRes = await fetch(`${BASE_URL}/api/admin/clients`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: adminCookie,
    },
    body: JSON.stringify({
      fullName: "Professor Tariq Jamil",
      email: testEmail,
      phone: "0300-8877665",
      academyName: "Lahore Science & Arts Academy",
      planId: "standard",
      notes: "Registered via admin interview",
    }),
  });
  assert.strictEqual(createRes.status, 201, "Expected 201 Created");
  const createData = await createRes.json();
  assert.strictEqual(createData.success, true);
  const newClient = createData.client;
  assert.strictEqual(newClient.fullName, "Professor Tariq Jamil");
  assert.strictEqual(newClient.email, testEmail);
  assert.strictEqual(newClient.phone, "0300-8877665");
  assert.strictEqual(newClient.subscription.planId, "standard");
  console.log(`   --> PASS: New educator created with ID: ${newClient.id}`);

  // 5. Admin updates educator profile, phone, plan and custom permissions
  console.log("\n5. Testing: PUT /api/admin/clients/[id] to update profile, plan and permissions...");
  const updatedEmail = `prof.tariq.updated_${Date.now()}@lahoreschool.pk`;
  const futureExpiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
  const updateRes = await fetch(`${BASE_URL}/api/admin/clients/${newClient.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Cookie: adminCookie,
    },
    body: JSON.stringify({
      fullName: "Professor Tariq Jamil (Principal)",
      email: updatedEmail,
      phone: "0321-9988776",
      academyName: "Lahore Premier Model College",
      notes: "Promoted to Annual plan with custom 200 questions limit",
      planId: "annual",
      status: "active",
      expiresAt: futureExpiry,
      permissions: {
        canAutoBoardPattern: true,
        canCustomBranding: true,
        canExportAnswerKey: true,
        canFullBoardPaper: true,
        canUnlimitedExport: true,
        canAccessAllClasses: true,
        maxQuestionsPerPaper: 200,
      },
    }),
  });
  assert.strictEqual(updateRes.status, 200, "Update failed");
  const updateData = await updateRes.json();
  assert.strictEqual(updateData.success, true);
  const updatedClient = updateData.client;

  assert.strictEqual(updatedClient.fullName, "Professor Tariq Jamil (Principal)");
  assert.strictEqual(updatedClient.email, updatedEmail);
  assert.strictEqual(updatedClient.phone, "0321-9988776");
  assert.strictEqual(updatedClient.academyName, "Lahore Premier Model College");
  assert.strictEqual(updatedClient.subscription.planId, "annual");
  assert.strictEqual(updatedClient.subscription.maxQuestionsPerPaper, 200);
  assert.strictEqual(updatedClient.subscription.canAutoBoardPattern, true);
  assert.strictEqual(updatedClient.subscription.canCustomBranding, true);
  assert.strictEqual(updatedClient.subscription.canExportAnswerKey, true);
  assert.strictEqual(updatedClient.subscription.canFullBoardPaper, true);
  console.log("   --> PASS: Profile (Email, Phone, Academy), Plan (Annual), and Permissions updated successfully!");

  // 6. Admin suspends account
  console.log("\n6. Testing: Suspend educator account...");
  const suspendRes = await fetch(`${BASE_URL}/api/admin/clients/${newClient.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Cookie: adminCookie,
    },
    body: JSON.stringify({
      status: "suspended",
    }),
  });
  assert.strictEqual(suspendRes.status, 200);
  const suspendData = await suspendRes.json();
  assert.strictEqual(suspendData.client.subscription.status, "suspended");
  console.log("   --> PASS: Account successfully set to 'suspended'!");

  // 7. Admin deletes client account
  console.log("\n7. Testing: DELETE /api/admin/clients/[id]...");
  const deleteRes = await fetch(`${BASE_URL}/api/admin/clients/${newClient.id}`, {
    method: "DELETE",
    headers: { Cookie: adminCookie },
  });
  assert.strictEqual(deleteRes.status, 200);
  const deleteData = await deleteRes.json();
  assert.strictEqual(deleteData.success, true);
  console.log("   --> PASS: Educator account successfully deleted!");

  // 8. Verify client no longer exists
  console.log("\n8. Testing: Verify client removed...");
  const verifyRes = await fetch(`${BASE_URL}/api/admin/clients/${newClient.id}`, {
    headers: { Cookie: adminCookie },
  });
  assert.strictEqual(verifyRes.status, 404, "Expected 404 after deletion");
  console.log("   --> PASS: Verified account is deleted (404 Not Found)!");

  console.log("\n=========================================================");
  console.log("   ALL ADMIN CLIENT MANAGEMENT TESTS PASSED (100%)       ");
  console.log("=========================================================\n");
}

main().catch((err) => {
  console.error("Test failed with error:", err);
  process.exit(1);
});
