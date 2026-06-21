import {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  Table, TableRow, TableCell, WidthType, BorderStyle,
  AlignmentType, ShadingType, Header, Footer, PageNumber,
  NumberFormat, ImageRun,
} from "docx";
import { ProcessedContent } from "../processors";
import { readFileSync, existsSync } from "fs";
import path from "path";

const BRAND_COLOR = "00D4FF";
const HEADING_COLOR = "0A1628";

const LOGO_PATH = path.join(process.cwd(), "public", "n_logo_print.png");
function getLogoBuffer(): Buffer | null {
  try { return existsSync(LOGO_PATH) ? readFileSync(LOGO_PATH) : null; }
  catch { return null; }
}

function detectHeadingLevel(line: string): { level: number; text: string } | null {
  const md = line.match(/^(#{1,6})\s+(.+)/);
  if (md) return { level: md[1].length, text: md[2].trim() };
  if (line.match(/^[A-Z][A-Z\s]{3,}$/) && line.length < 80) return { level: 2, text: line };
  return null;
}

function parseInlineFormatting(text: string): TextRun[] {
  const runs: TextRun[] = [];
  // Process **bold**, *italic*, `code`
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  for (const part of parts) {
    if (part.startsWith("**") && part.endsWith("**")) {
      runs.push(new TextRun({ text: part.slice(2, -2), bold: true, font: "Calibri" }));
    } else if (part.startsWith("*") && part.endsWith("*")) {
      runs.push(new TextRun({ text: part.slice(1, -1), italics: true, font: "Calibri" }));
    } else if (part.startsWith("`") && part.endsWith("`")) {
      runs.push(new TextRun({ text: part.slice(1, -1), font: "Courier New", size: 18 }));
    } else if (part) {
      runs.push(new TextRun({ text: part, font: "Calibri" }));
    }
  }
  return runs.length > 0 ? runs : [new TextRun({ text, font: "Calibri" })];
}

function buildTableFromData(tableData: unknown[][]): Table {
  const rows = tableData.slice(0, 500).map((row, rowIdx) => {
    const cells = (row as unknown[]).map((cell) =>
      new TableCell({
        children: [new Paragraph({
          children: [new TextRun({
            text: String(cell ?? ""),
            bold: rowIdx === 0,
            font: "Calibri",
            size: rowIdx === 0 ? 20 : 18,
          })],
          spacing: { before: 60, after: 60 },
        })],
        shading: rowIdx === 0 ? { type: ShadingType.SOLID, color: "E8F4FD" } : undefined,
        margins: { top: 60, bottom: 60, left: 80, right: 80 },
      })
    );
    return new TableRow({ children: cells, tableHeader: rowIdx === 0 });
  });

  return new Table({
    rows,
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
      left: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
      right: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
    },
  });
}

export async function generateDocx(content: ProcessedContent, originalName: string): Promise<Buffer> {
  const children: (Paragraph | Table)[] = [];

  // Title
  children.push(new Paragraph({
    children: [new TextRun({ text: originalName.replace(/\.[^.]+$/, ""), bold: true, size: 52, color: BRAND_COLOR, font: "Calibri" })],
    heading: HeadingLevel.TITLE,
    spacing: { after: 200 },
  }));

  children.push(new Paragraph({
    children: [new TextRun({ text: `Recovered by Nexus Revive • ${new Date().toLocaleDateString()}`, color: "888888", size: 18, font: "Calibri", italics: true })],
    spacing: { after: 400 },
  }));

  // Tables if available
  if (content.tables && content.tables.length > 0) {
    for (const table of content.tables) {
      if (Array.isArray(table) && table.length > 0) {
        children.push(buildTableFromData(table as unknown[][]));
        children.push(new Paragraph({ text: "", spacing: { after: 200 } }));
      }
    }
  } else {
    // Parse text content
    const lines = content.text.split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) { children.push(new Paragraph({ text: "", spacing: { after: 80 } })); continue; }

      const heading = detectHeadingLevel(trimmed);
      if (heading) {
        const level = [HeadingLevel.HEADING_1, HeadingLevel.HEADING_2, HeadingLevel.HEADING_3,
                       HeadingLevel.HEADING_4, HeadingLevel.HEADING_5, HeadingLevel.HEADING_6][heading.level - 1];
        children.push(new Paragraph({
          children: [new TextRun({ text: heading.text, bold: true, font: "Calibri", color: HEADING_COLOR })],
          heading: level,
          spacing: { before: 240, after: 120 },
        }));
      } else if (trimmed.startsWith("- ") || trimmed.startsWith("• ")) {
        children.push(new Paragraph({
          children: parseInlineFormatting(trimmed.slice(2)),
          bullet: { level: 0 },
          spacing: { after: 80 },
        }));
      } else if (trimmed.match(/^\d+\.\s/)) {
        children.push(new Paragraph({
          children: parseInlineFormatting(trimmed.replace(/^\d+\.\s/, "")),
          numbering: { reference: "default-numbering", level: 0 },
          spacing: { after: 80 },
        }));
      } else {
        children.push(new Paragraph({
          children: parseInlineFormatting(trimmed),
          spacing: { after: 120 },
          alignment: AlignmentType.JUSTIFIED,
        }));
      }
    }
  }

  const doc = new Document({
    numbering: {
      config: [{
        reference: "default-numbering",
        levels: [{ level: 0, format: NumberFormat.DECIMAL, text: "%1.", alignment: AlignmentType.START }],
      }],
    },
    styles: {
      default: {
        document: { run: { font: "Calibri", size: 22 } },
      },
    },
    sections: [{
      properties: { page: { margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } } },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              children: [
                ...(getLogoBuffer() ? [new ImageRun({ data: getLogoBuffer()!, transformation: { width: 22, height: 22 } })] : []),
                new TextRun({ text: "  NEXUS REVIVE", color: BRAND_COLOR, bold: true, font: "Calibri", size: 18 }),
              ],
              alignment: AlignmentType.RIGHT,
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: "Page ", font: "Calibri", size: 16, color: "888888" }),
                new TextRun({ children: [PageNumber.CURRENT], font: "Calibri", size: 16, color: "888888" }),
                new TextRun({ text: "  •  nexusrevive.com", font: "Calibri", size: 16, color: "888888" }),
              ],
              alignment: AlignmentType.CENTER,
            }),
            ...(getLogoBuffer() ? [new Paragraph({
              children: [
                new ImageRun({ data: getLogoBuffer()!, transformation: { width: 60, height: 20 } }),
              ],
              alignment: AlignmentType.RIGHT,
            })] : []),
          ],
        }),
      },
      children,
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  if (!buffer || buffer.length === 0) throw new Error("Failed to generate DOCX");
  return buffer;
}
