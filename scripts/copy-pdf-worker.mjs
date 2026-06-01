import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const src = resolve(
  root,
  "node_modules/pdfjs-dist/build/pdf.worker.min.mjs"
);
const destDir = resolve(root, "public");
const dest = resolve(destDir, "pdf.worker.min.mjs");

mkdirSync(destDir, { recursive: true });
copyFileSync(src, dest);
console.log(`[copy-pdf-worker] copied worker -> ${dest}`);
