import PDFDocument from "pdfkit";
import { ProcessedContent } from "../processors";
import { readFileSync, existsSync } from "fs";
import path from "path";

const BRAND = "#00D4FF";
const TEXT = "#111111";
const MUTED = "#666666";
const HEADING1 = "#0A1628";
const HEADING2 = "#1A2E4A";
const TABLE_HEADER_BG = "#E8F4FD";

const LOGO_PATH = path.join(process.cwd(), "public", "n_logo_print.png");
function getLogo(): Buffer | null {
  try { return existsSync(LOGO_PATH) ? readFileSync(LOGO_PATH) : null; }
  catch { return null; }
}

function detectHeading(line: string): { level: number; text: string } | null {
  const md = line.match(/^(#{1,6})\s+(.+)/);
  if (md) return { level: md[1].length, text: md[2].trim() };
  if (line.match(/^[A-Z][A-Z\s]{3,}$/) && line.length < 80) return { level: 2, text: line };
  return null;
}

function drawTable(doc: PDFKit.PDFDocument, tableData: unknown[][], pageWidth: number) {
  if (!tableData || tableData.length === 0) return;

  const maxCols = Math.max(...tableData.map((r) => (r as unknown[]).length));
  if (maxCols === 0) return;

  const colWidth = Math.min(pageWidth / maxCols, 150);
  const rowHeight = 20;
  const fontSize = 8;

  // Cap at 100 rows for PDF sanity
  const rows = tableData.slice(0, 100);

  for (let r = 0; r < rows.length; r++) {
    const row = rows[r] as unknown[];
    const isHeader = r === 0;

    // Check page break
    if (doc.y + rowHeight > doc.page.height - doc.page.margins.bottom) {
      doc.addPage();
    }

    const rowY = doc.y;

    // Draw cells
    for (let c = 0; c < maxCols; c++) {
      const x = doc.page.margins.left + c * colWidth;
      const cellText = String(row[c] ?? "");

      if (isHeader) {
        doc.rect(x, rowY, colWidth, rowHeight).fill(TABLE_HEADER_BG);
      }
      doc.rect(x, rowY, colWidth, rowHeight).stroke("#CCCCCC");

      doc
        .font(isHeader ? "Helvetica-Bold" : "Helvetica")
        .fontSize(fontSize)
        .fillColor(TEXT)
        .text(cellText.substring(0, 30), x + 3, rowY + 5, {
          width: colWidth - 6,
          height: rowHeight - 4,
          ellipsis: true,
          lineBreak: false,
        });
    }
    doc.moveDown(0);
    doc.y = rowY + rowHeight;
  }
  doc.moveDown(1);
}

export async function generatePdf(content: ProcessedContent, originalName: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const chunks: Buffer[] = [];
      const doc = new PDFDocument({
        margins: { top: 72, bottom: 72, left: 72, right: 72 },
        bufferPages: true,
        info: {
          Title: originalName,
          Author: "Nexus Revive",
          Subject: "Recovered Document",
          Creator: "Nexus Revive",
        },
      });

      doc.on("data", (c) => chunks.push(c));
      doc.on("end", () => {
        const buf = Buffer.concat(chunks);
        if (!buf || buf.length === 0) return reject(new Error("Generated PDF is empty"));

        // Add logo + page numbers to all pages
        const logo = getLogo();
        const pages = doc.bufferedPageRange();
        for (let i = 0; i < pages.count; i++) {
          doc.switchToPage(i);
          // Logo top-right on every page
          if (logo) {
            try {
              doc.image(logo, doc.page.width - 72 - 28, 18, { width: 28, height: 28 });
            } catch { /* skip if image fails */ }
          }
          // Page footer
          doc.fontSize(7.5).fillColor(MUTED)
            .text(
              `Page ${i + 1} of ${pages.count}  •  nexusrevive.com`,
              72, doc.page.height - 38,
              { align: "center", width: doc.page.width - 144 }
            );
        }
        doc.flushPages();
        resolve(Buffer.concat(chunks));
      });
      doc.on("error", (err) => reject(new Error(`PDF error: ${err.message}`)));

      const pageWidth = doc.page.width - 144;
      const logo = getLogo();

      // ── Title block ─────────────────────────────────────────────────────────
      const title = originalName.replace(/\.[^.]+$/, "");
      if (logo) {
        try { doc.image(logo, 72, doc.y, { width: 32, height: 32 }); } catch { /* skip */ }
        doc.font("Helvetica-Bold").fontSize(22).fillColor(HEADING1).text(title, 112, doc.y - 28);
        doc.moveDown(0.5);
      } else {
        doc.font("Helvetica-Bold").fontSize(24).fillColor(HEADING1).text(title, { align: "left" });
        doc.moveDown(0.3);
      }
      doc.font("Helvetica").fontSize(9).fillColor(MUTED)
        .text(`Recovered by Nexus Revive • nexusrevive.com • ${new Date().toLocaleDateString()}`, { align: "left" });

      // Divider
      doc.moveDown(0.5);
      doc.moveTo(72, doc.y).lineTo(72 + pageWidth, doc.y).lineWidth(1).strokeColor(BRAND).stroke();
      doc.moveDown(1);

      // ── Tables if present ───────────────────────────────────────────────────
      if (content.tables && content.tables.length > 0) {
        for (const table of content.tables) {
          if (Array.isArray(table) && table.length > 0) {
            drawTable(doc, table as unknown[][], pageWidth);
          }
        }
      } else {
        // ── Text content ──────────────────────────────────────────────────────
        const lines = content.text.split("\n");
        for (const line of lines) {
          const trimmed = line.trim();

          if (!trimmed) { doc.moveDown(0.4); continue; }

          const heading = detectHeading(trimmed);
          if (heading) {
            if (doc.y > doc.page.height - doc.page.margins.bottom - 60) doc.addPage();
            if (heading.level === 1) {
              doc.moveDown(0.5);
              doc.font("Helvetica-Bold").fontSize(18).fillColor(HEADING1).text(heading.text);
              doc.moveTo(72, doc.y + 2).lineTo(72 + pageWidth * 0.5, doc.y + 2).lineWidth(0.5).strokeColor(BRAND).stroke();
              doc.moveDown(0.5);
            } else if (heading.level === 2) {
              doc.moveDown(0.4);
              doc.font("Helvetica-Bold").fontSize(14).fillColor(HEADING2).text(heading.text);
              doc.moveDown(0.3);
            } else {
              doc.moveDown(0.3);
              doc.font("Helvetica-BoldOblique").fontSize(12).fillColor(HEADING2).text(heading.text);
              doc.moveDown(0.2);
            }
          } else if (trimmed.startsWith("- ") || trimmed.startsWith("• ")) {
            doc.font("Helvetica").fontSize(10).fillColor(TEXT)
              .text(`  •  ${trimmed.slice(2)}`, { indent: 10, lineGap: 3 });
          } else if (trimmed.match(/^\d+\.\s/)) {
            doc.font("Helvetica").fontSize(10).fillColor(TEXT)
              .text(`  ${trimmed}`, { indent: 10, lineGap: 3 });
          } else if (trimmed.startsWith("    ") || trimmed.startsWith("\t")) {
            // Code block
            doc.font("Courier").fontSize(9).fillColor("#333333")
              .text(trimmed.trim(), { indent: 15, lineGap: 2 });
          } else {
            doc.font("Helvetica").fontSize(10).fillColor(TEXT)
              .text(trimmed, { align: "justify", lineGap: 4 });
          }
        }
      }

      doc.end();
    } catch (err) {
      reject(new Error(`PDF generation failed: ${err instanceof Error ? err.message : "unknown"}`));
    }
  });
}
