"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { DropZone } from "@/components/DropZone";
import { FileCard } from "@/components/FileCard";
import { FormatSelector } from "@/components/FormatSelector";
import { PreviewPanel } from "@/components/PreviewPanel";
import { PaywallModal } from "@/components/PaywallModal";
import { useConversionStore } from "@/stores/conversion.store";

export default function ConvertPage() {
  const { jobData, previewText, error, reset } = useConversionStore();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#040B14] to-[#0A1628]">
      <PaywallModal />

      <nav className="fixed top-0 w-full z-40 backdrop-blur-lg bg-[#040B14]/80 border-b border-[#00D4FF]/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-[#00D4FF]">NEXUS REVIVE</Link>
          <div className="flex items-center gap-6">
            <Link href="/pricing" className="text-sm text-[#7096B8] hover:text-[#00D4FF] transition">Pricing</Link>
            <Link href="/" className="text-[#E0EFFF] hover:text-[#00D4FF] transition text-sm">← Home</Link>
          </div>
        </div>
      </nav>

      <div className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-[#E0EFFF] mb-3 text-center">Resurrect Your File</h1>
          <p className="text-[#7096B8] mb-2 text-center">
            Corrupted • Ancient formats • Broken encodings • Scanned images
          </p>
          <p className="text-xs text-[#3A5570] text-center mb-10">
            Free: 3 previews · 3 downloads · 10 conversions/day · 25MB max
          </p>

          {!jobData ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <DropZone />
            </motion.div>
          ) : (
            <div className="space-y-4">
              <motion.div
                className="bg-[#0A1628]/60 backdrop-blur border border-[#00D4FF]/20 rounded-xl p-6"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <FileCard />

                {error && (
                  <div className="mt-4 p-4 bg-[#FF3366]/10 border border-[#FF3366]/30 rounded-lg text-[#FF3366] text-sm">
                    ⚠ {error}
                  </div>
                )}

                {!previewText && <FormatSelector />}
                {previewText && <PreviewPanel />}
              </motion.div>

              <button
                onClick={reset}
                className="w-full px-6 py-3 border border-[#00D4FF]/20 text-[#7096B8] font-medium rounded-lg hover:bg-[#00D4FF]/5 hover:text-[#00D4FF] transition text-sm"
              >
                ↩ Upload Another File
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
