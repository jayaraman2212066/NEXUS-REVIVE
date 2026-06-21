import { FormatSignature, DetectedFormat } from "@/types/formats.types";
import path from "path";

export const SIGNATURES: FormatSignature[] = [
  // WordPerfect
  { bytes: [0xFF, 0x57, 0x50, 0x43], format: "WordPerfect", version: "5.1+", mime: "application/wordperfect", category: "document" },
  { bytes: [0xFF, 0x57, 0x50, 0x36], format: "WordPerfect", version: "6.x", mime: "application/wordperfect", category: "document" },
  // OLE Compound (Word 97-2003, Excel 97-2003, MSG)
  { bytes: [0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1], format: "OLE_Compound", version: "MS Office 97-2003", mime: "application/msword", category: "document" },
  // ZIP-based (DOCX, XLSX, PPTX, ODT, ODS)
  { bytes: [0x50, 0x4B, 0x03, 0x04], format: "ZIP_Based", version: "OOXML/ODF", mime: "application/zip", category: "archive" },
  { bytes: [0x50, 0x4B, 0x05, 0x06], format: "ZIP_Based", version: "empty", mime: "application/zip", category: "archive" },
  // PDF
  { bytes: [0x25, 0x50, 0x44, 0x46], format: "PDF", version: "any", mime: "application/pdf", category: "document" },
  // RTF
  { bytes: [0x7B, 0x5C, 0x72, 0x74, 0x66], format: "RTF", version: "any", mime: "application/rtf", category: "document" },
  // dBASE
  { bytes: [0x03], format: "dBASE", version: "III", mime: "application/dbase", category: "database" },
  { bytes: [0x04], format: "dBASE", version: "IV", mime: "application/dbase", category: "database" },
  { bytes: [0x83], format: "dBASE", version: "III+memo", mime: "application/dbase", category: "database" },
  // Lotus 1-2-3
  { bytes: [0x00, 0x00, 0x02, 0x00], format: "Lotus123", version: "WK1", mime: "application/lotus-123", category: "spreadsheet" },
  { bytes: [0x00, 0x00, 0x1A, 0x00, 0x02, 0x10], format: "Lotus123", version: "WK3", mime: "application/lotus-123", category: "spreadsheet" },
  { bytes: [0x00, 0x00, 0x1A, 0x00, 0x05, 0x10], format: "Lotus123", version: "WK4", mime: "application/lotus-123", category: "spreadsheet" },
  // Images
  { bytes: [0x49, 0x49, 0x2A, 0x00], format: "TIFF", version: "little-endian", mime: "image/tiff", category: "image" },
  { bytes: [0x4D, 0x4D, 0x00, 0x2A], format: "TIFF", version: "big-endian", mime: "image/tiff", category: "image" },
  { bytes: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A], format: "PNG", version: "any", mime: "image/png", category: "image" },
  { bytes: [0xFF, 0xD8, 0xFF], format: "JPEG", version: "any", mime: "image/jpeg", category: "image" },
  { bytes: [0x42, 0x4D], format: "BMP", version: "any", mime: "image/bmp", category: "image" },
  { bytes: [0x47, 0x49, 0x46, 0x38, 0x37, 0x61], format: "GIF", version: "87a", mime: "image/gif", category: "image" },
  { bytes: [0x47, 0x49, 0x46, 0x38, 0x39, 0x61], format: "GIF", version: "89a", mime: "image/gif", category: "image" },
  // Archives
  { bytes: [0x1F, 0x8B], format: "GZIP", version: "any", mime: "application/gzip", category: "archive" },
  { bytes: [0x75, 0x73, 0x74, 0x61, 0x72], format: "TAR", version: "any", mime: "application/x-tar", category: "archive", offset: 257 },
  // EML (starts with common email headers)
  // Handled by extension fallback
];

// Sub-detect ZIP-based formats by inspecting internal filenames
function detectZipSubFormat(buffer: Buffer, filename: string): DetectedFormat {
  const ext = path.extname(filename).toLowerCase().replace(".", "");
  const content = buffer.toString("binary", 0, Math.min(buffer.length, 4096));

  if (content.includes("word/document.xml") || ext === "docx") {
    return { format: "DOCX", version: "OOXML", mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", category: "document", confidence: 0.98, extension: "docx" };
  }
  if (content.includes("xl/workbook.xml") || ext === "xlsx") {
    return { format: "XLSX", version: "OOXML", mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", category: "spreadsheet", confidence: 0.98, extension: "xlsx" };
  }
  if (content.includes("ppt/presentation.xml") || ext === "pptx") {
    return { format: "PPTX", version: "OOXML", mime: "application/vnd.openxmlformats-officedocument.presentationml.presentation", category: "document", confidence: 0.98, extension: "pptx" };
  }
  if (content.includes("content.xml") && content.includes("mimetype")) {
    if (ext === "ods") return { format: "ODS", version: "ODF", mime: "application/vnd.oasis.opendocument.spreadsheet", category: "spreadsheet", confidence: 0.97, extension: "ods" };
    return { format: "ODT", version: "ODF", mime: "application/vnd.oasis.opendocument.text", category: "document", confidence: 0.97, extension: "odt" };
  }
  if (ext === "zip") {
    return { format: "ZIP", version: "any", mime: "application/zip", category: "archive", confidence: 0.9, extension: "zip" };
  }
  return { format: "ZIP_Based", version: "unknown", mime: "application/zip", category: "archive", confidence: 0.7, extension: ext || "zip" };
}

// Detect OLE sub-type by extension
function detectOleSubFormat(filename: string): DetectedFormat {
  const ext = path.extname(filename).toLowerCase();
  if (ext === ".xls") return { format: "XLS", version: "BIFF8", mime: "application/vnd.ms-excel", category: "spreadsheet", confidence: 0.95, extension: "xls" };
  if (ext === ".msg") return { format: "MSG", version: "OLE", mime: "application/vnd.ms-outlook", category: "email", confidence: 0.95, extension: "msg" };
  if (ext === ".ppt") return { format: "PPT", version: "OLE", mime: "application/vnd.ms-powerpoint", category: "document", confidence: 0.95, extension: "ppt" };
  return { format: "DOC", version: "Word97-2003", mime: "application/msword", category: "document", confidence: 0.95, extension: "doc" };
}

// Extension-based fallback for plain text formats
function detectByExtension(filename: string, buffer: Buffer): DetectedFormat {
  const ext = path.extname(filename).toLowerCase().replace(".", "");
  const text = buffer.slice(0, 512).toString("utf8");

  if (ext === "csv" || (ext === "txt" && text.includes(","))) {
    return { format: "CSV", version: "any", mime: "text/csv", category: "spreadsheet", confidence: 0.85, extension: "csv" };
  }
  if (ext === "eml" || text.startsWith("From:") || text.startsWith("Return-Path:") || text.includes("MIME-Version:")) {
    return { format: "EML", version: "RFC822", mime: "message/rfc822", category: "email", confidence: 0.9, extension: "eml" };
  }
  if (ext === "mbox") {
    return { format: "MBOX", version: "any", mime: "application/mbox", category: "email", confidence: 0.9, extension: "mbox" };
  }
  if (ext === "md" || ext === "markdown") {
    return { format: "Markdown", version: "any", mime: "text/markdown", category: "text", confidence: 0.9, extension: "md" };
  }
  if (ext === "html" || ext === "htm") {
    return { format: "HTML", version: "any", mime: "text/html", category: "text", confidence: 0.9, extension: "html" };
  }
  if (ext === "json") {
    return { format: "JSON", version: "any", mime: "application/json", category: "text", confidence: 0.9, extension: "json" };
  }
  if (ext === "xml") {
    return { format: "XML", version: "any", mime: "application/xml", category: "text", confidence: 0.9, extension: "xml" };
  }
  if (ext === "txt" || ext === "text") {
    return { format: "PlainText", version: "any", mime: "text/plain", category: "text", confidence: 0.8, extension: "txt" };
  }
  return { format: "Unknown", version: "unknown", mime: "application/octet-stream", category: "text", confidence: 0.1, extension: ext || "bin" };
}

export function detectFormat(buffer: Buffer, filename = ""): DetectedFormat {
  const header = buffer.slice(0, 512);

  for (const sig of SIGNATURES) {
    const offset = sig.offset || 0;
    if (offset + sig.bytes.length > header.length) continue;
    const matches = sig.bytes.every((byte, idx) => header[offset + idx] === byte);

    if (matches) {
      if (sig.format === "ZIP_Based") return detectZipSubFormat(buffer, filename);
      if (sig.format === "OLE_Compound") return detectOleSubFormat(filename);
      return {
        format: sig.format,
        version: sig.version,
        mime: sig.mime,
        category: sig.category,
        confidence: 0.95,
        extension: getExtensionFromFormat(sig.format),
      };
    }
  }

  // Fallback: extension + content sniffing
  if (filename) return detectByExtension(filename, buffer);

  return { format: "Unknown", version: "unknown", mime: "application/octet-stream", category: "text", confidence: 0.1, extension: "bin" };
}

export function calculateHealthScore(buffer: Buffer, detected: DetectedFormat): { score: number; corruptionType: string; repairability: string } {
  const size = buffer.length;
  let score = 100;
  let corruptionType = "none";

  if (size < 64) { score = 20; corruptionType = "truncated"; }
  else {
    // Check for null-byte density (corruption indicator)
    let nullBytes = 0;
    const sampleSize = Math.min(size, 8192);
    for (let i = 0; i < sampleSize; i++) { if (buffer[i] === 0x00) nullBytes++; }
    const nullRatio = nullBytes / sampleSize;

    // For binary formats, some nulls are expected
    const isBinary = ["document", "spreadsheet", "image", "archive"].includes(detected.category);
    const threshold = isBinary ? 0.6 : 0.05;
    if (nullRatio > threshold) { score -= 30; corruptionType = "stream_corruption"; }

    // Check for truncation: file size vs expected minimum
    if (detected.format === "PDF" && size < 1024) { score -= 25; corruptionType = "truncated"; }
    if (["DOCX", "XLSX", "DOC", "XLS"].includes(detected.format) && size < 512) { score -= 25; corruptionType = "truncated"; }

    // Header integrity
    if (detected.confidence < 0.5) { score -= 20; corruptionType = score < 50 ? "stream_corruption" : "header_damage"; }
  }

  score = Math.max(10, Math.min(100, score));
  const repairability = score >= 80 ? "excellent" : score >= 60 ? "good" : score >= 40 ? "partial" : "unlikely";

  return { score, corruptionType, repairability };
}

function getExtensionFromFormat(format: string): string {
  const map: Record<string, string> = {
    WordPerfect: "wpd", OLE_Compound: "doc", ZIP_Based: "zip",
    PDF: "pdf", RTF: "rtf", dBASE: "dbf", Lotus123: "wk1",
    TIFF: "tiff", PNG: "png", JPEG: "jpg", BMP: "bmp",
    GIF: "gif", GZIP: "gz", TAR: "tar",
  };
  return map[format] || "bin";
}
