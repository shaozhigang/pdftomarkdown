/**
 * Trim es Home to verified Spanish (SEO + hero); long sections fall back to English.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const path = join(root, "scripts/p1/es.json");
const data = JSON.parse(readFileSync(path, "utf8"));

const keep = ["metaTitle", "metaDescription", "keywords", "h1", "nav", "hero", "preview", "convert", "th"];
const home = {};
for (const k of keep) {
  if (data.Home?.[k]) home[k] = data.Home[k];
}
data.Home = home;

// Fix stray PT in Python FAQ if present
if (data.Python?.faqs) {
  for (const faq of data.Python.faqs) {
    if (faq.q?.includes("Isso substitui")) {
      faq.q = "¿Esto sustituye a un script de Python en producción?";
    }
    if (faq.a?.includes("prototip")) {
      faq.a =
        "No necesariamente. Es ideal para probar conversiones en el navegador antes de automatizar con PyMuPDF, pdfplumber o un pipeline RAG.";
    }
  }
}

writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`, "utf8");
console.log("Trimmed es Home to SEO + hero only");
