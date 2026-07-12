import type {
  IImageOptions,
  ILevelsOptions,
  ISectionOptions,
  Paragraph as ParagraphType,
  Table as TableType,
} from "docx";
import type { Block } from "@/lib/types";

export interface DocxMeta {
  title: string;
}

// Word content width for an A4 page with default margins, in DXA twips
// (≈ 6.5 inch usable width). Images are scaled down to fit this.
const CONTENT_WIDTH_PX = 600;
const MAX_LIST_LEVELS = 6;

/** Decode a `data:...;base64,xxx` URL into raw bytes. */
function dataUrlToBytes(dataUrl: string): Uint8Array | null {
  const comma = dataUrl.indexOf(",");
  if (comma === -1) return null;
  const base64 = dataUrl.slice(comma + 1);
  try {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  } catch {
    return null;
  }
}

/** Read intrinsic PNG dimensions straight from the IHDR chunk. */
function pngSize(bytes: Uint8Array): { width: number; height: number } | null {
  // PNG signature (8 bytes) + IHDR length (4) + "IHDR" (4) then width/height.
  if (bytes.length < 24 || bytes[0] !== 0x89 || bytes[1] !== 0x50) return null;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const width = view.getUint32(16);
  const height = view.getUint32(20);
  if (!width || !height) return null;
  return { width, height };
}

/** Build a decimal numbering config so ordered lists render as 1. 2. 3. */
function orderedLevels(): ILevelsOptions[] {
  const levels: ILevelsOptions[] = [];
  for (let level = 0; level < MAX_LIST_LEVELS; level++) {
    levels.push({
      level,
      format: "decimal",
      text: `%${level + 1}.`,
      alignment: "start",
      style: { paragraph: { indent: { left: 720 * (level + 1), hanging: 360 } } },
    });
  }
  return levels;
}

export async function blocksToDocx(
  blocks: Block[],
  meta: DocxMeta
): Promise<Blob> {
  const {
    Document,
    Packer,
    Paragraph,
    TextRun,
    HeadingLevel,
    Table,
    TableRow,
    TableCell,
    ImageRun,
    WidthType,
  } = await import("docx");

  const headingByLevel = [
    HeadingLevel.HEADING_1,
    HeadingLevel.HEADING_2,
    HeadingLevel.HEADING_3,
    HeadingLevel.HEADING_4,
    HeadingLevel.HEADING_5,
    HeadingLevel.HEADING_6,
  ];

  const children: (ParagraphType | TableType)[] = [];
  const numberingConfig: { reference: string; levels: ILevelsOptions[] }[] = [];
  let orderedListSeq = 0;

  const paragraphFromText = (text: string): ParagraphType => {
    const trimmed = text.trim();
    // Captions arrive wrapped in single asterisks (see blocks.ts) → italic.
    const caption = /^\*(.+)\*$/.exec(trimmed);
    if (caption) {
      return new Paragraph({
        children: [new TextRun({ text: caption[1], italics: true })],
      });
    }
    return new Paragraph({ children: [new TextRun(trimmed)] });
  };

  for (const block of blocks) {
    switch (block.type) {
      case "heading": {
        const level = Math.min(Math.max(block.level ?? 1, 1), 6);
        children.push(
          new Paragraph({
            heading: headingByLevel[level - 1],
            children: [new TextRun(block.text?.trim() ?? "")],
          })
        );
        break;
      }

      case "paragraph": {
        if (block.text?.trim()) children.push(paragraphFromText(block.text));
        break;
      }

      case "list": {
        const items = block.items ?? [];
        const levels = block.levels ?? [];
        if (items.length === 0) break;

        if (block.ordered) {
          const reference = `ol-${orderedListSeq++}`;
          numberingConfig.push({ reference, levels: orderedLevels() });
          items.forEach((item, i) => {
            children.push(
              new Paragraph({
                numbering: {
                  reference,
                  level: Math.min(levels[i] ?? 0, MAX_LIST_LEVELS - 1),
                },
                children: [new TextRun(item)],
              })
            );
          });
        } else {
          items.forEach((item, i) => {
            children.push(
              new Paragraph({
                bullet: { level: Math.min(levels[i] ?? 0, MAX_LIST_LEVELS - 1) },
                children: [new TextRun(item)],
              })
            );
          });
        }
        break;
      }

      case "code": {
        const lines = (block.text ?? "").split("\n");
        children.push(
          new Paragraph({
            shading: { type: "clear", fill: "F4F4F5" },
            children: lines.flatMap((line, i) => {
              const run = new TextRun({
                text: line,
                font: "Courier New",
                size: 20,
                break: i > 0 ? 1 : undefined,
              });
              return [run];
            }),
          })
        );
        break;
      }

      case "table": {
        const rows = block.rows ?? [];
        if (rows.length === 0) break;
        const colCount = Math.max(...rows.map((r) => r.length));
        children.push(
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: rows.map(
              (row, ri) =>
                new TableRow({
                  tableHeader: ri === 0,
                  children: Array.from({ length: colCount }, (_, ci) => {
                    const cell = row[ci] ?? "";
                    return new TableCell({
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({ text: cell, bold: ri === 0 }),
                          ],
                        }),
                      ],
                    });
                  }),
                })
            ),
          })
        );
        break;
      }

      case "image": {
        if (!block.src) break;
        const bytes = block.src.startsWith("data:")
          ? dataUrlToBytes(block.src)
          : null;
        if (!bytes) break;
        const size = pngSize(bytes);
        const ratio = size ? size.height / size.width : 0.75;
        const width = size ? Math.min(size.width, CONTENT_WIDTH_PX) : CONTENT_WIDTH_PX;
        const height = Math.round(width * ratio);
        const options: IImageOptions = {
          type: "png",
          data: bytes,
          transformation: { width, height },
        };
        children.push(
          new Paragraph({ children: [new ImageRun(options)] })
        );
        break;
      }
    }
  }

  if (children.length === 0) {
    children.push(new Paragraph({ children: [new TextRun("")] }));
  }

  const section: ISectionOptions = { children };

  const doc = new Document({
    title: meta.title,
    numbering: { config: numberingConfig },
    sections: [section],
  });

  return Packer.toBlob(doc);
}
