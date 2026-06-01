import { parsePdf } from "@/lib/pdf/parse";
import { linesToBlocks } from "@/lib/layout/blocks";
import { blocksToMarkdown } from "@/lib/markdown/serialize";
import {
  DEFAULT_OPTIONS,
  type ConvertOptions,
  type ConvertResult,
} from "@/lib/types";

export async function convertPdfToMarkdown(
  data: ArrayBuffer,
  options: Partial<ConvertOptions> = {}
): Promise<ConvertResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const started = performance.now();

  const pages = await parsePdf(data);
  const totalLines = pages.reduce((n, p) => n + p.lines.length, 0);

  const blocks = linesToBlocks(pages, opts);
  const markdown = blocksToMarkdown(blocks);

  const warnings: string[] = [];
  if (totalLines === 0) {
    warnings.push(
      "No text could be extracted. This may be a scanned or image-only PDF. OCR support is on the roadmap."
    );
  }

  return {
    markdown,
    warnings,
    stats: {
      pages: pages.length,
      durationMs: Math.round(performance.now() - started),
    },
  };
}
