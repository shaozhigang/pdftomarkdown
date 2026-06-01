export interface Feature {
  title: string;
  body: string;
}

export interface Faq {
  q: string;
  a: string;
}

export interface LandingContent {
  slug: string; // "" for the home page
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  badge: string;
  h1: string;
  subtitle: string;
  features: Feature[];
  faqs: Faq[];
}

// Public site URL, used for canonical links, sitemap and structured data.
// Override at build time with NEXT_PUBLIC_SITE_URL.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://pdftomarkdown.run"
).replace(/\/$/, "");

const PRIVACY_FAQ: Faq = {
  q: "Are my files uploaded to a server?",
  a: "No. Conversion runs entirely in your browser using WebAssembly. Your PDF never leaves your device, which makes it safe for contracts, research and other private documents.",
};

export const LANDING_PAGES: LandingContent[] = [
  {
    slug: "",
    metaTitle: "PDF to Markdown — Free, Private, Local Converter",
    metaDescription:
      "Convert PDF to clean Markdown right in your browser. 100% local — files never leave your device. Built for LLM, RAG, Obsidian and Notion workflows.",
    keywords: [
      "pdf to markdown",
      "convert pdf to markdown",
      "pdf to md",
      "pdf to markdown online free",
    ],
    badge: "100% local · no upload",
    h1: "PDF to Markdown",
    subtitle:
      "Convert PDF to clean Markdown right in your browser. Built for LLM, RAG, Obsidian and Notion workflows.",
    features: [
      {
        title: "Private by design",
        body: "Everything happens in your browser. No uploads, no servers, no tracking of your documents.",
      },
      {
        title: "Clean structure",
        body: "Headings, lists, nested bullets and tables are preserved so the Markdown is ready to use.",
      },
      {
        title: "Free & unlimited",
        body: "No sign-up, no watermark, no daily limit for single-file conversions.",
      },
    ],
    faqs: [
      PRIVACY_FAQ,
      {
        q: "What does the converter preserve?",
        a: "Headings, paragraphs, ordered and unordered lists (including nesting) and tables. Running headers, footers and page numbers are stripped automatically.",
      },
      {
        q: "Does it support scanned PDFs?",
        a: "Text-based PDFs are fully supported today. OCR for scanned or image-only PDFs is on the roadmap.",
      },
    ],
  },
  {
    slug: "pdf-to-markdown-for-obsidian",
    metaTitle: "PDF to Markdown for Obsidian — Offline & Clean",
    metaDescription:
      "Turn PDFs into clean Markdown notes for Obsidian. 100% offline in your browser — drop the .md straight into your vault with headings, lists and tables intact.",
    keywords: [
      "pdf to markdown for obsidian",
      "obsidian pdf to markdown",
      "import pdf into obsidian",
      "pdf to md obsidian",
    ],
    badge: "Offline · vault-ready",
    h1: "PDF to Markdown for Obsidian",
    subtitle:
      "Convert PDFs into clean, offline Markdown notes you can drop straight into your Obsidian vault — headings, lists and tables kept intact.",
    features: [
      {
        title: "Vault-ready output",
        body: "Download a .md file and move it into your vault. Headings become note structure and tables stay as Markdown tables.",
      },
      {
        title: "Fully offline",
        body: "No upload step means it works even with the network off — ideal for private research notes and clippings.",
      },
      {
        title: "Clean notes",
        body: "Page numbers and repeated headers/footers are removed so your notes are not polluted with print artifacts.",
      },
    ],
    faqs: [
      PRIVACY_FAQ,
      {
        q: "How do I import the result into Obsidian?",
        a: "Click “Download .md” and move the file into any folder inside your Obsidian vault. It appears instantly as a new note.",
      },
      {
        q: "Will tables and lists survive the import?",
        a: "Yes. Tables are converted to GitHub-flavored Markdown tables and nested bullet lists keep their indentation.",
      },
    ],
  },
  {
    slug: "pdf-to-markdown-for-chatgpt",
    metaTitle: "PDF to Markdown for ChatGPT, LLMs & RAG",
    metaDescription:
      "Convert PDFs to clean Markdown that's ready for ChatGPT, Claude and RAG pipelines. Compact, structured output that LLMs parse reliably — processed locally in your browser.",
    keywords: [
      "pdf to markdown for chatgpt",
      "pdf to markdown for llm",
      "pdf to markdown for rag",
      "pdf to markdown for ai",
    ],
    badge: "LLM-ready output",
    h1: "PDF to Markdown for ChatGPT & LLMs",
    subtitle:
      "Convert PDFs into compact, structured Markdown that ChatGPT, Claude and RAG pipelines can parse reliably — all processed locally in your browser.",
    features: [
      {
        title: "Token-efficient",
        body: "Markdown is far more compact than raw PDF text dumps, so you fit more context into the model's window.",
      },
      {
        title: "Structure the model understands",
        body: "Clean headings and lists give the model document hierarchy, which improves grounding and reduces hallucination.",
      },
      {
        title: "Ready for RAG",
        body: "Predictable Markdown is easy to chunk and embed into a vector database for retrieval augmented generation.",
      },
    ],
    faqs: [
      PRIVACY_FAQ,
      {
        q: "Why is Markdown better than raw PDF text for LLMs?",
        a: "Markdown encodes structure (headings, lists, tables) with very few extra tokens, which helps the model interpret the document and keeps prompts small.",
      },
      {
        q: "Can I use the output in a RAG pipeline?",
        a: "Yes. The clean Markdown is straightforward to split into chunks and embed for retrieval, with headings acting as natural chunk boundaries.",
      },
    ],
  },
  {
    slug: "pdf-table-to-markdown",
    metaTitle: "PDF Table to Markdown — Convert Tables Cleanly",
    metaDescription:
      "Extract tables from PDFs into GitHub-flavored Markdown tables. Column structure is detected automatically and processed locally in your browser — no upload.",
    keywords: [
      "pdf table to markdown",
      "convert pdf table to markdown",
      "pdf to markdown table",
      "extract table from pdf to markdown",
    ],
    badge: "Tables · GFM output",
    h1: "PDF Table to Markdown",
    subtitle:
      "Extract tables from your PDFs into clean GitHub-flavored Markdown tables. Column boundaries are detected automatically, all in your browser.",
    features: [
      {
        title: "Automatic column detection",
        body: "The engine aligns cells by their horizontal position, so multi-column tables come out correctly structured.",
      },
      {
        title: "GFM tables",
        body: "Output uses standard GitHub-flavored Markdown tables that render in GitHub, Obsidian, Notion and most editors.",
      },
      {
        title: "Mixed documents welcome",
        body: "Tables, headings and prose in the same PDF are all handled together in a single pass.",
      },
    ],
    faqs: [
      PRIVACY_FAQ,
      {
        q: "What table layouts are supported?",
        a: "Text-based tables with clear column spacing convert best. Merged cells are flattened because Markdown tables don't support cell spanning.",
      },
      {
        q: "Can I copy just the table?",
        a: "Yes. Convert the PDF, switch to the source view, and copy the table block you need.",
      },
    ],
  },
];

export function getLanding(slug: string): LandingContent | undefined {
  return LANDING_PAGES.find((p) => p.slug === slug);
}

// Slugs of non-home pages, used for navigation and the sitemap.
export const SECONDARY_PAGES = LANDING_PAGES.filter((p) => p.slug !== "");
