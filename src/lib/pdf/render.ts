import * as pdfjs from "pdfjs-dist";

// pdf.js needs its worker; the file is copied into /public by the
// `copy-pdf-worker` script (see package.json).
if (typeof window !== "undefined") {
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
}

export interface RenderedPage {
  pageNumber: number;
  dataUrl: string;
  width: number;
  height: number;
}

// Cap rendered pages so very large PDFs don't blow up memory in the preview.
const MAX_PREVIEW_PAGES = 30;

/**
 * Render PDF pages to PNG data URLs for an at-a-glance "original" preview.
 * Note: pdf.js detaches the passed ArrayBuffer, so callers should pass a copy
 * if they also need the buffer elsewhere (e.g. the text converter).
 */
export async function renderPdfPages(
  data: ArrayBuffer,
  scale = 1.5
): Promise<RenderedPage[]> {
  const doc = await pdfjs.getDocument({ data }).promise;
  const pages: RenderedPage[] = [];
  const count = Math.min(doc.numPages, MAX_PREVIEW_PAGES);

  try {
    for (let i = 1; i <= count; i++) {
      const page = await doc.getPage(i);
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      const ctx = canvas.getContext("2d");
      if (!ctx) continue;
      await page.render({ canvasContext: ctx, viewport }).promise;
      pages.push({
        pageNumber: i,
        dataUrl: canvas.toDataURL("image/png"),
        width: canvas.width,
        height: canvas.height,
      });
      // free the canvas
      canvas.width = 0;
      canvas.height = 0;
    }
  } finally {
    await doc.destroy();
  }

  return pages;
}
