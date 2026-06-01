import type { Block } from "@/lib/types";

function escapeCell(text: string): string {
  return text.replace(/\|/g, "\\|").trim();
}

function serializeTable(rows: string[][]): string {
  if (rows.length === 0) return "";
  const header = rows[0];
  const body = rows.slice(1);
  const headerLine = `| ${header.map(escapeCell).join(" | ")} |`;
  const sepLine = `| ${header.map(() => "---").join(" | ")} |`;
  const bodyLines = body.map(
    (r) => `| ${r.map(escapeCell).join(" | ")} |`
  );
  return [headerLine, sepLine, ...bodyLines].join("\n");
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
        out.push(
          (block.items ?? [])
            .map((item, i) => {
              const indent = "  ".repeat(levels[i] ?? 0);
              return block.ordered
                ? `${indent}${i + 1}. ${item}`
                : `${indent}- ${item}`;
            })
            .join("\n")
        );
        break;
      }
      case "code":
        out.push("```\n" + (block.text ?? "") + "\n```");
        break;
      case "table":
        if (block.rows?.length) out.push(serializeTable(block.rows));
        break;
    }
  }

  return out.join("\n\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";
}
