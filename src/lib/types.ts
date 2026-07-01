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

export interface PageImage {
  dataUrl: string;
  x: number; // left edge in PDF user space
  y: number; // top edge in PDF user space (used for reading-order placement)
  width: number; // rendered width in device px
  height: number; // rendered height in device px
}

export interface PageContent {
  pageNumber: number;
  width: number;
  height: number;
  lines: Line[];
  images?: PageImage[];
}

export type BlockType =
  | "heading"
  | "paragraph"
  | "list"
  | "table"
  | "code"
  | "image";

export interface Block {
  type: BlockType;
  level?: number; // for headings 1-6
  text?: string; // paragraph / code
  items?: string[]; // list items
  levels?: number[]; // nesting level per item (parallel to items)
  ordered?: boolean; // ordered (numbered) list
  rows?: string[][]; // table rows (incl. header as row 0)
  src?: string; // image data URL
  alt?: string; // image alt text
}

export type ConvertProfile =
  | "general"
  | "obsidian"
  | "llm"
  | "table"
  | "notion"
  | "python"
  | "images";

export interface ConvertOptions {
  profile: ConvertProfile;
  detectTables: boolean;
  detectHeadings: boolean;
  tablesOnly: boolean;
  includeImages: boolean;
}

export interface ConvertResult {
  markdown: string;
  warnings: string[];
  stats: {
    pages: number;
    durationMs: number;
    tables: number;
    blocks: number;
    images: number;
  };
}

export const DEFAULT_OPTIONS: ConvertOptions = {
  profile: "general",
  detectTables: true,
  detectHeadings: true,
  tablesOnly: false,
  includeImages: true,
};
