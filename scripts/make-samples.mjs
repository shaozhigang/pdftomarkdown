import PDFDocument from "pdfkit";
import { createWriteStream, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, "..", "samples");
mkdirSync(outDir, { recursive: true });

function newDoc(name) {
  const doc = new PDFDocument({ margin: 50, size: "A4" });
  doc.pipe(createWriteStream(resolve(outDir, name)));
  return doc;
}

// --- Sample 1: headings + paragraphs ---
{
  const doc = newDoc("01-article.pdf");
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

// --- Sample 2: lists ---
{
  const doc = newDoc("02-lists.pdf");
  doc.fontSize(20).text("Conversion Checklist");
  doc.moveDown(0.6);
  doc.fontSize(11);
  const bullets = [
    "Preserve heading hierarchy",
    "Keep tables intact",
    "Detect ordered and unordered lists",
  ];
  for (const b of bullets) doc.text("\u2022 " + b);
  doc.moveDown(0.6);
  doc.fontSize(14).text("Ordered steps");
  doc.moveDown(0.3);
  doc.fontSize(11);
  const steps = ["Upload the PDF", "Parse text content", "Serialize to Markdown"];
  steps.forEach((s, i) => doc.text(`${i + 1}. ${s}`));
  doc.end();
}

// --- Sample 3: a simple table (positioned columns) ---
{
  const doc = newDoc("03-table.pdf");
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

// --- Sample 4: two-column academic layout ---
{
  const doc = newDoc("04-twocolumn.pdf");
  doc.fontSize(20).text("Document Layout Analysis", { align: "center" });
  doc.moveDown(1);

  const top = doc.y;
  const colWidth = 230;
  const leftX = 50;
  const rightX = 312;

  const leftText =
    "Multi-column layouts are common in academic papers and magazines. " +
    "A naive parser that groups text purely by vertical position will " +
    "incorrectly merge the left and right columns into a single line. " +
    "The correct approach is to first detect column boundaries by analysing " +
    "the horizontal distribution of text, then read each column top to bottom.";

  const rightText =
    "Once columns are identified, the reading order becomes unambiguous. " +
    "Each column is treated as an independent flow of blocks. " +
    "This preserves the logical structure of the document and produces " +
    "Markdown that mirrors how a human would read the page, " +
    "left column first and right column second.";

  doc.fontSize(11).text(leftText, leftX, top, { width: colWidth, align: "left" });
  doc.fontSize(11).text(rightText, rightX, top, { width: colWidth, align: "left" });
  doc.end();
}

// --- Sample 5: nested list ---
{
  const doc = newDoc("05-nested.pdf");
  doc.fontSize(20).text("Project Structure");
  doc.moveDown(0.6);
  doc.fontSize(11);
  const items = [
    { indent: 0, text: "Frontend" },
    { indent: 1, text: "Components" },
    { indent: 1, text: "Pages" },
    { indent: 0, text: "Backend" },
    { indent: 1, text: "API routes" },
    { indent: 2, text: "Auth middleware" },
    { indent: 0, text: "Docs" },
  ];
  for (const it of items) {
    doc.text("\u2022 " + it.text, 50 + it.indent * 20, doc.y);
  }
  doc.end();
}

// --- Sample 6: table with a spanning (merged) header cell ---
{
  const doc = newDoc("06-complex-table.pdf");
  doc.fontSize(18).text("Quarterly Results");
  doc.moveDown(0.8);
  doc.fontSize(11);
  const cols = [60, 200, 340];
  let y = doc.y;
  // A merged header spanning the data columns
  doc.text("Region", 60, y);
  doc.text("2025 Revenue", 200, y);
  y += 20;
  const rows = [
    ["Region", "Q1", "Q2"],
    ["North", "$120k", "$140k"],
    ["South", "$90k", "$110k"],
  ];
  for (const row of rows) {
    row.forEach((cell, c) => doc.text(cell, cols[c], y));
    y += 20;
  }
  doc.end();
}

// --- Sample 7: multi-page with running header, page numbers, cross-page paragraph ---
{
  const doc = newDoc("07-multipage.pdf");
  const W = doc.page.width;
  const H = doc.page.height;
  const deco = (n) => {
    doc.fontSize(9).fillColor("gray");
    doc.text("Confidential Report", 50, 20, { lineBreak: false });
    doc.text(String(n), W / 2 - 4, H - 30, { lineBreak: false });
    doc.fillColor("black");
  };

  deco(1);
  doc.fontSize(20).text("Annual Overview", 50, 70);
  doc.moveDown(0.5);
  doc
    .fontSize(11)
    .text(
      "This report summarises the key results for the year. The narrative here is intentionally written to run long and end without any natural",
      50,
      doc.y,
      { width: W - 100 }
    );

  doc.addPage();
  deco(2);
  doc
    .fontSize(11)
    .text(
      "paragraph break, which lets us verify that cross-page continuation merges the text correctly while the running header and page number are stripped.",
      50,
      120,
      { width: W - 100 }
    );
  doc.end();
}

// --- Sample 8: figure caption mixed with prose ---
{
  const doc = newDoc("08-figure.pdf");
  doc.fontSize(18).text("System Design");
  doc.moveDown(0.6);
  doc
    .fontSize(11)
    .text(
      "The architecture separates parsing from layout analysis so each stage can be tested independently."
    );
  doc.moveDown(0.8);
  // A drawn rectangle stands in for an image (not extractable as text).
  doc.rect(50, doc.y, 200, 80).stroke();
  doc.moveDown(6);
  doc.fontSize(10).text("Figure 1: High-level conversion pipeline.");
  doc.moveDown(0.8);
  doc
    .fontSize(11)
    .text(
      "Each component communicates through plain data structures, which keeps the engine portable across browser and server runtimes."
    );
  doc.end();
}

console.log("[make-samples] wrote sample PDFs to", outDir);
