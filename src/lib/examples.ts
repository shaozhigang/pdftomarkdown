import type { ConvertProfile } from "@/lib/types";

/** Public paths to demo PDFs (served from public/samples/). */
export const DEMO_PDF_BY_PROFILE: Record<ConvertProfile, string> = {
  general: "/samples/demo-article.pdf",
  obsidian: "/samples/demo-notes.pdf",
  llm: "/samples/demo-article.pdf",
  table: "/samples/demo-table.pdf",
};

export const DEMO_FILE_NAME_BY_PROFILE: Record<ConvertProfile, string> = {
  general: "demo-article.pdf",
  obsidian: "demo-notes.pdf",
  llm: "demo-article.pdf",
  table: "demo-table.pdf",
};

/** Slugs for specialized mode cards on the home page showcase. */
export const SPECIALIZED_MODE_LINKS: {
  profile: Exclude<ConvertProfile, "general">;
  slug: string;
  msgKey: "obsidian" | "llm" | "table";
}[] = [
  {
    profile: "obsidian",
    slug: "pdf-to-markdown-for-obsidian",
    msgKey: "obsidian",
  },
  {
    profile: "llm",
    slug: "pdf-to-markdown-for-chatgpt",
    msgKey: "llm",
  },
  {
    profile: "table",
    slug: "pdf-table-to-markdown",
    msgKey: "table",
  },
];
