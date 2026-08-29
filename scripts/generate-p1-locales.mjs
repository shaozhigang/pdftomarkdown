/**
 * Build P1 locale message files (es, de, ja, fr, pt) from en.json + locale patches.
 * Tier A+B namespaces are translated; Tier C falls back to English via mergeMessages.
 *
 * Run: node scripts/generate-p1-locales.mjs
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const P1_LOCALES = ["es", "de", "ja", "fr", "pt"];

/** Namespaces included in P1 (Tier A+B). Tier C uses English fallback. */
const P1_NAMESPACES = [
  "Nav",
  "Footer",
  "Converter",
  "Landing",
  "Examples",
  "Home",
  "Guide",
  "Best",
  "Ocr",
  "Obsidian",
  "ChatGPT",
  "Table",
  "Notion",
  "Python",
  "PrivacyPolicy",
  "About",
  "Contact",
];

function deepMerge(target, source) {
  for (const key of Object.keys(source)) {
    const s = source[key];
    const t = target[key];
    if (
      s &&
      typeof s === "object" &&
      !Array.isArray(s) &&
      t &&
      typeof t === "object" &&
      !Array.isArray(t)
    ) {
      deepMerge(t, s);
    } else {
      target[key] = s;
    }
  }
  return target;
}

function pickNamespaces(source, namespaces) {
  const out = {};
  for (const ns of namespaces) {
    if (source[ns] !== undefined) out[ns] = structuredClone(source[ns]);
  }
  return out;
}

const en = JSON.parse(readFileSync(join(root, "messages/en.json"), "utf8"));
const enBase = pickNamespaces(en, P1_NAMESPACES);

for (const locale of P1_LOCALES) {
  const patchPath = join(root, "scripts/p1", `${locale}.json`);
  if (!existsSync(patchPath)) {
    console.error(`Missing patch file: scripts/p1/${locale}.json`);
    process.exitCode = 1;
    continue;
  }

  const patch = JSON.parse(readFileSync(patchPath, "utf8"));
  const merged = structuredClone(enBase);
  deepMerge(merged, patch);

  const outPath = join(root, "messages", `${locale}.json`);
  writeFileSync(outPath, `${JSON.stringify(merged, null, 2)}\n`, "utf8");
  console.log(`Wrote messages/${locale}.json`);
}
