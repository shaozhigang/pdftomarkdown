#!/usr/bin/env node
/** Generate de_strings.json from en.json leaf strings with German translations */
const fs = require('fs');
const path = require('path');

const leaves = JSON.parse(fs.readFileSync(path.join(__dirname, '_de_leaves.json'), 'utf8'));
const en = JSON.parse(fs.readFileSync(path.join(__dirname, '../../messages/en.json'), 'utf8'));

// Load hand-crafted translations (merged last for priority)
const HAND = fs.existsSync(path.join(__dirname, 'de_hand.json'))
  ? JSON.parse(fs.readFileSync(path.join(__dirname, 'de_hand.json'), 'utf8'))
  : {};

function translateEn(s) {
  if (HAND[s]) return HAND[s];
  // Preserve-only strings
  if (/^[\d★✓✗$|/#\-–—→·…\s\w.,"':;!?()[\]{}<>%&@+*=`~]+$/.test(s) && !/\b(the|and|your|PDF|Convert|How|What|Why|Are|Can|Does|Will|Is)\b/i.test(s) && s.length < 40) {
    if (['✓', '✗', '★★', '★★★', '★★★★★', 'RAG', 'LLMs', 'LLM', 'OCR', 'GFM', 'FAQ', 'API', 'Eng', 'Docs', 'Search', 'Websites', 'Native', 'Partial', 'Limited', 'Trial', 'Manual', 'Usage', 'Planned', 'In progress', 'Free', 'Pro', 'A4', 'Letter', 'Upload', 'Convert', 'Preview', 'Source', 'Python', 'Table', 'Batch', 'Structure', 'ChatGPT', 'Feature', 'Trait', 'Means', 'Trait'].includes(s)) return s;
  }
  if (s.startsWith('#') || s.startsWith('---') || s.startsWith('|') || s.includes('console.log') || s.includes('<!-- chunk -->')) return s;
  if (s.includes('\n') && (s.includes('# ') || s.includes('```') || s.includes('└──'))) return s;
  if (/^https?:\/\//.test(s)) return s;
  if (s === 'privacy@pdftomarkdown.run') return s;
  if (s.includes('pdftomarkdown.run') && s.length < 120) return s.replace(/PDF to Markdown/g, 'PDF zu Markdown');
  throw new Error('MISSING: ' + s.slice(0, 100));
}

const uniq = [...new Set(leaves.map((l) => l.en))];
const out = {};
const missing = [];
for (const s of uniq) {
  try {
    out[s] = translateEn(s);
  } catch {
    missing.push(s);
  }
}

if (missing.length) {
  console.error('Missing translations:', missing.length);
  fs.writeFileSync(path.join(__dirname, '_de_missing.json'), JSON.stringify(missing, null, 2));
  process.exit(1);
}

fs.writeFileSync(path.join(__dirname, 'de_strings.json'), JSON.stringify(out, null, 2) + '\n');
console.log('Wrote de_strings.json with', Object.keys(out).length, 'entries');
