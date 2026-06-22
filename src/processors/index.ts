import mammoth from "mammoth";
import * as XLSX from "xlsx";
import pdfParse from "pdf-parse";
import { readFileSync, existsSync } from "fs";
import path from "path";
import iconv from "iconv-lite";
import chardet from "chardet";

export interface ProcessedContent {
  text: string;
  html?: string;
  metadata?: Record<string, unknown>;
  tables?: unknown[][];
  images?: Buffer[];
  encoding?: string;
  pageCount?: number;
  wordCount?: number;
}

// ─── Encoding repair ───────────────────────────────────────────────────────────
function decodeBuffer(buffer: Buffer): { text: string; encoding: string } {
  const detected = chardet.detect(buffer);
  const enc = (detected as string) || "utf-8";
  try {
    const text = iconv.decode(buffer, enc);
    return { text, encoding: enc };
  } catch {
    return { text: buffer.toString("utf-8", 0, buffer.length), encoding: "utf-8" };
  }
}

function cleanText(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\x00/g, "")
    .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F]/g, " ")
    .replace(/\n{4,}/g, "\n\n\n")
    .replace(/[ \t]{3,}/g, "  ")
    .trim();
}

// ─── HTML → plain text (for ODT/HTML source) ───────────────────────────────────
function htmlToText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<\/h[1-6]>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

// ─── RTF → plain text (enhanced) ───────────────────────────────────────────────
function rtfToText(rtf: string): string {
  // Remove RTF header, control words, groups
  return rtf
    .replace(/\{\\[^}]*\}/g, "")
    .replace(/\\[a-z]+[-\d]* ?/gi, " ")
    .replace(/[{}\\]/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

// ─── EML parser ────────────────────────────────────────────────────────────────
function parseEml(raw: string): ProcessedContent {
  const lines = raw.split("\n");
  const headers: Record<string, string> = {};
  let body = "";
  let inBody = false;

  for (const line of lines) {
    if (!inBody && line.trim() === "") { inBody = true; continue; }
    if (!inBody) {
      const match = line.match(/^([A-Za-z-]+):\s*(.+)/);
      if (match) headers[match[1].toLowerCase()] = match[2].trim();
    } else {
      body += line + "\n";
    }
  }

  // Decode quoted-printable
  body = body.replace(/=\r?\n/g, "").replace(/=([0-9A-F]{2})/gi, (_, h) => String.fromCharCode(parseInt(h, 16)));

  const text = [
    headers.from ? `From: ${headers.from}` : "",
    headers.to ? `To: ${headers.to}` : "",
    headers.subject ? `Subject: ${headers.subject}` : "",
    headers.date ? `Date: ${headers.date}` : "",
    "---",
    body,
  ].filter(Boolean).join("\n");

  return { text: cleanText(text), metadata: headers };
}

// ─── dBASE parser ──────────────────────────────────────────────────────────────
function parseDbf(buffer: Buffer): ProcessedContent {
  try {
    const wb = XLSX.read(buffer, { type: "buffer" });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as unknown[][];
    const text = data.map((row) => (row as string[]).join("\t")).join("\n");
    return { text: text || "[Empty dBASE file]", tables: data };
  } catch {
    // Manual parse fallback
    const numRecords = buffer.readUInt32LE(4);
    const headerSize = buffer.readUInt16LE(8);
    const recordSize = buffer.readUInt16LE(10);
    const numFields = Math.floor((headerSize - 32 - 1) / 32);

    const fields: string[] = [];
    for (let i = 0; i < numFields; i++) {
      const offset = 32 + i * 32;
      const name = buffer.slice(offset, offset + 11).toString("ascii").replace(/\x00/g, "").trim();
      fields.push(name);
    }

    const rows: string[] = [fields.join("\t")];
    for (let r = 0; r < numRecords; r++) {
      const recOffset = headerSize + r * recordSize;
      if (recOffset + recordSize > buffer.length) break;
      const rec = buffer.slice(recOffset + 1, recOffset + recordSize);
      rows.push(rec.toString("ascii").trim());
    }

    return { text: rows.join("\n"), tables: [rows.map((r) => r.split("\t"))] };
  }
}

// ─── CSV parser ────────────────────────────────────────────────────────────────
function parseCsv(buffer: Buffer): ProcessedContent {
  const { text, encoding } = decodeBuffer(buffer);
  const wb = XLSX.read(text, { type: "string" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as unknown[][];
  const formatted = data.map((row) => (row as string[]).join(" | ")).join("\n");
  return { text: formatted || "[Empty CSV]", tables: data, encoding };
}

// ─── Lotus 1-2-3 parser ────────────────────────────────────────────────────────
function parseLotus(buffer: Buffer): ProcessedContent {
  try {
    const wb = XLSX.read(buffer, { type: "buffer" });
    const tables: unknown[][] = [];
    let text = "";
    for (const name of wb.SheetNames) {
      const ws = wb.Sheets[name];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as unknown[][];
      tables.push(...data);
      text += `\n=== ${name} ===\n${XLSX.utils.sheet_to_csv(ws)}`;
    }
    return { text: cleanText(text) || "[Empty Lotus file]", tables };
  } catch {
    return { text: "[Could not parse Lotus 1-2-3 file — format may be too old]" };
  }
}

// ─── WordPerfect parser (text extraction) ──────────────────────────────────────
function parseWordPerfect(buffer: Buffer): ProcessedContent {
  // WPD stores text in a specific encoding — extract printable ASCII/Latin1
  const { text, encoding } = decodeBuffer(buffer.slice(4)); // skip WP header
  const cleaned = cleanText(text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, " "));
  return {
    text: cleaned || "[WordPerfect file — limited text extraction]",
    metadata: { format: "WordPerfect" },
    encoding,
  };
}

// ─── ODT/ODS parser via JSZip + XML ────────────────────────────────────────────
async function parseOdf(buffer: Buffer, format: string): Promise<ProcessedContent> {
  try {
    const { default: JSZip } = await import("jszip");
    const zip = await JSZip.loadAsync(buffer);
    const contentXml = await zip.file("content.xml")?.async("text");
    if (!contentXml) throw new Error("No content.xml in ODF");

    if (format === "ODS") {
      // Extract table data
      const rows = contentXml.match(/<table:table-row[^>]*>([\s\S]*?)<\/table:table-row>/g) || [];
      const tables: string[][] = rows.map((row) => {
        const cells = row.match(/<text:p[^>]*>([\s\S]*?)<\/text:p>/g) || [];
        return cells.map((c) => c.replace(/<[^>]+>/g, "").trim());
      });
      const text = tables.map((r) => r.join(" | ")).join("\n");
      return { text: cleanText(text) || "[Empty ODS]", tables };
    }

    // ODT — extract paragraphs
    const paras = contentXml.match(/<text:p[^>]*>([\s\S]*?)<\/text:p>/g) || [];
    const text = paras.map((p) => p.replace(/<[^>]+>/g, "").trim()).join("\n");
    return { text: cleanText(text) || "[Empty ODT]" };
  } catch (err) {
    return { text: `[ODF parse error: ${err instanceof Error ? err.message : "unknown"}]` };
  }
}

// ─── ZIP archive listing ───────────────────────────────────────────────────────
async function parseZip(buffer: Buffer): Promise<ProcessedContent> {
  try {
    const { default: JSZip } = await import("jszip");
    const zip = await JSZip.loadAsync(buffer);
    const files = Object.keys(zip.files).filter((f) => !zip.files[f].dir);
    const text = `ZIP Archive Contents (${files.length} files):\n\n` + files.map((f, i) => `${i + 1}. ${f}`).join("\n");
    return { text, metadata: { fileCount: files.length } };
  } catch {
    return { text: "[ZIP archive — could not read contents]" };
  }
}

// ─── Main processor ───────────────────────────────────────────────────────────
export async function processFile(input: string | Buffer, format: string, filename?: string): Promise<ProcessedContent> {
  let buffer: Buffer;
  let ext: string;
  
  // Handle both file path (string) and buffer input
  if (typeof input === 'string') {
    // Legacy: file path
    if (!existsSync(input)) throw new Error(`File not found: ${input}`);
    buffer = readFileSync(input);
    ext = path.extname(input).toLowerCase();
  } else {
    // New: buffer input
    buffer = input;
    ext = filename ? path.extname(filename).toLowerCase() : '';
  }
  
  if (!buffer || buffer.length === 0) throw new Error("File is empty");

  // ── PDF ──────────────────────────────────────────────────────────────────────
  if (format === "PDF" || ext === ".pdf") {
    try {
      const data = await pdfParse(buffer, { max: 0 });
      const text = cleanText(data.text || "");
      return {
        text: text || "[No text extracted — may be a scanned PDF, try OCR]",
        metadata: { ...data.info, numpages: data.numpages },
        pageCount: data.numpages,
        wordCount: text.split(/\s+/).filter(Boolean).length,
      };
    } catch {
      // Attempt recovery on corrupted PDF: find text streams
      const raw = buffer.toString("binary");
      const streams = raw.match(/BT([\s\S]*?)ET/g) || [];
      const text = streams
        .flatMap((s) => s.match(/\(([^)]+)\)/g) || [])
        .map((t) => t.slice(1, -1))
        .join(" ");
      return { text: cleanText(text) || "[PDF corrupted — could not recover text]", metadata: { corrupted: true } };
    }
  }

  // ── DOCX ─────────────────────────────────────────────────────────────────────
  if (format === "DOCX" || ext === ".docx") {
    try {
      const [raw, html] = await Promise.all([
        mammoth.extractRawText({ buffer }),
        mammoth.convertToHtml({ buffer }, {
          styleMap: [
            "p[style-name='Heading 1'] => h1:fresh",
            "p[style-name='Heading 2'] => h2:fresh",
            "p[style-name='Heading 3'] => h3:fresh",
            "b => strong",
            "i => em",
          ],
        }),
      ]);
      const text = cleanText(raw.value || "");
      return {
        text: text || "[No text in DOCX]",
        html: html.value,
        wordCount: text.split(/\s+/).filter(Boolean).length,
      };
    } catch {
      return { text: "[DOCX corrupted — could not extract content]" };
    }
  }

  // ── DOC (OLE Word 97-2003) ────────────────────────────────────────────────────
  if (format === "DOC" || format === "OLE_Compound" || ext === ".doc") {
    try {
      const [raw, html] = await Promise.all([
        mammoth.extractRawText({ buffer }),
        mammoth.convertToHtml({ buffer }),
      ]);
      const text = cleanText(raw.value || "");
      return { text: text || "[No text in DOC]", html: html.value };
    } catch {
      // Corrupt DOC fallback: extract ASCII text runs
      const raw = buffer.toString("latin1");
      const runs = raw.match(/[\x20-\x7E\n\r\t]{8,}/g) || [];
      return { text: cleanText(runs.join("\n")) || "[DOC corrupted]", metadata: { corrupted: true } };
    }
  }

  // ── XLSX ─────────────────────────────────────────────────────────────────────
  if (format === "XLSX" || ext === ".xlsx") {
    try {
      const wb = XLSX.read(buffer, { type: "buffer", cellDates: true, cellNF: true });
      let text = "";
      const tables: unknown[][] = [];
      for (const name of wb.SheetNames) {
        const ws = wb.Sheets[name];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" }) as unknown[][];
        tables.push(...data);
        text += `\n=== ${name} ===\n${XLSX.utils.sheet_to_csv(ws)}`;
      }
      return { text: cleanText(text) || "[Empty XLSX]", tables, metadata: { sheets: wb.SheetNames } };
    } catch {
      return { text: "[XLSX corrupted — could not extract data]" };
    }
  }

  // ── XLS (OLE Excel 97-2003) ───────────────────────────────────────────────────
  if (format === "XLS" || ext === ".xls") {
    try {
      const wb = XLSX.read(buffer, { type: "buffer", cellDates: true });
      let text = "";
      const tables: unknown[][] = [];
      for (const name of wb.SheetNames) {
        const ws = wb.Sheets[name];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" }) as unknown[][];
        tables.push(...data);
        text += `\n=== ${name} ===\n${XLSX.utils.sheet_to_csv(ws)}`;
      }
      return { text: cleanText(text) || "[Empty XLS]", tables };
    } catch {
      return { text: "[XLS corrupted — could not extract data]" };
    }
  }

  // ── ODT / ODS ─────────────────────────────────────────────────────────────────
  if (format === "ODT" || ext === ".odt") return await parseOdf(buffer, "ODT");
  if (format === "ODS" || ext === ".ods") return await parseOdf(buffer, "ODS");

  // ── RTF ───────────────────────────────────────────────────────────────────────
  if (format === "RTF" || ext === ".rtf") {
    const { text } = decodeBuffer(buffer);
    return { text: cleanText(rtfToText(text)) || "[Empty RTF]" };
  }

  // ── EML ───────────────────────────────────────────────────────────────────────
  if (format === "EML" || ext === ".eml") {
    const { text } = decodeBuffer(buffer);
    return parseEml(text);
  }

  // ── MBOX ──────────────────────────────────────────────────────────────────────
  if (format === "MBOX" || ext === ".mbox") {
    const { text } = decodeBuffer(buffer);
    const messages = text.split(/^From /m).filter(Boolean);
    const parsed = messages.slice(0, 20).map((m, i) => `--- Message ${i + 1} ---\n${m}`).join("\n\n");
    return { text: cleanText(parsed) || "[Empty MBOX]", metadata: { messageCount: messages.length } };
  }

  // ── MSG (Outlook) ─────────────────────────────────────────────────────────────
  if (format === "MSG" || ext === ".msg") {
    // Extract readable strings from OLE MSG
    const raw = buffer.toString("utf16le");
    const runs = raw.match(/[\x20-\x7E]{6,}/g) || [];
    return { text: cleanText(runs.join("\n")) || "[MSG — limited extraction]" };
  }

  // ── CSV ───────────────────────────────────────────────────────────────────────
  if (format === "CSV" || ext === ".csv") return parseCsv(buffer);

  // ── dBASE ─────────────────────────────────────────────────────────────────────
  if (format === "dBASE" || ext === ".dbf") return parseDbf(buffer);

  // ── Lotus 1-2-3 ──────────────────────────────────────────────────────────────
  if (format === "Lotus123" || ext === ".wk1" || ext === ".wk3" || ext === ".wk4") return parseLotus(buffer);

  // ── WordPerfect ───────────────────────────────────────────────────────────────
  if (format === "WordPerfect" || ext === ".wpd") return parseWordPerfect(buffer);

  // ── Images (OCR) ─────────────────────────────────────────────────────────────
  if (["PNG", "JPEG", "TIFF", "BMP", "GIF"].includes(format) || [".png", ".jpg", ".jpeg", ".tiff", ".tif", ".bmp", ".gif"].includes(ext)) {
    try {
      if (process.env.ENABLE_OCR !== "false") {
        const { extractTextFromImage } = await import("@/ai/ocr");
        const text = await extractTextFromImage(buffer);
        return { text: cleanText(text) || "[No text found in image]", metadata: { type: "image", format } };
      }
    } catch (ocrErr) {
      console.error("OCR failed:", ocrErr);
    }
    return { text: "[Image file — OCR unavailable]", metadata: { type: "image", format } };
  }

  // ── ZIP archive listing ───────────────────────────────────────────────────────
  if (format === "ZIP" || format === "ZIP_Based" || ext === ".zip") return await parseZip(buffer);

  // ── GZIP ──────────────────────────────────────────────────────────────────────
  if (format === "GZIP" || ext === ".gz") {
    const { gunzipSync } = await import("zlib");
    try {
      const decompressed = gunzipSync(buffer);
      return { text: cleanText(decodeBuffer(decompressed).text) || "[Empty GZIP]", metadata: { originalSize: decompressed.length } };
    } catch {
      return { text: "[GZIP corrupted — could not decompress]" };
    }
  }

  // ── HTML ──────────────────────────────────────────────────────────────────────
  if (format === "HTML" || ext === ".html" || ext === ".htm") {
    const { text } = decodeBuffer(buffer);
    return { text: cleanText(htmlToText(text)), html: text };
  }

  // ── Markdown / plain text fallback ───────────────────────────────────────────
  const { text, encoding } = decodeBuffer(buffer);
  const cleaned = cleanText(text);
  if (!cleaned || cleaned.trim().length === 0) throw new Error("No readable content found in file");
  return { text: cleaned, encoding, wordCount: cleaned.split(/\s+/).filter(Boolean).length };
}
