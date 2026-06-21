"use client";

import { useState } from "react";
import { Check, Copy, Download, AlertTriangle } from "lucide-react";
import { useConversionStore } from "@/stores/conversion.store";
import { ReviewModal } from "@/components/ReviewModal";

const FREE_DOWNLOAD_LIMIT = 3;

export function PreviewPanel() {
  const {
    jobData, previewText, previewHtml, targetFormat, file,
    previewsRemaining, setPaywall,
  } = useConversionStore();

  const [tab, setTab] = useState<"text" | "html">("text");
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [showReview, setShowReview] = useState(false);

  const handleDownload = async () => {
    if (!jobData?.jobId || downloading) return;
    setDownloading(true);

    try {
      const res = await fetch(`/api/download/${jobData.jobId}`);
      const contentType = res.headers.get("content-type") || "";

      if (res.status === 402) {
        const data = await res.json();
        setPaywall(
          data.error === "pro_required" ? "pro_required" : "download_limit",
          data.message
        );
        return;
      }

      if (!res.ok) { alert("Download failed."); return; }

      if (!contentType.includes("application/json")) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${file?.name?.replace(/\.[^.]+$/, "") ?? "recovered"}_recovered.${targetFormat}`;
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
        document.body.removeChild(a);

        // Trigger review modal after successful download
        setTimeout(() => setShowReview(true), 800);
      }
    } finally {
      setDownloading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(previewText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isFree = ["txt", "html", "md"].includes(targetFormat);
  const wordCount = previewText.split(/\s+/).filter(Boolean).length;

  return (
    <>
      <ReviewModal
        open={showReview}
        onClose={() => setShowReview(false)}
        fileFormat={jobData?.format}
      />

      <div className="mt-6 pt-6 border-t border-[#00D4FF]/20">

        {/* Preview limit warning */}
        {previewsRemaining !== null && previewsRemaining <= 1 && (
          <div className="mb-4 flex items-start gap-2 p-3 bg-[#FFD700]/10 border border-[#FFD700]/30 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-[#FFD700] flex-shrink-0 mt-0.5" />
            <p className="text-[#FFD700] text-xs">
              {previewsRemaining === 0
                ? "This was your last free preview. Upgrade to Pro for unlimited."
                : `${previewsRemaining} free preview remaining.`}
            </p>
          </div>
        )}

        {/* Stats + tabs */}
        <div className="flex flex-wrap items-center gap-3 mb-3 text-xs text-[#7096B8]">
          <span>~{wordCount.toLocaleString()} words</span>
          <span>{previewText.length.toLocaleString()} chars</span>
          <span className="ml-auto flex gap-2">
            {previewHtml && (
              <>
                <button onClick={() => setTab("text")} className={`px-2 py-0.5 rounded transition ${tab === "text" ? "bg-[#00D4FF]/20 text-[#00D4FF]" : "hover:text-[#E0EFFF]"}`}>Text</button>
                <button onClick={() => setTab("html")} className={`px-2 py-0.5 rounded transition ${tab === "html" ? "bg-[#00D4FF]/20 text-[#00D4FF]" : "hover:text-[#E0EFFF]"}`}>Rich HTML</button>
              </>
            )}
          </span>
        </div>

        <h4 className="text-sm font-bold text-[#E0EFFF] mb-2">Preview</h4>

        <div className="bg-[#040B14] border border-[#00D4FF]/10 rounded-lg overflow-hidden">
          {tab === "html" && previewHtml ? (
            <iframe srcDoc={previewHtml} className="w-full h-72 bg-white" sandbox="allow-same-origin" title="HTML Preview" />
          ) : (
            <pre className="p-4 font-mono text-xs text-[#C8DCF0] whitespace-pre-wrap max-h-72 overflow-y-auto leading-relaxed">
              {previewText || "No preview available"}
            </pre>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-[#7096B8]">
          <span>{isFree ? `Free format — uses 1 of ${FREE_DOWNLOAD_LIMIT} free downloads` : "Pro format — requires subscription"}</span>
        </div>

        <div className="mt-3 flex gap-3">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex-1 px-5 py-3 bg-[#00D4FF] text-[#040B14] font-bold rounded-lg hover:shadow-[0_0_20px_rgba(0,212,255,0.4)] transition flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <Download className="w-4 h-4" />
            {downloading ? "Preparing..." : `Download .${targetFormat}`}
            <span className="text-xs font-normal opacity-75">{isFree ? "(Free)" : "(Pro)"}</span>
          </button>
          <button
            onClick={handleCopy}
            className="px-5 py-3 border border-[#00D4FF] text-[#00D4FF] font-bold rounded-lg hover:bg-[#00D4FF]/10 transition flex items-center gap-2"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>
    </>
  );
}
