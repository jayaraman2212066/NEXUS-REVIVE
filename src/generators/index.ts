import { ProcessedContent } from "../processors";
import { generateDocx } from "./docx.generator";
import { generatePdf } from "./pdf.generator";
import { generateXlsx } from "./xlsx.generator";
import { TargetFormat } from "@/types/conversion.types";

const LOGO_URL = "https://nexusrevive.com/n_logo_print.png";
const BRAND_CSS = `
  *, *::before, *::after { box-sizing: border-box; }
  body { font-family: 'Georgia', serif; max-width: 860px; margin: 0 auto; padding: 48px 32px; line-height: 1.8; color: #1a1a1a; background: #fafafa; }
  .nr-header { display: flex; align-items: center; gap: 12px; border-bottom: 3px solid #00D4FF; padding-bottom: 16px; margin-bottom: 32px; }
  .nr-logo { width: 36px; height: 36px; border-radius: 6px; flex-shrink: 0; }
  .nr-title { font-size: 1.8rem; font-weight: 700; color: #0A1628; font-family: Arial, sans-serif; }
  .nr-meta { font-size: 0.8rem; color: #666; margin-top: 4px; }
  .nr-footer { margin-top: 48px; padding-top: 16px; border-top: 1px solid #eee; font-size: 0.78rem; color: #aaa; text-align: center; display: flex; align-items: center; justify-content: center; gap: 8px; }
  .nr-footer img { width: 18px; height: 18px; border-radius: 3px; opacity: 0.6; }
  h1,h2,h3,h4,h5,h6 { color: #0A1628; margin: 1.5em 0 0.5em; font-family: Arial, sans-serif; }
  p { margin-bottom: 1em; }
  ul,ol { padding-left: 1.5em; margin-bottom: 1em; }
  li { margin-bottom: 0.3em; }
  table { border-collapse: collapse; width: 100%; margin: 1.5em 0; }
  th { background: #e8f4fd; padding: 10px 14px; text-align: left; border-bottom: 2px solid #00D4FF; font-family: Arial, sans-serif; }
  td { padding: 8px 14px; border-bottom: 1px solid #eee; }
  tr:nth-child(even) td { background: #f7fafc; }
  blockquote { border-left: 4px solid #00D4FF; padding: 8px 16px; color: #555; margin: 1em 0; background: #f0faff; }
  pre, code { font-family: 'Courier New', monospace; background: #f4f4f4; padding: 2px 6px; border-radius: 3px; font-size: 0.9em; }
  pre { padding: 16px; overflow-x: auto; }
  img { max-width: 100%; height: auto; }
`;

function htmlHeader(title: string): string {
  return `
  <div class="nr-header">
    <img src="${LOGO_URL}" alt="Nexus Revive" class="nr-logo" onerror="this.style.display='none'" />
    <div>
      <div class="nr-title">${escapeHtml(title)}</div>
      <div class="nr-meta">Recovered by Nexus Revive &bull; nexusrevive.com &bull; ${new Date().toLocaleDateString()}</div>
    </div>
  </div>`;
}

function htmlFooter(): string {
  return `
  <div class="nr-footer">
    <img src="${LOGO_URL}" alt="" onerror="this.style.display='none'" />
    Processed by <strong>Nexus Revive</strong> &mdash; nexusrevive.com
  </div>`;
}

function textToHtml(content: ProcessedContent, originalName: string): string {
  const title = originalName.replace(/\.[^.]+$/, "");

  const body = content.html
    ? `<div class="nr-content">${content.html}</div>`
    : (() => {
        const lines = content.text.split("\n");
        let html = "";
        let inList = false;
        for (const line of lines) {
          const t = line.trim();
          if (!t) { if (inList) { html += "</ul>\n"; inList = false; } html += "\n"; continue; }
          const hm = t.match(/^(#{1,6})\s+(.+)/);
          if (hm) {
            if (inList) { html += "</ul>\n"; inList = false; }
            html += `<h${hm[1].length}>${escapeHtml(hm[2])}</h${hm[1].length}>\n`;
          } else if (t.startsWith("- ") || t.startsWith("• ")) {
            if (!inList) { html += "<ul>\n"; inList = true; }
            html += `<li>${escapeHtml(t.slice(2))}</li>\n`;
          } else if (t.startsWith("    ") || t.startsWith("\t")) {
            if (inList) { html += "</ul>\n"; inList = false; }
            html += `<pre><code>${escapeHtml(t.trim())}</code></pre>\n`;
          } else {
            if (inList) { html += "</ul>\n"; inList = false; }
            html += `<p>${escapeHtml(t)}</p>\n`;
          }
        }
        if (inList) html += "</ul>\n";
        return html;
      })();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(originalName)}</title>
  <style>${BRAND_CSS}</style>
</head>
<body>
  ${htmlHeader(title)}
  ${body}
  ${htmlFooter()}
</body>
</html>`;
}

function textToMarkdown(content: ProcessedContent, originalName: string): string {
  const title = originalName.replace(/\.[^.]+$/, "");
  const lines = content.text.split("\n").map((l) => {
    const t = l.trim();
    if (t.match(/^[A-Z][A-Z\s]{4,}$/) && t.length < 80) return `## ${t}`;
    return l;
  });
  return `# ${title}\n\n*Recovered by Nexus Revive — nexusrevive.com — ${new Date().toLocaleDateString()}*\n\n---\n\n${lines.join("\n")}`;
}

function textToTxt(content: ProcessedContent, originalName: string): string {
  const title = originalName.replace(/\.[^.]+$/, "");
  const border = "=".repeat(60);
  return `${border}\nRECOVERED BY NEXUS REVIVE — nexusrevive.com\n${title}\n${new Date().toLocaleDateString()}\n${border}\n\n${content.text}\n\n${border}\nnexusrevive.com — Resurrect Any File. From Any Era.\n${border}\n`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function generateOutput(
  content: ProcessedContent,
  targetFormat: TargetFormat,
  originalName: string
): Promise<Buffer> {
  if (!content?.text) throw new Error("Invalid content for output generation");

  switch (targetFormat) {
    case "docx": return generateDocx(content, originalName);
    case "pdf":  return generatePdf(content, originalName);
    case "xlsx": return generateXlsx(content, originalName);
    case "html": return Buffer.from(textToHtml(content, originalName), "utf-8");
    case "md":   return Buffer.from(textToMarkdown(content, originalName), "utf-8");
    case "txt":
    default:     return Buffer.from(textToTxt(content, originalName), "utf-8");
  }
}

export function getFileExtension(targetFormat: TargetFormat): string {
  const map: Record<TargetFormat, string> = { docx: "docx", pdf: "pdf", xlsx: "xlsx", html: "html", md: "md", txt: "txt" };
  return map[targetFormat];
}

export function getMimeType(targetFormat: TargetFormat): string {
  const map: Record<TargetFormat, string> = {
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    pdf:  "application/pdf",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    html: "text/html",
    md:   "text/markdown",
    txt:  "text/plain",
  };
  return map[targetFormat];
}
