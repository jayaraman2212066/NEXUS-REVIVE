import { useCallback } from "react";
import { useConversionStore } from "@/stores/conversion.store";

export function useConvert() {
  const { jobData, targetFormat, setProcessing, setPreview, setError, setPaywall } = useConversionStore();

  const convert = useCallback(async () => {
    if (!jobData?.jobId) return;
    setProcessing(true);
    setError("");
    setPreview("");

    try {
      // Check pro format gate before even calling convert
      const proFormats = ["docx", "pdf", "xlsx"];
      if (proFormats.includes(targetFormat)) {
        // Still attempt — server will gate it properly
      }

      const res = await fetch("/api/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: jobData.jobId, targetFormat }),
      });
      const data = await res.json();

      if (res.status === 402) {
        setPaywall(data.error === "pro_required" ? "pro_required" : "download_limit", data.message);
        return;
      }
      if (res.status === 429) {
        setPaywall("daily_limit", data.message);
        return;
      }
      if (!res.ok) throw new Error(data.error || "Conversion failed");

      // Fetch preview
      const previewRes = await fetch(`/api/preview/${jobData.jobId}`);
      const previewData = await previewRes.json();

      if (previewRes.status === 402) {
        setPaywall("preview_limit", previewData.message);
        return;
      }

      setPreview(
        previewData.previewText || "File converted successfully. Click download to get your file.",
        previewData.previewHtml || "",
        previewData.previewsRemaining ?? null,
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Conversion failed");
    } finally {
      setProcessing(false);
    }
  }, [jobData, targetFormat, setProcessing, setPreview, setError, setPaywall]);

  return { convert };
}
