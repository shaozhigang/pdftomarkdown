import { parsePdf } from "@/lib/pdf/parse";
import { linesToBlocks } from "@/lib/layout/blocks";
import { blocksToMarkdown } from "@/lib/markdown/serialize";
import {
  applyProfileToMarkdown,
  filterBlocksForProfile,
  optionsForProfile,
  type ProfileMeta,
} from "@/lib/profiles";
import {
  DEFAULT_OPTIONS,
  type ConvertOptions,
  type ConvertProfile,
  type ConvertResult,
} from "@/lib/types";

export async function convertPdfToMarkdown(
  data: ArrayBuffer,
  options: Partial<ConvertOptions> & { fileName?: string } = {}
): Promise<ConvertResult> {
  const profile: ConvertProfile =
    options.profile ?? DEFAULT_OPTIONS.profile;
  const opts: ConvertOptions = {
    ...optionsForProfile(profile),
    ...options,
    profile,
  };
  const started = performance.now();

  const pages = await parsePdf(data, { extractImages: opts.includeImages });
  const totalLines = pages.reduce((n, p) => n + p.lines.length, 0);

  const rawBlocks = linesToBlocks(pages, opts);
  const blocks = filterBlocksForProfile(rawBlocks, opts);
  const tableCount = blocks.filter((b) => b.type === "table").length;
  const imageCount = blocks.filter((b) => b.type === "image").length;
  const markdownCore = blocksToMarkdown(blocks);

  const meta: ProfileMeta = {
    fileName: options.fileName ?? "document.pdf",
    pages: pages.length,
  };

  const warnings: string[] = [];
  if (totalLines === 0) {
    warnings.push("warningNoText");
  }
  if (opts.tablesOnly && tableCount === 0 && totalLines > 0) {
    warnings.push("warningNoTables");
  }

  return {
    markdown: applyProfileToMarkdown(markdownCore, profile, meta),
    warnings,
    stats: {
      pages: pages.length,
      durationMs: Math.round(performance.now() - started),
      tables: tableCount,
      blocks: blocks.length,
      images: imageCount,
    },
  };
}
