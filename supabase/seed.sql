-- ==============================================================================
-- Supabase Seed Data (Phase 1)
-- - Punjab Board, classes 9-12 (and 5-8)
-- - Course: Class 10 (Old)
-- - Subject: Mathematics with 7 chapters and topics
-- - 30 sample questions with source_note = 'SAMPLE - delete before launch'
--   (mixed mcq/short/long, easy/medium/hard, LaTeX, Urdu translations)
-- ==============================================================================

-- 1. Boards
insert into public.boards (id, name, name_ur) values
  ('b1000000-0000-0000-0000-000000000001', 'Punjab Board', 'پنجاب بورڈ'),
  ('b1000000-0000-0000-0000-000000000002', 'Federal Board', 'فیڈرل بورڈ'),
  ('b1000000-0000-0000-0000-000000000003', 'KPK Board', 'خیبر پختونخوا بورڈ'),
  ('b1000000-0000-0000-0000-000000000004', 'Sindh Board', 'سندھ بورڈ')
on conflict (id) do update set name = excluded.name, name_ur = excluded.name_ur;

-- 2. Classes (5 to 12)
insert into public.classes (id, name, numeric_order) values
  ('c0500000-0000-0000-0000-000000000005', 'Class 5', 5),
  ('c0600000-0000-0000-0000-000000000006', 'Class 6', 6),
  ('c0700000-0000-0000-0000-000000000007', 'Class 7', 7),
  ('c0800000-0000-0000-0000-000000000008', 'Class 8', 8),
  ('c0900000-0000-0000-0000-000000000009', 'Class 9', 9),
  ('c1000000-0000-0000-0000-000000000010', 'Class 10', 10),
  ('c1100000-0000-0000-0000-000000000011', 'Class 11', 11),
  ('c1200000-0000-0000-0000-000000000012', 'Class 12', 12)
on conflict (id) do update set name = excluded.name, numeric_order = excluded.numeric_order;

-- 3. Courses
insert into public.courses (id, board_id, class_id, name, is_active) values
  ('cr100000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000010', 'Class 10 (Old)', true),
  ('cr100000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001', 'c0900000-0000-0000-0000-000000000009', 'Class 9 (General Science)', true),
  ('cr100000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000001', 'c1100000-0000-0000-0000-000000000011', 'FSc Pre-Engineering Part 1', true),
  ('cr100000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000001', 'c1200000-0000-0000-0000-000000000012', 'FSc Pre-Engineering Part 2', true)
on conflict (id) do update set name = excluded.name, is_active = excluded.is_active;

-- 4. Subjects
insert into public.subjects (id, course_id, name, name_ur) values
  ('s1000000-0000-0000-0000-000000000001', 'cr100000-0000-0000-0000-000000000001', 'Mathematics', 'ریاضی'),
  ('s1000000-0000-0000-0000-000000000002', 'cr100000-0000-0000-0000-000000000001', 'Physics', 'طبیعیات'),
  ('s1000000-0000-0000-0000-000000000003', 'cr100000-0000-0000-0000-000000000001', 'Chemistry', 'کیمیا')
on conflict (id) do update set name = excluded.name, name_ur = excluded.name_ur;

-- 5. Chapters
insert into public.chapters (id, subject_id, number, title, title_ur) values
  ('ch100000-0000-0000-0000-000000000001', 's1000000-0000-0000-0000-000000000001', 1, 'Quadratic Equations', 'دو درجی مساواتیں'),
  ('ch100000-0000-0000-0000-000000000002', 's1000000-0000-0000-0000-000000000001', 2, 'Theory of Quadratic Equations', 'دو درجی مساواتوں کا نظریہ'),
  ('ch100000-0000-0000-0000-000000000003', 's1000000-0000-0000-0000-000000000001', 3, 'Variations', 'تغیرات'),
  ('ch100000-0000-0000-0000-000000000004', 's1000000-0000-0000-0000-000000000001', 4, 'Partial Fractions', 'جزوی کسریں'),
  ('ch100000-0000-0000-0000-000000000005', 's1000000-0000-0000-0000-000000000001', 5, 'Sets and Functions', 'سیٹ اور تفاعلات'),
  ('ch100000-0000-0000-0000-000000000006', 's1000000-0000-0000-0000-000000000001', 6, 'Basic Statistics', 'بنیادی شماریات'),
  ('ch100000-0000-0000-0000-000000000007', 's1000000-0000-0000-0000-000000000001', 7, 'Introduction to Trigonometry', 'علم المثلث کا تعارف')
on conflict (id) do update set number = excluded.number, title = excluded.title, title_ur = excluded.title_ur;

-- 6. Topics
insert into public.topics (id, chapter_id, number, title, title_ur) values
  ('t1000000-0000-0000-0000-000000000001', 'ch100000-0000-0000-0000-000000000001', 1, 'Standard Form of Quadratic Equation', 'دو درجی مساوات کی معیاری شکل'),
  ('t1000000-0000-0000-0000-000000000002', 'ch100000-0000-0000-0000-000000000001', 2, 'Solution by Factorization', 'بذریعہ تجزی حل'),
  ('t1000000-0000-0000-0000-000000000003', 'ch100000-0000-0000-0000-000000000001', 3, 'Quadratic Formula', 'دو درجی فارمولا'),
  ('t1000000-0000-0000-0000-000000000004', 'ch100000-0000-0000-0000-000000000002', 1, 'Discriminant of Quadratic Equation', 'دو درجی مساوات کا فرق کنندہ'),
  ('t1000000-0000-0000-0000-000000000005', 'ch100000-0000-0000-0000-000000000003', 1, 'Ratio, Proportion and Variations', 'نسبت، تناسب اور تغیرات'),
  ('t1000000-0000-0000-0000-000000000006', 'ch100000-0000-0000-0000-000000000007', 1, 'Trigonometric Ratios and Identities', 'مثلثی نسبتیں اور مماثلتیں')
on conflict (id) do update set number = excluded.number, title = excluded.title, title_ur = excluded.title_ur;

-- 7. Questions (30 items)
insert into public.questions (id, chapter_id, topic_id, type, source, source_ref, concept_tag, correct_option, marks, difficulty, is_active, source_note) values
  ('q0000001-0000-0000-0000-000000000001', 'ch100000-0000-0000-0000-000000000001', 't1000000-0000-0000-0000-000000000001', 'mcq', 'exercise', 'Ex 1.1 Q1', 'standard_form', 2, 1, 'easy', true, 'SAMPLE - delete before launch'),
  ('q0000002-0000-0000-0000-000000000002', 'ch100000-0000-0000-0000-000000000001', 't1000000-0000-0000-0000-000000000003', 'mcq', 'exercise', 'Ex 1.2 Q1', 'quadratic_formula', 1, 1, 'medium', true, 'SAMPLE - delete before launch'),
  ('q0000003-0000-0000-0000-000000000003', 'ch100000-0000-0000-0000-000000000001', 't1000000-0000-0000-0000-000000000001', 'mcq', 'past_paper', 'LHR 2022 Group 1', 'pure_quadratic', 3, 1, 'easy', true, 'SAMPLE - delete before launch'),
  ('q0000004-0000-0000-0000-000000000004', 'ch100000-0000-0000-0000-000000000002', 't1000000-0000-0000-0000-000000000004', 'mcq', 'exercise', 'Ex 2.1 Q1', 'discriminant', 2, 1, 'medium', true, 'SAMPLE - delete before launch'),
  ('q0000005-0000-0000-0000-000000000005', 'ch100000-0000-0000-0000-000000000002', 't1000000-0000-0000-0000-000000000004', 'mcq', 'past_paper', 'FSD 2021 Group 2', 'cube_roots_of_unity', 1, 1, 'medium', true, 'SAMPLE - delete before launch'),
  ('q0000006-0000-0000-0000-000000000003', 'ch100000-0000-0000-0000-000000000005', 't1000000-0000-0000-0000-000000000005', 'mcq', 'exercise', 'Ex 3.1 Q1', 'ratio_proportion', 4, 1, 'easy', true, 'SAMPLE - delete before launch'),
  ('q0000007-0000-0000-0000-000000000007', 'ch100000-0000-0000-0000-000000000004', null, 'mcq', 'exercise', 'Ex 4.1 Q1', 'partial_fractions', 2, 1, 'easy', true, 'SAMPLE - delete before launch'),
  ('q0000008-0000-0000-0000-000000000008', 'ch100000-0000-0000-0000-000000000005', null, 'mcq', 'past_paper', 'RWP 2023', 'de_morgans_laws', 1, 1, 'medium', true, 'SAMPLE - delete before launch'),
  ('q0000009-0000-0000-0000-000000000009', 'ch100000-0000-0000-0000-000000000006', null, 'mcq', 'exercise', 'Ex 6.2 Q2', 'mode', 3, 1, 'easy', true, 'SAMPLE - delete before launch'),
  ('q0000010-0000-0000-0000-000000000010', 'ch100000-0000-0000-0000-000000000007', 't1000000-0000-0000-0000-000000000006', 'mcq', 'exercise', 'Ex 7.4 Q1', 'trig_identity', 2, 1, 'medium', true, 'SAMPLE - delete before launch'),
  ('q0000011-0000-0000-0000-000000000011', 'ch100000-0000-0000-0000-000000000007', null, 'mcq', 'extra', 'Model Paper 2024', 'radian_degree', 1, 1, 'easy', true, 'SAMPLE - delete before launch'),
  ('q0000012-0000-0000-0000-000000000012', 'ch100000-0000-0000-0000-000000000001', 't1000000-0000-0000-0000-000000000002', 'mcq', 'exercise', 'Ex 1.1 Q2', 'solution_set', 3, 1, 'hard', true, 'SAMPLE - delete before launch'),
  ('q0000013-0000-0000-0000-000000000013', 'ch100000-0000-0000-0000-000000000001', 't1000000-0000-0000-0000-000000000002', 'short', 'exercise', 'Ex 1.1 Q2 (ii)', 'solve_by_factorization', null, 2, 'easy', true, 'SAMPLE - delete before launch'),
  ('q0000014-0000-0000-0000-000000000014', 'ch100000-0000-0000-0000-000000000001', 't1000000-0000-0000-0000-000000000001', 'short', 'exercise', 'Ex 1.1 Q1 (i)', 'pure_quadratic_conversion', null, 2, 'medium', true, 'SAMPLE - delete before launch'),
  ('q0000015-0000-0000-0000-000000000015', 'ch100000-0000-0000-0000-000000000002', 't1000000-0000-0000-0000-000000000004', 'short', 'past_paper', 'LHR 2023 Group 2', 'discriminant_calc', null, 2, 'easy', true, 'SAMPLE - delete before launch'),
  ('q0000016-0000-0000-0000-000000000016', 'ch100000-0000-0000-0000-000000000002', null, 'short', 'exercise', 'Ex 2.2 Q2', 'evaluate_omega', null, 2, 'medium', true, 'SAMPLE - delete before launch'),
  ('q0000017-0000-0000-0000-000000000017', 'ch100000-0000-0000-0000-000000000003', null, 'short', 'past_paper', 'GRW 2021', 'find_x_proportion', null, 2, 'easy', true, 'SAMPLE - delete before launch'),
  ('q0000018-0000-0000-0000-000000000018', 'ch100000-0000-0000-0000-000000000003', null, 'short', 'exercise', 'Ex 3.2 Q1', 'direct_variation', null, 2, 'medium', true, 'SAMPLE - delete before launch'),
  ('q0000019-0000-0000-0000-000000000019', 'ch100000-0000-0000-0000-000000000004', null, 'short', 'exercise', 'Ex 4.1 Q1', 'fraction_types', null, 2, 'easy', true, 'SAMPLE - delete before launch'),
  ('q0000020-0000-0000-0000-000000000020', 'ch100000-0000-0000-0000-000000000005', null, 'short', 'exercise', 'Ex 5.1 Q1', 'set_difference', null, 2, 'easy', true, 'SAMPLE - delete before launch'),
  ('q0000021-0000-0000-0000-000000000021', 'ch100000-0000-0000-0000-000000000006', null, 'short', 'exercise', 'Ex 6.2 Q3', 'arithmetic_mean', null, 2, 'easy', true, 'SAMPLE - delete before launch'),
  ('q0000022-0000-0000-0000-000000000022', 'ch100000-0000-0000-0000-000000000007', 't1000000-0000-0000-0000-000000000006', 'short', 'past_paper', 'SWL 2022', 'degree_to_radian', null, 2, 'easy', true, 'SAMPLE - delete before launch'),
  ('q0000023-0000-0000-0000-000000000023', 'ch100000-0000-0000-0000-000000000001', 't1000000-0000-0000-0000-000000000003', 'long', 'exercise', 'Ex 1.2 Q1 (x)', 'solve_quadratic_formula', null, 5, 'hard', true, 'SAMPLE - delete before launch'),
  ('q0000024-0000-0000-0000-000000000024', 'ch100000-0000-0000-0000-000000000001', null, 'long', 'exercise', 'Ex 1.3 Q12', 'exponential_equation', null, 5, 'hard', true, 'SAMPLE - delete before launch'),
  ('q0000025-0000-0000-0000-000000000025', 'ch100000-0000-0000-0000-000000000002', null, 'long', 'exercise', 'Ex 2.5 Q1', 'form_equation_from_roots', null, 4, 'medium', true, 'SAMPLE - delete before launch'),
  ('q0000026-0000-0000-0000-000000000026', 'ch100000-0000-0000-0000-000000000003', 't1000000-0000-0000-0000-000000000005', 'long', 'exercise', 'Ex 3.4 Q1 (i)', 'componendo_dividendo', null, 4, 'hard', true, 'SAMPLE - delete before launch'),
  ('q0000027-0000-0000-0000-000000000027', 'ch100000-0000-0000-0000-000000000004', null, 'long', 'past_paper', 'LHR 2021', 'partial_fraction_resolution', null, 4, 'hard', true, 'SAMPLE - delete before launch'),
  ('q0000028-0000-0000-0000-000000000028', 'ch100000-0000-0000-0000-000000000005', null, 'long', 'exercise', 'Ex 5.2 Q1', 'de_morgan_verification', null, 4, 'medium', true, 'SAMPLE - delete before launch'),
  ('q0000029-0000-0000-0000-000000000029', 'ch100000-0000-0000-0000-000000000007', 't1000000-0000-0000-0000-000000000006', 'long', 'exercise', 'Ex 7.4 Q20', 'trig_identity_proof', null, 4, 'hard', true, 'SAMPLE - delete before launch'),
  ('q0000030-0000-0000-0000-000000000030', 'ch100000-0000-0000-0000-000000000006', null, 'long', 'exercise', 'Ex 6.3 Q4', 'standard_deviation', null, 4, 'hard', true, 'SAMPLE - delete before launch')
on conflict (id) do update set
  type = excluded.type,
  source = excluded.source,
  source_ref = excluded.source_ref,
  concept_tag = excluded.concept_tag,
  correct_option = excluded.correct_option,
  marks = excluded.marks,
  difficulty = excluded.difficulty,
  source_note = excluded.source_note;

-- 8. Question Translations
insert into public.question_translations (question_id, language, text, options, answer) values
  ('q0000001-0000-0000-0000-000000000001', 'en', 'The standard form of a quadratic equation is $ax^2 + bx + c = 0$ where:', '["$a = 0$", "$a \\neq 0$", "$b = 0$", "$c = 0$"]'::jsonb, 'Option B ($a \neq 0$)'),
  ('q0000001-0000-0000-0000-000000000001', 'ur', 'دو درجی مساوات $ax^2 + bx + c = 0$ کی معیاری شکل میں شرط ہے کہ:', '["$a = 0$", "$a \\neq 0$", "$b = 0$", "$c = 0$"]'::jsonb, 'آپشن B'),
  ('q0000002-0000-0000-0000-000000000002', 'en', 'The quadratic formula for $ax^2 + bx + c = 0$ is $x = $:', '["$\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$", "$\\frac{b \\pm \\sqrt{b^2 - 4ac}}{2a}$", "$\\frac{-b \\pm \\sqrt{b^2 + 4ac}}{2a}$", "$\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2}$"]'::jsonb, 'Option A'),
  ('q0000002-0000-0000-0000-000000000002', 'ur', 'مساوات $ax^2 + bx + c = 0$ کو حل کرنے کے لیے دو درجی فارمولا ہے:', '["$\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$", "$\\frac{b \\pm \\sqrt{b^2 - 4ac}}{2a}$", "$\\frac{-b \\pm \\sqrt{b^2 + 4ac}}{2a}$", "$\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2}$"]'::jsonb, 'آپشن A'),
  ('q0000003-0000-0000-0000-000000000003', 'en', 'In a quadratic equation $ax^2 + bx + c = 0$, if $b = 0$, it is called a:', '["Linear equation", "Cubic equation", "Pure quadratic equation", "Reciprocal equation"]'::jsonb, 'Option C'),
  ('q0000003-0000-0000-0000-000000000003', 'ur', 'اگر دو درجی مساوات $ax^2 + bx + c = 0$ میں $b = 0$ ہو تو کہلاتی ہے:', '["یک درجی مساوات", "مکعبی مساوات", "پیور دو درجی مساوات", "معکوس مساوات"]'::jsonb, 'آپشن C'),
  ('q0000004-0000-0000-0000-000000000004', 'en', 'The discriminant of the quadratic equation $ax^2 + bx + c = 0$ is:', '["$b^2 + 4ac$", "$b^2 - 4ac$", "$-b^2 - 4ac$", "$\\sqrt{b^2 - 4ac}$"]'::jsonb, 'Option B ($b^2 - 4ac$)'),
  ('q0000004-0000-0000-0000-000000000004', 'ur', 'دو درجی مساوات $ax^2 + bx + c = 0$ کا فرق کنندہ (Discriminant) ہوتا ہے:', '["$b^2 + 4ac$", "$b^2 - 4ac$", "$-b^2 - 4ac$", "$\\sqrt{b^2 - 4ac}$"]'::jsonb, 'آپشن B'),
  ('q0000005-0000-0000-0000-000000000005', 'en', 'The sum of all cube roots of unity $1 + \\omega + \\omega^2$ equals:', '["$0$", "$1$", "$-1$", "$3$"]'::jsonb, 'Option A (0)'),
  ('q0000005-0000-0000-0000-000000000005', 'ur', 'اکائی کے تمام جزر المکعب کا مجموعہ $1 + \\omega + \\omega^2$ برابر ہوتا ہے:', '["$0$", "$1$", "$-1$", "$3$"]'::jsonb, 'آپشن A (0)'),
  ('q0000006-0000-0000-0000-000000000006', 'en', 'In the proportion $a : b = c : d$, the extremes are:', '["$b$ and $c$", "$a$ and $b$", "$c$ and $d$", "$a$ and $d$"]'::jsonb, 'Option D ($a$ and $d$)'),
  ('q0000006-0000-0000-0000-000000000006', 'ur', 'تناسب $a : b = c : d$ میں طرفین (Extremes) ہیں:', '["$b$ اور $c$", "$a$ اور $b$", "$c$ اور $d$", "$a$ اور $d$"]'::jsonb, 'آپشن D'),
  ('q0000007-0000-0000-0000-000000000007', 'en', 'A fraction in which the degree of the numerator is strictly less than the degree of denominator is called:', '["Improper fraction", "Proper fraction", "Composite fraction", "Identity"]'::jsonb, 'Option B'),
  ('q0000008-0000-0000-0000-000000000008', 'en', 'According to De Morgan''s Law, $(A \\cup B)''$ is equal to:', '["$A'' \\cap B''$", "$A'' \\cup B''$", "$A \\cap B$", "$A'' - B''$"]'::jsonb, 'Option A'),
  ('q0000009-0000-0000-0000-000000000009', 'en', 'The most frequent observation in a given dataset is known as:', '["Mean", "Median", "Mode", "Variance"]'::jsonb, 'Option C'),
  ('q0000010-0000-0000-0000-000000000010', 'en', 'The fundamental trigonometric identity states that $\\sin^2 \\theta + \\cos^2 \\theta = $:', '["$0$", "$1$", "$2$", "$-1$"]'::jsonb, 'Option B (1)'),
  ('q0000010-0000-0000-0000-000000000010', 'ur', 'بنیادی مثلثی مماثلت کے مطابق $\\sin^2 \\theta + \\cos^2 \\theta$ برابر ہے:', '["$0$", "$1$", "$2$", "$-1$"]'::jsonb, 'آپشن B (1)'),
  ('q0000011-0000-0000-0000-000000000011', 'en', '$180^\\circ$ in radians is equal to:', '["$\\pi$", "$\\frac{\\pi}{2}$", "$2\\pi$", "$\\frac{\\pi}{4}$"]'::jsonb, 'Option A (pi)'),
  ('q0000012-0000-0000-0000-000000000012', 'en', 'The solution set of $x^2 - 4 = 0$ is:', '["$\\{2\\}$", "$\\{-2\\}$", "$\\{\\pm 2\\}$", "$\\{4\\}$"]'::jsonb, 'Option C'),
  ('q0000013-0000-0000-0000-000000000013', 'en', 'Solve by factorization: $3y^2 = y(y - 5)$.', null, 'Rearrange to $2y^2 + 5y = 0 \implies y(2y + 5) = 0$. Hence $y = 0$ or $y = -\frac{5}{2}$. Solution set is $\{0, -\frac{5}{2}\}$.'),
  ('q0000013-0000-0000-0000-000000000013', 'ur', 'تجزی کے طریقے سے حل کیجیے: $3y^2 = y(y - 5)$', null, '$3y^2 - y^2 + 5y = 0 \implies 2y^2 + 5y = 0 \implies y(2y + 5) = 0$. پس حل سیٹ $\{0, -\frac{5}{2}\}$ ہے۔'),
  ('q0000014-0000-0000-0000-000000000014', 'en', 'Write the equation $(x + 7)(x - 3) = -7$ in standard form and point out if it is pure quadratic.', null, '$x^2 + 4x - 21 = -7 \implies x^2 + 4x - 14 = 0$. It is not pure quadratic because the linear coefficient $4 \neq 0$.'),
  ('q0000014-0000-0000-0000-000000000014', 'ur', 'مساوات $(x + 7)(x - 3) = -7$ کو معیاری شکل میں لکھیے اور بتائیے کہ کیا یہ پیور دو درجی مساوات ہے یا نہیں؟', null, '$x^2 + 4x - 14 = 0$. چونکہ $x$ کا کوفیشنٹ صفر نہیں ہے اس لیے یہ پیور دو درجی مساوات نہیں ہے۔'),
  ('q0000015-0000-0000-0000-000000000015', 'en', 'Find the discriminant of the quadratic equation $2x^2 + 3x - 1 = 0$.', null, 'Here $a = 2, b = 3, c = -1$. Discriminant $= b^2 - 4ac = 3^2 - 4(2)(-1) = 9 + 8 = 17$.'),
  ('q0000015-0000-0000-0000-000000000015', 'ur', 'دو درجی مساوات $2x^2 + 3x - 1 = 0$ کا فرق کنندہ معلوم کیجیے۔', null, 'فرق کنندہ $= b^2 - 4ac = (3)^2 - 4(2)(-1) = 9 + 8 = 17$'),
  ('q0000016-0000-0000-0000-000000000016', 'en', 'Evaluate: $(1 - \\omega - \\omega^2)^7$.', null, '$1 - (\omega + \omega^2) = 1 - (-1) = 2$. Therefore $(2)^7 = 128$.'),
  ('q0000016-0000-0000-0000-000000000016', 'ur', 'قیمت معلوم کیجیے: $(1 - \\omega - \\omega^2)^7$', null, '$(1 - (\omega + \omega^2))^7 = (1 - (-1))^7 = 2^7 = 128$'),
  ('q0000017-0000-0000-0000-000000000017', 'en', 'Find the value of $x$ in the proportion: $4 : x :: 5 : 15$.', null, 'Product of extremes = Product of means $\implies 5x = 4 \times 15 = 60 \implies x = 12$.'),
  ('q0000017-0000-0000-0000-000000000017', 'ur', 'تناسب $4 : x :: 5 : 15$ میں $x$ کی قیمت معلوم کیجیے۔', null, 'طرفین کا حاصل ضرب = وسطین کا حاصل ضرب $\implies 5x = 60 \implies x = 12$'),
  ('q0000018-0000-0000-0000-000000000018', 'en', 'If $y$ varies directly as $x$, and $y = 8$ when $x = 2$, find $y$ when $x = 5$.', null, '$y = kx \implies 8 = 2k \implies k = 4$. When $x = 5$, $y = 4(5) = 20$.'),
  ('q0000019-0000-0000-0000-000000000019', 'en', 'Define a proper fraction with an example.', null, 'A rational fraction $\frac{N(x)}{D(x)}$ with $D(x) \neq 0$ is proper if the degree of $N(x)$ is strictly less than the degree of $D(x)$. Example: $\frac{2}{x+1}$.'),
  ('q0000020-0000-0000-0000-000000000020', 'en', 'If $X = \\{1, 4, 7, 9\\}$ and $Y = \\{2, 4, 5, 9\\}$, find $X - Y$.', null, '$X - Y = \{1, 7\}$.'),
  ('q0000021-0000-0000-0000-000000000021', 'en', 'Find the arithmetic mean of $12, 14, 19, 21, 24$.', null, 'Mean $= \frac{\sum x}{n} = \frac{12 + 14 + 19 + 21 + 24}{5} = \frac{90}{5} = 18$.'),
  ('q0000022-0000-0000-0000-000000000022', 'en', 'Convert $45^\\circ$ into radians.', null, '$45^\circ = 45 \times \frac{\pi}{180} = \frac{\pi}{4}$ radians.'),
  ('q0000022-0000-0000-0000-000000000022', 'ur', '$45^\\circ$ کو ریڈین میں تبدیل کیجیے۔', null, '$45^\circ = 45 \times \frac{\pi}{180} = \frac{\pi}{4}$ ریڈین۔'),
  ('q0000023-0000-0000-0000-000000000023', 'en', 'Solve the equation using the quadratic formula: $-(l + m) - lx^2 + (2l + m)x = 0$ where $l \\neq 0$.', null, 'Standard form: $lx^2 - (2l + m)x + (l + m) = 0$. $a = l, b = -(2l + m), c = (l + m)$. Discriminant $= m^2$. $x = \frac{(2l + m) \pm m}{2l}$. Therefore $x = 1$ or $x = \frac{l + m}{l}$.'),
  ('q0000023-0000-0000-0000-000000000023', 'ur', 'دو درجی فارمولا استعمال کرتے ہوئے مساوات حل کیجیے: $-(l + m) - lx^2 + (2l + m)x = 0$ جبکہ $l \\neq 0$۔', null, 'معیاری شکل: $lx^2 - (2l + m)x + (l + m) = 0$۔ فارمولا کی مدد سے حل کرنے پر $x = 1$ اور $x = \frac{l+m}{l}$ حاصل ہوتا ہے۔'),
  ('q0000024-0000-0000-0000-000000000024', 'en', 'Solve the exponential equation: $4 \\cdot 2^{2x + 1} - 9 \\cdot 2^x + 1 = 0$.', null, 'Let $y = 2^x$. Equation becomes $8y^2 - 9y + 1 = 0 \implies (8y - 1)(y - 1) = 0$. So $y = 1 \implies 2^x = 2^0 \implies x = 0$; or $y = \frac{1}{8} = 2^{-3} \implies x = -3$. Solution set is $\{0, -3\}$.'),
  ('q0000024-0000-0000-0000-000000000024', 'ur', 'قوت نمائی مساوات حل کیجیے: $4 \\cdot 2^{2x + 1} - 9 \\cdot 2^x + 1 = 0$', null, 'فرض کریں $y = 2^x$۔ مساوات $8y^2 - 9y + 1 = 0$ بن جاتی ہے۔ پس $x = 0$ اور $x = -3$ حاصل ہوگا۔ حل سیٹ $\{0, -3\}$ ہے۔'),
  ('q0000025-0000-0000-0000-000000000025', 'en', 'If $\\alpha, \\beta$ are the roots of $x^2 + px + q = 0$, form an equation whose roots are $\\alpha^2, \\beta^2$.', null, 'Sum of given roots $S_1 = -p$, product $P_1 = q$. New sum $S = \alpha^2 + \beta^2 = (\alpha+\beta)^2 - 2\alpha\beta = p^2 - 2q$. New product $P = (\alpha\beta)^2 = q^2$. Equation: $x^2 - (p^2 - 2q)x + q^2 = 0$.'),
  ('q0000026-0000-0000-0000-000000000026', 'en', 'Prove by theorem of componendo-dividendo: if $\\frac{a}{b} = \\frac{c}{d}$, then $\\frac{4a + 5b}{4a - 5b} = \\frac{4c + 5d}{4c - 5d}$.', null, 'Given $\frac{a}{b} = \frac{c}{d}$. Multiply both sides by $\frac{4}{5} \implies \frac{4a}{5b} = \frac{4c}{5d}$. Applying componendo-dividendo theorem gives $\frac{4a + 5b}{4a - 5b} = \frac{4c + 5d}{4c - 5d}$.'),
  ('q0000026-0000-0000-0000-000000000026', 'ur', 'مسئلہ ترکیب و تفصیل نسبت کے ذریعے ثابت کریں: اگر $\\frac{a}{b} = \\frac{c}{d}$ ہو تو $\\frac{4a + 5b}{4a - 5b} = \\frac{4c + 5d}{4c - 5d}$۔', null, 'دونوں اطراف کو $\frac{4}{5}$ سے ضرب دینے پر: $\frac{4a}{5b} = \frac{4c}{5d}$۔ مسئلہ ترکیب و تفصیل نسبت لگانے سے مطلوبہ نتیجہ حاصل ہوتا ہے۔'),
  ('q0000027-0000-0000-0000-000000000027', 'en', 'Resolve into partial fractions: $\\frac{7x - 9}{(x + 1)(x - 3)}$.', null, 'Let $\frac{7x - 9}{(x + 1)(x - 3)} = \frac{A}{x + 1} + \frac{B}{x - 3}$. Multiplying by denominator gives $7x - 9 = A(x - 3) + B(x + 1)$. Putting $x = -1 \implies A = 4$. Putting $x = 3 \implies B = 3$. Hence $\frac{4}{x + 1} + \frac{3}{x - 3}$.'),
  ('q0000028-0000-0000-0000-000000000028', 'en', 'If $U = \\{1, 2, 3, ..., 10\\}$, $A = \\{1, 3, 5, 7, 9\\}$, $B = \\{2, 3, 5, 7\\}$, verify De Morgan''s Law: $(A \\cup B)'' = A'' \\cap B''$.', null, '$A \cup B = \{1, 2, 3, 5, 7, 9\}$. $(A \cup B)'' = \{4, 6, 8, 10\}$. $A'' = \{2, 4, 6, 8, 10\}$, $B'' = \{1, 4, 6, 8, 9, 10\}$. $A'' \cap B'' = \{4, 6, 8, 10\}$. LHS = RHS verified.'),
  ('q0000029-0000-0000-0000-000000000029', 'en', 'Prove the identity: $\\frac{1 + \\sin \\theta}{1 - \\sin \\theta} - \\frac{1 - \\sin \\theta}{1 + \\sin \\theta} = 4 \\tan \\theta \\sec \\theta$.', null, 'LHS $= \frac{(1 + \sin\theta)^2 - (1 - \sin\theta)^2}{1 - \sin^2\theta} = \frac{4\sin\theta}{\cos^2\theta} = 4 \cdot \frac{\sin\theta}{\cos\theta} \cdot \frac{1}{\cos\theta} = 4\tan\theta\sec\theta =$ RHS.'),
  ('q0000029-0000-0000-0000-000000000029', 'ur', 'مماثلت ثابت کیجیے: $\\frac{1 + \\sin \\theta}{1 - \\sin \\theta} - \\frac{1 - \\sin \\theta}{1 + \\sin \\theta} = 4 \\tan \\theta \\sec \\theta$', null, 'بائیں جانب (LHS) کا مشترک مخرج لے کر آسان کرنے سے: $\frac{4\sin\theta}{\cos^2\theta} = 4\tan\theta\sec\theta =$ دائیں جانب (RHS)۔'),
  ('q0000030-0000-0000-0000-000000000030', 'en', 'Calculate the standard deviation $S$ for the data values: $12, 6, 7, 3, 15, 10, 18, 5$.', null, 'Sum $\sum X = 76, n = 8, \bar{X} = 9.5$. $\sum X^2 = 912$. $S = \sqrt{\frac{\sum X^2}{n} - (\bar{X})^2} = \sqrt{\frac{912}{8} - (9.5)^2} = \sqrt{114 - 90.25} = \sqrt{23.75} \approx 4.87$.')
on conflict (question_id, language) do update set
  text = excluded.text,
  options = excluded.options,
  answer = excluded.answer;
