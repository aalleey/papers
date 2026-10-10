import fs from "fs";

const ch1 = JSON.parse(fs.readFileSync("src/lib/data/computer10-ch1.json", "utf-8"));

// Point to the shared Computer Science subject ID
const COMP_SUBJECT_ID = "1def1b99-7726-55ec-8b98-17c3f3c85c6a";
ch1.subject.id = COMP_SUBJECT_ID;
ch1.chapter.subject_id = COMP_SUBJECT_ID;
ch1.chapter.title_ur = "آپریٹنگ سسٹمز: ساخت اور خدمات";

const urduTopics = {
  1: "آپریٹنگ سسٹم کا تعارف",
  2: "آپریٹنگ سسٹم کا ڈھانچہ اور آرکیٹیکچر",
  3: "پروسیس مینجمنٹ",
  4: "میموری مینجمنٹ",
  5: "فائل سسٹم مینجمنٹ",
  6: "ڈیوائس مینجمنٹ",
  7: "یوزر انٹرفیس (UI)",
  8: "سیکیورٹی اور تحفظ",
};

for (const t of ch1.topics) {
  t.title_ur = urduTopics[t.number] || t.title;
}

fs.writeFileSync("src/lib/data/computer10-ch1.json", JSON.stringify(ch1, null, 2));
console.log("Updated Chapter 01 metadata and authentic Urdu titles!");
