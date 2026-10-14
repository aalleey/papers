const fs = require('fs');

// Simple test script
const sample = `Choose the correct option: Marks : 05
1. Choose the correct synonym for the word "Fragile" related to nature:
A) Strong
B) Delicate
C) Tough
D) Rigid

2. Fill in the blank with the correct form of verb: "If we ___ care of the earth, we will secure our future."
A) took
B) take
C) will take
D) Have taken

3. What does "biodiversity" mean in the context of the earth chapter?
A) Variety of life on earth
B) Study of rock layers
C) Weather patterns only
D) Pollution levels

4. Identify the correct spelling from the following options:
A) Enviroment
B) Environment
C) Envoronment
D) Inviorment

5. Which part of speech is the word "Global" in the phrase "global warming"?
A) Noun
B) Adjective
C) Verb
D) Adverb

Change the narration in the following sentences: Marks :10
1.The beggar said to the woman, "Please give me some food,"
2.The judge said to the guard, "Call the first witness."
3.The master said to his servant, "Bring me a glass of water."
4.The police officer said to the driver, "Show me your driving license."
5.The manager said to the clerk, "File these documents immediately."
6.The teacher said to the boys, "Stand up on the bench."
7. The father said to his son, "Do not waste your time in gossiping."
8.The mother said to her daughter, "Never tell a lie."
9.The doctor said to the patient, "Do not eat oily food."
10.The senior said to the junior, "Do not argue with me."

Q. 2: Write an essay on this "topic: Libraries"
Marks : 10`;

let code = fs.readFileSync('src/lib/quick-paper-parser.ts', 'utf8');
code = code.replace(/export interface[\s\S]*?^}/gm, '');
code = code.replace(/export type[\s\S]*?;/g, '');
code = code.replace(/export function/g, 'function');
code = code.replace(/:\s*string/g, '');
code = code.replace(/:\s*number/g, '');
code = code.replace(/:\s*boolean/g, '');
code = code.replace(/:\s*any/g, '');
code = code.replace(/:\s*ExamPaperData/g, '');
code = code.replace(/:\s*ExamSection\[\]/g, '');
code = code.replace(/:\s*ExamQuestion\[\]/g, '');
code = code.replace(/:\s*ExamSection\s*\|\s*null/g, '');
code = code.replace(/:\s*ExamQuestion\s*\|\s*null/g, '');
code = code.replace(/:\s*"Urdu"\s*\|\s*"English"\s*\|\s*"Bilingual"/g, '');
code = code.replace(/:\s*number\s*\|\s*undefined/g, '');
code += '\nmodule.exports = { parseRawTextToExam };';

fs.writeFileSync('scratch/compiled.cjs', code);

try {
  const { parseRawTextToExam } = require('./compiled.cjs');
  const res = parseRawTextToExam(sample);
  console.log('Language Detected:', res.detectedLanguage);
  console.log('Total Sections:', res.sections.length);
  for (const s of res.sections) {
    console.log(`\nSection: "${s.titleUr}" | Type: ${s.type} | Marks: ${s.marks} | Questions: ${s.questions.length}`);
    for (const q of s.questions) {
      console.log(`  (${q.number}) ${q.questionUr.slice(0, 50)}... [Options: ${q.options ? q.options.length : 'none'}]`);
    }
  }
} catch (e) {
  console.error(e);
}
