import fs from "fs";

const ch2 = JSON.parse(fs.readFileSync("src/lib/data/computer10-ch2.json", "utf-8"));

const COMP_SUBJECT_ID = "1def1b99-7726-55ec-8b98-17c3f3c85c6a";
ch2.subject.id = COMP_SUBJECT_ID;
ch2.chapter.subject_id = COMP_SUBJECT_ID;
ch2.chapter.title_ur = "سسٹم ریکوری اور ایڈوانسڈ مینٹیننس";

const urduTopics = {
  1: "پوسٹ ٹربل شوٹنگ کا تعارف",
  2: "بلٹ ان تشخیصی ٹولز کا استعمال",
  3: "سسٹم ریکوری کے اختیارات",
  4: "BIOS/UEFI اور بوٹ پروسیس کی آگاہی",
  5: "ڈیٹا ریکوری کی تکنیکیں",
  6: "حفاظتی دیکھ بھال کے بہترین طریقے",
  7: "سسٹم ڈاکومنٹیشن اور لاگز",
};

for (const t of ch2.topics) {
  t.title_ur = urduTopics[t.number] || t.title;
}

fs.writeFileSync("src/lib/data/computer10-ch2.json", JSON.stringify(ch2, null, 2));
console.log("Updated Chapter 02 metadata and authentic Urdu titles!");
