import type { Line, PageContent } from "@/lib/types";

// Lines within the top/bottom 10% of the page are candidate headers/footers.
const MARGIN_FRACTION = 0.1;

function normalize(text: string): string {
  return text
    .replace(/\d+/g, "#") // page numbers vary -> normalize digits
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function isPageNumber(text: string): boolean {
  const t = text.trim();
  return (
    /^\d{1,4}$/.test(t) ||
    /^page\s+\d+(\s*(\/|of)\s*\d+)?$/i.test(t) ||
    /^[-–—]\s*\d+\s*[-–—]$/.test(t)
  );
}

function marginLines(page: PageContent): Set<Line> {
  const top = page.height * (1 - MARGIN_FRACTION);
  const bottom = page.height * MARGIN_FRACTION;
  const set = new Set<Line>();
  for (const ln of page.lines) {
    if (ln.y >= top || ln.y <= bottom) set.add(ln);
  }
  return set;
}

// Remove running headers/footers (text repeated in the margins across pages)
// and standalone page numbers, which otherwise pollute the Markdown output.
export function stripRunningHeadersFooters(
  pages: PageContent[]
): PageContent[] {
  if (pages.length === 0) return pages;

  const pageSets = pages.map(marginLines);
  const occurrence = new Map<string, number>();
  pageSets.forEach((set) => {
    const seen = new Set<string>();
    for (const ln of set) {
      const key = normalize(ln.text);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      occurrence.set(key, (occurrence.get(key) ?? 0) + 1);
    }
  });

  const repeated = new Set<string>();
  if (pages.length >= 2) {
    const threshold = Math.max(2, Math.ceil(pages.length * 0.5));
    for (const [key, count] of occurrence) {
      if (count >= threshold) repeated.add(key);
    }
  }

  return pages.map((page, i) => {
    const band = pageSets[i];
    const lines = page.lines.filter((ln) => {
      if (!band.has(ln)) return true;
      if (isPageNumber(ln.text)) return false;
      if (repeated.has(normalize(ln.text))) return false;
      return true;
    });
    return { ...page, lines };
  });
}
