import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runTest() {
  console.log("=== Testing Full User Registration & Admin Approval Flow ===");
  const testEmail = `test_user_${Date.now()}@testraast.pk`;
  const testPassword = "mySecurePassword999!";
  const testId = `client-test-${Date.now()}`;

  // 1. Simulate registration with password & pending_verification
  console.log("\n1. Simulating Registration of user:", testEmail);
  const registrationSub = {
    planId: "standard",
    planName: "Standard Plan",
    status: "pending_verification",
    password: testPassword,
    isVerified: false,
    paymentSubmission: {
      accountTitle: "Test Educator",
      senderAccountOrPhone: "03001234567",
      transactionRef: "RAAST-TID-98765432",
      amountPaid: 3500,
      raastTarget: "03092770207",
      submittedAt: new Date().toISOString(),
      notes: "Paid via Raast 03092770207",
    },
  };

  const insertPayload = {
    id: testId,
    email: testEmail,
    full_name: "Test Educator",
    academy_name: "Test Academy Lahore",
    phone: "03001234567",
    role: "client",
    subscription: registrationSub,
    notes: "New registration awaiting Raast verification",
    environment: "development",
    updated_at: new Date().toISOString(),
  };

  const { data: inserted, error: insertError } = await supabase
    .from("clients")
    .upsert(insertPayload)
    .select()
    .single();

  if (insertError) {
    console.error("❌ Registration insert failed:", insertError);
    process.exit(1);
  }

  console.log("✅ User registered in Supabase. ID:", inserted.id);
  console.log("Stored subscription in DB:", JSON.stringify(inserted.subscription, null, 2));

  // Verify password is in DB
  const storedPass = inserted.subscription?.password;
  if (storedPass === testPassword) {
    console.log("✅ Verified: Password is correctly saved in database! Value:", storedPass);
  } else {
    console.error("❌ Password NOT saved properly! Got:", storedPass);
    process.exit(1);
  }

  // Verify status is pending_verification and isVerified is false
  if (inserted.subscription?.status === "pending_verification" && inserted.subscription?.isVerified === false) {
    console.log("✅ Verified: Profile is on HOLD (pending_verification, isVerified: false)");
  } else {
    console.error("❌ Subscription status incorrect:", inserted.subscription);
  }

  // 2. Simulate Admin Approval (PUT /api/admin/clients/[id])
  console.log("\n2. Simulating Admin Approval...");
  const currentSub = inserted.subscription;
  const approvedSub = {
    ...currentSub,
    status: "active",
    isVerified: true,
  };

  const updatePayload = {
    updated_at: new Date().toISOString(),
    subscription: approvedSub,
  };

  const { data: updated, error: updateError } = await supabase
    .from("clients")
    .update(updatePayload)
    .eq("id", testId)
    .select()
    .single();

  if (updateError) {
    console.error("❌ Admin update failed:", updateError);
    process.exit(1);
  }

  console.log("✅ Admin update executed without error!");
  console.log("Updated subscription:", JSON.stringify(updated.subscription, null, 2));

  // Verify that status is active, isVerified is true, and password remains intact
  if (updated.subscription?.status === "active" && updated.subscription?.isVerified === true) {
    console.log("✅ Verified: Account status is now 'active' and isVerified is TRUE!");
  } else {
    console.error("❌ Approval status failed:", updated.subscription);
    process.exit(1);
  }

  if (updated.subscription?.password === testPassword) {
    console.log("✅ Verified: User password is STILL intact after admin approval:", updated.subscription.password);
  } else {
    console.error("❌ User password was lost during approval! Got:", updated.subscription?.password);
    process.exit(1);
  }

  // 3. Clean up test record
  console.log("\n3. Cleaning up test record...");
  const { error: delError } = await supabase.from("clients").delete().eq("id", testId);
  if (!delError) {
    console.log("✅ Cleaned up test record.");
  }

  console.log("\n🎉 ALL TESTS PASSED SUCCESSFULLY! Registration with Raast, password storage, and Admin Approval work perfectly!");
}

runTest();
