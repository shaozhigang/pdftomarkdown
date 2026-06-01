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
      "未提取到任何文本,这可能是扫描件或图片型 PDF。OCR 支持将在后续版本提供。"
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
