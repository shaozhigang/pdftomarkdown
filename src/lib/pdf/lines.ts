import type { Line, TextPiece } from "@/lib/types";

// Items whose baseline y differs by less than this fraction of font height
// are treated as the same visual line.
const LINE_Y_TOLERANCE = 0.5;

// Build the lines for a single page, accounting for multi-column layouts.
// If a vertical gutter splitting the page into two text columns is detected,
// pieces are read left-column-first then right-column, which matches human
// reading order (and avoids merging the two columns into garbled rows).
export function layoutPageLines(
  pieces: TextPiece[],
  pageWidth: number
): Line[] {
  const center = detectColumnGutter(pieces, pageWidth);
  if (center === null) return groupIntoLines(pieces);

  const firstPass = pieces.filter(
    (p) => p.x + p.width <= center || (p.x < center && p.x + p.width > center)
  );
  const secondPass = pieces.filter((p) => p.x >= center);
  return [...groupIntoLines(firstPass), ...groupIntoLines(secondPass)];
}

// Returns the x coordinate of a two-column gutter, or null for single column.
function detectColumnGutter(
  pieces: TextPiece[],
  pageWidth: number
): number | null {
  const real = pieces.filter((p) => p.text.trim() !== "");
  if (real.length < 8) return null;

  const minX = Math.min(...real.map((p) => p.x));
  const maxX = Math.max(...real.map((p) => p.x + p.width));
  const width = maxX - minX;
  if (width < pageWidth * 0.4) return null;

  const allLines = groupIntoLines(real);
  if (allLines.length < 4) return null;

  // Coverage is measured as the fraction of *lines* that have text at each
  // x bin. A wide, full-width element (e.g. a centred title) only covers a
  // bin in one line, so it cannot mask a real column gutter.
  const bin = 2;
  const n = Math.max(1, Math.ceil(width / bin));
  const hits = new Array<number>(n).fill(0);
  for (const ln of allLines) {
    const binTouched = new Array<boolean>(n).fill(false);
    for (const p of ln.pieces) {
      const s = Math.max(0, Math.floor((p.x - minX) / bin));
      const e = Math.min(n - 1, Math.floor((p.x + p.width - minX) / bin));
      for (let i = s; i <= e; i++) binTouched[i] = true;
    }
    for (let i = 0; i < n; i++) if (binTouched[i]) hits[i]++;
  }
  const COVER_FRAC = 0.25;
  const covered = hits.map((h) => h / allLines.length >= COVER_FRAC);

  // Widest uncovered run within the central 70% of the text width.
  const lo = Math.floor(n * 0.15);
  const hi = Math.ceil(n * 0.85);
  let best: { s: number; e: number } | null = null;
  let runStart = -1;
  for (let i = lo; i <= hi; i++) {
    if (!covered[i]) {
      if (runStart < 0) runStart = i;
    } else if (runStart >= 0) {
      best = pickWider(best, { s: runStart, e: i - 1 });
      runStart = -1;
    }
  }
  if (runStart >= 0) best = pickWider(best, { s: runStart, e: hi });
  if (!best) return null;

  const gutterWidth = (best.e - best.s + 1) * bin;
  if (gutterWidth < Math.max(12, pageWidth * 0.02)) return null;
  const center = minX + ((best.s + best.e + 1) / 2) * bin;

  // Validate: real two-column text fills most of each column's width,
  // whereas table cells leave a lot of empty space. This separates a
  // genuine column gutter from the gaps between table columns.
  const leftColW = center - minX;
  const rightColW = maxX - center;
  const leftFills: number[] = [];
  const rightFills: number[] = [];
  let split = 0;
  let content = 0;

  for (const ln of allLines) {
    const left = ln.pieces.filter((p) => p.x + p.width <= center);
    const right = ln.pieces.filter((p) => p.x >= center);
    if (left.length || right.length) content++;
    if (left.length && right.length) {
      split++;
      leftFills.push(sumWidth(left) / leftColW);
      rightFills.push(sumWidth(right) / rightColW);
    }
  }

  if (split < 3 || content === 0 || split / content < 0.5) return null;
  if (median(leftFills) < 0.5 || median(rightFills) < 0.5) return null;
  return center;
}

function pickWider(
  a: { s: number; e: number } | null,
  b: { s: number; e: number }
): { s: number; e: number } {
  if (!a) return b;
  return b.e - b.s > a.e - a.s ? b : a;
}

function sumWidth(pieces: TextPiece[]): number {
  return pieces.reduce((sum, p) => sum + p.width, 0);
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

export function groupIntoLines(pieces: TextPiece[]): Line[] {
  if (pieces.length === 0) return [];

  const sorted = [...pieces].sort((a, b) => b.y - a.y || a.x - b.x);
  const lines: TextPiece[][] = [];

  for (const piece of sorted) {
    const last = lines[lines.length - 1];
    if (last) {
      const ref = last[0];
      const tol = Math.max(ref.height, piece.height) * LINE_Y_TOLERANCE;
      if (Math.abs(ref.y - piece.y) <= tol) {
        last.push(piece);
        continue;
      }
    }
    lines.push([piece]);
  }

  return lines.map((group) => {
    const ordered = group.sort((a, b) => a.x - b.x);
    const text = joinPieces(ordered);
    const height = dominantHeight(ordered);
    return {
      pieces: ordered,
      text,
      x: ordered[0].x,
      y: ordered[0].y,
      height,
    };
  });
}

function joinPieces(pieces: TextPiece[]): string {
  let result = "";
  let prev: TextPiece | null = null;
  for (const piece of pieces) {
    if (prev) {
      const gap = piece.x - (prev.x + prev.width);
      // Insert a space when there is a visible horizontal gap and the
      // previous chunk does not already end with whitespace.
      const needsSpace =
        gap > prev.height * 0.25 && !/\s$/.test(result) && piece.text !== "";
      if (needsSpace) result += " ";
    }
    result += piece.text;
    prev = piece;
  }
  return result.replace(/\s+/g, " ").trim();
}

function dominantHeight(pieces: TextPiece[]): number {
  const counts = new Map<number, number>();
  for (const p of pieces) {
    const h = Math.round(p.height);
    counts.set(h, (counts.get(h) ?? 0) + p.text.length);
  }
  let best = pieces[0]?.height ?? 0;
  let bestCount = -1;
  for (const [h, c] of counts) {
    if (c > bestCount) {
      best = h;
      bestCount = c;
    }
  }
  return best;
}
