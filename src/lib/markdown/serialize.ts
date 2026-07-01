import type { Block } from "@/lib/types";

function escapeCell(text: string): string {
  return text.replace(/\|/g, "\\|").trim();
}

function syntheticHeaders(colCount: number): string[] {
  return Array.from({ length: colCount }, (_, i) => `Column ${i + 1}`);
}

/** Heuristic: first row is a header only when it looks different from data rows. */
function splitTableRows(rows: string[][]): {
  header: string[];
  body: string[][];
} {
  if (rows.length === 0) return { header: [], body: [] };
  if (rows.length === 1) {
    return { header: syntheticHeaders(rows[0].length), body: rows };
  }

  const first = rows[0];
  const rest = rows.slice(1);
  const avgLen = (cells: string[]) =>
    cells.reduce((sum, c) => sum + c.length, 0) / Math.max(cells.length, 1);

  const firstAvg = avgLen(first);
  const restAvg = avgLen(rest.flat());
  const firstNumeric = first.every((c) => /^[\d.,%$€£¥+\-/\s]+$/.test(c.trim()));
  const firstLooksLikeHeader =
    !firstNumeric &&
    (firstAvg < restAvg * 0.75 ||
      first.every(
        (c) =>
          c.length > 0 &&
          c.length <= 40 &&
          /^[A-Z0-9][A-Za-z0-9\s/&()-]*$/.test(c.trim())
      ));

  if (firstLooksLikeHeader) {
    return { header: first, body: rest };
  }

  return { header: syntheticHeaders(first.length), body: rows };
}

function serializeTable(rows: string[][]): string {
  if (rows.length === 0) return "";
  const { header, body } = splitTableRows(rows);
  const headerLine = `| ${header.map(escapeCell).join(" | ")} |`;
  const sepLine = `| ${header.map(() => "---").join(" | ")} |`;
  const bodyLines = body.map(
    (r) => `| ${r.map(escapeCell).join(" | ")} |`
  );
  return [headerLine, sepLine, ...bodyLines].join("\n");
}

function serializeOrderedList(
  items: string[],
  levels: number[]
): string {
  const counters: number[] = [];
  return items
    .map((item, i) => {
      const level = levels[i] ?? 0;
      while (counters.length > level + 1) counters.pop();
      while (counters.length <= level) counters.push(0);
      counters[level] += 1;
      const indent = "  ".repeat(level);
      return `${indent}${counters[level]}. ${item}`;
    })
    .join("\n");
}

function serializeUnorderedList(
  items: string[],
  levels: number[]
): string {
  return items
    .map((item, i) => {
      const indent = "  ".repeat(levels[i] ?? 0);
      return `${indent}- ${item}`;
    })
    .join("\n");
}

export function blocksToMarkdown(blocks: Block[]): string {
  const out: string[] = [];

  for (const block of blocks) {
    switch (block.type) {
      case "heading":
        out.push(`${"#".repeat(block.level ?? 1)} ${block.text ?? ""}`);
        break;
      case "paragraph":
        if (block.text?.trim()) out.push(block.text.trim());
        break;
      case "list": {
        const levels = block.levels ?? [];
        const items = block.items ?? [];
        out.push(
          block.ordered
            ? serializeOrderedList(items, levels)
            : serializeUnorderedList(items, levels)
        );
        break;
      }
      case "code":
        out.push("```\n" + (block.text ?? "") + "\n```");
        break;
      case "table":
        if (block.rows?.length) out.push(serializeTable(block.rows));
        break;
      case "image":
        if (block.src) out.push(`![${block.alt ?? ""}](${block.src})`);
        break;
    }
  }

  return out.join("\n\n").replace(/\n{3,}/g, "\n\n").trim();
}
