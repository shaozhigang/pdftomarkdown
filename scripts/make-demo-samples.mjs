import PDFDocument from "pdfkit";
import { createWriteStream, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, "..", "public", "samples");
mkdirSync(outDir, { recursive: true });

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

console.log("[make-demo-samples] wrote demo PDFs to", outDir);
