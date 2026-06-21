"use client";

import { useDropzone } from "react-dropzone";
import { Upload, Loader2 } from "lucide-react";
import { useUpload } from "@/hooks/useUpload";
import { useConversionStore } from "@/stores/conversion.store";

export function DropZone() {
  const { upload } = useUpload();
  const uploading = useConversionStore((s) => s.uploading);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files) => files[0] && upload(files[0]),
    multiple: false,
    maxSize: 26214400,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition ${
        isDragActive
          ? "border-[#00D4FF] bg-[#00D4FF]/10"
          : "border-[#00D4FF]/30 hover:border-[#00D4FF] hover:bg-[#00D4FF]/5"
      }`}
    >
      <input {...getInputProps()} />
      {uploading ? (
        <div className="flex flex-col items-center">
          <Loader2 className="w-16 h-16 text-[#00D4FF] animate-spin mb-4" />
          <p className="text-[#E0EFFF] text-lg font-semibold">Uploading and analyzing...</p>
        </div>
      ) : (
        <>
          <Upload className="w-16 h-16 text-[#00D4FF] mx-auto mb-6" />
          <p className="text-2xl font-semibold text-[#E0EFFF] mb-2">
            Drop your file here, or click to browse
          </p>
          <p className="text-[#7096B8] mb-4">
            Supports: .wpd .doc .xls .pdf .rtf .dbf .eml .msg and 50+ more
          </p>
          <p className="text-[#3A5570] text-sm">
            Free users: up to 25MB • Pro: up to 500MB
          </p>
        </>
      )}
    </div>
  );
}
