"use client";

import React, { useMemo } from "react";
import katex from "katex";

interface MathRendererProps {
  content: string;
  className?: string;
  inline?: boolean;
}

export function MathRenderer({ content, className = "", inline = true }: MathRendererProps) {
  const renderedElements = useMemo(() => {
    if (!content) return [];

    // Regex to detect $$display math$$ and $inline math$
    // Using positive lookahead or tokenization to accurately preserve order
    const tokens: { type: "text" | "inline_math" | "display_math"; value: string }[] = [];
    let remaining = content;

    while (remaining.length > 0) {
      // Check display math $$...$$
      const displayMatch = remaining.match(/^\$\$([\s\S]+?)\$\$/);
      if (displayMatch) {
        tokens.push({ type: "display_math", value: displayMatch[1] });
        remaining = remaining.slice(displayMatch[0].length);
        continue;
      }

      // Check inline math $...$ (avoiding double $ or empty $)
      const inlineMatch = remaining.match(/^\$([^\$\n]+?)\$/);
      if (inlineMatch) {
        tokens.push({ type: "inline_math", value: inlineMatch[1] });
        remaining = remaining.slice(inlineMatch[0].length);
        continue;
      }

      // Find next dollar sign or end of string
      const nextDollar = remaining.indexOf("$");
      if (nextDollar === -1) {
        tokens.push({ type: "text", value: remaining });
        remaining = "";
      } else if (nextDollar === 0) {
        // Stray dollar sign not matching a closed pair
        tokens.push({ type: "text", value: "$" });
        remaining = remaining.slice(1);
      } else {
        tokens.push({ type: "text", value: remaining.slice(0, nextDollar) });
        remaining = remaining.slice(nextDollar);
      }
    }

    return tokens.map((token, index) => {
      if (token.type === "text") {
        return <span key={index}>{token.value}</span>;
      }

      const isDisplay = token.type === "display_math";
      try {
        const html = katex.renderToString(token.value, {
          displayMode: isDisplay,
          throwOnError: false,
          output: "htmlAndMathml",
        });

        return (
          <span
            key={index}
            className={isDisplay ? "block my-2 text-center" : "inline-block px-0.5 align-baseline"}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      } catch {
        return (
          <span key={index} className="text-red-500 font-mono text-sm">
            {token.type === "display_math" ? `$$${token.value}$$` : `$${token.value}$`}
          </span>
        );
      }
    });
  }, [content]);

  return <span className={`math-content ${className}`}>{renderedElements}</span>;
}
