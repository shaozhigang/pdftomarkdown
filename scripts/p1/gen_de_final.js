#!/usr/bin/env node
/** Build scripts/p1/de.json from scripts/p1/pt.json via phrase-based PT→DE + path fixes */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const pt = JSON.parse(fs.readFileSync(path.join(__dirname, 'pt.json'), 'utf8'));
const en = JSON.parse(fs.readFileSync(path.join(ROOT, 'messages/en.json'), 'utf8'));
const nl = JSON.parse(fs.readFileSync(path.join(ROOT, 'messages/nl.json'), 'utf8'));

const ORDER = [
  'Nav', 'Footer', 'Converter', 'Landing', 'Examples', 'Home', 'Guide',
  'Best', 'Ocr', 'Obsidian', 'ChatGPT', 'Table', 'Notion', 'Python',
  'PrivacyPolicy', 'About', 'Contact',
];

const PATH_FIX = JSON.parse(fs.readFileSync(path.join(__dirname, 'de_path_fix.json'), 'utf8'));

function protectPh(s) {
  const ph = [];
  const tags = [];
  let t = s.replace(/\{[a-z]+\}/g, (m) => {
    ph.push(m);
    return `__P${ph.length - 1}__`;
  });
  t = t.replace(/<\/?(?:em|strong|file)>/g, (m) => {
    tags.push(m);
    return `__T${tags.length - 1}__`;
  });
  return [t, ph, tags];
}

function restorePh(t, ph, tags) {
  tags.forEach((p, i) => { t = t.split(`__T${i}__`).join(p); });
  ph.forEach((p, i) => { t = t.split(`__P${i}__`).join(p); });
  return t;
}

function ptToDe(s) {
  const [t0, ph, tags] = protectPh(s);
  let t = t0;
  const rules = [
    [/PDF para Markdown/g, 'PDF zu Markdown'],
    [/pdf para markdown/g, 'pdf zu markdown'],
    [/para Markdown/g, 'zu Markdown'],
    [/Início/g, 'Startseite'],
    [/Ferramentas/g, 'Tools'],
    [/para Obsidian/g, 'für Obsidian'],
    [/para ChatGPT e LLMs/g, 'für ChatGPT & LLMs'],
    [/para Notion/g, 'für Notion'],
    [/com Python/g, 'mit Python'],
    [/com imagens/g, 'mit Bildern'],
    [/Extrator de tabelas/g, 'Tabellen-Extraktor'],
    [/Conversão em lote/g, 'Batch-Konvertierung'],
    [/PDF digitalizado \(OCR\)/g, 'Gescannte PDF (OCR)'],
    [/Sobre/g, 'Über uns'],
    [/Política de privacidade/g, 'Datenschutz'],
    [/Guia passo a passo/g, 'Schritt-für-Schritt-Anleitung'],
    [/Guia prático/g, 'Anleitung'],
    [/clique para procurar/g, 'klicken zum Durchsuchen'],
    [/100% privado — os arquivos nunca saem do seu navegador/g, '100 % privat — Dateien verlassen Ihren Browser nie'],
    [/100 % privado — os arquivos nunca saem do seu navegador/g, '100 % privat — Dateien verlassen Ihren Browser nie'],
    [/PDF original/g, 'Original-PDF'],
    [/Solte seu PDF aqui, ou/g, 'PDF hier ablegen, oder'],
    [/Solte um PDF para importar no Obsidian, ou/g, 'PDF für Obsidian-Import ablegen, oder'],
    [/Solte um PDF para Markdown pronto para LLM, ou/g, 'PDF für LLM-fertiges Markdown ablegen, oder'],
    [/Solte um PDF para extrair tabelas, ou/g, 'PDF zum Extrahieren von Tabellen ablegen, oder'],
    [/Solte um PDF para importar no Notion, ou/g, 'PDF für Notion-Import ablegen, oder'],
    [/Solte um PDF para saída Markdown, ou/g, 'PDF für Markdown-Ausgabe ablegen, oder'],
    [/Solte um PDF para manter suas imagens, ou/g, 'PDF ablegen, um Bilder beizubehalten, oder'],
    [/Documento completo · 100% local · Máx\. 50 MB/g, 'Vollständiges Dokument · 100 % lokal · Max. 50 MB'],
    [/Documento completo · 100 % local · Máx\. 50 MB/g, 'Vollständiges Dokument · 100 % lokal · Max. 50 MB'],
    [/\.md pronto para vault com frontmatter · 100% local · Máx\. 50 MB/g, 'Vault-fertige .md mit Frontmatter · 100 % lokal · Max. 50 MB'],
    [/Markdown compacto \+ marcadores de chunk para RAG · 100% local · Máx\. 50 MB/g, 'Kompaktes Markdown + Chunk-Marker für RAG · 100 % lokal · Max. 50 MB'],
    [/Somente tabelas · saída GFM · 100% local · Máx\. 50 MB/g, 'Nur Tabellen · GFM-Ausgabe · 100 % lokal · Max. 50 MB'],
    [/Markdown pronto para Notion · 100% local · Máx\. 50 MB/g, 'Notion-fertiges Markdown · 100 % lokal · Max. 50 MB'],
    [/Para scripts e notebooks · 100% local · Máx\. 50 MB/g, 'Für Skripte & Notebooks · 100 % lokal · Max. 50 MB'],
    [/Texto \+ imagens incorporadas inline · 100% local · Máx\. 50 MB/g, 'Text + eingebettete Bilder inline · 100 % lokal · Max. 50 MB'],
    [/Envie um arquivo PDF\./g, 'Bitte laden Sie eine PDF-Datei hoch.'],
    [/O arquivo excede 50 MB\. Arquivos maiores ainda não são suportados\./g, 'Datei überschreitet 50 MB. Größere Dateien werden noch nicht unterstützt.'],
    [/\{pages\} páginas · \{ms\} ms/g, '{pages} Seiten · {ms} ms'],
    [/\{pages\} páginas · \{tables\} tabelas · \{ms\} ms/g, '{pages} Seiten · {tables} Tabellen · {ms} ms'],
    [/\{pages\} páginas · \{images\} imagens · \{ms\} ms/g, '{pages} Seiten · {images} Bilder · {ms} ms'],
    [/Convertendo documento/g, 'Dokument wird konvertiert'],
    [/Criando nota Obsidian/g, 'Obsidian-Notiz wird erstellt'],
    [/Otimizando para LLM/g, 'Optimierung für LLM'],
    [/Extraindo tabelas/g, 'Tabellen werden extrahiert'],
    [/Preparando importação Notion/g, 'Notion-Import wird vorbereitet'],
    [/Gerando Markdown/g, 'Markdown wird generiert'],
    [/Extraindo texto e imagens/g, 'Text & Bilder werden extrahiert'],
    [/Escolher outro arquivo/g, 'Andere Datei wählen'],
    [/Falha na conversão/g, 'Konvertierung fehlgeschlagen'],
    [/Visualização/g, 'Vorschau'],
    [/Copiar Markdown/g, 'Markdown kopieren'],
    [/Copiado/g, 'Kopiert'],
    [/Baixar \.md/g, '.md herunterladen'],
    [/Novo arquivo/g, 'Neue Datei'],
    [/Perguntas frequentes/g, 'Häufig gestellte Fragen'],
    [/Ferramentas relacionadas/g, 'Verwandte Tools'],
    [/Veja em ação/g, 'Sehen Sie es in Aktion'],
    [/O que você obtém/g, 'Was Sie erhalten'],
    [/Sem PDF à mão\?/g, 'Keine PDF zur Hand?'],
    [/Experimente uma amostra/g, 'Beispiel ausprobieren'],
    [/Carregando amostra…/g, 'Beispiel wird geladen…'],
    [/Não foi possível carregar a amostra\. Tente novamente\./g, 'Beispiel konnte nicht geladen werden. Bitte erneut versuchen.'],
    [/Mais casos de uso/g, 'Weitere Anwendungsfälle'],
    [/Ir para o conteúdo/g, 'Zum Inhalt springen'],
    [/Por que PDFs falham/g, 'Warum PDFs scheitern'],
    [/Por que Markdown/g, 'Warum Markdown'],
    [/Como funciona/g, 'So funktioniert es'],
    [/Casos de uso/g, 'Anwendungsfälle'],
    [/Converter um PDF/g, 'PDF konvertieren'],
    [/Abrir menu/g, 'Menü öffnen'],
    [/Fechar menu/g, 'Menü schließen'],
    [/Começar/g, 'Loslegen'],
    [/Quem usa/g, 'Wer nutzt es'],
    [/Para quem/g, 'Für wen'],
    [/Antes de escrever código/g, 'Bevor Sie Code schreiben'],
    [/Leia nossa política de privacidade/g, 'Unseren Datenschutz lesen'],
    [/Entre em contato/g, 'Kontakt aufnehmen'],
    [/Grátis · Privado · Comparado/g, 'Kostenlos · Privat · Im Vergleich'],
    [/OCR · PDF digitalizado/g, 'OCR · Gescannte PDF'],
    [/Offline · pronto para vault/g, 'Offline · vault-fertig'],
    [/Saída pronta para LLM/g, 'LLM-fertige Ausgabe'],
    [/Tabelas · saída GFM/g, 'Tabellen · GFM-Ausgabe'],
    [/Pronto para Notion · colar para importar/g, 'Notion-fertig · einfügen zum Importieren'],
    [/Sem pip · saída instantânea/g, 'Kein pip install · sofortige Ausgabe'],
    [/Esta ferramenta/g, 'Dieses Tool'],
    [/Copiar e colar/g, 'Kopieren & Einfügen'],
    [/Grátis e ilimitado/g, 'Kostenlos & unbegrenzt'],
    [/Sem upload \(privado\)/g, 'Kein Upload (privat)'],
    [/Nada para instalar/g, 'Nichts zu installieren'],
    [/Tabelas → Markdown/g, 'Tabellen → Markdown'],
    [/Mantém imagens/g, 'Behält Bilder'],
    [/OCR para digitalizações/g, 'OCR für Scans'],
    [/Visualização ao vivo/g, 'Live-Vorschau'],
    [/Comparação/g, 'Im Vergleich'],
    [/Bases de conhecimento/g, 'Wissensbasen'],
    [/Destinos comuns/g, 'Häufige Ziele'],
    [/Converter no navegador/g, 'Im Browser konvertieren'],
    [/Como converter/g, 'So konvertieren Sie'],
    [/Envie/g, 'Laden Sie hoch'],
    [/envie/g, 'laden Sie hoch'],
    [/Baixe/g, 'Laden Sie herunter'],
    [/baixe/g, 'laden Sie herunter'],
    [/Revise/g, 'Prüfen Sie'],
    [/revise/g, 'prüfen Sie'],
    [/Cole/g, 'Fügen Sie ein'],
    [/cole/g, 'fügen Sie ein'],
    [/Copie/g, 'Kopieren Sie'],
    [/copie/g, 'kopieren Sie'],
    [/Abra/g, 'Öffnen Sie'],
    [/abra/g, 'öffnen Sie'],
    [/Crie/g, 'Erstellen Sie'],
    [/crie/g, 'erstellen Sie'],
    [/Mova/g, 'Verschieben Sie'],
    [/mova/g, 'verschieben Sie'],
    [/Experimente/g, 'Versuchen Sie'],
    [/experimente/g, 'versuchen Sie'],
    [/Use/g, 'Nutzen Sie'],
    [/use/g, 'nutzen Sie'],
    [/seu /g, 'Ihr '],
    [/Seu /g, 'Ihr '],
    [/sua /g, 'Ihre '],
    [/Sua /g, 'Ihre '],
    [/você /g, 'Sie '],
    [/Você /g, 'Sie '],
    [/nosso /g, 'unser '],
    [/Nosso /g, 'Unser '],
    [/nós /g, 'wir '],
    [/Nós /g, 'Wir '],
    [/ os /g, ' die '],
    [/Os /g, 'Die '],
    [/ as /g, ' die '],
    [/As /g, 'Die '],
    [/ o /g, ' der '],
    [/O /g, 'Der '],
    [/ a /g, ' die '],
    [/A /g, 'Die '],
    [/ um /g, ' ein '],
    [/Um /g, 'Ein '],
    [/ uma /g, ' eine '],
    [/Uma /g, 'Eine '],
    [/ e /g, ' und '],
    [/ ou /g, ' oder '],
    [/ com /g, ' mit '],
    [/ para /g, ' für '],
    [/ em /g, ' in '],
    [/ de /g, ' von '],
    [/ do /g, ' des '],
    [/ da /g, ' der '],
    [/ ao /g, ' zum '],
    [/ é /g, ' ist '],
    [/ são /g, ' sind '],
    [/ pode /g, ' kann '],
    [/ podem /g, ' können '],
    [/ não /g, ' nicht '],
    [/ também /g, ' auch '],
    [/ sempre /g, ' immer '],
    [/ nunca /g, ' nie '],
    [/títulos/g, 'Überschriften'],
    [/título/g, 'Überschrift'],
    [/tabelas/g, 'Tabellen'],
    [/tabela/g, 'Tabelle'],
    [/listas/g, 'Listen'],
    [/lista/g, 'Liste'],
    [/arquivos/g, 'Dateien'],
    [/arquivo/g, 'Datei'],
    [/páginas/g, 'Seiten'],
    [/página/g, 'Seite'],
    [/navegador/g, 'Browser'],
    [/documento/g, 'Dokument'],
    [/documentos/g, 'Dokumente'],
    [/conversor/g, 'Konverter'],
    [/conversão/g, 'Konvertierung'],
    [/Converter/g, 'Konvertieren'],
    [/converter/g, 'konvertieren'],
    [/baixar/g, 'herunterladen'],
    [/Baixar/g, 'Herunterladen'],
    [/enviar/g, 'hochladen'],
    [/Enviar/g, 'Hochladen'],
    [/copiar/g, 'kopieren'],
    [/Copiar/g, 'Kopieren'],
    [/colar/g, 'einfügen'],
    [/Colar/g, 'Einfügen'],
    [/busca/g, 'Suche'],
    [/Busca/g, 'Suche'],
    [/grátis/g, 'kostenlos'],
    [/Grátis/g, 'Kostenlos'],
    [/privado/g, 'privat'],
    [/Privado/g, 'Privat'],
    [/local/g, 'lokal'],
    [/Local/g, 'Lokal'],
    [/estrutura/g, 'Struktur'],
    [/conteúdo/g, 'Inhalt'],
    [/texto/g, 'Text'],
    [/imagens/g, 'Bilder'],
    [/imagem/g, 'Bild'],
    [/digitalizado/g, 'gescannt'],
    [/Digitalizado/g, 'Gescannt'],
    [/relatório/g, 'Bericht'],
    [/relatórios/g, 'Berichte'],
    [/notas/g, 'Notizen'],
    [/nota/g, 'Notiz'],
    [/editor/g, 'Editor'],
    [/PDF → Markdown/g, 'PDF zu Markdown'],
    [/Fonte/g, 'Quellcode'],
    [/Característica/g, 'Merkmal'],
    [/O que significa na prática/g, 'Was es in der Praxis bedeutet'],
    [/Por que prejudica fluxos modernos/g, 'Warum es moderne Workflows erschwert'],
    [/Uso/g, 'Verwendung'],
    [/Por que PDF/g, 'Warum PDF'],
    [/Por que Markdown/g, 'Warum Markdown'],
    [/O problema/g, 'Das Problem'],
    [/Um PDF lembra como uma página parece\. Não o que o conteúdo significa\./g, 'Ein PDF erinnert sich daran, wie eine Seite aussieht — nicht daran, was der Inhalt bedeutet.'],
    [/Método/g, 'Methode'],
    [/Solte um PDF\. Obtenha Markdown estruturado\./g, 'PDF ablegen. Strukturiertes Markdown erhalten.'],
    [/Sem upload\. Títulos, tabelas, listas e estrutura permanecem — depois copie ou baixe\./g, 'Kein Upload. Überschriften, Tabellen, Listen und Gliederung bleiben erhalten — dann kopieren oder herunterladen.'],
  ];
  for (const [re, rep] of rules) t = t.replace(re, rep);
  return restorePh(t, ph, tags);
}

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

function walk(ptVal, enVal, p) {
  if (p.includes('resultPreview')) return enVal;
  if (PATH_FIX[p] !== undefined) return PATH_FIX[p];
  if (Array.isArray(ptVal)) return ptVal.map((v, i) => walk(v, enVal[i], `${p}[${i}]`));
  if (ptVal && typeof ptVal === 'object') {
    const o = {};
    for (const k of Object.keys(ptVal)) o[k] = walk(ptVal[k], enVal[k], p ? `${p}.${k}` : k);
    return o;
  }
  return ptToDe(String(ptVal));
}

const out = {};
for (const ns of ORDER) {
  out[ns] = walk(pt[ns], en[ns], ns);
  assertSameKeys(nl[ns], out[ns], ns);
}

const outPath = path.join(__dirname, 'de.json');
fs.writeFileSync(outPath, JSON.stringify(out, null, 2) + '\n', 'utf8');
console.log('Written', outPath);
