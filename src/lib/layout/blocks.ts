import type { Block, ConvertOptions, Line, PageContent } from "@/lib/types";
import { stripRunningHeadersFooters } from "@/lib/layout/cleanup";

const BULLET_RE = /^[\u2022\u2023\u25E6\u2043\u2219•·‣◦*-]\s+/;
const ORDERED_RE = /^(\d{1,3})[.)]\s+/;
const MONO_HINT = /(mono|courier|consol|mono-?space)/i;
const CAPTION_RE = /^(figure|fig\.?|table|chart|exhibit)\s*\d+\s*[:.]/i;

// A vertical gap larger than line-height * this ratio starts a new paragraph.
const PARAGRAPH_GAP_RATIO = 1.8;

// A horizontal gap (or whitespace-only piece) wider than
// `fontHeight * COLUMN_GAP_RATIO` is treated as a column separator.
const COLUMN_GAP_RATIO = 1.4;

interface Classified {
  kind: "heading" | "list" | "body" | "code" | "caption";
  level?: number;
  ordered?: boolean;
  cells?: string[]; // present when the line looks like a table row
}

function computeBodySize(lines: Line[]): number {
  const weight = new Map<number, number>();
  for (const line of lines) {
    const h = Math.round(line.height);
    weight.set(h, (weight.get(h) ?? 0) + line.text.length);
  }
  let bodySize = 10;
  let best = -1;
  for (const [h, w] of weight) {
    if (w > best) {
      best = w;
      bodySize = h;
    }
  }
  return bodySize;
}

function headingLevel(height: number, bodySize: number): number | null {
  const ratio = height / bodySize;
  if (ratio >= 1.8) return 1;
  if (ratio >= 1.5) return 2;
  if (ratio >= 1.25) return 3;
  if (ratio >= 1.12) return 4;
  return null;
}

// Split a line into table cells. Handles two layouts:
//   1. wide positional gaps between pieces, and
//   2. whitespace-only "filler" pieces that occupy the gap (e.g. pdfkit).
function splitIntoCells(line: Line): string[] {
  const gap = line.height * COLUMN_GAP_RATIO;
  const cells: string[] = [];
  let current = "";
  let prevEnd: number | null = null;

  for (const piece of line.pieces) {
    const isBlank = piece.text.trim() === "";
    const gapBefore = prevEnd === null ? 0 : piece.x - prevEnd;
    const isSeparator =
      gapBefore > gap || (isBlank && piece.width > gap);

    if (isSeparator && current.trim() !== "") {
      cells.push(current.trim());
      current = "";
    }
    if (!isBlank) {
      if (current && !/\s$/.test(current)) current += " ";
      current += piece.text;
    }
    prevEnd = piece.x + piece.width;
  }
  if (current.trim() !== "") cells.push(current.trim());
  return cells;
}

function classify(
  line: Line,
  bodySize: number,
  opts: ConvertOptions
): Classified {
  if (opts.detectTables) {
    const cells = splitIntoCells(line);
    if (cells.length >= 2) return { kind: "body", cells };
  }
  if (CAPTION_RE.test(line.text)) return { kind: "caption" };
  if (BULLET_RE.test(line.text)) return { kind: "list", ordered: false };
  if (ORDERED_RE.test(line.text)) return { kind: "list", ordered: true };
  if (line.pieces.length > 0 && line.pieces.every((p) => MONO_HINT.test(p.fontName))) {
    return { kind: "code" };
  }
  if (opts.detectHeadings) {
    const level = headingLevel(line.height, bodySize);
    if (level && line.text.length <= 120) return { kind: "heading", level };
  }
  return { kind: "body" };
}

export function linesToBlocks(
  pages: PageContent[],
  opts: ConvertOptions
): Block[] {
  const cleanPages = stripRunningHeadersFooters(pages);
  const allLines = cleanPages.flatMap((p) => p.lines);
  const bodySize = computeBodySize(allLines);
  const blocks: Block[] = [];

  let paragraph: string[] = [];
  let list: string[] = [];
  let listXs: number[] = [];
  let listOrdered = false;
  let code: string[] = [];
  let tableRows: string[][] = [];

  const flushParagraph = () => {
    if (paragraph.length) {
      blocks.push({ type: "paragraph", text: paragraph.join(" ").trim() });
      paragraph = [];
    }
  };
  const flushList = () => {
    if (list.length) {
      blocks.push({
        type: "list",
        items: list,
        levels: xsToLevels(listXs),
        ordered: listOrdered,
      });
      list = [];
      listXs = [];
    }
  };
  const flushCode = () => {
    if (code.length) {
      blocks.push({ type: "code", text: code.join("\n") });
      code = [];
    }
  };
  const flushTable = () => {
    if (tableRows.length) {
      if (isValidTable(tableRows)) {
        blocks.push({ type: "table", rows: normalizeTable(tableRows) });
      } else {
        for (const row of tableRows) {
          blocks.push({ type: "paragraph", text: row.join("  ").trim() });
        }
      }
      tableRows = [];
    }
  };
  const flushAll = () => {
    flushParagraph();
    flushList();
    flushCode();
    flushTable();
  };

  let prev: Line | null = null;

  for (const page of cleanPages) {
    const lines = page.lines;
    for (let li = 0; li < lines.length; li++) {
      const line = lines[li];
      if (line.text.trim() === "") {
        flushAll();
        prev = null;
        continue;
      }
      const samePage = prev !== null && li > 0;
      const c = classify(line, bodySize, opts);

      if (c.cells && c.cells.length >= 2) {
        flushParagraph();
        flushList();
        flushCode();
        tableRows.push(c.cells);
        prev = line;
        continue;
      }
      flushTable();

      switch (c.kind) {
        case "heading":
          flushAll();
          blocks.push({
            type: "heading",
            level: c.level,
            text: line.text.replace(/\s+/g, " ").trim(),
          });
          break;
        case "caption":
          flushParagraph();
          flushList();
          flushCode();
          blocks.push({
            type: "paragraph",
            text: `*${line.text.replace(/\s+/g, " ").trim()}*`,
          });
          break;
        case "list": {
          flushParagraph();
          flushCode();
          const ordered = c.ordered ?? false;
          if (list.length === 0) listOrdered = ordered;
          else if (listOrdered !== ordered) {
            // list style switched mid-stream -> start a fresh list block
            flushList();
            listOrdered = ordered;
          }
          list.push(
            line.text.replace(BULLET_RE, "").replace(ORDERED_RE, "").trim()
          );
          listXs.push(line.x);
          break;
        }
        case "code":
          flushParagraph();
          flushList();
          code.push(line.text);
          break;
        default:
          flushList();
          flushCode();
          if (paragraph.length && isParagraphBreak(prev, line, samePage)) {
            flushParagraph();
          }
          paragraph.push(line.text);
          break;
      }
      prev = line;
    }
  }

  flushAll();
  return blocks;
}

function endsSentence(text: string): boolean {
  return /[.!?:;。！？”"’')\]]$/.test(text.trim());
}

// Decide whether `cur` starts a new paragraph relative to `prev`.
function isParagraphBreak(
  prev: Line | null,
  cur: Line,
  samePage: boolean
): boolean {
  if (!prev) return false;
  if (!samePage) {
    // Across a page boundary, only continue the paragraph when the previous
    // line did not finish a sentence and the next line starts lower-case.
    const continues =
      !endsSentence(prev.text) && /^[a-z(]/.test(cur.text.trim());
    return !continues;
  }
  const gap = prev.y - cur.y;
  const lineHeight = Math.max(prev.height, cur.height);
  return gap > lineHeight * PARAGRAPH_GAP_RATIO;
}

// Map the left-edge x of each list item to a nesting level (0-based) by
// clustering distinct indentation positions.
function xsToLevels(xs: number[]): number[] {
  const TOL = 4;
  const stops: number[] = [];
  for (const x of [...xs].sort((a, b) => a - b)) {
    if (stops.length === 0 || x - stops[stops.length - 1] > TOL) stops.push(x);
  }
  return xs.map((x) => {
    let level = 0;
    for (let i = 0; i < stops.length; i++) {
      if (Math.abs(x - stops[i]) <= TOL) {
        level = i;
        break;
      }
    }
    return level;
  });
}

function normalizeTable(rows: string[][]): string[][] {
  const cols = Math.max(...rows.map((r) => r.length));
  return rows.map((r) => {
    const copy = [...r];
    while (copy.length < cols) copy.push("");
    return copy;
  });
}

/** Reject single-line "tables" and prose lines split by wide gaps. */
function isValidTable(rows: string[][]): boolean {
  if (rows.length < 2) return false;

  const colCounts = rows.map((r) => r.length);
  const maxCols = Math.max(...colCounts);
  const minCols = Math.min(...colCounts);
  if (maxCols - minCols > 1) return false;

  const dominantCols = mode(colCounts);
  const aligned = rows.filter((r) => r.length === dominantCols).length;
  if (aligned / rows.length < 0.6) return false;

  const flat = rows.flat();
  const avgCellLen =
    flat.reduce((sum, c) => sum + c.length, 0) / Math.max(flat.length, 1);
  if (rows.length === 2 && maxCols === 2 && avgCellLen > 50) return false;

  return true;
}

function mode(nums: number[]): number {
  const freq = new Map<number, number>();
  for (const n of nums) freq.set(n, (freq.get(n) ?? 0) + 1);
  let best = nums[0];
  let bestCount = 0;
  for (const [n, count] of freq) {
    if (count > bestCount) {
      bestCount = count;
      best = n;
    }
  }
  return best;
}
