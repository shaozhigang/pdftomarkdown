import * as pdfjs from "pdfjs-dist";
import type { PDFPageProxy } from "pdfjs-dist/types/src/display/api";
import type { PageImage } from "@/lib/types";

if (typeof window !== "undefined") {
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
}

// Render scale used when cropping images out of the rasterized page. Higher =
// sharper extracted images at the cost of memory.
const IMG_SCALE = 2;
// Ignore anything smaller than this (icons, bullets, hairline rules).
const MIN_DEVICE_PX = 32;

type Matrix = [number, number, number, number, number, number];
const IDENTITY: Matrix = [1, 0, 0, 1, 0, 0];

// Compose two matrices so that apply(mul(a, b), p) === apply(a, apply(b, p)).
function mul(a: Matrix, b: Matrix): Matrix {
  return [
    a[0] * b[0] + a[2] * b[1],
    a[1] * b[0] + a[3] * b[1],
    a[0] * b[2] + a[2] * b[3],
    a[1] * b[2] + a[3] * b[3],
    a[0] * b[4] + a[2] * b[5] + a[4],
    a[1] * b[4] + a[3] * b[5] + a[5],
  ];
}

function apply(m: Matrix, x: number, y: number): [number, number] {
  return [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];
}

interface UserBox {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

/** Walk the operator list, tracking the CTM, to find where images are drawn. */
async function collectImageBoxes(page: PDFPageProxy): Promise<UserBox[]> {
  const OPS = pdfjs.OPS;
  const ops = await page.getOperatorList();
  let ctm: Matrix = IDENTITY;
  const stack: Matrix[] = [];
  const boxes: UserBox[] = [];

  // Not every pdf.js build exposes the same set of image ops, so look them up
  // by name defensively.
  const opsByName = OPS as unknown as Record<string, number | undefined>;
  const imageOps = new Set<number>(
    [
      "paintImageXObject",
      "paintJpegXObject",
      "paintImageXObjectRepeat",
      "paintInlineImageXObject",
    ]
      .map((name) => opsByName[name])
      .filter((op): op is number => typeof op === "number")
  );

  for (let i = 0; i < ops.fnArray.length; i++) {
    const fn = ops.fnArray[i];
    if (fn === OPS.save) {
      stack.push(ctm);
    } else if (fn === OPS.restore) {
      ctm = stack.pop() ?? IDENTITY;
    } else if (fn === OPS.transform) {
      ctm = mul(ctm, ops.argsArray[i] as Matrix);
    } else if (imageOps.has(fn)) {
      const corners = [
        apply(ctm, 0, 0),
        apply(ctm, 1, 0),
        apply(ctm, 0, 1),
        apply(ctm, 1, 1),
      ];
      const xs = corners.map((c) => c[0]);
      const ys = corners.map((c) => c[1]);
      boxes.push({
        x0: Math.min(...xs),
        y0: Math.min(...ys),
        x1: Math.max(...xs),
        y1: Math.max(...ys),
      });
    }
  }
  return boxes;
}

/**
 * Extract embedded images from a page as PNG data URLs by cropping them out of
 * a full-page render. This is format-agnostic (JPEG, PNG, masks, CMYK, …) and
 * keeps everything in the browser — no bytes leave the device.
 */
export async function extractPageImages(
  page: PDFPageProxy
): Promise<PageImage[]> {
  const userBoxes = await collectImageBoxes(page);
  if (userBoxes.length === 0) return [];

  const scaled = page.getViewport({ scale: IMG_SCALE });

  const deviceBoxes = userBoxes
    .map((b) => {
      const p1 = scaled.convertToViewportPoint(b.x0, b.y0);
      const p2 = scaled.convertToViewportPoint(b.x1, b.y1);
      return {
        left: Math.min(p1[0], p2[0]),
        top: Math.min(p1[1], p2[1]),
        right: Math.max(p1[0], p2[0]),
        bottom: Math.max(p1[1], p2[1]),
        userTop: b.y1, // top edge in user space, for reading-order placement
      };
    })
    .filter(
      (b) =>
        b.right - b.left >= MIN_DEVICE_PX && b.bottom - b.top >= MIN_DEVICE_PX
    );

  if (deviceBoxes.length === 0) return [];

  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(scaled.width);
  canvas.height = Math.ceil(scaled.height);
  const ctx = canvas.getContext("2d");
  if (!ctx) return [];
  await page.render({ canvasContext: ctx, viewport: scaled }).promise;

  const images: PageImage[] = [];
  for (const b of deviceBoxes) {
    const w = Math.round(b.right - b.left);
    const h = Math.round(b.bottom - b.top);
    const sx = Math.max(0, Math.round(b.left));
    const sy = Math.max(0, Math.round(b.top));
    const crop = document.createElement("canvas");
    crop.width = w;
    crop.height = h;
    const cctx = crop.getContext("2d");
    if (!cctx) continue;
    cctx.drawImage(canvas, sx, sy, w, h, 0, 0, w, h);
    images.push({
      dataUrl: crop.toDataURL("image/png"),
      x: b.left,
      y: b.userTop,
      width: w,
      height: h,
    });
    crop.width = 0;
    crop.height = 0;
  }

  canvas.width = 0;
  canvas.height = 0;
  return images;
}
