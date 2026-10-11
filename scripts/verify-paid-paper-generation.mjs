// scripts/verify-paid-paper-generation.mjs
import { db } from "../src/lib/db.js";
import { getPlanPermissions, isPaidSubscriber } from "../src/lib/types.js";

async function runVerification() {
  console.log("=== VERIFYING PAID SUBSCRIPTION GATING FOR PAPER GENERATION ===");

  // 1. Check helper function logic
  const freePlanSub = getPlanPermissions("free");
  const freeClient = {
    id: "test-free-client",
    email: "free@example.com",
    fullName: "Free Teacher",
    role: "client",
    subscription: freePlanSub,
    createdAt: new Date().toISOString(),
  };

  const paygZeroCredits = {
    id: "test-payg-zero",
    email: "payg-zero@example.com",
    fullName: "PAYG Zero",
    role: "client",
    subscription: {
      ...getPlanPermissions("pay_as_you_go"),
      paperCredits: 0,
    },
    createdAt: new Date().toISOString(),
  };

  const paygWithCredits = {
    id: "test-payg-active",
    email: "payg-active@example.com",
    fullName: "PAYG Active",
    role: "client",
    subscription: {
      ...getPlanPermissions("pay_as_you_go"),
      paperCredits: 3,
    },
    createdAt: new Date().toISOString(),
  };

  const standardClient = {
    id: "test-standard",
    email: "standard@example.com",
    fullName: "Standard Teacher",
    role: "client",
    subscription: getPlanPermissions("standard"),
    createdAt: new Date().toISOString(),
  };

  const annualClient = {
    id: "test-annual",
    email: "annual@example.com",
    fullName: "Annual Principal",
    role: "client",
    subscription: getPlanPermissions("annual"),
    createdAt: new Date().toISOString(),
  };

  const adminUser = {
    id: "admin-id",
    role: "admin",
    email: "admin@paperwala.pk",
  };

  console.log("\n[Test 1] isPaidSubscriber verification:");
  console.log("  - Unauthenticated (null):", isPaidSubscriber(null), "=> EXPECTED: false");
  console.log("  - Free Plan client:", isPaidSubscriber(freeClient), "=> EXPECTED: false");
  console.log("  - PAYG client with 0 credits:", isPaidSubscriber(paygZeroCredits), "=> EXPECTED: false");
  console.log("  - PAYG client with 3 credits:", isPaidSubscriber(paygWithCredits), "=> EXPECTED: true");
  console.log("  - Standard Plan client:", isPaidSubscriber(standardClient), "=> EXPECTED: true");
  console.log("  - Annual Plan client:", isPaidSubscriber(annualClient), "=> EXPECTED: true");
  console.log("  - Admin user:", isPaidSubscriber(null, adminUser), "=> EXPECTED: true");

  if (
    isPaidSubscriber(null) !== false ||
    isPaidSubscriber(freeClient) !== false ||
    isPaidSubscriber(paygZeroCredits) !== false ||
    isPaidSubscriber(paygWithCredits) !== true ||
    isPaidSubscriber(standardClient) !== true ||
    isPaidSubscriber(annualClient) !== true ||
    isPaidSubscriber(null, adminUser) !== true
  ) {
    throw new Error("isPaidSubscriber assertions failed!");
  }
  console.log("✓ All isPaidSubscriber permission checks PASSED!");

  // 2. Check Free Plan permissions: paperCredits === 0, maxQuestions === 0
  console.log("\n[Test 2] Free Plan permission values:");
  console.log("  - paperCredits:", freePlanSub.paperCredits, "=> EXPECTED: 0");
  console.log("  - maxQuestionsPerPaper:", freePlanSub.maxQuestionsPerPaper, "=> EXPECTED: 0");
  console.log("  - canFullBoardPaper:", freePlanSub.canFullBoardPaper, "=> EXPECTED: false");

  if (freePlanSub.paperCredits !== 0 || freePlanSub.maxQuestionsPerPaper !== 0) {
    throw new Error("Free plan permissions are not zeroed!");
  }
  console.log("✓ Free plan restrictions PASSED!");

  console.log("\n=== ALL UNIT CHECKS PASSED ===");
}

runVerification().catch((e) => {
  console.error("FATAL:", e);
  process.exit(1);
});
