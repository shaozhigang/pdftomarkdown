import { parsePdf } from "@/lib/pdf/parse";
import { linesToBlocks } from "@/lib/layout/blocks";
import { blocksToMarkdown } from "@/lib/markdown/serialize";
import { optionsForProfile } from "@/lib/profiles";
import { blocksToDocx } from "@/lib/word/serialize";

export interface WordConvertResult {
  /** The generated .docx file. */
  blob: Blob;
  /** Markdown rendering of the same blocks, used only for the on-screen preview. */
  markdownPreview: string;
  warnings: string[];
  stats: {
    pages: number;
    durationMs: number;
    tables: number;
    images: number;
    blocks: number;
  };
}

function titleFromFileName(fileName: string): string {
  return (
    fileName
      .replace(/\.pdf$/i, "")
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim() || "document"
  );
}

export async function convertPdfToWord(
  data: ArrayBuffer,
  options: { fileName?: string } = {}
): Promise<WordConvertResult> {
  const started = performance.now();
  const opts = optionsForProfile("general");

  const pages = await parsePdf(data, { extractImages: opts.includeImages });
  const totalLines = pages.reduce((n, p) => n + p.lines.length, 0);

  const blocks = linesToBlocks(pages, opts);
  const tableCount = blocks.filter((b) => b.type === "table").length;
  const imageCount = blocks.filter((b) => b.type === "image").length;

  const title = titleFromFileName(options.fileName ?? "document.pdf");
  const blob = await blocksToDocx(blocks, { title });
  const markdownPreview = blocksToMarkdown(blocks);

  const warnings: string[] = [];
  if (totalLines === 0) warnings.push("warningNoText");

  return {
    blob,
    markdownPreview,
    warnings,
    stats: {
      pages: pages.length,
      durationMs: Math.round(performance.now() - started),
      tables: tableCount,
      images: imageCount,
      blocks: blocks.length,
    },
  };
}
