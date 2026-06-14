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
] as const;

export const GUIDE_SLUGS = ["how-to-convert-pdf-to-markdown"] as const;

// Maps each secondary slug to its Nav message key (see messages/en.json "Nav").
export const NAV_ITEMS = [
  { slug: "pdf-to-markdown-for-obsidian", msgKey: "obsidian" as const },
  { slug: "pdf-to-markdown-for-chatgpt", msgKey: "chatgpt" as const },
  { slug: "pdf-table-to-markdown", msgKey: "table" as const },
] as const;
