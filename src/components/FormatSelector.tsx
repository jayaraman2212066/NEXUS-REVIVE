"use client";

import { Loader2, Lock, Zap } from "lucide-react";
import { useConversionStore } from "@/stores/conversion.store";
import { useConvert } from "@/hooks/useConvert";

const FORMATS = [
  { value: "txt",  label: "Plain Text",      ext: ".txt",  free: true,  desc: "Universal, always readable" },
  { value: "html", label: "HTML",            ext: ".html", free: true,  desc: "Styled web document" },
  { value: "md",   label: "Markdown",        ext: ".md",   free: true,  desc: "Developer-friendly format" },
  { value: "docx", label: "Microsoft Word",  ext: ".docx", free: false, desc: "Full formatting preserved" },
  { value: "pdf",  label: "PDF",             ext: ".pdf",  free: false, desc: "Print-ready, universal" },
  { value: "xlsx", label: "Microsoft Excel", ext: ".xlsx", free: false, desc: "Tables, formulas intact" },
];

export function FormatSelector() {
  const { targetFormat, setTargetFormat, processing, setPaywall } = useConversionStore();
  const { convert } = useConvert();

  const selected = FORMATS.find((f) => f.value === targetFormat) ?? FORMATS[0];

  const handleConvert = () => {
    if (!selected.free) {
      // Pro formats: still call convert, server will gate with 402
    }
    convert();
  };

  return (
    <div className="mt-6">
      <label className="block text-sm font-medium text-[#7096B8] mb-3">Choose Output Format</label>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {FORMATS.map((f) => (
          <button
            key={f.value}
            onClick={() => setTargetFormat(f.value)}
            className={`relative p-3 rounded-lg border text-left transition ${
              targetFormat === f.value
                ? "border-[#00D4FF] bg-[#00D4FF]/10"
                : "border-[#00D4FF]/20 hover:border-[#00D4FF]/40 bg-[#040B14]/40"
            }`}
          >
            {!f.free && (
              <span className="absolute top-1.5 right-1.5 flex items-center gap-0.5 text-[9px] font-bold text-[#00D4FF] bg-[#00D4FF]/10 px-1 py-0.5 rounded">
                <Lock className="w-2 h-2" />PRO
              </span>
            )}
            <div className="text-[#E0EFFF] font-medium text-sm">{f.label}</div>
            <div className="text-[#7096B8] text-xs mt-0.5">{f.ext}</div>
            {f.free && <div className="text-[#00FF88] text-[10px] mt-1">Free</div>}
          </button>
        ))}
      </div>

      <div className="mb-4 p-3 bg-[#040B14]/60 rounded-lg border border-[#00D4FF]/10 text-xs text-[#7096B8]">
        {selected.desc}
        {!selected.free && (
          <span className="ml-1 text-[#00D4FF]">— Pro required for download</span>
        )}
      </div>

      <button
        onClick={handleConvert}
        disabled={processing}
        className="w-full px-6 py-3.5 bg-[#00D4FF] text-[#040B14] font-bold rounded-lg hover:shadow-[0_0_20px_rgba(0,212,255,0.4)] transition disabled:opacity-50 flex items-center justify-center gap-2 text-base"
      >
        {processing ? (
          <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
        ) : (
          <><Zap className="w-5 h-5" /> Revive & Preview</>
        )}
      </button>
    </div>
  );
}
