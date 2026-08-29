#!/usr/bin/env node
/** Generate de_exact.json: rules + nl Dutch fallback + hand exact */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const nl = JSON.parse(fs.readFileSync(path.join(ROOT, 'messages/nl.json'), 'utf8'));
const en = JSON.parse(fs.readFileSync(path.join(ROOT, 'messages/en.json'), 'utf8'));
const leaves = JSON.parse(fs.readFileSync(path.join(__dirname, '_de_leaves.json'), 'utf8'));
const HAND = JSON.parse(fs.readFileSync(path.join(__dirname, 'de_hand_exact.json'), 'utf8'));

function get(obj, p) {
  const m = p.match(/^([^[]+)|\[(\d+)\]/g);
  let cur = obj;
  for (const part of m) {
    if (part.startsWith('[')) cur = cur[parseInt(part.slice(1, -1), 10)];
    else cur = cur[part];
  }
  return cur;
}

function nlToDe(s) {
  let t = s;
  const pairs = [
    ['PDF naar Markdown', 'PDF zu Markdown'],
    ['pdf naar markdown', 'pdf zu markdown'],
    ['PDF naar', 'PDF zu'],
    ['pdf naar', 'pdf zu markdown'],
    ['naar Markdown', 'zu Markdown'],
    ['Converteer', 'Konvertieren'],
    ['converteer', 'konvertieren'],
    ['converteren', 'konvertieren'],
    ['Conversie', 'Konvertierung'],
    ['conversie', 'Konvertierung'],
    ['Converter', 'Konverter'],
    ['converter', 'Konverter'],
    ['Gratis', 'Kostenlos'],
    ['gratis', 'kostenlos'],
    ['Privé', 'Privat'],
    ['privé', 'privat'],
    ['Lokaal', 'Lokal'],
    ['lokaal', 'lokal'],
    ['100% lokaal', '100 % lokal'],
    ['100% privé', '100 % privat'],
    ['Bestand', 'Datei'],
    ['bestand', 'Datei'],
    ['bestanden', 'Dateien'],
    ["pagina's", 'Seiten'],
    ['pagina', 'Seite'],
    ['Koppen', 'Überschriften'],
    ['koppen', 'Überschriften'],
    ['Kop', 'Überschrift'],
    ['Afbeeldingen', 'Bilder'],
    ['afbeeldingen', 'Bilder'],
    ['Gescande', 'Gescannte'],
    ['gescande', 'gescannte'],
    ['Kennisbank', 'Wissensbasis'],
    ['kennisbank', 'Wissensbasis'],
    ['Kennisbanken', 'Wissensbasen'],
    ['Handleiding', 'Anleitung'],
    ['Veelgestelde vragen', 'Häufig gestellte Fragen'],
    ['Over ons', 'Über uns'],
    ['Privacybeleid', 'Datenschutz'],
    ['Neem contact op', 'Kontakt aufnehmen'],
    ['Stapsgewijze gids', 'Schritt-für-Schritt-Anleitung'],
    ['Voorbeeld', 'Vorschau'],
    ['Broncode', 'Quellcode'],
    ['Kopiëren', 'Kopieren'],
    ['kopiëren', 'kopieren'],
    ['Gekopieerd', 'Kopiert'],
    ['Nieuw bestand', 'Neue Datei'],
    ['Ander bestand kiezen', 'Andere Datei wählen'],
    ['klik om te bladeren', 'klicken zum Durchsuchen'],
    ['Upload een PDF-bestand.', 'Bitte laden Sie eine PDF-Datei hoch.'],
    ['Origineel PDF', 'Original-PDF'],
    ['Markdown kopiëren', 'Markdown kopieren'],
    ['.md downloaden', '.md herunterladen'],
    ['Wie gebruikt het', 'Wer nutzt es'],
    ['Batchconversie', 'Batch-Konvertierung'],
    ['voor Obsidian', 'für Obsidian'],
    ['voor ChatGPT', 'für ChatGPT'],
    ['voor Notion', 'für Notion'],
    ['voor LLM', 'für LLM'],
    ['met Python', 'mit Python'],
    ['met afbeeldingen', 'mit Bildern'],
    ['je browser', 'Ihrem Browser'],
    ['Je browser', 'Ihr Browser'],
    ['je apparaat', 'Ihrem Gerät'],
    ['Je apparaat', 'Ihr Gerät'],
    ['je PDF', 'Ihre PDF'],
    ['je bestanden', 'Ihre Dateien'],
    ['je vault', 'Ihrem Vault'],
    ['je editor', 'Ihrem Editor'],
    ['Laatst bijgewerkt: 4 juni 2026', 'Zuletzt aktualisiert: 4. Juni 2026'],
    ['Contact', 'Kontakt'],
    ['Home', 'Startseite'],
    ['Bekijk het in actie', 'Sehen Sie es in Aktion'],
    ['Wat je krijgt', 'Was Sie erhalten'],
    ['Geen PDF bij de hand?', 'Keine PDF zur Hand?'],
    ['Probeer een voorbeeld', 'Beispiel ausprobieren'],
    ['Meer use cases', 'Weitere Anwendungsfälle'],
    ['Ga naar inhoud', 'Zum Inhalt springen'],
    ['Waarom PDF\'s falen', 'Warum PDFs scheitern'],
    ['Waarom Markdown', 'Warum Markdown'],
    ['Hoe het werkt', 'So funktioniert es'],
    ['Toepassingen', 'Anwendungsfälle'],
    ['Converteer een PDF', 'PDF konvertieren'],
    ['Menu openen', 'Menü öffnen'],
    ['Menu sluiten', 'Menü schließen'],
    ['OCR-ondersteuning staat op de roadmap.', 'versuchen Sie unseren OCR-Konverter, der Text aus gescannten PDFs in Ihrem Browser erkennt.'],
    ['Nog niet. Batchconversie is gepland voor een toekomstige release. Converteer voorlopig bestanden één voor één — elke run is gratis en onbeperkt.',
      'Ja. Nutzen Sie unseren Batch-Konverter, um viele PDFs auf einmal abzulegen und alle als ZIP herunterzuladen — kostenlos und unbegrenzt, alles in Ihrem Browser.'],
  ];
  for (const [a, b] of pairs) t = t.split(a).join(b);
  t = t.replace(/\bje\b/g, 'Sie').replace(/\bJe\b/g, 'Sie');
  t = t.replace(/\bwe\b/g, 'wir').replace(/\bWe\b/g, 'Wir');
  t = t.replace(/\bof\b/g, 'oder').replace(/\ben\b/g, 'und').replace(/\bmet\b/g, 'mit');
  t = t.replace(/\bvan\b/g, 'von').replace(/\bnaar\b/g, 'zu').replace(/\buit\b/g, 'aus');
  t = t.replace(/\bop\b/g, 'auf').replace(/\bniet\b/g, 'nicht').replace(/\bgeen\b/g, 'keine');
  t = t.replace(/\bhet\b/g, 'das').replace(/\been\b/g, 'eine');
  t = t.replace(/\bdie\b/g, 'die').replace(/\bdat\b/g, 'dass');
  return t;
}

function applyRules(s) {
  let x = s;
  const chain = [
    [/PDF to Markdown/g, 'PDF zu Markdown'],
    [/pdf to markdown/g, 'pdf zu markdown'],
    [/Convert PDF to Markdown/g, 'PDF in Markdown konvertieren'],
    [/convert pdf to markdown/g, 'pdf in markdown konvertieren'],
    [/How to Convert PDF to Markdown/g, 'PDF in Markdown konvertieren — Anleitung'],
    [/The Best PDF to Markdown Converter/g, 'Der beste PDF-zu-Markdown-Konverter'],
    [/PDF to Markdown Converter/g, 'PDF-zu-Markdown-Konverter'],
    [/Scanned PDF to Markdown/g, 'Gescannte PDF zu Markdown'],
    [/for Obsidian/g, 'für Obsidian'],
    [/for ChatGPT & LLMs/g, 'für ChatGPT & LLMs'],
    [/with Python/g, 'mit Python'],
    [/with Images/g, 'mit Bildern'],
    [/Table Extractor/g, 'Tabellen-Extraktor'],
    [/Batch Convert/g, 'Batch-Konvertierung'],
    [/click to browse/g, 'klicken zum Durchsuchen'],
    [/Privacy Policy/g, 'Datenschutz'],
    [/How-to Guide/g, 'Anleitung'],
    [/About/g, 'Über uns'],
    [/Contact Us/g, 'Kontakt'],
    [/Home/g, 'Startseite'],
  ];
  for (const [re, rep] of chain) x = x.replace(re, rep);
  return x;
}

const out = {};
for (const { path: p, en: enStr } of leaves) {
  if (p.includes('resultPreview')) {
    out[enStr] = enStr;
    continue;
  }
  if (HAND[enStr]) {
    out[enStr] = HAND[enStr];
    continue;
  }
  let de = applyRules(enStr);
  if (de === enStr) {
    const nlStr = get(nl, p);
    de = nlToDe(String(nlStr));
  }
  out[enStr] = de;
}

fs.writeFileSync(path.join(__dirname, 'de_exact.json'), JSON.stringify(out, null, 2) + '\n');
console.log('de_exact entries', Object.keys(out).length);
