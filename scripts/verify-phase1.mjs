import assert from "assert";

const BASE_URL = "http://localhost:3000";

async function runTests() {
  console.log("=================================================");
  console.log("   PAPER MAKER - PHASE 1 VERIFICATION TESTS      ");
  console.log("=================================================\n");

  let adminCookie = "";

  // 1. TEST: Logged-out visitor cannot read questions
  console.log("1. Testing: Logged-out visitor cannot read questions...");
  {
    const res = await fetch(`${BASE_URL}/api/questions`);
    const status = res.status;
    const body = await res.json();

    console.log(`   Response status: ${status}`);
    console.log(`   Response body:`, body);

    assert.strictEqual(status, 401, "Expected status 401 Unauthorized for logged-out visitor");
    assert.ok(body.error && body.error.includes("Unauthorized"), "Expected unauthorized error message");
    console.log("   --> PASS: Logged-out visitor is blocked with 401 Unauthorized!\n");
  }

  // 2. TEST: Admin login works
  console.log("2. Testing: Admin login...");
  {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@papermaker.pk",
        password: "admin123",
      }),
    });

    const status = res.status;
    const body = await res.json();
    const setCookie = res.headers.get("set-cookie");

    console.log(`   Login status: ${status}`);
    console.log(`   Login body:`, body);
    assert.strictEqual(status, 200, "Expected status 200 on admin login");
    assert.ok(body.success, "Expected login success: true");
    assert.strictEqual(body.user?.role, "admin", "Expected user role to be admin");
    assert.ok(setCookie, "Expected set-cookie header on successful login");

    adminCookie = setCookie.split(";")[0];
    console.log(`   --> PASS: Admin login successful, session cookie obtained!\n`);
  }

  // Fetch initial chapter to link questions
  let chapterId = "";
  {
    const res = await fetch(`${BASE_URL}/api/chapters`);
    const body = await res.json();
    assert.ok(body.chapters && body.chapters.length > 0, "Expected seeded chapters to exist");
    chapterId = body.chapters[0].id;
    console.log(`   Using Chapter ID: ${chapterId} (${body.chapters[0].title})`);
  }

  // 3. TEST: Add one question of each type and edit it
  console.log("3. Testing: Add MCQ, Short, Long questions, and edit...");
  let mcqId = "";
  let shortId = "";
  let longId = "";

  // 3a. Add MCQ
  {
    const mcqRes = await fetch(`${BASE_URL}/api/questions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: adminCookie,
      },
      body: JSON.stringify({
        chapter_id: chapterId,
        type: "mcq",
        source: "exercise",
        source_ref: "Test Ex 1",
        concept_tag: "quadratic_formula",
        marks: 1,
        difficulty: "easy",
        correct_option: 2,
        text_en: "Which equation has roots of the form $x^2 + \\frac{1}{2} = 0$?",
        options_en: ["$x = 0$", "$x = \\pm \\frac{i}{\\sqrt{2}}$", "$x = 1$", "$x = -1$"],
        text_ur: "کس مساوات کا حل $x^2 + \\frac{1}{2} = 0$ ہے؟",
      }),
    });
    const mcqData = await mcqRes.json();
    assert.strictEqual(mcqRes.status, 200, "Expected 200 creating MCQ");
    assert.ok(mcqData.question?.id, "Expected question ID");
    mcqId = mcqData.question.id;
    console.log(`   - Created MCQ Question: ${mcqId}`);
  }

  // 3b. Add Short Question
  {
    const shortRes = await fetch(`${BASE_URL}/api/questions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: adminCookie,
      },
      body: JSON.stringify({
        chapter_id: chapterId,
        type: "short",
        source: "exercise",
        source_ref: "Test Short 1",
        concept_tag: "factorization",
        marks: 2,
        difficulty: "medium",
        text_en: "Solve the equation: $x^2 + \\frac{1}{2} = 1$.",
        answer_en: "$x^2 = \\frac{1}{2} \\implies x = \\pm \\frac{1}{\\sqrt{2}}$.",
        text_ur: "مساوات حل کیجیے: $x^2 + \\frac{1}{2} = 1$",
      }),
    });
    const shortData = await shortRes.json();
    assert.strictEqual(shortRes.status, 200, "Expected 200 creating Short question");
    assert.ok(shortData.question?.id, "Expected question ID");
    shortId = shortData.question.id;
    console.log(`   - Created Short Question: ${shortId}`);
  }

  // 3c. Add Long Question
  {
    const longRes = await fetch(`${BASE_URL}/api/questions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: adminCookie,
      },
      body: JSON.stringify({
        chapter_id: chapterId,
        type: "long",
        source: "past_paper",
        source_ref: "LHR 2024",
        concept_tag: "componendo_dividendo",
        marks: 5,
        difficulty: "hard",
        text_en: "Prove that if $\\frac{a}{b} = \\frac{c}{d}$, then $\\frac{a+b}{a-b} = \\frac{c+d}{c-d}$.",
        answer_en: "Apply the componendo-dividendo theorem directly.",
        text_ur: "ثابت کیجیے کہ اگر $\\frac{a}{b} = \\frac{c}{d}$ ہو تو...",
      }),
    });
    const longData = await longRes.json();
    assert.strictEqual(longRes.status, 200, "Expected 200 creating Long question");
    assert.ok(longData.question?.id, "Expected question ID");
    longId = longData.question.id;
    console.log(`   - Created Long Question: ${longId}`);
  }

  // 3d. Edit Question
  {
    const editRes = await fetch(`${BASE_URL}/api/questions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: adminCookie,
      },
      body: JSON.stringify({
        id: shortId,
        chapter_id: chapterId,
        type: "short",
        source: "exercise",
        source_ref: "Test Short 1 (Edited)",
        concept_tag: "factorization_edited",
        marks: 3,
        difficulty: "hard",
        text_en: "Solve the equation: $x^2 + \\frac{1}{2} = 1$ and verify your answer.",
        answer_en: "$x^2 = \\frac{1}{2} \\implies x = \\pm \\frac{1}{\\sqrt{2}}$. Verification holds.",
        text_ur: "مساوات حل کیجیے: $x^2 + \\frac{1}{2} = 1$ اور تصدیق کیجیے۔",
      }),
    });
    const editData = await editRes.json();
    assert.strictEqual(editRes.status, 200, "Expected 200 updating question");
    assert.strictEqual(editData.question?.marks, 3, "Expected updated marks to be 3");
    assert.strictEqual(editData.question?.difficulty, "hard", "Expected updated difficulty to be hard");
    console.log(`   - Edited Question ${shortId} successfully! (Marks updated to 3)`);
    console.log("   --> PASS: Successfully created MCQ, Short, Long and edited question!\n");
  }

  // 4. TEST: 20-row CSV Import with 1 bad row flagged
  console.log("4. Testing: 20-row CSV import with 1 bad row flagged...");
  {
    // Load subjects to get a valid subjectId (Mathematics has chapters 1-7)
    const subRes = await fetch(`${BASE_URL}/api/subjects`);
    const subData = await subRes.json();
    const mathSubject = subData.subjects.find((s) => s.name === "Mathematics") || subData.subjects[0];
    const subjectId = mathSubject.id;
    console.log(`   Importing into Subject: ${mathSubject.name} (${subjectId})`);

    // Build 20 rows: 19 valid rows + 1 invalid row (Row 10 has invalid difficulty 'impossible')
    const batchSuffix = Date.now();
    const rows = [];
    for (let i = 1; i <= 20; i++) {
      if (i === 10) {
        // Bad row! (invalid difficulty: 'super_hard_invalid')
        rows.push({
          chapter_number: 1,
          topic_number: 1,
          type: "mcq",
          source: "exercise",
          source_ref: `Test Row ${i}`,
          concept_tag: "bad_row",
          text_en: `Question row ${i} (${batchSuffix}) with math $x^${i} + 1 = 0$`,
          option_a: "A",
          option_b: "B",
          option_c: "C",
          option_d: "D",
          text_ur: `سوال نمبر ${i}`,
          correct_option: 1,
          marks: 1,
          difficulty: "super_hard_invalid", // INVALID!
        });
      } else {
        // Valid row
        rows.push({
          chapter_number: 1,
          topic_number: 1,
          type: i % 2 === 0 ? "mcq" : "short",
          source: "exercise",
          source_ref: `Test Row ${i}`,
          concept_tag: `concept_${i}`,
          text_en: `Imported Question #${i} (${batchSuffix}): Calculate $x^2 + \\frac{${i}}{2} = 0$.`,
          option_a: "$1$",
          option_b: "$2$",
          option_c: "$3$",
          option_d: "$4$",
          text_ur: `درج ذیل مساوات حل کیجیے: $x^2 + \\frac{${i}}{2} = 0$`,
          correct_option: 2,
          answer_en: `Solution for row ${i}`,
          marks: i % 2 === 0 ? 1 : 2,
          difficulty: i % 3 === 0 ? "hard" : i % 2 === 0 ? "medium" : "easy",
        });
      }
    }

    // Call preview
    const previewRes = await fetch(`${BASE_URL}/api/import`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: adminCookie,
      },
      body: JSON.stringify({
        subjectId,
        rows,
        action: "preview",
      }),
    });

    const previewData = await previewRes.json();
    console.log(`   Preview total rows: ${previewData.totalRows}`);
    console.log(`   Preview valid count: ${previewData.validCount}`);
    console.log(`   Preview invalid count: ${previewData.invalidCount}`);
    console.log(`   Row 1 errors:`, previewData.validationResults?.[0]?.errors);

    assert.strictEqual(previewData.totalRows, 20, "Expected 20 total rows");
    assert.strictEqual(previewData.validCount, 19, "Expected exactly 19 valid rows");
    assert.strictEqual(previewData.invalidCount, 1, "Expected exactly 1 bad row flagged");

    // Check row 10 errors
    const badRow = previewData.validationResults.find((r) => r.rowNumber === 10);
    assert.ok(badRow, "Expected row 10 to be in results");
    assert.strictEqual(badRow.isValid, false, "Expected row 10 to be invalid");
    console.log(`   Flagged bad row #10 error:`, badRow.errors);

    // Call commit
    const commitRes = await fetch(`${BASE_URL}/api/import`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: adminCookie,
      },
      body: JSON.stringify({
        subjectId,
        rows,
        action: "commit",
      }),
    });

    const commitData = await commitRes.json();
    console.log(`   Commit imported count: ${commitData.importedCount}`);
    assert.strictEqual(commitData.importedCount, 19, "Expected 19 questions successfully imported");
    console.log("   --> PASS: 20-row CSV preview and commit succeeded with 1 bad row flagged!\n");
  }

  console.log("=================================================");
  console.log("   ALL AUTOMATED VERIFICATION CHECKS PASSED!     ");
  console.log("=================================================");
}

runTests().catch((err) => {
  console.error("Test failed with error:", err);
  process.exit(1);
});
