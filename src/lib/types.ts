export interface TextPiece {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number; // approx font size
  fontName: string;
}

export interface Line {
  pieces: TextPiece[];
  text: string;
  x: number; // left-most x
  y: number; // baseline y
  height: number; // dominant font size
}

export interface PageContent {
  pageNumber: number;
  width: number;
  height: number;
  lines: Line[];
}

export type BlockType =
  | "heading"
  | "paragraph"
  | "list"
  | "table"
  | "code";

export interface Block {
  type: BlockType;
  level?: number; // for headings 1-6
  text?: string; // paragraph / code
  items?: string[]; // list items
  levels?: number[]; // nesting level per item (parallel to items)
  ordered?: boolean; // ordered (numbered) list
  rows?: string[][]; // table rows (incl. header as row 0)
}

export type ConvertProfile = "general" | "obsidian" | "llm" | "table" | "notion" | "python";

export interface ConvertOptions {
  profile: ConvertProfile;
  detectTables: boolean;
  detectHeadings: boolean;
  tablesOnly: boolean;
}

export interface ConvertResult {
  markdown: string;
  warnings: string[];
  stats: {
    pages: number;
    durationMs: number;
    tables: number;
    blocks: number;
  };
}

export const DEFAULT_OPTIONS: ConvertOptions = {
  profile: "general",
  detectTables: true,
  detectHeadings: true,
  tablesOnly: false,
};
