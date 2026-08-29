#!/usr/bin/env node
/** Build scripts/p1/de.json from en.json + path-based German translations */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const en = JSON.parse(fs.readFileSync(path.join(ROOT, 'messages/en.json'), 'utf8'));
const nl = JSON.parse(fs.readFileSync(path.join(ROOT, 'messages/nl.json'), 'utf8'));
const PATH_DE = JSON.parse(fs.readFileSync(path.join(__dirname, 'de_paths.json'), 'utf8'));

const ORDER = [
  'Nav', 'Footer', 'Converter', 'Landing', 'Examples', 'Home', 'Guide',
  'Best', 'Ocr', 'Obsidian', 'ChatGPT', 'Table', 'Notion', 'Python',
  'PrivacyPolicy', 'About', 'Contact',
];

function assertSameKeys(a, b, p = '') {
  if (Array.isArray(a)) {
    if (!Array.isArray(b) || a.length !== b.length) throw new Error(`Len ${p}`);
    a.forEach((v, i) => assertSameKeys(v, b[i], `${p}[${i}]`));
    return;
  }
  if (a && typeof a === 'object') {
    const ak = Object.keys(a).sort();
    const bk = Object.keys(b).sort();
    if (JSON.stringify(ak) !== JSON.stringify(bk)) throw new Error(`Keys ${p}`);
    for (const k of ak) assertSameKeys(a[k], b[k], p ? `${p}.${k}` : k);
  }
}

function tr(enVal, p) {
  if (p.includes('resultPreview')) return enVal;
  if (PATH_DE[p] !== undefined) return PATH_DE[p];
  throw new Error(`Missing path translation: ${p}`);
}

function walk(enVal, p) {
  if (Array.isArray(enVal)) return enVal.map((v, i) => walk(v, `${p}[${i}]`));
  if (enVal && typeof enVal === 'object') {
    const o = {};
    for (const k of Object.keys(enVal)) o[k] = walk(enVal[k], p ? `${p}.${k}` : k);
    return o;
  }
  return tr(enVal, p);
}

const out = {};
for (const ns of ORDER) {
  out[ns] = walk(en[ns], ns);
  assertSameKeys(nl[ns], out[ns], ns);
}

const outPath = path.join(__dirname, 'de.json');
fs.writeFileSync(outPath, JSON.stringify(out, null, 2) + '\n', 'utf8');
console.log('OK', outPath);
