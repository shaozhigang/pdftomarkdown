import * as pdfjs from "pdfjs-dist";
import type { TextItem } from "pdfjs-dist/types/src/display/api";
import type { PageContent, TextPiece } from "@/lib/types";
import { layoutPageLines } from "@/lib/pdf/lines";
import { extractPageImages } from "@/lib/pdf/images";

// Point pdf.js to its worker. The file is copied into /public by the
// `copy-pdf-worker` script (see package.json) so webpack never processes it.
if (typeof window !== "undefined") {
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
}

export function piecesFromItems(items: unknown[]): TextPiece[] {
  const pieces: TextPiece[] = [];
  for (const item of items) {
    const t = item as TextItem;
    if (!("str" in t) || t.str === "") continue;
    const [a, , , d, e, f] = t.transform;
    pieces.push({
      text: t.str,
      x: e,
      y: f,
      width: t.width ?? 0,
      height: Math.abs(d || a) || t.height || 10,
      fontName: t.fontName ?? "",
    });
  }
  return pieces;
}

export async function parsePdf(
  data: ArrayBuffer,
  opts: { extractImages?: boolean } = {}
): Promise<PageContent[]> {
  const loadingTask = pdfjs.getDocument({ data });
  const doc = await loadingTask.promise;
  const pages: PageContent[] = [];

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const viewport = page.getViewport({ scale: 1 });
    const content = await page.getTextContent();

    const images = opts.extractImages
      ? await extractPageImages(page)
      : undefined;

    pages.push({
      pageNumber: i,
      width: viewport.width,
      height: viewport.height,
      lines: layoutPageLines(piecesFromItems(content.items), viewport.width),
      images,
    });
  }

  await doc.destroy();
  return pages;
}
