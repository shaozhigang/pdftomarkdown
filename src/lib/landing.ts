// Public site URL, used for canonical links, sitemap and structured data.
// Override at build time with NEXT_PUBLIC_SITE_URL.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://pdftomarkdown.run"
).replace(/\/$/, "");

// ---- Types (shared with LandingPage component) ----

export interface Feature {
  title: string;
  body: string;
}

export interface Faq {
  q: string;
  a: string;
}

export interface LandingContent {
  slug: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  badge: string;
  h1: string;
  subtitle: string;
  features: Feature[];
  faqs: Faq[];
}

export interface RelatedPage {
  slug: string;
  h1: string;
  subtitle: string;
}

// ---- Navigation structure ----
// Slugs for secondary (non-home) landing pages, used for sitemap and nav.
export const SECONDARY_SLUGS = [
  "pdf-to-markdown-for-obsidian",
  "pdf-to-markdown-for-chatgpt",
  "pdf-table-to-markdown",
  "pdf-to-markdown-for-notion",
  "pdf-to-markdown-python",
  "markdown-to-pdf",
  "scanned-pdf-to-markdown",
  "pdf-to-markdown-with-images",
  "batch-pdf-to-markdown",
] as const;

export const GUIDE_SLUGS = ["how-to-convert-pdf-to-markdown"] as const;

// All tool pages, shown in the header "Tools" dropdown (msgKey -> Nav.*).
export const TOOL_LINKS = [
  { slug: "markdown-to-pdf", msgKey: "mdToPdf" as const },
  { slug: "scanned-pdf-to-markdown", msgKey: "ocr" as const },
  { slug: "pdf-to-markdown-with-images", msgKey: "images" as const },
  { slug: "batch-pdf-to-markdown", msgKey: "batch" as const },
  { slug: "pdf-table-to-markdown", msgKey: "table" as const },
  { slug: "pdf-to-markdown-for-obsidian", msgKey: "obsidian" as const },
  { slug: "pdf-to-markdown-for-notion", msgKey: "notion" as const },
  { slug: "pdf-to-markdown-for-chatgpt", msgKey: "chatgpt" as const },
  { slug: "pdf-to-markdown-python", msgKey: "python" as const },
] as const;
