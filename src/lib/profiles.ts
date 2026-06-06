import type { Block, ConvertOptions, ConvertProfile } from "@/lib/types";

export function slugToProfile(slug: string): ConvertProfile {
  switch (slug) {
    case "pdf-to-markdown-for-obsidian":
      return "obsidian";
    case "pdf-to-markdown-for-chatgpt":
      return "llm";
    case "pdf-table-to-markdown":
      return "table";
    default:
      return "general";
  }
}

export function optionsForProfile(profile: ConvertProfile): ConvertOptions {
  switch (profile) {
    case "table":
      return {
        profile: "table",
        detectTables: true,
        detectHeadings: false,
        tablesOnly: true,
      };
    case "obsidian":
      return {
        profile: "obsidian",
        detectTables: true,
        detectHeadings: true,
        tablesOnly: false,
      };
    case "llm":
      return {
        profile: "llm",
        detectTables: true,
        detectHeadings: true,
        tablesOnly: false,
      };
    default:
      return {
        profile: "general",
        detectTables: true,
        detectHeadings: true,
        tablesOnly: false,
      };
  }
}

export function filterBlocksForProfile(
  blocks: Block[],
  opts: ConvertOptions
): Block[] {
  let out = blocks;

  if (opts.tablesOnly) {
    out = out.filter((b) => b.type === "table");
  }

  if (opts.profile === "llm") {
    out = out.map((b) => {
      if (b.type === "heading" && b.level && b.level > 3) {
        return { ...b, level: 3 };
      }
      return b;
    });
  }

  return out;
}

function titleFromFileName(fileName: string): string {
  return fileName
    .replace(/\.pdf$/i, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function yamlEscape(value: string): string {
  if (/[:#\n"'&*]/.test(value) || value.startsWith(" ")) {
    return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
  }
  return value;
}

function obsidianFrontmatter(title: string): string {
  const today = new Date().toISOString().slice(0, 10);
  return [
    "---",
    `title: ${yamlEscape(title)}`,
    "source: pdf",
    `created: ${today}`,
    "tags:",
    "  - pdf-import",
    "---",
    "",
  ].join("\n");
}

function llmFrontmatter(title: string, pages: number): string {
  const today = new Date().toISOString();
  return [
    "---",
    `title: ${yamlEscape(title)}`,
    `pages: ${pages}`,
    `extracted_at: ${today}`,
    "format: markdown",
    "usage: llm-rag",
    "---",
    "",
  ].join("\n");
}

/** Insert RAG-friendly chunk markers before top-level sections. */
function insertChunkBoundaries(markdown: string): string {
  return markdown.replace(
    /(^|\n\n)(#{1,2} )/g,
    (_match, prefix: string, heading: string) => {
      if (prefix === "") return heading;
      return `${prefix}<!-- chunk -->\n${heading}`;
    }
  );
}

function compactForLlm(markdown: string): string {
  return markdown
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export interface ProfileMeta {
  fileName: string;
  pages: number;
}

export function applyProfileToMarkdown(
  markdown: string,
  profile: ConvertProfile,
  meta: ProfileMeta
): string {
  const title = titleFromFileName(meta.fileName);
  let out = markdown.trim();

  switch (profile) {
    case "obsidian": {
      const body =
        out.startsWith("#") || out.startsWith("---")
          ? out
          : `# ${title}\n\n${out}`;
      return obsidianFrontmatter(title) + body + "\n";
    }
    case "llm": {
      out = compactForLlm(out);
      out = insertChunkBoundaries(out);
      return llmFrontmatter(title, meta.pages) + out + "\n";
    }
    case "table":
      return out ? out + "\n" : "";
    default:
      return out ? out + "\n" : "";
  }
}
