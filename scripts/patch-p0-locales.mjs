/**
 * P0 locale patch: add Tier A/B translations missing from nl.json and pl.json.
 * Run: node scripts/patch-p0-locales.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const patches = {
  nl: {
    Nav: { word: "PDF → Word" },
    Converter: {
      dropTitle_images: "Sleep een PDF om afbeeldingen te behouden, of",
      dropSubtitle_images: "Tekst + ingesloten afbeeldingen inline · 100% lokaal · Max. 50 MB",
      statusParsing_images: "Afbeeldingen extraheren",
      statsImages: "{pages} pagina's · {images} afbeeldingen · {ms} ms",
    },
    Obsidian: {
      audienceTitle: "Wie gebruikt het",
      audience: [
        { title: "Onderzoekers & studenten", body: "Haal papers en college-PDF's als doorzoekbare notities in je vault." },
        { title: "PKM-enthousiastelingen", body: "Voed clippings en rapporten aan je Zettelkasten met structuur intact." },
        { title: "Schrijvers", body: "Schrijf vanuit bron-PDF's in Obsidian zonder koppen of tabellen te verliezen." },
      ],
    },
    ChatGPT: {
      audienceTitle: "Wie gebruikt het",
      audience: [
        { title: "Prompt engineers", body: "Plak compacte Markdown in ChatGPT of Claude voor meer context per prompt." },
        { title: "RAG-ontwikkelaars", body: "Chunk en embed schone Markdown voor betrouwbare retrieval augmented generation." },
        { title: "Datateams", body: "Standaardiseer rommelige PDF's naar gestructureerde tekst voor AI-pipelines." },
      ],
    },
    Table: {
      audienceTitle: "Wie gebruikt het",
      audience: [
        { title: "Analisten", body: "Haal prijs-, financiële en datatabellen uit rapporten naar bewerkbare Markdown." },
        { title: "Ontwikkelaars", body: "Zet PDF-tabellen in docs en README's als GitHub-flavored Markdown-tabellen." },
        { title: "Onderzoekers", body: "Extraheer resultatentabellen uit papers voor notities of analyse." },
      ],
    },
    Notion: {
      audienceTitle: "Wie gebruikt het",
      audience: [
        { title: "Teams", body: "Verplaats specs, wiki's en rapporten naar Notion-pagina's met behouden structuur." },
        { title: "Productmanagers", body: "Zet PDF-briefings in seconden om naar bewerkbare Notion-docs." },
        { title: "Kennismanagers", body: "Bouw een doorzoekbare Notion-kennisbank van verspreide PDF's." },
      ],
    },
    Python: {
      audienceTitle: "Wie gebruikt het",
      audience: [
        { title: "Data scientists", body: "Pak Markdown voor notebooks zonder een PDF-parseerbibliotheek op te zetten." },
        { title: "ML-engineers", body: "Bereid documenten voor op LangChain- en LlamaIndex-RAG-stacks." },
        { title: "Automatiseerders", body: "Prototypeer conversies in de browser voordat je de volledige pipeline script." },
      ],
    },
    Best: {
      metaTitle: "Beste PDF naar Markdown-converter (gratis & privé) — vergeleken",
      metaDescription: "Op zoek naar de beste gratis PDF naar Markdown-converter? Probeer onze privé, browsergebaseerde tool en zie hoe die zich verhoudt tot CloudConvert, Pandoc en handmatig kopiëren.",
      keywords: [
        "beste pdf naar markdown converter",
        "gratis pdf naar markdown converter",
        "pdf naar markdown converter online",
        "beste gratis pdf naar markdown",
        "pdf naar markdown tool",
      ],
      badge: "Gratis · Privé · Vergeleken",
      h1: "De beste PDF naar Markdown-converter",
      subtitle: "Een gratis, privé, browsergebaseerde converter — plus een eerlijke vergelijking met de alternatieven. Probeer hem hier en zie hoe hij presteert.",
      howToName: "Hoe zet je een PDF om naar Markdown",
      howToSteps: [
        "Sleep je PDF in de converter hierboven — die draait direct in je browser.",
        "Bekijk de Markdown in voorbeeld- of bronweergave.",
        "Kopieer het resultaat of download het .md-bestand.",
      ],
      features: [
        { title: "Privacy eerst", body: "De beste converter houdt bestanden op je apparaat. De onze draait 100% in de browser — geen uploads, geen accounts, geen tracking." },
        { title: "Echte structuur", body: "Kijk verder dan ruwe tekst: goede tools behouden koppen, lijsten en echte Markdown-tabellen. De onze houdt de documentstructuur intact." },
        { title: "Moeilijke gevallen", body: "Gescande PDF's, ingesloten afbeeldingen en tientallen bestanden tegelijk — een goede tool dekt ze met OCR, beeldextractie en batchmodus." },
      ],
      comparisonTitle: "Hoe het zich verhoudt",
      comparisonColumns: ["Functie", "Deze tool", "CloudConvert", "Pandoc", "Kopiëren & plakken"],
      comparisonRows: [
        ["Gratis & onbeperkt", "✓", "Beperkt", "✓", "✓"],
        ["Geen upload (privé)", "✓", "✗", "✓", "✓"],
        ["Niets te installeren", "✓", "✓", "✗", "✓"],
        ["Tabellen → Markdown", "✓", "Gedeeltelijk", "✓", "✗"],
        ["Behoudt afbeeldingen", "✓", "✓", "✓", "✗"],
        ["OCR voor scans", "✓", "✓", "✗", "✗"],
        ["Batch + ZIP", "✓", "✓", "Handmatig", "✗"],
        ["Live voorbeeld", "✓", "✗", "✗", "✗"],
      ],
      faqs: [
        { q: "Wat is de beste PDF naar Markdown-converter?", a: "De beste converter behoudt je documentstructuur, respecteert je privacy en ondersteunt je bestandstypen. Een browsergebaseerde tool zonder upload of installatie — met tabellen, afbeeldingen, OCR en batch — dekt de meeste behoeften gratis." },
        { q: "Wat is de beste gratis PDF naar Markdown-converter?", a: "Deze tool is gratis zonder limieten en draait volledig in je browser. In tegenstelling tot veel gratis online converters uploadt hij je bestanden nooit en ondersteunt hij tabellen, afbeeldingen, gescande PDF's en batchconversie." },
        { q: "Zijn online PDF naar Markdown-converters veilig?", a: "Dat hangt af van of ze je bestand uploaden. Veel doen dat, wat riskant is voor vertrouwelijke documenten. Deze converter verwerkt alles lokaal in je browser, dus je bestanden verlaten je apparaat nooit." },
        { q: "Moet ik software installeren?", a: "Nee. Command-line tools zoals Pandoc zijn krachtig maar vereisen installatie. Deze converter werkt direct in elke moderne browser, op elk apparaat." },
      ],
    },
    Ocr: {
      metaTitle: "Gescande PDF naar Markdown — gratis OCR-converter",
      metaDescription: "Zet gescande of alleen-beeld PDF's om naar Markdown met ingebouwde OCR. Herkent tekst in 100+ talen, draait in je browser en je bestand wordt nooit geüpload.",
      keywords: [
        "gescande pdf naar markdown",
        "pdf naar markdown ocr",
        "ocr pdf naar markdown",
        "afbeeldings-pdf naar markdown",
        "gescande pdf converteren naar markdown",
      ],
      badge: "OCR · Gescande PDF",
      h1: "Gescande PDF naar Markdown",
      subtitle: "Haal tekst uit gescande of alleen-beeld PDF's en krijg schone Markdown. OCR draait volledig in je browser — je bestand verlaat je apparaat nooit.",
      privacyBadge: "100% privé — bestanden verlaten je browser nooit",
      languageLabel: "Documenttaal",
      dropTitle: "Sleep een gescande PDF hierheen, of",
      dropClickBrowse: "klik om te bladeren",
      dropSubtitle: "Afbeelding of gescande PDF · OCR in je browser · Max. 50 MB",
      samplePrompt: "Geen PDF bij de hand?",
      trySample: "Probeer een voorbeeld",
      modelNote: "Eerste keer downloadt een taalmodel (~2–15 MB). Daarna werkt het offline — je bestand wordt lokaal verwerkt.",
      paneOriginal: "Origineel PDF",
      rendering: "Pagina's renderen",
      recognizing: "Tekst herkennen",
      tabPreview: "Voorbeeld",
      tabSource: "Broncode",
      ocrProgress: "Pagina {page}/{total} · {pct}%",
      actionNewFile: "Nieuw bestand",
      errorNotPdf: "Upload een PDF-bestand.",
      errorTooLarge: "Bestand is groter dan 50 MB. Grotere bestanden worden nog niet ondersteund.",
      errorNoPages: "Kon geen pagina's uit deze PDF lezen.",
      errorFailed: "OCR mislukt. Probeer een ander bestand.",
      audienceTitle: "Wie gebruikt het",
      audience: [
        { title: "Archivarissen", body: "Digitaliseer gescande boeken, bonnen en oude documenten naar bewerkbare Markdown." },
        { title: "Studenten", body: "Zet gefotografeerde collegeslides en handouts om naar doorzoekbare notities." },
        { title: "Kantoren", body: "Haal tekst uit gescande contracten en formulieren zonder opnieuw te typen." },
      ],
      howToName: "Hoe zet je een gescande PDF om naar Markdown",
      howToSteps: [
        "Kies de documenttaal en sleep je gescande of alleen-beeld PDF.",
        "Zie elke pagina naast elkaar renderen en herkennen in je browser.",
        "Kopieer de Markdown of download het .md-bestand zodra OCR klaar is.",
      ],
      features: [
        { title: "Ingebouwde OCR", body: "Leest tekst uit gescande en alleen-beeld PDF's die normale converters niet aankunnen, aangedreven door Tesseract in je browser." },
        { title: "100+ talen", body: "Herken Engels, Chinees, Japans, Koreaans, Spaans, Frans, Duits, Russisch en veel meer." },
        { title: "Privé by design", body: "OCR draait lokaal via WebAssembly. Alleen het taalmodel wordt opgehaald — je document verlaat je apparaat nooit." },
      ],
      faqs: [
        { q: "Wat is een gescande PDF?", a: "Een gescande of alleen-beeld PDF heeft geen selecteerbare tekstlaag — het zijn in feite afbeeldingen van pagina's. Normale converters geven niets terug, dus OCR is nodig om de tekst te lezen." },
        { q: "Is de OCR gratis en privé?", a: "Ja. Herkenning draait volledig in je browser via WebAssembly. Alleen het taalmodel wordt van een CDN gedownload; je PDF wordt nooit geüpload." },
        { q: "Welke talen worden ondersteund?", a: "Kies uit Engels, vereenvoudigd en traditioneel Chinees, Japans, Koreaans, Spaans, Frans, Duits, Russisch en meer voordat je start." },
        { q: "Waarom is OCR trager dan een normale conversie?", a: "OCR analyseert elke pagina-afbeelding pixel voor pixel om tekens te herkennen, wat zwaarder is dan een bestaande tekstlaag lezen. Grotere documenten duren langer." },
      ],
    },
  },
  pl: {
    Nav: { word: "PDF → Word" },
    Converter: {
      dropTitle_images: "Upuść PDF, aby zachować obrazy, lub",
      dropSubtitle_images: "Tekst + osadzone obrazy inline · 100% lokalnie · Maks. 50 MB",
      statusParsing_images: "Wyodrębnianie obrazów",
      statsImages: "{pages} stron · {images} obrazów · {ms} ms",
    },
    Obsidian: {
      audienceTitle: "Kto z tego korzysta",
      audience: [
        { title: "Badacze i studenci", body: "Przenoś artykuły i PDF-y z wykładów do vault jako przeszukiwalne notatki." },
        { title: "Entuzjaści PKM", body: "Dodawaj wycinki i raporty do Zettelkasten ze zachowaną strukturą." },
        { title: "Pisarze", body: "Pisz na podstawie PDF-ów w Obsidian bez utraty nagłówków i tabel." },
      ],
    },
    ChatGPT: {
      audienceTitle: "Kto z tego korzysta",
      audience: [
        { title: "Inżynierowie promptów", body: "Wklejaj zwięzły Markdown do ChatGPT lub Claude, by zmieścić więcej kontekstu." },
        { title: "Twórcy RAG", body: "Dziel i embeduj czysty Markdown dla niezawodnego retrieval augmented generation." },
        { title: "Zespoły danych", body: "Standaryzuj chaotyczne PDF-y do ustrukturyzowanego tekstu dla pipeline'ów AI." },
      ],
    },
    Table: {
      audienceTitle: "Kto z tego korzysta",
      audience: [
        { title: "Analitycy", body: "Wyciągaj tabele cen, finansów i danych z raportów do edytowalnego Markdown." },
        { title: "Programiści", body: "Wstawiaj tabele z PDF do dokumentacji i README jako tabele GitHub-flavored Markdown." },
        { title: "Badacze", body: "Wyodrębniaj tabele wyników z artykułów do notatek lub analizy." },
      ],
    },
    Notion: {
      audienceTitle: "Kto z tego korzysta",
      audience: [
        { title: "Zespoły", body: "Przenoś specyfikacje, wiki i raporty do Notion ze zachowaną strukturą." },
        { title: "Product managerowie", body: "Zamieniaj PDF-y briefów na edytowalne dokumenty Notion w kilka sekund." },
        { title: "Menedżerowie wiedzy", body: "Buduj przeszukiwalną bazę wiedzy Notion z rozproszonych PDF-ów." },
      ],
    },
    Python: {
      audienceTitle: "Kto z tego korzysta",
      audience: [
        { title: "Data scientistowie", body: "Pobieraj Markdown do notebooków bez konfiguracji biblioteki do parsowania PDF." },
        { title: "Inżynierowie ML", body: "Przygotowuj dokumenty dla stosów RAG LangChain i LlamaIndex." },
        { title: "Twórcy automatyzacji", body: "Prototypuj konwersje w przeglądarce przed skryptowaniem pełnego pipeline'u." },
      ],
    },
    Best: {
      metaTitle: "Najlepszy konwerter PDF na Markdown (darmowy i prywatny) — porównanie",
      metaDescription: "Szukasz najlepszego darmowego konwertera PDF na Markdown? Wypróbuj nasze prywatne narzędzie w przeglądarce i zobacz, jak wypada na tle CloudConvert, Pandoc i ręcznego kopiowania.",
      keywords: [
        "najlepszy konwerter pdf na markdown",
        "darmowy konwerter pdf na markdown",
        "konwerter pdf na markdown online",
        "najlepszy darmowy pdf na markdown",
        "narzędzie pdf na markdown",
      ],
      badge: "Darmowy · Prywatny · Porównanie",
      h1: "Najlepszy konwerter PDF na Markdown",
      subtitle: "Darmowy, prywatny konwerter w przeglądarce — plus uczciwe porównanie z alternatywami. Wypróbuj go tutaj i zobacz, jak wypada.",
      howToName: "Jak przekonwertować PDF na Markdown",
      howToSteps: [
        "Upuść PDF do konwertera powyżej — działa od razu w przeglądarce.",
        "Sprawdź Markdown w podglądzie lub widoku źródła.",
        "Skopiuj wynik lub pobierz plik .md.",
      ],
      features: [
        { title: "Prywatność na pierwszym miejscu", body: "Najlepszy konwerter trzyma pliki na Twoim urządzeniu. Nasz działa w 100% w przeglądarce — bez uploadu, kont i śledzenia." },
        { title: "Prawdziwa struktura", body: "Wyjdź poza surowy tekst: dobre narzędzia zachowują nagłówki, listy i prawdziwe tabele Markdown. Nasze utrzymuje strukturę dokumentu." },
        { title: "Trudne przypadki", body: "Skanowane PDF-y, osadzone obrazy i dziesiątki plików naraz — świetne narzędzie obejmuje je OCR, ekstrakcją obrazów i trybem wsadowym." },
      ],
      comparisonTitle: "Jak wypada na tle innych",
      comparisonColumns: ["Funkcja", "To narzędzie", "CloudConvert", "Pandoc", "Kopiuj i wklej"],
      comparisonRows: [
        ["Darmowe i bez limitu", "✓", "Ograniczone", "✓", "✓"],
        ["Bez uploadu (prywatne)", "✓", "✗", "✓", "✓"],
        ["Bez instalacji", "✓", "✓", "✗", "✓"],
        ["Tabele → Markdown", "✓", "Częściowo", "✓", "✗"],
        ["Zachowuje obrazy", "✓", "✓", "✓", "✗"],
        ["OCR dla skanów", "✓", "✓", "✗", "✗"],
        ["Wsadowo + ZIP", "✓", "✓", "Ręcznie", "✗"],
        ["Podgląd na żywo", "✓", "✗", "✗", "✗"],
      ],
      faqs: [
        { q: "Jaki jest najlepszy konwerter PDF na Markdown?", a: "Najlepszy zachowuje strukturę dokumentu, szanuje prywatność i obsługuje Twoje typy plików. Narzędzie w przeglądarce bez uploadu i instalacji — z tabelami, obrazami, OCR i trybem wsadowym — pokrywa większość potrzeb za darmo." },
        { q: "Jaki jest najlepszy darmowy konwerter PDF na Markdown?", a: "To narzędzie jest darmowe bez limitów i działa w całości w przeglądarce. W przeciwieństwie do wielu darmowych konwerterów online nigdy nie przesyła plików i obsługuje tabele, obrazy, skanowane PDF-y i konwersję wsadową." },
        { q: "Czy online konwertery PDF na Markdown są bezpieczne?", a: "Zależy od tego, czy przesyłają plik. Wiele tak robi, co jest ryzykowne dla poufnych dokumentów. Ten konwerter przetwarza wszystko lokalnie w przeglądarce, więc pliki nie opuszczają urządzenia." },
        { q: "Czy muszę instalować oprogramowanie?", a: "Nie. Narzędzia CLI jak Pandoc są potężne, ale wymagają instalacji. Ten konwerter działa od razu w każdej nowoczesnej przeglądarce, na każdym urządzeniu." },
      ],
    },
    Ocr: {
      metaTitle: "Skanowany PDF na Markdown — darmowy konwerter OCR",
      metaDescription: "Zamień skanowane lub obrazowe PDF-y na Markdown z wbudowanym OCR. Rozpoznaje tekst w 100+ językach, działa w przeglądarce, plik nie jest przesyłany.",
      keywords: [
        "skanowany pdf na markdown",
        "pdf na markdown ocr",
        "ocr pdf na markdown",
        "obrazowy pdf na markdown",
        "konwertować skanowany pdf na markdown",
      ],
      badge: "OCR · Skanowany PDF",
      h1: "Skanowany PDF na Markdown",
      subtitle: "Wyodrębnij tekst ze skanowanych lub obrazowych PDF-ów i uzyskaj czysty Markdown. OCR działa w całości w przeglądarce — plik nie opuszcza urządzenia.",
      privacyBadge: "100% prywatnie — pliki nie opuszczają przeglądarki",
      languageLabel: "Język dokumentu",
      dropTitle: "Upuść skanowany PDF tutaj lub",
      dropClickBrowse: "kliknij, aby przeglądać",
      dropSubtitle: "Obraz lub skanowany PDF · OCR w przeglądarce · Maks. 50 MB",
      samplePrompt: "Brak PDF pod ręką?",
      trySample: "Wypróbuj przykład",
      modelNote: "Pierwsze uruchomienie pobiera model językowy (~2–15 MB). Potem działa offline — plik jest przetwarzany lokalnie.",
      paneOriginal: "Oryginalny PDF",
      rendering: "Renderowanie stron",
      recognizing: "Rozpoznawanie tekstu",
      tabPreview: "Podgląd",
      tabSource: "Źródło",
      ocrProgress: "Strona {page}/{total} · {pct}%",
      actionNewFile: "Nowy plik",
      errorNotPdf: "Prześlij plik PDF.",
      errorTooLarge: "Plik przekracza 50 MB. Większe pliki nie są jeszcze obsługiwane.",
      errorNoPages: "Nie udało się odczytać stron z tego PDF.",
      errorFailed: "OCR nie powiodło się. Spróbuj innego pliku.",
      audienceTitle: "Kto z tego korzysta",
      audience: [
        { title: "Archiwiści", body: "Digitalizuj skanowane książki, paragony i stare dokumenty do edytowalnego Markdown." },
        { title: "Studenci", body: "Zamieniaj sfotografowane slajdy i materiały na przeszukiwalne notatki." },
        { title: "Biura", body: "Wyodrębniaj tekst ze skanowanych umów i formularzy bez przepisywania." },
      ],
      howToName: "Jak przekonwertować skanowany PDF na Markdown",
      howToSteps: [
        "Wybierz język dokumentu i upuść skanowany lub obrazowy PDF.",
        "Obserwuj renderowanie i rozpoznawanie każdej strony obok siebie w przeglądarce.",
        "Skopiuj Markdown lub pobierz plik .md po zakończeniu OCR.",
      ],
      features: [
        { title: "Wbudowany OCR", body: "Odczytuje tekst ze skanowanych i obrazowych PDF-ów, których zwykłe konwertery nie obsługują, dzięki Tesseract w przeglądarce." },
        { title: "100+ języków", body: "Rozpoznaje angielski, chiński, japoński, koreański, hiszpański, francuski, niemiecki, rosyjski i wiele innych." },
        { title: "Prywatność od podstaw", body: "OCR działa lokalnie przez WebAssembly. Pobierany jest tylko model językowy — dokument nie opuszcza urządzenia." },
      ],
      faqs: [
        { q: "Czym jest skanowany PDF?", a: "Skanowany lub obrazowy PDF nie ma warstwy tekstu do zaznaczenia — to w zasadzie zdjęcia stron. Zwykłe konwertery nic nie zwracają, więc potrzebny jest OCR." },
        { q: "Czy OCR jest darmowy i prywatny?", a: "Tak. Rozpoznawanie działa w całości w przeglądarce przez WebAssembly. Tylko model językowy jest pobierany z CDN; PDF nie jest przesyłany." },
        { q: "Jakie języki są obsługiwane?", a: "Wybierz angielski, chiński uproszczony i tradycyjny, japoński, koreański, hiszpański, francuski, niemiecki, rosyjski i inne przed startem." },
        { q: "Dlaczego OCR jest wolniejszy niż zwykła konwersja?", a: "OCR analizuje każdy obraz strony piksel po pikselu, by rozpoznać znaki — to cięższe niż odczyt istniejącej warstwy tekstu. Większe dokumenty trwają dłużej." },
      ],
    },
  },
};

function deepMerge(target, source) {
  for (const key of Object.keys(source)) {
    const s = source[key];
    const t = target[key];
    if (s && typeof s === "object" && !Array.isArray(s) && t && typeof t === "object" && !Array.isArray(t)) {
      deepMerge(t, s);
    } else {
      target[key] = s;
    }
  }
  return target;
}

for (const locale of ["nl", "pl"]) {
  const path = join(root, "messages", `${locale}.json`);
  const data = JSON.parse(readFileSync(path, "utf8"));
  deepMerge(data, patches[locale]);
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  console.log(`Patched messages/${locale}.json`);
}
