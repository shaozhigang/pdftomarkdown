#!/usr/bin/env node
/** Generate scripts/p1/de.json — German Tier A+B patch matching nl.json keys */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const nl = JSON.parse(fs.readFileSync(path.join(ROOT, 'messages/nl.json'), 'utf8'));
const en = JSON.parse(fs.readFileSync(path.join(ROOT, 'messages/en.json'), 'utf8'));

const ORDER = [
  'Nav', 'Footer', 'Converter', 'Landing', 'Examples', 'Home', 'Guide',
  'Best', 'Ocr', 'Obsidian', 'ChatGPT', 'Table', 'Notion', 'Python',
  'PrivacyPolicy', 'About', 'Contact',
];

// English resultPreview blocks (must stay English)
const EN_PREVIEWS = {};
function collectPreviews(obj, p = '') {
  if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
    for (const [k, v] of Object.entries(obj)) {
      const np = p ? `${p}.${k}` : k;
      if (k === 'resultPreview') EN_PREVIEWS[np] = v;
      else collectPreviews(v, np);
    }
  }
}
collectPreviews(en.Examples, 'Examples');

/** Deep clone nl namespace tree, then overlay German strings */
function deFromEn(enVal, nlVal, previewPath) {
  if (previewPath && EN_PREVIEWS[previewPath]) return EN_PREVIEWS[previewPath];
  if (Array.isArray(enVal)) {
    return enVal.map((item, i) => deFromEn(item, nlVal?.[i], previewPath ? `${previewPath}[${i}]` : undefined));
  }
  if (enVal && typeof enVal === 'object') {
    const out = {};
    for (const k of Object.keys(nlVal)) {
      const childPath = previewPath ? `${previewPath}.${k}` : k;
      out[k] = deFromEn(enVal[k], nlVal[k], childPath);
    }
    return out;
  }
  return translateLeaf(String(enVal), previewPath);
}

function translateLeaf(s, keyPath) {
  // Brand names & technical terms preserved via en source; translate known UI strings
  const T = TRANSLATIONS;
  if (keyPath && T[keyPath]) return T[keyPath];
  if (T[s]) return T[s];
  return s;
}

// Comprehensive German translations keyed by en.json string value
const TRANSLATIONS = {
  // Nav
  'Home': 'Startseite',
  'Tools': 'Tools',
  'for Obsidian': 'für Obsidian',
  'for ChatGPT & LLMs': 'für ChatGPT & LLMs',
  'for Notion': 'für Notion',
  'with Python': 'mit Python',
  'Table Extractor': 'Tabellen-Extraktor',
  'Markdown → PDF': 'Markdown → PDF',
  'Scanned PDF (OCR)': 'Gescannte PDF (OCR)',
  'with Images': 'mit Bildern',
  'Batch Convert': 'Batch-Konvertierung',
  'PDF → Word': 'PDF → Word',

  // Footer
  'PDF to Markdown · all conversions run locally in your browser, your files never leave your device.':
    'PDF zu Markdown · alle Konvertierungen laufen lokal in Ihrem Browser, Ihre Dateien verlassen nie Ihr Gerät.',
  'About': 'Über uns',
  'Contact': 'Kontakt',
  'How-to Guide': 'Anleitung',
  'Privacy Policy': 'Datenschutz',

  // Landing
  'Frequently asked questions': 'Häufig gestellte Fragen',
  'Related tools': 'Verwandte Tools',
};

// Load external translation map if present (allows full coverage)
const mapPath = path.join(__dirname, 'de_strings.json');
if (fs.existsSync(mapPath)) {
  Object.assign(TRANSLATIONS, JSON.parse(fs.readFileSync(mapPath, 'utf8')));
}

function assertSameKeys(a, b, path = '') {
  if (Array.isArray(a)) {
    if (!Array.isArray(b) || a.length !== b.length) {
      throw new Error(`Array length mismatch at ${path}`);
    }
    a.forEach((v, i) => assertSameKeys(v, b[i], `${path}[${i}]`));
    return;
  }
  if (a && typeof a === 'object') {
    const ak = Object.keys(a).sort();
    const bk = Object.keys(b).sort();
    if (JSON.stringify(ak) !== JSON.stringify(bk)) {
      throw new Error(`Key mismatch at ${path}: ${ak} vs ${bk}`);
    }
    for (const k of ak) assertSameKeys(a[k], b[k], path ? `${path}.${k}` : k);
  }
}

const out = {};
for (const ns of ORDER) {
  out[ns] = deFromEn(en[ns], nl[ns], ns);
  assertSameKeys(nl[ns], out[ns], ns);
}

const outPath = path.join(__dirname, 'de.json');
fs.writeFileSync(outPath, JSON.stringify(out, null, 2) + '\n', 'utf8');
console.log('Written:', outPath);
