// src/lib/html-question-parser.ts
// Universal parser for Paper Generator HTML files (e.g. "Select Questions Chapter XX.html")
import { getUrduTranslation } from "./urdu-translations";

export interface ParsedTopicDef {
  number: number;
  title: string;
  title_ur?: string;
  count?: number;
  matchPatterns: string[];
}

export interface ParsedHtmlMetadata {
  boardName: string;
  className: string;
  subjectName: string;
  chapterNumber: number | null;
  chapterTitle: string;
  chapterTitleUr: string;
  rawChapterHeader: string;
  topics: ParsedTopicDef[];
}

export interface ParsedQuestionItem {
  original_id: string;
  type: "mcq" | "short" | "long";
  topic_title?: string;
  topic_number?: number;
  source: "exercise" | "past_paper" | "extra";
  source_ref?: string | null;
  concept_tag?: string | null;
  board_tag?: string | null;
  marks: number;
  difficulty: "easy" | "medium" | "hard";
  text_en: string;
  text_ur: string;
  options_en?: string[] | null;
  options_ur?: string[] | null;
  correct_option?: number | null; // 1-4 for MCQs
  warnings: string[];
}

export interface HtmlParseResult {
  metadata: ParsedHtmlMetadata;
  questions: ParsedQuestionItem[];
  stats: {
    total: number;
    mcq: number;
    short: number;
    long: number;
    bilingual: number;
    warningsCount: number;
  };
}

// Entity decode helper
export function decodeEntities(s: string): string {
  if (!s) return "";
  return s
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&amp;/g, "&");
}

// Restore KaTeX equations back into standard LaTeX ($formula$)
export function restoreKatex(fragment: string): string {
  if (!fragment) return "";
  let out = fragment;
  for (let limit = 0; limit < 500; limit++) {
    const start = out.search(/<span class="katex(-display)?">/);
    if (start === -1) break;

    const re = /<\/?span\b[^>]*>/g;
    re.lastIndex = start;
    let depth = 0;
    let end = -1;
    let m: RegExpExecArray | null;

    while ((m = re.exec(out)) !== null) {
      depth += m[0].startsWith("</") ? -1 : 1;
      if (depth === 0) {
        end = re.lastIndex;
        break;
      }
    }

    if (end === -1) break;

    const block = out.slice(start, end);
    const texMatch = block.match(/<annotation encoding="application\/x-tex">([\s\S]*?)<\/annotation>/);
    const replacement = texMatch ? `$${decodeEntities(texMatch[1]).trim()}$` : "";
    out = out.slice(0, start) + replacement + out.slice(end);
  }
  return out;
}

// Clean HTML to clean text with linebreaks and LaTeX intact
export function cleanHtmlText(fragment: string): string {
  if (!fragment) return "";
  const withTex = restoreKatex(fragment);
  const text = withTex
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<p\b[^>]*>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\s*\n\s*/g, "\n")
    .replace(/\$ ([.,?:;!])/g, "$$$1")
    .trim();

  return decodeEntities(text);
}

// Detect Urdu characters
export function hasUrdu(text: string): boolean {
  return /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text);
}

// Helper to extract inner content of a div that may contain nested divs
export function extractBalancedDiv(block: string, startClassPattern: string): string | null {
  const match = block.match(new RegExp(`<div\\s+class="[^"]*\\b(?:${startClassPattern})\\b[^"]*"[^>]*>`, "i"));
  if (!match || match.index === undefined) return null;

  const tagOpenEnd = match.index + match[0].length;
  const re = /<\/?div\b[^>]*>/gi;
  re.lastIndex = tagOpenEnd;

  let depth = 1;
  let m: RegExpExecArray | null;
  while ((m = re.exec(block)) !== null) {
    if (m[0].startsWith("</")) {
      depth--;
      if (depth === 0) {
        return block.slice(tagOpenEnd, m.index);
      }
    } else {
      depth++;
    }
  }
  return null;
}

// Extract bilingual text parts from an HTML snippet
export function extractBilingual(fragment: string): { en: string; ur: string } {
  if (!fragment) return { en: "", ur: "" };

  // 1. Balanced search for english-part and urdu-part/urdu-text
  const balancedEn = extractBalancedDiv(fragment, "english-part");
  const balancedUr = extractBalancedDiv(fragment, "urdu-part|urdu-text");

  if (balancedEn !== null || balancedUr !== null) {
    const en = balancedEn !== null ? cleanHtmlText(balancedEn) : "";
    const ur = balancedUr !== null ? cleanHtmlText(balancedUr) : "";
    return { en, ur };
  }

  // 2. Direct regex search for <div/span/p> tagged with english-part and urdu-part/urdu-text
  const enMatch = fragment.match(/<(?:div|span|p)[^>]*class="[^"]*\benglish-part\b[^"]*"[^>]*>([\s\S]*?)<\/(?:div|span|p)>/i);
  const urMatch = fragment.match(/<(?:div|span|p)[^>]*class="[^"]*\b(?:urdu-part|urdu-text)\b[^"]*"[^>]*>([\s\S]*?)<\/(?:div|span|p)>/i);

  if (enMatch || urMatch) {
    const en = enMatch ? cleanHtmlText(enMatch[1]) : "";
    const ur = urMatch ? cleanHtmlText(urMatch[1]) : "";
    return { en, ur };
  }

  // 3. Check for RTL elements
  const rtlMatch = fragment.match(/<(?:div|span|p)[^>]*(?:class="[^"]*\brtl\b[^"]*"|dir="rtl")[^>]*>([\s\S]*?)<\/(?:div|span|p)>/i);
  if (rtlMatch) {
    const ur = cleanHtmlText(rtlMatch[1]);
    const withoutRtl = fragment.replace(rtlMatch[0], "");
    const en = cleanHtmlText(withoutRtl);
    return { en, ur };
  }

  // 4. Fallback: Monolingual text (check if it contains Urdu Unicode characters)
  const cleaned = cleanHtmlText(fragment);
  if (hasUrdu(cleaned)) {
    return { en: "", ur: cleaned };
  }
  return { en: cleaned, ur: "" };
}

// Extract tag content by class
function pickTagContent(block: string, className: string): string | null {
  const m = block.match(new RegExp(`<(\\w+) class="${className}[^"]*">([\\s\\S]*?)</\\1>`));
  return m ? cleanHtmlText(m[2]) : null;
}

// Main parser function
export function parseQuestionsHtml(htmlContent: string): HtmlParseResult {
  const html = htmlContent || "";

  // -------------------------------------------------------------
  // 1. EXTRACT METADATA
  // -------------------------------------------------------------
  const metadata: ParsedHtmlMetadata = {
    boardName: "Punjab Boards",
    className: "10th (New) 2026-27",
    subjectName: "Computer Science",
    chapterNumber: null,
    chapterTitle: "",
    chapterTitleUr: "",
    rawChapterHeader: "",
    topics: [],
  };

  // Check saved URL comment (Line 2 in downloaded files)
  const savedUrlMatch = html.match(/<!-- saved from url=\(\d+\)(https?:\/\/[^\s>]+) -->/i);
  if (savedUrlMatch) {
    try {
      const urlStr = savedUrlMatch[1];
      const urlObj = new URL(urlStr);

      const bName = urlObj.searchParams.get("boardName");
      if (bName) metadata.boardName = decodeURIComponent(decodeURIComponent(bName)).trim();

      const cName = urlObj.searchParams.get("className");
      if (cName) metadata.className = decodeURIComponent(decodeURIComponent(cName)).trim();

      const sName = urlObj.searchParams.get("subjectName");
      if (sName) metadata.subjectName = decodeURIComponent(decodeURIComponent(sName)).trim();

      const chNames = urlObj.searchParams.get("chapterNames");
      if (chNames) {
        metadata.rawChapterHeader = decodeURIComponent(decodeURIComponent(chNames)).trim();
      }
    } catch {
      // ignore url parse error
    }
  }

  // Also check <span class="chapter-info">
  const chapterInfoMatch = html.match(/<span class="chapter-info">([\s\S]*?)<\/span>/i);
  if (chapterInfoMatch) {
    metadata.rawChapterHeader = cleanHtmlText(chapterInfoMatch[1]);
  }

  // Also check <h1 id="pageHeader">
  const pageHeaderMatch = html.match(/<h1 id="pageHeader">([\s\S]*?)<\/h1>/i);
  if (pageHeaderMatch) {
    const rawH1 = cleanHtmlText(pageHeaderMatch[1]).replace(/^Select:\s*/i, "");
    if (rawH1 && !metadata.subjectName) {
      metadata.subjectName = rawH1;
    }
  }

  // Extract Chapter Number & Title from header: e.g. "Unit-3 Introduction to Python Programming"
  if (metadata.rawChapterHeader) {
    const numMatch = metadata.rawChapterHeader.match(/(?:Unit|Chapter)[\s-]*(\d+)/i);
    if (numMatch) {
      metadata.chapterNumber = parseInt(numMatch[1], 10);
    }

    // Extract title
    let titlePart = metadata.rawChapterHeader.replace(/^(?:Unit|Chapter)[\s-]*\d+[:\s-]*/i, "").trim();
    if (hasUrdu(titlePart)) {
      metadata.chapterTitleUr = titlePart;
    } else {
      metadata.chapterTitle = titlePart;
    }
  }

  // -------------------------------------------------------------
  // 2. EXTRACT TOPICS FROM SIDEBAR
  // -------------------------------------------------------------
  // e.g. <li class="sidebar-item ..." onclick="toggleTopic('...')"> ... Topic Name <span class="sidebar-count">14</span></li>
  const sidebarListMatch = html.match(/<ul class="sidebar-list"[^>]*>([\s\S]*?)<\/ul>/i);
  if (sidebarListMatch) {
    const items = [...sidebarListMatch[1].matchAll(/<li class="sidebar-item[^"]*"[^>]*>([\s\S]*?)<\/li>/gi)];
    let topicNum = 1;

    for (const item of items) {
      const itemInner = item[1];
      const countMatch = itemInner.match(/<span class="sidebar-count">(\d+)<\/span>/);
      const count = countMatch ? parseInt(countMatch[1], 10) : 0;

      const rawTitle = cleanHtmlText(itemInner.replace(/<span class="sidebar-count">[\s\S]*?<\/span>/, "")).trim();
      if (!rawTitle || rawTitle.toUpperCase() === "ALL TOPICS") continue;

      metadata.topics.push({
        number: topicNum++,
        title: rawTitle,
        title_ur: hasUrdu(rawTitle) ? rawTitle : undefined,
        count,
        matchPatterns: [rawTitle],
      });
    }
  }

  // -------------------------------------------------------------
  // 3. EXTRACT QUESTION CARDS
  // -------------------------------------------------------------
  const cardRe = /<div class="question-card\b([^"]*)"\s+data-id="([^"]+)"\s+data-type="([^"]+)"(?:\s+data-chapter-id="([^"]*)")?[^>]*>/g;
  const cards: {
    startIdx: number;
    classes: string;
    id: string;
    type: string;
    chapterKey?: string;
  }[] = [];

  let cm: RegExpExecArray | null;
  while ((cm = cardRe.exec(html)) !== null) {
    cards.push({
      startIdx: cm.index,
      classes: cm[1],
      id: cm[2],
      type: cm[3].toLowerCase(),
      chapterKey: cm[4],
    });
  }

  const parsedQuestions: ParsedQuestionItem[] = [];

  for (let i = 0; i < cards.length; i++) {
    const cur = cards[i];
    const nextIdx = i + 1 < cards.length ? cards[i + 1].startIdx : cur.startIdx + 40000;
    const block = html.slice(cur.startIdx, nextIdx);

    const warnings: string[] = [];

    // Normalized question type
    let qType: "mcq" | "short" | "long" = "mcq";
    if (cur.type === "short" || cur.type === "sq") qType = "short";
    else if (cur.type === "long" || cur.type === "lq") qType = "long";

    // Tags
    const topicTag = pickTagContent(block, "topic-tag") || "";
    const exTag = pickTagContent(block, "exercise-tag");
    const remarksTag = pickTagContent(block, "remarks-tag");
    const boardTag = pickTagContent(block, "board-tag");

    // Source
    let source: "exercise" | "past_paper" | "extra" = "extra";
    if (topicTag.toLowerCase() === "exercise" || exTag) {
      source = "exercise";
    } else if (boardTag) {
      source = "past_paper";
    }

    // Question Text (can be bilingual or monolingual)
    const qTextInner = extractBalancedDiv(block, "question-text");
    let textEn = "";
    let textUr = "";

    if (qTextInner) {
      const bi = extractBilingual(qTextInner);
      textEn = bi.en;
      textUr = bi.ur;

      // If the question text element or card has rtl or urdu-text class, ensure textUr is captured
      if (!textUr && (cur.classes.includes("rtl") || cur.classes.includes("urdu") || hasUrdu(qTextInner))) {
        textUr = cleanHtmlText(qTextInner);
      }
    } else {
      warnings.push("Missing question text element");
    }

    // MCQ Options & Correct Option
    let optionsEn: string[] | null = null;
    let optionsUr: string[] | null = null;
    let correctOption: number | null = null;

    if (qType === "mcq") {
      // Find all option elements: primary <li class="option...">...</li>
      let optMatches = [
        ...block.matchAll(/<li\b[^>]*class="([^"]*\boption\b[^"]*)"[^>]*>([\s\S]*?)<\/li>/gi),
      ];

      // Fallback if structured with div.option
      if (optMatches.length === 0) {
        optMatches = [
          ...block.matchAll(/<div\b[^>]*class="([^"]*\boption\b[^"]*)"[^>]*>([\s\S]*?)<\/div>/gi),
        ];
      }

      if (optMatches.length >= 2) {
        const enArr: string[] = [];
        const urArr: string[] = [];
        let hasAnyUr = false;

        optMatches.slice(0, 4).forEach((om, optIdx) => {
          const optClasses = om[1] || "";
          const optInnerHtml = om[2] || "";

          // Check if marked as correct option
          const isCorrect =
            optClasses.includes("correct-option") ||
            /class="[^"]*\bcorrect-option\b[^"]*"/i.test(optInnerHtml) ||
            /data-correct="true"/i.test(optInnerHtml);

          if (isCorrect) correctOption = optIdx + 1;

          // Strip option label prefix like "A)", "<b>A)</b>", "(الف)", "<b>الف)</b>", "1.", etc.
          const cleanedOptHtml = optInnerHtml
            .replace(
              /^\s*<(?:b|strong|span)\b[^>]*>\s*(?:[A-Da-d1-4]|[ابجد]|الف|بے|جیم|دال|\([A-Da-d1-4ابجد]\)|\((?:الف|بے|جیم|دال)\)|(?:[A-Da-d1-4]|[ابجد]|الف|بے|جیم|دال)[\.\-\)])\s*<\/(?:b|strong|span)>\s*/i,
              ""
            )
            .replace(
              /^\s*(?:[A-Da-d1-4]|[ابجد]|الف|بے|جیم|دال|\([A-Da-d1-4ابجد]\)|\((?:الف|بے|جیم|دال)\)|(?:[A-Da-d1-4]|[ابجد]|الف|بے|جیم|دال)[\.\-\)])\s*/i,
              ""
            );

          const biOpt = extractBilingual(cleanedOptHtml);
          const optEn = biOpt.en || biOpt.ur;
          const optUr = biOpt.ur || biOpt.en;

          enArr.push(optEn);
          urArr.push(optUr);
          if (biOpt.ur || hasUrdu(cleanedOptHtml)) {
            hasAnyUr = true;
          }
        });

        optionsEn = enArr;
        optionsUr = hasAnyUr ? urArr : null;

        if (!correctOption) {
          warnings.push("No correct option marked (defaulting to 1)");
          correctOption = 1;
        }
      } else {
        warnings.push(`Expected 4 options, found ${optMatches.length}`);
      }
    }

    // Dictionary fallback for known Urdu translations
    if (!textUr && textEn) {
      const dictUr = getUrduTranslation(textEn, optionsEn);
      if (dictUr && dictUr.text_ur) {
        textUr = dictUr.text_ur;
        if (dictUr.options_ur && dictUr.options_ur.length > 0 && (!optionsUr || optionsUr.length === 0)) {
          optionsUr = dictUr.options_ur;
        }
      }
    }

    // Marks
    const marks = qType === "mcq" ? 1 : qType === "short" ? 2 : 5;

    // Match topic definition from metadata if available
    let topicNumber: number | undefined;
    let matchedTopicTitle = topicTag;

    if (topicTag) {
      const foundDef = metadata.topics.find((t) =>
        t.matchPatterns.some((p) => p.includes(topicTag) || topicTag.includes(p))
      );
      if (foundDef) {
        topicNumber = foundDef.number;
        matchedTopicTitle = foundDef.title;
      } else if (!metadata.topics.some((t) => t.title === topicTag)) {
        // Auto register discovered topic
        const newNum = metadata.topics.length + 1;
        metadata.topics.push({
          number: newNum,
          title: topicTag,
          title_ur: hasUrdu(topicTag) ? topicTag : undefined,
          matchPatterns: [topicTag],
        });
        topicNumber = newNum;
      }
    }

    parsedQuestions.push({
      original_id: cur.id,
      type: qType,
      topic_title: matchedTopicTitle || undefined,
      topic_number: topicNumber,
      source,
      source_ref: exTag ? exTag.replace(/^Ex:\s*/i, "Ex ") : boardTag || null,
      concept_tag: remarksTag || null,
      board_tag: boardTag || null,
      marks,
      difficulty: "medium",
      text_en: textEn || textUr, // Fallback if single language
      text_ur: textUr,
      options_en: optionsEn,
      options_ur: optionsUr,
      correct_option: correctOption,
      warnings,
    });
  }

  // -------------------------------------------------------------
  // 4. STATS SUMMARY
  // -------------------------------------------------------------
  const stats = {
    total: parsedQuestions.length,
    mcq: parsedQuestions.filter((q) => q.type === "mcq").length,
    short: parsedQuestions.filter((q) => q.type === "short").length,
    long: parsedQuestions.filter((q) => q.type === "long").length,
    bilingual: parsedQuestions.filter((q) => Boolean(q.text_en && q.text_ur)).length,
    warningsCount: parsedQuestions.filter((q) => q.warnings.length > 0).length,
  };

  return {
    metadata,
    questions: parsedQuestions,
    stats,
  };
}
