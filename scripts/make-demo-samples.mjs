import PDFDocument from "pdfkit";
import { createWriteStream, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateSync } from "node:zlib";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, "..", "public", "samples");
mkdirSync(outDir, { recursive: true });

// --- Minimal RGB PNG encoder (no deps) so demos have a real image XObject. ---
const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const typeBuf = Buffer.from(type, "ascii");
  const body = Buffer.concat([typeBuf, data]);
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

function makePng(width, height, pixel) {
  const raw = Buffer.alloc((width * 3 + 1) * height);
  let o = 0;
  for (let y = 0; y < height; y++) {
    raw[o++] = 0; // no filter
    for (let x = 0; x < width; x++) {
      const [r, g, b] = pixel(x, y);
      raw[o++] = r;
      raw[o++] = g;
      raw[o++] = b;
    }
  }
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type: RGB
  return Buffer.concat([
    sig,
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", deflateSync(raw)),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

function newDoc(name) {
  const doc = new PDFDocument({ margin: 50, size: "A4" });
  doc.pipe(createWriteStream(resolve(outDir, name)));
  return doc;
}

// demo-article.pdf — headings + paragraphs (general + llm)
{
  const doc = newDoc("demo-article.pdf");
  doc.fontSize(24).text("Getting Started with RAG", { align: "left" });
  doc.moveDown(0.5);
  doc
    .fontSize(11)
    .text(
      "Retrieval augmented generation combines a language model with an external knowledge base. The model retrieves relevant chunks and uses them to ground its answers, reducing hallucination."
    );
  doc.moveDown(0.8);
  doc.fontSize(17).text("Why Markdown");
  doc.moveDown(0.4);
  doc
    .fontSize(11)
    .text(
      "Markdown is compact and structured, which makes it the preferred input format for large language models. Clean headings and lists help the model understand document hierarchy."
    );
  doc.moveDown(0.8);
  doc.fontSize(14).text("Next Steps");
  doc.moveDown(0.4);
  doc
    .fontSize(11)
    .text(
      "Convert your source documents to Markdown, chunk them, and store the embeddings in a vector database."
    );
  doc.end();
}

// demo-table.pdf — pricing table (table mode)
{
  const doc = newDoc("demo-table.pdf");
  doc.fontSize(18).text("Pricing");
  doc.moveDown(0.8);
  doc.fontSize(11);
  const cols = [60, 240, 400];
  const rows = [
    ["Plan", "Features", "Price"],
    ["Free", "Single file, basic", "$0"],
    ["Pro", "Batch, tables, OCR", "$9/mo"],
    ["API", "Programmatic access", "Usage"],
  ];
  let y = doc.y;
  for (const row of rows) {
    row.forEach((cell, c) => doc.text(cell, cols[c], y));
    y += 20;
  }
  doc.end();
}

// demo-notes.pdf — research notes (obsidian mode)
{
  const doc = newDoc("demo-notes.pdf");
  doc.fontSize(22).text("Literature Review Notes", { align: "left" });
  doc.moveDown(0.6);
  doc
    .fontSize(11)
    .text(
      "Summary of key papers on retrieval-augmented generation and knowledge management workflows."
    );
  doc.moveDown(0.8);
  doc.fontSize(16).text("Key Findings");
  doc.moveDown(0.4);
  doc.fontSize(11);
  const bullets = [
    "Markdown preserves document structure with minimal tokens",
    "Local conversion keeps private research notes secure",
    "Tables and nested lists import cleanly into Obsidian",
  ];
  for (const b of bullets) doc.text("\u2022 " + b);
  doc.moveDown(0.6);
  doc.fontSize(14).text("Action Items");
  doc.moveDown(0.3);
  doc.fontSize(11);
  const steps = [
    "Convert source PDFs to Markdown",
    "Organize notes in the vault by topic",
    "Link related concepts with wikilinks",
  ];
  steps.forEach((s, i) => doc.text(`${i + 1}. ${s}`));
  doc.end();
}

// demo-images.pdf — text + an embedded chart image (images mode)
{
  const doc = newDoc("demo-images.pdf");
  doc.fontSize(22).text("Quarterly Report");
  doc.moveDown(0.5);
  doc
    .fontSize(11)
    .text(
      "This report mixes text with figures. The converter extracts each embedded image and places it inline in the Markdown output."
    );
  doc.moveDown(0.8);

  // A simple bar-chart-style image drawn procedurally into a PNG.
  const W = 420;
  const H = 220;
  const bars = [0.45, 0.7, 0.55, 0.9, 0.8];
  const barW = Math.floor(W / (bars.length * 2));
  const chart = makePng(W, H, (x, y) => {
    // light background with a subtle top-to-bottom gradient
    let r = 246 - Math.floor((y / H) * 12);
    let g = 248 - Math.floor((y / H) * 12);
    let b = 252;
    // baseline axis
    if (y >= H - 24 && y <= H - 22) return [203, 213, 225];
    // bars
    const slot = Math.floor(x / (barW * 2));
    const inBar = x % (barW * 2) < barW && slot < bars.length;
    if (inBar) {
      const barTop = H - 24 - Math.floor(bars[slot] * (H - 60));
      if (y >= barTop && y < H - 24) {
        const t = slot / (bars.length - 1);
        return [80 + Math.floor(t * 40), 90 + Math.floor(t * 60), 220];
      }
    }
    return [r, g, b];
  });
  doc.image(chart, { width: 360 });
  doc.moveDown(0.3);
  doc.fontSize(10).fillColor("#666").text("Figure 1. Revenue by quarter");
  doc.fillColor("#000");
  doc.moveDown(0.8);
  doc
    .fontSize(11)
    .text(
      "Revenue grew steadily across the year, with the strongest performance in Q4 driven by new product launches."
    );
  doc.end();
}

console.log("[make-demo-samples] wrote demo PDFs to", outDir);
