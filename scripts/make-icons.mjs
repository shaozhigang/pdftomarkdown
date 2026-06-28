import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import pngToIco from "png-to-ico";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const appDir = resolve(root, "src/app");

const iconSvg = readFileSync(resolve(appDir, "icon.svg"));

// The official Markdown mark (white) used across all icons.
const MARK_PATH =
  "M30 98V30h20l20 25 20-25h20v68H90V59L70 84 50 59v39zm125 0l-30-33h20V30h20v35h20z";

// --- favicon.ico (16 / 32 / 48 px, embedded as PNG) ---
const icoSizes = [16, 32, 48];
const icoBuffers = await Promise.all(
  icoSizes.map((size) =>
    sharp(iconSvg, { density: 384 }).resize(size, size).png().toBuffer()
  )
);
writeFileSync(resolve(appDir, "favicon.ico"), await pngToIco(icoBuffers));
console.log(`[make-icons] favicon.ico (${icoSizes.join("/")}px)`);

// --- apple-icon.png (180 px) ---
await sharp(iconSvg, { density: 768 })
  .resize(180, 180)
  .png()
  .toFile(resolve(appDir, "apple-icon.png"));
console.log("[make-icons] apple-icon.png (180px)");

// --- opengraph-image.png (1200x630) ---
const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#6366f1" />
      <stop offset="1" stop-color="#4338ca" />
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#g)" />
  <g transform="translate(480 138) scale(1.15)">
    <rect x="5" y="5" width="198" height="118" ry="14" fill="none" stroke="#ffffff" stroke-width="12" />
    <path fill="#ffffff" d="${MARK_PATH}" />
  </g>
  <text x="600" y="430" text-anchor="middle" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-size="78" font-weight="700">PDF to Markdown</text>
  <text x="600" y="492" text-anchor="middle" fill="#ffffff" fill-opacity="0.9" font-family="Arial, Helvetica, sans-serif" font-size="34">Free &#183; Private &#183; 100% Local in your browser</text>
</svg>`;
await sharp(Buffer.from(ogSvg))
  .png()
  .toFile(resolve(appDir, "opengraph-image.png"));
console.log("[make-icons] opengraph-image.png (1200x630)");
