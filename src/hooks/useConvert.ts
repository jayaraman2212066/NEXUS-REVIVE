import { useCallback } from "react";
import { useConversionStore } from "@/stores/conversion.store";

export function useConvert() {
  const { jobData, targetFormat, setProcessing, setPreview, setError, setPaywall } = useConversionStore();

  const convert = useCallback(async () => {
    if (!jobData?.jobId) {
      console.error("❌ No jobId available");
      return;
    }
    
    console.log("🔄 Starting conversion:", jobData.jobId, "to", targetFormat);
    setProcessing(true);
    setError("");
    setPreview("");

    try {
      const proFormats = ["docx", "pdf", "xlsx"];
      if (proFormats.includes(targetFormat)) {
        console.log("⚠️ Pro format requested:", targetFormat);
      }

      console.log("📤 Sending request to /api/convert...");
      const res = await fetch("/api/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: jobData.jobId, targetFormat }),
      });
      
      console.log("📥 Convert response status:", res.status);
      const data = await res.json();
      console.log("📊 Convert response data:", data);

      if (res.status === 402) {
        console.log("💳 Paywall triggered: pro_required");
        setPaywall(data.error === "pro_required" ? "pro_required" : "download_limit", data.message);
        return;
      }
      if (res.status === 429) {
        console.log("⏱️ Rate limit triggered");
        setPaywall("daily_limit", data.message);
        return;
      }
      if (!res.ok) {
        console.error("❌ Conversion failed:", data.error);
        throw new Error(data.error || "Conversion failed");
      }

      console.log("🔍 Fetching preview...");
      const previewRes = await fetch(`/api/preview/${jobData.jobId}`);
      const previewData = await previewRes.json();
      console.log("📊 Preview data:", previewData);

      if (previewRes.status === 402) {
        console.log("💳 Preview limit reached");
        setPaywall("preview_limit", previewData.message);
        return;
      }

      console.log("✅ Conversion successful");
      setPreview(
        previewData.previewText || "File converted successfully. Click download to get your file.",
        previewData.previewHtml || "",
        previewData.previewsRemaining ?? null,
      );
    } catch (err: unknown) {
      console.error("💥 Conversion error:", err);
      setError(err instanceof Error ? err.message : "Conversion failed");
    } finally {
      setProcessing(false);
    }
  }, [jobData, targetFormat, setProcessing, setPreview, setError, setPaywall]);

  return { convert };
}
