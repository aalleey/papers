import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { action, text, imageBase64, mimeType, targetLang, apiKey: userKey } = await req.json();

    const apiKey = userKey || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "No Gemini API Key provided. Please provide an API key in the tool settings or configure GEMINI_API_KEY in your .env.local file.",
        },
        { status: 400 }
      );
    }

    const CANDIDATE_MODELS = [
      "gemini-2.5-flash",
      "gemini-2.0-flash",
      "gemini-1.5-flash",
      "gemini-flash-latest",
    ];

    const callGemini = async (bodyPayload: any) => {
      let lastError: Error | null = null;
      for (const model of CANDIDATE_MODELS) {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        try {
          const response = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-goog-api-key": apiKey,
            },
            body: JSON.stringify(bodyPayload),
          });

          const data = await response.json();
          if (response.ok && data?.candidates?.[0]?.content?.parts?.[0]?.text) {
            return data.candidates[0].content.parts[0].text;
          }

          const errMsg = data?.error?.message || `HTTP ${response.status}`;
          // If it's a 503 high demand or quota/rate-limit on this specific model, try the next model
          lastError = new Error(errMsg);
          console.warn(`Gemini model ${model} failed: ${errMsg}. Trying next model...`);
        } catch (e: any) {
          lastError = e;
          console.warn(`Gemini network error with model ${model}: ${e.message}`);
        }
      }
      throw lastError || new Error("All Gemini models failed to respond");
    };

    if (action === "ocr") {
      if (!imageBase64) {
        return NextResponse.json({ error: "Missing imageBase64" }, { status: 400 });
      }

      const prompt = `You are an expert OCR & exam digitizer for Pakistani and international school exam papers.
Extract all text from this test/exam paper image precisely.
- Retain all Urdu Nastaliq text and English text without typos.
- Retain question numbers, sections (MCQs, Short Questions, Long Questions), options (A, B, C, D), and marks.
- Convert any math formulas into clean LaTeX (e.g. $x^2 + 2x = 0$).
Return clean, structured plain text of the paper.`;

      const extractedText = await callGemini({
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: mimeType || "image/jpeg",
                  data: imageBase64.replace(/^data:[^;]+;base64,/, ""),
                },
              },
            ],
          },
        ],
      });

      return NextResponse.json({ result: extractedText });
    }

    if (action === "translate") {
      if (!text) {
        return NextResponse.json({ error: "Missing text to translate" }, { status: 400 });
      }

      const prompt = `You are a professional educational translator specializing in Pakistani academic exam papers (Punjab Board BISE, FBISE).
Translate the following exam paper content ${
        targetLang === "Urdu"
          ? "into academic Urdu (نستعلیق انداز). Keep mathematical formulas and question numbers intact."
          : targetLang === "Bilingual"
          ? "into a clean Bilingual format where every English question has its accurate Urdu translation directly alongside or beneath it."
          : "into clear, formal academic English."
      }

Original text:
${text}

Return ONLY the translated exam paper content.`;

      const translated = await callGemini({
        contents: [{ parts: [{ text: prompt }] }],
      });

      return NextResponse.json({ result: translated });
    }

    if (action === "format_exam") {
      if (!text) {
        return NextResponse.json({ error: "Missing text" }, { status: 400 });
      }

      const prompt = `You are an examination paper compiler. Organize the following raw paper text into structured JSON.
Fix any typos, standardize marks, ensure clean mathematical equations using KaTeX / LaTeX ($formula$), and separate sections clearly.

Raw paper text:
${text}

Format the response strictly as valid JSON matching this schema:
{
  "title": "EXAMINATION 2026-27",
  "subject": "Subject Name",
  "grade": "10th",
  "timeAllowed": "2:30 Hours",
  "totalMarks": 75,
  "instructions": "Attempt all sections carefully.",
  "sections": [
    {
      "id": "sec-1",
      "type": "mcq",
      "title": "SECTION A: MULTIPLE CHOICE QUESTIONS",
      "urduTitle": "حصہ اول: کثیر الانتخابی سوالات",
      "instructions": "Choose the correct option.",
      "urduInstructions": "درست جواب کا انتخاب کریں۔",
      "marks": 15,
      "questions": [
        {
          "number": 1,
          "questionEn": "English question text here",
          "questionUr": "اردو سوال کا متن یہاں",
          "options": [
            { "key": "A", "textEn": "Option A", "textUr": "آپشن اے" },
            { "key": "B", "textEn": "Option B", "textUr": "آپشن بی" },
            { "key": "C", "textEn": "Option C", "textUr": "آپشن سی" },
            { "key": "D", "textEn": "Option D", "textUr": "آپشن ڈی" }
          ],
          "correctKey": "A",
          "marks": 1
        }
      ]
    },
    {
      "id": "sec-2",
      "type": "short",
      "title": "SECTION B: SHORT QUESTIONS",
      "urduTitle": "حصہ دوم: مختصر سوالات",
      "instructions": "Answer any 5 questions.",
      "urduInstructions": "کوئی سے 5 سوالات کے جوابات تحریر کریں۔",
      "marks": 10,
      "questions": [
        {
          "number": 1,
          "questionEn": "Short question English",
          "questionUr": "مختصر سوال اردو",
          "marks": 2
        }
      ]
    },
    {
      "id": "sec-3",
      "type": "long",
      "title": "SECTION C: DETAILED QUESTIONS",
      "urduTitle": "حصہ سوم: تفصیلی سوالات",
      "instructions": "Answer in detail.",
      "urduInstructions": "تفصیلی جوابات تحریر کریں۔",
      "marks": 10,
      "questions": [
        {
          "number": 1,
          "questionEn": "Long question English",
          "questionUr": "تفصیلی سوال اردو",
          "marks": 5
        }
      ]
    }
  ]
}

Return ONLY raw JSON, without markdown backticks or commentary.`;

      const jsonText = await callGemini({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
        },
      });

      const cleanJson = (jsonText || "{}").replace(/^```json\s*/, "").replace(/\s*```$/, "");
      return NextResponse.json({ result: JSON.parse(cleanJson) });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Quick paper API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process request" },
      { status: 500 }
    );
  }
}
