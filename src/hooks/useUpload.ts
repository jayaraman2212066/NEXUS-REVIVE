import { useCallback } from "react";
import { useConversionStore } from "@/stores/conversion.store";

export function useUpload() {
  const { setFile, setJobData, setUploading, setError } = useConversionStore();

  const upload = useCallback(async (file: File) => {
    console.log("🔄 Starting upload:", file.name, file.size);
    setFile(file);
    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      console.log("📤 Sending request to /api/upload...");
      const res = await fetch("/api/upload", { 
        method: "POST", 
        body: formData,
      });
      
      console.log("📥 Response status:", res.status);
      const data = await res.json();
      console.log("📊 Response data:", data);

      if (!res.ok) {
        console.error("❌ Upload failed:", data.error);
        throw new Error(data.error || "Upload failed");
      }

      console.log("✅ Upload successful");
      setJobData(data);
    } catch (err: any) {
      console.error("💥 Upload error:", err);
      setError(err.message || "Failed to upload file");
    } finally {
      setUploading(false);
    }
  }, [setFile, setJobData, setUploading, setError]);

  return { upload };
}
