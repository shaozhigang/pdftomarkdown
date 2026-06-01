import { readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
import { piecesFromItems } from "@/lib/pdf/parse";
import { layoutPageLines } from "@/lib/pdf/lines";
import { linesToBlocks } from "@/lib/layout/blocks";
import { blocksToMarkdown } from "@/lib/markdown/serialize";
import { DEFAULT_OPTIONS, type PageContent } from "@/lib/types";

const __dirname = dirname(fileURLToPath(import.meta.url));
const samplesDir = resolve(__dirname, "..", "samples");

async function parseInNode(buf: Buffer): Promise<PageContent[]> {
  const data = new Uint8Array(buf);
  const doc = await pdfjs.getDocument({ data }).promise;
  const pages: PageContent[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const viewport = page.getViewport({ scale: 1 });
    const content = await page.getTextContent();
    pages.push({
      pageNumber: i,
      width: viewport.width,
      height: viewport.height,
      lines: layoutPageLines(
        piecesFromItems(content.items as unknown[]),
        viewport.width
      ),
    });
  }
  await doc.destroy();
  return pages;
}

async function run() {
  const files = readdirSync(samplesDir).filter((f) => f.endsWith(".pdf")).sort();
  const debug = process.env.DEBUG === "1";
  for (const file of files) {
    const buf = readFileSync(resolve(samplesDir, file));
    const pages = await parseInNode(buf);
    if (debug) {
      console.log("\n##### DEBUG lines for", file);
      for (const p of pages) {
        for (const ln of p.lines) {
          console.log(
            `  y=${ln.y.toFixed(0)} h=${ln.height.toFixed(1)} pieces=${ln.pieces.length} :: ` +
              ln.pieces
                .map((pc) => `[x=${pc.x.toFixed(0)} w=${pc.width.toFixed(0)} "${pc.text}"]`)
                .join(" ")
          );
        }
      }
    }
    const blocks = linesToBlocks(pages, DEFAULT_OPTIONS);
    const md = blocksToMarkdown(blocks);
    const counts = blocks.reduce<Record<string, number>>((acc, b) => {
      acc[b.type] = (acc[b.type] ?? 0) + 1;
      return acc;
    }, {});
    console.log("\n" + "=".repeat(70));
    console.log(`FILE: ${file}  | blocks: ${JSON.stringify(counts)}`);
    console.log("-".repeat(70));
    console.log(md);
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
