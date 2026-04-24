// Tollgate-branded syntax highlighter for TypeScript/JS/JSON/bash.
// Zero dependencies. Deterministic token stream → span colors mapped to the
// Tollgate palette (pink keywords, blue strings, gold numbers, green comments,
// violet types/functions). Designed for <200 line snippets - not a full
// highlighter, but judge-grade for the Install SDK page.

"use client";

import { useMemo, type ReactElement } from "react";

type Lang = "ts" | "js" | "json" | "bash";

const TOLLGATE_COLORS = {
  bg: "#0A0B10",
  fg: "#E8E9F0",
  comment: "#6B7280",
  keyword: "#FF3CC0", // Tollgate pink
  string: "#8AC8FF", // Arc blue
  number: "#F2A541", // Gold
  fn: "#C084FC", // Violet (functions / types)
  punct: "#9CA3AF",
  constant: "#06A77D", // Green (true/false/null)
  property: "#FFE3F0", // Soft pink
} as const;

const TS_KEYWORDS = new Set([
  "import",
  "from",
  "export",
  "default",
  "const",
  "let",
  "var",
  "function",
  "return",
  "if",
  "else",
  "for",
  "while",
  "do",
  "switch",
  "case",
  "break",
  "continue",
  "new",
  "class",
  "extends",
  "implements",
  "interface",
  "type",
  "enum",
  "async",
  "await",
  "try",
  "catch",
  "finally",
  "throw",
  "typeof",
  "instanceof",
  "in",
  "of",
  "void",
  "delete",
  "yield",
  "this",
  "super",
  "public",
  "private",
  "protected",
  "readonly",
  "static",
  "as",
  "satisfies",
]);

const TS_CONSTANTS = new Set(["true", "false", "null", "undefined"]);

type Token = { text: string; color: string };

export function CodeBlock({ code, lang = "ts" }: { code: string; lang?: Lang }) {
  const lines = useMemo(() => code.split("\n"), [code]);

  return (
    <pre
      style={{
        margin: 0,
        padding: 18,
        fontFamily: "JetBrains Mono, SF Mono, Consolas, monospace",
        fontSize: 12,
        lineHeight: 1.7,
        color: TOLLGATE_COLORS.fg,
        background: TOLLGATE_COLORS.bg,
        overflowX: "auto",
        tabSize: 2,
      }}
    >
      {lines.map((line, i) => (
        <div key={i} style={{ display: "flex", minHeight: "1.7em" }}>
          <span
            style={{
              color: TOLLGATE_COLORS.comment,
              opacity: 0.5,
              userSelect: "none",
              width: 28,
              flexShrink: 0,
              textAlign: "right",
              paddingRight: 14,
            }}
          >
            {i + 1}
          </span>
          <span style={{ flex: 1 }}>{renderLine(line, lang)}</span>
        </div>
      ))}
    </pre>
  );
}

function renderLine(line: string, lang: Lang): ReactElement[] {
  const tokens = tokenize(line, lang);
  return tokens.map((t, i) => (
    <span key={i} style={{ color: t.color }}>
      {t.text}
    </span>
  ));
}

function tokenize(line: string, lang: Lang): Token[] {
  if (lang === "json") return tokenizeJson(line);
  if (lang === "bash") return tokenizeBash(line);
  return tokenizeTs(line);
}

function tokenizeTs(line: string): Token[] {
  const out: Token[] = [];
  let i = 0;

  while (i < line.length) {
    const rest = line.slice(i);

    // Line comment
    const commentMatch = rest.match(/^\/\/[^\n]*/);
    if (commentMatch) {
      out.push({ text: commentMatch[0], color: TOLLGATE_COLORS.comment });
      i += commentMatch[0].length;
      continue;
    }

    // Template literal
    const templateMatch = rest.match(/^`(?:[^`\\]|\\.)*`/);
    if (templateMatch) {
      out.push({ text: templateMatch[0], color: TOLLGATE_COLORS.string });
      i += templateMatch[0].length;
      continue;
    }

    // String (single/double quote)
    const stringMatch = rest.match(/^(?:'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")/);
    if (stringMatch) {
      out.push({ text: stringMatch[0], color: TOLLGATE_COLORS.string });
      i += stringMatch[0].length;
      continue;
    }

    // Number
    const numMatch = rest.match(/^\d[\d_.]*/);
    if (numMatch) {
      out.push({ text: numMatch[0], color: TOLLGATE_COLORS.number });
      i += numMatch[0].length;
      continue;
    }

    // Identifier / keyword
    const idMatch = rest.match(/^[A-Za-z_$][A-Za-z0-9_$]*/);
    if (idMatch) {
      const word = idMatch[0];
      let color: string = TOLLGATE_COLORS.fg;
      if (TS_KEYWORDS.has(word)) color = TOLLGATE_COLORS.keyword;
      else if (TS_CONSTANTS.has(word)) color = TOLLGATE_COLORS.constant;
      else if (/^[A-Z]/.test(word)) color = TOLLGATE_COLORS.fn; // Type / Class
      else if (
        line[i + word.length] === "(" ||
        (line[i + word.length] === "?" && line[i + word.length + 1] === ".")
      ) {
        color = TOLLGATE_COLORS.fn;
      }
      out.push({ text: word, color });
      i += word.length;
      continue;
    }

    // Whitespace
    const wsMatch = rest.match(/^\s+/);
    if (wsMatch) {
      out.push({ text: wsMatch[0], color: TOLLGATE_COLORS.fg });
      i += wsMatch[0].length;
      continue;
    }

    // Punctuation / operator fallback
    out.push({ text: line[i]!, color: TOLLGATE_COLORS.punct });
    i += 1;
  }

  return out;
}

function tokenizeJson(line: string): Token[] {
  const out: Token[] = [];
  let i = 0;
  while (i < line.length) {
    const rest = line.slice(i);
    const keyMatch = rest.match(/^"(?:[^"\\]|\\.)*"\s*:/);
    if (keyMatch) {
      out.push({ text: keyMatch[0], color: TOLLGATE_COLORS.property });
      i += keyMatch[0].length;
      continue;
    }
    const strMatch = rest.match(/^"(?:[^"\\]|\\.)*"/);
    if (strMatch) {
      out.push({ text: strMatch[0], color: TOLLGATE_COLORS.string });
      i += strMatch[0].length;
      continue;
    }
    const numMatch = rest.match(/^-?\d[\d.eE+-]*/);
    if (numMatch) {
      out.push({ text: numMatch[0], color: TOLLGATE_COLORS.number });
      i += numMatch[0].length;
      continue;
    }
    const boolMatch = rest.match(/^(true|false|null)/);
    if (boolMatch) {
      out.push({ text: boolMatch[0], color: TOLLGATE_COLORS.constant });
      i += boolMatch[0].length;
      continue;
    }
    out.push({ text: line[i]!, color: TOLLGATE_COLORS.punct });
    i += 1;
  }
  return out;
}

function tokenizeBash(line: string): Token[] {
  const out: Token[] = [];
  if (line.trim().startsWith("#")) {
    out.push({ text: line, color: TOLLGATE_COLORS.comment });
    return out;
  }
  const parts = line.split(/(\s+)/);
  parts.forEach((p, i) => {
    if (/^\s+$/.test(p)) {
      out.push({ text: p, color: TOLLGATE_COLORS.fg });
      return;
    }
    if (i === 0 || parts[i - 2] === "|" || parts[i - 2] === "&&") {
      out.push({ text: p, color: TOLLGATE_COLORS.keyword });
      return;
    }
    if (p.startsWith("-")) {
      out.push({ text: p, color: TOLLGATE_COLORS.fn });
      return;
    }
    if (p.startsWith("$")) {
      out.push({ text: p, color: TOLLGATE_COLORS.string });
      return;
    }
    out.push({ text: p, color: TOLLGATE_COLORS.fg });
  });
  return out;
}
