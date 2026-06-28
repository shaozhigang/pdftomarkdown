export interface OcrProgress {
  page: number;
  totalPages: number;
  progress: number; // 0..1 for the current page
}

export interface OcrHandlers {
  onProgress?: (p: OcrProgress) => void;
  /** Called with the joined Markdown after each page is recognized. */
  onPartial?: (markdown: string) => void;
}

/** Light cleanup to turn raw OCR text into readable Markdown paragraphs. */
function cleanupOcrText(text: string): string {
  return text
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/-\n(\w)/g, "$1") // join hyphenated line breaks
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Recognize an ordered list of page images and assemble them into Markdown.
 * Runs entirely in the browser via tesseract.js (WASM). Only the language
 * model is fetched from a CDN — the user's file never leaves the device.
 */
export async function ocrImagesToMarkdown(
  images: string[],
  lang: string,
  handlers: OcrHandlers = {}
): Promise<string> {
  const { createWorker } = await import("tesseract.js");
  const total = images.length;
  let current = 0;

  const worker = await createWorker(lang, 1, {
    logger: (m) => {
      if (m.status === "recognizing text" && handlers.onProgress) {
        handlers.onProgress({
          page: current + 1,
          totalPages: total,
          progress: m.progress,
        });
      }
    },
  });

  const parts: string[] = [];
  try {
    for (current = 0; current < total; current++) {
      const { data } = await worker.recognize(images[current]);
      parts.push(cleanupOcrText(data.text));
      handlers.onProgress?.({
        page: current + 1,
        totalPages: total,
        progress: 1,
      });
      handlers.onPartial?.(parts.filter(Boolean).join("\n\n"));
    }
  } finally {
    await worker.terminate();
  }

  return parts.filter(Boolean).join("\n\n");
}
