import { NextResponse } from "next/server";

export async function GET() {
  const headers = [
    "chapter_number",
    "topic_number",
    "type",
    "source",
    "source_ref",
    "concept_tag",
    "text_en",
    "option_a",
    "option_b",
    "option_c",
    "option_d",
    "text_ur",
    "correct_option",
    "answer_en",
    "marks",
    "difficulty",
  ].join(",");

  const sampleRows = [
    '1,1,mcq,exercise,Ex 1.1 Q1,standard_form,"The standard form of quadratic equation is $ax^2 + bx + c = 0$ where:","$a = 0$","$a \\neq 0$","$b = 0$","$c = 0$","دو درجی مساوات کی معیاری شکل میں شرط ہے:",2,"Option B",1,easy',
    '1,2,short,exercise,Ex 1.1 Q2,factorization,"Solve by factorization: $x^2 - x - 20 = 0$",,,,,"تجزی کے ذریعے حل کریں: $x^2 - x - 20 = 0$",,"Factors are $(x-5)(x+4)=0 \\implies x=5, -4$",2,easy',
    '1,3,long,past_paper,LHR 2023,quadratic_formula,"Solve using quadratic formula: $2x^2 + 5x - 3 = 0$",,,,,"دو درجی فارمولا کی مدد سے حل کریں: $2x^2 + 5x - 3 = 0$",,"$x = \\frac{-5 \\pm \\sqrt{25 + 24}}{4} = \\frac{-5 \\pm 7}{4} \\implies x = \\frac{1}{2}, -3$",5,medium',
    '2,1,mcq,exercise,Ex 2.1 Q1,discriminant,"Discriminant of $ax^2 + bx + c = 0$ is:","$b^2 + 4ac$","$b^2 - 4ac$","$-b^2 - 4ac$","$\\sqrt{b^2 - 4ac}$","دو درجی مساوات کا فرق کنندہ ہوتا ہے:",2,"Option B",1,easy',
  ].join("\n");

  const csvContent = `${headers}\n${sampleRows}\n`;

  return new NextResponse(csvContent, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="paper_maker_questions_template.csv"',
    },
  });
}
