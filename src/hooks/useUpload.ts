import { useCallback } from "react";
import { useConversionStore } from "@/stores/conversion.store";

export function useUpload() {
  const { setFile, setJobData, setUploading, setError } = useConversionStore();

  const upload = useCallback(async (file: File) => {
    setFile(file);
    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Upload failed");

      setJobData(data);
    } catch (err: any) {
      setError(err.message || "Failed to upload file");
    } finally {
      setUploading(false);
    }
  }, [setFile, setJobData, setUploading, setError]);

  return { upload };
}
